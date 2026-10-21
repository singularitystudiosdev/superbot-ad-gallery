// The news under the live view in the side panel: only the high-value updates (the lowest performer found, new takes
// ready, a new take live, the next check), one line each, newest on top. A new line slides in at the top as it pushes
// the rest down. A hit (a new take going live) arrives with a confetti pop: two small bursts fire inward from the new
// line's ends, arc a little and fall through the news area, turning and fading. The confetti layer is clipped to the news area, so nothing is drawn over
// the live view. Pure functions of t: every piece's path is seeded, so ?t= frames hold.
import { seg, outCubic, el, esc, REDUCED } from './lib.d35be136.js';
import { NEWS } from './timeline.d35be136.js';

const ENTER = 0.4;
const PIECES = 18; // per side, per hit
const LIFE = 1.7; // s a piece lives
const GRAVITY = 620; // app px / s^2
const COLORS = ['#34d399', '#f472b6', '#a855f7', '#60a5fa', '#fbbf24', '#f2f2f7'];

// a small deterministic generator (Park-Miller), so a hit's confetti is the same every time it plays
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function confetti(layer, k) {
  const r = rng(9973 * (k + 1));
  const pieces = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < PIECES; i++) {
      const round = r() < 0.25;
      const w = round ? 5 : 4 + r() * 2, h = round ? 5 : 7 + r() * 3;
      const node = el(`<i class="nw-cf" style="width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;background:${COLORS[Math.floor(r() * COLORS.length)]};${round ? 'border-radius:50%;' : ''}"></i>`);
      layer.appendChild(node);
      const up = (8 + r() * 26) * Math.PI / 180; // launch angle above the horizontal, aimed inward
      const speed = 170 + r() * 230;
      pieces.push({
        node, side, w, h, delay: r() * 0.08,
        vx: -side * speed * Math.cos(up), vy: -speed * Math.sin(up) * 0.7,
        spin: (r() < 0.5 ? -1 : 1) * (360 + r() * 540), rot: r() * 360, flip: 6 + r() * 8, phase: r() * Math.PI * 2,
      });
    }
  }
  return pieces;
}

export function buildSide(news) {
  const list = news.querySelector('.nw-list');
  const layer = news.querySelector('.nw-fx');
  const rows = NEWS.map((n, k) => {
    const node = el(`<div class="nw-row">${esc(n.title)}</div>`);
    list.appendChild(node);
    return { n, node, h: 0, pieces: n.burst && !REDUCED ? confetti(layer, k) : [] };
  });
  return { news, list, rows, w: 0, y0: 0 };
}

export function measureSide(s) {
  for (const r of s.rows) r.h = r.node.offsetHeight;
  s.w = s.news.clientWidth;
  // a new line lands at the top of the list: its bursts start from its ends, at its middle
  s.y0 = s.list.offsetTop + (s.rows[0] ? s.rows[0].h / 2 : 0);
}

function paintConfetti(s, row, t) {
  for (const p of row.pieces) {
    const tau = t - row.n.at - p.delay;
    if (tau <= 0 || tau >= LIFE) { p.node.style.visibility = 'hidden'; continue; }
    const x0 = p.side < 0 ? 14 : s.w - 14;
    const x = x0 + p.vx * tau + Math.sin(tau * 9 + p.phase) * 3;
    const y = s.y0 + p.vy * tau + 0.5 * GRAVITY * tau * tau;
    const flip = Math.cos(tau * p.flip + p.phase);
    p.node.style.visibility = 'visible';
    p.node.style.opacity = (1 - seg(tau, LIFE * 0.6, LIFE)).toFixed(3);
    p.node.style.transform = `translate(${(x - p.w / 2).toFixed(2)}px, ${(y - p.h / 2).toFixed(2)}px) rotate(${(p.rot + p.spin * tau).toFixed(1)}deg) scaleY(${flip.toFixed(3)})`;
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
    if (r.pieces.length) paintConfetti(s, r, t);
  }
}
