import { t, getLocale, getLocales, setLocale } from './i18n.js';

export function renderLayout(activePage) {
  renderNav(activePage);
  renderFooter();
}

function renderNav(activePage) {
  const locales = getLocales();
  const current = getLocale();
  const options = Object.entries(locales).map(([code, name]) =>
    `<option value="${code}" ${code === current ? 'selected' : ''}>${name}</option>`
  ).join('');

  const el = document.getElementById('nav-container');
  if (!el) return;
  el.innerHTML = `<nav>
    <div class="nav-brand">
      <a href="index.html" class="logo">Libre DISC</a>
      <span class="nav-tagline">${t('nav_tagline')}</span>
    </div>
    <div class="nav-links">
      <a href="index.html" class="${activePage === 'test' ? 'active' : ''}">${t('nav.test')}</a>
      <a href="results.html" class="${activePage === 'results' ? 'active' : ''}">${t('nav.results')}</a>
      <a href="teams.html" class="${activePage === 'compare' ? 'active' : ''}">${t('nav.compare')}</a>
      <select class="lang-select" id="lang-select">${options}</select>
    </div>
  </nav>`;

  document.getElementById('lang-select').addEventListener('change', e => {
    setLocale(e.target.value);
  });
}

function renderFooter() {
  const el = document.getElementById('footer-container');
  if (!el) return;
  el.innerHTML = `<footer>
    <p>${t('foss_desc')} <a href="https://github.com/WhiteBlackGoose/libre-disc" target="_blank" rel="noopener" style="color: var(--color-i); text-decoration: none;">${t('foss_source')}</a></p>
    <p style="margin-top: 0.5rem;">${t('footer_purpose')}</p>
  </footer>`;
}
