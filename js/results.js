import { getPersonality, DISC_COLORS } from './personalities.js';
import { decodeResult, loadResult, determineType, encodeResult, drawDiamondChart, drawAxesPlot, drawDiscWheel, getShareUrl, renderAxisSliders } from './shared.js';
import { getTypeIcon } from './icons.js';

function init() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('r');
  let scores, type;

  if (code) {
    scores = decodeResult(code);
    if (scores) {
      type = determineType(scores);
    }
  }

  if (!scores) {
    const saved = loadResult();
    if (saved) {
      scores = saved.scores;
      type = saved.type;
    }
  }

  if (!scores) {
    document.getElementById('results-content').innerHTML = `
      <div class="hero">
        <h1>No Results Yet</h1>
        <p>Take the DISC personality test first to see your results.</p>
        <a href="index.html" class="btn btn-primary">Take the Test</a>
      </div>
    `;
    return;
  }

  const personality = getPersonality(type);
  renderResults(scores, personality);
}

const APPROACH_LABELS = {
  giving_feedback: { icon: '💬', title: 'Giving Feedback' },
  criticism:       { icon: '⚠️', title: 'Constructive Criticism' },
  supporting:      { icon: '🤲', title: 'Supporting Them' },
  collaborating:   { icon: '🤝', title: 'Collaborating' },
  motivating:      { icon: '🔥', title: 'Motivating' }
};

function renderResults(scores, personality) {
  const container = document.getElementById('results-content');
  const code = encodeResult(scores);

  const approachHtml = personality.approach ? Object.entries(personality.approach).map(([key, text]) => {
    const label = APPROACH_LABELS[key] || { icon: '📌', title: key };
    return `<div class="approach-card">
      <div class="approach-title"><span class="approach-icon">${label.icon}</span> ${label.title}</div>
      <p>${text}</p>
    </div>`;
  }).join('') : '';

  container.innerHTML = `
    <div class="result-header">
      <div class="result-icon">${getTypeIcon(personality.id, 72, personality.color)}</div>
      <div class="type-badge" style="background: ${personality.color}22; color: ${personality.color}; border: 1px solid ${personality.color}44;">
        ${personality.id}
      </div>
      <h1 style="color: ${personality.color}">${personality.name}</h1>
      <p class="description">${personality.description}</p>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1rem;">Your DISC Scores</h3>
      <div class="score-bars">
        ${['D', 'I', 'S', 'C'].map(dim => `
          <div class="score-bar-row">
            <span class="dim-label" style="color: ${DISC_COLORS[dim]}">${dim}</span>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width: ${scores[dim]}%; background: linear-gradient(90deg, ${DISC_COLORS[dim]}cc, ${DISC_COLORS[dim]});"></div>
            </div>
            <span class="score-bar-value" style="color: ${DISC_COLORS[dim]}">${scores[dim]}%</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1.25rem;">Behavioral Dimensions</h3>
      <div id="axis-sliders"></div>
    </div>

    <div class="result-grid">
      <div class="card">
        <h3>Strengths</h3>
        <ul class="strengths-list">
          ${personality.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      <div class="card">
        <h3>Challenges</h3>
        <ul class="challenges-list">
          ${personality.challenges.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div class="keywords">
          ${personality.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
        </div>
      </div>
    </div>

    ${approachHtml ? `
    <div class="card" style="margin-top: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 0.5rem;">How to Approach This Type</h3>
      <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">Tips for working with someone who has this personality profile.</p>
      <div class="approach-grid">${approachHtml}</div>
    </div>` : ''}

    <div class="card chart-card" style="margin-top: 1.5rem; padding: 2rem;">
      <h3>Your Position on the DISC Wheel</h3>
      <canvas id="disc-wheel" width="380" height="380" style="max-width: 380px;"></canvas>
    </div>

    <div class="charts-grid">
      <div class="card chart-card">
        <h3>Profile Shape</h3>
        <canvas id="diamond-chart" width="300" height="300" style="max-width: 300px;"></canvas>
      </div>
      <div class="card chart-card">
        <h3>Quadrant Plot</h3>
        <canvas id="axes-chart" width="300" height="300" style="max-width: 300px;"></canvas>
      </div>
    </div>

    <div class="share-section card">
      <h3 style="margin-bottom: 0.5rem;">Share Your Result</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">Copy your result code or share link to compare with others.</p>
      <div class="share-code">
        <input type="text" id="share-link" value="${getShareUrl(scores)}" readonly>
        <button class="btn btn-secondary" id="copy-btn">Copy</button>
      </div>
      <div style="margin-top: 1rem;">
        <span style="color: var(--text-secondary); font-size: 0.85rem;">Result code: </span>
        <code style="color: var(--color-i); font-family: 'JetBrains Mono', monospace;">${code}</code>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <a href="compare.html?a=${code}" class="btn btn-secondary">Compare with Someone</a>
        <a href="index.html" class="btn btn-ghost">Retake Test</a>
      </div>
    </div>
  `;

  // Render axis sliders
  renderAxisSliders(scores, 'axis-sliders');

  // Draw charts
  requestAnimationFrame(() => {
    function initCanvas(id, size) {
      const dpr = window.devicePixelRatio || 1;
      const c = document.getElementById(id);
      c.width = size * dpr;
      c.height = size * dpr;
      c.getContext('2d').scale(dpr, dpr);
      return c;
    }

    drawDiscWheel(initCanvas('disc-wheel', 380), personality.id, scores);
    drawDiamondChart(initCanvas('diamond-chart', 300), scores);
    drawAxesPlot(initCanvas('axes-chart', 300), scores);
  });

  // Copy button
  document.getElementById('copy-btn').addEventListener('click', () => {
    const input = document.getElementById('share-link');
    navigator.clipboard.writeText(input.value).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
