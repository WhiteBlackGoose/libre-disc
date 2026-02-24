import { t } from './i18n.js';

const QUESTION_DIMS = [
  'D','I','S','C','D','I','S','C',
  'D','I','S','C','D','I','S','C',
  'D','I','S','C','D','I','S','C',
  'D','I','S','C'
];

export function getQuestions() {
  const texts = t('questions');
  return QUESTION_DIMS.map((dim, i) => ({
    id: i + 1,
    dimension: dim,
    text: Array.isArray(texts) ? (texts[i] || `Question ${i + 1}`) : `Question ${i + 1}`
  }));
}
