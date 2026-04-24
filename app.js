// ── KPI Configuration ─────────────────────────────────────────────────────

const KPI_CONFIG = [
  {
    id: 'sales', pillar: 'Commercial Performance',
    label: '1. Sales Performance vs Target', pts: 25,
    formula: 'Actual Sales ÷ Target Sales × 100',
    fields: [
      { id: 'actualSales', label: 'Actual Sales (R)',  placeholder: '0.00' },
      { id: 'targetSales', label: 'Target Sales (R)',  placeholder: '0.00', min: 1 }
    ],
    compute: d => d.actualSales / d.targetSales * 100,
    score:   p => p >= 100 ? 25 : p >= 95 ? 23 : p >= 90 ? 20 : p >= 85 ? 10 : 5,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥ 100%', score: 25 },
      { label: '≥  95%', score: 23 },
      { label: '≥  90%', score: 20 },
      { label: '≥  85%', score: 10 },
      { label: ' < 85%', score:  5 }
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
    fields: [
      { id: 'availSKU', label: 'Available SKUs',      placeholder: '0', step: '1' },
      { id: 'totalSKU', label: 'Total Required SKUs', placeholder: '0', step: '1', min: 1 }
    ],
    compute: d => d.availSKU / d.totalSKU * 100,
    score:   p => p >= 95 ? 25 : p >= 92 ? 23 : p >= 88 ? 20 : p >= 85 ? 15 : 5,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥  95%', score: 25 },
      { label: '≥  92%', score: 23 },
      { label: '≥  88%', score: 20 },
      { label: '≥  85%', score: 15 },
      { label: ' < 85%', score:  5 }
    ],
    validate: d => {
      if (d.availSKU > d.totalSKU) return 'Available SKUs exceed total required — check values.';
      return null;
    }
  },
  {
    id: 'yoy', pillar: 'Growth Performance',
    label: '3. Year-on-Year Sales Growth', pts: 10,
    formula: '(Current Year Sales – Previous Year Sales) ÷ Previous Year Sales × 100',
    fields: [
      { id: 'currYearSales', label: 'Current Year Sales (R)',  placeholder: '0.00' },
      { id: 'prevYearSales', label: 'Previous Year Sales (R)', placeholder: '0.00', min: 1 }
    ],
    compute: d => (d.currYearSales - d.prevYearSales) / d.prevYearSales * 100,
    score:   p => p >= 15 ? 10 : p >= 10 ? 8 : p >= 5 ? 6 : p >= 0 ? 4 : 0,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥  15%', score: 10 },
      { label: '≥  10%', score:  8 },
      { label: '≥   5%', score:  6 },
      { label: '≥   0%', score:  4 },
      { label: '  < 0%', score:  0 }
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
      { label: '≥  95%', score: 10 },
      { label: '≥  89%', score:  8 },
      { label: '≥  85%', score:  6 },
      { label: '≥  80%', score:  4 },
      { label: ' < 80%', score:  2 }
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
      { label: '≥  95%', score: 5 },
      { label: '≥  90%', score: 4 },
      { label: '≥  85%', score: 3 },
      { label: '≥  80%', score: 2 },
      { label: ' < 80%', score: 1 }
    ],
    validate: d => {
      if (d.ghpScore > 100) return 'Score cannot exceed 100%.';
      return null;
    }
  },
  {
    id: 'manning', pillar: 'Workforce Productivity',
    label: '6. Manning Efficiency', pts: 5,
    formula: 'Actual Staff ÷ Planned Staff × 100 (>101% = over-staffed penalty)',
    fields: [
      { id: 'actualStaff',  label: 'Actual Staff',  placeholder: '0', step: '1' },
      { id: 'plannedStaff', label: 'Planned Staff', placeholder: '0', step: '1', min: 1 }
    ],
    compute: d => d.actualStaff / d.plannedStaff * 100,
    score:   p => p > 101 ? 1 : p >= 95 ? 5 : p >= 90 ? 4 : p >= 85 ? 3 : p >= 80 ? 2 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '95–101%  (optimal)', score: 5 },
      { label: '≥  90%',             score: 4 },
      { label: '≥  85%',             score: 3 },
      { label: '≥  80%',             score: 2 },
      { label: '> 101%  (over)',      score: 1 },
      { label: ' < 80%',             score: 1 }
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
    formula: 'Profit vs Target % (gross margin & shrinkage)',
    fields: [{ id: 'profitVsTarget', label: 'Profit vs Target (%)', placeholder: '0–120' }],
    compute: d => d.profitVsTarget,
    score:   p => p >= 100 ? 7.5 : p >= 95 ? 6 : p >= 90 ? 4 : 1,
    display: v => `${v.toFixed(1)}%`,
    bands: [
      { label: '≥ 100%', score: 7.5 },
      { label: '≥  95%', score: 6   },
      { label: '≥  90%', score: 4   },
      { label: ' < 90%', score: 1   }
    ],
    validate: d => {
      if (d.profitVsTarget > 160) return 'Profit vs target exceeds 160% — verify the value.';
      return null;
    }
  },
  {
    id: 'expense', pillar: 'Financial Discipline',
    label: '8. Expense Control', pts: 5,
    formula: 'Actual Expense ÷ Budget × 100 — lower is better (diesel, utilities, repairs)',
    fields: [
      { id: 'actualExpense', label: 'Actual Expense (R)', placeholder: '0.00' },
      { id: 'expenseBudget', label: 'Expense Budget (R)', placeholder: '0.00', min: 1 }
    ],
    compute: d => d.actualExpense / d.expenseBudget * 100,
    score:   r => r <= 95 ? 5 : r <= 100 ? 4 : r <= 105 ? 3 : r <= 110 ? 2 : 1,
    display: v => `${v.toFixed(1)}% of budget`,
    bands: [
      { label: '≤  95% of budget', score: 5 },
      { label: '≤ 100% of budget', score: 4 },
      { label: '≤ 105% of budget', score: 3 },
      { label: '≤ 110% of budget', score: 2 },
      { label: '> 110% of budget', score: 1 }
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
      { label: 'NPS ≥ 70', score: 7.5 },
      { label: 'NPS ≥ 60', score: 6   },
      { label: 'NPS ≥ 50', score: 4   },
      { label: 'NPS ≥ 40', score: 3   },
      { label: 'NPS < 40', score: 1   }
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

function renderPillarResultCards(rows) {
  if (!rows || !rows.length) return '';
  return rows.map((row, i) => {
    const ratio = row.score / row.weight;
    const pct   = Math.round(ratio * 100);
    const col   = ratio >= .95 ? '#166534' : ratio >= .80 ? '#15803d' : ratio >= .65 ? '#ca8a04' : ratio >= .50 ? '#c2410c' : '#b91c1c';
    const bar   = ratio >= .95 ? '#16a34a' : ratio >= .80 ? '#22c55e' : ratio >= .65 ? '#f59e0b' : ratio >= .50 ? '#f97316' : '#ef4444';
    return `
      <div class="pillar-result-card" style="--pcol:${bar};animation-delay:${(i * .065).toFixed(2)}s">
        <div class="prc-pillar">${esc(row.pillar || '—')}</div>
        <div class="prc-kpi">${esc(row.label)}</div>
        <div class="prc-score-row">
          <span class="prc-score" style="color:${col}">${row.score}</span>
          <span class="prc-max">/ ${row.weight} pts</span>
        </div>
        <div class="prc-bar-track">
          <div class="prc-bar-fill" style="width:${pct}%;background:${bar}"></div>
        </div>
        <div class="prc-achieved">${esc(row.derived)}</div>
      </div>`;
  }).join('');
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

// ── Leaderboard ────────────────────────────────────────────────────────────

function renderLeaderboard() {
  const store = loadStore();
  const el = document.getElementById('leaderboardContent');

  if (!store.coaches.length) {
    el.innerHTML = '<p class="empty-state">No coaches added yet.</p>';
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
            <th class="center" style="width:52px">Rank</th>
            <th>Coach</th>
            <th>Branches</th>
            <th class="center">Latest Score</th>
            <th class="center">vs Last</th>
            <th class="center">Trend</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => {
            if (!row.latest) {
              return `<tr class="lb-row lb-row--empty">
                <td class="center">—</td>
                <td class="lb-name">${esc(row.coach.name)}</td>
                <td class="lb-branches">${esc(row.coach.branches || '—')}</td>
                <td colspan="3" style="color:var(--s-400);font-size:.76rem;text-align:center">No scorecards yet</td>
              </tr>`;
            }
            rank++;
            const r   = row.latest.rating || getRating(parseFloat(row.latest.total));
            const dStr = row.delta !== null ? (row.delta > 0 ? `+${row.delta.toFixed(1)}` : row.delta.toFixed(1)) : '—';
            const dCol = row.delta > 0 ? '#16a34a' : row.delta < 0 ? '#dc2626' : 'var(--s-400)';
            return `<tr class="lb-row" onclick="adminViewCoach('${row.coach.id}')">
              <td class="center lb-rank">${medals[rank - 1] || rank}</td>
              <td class="lb-name">${esc(row.coach.name)}</td>
              <td class="lb-branches">${esc(row.coach.branches || '—')}</td>
              <td class="center">
                <span class="lb-score">${parseFloat(row.latest.total).toFixed(1)}</span>
                <span class="rating-chip" style="background:${r.color};margin-left:8px">${r.label}</span>
              </td>
              <td class="center lb-delta" style="color:${dCol}">${dStr}</td>
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
  document.querySelectorAll('.mini-tab').forEach(t => t.classList.toggle('active', t.dataset.atab === tabId));
  document.querySelectorAll('.atab-panel').forEach(p => p.classList.toggle('hidden', p.id !== tabId));
  if (tabId === 'aScores')       renderAllScorecards();
  if (tabId === 'aLeaderboard')  renderLeaderboard();
}

function renderAdminCoachList() {
  const store = loadStore();
  const el = document.getElementById('adminCoachList');
  if (store.coaches.length === 0) {
    el.innerHTML = '<p class="empty-state">No coaches added yet.</p>';
    return;
  }
  el.innerHTML = store.coaches.map(c => {
    const count = store.scorecards.filter(s => s.coachId === c.id).length;
    return `
      <div class="coach-card">
        <div class="coach-info">
          <div class="coach-name">${esc(c.name)}</div>
          <div class="coach-meta">${esc(c.branches) || '<em>No branches</em>'} &nbsp;·&nbsp; ${count} scorecard${count !== 1 ? 's' : ''}</div>
        </div>
        <div class="coach-actions">
          <button class="btn-ghost btn-danger" onclick="confirmDeleteCoach('${c.id}','${esc(c.name).replace(/'/g,"\\'")}')">Delete</button>
        </div>
      </div>`;
  }).join('');
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
    el.innerHTML = '<p class="empty-state">No scorecards have been generated yet.</p>';
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
    </div>`).join('');
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

  const scorecard = {
    id: uid(),
    coachId: currentCoach.id,
    period,
    total,
    rating,
    rows,
    fieldData,
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
    el.innerHTML = '<p class="empty-state">No data yet — generate scorecards to see the heatmap.</p>';
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
    el.innerHTML = '<p class="empty-state">No scorecards generated yet.<br>Go to Data Entry to create your first one.</p>';
    return;
  }

  el.innerHTML = `<div class="tl-list">${
    items.map((s, i) => timelineEntry(s, items[i + 1] || null, 'pastEntriesView')).join('')
  }</div>`;
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
  resultsBackDest = backDest;
  displayResults(s);
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
  const deltaEl = document.getElementById('scoreDelta');
  if (prevEntries.length) {
    const diff = t - parseFloat(prevEntries[0].total);
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

  // Pillar cards
  document.getElementById('pillarResultsGrid').innerHTML = renderPillarResultCards(s.rows);

  // Narrative
  const narrativeEl = document.getElementById('scoreNarrative');
  if (narrativeEl) {
    const html = generateNarrative(s, coach);
    narrativeEl.innerHTML = html;
    narrativeEl.classList.toggle('hidden', !html);
  }

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

  const bandsHtml = kpi.bands ? `
    <details class="kpi-bands-details">
      <summary class="kpi-bands-summary">How is this scored? <span class="kpi-bands-chevron">▾</span></summary>
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
      <div class="kpi-pillar-tag">${kpi.pillar}</div>
      <div class="kpi-header">
        <span class="kpi-badge">${kpi.pts} pts</span>
        <h3>${kpi.label}</h3>
      </div>
      <p class="kpi-formula">${kpi.formula}</p>
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
  document.querySelectorAll('.mini-tab').forEach(t =>
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

  // Admin – exit
  document.getElementById('exitAdminBtn').addEventListener('click', () => {
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
  document.getElementById('changeUserBtn').addEventListener('click', () => {
    currentCoach = null;
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
});
