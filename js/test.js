import { QUESTIONS } from './questions.js';
import { calculateScores, determineType, saveResult, encodeResult } from './shared.js';

let currentQuestion = 0;
const answers = {};

function init() {
  const startBtn = document.getElementById('start-btn');
  const landing = document.getElementById('landing');
  const testSection = document.getElementById('test-section');

  startBtn.addEventListener('click', () => {
    landing.style.opacity = '0';
    setTimeout(() => {
      landing.style.display = 'none';
      testSection.classList.add('active');
      renderQuestion();
    }, 300);
  });
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;

  document.getElementById('progress-fill').style.width = `${((currentQuestion) / total) * 100}%`;
  document.getElementById('progress-text').textContent = `Question ${currentQuestion + 1} of ${total}`;

  const container = document.getElementById('question-container');
  const existing = answers[q.id];

  container.innerHTML = `
    <div class="question-card card" key="${q.id}">
      <h2>"${q.text}"</h2>
      <div class="likert-scale">
        ${[1, 2, 3, 4, 5].map(v => `
          <button data-value="${v}" class="${existing?.score === v ? 'selected' : ''}">${v}</button>
        `).join('')}
      </div>
      <div class="likert-labels">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
      <div class="test-nav">
        <button class="btn btn-ghost" id="prev-btn" ${currentQuestion === 0 ? 'disabled style="visibility:hidden"' : ''}>← Back</button>
        <button class="btn btn-ghost" id="next-btn" ${!existing ? 'disabled style="opacity:0.3"' : ''}>Next →</button>
      </div>
    </div>
  `;

  container.querySelectorAll('.likert-scale button').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      answers[q.id] = { score: value, dimension: q.dimension };

      container.querySelectorAll('.likert-scale button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const nextBtn = document.getElementById('next-btn');
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';

      // Auto-advance after short delay
      setTimeout(() => advance(), 350);
    });
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  });

  document.getElementById('next-btn')?.addEventListener('click', advance);
}

function advance() {
  const q = QUESTIONS[currentQuestion];
  if (!answers[q.id]) return;

  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    finishTest();
  }
}

function finishTest() {
  const scores = calculateScores(answers);
  const type = determineType(scores);
  saveResult(scores, type);
  const code = encodeResult(scores);
  window.location.href = `results.html?r=${code}`;
}

document.addEventListener('DOMContentLoaded', init);
