// Shared helpers for the concert tickets news spot: easing and timing, markup, and the lucide glyphs (lucide.dev, ISC,
// path data from api.iconify.design/lucide.json).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const outCubic = (k) => 1 - (1 - k) ** 3;
export const inOutCubic = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}
// characters of `text` shown at t when it types or streams from `start` at `cps`
export const countAt = (text, start, cps, t) => clamp(Math.floor((t - start) * cps), 0, text.length);
// a text caret's blink: 0.53 s on, 0.53 s off
export const caretOn = (t) => Math.floor(t / 0.53) % 2 === 0;

const G = {
  gauge: '<path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/>',
  pointer: '<path d="M14 4.1L12 6M5.1 8l-2.9-.8M6 12l-1.9 2M7.2 2.2L8 5.1m1.037 4.59a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>',
};
export const glyph = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[name]}</svg>`;
