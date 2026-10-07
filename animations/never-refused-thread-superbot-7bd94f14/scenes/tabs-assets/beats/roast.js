// Superbot's beat: it answers the ask ChatGPT refused. A header line streams, then four numbered roast lines
// stream one after another, the last one landing as the punchline. Pure function of t.
import { lerp, seg, outCubic, streamCount } from '../../../lib.js';

const HEAD = 'Dave. Thirty. No mercy, as requested.';
const LINES = [
  'You’ve been “getting back into running” since 2019. The couch has your outline.',
  'Four years “starting a podcast.” Three episodes. Your mom skipped one.',
  'You say “I’ll Venmo you” like it’s a love language.',
  'Happy 30th, Dave. Your back already knew.',
];
const CPS = 72, ROW_CPS = 88, GAP = 0.22;

export default {
  times(r) {
    const T = { r };
    T.h0 = r + 0.08;
    let at = T.h0 + HEAD.length / CPS + 0.18;
    T.rows = LINES.map((s) => { const a = at; at = a + s.length / ROW_CPS + GAP; return a; });
    T.end = at + 2.1;
    return T;
  },
  build(k, x) {
    const T = k.T;
    const head = x.el(`<div class="qc-say nr-head"><span class="qc-vis"></span><span class="qc-hid">${x.esc(HEAD)}</span></div>`);
    const list = x.el('<div class="nr-roast"></div>');
    const rows = LINES.map((s, i) => {
      const row = x.el(`<div class="nr-row${i === LINES.length - 1 ? ' nr-punch' : ''}"><b>${i + 1}</b><span><span class="qc-vis"></span><span class="qc-hid">${x.esc(s)}</span></span></div>`);
      list.appendChild(row);
      return { row, s, vis: row.querySelector('.qc-vis'), hid: row.querySelector('.qc-hid'), shown: -1 };
    });
    const hv = head.firstElementChild, hh = head.lastElementChild;
    let hs = -1;
    return {
      nodes: [head, list],
      marks: [[T.r, head], ...rows.map((r, i) => [T.rows[i], r.row])],
      render(t) {
        const n = streamCount(HEAD, T.h0, CPS, t);
        if (n !== hs) { hv.textContent = HEAD.slice(0, n); hh.textContent = HEAD.slice(n); hs = n; }
        rows.forEach((r, i) => {
          const a = T.rows[i];
          const p = outCubic(seg(t, a - 0.05, a + 0.3));
          r.row.style.opacity = p.toFixed(3);
          r.row.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * 8).toFixed(2)}px)`;
          const c = streamCount(r.s, a, ROW_CPS, t);
          if (c !== r.shown) { r.vis.textContent = r.s.slice(0, c); r.hid.textContent = r.s.slice(c); r.shown = c; }
        });
        list.style.opacity = lerp(0, 1, seg(t, T.rows[0] - 0.1, T.rows[0])).toFixed(3);
      },
    };
  },
};
