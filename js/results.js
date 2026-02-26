import { initI18n, t, onLocaleChange } from './i18n.js';
import { renderLayout } from './layout.js';
import { getPersonality, DISC_COLORS } from './personalities.js';
import { TYPE_ICONS } from './icons.js';
import {
  loadResult, decodeResult, determineType, encodeResult, extractCode,
  renderAxisSliders, drawDiamondChart, drawAxesPlot, drawDiscWheel, preloadIcons,
  saveName, loadName
} from './shared.js';
import { drawQR } from './qr.js';

let currentScores = null;
let currentName = '';
let iconImages = {};

async function init() {
  await initI18n();
  iconImages = await preloadIcons(TYPE_ICONS);
  onLocaleChange(async () => { await renderPage(); });

  // Check URL param
  const params = new URLSearchParams(window.location.search);
  const code = params.get('r');
  const nameParam = params.get('name');
  if (code) {
    currentScores = decodeResult(code);
  }
  if (!currentScores) {
    currentScores = loadResult();
  }
  // Name: URL param > localStorage
  currentName = nameParam || loadName();
  await renderPage();
}

async function renderPage() {
  renderLayout('results');
  const content = document.getElementById('content');
  if (!content) return;

  if (!currentScores) {
    content.innerHTML = `<div class="hero">
      <h1>${t('results_none_title')}</h1>
      <p>${t('results_none_text')}</p>
      <a href="index.html" class="btn btn-primary">${t('results_take_test')}</a>
    </div>`;
    return;
  }

  const typeId = determineType(currentScores);
  const personality = getPersonality(typeId);
  const code = encodeResult(currentScores);

  function buildShareUrl() {
    const params = new URLSearchParams({ r: code });
    if (currentName) params.set('name', currentName);
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }
  let shareUrl = buildShareUrl();

  // Update URL bar so users can always copy/bookmark it
  history.replaceState(null, '', '?' + new URLSearchParams(
    currentName ? { r: code, name: currentName } : { r: code }
  ).toString());

  // Icon SVG
  const iconFn = TYPE_ICONS[typeId];
  const iconSvg = iconFn ? iconFn(64, personality.color) : '';

  // Approach tips
  const approachKeys = ['giving_feedback', 'criticism', 'supporting', 'collaborating', 'motivating'];
  const approachIcons = ['💬', '⚡', '🤝', '🔄', '🚀'];
  const approachHtml = approachKeys.map((key, i) => {
    const tip = personality.approach?.[key];
    if (!tip) return '';
    return `<div class="approach-card">
      <div class="approach-icon">${approachIcons[i]}</div>
      <h4>${t('approach.' + key)}</h4>
      <p>${tip}</p>
    </div>`;
  }).join('');

  content.innerHTML = `
    <div class="result-header">
      <div class="type-icon">${iconSvg}</div>
      <div class="type-badge" style="background:${personality.color}20;border:2px solid ${personality.color};color:${personality.color}">${typeId}</div>
      <h1 style="color:${personality.color}">${personality.name || typeId}</h1>
      <p class="type-desc">${personality.desc || ''}</p>
    </div>

    <div class="card wheel-section">
      <h3>${t('results_wheel')}</h3>
      <div class="wheel-container"><canvas id="wheel-canvas"></canvas></div>
    </div>

    <div class="results-grid">
      <div class="card">
        <h3>${t('results_scores')}</h3>
        <div class="score-bars" id="score-bars"></div>
      </div>
      <div class="card">
        <h3>${t('results_dimensions')}</h3>
        <div id="axis-sliders"></div>
      </div>
    </div>

    <div class="results-grid">
      <div class="card">
        <h3>${t('results_strengths')}</h3>
        <ul class="trait-list strengths">${(personality.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h3>${t('results_challenges')}</h3>
        <ul class="trait-list challenges">${(personality.challenges || []).map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
    </div>

    ${approachHtml ? `
    <div class="card approach-section">
      <h3>${t('results_approach_title')}</h3>
      <p class="approach-subtitle">${t('results_approach_subtitle')}</p>
      <div class="approach-grid">${approachHtml}</div>
    </div>` : ''}

    ${(personality.professions || []).length > 0 ? `
    <div class="card">
      <h3>${t('results_professions')}</h3>
      <div class="professions-list">${personality.professions.map(p => `<span class="profession-tag">${p}</span>`).join('')}</div>
    </div>` : ''}

    <div class="results-grid">
      <div class="card">
        <h3>${t('results_shape')}</h3>
        <canvas id="diamond-canvas"></canvas>
      </div>
      <div class="card">
        <h3>${t('results_quadrant')}</h3>
        <canvas id="axes-canvas"></canvas>
      </div>
    </div>

    <div class="card export-panel">
      <h3>${t('results_share_title')}</h3>
      <p>${t('results_share_text')}</p>
      <div class="export-name-row">
        <label for="export-name">${t('results_share_name')}</label>
        <input type="text" class="input" id="export-name" placeholder="${t('results_share_name_placeholder')}" value="${currentName}">
      </div>
      <div class="export-qr"><canvas id="result-qr"></canvas></div>
      <div class="export-code">
        <code id="result-code">${code}</code>
        <button class="btn btn-secondary btn-sm" id="copy-code">${t('btn_copy')}</button>
      </div>
      <div class="export-code" style="margin-top:0.5rem">
        <code id="result-url" style="font-size:0.75rem;word-break:break-all">${shareUrl}</code>
        <button class="btn btn-secondary btn-sm" id="copy-url">${t('btn_copy_link')}</button>
      </div>
      <div class="export-actions">
        <a href="teams.html" class="btn btn-secondary">${t('results_compare')}</a>
        <a href="index.html" class="btn btn-secondary">${t('results_retake')}</a>
      </div>
    </div>`;

  // Score bars
  const barsEl = document.getElementById('score-bars');
  for (const dim of ['D', 'I', 'S', 'C']) {
    const val = currentScores[dim];
    barsEl.innerHTML += `<div class="score-bar-row">
      <span class="score-label" style="color:${DISC_COLORS[dim]}">${t('dim.' + dim)}</span>
      <div class="score-bar-track"><div class="score-bar-fill" style="width:${val}%;background:${DISC_COLORS[dim]}">${val}%</div></div>
    </div>`;
  }

  // Axis sliders
  renderAxisSliders(document.getElementById('axis-sliders'), currentScores);

  // Charts
  drawDiamondChart(document.getElementById('diamond-canvas'), currentScores);
  drawAxesPlot(document.getElementById('axes-canvas'), currentScores);
  await drawDiscWheel(document.getElementById('wheel-canvas'), typeId, currentScores, iconImages);

  // Copy handlers
  document.getElementById('copy-code').addEventListener('click', () => copyText(code, 'copy-code'));
  document.getElementById('copy-url').addEventListener('click', () => copyText(shareUrl, 'copy-url'));

  // Name field — updates URL, QR, and localStorage on change
  const nameInput = document.getElementById('export-name');
  nameInput.addEventListener('input', () => {
    currentName = nameInput.value;
    saveName(currentName);
    shareUrl = buildShareUrl();
    // Update displayed URL
    document.getElementById('result-url').textContent = shareUrl;
    // Update URL bar
    history.replaceState(null, '', '?' + new URLSearchParams(
      currentName ? { r: code, name: currentName } : { r: code }
    ).toString());
    // Regenerate QR
    drawQR(document.getElementById('result-qr'), shareUrl);
  });

  // QR code
  drawQR(document.getElementById('result-qr'), shareUrl);
}

function copyText(text, btnId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    const orig = btn.textContent;
    btn.textContent = t('btn_copied');
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}

init();
