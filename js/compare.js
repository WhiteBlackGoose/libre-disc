import { getPersonality, DISC_COLORS } from './personalities.js';
import { decodeResult, determineType, loadResult, encodeResult, encodeProfiles, decodeProfiles, drawDiamondChart, drawAxesPlot, renderMultiAxisSliders } from './shared.js';
import { getTypeIcon } from './icons.js';

const PROFILE_COLORS = ['#ffffff', '#9966ff', '#ff6b9d', '#4ecdc4', '#ffe66d', '#ff8a5c', '#a8e6cf', '#ff4757'];
let profileEntries = [{ name: '', code: '' }, { name: '', code: '' }];

function init() {
  const params = new URLSearchParams(window.location.search);

  // Support new multi-profile format (?p=...) and legacy (?a=...&b=...)
  const pParam = params.get('p');
  const aParam = params.get('a');
  const bParam = params.get('b');

  if (pParam) {
    const decoded = decodeProfiles(pParam);
    if (decoded.length > 0) {
      profileEntries = decoded.map(d => ({ name: d.name, code: encodeResult(d.scores) }));
      if (profileEntries.length < 2) profileEntries.push({ name: '', code: '' });
    }
  } else if (aParam) {
    profileEntries[0].code = aParam;
    if (bParam) profileEntries[1].code = bParam;
  }

  renderInputUI();

  // Auto-compare if we have at least 2 valid entries
  const valid = profileEntries.filter(p => decodeResult(p.code));
  if (valid.length >= 2) runComparison();
}

function renderInputUI() {
  const container = document.getElementById('profiles-input');
  container.innerHTML = `
    <div class="profiles-list" id="profiles-list">
      ${profileEntries.map((p, i) => `
        <div class="profile-entry" data-idx="${i}">
          <div class="profile-color-dot" style="background: ${PROFILE_COLORS[i % PROFILE_COLORS.length]};"></div>
          <input type="text" class="profile-name" placeholder="Name (optional)" value="${esc(p.name)}" data-idx="${i}">
          <input type="text" class="profile-code" placeholder="Paste result code..." value="${esc(p.code)}" data-idx="${i}">
          ${i >= 2 ? `<button class="remove-btn" data-idx="${i}">×</button>` : '<div style="width:32px;"></div>'}
        </div>
      `).join('')}
    </div>
    <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem;">
      <button class="btn btn-ghost" id="add-profile-btn" style="font-size: 0.85rem;">+ Add Another Profile</button>
      <button class="btn btn-ghost" id="load-mine-btn" style="font-size: 0.85rem;">Load My Saved Result</button>
    </div>
    <div class="compare-actions">
      <button class="btn btn-primary" id="compare-btn">Compare →</button>
    </div>
  `;

  // Bind events
  container.querySelectorAll('.profile-name').forEach(input => {
    input.addEventListener('input', () => { profileEntries[+input.dataset.idx].name = input.value; });
  });
  container.querySelectorAll('.profile-code').forEach(input => {
    input.addEventListener('input', () => { profileEntries[+input.dataset.idx].code = input.value.trim(); });
  });
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      profileEntries.splice(+btn.dataset.idx, 1);
      renderInputUI();
    });
  });
  document.getElementById('add-profile-btn').addEventListener('click', () => {
    profileEntries.push({ name: '', code: '' });
    renderInputUI();
  });
  document.getElementById('load-mine-btn').addEventListener('click', () => {
    const saved = loadResult();
    if (saved) {
      const firstEmpty = profileEntries.findIndex(p => !p.code);
      const idx = firstEmpty >= 0 ? firstEmpty : 0;
      profileEntries[idx].code = encodeResult(saved.scores);
      if (!profileEntries[idx].name) profileEntries[idx].name = 'Me';
      renderInputUI();
    } else {
      alert('No saved result found. Take the test first!');
    }
  });
  document.getElementById('compare-btn').addEventListener('click', runComparison);
}

function esc(s) { return s.replace(/"/g, '&quot;'); }

function runComparison() {
  const profiles = profileEntries
    .map(p => ({ name: p.name, scores: decodeResult(p.code) }))
    .filter(p => p.scores);

  if (profiles.length < 2) {
    alert('Need at least 2 valid result codes to compare.');
    return;
  }

  // Update URL with shareable encoded profiles
  const url = new URL(window.location);
  url.search = '';
  url.searchParams.set('p', encodeProfiles(profiles));
  history.replaceState(null, '', url);

  renderComparison(profiles);
}

function renderComparison(profiles) {
  const container = document.getElementById('compare-result');
  container.classList.add('active');

  // Profile cards
  const profileCards = profiles.map((p, i) => {
    const type = determineType(p.scores);
    const pers = getPersonality(type);
    const col = PROFILE_COLORS[i % PROFILE_COLORS.length];
    return `<div class="compare-profile-card">
      <div class="profile-dot" style="background: ${col};"></div>
      ${getTypeIcon(pers.id, 40, pers.color)}
      <div class="name" style="color: ${pers.color}; font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0.25rem;">${p.name || 'Person ' + (i + 1)}</div>
      <span class="type-label" style="background: ${pers.color}22; color: ${pers.color}; border: 1px solid ${pers.color}44; display: inline-block; padding: 0.15rem 0.6rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700;">${pers.id} — ${pers.name}</span>
    </div>`;
  }).join('');

  // Score comparison bars
  const scoreBars = ['D', 'I', 'S', 'C'].map(dim => {
    const values = profiles.map((p, i) => {
      const col = PROFILE_COLORS[i % PROFILE_COLORS.length];
      return `<div style="position:absolute;height:100%;width:${p.scores[dim]}%;background:${col};border-radius:10px;opacity:0.5;"></div>`;
    }).join('');
    const labels = profiles.map((p, i) => `${p.scores[dim]}%`).join(' / ');
    return `<div style="margin-bottom: 0.75rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
        <span style="font-weight:700;color:${DISC_COLORS[dim]};font-size:0.85rem;">${dim}</span>
        <span style="font-size:0.8rem;color:var(--text-secondary);">${labels}</span>
      </div>
      <div style="position:relative;height:20px;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;">${values}</div>
    </div>`;
  }).join('');

  // Legend
  const legend = profiles.map((p, i) => {
    const col = PROFILE_COLORS[i % PROFILE_COLORS.length];
    return `<div class="legend-item"><div class="legend-dot" style="background:${col};"></div>${p.name || 'Person ' + (i + 1)}</div>`;
  }).join('');

  // Share URL
  const shareUrl = window.location.href;

  container.innerHTML = `
    <div class="compare-profiles-flex">${profileCards}</div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1rem;">Score Comparison</h3>
      ${scoreBars}
      <div class="legend">${legend}</div>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1.25rem;">Behavioral Dimensions</h3>
      <div id="compare-axis-sliders"></div>
      <div class="legend" style="margin-top: 0.5rem;">${legend}</div>
    </div>

    <div class="charts-grid">
      <div class="card chart-card">
        <h3>Profile Overlay</h3>
        <canvas id="compare-diamond" width="300" height="300" style="max-width: 300px;"></canvas>
        <div class="legend" style="margin-top: 0.75rem;">${legend}</div>
      </div>
      <div class="card chart-card">
        <h3>Quadrant Plot</h3>
        <canvas id="compare-axes" width="300" height="300" style="max-width: 300px;"></canvas>
        <div class="legend" style="margin-top: 0.75rem;">${legend}</div>
      </div>
    </div>

    <div class="card" style="margin-top: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1rem;">Compatibility Insights</h3>
      <div id="insights"></div>
    </div>

    <div class="card" style="margin-top: 1.5rem; text-align: center;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 0.75rem;">Share This Comparison</h3>
      <div class="share-code">
        <input type="text" id="share-compare-link" value="${shareUrl}" readonly>
        <button class="btn btn-secondary" id="copy-compare-btn">Copy</button>
      </div>
    </div>
  `;

  // Axis sliders
  renderMultiAxisSliders(profiles, 'compare-axis-sliders');

  // Charts: use first two profiles for overlay (canvas API supports 2)
  requestAnimationFrame(() => {
    function initCanvas(id, size) {
      const dpr = window.devicePixelRatio || 1;
      const c = document.getElementById(id);
      c.width = size * dpr;
      c.height = size * dpr;
      c.getContext('2d').scale(dpr, dpr);
      return c;
    }
    drawDiamondChart(initCanvas('compare-diamond', 300), profiles[0].scores, profiles[1].scores);
    drawAxesPlot(initCanvas('compare-axes', 300), profiles[0].scores, profiles[1].scores);
  });

  renderInsights(profiles);

  document.getElementById('copy-compare-btn').addEventListener('click', () => {
    const input = document.getElementById('share-compare-link');
    navigator.clipboard.writeText(input.value).then(() => {
      const btn = document.getElementById('copy-compare-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  });
}

function renderInsights(profiles) {
  const insights = [];

  // Pairwise similarity for first two
  const [a, b] = profiles;
  const totalDiff = ['D', 'I', 'S', 'C'].reduce((sum, dim) =>
    sum + Math.abs(a.scores[dim] - b.scores[dim]), 0);
  const similarity = Math.round(Math.max(0, 100 - totalDiff / 4));

  insights.push(`<div style="text-align:center;margin-bottom:1.5rem;">
    <div style="font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,var(--color-d),var(--color-i));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${similarity}%</div>
    <div style="color:var(--text-secondary);font-size:0.9rem;">Overall Similarity${profiles.length > 2 ? ` (${a.name || 'Person 1'} & ${b.name || 'Person 2'})` : ''}</div>
  </div>`);

  const dims = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Conscientiousness' };
  for (const [dim, label] of Object.entries(dims)) {
    const diff = Math.abs(a.scores[dim] - b.scores[dim]);
    let note;
    if (diff <= 10) note = `<span style="color:var(--color-s);">Very aligned</span> — similar ${label.toLowerCase()} style.`;
    else if (diff <= 25) note = `<span style="color:var(--color-i);">Moderate difference</span> — complementary ${label.toLowerCase()} styles.`;
    else note = `<span style="color:var(--color-d);">Significant gap</span> — potential tension or growth area.`;
    insights.push(`<div style="margin-bottom:0.75rem;"><strong style="color:${DISC_COLORS[dim]};">${label}:</strong> ${note}</div>`);
  }

  let dynamic;
  if (similarity >= 75) dynamic = "Very similar styles. Collaboration is natural, but watch for shared blind spots.";
  else if (similarity >= 50) dynamic = "A healthy balance of similarity and difference. You can complement each other's strengths.";
  else dynamic = "Quite different styles — diverse perspectives but requires intentional communication.";
  insights.push(`<div style="margin-top:1rem;padding:1rem;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);color:var(--text-secondary);font-style:italic;">${dynamic}</div>`);

  document.getElementById('insights').innerHTML = insights.join('');
}

document.addEventListener('DOMContentLoaded', init);
