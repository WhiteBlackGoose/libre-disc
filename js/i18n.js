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

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])
        && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export async function setLocale(code) {
  if (!LOCALES[code]) code = 'en';
  try {
    const mod = await import(`./lang/${code}.js`);
    if (code === 'en') {
      state.strings = mod.default;
    } else {
      const en = await import('./lang/en.js');
      state.strings = deepMerge(en.default, mod.default);
    }
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
