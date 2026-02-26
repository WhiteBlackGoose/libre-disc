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

// --- Overlap offset helpers ---

function applyAxisOverlapOffset(items, threshold) {
  threshold = threshold || 3;
  if (items.length < 2) return;
  const sorted = items.slice().sort((a, b) => a.pct - b.pct);
  const groups = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = groups[groups.length - 1];
    if (Math.abs(sorted[i].pct - last[last.length - 1].pct) < threshold) {
      last.push(sorted[i]);
    } else {
      groups.push([sorted[i]]);
    }
  }
  for (const group of groups) {
    if (group.length <= 1) continue;
    const step = 9;
    const total = (group.length - 1) * step;
    group.forEach((item, i) => { item.yOffset = -total / 2 + i * step; });
  }
}

function applyCanvasDotOverlap(dots, dotR) {
  const threshold = dotR * 1.8;
  const offset = dotR * 0.66;
  const visited = new Set();
  const groups = [];
  for (let i = 0; i < dots.length; i++) {
    if (visited.has(i)) continue;
    const group = [i];
    visited.add(i);
    for (let j = i + 1; j < dots.length; j++) {
      if (visited.has(j)) continue;
      const dx = dots[j].x - dots[i].x, dy = dots[j].y - dots[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) { group.push(j); visited.add(j); }
    }
    if (group.length > 1) groups.push(group);
  }
  for (const group of groups) {
    const n = group.length;
    const gx = group.reduce((s, i) => s + dots[i].x, 0) / n;
    const gy = group.reduce((s, i) => s + dots[i].y, 0) / n;
    group.forEach((idx, gi) => {
      const angle = (2 * Math.PI * gi) / n - Math.PI / 2;
      dots[idx].x = gx + Math.cos(angle) * offset;
      dots[idx].y = gy + Math.sin(angle) * offset;
    });
  }
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
    const items = profiles.map((p, pi) => ({
      pct: ((allAxes[pi][ai].value + 100) / 200) * 100,
      pi, profile: p, yOffset: 0
    }));
    applyAxisOverlapOffset(items);
    const thumbs = items.map(it => {
      const p = it.profile;
      const initials = (p.name || '?').slice(0, 2).toUpperCase();
      const pers = getPersonality(p.type);
      const href = `results.html?r=${encodeResult(p.scores)}${p.name ? '&name=' + encodeURIComponent(p.name) : ''}`;
      const topOff = it.yOffset ? `top:calc(50% + ${it.yOffset}px);` : '';
      return `<a class="axis-thumb axis-thumb-label" href="${href}" style="left:${it.pct}%;${topOff}background:${colors[it.pi % colors.length]};border-color:${colors[it.pi % colors.length]}" data-tip-name="${p.name}" data-tip-type="${p.type}" data-tip-type-name="${pers.name || ''}" data-tip-color="${pers.color}">${initials}</a>`;
    }).join('');
    return `<div class="axis-slider">
      <div class="axis-labels"><span style="color:${a.colorL}">${t(a.leftKey)}</span><span style="color:${a.colorR}">${t(a.rightKey)}</span></div>
      <div class="axis-track">${thumbs}</div>
    </div>`;
  }).join('');
  attachThumbTooltips(container);
}

export function renderMultiScoreAxes(container, profiles) {
  const colors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  const dims = [
    { key: 'D', color: DISC_COLORS.D },
    { key: 'I', color: DISC_COLORS.I },
    { key: 'S', color: DISC_COLORS.S },
    { key: 'C', color: DISC_COLORS.C }
  ];
  container.innerHTML = dims.map(d => {
    const values = profiles.map(p => p.scores[d.key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const items = profiles.map((p, pi) => ({
      pct: 15 + ((p.scores[d.key] - min) / range) * 70,
      pi, profile: p, yOffset: 0
    }));
    applyAxisOverlapOffset(items);
    const thumbs = items.map(it => {
      const p = it.profile;
      const initials = (p.name || '?').slice(0, 2).toUpperCase();
      const pers = getPersonality(p.type);
      const href = `results.html?r=${encodeResult(p.scores)}${p.name ? '&name=' + encodeURIComponent(p.name) : ''}`;
      const topOff = it.yOffset ? `top:calc(50% + ${it.yOffset}px);` : '';
      return `<a class="axis-thumb axis-thumb-label" href="${href}" style="left:${it.pct}%;${topOff}background:${colors[it.pi % colors.length]};border-color:${colors[it.pi % colors.length]}" data-tip-name="${p.name}" data-tip-type="${p.type}" data-tip-type-name="${pers.name || ''}" data-tip-color="${pers.color}">${initials}</a>`;
    }).join('');
    return `<div class="axis-slider">
      <div class="axis-labels"><span style="color:${d.color}">${min}%</span><span style="color:${d.color};font-weight:700">${t('dim.' + d.key)}</span><span style="color:${d.color}">${max}%</span></div>
      <div class="axis-track">${thumbs}</div>
    </div>`;
  }).join('');
  attachThumbTooltips(container);
}

function attachThumbTooltips(container) {
  const tip = getTooltip();
  container.addEventListener('mouseenter', e => {
    const el = e.target.closest('.axis-thumb-label[data-tip-name]');
    if (!el) return;
    tip.innerHTML = `<strong>${el.dataset.tipName}</strong><br><span style="color:${el.dataset.tipColor}">${el.dataset.tipType}</span> — ${el.dataset.tipTypeName}`;
    tip.style.display = 'block';
    const rect = el.getBoundingClientRect();
    tip.style.left = (rect.right + window.scrollX + 8) + 'px';
    tip.style.top = (rect.top + window.scrollY - 4) + 'px';
  }, true);
  container.addEventListener('mouseleave', e => {
    const el = e.target.closest('.axis-thumb-label[data-tip-name]');
    if (el) tip.style.display = 'none';
  }, true);
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

  function diamondPts(sc) {
    // Normalize from midpoint 50 to spread the shape
    const norm = v => 0.5 + (v - 50) / 100;
    return [
      [cx, cy - norm(sc.D) * r],
      [cx + norm(sc.I) * r, cy],
      [cx, cy + norm(sc.S) * r],
      [cx - norm(sc.C) * r, cy]
    ];
  }

  function plotShape(sc, color, alpha) {
    const pts = diamondPts(sc);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    return pts;
  }

  function plotDot(sc, color, size, label) {
    const pts = diamondPts(sc);
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
    const norm = v => 0.5 + (v - 50) / 100;
    const pts = [
      [cx, cy - norm(sc.D) * r], [cx + norm(sc.I) * r, cy],
      [cx, cy + norm(sc.S) * r], [cx - norm(sc.C) * r, cy]
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
    // Normalize from midpoint 50, apply power curve to spread clustered values
    const rawX = (sc.I - 50) / 50 - (sc.C - 50) / 50;
    const rawY = (sc.D - 50) / 50 - (sc.S - 50) / 50;
    const pow = 0.5;
    const sx = Math.sign(rawX) * Math.pow(Math.abs(rawX), pow);
    const sy = Math.sign(rawY) * Math.pow(Math.abs(rawY), pow);
    const x = cx + Math.max(-1, Math.min(1, sx)) * r;
    const y = cy - Math.max(-1, Math.min(1, sy)) * r;
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

export function drawMultiAxesPlot(canvas, profiles, size) {
  const colors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  size = size || 380;
  const { ctx, w, h } = initCanvas(canvas, size);
  const cx = w / 2, cy = h / 2, r = size * 0.37;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

  const fs = Math.max(9, size * 0.029);
  ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = DISC_COLORS.D; ctx.fillText(t('chart.dominant'), cx, cy - r - 8);
  ctx.fillStyle = DISC_COLORS.S; ctx.fillText(t('chart.supportive'), cx, cy + r + 16);
  ctx.fillStyle = DISC_COLORS.C; ctx.fillText(t('chart.pragmatic'), cx - r - 8, cy + 4);
  ctx.fillStyle = DISC_COLORS.I; ctx.fillText(t('chart.optimistic'), cx + r + 8, cy + 4);

  const dotR = Math.max(9, size * 0.028);
  const dots = profiles.map((p, idx) => {
    const color = colors[idx % colors.length];
    const sc = p.scores;
    const rawX = (sc.I - 50) / 50 - (sc.C - 50) / 50;
    const rawY = (sc.D - 50) / 50 - (sc.S - 50) / 50;
    const pow = 0.5;
    const sx = Math.sign(rawX) * Math.pow(Math.abs(rawX), pow);
    const sy = Math.sign(rawY) * Math.pow(Math.abs(rawY), pow);
    return {
      x: cx + Math.max(-1, Math.min(1, sx)) * r,
      y: cy - Math.max(-1, Math.min(1, sy)) * r,
      r: dotR, color, profile: p
    };
  });
  applyCanvasDotOverlap(dots, dotR);

  dots.forEach(d => {
    ctx.beginPath(); ctx.arc(d.x, d.y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = d.color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    const initials = (d.profile.name || '?').slice(0, 2).toUpperCase();
    ctx.font = `700 ${Math.max(7, dotR * 0.82)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(initials, d.x, d.y);
  });

  return { dots, size };
}

// --- DISC Wheel ---

// Shared inner-circle center: 4 pie quadrants for D, I, S, C
function drawWheelCenter(ctx, cx, cy, innerR) {
  const quarter = Math.PI / 2;
  // Center each quadrant on its pure type: offset by half a segment (π/16) clockwise
  const pieOffset = -Math.PI * 3 / 4 - quarter / 2 + Math.PI / 16;
  const dims = ['D', 'I', 'S', 'C'];
  const r = innerR - 2;

  for (let i = 0; i < 4; i++) {
    const a1 = pieOffset + i * quarter;
    const a2 = a1 + quarter;
    // Filled wedge
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a1, a2);
    ctx.closePath();
    ctx.fillStyle = DISC_COLORS[dims[i]] + '30';
    ctx.fill();
    // Divider line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Letters centered in each quadrant
  const letterR = r * 0.5;
  ctx.font = '700 18px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 4; i++) {
    const mid = pieOffset + (i + 0.5) * quarter;
    ctx.fillStyle = DISC_COLORS[dims[i]];
    ctx.fillText(dims[i], cx + Math.cos(mid) * letterR, cy + Math.sin(mid) * letterR);
  }
}

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

  // Inner circle: dimension arcs + letters
  drawWheelCenter(ctx, cx, cy, innerR);
}

export async function drawMultiDiscWheel(canvas, profiles, iconImages = {}) {
  const profileColors = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
  const { ctx, w, h } = initCanvas(canvas, 480);
  const cx = w / 2, cy = h / 2;
  const outerR = 160, innerR = 72;
  const segAngle = (Math.PI * 2) / 16;
  const startOffset = -Math.PI * 3 / 4;

  // Collect active types
  const activeTypes = new Set(profiles.map(p => p.type));

  // Draw segments
  for (let i = 0; i < 16; i++) {
    const typeId = WHEEL_TYPES[i];
    const data = PERSONALITY_DATA[typeId];
    const a1 = startOffset + i * segAngle;
    const a2 = a1 + segAngle;
    const isActive = activeTypes.has(typeId);

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, a1, a2);
    ctx.arc(cx, cy, innerR, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = data.color + (isActive ? '88' : '33');
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isActive) {
      ctx.save();
      ctx.shadowColor = data.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, a1, a2);
      ctx.arc(cx, cy, innerR, a2, a1, true);
      ctx.closePath();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

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

    const icon = iconImages[typeId];
    if (icon) {
      const iconR = (outerR + innerR) / 2 - 12;
      const ix = cx + Math.cos(midAngle) * iconR;
      const iy = cy + Math.sin(midAngle) * iconR;
      ctx.save();
      ctx.globalAlpha = isActive ? 0.9 : 0.3;
      ctx.drawImage(icon, ix - 7, iy - 7, 14, 14);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Inner circle: dimension arcs + letters
  drawWheelCenter(ctx, cx, cy, innerR);

  // Build map of type -> profiles
  const typeProfiles = {};
  profiles.forEach((p, idx) => {
    if (!typeProfiles[p.type]) typeProfiles[p.type] = [];
    typeProfiles[p.type].push({ ...p, dotColor: profileColors[idx % profileColors.length] });
  });

  // Draw dots with initials outside active segments
  const dotR = 11;
  const allDots = [];
  for (let i = 0; i < 16; i++) {
    const typeId = WHEEL_TYPES[i];
    const entries = typeProfiles[typeId];
    if (!entries) continue;
    const a1 = startOffset + i * segAngle;
    const midAngle = a1 + segAngle / 2;
    entries.forEach((entry, ni) => {
      const spread = entries.length > 1 ? segAngle * 0.6 : 0;
      const angleOffset = entries.length > 1
        ? -spread / 2 + (spread / (entries.length - 1)) * ni
        : 0;
      const angle = midAngle + angleOffset;
      const dist = outerR + dotR + 4;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      ctx.beginPath(); ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fillStyle = entry.dotColor; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
      const initials = (entry.name || '?').slice(0, 2).toUpperCase();
      ctx.font = '700 9px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(initials, x, y);

      allDots.push({ x, y, r: dotR, color: entry.dotColor, profile: entry });
    });
  }

  return { dots: allDots, size: 480 };
}

// --- Interactive canvas dots ---

let _tooltipEl = null;
function getTooltip() {
  if (!_tooltipEl) {
    _tooltipEl = document.createElement('div');
    _tooltipEl.className = 'canvas-dot-tip';
    document.body.appendChild(_tooltipEl);
  }
  return _tooltipEl;
}

export function addCanvasDotInteractivity(canvas, dotData) {
  const { dots, size } = dotData;
  const tip = getTooltip();
  function mousePos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * size, y: (e.clientY - r.top) / r.height * size };
  }
  function findHit(mx, my) {
    for (const d of dots) {
      const dx = mx - d.x, dy = my - d.y;
      if (dx * dx + dy * dy <= (d.r + 2) * (d.r + 2)) return d;
    }
    return null;
  }
  canvas.addEventListener('mousemove', e => {
    const { x, y } = mousePos(e);
    const hit = findHit(x, y);
    if (hit) {
      canvas.style.cursor = 'pointer';
      const pers = getPersonality(hit.profile.type);
      tip.innerHTML = `<strong>${hit.profile.name}</strong><br><span style="color:${pers.color}">${hit.profile.type}</span> — ${pers.name || ''}`;
      tip.style.display = 'block';
      tip.style.left = (e.pageX + 14) + 'px';
      tip.style.top = (e.pageY - 12) + 'px';
    } else {
      canvas.style.cursor = '';
      tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; canvas.style.cursor = ''; });
  canvas.addEventListener('click', e => {
    const { x, y } = mousePos(e);
    const hit = findHit(x, y);
    if (hit) {
      let url = `results.html?r=${encodeResult(hit.profile.scores)}`;
      if (hit.profile.name) url += '&name=' + encodeURIComponent(hit.profile.name);
      window.open(url, '_blank');
    }
  });
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
