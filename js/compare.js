import { getPersonality, DISC_COLORS } from './personalities.js';
import { decodeResult, determineType, loadResult, encodeResult, drawDiamondChart, drawAxesPlot } from './shared.js';

function init() {
  const params = new URLSearchParams(window.location.search);
  const codeA = params.get('a') || '';
  const codeB = params.get('b') || '';

  const inputA = document.getElementById('input-a');
  const inputB = document.getElementById('input-b');
  inputA.value = codeA;
  inputB.value = codeB;

  document.getElementById('load-mine-btn').addEventListener('click', () => {
    const saved = loadResult();
    if (saved) {
      inputA.value = encodeResult(saved.scores);
    } else {
      alert('No saved result found. Take the test first!');
    }
  });

  document.getElementById('compare-btn').addEventListener('click', () => {
    runComparison(inputA.value.trim(), inputB.value.trim());
  });

  // Auto-compare if both codes provided
  if (codeA && codeB) {
    runComparison(codeA, codeB);
  }
}

function runComparison(codeA, codeB) {
  const scoresA = decodeResult(codeA);
  const scoresB = decodeResult(codeB);

  if (!scoresA || !scoresB) {
    alert('Invalid result code(s). Please check and try again.');
    return;
  }

  const typeA = determineType(scoresA);
  const typeB = determineType(scoresB);
  const personA = getPersonality(typeA);
  const personB = getPersonality(typeB);

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('a', codeA);
  url.searchParams.set('b', codeB);
  history.replaceState(null, '', url);

  renderComparison(scoresA, scoresB, personA, personB);
}

function renderComparison(scoresA, scoresB, personA, personB) {
  const container = document.getElementById('compare-result');
  container.classList.add('active');

  container.innerHTML = `
    <div class="compare-profiles">
      <div class="compare-profile">
        <div class="emoji">${personA.emoji}</div>
        <div class="name" style="color: ${personA.color}">${personA.name}</div>
        <span class="type-label" style="background: ${personA.color}22; color: ${personA.color}; border: 1px solid ${personA.color}44;">${personA.id}</span>
      </div>
      <div class="compare-profile">
        <div class="emoji">${personB.emoji}</div>
        <div class="name" style="color: ${personB.color}">${personB.name}</div>
        <span class="type-label" style="background: ${personB.color}22; color: ${personB.color}; border: 1px solid ${personB.color}44;">${personB.id}</span>
      </div>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1rem;">Score Comparison</h3>
      <div class="score-bars">
        ${['D', 'I', 'S', 'C'].map(dim => `
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span style="font-weight: 700; color: ${DISC_COLORS[dim]}; font-size: 0.85rem;">${dim}</span>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">${scoresA[dim]}% vs ${scoresB[dim]}%</span>
            </div>
            <div style="position: relative; height: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
              <div style="position: absolute; height: 100%; width: ${scoresA[dim]}%; background: ${DISC_COLORS[dim]}; border-radius: 10px; opacity: 0.7;"></div>
              <div style="position: absolute; height: 100%; width: ${scoresB[dim]}%; background: #9966ff; border-radius: 10px; opacity: 0.5;"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background: white;"></div> Person A</div>
        <div class="legend-item"><div class="legend-dot" style="background: #9966ff;"></div> Person B</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card chart-card">
        <h3>Profile Overlay</h3>
        <canvas id="compare-diamond" width="300" height="300" style="max-width: 300px;"></canvas>
        <div class="legend" style="margin-top: 0.75rem;">
          <div class="legend-item"><div class="legend-dot" style="background: white;"></div> Person A</div>
          <div class="legend-item"><div class="legend-dot" style="background: #9966ff;"></div> Person B</div>
        </div>
      </div>
      <div class="card chart-card">
        <h3>Axes Comparison</h3>
        <canvas id="compare-axes" width="300" height="300" style="max-width: 300px;"></canvas>
        <div class="legend" style="margin-top: 0.75rem;">
          <div class="legend-item"><div class="legend-dot" style="background: white;"></div> Person A</div>
          <div class="legend-item"><div class="legend-dot" style="background: #9966ff;"></div> Person B</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 1.5rem;">
      <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 1rem;">Compatibility Insights</h3>
      <div id="insights"></div>
    </div>
  `;

  requestAnimationFrame(() => {
    function initCanvas(id, size) {
      const dpr = window.devicePixelRatio || 1;
      const c = document.getElementById(id);
      c.width = size * dpr;
      c.height = size * dpr;
      c.getContext('2d').scale(dpr, dpr);
      return c;
    }

    drawDiamondChart(initCanvas('compare-diamond', 300), scoresA, scoresB);
    drawAxesPlot(initCanvas('compare-axes', 300), scoresA, scoresB);
  });

  renderInsights(scoresA, scoresB, personA, personB);
}

function renderInsights(scoresA, scoresB, personA, personB) {
  const insights = [];

  // Similarity score
  const totalDiff = ['D', 'I', 'S', 'C'].reduce((sum, dim) =>
    sum + Math.abs(scoresA[dim] - scoresB[dim]), 0);
  const similarity = Math.round(Math.max(0, 100 - totalDiff / 4));

  insights.push(`<div style="text-align: center; margin-bottom: 1.5rem;">
    <div style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--color-d), var(--color-i)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${similarity}%</div>
    <div style="color: var(--text-secondary); font-size: 0.9rem;">Profile Similarity</div>
  </div>`);

  // Dimension-by-dimension analysis
  const dims = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Conscientiousness' };
  for (const [dim, label] of Object.entries(dims)) {
    const diff = Math.abs(scoresA[dim] - scoresB[dim]);
    let note;
    if (diff <= 10) {
      note = `<span style="color: var(--color-s);">Very aligned</span> — you both approach ${label.toLowerCase()} similarly.`;
    } else if (diff <= 25) {
      note = `<span style="color: var(--color-i);">Moderate difference</span> — complementary ${label.toLowerCase()} styles.`;
    } else {
      note = `<span style="color: var(--color-d);">Significant gap</span> — this may be an area of tension or growth.`;
    }
    insights.push(`<div style="margin-bottom: 0.75rem;">
      <strong style="color: ${DISC_COLORS[dim]};">${label}:</strong> ${note}
    </div>`);
  }

  // Overall dynamic
  let dynamic;
  if (similarity >= 75) {
    dynamic = "You share a very similar communication and work style. Collaboration is natural, but watch for shared blind spots.";
  } else if (similarity >= 50) {
    dynamic = "A healthy balance of similarity and difference. You can complement each other's strengths while still finding common ground.";
  } else {
    dynamic = "Your styles are quite different — this brings diverse perspectives but requires intentional communication and patience.";
  }
  insights.push(`<div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); color: var(--text-secondary); font-style: italic;">${dynamic}</div>`);

  document.getElementById('insights').innerHTML = insights.join('');
}

document.addEventListener('DOMContentLoaded', init);
