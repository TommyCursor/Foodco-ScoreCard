export const config = { runtime: 'edge' };

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const SHEETS_API   = 'https://sheets.googleapis.com/v4/spreadsheets';

// ── Base64url helpers ───────────────────────────────────────────────────────
function b64url(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function b64urlBuf(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function pemToBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g,'').replace(/[\r\n\s]/g,'');
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// ── Google Service Account JWT → access token ───────────────────────────────
async function getGoogleToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss:   email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  };
  const hdr     = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const pld     = b64url(JSON.stringify(claim));
  const toSign  = `${hdr}.${pld}`;
  const key     = await crypto.subtle.importKey(
    'pkcs8', pemToBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(toSign));
  const jwt = `${toSign}.${b64urlBuf(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const d = await res.json();
  if (!d.access_token) throw new Error(d.error_description || 'Failed to get Google access token');
  return d.access_token;
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // ── Verify HSO auth ──────────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey     = process.env.SUPABASE_ANON_KEY;
  const authHeader  = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const token     = authHeader.slice(7);
  const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': anonKey },
  });
  const caller = await verifyRes.json();
  if (!verifyRes.ok || caller?.user_metadata?.role !== 'hso') {
    return new Response('Forbidden', { status: 403 });
  }

  // ── Service account credentials ──────────────────────────────────────────
  const saEmail   = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey    = process.env.GOOGLE_PRIVATE_KEY || '';
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const sheetId   = process.env.FOODCO_REPORT_SPREADSHEET_ID
                    || '1_heL25xitdJMIGd5yXUwsJbAf4FbFNxOYqHkwZEc7AE';

  if (!saEmail || !privateKey.includes('BEGIN')) {
    return new Response(JSON.stringify({
      error: 'Google service account not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to Vercel environment variables, then redeploy.',
    }), { status: 500, headers: JSON_HEADERS });
  }

  try {
    const accessToken = await getGoogleToken(saEmail, privateKey);

    const ranges = [
      'BUSINESS YTD!B3:C10',
      'REVENUE OVERVIEW!B3:H19',
      'REVENUE & GROWTH!B2:H11',
      'OUTLETS PERFORMANCE!A2:F35',
      'AREA & REGION!A2:F8',
      'AREA & REGION!A10:F65',
      'TOP REVENUE STORES!A2:O22',
      'CATEGORY SALES!B1:H14',
      'CATEGORY SALES!B17:F32',
      'WEEKLY SALES!B3:G19',
      'YOY!A1:I25',
      'UTILITY & POWER COST!A2:J14',
    ];

    const params    = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const sheetsRes = await fetch(`${SHEETS_API}/${sheetId}/values:batchGet?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!sheetsRes.ok) {
      const e = await sheetsRes.json().catch(() => ({}));
      throw new Error(e.error?.message || `Sheets API error ${sheetsRes.status}`);
    }

    const sh = await sheetsRes.json();
    const vr = sh.valueRanges || [];

    return new Response(JSON.stringify({
      businessYTD:         vr[0]?.values  || [],
      revenueOverview:     vr[1]?.values  || [],
      revenueGrowth:       vr[2]?.values  || [],
      outletsPerf:         vr[3]?.values  || [],
      regionPerf:          vr[4]?.values  || [],
      areaPerf:            vr[5]?.values  || [],
      topStores:           vr[6]?.values  || [],
      categorySalesYTD:    vr[7]?.values  || [],
      categorySalesLatest: vr[8]?.values  || [],
      weeklySales:         vr[9]?.values  || [],
      yoy:                 vr[10]?.values || [],
      utility:             vr[11]?.values || [],
    }), { status: 200, headers: JSON_HEADERS });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Report generation failed' }), {
      status: 500, headers: JSON_HEADERS,
    });
  }
}
