import { t } from './i18n.js';

export const DISC_COLORS = { D: '#E63946', I: '#F4A261', S: '#2A9D8F', C: '#457B9D' };

function blend(c1, c2, ratio = 0.5) {
  const hex = c => parseInt(c, 16);
  const r = Math.round(hex(c1.slice(1, 3)) * ratio + hex(c2.slice(1, 3)) * (1 - ratio));
  const g = Math.round(hex(c1.slice(3, 5)) * ratio + hex(c2.slice(3, 5)) * (1 - ratio));
  const b = Math.round(hex(c1.slice(5, 7)) * ratio + hex(c2.slice(5, 7)) * (1 - ratio));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const PERSONALITY_DATA = {
  D:  { id: 'D',  primary: 'D', secondary: null, color: DISC_COLORS.D },
  Di: { id: 'Di', primary: 'D', secondary: 'I',  color: blend(DISC_COLORS.D, DISC_COLORS.I, 0.7) },
  DI: { id: 'DI', primary: 'D', secondary: 'I',  color: blend(DISC_COLORS.D, DISC_COLORS.I) },
  Id: { id: 'Id', primary: 'I', secondary: 'D',  color: blend(DISC_COLORS.I, DISC_COLORS.D, 0.7) },
  I:  { id: 'I',  primary: 'I', secondary: null, color: DISC_COLORS.I },
  Is: { id: 'Is', primary: 'I', secondary: 'S',  color: blend(DISC_COLORS.I, DISC_COLORS.S, 0.7) },
  IS: { id: 'IS', primary: 'I', secondary: 'S',  color: blend(DISC_COLORS.I, DISC_COLORS.S) },
  Si: { id: 'Si', primary: 'S', secondary: 'I',  color: blend(DISC_COLORS.S, DISC_COLORS.I, 0.7) },
  S:  { id: 'S',  primary: 'S', secondary: null, color: DISC_COLORS.S },
  Sc: { id: 'Sc', primary: 'S', secondary: 'C',  color: blend(DISC_COLORS.S, DISC_COLORS.C, 0.7) },
  SC: { id: 'SC', primary: 'S', secondary: 'C',  color: blend(DISC_COLORS.S, DISC_COLORS.C) },
  Cs: { id: 'Cs', primary: 'C', secondary: 'S',  color: blend(DISC_COLORS.C, DISC_COLORS.S, 0.7) },
  C:  { id: 'C',  primary: 'C', secondary: null, color: DISC_COLORS.C },
  Cd: { id: 'Cd', primary: 'C', secondary: 'D',  color: blend(DISC_COLORS.C, DISC_COLORS.D, 0.7) },
  CD: { id: 'CD', primary: 'C', secondary: 'D',  color: blend(DISC_COLORS.C, DISC_COLORS.D) },
  Dc: { id: 'Dc', primary: 'D', secondary: 'C',  color: blend(DISC_COLORS.D, DISC_COLORS.C, 0.7) }
};

export function getPersonality(id) {
  const data = PERSONALITY_DATA[id] || PERSONALITY_DATA['D'];
  const text = t(`types.${id}`);
  if (typeof text === 'object' && text !== null) {
    return { ...data, ...text };
  }
  return { ...data, name: id, desc: '', strengths: [], challenges: [], keywords: [], approach: {} };
}

export function getAllPersonalities() {
  return Object.keys(PERSONALITY_DATA).map(id => getPersonality(id));
}
