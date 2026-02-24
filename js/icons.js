// SVG icons for each personality type (inline, colored via currentColor)
// Each returns an SVG string sized at the given px

function svg(paths, viewBox = '0 0 24 24') {
  return (size, color) => `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">${paths.replace(/currentColor/g, color)}</svg>`;
}

export const TYPE_ICONS = {
  D: svg(`<path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  Di: svg(`<path d="M12 2l2.09 6.26L21 9.27l-5.18 4.73L17.82 21 12 17.27 6.18 21l1.64-6.73L2.64 9.54l6.91-1.01L12 2z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  Dc: svg(`<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  DI: svg(`<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.12"/><path d="M5 12l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" stroke-width="1.5"/>`),
  I: svg(`<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`),
  Id: svg(`<path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  Is: svg(`<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  IS: svg(`<circle cx="9" cy="8" r="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="8" r="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><path d="M4 20c0-3 3-5 5-5h6c2 0 5 2 5 5" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`),
  S: svg(`<path d="M12 22c5 0 8-3.58 8-8V5l-8-3-8 3v9c0 4.42 3 8 8 8z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  Si: svg(`<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`),
  Sc: svg(`<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6.9 20.1a2.12 2.12 0 01-3-3l6.63-6.63a6 6 0 017.94-7.94L14.7 6.3z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`),
  SC: svg(`<circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`),
  C: svg(`<path d="M3 3h18v18H3z" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 8h8M8 12h5M8 16h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`),
  Cs: svg(`<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`),
  Cd: svg(`<path d="M2 16l6-6 4 4 8-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 6h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  CD: svg(`<path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`)
};

export function getTypeIcon(typeId, size = 64, color = '#fff') {
  const fn = TYPE_ICONS[typeId] || TYPE_ICONS['D'];
  return fn(size, color);
}
