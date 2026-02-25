import { initI18n, t, onLocaleChange } from './i18n.js';
import { renderLayout } from './layout.js';
import { getPersonality, DISC_COLORS } from './personalities.js';
import { TYPE_ICONS } from './icons.js';
import {
  decodeResult, encodeResult, extractCode, determineType, loadResult,
  encodeProfiles, decodeProfiles, renderMultiAxisSliders,
  drawMultiDiamond, drawMultiAxesPlot, drawMultiDiscWheel, preloadIcons
} from './shared.js';

const PROFILE_COLORS = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
let profileInputs = [{ name: '', code: '' }, { name: '', code: '' }];
let iconImages = {};

async function init() {
  await initI18n();
  iconImages = await preloadIcons(TYPE_ICONS);
  onLocaleChange(() => renderPage());

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const pParam = params.get('p');
  const aParam = params.get('a');
  const bParam = params.get('b');

  if (pParam) {
    const decoded = decodeProfiles(pParam);
    if (decoded.length >= 2) {
      profileInputs = decoded;
      renderPage();
      runComparison();
      return;
    }
  } else if (aParam && bParam) {
    profileInputs = [{ name: '', code: aParam }, { name: '', code: bParam }];
    renderPage();
    runComparison();
    return;
  }

  renderPage();
}

function renderPage() {
  renderLayout('compare');
  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <div class="compare-header">
      <h1>${t('compare_title')}</h1>
      <p>${t('compare_subtitle')}</p>
    </div>
    <div id="profiles-input" class="profiles-input"></div>
    <div class="compare-actions">
      <button class="btn btn-secondary" id="add-profile">${t('compare_add')}</button>
      <button class="btn btn-secondary" id="load-saved">${t('compare_load')}</button>
      <button class="btn btn-primary" id="compare-btn">${t('compare_btn')}</button>
    </div>
    <div id="compare-results"></div>`;

  renderProfileInputs();

  document.getElementById('add-profile').addEventListener('click', () => {
    profileInputs.push({ name: '', code: '' });
    renderProfileInputs();
  });

  document.getElementById('load-saved').addEventListener('click', () => {
    const scores = loadResult();
    if (scores) {
      const code = encodeResult(scores);
      if (profileInputs.length > 0 && !profileInputs[0].code) {
        profileInputs[0].code = code;
      } else {
        profileInputs.push({ name: '', code });
      }
      renderProfileInputs();
    } else {
      alert(t('compare_no_saved'));
    }
  });

  document.getElementById('compare-btn').addEventListener('click', runComparison);
}

function renderProfileInputs() {
  const container = document.getElementById('profiles-input');
  if (!container) return;
  container.innerHTML = profileInputs.map((p, i) => `
    <div class="profile-input-row">
      <span class="profile-color" style="background:${PROFILE_COLORS[i % PROFILE_COLORS.length]}"></span>
      <input type="text" class="input profile-name" placeholder="${t('compare_name')}" value="${p.name || ''}" data-idx="${i}" data-field="name">
      <input type="text" class="input profile-code" placeholder="${t('compare_code')}" value="${p.code || ''}" data-idx="${i}" data-field="code">
      ${profileInputs.length > 2 ? `<button class="btn btn-sm btn-danger remove-profile" data-idx="${i}">✕</button>` : ''}
    </div>`).join('');

  container.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx = parseInt(inp.dataset.idx);
      profileInputs[idx][inp.dataset.field] = inp.value;
    });
  });
  container.querySelectorAll('.remove-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      profileInputs.splice(parseInt(btn.dataset.idx), 1);
      renderProfileInputs();
    });
  });
}

function runComparison() {
  // Save current input values
  document.querySelectorAll('#profiles-input input').forEach(inp => {
    const idx = parseInt(inp.dataset.idx);
    if (profileInputs[idx]) profileInputs[idx][inp.dataset.field] = inp.value;
  });

  const profiles = profileInputs
    .map((p, i) => {
      const rawCode = extractCode(p.code);
      const scores = decodeResult(rawCode);
      if (!scores) return null;
      return {
        name: p.name || `Profile ${i + 1}`,
        code: rawCode,
        scores,
        type: determineType(scores),
        color: PROFILE_COLORS[i % PROFILE_COLORS.length]
      };
    })
    .filter(Boolean);

  if (profiles.length < 2) {
    alert(t('compare_need_two'));
    return;
  }

  // Update URL
  const encoded = encodeProfiles(profileInputs.filter(p => extractCode(p.code) && decodeResult(extractCode(p.code)))
    .map(p => ({ name: p.name, code: extractCode(p.code) })));
  const newUrl = window.location.pathname + '?p=' + encoded;
  history.replaceState(null, '', newUrl);

  renderResults(profiles);
}

async function renderResults(profiles) {
  const container = document.getElementById('compare-results');
  if (!container) return;

  // Legend
  const legend = profiles.map(p => {
    const personality = getPersonality(p.type);
    const resultsLink = `results.html?r=${encodeResult(p.scores)}`;
    return `<div class="compare-legend-item">
      <span class="legend-dot" style="background:${p.color}"></span>
      <strong>${p.name}</strong> — <span style="color:${personality.color}">${p.type}</span> ${personality.name || ''}
      <a href="${resultsLink}" class="btn-link" style="margin-left:0.5rem;font-size:0.75rem;color:var(--color-i);text-decoration:none;">→ ${t('compare_view_results') || 'View Results'}</a>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="card"><div class="compare-legend">${legend}</div></div>

    <div class="card">
      <h3>${t('compare_scores')}</h3>
      <div id="compare-bars"></div>
    </div>

    <div class="card">
      <h3>${t('compare_dimensions')}</h3>
      <div id="compare-axes"></div>
    </div>

    <div class="results-grid">
      <div class="card">
        <h3>${t('compare_overlay')}</h3>
        <canvas id="compare-diamond"></canvas>
      </div>
      <div class="card">
        <h3>${t('compare_quadrant')}</h3>
        <canvas id="compare-quadrant"></canvas>
      </div>
    </div>

    <div class="card wheel-section">
      <h3>${t('compare_wheel')}</h3>
      <div class="wheel-container"><canvas id="compare-wheel"></canvas></div>
    </div>

    <div class="card">
      <h3>${t('compare_insights')}</h3>
      <div id="compare-insights"></div>
    </div>

    <div class="card share-section">
      <h3>${t('compare_share')}</h3>
      <div class="share-code">
        <code id="compare-url" style="font-size:0.75rem;word-break:break-all">${window.location.href}</code>
        <button class="btn btn-secondary btn-sm" id="copy-compare">${t('btn_copy_link')}</button>
      </div>
    </div>`;

  // Score bars
  const barsEl = document.getElementById('compare-bars');
  for (const dim of ['D', 'I', 'S', 'C']) {
    const bars = profiles.map(p =>
      `<div class="compare-bar-row">
        <span class="compare-bar-name" style="color:${p.color}">${p.name}</span>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${p.scores[dim]}%;background:${p.color}">${p.scores[dim]}%</div></div>
      </div>`
    ).join('');
    barsEl.innerHTML += `<div class="compare-dim-group">
      <h4 style="color:${DISC_COLORS[dim]}">${t('dim.' + dim)}</h4>
      ${bars}
    </div>`;
  }

  // Axes
  renderMultiAxisSliders(document.getElementById('compare-axes'), profiles);

  // Charts
  drawMultiDiamond(document.getElementById('compare-diamond'), profiles);
  drawMultiAxesPlot(document.getElementById('compare-quadrant'), profiles);
  await drawMultiDiscWheel(document.getElementById('compare-wheel'), profiles, iconImages);

  // Insights (pairwise for first two profiles)
  renderInsights(profiles);

  // Copy
  document.getElementById('copy-compare').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('copy-compare');
      const orig = btn.textContent;
      btn.textContent = t('btn_copied');
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });
}

function renderInsights(profiles) {
  const container = document.getElementById('compare-insights');
  if (profiles.length < 2) return;

  const a = profiles[0].scores, b = profiles[1].scores;
  const dims = ['D', 'I', 'S', 'C'];
  const diffs = dims.map(d => Math.abs(a[d] - b[d]));
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / 4;
  const similarity = Math.max(0, Math.round(100 - avgDiff));

  let overallMsg;
  if (similarity > 75) overallMsg = t('insight_high');
  else if (similarity > 45) overallMsg = t('insight_mid');
  else overallMsg = t('insight_low');

  const dimInsights = dims.map((d, i) => {
    const diff = diffs[i];
    const dimName = t('dim.' + d);
    let level, desc;
    if (diff < 15) {
      level = t('insight_aligned');
      desc = t('insight_aligned_desc').replace('{dim}', dimName);
    } else if (diff < 30) {
      level = t('insight_moderate');
      desc = t('insight_moderate_desc').replace('{dim}', dimName);
    } else {
      level = t('insight_significant');
      desc = t('insight_significant_desc').replace('{dim}', dimName);
    }
    return `<div class="insight-item">
      <span class="insight-dim" style="color:${DISC_COLORS[d]}">${dimName}</span>
      <span class="insight-level">${level}</span>
      <span class="insight-desc">${desc}</span>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="similarity-bar">
      <span>${t('compare_similarity')}: <strong>${similarity}%</strong></span>
      <div class="score-bar-track"><div class="score-bar-fill" style="width:${similarity}%;background:linear-gradient(90deg,${DISC_COLORS.D},${DISC_COLORS.I})">${similarity}%</div></div>
    </div>
    <p style="margin:1rem 0;opacity:0.8">${overallMsg}</p>
    <div class="insights-grid">${dimInsights}</div>`;
}

init();
