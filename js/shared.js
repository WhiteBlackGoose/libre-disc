import { t } from './i18n.js';
import { DISC_COLORS, PERSONALITY_DATA, getPersonality } from './personalities.js';

const WHEEL_TYPES = ['D','Di','DI','Id','I','Is','IS','Si','S','Sc','SC','Cs','C','Cd','CD','Dc'];
const ADJACENT = { D: ['I','C'], I: ['D','S'], S: ['I','C'], C: ['S','D'] };

// --- Scoring ---

export function calculateScores(answers) {
  const raw = { D: 0, I: 0, S: 0, C: 0 };
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  for (const [id, value] of Object.entries(answers)) {
    const idx = parseInt(id) - 1;
    const dims = ['D','I','S','C'];
    const dim = dims[idx % 4];
    raw[dim] += value;
    counts[dim]++;
  }
  const scores = {};
  for (const dim of ['D','I','S','C']) {
    scores[dim] = counts[dim] > 0 ? Math.round((raw[dim] / (counts[dim] * 5)) * 100) : 0;
  }
  return scores;
}

export function determineType(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, fScore] = sorted[0];
  const [second, sScore] = sorted[1];
  const diff = fScore - sScore;
  const adjacent = ADJACENT[first]?.includes(second);
  if (!adjacent || diff > 25) return first;
  // Equal blends must follow clockwise DISC order: DI, IS, SC, CD
  const BLEND_ORDER = { D: { I: 'DI', C: 'CD' }, I: { D: 'DI', S: 'IS' }, S: { I: 'IS', C: 'SC' }, C: { S: 'SC', D: 'CD' } };
  if (diff <= 8) return BLEND_ORDER[first]?.[second] || first + second;
  // Dominant blend: primary + lowercase secondary, respecting wheel order
  const DOM_ORDER = {
    D: { I: 'Di', C: 'Dc' }, I: { D: 'Id', S: 'Is' },
    S: { I: 'Si', C: 'Sc' }, C: { S: 'Cs', D: 'Cd' }
  };
  return DOM_ORDER[first]?.[second] || first + second.toLowerCase();
}

// --- Encoding ---

export function encodeResult(scores) {
  const str = `${scores.D},${scores.I},${scores.S},${scores.C}`;
  return btoa(str).replace(/=+$/, '');
}

export function decodeResult(code) {
  try {
    const padded = code + '==='.slice(0, (4 - code.length % 4) % 4);
    const parts = atob(padded).split(',').map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n) && n >= 0 && n <= 100)) {
      return { D: parts[0], I: parts[1], S: parts[2], C: parts[3] };
    }
  } catch {}
  return null;
}

export function extractCode(input) {
  input = (input || '').trim();
  try {
    const url = new URL(input);
    return url.searchParams.get('r') || url.searchParams.get('p') || input;
  } catch {
    return input;
  }
}

export function encodeProfiles(profiles) {
  const parts = profiles.map(p => (p.name ? p.name + ':' : '') + p.code);
  const bytes = new TextEncoder().encode(parts.join('|'));
  return btoa(String.fromCharCode(...bytes)).replace(/=+$/, '');
}

export function decodeProfiles(encoded) {
  try {
    const padded = encoded + '==='.slice(0, (4 - encoded.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const str = new TextDecoder().decode(bytes);
    return str.split('|').map(part => {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0 && colonIdx < part.length - 1) {
        return { name: part.slice(0, colonIdx), code: part.slice(colonIdx + 1) };
      }
      return { name: '', code: part };
    });
  } catch { return []; }
}

// --- Storage ---

export function saveResult(scores) {
  localStorage.setItem('disc_scores', JSON.stringify(scores));
  localStorage.setItem('disc_code', encodeResult(scores));
}

export function loadResult() {
  try {
    return JSON.parse(localStorage.getItem('disc_scores'));
  } catch { return null; }
}

// --- Canvas helpers ---

function initCanvas(canvas, size) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: size, h: size };
}

// --- Axes ---

const AXES = [
  { id: 'assertive',  leftKey: 'axis.accommodating', rightKey: 'axis.assertive',    colorL: DISC_COLORS.S, colorR: DISC_COLORS.D, calc: s => (s.D * 1.2 + s.I * 0.3) - (s.S * 1.2 + s.C * 0.3) },
  { id: 'expressive', leftKey: 'axis.reserved',      rightKey: 'axis.expressive',   colorL: DISC_COLORS.C, colorR: DISC_COLORS.I, calc: s => (s.I * 1.3 + s.D * 0.2) - (s.C * 1.3 + s.S * 0.2) },
  { id: 'pace',       leftKey: 'axis.deliberate',     rightKey: 'axis.fast_paced',   colorL: DISC_COLORS.S, colorR: DISC_COLORS.D, calc: s => (s.D * 1.0 + s.I * 0.5) - (s.S * 1.0 + s.C * 0.5) },
  { id: 'focus',      leftKey: 'axis.task_focused',   rightKey: 'axis.people_focused',colorL: DISC_COLORS.C, colorR: DISC_COLORS.I, calc: s => (s.I * 1.2 + s.S * 0.3) - (s.C * 1.2 + s.D * 0.3) },
  { id: 'risk',       leftKey: 'axis.cautious',       rightKey: 'axis.risk_taking',  colorL: DISC_COLORS.C, colorR: DISC_COLORS.D, calc: s => (s.D * 1.5 + s.I * 0.5) - (s.C * 1.5 + s.S * 0.5) },
  { id: 'structure',  leftKey: 'axis.flexible',       rightKey: 'axis.structured',   colorL: DISC_COLORS.I, colorR: DISC_COLORS.C, calc: s => (s.C * 1.3 + s.S * 0.2) - (s.I * 1.3 + s.D * 0.2) }
];

export function computeAxes(scores) {
  return AXES.map(a => {
    const raw = a.calc(scores);
    const clamped = Math.max(-100, Math.min(100, raw));
    return { ...a, value: clamped };
  });
}

export function renderAxisSliders(container, scores) {
  const axes = computeAxes(scores);
  container.innerHTML = axes.map(a => {
    const pct = ((a.value + 100) / 200) * 100;
    return `<div class="axis-slider">
      <div class="axis-labels"><span style="color:${a.colorL}">${t(a.leftKey)}</span><span style="color:${a.colorR}">${t(a.rightKey)}</span></div>
      <div class="axis-track"><div class="axis-thumb" style="left:${pct}%"></div></div>
    </div>`;
  }).join('');
}

export function renderMultiAxisSliders(container, profiles) {
  const colors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  const allAxes = profiles.map(p => computeAxes(p.scores));
  container.innerHTML = AXES.map((a, ai) => {
    const thumbs = profiles.map((p, pi) => {
      const pct = ((allAxes[pi][ai].value + 100) / 200) * 100;
      return `<div class="axis-thumb" style="left:${pct}%;background:${colors[pi % colors.length]};border-color:${colors[pi % colors.length]}"></div>`;
    }).join('');
    return `<div class="axis-slider">
      <div class="axis-labels"><span style="color:${a.colorL}">${t(a.leftKey)}</span><span style="color:${a.colorR}">${t(a.rightKey)}</span></div>
      <div class="axis-track">${thumbs}</div>
    </div>`;
  }).join('');
}

// --- Diamond Chart ---

export function drawDiamondChart(canvas, scores, scores2 = null, labels = {}) {
  const { ctx, w, h } = initCanvas(canvas, 380);
  const cx = w / 2, cy = h / 2, r = 140;
  ctx.clearRect(0, 0, w, h);

  // Grid
  for (let i = 1; i <= 4; i++) {
    const gr = (r / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy - gr); ctx.lineTo(cx + gr, cy);
    ctx.lineTo(cx, cy + gr); ctx.lineTo(cx - gr, cy); ctx.closePath();
    ctx.strokeStyle = `rgba(255,255,255,${i === 4 ? 0.3 : 0.1})`;
    ctx.stroke();
  }

  // Labels
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = DISC_COLORS.D; ctx.fillText(t('chart.dominance'), cx, cy - r - 10);
  ctx.fillStyle = DISC_COLORS.I; ctx.fillText(t('chart.influence'), cx + r + 10, cy + 4);
  ctx.fillStyle = DISC_COLORS.S; ctx.fillText(t('chart.steadiness'), cx, cy + r + 16);
  ctx.fillStyle = DISC_COLORS.C; ctx.fillText(t('chart.conscientiousness'), cx - r - 10, cy + 4);

  function plotShape(sc, color, alpha) {
    const pts = [
      [cx, cy - (sc.D / 100) * r],
      [cx + (sc.I / 100) * r, cy],
      [cx, cy + (sc.S / 100) * r],
      [cx - (sc.C / 100) * r, cy]
    ];
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    return pts;
  }

  function plotDot(sc, color, size, label) {
    const pts = [
      [cx, cy - (sc.D / 100) * r],
      [cx + (sc.I / 100) * r, cy],
      [cx, cy + (sc.S / 100) * r],
      [cx - (sc.C / 100) * r, cy]
    ];
    const px = pts.reduce((a, p) => a + p[0], 0) / 4;
    const py = pts.reduce((a, p) => a + p[1], 0) / 4;
    ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    if (label) {
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = color; ctx.textAlign = 'left';
      ctx.fillText(label, px + size + 4, py - 2);
    }
  }

  if (scores2) { plotShape(scores2, '#9966ff', 0.15); plotDot(scores2, '#9966ff', 5, labels.b); }
  plotShape(scores, '#ffffff', 0.2); plotDot(scores, '#ffffff', 6, labels.a);
}

export function drawMultiDiamond(canvas, profiles) {
  const colors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  const { ctx, w, h } = initCanvas(canvas, 380);
  const cx = w / 2, cy = h / 2, r = 140;
  ctx.clearRect(0, 0, w, h);

  for (let i = 1; i <= 4; i++) {
    const gr = (r / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy - gr); ctx.lineTo(cx + gr, cy);
    ctx.lineTo(cx, cy + gr); ctx.lineTo(cx - gr, cy); ctx.closePath();
    ctx.strokeStyle = `rgba(255,255,255,${i === 4 ? 0.3 : 0.1})`;
    ctx.stroke();
  }

  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = DISC_COLORS.D; ctx.fillText(t('chart.dominance'), cx, cy - r - 10);
  ctx.fillStyle = DISC_COLORS.I; ctx.fillText(t('chart.influence'), cx + r + 10, cy + 4);
  ctx.fillStyle = DISC_COLORS.S; ctx.fillText(t('chart.steadiness'), cx, cy + r + 16);
  ctx.fillStyle = DISC_COLORS.C; ctx.fillText(t('chart.conscientiousness'), cx - r - 10, cy + 4);

  profiles.forEach((p, idx) => {
    const color = colors[idx % colors.length];
    const sc = p.scores;
    const pts = [
      [cx, cy - (sc.D / 100) * r], [cx + (sc.I / 100) * r, cy],
      [cx, cy + (sc.S / 100) * r], [cx - (sc.C / 100) * r, cy]
    ];
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.globalAlpha = 0.15; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    const px = pts.reduce((a, pt) => a + pt[0], 0) / 4;
    const py = pts.reduce((a, pt) => a + pt[1], 0) / 4;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    if (p.name) {
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = color; ctx.textAlign = 'left';
      ctx.fillText(p.name, px + 8, py - 4);
    }
  });
}

// --- Axes Plot ---

export function drawAxesPlot(canvas, scores, scores2 = null, labels = {}) {
  const { ctx, w, h } = initCanvas(canvas, 380);
  const cx = w / 2, cy = h / 2, r = 140;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

  ctx.font = '600 11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = DISC_COLORS.D; ctx.fillText(t('chart.dominant'), cx, cy - r - 8);
  ctx.fillStyle = DISC_COLORS.S; ctx.fillText(t('chart.supportive'), cx, cy + r + 16);
  ctx.fillStyle = DISC_COLORS.C; ctx.fillText(t('chart.pragmatic'), cx - r - 8, cy + 4);
  ctx.fillStyle = DISC_COLORS.I; ctx.fillText(t('chart.optimistic'), cx + r + 8, cy + 4);

  function plotPoint(sc, color, size, label) {
    const x = cx + ((sc.I - sc.C) / 100) * r;
    const y = cy - ((sc.D - sc.S) / 100) * r;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    if (label) {
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = color; ctx.textAlign = 'left';
      ctx.fillText(label, x + size + 4, y - 2);
    }
  }

  if (scores2) plotPoint(scores2, '#9966ff', 6, labels.b);
  plotPoint(scores, '#ffffff', 7, labels.a);
}

export function drawMultiAxesPlot(canvas, profiles) {
  const colors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  const { ctx, w, h } = initCanvas(canvas, 380);
  const cx = w / 2, cy = h / 2, r = 140;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

  ctx.font = '600 11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = DISC_COLORS.D; ctx.fillText(t('chart.dominant'), cx, cy - r - 8);
  ctx.fillStyle = DISC_COLORS.S; ctx.fillText(t('chart.supportive'), cx, cy + r + 16);
  ctx.fillStyle = DISC_COLORS.C; ctx.fillText(t('chart.pragmatic'), cx - r - 8, cy + 4);
  ctx.fillStyle = DISC_COLORS.I; ctx.fillText(t('chart.optimistic'), cx + r + 8, cy + 4);

  profiles.forEach((p, idx) => {
    const color = colors[idx % colors.length];
    const sc = p.scores;
    const x = cx + ((sc.I - sc.C) / 100) * r;
    const y = cy - ((sc.D - sc.S) / 100) * r;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    if (p.name) {
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = color; ctx.textAlign = 'left';
      ctx.fillText(p.name, x + 9, y - 4);
    }
  });
}

// --- DISC Wheel ---

export async function drawDiscWheel(canvas, activeType, scores, iconImages = {}) {
  const { ctx, w, h } = initCanvas(canvas, 400);
  const cx = w / 2, cy = h / 2;
  const outerR = 160, innerR = 72;
  const segAngle = (Math.PI * 2) / 16;
  // Tilt 45° CCW: D at top-left
  const startOffset = -Math.PI * 3 / 4;

  // Draw segments
  for (let i = 0; i < 16; i++) {
    const typeId = WHEEL_TYPES[i];
    const data = PERSONALITY_DATA[typeId];
    const a1 = startOffset + i * segAngle;
    const a2 = a1 + segAngle;
    const isActive = typeId === activeType;

    // Segment fill
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, a1, a2);
    ctx.arc(cx, cy, innerR, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = data.color + (isActive ? 'cc' : '44');
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isActive) {
      ctx.save();
      ctx.shadowColor = data.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, a1, a2);
      ctx.arc(cx, cy, innerR, a2, a1, true);
      ctx.closePath();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Type label
    const midAngle = a1 + segAngle / 2;
    const labelR = (outerR + innerR) / 2 + 6;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.font = `${isActive ? '700' : '600'} ${isActive ? '11' : '9'}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typeId, 0, 0);
    ctx.restore();

    // Icon in segment
    const icon = iconImages[typeId];
    if (icon) {
      const iconR = (outerR + innerR) / 2 - 12;
      const ix = cx + Math.cos(midAngle) * iconR;
      const iy = cy + Math.sin(midAngle) * iconR;
      const iconSize = 14;
      ctx.save();
      ctx.globalAlpha = isActive ? 0.9 : 0.35;
      ctx.drawImage(icon, ix - iconSize / 2, iy - iconSize / 2, iconSize, iconSize);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Cardinal labels (D top-left, I top-right, S bottom-right, C bottom-left after 45° tilt)
  const cardinals = [
    { dim: 'D', angle: -Math.PI * 3 / 4 },
    { dim: 'I', angle: -Math.PI / 4 },
    { dim: 'S', angle: Math.PI / 4 },
    { dim: 'C', angle: Math.PI * 3 / 4 }
  ];
  ctx.font = '700 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const c of cardinals) {
    const cr = outerR + 20;
    const px = cx + Math.cos(c.angle) * cr;
    const py = cy + Math.sin(c.angle) * cr;
    ctx.fillStyle = DISC_COLORS[c.dim];
    ctx.fillText(c.dim, px, py);
  }

  // Mini radar in center
  if (scores) {
    const mr = innerR - 10;
    // Angles match cardinals: D at -3π/4, I at -π/4, S at π/4, C at 3π/4
    const radarAngles = { D: -Math.PI * 3 / 4, I: -Math.PI / 4, S: Math.PI / 4, C: Math.PI * 3 / 4 };
    const dims = ['D', 'I', 'S', 'C'];
    const pts = dims.map(d => ({
      x: cx + Math.cos(radarAngles[d]) * (scores[d] / 100) * mr,
      y: cy + Math.sin(radarAngles[d]) * (scores[d] / 100) * mr
    }));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// --- Icon Preloading ---

export async function preloadIcons(iconGenerators, size = 16) {
  const images = {};
  const promises = Object.entries(iconGenerators).map(([id, fn]) =>
    new Promise(resolve => {
      const svg = fn(size, '#ffffff');
      const img = new Image();
      img.onload = () => { images[id] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    })
  );
  await Promise.all(promises);
  return images;
}
