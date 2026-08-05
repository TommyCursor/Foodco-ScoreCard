export const config = { runtime: 'edge' };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function sha256hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normaliseAnswer(ans) {
  return ans.trim().toLowerCase().replace(/\s+/g, ' ');
}

function generateCode() {
  // 6-char uppercase alphanumeric, no ambiguous chars (0/O, 1/I/L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabaseUrl    = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey        = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: JSON_HEADERS });
  }

  const body = await req.json();
  const { action } = body;

  // ── verify_and_set_password — unauthenticated (coach locked out) ───────────
  if (action === 'verify_and_set_password') {
    const { email, resetCode, newPassword } = body;

    if (!email || !resetCode || !newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400, headers: JSON_HEADERS });
    }

    // Find user by email (list all, filter — fine for small internal app)
    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
    });
    const listData = await listRes.json();
    const user = listData.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return new Response(JSON.stringify({ error: 'No account found for that email.' }), { status: 404, headers: JSON_HEADERS });
    }
    if (!user.user_metadata?.reset_token) {
      return new Response(JSON.stringify({ error: 'No password reset is pending for this account.' }), { status: 400, headers: JSON_HEADERS });
    }
    if (user.user_metadata.reset_token !== resetCode.toUpperCase()) {
      return new Response(JSON.stringify({ error: 'Incorrect reset code. Please check with your HSO.' }), { status: 400, headers: JSON_HEADERS });
    }

    // Code matches — update password and clear the token
    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: newPassword,
        user_metadata: { reset_token: null, must_change_password: false },
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      return new Response(JSON.stringify({ error: updateData.message || 'Failed to update password.' }), { status: 500, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  }

  // ── get_security_questions — unauthenticated ──────────────────────────────
  if (action === 'get_security_questions') {
    const { email } = body;
    if (!email) return new Response(JSON.stringify({ error: 'Email required.' }), { status: 400, headers: JSON_HEADERS });

    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
    });
    const listData = await listRes.json();
    const user = listData.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) return new Response(JSON.stringify({ error: 'No account found for that email.' }), { status: 404, headers: JSON_HEADERS });
    if (user.user_metadata?.role !== 'hso') return new Response(JSON.stringify({ error: 'Not an HSO account.' }), { status: 403, headers: JSON_HEADERS });

    const { sq1, sq2 } = user.user_metadata || {};
    if (!sq1 || !sq2) return new Response(JSON.stringify({ error: 'No security questions set for this account. Contact your system administrator.' }), { status: 400, headers: JSON_HEADERS });

    return new Response(JSON.stringify({ sq1, sq2 }), { status: 200, headers: JSON_HEADERS });
  }

  // ── verify_and_reset_hso_password — unauthenticated ───────────────────────
  if (action === 'verify_and_reset_hso_password') {
    const { email, a1, a2, newPassword } = body;
    if (!email || !a1 || !a2 || !newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'All fields are required and password must be at least 6 characters.' }), { status: 400, headers: JSON_HEADERS });
    }

    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
    });
    const listData = await listRes.json();
    const user = listData.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) return new Response(JSON.stringify({ error: 'No account found for that email.' }), { status: 404, headers: JSON_HEADERS });
    if (user.user_metadata?.role !== 'hso') return new Response(JSON.stringify({ error: 'Not an HSO account.' }), { status: 403, headers: JSON_HEADERS });

    const meta = user.user_metadata || {};
    if (!meta.sq1_hash || !meta.sq2_hash) {
      return new Response(JSON.stringify({ error: 'No security questions set for this account.' }), { status: 400, headers: JSON_HEADERS });
    }

    const [h1, h2] = await Promise.all([sha256hex(normaliseAnswer(a1)), sha256hex(normaliseAnswer(a2))]);
    if (h1 !== meta.sq1_hash || h2 !== meta.sq2_hash) {
      return new Response(JSON.stringify({ error: 'One or more answers are incorrect. Please try again.' }), { status: 400, headers: JSON_HEADERS });
    }

    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) return new Response(JSON.stringify({ error: updateData.message || 'Failed to update password.' }), { status: 500, headers: JSON_HEADERS });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  }

  // ── All other actions require HSO authentication ───────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const token = authHeader.slice(7);
  const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': anonKey },
  });
  const caller = await verifyRes.json();
  if (!verifyRes.ok || caller?.user_metadata?.role !== 'hso') {
    return new Response('Forbidden', { status: 403 });
  }

  const { email, password, userId, name, coachId } = body;

  if (action === 'create_user') {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password, email_confirm: true,
        user_metadata: { role: 'coach', name, coachId, must_change_password: true },
      }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status, headers: JSON_HEADERS });
  }

  if (action === 'delete_user') {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
    });
    return new Response(JSON.stringify({ success: res.ok }), { status: res.status, headers: JSON_HEADERS });
  }

  if (action === 'update_coach_metadata') {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_metadata: { coachId } }),
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data.message || 'Failed to update metadata.' }), { status: 500, headers: JSON_HEADERS });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  }

  if (action === 'trigger_password_reset') {
    const code = generateCode();
    const randomPassword = crypto.randomUUID(); // invalidate current password

    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: randomPassword,
        user_metadata: { reset_token: code, must_change_password: true },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Failed to reset.' }), { status: res.status, headers: JSON_HEADERS });
    }
    return new Response(JSON.stringify({ success: true, code }), { status: 200, headers: JSON_HEADERS });
  }

  // ── setup_security_questions ────────────────────────────────────────────────
  if (action === 'setup_security_questions') {
    const { q1, a1, q2, a2 } = body;
    if (!q1 || !a1 || !q2 || !a2) {
      return new Response(JSON.stringify({ error: 'All questions and answers are required.' }), { status: 400, headers: JSON_HEADERS });
    }
    const [h1, h2] = await Promise.all([sha256hex(normaliseAnswer(a1)), sha256hex(normaliseAnswer(a2))]);
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${caller.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_metadata: { sq1: q1, sq1_hash: h1, sq2: q2, sq2_hash: h2 } }),
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({ error: data.message || 'Failed to save.' }), { status: 500, headers: JSON_HEADERS });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: JSON_HEADERS });
}
