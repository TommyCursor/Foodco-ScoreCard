export const config = { runtime: 'edge' };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

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

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: JSON_HEADERS });
}
