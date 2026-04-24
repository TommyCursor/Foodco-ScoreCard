// ── Google Sheets Integration ─────────────────────────────────────────────
// Uses Google Identity Services (GIS) for OAuth 2.0 token flow.
// Requires a Google Cloud Project with:
//   1. Google Sheets API enabled
//   2. OAuth 2.0 Client ID (Web application type)
//   3. Authorized JS origins: http://localhost (or your hosted URL)
//
// Column layout expected in the spreadsheet (row 1 = headers):
//   A: Coach Name  B: Period (YYYY-MM)  C: Actual Sales  D: Target Sales
//   E: Available SKUs  F: Total Required SKUs  G: Current Year Sales
//   H: Previous Year Sales  I: Audit Score(%)  J: GHP Score(%)
//   K: Actual Staff  L: Planned Staff  M: Profit vs Target(%)
//   N: Actual Expense  O: Expense Budget  P: % Promoters  Q: % Detractors

window.SheetsIntegration = (() => {
  const SHEETS_API  = 'https://sheets.googleapis.com/v4/spreadsheets';
  const SCOPE       = 'https://www.googleapis.com/auth/spreadsheets.readonly';
  const GIS_SCRIPT  = 'https://accounts.google.com/gsi/client';

  let tokenClient  = null;
  let _accessToken = null;
  let _resolveAuth = null;

  // Column index → field id mapping (0-based, column A = 0)
  const COL_MAP = {
    2:  'actualSales',
    3:  'targetSales',
    4:  'availSKU',
    5:  'totalSKU',
    6:  'currYearSales',
    7:  'prevYearSales',
    8:  'auditScore',
    9:  'ghpScore',
    10: 'actualStaff',
    11: 'plannedStaff',
    12: 'profitVsTarget',
    13: 'actualExpense',
    14: 'expenseBudget',
    15: 'promoters',
    16: 'detractors',
  };

  function loadGisScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) { resolve(); return; }
      const s = document.createElement('script');
      s.src = GIS_SCRIPT;
      s.onload  = resolve;
      s.onerror = () => reject(new Error('Failed to load Google Identity Services. Check your internet connection.'));
      document.head.appendChild(s);
    });
  }

  function extractSpreadsheetId(urlOrId) {
    const m = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : urlOrId.trim();
  }

  async function init(clientId) {
    await loadGisScript();
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: response => {
        if (response.error) {
          if (_resolveAuth) _resolveAuth(null);
          return;
        }
        _accessToken = response.access_token;
        if (_resolveAuth) _resolveAuth(_accessToken);
      }
    });
  }

  async function signIn() {
    if (!tokenClient) throw new Error('Call init(clientId) first.');
    return new Promise(resolve => {
      _resolveAuth = resolve;
      tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  function signOut() {
    if (_accessToken) {
      google.accounts.oauth2.revoke(_accessToken, () => {});
    }
    _accessToken = null;
    tokenClient  = null;
  }

  async function fetchRange(spreadsheetId, range) {
    const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${_accessToken}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status} from Sheets API`);
    }
    return (await res.json()).values || [];
  }

  // Main import function
  // Returns a fieldData object matching ALL_FIELD_IDS, or null if no matching row.
  async function importFromSpreadsheet(urlOrId, coachName, period) {
    if (!_accessToken) throw new Error('Not signed in to Google.');

    const spreadsheetId = extractSpreadsheetId(urlOrId);
    if (!spreadsheetId) throw new Error('Invalid spreadsheet URL or ID.');

    // Fetch all data (up to 1000 rows, columns A–Q)
    const rows = await fetchRange(spreadsheetId, 'A1:Q1000');
    if (rows.length < 2) return null;

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Normalise for comparison
    const normName   = coachName.trim().toLowerCase();
    const normPeriod = period.trim(); // YYYY-MM

    // Find the matching row by Coach Name (col A) and Period (col B)
    const match = dataRows.find(row => {
      const rowName   = (row[0] || '').trim().toLowerCase();
      const rowPeriod = normalizePeriod(row[1] || '');
      return rowName === normName && rowPeriod === normPeriod;
    });

    if (!match) return null;

    const fieldData = {};
    Object.entries(COL_MAP).forEach(([colIdx, fieldId]) => {
      const val = parseFloat(match[colIdx]);
      fieldData[fieldId] = isNaN(val) ? 0 : val;
    });

    return fieldData;
  }

  // Accept both 'YYYY-MM' and 'Month YYYY' (e.g. 'March 2026') formats
  function normalizePeriod(raw) {
    const s = raw.trim();
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    // Try parsing 'Month YYYY'
    const d = new Date(s);
    if (!isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    return s;
  }

  return {
    get accessToken() { return _accessToken; },
    init,
    signIn,
    signOut,
    importFromSpreadsheet,
  };
})();
