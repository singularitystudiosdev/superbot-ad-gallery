// The news under the live view in the side panel: only the high-value finds (a new lowest price, a site flagging
// demand), newest on top. A new item slides in at the top as it pushes the rest down; each row ages ("now", "12s").
import { seg, outCubic, el, esc, glyph, REDUCED } from './lib.d35be136.js';
import { NEWS } from './timeline.d35be136.js';

const ENTER = 0.4;
const age = (s) => (s < 2 ? 'now' : `${Math.floor(s)}s`);

export function buildSide(news) {
  const list = news.querySelector('.nw-list');
  const rows = NEWS.map((n) => {
    const node = el(`<div class="nw-row"><span class="nw-ic${n.tone === 'hot' ? ' is-hot' : ''}">${glyph(n.icon)}</span><span class="nw-tx"><b>${esc(n.title)}</b><small>${esc(n.sub)}</small></span><span class="nw-time"></span></div>`);
    list.appendChild(node);
    return { n, node, time: node.querySelector('.nw-time'), h: 0, shown: '' };
  });
  return { rows, empty: news.querySelector('.nw-empty') };
}

export function measureSide(s) {
  for (const r of s.rows) r.h = r.node.offsetHeight;
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
    const a = p > 0 ? age(t - r.n.at) : '';
    if (r.shown !== a) { r.time.textContent = a; r.shown = a; }
  }
  s.empty.style.opacity = (1 - outCubic(seg(t, NEWS[0].at, NEWS[0].at + ENTER))).toFixed(3);
}
