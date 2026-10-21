// Tween helpers. Every frame is a pure function of t (seconds), so ?t= freezes any frame and a screenshot holds.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const outCubic = (k) => 1 - (1 - k) ** 3;
export const inOutCubic = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
// a soft overshoot for pops (chips, bubbles, badges): peaks about 5% past 1, never a bounce
export const outBack = (k, s = 1.25) => (k >= 1 ? 1 : 1 + (s + 1) * (k - 1) ** 3 + s * (k - 1) ** 2);
export const ease = (t, a, d, f = outCubic) => f(seg(t, a, a + d));

// prefers-reduced-motion: tweens keep their fades but drop their travel, and nothing spins
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const mv = (px) => (RM ? 0 : px);

// a value keyed in time: keys [[t, v], ...] ascending, eased between neighbours, held outside them
export function keyed(t, keys, f = inOutCubic) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, f(seg(t, t0, t1)));
    }
  }
  return keys[keys.length - 1][1];
}

// a point gliding through waypoints [{ t, x, y }], eased per leg
export function path(t, pts) {
  return { x: keyed(t, pts.map((p) => [p.t, p.x])), y: keyed(t, pts.map((p) => [p.t, p.y])) };
}

// the latest entry of a timed list [{ at }] that has started by t, and its index
export function latest(list, t) {
  let i = -1;
  for (let k = 0; k < list.length; k++) if (list[k].at <= t) i = k;
  return i;
}

// a press: 0 to 1 and back around `at`
export const press = (t, at, d = 0.2) => Math.sin(Math.PI * seg(t, at - d / 2, at + d / 2));
export const blink = (t) => Math.floor(t * 1.9) % 2 === 1;

// characters of `text` typed or streamed by t at `cps`, counted in code points so an emoji is never split mid-pair
export function typed(text, start, cps, t) {
  const cs = Array.from(text);
  return cs.slice(0, clamp(Math.floor((t - start) * cps), 0, cs.length)).join('');
}

export const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}
// opacity and a vertical slide in one write
export function show(node, k, dy = 8, scale = 1) {
  node.style.opacity = k.toFixed(3);
  const y = mv((1 - k) * dy);
  const s = RM ? 1 : lerp(scale, 1, k);
  node.style.transform = y === 0 && s === 1 ? '' : `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
}
