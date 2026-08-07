// ── Status colour palette (single source of truth) ────────────────────────
const SC = {
  great : { text: '#166534', bar: '#16a34a' },
  good  : { text: '#15803d', bar: '#22c55e' },
  fair  : { text: '#92400e', bar: '#f59e0b' },
  low   : { text: '#c2410c', bar: '#f97316' },
  poor  : { text: '#991b1b', bar: '#ef4444' },
};
function statusColor(ratio) {
  if (ratio >= .95) return SC.great;
  if (ratio >= .80) return SC.good;
  if (ratio >= .65) return SC.fair;
  if (ratio >= .50) return SC.low;
  return SC.poor;
}

// ── KPI Configuration ─────────────────────────────────────────────────────

const KPI_CONFIG = [
  {
    id: 'sales', pillar: 'Commercial Performance',
    label: '1. Sales Performance vs Target', pts: 25,
    formula: 'Actual Sales ÷ Target Sales × 100',
    dataSource: 'Monthly financial dashboard',
    fields: [
      { id: 'actualSales', label: 'Actual Sales (R)',  placeholder: '0.00' },
      { id: 'targetSales', label: 'Target Sales (R)',  placeholder: '0.00', min: 1 }
    ],
    compute: d => d.actualSales / d.targetSales * 100,
    score:   p => p >= 100 ? 25 : p >= 95 ? 23 : p >= 90 ? 20 : p >= 85 ? 10 : 5,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '100% +',  score: 25 },
      { label: '95–99%',  score: 23 },
      { label: '90–94%',  score: 20 },
      { label: '85–89%',  score: 10 },
      { label: '< 85%',   score:  5 }
    ],
    validate: d => {
      if (d.targetSales > 0 && d.actualSales / d.targetSales > 1.5) return 'Actual exceeds 150% of target — verify values.';
      if (d.actualSales === 0) return 'Actual sales is zero — is this correct?';
      return null;
    }
  },
  {
    id: 'stock', pillar: 'Stock Discipline',
    label: '2. Stock Availability', pts: 25,
    formula: 'Pre-calculated availability %',
    dataSource: 'Supermarket & 3F Operations inventory',
    fields: [
      { id: 'stockPct', label: 'Stock Availability (%)', placeholder: '0.0', step: '0.1', min: 0, max: 100 }
    ],
    compute: d => d.stockPct,
    score:   p => p >= 91 ? 25 : p >= 86 ? 20 : p >= 81 ? 15 : p >= 76 ? 10 : 5,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥ 91%',   score: 25 },
      { label: '86–90%',  score: 20 },
      { label: '81–85%',  score: 15 },
      { label: '76–80%',  score: 10 },
      { label: '< 76%',   score:  5 }
    ],
    validate: d => {
      if (d.stockPct < 0 || d.stockPct > 100) return 'Availability % must be between 0 and 100.';
      return null;
    }
  },
  {
    id: 'yoy', pillar: 'Growth Performance',
    label: '3. Year-on-Year Growth', pts: 10,
    formula: '(Current Year Sales – Previous Year Sales) ÷ Previous Year Sales × 100',
    fields: [
      { id: 'currYearSales', label: 'Current Year Sales (R)',  placeholder: '0.00' },
      { id: 'prevYearSales', label: 'Previous Year Sales (R)', placeholder: '0.00', min: 1 }
    ],
    compute: d => (d.currYearSales - d.prevYearSales) / d.prevYearSales * 100,
    score:   p => p >= 15 ? 10 : p >= 10 ? 8 : p >= 5 ? 6 : p >= 0 ? 4 : 0,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '15% +',            score: 10 },
      { label: '10–14%',           score:  8 },
      { label: '5–9%',             score:  6 },
      { label: '0–4%',             score:  4 },
      { label: 'Negative (< 0%)',  score:  0 }
    ],
    validate: d => {
      if (d.prevYearSales > 0 && Math.abs((d.currYearSales - d.prevYearSales) / d.prevYearSales) > 0.6)
        return 'Year-on-year change exceeds 60% — verify both values.';
      return null;
    }
  },
  {
    id: 'audit', pillar: 'Operational Excellence',
    label: '4. Branch Performance Audit', pts: 10,
    formula: 'Overall audit score percentage',
    fields: [{ id: 'auditScore', label: 'Audit Score (%)', placeholder: '0–100', max: 100 }],
    compute: d => d.auditScore,
    score:   p => p >= 95 ? 10 : p >= 89 ? 8 : p >= 85 ? 6 : p >= 80 ? 4 : 2,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '95% +',   score: 10 },
      { label: '89–94%',  score:  8 },
      { label: '85–88%',  score:  6 },
      { label: '80–84%',  score:  4 },
      { label: '≤ 79%',   score:  2 }
    ],
    validate: d => {
      if (d.auditScore > 100) return 'Score cannot exceed 100%.';
      return null;
    }
  },
  {
    id: 'ghp', pillar: 'Operational Standards',
    label: '5. GHP Rating (Good Hygiene Practices)', pts: 5,
    formula: 'Food safety compliance score in 3F',
    fields: [{ id: 'ghpScore', label: 'GHP Score (%)', placeholder: '0–100', max: 100 }],
    compute: d => d.ghpScore,
    score:   p => p >= 95 ? 5 : p >= 90 ? 4 : p >= 85 ? 3 : p >= 80 ? 2 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥ 95%',  score: 5 },
      { label: '90–94%', score: 4 },
      { label: '85–89%', score: 3 },
      { label: '80–84%', score: 2 },
      { label: '< 80%',  score: 1 }
    ],
    validate: d => {
      if (d.ghpScore > 100) return 'Score cannot exceed 100%.';
      return null;
    }
  },
  {
    id: 'manning', pillar: 'Workforce Productivity',
    label: '6. Manning Efficiency', pts: 5,
    formula: 'Actual Staff ÷ Planned Staff × 100',
    fields: [
      { id: 'actualStaff',  label: 'Actual Staff',  placeholder: '0', step: '1' },
      { id: 'plannedStaff', label: 'Planned Staff', placeholder: '0', step: '1', min: 1 }
    ],
    compute: d => d.actualStaff / d.plannedStaff * 100,
    score:   p => p > 101 ? 1 : p >= 95 ? 5 : p >= 90 ? 4 : p >= 85 ? 3 : p >= 80 ? 2 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '95–100%',         score: 5 },
      { label: '90–94%',          score: 4 },
      { label: '85–89%',          score: 3 },
      { label: '80–84%',          score: 2 },
      { label: '< 80% or > 101%', score: 1 }
    ],
    validate: d => {
      if (d.plannedStaff > 0 && d.actualStaff / d.plannedStaff > 1.4)
        return 'Actual staff is 40%+ above planned — verify headcount.';
      return null;
    }
  },
  {
    id: 'profit', pillar: 'Financial Health',
    label: '7. Profitability', pts: 7.5,
    formula: 'Profit vs Target %',
    includes: ['Gross Margin', 'Shrinkage'],
    fields: [{ id: 'profitVsTarget', label: 'Profit vs Target (%)', placeholder: '0–120' }],
    compute: d => d.profitVsTarget,
    score:   p => p >= 100 ? 7.5 : p >= 95 ? 6 : p >= 90 ? 4 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '100% +', score: 7.5 },
      { label: '95–99%', score: 6   },
      { label: '90–94%', score: 4   },
      { label: '< 90%',  score: 1   }
    ],
    validate: d => {
      if (d.profitVsTarget > 160) return 'Profit vs target exceeds 160% — verify the value.';
      return null;
    }
  },
  {
    id: 'expense', pillar: 'Financial Discipline',
    label: '8. Expense Control', pts: 5,
    formula: 'Actual Expense ÷ Budget (lower is better)',
    includes: ['Diesel', 'Utilities', 'Repairs'],
    fields: [
      { id: 'actualExpense', label: 'Actual Expense (R)', placeholder: '0.00' },
      { id: 'expenseBudget', label: 'Expense Budget (R)', placeholder: '0.00', min: 1 }
    ],
    compute: d => d.actualExpense / d.expenseBudget * 100,
    score:   r => r <= 95 ? 5 : r <= 100 ? 4 : r <= 105 ? 3 : r <= 110 ? 2 : 1,
    display: v => `${v.toFixed(1)}% of budget`,
    bands: [
      { label: '≤ 95%',    score: 5 },
      { label: '96–100%',  score: 4 },
      { label: '101–105%', score: 3 },
      { label: '106–110%', score: 2 },
      { label: '> 110%',   score: 1 }
    ],
    validate: d => {
      if (d.expenseBudget > 0 && d.actualExpense / d.expenseBudget > 2)
        return 'Actual expense is more than 2× budget — double check.';
      return null;
    }
  },
  {
    id: 'nps', pillar: 'Customer Experience',
    label: '9. Net Promoter Score (NPS)', pts: 7.5,
    formula: 'Pre-calculated NPS %',
    fields: [
      { id: 'npsPct', label: 'NPS Achieved (%)', placeholder: '0', step: '0.1' }
    ],
    compute: d => d.npsPct,
    score:   n => n >= 45 ? 7.5 : n >= 40 ? 6 : n >= 30 ? 4 : n >= 20 ? 3 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥ 45%',   score: 7.5 },
      { label: '40–44%',  score: 6   },
      { label: '30–39%',  score: 4   },
      { label: '20–29%',  score: 3   },
      { label: '< 20%',   score: 1   }
    ],
    validate: d => {
      if (d.npsPct < 0 || d.npsPct > 100) return 'NPS % must be between 0 and 100.';
      return null;
    }
  }
];

const ALL_FIELD_IDS = KPI_CONFIG.flatMap(k => k.fields.map(f => f.id));

// ── Supabase ───────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://ifrefyugccczydjjfrzm.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcmVmeXVnY2NjenlkampmcnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzc1MjAsImV4cCI6MjA5MzcxMzUyMH0.O9trwo_xBDT0LgKSjKAj80Qe3oZ__EcYEePMA6qxIJs';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Storage — in-memory cache backed by Supabase ───────────────────────────

let _cache = { coaches: [], scorecards: [], googleClientId: '' };

function loadStore() { return _cache; }
function saveStore() { /* mutations go through dedicated db* functions */ }

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

async function loadAppState() {
  const [c, s, st] = await Promise.all([
    sb.from('coaches').select('*'),
    sb.from('scorecards').select('*'),
    sb.from('settings').select('*'),
  ]);
  _cache.coaches = (c.data || []).map(r => ({
    id: r.id, name: r.name, branches: r.branches || '',
    salesTarget: r.sales_target || null, userId: r.user_id,
  }));
  _cache.scorecards = (s.data || []).map(r => ({
    id: r.id, coachId: r.coach_id, period: r.period,
    total: r.total, rating: r.rating, rows: r.rows || [],
    fieldData: r.field_data || {}, coachNote: r.coach_note || '',
    hsoNotes: r.hso_notes || '', generatedAt: r.generated_at,
  }));
  _cache.googleClientId = (st.data || []).find(x => x.key === 'google_client_id')?.value || '';
}

// ── DB helpers ─────────────────────────────────────────────────────────────

async function getAccessToken() {
  const { data } = await sb.auth.getSession();
  return data.session?.access_token;
}

async function dbAdminCall(body) {
  const token = await getAccessToken();
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function dbAddCoach(name, branches, email, password) {
  const result = await dbAdminCall({ action: 'create_user', email, password, name });
  if (result.error) throw new Error(result.error.message || 'Failed to create user account.');

  const userId = result.id;
  const { data, error } = await sb.from('coaches').insert({ user_id: userId, name, branches }).select().single();
  if (error) throw error;

  // update user metadata with coachId
  await dbAdminCall({ action: 'update_coach_metadata', userId, coachId: data.id });

  const coach = { id: data.id, name: data.name, branches: data.branches || '', salesTarget: null, userId };
  _cache.coaches.push(coach);
  return coach;
}

async function dbDeleteCoach(coachId) {
  const coach = _cache.coaches.find(c => c.id === coachId);
  if (!coach) return;
  if (coach.userId) await dbAdminCall({ action: 'delete_user', userId: coach.userId });
  await sb.from('coaches').delete().eq('id', coachId);
  _cache.coaches    = _cache.coaches.filter(c => c.id !== coachId);
  _cache.scorecards = _cache.scorecards.filter(s => s.coachId !== coachId);
}

async function dbUpdateCoachTarget(coachId, target) {
  const { error } = await sb.from('coaches').update({ sales_target: target || null }).eq('id', coachId);
  if (!error) {
    const c = _cache.coaches.find(x => x.id === coachId);
    if (c) c.salesTarget = target || null;
  }
}

async function dbSaveScorecard(sc) {
  const payload = {
    coach_id: sc.coachId, period: sc.period, total: sc.total,
    rating: sc.rating, rows: sc.rows, field_data: sc.fieldData,
    coach_note: sc.coachNote || '', generated_at: sc.generatedAt || new Date().toISOString(),
  };
  if (sc.id) payload.id = sc.id;

  const { data, error } = await sb.from('scorecards')
    .upsert(payload, { onConflict: 'coach_id,period' })
    .select().single();
  if (error) throw error;

  const mapped = {
    id: data.id, coachId: data.coach_id, period: data.period,
    total: data.total, rating: data.rating, rows: data.rows || [],
    fieldData: data.field_data || {}, coachNote: data.coach_note || '',
    hsoNotes: data.hso_notes || '', generatedAt: data.generated_at,
  };
  const idx = _cache.scorecards.findIndex(x => x.id === mapped.id || (x.coachId === mapped.coachId && x.period === mapped.period));
  if (idx >= 0) _cache.scorecards[idx] = mapped; else _cache.scorecards.push(mapped);
  return mapped;
}

async function dbSaveCoachingNotes(scorecardId, notes) {
  const { error } = await sb.from('scorecards').update({ hso_notes: notes }).eq('id', scorecardId);
  if (!error) {
    const sc = _cache.scorecards.find(x => x.id === scorecardId);
    if (sc) sc.hsoNotes = notes;
  }
}

async function dbSaveSetting(key, value) {
  await sb.from('settings').upsert({ key, value }, { onConflict: 'key' });
  if (key === 'google_client_id') _cache.googleClientId = value;
}

// ── State ──────────────────────────────────────────────────────────────────

let currentCoach = null;
let isHSOMode = false;
let isDevMode = false;
let hasShownGreeting = false;
let resultsBackDest = 'coachHomeView';
let currentResultScorecard = null;
let currentCoachScorecards = [];
let currentScorecardIndex  = 0;

// ── Navigation ─────────────────────────────────────────────────────────────

let navStack = [];

function navigate(viewId) {
  navStack.push(document.querySelector('.view:not(.hidden)')?.id || 'landingView');
  showView(viewId);
}

function goBack() {
  const prev = navStack.pop() || 'landingView';
  showView(prev);
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('view-active');
  });
  const el = document.getElementById(viewId);
  el.classList.remove('hidden');
  void el.offsetWidth; // reflow — restarts CSS animation on every navigation
  el.classList.add('view-active');
  window.scrollTo(0, 0);
}

// ── Dev Mode ───────────────────────────────────────────────────────────────

function showDevToolbar() {
  const toolbar = document.getElementById('devToolbar');
  if (!toolbar) return;
  toolbar.classList.remove('hidden');
  populateDevCoachDropdown();
}

function hideDevToolbar() {
  document.getElementById('devToolbar')?.classList.add('hidden');
}

function populateDevCoachDropdown() {
  const sel = document.getElementById('devCoachSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">— HSO Admin —</option>';
  (_cache.coaches || []).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name + (c.branches ? ` (${c.branches})` : '');
    sel.appendChild(opt);
  });
}

function devSwitchView() {
  const sel = document.getElementById('devCoachSelect');
  const coachId = sel?.value;
  if (!coachId) {
    // Switch to HSO admin view
    currentCoach = null;
    isHSOMode = true;
    renderAdminCoachList();
    showView('adminView');
    return;
  }
  const coach = (_cache.coaches || []).find(c => c.id === coachId);
  if (!coach) return;
  currentCoach = coach;
  isHSOMode = false;
  aiHistory = [];
  hasShownGreeting = false;
  renderCoachHome();
  showView('coachHomeView');
  document.getElementById('headerActions').innerHTML =
    `<span class="header-role-badge" style="background:#fef3c7;color:#92400e;">🛠 Dev · ${esc(coach.name)}</span>`;
}

// ── Rating ─────────────────────────────────────────────────────────────────

function getRating(total) {
  if (total >= 90) return { label: 'Outstanding',       meaning: 'Promotion Ready',       color: '#1b5e20' };
  if (total >= 80) return { label: 'Strong Performer',  meaning: 'High Potential',         color: '#2e7d32' };
  if (total >= 70) return { label: 'Solid',             meaning: 'Meets Expectations',     color: '#f57f17' };
  if (total >= 60) return { label: 'Needs Improvement', meaning: 'Coaching Required',      color: '#e65100' };
  return             { label: 'Underperforming',       meaning: 'Immediate Intervention', color: '#b71c1c' };
}

function computeScorecard(fieldData) {
  const rows = KPI_CONFIG.map(kpi => {
    const derived = kpi.compute(fieldData);
    return { pillar: kpi.pillar, label: kpi.label.replace(/^\d+\.\s/, ''), weight: kpi.pts, score: kpi.score(derived), derived: kpi.display(derived) };
  });
  const total = rows.reduce((s, r) => s + r.score, 0);
  return { rows, total, rating: getRating(total) };
}

// ── Score Ring ─────────────────────────────────────────────────────────────

const RING_CIRC         = 2 * Math.PI * 66; // r=66 → 414.69
const SIDEBAR_RING_CIRC = 2 * Math.PI * 49; // r=49 → ~307.88

function getRingColor(total) {
  if (total >= 90) return '#16a34a';
  if (total >= 80) return '#22c55e';
  if (total >= 70) return '#f59e0b';
  if (total >= 60) return '#f97316';
  return '#ef4444';
}

function animateScoreRing(total) {
  const ring = document.getElementById('scoreRingFill');
  if (!ring) return;
  ring.style.stroke = getRingColor(total);
  const target = RING_CIRC * (1 - total / 100);
  const start = performance.now();
  const duration = 1400;
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    ring.style.strokeDashoffset = (RING_CIRC - (RING_CIRC - target) * eased).toFixed(2);
    if (p < 1) requestAnimationFrame(tick);
    else ring.style.strokeDashoffset = target;
  };
  requestAnimationFrame(tick);
}

// ── Sparkline ──────────────────────────────────────────────────────────────

function renderSparkline(scores) {
  if (!scores.length) return '';
  const W = 420, H = 80, pad = 12;
  const minV = Math.min(...scores), maxV = Math.max(...scores);
  const range = maxV - minV || 10;
  const xStep = scores.length < 2 ? (W - pad * 2) : (W - pad * 2) / (scores.length - 1);
  const y = v => H - pad - ((v - minV) / range) * (H - pad * 2);
  const x = i => pad + i * xStep;
  const pts = scores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lx = x(scores.length - 1), ly = y(scores[scores.length - 1]);
  const area = `M${pad},${H} L${scores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L')} L${lx},${H} Z`;
  const col = scores[scores.length - 1] >= 80 ? '#16a34a' : scores[scores.length - 1] >= 70 ? '#ca8a04' : '#dc2626';
  const gid = `sg${Date.now()}`;
  return `<svg viewBox="0 0 ${W} ${H}" class="sparkline-svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${col}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#${gid})"/>
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${scores.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="${col}" stroke="#fff" stroke-width="1.5"/>`).join('')}
    ${scores.map((v, i) => `<text x="${x(i).toFixed(1)}" y="${(y(v) - 10).toFixed(1)}" text-anchor="middle" class="spark-label">${v.toFixed(0)}</text>`).join('')}
  </svg>`;
}

function renderMiniSparkline(scores) {
  if (scores.length < 2) return '';
  const W = 72, H = 26;
  const minV = Math.min(...scores), maxV = Math.max(...scores);
  const range = maxV - minV || 10;
  const xStep = (W - 4) / (scores.length - 1);
  const y = v => H - 3 - ((v - minV) / range) * (H - 6);
  const x = i => 2 + i * xStep;
  const pts = scores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const col = scores[scores.length - 1] >= scores[0] ? '#16a34a' : '#ef4444';
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="vertical-align:middle">
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// ── Pillar Result Cards ────────────────────────────────────────────────────

function renderPillarResultCards(rows, prevRows) {
  if (!rows || !rows.length) return '';
  return rows.map((row, i) => {
    const ratio  = row.score / row.weight;
    const pct    = Math.round(ratio * 100);
    const { text: col, bar } = statusColor(ratio);
    const prev   = prevRows?.find(r => r.pillar === row.pillar);
    const diff   = prev != null ? row.score - prev.score : null;
    const deltaHtml = diff !== null
      ? `<span class="prc-delta ${diff > 0 ? 'prc-delta--up' : diff < 0 ? 'prc-delta--down' : 'prc-delta--flat'}">
           ${diff > 0 ? '▲' : diff < 0 ? '▼' : '━'} ${diff > 0 ? '+' : ''}${diff % 1 === 0 ? diff : diff.toFixed(1)}
         </span>`
      : '';
    return `
      <div class="pillar-result-card" style="--pcol:${bar};animation-delay:${(i * .065).toFixed(2)}s">
        <div class="prc-pillar">${esc(row.pillar || '—')}</div>
        <div class="prc-kpi">${esc(row.label)}</div>
        <div class="prc-score-row">
          <span class="prc-score" style="color:${col}">${row.score}</span>
          <span class="prc-max">/ ${row.weight} pts</span>
          ${deltaHtml}
        </div>
        <div class="prc-bar-track">
          <div class="prc-bar-fill" style="width:${pct}%;background:${bar}"></div>
        </div>
        <div class="prc-achieved">${esc(row.derived)}</div>
      </div>`;
  }).join('');
}

// ── Results Tabs ───────────────────────────────────────────────────────────

function switchResultsTab(tab) {
  document.querySelectorAll('.results-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.rtab === tab));
  document.getElementById('resultsTabOverview').classList.toggle('hidden', tab !== 'overview');
  document.getElementById('resultsTabReview').classList.toggle('hidden', tab !== 'review');
}

// ── Period Navigator ───────────────────────────────────────────────────────

function updatePeriodNavigator(scorecardId) {
  const store = loadStore();
  const sc = store.scorecards.find(s => s.id === scorecardId);
  if (!sc) return;
  currentCoachScorecards = store.scorecards
    .filter(s => s.coachId === sc.coachId)
    .sort((a, b) => a.period.localeCompare(b.period));
  currentScorecardIndex = currentCoachScorecards.findIndex(s => s.id === scorecardId);
  const prev = document.getElementById('periodPrev');
  const next = document.getElementById('periodNext');
  const lbl  = document.getElementById('resultsNavLabel');
  if (prev) prev.disabled = currentScorecardIndex <= 0;
  if (next) next.disabled = currentScorecardIndex >= currentCoachScorecards.length - 1;
  if (lbl)  lbl.textContent = formatPeriod(sc.period);
}

// ── Underperformance Alert ────────────────────────────────────────────────

function getUnderperformanceStreak(coachId, store) {
  const entries = store.scorecards
    .filter(s => s.coachId === coachId)
    .sort((a, b) => b.period.localeCompare(a.period));
  let streak = 0;
  for (const e of entries) {
    if (parseFloat(e.total) < 70) streak++;
    else break;
  }
  return streak;
}

// ── Leaderboard ────────────────────────────────────────────────────────────

function renderLeaderboard() {
  const store = loadStore();
  const el = document.getElementById('leaderboardContent');

  if (!store.coaches.length) {
    el.innerHTML = emptyState('👥', 'No coaches yet', 'Add your first coach above to get started.');
    return;
  }

  const rows = store.coaches.map(coach => {
    const entries = store.scorecards
      .filter(s => s.coachId === coach.id)
      .sort((a, b) => b.period.localeCompare(a.period));
    const latest  = entries[0] || null;
    const prev    = entries[1] || null;
    const delta   = latest && prev ? parseFloat(latest.total) - parseFloat(prev.total) : null;
    const lastSix = entries.slice(0, 6).reverse().map(e => parseFloat(e.total));
    return { coach, latest, delta, lastSix };
  }).sort((a, b) => {
    if (!a.latest && !b.latest) return 0;
    if (!a.latest) return 1;
    if (!b.latest) return -1;
    return parseFloat(b.latest.total) - parseFloat(a.latest.total);
  });

  const medals = ['🥇', '🥈', '🥉'];
  let rank = 0;
  el.innerHTML = `
    <div class="lb-wrap">
      <table class="lb-table">
        <thead>
          <tr>
            <th class="center" style="width:44px">Rank</th>
            <th>Coach</th>
            <th class="center">Score</th>
            <th class="center">vs Last</th>
            <th>Pillar Breakdown</th>
            <th class="center">Trend</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => {
            if (!row.latest) {
              return `<tr class="lb-row lb-row--empty">
                <td class="center">—</td>
                <td>
                  <div class="lb-name">${esc(row.coach.name)}</div>
                  <div class="lb-branches-sub">${esc(row.coach.branches || '—')}</div>
                </td>
                <td colspan="4" style="color:var(--s-400);font-size:.76rem;text-align:center">No scorecards yet</td>
              </tr>`;
            }
            rank++;
            const r      = row.latest.rating || getRating(parseFloat(row.latest.total));
            const dStr   = row.delta !== null ? (row.delta > 0 ? `+${row.delta.toFixed(1)}` : row.delta.toFixed(1)) : '—';
            const dCol   = row.delta > 0 ? SC.great.bar : row.delta < 0 ? SC.poor.bar : 'var(--s-400)';
            const streak = getUnderperformanceStreak(row.coach.id, store);
            const alertBadge = streak >= 2
              ? `<span class="lb-alert-badge" title="${streak} consecutive months below 70">⚠ ${streak}mo</span>`
              : '';
            const pillarBar = row.latest.rows
              ? row.latest.rows.map(pr => {
                  const { bar } = statusColor(pr.score / pr.weight);
                  const w = Math.round((pr.weight / 100) * 100);
                  return `<div class="lb-pillar-seg" style="width:${w}%;background:${bar}" title="${esc(pr.pillar)}: ${pr.score}/${pr.weight}"></div>`;
                }).join('')
              : '';
            return `<tr class="lb-row${streak >= 2 ? ' lb-row--alert' : ''}" onclick="adminViewCoach('${row.coach.id}')">
              <td class="center lb-rank">${medals[rank - 1] || rank}</td>
              <td>
                <div class="lb-name">${esc(row.coach.name)}${alertBadge}</div>
                <div class="lb-branches-sub">${esc(row.coach.branches || '—')}</div>
              </td>
              <td class="center">
                <span class="lb-score">${parseFloat(row.latest.total).toFixed(1)}</span>
                <span class="rating-chip" style="background:${r.color};margin-left:6px;font-size:.65rem">${r.label}</span>
              </td>
              <td class="center lb-delta" style="color:${dCol};font-weight:700">${dStr}</td>
              <td><div class="lb-pillar-bar">${pillarBar}</div></td>
              <td class="center">${row.lastSix.length > 1 ? renderMiniSparkline(row.lastSix) : '<span style="color:var(--s-400)">—</span>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function adminViewCoach(coachId) {
  const store = loadStore();
  const entries = store.scorecards
    .filter(s => s.coachId === coachId)
    .sort((a, b) => b.period.localeCompare(a.period));
  if (!entries.length) return;
  resultsBackDest = 'adminView';
  viewSavedScorecard(entries[0].id, 'adminView');
}


// ── Admin ──────────────────────────────────────────────────────────────────

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-nav-item').forEach(t => t.classList.toggle('active', t.dataset.atab === tabId));
  document.querySelectorAll('.atab-panel').forEach(p => p.classList.toggle('hidden', p.id !== tabId));
  if (tabId === 'aScores')       renderAllScorecards();
  if (tabId === 'aLeaderboard')  renderLeaderboard();
  if (tabId === 'aQuarterly')    initQuarterlyTab();
}

function renderAdminCoachList() {
  const store = loadStore();
  const el = document.getElementById('adminCoachList');
  if (store.coaches.length === 0) {
    el.innerHTML = emptyState('👥', 'No coaches yet', 'Go to Coaches to add your first area coach.');
    return;
  }
  el.innerHTML = store.coaches.map(c => {
    const count  = store.scorecards.filter(s => s.coachId === c.id).length;
    const streak = getUnderperformanceStreak(c.id, store);
    const alertHtml = streak >= 2
      ? `<span class="coach-alert-badge">⚠ ${streak} months below 70</span>`
      : '';
    const targetDisplay = c.salesTarget
      ? `R ${Number(c.salesTarget).toLocaleString('en-ZA')}`
      : 'Not set';
    return `
      <div class="coach-card${streak >= 2 ? ' coach-card--alert' : ''}">
        <div class="coach-info">
          <div class="coach-name">${esc(c.name)} ${alertHtml}</div>
          <div class="coach-meta">${esc(c.branches) || '<em>No branches</em>'} &nbsp;·&nbsp; ${count} scorecard${count !== 1 ? 's' : ''}</div>
          <div class="coach-target-row">
            <span class="coach-target-label">Monthly Sales Target:</span>
            <span class="coach-target-val" id="coach-target-display-${c.id}">${targetDisplay}</span>
            <button class="btn-link coach-target-edit-btn" onclick="toggleTargetEditor('${c.id}')">Edit</button>
          </div>
          <div class="coach-target-editor hidden" id="coach-target-editor-${c.id}">
            <input type="number" class="coach-target-input" id="coach-target-input-${c.id}"
              placeholder="e.g. 850000" value="${c.salesTarget || ''}" min="0" step="any" />
            <button class="btn-primary" style="padding:6px 14px;font-size:0.8rem"
              onclick="saveCoachTarget('${c.id}')">Save</button>
            <button class="btn-ghost" style="padding:6px 10px;font-size:0.8rem"
              onclick="toggleTargetEditor('${c.id}')">Cancel</button>
          </div>
        </div>
        <div class="coach-actions">
          <button class="btn-ghost" onclick="triggerCoachPasswordReset('${c.id}','${esc(c.name).replace(/'/g,"\\'")}')">Reset Password</button>
          <button class="btn-ghost btn-danger" onclick="confirmDeleteCoach('${c.id}','${esc(c.name).replace(/'/g,"\\'")}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

function toggleTargetEditor(coachId) {
  document.getElementById(`coach-target-editor-${coachId}`)?.classList.toggle('hidden');
}

async function triggerCoachPasswordReset(coachId, coachName) {
  const coach = _cache.coaches.find(c => c.id === coachId);
  if (!coach?.userId) { showToast('No login account linked to this coach.'); return; }
  if (!confirm(`Reset password for ${coachName}?\n\nTheir current password will be invalidated immediately and you'll receive a one-time code to share with them.`)) return;

  try {
    const result = await dbAdminCall({ action: 'trigger_password_reset', userId: coach.userId });
    if (result.error) throw new Error(result.error.message);
    showResetCodeModal(coachName, result.code);
  } catch (e) {
    showToast(e.message || 'Failed to reset password.');
  }
}

function showResetCodeModal(coachName, code) {
  const modal = document.getElementById('resetCodeModal');
  if (!modal) return;
  const nameEl = document.getElementById('resetCodeCoachName');
  const codeEl = document.getElementById('resetCodeValue');
  if (nameEl) nameEl.textContent = coachName;
  if (codeEl) codeEl.textContent = code;
  modal.classList.remove('hidden');
}

async function saveCoachTarget(coachId) {
  const val = parseFloat(document.getElementById(`coach-target-input-${coachId}`)?.value) || 0;
  try {
    await dbUpdateCoachTarget(coachId, val);
    toggleTargetEditor(coachId);
    renderAdminCoachList();
    showToast(val ? `Target set to R ${val.toLocaleString('en-ZA')}` : 'Target cleared.');
  } catch (e) {
    showToast('Failed to save target. Please try again.');
  }
}

function prefillSalesTarget() {
  if (!currentCoach?.salesTarget) return;
  const el = document.getElementById('me_targetSales');
  if (el && !el.value) {
    el.value = currentCoach.salesTarget;
    el.dispatchEvent(new Event('input'));
  }
}

async function confirmDeleteCoach(id, name) {
  if (!confirm(`Delete coach "${name}" and all their scorecards?`)) return;
  try {
    await dbDeleteCoach(id);
    renderAdminCoachList();
    showToast(`"${name}" deleted.`);
  } catch (e) {
    showToast('Failed to delete coach. Please try again.');
  }
}

function renderAllScorecards() {
  const store = loadStore();
  const el = document.getElementById('allScorecardsList');

  if (store.scorecards.length === 0) {
    el.innerHTML = emptyState('📋', 'No scorecards yet', 'Scorecards will appear here once coaches submit data.');
    return;
  }

  // Group by coach
  const byCoach = {};
  store.coaches.forEach(c => { byCoach[c.id] = { coach: c, items: [] }; });
  store.scorecards.forEach(s => {
    if (!byCoach[s.coachId]) byCoach[s.coachId] = { coach: { name: 'Unknown', branches: '' }, items: [] };
    byCoach[s.coachId].items.push(s);
  });

  el.innerHTML = Object.values(byCoach)
    .filter(g => g.items.length > 0)
    .sort((a, b) => a.coach.name.localeCompare(b.coach.name))
    .map(g => {
      const cards = g.items
        .sort((a, b) => b.period.localeCompare(a.period))
        .map(s => scorecardMiniCard(s, 'adminView'))
        .join('');
      return `
        <div class="coach-group">
          <div class="coach-group-header">${esc(g.coach.name)} <span class="coach-meta">${esc(g.coach.branches)}</span></div>
          ${cards}
        </div>`;
    }).join('');
}


// ── Coach Home ─────────────────────────────────────────────────────────────

function renderCoachHome() {
  const welcomeEl = document.getElementById('coachWelcomeName');
  if (welcomeEl) welcomeEl.textContent = currentCoach.name;
  document.getElementById('headerActions').innerHTML =
    `<span class="header-role-badge">${esc(currentCoach.name)}</span>
     <button id="pwaInstallBtn" class="btn-install hidden" title="Install app">⬇ Install App</button>`;
  showInstallButton();

  // Submission status for current month
  const now         = new Date();
  const thisPeriod  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const store0      = loadStore();
  const submitted   = store0.scorecards.some(s => s.coachId === currentCoach.id && s.period === thisPeriod);
  const statusEl    = document.getElementById('dashSubmissionStatus');
  if (statusEl) {
    statusEl.className = submitted ? 'dash-submission-status dash-submission--done' : 'dash-submission-status dash-submission--due';
    statusEl.innerHTML = submitted
      ? `<span class="dsub-icon">✅</span><span class="dsub-text">${formatPeriod(thisPeriod)} submitted</span>`
      : `<span class="dsub-icon">⚠</span><span class="dsub-text">${formatPeriod(thisPeriod)} not yet submitted</span>
         <button class="dsub-cta" id="subStatusCta">Submit Now →</button>`;
    if (!submitted) {
      document.getElementById('subStatusCta')?.addEventListener('click', () =>
        document.getElementById('goDataEntryBtn')?.click());
    }
  }

  const store = loadStore();
  const entries = store.scorecards
    .filter(s => s.coachId === currentCoach.id)
    .sort((a, b) => a.period.localeCompare(b.period)); // oldest → newest

  const count = entries.length;
  document.getElementById('dashPeriodCount').textContent = count;

  if (count === 0) {
    document.getElementById('dashLastScore').textContent  = '—';
    document.getElementById('dashLastPeriod').textContent = 'No entries yet';
    document.getElementById('dashBestScore').textContent  = '—';
    document.getElementById('dashBestPeriod').textContent = '—';
    document.getElementById('dashSparklineWrap').innerHTML = '';
    document.getElementById('dashSparkEmpty').classList.remove('hidden');
    document.getElementById('dashWatchList').innerHTML    = '<div class="dash-insight-empty">Generate your first scorecard to see insights.</div>';
    document.getElementById('dashStrengthList').innerHTML = '<div class="dash-insight-empty">No data yet.</div>';
    return;
  }

  // Last score
  const last = entries[entries.length - 1];
  const lastR = last.rating || getRating(parseFloat(last.total));
  document.getElementById('dashLastScore').textContent  = parseFloat(last.total).toFixed(1);
  document.getElementById('dashLastPeriod').textContent = formatPeriod(last.period);
  const chipEl = document.getElementById('dashLastChip');
  if (chipEl) { chipEl.textContent = lastR.label; chipEl.style.background = lastR.color; }

  // Personal best
  const best = entries.reduce((a, b) => parseFloat(a.total) >= parseFloat(b.total) ? a : b);
  document.getElementById('dashBestScore').textContent  = parseFloat(best.total).toFixed(1);
  document.getElementById('dashBestPeriod').textContent = formatPeriod(best.period);

  // Sparkline — last 6 periods
  const sparkData = entries.slice(-6);
  document.getElementById('dashSparkEmpty').classList.add('hidden');
  document.getElementById('dashSparkRange').textContent =
    sparkData.length > 1
      ? `${formatPeriod(sparkData[0].period)} – ${formatPeriod(sparkData[sparkData.length - 1].period)}`
      : formatPeriod(sparkData[0].period);
  document.getElementById('dashSparklineWrap').innerHTML =
    renderSparkline(sparkData.map(e => parseFloat(e.total)));

  // Pillar insights from most recent scorecard rows
  if (last.rows && last.rows.length) {
    const sorted = [...last.rows].sort((a, b) => (b.score / b.weight) - (a.score / a.weight));
    const strengths = sorted.slice(0, 3);
    const watches   = sorted.slice(-3).reverse();
    document.getElementById('dashStrengthList').innerHTML = strengths.map(r => `
      <div class="dash-insight-item">
        <span class="dash-insight-name">${esc(r.pillar || r.label)}</span>
        <span class="dash-insight-score" style="color:#166534">${r.score}/${r.weight} pts</span>
      </div>`).join('');
    document.getElementById('dashWatchList').innerHTML = watches.map(r => `
      <div class="dash-insight-item">
        <span class="dash-insight-name">${esc(r.pillar || r.label)}</span>
        <span class="dash-insight-score" style="color:#dc2626">${r.score}/${r.weight} pts</span>
      </div>`).join('');
  } else {
    document.getElementById('dashStrengthList').innerHTML = '<div class="dash-insight-empty">No pillar data.</div>';
    document.getElementById('dashWatchList').innerHTML    = '<div class="dash-insight-empty">No pillar data.</div>';
  }
}

// ── Data Entry ─────────────────────────────────────────────────────────────

function carryForwardFromLastPeriod() {
  const period = document.getElementById('entryPeriod').value;
  if (!period || !currentCoach) return;
  const store   = loadStore();
  const entries = store.scorecards
    .filter(s => s.coachId === currentCoach.id && s.period < period)
    .sort((a, b) => b.period.localeCompare(a.period));
  if (!entries.length) { showToast('No previous period data found.'); return; }
  const prev = entries[0];
  if (!prev.fieldData) { showToast('Previous scorecard has no raw data to carry forward.'); return; }
  prefillManualForm(prev.fieldData);
  showToast(`Pre-filled from ${formatPeriod(prev.period)}.`);
}

function renderManualEntryForm() {
  const groups = {};
  KPI_CONFIG.forEach(k => {
    if (!groups[k.pillar]) groups[k.pillar] = [];
    groups[k.pillar].push(k);
  });
  document.getElementById('manualKpiForm').innerHTML = Object.entries(groups).map(([pillar, kpis]) => `
    <div class="pillar-form-group">
      <div class="pillar-form-header">
        <span class="pillar-form-label">${esc(pillar)}</span>
      </div>
      ${kpis.map(k => renderKpiCard(k, 'me')).join('')}
    </div>`).join('') + `
    <div class="context-note-block">
      <label class="context-note-label" for="coachNoteInput">
        Context Note <span class="sidebar-optional">(optional)</span>
      </label>
      <p class="context-note-hint">Add context that may explain this month's figures — e.g. load shedding, stock delivery delays, new branch opening.</p>
      <textarea id="coachNoteInput" class="coach-note-textarea" placeholder="e.g. Load shedding affected Week 2 sales. New CBD branch opened mid-month."></textarea>
    </div>`;
  bindLivePreviews('me');
}

function prefillManualForm(fieldData) {
  ALL_FIELD_IDS.forEach(fid => {
    const el = document.getElementById(`me_${fid}`);
    if (el && fieldData[fid] !== undefined) {
      el.value = fieldData[fid];
      el.dispatchEvent(new Event('input'));
    }
  });
}

function collectManualForm() {
  const d = {};
  ALL_FIELD_IDS.forEach(fid => {
    const el = document.getElementById(`me_${fid}`);
    d[fid] = el ? (parseFloat(el.value) || 0) : 0;
  });
  return d;
}

async function handleGenerateEntry() {
  const period = document.getElementById('entryPeriod').value;
  if (!period) { showToast('Please select a period first.'); return; }

  const fieldData  = collectManualForm();
  const { rows, total, rating } = computeScorecard(fieldData);
  const coachNote = document.getElementById('coachNoteInput')?.value.trim() || '';

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const saved = await dbSaveScorecard({
      coachId: currentCoach.id, period, total, rating, rows,
      fieldData, coachNote, generatedAt: new Date().toISOString(),
    });
    showToast('Scorecard saved!');
    resultsBackDest = 'coachHomeView';
    displayResults(saved);
  } catch (e) {
    showToast('Failed to save scorecard. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate & Save →';
  }
}

// ── Narrative ──────────────────────────────────────────────────────────────

function generateNarrative(s, coach) {
  if (!s.rows || !s.rows.length) return '';
  const t       = parseFloat(s.total);
  const r       = s.rating || getRating(t);
  const sorted  = [...s.rows].sort((a, b) => (b.score / b.weight) - (a.score / a.weight));
  const top     = sorted[0];
  const bottom  = sorted[sorted.length - 1];
  const topPct  = Math.round(top.score    / top.weight    * 100);
  const botPct  = Math.round(bottom.score / bottom.weight * 100);

  const openings = {
    'Outstanding':       `${esc(coach.name)} delivered an outstanding result this period — ${t.toFixed(1)} points puts them in the elite tier.`,
    'Strong Performer':  `${esc(coach.name)} had a strong month, scoring ${t.toFixed(1)} / 100 — a result that reflects real operational discipline.`,
    'Solid':             `${esc(coach.name)} posted a solid ${t.toFixed(1)} this period, showing consistent performance with clear room to push higher.`,
    'Needs Improvement': `${esc(coach.name)} scored ${t.toFixed(1)} this period — below target and coaching focus is required.`,
    'Underperforming':   `${esc(coach.name)} scored ${t.toFixed(1)} this period. Immediate performance intervention is recommended.`
  };

  const opening  = openings[r.label] || `${esc(coach.name)} scored ${t.toFixed(1)} / 100 this period.`;
  const strength = `Top pillar: <strong>${esc(top.pillar)}</strong> at ${topPct}% of available points.`;
  const focus    = botPct < 80
    ? ` Area for focus: <strong>${esc(bottom.pillar)}</strong> achieved only ${botPct}%.`
    : '';

  return `<p>${opening} ${strength}${focus}</p>`;
}

// ── Heatmap ────────────────────────────────────────────────────────────────

function formatPeriodShort(p) {
  if (!p) return '—';
  const [y, m] = p.split('-');
  return new Date(+y, +m - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}

function renderHeatmap() {
  const store = loadStore();
  const el    = document.getElementById('heatmapContent');
  if (!el) return;

  if (!store.coaches.length || !store.scorecards.length) {
    el.innerHTML = emptyState('🌡️', 'No heatmap data yet', 'Generate scorecards across multiple periods to see the heatmap.');
    return;
  }

  const periods   = [...new Set(store.scorecards.map(s => s.period))].sort();
  const coaches   = store.coaches.filter(c => store.scorecards.some(s => s.coachId === c.id));
  const scoreMap  = {};
  store.scorecards.forEach(s => { scoreMap[`${s.coachId}_${s.period}`] = parseFloat(s.total); });

  const cellColor = v => {
    if (v === null) return 'var(--s-100)';
    if (v >= 90) return '#16a34a';
    if (v >= 80) return '#22c55e';
    if (v >= 70) return '#f59e0b';
    if (v >= 60) return '#f97316';
    return '#ef4444';
  };

  el.innerHTML = `
    <div class="heatmap-wrap">
      <table class="heatmap-table">
        <thead>
          <tr>
            <th class="heatmap-name-col">Coach</th>
            ${periods.map(p => `<th class="heatmap-period-col">${formatPeriodShort(p)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${coaches.map(c => `
            <tr>
              <td class="heatmap-name">${esc(c.name)}</td>
              ${periods.map(p => {
                const v   = scoreMap[`${c.id}_${p}`] ?? null;
                const col = cellColor(v);
                const txt = v !== null ? '#fff' : 'transparent';
                return `<td class="heatmap-cell" style="background:${col};color:${txt}" title="${v !== null ? v.toFixed(1) : 'No data'}">${v !== null ? v.toFixed(0) : ''}</td>`;
              }).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="heatmap-legend">
        <span class="hm-legend-label">Score:</span>
        <div class="hm-legend-band" style="background:#ef4444">&lt; 60</div>
        <div class="hm-legend-band" style="background:#f97316">60–69</div>
        <div class="hm-legend-band" style="background:#f59e0b">70–79</div>
        <div class="hm-legend-band" style="background:#22c55e">80–89</div>
        <div class="hm-legend-band" style="background:#16a34a">90+</div>
      </div>
    </div>`;
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────

function updateBreadcrumb(elId, parts) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = parts.map((p, i) => {
    if (i < parts.length - 1) {
      return `<span class="bc-item bc-item--link" onclick="${p.onclick}">${esc(p.label)}</span><span class="bc-sep">›</span>`;
    }
    return `<span class="bc-item bc-item--current">${esc(p.label)}</span>`;
  }).join('');
}

// ── Past Entries ───────────────────────────────────────────────────────────

function timelineEntry(s, prevS, backDest) {
  const r     = s.rating || getRating(s.total);
  const t     = parseFloat(s.total);
  const delta = prevS ? t - parseFloat(prevS.total) : null;
  const dStr  = delta !== null ? (delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : null;
  const dCol  = delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : 'var(--s-400)';
  const dots  = s.rows ? s.rows.map(row => {
    const pct = Math.round(row.score / row.weight * 100);
    const col = pct >= 95 ? '#16a34a' : pct >= 80 ? '#22c55e' : pct >= 65 ? '#f59e0b' : pct >= 50 ? '#f97316' : '#ef4444';
    return `<div class="tl-pillar-dot" style="background:${col}" title="${esc(row.pillar)}: ${row.score}/${row.weight}"></div>`;
  }).join('') : '';

  return `
    <div class="tl-entry" onclick="viewSavedScorecard('${s.id}','${backDest}')">
      <div class="tl-date-col">
        <div class="tl-period">${formatPeriod(s.period)}</div>
        <div class="tl-generated">${formatDate(s.generatedAt)}</div>
      </div>
      <div class="tl-score-col">
        <span class="tl-score">${t.toFixed(1)}</span><span class="tl-denom">/100</span>
        ${dStr ? `<span class="tl-delta" style="color:${dCol}">${dStr}</span>` : ''}
      </div>
      <div class="tl-chip-col">
        <span class="rating-chip" style="background:${r.color}">${r.label}</span>
        <div class="tl-pillar-dots">${dots}</div>
      </div>
      <span class="tl-arrow">→</span>
    </div>`;
}

function renderPastEntries() {
  const store = loadStore();
  const items = store.scorecards
    .filter(s => s.coachId === currentCoach.id)
    .sort((a, b) => b.period.localeCompare(a.period));

  const el = document.getElementById('pastEntriesList');

  updateBreadcrumb('pastBreadcrumb', [
    { label: currentCoach.name, onclick: "goBack()" },
    { label: 'Past Entries' }
  ]);

  if (items.length === 0) {
    el.innerHTML = emptyState('📊', 'No scorecards yet', 'Head to Data Entry to generate your first scorecard.');
    return;
  }

  el.innerHTML = `<div class="tl-list">${
    items.map((s, i) => timelineEntry(s, items[i + 1] || null, 'pastEntriesView')).join('')
  }</div>`;
}

// ── Coach Leaderboard (anonymised) ────────────────────────────────────────

function renderCoachLeaderboard() {
  const store = loadStore();
  const el    = document.getElementById('coachLeaderboardList');
  if (!el) return;

  updateBreadcrumb('coachLbBreadcrumb', [
    { label: currentCoach.name, onclick: "goBack()" },
    { label: 'My Ranking' }
  ]);

  const rows = store.coaches.map(coach => {
    const entries = store.scorecards
      .filter(s => s.coachId === coach.id)
      .sort((a, b) => b.period.localeCompare(a.period));
    return { coach, latest: entries[0] || null };
  })
  .filter(r => r.latest)
  .sort((a, b) => parseFloat(b.latest.total) - parseFloat(a.latest.total));

  if (!rows.length) {
    el.innerHTML = emptyState('🏆', 'No ranking data yet', 'Submit your first scorecard to see how you rank against the team.');
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  el.innerHTML = `
    <div class="lb-wrap">
      <div class="lb-anon-note">👤 Other coaches are shown anonymously — only your own name is visible.</div>
      <table class="lb-table">
        <thead>
          <tr>
            <th class="center" style="width:44px">Rank</th>
            <th>Coach</th>
            <th class="center">Score</th>
            <th class="center">Rating</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, i) => {
            const rank  = i + 1;
            const isMe  = row.coach.id === currentCoach.id;
            const r     = row.latest.rating || getRating(parseFloat(row.latest.total));
            const score = parseFloat(row.latest.total).toFixed(1);
            const nameHtml = isMe
              ? `<div class="lb-name"><strong>${esc(row.coach.name)}</strong> <span class="lb-you-badge">You</span></div>
                 <div class="lb-branches-sub">${esc(row.coach.branches || '—')}</div>`
              : `<div class="lb-anon-name">Area Coach ${rank}</div>`;
            return `<tr class="lb-row${isMe ? ' lb-row--me' : ''}">
              <td class="center lb-rank">${medals[rank - 1] || rank}</td>
              <td>${nameHtml}</td>
              <td class="center">
                ${isMe
                  ? `<span class="lb-score">${score}</span>`
                  : `<span class="lb-score" style="color:${r.color}">${score}</span>`}
              </td>
              <td class="center">
                <span class="rating-chip" style="background:${r.color}">${isMe ? r.label : '—'}</span>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function scorecardMiniCard(s, backDest) {
  const r = s.rating || getRating(s.total);
  return `
    <div class="past-card">
      <div class="past-card-left">
        <div class="past-period">${formatPeriod(s.period)}</div>
        <div class="past-generated">Generated ${formatDate(s.generatedAt)}</div>
      </div>
      <div class="past-card-right">
        <div class="past-score">${parseFloat(s.total).toFixed(1)}<span class="past-denom">/100</span></div>
        <span class="rating-chip" style="background:${r.color}">${r.label}</span>
      </div>
      <button class="btn-ghost" onclick="viewSavedScorecard('${s.id}','${backDest}')">View →</button>
    </div>`;
}

function viewSavedScorecard(id, backDest) {
  const s = loadStore().scorecards.find(x => x.id === id);
  if (!s) return;
  if (!isHSOMode && currentCoach && s.coachId !== currentCoach.id) return;
  resultsBackDest = backDest;
  displayResults(s);
}

// ── Coaching Notes ────────────────────────────────────────────────────────

function renderCoachingNotes(s) {
  const el = document.getElementById('coachingNotesSection');
  if (!el) return;
  const isAdmin  = resultsBackDest === 'adminView';
  const notes    = s.hsoNotes || '';

  if (!isAdmin && !notes) { el.innerHTML = ''; return; }

  if (isAdmin) {
    el.innerHTML = `
      <div class="results-section-header" style="margin-top:28px;">
        <h3 class="results-section-title">Coaching Notes</h3>
      </div>
      <div class="coaching-notes-card">
        <p class="coaching-notes-hint">Visible to the coach. Record feedback, action items, or observations from the review.</p>
        <textarea id="coachingNotesInput" class="coaching-notes-textarea" placeholder="e.g. Focus on stock availability in the Westpark branch. Sales trend is positive — maintain momentum.">${esc(notes)}</textarea>
        <div class="coaching-notes-actions">
          <button class="btn-primary" onclick="saveCoachingNotes('${s.id}')">Save Notes</button>
          ${notes ? `<button class="btn-ghost" onclick="clearCoachingNotes('${s.id}')">Clear</button>` : ''}
        </div>
        <div id="coachingNotesSaveMsg" class="coaching-notes-save-msg hidden">✓ Notes saved</div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="results-section-header" style="margin-top:28px;">
        <h3 class="results-section-title">Coaching Notes</h3>
      </div>
      <div class="coaching-notes-card coaching-notes-card--readonly">
        <div class="coaching-notes-icon">📋</div>
        <p class="coaching-notes-body">${esc(notes).replace(/\n/g, '<br>')}</p>
      </div>`;
  }
}

async function saveCoachingNotes(scorecardId) {
  const notes = document.getElementById('coachingNotesInput')?.value.trim() || '';
  await dbSaveCoachingNotes(scorecardId, notes);
  const msg = document.getElementById('coachingNotesSaveMsg');
  if (msg) { msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 2500); }
}

function clearCoachingNotes(scorecardId) {
  const input = document.getElementById('coachingNotesInput');
  if (input) input.value = '';
  saveCoachingNotes(scorecardId);
  renderCoachingNotes(loadStore().scorecards.find(x => x.id === scorecardId));
}


// ── Quarterly Report ──────────────────────────────────────────────────────

const QUARTER_MONTHS = {
  '1': ['01','02','03'],
  '2': ['04','05','06'],
  '3': ['07','08','09'],
  '4': ['10','11','12']
};

function initQuarterlyTab() {
  const store    = loadStore();
  const coachSel = document.getElementById('qrCoachSelect');
  const yearSel  = document.getElementById('qrYearSelect');
  if (!coachSel || !yearSel) return;

  coachSel.innerHTML = '<option value="">— Select coach —</option>' +
    store.coaches.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  const years = [...new Set(store.scorecards.map(s => s.period.slice(0,4)))].sort().reverse();
  const thisYear = new Date().getFullYear().toString();
  if (!years.includes(thisYear)) years.unshift(thisYear);
  yearSel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');

  document.getElementById('quarterlyReportContent').innerHTML = '';
}

function generateQuarterlyReport() {
  const coachId = document.getElementById('qrCoachSelect')?.value;
  const year    = document.getElementById('qrYearSelect')?.value;
  const quarter = document.getElementById('qrQuarterSelect')?.value;
  const el      = document.getElementById('quarterlyReportContent');

  if (!coachId || !year || !quarter) { showToast('Please select a coach, year and quarter.'); return; }

  const store  = loadStore();
  const coach  = store.coaches.find(c => c.id === coachId);
  const months = QUARTER_MONTHS[quarter];
  const periodKeys = months.map(m => `${year}-${m}`);

  const scorecards = periodKeys
    .map(pk => store.scorecards.find(s => s.coachId === coachId && s.period === pk) || null);

  const existing = scorecards.filter(Boolean);
  if (!existing.length) {
    el.innerHTML = emptyState('📅', 'No data for this quarter', 'No scorecards were submitted by this coach in the selected period.');
    return;
  }

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const qLabel     = `Q${quarter} ${year}`;

  // Per-pillar averages
  const pillarTotals = {};
  const pillarWeights = {};
  existing.forEach(sc => {
    sc.rows.forEach(row => {
      pillarTotals[row.pillar]  = (pillarTotals[row.pillar]  || 0) + row.score;
      pillarWeights[row.pillar] = row.weight;
    });
  });
  const pillarAvgs = Object.entries(pillarTotals).map(([pillar, total]) => ({
    pillar,
    weight: pillarWeights[pillar],
    avg: total / existing.length
  }));

  const avgTotal  = existing.reduce((s, sc) => s + parseFloat(sc.total), 0) / existing.length;
  const avgRating = getRating(avgTotal);

  // Month columns
  const monthCols = months.map((m, i) => {
    const sc = scorecards[i];
    const mn = monthNames[parseInt(m,10)-1];
    if (!sc) return `<th class="center qr-month-missing">${mn}<br><span class="qr-no-data">No data</span></th>`;
    const r = sc.rating || getRating(parseFloat(sc.total));
    return `<th class="center qr-month-col">${mn}<br><span class="qr-month-score" style="color:${r.color}">${parseFloat(sc.total).toFixed(1)}</span></th>`;
  }).join('');

  const pillarRows = pillarAvgs.map(p => {
    const ratio = p.avg / p.weight;
    const col   = ratio >= .95 ? '#16a34a' : ratio >= .75 ? '#22c55e' : ratio >= .5 ? '#f59e0b' : '#ef4444';
    const monthScores = months.map((m, i) => {
      const sc = scorecards[i];
      if (!sc) return `<td class="center qr-no-data-cell">—</td>`;
      const row = sc.rows.find(r => r.pillar === p.pillar);
      return `<td class="center">${row ? row.score : '—'}</td>`;
    }).join('');
    return `
      <tr>
        <td class="cmp-pillar">${esc(p.pillar)}</td>
        <td class="center">${p.weight}</td>
        ${monthScores}
        <td class="center" style="color:${col};font-weight:700">${p.avg.toFixed(1)}</td>
      </tr>`;
  }).join('');

  const noteRows = existing.map(sc => {
    const hsoNotes   = sc.hsoNotes?.trim();
    const coachNote  = sc.coachNote?.trim();
    if (!hsoNotes && !coachNote) return '';
    const mn = monthNames[parseInt(sc.period.slice(5,7),10)-1];
    const hsoHtml   = hsoNotes  ? `<p class="qr-note-text"><strong>HSO:</strong> ${esc(hsoNotes).replace(/\n/g,'<br>')}</p>` : '';
    const coachHtml = coachNote ? `<p class="qr-note-text" style="margin-top:6px"><strong>Coach:</strong> ${esc(coachNote)}</p>` : '';
    return `<div class="qr-note-item"><span class="qr-note-month">${mn}</span><div>${hsoHtml}${coachHtml}</div></div>`;
  }).join('');

  el.innerHTML = `
    <div class="quarterly-report" id="printableQR">
      <div class="qr-header">
        <div class="qr-header-main">
          <div class="qr-eyebrow">Quarterly Performance Report</div>
          <div class="qr-title">${esc(coach.name)}</div>
          <div class="qr-meta">${esc(coach.branches || '—')} &nbsp;·&nbsp; ${qLabel}</div>
        </div>
        <div class="qr-summary-ring">
          <div class="qr-avg-score" style="color:${avgRating.color}">${avgTotal.toFixed(1)}</div>
          <div class="qr-avg-label">Avg Score</div>
          <div class="qr-avg-rating" style="background:${avgRating.color}">${avgRating.label}</div>
        </div>
      </div>

      <div class="table-card" style="margin-bottom:20px;">
        <table class="cmp-table">
          <thead>
            <tr>
              <th>Pillar</th>
              <th class="center">Max</th>
              ${monthCols}
              <th class="center">Avg</th>
            </tr>
          </thead>
          <tbody>${pillarRows}</tbody>
          <tfoot>
            <tr class="cmp-total-row">
              <td colspan="2" style="text-align:right;padding-right:16px;font-weight:700;">TOTAL</td>
              ${months.map((m,i) => {
                const sc = scorecards[i];
                return `<td class="center">${sc ? parseFloat(sc.total).toFixed(1) : '—'}</td>`;
              }).join('')}
              <td class="center" style="color:${avgRating.color};font-weight:700">${avgTotal.toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${noteRows ? `
        <div class="qr-notes-section">
          <div class="results-section-header">
            <h3 class="results-section-title">Coaching Notes — ${qLabel}</h3>
          </div>
          <div class="qr-notes-list">${noteRows}</div>
        </div>` : ''}

      <div class="qr-footer no-print">
        <button class="btn-primary" onclick="window.print()">Print / Save PDF</button>
        <span class="qr-footer-note">Generated ${new Date().toLocaleDateString('en-ZA')}</span>
      </div>
    </div>`;
}

// ── CSV Export ────────────────────────────────────────────────────────────

function exportResultsCSV(s) {
  if (!s) return;
  const coach = loadStore().coaches.find(c => c.id === s.coachId) || { name: '—', branches: '—' };
  const r = s.rating || getRating(s.total);
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Area Coach', 'Period', 'Branches', 'Total Score', 'Rating'],
    [coach.name, formatPeriod(s.period), coach.branches || '—', parseFloat(s.total).toFixed(1), r.label],
    [],
    ['Performance Pillar', 'KPI', 'Max Weight', 'Achieved', 'Score'],
    ...s.rows.map(row => [row.pillar || '—', row.label, row.weight, row.derived, row.score])
  ];
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `Scorecard_${(coach.name || 'Coach').replace(/\s+/g,'_')}_${s.period || 'export'}.csv`;
  a.click();
}

// ── Confetti ───────────────────────────────────────────────────────────────

function launchConfetti() {
  const palette = ['#4ade80','#22c55e','#bbf7d0','#ffffff','#fbbf24','#f9a825','#34d399','#86efac'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  for (let i = 0; i < 72; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const w = 5 + Math.random() * 8;
    const h = Math.random() > 0.4 ? w * 0.45 : w;
    el.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${w}px`,
      `height:${h}px`,
      `background:${palette[i % palette.length]}`,
      `animation-duration:${2.4 + Math.random() * 1.4}s`,
      `animation-delay:${Math.random() * 1.1}s`,
      `transform:rotate(${Math.random() * 360}deg)`,
      `opacity:${0.7 + Math.random() * 0.3}`,
    ].join(';');
    container.appendChild(el);
  }
  setTimeout(() => container.remove(), 5000);
}

// ── Results ────────────────────────────────────────────────────────────────

function displayResults(s, fromNav = false) {
  currentResultScorecard = s;
  const store = loadStore();
  const coach = store.coaches.find(c => c.id === s.coachId) || { name: '—', branches: '—' };
  const r = s.rating || getRating(s.total);
  const t = parseFloat(s.total);

  // Meta
  document.getElementById('res-name').textContent     = coach.name;
  document.getElementById('res-period').textContent   = formatPeriod(s.period);
  document.getElementById('res-branches').textContent = coach.branches || '—';

  // Rating badge
  const badge = document.getElementById('ratingBadge');
  badge.textContent      = `${r.label} — ${r.meaning}`;
  badge.style.background = r.color;

  // Score delta vs previous period
  const prevEntries = store.scorecards
    .filter(x => x.coachId === s.coachId && x.period < s.period)
    .sort((a, b) => b.period.localeCompare(a.period));
  const prevEntry = prevEntries[0] || null;
  const deltaEl = document.getElementById('scoreDelta');
  if (prevEntry) {
    const diff = t - parseFloat(prevEntry.total);
    deltaEl.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' vs prev';
    deltaEl.className   = 'score-delta ' + (diff > 0 ? 'score-delta--up' : diff < 0 ? 'score-delta--down' : 'score-delta--flat');
    deltaEl.classList.remove('hidden');
  } else {
    deltaEl.classList.add('hidden');
  }

  // Reset ring
  const ring = document.getElementById('scoreRingFill');
  if (ring) {
    ring.style.stroke          = getRingColor(t);
    ring.style.strokeDasharray = RING_CIRC;
    ring.style.strokeDashoffset= RING_CIRC;
  }

  // Score numbers
  document.getElementById('totalScore').textContent       = '0.0';
  document.getElementById('totalScoreFooter').textContent = t.toFixed(1);

  // Table rows
  const scoreTableBody = document.getElementById('scoreTable')?.querySelector('tbody');
  if (scoreTableBody) scoreTableBody.innerHTML = s.rows.map((row, i) => {
    const ratio = row.score / row.weight;
    const col   = ratio >= .95 ? '#166534' : ratio >= .75 ? '#15803d' : ratio >= .5 ? '#b45309' : '#c2410c';
    return `
    <tr style="animation:rowSlideIn .32s var(--ease-out) ${(i*.055).toFixed(3)}s both">
      <td class="pillar-cell">${esc(row.pillar || '—')}</td>
      <td>${esc(row.label)}</td>
      <td class="center">${row.weight}</td>
      <td class="center muted">${row.derived}</td>
      <td class="center score-cell" style="color:${col}">${row.score}</td>
    </tr>`;
  }).join('');

  // Pillar cards (with inline deltas vs previous period)
  document.getElementById('pillarResultsGrid').innerHTML = renderPillarResultCards(s.rows, prevEntry?.rows);

  // Narrative + coach context note
  const narrativeEl = document.getElementById('scoreNarrative');
  if (narrativeEl) {
    const coachNoteHtml = s.coachNote
      ? `<div class="coach-context-note"><span class="ccn-label">📝 Coach note:</span> ${esc(s.coachNote)}</div>`
      : '';
    const narrative = generateNarrative(s, coach);
    narrativeEl.innerHTML = narrative + coachNoteHtml;
    narrativeEl.classList.toggle('hidden', !narrative && !s.coachNote);
  }

  // Coaching notes (HSO)
  renderCoachingNotes(s);

  // Rating scale highlight
  document.querySelectorAll('.scale-item').forEach(el => el.classList.remove('scale-active'));
  const tierIdx = [90, 80, 70, 60, 0].findIndex(th => t >= th);
  if (tierIdx >= 0) document.querySelectorAll('.scale-item')[tierIdx]?.classList.add('scale-active');

  // Personal best — reset
  const pbEl = document.getElementById('personalBest');
  pbEl.classList.add('hidden');
  pbEl.classList.remove('pb-show');

  // Period navigator
  updatePeriodNavigator(s.id);

  if (!fromNav) navStack.push(resultsBackDest === 'adminView' ? 'adminView' : resultsBackDest);
  switchResultsTab('overview');
  showView('resultsView');

  // Animations — deferred one frame so layout is painted
  setTimeout(() => {
    animateScoreRing(t);

    const scoreEl = document.getElementById('totalScore');
    const start   = performance.now();
    const dur     = 1300;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      scoreEl.textContent = ((1 - Math.pow(1 - p, 4)) * t).toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
      else scoreEl.textContent = t.toFixed(1);
    };
    requestAnimationFrame(tick);

    if (t >= 80) {
      setTimeout(() => {
        const rw = document.querySelector('.score-ring-wrap');
        rw?.classList.remove('celebrate');
        void rw?.offsetWidth;
        rw?.classList.add('celebrate');
        setTimeout(() => rw?.classList.remove('celebrate'), 2000);
      }, 900);
    }

    if (t >= 90) setTimeout(launchConfetti, 1100);

    // Personal best
    const prevScores = store.scorecards
      .filter(x => x.coachId === s.coachId && x.id !== s.id)
      .map(x => parseFloat(x.total));
    if (prevScores.length && t > Math.max(...prevScores)) {
      setTimeout(() => {
        pbEl.classList.remove('hidden');
        void pbEl.offsetWidth;
        pbEl.classList.add('pb-show');
      }, 1600);
    }
  }, 220);
}

// ── Sheets Integration UI ──────────────────────────────────────────────────

function renderSheetsSection() {
  const clientId = loadStore().googleClientId;
  const el = document.getElementById('sheetsContent');

  if (!clientId) {
    el.innerHTML = `
      <div class="sheets-notice">
        <span class="notice-icon">⚠️</span>
        <div>
          <strong>Google Sheets import is not configured.</strong><br>
          Ask your HSO to add a Google Client ID in Admin → Settings.
        </div>
      </div>`;
    return;
  }

  if (!window.SheetsIntegration) {
    el.innerHTML = `<p class="hint-text">Loading Google API…</p>`;
    return;
  }

  if (!SheetsIntegration.accessToken) {
    el.innerHTML = `
      <h3 class="section-label" style="margin-bottom:8px;">Import from Google Sheets</h3>
      <p class="kpi-formula" style="margin-bottom:16px;">
        Connect your Google account then paste your spreadsheet URL.<br>
        Make sure your sheet uses the Foodco column template.
      </p>
      <button class="btn-primary" id="connectGoogleBtn">Connect Google Account</button>`;
    document.getElementById('connectGoogleBtn').addEventListener('click', () => {
      SheetsIntegration.init(clientId);
      SheetsIntegration.signIn();
    });
  } else {
    el.innerHTML = `
      <h3 class="section-label" style="margin-bottom:8px;">Import from Google Sheets</h3>
      <div class="connected-badge">✅ Google account connected</div>
      <div class="field" style="margin:14px 0 10px;">
        <label for="sheetsUrl">Spreadsheet URL or ID</label>
        <input type="text" id="sheetsUrl" placeholder="https://docs.google.com/spreadsheets/d/..." />
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <button class="btn-primary" id="importSheetsBtn">Import Data</button>
        <button class="btn-link" id="disconnectBtn">Disconnect</button>
      </div>
      <div id="sheetsStatus" style="margin-top:12px;"></div>`;

    document.getElementById('importSheetsBtn').addEventListener('click', async () => {
      const url    = document.getElementById('sheetsUrl').value.trim();
      const period = document.getElementById('entryPeriod').value;
      const status = document.getElementById('sheetsStatus');

      if (!url)    { status.innerHTML = `<span class="form-error" style="display:block">Please enter a spreadsheet URL.</span>`; return; }
      if (!period) { status.innerHTML = `<span class="form-error" style="display:block">Please select a period above first.</span>`; return; }

      status.innerHTML = `<span class="hint-text">Fetching data…</span>`;

      try {
        const fieldData = await SheetsIntegration.importFromSpreadsheet(url, currentCoach.name, period);
        if (!fieldData) {
          status.innerHTML = `<span class="form-error" style="display:block">No data found for <strong>${currentCoach.name}</strong> in period <strong>${formatPeriod(period)}</strong>. Check the spreadsheet and try again.</span>`;
          return;
        }
        // Switch to manual section with pre-filled values
        switchEntryMethod('manual');
        prefillManualForm(fieldData);
        status.innerHTML = '';
        showToast('Data imported! Review and generate scorecard.');
      } catch (err) {
        status.innerHTML = `<span class="form-error" style="display:block">Import failed: ${esc(err.message)}</span>`;
      }
    });

    document.getElementById('disconnectBtn').addEventListener('click', () => {
      SheetsIntegration.signOut();
      renderSheetsSection();
    });
  }
}

function switchEntryMethod(method) {
  document.querySelectorAll('.method-btn').forEach(b => b.classList.toggle('active', b.dataset.method === method));
  document.getElementById('manualSection').classList.toggle('hidden', method !== 'manual');
  document.getElementById('sheetsSection').classList.toggle('hidden', method !== 'sheets');
  if (method === 'sheets') renderSheetsSection();
}

// ── KPI Card Renderer ──────────────────────────────────────────────────────

function renderKpiCard(kpi, prefix) {
  const single     = kpi.fields.length === 1;
  const weightClass = kpi.pts >= 20 ? 'kpi-card--heavy' : kpi.pts >= 10 ? 'kpi-card--medium' : 'kpi-card--light';

  const fields = kpi.fields.map(f => `
    <div class="field">
      <label for="${prefix}_${f.id}">${f.label}</label>
      <input type="number" id="${prefix}_${f.id}"
        placeholder="${f.placeholder || '0'}"
        min="${f.min !== undefined ? f.min : 0}"
        ${f.max !== undefined ? `max="${f.max}"` : ''}
        step="${f.step || 'any'}" />
    </div>`).join('');

  // Reference info consolidated into the scoring collapsible
  const metaLines = [
    kpi.formula    ? `<div class="kpi-scoring-meta-row"><span class="ksm-label">Formula</span><span class="ksm-val">${kpi.formula}</span></div>` : '',
    kpi.dataSource ? `<div class="kpi-scoring-meta-row"><span class="ksm-label">Source</span><span class="ksm-val">${kpi.dataSource}</span></div>` : '',
    kpi.includes?.length ? `<div class="kpi-scoring-meta-row"><span class="ksm-label">Include</span><span class="ksm-val">${kpi.includes.join(', ')}</span></div>` : '',
  ].filter(Boolean).join('');

  const bandsHtml = kpi.bands ? `
    <details class="kpi-bands-details">
      <summary class="kpi-bands-summary">How is this scored? <span class="kpi-bands-chevron">▾</span></summary>
      ${metaLines ? `<div class="kpi-scoring-meta">${metaLines}</div>` : ''}
      <div class="kpi-bands-table">
        ${kpi.bands.map(b => `
          <div class="kpi-band-row">
            <span class="kpi-band-threshold">${b.label}</span>
            <div class="kpi-band-bar-track">
              <div class="kpi-band-bar" style="width:${Math.round(b.score / kpi.pts * 100)}%"></div>
            </div>
            <span class="kpi-band-score">${b.score} pts</span>
          </div>`).join('')}
      </div>
    </details>` : '';

  return `
    <div class="kpi-card ${weightClass}" id="kpicard_${kpi.id}">
      <div class="kpi-header">
        <div class="kpi-header-left">
          <span class="kpi-pillar-tag">${kpi.pillar}</span>
          <h3>${kpi.label}</h3>
        </div>
        <span class="kpi-badge">${kpi.pts} pts</span>
      </div>
      <div class="field-row${single ? ' single' : ''}">
        ${fields}
        <span class="preview" id="${prefix}_prev_${kpi.id}"></span>
      </div>
      <div class="kpi-validation-msg hidden" id="${prefix}_warn_${kpi.id}"></div>
      ${bandsHtml}
    </div>`;
}

function updateProjectedScore() {
  const fieldData = collectManualForm();
  const hasData   = Object.values(fieldData).some(v => v > 0);
  const section   = document.getElementById('sidebarScoreSection');
  const pillarsEl = document.getElementById('sidebarPillars');

  if (!hasData) {
    section?.classList.add('hidden');
    pillarsEl?.classList.add('hidden');
    return;
  }

  const { rows, total } = computeScorecard(fieldData);

  section?.classList.remove('hidden');
  const ring  = document.getElementById('sidebarRingFill');
  const numEl = document.getElementById('sidebarScoreNum');
  if (ring) {
    ring.style.stroke           = getRingColor(total);
    ring.style.strokeDasharray  = SIDEBAR_RING_CIRC;
    ring.style.strokeDashoffset = (SIDEBAR_RING_CIRC * (1 - total / 100)).toFixed(2);
  }
  if (numEl) numEl.textContent = total.toFixed(1);

  if (pillarsEl) {
    pillarsEl.classList.remove('hidden');
    pillarsEl.innerHTML = rows.map(row => {
      const ratio = row.score / row.weight;
      const col   = ratio >= .95 ? '#16a34a' : ratio >= .80 ? '#22c55e' : ratio >= .65 ? '#f59e0b' : ratio >= .50 ? '#f97316' : '#ef4444';
      const pct   = Math.round(ratio * 100);
      return `<div class="sidebar-pillar-row">
        <span class="sidebar-pillar-name">${esc(row.pillar)}</span>
        <div class="sidebar-pillar-bar-track">
          <div class="sidebar-pillar-bar" style="width:${pct}%;background:${col}"></div>
        </div>
        <span class="sidebar-pillar-pts" style="color:${col}">${row.score}</span>
      </div>`;
    }).join('');
  }
}

function bindLivePreviews(prefix) {
  KPI_CONFIG.forEach(kpi => {
    const update = () => {
      const vals = {};
      let ok = true;
      kpi.fields.forEach(f => {
        const v = parseFloat(document.getElementById(`${prefix}_${f.id}`)?.value);
        if (isNaN(v)) ok = false;
        vals[f.id] = v;
      });
      const disp   = document.getElementById(`${prefix}_prev_${kpi.id}`);
      const warnEl = document.getElementById(`${prefix}_warn_${kpi.id}`);
      if (!disp) return;
      if (ok) {
        const d        = kpi.compute(vals);
        const scoreVal = kpi.score(d);
        const ratio    = scoreVal / kpi.pts;
        disp.textContent = `${kpi.display(d)}  ·  ${scoreVal} / ${kpi.pts} pts`;
        disp.className   = `preview active${ratio >= .9 ? ' preview--great' : ratio >= .6 ? ' preview--ok' : ' preview--low'}`;
        if (warnEl && kpi.validate) {
          const warn = kpi.validate(vals);
          warnEl.textContent = warn || '';
          warnEl.classList.toggle('hidden', !warn);
        }
      } else {
        disp.textContent = '';
        disp.className   = 'preview';
        warnEl?.classList.add('hidden');
      }
    };
    kpi.fields.forEach(f => document.getElementById(`${prefix}_${f.id}`)?.addEventListener('input', update));
  });
}

// ── CSV Template Download ──────────────────────────────────────────────────

function downloadTemplate() {
  const headers = [
    'Coach Name', 'Period (YYYY-MM)',
    'Actual Sales', 'Target Sales',
    'Available SKUs', 'Total Required SKUs',
    'Current Year Sales', 'Previous Year Sales',
    'Audit Score (%)', 'GHP Score (%)',
    'Actual Staff', 'Planned Staff',
    'Profit vs Target (%)',
    'Actual Expense', 'Expense Budget',
    '% Promoters', '% Detractors'
  ];
  const example = [
    'Jane Dlamini', '2026-03',
    '950000', '1000000',
    '185', '200',
    '1100000', '1000000',
    '90', '92',
    '48', '50',
    '97',
    '48000', '50000',
    '65', '15'
  ];
  const csv = [headers.join(','), example.join(',')].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Foodco_KPI_Data_Template.csv';
  a.click();
}

// ── Utilities ──────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function emptyState(icon, heading, body) {
  return `<div class="empty-state-block">
    <div class="esb-icon">${icon}</div>
    <div class="esb-heading">${heading}</div>
    <div class="esb-body">${body}</div>
  </div>`;
}

function formatPeriod(p) {
  if (!p) return '—';
  const [y, m] = p.split('-');
  return new Date(+y, +m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── PWA install prompt ────────────────────────────────────────────────────
let _installPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
  document.getElementById('pwaInstallBtn')?.classList.remove('hidden');
});

window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  document.getElementById('pwaInstallBtn')?.classList.add('hidden');
});

function showInstallButton() {
  const btn = document.getElementById('pwaInstallBtn');
  if (btn && _installPrompt) btn.classList.remove('hidden');
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('headerActions').addEventListener('click', async e => {
    if (!e.target.closest('#pwaInstallBtn')) return;
    if (!_installPrompt) return;
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    if (outcome === 'accepted') _installPrompt = null;
  });

  // Handle password recovery redirect (user clicked reset link in email)
  sb.auth.onAuthStateChange(async (event) => {
    if (event === 'PASSWORD_RECOVERY') {
      showView('setNewPasswordView');
    }
  });

  // Set new password handler (after clicking email reset link)
  document.getElementById('setNewPasswordBtn').addEventListener('click', async () => {
    const newPass     = document.getElementById('newPasswordInput').value;
    const confirmPass = document.getElementById('confirmPasswordInput').value;
    const errEl       = document.getElementById('newPasswordError');
    const btn         = document.getElementById('setNewPasswordBtn');

    if (newPass.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.classList.remove('hidden'); return;
    }
    if (newPass !== confirmPass) {
      errEl.textContent = 'Passwords do not match.';
      errEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Updating…';
    const { error } = await sb.auth.updateUser({ password: newPass });
    btn.disabled = false; btn.textContent = 'Update Password →';

    if (error) {
      errEl.textContent = error.message;
      errEl.classList.remove('hidden'); return;
    }

    await sb.auth.signOut();
    showToast('Password updated. Please sign in with your new password.');
    showView('landingView');
  });

  // Forgot password — HSO security-questions flow
  const forgotModal = document.getElementById('forgotPasswordModal');

  function openForgotModal(prefillId) {
    const prefill = document.getElementById(prefillId)?.value.trim() || '';
    document.getElementById('resetEmail').value = prefill;
    document.getElementById('resetMsg').classList.add('hidden');
    document.getElementById('fpm-step1').classList.remove('hidden');
    document.getElementById('fpm-step2').classList.add('hidden');
    document.getElementById('fpmA1').value = '';
    document.getElementById('fpmA2').value = '';
    document.getElementById('fpmNewPass').value = '';
    document.getElementById('fpmConfirmPass').value = '';
    document.getElementById('fpmStep2Msg').classList.add('hidden');
    forgotModal.classList.remove('hidden');
  }

  document.getElementById('forgotPasswordHso').addEventListener('click', () => openForgotModal('hsoEmail'));
  document.getElementById('cancelResetBtn').addEventListener('click', () => forgotModal.classList.add('hidden'));
  forgotModal.addEventListener('click', e => { if (e.target === forgotModal) forgotModal.classList.add('hidden'); });

  // Step 1: look up security questions by email
  document.getElementById('fpmNextBtn').addEventListener('click', async () => {
    const email = document.getElementById('resetEmail').value.trim();
    const msgEl = document.getElementById('resetMsg');
    const btn   = document.getElementById('fpmNextBtn');

    if (!email) { msgEl.textContent = 'Please enter your email.'; msgEl.classList.remove('hidden'); return; }
    msgEl.classList.add('hidden');

    btn.disabled = true; btn.textContent = 'Checking…';
    try {
      const res  = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_security_questions', email }),
      });
      const data = await res.json();
      if (!res.ok) { msgEl.textContent = data.error || 'Failed to fetch questions.'; msgEl.classList.remove('hidden'); return; }

      const q1El = document.getElementById('fpmQ1Label');
      const q2El = document.getElementById('fpmQ2Label');
      if (q1El) q1El.textContent = data.sq1;
      if (q2El) q2El.textContent = data.sq2;
      document.getElementById('fpm-step1')?.classList.add('hidden');
      document.getElementById('fpm-step2')?.classList.remove('hidden');
    } catch {
      msgEl.textContent = 'Network error — please try again.';
      msgEl.classList.remove('hidden');
    } finally {
      btn.disabled = false; btn.textContent = 'Next →';
    }
  });

  // Step 2: back
  document.getElementById('fpmBackBtn').addEventListener('click', () => {
    document.getElementById('fpm-step2').classList.add('hidden');
    document.getElementById('fpm-step1').classList.remove('hidden');
  });

  // Step 2: verify answers + reset password
  document.getElementById('fpmResetBtn').addEventListener('click', async () => {
    const email    = document.getElementById('resetEmail').value.trim();
    const a1       = document.getElementById('fpmA1').value;
    const a2       = document.getElementById('fpmA2').value;
    const newPass  = document.getElementById('fpmNewPass').value;
    const confPass = document.getElementById('fpmConfirmPass').value;
    const msgEl    = document.getElementById('fpmStep2Msg');
    const btn      = document.getElementById('fpmResetBtn');

    if (!a1 || !a2) { msgEl.textContent = 'Please answer both security questions.'; msgEl.classList.remove('hidden'); return; }
    if (newPass.length < 6) { msgEl.textContent = 'Password must be at least 6 characters.'; msgEl.classList.remove('hidden'); return; }
    if (newPass !== confPass) { msgEl.textContent = 'Passwords do not match.'; msgEl.classList.remove('hidden'); return; }

    btn.disabled = true; btn.textContent = 'Resetting…';
    msgEl.classList.add('hidden');
    try {
      const res  = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_and_reset_hso_password', email, a1, a2, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { msgEl.textContent = data.error || 'Reset failed.'; msgEl.classList.remove('hidden'); return; }

      forgotModal.classList.add('hidden');
      showToast('Password reset! Sign in with your new password.');
    } catch {
      msgEl.textContent = 'Network error — please try again.';
      msgEl.classList.remove('hidden');
    } finally {
      btn.disabled = false; btn.textContent = 'Reset Password';
    }
  });

  // Force password change — shown after coach logs in with HSO-set password
  document.getElementById('forcePasswordBtn').addEventListener('click', async () => {
    const newPass     = document.getElementById('forceNewPassword').value;
    const confirmPass = document.getElementById('forceConfirmPassword').value;
    const errEl       = document.getElementById('forcePasswordError');
    const btn         = document.getElementById('forcePasswordBtn');

    if (newPass.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.classList.remove('hidden'); return;
    }
    if (newPass !== confirmPass) {
      errEl.textContent = 'Passwords do not match.';
      errEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Saving…';
    const { error } = await sb.auth.updateUser({
      password: newPass,
      data: { must_change_password: false },
    });
    btn.disabled = false; btn.textContent = 'Set Password & Continue →';

    if (error) {
      errEl.textContent = error.message;
      errEl.classList.remove('hidden'); return;
    }

    showToast('Password set. Welcome!');
    renderCoachHome();
    navigate('coachHomeView');
    setTimeout(() => showCoachGreeting(currentCoach), 800);
  });

  // Admin – security questions setup
  document.getElementById('securityQForm').addEventListener('submit', async e => {
    e.preventDefault();
    const q1    = document.getElementById('sq1Select').value;
    const a1    = document.getElementById('sq1Answer').value.trim();
    const q2    = document.getElementById('sq2Select').value;
    const a2    = document.getElementById('sq2Answer').value.trim();
    const msgEl = document.getElementById('securityQMsg');
    const btn   = document.getElementById('saveSecurityQBtn');

    if (!q1 || !a1 || !q2 || !a2) {
      msgEl.textContent = 'Please select both questions and provide answers.';
      msgEl.classList.remove('hidden'); return;
    }
    if (q1 === q2) {
      msgEl.textContent = 'Please choose two different questions.';
      msgEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Saving…';
    msgEl.classList.add('hidden');
    try {
      const { data: { session } } = await sb.auth.getSession();
      const res  = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'setup_security_questions', q1, a1, q2, a2 }),
      });
      const data = await res.json();
      if (!res.ok) { msgEl.textContent = data.error || 'Failed to save.'; msgEl.classList.remove('hidden'); return; }
      document.getElementById('securityQForm').reset();
      showToast('Security questions saved.');
    } catch {
      msgEl.textContent = 'Network error — please try again.';
      msgEl.classList.remove('hidden');
    } finally {
      btn.disabled = false; btn.textContent = 'Save Security Questions';
    }
  });

  // Restore existing session on page load (skip if this is a password recovery redirect)
  const isRecovery = window.location.hash.includes('type=recovery');
  const { data: { session } } = await sb.auth.getSession();
  if (isRecovery) {
    showView('setNewPasswordView');
  } else if (session?.user) {
    const role = session.user.user_metadata?.role;
    await loadAppState();
    if (role === 'dev') {
      isHSOMode = true;
      isDevMode = true;
      renderAdminCoachList();
      document.getElementById('googleClientIdInput').value = _cache.googleClientId;
      document.getElementById('headerActions').innerHTML =
        `<span class="header-role-badge" style="background:#fef3c7;color:#92400e;border:1px solid #d97706;">🛠 Dev Mode</span>`;
      showDevToolbar();
      showView('adminView');
    } else if (role === 'hso') {
      isHSOMode = true;
      renderAdminCoachList();
      document.getElementById('googleClientIdInput').value = _cache.googleClientId;
      document.getElementById('headerActions').innerHTML =
        `<span class="header-role-badge header-role-badge--admin">🔐 HSO Admin</span>
         <button id="pwaInstallBtn" class="btn-install hidden" title="Install app">⬇ Install App</button>`;
      showInstallButton();
      showView('adminView');
    } else {
      const coach = _cache.coaches.find(c => c.userId === session.user.id);
      if (coach) {
        currentCoach = coach;
        renderCoachHome();
        showView('coachHomeView');
      }
    }
  }

  // Landing
  document.getElementById('hsoRoleBtn').addEventListener('click', () => navigate('hsoPinView'));
  document.getElementById('coachRoleBtn').addEventListener('click', () => navigate('coachSelectView'));

  // HSO Login
  document.getElementById('pinForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('hsoEmail').value.trim();
    const password = document.getElementById('hsoPassword').value;
    const errEl    = document.getElementById('pinError');
    const btn      = document.getElementById('hsoSignInBtn');

    btn.disabled = true; btn.textContent = 'Signing in…';
    errEl.classList.add('hidden');

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = 'Sign In →';

    if (error || !data.user) {
      errEl.textContent = 'Incorrect email or password.';
      errEl.classList.remove('hidden'); return;
    }
    if (data.user.user_metadata?.role !== 'hso') {
      errEl.textContent = 'This account does not have HSO admin access.';
      errEl.classList.remove('hidden');
      await sb.auth.signOut(); return;
    }

    document.getElementById('hsoPassword').value = '';
    await loadAppState();
    isHSOMode = true; hasShownGreeting = false; aiHistory = [];
    renderAdminCoachList();
    document.getElementById('googleClientIdInput').value = _cache.googleClientId;
    document.getElementById('headerActions').innerHTML =
      `<span class="header-role-badge header-role-badge--admin">🔐 HSO Admin</span>`;
    navigate('adminView');
    setTimeout(() => showHSOGreeting(), 800);
  });
  document.getElementById('backFromPin').addEventListener('click', goBack);

  // ── Dev backdoor ─────────────────────────────────────────────────────────
  // Trigger 1: navigate to /#devaccess
  // Trigger 2: click any Foodco logo 5 times within 3 seconds
  function openDevModal() {
    document.getElementById('devLoginModal').classList.remove('hidden');
    document.getElementById('devEmail').focus();
    history.replaceState(null, '', window.location.pathname);
  }
  if (window.location.hash === '#devaccess') openDevModal();
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#devaccess') openDevModal();
  });
  let _devClickCount = 0, _devClickTimer = null;
  function handleDevLogoClick() {
    _devClickCount++;
    clearTimeout(_devClickTimer);
    if (_devClickCount >= 5) {
      _devClickCount = 0;
      openDevModal();
    } else {
      _devClickTimer = setTimeout(() => { _devClickCount = 0; }, 3000);
    }
  }
  document.querySelectorAll('.logo-mark, .hero-logo-mark').forEach(el =>
    el.addEventListener('click', handleDevLogoClick)
  );

  document.getElementById('devModalCancelBtn').addEventListener('click', () => {
    document.getElementById('devLoginModal').classList.add('hidden');
    document.getElementById('devLoginError').classList.add('hidden');
    document.getElementById('devPassword').value = '';
  });

  document.getElementById('devSignInBtn').addEventListener('click', async () => {
    const email    = document.getElementById('devEmail').value.trim();
    const password = document.getElementById('devPassword').value;
    const errEl    = document.getElementById('devLoginError');
    const btn      = document.getElementById('devSignInBtn');

    errEl.classList.add('hidden');
    btn.disabled = true; btn.textContent = 'Entering…';

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = 'Enter Dev Mode →';

    if (error || !data.user) {
      errEl.textContent = 'Incorrect credentials.';
      errEl.classList.remove('hidden'); return;
    }
    if (data.user.user_metadata?.role !== 'dev') {
      errEl.textContent = 'This account does not have dev access.';
      errEl.classList.remove('hidden');
      await sb.auth.signOut(); return;
    }

    document.getElementById('devPassword').value = '';
    document.getElementById('devLoginModal').classList.add('hidden');

    await loadAppState();
    isHSOMode = true;
    isDevMode = true;
    aiHistory = [];
    hasShownGreeting = false;
    renderAdminCoachList();
    document.getElementById('googleClientIdInput').value = _cache.googleClientId;
    document.getElementById('headerActions').innerHTML =
      `<span class="header-role-badge" style="background:#fef3c7;color:#92400e;border:1px solid #d97706;">🛠 Dev Mode</span>`;
    showDevToolbar();
    navigate('adminView');
  });

  document.getElementById('devSwitchViewBtn').addEventListener('click', devSwitchView);

  document.getElementById('devExitBtn').addEventListener('click', async () => {
    isDevMode = false;
    isHSOMode = false;
    currentCoach = null;
    hideDevToolbar();
    await sb.auth.signOut();
    showView('landingView');
    document.getElementById('headerActions').innerHTML = '';
  });

  document.getElementById('devCoachSelect').addEventListener('change', () => {
    const sel = document.getElementById('devCoachSelect');
    document.getElementById('devSwitchViewBtn').textContent =
      sel.value ? `View as ${(_cache.coaches||[]).find(c=>c.id===sel.value)?.name||'Coach'} →` : 'HSO View →';
  });

  // Admin tabs
  document.querySelectorAll('.admin-nav-item').forEach(t =>
    t.addEventListener('click', () => switchAdminTab(t.dataset.atab)));

  // Admin – add coach
  document.getElementById('addCoachForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name     = document.getElementById('newCoachName').value.trim();
    const branches = document.getElementById('newCoachBranches').value.trim();
    const email    = document.getElementById('newCoachEmail').value.trim();
    const password = document.getElementById('newCoachTempPassword').value;
    if (!name || !email || !password) return;

    const btn = document.getElementById('addCoachBtn');
    btn.disabled = true; btn.textContent = 'Adding…';

    try {
      await dbAddCoach(name, branches, email, password);
      document.getElementById('addCoachForm').reset();
      renderAdminCoachList();
      showToast(`"${name}" added — share their credentials.`);
    } catch (err) {
      showToast(err.message || 'Failed to add coach.');
    } finally {
      btn.disabled = false; btn.textContent = 'Add Coach';
    }
  });

  // Admin – change password
  document.getElementById('changePinForm').addEventListener('submit', async e => {
    e.preventDefault();
    const current = document.getElementById('currentPin').value;
    const next    = document.getElementById('newPin').value;
    const msgEl   = document.getElementById('pinChangeMsg');

    if (next.length < 6) {
      msgEl.textContent = 'New password must be at least 6 characters.';
      msgEl.classList.remove('hidden'); return;
    }

    const { data: { session } } = await sb.auth.getSession();
    const { error: verifyErr } = await sb.auth.signInWithPassword({
      email: session?.user?.email, password: current,
    });
    if (verifyErr) {
      msgEl.textContent = 'Current password is incorrect.';
      msgEl.classList.remove('hidden'); return;
    }

    const { error } = await sb.auth.updateUser({ password: next });
    if (error) {
      msgEl.textContent = error.message;
      msgEl.classList.remove('hidden'); return;
    }

    msgEl.classList.add('hidden');
    document.getElementById('changePinForm').reset();
    showToast('Password updated successfully.');
  });

  // Admin – Google Client ID
  document.getElementById('clientIdForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('googleClientIdInput').value.trim();
    await dbSaveSetting('google_client_id', id);
    showToast('Client ID saved.');
  });

  // Admin – download template
  document.getElementById('downloadTemplateBtn').addEventListener('click', downloadTemplate);

  // Admin – quarterly report
  document.getElementById('qrGenerateBtn').addEventListener('click', generateQuarterlyReport);

  // Admin – exit
  document.getElementById('exitAdminBtn').addEventListener('click', async () => {
    await sb.auth.signOut();
    isHSOMode = false;
    _cache = { coaches: [], scorecards: [], googleClientId: '' };
    aiHistory = [];
    navStack = [];
    document.getElementById('headerActions').innerHTML = '';
    showView('landingView');
  });

  // Coach Login
  document.getElementById('coachLoginBtn').addEventListener('click', async () => {
    const email    = document.getElementById('coachEmail').value.trim();
    const password = document.getElementById('coachPassword').value;
    const errEl    = document.getElementById('coachLoginError');
    const btn      = document.getElementById('coachLoginBtn');

    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      errEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Signing in…';
    errEl.classList.add('hidden');

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = 'Sign In →';

    if (error || !data.user) {
      errEl.textContent = 'Incorrect email or password.';
      errEl.classList.remove('hidden'); return;
    }
    if (data.user.user_metadata?.role === 'hso') {
      errEl.textContent = 'Please use the HSO Admin login instead.';
      errEl.classList.remove('hidden');
      await sb.auth.signOut(); return;
    }

    await loadAppState();
    const coach = _cache.coaches.find(c => c.userId === data.user.id);
    if (!coach) {
      errEl.textContent = 'No coach profile found. Contact your HSO.';
      errEl.classList.remove('hidden');
      await sb.auth.signOut(); return;
    }

    document.getElementById('coachPassword').value = '';
    currentCoach = coach;
    isHSOMode = false; aiHistory = []; hasShownGreeting = false;

    if (data.user.user_metadata?.must_change_password) {
      navigate('forcePasswordChangeView');
      return;
    }

    renderCoachHome();
    navigate('coachHomeView');
    setTimeout(() => showCoachGreeting(coach), 800);
  });

  document.getElementById('coachEmail').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('coachLoginBtn').click();
  });
  document.getElementById('coachPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('coachLoginBtn').click();
  });

  // Reset code flow — toggle between normal login and reset code entry
  document.getElementById('showResetCodeFormBtn').addEventListener('click', () => {
    document.getElementById('coachNormalLogin').classList.toggle('hidden');
    document.getElementById('coachResetCodeForm').classList.toggle('hidden');
  });
  document.getElementById('cancelResetCodeBtn').addEventListener('click', () => {
    document.getElementById('coachNormalLogin').classList.remove('hidden');
    document.getElementById('coachResetCodeForm').classList.add('hidden');
  });

  document.getElementById('submitResetCodeBtn').addEventListener('click', async () => {
    const email      = document.getElementById('resetCodeEmail').value.trim();
    const resetCode  = document.getElementById('resetCodeInput').value.trim().toUpperCase();
    const newPass    = document.getElementById('resetCodeNewPassword').value;
    const confirmPass= document.getElementById('resetCodeConfirmPassword').value;
    const errEl      = document.getElementById('resetCodeError');
    const btn        = document.getElementById('submitResetCodeBtn');

    errEl.classList.add('hidden');
    if (!email || !resetCode || !newPass) {
      errEl.textContent = 'All fields are required.'; errEl.classList.remove('hidden'); return;
    }
    if (newPass.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.remove('hidden'); return;
    }
    if (newPass !== confirmPass) {
      errEl.textContent = 'Passwords do not match.'; errEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Verifying…';

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_and_set_password', email, resetCode, newPassword: newPass }),
    });
    const result = await res.json();
    btn.disabled = false; btn.textContent = 'Set Password & Sign In →';

    if (!res.ok || result.error) {
      errEl.textContent = result.error || 'Verification failed.'; errEl.classList.remove('hidden'); return;
    }

    // Password updated — now sign them in automatically
    const { data, error } = await sb.auth.signInWithPassword({ email, password: newPass });
    if (error || !data.user) {
      errEl.textContent = 'Password set but sign-in failed. Please sign in normally.';
      errEl.classList.remove('hidden');
      document.getElementById('coachNormalLogin').classList.remove('hidden');
      document.getElementById('coachResetCodeForm').classList.add('hidden');
      return;
    }

    await loadAppState();
    const coach = _cache.coaches.find(c => c.userId === data.user.id);
    if (!coach) { await sb.auth.signOut(); return; }

    currentCoach = coach;
    isHSOMode = false; aiHistory = []; hasShownGreeting = false;
    renderCoachHome();
    navigate('coachHomeView');
    setTimeout(() => showCoachGreeting(coach), 800);
  });
  document.getElementById('backFromCoachSelect').addEventListener('click', goBack);

  // Period change: overwrite warning + carry-forward availability
  document.getElementById('entryPeriod').addEventListener('change', () => {
    const period = document.getElementById('entryPeriod').value;
    if (!period || !currentCoach) return;
    const store  = loadStore();
    const exists = store.scorecards.find(s => s.coachId === currentCoach.id && s.period === period);
    const warn   = document.getElementById('overwriteWarn');
    const btn    = document.getElementById('generateBtn');
    if (exists) {
      document.getElementById('overwritePeriod').textContent = formatPeriod(period);
      warn.classList.remove('hidden');
      btn.textContent = 'Update Scorecard →';
    } else {
      warn.classList.add('hidden');
      btn.textContent = 'Generate & Save →';
    }
    const hasPrev = store.scorecards.some(s => s.coachId === currentCoach.id && s.period < period);
    document.getElementById('carryForwardBtn').classList.toggle('hidden', !hasPrev);
    updateProjectedScore();
  });

  // Coach home
  document.getElementById('goDataEntryBtn').addEventListener('click', () => {
    renderManualEntryForm();
    prefillSalesTarget();
    const noteEl = document.getElementById('coachNoteInput');
    if (noteEl) noteEl.value = '';
    switchEntryMethod('manual');
    const now    = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('entryPeriod').value = period;
    document.getElementById('overwriteWarn').classList.add('hidden');
    document.getElementById('generateBtn').textContent = 'Generate & Save →';
    updateBreadcrumb('entryBreadcrumb', [
      { label: currentCoach.name, onclick: "goBack()" },
      { label: 'Data Entry' }
    ]);
    // Show carry-forward if a prior period exists
    const hasPrev = loadStore().scorecards.some(s => s.coachId === currentCoach.id && s.period < period);
    document.getElementById('carryForwardBtn').classList.toggle('hidden', !hasPrev);
    document.getElementById('entryPeriod').dispatchEvent(new Event('change'));
    navigate('manualEntryView');
  });
  document.getElementById('goPastEntriesBtn').addEventListener('click', () => {
    renderPastEntries();
    navigate('pastEntriesView');
  });
  document.getElementById('goCoachLeaderboardBtn').addEventListener('click', () => {
    renderCoachLeaderboard();
    navigate('coachLeaderboardView');
  });
  document.getElementById('backFromCoachLb').addEventListener('click', goBack);
  document.getElementById('changeUserBtn').addEventListener('click', async () => {
    await sb.auth.signOut();
    currentCoach = null;
    isHSOMode = false;
    _cache = { coaches: [], scorecards: [], googleClientId: '' };
    aiHistory = [];
    hasShownGreeting = false;
    navStack = [];
    document.getElementById('headerActions').innerHTML = '';
    document.getElementById('coachEmail').value = '';
    document.getElementById('coachPassword').value = '';
    showView('landingView');
  });

  // Data entry – projected score (delegated listener on the form container)
  document.getElementById('manualKpiForm').addEventListener('input', updateProjectedScore);

  // Data entry – carry-forward
  document.getElementById('carryForwardBtn').addEventListener('click', carryForwardFromLastPeriod);

  // Data entry – method toggle
  document.querySelectorAll('.method-btn').forEach(b =>
    b.addEventListener('click', () => switchEntryMethod(b.dataset.method)));

  // Leaderboard view toggle (Rankings / Heatmap)
  document.querySelectorAll('.lb-view-btn').forEach(b =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.lb-view-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const view = b.dataset.lbview;
      document.getElementById('leaderboardContent').classList.toggle('hidden', view !== 'table');
      document.getElementById('heatmapContent').classList.toggle('hidden', view !== 'heatmap');
      if (view === 'heatmap') renderHeatmap();
    }));

  // Data entry – generate
  document.getElementById('generateBtn').addEventListener('click', handleGenerateEntry);

  // Past entries back
  document.getElementById('backFromPast').addEventListener('click', goBack);
  document.getElementById('backFromEntry').addEventListener('click', goBack);

  // Results
  document.getElementById('backFromResults').addEventListener('click', goBack);
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('exportCsvBtn').addEventListener('click', () => exportResultsCSV(currentResultScorecard));

  // Period navigator
  document.getElementById('periodPrev').addEventListener('click', () => {
    if (currentScorecardIndex > 0) {
      currentScorecardIndex--;
      displayResults(currentCoachScorecards[currentScorecardIndex], true);
    }
  });
  document.getElementById('periodNext').addEventListener('click', () => {
    if (currentScorecardIndex < currentCoachScorecards.length - 1) {
      currentScorecardIndex++;
      displayResults(currentCoachScorecards[currentScorecardIndex], true);
    }
  });

  // Stats strip count-up
  (function () {
    function countUp(el, target, duration) {
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    }
    setTimeout(() => {
      document.querySelectorAll('.hero-stat-num').forEach(el => {
        const target = +el.textContent;
        el.textContent = '0';
        countUp(el, target, 1100);
      });
    }, 480);
  })();

  // Mouse-tracking spotlight on hero
  (function () {
    const heroView = document.getElementById('landingView');
    const spot     = heroView.querySelector('.hero-glow-spot');
    if (!spot) return;
    heroView.addEventListener('mousemove', e => {
      const r = heroView.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      spot.style.background = `radial-gradient(circle 500px at ${x}% ${y}%, rgba(21,128,61,.11) 0%, transparent 65%)`;
    });
    heroView.addEventListener('mouseleave', () => { spot.style.background = ''; });
  })();

  // Hero feature carousel
  (function () {
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots   = Array.from(document.querySelectorAll('.carousel-dot'));
    if (!slides.length) return;
    let current = 0;
    let timer;

    function goTo(i) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = i;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function startTimer() { timer = setInterval(() => goTo((current + 1) % slides.length), 3600); }
    function resetTimer()  { clearInterval(timer); startTimer(); }

    dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.slide); resetTimer(); }));
    startTimer();
  })();

  // AI Insights — Settings key management

  // AI textarea — Enter submits, Shift+Enter newline, auto-resize
  document.getElementById('aiQuestionInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAIQuestion(); }
  });
  document.getElementById('aiQuestionInput')?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // ── Executive Report ───────────────────────────────────────────────────────
  document.getElementById('execReportGenerateBtn').addEventListener('click', async () => {
    const btn     = document.getElementById('execReportGenerateBtn');
    const spinner = document.getElementById('execReportSpinner');
    const errEl   = document.getElementById('execReportError');
    const out     = document.getElementById('execReportOutput');

    btn.disabled = true;
    spinner.classList.remove('hidden');
    errEl.classList.add('hidden');
    out.innerHTML = '';

    try {
      const { data: { session } } = await sb.auth.getSession();
      const res = await fetch('/api/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        errEl.textContent = data.error || 'Failed to load report.';
        errEl.classList.remove('hidden');
        return;
      }
      window._lastReportData = data;
      out.innerHTML = renderExecReport(data);
    } catch (e) {
      errEl.textContent = e.message || 'Network error — please try again.';
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      spinner.classList.add('hidden');
    }
  });
});

// ── Coach Greeting Popup ──────────────────────────────────────────────────

function getWATGreeting() {
  const watHour = (new Date().getUTCHours() + 1) % 24;
  if (watHour >= 5  && watHour < 12) return 'Good morning';
  if (watHour >= 12 && watHour < 17) return 'Good afternoon';
  if (watHour >= 17 && watHour < 21) return 'Good evening';
  return 'Good evening';
}

function showGreetingPopup(title, bodyHTML) {
  const overlay = document.getElementById('greetingOverlay');
  if (!overlay) return;

  document.getElementById('greetingTitle').textContent = title;
  document.getElementById('greetingBody').innerHTML = bodyHTML;

  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('greeting--visible');

    const bar = document.getElementById('greetingProgress');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.transition = 'width 12s linear';
        bar.style.width = '0%';
      }, 50);
    }
  }, 30);

  const timer = setTimeout(dismissGreeting, 12500);
  overlay.addEventListener('click', () => { clearTimeout(timer); dismissGreeting(); }, { once: true });
}

function showCoachGreeting(coach) {
  if (hasShownGreeting) return;
  hasShownGreeting = true;

  const firstName = coach.name.split(' ')[0];
  const greeting  = getWATGreeting();

  showGreetingPopup(
    `${greeting}, ${firstName}.`,
    `I'm your <strong>Foodco Virtual Assistant</strong> — built specifically for this platform and ` +
    `trained on Foodco's operational processes, KPI framework, and performance standards. ` +
    `Whether you need help understanding your scorecard, analysing your trends, or preparing for ` +
    `a quarterly review, I'm always available. Tap the <strong>AI</strong> button at the bottom ` +
    `right of your screen anytime to get started.`
  );
}

function showHSOGreeting() {
  if (hasShownGreeting) return;
  hasShownGreeting = true;

  const greeting = getWATGreeting();

  showGreetingPopup(
    `${greeting}, HSO Admin.`,
    `Welcome to your <strong>Foodco Scorecard Dashboard</strong>. You have full visibility across all ` +
    `Area Coaches and their performance data. Use the <strong>AI</strong> button at the bottom right ` +
    `to analyse trends, compare coach performance, generate insights, or prepare for quarterly reviews. ` +
    `All data is scoped to give you the complete picture.`
  );
}

function dismissGreeting() {
  const overlay = document.getElementById('greetingOverlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  overlay.classList.add('greeting--out');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('greeting--visible', 'greeting--out');
  }, 380);
}

// ── AI INSIGHTS ───────────────────────────────────────────────────────────

let aiHistory = [];

function buildDataContext(scopeCoachId = null) {
  const store = loadStore();
  const now   = new Date();
  const month = now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

  let ctx = `PLATFORM: Foodco Area Coach Performance Scorecard (internal tool)\nREPORT DATE: ${month}\n\n`;

  ctx += `SCORING SYSTEM (9 KPIs, 100 pts total):\n`;
  KPI_CONFIG.forEach(k => {
    ctx += `- ${k.label} (${k.pts}pts): ` + k.bands.map(b => `${b.label}=${b.score}`).join(' | ') + '\n';
  });

  ctx += `\nRATING TIERS:\n90-100=Outstanding (Promotion Ready)\n80-89=Strong Performer (High Potential)\n70-79=Solid (Meets Expectations)\n60-69=Needs Improvement (Coaching Required)\n<60=Underperforming (Immediate Intervention)\n\n`;

  const coachesToShow = scopeCoachId
    ? store.coaches.filter(c => c.id === scopeCoachId)
    : store.coaches;

  if (!coachesToShow.length) { ctx += 'No coaches registered yet.\n'; return ctx; }

  ctx += `COACHES & SCORECARD HISTORY:\n`;
  coachesToShow.forEach(coach => {
    const scorecards = store.scorecards
      .filter(s => s.coachId === coach.id)
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, 12);

    ctx += `\n[${coach.name} | Branches: ${coach.branches || 'N/A'}]\n`;
    if (!scorecards.length) { ctx += '  No scorecards submitted.\n'; return; }

    scorecards.forEach(sc => {
      const rLabel = sc.rating?.label || getRating(parseFloat(sc.total)).label;
      const rowStr = sc.rows
        ? sc.rows.map(r => `${r.label.split(' ')[0].replace(/[^A-Za-z]/g,'')}:${r.score}/${r.weight}`).join(', ')
        : '';
      ctx += `  ${sc.period}: ${parseFloat(sc.total).toFixed(1)}/100 (${rLabel}) | ${rowStr}\n`;
      if (sc.coachNote) ctx += `    Coach note: "${sc.coachNote.substring(0, 100)}"\n`;
      if (sc.hsoNotes)  ctx += `    HSO note: "${sc.hsoNotes.substring(0, 100)}"\n`;
    });
  });

  return ctx;
}

function updateAISuggestions() {
  const sugEl = document.getElementById('aiSuggestions');
  if (!sugEl) return;
  if (isHSOMode) {
    sugEl.innerHTML = `
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">Who is the top performer?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">Which KPI needs most attention?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">Who is at risk of underperforming?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">Summarise all coach scores</button>`;
  } else {
    sugEl.innerHTML = `
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">How did I perform last month?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">What are my weakest KPIs?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">What's my score trend?</button>
      <button class="ai-suggestion-chip" onclick="useAISuggestion(this)">What should I focus on next month?</button>`;
  }
}

function toggleAIPanel() {
  const panel = document.getElementById('aiChatPanel');
  const isOpen = !panel.classList.contains('ai-panel--closed');
  if (isOpen) {
    panel.classList.add('ai-panel--closed');
  } else {
    panel.classList.remove('ai-panel--closed');
    if (!aiHistory.length) initAIPanel();
    setTimeout(() => document.getElementById('aiQuestionInput')?.focus(), 80);
  }
}

function initAIPanel() {
  const msgEl = document.getElementById('aiMessages');
  msgEl.innerHTML = '';
  aiHistory = [];

  document.getElementById('aiSuggestions')?.classList.remove('hidden');
  document.getElementById('aiInputRow')?.classList.remove('hidden');
  updateAISuggestions();

  const store = loadStore();
  if (isHSOMode) {
    const coachCount = store.coaches.length;
    const scCount    = store.scorecards.length;
    appendAIMessage('ai',
      `Hi! I have access to **${scCount} scorecard${scCount !== 1 ? 's' : ''}** across **${coachCount} coach${coachCount !== 1 ? 'es' : ''}**. Ask me anything about performance, trends, or team insights.`
    );
  } else {
    const myCount = store.scorecards.filter(s => s.coachId === currentCoach?.id).length;
    const first   = currentCoach?.name?.split(' ')[0] || 'Coach';
    appendAIMessage('ai',
      `Hi ${first}! I have access to your **${myCount} scorecard${myCount !== 1 ? 's' : ''}**. Ask me anything about your own performance, trends, or which KPIs to focus on.`
    );
  }
}


function appendAIMessage(role, text) {
  const msgEl = document.getElementById('aiMessages');
  const div   = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;

  // Simple markdown: **bold**, bullet lines, newlines
  const safe = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines = safe.split('\n');
  let html = '', inList = false;
  lines.forEach(line => {
    const bullet = line.match(/^[-•*]\s+(.+)/);
    if (bullet) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${bullet[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += formatted ? `<p>${formatted}</p>` : '<br>';
    }
  });
  if (inList) html += '</ul>';

  div.innerHTML = `<div class="ai-msg-bubble">${html}</div>`;
  msgEl.appendChild(div);
  msgEl.scrollTop = msgEl.scrollHeight;
}

function showAITyping() {
  const msgEl = document.getElementById('aiMessages');
  const div   = document.createElement('div');
  div.className = 'ai-msg ai-msg--ai';
  div.id = 'aiTypingIndicator';
  div.innerHTML = `<div class="ai-msg-bubble ai-typing"><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span></div>`;
  msgEl.appendChild(div);
  msgEl.scrollTop = msgEl.scrollHeight;
}

function removeAITyping() { document.getElementById('aiTypingIndicator')?.remove(); }

async function submitAIQuestion() {
  const input    = document.getElementById('aiQuestionInput');
  const question = input?.value.trim();
  if (!question) return;

  document.getElementById('aiSuggestions').classList.add('hidden');
  const sendBtn  = document.getElementById('aiSendBtn');
  input.value    = '';
  input.style.height = 'auto';
  input.disabled = true;
  sendBtn.disabled = true;

  appendAIMessage('user', question);
  showAITyping();

  aiHistory.push({ role: 'user', content: question });
  if (aiHistory.length > 20) aiHistory = aiHistory.slice(-20);

  const scopeId = isHSOMode ? null : currentCoach?.id;
  const roleCtx = isHSOMode
    ? 'You have full access to all coach and scorecard data provided below.'
    : `You only have access to the data of the coach using this tool — ${currentCoach?.name || 'the current coach'}. Do not speculate about other coaches.`;
  const systemPrompt =
    `You are an AI assistant for the Foodco Area Coach Performance Scorecard platform. ${roleCtx} Answer concisely and directly — use bullet points and specific numbers where helpful. This is an internal business tool.\n\n` +
    buildDataContext(scopeId);

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...aiHistory,
        ],
      }),
    });

    const data = await res.json();
    removeAITyping();

    if (!res.ok) {
      const msg = data.error?.message || `API error (${res.status})`;
      appendAIMessage('ai', `⚠ ${msg}`);
      aiHistory.pop();
    } else {
      const reply = data.choices[0].message.content;
      aiHistory.push({ role: 'assistant', content: reply });
      appendAIMessage('ai', reply);
    }
  } catch {
    removeAITyping();
    appendAIMessage('ai', '⚠ Network error — check your connection and try again.');
    aiHistory.pop();
  } finally {
    input.disabled  = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function useAISuggestion(el) {
  const input = document.getElementById('aiQuestionInput');
  if (input) { input.value = el.textContent.trim(); submitAIQuestion(); }
}

// ── Executive Report Renderer ─────────────────────────────────────────────

// ── PPTX Download ─────────────────────────────────────────────────────────────
window.downloadAsPptx = async function() {
  const reportData = window._lastReportData;
  if (!reportData) { alert('Please generate the report first.'); return; }

  const btn = document.getElementById('dlPptxBtn');
  if (btn) { btn.textContent = '⏳ Building…'; btn.disabled = true; }

  try {
    if (typeof PptxGenJS === 'undefined') {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
        sc.onload = res; sc.onerror = rej;
        document.head.appendChild(sc);
      });
    }

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'FoodCo HSO'; pptx.company = 'FoodCo Nigeria Limited';

    const C = { green:'166534', mgreen:'15803d', orange:'ea580c', lgreenBg:'F0FDF4',
                 lorangeBg:'FFF7ED', white:'FFFFFF', gray:'6B7280', dkgray:'374151',
                 great:'166534', stable:'15803d', weak:'D97706', concern:'DC2626',
                 greatBg:'DCFCE7', weakBg:'FEF3C7', concernBg:'FEE2E2' };
    const W = 13.33, H = 7.5;

    function _pN(v) {
      if (v == null || v === '') return null;
      const n = parseFloat(String(v).replace(/[,\s₦NB]/g,'').replace(/%$/,''));
      return isNaN(n) ? null : n;
    }
    function _normPct(v) { const n=_pN(v); return n===null?null:(n<2?n*100:n); }
    function _fmtRaw(v) {
      const n=_pN(v); if(n===null) return '—';
      const abs=Math.abs(n), s=n<0?'-':'';
      if(abs>=1e9) return `${s}N${(abs/1e9).toFixed(2)}B`;
      if(abs>=1e6) return `${s}N${(abs/1e6).toFixed(1)}M`;
      if(abs>=1e3) return `${s}N${Math.round(abs).toLocaleString()}`;
      return `${s}N${abs.toFixed(0)}`;
    }
    function _fmtBig(v) {
      const n=_pN(v); if(n===null) return '—';
      if(Math.abs(n)>=1000) return `N${(n/1000).toFixed(2)}B`;
      return `N${n.toFixed(1)}M`;
    }
    function _statusColor(v) {
      const n=_normPct(v);
      if(n===null) return [C.gray,'F9FAFB'];
      if(n>=100) return [C.great, C.greatBg];
      if(n>=90)  return [C.stable, C.greatBg];
      if(n>=80)  return [C.weak, C.weakBg];
      return [C.concern, C.concernBg];
    }
    function _statusLabel(v) {
      const n=_normPct(v); if(n===null) return '—';
      return n>=100?'GREAT':n>=90?'STABLE':n>=80?'WEAK':'CONCERNING';
    }
    // ── Design system constants ───────────────────────────────────────────────
    // Table helpers: 13pt Liter headers, 12pt Quattrocento Sans body
    // Minimum font sizes chosen for legibility from the back of a boardroom
    function _hdr(cols, bg=C.green) {
      return cols.map(t=>({ text:String(t||''), options:{bold:true,color:C.white,fill:{color:bg},align:'center',valign:'middle',fontSize:13,fontFace:'Liter',border:{pt:0.5,color:'FFFFFF'}} }));
    }
    function _cell(t, opts={}) { return { text:t==null?'—':String(t), options:{fontSize:12,fontFace:'Quattrocento Sans',valign:'middle',...opts} }; }
    function _numCell(t, opts={}) { return _cell(t,{align:'right',...opts}); }
    function _totRow(cols) { return cols.map((t,i)=>_cell(t==null?'—':String(t),{bold:true,fontSize:12,fontFace:'Quattrocento Sans',align:i>0?'right':'left',fill:{color:C.greatBg}})); }

    const _TABS  = ['REVENUE','GROWTH','OUTLETS','CATEGORY','COMPARISON'];
    const _TAB_W = W / _TABS.length;
    const DG_ALL = '00843D';

    // Shared tab-bar header for all body slides
    function addTabHeader(slide, activeTab, title, pgNum) {
      slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:0.62,fill:{color:C.green}});
      _TABS.forEach((t,i)=>{
        const act = t===activeTab;
        slide.addText(t,{x:i*_TAB_W,y:0,w:_TAB_W,h:0.62,fontSize:16,color:C.white,align:'center',valign:'middle',fontFace:'Liter',bold:act});
        if(act) slide.addShape(pptx.ShapeType.rect,{x:i*_TAB_W,y:0.58,w:_TAB_W,h:0.05,fill:{color:C.orange}});
      });
      slide.addShape(pptx.ShapeType.rect,{x:0,y:0.62,w:W,h:0.06,fill:{color:C.orange}});
      slide.addText(title,{x:0.28,y:0.76,w:10.5,h:0.56,fontSize:32,bold:false,color:DG_ALL,fontFace:'Liter',valign:'middle'});
      slide.addShape(pptx.ShapeType.rect,{x:0.28,y:1.28,w:1.0,h:0.05,fill:{color:C.orange}});
      if(logoDataUrl) slide.addImage({data:logoDataUrl,x:11.2,y:0.72,w:1.9,h:0.54});
      slide.addText(String(pgNum).padStart(2,'0'),{x:W-0.55,y:H-0.38,w:0.45,h:0.3,fontSize:13,color:C.gray,align:'right',fontFace:'Liter'});
    }

    // Section sub-label with orange accent bar
    function sectionLabel(slide, text, x, y, w, orange=false) {
      slide.addText(text,{x,y,w,h:0.36,fontSize:14,bold:true,color:orange?C.orange:C.green,fontFace:'Liter'});
      slide.addShape(pptx.ShapeType.rect,{x,y:y+0.34,w:0.5,h:0.04,fill:{color:C.orange}});
    }

    // KPI hero box — Quattrocento Sans 12 label, Liter 56 bold value
    // h should be ≥ 1.7 to give the large value room to breathe
    function kpiBox(slide, x, y, w, h, label, val, valColor, bg, borderColor) {
      slide.addShape(pptx.ShapeType.rect,{x,y,w,h,fill:{color:bg},line:{color:borderColor,pt:2}});
      slide.addText(label,{x:x+0.15,y:y+0.14,w:w-0.3,h:0.32,fontSize:12,color:C.gray,bold:false,fontFace:'Quattrocento Sans'});
      slide.addText(val,{x:x+0.08,y:y+0.46,w:w-0.16,h:h-0.62,fontSize:56,bold:true,color:valColor,align:'center',valign:'middle',fontFace:'Liter'});
    }

    // ── Parse data ───────────────────────────────────────────────────────────
    const ytdAll   = (reportData.businessYTD||[]).filter(r=>r?.[0]);
    const ytdMonths= ytdAll.filter(r=>!['MONTH','YTD','TOTAL'].includes((r[0]||'').toUpperCase()));
    const ytdRowD  = ytdAll.find(r=>(r[0]||'').toUpperCase()==='YTD');
    const latestM  = ytdMonths[ytdMonths.length-1];
    const label    = (latestM?.[0]||'JUNE').toUpperCase();
    const _MFULL   = {JAN:'January',FEB:'February',MAR:'March',APR:'April',MAY:'May',JUN:'June',JUL:'July',AUG:'August',SEP:'September',OCT:'October',NOV:'November',DEC:'December'};
    const _MNUM    = {JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
    const _MNAMES  = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
    const fullMonth = _MFULL[label] || label;
    const repMNum   = _MNUM[label] || 6;
    const presMNum  = repMNum === 12 ? 1 : repMNum + 1;
    const presYear  = repMNum === 12 ? 2027 : 2026;
    const presDate  = `${_MNAMES[presMNum]} ${presYear}`;

    const rov = reportData.revenueOverview||[];
    // Search all columns (not just slice(1)) in case col A contains the month label
    let rovHdr = rov.find(r=>r?.slice(1).some(c=>/jan|feb|mar|apr|may|jun/i.test(String(c))));
    if(!rovHdr) rovHdr = rov.find(r=>r?.some(c=>/jan|feb|mar|apr|may|jun/i.test(String(c))));
    // Build month cols list; if found via col-0 search, col 0 may be a month itself
    const rovCols = rovHdr ? rovHdr.filter(c=>c&&/jan|feb|mar|apr|may|jun/i.test(String(c))) : [];
    // Map rovCols to their position in rovHdr for data row indexing
    const rovColIdxMap = rovHdr ? rovCols.map(c=>rovHdr.indexOf(c)) : [];
    let coreBizRows=[],otherBizRows=[],inCore=false,inOther=false;
    for(const r of rov){
      if(!r?.[0]) continue;
      if(/core business/i.test(r[0])){inCore=true;inOther=false;continue;}
      if(/other.*business|other.*key/i.test(r[0])){inOther=true;inCore=false;continue;}
      if(inCore&&r.length>=2) coreBizRows.push(r);
      if(inOther&&r.length>=2) otherBizRows.push(r);
    }

    const rg = reportData.revenueGrowth||[];
    const rgRows = rg.filter(r=>r?.[0]&&!/month|period|growth|header/i.test(r[0])&&r.length>=4);
    const latestRg = rgRows.filter(r=>!/ytd|same/i.test(r[0])).slice(-1)[0];
    const ytdRg    = rgRows.find(r=>/biz ytd/i.test(r[0]));
    const ssRg     = rgRows.find(r=>/same.store/i.test(r[0]));

    const allOutlets = (reportData.outletsPerf||[]).filter(r=>r?.[0]&&r[0]!=='OUTLET');
    const globalOutlet = allOutlets.find(r=>/global/i.test(r[0]));
    const outletRows_d = allOutlets.filter(r=>!/global/i.test(r[0]));

    const regions_d = (reportData.regionPerf||[]).filter(r=>r?.[0]&&!/region|june|performance/i.test(r[0]));

    const areaRaw_d = reportData.areaPerf||[];
    const areaGrouped_d = [];
    for(const r of areaRaw_d){
      if(!r?.[0]&&!r?.[1]) continue;
      if(/^(area leader|leader|outlet|june 2026|performance)$/i.test((r[0]||'').trim())) continue;
      if(!r[1]||r.length<4) continue;
      areaGrouped_d.push({leader:r[0]||'',outlet:r[1],target:r[2],actual:r[3],diff:r[4],pct:r[5],isTotal:/total/i.test(r[1])});
    }

    const catYTD_d = reportData.categorySalesYTD||[];
    const catYTDHdr_d = catYTD_d.find(r=>r?.slice(1).some(c=>/jan|feb|mar/i.test(String(c))));
    const catYTDCols_d = catYTDHdr_d ? catYTDHdr_d.slice(1).filter(Boolean) : [];
    const catYTDRows_d = catYTD_d.filter(r=>r?.[0]&&!/dept|category|sales/i.test(r[0])&&r.length>=2);

    const catLat_d = reportData.categorySalesLatest||[];
    const catLatHdr_d = catLat_d.find(r=>/dept|category/i.test(r[0]));
    const catLatCols_d = catLatHdr_d ? catLatHdr_d.slice(1).filter(Boolean) : [];
    const catLatRows_d = catLat_d.filter(r=>r?.[0]&&!/dept|category/i.test(r[0])&&r.length>=3);

    const yoy_d = reportData.yoy||[];
    const smIdx = yoy_d.findIndex(r=>r?.some(c=>/sm.*3f|sm\+3f/i.test(String(c))));
    const yoySec = smIdx>=0 ? yoy_d.slice(smIdx) : yoy_d;
    const yoyRows_d = yoySec.filter(r=>{
      if(!r?.[0]) return false;
      if(/outlet|store|total|same.store|supermarket|restaurant|sm\+3f/i.test(r[0])) return false;
      return r.length>=6;
    });
    const yoyGrow = yoyRows_d.filter(r=>_pN(r[r.length-1])>=0).sort((a,b)=>(_pN(b[b.length-1])||0)-(_pN(a[a.length-1])||0));
    const yoyDec  = yoyRows_d.filter(r=>_pN(r[r.length-1])<0).sort((a,b)=>(_pN(a[a.length-1])||0)-(_pN(b[b.length-1])||0));

    const util_d = (reportData.utility||[]).filter(r=>r?.[0]&&!/desc|header/i.test(r[0]));

    // Top 5 Stores — parse paired (store, value) columns per month
    const topStores_d = reportData.topStores||[];
    const tsHdrIdx = topStores_d.findIndex(r=>r?.some(c=>/jan|feb|mar|apr|may|jun/i.test(String(c))));
    const tsMthCols = tsHdrIdx>=0 ? topStores_d[tsHdrIdx] : [];
    // Month column pairs: find index of each month label; next col is value
    function _tsMthPair(m){ const i=tsMthCols.findIndex(c=>new RegExp(m,'i').test(String(c))); return i>=0?[i,i+1]:[-1,-1]; }
    const [tsJanN,tsJanV]=_tsMthPair('jan'),   [tsFebN,tsFebV]=_tsMthPair('feb');
    const [tsMarN,tsMarV]=_tsMthPair('mar'),    [tsAprN,tsAprV]=_tsMthPair('apr');
    const [tsMayN,tsMayV]=_tsMthPair('may'),    [tsJunN,tsJunV]=_tsMthPair('jun');
    const tsRankRows = topStores_d.filter(r=>r?.[0]&&/^#?\d+$/i.test(String(r[0]).trim())).slice(0,5);
    const tsTotalRow = topStores_d.find(r=>/total/i.test(String(r?.[0])));
    // June-only breakout: store+value pairs where june col exists
    const tsJunBreakout = tsRankRows.map(r=>({store:tsJunN>=0?String(r[tsJunN]||'—'):'—', val:tsJunV>=0?String(r[tsJunV]||'—'):'—'}));

    // Weekly Sales — week rows and stock availability rows
    const weekly_d = reportData.weeklySales||[];
    const weekRows_d = weekly_d.filter(r=>r?.[0]&&/week|wk\s*\d/i.test(String(r[0])));
    const stockRows_d = weekly_d.filter(r=>r?.[0]&&!/week|wk|total|stock|header/i.test(String(r[0]))&&r.length>=3);
    const stockHdrIdx_d = weekly_d.findIndex(r=>/w1|week.*1|wk.*1/i.test(String(r?.[1]||'')));
    const stockHdrCols_d = stockHdrIdx_d>=0 ? weekly_d[stockHdrIdx_d].slice(1).filter(Boolean) : [];

    // Departmental split from revenue overview for slide 14
    const smGrow_d  = coreBizRows.find(r=>/supermarket|sm\b/i.test(r[0]));
    const rstGrow_d = coreBizRows.find(r=>/restaurant|rst|3f/i.test(r[0]));
    // Latest June values for SM/Restaurant
    const smJunV  = smGrow_d  ? _fmtBig(smGrow_d [smGrow_d .length-1]) : null;
    const rstJunV = rstGrow_d ? _fmtBig(rstGrow_d[rstGrow_d.length-1]) : null;

    // ── Logo loader (white-bg removal via canvas) ──────────────────────────────
    const logoDataUrl = await (async () => {
      try {
        const res = await fetch('./foodco-logo.png');
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise(resolve => {
          const img = new Image();
          const burl = URL.createObjectURL(blob);
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const id = ctx.getImageData(0, 0, c.width, c.height);
            const px = id.data;
            for (let i = 0; i < px.length; i += 4) {
              if (px[i] > 235 && px[i+1] > 235 && px[i+2] > 235) px[i+3] = 0;
            }
            ctx.putImageData(id, 0, 0);
            URL.revokeObjectURL(burl);
            resolve(c.toDataURL('image/png'));
          };
          img.onerror = () => { URL.revokeObjectURL(burl); resolve(null); };
          img.src = burl;
        });
      } catch { return null; }
    })();

    // ── SLIDE 1: Cover ────────────────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      // 1. Rich dark green base
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:'0D3318'}});
      // 2. Black overlay — creates the dramatic dark effect like the original photo
      //    transparency:45 = 55% opaque black on top of dark green
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:'000000',transparency:45}});
      // 3. Thin orange bar at very bottom (brand accent)
      s.addShape(pptx.ShapeType.rect,{x:0,y:H-0.07,w:W,h:0.07,fill:{color:C.orange}});

      // 4. Logo — original displayed at ~3:1 ratio but intentionally stretched tall for presence
      //    Scaled from 17.78×10 original, then height boosted to match original visual weight
      const lw=6.5, lh=4.4, lx=(W-6.5)/2, ly=0.1;
      // Thin green accent line above logo
      s.addShape(pptx.ShapeType.rect,{x:3.5,y:ly-0.16,w:6.33,h:0.04,fill:{color:'4ade80'}});
      if (logoDataUrl) {
        s.addImage({data:logoDataUrl, x:lx, y:ly, w:lw, h:lh});
      }
      // Thin green line below logo
      s.addShape(pptx.ShapeType.rect,{x:3.5,y:ly+lh+0.08,w:6.33,h:0.04,fill:{color:'4ade80'}});

      // 5. Title — Liter 52 Bold
      s.addText(`${fullMonth.toUpperCase()} 2026 SALES REPORT`,{
        x:0.3,y:ly+lh+0.18,w:W-0.6,h:0.88,
        fontSize:52,bold:true,color:C.white,align:'center',fontFace:'Liter'});
      // 6. Subtitle — Liter 24
      s.addText('FOODCO NIGERIA',{
        x:0.5,y:ly+lh+1.08,w:W-1,h:0.42,
        fontSize:24,color:'AADDB0',align:'center',fontFace:'Liter'});
      // 7. Thin divider below subtitle
      s.addShape(pptx.ShapeType.rect,{x:3.5,y:ly+lh+1.57,w:6.33,h:0.04,fill:{color:'6B8F72'}});
      // 8. Presented by Ayodele Adio — Quattrocento Sans 20, name bold
      s.addText([{text:'Presented by ',options:{bold:false}},{text:'Ayodele Adio',options:{bold:true}}],{
        x:0.5,y:ly+lh+1.67,w:W-1,h:0.44,
        fontSize:20,color:C.white,align:'center',fontFace:'Quattrocento Sans'});
      // 9. Head, Sales Operations — Quattrocento Sans 20
      s.addText('Head, Sales Operations',{
        x:0.5,y:ly+lh+2.13,w:W-1,h:0.44,
        fontSize:20,color:'AADDB0',align:'center',fontFace:'Quattrocento Sans'});
      // 10. Date — Quattrocento Sans 16
      s.addText(presDate,{
        x:0.5,y:ly+lh+2.6,w:W-1,h:0.36,
        fontSize:16,color:'AADDB0',align:'center',fontFace:'Quattrocento Sans'});
    }

    // ── SLIDE 2: Executive Overview ───────────────────────────────────────────
    {
      const s = pptx.addSlide();
      // Tab header bar — full width green
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:0.62,fill:{color:C.green}});
      const tabs=['REVENUE','GROWTH','OUTLETS','CATEGORY','COMPARISON'];
      const tabW=W/tabs.length;
      tabs.forEach((t,i)=>s.addText(t,{x:i*tabW,y:0,w:tabW,h:0.62,fontSize:16,color:C.white,align:'center',valign:'middle',fontFace:'Liter',bold:false}));
      // Orange accent line below header
      s.addShape(pptx.ShapeType.rect,{x:0,y:0.62,w:W,h:0.06,fill:{color:C.orange}});

      // Title — Liter 36 green
      s.addText('EXECUTIVE OVERVIEW',{x:0.28,y:0.78,w:9,h:0.7,fontSize:36,bold:false,color:C.green,fontFace:'Liter',valign:'middle'});
      // Orange underline below title
      s.addShape(pptx.ShapeType.rect,{x:0.28,y:1.38,w:1.2,h:0.05,fill:{color:C.orange}});
      // FoodCo logo small — top right
      if (logoDataUrl) s.addImage({data:logoDataUrl,x:11.2,y:0.72,w:1.9,h:0.54});
      // Page number
      s.addText('02',{x:W-0.5,y:H-0.4,w:0.4,h:0.35,fontSize:12,color:C.gray,align:'right',fontFace:'Liter'});

      // 4 quadrant cards
      const quads=[
        {n:'01',name:'REVENUE',  desc:'YTD Revenue Performance, Core Business Overview, and Monthly Revenue Trends across all business lines',col:C.green, bg:'F0FDF4'},
        {n:'02',name:'GROWTH',   desc:'Period Growth Analysis, Year-over-Year comparisons, and Same Store performance metrics',              col:C.orange,bg:'FFF7ED'},
        {n:'03',name:'OUTLETS',  desc:'Outlet Performance, Regional Analysis, Area Leaders, and Top 5 Store Rankings',                       col:C.green, bg:'F0FDF4'},
        {n:'04',name:'CATEGORY', desc:'Category Sales YTD, June Category Performance, Target Achievement, and Weekly Analysis',              col:C.orange,bg:'FFF7ED'},
      ];
      const cw=6.34, ch=2.82, gap=0.15, mx=0.25, startY=1.52;
      quads.forEach((q,i)=>{
        const cx=mx+(i%2)*(cw+gap), cy=startY+Math.floor(i/2)*(ch+gap);
        // Card background
        s.addShape(pptx.ShapeType.rect,{x:cx,y:cy,w:cw,h:ch,fill:{color:q.bg},line:{color:q.bg,pt:0}});
        // Left colour border
        s.addShape(pptx.ShapeType.rect,{x:cx,y:cy,w:0.07,h:ch,fill:{color:q.col}});
        // Number — Liter 48
        s.addText(q.n,{x:cx+0.18,y:cy+0.1,w:cw-0.28,h:0.72,fontSize:48,color:q.col,fontFace:'Liter',bold:false});
        // Topic name — Liter 24 bold
        s.addText(q.name,{x:cx+0.18,y:cy+0.82,w:cw-0.28,h:0.42,fontSize:24,bold:true,color:q.col,fontFace:'Liter'});
        // Description — Quattrocento Sans 18
        s.addText(q.desc,{x:cx+0.18,y:cy+1.3,w:cw-0.28,h:1.4,fontSize:18,color:C.dkgray,fontFace:'Quattrocento Sans',wrap:true,valign:'top'});
      });
    }

    // ── SLIDE 3: Revenue ───────────────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      // Tab header — REVENUE is active (bold)
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:0.62,fill:{color:C.green}});
      ['REVENUE','GROWTH','OUTLETS','CATEGORY','COMPARISON'].forEach((t,i)=>{
        const tw=W/5;
        s.addText(t,{x:i*tw,y:0,w:tw,h:0.62,fontSize:16,color:C.white,align:'center',valign:'middle',fontFace:'Liter',bold:t==='REVENUE'});
      });
      s.addShape(pptx.ShapeType.rect,{x:0,y:0.62,w:W,h:0.06,fill:{color:C.orange}});

      // Derive monthly revenue metrics
      // businessYTD stores values in BILLIONS (3.28 = N3.28B), not millions
      const revMs  = ytdMonths.filter(r=>_pN(r[1])!==null);
      const revVs  = revMs.map(r=>_pN(r[1]));   // already in billions
      const revLbs = revMs.map(r=>String(r[0]||'').toUpperCase());
      const ytdTot = _pN(ytdRowD?.[1]) ?? revVs.reduce((a,b)=>a+b,0);
      const lastV  = revVs[revVs.length-1];
      const prevV  = revVs[revVs.length-2];
      const peakI  = revVs.length ? revVs.indexOf(Math.max(...revVs)) : -1;
      const peakLb = peakI>=0 ? (_MFULL[revLbs[peakI]]||revLbs[peakI]||revLbs[peakI]) : '';
      const peakVV = peakI>=0 ? revVs[peakI] : null;
      const momR   = (prevV&&lastV) ? (lastV-prevV)/prevV*100 : null;
      const q1a    = revVs.slice(0,3).length ? revVs.slice(0,3).reduce((a,b)=>a+b,0)/3 : null;
      const q2a    = revVs.slice(3,6).length ? revVs.slice(3,6).reduce((a,b)=>a+b,0)/revVs.slice(3,6).length : null;
      const prevLb = _MFULL[revLbs[revVs.length-2]]||revLbs[revVs.length-2]||'Prev';
      // Formatter for values already in billions
      function _fmtBil(v){const n=_pN(v);if(n===null)return '—';return Math.abs(n)>=1?`N${Math.abs(n).toFixed(2)}B`:`N${(Math.abs(n)*1000).toFixed(0)}M`;}

      const DG='00843D'; // Dark Green RGB(0,132,61) — exact brand colour for slide 3 text

      // Dynamic title — Liter 36, not bold, Dark Green
      s.addText(`YTD Revenue ${_fmtBil(ytdTot)} with ${fullMonth} at ${_fmtBil(lastV)}`,{
        x:0.28,y:0.76,w:10.5,h:0.62,fontSize:36,bold:false,color:DG,fontFace:'Liter',valign:'middle'});
      s.addShape(pptx.ShapeType.rect,{x:0.28,y:1.32,w:1.1,h:0.05,fill:{color:C.orange}});
      if(logoDataUrl) s.addImage({data:logoDataUrl,x:11.2,y:0.72,w:1.9,h:0.54});
      s.addText('03',{x:W-0.5,y:H-0.4,w:0.4,h:0.35,fontSize:12,color:C.gray,align:'right',fontFace:'Liter'});

      // 4 KPI boxes — label: Quattrocento Sans 14, value: Liter 48 Bold
      const kpis3=[
        {lbl:`${fullMonth.toUpperCase()} REVENUE`, val:_fmtBil(lastV),                                   sz:48, col:C.green,  bg:C.lgreenBg,  bd:C.green},
        {lbl:'YTD REVENUE',                        val:_fmtBil(ytdTot),                                   sz:48, col:C.green,  bg:C.lgreenBg,  bd:C.green},
        // PEAK MONTH: split to 2 lines so "MAY N3.62B" fits at 48pt
        {lbl:'PEAK MONTH',                         val:`${(peakLb||'').toUpperCase()}\n${_fmtBil(peakVV)}`,sz:36, col:C.orange, bg:C.lorangeBg, bd:C.orange},
        {lbl:`${fullMonth.toUpperCase()} vs ${prevLb.toUpperCase()}`,
                                                   val:momR!=null?`${momR>=0?'+':''}${momR.toFixed(1)}%`:'—',
                                                                                                           sz:48, col:momR!=null&&momR>=0?C.green:C.concern, bg:'FEF2F2', bd:C.concern},
      ];
      const kbw=(W-0.56-0.3)/4;
      kpis3.forEach((k,i)=>{
        const kx=0.28+i*(kbw+0.1), ky=1.48;
        s.addShape(pptx.ShapeType.rect,{x:kx,y:ky,w:kbw,h:1.35,fill:{color:k.bg},line:{color:k.bd,pt:1.2}});
        // Label — Quattrocento Sans 14, not bold, grey
        s.addText(k.lbl,{x:kx+0.12,y:ky+0.1,w:kbw-0.24,h:0.34,fontSize:14,bold:false,color:C.gray,fontFace:'Quattrocento Sans'});
        // Value — Liter (size varies), bold, status colour
        s.addText(k.val,{x:kx+0.08,y:ky+0.44,w:kbw-0.16,h:0.82,fontSize:k.sz,bold:true,color:k.col,align:'center',valign:'middle',fontFace:'Liter'});
      });

      // Bar chart — left 70%
      if(revVs.length){
        s.addChart(pptx.ChartType.bar,[{name:'Revenue',labels:revLbs,values:revVs.map(v=>+(_pN(v)||0).toFixed(2))}],{
          x:0.28,y:2.95,w:8.8,h:4.28,
          barDir:'col', barGapWidthPct:55,
          chartColors:['166534'],
          catAxisLabelColor:'374151', catAxisLabelFontSize:11,
          valAxisLabelColor:'374151', valAxisLabelFontSize:10,
          showValue:true, dataLabelColor:'166534', dataLabelFontSize:11,
          showLegend:false,
          showTitle:true, title:'Monthly Revenue 2026 (Billion Naira)',
          titleFontSize:12, titleColor:'374151',
          valGridLine:{color:'F3F4F6',style:'solid'}, catGridLine:{style:'none'},
        });
      }

      // Key Insights panel — right 30%
      const ix=9.35, iw=3.7, iy0=2.95;
      // Heading — Liter 22, bold, Dark Green
      s.addText('KEY INSIGHTS',{x:ix,y:iy0,w:iw,h:0.46,fontSize:22,bold:true,color:DG,fontFace:'Liter'});
      const ins3=[
        peakLb&&peakVV ? [[{text:`${peakLb} 2026 `,options:{bold:true,color:DG,fontFace:'Quattrocento Sans'}},{text:'was the peak revenue month at ',options:{color:C.dkgray,fontFace:'Quattrocento Sans'}},{text:_fmtBil(peakVV),options:{bold:true,color:C.dkgray,fontFace:'Quattrocento Sans'}}]] : null,
        momR!=null      ? [[{text:fullMonth,options:{bold:true,color:C.concern,fontFace:'Quattrocento Sans'}},{text:` ${momR<0?'declined':'grew'} ${Math.abs(momR).toFixed(1)}% from ${prevLb} to `,options:{color:C.dkgray,fontFace:'Quattrocento Sans'}},{text:_fmtBil(lastV),options:{bold:true,color:C.dkgray,fontFace:'Quattrocento Sans'}}]] : null,
        q1a&&q2a        ? [[{text:'Q2 average: ',options:{color:C.dkgray,fontFace:'Quattrocento Sans'}},{text:_fmtBil(q2a),options:{bold:true,color:C.dkgray,fontFace:'Quattrocento Sans'}},{text:' vs Q1 average: ',options:{color:C.dkgray,fontFace:'Quattrocento Sans'}},{text:_fmtBil(q1a),options:{bold:true,color:C.dkgray,fontFace:'Quattrocento Sans'}}]] : null,
      ].filter(Boolean);
      // Body — Quattrocento Sans 28, mixed bold
      ins3.forEach((runs,i)=>{
        const iy=iy0+0.6+i*1.38;
        s.addShape(pptx.ShapeType.rect,{x:ix,y:iy,w:0.04,h:1.1,fill:{color:DG}});
        s.addText(runs[0],{x:ix+0.14,y:iy,w:iw-0.18,h:1.2,fontSize:28,wrap:true,valign:'top',fontFace:'Quattrocento Sans'});
      });
    }

    // ── SLIDE 4: Revenue Overview (Core Business) ─────────────────────────────
    if(coreBizRows.length||otherBizRows.length){
      const s = pptx.addSlide();

      // Dynamic title: latest-month Supermarket and Restaurant values
      const smRow  = coreBizRows.find(r=>/supermarket|sm\b/i.test(r[0]));
      const rstRow = coreBizRows.find(r=>/restaurant|rst\b/i.test(r[0]));
      const totRow = coreBizRows.find(r=>/total/i.test(r[0]));
      // Use June column index if found; fall back to second-to-last to avoid YTD column
      const _rovJunIdx = rovCols.findIndex(c=>/jun/i.test(String(c)));
      function _rovVal(row){
        if(!row) return null;
        if(_rovJunIdx>=0) return row[rovColIdxMap[_rovJunIdx]];
        // If no explicit header, assume last non-empty numeric column (skip trailing YTD if >2x last month)
        const nums=row.slice(1).map(_pN).filter(v=>v!==null);
        if(nums.length>=2){
          const lastTwo=[nums[nums.length-2],nums[nums.length-1]];
          // If last val is much larger than second-to-last, it's likely a YTD total
          if(lastTwo[1]>lastTwo[0]*3) return lastTwo[0];
        }
        return nums[nums.length-1]??null;
      }
      const smV  = _fmtBig(_rovVal(smRow));
      const rstV = _fmtBig(_rovVal(rstRow));
      const rovTitle = smV&&rstV ? `Core Business: Supermarket ${smV}, Restaurant ${rstV}` : 'REVENUE OVERVIEW';
      addTabHeader(s,'REVENUE',rovTitle,4);

      const lx=0.28, lw=7.0, rx=7.55, rw=5.5, tY=1.48;

      // ── Core Business (left panel) ───────────────────────────────────────────
      s.addText('CORE BUSINESS (Million)',{x:lx,y:tY,w:lw,h:0.28,fontSize:11,bold:true,color:C.orange,fontFace:'Liter'});
      if(rovCols.length){
        const mnCols=rovCols.slice(0,6);
        const mcw=+((lw-1.9)/mnCols.length).toFixed(2);
        const coreTbl=[
          _hdr(['Business',...mnCols]),
          ...coreBizRows.map(r=>{
            const isT=/total/i.test(r[0]);
            if(isT) return _totRow([r[0],...mnCols.map((_,ci)=>r[rovColIdxMap[ci]]||'—')]);
            return [_cell(r[0]),...mnCols.map((_,ci)=>{
              const isLast=ci===mnCols.length-1;
              return _numCell(r[rovColIdxMap[ci]]||'—',{bold:isLast});
            })];
          }),
        ];
        s.addTable(coreTbl,{x:lx,y:tY+0.32,w:lw,colW:[1.9,...mnCols.map(()=>mcw)],border:{pt:0.3,color:'DDDDDD'}});
      } else if(coreBizRows.length){
        // Fallback: no header found — render raw values using slice(1..7)
        const rawCols=coreBizRows[0].slice(1,7).map((_,i)=>`M${i+1}`);
        const rcw=+((lw-1.9)/rawCols.length).toFixed(2);
        const coreTbl=[_hdr(['Business',...rawCols]),...coreBizRows.map(r=>{const isT=/total/i.test(r[0]);return isT?_totRow([r[0],...rawCols.map((_,i)=>r[i+1]||'—')]):[_cell(r[0]),...rawCols.map((_,i)=>_numCell(r[i+1]||'—',{bold:i===rawCols.length-1}))];})];
        s.addTable(coreTbl,{x:lx,y:tY+0.32,w:lw,colW:[1.9,...rawCols.map(()=>rcw)],border:{pt:0.3,color:'DDDDDD'}});
      }

      // Insight box
      const totJun   = totRow  ? _fmtBig(totRow[totRow.length-1]) : null;
      const totN     = totRow  ? _pN(totRow[totRow.length-1]) : null;
      const smPct    = smRow&&totN  ? ((_pN(smRow [smRow .length-1])||0)/totN*100).toFixed(1) : null;
      const rstPct   = rstRow&&totN ? ((_pN(rstRow[rstRow.length-1])||0)/totN*100).toFixed(1) : null;
      const insParts=[];
      if(totJun)  insParts.push({text:`${fullMonth} Total Revenue: ${totJun}`,options:{bold:true,fontFace:'Quattrocento Sans'}});
      if(smPct)   insParts.push({text:'  |  Supermarket ',options:{bold:false,fontFace:'Quattrocento Sans'}},{text:`${smPct}%`,options:{bold:true,fontFace:'Quattrocento Sans'}});
      if(rstPct)  insParts.push({text:'  |  Restaurant ',options:{bold:false,fontFace:'Quattrocento Sans'}},{text:`${rstPct}%`,options:{bold:true,fontFace:'Quattrocento Sans'}});
      if(insParts.length){
        const iby=5.6,ibh=0.65;
        s.addShape(pptx.ShapeType.rect,{x:lx,y:iby,w:lw,h:ibh,fill:{color:'1E3A2A'},line:{color:'1E3A2A',pt:0}});
        s.addText(insParts,{x:lx+0.15,y:iby+0.06,w:lw-0.3,h:ibh-0.12,fontSize:10,color:C.white,wrap:true,valign:'middle'});
      }

      // Small donut chart below insight box
      if(smRow&&rstRow){
        const smN=_pN(smRow[smRow.length-1])||0, rstN=_pN(rstRow[rstRow.length-1])||0;
        if(smN||rstN){
          s.addChart(pptx.ChartType.doughnut,
            [{name:'Revenue',labels:['Supermarket','Restaurant'],values:[smN,rstN]}],
            {x:lx,y:4.7,w:2.1,h:2.0,holeSize:55,chartColors:['166534','ea580c'],showLegend:true,legendPos:'r',legendFontSize:9,showTitle:false,showValue:false});
        }
      }

      // ── Other Businesses (right panel) ───────────────────────────────────────
      s.addText('OTHER BUSINESSES (Million)',{x:rx,y:tY,w:rw,h:0.28,fontSize:11,bold:true,color:C.orange,fontFace:'Liter'});
      if(otherBizRows.length){
        const mayI=rovCols.findIndex(c=>/may/i.test(c));
        const junI=rovCols.findIndex(c=>/jun/i.test(c));
        // Use rovColIdxMap to get actual row indices; fallback to positional offsets
        const _getV=(r,colI)=>colI>=0?(rovColIdxMap[colI]!=null?_pN(r[rovColIdxMap[colI]]):_pN(r[colI+1])):null;
        const otherTbl=[
          _hdr(['Business','MAY','JUN','Change'],C.orange),
          ...otherBizRows.map(r=>{
            const mayV=_getV(r,mayI);
            const junV=_getV(r,junI);
            const chg=mayV&&junV&&mayV!==0?(junV-mayV)/mayV*100:null;
            const cc=chg!=null?(chg>=0?C.green:C.concern):C.dkgray;
            return [_cell(r[0]),
              _numCell(mayI>=0?r[mayI+1]:'—'),
              _numCell(junI>=0?r[junI+1]:'—'),
              _numCell(chg!=null?`${chg>=0?'+':''}${chg.toFixed(1)}%`:'—',{bold:true,color:cc})];
          }),
        ];
        s.addTable(otherTbl,{x:rx,y:tY+0.32,w:rw,colW:[2.3,1.05,1.05,1.1],border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 5: Growth ────────────────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'GROWTH','REVENUE & GROWTH',5);
      const kpis=[
        {lbl:`${latestRg?.[0]||''} VALUE YoY`, v:latestRg?.[3], orange:false},
        {lbl:`${latestRg?.[0]||''} VOLUME YoY`,v:latestRg?.[4], orange:false},
        {lbl:'BIZ YTD GROWTH',                 v:ytdRg?.[3],    orange:true},
        {lbl:'SAME STORE YTD',                 v:ssRg?.[3],     orange:true},
      ].filter(k=>k.v!=null);
      const kw2=(W-0.56)/kpis.length-0.12;
      kpis.forEach((k,i)=>{
        const x=0.28+i*(kw2+0.12), n=_pN(k.v);
        kpiBox(s,x,1.42,kw2,1.7,k.lbl,n!=null?`${n>=0?'+':''}${n.toFixed(1)}%`:'—',n>=0?C.green:C.concern,k.orange?C.lorangeBg:C.lgreenBg,k.orange?C.orange:C.green);
      });
      sectionLabel(s,'MONTHLY GROWTH PERFORMANCE',0.28,3.28,9);
      if(rgRows.length){
        const tblR=[
          _hdr(['PERIOD','2026 (M)','2025 (M)','VAL YoY%','VOL YoY%','SAME STORE%']),
          ...rgRows.map(r=>{
            const isY=/ytd/i.test(r[0]);
            const v3=_pN(r[3]),v4=_pN(r[4]),v5=_pN(r[5]);
            const c3=v3!=null?(v3>=0?C.green:C.concern):null;
            const c4=v4!=null?(v4>=0?C.green:C.concern):null;
            const c5=v5!=null?(v5>=0?C.green:C.concern):null;
            if(isY) return _totRow([r[0],r[1]?Number(r[1]).toLocaleString():'—',r[2]?Number(r[2]).toLocaleString():'—',
              v3!=null?`${v3>=0?'+':''}${v3.toFixed(1)}%`:'—',
              v4!=null?`${v4>=0?'+':''}${v4.toFixed(1)}%`:'—',
              v5!=null?`${v5>=0?'+':''}${v5.toFixed(1)}%`:'—']);
            return [_cell(r[0]),_numCell(r[1]?Number(r[1]).toLocaleString():'—'),_numCell(r[2]?Number(r[2]).toLocaleString():'—'),
              _numCell(v3!=null?`${v3>=0?'+':''}${v3.toFixed(1)}%`:'—',{bold:true,color:c3||C.dkgray}),
              _numCell(v4!=null?`${v4>=0?'+':''}${v4.toFixed(1)}%`:'—',{bold:true,color:c4||C.dkgray}),
              _numCell(v5!=null?`${v5>=0?'+':''}${v5.toFixed(1)}%`:'—',{bold:true,color:c5||C.dkgray})];
          }),
        ];
        s.addTable(tblR,{x:0.28,y:3.68,w:W-0.56,colW:[2.0,2.18,2.18,2.18,2.18,2.18],border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 5: Outlet Performance ────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      const gAch=_normPct(globalOutlet?.[5]??globalOutlet?.[4]);
      const gCol=gAch>=90?C.green:gAch>=80?C.weak:C.concern;
      const gBg =gAch>=90?C.lgreenBg:gAch>=80?C.weakBg:C.concernBg;
      addTabHeader(s,'OUTLETS',`OUTLET PERFORMANCE${gAch?'  ·  '+gAch.toFixed(1)+'% of Target':''}`,6);
      // Global achievement KPI box — Liter 36 bold, status colour
      if(globalOutlet){
        // Global achievement — big hero number
        const gx=0.28, gy=1.42, gw=2.7, gh=1.7;
        s.addShape(pptx.ShapeType.rect,{x:gx,y:gy,w:gw,h:gh,fill:{color:gBg},line:{color:gCol,pt:2.5}});
        s.addText('GLOBAL ACHIEVEMENT',{x:gx+0.12,y:gy+0.14,w:gw-0.24,h:0.32,fontSize:12,bold:false,color:C.gray,fontFace:'Quattrocento Sans'});
        s.addText(`${gAch?.toFixed(1)}%`,{x:gx+0.08,y:gy+0.46,w:gw-0.16,h:0.92,fontSize:56,bold:true,color:gCol,align:'center',valign:'middle',fontFace:'Liter'});
        s.addText(_statusLabel(globalOutlet[5]),{x:gx+0.4,y:gy+gh-0.36,w:gw-0.8,h:0.28,fontSize:12,bold:true,color:gCol,align:'center',fontFace:'Liter'});
      }
      // Outlet table — full width below, capped at 15 rows to stay readable
      const outTbl=[
        _hdr(['OUTLET','TARGET','ACTUAL','DIFF','ACH%','STATUS']),
        ...(globalOutlet?[[
          _cell('GLOBAL',{bold:true,fill:{color:C.greatBg}}),
          _numCell(_fmtRaw(globalOutlet[1]),{bold:true,fill:{color:C.greatBg}}),
          _numCell(_fmtRaw(globalOutlet[2]),{bold:true,fill:{color:C.greatBg}}),
          _numCell(_fmtRaw(globalOutlet[4]),{bold:true,fill:{color:C.greatBg}}),
          _cell(`${_normPct(globalOutlet[5])?.toFixed(1)||'—'}%`,{bold:true,align:'center',fill:{color:C.greatBg},color:_statusColor(globalOutlet[5])[0]}),
          _cell(_statusLabel(globalOutlet[5]),{bold:true,align:'center',fill:{color:_statusColor(globalOutlet[5])[1]},color:_statusColor(globalOutlet[5])[0]}),
        ]]:[]),
        ...outletRows_d.slice(0,14).map(r=>{
          const pv=_normPct(r[5]); const [sc,sbg]=_statusColor(r[5]);
          return [_cell(r[0]),_numCell(_fmtRaw(r[1])),_numCell(_fmtRaw(r[2])),_numCell(_fmtRaw(r[4])),
            _cell(pv!=null?`${pv.toFixed(1)}%`:'—',{align:'center',bold:true,color:sc}),
            _cell(_statusLabel(r[5]),{align:'center',fill:{color:sbg},color:sc,bold:true})];
        }),
      ];
      s.addTable(outTbl,{x:3.18,y:1.42,w:W-3.46,colW:[2.2,1.75,1.75,1.6,1.05,1.32],border:{pt:0.3,color:'DDDDDD'}});
    }

    // ── SLIDE 6: Regional Performance ─────────────────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'OUTLETS','REGIONAL PERFORMANCE',7);
      if(regions_d.length){
        const rw=Math.min(4.2,(W-0.56)/regions_d.length);
        regions_d.forEach((r,i)=>{
          const pv=_normPct(r[5]??r[4]);
          const col=pv>=90?C.green:pv>=80?C.weak:C.concern;
          const bg=pv>=90?'F0FDF4':pv>=80?'FEF3C7':'FEE2E2';
          const x=0.28+i*(rw+0.08);
          s.addShape(pptx.ShapeType.rect,{x,y:1.42,w:rw,h:2.6,fill:{color:bg},line:{color:col,pt:2}});
          s.addShape(pptx.ShapeType.rect,{x,y:1.42,w:0.12,h:2.6,fill:{color:col}});
          s.addText(r[0],{x:x+0.22,y:1.52,w:rw-0.34,h:0.44,fontSize:18,bold:true,color:col,fontFace:'Liter'});
          s.addText(`${pv?.toFixed(0)}%`,{x:x+0.18,y:1.98,w:rw-0.36,h:1.18,fontSize:48,bold:true,color:col,align:'center',valign:'middle',fontFace:'Liter'});
          s.addText(`Target: ${_fmtRaw(r[3])}`,{x:x+0.22,y:3.22,w:rw-0.34,h:0.3,fontSize:12,color:C.dkgray,fontFace:'Quattrocento Sans'});
          s.addText(`Actual: ${_fmtRaw(r[2])}`,{x:x+0.22,y:3.54,w:rw-0.34,h:0.3,fontSize:12,color:C.dkgray,fontFace:'Quattrocento Sans'});
        });
        sectionLabel(s,'REGIONAL SALES SUMMARY',0.28,4.22,9);
        const regTbl=[
          _hdr(['REGION','ACTUAL SALES','TARGET','DIFF','ACH%','STATUS']),
          ...regions_d.map(r=>{
            const pv=_normPct(r[5]??r[4]); const [sc,sbg]=_statusColor(r[5]??r[4]);
            return [_cell(r[0]),_numCell(_fmtRaw(r[2])),_numCell(_fmtRaw(r[3])),_numCell(_fmtRaw(r[4])),
              _cell(pv!=null?`${pv.toFixed(1)}%`:'—',{align:'center',color:sc,bold:true}),
              _cell(_statusLabel(r[5]??r[4]),{align:'center',fill:{color:sbg},color:sc,bold:true})];
          }),
        ];
        s.addTable(regTbl,{x:0.28,y:4.62,w:12.9,colW:[2.2,2.6,2.6,2.6,1.6,1.3],border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 7: Area Leaders ──────────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'OUTLETS','AREA LEADERS PERFORMANCE',8);
      if(areaGrouped_d.length){
        const areaTbl=[
          _hdr(['LEADER','OUTLET','TARGET','ACTUAL','DIFF','ACH%','STATUS']),
          ...areaGrouped_d.map(({leader,outlet,target,actual,diff,pct,isTotal})=>{
            const pv=_normPct(pct); const [sc,sbg]=_statusColor(pct);
            const bg=isTotal?C.greatBg:null;
            const fo=v=>bg?{...v,options:{...v.options,fill:{color:bg}}}:v;
            return [
              fo(_cell(leader,{bold:!!leader,color:leader?C.green:C.dkgray})),
              fo(_cell(outlet,{bold:isTotal})),
              fo(_numCell(_fmtRaw(target),{bold:isTotal})),
              fo(_numCell(_fmtRaw(actual),{bold:isTotal})),
              fo(_numCell(_fmtRaw(diff),{bold:isTotal})),
              fo(_cell(pv!=null?`${pv.toFixed(1)}%`:'—',{align:'center',color:sc,bold:isTotal})),
              _cell(_statusLabel(pct),{align:'center',fill:{color:isTotal?C.greatBg:sbg},color:sc}),
            ];
          }),
        ];
        s.addTable(areaTbl,{x:0.28,y:1.48,w:12.9,colW:[1.7,1.8,2.0,2.0,2.0,1.6,1.8],border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 9: Top 5 Stores ─────────────────────────────────────────────────
    if(tsRankRows.length||tsJunBreakout.some(r=>r.store!=='—')){
      const s = pptx.addSlide();
      addTabHeader(s,'OUTLETS',`TOP 5 STORES — ${fullMonth.toUpperCase()} PERFORMANCE`,9);

      // Build table: RANK | JAN | FEB | MAR | APR | MAY | JUN (each cell: store + value)
      function _tsCell(row, ni, vi){
        const name = (ni>=0&&row[ni]) ? String(row[ni]) : '—';
        const val  = (vi>=0&&row[vi]) ? _fmtRaw(row[vi]) : '';
        return _cell(val?`${name}\n${val}`:name, {align:'center', valign:'middle', fontSize:10});
      }
      const tsMths = [
        {lbl:'JAN',ni:tsJanN,vi:tsJanV},{lbl:'FEB',ni:tsFebN,vi:tsFebV},{lbl:'MAR',ni:tsMarN,vi:tsMarV},
        {lbl:'APR',ni:tsAprN,vi:tsAprV},{lbl:'MAY',ni:tsMayN,vi:tsMayV},{lbl:'JUN',ni:tsJunN,vi:tsJunV},
      ].filter(m=>m.ni>=0);
      const rankColW = 0.55;
      const mColW = (W-0.56-rankColW)/(tsMths.length||6);
      const tsTbl = [
        _hdr(['RANK',...tsMths.map(m=>m.lbl)]),
        ...tsRankRows.map((r,ri)=>[
          _cell(`#${ri+1}`,{bold:true,align:'center',color:C.orange,fontFace:'Liter',fontSize:14}),
          ...tsMths.map(m=>_tsCell(r,m.ni,m.vi)),
        ]),
        ...(tsTotalRow?[[_cell('TOTAL',{bold:true,align:'center',fill:{color:C.greatBg},color:C.green}),...tsMths.map(m=>_numCell(m.vi>=0?_fmtRaw(tsTotalRow[m.vi]):'—',{bold:true,fill:{color:C.greatBg}}))]]:[]),
      ];
      s.addTable(tsTbl,{x:0.28,y:1.48,w:W-0.56,colW:[rankColW,...tsMths.map(()=>mColW)],rowH:0.78,border:{pt:0.3,color:'DDDDDD'}});

      // June breakout — right-aligned summary box if table fits with 5 months
      if(tsJunBreakout.some(b=>b.store!=='—')){
        const bx=0.28, by=5.22, bw=W-0.56, bh=1.88;
        s.addShape(pptx.ShapeType.rect,{x:bx,y:by,w:bw,h:bh,fill:{color:'F8FFF9'},line:{color:C.green,pt:1}});
        sectionLabel(s,`${fullMonth.toUpperCase()} BREAKDOWN — TOP STORES`,bx+0.15,by+0.08,10);
        const cardW=(bw-0.3)/Math.min(tsJunBreakout.length,5);
        tsJunBreakout.slice(0,5).forEach((b,i)=>{
          const [sc]=b.store!=='—'?[C.green]:['6B7280'];
          s.addText(`#${i+1}`,{x:bx+0.15+i*cardW,y:by+0.56,w:cardW-0.1,h:0.28,fontSize:12,color:C.orange,bold:true,fontFace:'Liter',align:'center'});
          s.addText(b.store,{x:bx+0.15+i*cardW,y:by+0.84,w:cardW-0.1,h:0.36,fontSize:11,color:sc,bold:true,fontFace:'Quattrocento Sans',align:'center'});
          s.addText(b.val,{x:bx+0.15+i*cardW,y:by+1.2,w:cardW-0.1,h:0.38,fontSize:13,color:C.green,bold:true,fontFace:'Liter',align:'center'});
        });
      }
    }

    // ── SLIDE 10: Category Sales YTD ──────────────────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'CATEGORY','CATEGORY SALES YTD',10);
      if(catYTDRows_d.length&&catYTDCols_d.length){
        sectionLabel(s,'DEPARTMENT PERFORMANCE BY MONTH',0.28,1.42,10);
        const cw=[2.5,...catYTDCols_d.map(()=>+(10.4/catYTDCols_d.length).toFixed(3))];
        const catTbl=[
          _hdr(['DEPARTMENT',...catYTDCols_d]),
          ...catYTDRows_d.map(r=>{
            const isT=/total/i.test(r[0]);
            return isT?_totRow([r[0],...catYTDCols_d.map((_,i)=>_fmtRaw(r[i+1]))]):
              [_cell(r[0]),...catYTDCols_d.map((_,i)=>_numCell(_fmtRaw(r[i+1])))];
          }),
        ];
        s.addTable(catTbl,{x:0.28,y:1.84,w:12.9,colW:cw,border:{pt:0.3,color:'DDDDDD'}});
        const topCats=catYTDRows_d.filter(r=>!/total/i.test(r[0])).slice(0,4);
        topCats.forEach((r,i)=>{
          const kx=0.28+i*3.25;
          kpiBox(s,kx,5.75,3.05,1.5,String(r[0]),_fmtRaw(r[r.length-1]),C.green,C.lgreenBg,C.green);
        });
      }
    }

    // ── SLIDE 11: June Category Performance ───────────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'CATEGORY',`${fullMonth.toUpperCase()} CATEGORY PERFORMANCE`,11);
      if(catLatRows_d.length&&catLatCols_d.length){
        sectionLabel(s,`${fullMonth.toUpperCase()} vs PREV MONTH TARGET ACHIEVEMENT`,0.28,1.42,10,true);
        const nc=catLatCols_d.length;
        const cw=[2.5,...catLatCols_d.map(()=>+(10.4/nc).toFixed(3))];
        const catLatTbl=[
          _hdr(['DEPARTMENT',...catLatCols_d],C.orange),
          ...catLatRows_d.map(r=>{
            const isG=/global|total/i.test(r[0]);
            return [_cell(r[0],{bold:isG,fill:isG?{color:C.greatBg}:{}}),
              ...catLatCols_d.map((_,j)=>{
                const v=r[j+1]; const isA=catLatCols_d[j]?.includes('%');
                const n=_pN(v); const col=isA&&n!=null?(n>=90?C.green:n>=80?C.weak:C.concern):C.dkgray;
                return _cell(isA?(n!=null?`${n.toFixed(1)}%`:'—'):_fmtRaw(v),{align:'right',color:col,bold:isG,fill:isG?{color:C.greatBg}:{}});
              })];
          }),
        ];
        s.addTable(catLatTbl,{x:0.28,y:1.84,w:12.9,colW:cw,border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 12: Category Target Achievement Trends ───────────────────────────
    if(catLatRows_d.length){
      const s = pptx.addSlide();
      addTabHeader(s,'CATEGORY','CATEGORY ACHIEVEMENT TRENDS',12);
      sectionLabel(s,`${fullMonth.toUpperCase()} CATEGORY STATUS & STORE LEADERS`,0.28,1.42,12);

      // Derive achievement column index from catLatCols
      const achColIdx = catLatCols_d.findIndex(c=>/ach|%/i.test(String(c)));
      // Status categories with traffic-light bars + insight notes
      const catInsights = {
        'household':'Lowest achievement — Seasonal dip post-Ileya',
        'fresh food':'Sharp decline — Supply chain review needed',
        'cashier':'Below 80% — Manning coverage gap',
        '3f':'Restaurant strong but off May peak',
        'grocery':'Largest revenue line, needs recovery plan',
        'toiletries':'Most stable category — hold current strategy',
        'h&b':'Moderate decline — promo support advised',
        'entertainment':'Smallest line, consistent underperformance',
      };
      const trendTbl = [
        _hdr(['DEPARTMENT',...catLatCols_d,'STATUS','KEY OBSERVATION'],C.green),
        ...catLatRows_d.map(r=>{
          const isG=/global|total/i.test(r[0]);
          const achN = achColIdx>=0 ? _normPct(r[achColIdx+1]) : null;
          const [sc,sbg] = achN!=null ? _statusColor(achColIdx>=0?r[achColIdx+1]:null) : [C.gray,'F9FAFB'];
          const statusLbl = achN!=null ? _statusLabel(achColIdx>=0?r[achColIdx+1]:null) : '—';
          const obs = Object.entries(catInsights).find(([k])=>new RegExp(k,'i').test(r[0]))?.[1]||'';
          return [
            _cell(r[0],{bold:isG,fill:isG?{color:C.greatBg}:{}}),
            ...catLatCols_d.map((_,j)=>{
              const v=r[j+1]; const isA=catLatCols_d[j]?.includes('%');
              const n=_pN(v); const col=isA&&n!=null?(n>=90?C.green:n>=80?C.weak:C.concern):C.dkgray;
              return _cell(isA?(n!=null?`${n.toFixed(1)}%`:'—'):_fmtRaw(v),{align:'right',color:col,bold:isG,fill:isG?{color:C.greatBg}:{}});
            }),
            _cell(statusLbl,{align:'center',bold:true,fill:{color:sbg},color:sc}),
            _cell(isG?'All categories declined vs May':obs,{fontSize:10,color:C.dkgray,wrap:true}),
          ];
        }),
      ];
      const nc=catLatCols_d.length;
      const datCW=(5.5/nc); // data cols compressed to leave room for status + observation
      s.addTable(trendTbl,{x:0.28,y:1.84,w:W-0.56,colW:[2.0,...catLatCols_d.map(()=>datCW),1.1,W-0.56-2.0-(datCW*nc)-1.1],border:{pt:0.3,color:'DDDDDD'}});

      // Bottom insight banner
      const bx=0.28, by=H-1.1, bw=W-0.56, bh=0.78;
      s.addShape(pptx.ShapeType.rect,{x:bx,y:by,w:bw,h:bh,fill:{color:'1E3A2A'},line:{color:'1E3A2A',pt:0}});
      s.addText('KEY CONCERN: ',{x:bx+0.15,y:by+0.12,w:1.5,h:0.55,fontSize:11,bold:true,color:C.orange,fontFace:'Liter',valign:'middle'});
      s.addText('Household category is the weakest performer. Fresh Food and Cashier both need urgent intervention. Only Toiletries held above 80% across the board.',
        {x:bx+1.65,y:by+0.08,w:bw-1.8,h:0.62,fontSize:11,color:C.white,fontFace:'Quattrocento Sans',wrap:true,valign:'middle'});
    }

    // ── SLIDE 13: Weekly Sales & Stock Availability ────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'CATEGORY',`${fullMonth.toUpperCase()} WEEKLY SALES & STOCK AVAILABILITY`,13);

      // 5 week KPI cards across the top
      const wkLabels=['Week 1\n(1–7)','Week 2\n(8–14)','Week 3\n(15–21)','Week 4\n(22–28)','Week 5\n(29–30)'];
      const wkCardW=(W-0.56)/5-0.1;
      const wkCardH=1.7;
      const wkCardY=1.42;
      // Static fallback weekly data (used when live data not available)
      const wkStatic=[
        {lbl:'Week 1\n(1–7)',   sales:'N801M', ads:'ADS: N114M', low:false},
        {lbl:'Week 2\n(8–14)',  sales:'N758M', ads:'ADS: N108M', low:false},
        {lbl:'Week 3\n(15–21)', sales:'N747M', ads:'ADS: N107M', low:true},
        {lbl:'Week 4\n(22–28)', sales:'N772M', ads:'ADS: N110M', low:false},
        {lbl:'Week 5\n(29–30)', sales:'N202M', ads:'ADS: N101M', low:false},
      ];
      const wkSrc = weekRows_d.length>=4 ? weekRows_d.slice(0,5).map((r,i)=>({
        lbl:wkLabels[i]||`Week ${i+1}`, sales:_fmtRaw(_pN(r[1])||_pN(r[2])||0), ads:`ADS: ${_fmtRaw(_pN(r[3])||0)}`, low:i===2,
      })) : wkStatic;
      wkSrc.forEach((wk,i)=>{
        const x=0.28+i*(wkCardW+0.1);
        const bg=wk.low?C.weakBg:C.lgreenBg;
        const col=wk.low?C.weak:C.green;
        s.addShape(pptx.ShapeType.rect,{x,y:wkCardY,w:wkCardW,h:wkCardH,fill:{color:bg},line:{color:col,pt:2}});
        s.addText(wk.lbl,{x:x+0.08,y:wkCardY+0.1,w:wkCardW-0.16,h:0.44,fontSize:11,color:C.gray,fontFace:'Quattrocento Sans',align:'center',wrap:true});
        s.addText(wk.sales,{x:x+0.06,y:wkCardY+0.52,w:wkCardW-0.12,h:0.68,fontSize:28,bold:true,color:col,align:'center',valign:'middle',fontFace:'Liter'});
        s.addText(wk.ads,{x:x+0.08,y:wkCardY+1.22,w:wkCardW-0.16,h:0.3,fontSize:11,color:col,align:'center',fontFace:'Quattrocento Sans'});
      });

      // Stock Availability table
      sectionLabel(s,'STOCK AVAILABILITY BY LINE',0.28,3.28,10);
      if(stockRows_d.length){
        const scCols = stockHdrCols_d.length ? stockHdrCols_d : ['W1','W2','W3','W4','AVG'];
        const scTbl=[
          _hdr(['CATEGORY LINE',...scCols]),
          ...stockRows_d.slice(0,8).map(r=>{
            const cells=scCols.map((_,i)=>{
              const v=_pN(r[i+1]);
              const pct=v!=null?(v<2?v*100:v):null;
              const col=pct!=null?(pct>=90?C.green:pct>=80?C.weak:C.concern):C.dkgray;
              return _cell(pct!=null?`${pct.toFixed(0)}%`:(r[i+1]||'—'),{align:'center',bold:true,color:col});
            });
            return [_cell(r[0]),...cells];
          }),
        ];
        const scColW=(W-0.56-3.5)/scCols.length;
        s.addTable(scTbl,{x:0.28,y:3.68,w:W-0.56,colW:[3.5,...scCols.map(()=>scColW)],border:{pt:0.3,color:'DDDDDD'}});
      } else {
        // Static fallback from instruction data
        const sfTbl=[
          _hdr(['CATEGORY LINE','W1','W4','AVG']),
          ...['Diamond Lines Grocery','Diamond Lines Toiletries','Diamond Lines Fresh Food',
              'Silver Lines Grocery','Silver Lines Toiletries','Silver Lines Fresh Food'].map((nm,i)=>{
            const vals=[['79%','83%','81%'],['83%','84%','84%'],['84%','86%','86%'],
                        ['76%','79%','78%'],['84%','86%','86%'],['90%','91%','91%']][i];
            const cols=vals.map(v=>{const n=parseFloat(v);return n>=90?C.green:n>=85?C.mgreen:C.weak;});
            return [_cell(nm),...vals.map((v,j)=>_cell(v,{align:'center',bold:true,color:cols[j]}))];
          }),
        ];
        s.addTable(sfTbl,{x:0.28,y:3.68,w:W-0.56,colW:[5.5,2.6,2.6,2.6],border:{pt:0.3,color:'DDDDDD'}});
      }

      // Bottom note
      s.addShape(pptx.ShapeType.rect,{x:0.28,y:H-1.0,w:W-0.56,h:0.62,fill:{color:'F0FDF4'},line:{color:C.green,pt:1}});
      s.addText('Week 3 was the weakest full week. Silver Lines Fresh Food stock availability is strongest at 91%. Diamond Lines Grocery needs improvement.',
        {x:0.45,y:H-0.94,w:W-0.9,h:0.5,fontSize:11,color:C.dkgray,fontFace:'Quattrocento Sans',valign:'middle',wrap:true});
    }

    // ── SLIDE 14: Departmental Growth Comparison ───────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'COMPARISON','DEPARTMENTAL GROWTH COMPARISON',14);

      // Left: Supermarket, Right: Restaurant — 2-column card grid
      const panels=[
        {label:'SUPERMARKET', row:smGrow_d,  col:C.green,  bg:C.lgreenBg,  bd:C.green},
        {label:'RESTAURANT',  row:rstGrow_d, col:C.orange, bg:C.lorangeBg, bd:C.orange},
      ];
      const panelW=(W-0.56)/2-0.1;
      panels.forEach((p,pi)=>{
        const px=0.28+pi*(panelW+0.2);
        // Panel header bar
        s.addShape(pptx.ShapeType.rect,{x:px,y:1.42,w:panelW,h:0.44,fill:{color:p.col}});
        s.addText(p.label,{x:px+0.12,y:1.42,w:panelW-0.24,h:0.44,fontSize:18,bold:true,color:C.white,fontFace:'Liter',valign:'middle'});

        if(p.row){
          const mVals=p.row.slice(1).map(_pN).filter(v=>v!==null);
          const latV=mVals[mVals.length-1];
          const prevV=mVals[mVals.length-2];
          const mom=prevV&&latV?(latV-prevV)/prevV*100:null;
          const ytdTotal=mVals.reduce((a,b)=>a+b,0);

          // 3 KPI boxes per panel
          const kDefs=[
            {lbl:`${fullMonth.toUpperCase()} VALUE`,   val:latV!=null?_fmtBig(latV):'—',    col:p.col, bg:p.bg, bd:p.bd},
            {lbl:'YTD TOTAL',                          val:ytdTotal?_fmtBig(ytdTotal):'—',  col:p.col, bg:p.bg, bd:p.bd},
            {lbl:`VS ${(_MFULL[label]||'PREV')==='May'?'APR':'MAY'}`, val:mom!=null?`${mom>=0?'+':''}${mom.toFixed(1)}%`:'—', col:mom!=null&&mom>=0?C.green:C.concern, bg:mom!=null&&mom>=0?C.lgreenBg:C.concernBg, bd:mom!=null&&mom>=0?C.green:C.concern},
          ];
          const kw=(panelW-0.24)/3-0.08;
          kDefs.forEach((k,ki)=>{
            const kx=px+0.12+ki*(kw+0.08);
            s.addShape(pptx.ShapeType.rect,{x:kx,y:1.94,w:kw,h:1.7,fill:{color:k.bg},line:{color:k.bd,pt:1.5}});
            s.addText(k.lbl,{x:kx+0.08,y:2.06,w:kw-0.16,h:0.3,fontSize:11,color:C.gray,fontFace:'Quattrocento Sans',wrap:true,align:'center'});
            s.addText(k.val,{x:kx+0.06,y:2.38,w:kw-0.12,h:1.08,fontSize:22,bold:true,color:k.col,align:'center',valign:'middle',fontFace:'Liter'});
          });

          // Monthly sparkline table
          const mLbls=rovCols.slice(0,mVals.length);
          const mTbl=[
            _hdr([p.label,...mLbls]),
            [_cell('Revenue (M)',{bold:true,color:p.col}),...mVals.map((v,i)=>_numCell(_fmtBig(v),{bold:i===mVals.length-1,color:i===mVals.length-1?p.col:C.dkgray}))],
          ];
          const mCW=(panelW-0.24-1.4)/Math.max(mLbls.length,1);
          s.addTable(mTbl,{x:px,y:3.72,w:panelW,colW:[1.4,...mLbls.map(()=>mCW)],border:{pt:0.3,color:'DDDDDD'}});
        } else {
          s.addText('Data not available',{x:px+0.12,y:2.2,w:panelW-0.24,h:0.5,fontSize:13,color:C.gray,fontFace:'Quattrocento Sans',align:'center'});
        }
      });

      // Combined SM+3F summary row at bottom
      if(smGrow_d&&rstGrow_d){
        const smVals=smGrow_d.slice(1).map(_pN).filter(v=>v!==null);
        const rstVals=rstGrow_d.slice(1).map(_pN).filter(v=>v!==null);
        const smYTD=smVals.reduce((a,b)=>a+b,0);
        const rstYTD=rstVals.reduce((a,b)=>a+b,0);
        const totYTD=smYTD+rstYTD;
        const smPct=totYTD?((smYTD/totYTD)*100).toFixed(1):null;
        const rstPct=totYTD?((rstYTD/totYTD)*100).toFixed(1):null;
        const by=5.62, bh=0.62;
        s.addShape(pptx.ShapeType.rect,{x:0.28,y:by,w:W-0.56,h:bh,fill:{color:'1E3A2A'}});
        s.addText([
          {text:`YTD Combined: ${_fmtBig(totYTD)}`,options:{bold:true,color:C.white,fontFace:'Liter'}},
          {text:`   |   Supermarket: ${_fmtBig(smYTD)} (${smPct}%)`,options:{color:'AADDB0',fontFace:'Quattrocento Sans'}},
          {text:`   |   Restaurant: ${_fmtBig(rstYTD)} (${rstPct}%)`,options:{color:'AADDB0',fontFace:'Quattrocento Sans'}},
        ],{x:0.4,y:by+0.08,w:W-0.8,h:bh-0.16,fontSize:13,valign:'middle'});
      }
    }

    // ── SLIDE 15: YoY Comparison ──────────────────────────────────────────────
    if(yoyGrow.length||yoyDec.length){
      const s = pptx.addSlide();
      addTabHeader(s,'COMPARISON','OUTLET YEAR-ON-YEAR PERFORMANCE',15);
      // YoY sheet: cols vary — find indices by scanning header row
      const yoyHdrRow = yoy_d.find(r=>r?.some(c=>/2025|prev/i.test(String(c))));
      const y25QtyI = yoyHdrRow ? yoyHdrRow.findIndex(c=>/2025.*qty|qty.*2025/i.test(String(c))) : 1;
      const y26QtyI = yoyHdrRow ? yoyHdrRow.findIndex(c=>/2026.*qty|qty.*2026/i.test(String(c))) : 3;
      const y25ValI = yoyHdrRow ? yoyHdrRow.findIndex(c=>/2025.*val|val.*2025/i.test(String(c))) : 2;
      const y26ValI = yoyHdrRow ? yoyHdrRow.findIndex(c=>/2026.*val|val.*2026/i.test(String(c))) : 4;
      const yPctI   = yoyHdrRow ? yoyHdrRow.findIndex(c=>/%\s*val|val.*%/i.test(String(c))) : -1;
      function yoyTbl(rows){
        return rows.slice(0,11).map(r=>{
          const pv = yPctI>=0 ? _pN(r[yPctI]) : _pN(r[r.length-1]);
          const isGrow = pv!=null&&pv>=0;
          const v25 = y25ValI>=0 ? _fmtRaw(r[y25ValI]) : _fmtRaw(r[2]);
          const v26 = y26ValI>=0 ? _fmtRaw(r[y26ValI]) : _fmtRaw(r[4]);
          const diff = (y25ValI>=0&&y26ValI>=0) ? _fmtRaw(_pN(r[y26ValI])-_pN(r[y25ValI])) : _fmtRaw(r[6]);
          return [_cell(r[0]),_numCell(v25),_numCell(v26),
            _numCell(diff,{color:isGrow?C.green:C.concern}),
            _cell(pv!=null?`${pv>=0?'+':''}${pv.toFixed(1)}%`:'—',{align:'center',bold:true,color:isGrow?C.green:C.concern})];
        });
      }
      if(yoyGrow.length){
        sectionLabel(s,'TOP GROWERS',0.28,1.42,6.2);
        const tbl=[_hdr(['OUTLET','2025 VAL','2026 VAL','DIFF','% VAL']),...yoyTbl(yoyGrow)];
        s.addTable(tbl,{x:0.28,y:1.84,w:6.2,colW:[1.9,1.3,1.3,1.0,0.7],border:{pt:0.3,color:'DDDDDD'}});
      }
      if(yoyDec.length){
        sectionLabel(s,'DECLINERS',6.85,1.42,6.2,true);
        const tbl=[_hdr(['OUTLET','2025 VAL','2026 VAL','DIFF','% VAL'],C.orange),...yoyTbl(yoyDec)];
        s.addTable(tbl,{x:6.85,y:1.84,w:6.2,colW:[2.1,1.3,1.3,0.8,0.7],border:{pt:0.3,color:'DDDDDD'}});
      }
    }

    // ── SLIDE 16: Utilities ────────────────────────────────────────────────────
    if(util_d.length){
      const s = pptx.addSlide();
      addTabHeader(s,'','UTILITIES & POWER COST',16);
      // KPI boxes — Quattrocento Sans 14 label, Liter 18 value (orange)
      util_d.slice(0,4).forEach((r,i)=>{
        const x=0.28+i*3.25, ky=1.42, kw=3.05, kh=1.7;
        const label=String(r[0]||'');
        const rawV=_pN(r[r.length-1]);
        // Format: Naira amounts get _fmtRaw; hours/litres get comma-number
        const isNaira=/value|cost|₦/i.test(label);
        const uvStr = rawV!=null ? (isNaira||rawV>=1e6 ? _fmtRaw(rawV) : Number(Math.round(rawV)).toLocaleString()) : '—';
        s.addShape(pptx.ShapeType.rect,{x,y:ky,w:kw,h:kh,fill:{color:C.lorangeBg},line:{color:C.orange,pt:2}});
        s.addText(label,{x:x+0.12,y:ky+0.14,w:kw-0.24,h:0.32,fontSize:12,color:C.gray,bold:false,fontFace:'Quattrocento Sans'});
        s.addText(uvStr,{x:x+0.08,y:ky+0.46,w:kw-0.16,h:kh-0.62,fontSize:28,bold:true,color:C.orange,align:'center',valign:'middle',fontFace:'Liter'});
      });
      sectionLabel(s,'UTILITY DETAILS BY MONTH',0.28,3.3,9,true);
      function _fmtUtil(lbl, v){
        const n=_pN(v); if(n===null) return '—';
        const isNaira=/value|cost/i.test(String(lbl));
        return isNaira||n>=1e6 ? _fmtRaw(n) : Number(Math.round(n)).toLocaleString();
      }
      const utilTbl=[
        _hdr(['DESCRIPTION','JAN','FEB','MAR','APR','MAY','JUN'],C.orange),
        ...util_d.map(r=>[_cell(r[0]),...[1,2,3,4,5,6].map(ci=>_numCell(_fmtUtil(r[0],r[ci])))]),
      ];
      s.addTable(utilTbl,{x:0.28,y:3.72,w:12.9,colW:[4.2,1.45,1.45,1.45,1.45,1.45,1.45],border:{pt:0.3,color:'DDDDDD'}});
    }

    // ── SLIDE 17: Priorities & Action Plan Tracker ────────────────────────────
    {
      const s = pptx.addSlide();
      addTabHeader(s,'','PRIORITIES & ACTION PLAN TRACKER',17);

      // June 2026 priorities (historical)
      sectionLabel(s,'JUNE 2026 PRIORITIES — REVIEW',0.28,1.42,6.2);
      const junePrio=[
        ['1','Launch June Jumbo savings promo to sustain May momentum','HSO','Jun 15','HIGH','Revenue uplift vs May (125M WOW before promo)'],
        ['2','Urgent intervention plan for lagging outlets','HSO','Jun 30','HIGH','Restore 3 outlets to 85%+ (Not achieved)'],
        ['3','Deliver 95% manning execution','HSO','Jun 30','HIGH','Improve customer engagement (Currently 91%)'],
        ['4','Drive Cashier/Bread decline continuously','Ops Support Mgr','Jun 30','HIGH','Reduce decline to -10% (Fell to -14%)'],
        ['5','Drive High-Savings High-Pay Diesel cost reduction','Ops Support Mgr','Jun 30','HIGH','Save N15M power costs (Saved N12.7M)'],
        ['6','Follow up on Affordability campaign instore','Category Mgt','Jun 30','HIGH','Improve customer perception (Gained 8%)'],
        ['7','Initiate Corporate sales & Off-cycle hamper production','Olufunmi','Jun 15','MED','Expected +N20M (Actual N1.5M)'],
        ['8','Drive Chop Beta improved sales','Fisayo','Jun 30','MED','Achieve +25% growth over May (Chop Beta vs May: 100%)'],
      ];
      const juneTbl=[
        _hdr(['#','ACTION ITEM','OWNER','TIMELINE','PRIORITY','IMPACT / RESULT']),
        ...junePrio.map(r=>{
          const isPri=r[4]==='HIGH';
          return [
            _cell(r[0],{align:'center',bold:true,color:isPri?C.orange:C.dkgray,fontFace:'Liter'}),
            _cell(r[1],{wrap:true}),
            _cell(r[2],{align:'center',fontSize:11}),
            _cell(r[3],{align:'center',fontSize:11}),
            _cell(r[4],{align:'center',bold:true,color:isPri?C.orange:C.dkgray}),
            _cell(r[5],{wrap:true,fontSize:11,color:C.dkgray}),
          ];
        }),
      ];
      s.addTable(juneTbl,{x:0.28,y:1.84,w:6.15,colW:[0.3,2.0,0.85,0.65,0.65,1.7],rowH:0.36,border:{pt:0.3,color:'DDDDDD'}});

      // July 2026 forward targets
      sectionLabel(s,'JULY 2026 FORWARD TARGETS',6.6,1.42,6.4,true);
      const julyPrio=[
        ['1','Launch July promotional push for end of month','HSO','Jul 15','HIGH','Revenue uplift'],
        ['2','Execute two intervention plans for lagging outlets','HSO','Jul 15','HIGH','Restore 3 outlets to 82%+'],
        ['3','Area Coach performance assessment twice monthly','HSO','Jul 15/30','HIGH','Enhance overall performance'],
        ['4','Drive Cashier/Bread decline reduction','Ops Support Mgr','Jul 31','HIGH','Recover to -10% by July'],
        ['5','Drive merchandising focus on rainy season key items','Silas','Jul 10','HIGH','Improve visibility/revenue'],
        ['6','Execute Chop Beta/Grill offering campaign','Adio','Jul 10','MED','Enhance 3F revenue'],
        ['7','Cashier manning to hit 100%','Adio','Jul 15','HIGH','Improve service delivery'],
        ['8','Deliver 95% manning execution with HR','Godspower/HSO','Jul 15','HIGH','Improve customer engagement'],
        ['9','Drive "HERE TO HELP CAMPAIGN" on shopfloor','HSO','Jul 15','HIGH','Customer excitement'],
      ];
      const julyTbl=[
        _hdr(['#','ACTION ITEM','OWNER','TIMELINE','PRIORITY','IMPACT'],C.orange),
        ...julyPrio.map(r=>{
          const isPri=r[4]==='HIGH';
          return [
            _cell(r[0],{align:'center',bold:true,color:isPri?C.orange:C.dkgray,fontFace:'Liter'}),
            _cell(r[1],{wrap:true}),
            _cell(r[2],{align:'center',fontSize:11}),
            _cell(r[3],{align:'center',fontSize:11}),
            _cell(r[4],{align:'center',bold:true,color:isPri?C.orange:C.dkgray}),
            _cell(r[5],{wrap:true,fontSize:11,color:C.dkgray}),
          ];
        }),
      ];
      s.addTable(julyTbl,{x:6.6,y:1.84,w:6.45,colW:[0.3,2.2,0.9,0.7,0.65,1.7],rowH:0.33,border:{pt:0.3,color:'DDDDDD'}});
    }

    // ── SLIDE 18: Thank You ────────────────────────────────────────────────────
    {
      const s = pptx.addSlide();
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:'0D3318'}});
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:H,fill:{color:'000000',transparency:45}});
      s.addShape(pptx.ShapeType.rect,{x:0,y:H-0.07,w:W,h:0.07,fill:{color:C.orange}});
      if (logoDataUrl) {
        const tlw=3.13, tlh=1.04;
        s.addShape(pptx.ShapeType.rect,{x:3.5,y:1.05,w:6.33,h:0.04,fill:{color:'4ade80'}});
        s.addImage({data:logoDataUrl, x:(W-tlw)/2, y:1.15, w:tlw, h:tlh});
        s.addShape(pptx.ShapeType.rect,{x:3.5,y:1.15+tlh+0.1,w:6.33,h:0.04,fill:{color:'4ade80'}});
      }
      s.addText('THANK YOU',{x:0.3,y:2.42,w:W-0.6,h:1.0,fontSize:52,bold:true,color:C.white,align:'center',fontFace:'Liter'});
      s.addShape(pptx.ShapeType.rect,{x:3.5,y:3.52,w:6.33,h:0.04,fill:{color:'6B8F72'}});
      s.addText('FoodCo Nigeria Limited',{x:0.5,y:3.65,w:W-1,h:0.5,fontSize:18,bold:true,color:C.white,align:'center',fontFace:'Quattrocento Sans'});
      s.addText(`${fullMonth} 2026 Sales Report`,{x:0.5,y:4.2,w:W-1,h:0.4,fontSize:16,color:'AADDB0',align:'center',fontFace:'Quattrocento Sans'});
      const hi=[];
      if(ytdRg) hi.push(`BIZ YTD Growth: ${_pN(ytdRg[3])?.toFixed(1)}%`);
      if(globalOutlet) hi.push(`Global Achievement: ${_normPct(globalOutlet[5])?.toFixed(1)}%`);
      if(latestRg) hi.push(`${latestRg[0]} Val YoY: ${_pN(latestRg[3])?.toFixed(1)}%`);
      if(hi.length) s.addText(hi.join('   ·   '),{x:0.5,y:5.2,w:W-1,h:0.5,fontSize:12,color:'77BB88',align:'center',fontFace:'Quattrocento Sans'});
    }

    await pptx.writeFile({fileName:`FoodCo_${label}_2026_Sales_Report.pptx`});
  } catch(e) {
    console.error('PPTX error', e);
    alert(`Failed to generate PPTX: ${e.message}`);
  } finally {
    if(btn){ btn.textContent='⬇ Download PPTX'; btn.disabled=false; }
  }
};

// ── Browser Presentation Mode ─────────────────────────────────────────────────
// ── Action Plan in-presentation editor ────────────────────────────────────────
window._apEdit = function(planKey, monthLabel) {
  // Load current plan data
  let plan;
  try { plan = JSON.parse(localStorage.getItem(planKey)); } catch(e) {}
  if (!Array.isArray(plan) || !plan.length) {
    // fall back to default by reading the current slide's table rows
    plan = Array.from(document.querySelectorAll('#ps-frame tbody tr')).map(tr => {
      const tds = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
      return tds.length >= 6 ? tds : null;
    }).filter(Boolean);
    if (!plan.length) plan = [['1','','','','HIGH','']];
  }

  const modal = document.createElement('div');
  modal.id = 'ps-ap-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;font-family:Segoe UI,Arial,sans-serif';

  function renderEditor() {
    modal.innerHTML = `
      <div style="background:#fff;border-radius:8px;width:90%;max-width:1080px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column">
        <div style="background:#166534;color:#fff;padding:14px 20px;font-size:1.1em;font-weight:700;display:flex;justify-content:space-between;align-items:center">
          <span>Edit Action Items — ${monthLabel}</span>
          <button onclick="document.getElementById('ps-ap-modal').remove()" style="background:none;border:none;color:#fff;font-size:1.4em;cursor:pointer;line-height:1">×</button>
        </div>
        <div style="overflow-y:auto;flex:1;padding:16px">
          <table style="width:100%;border-collapse:collapse;font-size:0.9em" id="ps-ap-tbl">
            <thead><tr style="background:#F3F4F6">
              <th style="padding:6px 8px;text-align:center;width:36px">#</th>
              <th style="padding:6px 8px;text-align:left">Action Item</th>
              <th style="padding:6px 8px;text-align:left;width:120px">Owner</th>
              <th style="padding:6px 8px;text-align:left;width:90px">Timeline</th>
              <th style="padding:6px 8px;text-align:left;width:90px">Priority</th>
              <th style="padding:6px 8px;text-align:left">Likely Impact</th>
              <th style="padding:6px 8px;width:40px"></th>
            </tr></thead>
            <tbody id="ps-ap-rows">
              ${plan.map((r,i) => `<tr data-i="${i}" style="border-bottom:1px solid #E5E7EB">
                <td style="padding:4px 8px;text-align:center;color:#ea580c;font-weight:700">${i+1}</td>
                <td style="padding:3px 4px"><textarea rows="2" style="width:100%;resize:vertical;border:1px solid #D1D5DB;border-radius:3px;padding:3px 6px;font-size:0.9em" data-f="1">${(r[1]||'').replace(/"/g,'&quot;')}</textarea></td>
                <td style="padding:3px 4px"><input type="text" value="${(r[2]||'').replace(/"/g,'&quot;')}" style="width:100%;border:1px solid #D1D5DB;border-radius:3px;padding:4px 6px;font-size:0.9em" data-f="2"/></td>
                <td style="padding:3px 4px"><input type="text" value="${(r[3]||'').replace(/"/g,'&quot;')}" style="width:100%;border:1px solid #D1D5DB;border-radius:3px;padding:4px 6px;font-size:0.9em" data-f="3"/></td>
                <td style="padding:3px 4px"><select style="width:100%;border:1px solid #D1D5DB;border-radius:3px;padding:4px;font-size:0.9em" data-f="4"><option${r[4]==='HIGH'?' selected':''}>HIGH</option><option${r[4]==='MED'?' selected':''}>MED</option><option${r[4]==='LOW'?' selected':''}>LOW</option></select></td>
                <td style="padding:3px 4px"><textarea rows="2" style="width:100%;resize:vertical;border:1px solid #D1D5DB;border-radius:3px;padding:3px 6px;font-size:0.9em" data-f="5">${(r[5]||'').replace(/"/g,'&quot;')}</textarea></td>
                <td style="padding:3px 4px;text-align:center"><button onclick="window._apDelRow(${i},'${planKey}','${monthLabel}')" style="background:#FEE2E2;border:none;color:#DC2626;border-radius:3px;padding:3px 7px;cursor:pointer;font-size:0.85em">✕</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:12px 20px;display:flex;gap:10px;border-top:1px solid #E5E7EB;background:#F9FAFB;justify-content:space-between">
          <button onclick="window._apAddRow('${planKey}','${monthLabel}')" style="background:#166534;color:#fff;border:none;padding:8px 18px;border-radius:4px;cursor:pointer;font-weight:600">+ Add Row</button>
          <div style="display:flex;gap:10px">
            <button onclick="document.getElementById('ps-ap-modal').remove()" style="background:#F3F4F6;color:#374151;border:1px solid #D1D5DB;padding:8px 18px;border-radius:4px;cursor:pointer">Cancel</button>
            <button onclick="window._apSave('${planKey}','${monthLabel}')" style="background:#ea580c;color:#fff;border:none;padding:8px 22px;border-radius:4px;cursor:pointer;font-weight:700">Save & Apply</button>
          </div>
        </div>
      </div>`;
  }

  window._apDelRow = function(idx, key, label) {
    try { const p=JSON.parse(localStorage.getItem(key)||'[]'); p.splice(idx,1); localStorage.setItem(key,JSON.stringify(p)); } catch(e) {}
    let plan2; try { plan2=JSON.parse(localStorage.getItem(key)); } catch(e) {}
    if (!Array.isArray(plan2)||!plan2.length) plan2=[['1','','','','HIGH','']];
    plan = plan2; renderEditor();
  };
  window._apAddRow = function(key, label) {
    window._apSave(key, label, false);
    try { const p=JSON.parse(localStorage.getItem(key)||'[]'); p.push([String(p.length+1),'','','','HIGH','']); localStorage.setItem(key,JSON.stringify(p)); plan=p; } catch(e) {}
    renderEditor();
  };
  window._apSave = function(key, label, close=true) {
    const tbody = document.getElementById('ps-ap-rows');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr')).map((tr,i) => {
      const get = f => (tr.querySelector(`[data-f="${f}"]`)?.value || '').trim();
      return [String(i+1), get(1), get(2), get(3), get(4), get(5)];
    });
    try { localStorage.setItem(key, JSON.stringify(rows)); } catch(e) {}
    if (close) {
      document.getElementById('ps-ap-modal')?.remove();
      if (window._presGoTo && window._presCur != null) window._presGoTo(window._presCur);
    }
  };

  renderEditor();
  document.body.appendChild(modal);
};

window.presentReport = async function() {
  const data = window._lastReportData;
  if (!data) { alert('Please generate the report first.'); return; }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function pN(v){ if(v==null||v==='') return null; const n=parseFloat(String(v).replace(/[,\s₦NB]/g,'').replace(/%$/,'')); return isNaN(n)?null:n; }
  function normPct(v){ const n=pN(v); return n===null?null:(n<2?n*100:n); }
  function fmtRaw(v){ const n=pN(v); if(n===null) return '—'; const abs=Math.abs(n),s=n<0?'-':''; if(abs>=1e9) return `${s}N${(abs/1e9).toFixed(2)}B`; if(abs>=1e6) return `${s}N${(abs/1e6).toFixed(1)}M`; if(abs>=1e3) return `${s}N${Math.round(abs).toLocaleString('en-US')}`; return `${s}N${Math.round(abs).toLocaleString('en-US')}`; }
  function fmtBig(v){ const n=pN(v); if(n===null) return '—'; if(Math.abs(n)>=1000) return `N${(n/1000).toFixed(2)}B`; return `N${n.toFixed(1)}M`; }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function sColor(v){ const n=normPct(v); if(n===null) return {c:'#6B7280',bg:'#F9FAFB',lbl:'—'}; if(n>=100) return {c:'#166534',bg:'#DCFCE7',lbl:'GREAT'}; if(n>=90) return {c:'#15803d',bg:'#DCFCE7',lbl:'STABLE'}; if(n>=80) return {c:'#D97706',bg:'#FEF3C7',lbl:'WEAK'}; return {c:'#DC2626',bg:'#FEE2E2',lbl:'CONCERNING'}; }
  function pctFmt(v){ const n=normPct(v); return n!=null?`${n.toFixed(1)}%`:'—'; }
  function yoyFmt(v){ const n=pN(v); return n!=null?`${n>=0?'+':''}${n.toFixed(1)}%`:'—'; }
  function yoyColor(v){ const n=pN(v); return n!=null?(n>=0?'#166534':'#DC2626'):'#6B7280'; }

  // ── Data parsing ──────────────────────────────────────────────────────────
  const ytdAll   = (data.businessYTD||[]).filter(r=>r?.[0]);
  const ytdMonths= ytdAll.filter(r=>!['MONTH','YTD','TOTAL'].includes((r[0]||'').toUpperCase()));
  const ytdRow   = ytdAll.find(r=>(r[0]||'').toUpperCase()==='YTD');
  const latestM  = ytdMonths[ytdMonths.length-1];
  const mLabel   = (latestM?.[0]||'JUNE').toUpperCase();
  const MFULL    = {JAN:'January',FEB:'February',MAR:'March',APR:'April',MAY:'May',JUN:'June',JUL:'July',AUG:'August',SEP:'September',OCT:'October',NOV:'November',DEC:'December'};
  const fullMonth= MFULL[mLabel]||mLabel;
  const revVs    = ytdMonths.map(r=>pN(r[1])).filter(v=>v!==null);
  const revLbs   = ytdMonths.map(r=>String(r[0]||'').toUpperCase());
  const ytdTot   = pN(ytdRow?.[1]) ?? revVs.reduce((a,b)=>a+b,0);
  const lastV    = revVs[revVs.length-1];
  const prevV    = revVs[revVs.length-2];
  const peakI    = revVs.length?revVs.indexOf(Math.max(...revVs)):-1;
  const peakLb   = peakI>=0?(MFULL[revLbs[peakI]]||revLbs[peakI]):'';
  const peakV    = peakI>=0?revVs[peakI]:null;
  const momR     = (prevV&&lastV)?(lastV-prevV)/prevV*100:null;
  const q1a      = revVs.slice(0,3).length?revVs.slice(0,3).reduce((a,b)=>a+b,0)/3:null;
  const q2a      = revVs.slice(3,6).length?revVs.slice(3,6).reduce((a,b)=>a+b,0)/revVs.slice(3,6).length:null;
  function fmtBil(v){ const n=pN(v); if(n===null) return '—'; return Math.abs(n)>=1?`N${Math.abs(n).toFixed(2)}B`:`N${(Math.abs(n)*1000).toFixed(0)}M`; }

  const rov      = data.revenueOverview||[];
  let rovHdr     = rov.find(r=>r?.slice(1).some(c=>/jan|feb|mar|apr|may|jun/i.test(String(c))));
  if(!rovHdr) rovHdr = rov.find(r=>r?.some(c=>/jan|feb|mar|apr|may|jun/i.test(String(c))));
  const rovCols  = rovHdr?rovHdr.filter(c=>c&&/jan|feb|mar|apr|may|jun/i.test(String(c))):[];
  const rovIdx   = rovHdr?rovCols.map(c=>rovHdr.indexOf(c)):[];
  let coreBiz=[],otherBiz=[],inC=false,inO=false;
  for(const r of rov){ if(!r?.[0]) continue; if(/core business/i.test(r[0])){inC=true;inO=false;continue;} if(/other.*business|other.*key/i.test(r[0])){inO=true;inC=false;continue;} if(inC&&r.length>=2)coreBiz.push(r); if(inO&&r.length>=2)otherBiz.push(r); }
  const smRow    = coreBiz.find(r=>/supermarket|sm\b/i.test(r[0]));
  const rstRow   = coreBiz.find(r=>/restaurant|rst\b/i.test(r[0]));
  const totBizRow= coreBiz.find(r=>/total/i.test(r[0]));
  const junIdx   = rovCols.findIndex(c=>/jun/i.test(c));
  const mayIdx   = rovCols.findIndex(c=>/may/i.test(c));
  function rovVal(row){ if(!row) return null; if(junIdx>=0&&rovIdx[junIdx]!=null) return pN(row[rovIdx[junIdx]]); const nums=row.slice(1).map(pN).filter(v=>v!==null); if(nums.length>=2&&nums[nums.length-1]>nums[nums.length-2]*3) return nums[nums.length-2]; return nums[nums.length-1]??null; }
  const smJunV   = rovVal(smRow);
  const rstJunV  = rovVal(rstRow);
  const totJunV  = rovVal(totBizRow)||(smJunV&&rstJunV?smJunV+rstJunV:null);
  const smPct    = totJunV&&smJunV?(smJunV/totJunV*100).toFixed(1):null;
  const rstPct   = totJunV&&rstJunV?(rstJunV/totJunV*100).toFixed(1):null;

  const rg       = data.revenueGrowth||[];
  const rgRows   = rg.filter(r=>r?.[0]&&!/month|period|growth|header/i.test(r[0])&&r.length>=4);
  const latestRg = rgRows.filter(r=>!/ytd|same/i.test(r[0])).slice(-1)[0];
  const ytdRg    = rgRows.find(r=>/biz ytd/i.test(r[0]));
  const ssRg     = rgRows.find(r=>/same.store/i.test(r[0]));

  const allOuts  = (data.outletsPerf||[]).filter(r=>r?.[0]&&r[0]!=='OUTLET');
  const globalOut= allOuts.find(r=>/global/i.test(r[0]));
  const outRows  = allOuts.filter(r=>!/global/i.test(r[0]));
  const gAch     = normPct(globalOut?.[5]??globalOut?.[4]);

  const regions  = (data.regionPerf||[]).filter(r=>r?.[0]&&!/region|june|performance/i.test(r[0]));

  const areaRaw  = data.areaPerf||[];
  const areaRows = [];
  for(const r of areaRaw){ if(!r?.[0]&&!r?.[1]) continue; if(/^(area leader|leader|outlet|june 2026|performance)$/i.test((r[0]||'').trim())) continue; if(!r[1]||r.length<4) continue; areaRows.push({leader:r[0]||'',outlet:r[1],target:r[2],actual:r[3],diff:r[4],pct:r[5],isTotal:/total/i.test(r[1])}); }

  const catYTD   = data.categorySalesYTD||[];
  const catYHdr  = catYTD.find(r=>r?.slice(1).some(c=>/jan|feb|mar/i.test(String(c))));
  const catYCols = catYHdr?catYHdr.slice(1).filter(Boolean):[];
  const catYRows = catYTD.filter(r=>r?.[0]&&!/dept|category|sales/i.test(r[0])&&r.length>=2);

  const catLat   = data.categorySalesLatest||[];
  const catLHdr  = catLat.find(r=>/dept|category/i.test(r[0])||r?.slice(1).some(c=>/may|jun|sales/i.test(String(c))));
  const catLCols = catLHdr?catLHdr.slice(1).filter(Boolean):[];
  const catLRows = catLat.filter(r=>r?.[0]&&!/dept|category/i.test(r[0])&&r.length>=3);

  const yoy      = data.yoy||[];
  const smI      = yoy.findIndex(r=>r?.some(c=>/sm.*3f|sm\+3f/i.test(String(c))));
  const yoySec   = smI>=0?yoy.slice(smI):yoy;
  const yoyRows  = yoySec.filter(r=>{ if(!r?.[0]) return false; if(/outlet|store|total|same.store|supermarket|restaurant|sm\+3f/i.test(r[0])) return false; return r.length>=4; });
  const yoyHdrR  = yoy.find(r=>r?.some(c=>/2025|prev/i.test(String(c))));
  const y25VI    = yoyHdrR?yoyHdrR.findIndex(c=>/2025.*val|val.*2025/i.test(String(c))):2;
  const y26VI    = yoyHdrR?yoyHdrR.findIndex(c=>/2026.*val|val.*2026/i.test(String(c))):4;
  const yPctI    = yoyHdrR?yoyHdrR.findIndex(c=>/%\s*val|val.*%/i.test(String(c))):-1;
  function yoyPct(r){ return yPctI>=0?pN(r[yPctI]):pN(r[r.length-1]); }
  const yoyGrow  = yoyRows.filter(r=>yoyPct(r)>=0).sort((a,b)=>(yoyPct(b)||0)-(yoyPct(a)||0));
  const yoyDec   = yoyRows.filter(r=>yoyPct(r)<0).sort((a,b)=>(yoyPct(a)||0)-(yoyPct(b)||0));

  const utilD    = (data.utility||[]).filter(r=>r?.[0]&&!/desc|header/i.test(r[0]));
  function fmtUtil(lbl,v){ const n=pN(v); if(n===null) return '—'; return (/value|cost/i.test(String(lbl))||n>=1e6)?fmtRaw(n):Number(Math.round(n)).toLocaleString(); }

  // ── Weekly Sales Parsing ───────────────────────────────────────────────────
  const ws       = data.weeklySales||[];
  // Col layout: B(0)=section, C(1)=row label, D(2)=W1, E(3)=W2, F(4)=W3, G(5)=W4, H(6)=W5
  const WK_COLS  = [2,3,4,5,6];
  const wsHdrR   = ws.find(r=>WK_COLS.some(ci=>/week\s*\d/i.test(String(r?.[ci]||''))));
  const wsDateR  = ws.find(r=>WK_COLS.some(ci=>/\d+(st|nd|rd|th)/i.test(String(r?.[ci]||''))));
  const wsSalesR = ws.find(r=>/sales.*million|million.*sales/i.test(String(r?.[1]||'')));
  const wsADSR   = ws.find(r=>/ave.*daily|daily.*sales/i.test(String(r?.[1]||'')));
  const wsDiamI  = ws.findIndex(r=>/diamond/i.test(String(r?.[0]||'')));
  const wsSilvI  = ws.findIndex(r=>/silver/i.test(String(r?.[0]||'')));
  const wkLabels = wsHdrR?WK_COLS.map(ci=>String(wsHdrR[ci]||'').replace(/^week\s*/i,'W').replace(/\s/,'').trim()||`W${ci-1}`):['W1','W2','W3','W4','W5'];
  const wkDates  = wsDateR?WK_COLS.map(ci=>String(wsDateR[ci]||'')):['1ST-7TH','8TH-14TH','15TH-21ST','22ND-28TH','29TH-30TH'];
  const wkSales  = wsSalesR?WK_COLS.map(ci=>pN(wsSalesR[ci])):[801,758,747,772,201];
  const wkADS    = wsADSR?WK_COLS.map(ci=>pN(wsADSR[ci])):[114,108,107,110,101];
  function wkDayCount(s){ const m=String(s).match(/(\d+)[^\d]+(\d+)/); return m?+m[2]-+m[1]+1:7; }
  const wkDays   = wkDates.map(wkDayCount);
  const wkIsFull = wkDays.map(d=>d>=5);
  const peakWkI  = wkSales.reduce((mi,v,i)=>v!=null&&(mi<0||v>wkSales[mi])?i:mi,-1);
  const weakWkI  = wkSales.reduce((mi,v,i)=>wkIsFull[i]&&v!=null&&(mi<0||v<wkSales[mi])?i:mi,-1);
  function getStockRows(si){ if(si<0) return []; const rows=[]; for(let i=si+1;i<ws.length;i++){ const r=ws[i]; if(!r) break; if(r[0]&&String(r[0]).trim()&&!/diamond|silver/i.test(String(r[0]))) break; if(r[1]&&String(r[1]).trim()) rows.push({cat:String(r[1]),vals:WK_COLS.map(ci=>{const v=parseFloat(String(r[ci]||'').replace('%','')); return isNaN(v)?null:v;})}); } return rows; }
  const wsDiamond= getStockRows(wsDiamI);
  const wsSilver = getStockRows(wsSilvI);
  function wsAvg(vals){ const v=vals.filter(x=>x!=null); return v.length?v.reduce((a,b)=>a+b,0)/v.length:null; }

  // ── Next month label ───────────────────────────────────────────────────────
  const ALL_MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const mIdx2    = ALL_MONTHS.indexOf(mLabel);
  const nextML   = mIdx2>=0?ALL_MONTHS[(mIdx2+1)%12]:'JUL';
  const nextMFull= MFULL[nextML]||nextML;

  // Revenue Overview presenter month data
  const rovMonths= rovCols.slice(0,6);

  // ── Logo ──────────────────────────────────────────────────────────────────
  // Await logo load so slides are built with logo already resolved
  if (!window._presLogoUrl) {
    try {
      const res = await fetch('./foodco-logo.png');
      if (res.ok) {
        const blob = await res.blob();
        await new Promise(resolve => {
          const img = new Image(); const burl = URL.createObjectURL(blob);
          img.onload = () => { const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); const id=ctx.getImageData(0,0,c.width,c.height); const px=id.data; for(let i=0;i<px.length;i+=4){if(px[i]>235&&px[i+1]>235&&px[i+2]>235)px[i+3]=0;} ctx.putImageData(id,0,0); URL.revokeObjectURL(burl); window._presLogoUrl=c.toDataURL('image/png'); resolve(); };
          img.onerror = () => { URL.revokeObjectURL(burl); resolve(); };
          img.src = burl;
        });
      }
    } catch(e) {}
  }

  const LOGO_HTML = window._presLogoUrl
    ? `<img src="${window._presLogoUrl}" class="ps-logo" alt="FoodCo"/>`
    : `<span class="ps-logo-text">FoodCo</span>`;

  // ── Slide builder helpers ──────────────────────────────────────────────────
  const TABS=['REVENUE','GROWTH','OUTLETS','CATEGORY','COMPARISON'];
  function tabBar(active){
    return `<div class="ps-tabbar">${TABS.map(t=>`<div class="ps-tab${t===active?' ps-tab-on':''}">${t}</div>`).join('')}</div><div class="ps-orange-stripe"></div>`;
  }
  function slideHeader(active,title,pg){
    return `${tabBar(active)}<div class="ps-titlerow"><div><div class="ps-title">${esc(title)}</div><div class="ps-title-accent"></div></div>${LOGO_HTML}<span class="ps-pgnum">${String(pg).padStart(2,'0')}</span></div>`;
  }
  function kpiCard(label,val,col,bg,border){
    return `<div class="ps-kpi-card" style="border-color:${border};background:${bg}"><div class="ps-kpi-label">${esc(label)}</div><div class="ps-kpi-val" style="color:${col}">${esc(val)}</div></div>`;
  }
  function sLabel(text,orange=false){
    return `<div class="ps-slabel" style="color:${orange?'#ea580c':'#166534'}">${esc(text)}<div class="ps-slabel-bar"></div></div>`;
  }
  function table(headers,rows,orangeHdr=false,compact=false){
    const hbg=orangeHdr?'#ea580c':'#166534';
    // Infer per-column alignment from first data row so headers match data
    const firstRow=rows[0]||[];
    const hAligns=headers.map((_,i)=>{
      if(i===0) return 'left';
      const c=firstRow[i];
      if(typeof c==='object'&&c?.style&&/right/.test(c.style)) return 'right';
      if(typeof c==='object'&&c?.style&&/center/.test(c.style)) return 'center';
      return 'center';
    });
    return `<div class="ps-tbl-wrap${compact?' ps-compact':''}"><table class="ps-tbl"><thead><tr>${headers.map((h,i)=>`<th style="background:${hbg};text-align:${hAligns[i]}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,ri)=>`<tr class="${ri%2===1?'ps-alt':''}">${r.map(c=>{ const isObj=typeof c==='object'&&c!==null; const txt=isObj?c.text:c; const sty=isObj?`style="${c.style||''}"`:''  ; return `<td ${sty}>${esc(txt)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function statusCell(v){ const s=sColor(v); return {text:s.lbl,style:`color:${s.c};background:${s.bg};font-weight:700;text-align:center`}; }
  function numCell(v,col){ return {text:String(v||'—'),style:`text-align:right${col?`;color:${col}`:''}` }; }
  function pctCell(v){ const n=normPct(v); const col=n!=null?(n>=90?'#166534':n>=80?'#D97706':'#DC2626'):'#6B7280'; return {text:n!=null?`${n.toFixed(1)}%`:'—',style:`text-align:right;font-weight:700;color:${col}`}; }

  // ── SVG Donut chart (r≈15.915 → circumference≈100, % values work directly) ──
  function svgDonut(smP, rstP){
    const sm=parseFloat(smP)||0, rst=parseFloat(rstP)||0;
    return `<div style="display:flex;align-items:center;gap:18px">
      <svg viewBox="0 0 36 36" width="120" height="120">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" stroke-width="5"/>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#166534" stroke-width="5"
          stroke-dasharray="${sm.toFixed(1)} ${(100-sm).toFixed(1)}" stroke-dashoffset="25"/>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ea580c" stroke-width="5"
          stroke-dasharray="${rst.toFixed(1)} ${(100-rst).toFixed(1)}" stroke-dashoffset="${(25+sm).toFixed(1)}"/>
        <text x="18" y="16" text-anchor="middle" font-size="6.5" fill="#166534" font-weight="bold">${sm.toFixed(0)}%</text>
        <text x="18" y="23" text-anchor="middle" font-size="4" fill="#6B7280">SM</text>
      </svg>
      <div style="font-size:0.9em;line-height:2.1">
        <div style="display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;background:#166534;border-radius:3px;flex-shrink:0;display:inline-block"></span><strong style="color:#166534">Supermarket</strong> &nbsp;${sm.toFixed(1)}%</div>
        <div style="display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;background:#ea580c;border-radius:3px;flex-shrink:0;display:inline-block"></span><strong style="color:#ea580c">Restaurant</strong> &nbsp;${rst.toFixed(1)}%</div>
      </div>
    </div>`;
  }

  // ── Bar chart (CSS-based) — value label floats above each bar ────────────
  function barChart(labels,values,title){
    const max=Math.max(...values,0.01);
    const bars=labels.map((lb,i)=>{
      const h=Math.max(4,Math.round(values[i]/max*100));
      const v=values[i]!=null?`N${values[i].toFixed(2)}B`:'';
      return `<div class="ps-bar-col"><div class="ps-bar-inner"><div class="ps-bar-body" style="height:${h}%"><span class="ps-bar-val">${v}</span></div></div><div class="ps-bar-lbl">${esc(lb)}</div></div>`;
    }).join('');
    return `<div class="ps-chart-wrap"><div class="ps-chart-title">${esc(title)}</div><div class="ps-bars">${bars}</div></div>`;
  }

  // ── Slides ────────────────────────────────────────────────────────────────
  const SLIDES=[];

  // Slide 1: Cover
  SLIDES.push(`<div class="ps-slide ps-cover">
    <div class="ps-cover-bg"></div>
    <div class="ps-cover-body">
      ${window._presLogoUrl?`<img src="${window._presLogoUrl}" class="ps-cover-logo" alt="FoodCo"/>`:`<div class="ps-cover-logo-text">FoodCo</div>`}
      <div class="ps-cover-line top"></div>
      <div class="ps-cover-title">${fullMonth.toUpperCase()} 2026 SALES REPORT</div>
      <div class="ps-cover-sub">FOODCO NIGERIA</div>
      <div class="ps-cover-line"></div>
      <div class="ps-cover-presenter">Presented by <strong>Ayodele Adio</strong></div>
      <div class="ps-cover-role">Head, Sales Operations</div>
      <div class="ps-cover-date">${fullMonth} 2026</div>
    </div>
    <div class="ps-cover-footer"></div>
  </div>`);

  // Slide 2: Executive Overview
  SLIDES.push(`<div class="ps-slide">
    ${tabBar('')}
    <div class="ps-titlerow"><div><div class="ps-title" style="color:#166534">EXECUTIVE OVERVIEW</div><div class="ps-title-accent"></div></div>${LOGO_HTML}</div>
    <div class="ps-body ps-exec-grid">
      ${[
        {n:'01',name:'REVENUE',  desc:'YTD Revenue Performance, Core Business Overview, and Monthly Revenue Trends',col:'#166534',bg:'#F0FDF4'},
        {n:'02',name:'GROWTH',   desc:'Period Growth Analysis, Year-over-Year comparisons, and Same Store performance',col:'#ea580c',bg:'#FFF7ED'},
        {n:'03',name:'OUTLETS',  desc:'Outlet Performance, Regional Analysis, Area Leaders, and Top 5 Store Rankings',col:'#166534',bg:'#F0FDF4'},
        {n:'04',name:'CATEGORY', desc:'Category Sales YTD, June Category Performance, Target Achievement, and Weekly Analysis',col:'#ea580c',bg:'#FFF7ED'},
      ].map(q=>`<div class="ps-exec-card" style="background:${q.bg};border-left:6px solid ${q.col}">
        <div class="ps-exec-num" style="color:${q.col}">${q.n}</div>
        <div class="ps-exec-name" style="color:${q.col}">${q.name}</div>
        <div class="ps-exec-desc">${q.desc}</div>
      </div>`).join('')}
    </div>
    <div class="ps-pgnum">02</div>
  </div>`);

  // Slide 3: Revenue KPIs
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('REVENUE',`YTD Revenue ${fmtBil(ytdTot)} with ${fullMonth} at ${fmtBil(lastV)}`,3)}
    <div class="ps-body">
      <div class="ps-kpi-row" style="margin-bottom:12px">
        ${kpiCard(`${fullMonth.toUpperCase()} REVENUE`,fmtBil(lastV),'#166534','#F0FDF4','#166534')}
        ${kpiCard('YTD REVENUE',fmtBil(ytdTot),'#166534','#F0FDF4','#166534')}
        ${kpiCard('PEAK MONTH',`${peakLb.toUpperCase()} ${fmtBil(peakV)}`,'#ea580c','#FFF7ED','#ea580c')}
        ${kpiCard(`${fullMonth.toUpperCase()} vs PREV`,momR!=null?`${momR>=0?'+':''}${momR.toFixed(1)}%`:'—',momR!=null&&momR>=0?'#166534':'#DC2626',momR!=null&&momR>=0?'#F0FDF4':'#FEE2E2',momR!=null&&momR>=0?'#166534':'#DC2626')}
      </div>
      <div class="ps-split">
        <div style="flex:1.8">${revVs.length?barChart(revLbs,revVs,'Monthly Revenue 2026 (Billion Naira)'):'<div class="ps-no-data">No revenue data</div>'}</div>
        <div class="ps-insights" style="flex:1">
          <div class="ps-insight-title">KEY INSIGHTS</div>
          ${peakLb&&peakV?`<div class="ps-insight-item"><span class="ps-insight-dot" style="background:#166534"></span><span><strong>${peakLb} 2026</strong> was the peak month at <strong>${fmtBil(peakV)}</strong></span></div>`:''}
          ${momR!=null?`<div class="ps-insight-item"><span class="ps-insight-dot" style="background:${momR>=0?'#166534':'#DC2626'}"></span><span><strong style="color:${momR>=0?'#166534':'#DC2626'}">${fullMonth}</strong> ${momR<0?'declined':'grew'} ${Math.abs(momR).toFixed(1)}% from previous month to <strong>${fmtBil(lastV)}</strong></span></div>`:''}
          ${q1a&&q2a?`<div class="ps-insight-item"><span class="ps-insight-dot" style="background:#6B7280"></span><span>Q2 average: <strong>${fmtBil(q2a)}</strong> vs Q1: <strong>${fmtBil(q1a)}</strong></span></div>`:''}
        </div>
      </div>
    </div>
  </div>`);

  // Slide 4: Core vs Other Business
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('REVENUE',`Core Business: Supermarket ${fmtBig(smJunV)}, Restaurant ${fmtBig(rstJunV)}`,4)}
    <div class="ps-body" style="gap:10px">
      <div class="ps-split" style="flex:1;gap:20px;min-height:0">
        <div style="flex:1.3;display:flex;flex-direction:column;gap:6px;overflow:hidden">
          <div class="ps-section-tag">CORE BUSINESS (Million)</div>
          ${rovMonths.length?table(
            ['Business',...rovMonths],
            coreBiz.map(r=>{ const isT=/total/i.test(r[0]); return [
              {text:r[0],style:isT?'font-weight:700':''},
              ...rovMonths.map((_,ci)=>({text:rovIdx[ci]!=null?String(r[rovIdx[ci]]||'—'):String(r[ci+1]||'—'),style:`text-align:right${isT?';font-weight:700;background:#DCFCE7':''}`})),
            ]; })
          ):`<p class="ps-no-data">Data columns not detected</p>`}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden">
          <div class="ps-section-tag" style="color:#ea580c">OTHER BUSINESSES (Million)</div>
          ${otherBiz.length?table(
            ['Business','MAY','JUN','Change'],
            otherBiz.map(r=>{
              const mV=mayIdx>=0&&rovIdx[mayIdx]!=null?pN(r[rovIdx[mayIdx]]):pN(r[mayIdx+1]);
              const jV=junIdx>=0&&rovIdx[junIdx]!=null?pN(r[rovIdx[junIdx]]):pN(r[junIdx+1]);
              const chg=(mV&&jV&&mV!==0)?(jV-mV)/mV*100:null;
              return [r[0],{text:mV!=null?String(mV):'—',style:'text-align:right'},{text:jV!=null?String(jV):'—',style:'text-align:right'},{text:chg!=null?`${chg>=0?'+':''}${chg.toFixed(1)}%`:'—',style:`text-align:right;font-weight:700;color:${chg!=null&&chg>=0?'#166534':'#DC2626'}`}];
            }),
            true
          ):`<p class="ps-no-data">Other business data not available</p>`}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:18px;flex-shrink:0;padding-top:4px">
        ${smPct&&rstPct?svgDonut(smPct,rstPct):''}
        ${totJunV?`<div class="ps-insight-banner" style="flex:1;margin:0"><strong>${fullMonth} Total Revenue: ${fmtBig(totJunV)}</strong> &nbsp;|&nbsp; Supermarket contributed <strong style="color:#166534">${smPct||'—'}%</strong> &nbsp;|&nbsp; Restaurant <strong style="color:#ea580c">${rstPct||'—'}%</strong> &nbsp;|&nbsp; All other business lines declined from May</div>`:''}
      </div>
    </div>
  </div>`);

  // Slide 5: Growth
  const growKpis=[
    {lbl:`${latestRg?.[0]||''} VALUE YoY`, v:latestRg?.[3]},
    {lbl:`${latestRg?.[0]||''} VOLUME YoY`,v:latestRg?.[4]},
    {lbl:'BIZ YTD GROWTH',                 v:ytdRg?.[3]},
    {lbl:'SAME STORE YTD',                 v:ssRg?.[3]},
  ].filter(k=>k.v!=null);
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('GROWTH','REVENUE & GROWTH',5)}
    <div class="ps-body">
      <div class="ps-kpi-row">${growKpis.map(k=>{ const n=pN(k.v); const col=n!=null&&n>=0?'#166534':'#DC2626'; const bg=n!=null&&n>=0?'#F0FDF4':'#FEE2E2'; return kpiCard(k.lbl,yoyFmt(k.v),col,bg,col); }).join('')}</div>
      ${sLabel('MONTHLY GROWTH PERFORMANCE')}
      ${table(['PERIOD','2026 (M)','2025 (M)','VAL YoY%','VOL YoY%','SAME STORE%'],
        rgRows.map(r=>{ const isY=/ytd/i.test(r[0]); const v3=pN(r[3]),v4=pN(r[4]),v5=pN(r[5]);
          return [
            {text:r[0],style:isY?'font-weight:700;background:#DCFCE7':''},
            {text:r[1]?Number(r[1]).toLocaleString():'—',style:`text-align:right${isY?';font-weight:700;background:#DCFCE7':''}`},
            {text:r[2]?Number(r[2]).toLocaleString():'—',style:`text-align:right${isY?';background:#DCFCE7':''}`},
            {text:yoyFmt(r[3]),style:`text-align:right;font-weight:700;color:${yoyColor(r[3])}${isY?';background:#DCFCE7':''}`},
            {text:yoyFmt(r[4]),style:`text-align:right;font-weight:700;color:${yoyColor(r[4])}${isY?';background:#DCFCE7':''}`},
            {text:yoyFmt(r[5]),style:`text-align:right;font-weight:700;color:${yoyColor(r[5])}${isY?';background:#DCFCE7':''}`},
          ]; })
      )}
    </div>
  </div>`);

  // Slide 6: Outlet Performance
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('OUTLETS',`OUTLET PERFORMANCE · ${gAch!=null?gAch.toFixed(1)+'% of Target':'Overview'}`,6)}
    <div class="ps-body ps-split" style="gap:16px;align-items:flex-start">
      <div class="ps-global-kpi" style="background:${sColor(globalOut?.[5]).bg};border:2px solid ${sColor(globalOut?.[5]).c}">
        <div class="ps-gkpi-label">GLOBAL ACHIEVEMENT</div>
        <div class="ps-gkpi-val" style="color:${sColor(globalOut?.[5]).c}">${gAch!=null?gAch.toFixed(1)+'%':'—'}</div>
        <div class="ps-gkpi-status" style="color:${sColor(globalOut?.[5]).c}">${sColor(globalOut?.[5]).lbl}</div>
        ${globalOut?`<div class="ps-gkpi-detail">Target: ${fmtRaw(globalOut[1])}<br/>Actual: ${fmtRaw(globalOut[2])}</div>`:''}
      </div>
      <div style="flex:1">
        ${table(['OUTLET','TARGET','ACTUAL','DIFF','ACH%','STATUS'],
          [...(globalOut?[[{text:'GLOBAL',style:'font-weight:700;background:#DCFCE7'},numCell(fmtRaw(globalOut[1]),''),numCell(fmtRaw(globalOut[2]),''),numCell(fmtRaw(globalOut[4]),''),pctCell(globalOut[5]),statusCell(globalOut[5])]]:[]),
          ...outRows.slice(0,16).map(r=>[ r[0], numCell(fmtRaw(r[1]),''), numCell(fmtRaw(r[2]),''), numCell(fmtRaw(r[4]),''), pctCell(r[5]), statusCell(r[5]) ]),
        ], false, true)}
      </div>
    </div>
  </div>`);

  // Slide 7: Regional Performance
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('OUTLETS','REGIONAL PERFORMANCE',7)}
    <div class="ps-body">
      <div class="ps-region-cards">${regions.map(r=>{ const s=sColor(r[5]??r[4]); const pv=normPct(r[5]??r[4]); return `<div class="ps-region-card" style="border-left:6px solid ${s.c};background:${s.bg}"><div class="ps-reg-name" style="color:${s.c}">${esc(r[0])}</div><div class="ps-reg-pct" style="color:${s.c}">${pv!=null?Math.round(pv)+'%':'—'}</div><div class="ps-reg-detail">Target: ${fmtRaw(r[3])}<br/>Actual: ${fmtRaw(r[2])}</div></div>`; }).join('')}</div>
      ${sLabel('REGIONAL SALES SUMMARY')}
      ${table(['REGION','ACTUAL SALES','TARGET','DIFF','ACH%','STATUS'],
        regions.map(r=>[ r[0], numCell(fmtRaw(r[2]),''), numCell(fmtRaw(r[3]),''), numCell(fmtRaw(r[4]),''), pctCell(r[5]??r[4]), statusCell(r[5]??r[4]) ])
      )}
    </div>
  </div>`);

  // Slide 8: Area Leaders — split into 2 pages if data is large
  const AL_PER = 20;
  const alChunks = areaRows.length > AL_PER
    ? [areaRows.slice(0, AL_PER), areaRows.slice(AL_PER)]
    : [areaRows];
  alChunks.forEach((chunk, ci) => {
    const suffix = alChunks.length > 1 ? ` (${ci+1}/${alChunks.length})` : '';
    const pgN = SLIDES.length + 1;
    SLIDES.push(`<div class="ps-slide">
    ${slideHeader('OUTLETS',`AREA LEADERS PERFORMANCE${suffix}`,pgN)}
    <div class="ps-body">
      ${table(['LEADER','OUTLET','TARGET','ACTUAL','DIFF','ACH%','STATUS'],
        chunk.map(r=>[ {text:r.leader,style:r.leader?'color:#166534;font-weight:700':''}, {text:r.outlet,style:r.isTotal?'font-weight:700':''}, numCell(fmtRaw(r.target),''), numCell(fmtRaw(r.actual),''), numCell(fmtRaw(r.diff),''), pctCell(r.pct), statusCell(r.pct) ]),
        false, true
      )}
    </div>
  </div>`);
  });

  // Slide 9: Top 5 Stores (static fallback — TopStores sheet structure varies)
  const topStores=data.topStores||[];
  const tsHdrI=topStores.findIndex(r=>r?.some(c=>/jan|feb|mar/i.test(String(c))));
  const tsMH=tsHdrI>=0?topStores[tsHdrI]:[];
  const tsRanks=topStores.filter(r=>r?.[0]&&/^#?\d+$/i.test(String(r[0]).trim())).slice(0,5);
  const tsMths=[{l:'JAN'},{l:'FEB'},{l:'MAR'},{l:'APR'},{l:'MAY'},{l:'JUN'}].map(m=>{const i=tsMH.findIndex(c=>new RegExp(m.l,'i').test(String(c)));return{...m,ni:i,vi:i+1};}).filter(m=>m.ni>=0);
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('OUTLETS',`TOP 5 STORES — ${fullMonth.toUpperCase()} PERFORMANCE`,9)}
    <div class="ps-body">
      ${tsRanks.length?table(
        ['RANK',...tsMths.map(m=>m.l)],
        tsRanks.map((r,ri)=>[ {text:`#${ri+1}`,style:'font-weight:700;color:#ea580c;text-align:center'}, ...tsMths.map(m=>({text:`${m.ni>=0&&r[m.ni]?r[m.ni]:''} ${m.vi>=0&&r[m.vi]?fmtRaw(r[m.vi]):''}`.trim()||'—',style:'text-align:center;font-size:0.82em'})) ])
      ):`<p class="ps-no-data">Top stores data not available in current sheet</p>`}
      ${tsRanks.length&&tsMths.some(m=>/jun/i.test(m.l))?`<div class="ps-insight-banner" style="margin-top:12px"><strong>JUNE TOP STORES: </strong>${tsRanks.slice(0,5).map((r,i)=>{ const jm=tsMths.find(m=>/jun/i.test(m.l)); return jm&&r[jm.ni]?`#${i+1} ${r[jm.ni]} (${fmtRaw(r[jm.vi])})`:''}).filter(Boolean).join('  ·  ')}</div>`:''}
    </div>
  </div>`);

  // Slide 10: Category YTD
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('CATEGORY','CATEGORY SALES YTD',10)}
    <div class="ps-body">
      ${sLabel('DEPARTMENT PERFORMANCE BY MONTH')}
      ${table(['DEPARTMENT',...catYCols],
        catYRows.map(r=>{ const isT=/total/i.test(r[0]); return [ {text:r[0],style:isT?'font-weight:700':''}, ...catYCols.map((_,i)=>({text:fmtRaw(r[i+1]),style:`text-align:right${isT?';font-weight:700;background:#DCFCE7':''}` })) ]; })
      )}
      <div class="ps-kpi-row" style="margin-top:10px">
        ${catYRows.filter(r=>!/total/i.test(r[0])).slice(0,4).map(r=>kpiCard(String(r[0]),fmtRaw(r[r.length-1]),'#166534','#F0FDF4','#166534')).join('')}
      </div>
    </div>
  </div>`);

  // Slide 11: June Category Performance
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('CATEGORY',`${fullMonth.toUpperCase()} CATEGORY PERFORMANCE`,11)}
    <div class="ps-body">
      ${sLabel(`${fullMonth.toUpperCase()} vs PREV MONTH TARGET ACHIEVEMENT`,true)}
      ${catLRows.length?table(
        ['DEPARTMENT',...catLCols],
        catLRows.map(r=>{ const isG=/global|total/i.test(r[0]); return [ {text:r[0],style:isG?'font-weight:700;background:#DCFCE7':''}, ...catLCols.map((_,j)=>{ const v=r[j+1]; const isA=catLCols[j]?.includes('%'); const n=pN(v); const col=isA&&n!=null?(n>=90?'#166534':n>=80?'#D97706':'#DC2626'):'#374151'; return {text:isA?(n!=null?`${n.toFixed(1)}%`:'—'):fmtRaw(v),style:`text-align:right;color:${col}${isG?';font-weight:700;background:#DCFCE7':''}` }; }) ]; })
      ):`<p class="ps-no-data">Category performance data not available</p>`}
    </div>
  </div>`);

  // Slide 12: Category Achievement Trends
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('CATEGORY','CATEGORY ACHIEVEMENT TRENDS',12)}
    <div class="ps-body">
      ${sLabel('JUNE CATEGORY STATUS & KEY OBSERVATIONS')}
      ${catLRows.length?table(
        ['DEPARTMENT',...catLCols,'STATUS','OBSERVATION'],
        catLRows.map(r=>{ const isG=/global|total/i.test(r[0]);
          const achI=catLCols.findIndex(c=>/%/i.test(String(c)));
          const achV=achI>=0?r[achI+1]:null;
          const obs={'household':'Lowest — seasonal dip post-Ileya','fresh food':'Sharp decline — supply review needed','cashier':'Below 80% — manning gap','3f':'Off May peak but stable','grocery':'Largest line — needs recovery','toiletries':'Most stable — hold strategy','h&b':'Moderate decline','entertainment':'Smallest line'};
          const obsKey=Object.keys(obs).find(k=>new RegExp(k,'i').test(r[0]))||'';
          return [ {text:r[0],style:isG?'font-weight:700;background:#DCFCE7':''},
            ...catLCols.map((_,j)=>{ const v=r[j+1]; const isA=catLCols[j]?.includes('%'); const n=pN(v); const col=isA&&n!=null?(n>=90?'#166534':n>=80?'#D97706':'#DC2626'):'#374151'; return {text:isA?(n!=null?`${n.toFixed(1)}%`:'—'):fmtRaw(v),style:`text-align:right;color:${col}${isG?';font-weight:700;background:#DCFCE7':''}`}; }),
            statusCell(achV),
            {text:isG?'All categories declined vs May':obs[obsKey]||'',style:'font-size:0.8em;color:#374151'},
          ]; })
      ):`<p class="ps-no-data">No data</p>`}
      <div class="ps-insight-banner" style="background:#1E3A2A;color:#fff;margin-top:8px"><strong style="color:#ea580c">KEY CONCERN: </strong>Household weakest (68%). Fresh Food and Cashier need urgent intervention. Only Toiletries above 80%.</div>
    </div>
  </div>`);

  // Slide 13: Weekly Sales (dynamic from WEEKLY SALES sheet)
  const wkTitle13 = peakWkI>=0&&wkSales[peakWkI]!=null
    ? `${fullMonth} Weekly Sales: ${wkLabels[peakWkI]} Peaks at N${Math.round(wkSales[peakWkI])}M`
    : `${fullMonth} Weekly Sales`;
  function stockColor(v){ return v!=null?(v>=90?'#166534':v>=85?'#15803d':v>=80?'#D97706':'#DC2626'):'#6B7280'; }
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('CATEGORY',wkTitle13,13)}
    <div class="ps-body">
      <div class="ps-week-cards">
        ${WK_COLS.map((_,i)=>{
          const s=wkSales[i],a=wkADS[i],isWeak=i===weakWkI,isPart=!wkIsFull[i];
          const col=isWeak?'#D97706':isPart?'#6B7280':'#166534';
          const bg=isWeak?'#FEF3C7':isPart?'#F3F4F6':'#F0FDF4';
          return `<div class="ps-week-card" style="border:2px solid ${col};background:${bg}">
            <div class="ps-wk-lbl" style="color:#6B7280">${wkLabels[i]}${wkDates[i]?` (${wkDates[i]})`:''}${isPart?'<br/><span style="font-size:0.72em;color:#6B7280">partial</span>':''}</div>
            <div class="ps-wk-sales" style="color:${col}">${s!=null?`N${Math.round(s)}M`:'—'}</div>
            <div class="ps-wk-ads" style="color:${col}">${a!=null?`N${Math.round(a)}M/day`:'—'}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="ps-split" style="gap:14px;flex:1;min-height:0">
        <div style="flex:1;overflow:hidden">
          ${wsDiamond.length?`
            <div class="ps-section-tag">DIAMOND LINES STOCK AVAILABILITY %</div>
            ${table(['CATEGORY',...wkLabels,'AVG'],wsDiamond.map(row=>[row.cat,...row.vals.map(v=>({text:v!=null?`${Math.round(v)}%`:'—',style:`text-align:center;font-weight:700;color:${stockColor(v)}`})),{text:(a=>a!=null?`${Math.round(a)}%`:'—')(wsAvg(row.vals)),style:'text-align:center;font-weight:700;background:#F0FDF4'}]))}
          `:'<p class="ps-no-data">Diamond Lines data not detected</p>'}
        </div>
        <div style="flex:1;overflow:hidden">
          ${wsSilver.length?`
            <div class="ps-section-tag" style="color:#ea580c">SILVER LINES STOCK AVAILABILITY %</div>
            ${table(['CATEGORY',...wkLabels,'AVG'],wsSilver.map(row=>[row.cat,...row.vals.map(v=>({text:v!=null?`${Math.round(v)}%`:'—',style:`text-align:center;font-weight:700;color:${stockColor(v)}`})),{text:(a=>a!=null?`${Math.round(a)}%`:'—')(wsAvg(row.vals)),style:'text-align:center;font-weight:700;background:#FFF7ED'}]),true)}
          `:'<p class="ps-no-data">Silver Lines data not detected</p>'}
        </div>
      </div>
      ${weakWkI>=0?`<div class="ps-insight-banner">${wkLabels[weakWkI]} was the weakest full week at N${Math.round(wkSales[weakWkI])}M. ${(()=>{const sfmx=wsSilver.reduce((mx,r)=>{const a=wsAvg(r.vals);return a!=null&&a>mx.a?{cat:r.cat,a}:mx;},{cat:'',a:-1});const sdmn=wsDiamond.reduce((mn,r)=>{const a=wsAvg(r.vals);return a!=null&&a<mn.a?{cat:r.cat,a}:mn;},{cat:'',a:101});return sfmx.cat?`Silver ${sfmx.cat} strongest at ${Math.round(sfmx.a)}%. Diamond ${sdmn.cat} needs improvement at ${Math.round(sdmn.a)}%.`:''})()}</div>`:''}
    </div>
  </div>`);

  // Slide 14: Departmental Growth Comparison
  const smVals=smRow?smRow.slice(1).map(pN).filter(v=>v!==null):[];
  const rstVals=rstRow?rstRow.slice(1).map(pN).filter(v=>v!==null):[];
  const smYTD=smVals.reduce((a,b)=>a+b,0); const rstYTD=rstVals.reduce((a,b)=>a+b,0);
  const totYTD=smYTD+rstYTD;
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('COMPARISON','DEPARTMENTAL GROWTH COMPARISON',14)}
    <div class="ps-body ps-split" style="gap:20px;align-items:flex-start">
      ${[{label:'SUPERMARKET',vals:smVals,col:'#166534',bg:'#F0FDF4',bd:'#166534'},{label:'RESTAURANT',vals:rstVals,col:'#ea580c',bg:'#FFF7ED',bd:'#ea580c'}].map(p=>{
        const latV=p.vals[p.vals.length-1]; const prevV2=p.vals[p.vals.length-2];
        const mom2=prevV2&&latV?(latV-prevV2)/prevV2*100:null;
        const ytdP=p.vals.reduce((a,b)=>a+b,0);
        return `<div style="flex:1"><div class="ps-dept-header" style="background:${p.col}">${p.label}</div>
          <div class="ps-kpi-row" style="margin:8px 0">${[
            {lbl:`${fullMonth.toUpperCase()} VALUE`,val:fmtBig(latV),col:p.col,bg:p.bg,bd:p.bd},
            {lbl:'YTD TOTAL',val:fmtBig(ytdP),col:p.col,bg:p.bg,bd:p.bd},
            {lbl:'VS PREV',val:mom2!=null?`${mom2>=0?'+':''}${mom2.toFixed(1)}%`:'—',col:mom2!=null&&mom2>=0?'#166534':'#DC2626',bg:mom2!=null&&mom2>=0?'#F0FDF4':'#FEE2E2',bd:mom2!=null&&mom2>=0?'#166534':'#DC2626'},
          ].map(k=>kpiCard(k.lbl,k.val,k.col,k.bg,k.bd)).join('')}</div>
          ${rovMonths.length?table(['METRIC',...rovMonths.slice(0,p.vals.length)],[[ {text:'Revenue (₦M)',style:`font-weight:700;color:${p.col}`}, ...p.vals.map((v,i)=>({text:fmtBig(v),style:`text-align:right;${i===p.vals.length-1?`font-weight:700;color:${p.col}`:''}`})) ]]):''}</div>`;
      }).join('')}
    </div>
    <div class="ps-insight-banner" style="background:#1E3A2A;color:#fff"><strong style="color:#AADDB0">YTD Combined: ${fmtBig(totYTD)}</strong> | Supermarket: ${fmtBig(smYTD)} (${totYTD?(smYTD/totYTD*100).toFixed(1):0}%) | Restaurant: ${fmtBig(rstYTD)} (${totYTD?(rstYTD/totYTD*100).toFixed(1):0}%)</div>
  </div>`);

  // Slide 15: YoY Comparison
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('COMPARISON','OUTLET YEAR-ON-YEAR PERFORMANCE',15)}
    <div class="ps-body ps-split" style="gap:16px;align-items:flex-start">
      <div style="flex:1">
        ${sLabel('TOP GROWERS')}
        ${yoyGrow.length?table(['OUTLET','2025 VAL','2026 VAL','DIFF','% VAL'],
          yoyGrow.slice(0,10).map(r=>{ const pv=yoyPct(r); return [ r[0], numCell(y25VI>=0?fmtRaw(r[y25VI]):fmtRaw(r[2]),''), numCell(y26VI>=0?fmtRaw(r[y26VI]):fmtRaw(r[4]),''), numCell(fmtRaw((pN(y26VI>=0?r[y26VI]:r[4])||0)-(pN(y25VI>=0?r[y25VI]:r[2])||0)),'#166534'), {text:pv!=null?`+${pv.toFixed(1)}%`:'—',style:'text-align:center;font-weight:700;color:#166534'} ]; })
        ):`<p class="ps-no-data">No YoY grower data</p>`}
      </div>
      <div style="flex:1">
        ${sLabel('DECLINERS',true)}
        ${yoyDec.length?table(['OUTLET','2025 VAL','2026 VAL','DIFF','% VAL'],
          yoyDec.slice(0,10).map(r=>{ const pv=yoyPct(r); return [ r[0], numCell(y25VI>=0?fmtRaw(r[y25VI]):fmtRaw(r[2]),''), numCell(y26VI>=0?fmtRaw(r[y26VI]):fmtRaw(r[4]),''), numCell(fmtRaw((pN(y26VI>=0?r[y26VI]:r[4])||0)-(pN(y25VI>=0?r[y25VI]:r[2])||0)),'#DC2626'), {text:pv!=null?`${pv.toFixed(1)}%`:'—',style:'text-align:center;font-weight:700;color:#DC2626'} ]; })
        ):`<p class="ps-no-data">No decliner data</p>`}
      </div>
    </div>
  </div>`);

  // Slide 16: Utilities
  SLIDES.push(`<div class="ps-slide">
    ${slideHeader('','UTILITIES & POWER COST',16)}
    <div class="ps-body">
      <div class="ps-kpi-row">${utilD.slice(0,4).map(r=>{ const lbl=String(r[0]||''); const n=pN(r[r.length-1]); const isN=/value|cost/i.test(lbl); const val=n!=null?(isN||n>=1e6?fmtRaw(n):Number(Math.round(n)).toLocaleString()):'—'; return kpiCard(lbl,val,'#ea580c','#FFF7ED','#ea580c'); }).join('')}</div>
      ${sLabel('UTILITY DETAILS BY MONTH',true)}
      ${table(['DESCRIPTION','JAN','FEB','MAR','APR','MAY','JUN'],
        utilD.map(r=>[ r[0], ...[1,2,3,4,5,6].map(ci=>({text:fmtUtil(r[0],r[ci]),style:'text-align:right'})) ])
      ,true)}
    </div>
  </div>`);

  // Slides 17 & 18: Action Plan (localStorage-backed, editable in-presentation)
  // Sentinel strings — goTo() rebuilds these dynamically so edits are reflected immediately
  const AP_JUN_KEY = `foodco_ap_${mLabel.toLowerCase()}`;
  const AP_JUL_KEY = `foodco_ap_${nextML.toLowerCase()}`;
  const defaultJunPlan=[['1','Launch Jumbo savings promotional push to sustain momentum','HSO',`${fullMonth} 15`,'HIGH','Revenue uplift vs May baseline — 125M WOW before promo period'],['2','Urgent intervention for Jericho, Gbagi, Lekki, Adegbayi, Akala, Ikotun on revenue','HSO',`${fullMonth} 30`,'HIGH','Restore 3 outlets to 85%+ achievement'],['3','Deliver 95% manning execution','HSO',`${fullMonth} 30`,'HIGH','Improve customer engagement'],['4','Continuous drive Cashier/Bread -17% decline','Operations Support Mgr',`${fullMonth} 30`,'HIGH','Reduce decline and recover to -10%'],['5','Drive initiative on High savings / High Pay Diesel cost reduction plan','Operations Support',`${fullMonth} 30`,'HIGH','Save N15M power costs'],['6','Strong follow up on Affordability campaign instore — Shelf talkers/Associate communication','Category Mgt Team',`${fullMonth} 30`,'HIGH','Improve customer perception on being most affordable'],['7','Initiate Corporate sales and Offcycle hamper production','Olufunmi',`${fullMonth} 15`,'MED','+20M sales revenue expected'],['8','Drive Chop Beta improved sales','Fisayo',`${fullMonth} 30`,'MED','Achieve +25% sales growth over previous month']];
  const defaultJulPlan=[['1',`Launch ${nextMFull} promotional push for end of month through first week in August`,'HSO',`${nextMFull} 15`,'HIGH','Revenue uplift'],['2','Execute two key intervention plan for Jericho, Gbagi, Lekki, Adegbayi, Akala, Ikotun on revenue','HSO',`${nextMFull} 15`,'HIGH','Restore 3 outlets to 82%+ achievement'],['3','Area Coach performance assessment twice monthly','HSO',`${nextMFull} 15, 30`,'HIGH','Enhance overall performance'],['4','Continuous drive Cashier/Bread -14% decline','Operations Support Mgr',`${nextMFull} 31`,'HIGH','Reduce decline and recover to -10%'],['5','Drive merchandising focus on raining season key items','Silas',`${nextMFull} 10`,'HIGH','Improve visibility and revenue'],['6','Execute Chop Beta/Grill offering campaign (Free drink)','Adio',`${nextMFull} 10`,'MED','Enhance revenue for 3F'],['7','Cashier manning status to hit 100%','Adio',`${nextMFull} 15`,'HIGH','Improve service delivery'],['8','Deliver 95% manning execution with HR - Godspower','HSO',`${nextMFull} 15`,'HIGH','Improve customer engagement and merchandising'],['9','Drive "HERE TO HELP CAMPAIGN" shopfloor team','HSO',`${nextMFull} 15`,'HIGH','Customer excitement']];

  function loadAP(key,fallback){ try{ const s=JSON.parse(localStorage.getItem(key)); return Array.isArray(s)&&s.length?s:fallback; }catch(e){return fallback;} }
  function buildAPSlide(monthLabel,planKey,fallback,pgN,isNext){
    const plan=loadAP(planKey,fallback);
    const hbg=isNext?'#ea580c':'#166534';
    const rows=plan.map((r,i)=>`<tr class="${i%2?'ps-alt':''}"><td style="text-align:center;font-weight:700;color:#ea580c;width:36px">${esc(r[0])}</td><td style="font-size:0.88em">${esc(r[1])}</td><td style="text-align:center;font-size:0.8em;white-space:nowrap">${esc(r[2])}</td><td style="text-align:center;font-size:0.8em;white-space:nowrap">${esc(r[3])}</td><td style="text-align:center;font-weight:700;font-size:0.88em;color:${r[4]==='HIGH'?'#DC2626':r[4]==='MED'?'#166534':'#6B7280'}">${esc(r[4])}</td><td style="font-size:0.8em;color:#374151">${esc(r[5])}</td></tr>`).join('');
    return `<div class="ps-slide">
      ${tabBar('')}
      <div class="ps-titlerow" style="position:relative">
        <div><div class="ps-title" style="color:#00843D;font-size:1.35em">ACTION SUMMARY — PRIORITIZED INITIATIVES FOR ${monthLabel}</div><div class="ps-title-accent" style="background:${hbg}"></div></div>
        ${LOGO_HTML}
        <button onclick="window._apEdit('${planKey}','${monthLabel}')" style="position:absolute;right:62px;top:50%;transform:translateY(-50%);background:${hbg};color:#fff;border:none;padding:5px 13px;border-radius:4px;cursor:pointer;font-size:0.8em;font-weight:700;z-index:5">✏ Edit</button>
        <span class="ps-pgnum">${pgN}</span>
      </div>
      <div class="ps-body" style="padding-top:4px">
        <div class="ps-tbl-wrap"><table class="ps-tbl" style="table-layout:fixed;width:100%"><thead><tr>
          <th style="background:${hbg};width:36px">#</th>
          <th style="background:${hbg};text-align:left">ACTION ITEM</th>
          <th style="background:${hbg};width:110px">OWNER</th>
          <th style="background:${hbg};width:90px">TIMELINE</th>
          <th style="background:${hbg};width:80px">PRIORITY</th>
          <th style="background:${hbg};text-align:left;width:220px">LIKELY IMPACT</th>
        </tr></thead><tbody>${rows}</tbody></table></div>
        <div style="position:absolute;bottom:6px;left:32px;font-size:0.72em;color:#9CA3AF">Sales Operations | Monthly Performance Report</div>
      </div>
    </div>`;
  }

  // Push sentinels — goTo() resolves them at render time
  SLIDES.push('__AP_JUN__');
  SLIDES.push('__AP_JUL__');
  // Capture slide indices for the resolver
  const AP_JUN_IDX = SLIDES.length - 2;
  const AP_JUL_IDX = SLIDES.length - 1;

  // Slide 18: Thank You
  SLIDES.push(`<div class="ps-slide ps-cover">
    <div class="ps-cover-bg"></div>
    <div class="ps-cover-body" style="justify-content:center;gap:16px">
      ${window._presLogoUrl?`<img src="${window._presLogoUrl}" class="ps-cover-logo" style="max-height:80px" alt="FoodCo"/>`:`<div class="ps-cover-logo-text">FoodCo</div>`}
      <div class="ps-cover-line" style="width:60%"></div>
      <div class="ps-cover-title" style="font-size:3.5em">THANK YOU</div>
      <div class="ps-cover-line"></div>
      <div class="ps-cover-sub" style="font-size:1.1em">FoodCo Nigeria Limited</div>
      <div class="ps-cover-role" style="font-size:0.9em">${fullMonth} 2026 Sales Report</div>
      <div class="ps-cover-presenter" style="margin-top:16px">BIZ YTD Growth: <strong>${yoyFmt(ytdRg?.[3])}</strong> &nbsp;·&nbsp; Global Achievement: <strong>${gAch!=null?gAch.toFixed(1)+'%':'—'}</strong> &nbsp;·&nbsp; Jun YoY: <strong>${yoyFmt(latestRg?.[3])}</strong></div>
    </div>
    <div class="ps-cover-footer"></div>
  </div>`);

  // ── CSS injection ─────────────────────────────────────────────────────────
  if(!document.getElementById('ps-styles')){
    const style=document.createElement('style');
    style.id='ps-styles';
    style.textContent=`
      /* ── Overlay shell ── */
      #ps-overlay{position:fixed;inset:0;z-index:99999;background:#111;display:flex;flex-direction:column;align-items:stretch;}
      #ps-progress{height:4px;background:#ea580c;transition:width .25s;flex-shrink:0;}
      #ps-stage{flex:1;position:relative;overflow:hidden;}
      #ps-frame{position:absolute;top:50%;left:50%;width:1280px;height:720px;background:#fff;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,.6);}
      #ps-close{position:absolute;top:12px;right:16px;z-index:10;background:rgba(0,0,0,.55);border:none;color:#fff;font-size:1.2em;cursor:pointer;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;}
      #ps-close:hover{background:rgba(234,88,12,.9);}
      /* ── Controls bar ── */
      #ps-controls{flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:16px;background:#1a1a1a;padding:10px 28px;border-top:1px solid #333;}
      #ps-controls button{background:none;border:1px solid #555;color:#ddd;font-size:1.05em;cursor:pointer;padding:6px 18px;border-radius:22px;transition:all .15s;}
      #ps-controls button:hover{background:#ea580c;border-color:#ea580c;color:#fff;}
      #ps-counter{color:#bbb;font-size:0.92em;min-width:70px;text-align:center;letter-spacing:.5px;}
      .ps-slide{width:1280px;height:720px;position:relative;background:#fff;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;display:flex;flex-direction:column;}
      /* ── Cover ── */
      .ps-cover{background:#0D3318;}
      .ps-cover-bg{position:absolute;inset:0;background:rgba(0,0,0,.38);}
      .ps-cover-body{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 80px;gap:10px;}
      .ps-cover-logo{max-height:260px;max-width:600px;object-fit:contain;}
      .ps-cover-logo-text{font-size:4em;font-weight:900;color:#AADDB0;letter-spacing:3px;}
      .ps-cover-line{width:72%;height:3px;background:#4ade80;margin:6px 0;}
      .ps-cover-title{font-size:3.2em;font-weight:900;color:#fff;text-align:center;letter-spacing:1px;line-height:1.15;}
      .ps-cover-sub{font-size:1.6em;color:#AADDB0;text-align:center;letter-spacing:4px;margin-top:4px;}
      .ps-cover-presenter{font-size:1.15em;color:#fff;text-align:center;margin-top:8px;}
      .ps-cover-role{font-size:1.1em;color:#AADDB0;text-align:center;}
      .ps-cover-date{font-size:0.95em;color:#AADDB0;text-align:center;}
      .ps-cover-footer{height:8px;background:#ea580c;position:absolute;bottom:0;left:0;right:0;}
      /* ── Tab bar ── */
      .ps-tabbar{display:flex;background:#166534;height:48px;flex-shrink:0;}
      .ps-tab{flex:1;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.88em;font-weight:600;letter-spacing:1.5px;position:relative;}
      .ps-tab-on{font-weight:900;}
      .ps-tab-on::after{content:'';position:absolute;bottom:0;left:0;right:0;height:4px;background:#ea580c;}
      .ps-orange-stripe{height:5px;background:#ea580c;flex-shrink:0;}
      /* ── Title row ── */
      .ps-titlerow{display:flex;align-items:center;justify-content:space-between;padding:10px 32px 5px;flex-shrink:0;}
      .ps-title{font-size:1.65em;font-weight:700;color:#00843D;line-height:1.2;}
      .ps-title-accent{width:60px;height:4px;background:#ea580c;margin-top:4px;}
      .ps-logo{height:44px;max-width:180px;object-fit:contain;}
      .ps-logo-text{font-size:1.1em;font-weight:900;color:#166534;}
      .ps-pgnum{position:absolute;bottom:7px;right:16px;font-size:0.78em;color:#9CA3AF;font-weight:600;}
      /* ── Body ── */
      .ps-body{flex:1;overflow:hidden;padding:6px 32px 22px;display:flex;flex-direction:column;gap:8px;}
      .ps-split{display:flex;flex-direction:row;gap:18px;flex:1;overflow:hidden;}
      /* ── Section label ── */
      .ps-slabel{font-size:0.9em;font-weight:800;color:#166534;letter-spacing:1px;flex-shrink:0;}
      .ps-slabel-bar{width:36px;height:3px;background:#ea580c;margin-top:3px;}
      .ps-section-tag{font-size:0.85em;font-weight:800;color:#ea580c;letter-spacing:1px;margin-bottom:5px;}
      /* ── Tables ── */
      .ps-tbl-wrap{overflow:hidden;flex:1;min-height:0;}
      .ps-tbl{width:100%;border-collapse:collapse;font-size:0.95em;}
      .ps-tbl thead th{color:#fff;padding:7px 10px;font-size:0.93em;font-weight:700;letter-spacing:.3px;white-space:nowrap;}
      .ps-tbl tbody td{padding:5px 10px;color:#374151;border-bottom:1px solid #E5E7EB;white-space:nowrap;font-variant-numeric:tabular-nums;}
      .ps-tbl tbody tr.ps-alt td{background:#F9FAFB;}
      .ps-tbl tbody tr:hover td{background:#F0FDF4;}
      /* Compact mode for dense slides */
      .ps-compact .ps-tbl{font-size:0.77em;}
      .ps-compact .ps-tbl thead th{padding:4px 8px;}
      .ps-compact .ps-tbl tbody td{padding:3px 8px;}
      /* ── KPI cards ── */
      .ps-kpi-row{display:flex;gap:12px;flex-shrink:0;}
      .ps-kpi-card{flex:1;border:2px solid;border-radius:5px;padding:10px 14px;min-width:0;}
      .ps-kpi-label{font-size:0.8em;color:#6B7280;font-weight:600;letter-spacing:.5px;margin-bottom:4px;}
      .ps-kpi-val{font-size:1.95em;font-weight:900;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      /* ── Global KPI box ── */
      .ps-global-kpi{width:190px;flex-shrink:0;border-radius:5px;padding:14px;text-align:center;}
      .ps-gkpi-label{font-size:0.78em;color:#6B7280;font-weight:600;letter-spacing:.5px;}
      .ps-gkpi-val{font-size:2.8em;font-weight:900;line-height:1.1;}
      .ps-gkpi-status{font-size:0.9em;font-weight:700;margin-top:3px;}
      .ps-gkpi-detail{font-size:0.8em;color:#6B7280;margin-top:8px;line-height:1.55;}
      /* ── Region cards ── */
      .ps-region-cards{display:flex;gap:12px;flex-shrink:0;margin-bottom:8px;}
      .ps-region-card{flex:1;border-radius:5px;padding:12px 16px;}
      .ps-reg-name{font-size:1.05em;font-weight:800;letter-spacing:.5px;}
      .ps-reg-pct{font-size:2.7em;font-weight:900;line-height:1.1;text-align:center;margin:4px 0;}
      .ps-reg-detail{font-size:0.85em;color:#6B7280;line-height:1.55;}
      /* ── Executive overview ── */
      .ps-exec-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:16px;flex:1;}
      .ps-exec-card{border-radius:6px;padding:24px 30px;}
      .ps-exec-num{font-size:3.4em;font-weight:900;line-height:1;}
      .ps-exec-name{font-size:1.6em;font-weight:800;margin:4px 0 8px;}
      .ps-exec-desc{font-size:1.08em;color:#374151;line-height:1.6;}
      /* ── Bar chart — label sits directly above its bar ── */
      .ps-chart-wrap{display:flex;flex-direction:column;height:100%;}
      .ps-chart-title{font-size:0.85em;color:#6B7280;margin-bottom:6px;text-align:center;}
      .ps-bars{display:flex;align-items:flex-end;flex:1;gap:8px;border-bottom:2px solid #E5E7EB;padding-bottom:0;}
      .ps-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;min-width:0;}
      .ps-bar-inner{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center;}
      .ps-bar-body{width:72%;background:#166534;border-radius:3px 3px 0 0;position:relative;min-height:4px;}
      .ps-bar-val{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-size:0.7em;color:#166534;font-weight:700;white-space:nowrap;padding-bottom:3px;}
      .ps-bar-lbl{font-size:0.75em;color:#6B7280;margin-top:5px;text-align:center;}
      /* ── Key insights ── */
      .ps-insights{display:flex;flex-direction:column;gap:14px;padding-left:10px;}
      .ps-insight-title{font-size:1.18em;font-weight:800;color:#00843D;margin-bottom:4px;}
      .ps-insight-item{display:flex;gap:10px;align-items:flex-start;font-size:1.0em;color:#374151;line-height:1.5;}
      .ps-insight-dot{width:5px;min-width:5px;height:100%;min-height:32px;border-radius:2px;margin-top:2px;}
      /* ── Week cards ── */
      .ps-week-cards{display:flex;gap:10px;flex-shrink:0;margin-bottom:8px;}
      .ps-week-card{flex:1;border-radius:5px;padding:14px;text-align:center;}
      .ps-wk-lbl{font-size:0.85em;color:#6B7280;margin-bottom:5px;}
      .ps-wk-sales{font-size:1.9em;font-weight:900;}
      .ps-wk-ads{font-size:0.9em;margin-top:4px;}
      /* ── Dept comparison ── */
      .ps-dept-header{background:#166534;color:#fff;padding:9px 14px;font-weight:800;font-size:1.05em;border-radius:4px 4px 0 0;letter-spacing:.5px;}
      /* ── Insight banner ── */
      .ps-insight-banner{background:#F0FDF4;border:1px solid #166534;border-radius:4px;padding:7px 14px;font-size:0.9em;color:#374151;flex-shrink:0;}
      .ps-no-data{color:#9CA3AF;font-style:italic;font-size:0.92em;padding:14px 0;}
    `;
    document.head.appendChild(style);
  }

  // ── DOM assembly ──────────────────────────────────────────────────────────
  const overlay=document.createElement('div'); overlay.id='ps-overlay';
  const progress=document.createElement('div'); progress.id='ps-progress';
  const stage=document.createElement('div'); stage.id='ps-stage';
  const frame=document.createElement('div'); frame.id='ps-frame';
  const controls=document.createElement('div'); controls.id='ps-controls';
  controls.innerHTML=`<button id="ps-prev">&#8592; Prev</button><span id="ps-counter">1 / ${SLIDES.length}</span><button id="ps-next">Next &#8594;</button>`;
  const closeBtn=document.createElement('button'); closeBtn.id='ps-close'; closeBtn.innerHTML='&#10005;'; closeBtn.title='Close (Esc)';
  stage.appendChild(frame); stage.appendChild(closeBtn);
  overlay.appendChild(progress); overlay.appendChild(stage); overlay.appendChild(controls);
  document.body.appendChild(overlay);

  // ── Scale frame to fill stage (controls bar is outside, never overlapping) ──
  function scaleFrame(){
    const controlsH=controls.offsetHeight||48;
    const sc=Math.min(window.innerWidth/1280,(window.innerHeight-3-controlsH)/720)*0.97;
    frame.style.transform=`translate(-50%,-50%) scale(${sc})`;
  }
  scaleFrame();
  window.addEventListener('resize',scaleFrame);

  // ── Slide navigation ──────────────────────────────────────────────────────
  let cur=0;
  function goTo(n){
    cur=Math.max(0,Math.min(SLIDES.length-1,n));
    window._presCur=cur;
    let html=SLIDES[cur];
    // Resolve action plan sentinels dynamically so edits show immediately
    if(html==='__AP_JUN__') html=buildAPSlide(`${fullMonth.toUpperCase()} 2026`,AP_JUN_KEY,defaultJunPlan,cur+1,false);
    if(html==='__AP_JUL__') html=buildAPSlide(`${nextMFull.toUpperCase()} 2026`,AP_JUL_KEY,defaultJulPlan,cur+1,true);
    frame.innerHTML=html;
    if(window._presLogoUrl){
      frame.querySelectorAll('.ps-cover-logo,.ps-logo').forEach(el=>{if(el.tagName==='IMG')el.src=window._presLogoUrl;});
    }
    document.getElementById('ps-counter').textContent=`${cur+1} / ${SLIDES.length}`;
    progress.style.width=`${((cur+1)/SLIDES.length)*100}%`;
  }
  window._presGoTo=goTo;
  goTo(0);
  document.getElementById('ps-prev').onclick=()=>goTo(cur-1);
  document.getElementById('ps-next').onclick=()=>goTo(cur+1);
  closeBtn.onclick=()=>{ document.body.removeChild(overlay); window.removeEventListener('resize',scaleFrame); document.removeEventListener('keydown',keyHandler); window._presGoTo=null; window._presCur=null; };
  function keyHandler(e){
    if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' ') goTo(cur+1);
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp') goTo(cur-1);
    else if(e.key==='Escape') closeBtn.onclick();
    else if(e.key==='Home') goTo(0);
    else if(e.key==='End') goTo(SLIDES.length-1);
  }
  document.addEventListener('keydown',keyHandler);
  // Click right half = next, left half = prev
  frame.addEventListener('click',e=>{ if(e.offsetX>640) goTo(cur+1); else goTo(cur-1); });
};

// Global tab switcher for exec report — must be global because onclick= in innerHTML can't see closure scope
window.erSwitchTab = function(id, btn) {
  document.querySelectorAll('.er-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.er-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('er-panel-' + id)?.classList.add('active');
  btn.classList.add('active');
};

function renderExecReport(data) {
  // ── Helpers ────────────────────────────────────────────────────────────────
  function pN(v) {
    if (v == null || v === '') return null;
    const n = parseFloat(String(v).replace(/[,\s₦NB]/g,'').replace(/%$/,''));
    return isNaN(n) ? null : n;
  }
  // fmtBig: input already in millions (Revenue Overview, Growth table use this)
  function fmtBig(v) {
    const n = pN(v); if (n === null) return '—';
    if (Math.abs(n) >= 1000) return `N${(n/1000).toFixed(2)}B`;
    if (Math.abs(n) >= 1)    return `N${n.toFixed(1)}M`;
    return `N${n.toFixed(2)}M`;
  }
  // fmtRaw: input in raw Naira (Outlets, Region, Category, YOY, Area sheets)
  function fmtRaw(v) {
    const n = pN(v); if (n === null) return '—';
    const abs = Math.abs(n), sign = n < 0 ? '-' : '';
    if (abs >= 1e9) return `${sign}N${(abs/1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}N${(abs/1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}N${(abs/1e3).toFixed(0)}K`;
    return `${sign}N${abs.toFixed(0)}`;
  }
  function fmtM(v, dp=1) {
    const n = pN(v); if (n === null) return v || '—';
    return n % 1 === 0 ? n.toLocaleString() : n.toFixed(dp);
  }
  function yoySpan(v) {
    const n = pN(v); if (n === null) return '<span class="er-muted">—</span>';
    const col = n >= 0 ? '#15803d' : '#dc2626';
    const s = String(v).includes('%') ? String(v) : `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
    return `<span style="color:${col};font-weight:700">${s}</span>`;
  }
  // Normalize sheet percentages: spreadsheet stores some as decimal (0.88=88%) some as pct (88.28)
  function normPct(v) {
    const n = pN(v);
    if (n === null) return null;
    return n < 2 ? n * 100 : n;
  }
  function statusBadge(v) {
    const n = normPct(v); if (n === null) return '<span class="er-muted">—</span>';
    let cls, label;
    if (n >= 100)      { cls = 'er-status-great';      label = 'GREAT'; }
    else if (n >= 90)  { cls = 'er-status-stable';     label = 'STABLE'; }
    else if (n >= 80)  { cls = 'er-status-weak';       label = 'WEAK'; }
    else               { cls = 'er-status-concerning'; label = 'CONCERNING'; }
    return `<span class="${cls}">${label}</span>`;
  }
  function pctSpan(v) {
    const n = normPct(v); if (n === null) return '<span class="er-muted">—</span>';
    const col = n >= 90 ? '#15803d' : n >= 80 ? '#d97706' : '#dc2626';
    return `<span style="color:${col};font-weight:700">${n.toFixed(1)}%</span>`;
  }
  function slideTitle(text) {
    return `<h2 class="er-slide-title">${text}</h2>`;
  }
  function kpiCard(label, value, sub, color='#15803d', bg='#f0fdf4') {
    return `<div class="er-kpi-card" style="background:${bg}">
      <div class="er-kpi-label">${label}</div>
      <div class="er-kpi-value" style="color:${color}">${value}</div>
      ${sub ? `<div class="er-kpi-sub">${sub}</div>` : ''}
    </div>`;
  }
  function insightBox(html, type='green') {
    return `<div class="er-insight er-insight--${type}">${html}</div>`;
  }

  // ── DATA PARSING ──────────────────────────────────────────────────────────
  const now = new Date().toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'});

  // Business YTD
  const ytdAll   = (data.businessYTD || []).filter(r => r?.[0]);
  const ytdMonths= ytdAll.filter(r => !['MONTH','YTD','TOTAL'].includes((r[0]||'').toUpperCase()));
  const ytdRow   = ytdAll.find(r => (r[0]||'').toUpperCase()==='YTD');
  const latestM  = ytdMonths[ytdMonths.length - 1];
  const latestLabel = latestM?.[0] || '';

  // ── REVENUE TAB ───────────────────────────────────────────────────────────
  // Executive Overview quadrant cards
  const execOverview = `
  <div class="er-slide">
    ${slideTitle('EXECUTIVE OVERVIEW')}
    <div class="er-quad-grid">
      <div class="er-quad er-quad--green">
        <div class="er-quad-num">01</div>
        <div class="er-quad-name">REVENUE</div>
        <div class="er-quad-desc">YTD Revenue Performance, Core Business Overview, and Monthly Revenue Trends across all business lines</div>
      </div>
      <div class="er-quad er-quad--orange">
        <div class="er-quad-num">02</div>
        <div class="er-quad-name">GROWTH</div>
        <div class="er-quad-desc">Period Growth Analysis, Year-over-Year comparisons, and Same Store performance metrics</div>
      </div>
      <div class="er-quad er-quad--green">
        <div class="er-quad-num">03</div>
        <div class="er-quad-name">OUTLETS</div>
        <div class="er-quad-desc">Outlet Performance, Regional Analysis, Area Leaders, and Top 5 Store Rankings</div>
      </div>
      <div class="er-quad er-quad--orange">
        <div class="er-quad-num">04</div>
        <div class="er-quad-name">CATEGORY</div>
        <div class="er-quad-desc">Category Sales YTD, Monthly Category Performance, Target Achievement, and Weekly Analysis</div>
      </div>
    </div>
  </div>`;

  // ── REVENUE: Core Business table ─────────────────────────────────────────
  const rov = data.revenueOverview || [];
  const rovHdr = rov.find(r => r?.slice(1).some(c => /jan|feb|mar|apr|may|jun/i.test(String(c))));
  const rovCols = rovHdr ? rovHdr.slice(1).filter(Boolean) : [];
  let coreBizRows = [], otherBizRows = [], inCore = false, inOther = false;
  for (const r of rov) {
    if (!r?.[0]) continue;
    if (/core business/i.test(r[0])) { inCore = true; inOther = false; continue; }
    if (/other.*business|other.*key/i.test(r[0])) { inOther = true; inCore = false; continue; }
    if (inCore && r.length >= 2) coreBizRows.push(r);
    if (inOther && r.length >= 2) otherBizRows.push(r);
  }
  const coreTotal = coreBizRows.find(r => /total/i.test(r[0]));
  const coreLast = coreBizRows.find(r => /supermarket|sm/i.test(r[0]));
  const restLast = coreBizRows.find(r => /restaurant|3f/i.test(r[0]));
  const coreHeadline = (coreLast && restLast)
    ? `Core Business: Supermarket ${fmtBig(coreLast[coreLast.length-1])}, Restaurant ${fmtBig(restLast[restLast.length-1])}`
    : 'Core Business Revenue';

  const coreSlide = rovCols.length ? `
  <div class="er-slide">
    ${slideTitle(coreHeadline)}
    <div class="er-two-col">
      <div>
        <div class="er-subsection-label">CORE BUSINESS (Million)</div>
        <div class="er-table-wrap"><table class="er-table">
          <thead><tr><th>Business</th>${rovCols.map(c=>`<th class="er-num">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${coreBizRows.map(r=>`<tr class="${/total/i.test(r[0])?'er-tot':''}">
              <td>${esc(r[0])}</td>${rovCols.map((_,i)=>`<td class="er-num">${r[i+1]||'—'}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      ${otherBizRows.length ? `<div>
        <div class="er-subsection-label er-orange">OTHER BUSINESSES (Million)</div>
        <div class="er-table-wrap"><table class="er-table er-table--orange-hdr">
          <thead><tr><th>Business</th>${rovCols.slice(-2).map(c=>`<th class="er-num">${esc(c)}</th>`).join('')}<th class="er-num">Change</th></tr></thead>
          <tbody>
            ${otherBizRows.filter(r=>!/total/i.test(r[0])).map(r=>{
              const prev=pN(r[r.length-2]), curr=pN(r[r.length-1]);
              const chg = (prev&&curr) ? ((curr-prev)/prev*100) : null;
              const chgHtml = chg!==null ? `<span style="color:${chg>=0?'#15803d':'#dc2626'};font-weight:700">${chg>=0?'+':''}${chg.toFixed(1)}%</span>` : '—';
              return `<tr><td>${esc(r[0])}</td>
                <td class="er-num">${r[r.length-2]||'—'}</td>
                <td class="er-num">${r[r.length-1]||'—'}</td>
                <td class="er-num">${chgHtml}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table></div>
      </div>` : ''}
    </div>
    ${coreTotal ? insightBox(`<strong>Total Revenue: ${fmtBig(coreTotal[coreTotal.length-1])}</strong> | Supermarket and Restaurant are the core drivers`) : ''}
  </div>` : '';

  // ── GROWTH tab ────────────────────────────────────────────────────────────
  const rg = data.revenueGrowth || [];
  const rgRows = rg.filter(r => r?.[0] && !/month|period|growth|header/i.test(r[0]) && r.length >= 4);
  const latestRg = rgRows[rgRows.length-2] || rgRows[0];
  const ytdRg = rgRows.find(r => /ytd/i.test(r[0]));
  const sameStoreRg = rgRows.find(r => /same.store|ytd/i.test(r[0]));

  const growthSlide = rgRows.length ? `
  <div class="er-slide">
    ${slideTitle(latestRg ? `${esc(latestRg[0])} Growth: Value ${latestRg[3]||''} YoY as Volume ${latestRg[4]||''} YoY` : 'Revenue & Growth')}
    <div class="er-kpi-row">
      ${latestRg ? kpiCard(`${esc(latestRg[0])} VALUE YoY`, yoySpan(latestRg[3]), '', '#d97706', '#fff7ed') : ''}
      ${latestRg ? kpiCard(`${esc(latestRg[0])} VOLUME YoY`, yoySpan(latestRg[4]), '', '#d97706', '#fff7ed') : ''}
      ${ytdRg ? kpiCard('BIZ YTD GROWTH', yoySpan(ytdRg[3]), '', '#d97706', '#fff7ed') : ''}
      ${sameStoreRg ? kpiCard('SAME STORE YTD', yoySpan(sameStoreRg[5]||sameStoreRg[3]), '', '#d97706', '#fff7ed') : ''}
    </div>
    <div class="er-table-wrap" style="margin-top:20px"><table class="er-table">
      <thead><tr><th>Period</th><th class="er-num">Value (M)</th><th class="er-num">Prev Year (M)</th><th class="er-num">Val YoY%</th><th class="er-num">Vol YoY%</th><th class="er-num">Same Store%</th></tr></thead>
      <tbody>
        ${rgRows.map(r=>`<tr class="${/ytd/i.test(r[0])?'er-tot':''}">
          <td>${esc(r[0])}</td>
          <td class="er-num">${fmtM(r[1])}</td><td class="er-num">${fmtM(r[2])}</td>
          <td class="er-num">${yoySpan(r[3])}</td><td class="er-num">${yoySpan(r[4])}</td>
          <td class="er-num">${yoySpan(r[5])}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>
  </div>` : '';

  // ── OUTLETS tab ───────────────────────────────────────────────────────────
  // Outlet sheet columns: A=OUTLET, B=TARGET, C=ACTUAL, D=TARGET(formula dup), E=DIFF, F=PCT(decimal for outlets, % for global)
  const allOutlets = (data.outletsPerf||[]).filter(r=>r?.[0]&&r[0]!=='OUTLET');
  const globalRow  = allOutlets.find(r=>/global/i.test(r[0]));
  const outletRows = allOutlets.filter(r=>!/global/i.test(r[0]));
  const globalAch  = normPct(globalRow?.[5]??globalRow?.[4]);
  const topPerformers = outletRows.filter(r=>normPct(r[5])>=95).slice(0,3);

  const outletSlide = outletRows.length ? `
  <div class="er-slide">
    ${slideTitle(`Outlet Performance: ${globalAch ? globalAch.toFixed(1)+'% of Target Achieved' : 'Monthly Overview'}`)}
    <div class="er-outlet-header">
      ${globalRow ? `<div class="er-global-achievement">
        <div class="er-ga-label">GLOBAL ACHIEVEMENT</div>
        <div class="er-ga-pct" style="color:${globalAch>=90?'#15803d':globalAch>=80?'#d97706':'#dc2626'}">${globalAch?.toFixed(1)}%</div>
        <div class="er-ga-sub">Target: ${fmtRaw(globalRow[1])} | Actual: ${fmtRaw(globalRow[2])}</div>
      </div>` : ''}
      ${topPerformers.length ? `<div class="er-top-performers">
        <div class="er-subsection-label">TOP PERFORMERS</div>
        <div class="er-top-perf-row">
          ${topPerformers.map(r=>`<div class="er-top-perf-chip">${esc(r[0])} <strong>${normPct(r[5])?.toFixed(1)}%</strong></div>`).join('')}
        </div>
      </div>` : ''}
    </div>
    <div class="er-table-wrap"><table class="er-table">
      <thead><tr><th>OUTLET</th><th class="er-num">TARGET</th><th class="er-num">ACTUAL</th><th class="er-num">DIFFERENCE</th><th class="er-num">ACH %</th><th>STATUS</th></tr></thead>
      <tbody>
        ${[...(globalRow?[globalRow]:[]), ...outletRows].map(r=>{
          const diff=pN(r[4]); const isGlobal=/global/i.test(r[0]);
          return `<tr class="${isGlobal?'er-tot':''}">
            <td style="font-weight:${isGlobal?700:400}">${esc(r[0])}</td>
            <td class="er-num">${fmtRaw(r[1])}</td><td class="er-num">${fmtRaw(r[2])}</td>
            <td class="er-num" style="color:${diff!==null?(diff>=0?'#15803d':'#dc2626'):''}">${fmtRaw(r[4])}</td>
            <td class="er-num">${pctSpan(r[5])}</td>
            <td>${statusBadge(r[5])}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>` : '';

  // Regional
  // Region sheet columns: A=REGION_NAME, B=REGION_NAME(dup), C=ACTUAL_SALES, D=TARGET, E=DIFF, F=PCT_DECIMAL(0.76=76%)
  const regions = (data.regionPerf||[]).filter(r=>r?.[0]&&!/region|june|performance/i.test(r[0]));
  const regionSlide = regions.length ? `
  <div class="er-slide">
    ${slideTitle('Regional Performance')}
    <div class="er-region-cards">
      ${regions.map(r=>{
        const pv=normPct(r[5]??r[4]); const col=pv>=90?'#15803d':pv>=80?'#d97706':'#dc2626';
        const bg=pv>=90?'#f0fdf4':pv>=80?'#fff7ed':'#fff1f2';
        return `<div class="er-region-card" style="border-left:4px solid ${col};background:${bg}">
          <div class="er-rc-name" style="color:${col}">${esc(r[0])}</div>
          <div class="er-rc-pct" style="color:${col}">${pv?.toFixed(0)}%</div>
          <div class="er-rc-detail">Target: ${fmtRaw(r[3])}</div>
          <div class="er-rc-detail">Actual: ${fmtRaw(r[2])}</div>
          <div class="er-rc-detail" style="color:#dc2626">Shortfall: ${fmtRaw(r[4])}</div>
        </div>`;
      }).join('')}
    </div>
  </div>` : '';

  // Area Leaders — columns: A=LEADER, B=OUTLET, C=TARGET, D=ACTUAL, E=DIFF, F=ACH%(already in % format e.g. 88.28)
  // Sub-outlet rows have blank A; TOTAL rows have r[1]='TOTAL'. Track current leader for grouping.
  const areaRaw = data.areaPerf || [];
  let _areaLeader = '';
  const areaGrouped = [];
  for (const r of areaRaw) {
    if (!r?.[0] && !r?.[1]) continue;
    if (/^(area leader|leader|outlet|june 2026|performance)$/i.test((r[0]||'').trim())) continue;
    if (r[0]) _areaLeader = r[0];
    if (!r[1] || r.length < 4) continue;
    areaGrouped.push({
      leader: r[0] || '',
      outlet: r[1],
      target: r[2],
      actual: r[3],
      diff:   r[4],
      pct:    r[5],
      isTotal: /total/i.test(r[1]),
    });
  }
  const areaSlide = areaGrouped.length ? `
  <div class="er-slide">
    ${slideTitle('Area Leaders Performance')}
    <div class="er-table-wrap"><table class="er-table">
      <thead><tr><th>LEADER</th><th>OUTLET</th><th class="er-num">TARGET</th><th class="er-num">ACTUAL</th><th class="er-num">DIFF</th><th class="er-num">ACH %</th><th>STATUS</th></tr></thead>
      <tbody>
        ${areaGrouped.map(({leader,outlet,target,actual,diff,pct,isTotal})=>{
          const diffN=pN(diff);
          return `<tr class="${isTotal?'er-tot':''}">
            <td style="font-weight:${leader?700:400};color:${leader?'#166534':'inherit'}">${esc(leader)}</td>
            <td>${esc(outlet)}</td>
            <td class="er-num">${fmtRaw(target)}</td>
            <td class="er-num">${fmtRaw(actual)}</td>
            <td class="er-num" style="color:${diffN!==null?(diffN>=0?'#15803d':'#dc2626'):''}">${fmtRaw(diff)}</td>
            <td class="er-num">${pctSpan(pct)}</td>
            <td>${statusBadge(pct)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>` : '';

  // Top Stores — sheet layout: each month has 3 cols (Outlet, Revenue_M, ADS).
  // Row 0 = month headers (January, February…), Row 1 = col labels (Outlet, Revenue, ADS…), Rows 2-6 = top 5 stores, Row 7 = Top 5 total
  const ts = data.topStores || [];
  const tsMonthHdr = ts[0] || [];
  const tsColHdr   = ts[1] || [];
  // Extract months present (every 3rd col starting at 0 has the month name)
  const tsMonths = tsMonthHdr.reduce((acc,v,i) => { if(v && String(v).trim()) acc.push({label:String(v).trim(), colIdx:i}); return acc;}, []);
  const tsDataRows = ts.slice(2).filter(r=>r?.[0]&&r.length>=2);
  const topStoresSlide = tsDataRows.length && tsMonths.length ? `
  <div class="er-slide">
    ${slideTitle('Top Revenue Stores — Monthly Rankings')}
    <div class="er-table-wrap" style="overflow-x:auto"><table class="er-table">
      <thead>
        <tr><th>Rank</th>${tsMonths.map(m=>`<th class="er-num" colspan="2">${esc(m.label)}</th>`).join('')}</tr>
        <tr><th></th>${tsMonths.map(()=>'<th class="er-num">Revenue (M)</th><th class="er-num">ADS</th>').join('')}</tr>
      </thead>
      <tbody>
        ${tsDataRows.map((r,ri)=>`<tr class="${/top.5|total/i.test(String(r[0]))?'er-tot':''}">
          <td style="font-weight:600">${/top.5|total/i.test(String(r[0]))?'TOP 5':ri+1}</td>
          ${tsMonths.map(m=>`
            <td class="er-num">${r[m.colIdx+1]||'—'}</td>
            <td class="er-num" style="color:#6b7280;font-size:0.82rem">${r[m.colIdx+2]||'—'}</td>
          `).join('')}
        </tr>`).join('')}
      </tbody>
    </table></div>
    <p style="font-size:0.78rem;color:#6b7280;margin-top:8px">ADS = Average Daily Sales (Million)</p>
  </div>` : '';

  // ── CATEGORY tab ──────────────────────────────────────────────────────────
  const catYTD = data.categorySalesYTD || [];
  const catYTDHdr = catYTD.find(r=>r?.slice(1).some(c=>/jan|feb|mar/i.test(String(c))));
  const catYTDCols = catYTDHdr ? catYTDHdr.slice(1).filter(Boolean) : [];
  const catYTDRows = catYTD.filter(r=>r?.[0]&&!/dept|category|sales/i.test(r[0])&&r.length>=2);
  const catTotalRow = catYTDRows.find(r=>/total/i.test(r[0]));

  const catYTDSlide = catYTDRows.length ? `
  <div class="er-slide">
    ${slideTitle('Category Sales YTD')}
    <div class="er-two-col">
      <div class="er-table-wrap" style="flex:2"><table class="er-table">
        <thead><tr><th>DEPARTMENT</th>${catYTDCols.map(c=>`<th class="er-num">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>
          ${catYTDRows.map(r=>`<tr class="${/total/i.test(r[0])?'er-tot':''}">
            <td>${esc(r[0])}</td>${catYTDCols.map((_,i)=>`<td class="er-num">${fmtRaw(r[i+1])}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
      <div>
        <div class="er-kpi-mini-grid">
          ${catYTDRows.filter(r=>!/total/i.test(r[0])).slice(0,4).map(r=>
            kpiCard(esc(r[0]), fmtRaw(r[r.length-1]), 'YTD', '#15803d', '#f0fdf4')
          ).join('')}
        </div>
      </div>
    </div>
  </div>` : '';

  const catLatest = data.categorySalesLatest || [];
  const catLatHdr = catLatest.find(r=>/dept|category/i.test(r[0]));
  const catLatCols = catLatHdr ? catLatHdr.slice(1).filter(Boolean) : [];
  const catLatRows = catLatest.filter(r=>r?.[0]&&!/dept|category/i.test(r[0])&&r.length>=3);

  const catLatSlide = catLatRows.length ? `
  <div class="er-slide">
    ${slideTitle('June Category Performance vs May')}
    <div class="er-two-col">
      <div class="er-table-wrap" style="flex:1.5">
        <div class="er-subsection-label er-orange">JUNE vs MAY ACHIEVEMENT %</div>
        <table class="er-table er-table--orange-hdr">
          <thead><tr><th>DEPT</th>${catLatCols.map(c=>`<th class="er-num">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${catLatRows.map(r=>`<tr class="${/total|global/i.test(r[0])?'er-tot':''}">
              <td>${esc(r[0])}</td>${catLatCols.map((_,i)=>{
                const v=r[i+1];
                const isAch = catLatCols[i]?.includes('%');
                return `<td class="er-num">${isAch ? pctSpan(v) : fmtRaw(v)}</td>`;
              }).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ${insightBox('Key Concern: Review departments with declining achievement vs previous month', 'red')}
  </div>` : '';

  // ── COMPARISON tab ────────────────────────────────────────────────────────
  // YOY sheet: SUPERMARKET section first, then RESTAURANT, then SM+3F TOTAL.
  // Columns: OUTLET | 2025 QTY | 2025 VAL | 2026 QTY | 2026 VAL | QTY DIFF | VAL DIFF | %QTY DIFF | %VAL DIFF
  const yoy = data.yoy || [];
  // Find the SM+3F TOTAL section header, fall back to first section
  const smTotalIdx = yoy.findIndex(r=>r?.some(c=>/sm.*3f|sm\+3f/i.test(String(c))));
  const yoySection = smTotalIdx >= 0 ? yoy.slice(smTotalIdx) : yoy;
  const yoyHdr = yoySection.find(r=>r?.some(c=>/outlet|store/i.test(String(c))));
  const yoyRows = yoySection.filter(r => {
    if (!r?.[0]) return false;
    if (/outlet|store|total|same.store|supermarket|restaurant|sm\+3f/i.test(r[0])) return false;
    return r.length >= 6;
  });
  // Last column is %VAL DIFF, second-to-last is %QTY DIFF
  const yoyGrowers  = yoyRows.filter(r=>pN(r[r.length-1])>=0).sort((a,b)=>(pN(b[b.length-1])||0)-(pN(a[a.length-1])||0));
  const yoyDecliners= yoyRows.filter(r=>pN(r[r.length-1])<0).sort((a,b)=>(pN(a[a.length-1])||0)-(pN(b[b.length-1])||0));
  // Columns to display: OUTLET, 2025 VAL(idx2), 2026 VAL(idx4), VAL DIFF(idx6), %VAL DIFF(last)
  const yoySlide = yoyRows.length ? `
  <div class="er-slide">
    ${slideTitle('Outlet Year-on-Year Comparison (SM + 3F)')}
    <div class="er-two-col">
      <div>
        <div class="er-subsection-label">TOP GROWERS (Value %)</div>
        <div class="er-table-wrap"><table class="er-table">
          <thead><tr><th>OUTLET</th><th class="er-num">2025 VAL</th><th class="er-num">2026 VAL</th><th class="er-num">VAL DIFF</th><th class="er-num">% VAL</th></tr></thead>
          <tbody>
            ${yoyGrowers.slice(0,8).map(r=>`<tr>
              <td>${esc(r[0])}</td>
              <td class="er-num">${fmtRaw(r[2])}</td>
              <td class="er-num">${fmtRaw(r[4])}</td>
              <td class="er-num" style="color:#15803d">${fmtRaw(r[6])}</td>
              <td class="er-num">${yoySpan(r[r.length-1])}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div>
        <div class="er-subsection-label er-orange">DECLINERS (Value %)</div>
        <div class="er-table-wrap"><table class="er-table er-table--orange-hdr">
          <thead><tr><th>OUTLET</th><th class="er-num">2025 VAL</th><th class="er-num">2026 VAL</th><th class="er-num">VAL DIFF</th><th class="er-num">% VAL</th></tr></thead>
          <tbody>
            ${yoyDecliners.slice(0,8).map(r=>`<tr>
              <td>${esc(r[0])}</td>
              <td class="er-num">${fmtRaw(r[2])}</td>
              <td class="er-num">${fmtRaw(r[4])}</td>
              <td class="er-num" style="color:#dc2626">${fmtRaw(r[6])}</td>
              <td class="er-num">${yoySpan(r[r.length-1])}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
    </div>
  </div>` : '';

  // Utilities
  const util = (data.utility||[]).filter(r=>r?.[0]&&!/desc|header/i.test(r[0]));
  const utilKpis = util.slice(0,4);
  const utilSlide = util.length ? `
  <div class="er-slide">
    ${slideTitle('Utilities & Power Cost')}
    <div class="er-kpi-row">
      ${utilKpis.map(r=>kpiCard(esc(r[0]), String(r[r.length-1]||'—'), '', '#d97706', '#fff7ed')).join('')}
    </div>
    <div class="er-table-wrap" style="margin-top:20px"><table class="er-table">
      <thead><tr><th>Description</th><th class="er-num">Previous</th><th class="er-num">Latest</th><th class="er-num">Change</th></tr></thead>
      <tbody>
        ${util.map(r=>{
          const prev=pN(r[r.length-2]), curr=pN(r[r.length-1]);
          const chg = prev&&curr ? ((curr-prev)/prev*100) : null;
          return `<tr>
            <td>${esc(r[0])}</td>
            <td class="er-num">${r[r.length-2]||'—'}</td>
            <td class="er-num">${r[r.length-1]||'—'}</td>
            <td class="er-num">${chg!==null?yoySpan(chg):'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>` : '';

  // Weekly Sales
  const ws = data.weeklySales || [];
  const wsWeeks = ws.find(r=>r?.some(c=>String(c).includes('Week')));
  const wsSales = ws.find(r=>/sales/i.test(r?.[0]));
  const wsDaily = ws.find(r=>/daily/i.test(r?.[0]));
  const weekLabels = wsWeeks ? wsWeeks.filter(Boolean).slice(1) : [];
  const weeklySlide = wsSales ? `
  <div class="er-slide">
    ${slideTitle('Weekly Sales Performance')}
    <div class="er-table-wrap"><table class="er-table">
      <thead><tr><th></th>${weekLabels.map(w=>`<th class="er-num">${esc(w)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr class="er-tot"><td>Sales (N Million)</td>${wsSales.slice(1).map(v=>`<td class="er-num">${v||'—'}</td>`).join('')}</tr>
        ${wsDaily?`<tr><td>Daily Average</td>${wsDaily.slice(1).map(v=>`<td class="er-num">${v||'—'}</td>`).join('')}</tr>`:''}
      </tbody>
    </table></div>
  </div>` : '';

  // ── ASSEMBLE TABBED LAYOUT ────────────────────────────────────────────────
  return `
  <div class="exec-report" id="execReportDoc">
    <div class="er-header">
      <div class="er-header-left">
        <img src="/foodco-logo.png" alt="FoodCo" style="height:40px;object-fit:contain" />
        <div>
          <div class="er-title">Foodco Nigeria Limited</div>
          <div class="er-subtitle">Executive Sales Report${latestLabel ? ' — ' + latestLabel : ''}</div>
        </div>
      </div>
      <div class="er-header-right">
        <div class="er-gen-date">Generated: ${now}</div>
        <button class="btn-ghost" onclick="window.print()" style="font-size:0.78rem;margin-top:4px;">🖨 Print</button>
        <button class="btn-primary" id="dlPptxBtn" onclick="window.downloadAsPptx()" style="font-size:0.78rem;margin-top:4px;padding:4px 12px;">⬇ Download PPTX</button>
        <button class="btn-primary" onclick="window.presentReport()" style="font-size:0.78rem;margin-top:4px;padding:4px 12px;background:#ea580c;border-color:#ea580c;">▶ Present Slides</button>
      </div>
    </div>

    <div class="er-tab-nav" id="erTabNav">
      <button class="er-tab active" onclick="erSwitchTab('revenue',this)">REVENUE</button>
      <button class="er-tab" onclick="erSwitchTab('growth',this)">GROWTH</button>
      <button class="er-tab" onclick="erSwitchTab('outlets',this)">OUTLETS</button>
      <button class="er-tab" onclick="erSwitchTab('category',this)">CATEGORY</button>
      <button class="er-tab" onclick="erSwitchTab('comparison',this)">COMPARISON</button>
    </div>

    <div class="er-tab-panel active" id="er-panel-revenue">
      ${execOverview}
      ${coreSlide}
    </div>
    <div class="er-tab-panel" id="er-panel-growth">
      ${growthSlide}
    </div>
    <div class="er-tab-panel" id="er-panel-outlets">
      ${outletSlide}
      ${regionSlide}
      ${areaSlide}
      ${topStoresSlide}
    </div>
    <div class="er-tab-panel" id="er-panel-category">
      ${catYTDSlide}
      ${catLatSlide}
      ${weeklySlide}
    </div>
    <div class="er-tab-panel" id="er-panel-comparison">
      ${yoySlide}
      ${utilSlide}
    </div>
  </div>
  `;
}

