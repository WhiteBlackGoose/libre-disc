import { PERSONALITIES } from './personalities.js';

const ADJACENT = {
  D: ['I', 'C'],
  I: ['D', 'S'],
  S: ['I', 'C'],
  C: ['S', 'D']
};

const BLEND_ORDER = { 'D_I': 'DI', 'I_S': 'IS', 'S_C': 'SC', 'C_D': 'CD' };

function canonicalBlend(a, b) {
  return BLEND_ORDER[`${a}_${b}`] || BLEND_ORDER[`${b}_${a}`] || (a + b);
}

export function calculateScores(answers) {
  const raw = { D: 0, I: 0, S: 0, C: 0 };
  const count = { D: 0, I: 0, S: 0, C: 0 };

  for (const [qId, value] of Object.entries(answers)) {
    const dim = value.dimension;
    raw[dim] += value.score;
    count[dim]++;
  }

  const scores = {};
  for (const dim of ['D', 'I', 'S', 'C']) {
    const c = count[dim] || 7;
    scores[dim] = Math.round(((raw[dim] - c) / (c * 4)) * 100);
  }
  return scores;
}

export function determineType(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;
  const diff = first[1] - second[1];
  const isAdj = ADJACENT[first[0]].includes(second[0]);

  if (!isAdj || diff > 25) {
    return first[0];
  } else if (diff <= 8) {
    return canonicalBlend(first[0], second[0]);
  } else {
    return first[0] + second[0].toLowerCase();
  }
}

export function encodeResult(scores) {
  const str = `${scores.D},${scores.I},${scores.S},${scores.C}`;
  return btoa(str).replace(/=+$/, '');
}

export function decodeResult(encoded) {
  try {
    const pad = encoded + '==='.slice(0, (4 - encoded.length % 4) % 4);
    const str = atob(pad);
    const parts = str.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return null;
    return { D: parts[0], I: parts[1], S: parts[2], C: parts[3] };
  } catch {
    return null;
  }
}

export function saveResult(scores, type) {
  const data = { scores, type, date: new Date().toISOString() };
  localStorage.setItem('disc_result', JSON.stringify(data));
}

export function loadResult() {
  try {
    const raw = localStorage.getItem('disc_result');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getShareUrl(scores) {
  const code = encodeResult(scores);
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  return `${base}results.html?r=${code}`;
}

function logicalSize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  return { w: canvas.width / dpr, h: canvas.height / dpr };
}

export function drawDiamondChart(canvas, scores, scores2 = null) {
  const ctx = canvas.getContext('2d');
  const { w, h } = logicalSize(canvas);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.32;

  ctx.clearRect(0, 0, w, h);

  const axes = [
    { dim: 'D', label: 'Dominance',   x: cx, y: cy - r, lx: cx,      ly: cy - r - 14 },
    { dim: 'I', label: 'Influence',    x: cx + r, y: cy, lx: cx + r + 8, ly: cy },
    { dim: 'S', label: 'Steadiness',   x: cx, y: cy + r, lx: cx,      ly: cy + r + 16 },
    { dim: 'C', label: 'Conscient.',   x: cx - r, y: cy, lx: cx - r - 8, ly: cy }
  ];

  // Grid lines
  for (let level = 0.25; level <= 1; level += 0.25) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ax = cx + (axes[i].x - cx) * level;
      const ay = cy + (axes[i].y - cy) * level;
      if (i === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
    }
    ctx.closePath();
    ctx.stroke();
  }

  for (const a of axes) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.moveTo(cx, cy);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }

  function drawPolygon(sc, colors, alpha, lw) {
    const pts = axes.map(a => ({
      x: cx + (a.x - cx) * (sc[a.dim] / 100),
      y: cy + (a.y - cy) * (sc[a.dim] / 100)
    }));
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = colors.fill;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.stroke;
      ctx.fill();
    });
  }

  const COLORS = { D: '#E63946', I: '#F4A261', S: '#2A9D8F', C: '#457B9D' };

  if (scores2) drawPolygon(scores2, { fill: 'rgba(153,102,255,0.15)', stroke: '#9966ff' }, 0.3, 2);
  drawPolygon(scores, { fill: 'rgba(255,255,255,0.08)', stroke: '#ffffff' }, 0.15, 2.5);

  ctx.font = '600 11px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  axes.forEach(a => {
    ctx.fillStyle = COLORS[a.dim];
    ctx.textAlign = a.dim === 'C' ? 'right' : a.dim === 'I' ? 'left' : 'center';
    ctx.fillText(a.label, a.lx, a.ly);
  });
}

export function drawAxesPlot(canvas, scores, scores2 = null) {
  const ctx = canvas.getContext('2d');
  const { w, h } = logicalSize(canvas);
  const cx = w / 2;
  const cy = h / 2;
  const pad = 40;

  ctx.clearRect(0, 0, w, h);

  const qSize = (w - pad * 2) / 2;
  const quadrants = [
    { x: pad, y: pad, color: 'rgba(230,57,70,0.06)' },
    { x: cx, y: pad, color: 'rgba(244,162,97,0.06)' },
    { x: pad, y: cy, color: 'rgba(69,123,157,0.06)' },
    { x: cx, y: cy, color: 'rgba(42,157,143,0.06)' }
  ];
  quadrants.forEach(q => { ctx.fillStyle = q.color; ctx.fillRect(q.x, q.y, qSize, qSize); });

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, cy); ctx.lineTo(w - pad, cy);
  ctx.moveTo(cx, pad); ctx.lineTo(cx, h - pad);
  ctx.stroke();

  ctx.font = '500 10px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('Pragmatic', pad + qSize / 2, h - pad + 14);
  ctx.fillText('Optimistic', cx + qSize / 2, h - pad + 14);
  ctx.save();
  ctx.translate(pad - 18, cy - qSize / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Dominant', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(pad - 18, cy + qSize / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Supportive', 0, 0);
  ctx.restore();

  // Quadrant letters
  ctx.font = '800 18px Inter, system-ui, sans-serif';
  ctx.globalAlpha = 0.08;
  const COLORS = { D: '#E63946', I: '#F4A261', S: '#2A9D8F', C: '#457B9D' };
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.D; ctx.fillText('D', pad + qSize / 2, pad + qSize / 2);
  ctx.fillStyle = COLORS.I; ctx.fillText('I', cx + qSize / 2, pad + qSize / 2);
  ctx.fillStyle = COLORS.C; ctx.fillText('C', pad + qSize / 2, cy + qSize / 2);
  ctx.fillStyle = COLORS.S; ctx.fillText('S', cx + qSize / 2, cy + qSize / 2);
  ctx.globalAlpha = 1;

  function plotPoint(sc, color, size) {
    const xVal = ((sc.I + sc.S) - (sc.D + sc.C)) / 200;
    const yVal = ((sc.D + sc.I) - (sc.S + sc.C)) / 200;
    const px = cx + xVal * (w / 2 - pad);
    const py = cy - yVal * (h / 2 - pad);
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(px, py, size + 2, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (scores2) plotPoint(scores2, '#9966ff', 6);
  plotPoint(scores, '#ffffff', 7);
}

// DISC wheel with all 16 types arranged in a circle
const WHEEL_TYPES = [
  'D', 'Di', 'DI', 'Id', 'I', 'Is', 'IS', 'Si',
  'S', 'Sc', 'SC', 'Cs', 'C', 'Cd', 'CD', 'Dc'
];

export function drawDiscWheel(canvas, activeType, scores) {
  const ctx = canvas.getContext('2d');
  const { w, h } = logicalSize(canvas);
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) * 0.42;
  const innerR = outerR * 0.45;
  const midR = (outerR + innerR) / 2;
  const n = WHEEL_TYPES.length;
  const slice = (Math.PI * 2) / n;
  const startOffset = -Math.PI / 2; // D at top

  ctx.clearRect(0, 0, w, h);

  const COLORS = { D: '#E63946', I: '#F4A261', S: '#2A9D8F', C: '#457B9D' };

  function typeColor(id) {
    const p = PERSONALITIES[id];
    return p ? p.color : '#888';
  }

  // Draw segments
  WHEEL_TYPES.forEach((typeId, i) => {
    const a0 = startOffset + i * slice;
    const a1 = a0 + slice;
    const isActive = typeId === activeType;

    // Segment
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, a0, a1);
    ctx.arc(cx, cy, innerR, a1, a0, true);
    ctx.closePath();

    const color = typeColor(typeId);
    ctx.fillStyle = isActive ? color : color + '30';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,15,26,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow for active
    if (isActive) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR + 3, a0, a1);
      ctx.arc(cx, cy, innerR - 3, a1, a0, true);
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }

    // Label
    const aMid = a0 + slice / 2;
    const lx = cx + Math.cos(aMid) * midR;
    const ly = cy + Math.sin(aMid) * midR;
    ctx.save();
    ctx.translate(lx, ly);
    // Rotate text to follow the circle, but keep it readable
    let textAngle = aMid + Math.PI / 2;
    if (aMid > Math.PI / 2 && aMid < Math.PI * 1.5) {
      textAngle += Math.PI;
    }
    // Actually, for short labels, no rotation looks cleaner
    ctx.font = `${isActive ? '700' : '500'} ${isActive ? 11 : 9}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.6)';
    ctx.fillText(typeId, 0, 0);
    ctx.restore();
  });

  // Cardinal labels outside the wheel
  const lblR = outerR + 18;
  ctx.font = '700 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cardinals = [
    { dim: 'D', angle: -Math.PI / 2 },
    { dim: 'I', angle: 0 },
    { dim: 'S', angle: Math.PI / 2 },
    { dim: 'C', angle: Math.PI }
  ];
  cardinals.forEach(({ dim, angle }) => {
    ctx.fillStyle = COLORS[dim];
    ctx.fillText(dim, cx + Math.cos(angle) * lblR, cy + Math.sin(angle) * lblR);
  });

  // Center: show score radar mini
  const miniR = innerR * 0.7;
  const dimAngles = [
    { dim: 'D', angle: -Math.PI / 2 },
    { dim: 'I', angle: 0 },
    { dim: 'S', angle: Math.PI / 2 },
    { dim: 'C', angle: Math.PI }
  ];

  // Mini grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, miniR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, miniR * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Mini radar fill
  const pts = dimAngles.map(({ dim, angle }) => ({
    x: cx + Math.cos(angle) * miniR * (scores[dim] / 100),
    y: cy + Math.sin(angle) * miniR * (scores[dim] / 100)
  }));
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  });
}
