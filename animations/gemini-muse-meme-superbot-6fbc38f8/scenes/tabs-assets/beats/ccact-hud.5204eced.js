// The activity-rail loop cuts' heads-up pieces (beats/ccact.5204eced.js), one look per variant: the task superbot is on,
// top right of the shared screen with its loop and step; a progress bar in the frame that fills once per loop and starts
// over when the next loop begins; in the news looks, the search's topline, the cheapest fare so far; and, to the right of
// the frame, a small activity rail, an icon and a line per thing superbot did, newest on top. Where the bar sits, where
// the topline sits and how the rail is cut are what the looks change. All of it flat: no glow, no shimmer, nothing over
// the screen but the chip and, in one look, the topline card. Every value is set from t, so frozen ?t= frames hold. The
// fares are the captures' own (img/flights.92b9b0b0/CREDITS.txt). Styles in ../ccact.5204eced.css (cxa-*), with the
// progress cuts' chip, label and status pieces (computer-progress.a05be571.css, ccp-*).
import { lerp, seg, outCubic, outBack, esc } from '../../../lib.9b47fc30.js';

// the plan's steps as superbot starts each (T.tasks), then done; the first loop checks three sites, the user's nonstop ask
// starts a second loop on the same three with the filter on
export const TASKS = ['Opening Google Flights', 'Reading Google Flights fares', 'Searching Kayak', 'Comparing Kayak fares', 'Searching momondo', 'Comparing momondo fares', 'Reloading Google Flights', 'Reading nonstop fares', 'Filtering momondo to nonstop', 'Filtering Kayak to nonstop'];
const DONE = 'Found the cheapest nonstop';
const LOOPS = [{ at: 0, n: 6 }, { at: 6, n: 4 }]; // each loop's first task and its step count
// the topline as each fare is read (T.news): what it is, the fare, where and how; the label turns to nonstop with loop 2
export const NEWS = [
  { label: 'Cheapest so far', price: '$1,594', sub: 'United · nonstop · Google Flights' },
  { label: 'Cheapest so far', price: '$1,155', sub: '1 stop · Kayak', drop: '↓ $439' },
  { label: 'Cheapest so far', price: '$1,155', sub: '1 stop · Kayak and momondo' },
  { label: 'Cheapest nonstop', price: '$1,594', sub: 'United · Google Flights' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · momondo', drop: '↓ $97' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · momondo and Kayak' },
];
// the rail's rows (T.acts): an icon, a line, a detail; a fare's row carries its drop
export const ACTS = [
  ['cursor', 'Took control', 'Your computer'],
  ['globe', 'Google Flights', 'Opened · loop 1'],
  ['tag', '$1,594', 'United nonstop'],
  ['globe', 'Kayak', 'Opened · loop 1'],
  ['chat', 'You asked', '“any updates?”'],
  ['tag', '$1,155', 'Kayak · 1 stop', '↓ $439'],
  ['globe', 'momondo', 'Opened · loop 1'],
  ['tag', '$1,155', 'momondo · 1 stop'],
  ['chat', 'You asked', '“only nonstop”'],
  ['loop', 'Loop 2', 'Nonstop only'],
  ['reload', 'Google Flights', 'Reloaded · loop 2'],
  ['tag', '$1,594', 'United nonstop'],
  ['filter', 'momondo', 'Nonstop filter on'],
  ['chat', 'You asked', '“best so far?”'],
  ['tag', '$1,497', 'ANA nonstop', '↓ $97'],
  ['filter', 'Kayak', 'Nonstop filter on'],
  ['check', 'Done', '$1,497 on ANA'],
];
const SVG = (d) => `<svg viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`;
const ICONS = {
  cursor: SVG('<path d="M4 2.5v10.2l2.8-2.6 1.8 3.9 1.7-.8-1.7-3.8h3.7z"/>'),
  globe: SVG('<circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.6 1.6 2.3 3.4 2.3 5.5S9.6 11.9 8 13.5M8 2.5C6.4 4.1 5.7 5.9 5.7 8s.7 3.9 2.3 5.5"/>'),
  tag: SVG('<path d="M2.5 8.3V3.2c0-.4.3-.7.7-.7h5.1l5.2 5.2-5.8 5.8z"/><circle cx="5.6" cy="5.6" r="1"/>'),
  chat: SVG('<path d="M3 3.5h10v7H7.5L4.5 13v-2.5H3z"/>'),
  loop: SVG('<path d="M3 7.2A5 5 0 0 1 12.2 5M13 8.8A5 5 0 0 1 3.8 11"/><path d="M12.5 2.5v2.8H9.7M3.5 13.5v-2.8h2.8"/>'),
  reload: SVG('<path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/>'),
  filter: SVG('<path d="M2.5 3.5h11L9.3 8.6v4l-2.6 1v-5z"/>'),
  check: SVG('<path d="M3.8 8.4l2.7 2.7L12.2 5.4"/>'),
};
const OK = '<svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg>';
const PLANE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14.2 2 1.8 7.3l4.6 1.8m7.8-7.1L8.1 14l-1.7-4.9m7.8-7.1L6.4 9.1"/></svg>';

// the task running at t: -1 before the first, TASKS.length once done
const starts = (T) => [...T.tasks, T.done];
function taskAt(T, t) {
  const s = starts(T);
  let i = -1;
  while (i < TASKS.length && t >= s[i + 1]) i++;
  return i;
}
const loopOf = (i) => (i >= LOOPS[1].at ? 1 : 0);
// the loop's progress: each task eases its step in, so the bar moves in steps as a real one does; a loop's last step
// fills it, and the next loop's first step drops it back to the start
function progress(T, t) {
  const i = taskAt(T, t), s = starts(T);
  if (i < 0) return 0;
  const L = loopOf(Math.min(i, TASKS.length - 1)), lp = LOOPS[L];
  if (i >= TASKS.length) return 1;
  const run = (i - lp.at + outCubic(seg(t, s[i], s[i + 1]))) / lp.n;
  return L > 0 ? lerp(1, run, outCubic(seg(t, s[lp.at], s[lp.at] + 0.35))) : run;
}
function stepOf(T, t) {
  const i = taskAt(T, t), lp = LOOPS[loopOf(Math.max(0, Math.min(i, TASKS.length - 1)))];
  return `${Math.min(Math.max(i - lp.at, 0) + 1, lp.n)}/${lp.n}`;
}
const loopStarts = (T) => LOOPS.map((l) => T.tasks[l.at]);
// the pieces come up as superbot takes control
const shownAt = (T, t) => outCubic(seg(t, T.take + 0.1, T.take + 0.5));
const newsIn = (T, t) => outCubic(seg(t, T.news[0], T.news[0] + 0.4));

// a line that changes: every version stacked in one cell (.ccp-lbl), the running one rising in, the last one rising
// out; the cell's width follows the running line's, so its box fits the text
const lines = (list, cls = '') => `<span class="ccp-lbl ${cls}">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</span>`;
function paintLines(cell, at, t) {
  const spans = cell.children;
  let cur = 0;
  for (let i = 0; i < spans.length; i++) {
    const a = at[i], b = at[i + 1];
    if (t >= a) cur = i;
    const into = i === 0 && t < a ? 1 : outCubic(seg(t, a, a + 0.24)), out = b === undefined ? 0 : outCubic(seg(t, b, b + 0.18));
    spans[i].style.opacity = (into * (1 - out)).toFixed(3);
    spans[i].style.transform = `translateY(${((1 - into) * 5 - out * 5).toFixed(2)}px)`;
  }
  const f = outCubic(seg(t, at[cur], at[cur] + 0.24));
  const w = lerp(spans[Math.max(cur - 1, 0)].offsetWidth, spans[cur].offsetWidth, f);
  cell.style.width = w ? `${w.toFixed(2)}px` : '';
}
const text = (n, s, memo) => { if (memo.get(n) !== s) { n.textContent = s; memo.set(n, s); } };
const rise = (n, on, dy = -4) => { n.style.opacity = on.toFixed(3); n.style.transform = `translateY(${((1 - on) * dy).toFixed(2)}px)`; };
const loopLines = () => lines(LOOPS.map((_, i) => `Loop ${i + 1}`), 'cxa-loopl');

// the status mark: a turning ring while superbot works, a check once it is done
const STATUS = `<span class="ccp-st"><i class="ccp-spin"></i><span class="ccp-ok">${OK}</span></span>`;
function paintStatus(st, T, t) {
  const d = T.done, spin = st.firstElementChild, ok = st.lastElementChild;
  spin.style.opacity = (1 - seg(t, d, d + 0.12)).toFixed(3);
  spin.style.transform = `rotate(${((t * 420) % 360).toFixed(1)}deg)`;
  ok.style.opacity = seg(t, d, d + 0.12).toFixed(3);
  ok.style.transform = `scale(${lerp(0.4, 1, outBack(seg(t, d, d + 0.3))).toFixed(3)})`;
}

// the task top right of the screen, under Chrome's toolbar: a chip (status, task, loop and step) or a two-line card
const chipHtml = () => `<span class="ccp-hud cxa-chip">${STATUS}${lines([...TASKS, DONE])}<b class="cxa-tag">${loopLines()}<i>·</i><span class="cxa-n"></span></b></span>`;
const cardHtml = () => `<span class="ccp-hud cxa-task"><span class="ccp-eye"><i class="ccp-dot"></i>${lines(['Current task', 'Task complete'])}<span class="cxa-tag">${loopLines()}<i>·</i><span class="cxa-n"></span></span></span>${STATUS}${lines([...TASKS, DONE], 'cxa-tl')}</span>`;
function bindTask(root, memo) {
  const hud = root.querySelector('.cxa-chip, .cxa-task'), st = hud.querySelector('.ccp-st'), n = hud.querySelector('.cxa-n');
  const loop = hud.querySelector('.cxa-loopl'), cells = [...hud.querySelectorAll('.ccp-lbl')].filter((c) => c !== loop);
  const task = cells[cells.length - 1], eye = cells.length > 1 ? cells[0] : null;
  return (T, t) => {
    rise(hud, shownAt(T, t));
    paintStatus(st, T, t);
    paintLines(task, starts(T), t);
    paintLines(loop, loopStarts(T), t);
    if (eye) paintLines(eye, [T.tasks[0], T.done], t);
    text(n, stepOf(T, t), memo);
  };
}

// the bar: a track and a flat pink-to-purple fill
const BAR = '<i class="cxa-bar"><i class="cxa-fill"></i></i>';
const paintBar = (fill, T, t) => { fill.style.width = `${(progress(T, t) * 100).toFixed(2)}%`; };

// edge: a 3px bar along the top of the screen
function bindEdge(root) {
  const bar = root.querySelector('.cxa-edge'), fill = bar.querySelector('.cxa-fill');
  return (T, t) => { bar.style.opacity = shownAt(T, t).toFixed(3); paintBar(fill, T, t); };
}
// header: the bar along the frame header's foot, the loop and percent after Live view; the header is the view's own
function bindHead(root, memo) {
  const head = root.querySelector('.bk-head');
  head.classList.add('cxa-hd');
  const meta = document.createElement('b'), bar = document.createElement('i');
  meta.className = 'cxa-hdmeta';
  meta.innerHTML = `${loopLines()}<i>·</i><span class="cxa-pct"></span>`;
  head.querySelector('.bk-title small').after(meta);
  bar.className = 'cxa-bar cxa-hdbar';
  bar.innerHTML = '<i class="cxa-fill"></i>';
  head.append(bar);
  const fill = bar.firstElementChild, loop = meta.querySelector('.cxa-loopl'), pct = meta.querySelector('.cxa-pct');
  return (T, t) => {
    const on = shownAt(T, t);
    bar.style.opacity = on.toFixed(3);
    meta.style.opacity = on.toFixed(3);
    paintBar(fill, T, t);
    paintLines(loop, loopStarts(T), t);
    text(pct, `${Math.round(progress(T, t) * 100)}%`, memo);
  };
}
// footer: a strip under the screen inside the frame: the loop, the bar, the step and percent and, in the news footer,
// the topline at its right end
function bindFoot(root, memo, withNews) {
  const foot = document.createElement('div');
  foot.className = `cxa-foot${withNews ? ' cxa-foot-news' : ''}`;
  foot.innerHTML = `<span class="cxa-fl">${ICONS.loop}${loopLines()}</span>${BAR}<b class="cxa-fn"><span class="cxa-n"></span><i>·</i><span class="cxa-pct"></span></b>${withNews ? newsHtml('cxa-in-foot') : ''}`;
  root.querySelector('.cc3-screen').after(foot);
  const fill = foot.querySelector('.cxa-fill'), loop = foot.querySelector('.cxa-loopl'), n = foot.querySelector('.cxa-n'), pct = foot.querySelector('.cxa-pct');
  const news = withNews ? foot.querySelector('.cxa-news') : null, paintNews = news && bindNews(news);
  return (T, t) => {
    foot.style.opacity = shownAt(T, t).toFixed(3);
    paintBar(fill, T, t);
    paintLines(loop, loopStarts(T), t);
    text(n, stepOf(T, t), memo);
    text(pct, `${Math.round(progress(T, t) * 100)}%`, memo);
    if (news) { rise(news, newsIn(T, t), 3); paintNews(T, t); }
  };
}

// the topline: its label, the fare and where it is from, each a changing line; a drop shows what it saved for a moment
const uniq = (key) => NEWS.reduce((acc, n, i) => (acc.length && NEWS[acc[acc.length - 1]][key] === n[key] ? acc : [...acc, i]), []);
const LABELS = uniq('label'), PRICES = uniq('price');
const DROPS = NEWS.map((n, i) => (n.drop ? i : -1)).filter((i) => i >= 0);
function newsHtml(cls) {
  return `<span class="cxa-news ${cls}"><span class="cxa-nl">${PLANE}${lines(LABELS.map((i) => NEWS[i].label))}</span><span class="cxa-np">${lines(PRICES.map((i) => NEWS[i].price), 'cxa-price')}${DROPS.map((i) => `<b class="cxa-drop">${esc(NEWS[i].drop)}</b>`).join('')}</span>${lines(NEWS.map((n) => n.sub), 'cxa-sub')}</span>`;
}
function bindNews(box) {
  const [label, price, sub] = box.querySelectorAll('.cxa-nl .ccp-lbl, .cxa-np .ccp-lbl, .cxa-sub'), drops = box.querySelectorAll('.cxa-drop');
  return (T, t) => {
    paintLines(label, LABELS.map((i) => T.news[i]), t);
    paintLines(price, PRICES.map((i) => T.news[i]), t);
    paintLines(sub, T.news, t);
    DROPS.forEach((i, k) => {
      const d = T.news[i], on = Math.min(1, outBack(seg(t, d + 0.15, d + 0.45))) * (1 - seg(t, d + 2.4, d + 2.7));
      // outBack leaves a residue at 0, so the badge only takes room once it visibly shows
      drops[k].style.opacity = on.toFixed(3);
      drops[k].style.display = on > 0.001 ? '' : 'none';
      drops[k].style.transform = `scale(${lerp(0.6, 1, on).toFixed(3)})`;
    });
  };
}

// the activity rail, to the right of the frame: a header with the loop superbot is on, then a row per thing it did,
// newest on top, each opening from nothing as it lands so the older ones move down and leave by the foot. `list` is a
// card of its own beside the frame; `tab` hangs off the frame's right edge, narrower, the frame's right corners squared
// to meet it. With `news`, the topline sits pinned at the top of the rail, over the rows
export function railHtml(cut, withNews) {
  const rows = ACTS.map(([ic, title, sub, drop], i) => `<div class="cxa-act" data-i="${i}"><span class="cxa-ic cxa-ic-${ic}">${ICONS[ic]}</span><span class="cxa-at"><b>${esc(title)}${drop ? `<em>${esc(drop)}</em>` : ''}</b><small>${esc(sub)}</small></span></div>`).reverse().join('');
  return `<aside class="cxa-rail cxa-rail-${cut}" aria-label="Activity">
      <div class="cxa-rh"><span class="cxa-rt">${ICONS.loop}Activity</span><b class="cxa-rl">${loopLines()}</b></div>
      ${withNews ? `<div class="cxa-rnews">${newsHtml('cxa-in-rail')}</div>` : ''}
      <div class="cxa-acts">${rows}</div>
    </aside>`;
}
export function bindRail(rail) {
  const rows = [...rail.querySelectorAll('.cxa-act')].sort((a, b) => a.dataset.i - b.dataset.i);
  const loop = rail.querySelector('.cxa-rl .ccp-lbl'), wrap = rail.querySelector('.cxa-rnews'), news = wrap && bindNews(wrap);
  return (T, t, on) => {
    rail.style.opacity = on.toFixed(3);
    rail.style.transform = on >= 1 ? 'none' : `translateX(${((1 - on) * -10).toFixed(2)}px)`;
    paintLines(loop, loopStarts(T), t);
    rows.forEach((n, i) => {
      const a = T.acts[i], p = outCubic(seg(t, a, a + 0.35));
      n.style.display = p > 0 ? '' : 'none';
      n.style.opacity = p.toFixed(3);
      n.style.height = p >= 1 ? '' : `${(n.scrollHeight * p).toFixed(2)}px`;
      n.classList.toggle('is-new', i === rows.length - 1 || t < T.acts[i + 1]);
    });
    if (wrap) {
      const o = newsIn(T, t);
      wrap.style.height = o >= 1 ? '' : `${(wrap.scrollHeight * o).toFixed(2)}px`;
      wrap.style.opacity = o.toFixed(3);
      news(T, t);
    }
  };
}

// each look: the pieces over the screen (html), the painter it binds on a view (bind), and the rail's cut
const both = (...fs) => (T, t) => fs.forEach((f) => f(T, t));
export const LOOKS = {
  // the bar along the screen's top edge, the task chip, the rail as a card
  edge: { rail: 'list', html: () => `<span class="cxa-edge">${BAR}</span>${chipHtml()}`, bind: (root) => both(bindEdge(root), bindTask(root, new Map())) },
  // the bar in a strip under the screen with the loop and step, the task chip, the rail hanging off the frame
  footer: { rail: 'tab', html: () => chipHtml(), bind: (root) => { const memo = new Map(); return both(bindFoot(root, memo, false), bindTask(root, memo)); } },
  // the bar along the header's foot with the loop and percent after Live view, a Current task card, the rail as a card
  header: { rail: 'list', html: () => cardHtml(), bind: (root) => { const memo = new Map(); return both(bindHead(root, memo), bindTask(root, memo)); } },
  // the edge bar and chip; the cheapest fare pinned at the top of the rail
  newsRail: { rail: 'list', news: true, html: () => `<span class="cxa-edge">${BAR}</span>${chipHtml()}`, bind: (root) => both(bindEdge(root), bindTask(root, new Map())) },
  // the footer strip and chip; the cheapest fare in a card top left of the screen, opposite the task; the rail as a tab
  newsLeft: {
    rail: 'tab',
    html: () => `${chipHtml()}<span class="ccp-hud cxa-left">${newsHtml('cxa-in-left')}</span>`,
    bind(root) {
      const memo = new Map(), box = root.querySelector('.cxa-left'), paint = bindNews(box);
      return both(bindFoot(root, memo, false), bindTask(root, memo), (T, t) => { rise(box, newsIn(T, t)); paint(T, t); });
    },
  },
  // the footer strip carries the cheapest fare at its right end; the chip; the rail as a card
  newsFooter: { rail: 'list', html: () => chipHtml(), bind: (root) => { const memo = new Map(); return both(bindFoot(root, memo, true), bindTask(root, memo)); } },
};
