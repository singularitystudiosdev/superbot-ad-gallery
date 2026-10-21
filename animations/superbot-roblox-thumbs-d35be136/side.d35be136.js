// The news under the live view in the side panel: what superbot is doing, in plain text, one line each, newest on top
// (picked a thumbnail, researching, uploading, replacing the lowest performer, a new thumbnail live). A new line slides
// in at the top as it pushes the rest down. A breakthrough line ends in a 🎉 that pops in with a small tween (it grows
// past its size and settles, tipping one way and back) while a few tiny sparks fly off it and fade; nothing else moves.
// Pure functions of t: every spark's path is seeded, so ?t= frames hold. Reduced motion shows the emoji still.
import { seg, outCubic, el, esc, REDUCED } from './lib.d35be136.js';
import { NEWS } from './timeline.d35be136.js';

const ENTER = 0.4;
const POP = 0.55; // the emoji's pop, after its line lands
const SPARKS = 7;
const SPARK_LIFE = 0.7;
const COLORS = ['#34d399', '#f472b6', '#a855f7', '#60a5fa', '#fbbf24'];

// a small deterministic generator (Park-Miller), so each line's sparks are the same every time it plays
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
// overshoot ease for the pop: 0 to 1, peaking past 1
const outBack = (k, s = 2.2) => 1 + (s + 1) * (k - 1) ** 3 + s * (k - 1) ** 2;

export function buildSide(news) {
  const list = news.querySelector('.nw-list');
  const rows = NEWS.map((n, k) => {
    const emoji = n.breakthrough ? `<span class="nw-emo"><span class="nw-emo-g">🎉</span>${Array.from({ length: SPARKS }, () => '<i class="nw-spark"></i>').join('')}</span>` : '';
    const node = el(`<div class="nw-row"><span class="nw-tx">${esc(n.title)}</span>${emoji}</div>`);
    list.appendChild(node);
    const r = rng(7919 * (k + 1));
    const sparks = [...node.querySelectorAll('.nw-spark')].map((s, i) => {
      const a = (-150 + (i / (SPARKS - 1)) * 120 + (r() - 0.5) * 18) * Math.PI / 180; // a fan above the emoji
      const d = 9 + r() * 7;
      s.style.background = COLORS[i % COLORS.length];
      return { el: s, dx: Math.cos(a) * d, dy: Math.sin(a) * d, delay: r() * 0.08 };
    });
    return { n, node, h: 0, glyph: node.querySelector('.nw-emo-g'), sparks };
  });
  return { rows };
}

export function measureSide(s) {
  for (const r of s.rows) r.h = r.node.offsetHeight;
}

function paintEmoji(r, t) {
  const at = r.n.at + ENTER * 0.6;
  if (REDUCED) { r.glyph.style.transform = 'none'; r.glyph.style.opacity = t >= at ? '1' : '0'; return; }
  const k = seg(t, at, at + POP);
  const s = k <= 0 ? 0 : outBack(k);
  const tip = Math.sin(k * Math.PI * 2) * 12 * (1 - k); // tips one way, then back, settling
  r.glyph.style.opacity = k > 0 ? '1' : '0';
  r.glyph.style.transform = `scale(${s.toFixed(3)}) rotate(${tip.toFixed(1)}deg)`;
  for (const sp of r.sparks) {
    const q = seg(t, at + 0.12 + sp.delay, at + 0.12 + sp.delay + SPARK_LIFE);
    const go = outCubic(q);
    sp.el.style.opacity = q <= 0 || q >= 1 ? '0' : (1 - q).toFixed(3);
    sp.el.style.transform = `translate(${(sp.dx * go).toFixed(2)}px, ${(sp.dy * go).toFixed(2)}px) scale(${(1 - 0.5 * q).toFixed(3)})`;
  }
}

export function paintSide(s, t) {
  // newest on top; an arrival slides down into the top slot as the rest move down by its height
  let drop = 0;
  for (let k = s.rows.length - 1; k >= 0; k--) {
    const r = s.rows[k];
    const p = outCubic(seg(t, r.n.at, r.n.at + ENTER));
    r.node.style.opacity = p.toFixed(3);
    r.node.style.visibility = p > 0 ? 'visible' : 'hidden';
    r.node.style.transform = `translateY(${(drop - (REDUCED ? 0 : (1 - p) * r.h)).toFixed(2)}px)`;
    drop += r.h * p;
    if (r.sparks.length || r.n.breakthrough) paintEmoji(r, t);
  }
}
