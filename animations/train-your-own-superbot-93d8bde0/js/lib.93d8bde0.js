// lib: the shared, pure helpers every part of the film uses. No state, no clock: everything is a function of t.
// The easings, seg/path/press/blink/typed and boxIn are the reference spot's own
// (superbot-ad-gallery animations/gemini-muse-meme-superbot-6fbc38f8/lib.9b47fc30.js); the rest is this film's.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, f) => a + (b - a) * f;
/** progress of t through [a, b], clamped to 0..1 */
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const outCubic = (x) => 1 - Math.pow(1 - x, 3);
export const outQuint = (x) => 1 - Math.pow(1 - x, 5);
export const inCubic = (x) => x * x * x;
export const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const inOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
export const outBack = (x, c1 = 1.70158) => { const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/** minimum-jerk position profile: how a hand actually moves a mouse between two points */
export const minJerk = (u) => u * u * u * (10 - 15 * u + 6 * u * u);
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** fade in over [a, a+din] and out over [b-dout, b]: 0..1 */
export const window01 = (t, a, b, din = 0.3, dout = 0.3) => seg(t, a, a + din) * (1 - seg(t, b - dout, b));

/** deterministic caret blink from t: visible for the first half of each 1.06s period */
export const blink = (t, period = 1.06) => ((t % period + period) % period) < period / 2;

/** a cursor press: 0 before, dips to 1 around `at` over ~0.2s (0.06s down, hold, 0.14s up), 0 after */
export const press = (t, at, down = 0.06, hold = 0.06, up = 0.14) =>
  seg(t, at - down, at) * (1 - seg(t, at + hold, at + hold + up));

/** the element's box in the coordinates of `root` (layout px, ignores transforms on root itself) */
export function boxIn(el, root) {
  const a = el.getBoundingClientRect(), b = root.getBoundingClientRect();
  const sx = b.width / (root.offsetWidth || b.width) || 1, sy = b.height / (root.offsetHeight || b.height) || 1;
  return { x: (a.left - b.left) / sx, y: (a.top - b.top) / sy, w: a.width / sx, h: a.height / sy,
    cx: (a.left - b.left + a.width / 2) / sx, cy: (a.top - b.top + a.height / 2) / sy };
}

/** deterministic pseudo-random in [0,1) from an integer seed (jitter that must not change per frame) */
export const rand = (seed) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** typed text at t: the characters of `text` landing on `times` (one time per char). -> { text, n, done } */
export function typedAt(text, times, t) {
  let n = 0;
  while (n < times.length && times[n] <= t) n++;
  return { text: text.slice(0, n), n, done: n >= text.length };
}
/** a human typing rhythm from t0: per-char gaps that vary (a little slower after spaces and capitals), seeded */
export function typeTimes(text, t0, cps = 11, seed = 1) {
  const out = [];
  let at = t0;
  for (let i = 0; i < text.length; i++) {
    out.push(at);
    const c = text[i], next = text[i + 1] || '';
    let gap = (1 / cps) * (0.7 + 0.6 * rand(seed * 97 + i));
    if (c === ' ') gap *= 1.35;
    if (next && next !== next.toLowerCase()) gap *= 1.25;
    at += gap;
  }
  return out;
}

/** count up from a to b over [t0, t1] with an easing, rounded */
export const countUp = (t, t0, t1, a, b, ease = outCubic) => Math.round(lerp(a, b, ease(seg(t, t0, t1))));
export const fmtInt = (n) => n.toLocaleString('en-US');

/** set style only when it changed (cheap per-frame writes) */
export function css(el, prop, value) {
  if (el.__css === undefined) el.__css = {};
  if (el.__css[prop] === value) return;
  el.__css[prop] = value;
  if (prop.startsWith('--')) el.style.setProperty(prop, value); else el.style[prop] = value;
}
export const op = (el, v) => css(el, 'opacity', clamp(v).toFixed(3));
export const vis = (el, on) => css(el, 'visibility', on ? 'visible' : 'hidden');
export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
