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
    formula: 'Available SKUs ÷ Total Required SKUs × 100',
    dataSource: 'Supermarket & 3F Operations inventory',
    includes: ['Diamond Lines', 'Silver Lines', '3F Critical SKUs'],
    fields: [
      { id: 'availSKU', label: 'Available SKUs',      placeholder: '0', step: '1' },
      { id: 'totalSKU', label: 'Total Required SKUs', placeholder: '0', step: '1', min: 1 }
    ],
    compute: d => d.availSKU / d.totalSKU * 100,
    score:   p => p >= 95 ? 25 : p >= 92 ? 23 : p >= 88 ? 20 : p >= 85 ? 15 : 5,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '95–100%', score: 25 },
      { label: '92–94%',  score: 23 },
      { label: '88–91%',  score: 20 },
      { label: '85–87%',  score: 15 },
      { label: '< 85%',   score:  5 }
    ],
    validate: d => {
      if (d.availSKU > d.totalSKU) return 'Available SKUs exceed total required — check values.';
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
    formula: '% Promoters − % Detractors',
    fields: [
      { id: 'promoters',  label: '% Promoters',  placeholder: '0–100', max: 100 },
      { id: 'detractors', label: '% Detractors', placeholder: '0–100', max: 100 }
    ],
    compute: d => d.promoters - d.detractors,
    score:   n => n >= 70 ? 7.5 : n >= 60 ? 6 : n >= 50 ? 4 : n >= 40 ? 3 : 1,
    display: v => `NPS ${v.toFixed(1)}`,
    bands: [
      { label: 'NPS ≥ 70',    score: 7.5 },
      { label: 'NPS 60–69',   score: 6   },
      { label: 'NPS 50–59',   score: 4   },
      { label: 'NPS 40–49',   score: 3   },
      { label: 'NPS < 40',    score: 1   }
    ],
    validate: d => {
      if (d.promoters + d.detractors > 100) return 'Promoters + Detractors cannot exceed 100%.';
      if (d.promoters < 0 || d.detractors < 0) return 'Values cannot be negative.';
      return null;
    }
  }
];

const ALL_FIELD_IDS = KPI_CONFIG.flatMap(k => k.fields.map(f => f.id));

// ── Storage ────────────────────────────────────────────────────────────────

const STORE_KEY = 'foodco_data';

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return saved ? { ...defaultStore(), ...saved } : defaultStore();
  } catch { return defaultStore(); }
}

function defaultStore() {
  return { hsoPin: '1234', googleClientId: '', coaches: [], scorecards: [] };
}

function saveStore(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ── State ──────────────────────────────────────────────────────────────────

let currentCoach = null;
let isHSOMode = false;
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

// ── HSO PIN ────────────────────────────────────────────────────────────────

function verifyPin(entered) {
  return entered === loadStore().hsoPin;
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
          <button class="btn-ghost btn-danger" onclick="confirmDeleteCoach('${c.id}','${esc(c.name).replace(/'/g,"\\'")}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

function toggleTargetEditor(coachId) {
  document.getElementById(`coach-target-editor-${coachId}`)?.classList.toggle('hidden');
}

function saveCoachTarget(coachId) {
  const val  = parseFloat(document.getElementById(`coach-target-input-${coachId}`)?.value) || 0;
  const data = loadStore();
  const coach = data.coaches.find(c => c.id === coachId);
  if (!coach) return;
  coach.salesTarget = val || null;
  saveStore(data);
  renderAdminCoachList();
  showToast(val ? `Target set to R ${val.toLocaleString('en-ZA')}` : 'Target cleared.');
}

function prefillSalesTarget() {
  if (!currentCoach?.salesTarget) return;
  const el = document.getElementById('me_targetSales');
  if (el && !el.value) {
    el.value = currentCoach.salesTarget;
    el.dispatchEvent(new Event('input'));
  }
}

function confirmDeleteCoach(id, name) {
  if (confirm(`Delete coach "${name}" and all their scorecards?`)) {
    const data = loadStore();
    data.coaches    = data.coaches.filter(c => c.id !== id);
    data.scorecards = data.scorecards.filter(s => s.coachId !== id);
    saveStore(data);
    renderAdminCoachList();
    populateCoachLoginSelect();
    showToast(`"${name}" deleted.`);
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

// ── Coach Select ───────────────────────────────────────────────────────────

function populateCoachLoginSelect() {
  const coaches = loadStore().coaches;
  const sel = document.getElementById('coachLoginSelect');
  sel.innerHTML = `<option value="">— Select your name —</option>` +
    coaches.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  document.getElementById('coachLoginBtn').disabled = true;
}

// ── Coach Home ─────────────────────────────────────────────────────────────

function renderCoachHome() {
  document.getElementById('coachWelcomeName').textContent = currentCoach.name;
  document.getElementById('headerActions').innerHTML =
    `<span class="header-role-badge">${esc(currentCoach.name)}</span>`;

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
  chipEl.textContent      = lastR.label;
  chipEl.style.background = lastR.color;

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

function handleGenerateEntry() {
  const period = document.getElementById('entryPeriod').value;
  if (!period) { showToast('Please select a period first.'); return; }

  const fieldData  = collectManualForm();
  const { rows, total, rating } = computeScorecard(fieldData);

  const coachNote = document.getElementById('coachNoteInput')?.value.trim() || '';

  const scorecard = {
    id: uid(),
    coachId: currentCoach.id,
    period,
    total,
    rating,
    rows,
    fieldData,
    coachNote,
    generatedAt: new Date().toISOString()
  };

  const data = loadStore();
  // Replace existing scorecard for same coach+period if any
  data.scorecards = data.scorecards.filter(s => !(s.coachId === currentCoach.id && s.period === period));
  data.scorecards.push(scorecard);
  saveStore(data);

  showToast('Scorecard saved!');
  resultsBackDest = 'coachHomeView';
  displayResults(scorecard);
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

function saveCoachingNotes(scorecardId) {
  const notes = document.getElementById('coachingNotesInput')?.value.trim() || '';
  const data  = loadStore();
  const sc    = data.scorecards.find(x => x.id === scorecardId);
  if (!sc) return;
  sc.hsoNotes = notes;
  saveStore(data);
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
  document.getElementById('scoreTable').querySelector('tbody').innerHTML = s.rows.map((row, i) => {
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
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Landing
  document.getElementById('hsoRoleBtn').addEventListener('click', () => navigate('hsoPinView'));
  document.getElementById('coachRoleBtn').addEventListener('click', () => {
    populateCoachLoginSelect();
    navigate('coachSelectView');
  });

  // HSO PIN
  document.getElementById('pinForm').addEventListener('submit', e => {
    e.preventDefault();
    const val = document.getElementById('pinInput').value;
    if (verifyPin(val)) {
      document.getElementById('pinError').classList.add('hidden');
      document.getElementById('pinInput').value = '';
      isHSOMode = true;
      aiHistory = [];
      renderAdminCoachList();
      const clientId = loadStore().googleClientId;
      document.getElementById('googleClientIdInput').value = clientId;
      document.getElementById('headerActions').innerHTML =
        `<span class="header-role-badge header-role-badge--admin">🔐 HSO Admin</span>`;
      navigate('adminView');
    } else {
      document.getElementById('pinError').classList.remove('hidden');
      const pi = document.getElementById('pinInput');
      pi.classList.remove('shake');
      void pi.offsetWidth;
      pi.classList.add('shake');
    }
  });
  document.getElementById('backFromPin').addEventListener('click', goBack);

  // Admin tabs
  document.querySelectorAll('.admin-nav-item').forEach(t =>
    t.addEventListener('click', () => switchAdminTab(t.dataset.atab)));

  // Admin – add coach
  document.getElementById('addCoachForm').addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('newCoachName').value.trim();
    const branches = document.getElementById('newCoachBranches').value.trim();
    if (!name) return;
    const data = loadStore();
    data.coaches.push({ id: uid(), name, branches });
    saveStore(data);
    document.getElementById('addCoachForm').reset();
    renderAdminCoachList();
    showToast(`"${name}" added.`);
  });

  // Admin – change PIN
  document.getElementById('changePinForm').addEventListener('submit', e => {
    e.preventDefault();
    const current = document.getElementById('currentPin').value;
    const next    = document.getElementById('newPin').value;
    const msgEl   = document.getElementById('pinChangeMsg');
    if (!verifyPin(current)) {
      msgEl.textContent = 'Current PIN is incorrect.';
      msgEl.classList.remove('hidden');
      return;
    }
    if (next.length < 4) {
      msgEl.textContent = 'New PIN must be at least 4 characters.';
      msgEl.classList.remove('hidden');
      return;
    }
    const data = loadStore();
    data.hsoPin = next;
    saveStore(data);
    msgEl.classList.add('hidden');
    document.getElementById('changePinForm').reset();
    showToast('PIN updated successfully.');
  });

  // Admin – Google Client ID
  document.getElementById('clientIdForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('googleClientIdInput').value.trim();
    const data = loadStore();
    data.googleClientId = id;
    saveStore(data);
    showToast('Client ID saved.');
  });

  // Admin – download template
  document.getElementById('downloadTemplateBtn').addEventListener('click', downloadTemplate);

  // Admin – quarterly report
  document.getElementById('qrGenerateBtn').addEventListener('click', generateQuarterlyReport);

  // Admin – exit
  document.getElementById('exitAdminBtn').addEventListener('click', () => {
    isHSOMode = false;
    aiHistory = [];
    navStack = [];
    document.getElementById('headerActions').innerHTML = '';
    showView('landingView');
  });

  // Coach select
  document.getElementById('coachLoginSelect').addEventListener('change', e => {
    document.getElementById('coachLoginBtn').disabled = !e.target.value;
  });
  document.getElementById('coachLoginBtn').addEventListener('click', () => {
    const id = document.getElementById('coachLoginSelect').value;
    const coach = loadStore().coaches.find(c => c.id === id);
    if (!coach) return;
    currentCoach = coach;
    isHSOMode = false;
    aiHistory = [];
    renderCoachHome();
    navigate('coachHomeView');
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
  document.getElementById('changeUserBtn').addEventListener('click', () => {
    currentCoach = null;
    isHSOMode = false;
    aiHistory = [];
    navStack = [];
    document.getElementById('headerActions').innerHTML = '';
    populateCoachLoginSelect();
    showView('coachSelectView');
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
  document.getElementById('saveAiKeyBtn')?.addEventListener('click', () => {
    const val = document.getElementById('aiApiKeyInput')?.value.trim();
    if (!val || !val.startsWith('gsk_')) {
      showToast('Enter a valid Groq API key (starts with gsk_).');
      return;
    }
    saveAIKey(val);
    showToast('AI key saved.');
    document.getElementById('aiApiKeyInput').value = '';
  });
  document.getElementById('clearAiKeyBtn')?.addEventListener('click', () => {
    localStorage.removeItem('foodco_ai_key');
    aiHistory = [];
    document.getElementById('aiMessages').innerHTML = '';
    showToast('AI key removed.');
  });

  // AI textarea — Enter submits, Shift+Enter newline, auto-resize
  document.getElementById('aiQuestionInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAIQuestion(); }
  });
  document.getElementById('aiQuestionInput')?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });
});

// ── AI INSIGHTS ───────────────────────────────────────────────────────────

const AI_KEY_STORE = 'foodco_groq_key';
let aiHistory = [];

function loadAIKey()    { return localStorage.getItem(AI_KEY_STORE) || ''; }
function saveAIKey(key) { localStorage.setItem(AI_KEY_STORE, key.trim()); }

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
  const key   = loadAIKey();
  const msgEl = document.getElementById('aiMessages');
  msgEl.innerHTML = '';
  aiHistory = [];

  if (!key) {
    msgEl.innerHTML = `
      <div class="ai-setup-block">
        <div class="ai-setup-icon">✨</div>
        <div class="ai-setup-title">Set up AI Insights</div>
        <div class="ai-setup-desc">Add your Groq API key to ask questions about scorecard data in plain English. Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener" style="color:var(--green)">console.groq.com</a>.</div>
        <input type="password" id="aiKeyInputInline" class="ai-key-input" placeholder="gsk_…" autocomplete="off" />
        <button class="btn-primary btn-full" onclick="saveAIKeyInline()">Save &amp; Activate</button>
        <p class="ai-setup-note">Key is stored only in this browser — never sent to any third-party server.</p>
      </div>`;
    document.getElementById('aiSuggestions').classList.add('hidden');
    document.getElementById('aiInputRow').classList.add('hidden');
    return;
  }

  document.getElementById('aiSuggestions').classList.remove('hidden');
  document.getElementById('aiInputRow').classList.remove('hidden');
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

function saveAIKeyInline() {
  const val = document.getElementById('aiKeyInputInline')?.value.trim();
  if (!val || !val.startsWith('gsk_')) {
    showToast('Enter a valid Groq API key (starts with gsk_).');
    return;
  }
  saveAIKey(val);
  document.getElementById('aiMessages').innerHTML = '';
  initAIPanel();
  showToast('AI key saved — ready to go!');
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

  const key = loadAIKey();
  if (!key) { initAIPanel(); return; }

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
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
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
