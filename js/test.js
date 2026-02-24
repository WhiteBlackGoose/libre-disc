import { initI18n, t, onLocaleChange } from './i18n.js';
import { renderLayout } from './layout.js';
import { getQuestions } from './questions.js';
import { calculateScores, determineType, saveResult, encodeResult } from './shared.js';

let answers = {};
let currentQ = 0;
let questions = [];

async function init() {
  await initI18n();
  onLocaleChange(() => render());
  render();
}

function render() {
  renderLayout('test');
  questions = getQuestions();
  const content = document.getElementById('content');
  if (!content) return;

  // Check if test was in progress
  const saved = sessionStorage.getItem('disc_answers');
  if (saved) {
    try { answers = JSON.parse(saved); } catch { answers = {}; }
  }

  if (Object.keys(answers).length === 0) {
    renderLanding(content);
  } else {
    renderQuestion(content);
  }
}

function renderLanding(content) {
  content.innerHTML = `
    <div class="hero">
      <h1>${t('hero_title')}</h1>
      <p>${t('hero_subtitle')}</p>
      <button class="btn btn-primary btn-start" id="start-btn">${t('hero_start')}</button>
    </div>
    <div class="intro-info">
      <p>${t('intro_text')}</p>
      <p style="margin-top:0.75rem;opacity:0.7">${t('intro_saved')}</p>
    </div>`;
  document.getElementById('start-btn').addEventListener('click', () => {
    answers = {};
    currentQ = 0;
    renderQuestion(content);
  });
}

function renderQuestion(content) {
  if (currentQ >= questions.length) {
    finishTest();
    return;
  }
  const q = questions[currentQ];
  const progressPct = ((currentQ + 1) / questions.length) * 100;
  const progressText = t('test_progress').replace('{n}', currentQ + 1).replace('{total}', questions.length);

  content.innerHTML = `
    <div class="test-container">
      <div class="progress-section">
        <div class="progress-text">${progressText}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      </div>
      <div class="question-card">
        <p class="question-text">${q.text}</p>
        <div class="likert-scale">
          <span class="likert-label">${t('test_disagree')}</span>
          ${[1,2,3,4,5].map(v => `<button class="likert-btn ${answers[q.id] === v ? 'selected' : ''}" data-value="${v}">${v}</button>`).join('')}
          <span class="likert-label">${t('test_agree')}</span>
        </div>
        <div class="question-nav">
          ${currentQ > 0 ? `<button class="btn btn-secondary" id="back-btn">${t('test_back')}</button>` : '<span></span>'}
          ${answers[q.id] ? `<button class="btn btn-primary" id="next-btn">${t('test_next')}</button>` : '<span></span>'}
        </div>
      </div>
    </div>`;

  content.querySelectorAll('.likert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      answers[q.id] = parseInt(btn.dataset.value);
      sessionStorage.setItem('disc_answers', JSON.stringify(answers));
      setTimeout(() => { currentQ++; renderQuestion(content); }, 200);
    });
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', () => { currentQ--; renderQuestion(content); });

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.addEventListener('click', () => { currentQ++; renderQuestion(content); });
}

function finishTest() {
  const scores = calculateScores(answers);
  saveResult(scores);
  sessionStorage.removeItem('disc_answers');
  window.location.href = 'results.html';
}

init();
