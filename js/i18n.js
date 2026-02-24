const LOCALES = {
  en: 'English', de: 'Deutsch', fr: 'Français',
  it: 'Italiano', ru: 'Русский', uk: 'Українська', es: 'Español'
};

const state = { strings: {}, locale: 'en', listeners: [] };

export function t(key) {
  if (typeof key !== 'string') return key;
  const parts = key.split('.');
  let val = state.strings;
  for (const p of parts) { val = val?.[p]; }
  return val ?? key;
}

export function getLocale() { return state.locale; }
export function getLocales() { return LOCALES; }
export function onLocaleChange(fn) { state.listeners.push(fn); }

export async function initI18n() {
  const saved = localStorage.getItem('disc_lang');
  const browser = navigator.language?.slice(0, 2);
  const code = saved || (LOCALES[browser] ? browser : 'en');
  await setLocale(code);
}

export async function setLocale(code) {
  if (!LOCALES[code]) code = 'en';
  try {
    const mod = await import(`./lang/${code}.js`);
    state.strings = mod.default;
  } catch {
    if (code !== 'en') {
      const en = await import('./lang/en.js');
      state.strings = en.default;
    }
  }
  state.locale = code;
  localStorage.setItem('disc_lang', code);
  state.listeners.forEach(fn => fn(code));
}
