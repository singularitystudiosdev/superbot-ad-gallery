// The flight-search loop's heads-up layer (beats/flights.92b9b0b0.js), one look per variant, drawn over the takeover
// overlay as a desktop agent's click-through window can, and in the frame's own header: the task superbot is on, top
// right of the shared screen; a progress bar inside the frame, over a plan that grows from six steps to eight when the
// user asks for nonstop only; and, in the news looks, the topline of the search, the cheapest fare found so far, which
// rolls over as each site comes in. Three looks without the topline: `edge` (a glowing bar along the screen's top edge,
// a task chip with its step), `pill` (the bar and percent in the controlling-your-computer pill, a Current task card),
// `head` (the bar along the frame header's foot, the percent in the header, a task chip). Three with it: `newsCard`
// (task, bar and fare in one card), `newsHead` (the fare in the frame header beside its title), `newsLeft` (the fare in
// a card top left of the screen, opposite the task). The pill's dark glass and the vignette's pink and purple; the progress cuts'
// classes (computer-progress.a05be571.css, ccp-*) where a piece is theirs. Every value is set from t, so frozen ?t=
// frames hold. The fares are the captures' own (img/flights.92b9b0b0/CREDITS.txt).
import { lerp, seg, outCubic, outBack, esc } from '../../../lib.9b47fc30.js';

export const TASKS = ['Opening Google Flights', 'Reading Google Flights fares', 'Searching Kayak', 'Comparing Kayak fares', 'Searching momondo', 'Comparing momondo fares', 'Filtering to nonstop', 'Rechecking Kayak nonstop'];
const DONE = 'Found the cheapest nonstop';
const PLAN = [6, 8]; // the plan's steps, before and after "only nonstop flights please" adds the last two
// the topline as each site comes in (T.news): what it is, the fare, where and how
export const NEWS = [
  { label: 'Cheapest so far', price: '$1,594', sub: 'United · nonstop · Google Flights' },
  { label: 'Cheapest so far', price: '$1,155', sub: 'Frontier + ZIPAIR · 1 stop · Kayak', drop: '↓ $439' },
  { label: 'Cheapest so far', price: '$1,155', sub: 'Same fare on momondo' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · nonstop · momondo' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · nonstop · Kayak and momondo' },
];
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
const planAt = (T, t) => (t >= T.grow ? PLAN[1] : PLAN[0]);
// the bar over a plan of n steps: each task eases its step in, so it moves in steps as a real one does; it holds short
// of full until superbot is done (the last step of a plan can be cut into by a change), then fills
const HOLD = 0.96;
function over(T, t, n) {
  const i = taskAt(T, t), s = starts(T);
  if (i < 0) return 0;
  const run = i >= TASKS.length ? HOLD : Math.min(HOLD, (i + outCubic(seg(t, s[i], s[i + 1]))) / n);
  return lerp(run, 1, outCubic(seg(t, T.done, T.done + 0.35)));
}
// when the plan grows, the bar eases back to where the longer plan puts it
const progress = (T, t) => lerp(over(T, t, PLAN[0]), over(T, t, PLAN[1]), outCubic(seg(t, T.grow, T.grow + 0.5)));
const doneAt = (T) => T.done;
// the layer comes up with the vignette, just after it
const shownAt = (T, t) => outCubic(seg(t, T.take + 0.1, T.take + 0.5));
const stepOf = (T, t) => `${Math.min(Math.max(taskAt(T, t), 0) + 1, planAt(T, t))}/${planAt(T, t)}`;

// a line that changes: every version stacked in one cell (.ccp-lbl), the running one rising in, the last one rising
// out; the cell's width follows the running line's, so its box fits the text
const lines = (list, cls = '') => `<span class="ccp-lbl ${cls}">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</span>`;
function paintLines(cell, at, t) {
  const spans = cell.children;
  let cur = 0;
  for (let i = 0; i < spans.length; i++) {
    const a = at[i], b = at[i + 1];
    if (t >= a) cur = i;
    const into = outCubic(seg(t, a, a + 0.24)), out = b === undefined ? 0 : outCubic(seg(t, b, b + 0.18));
    spans[i].style.opacity = (into * (1 - out)).toFixed(3);
    spans[i].style.transform = `translateY(${((1 - into) * 5 - out * 5).toFixed(2)}px)`;
  }
  const f = outCubic(seg(t, at[cur], at[cur] + 0.24));
  const w = lerp(spans[Math.max(cur - 1, 0)].offsetWidth, spans[cur].offsetWidth, f);
  cell.style.width = w ? `${w.toFixed(2)}px` : '';
}
const taskLines = () => lines([...TASKS, DONE]);
const paintTask = (cell, T, t) => paintLines(cell, starts(T), t);

// the status mark: a turning ring while superbot works, a check once it is done
const STATUS = `<span class="ccp-st"><i class="ccp-spin"></i><span class="ccp-ok">${OK}</span></span>`;
function paintStatus(st, T, t) {
  const d = doneAt(T), spin = st.firstElementChild, ok = st.lastElementChild;
  spin.style.opacity = (1 - seg(t, d, d + 0.12)).toFixed(3);
  spin.style.transform = `rotate(${((t * 420) % 360).toFixed(1)}deg)`;
  ok.style.opacity = seg(t, d, d + 0.12).toFixed(3);
  ok.style.transform = `scale(${lerp(0.4, 1, outBack(seg(t, d, d + 0.3))).toFixed(3)})`;
}
const BAR = '<i class="ccp-bar"><i class="ccp-fill"></i></i>';
const text = (n, s, memo) => { if (memo.get(n) !== s) { n.textContent = s; memo.set(n, s); } };
const rise = (n, on, dy = -4) => { n.style.opacity = on.toFixed(3); n.style.transform = `translateY(${((1 - on) * dy).toFixed(2)}px)`; };

// the topline: its label, the fare and where it is from, each a changing line; the fare glows as it changes and the
// first drop shows what it saved. Built into whichever box a look gives it
const uniq = (key) => NEWS.reduce((acc, n, i) => (acc.length && NEWS[acc[acc.length - 1]][key] === n[key] ? acc : [...acc, i]), []);
const LABELS = uniq('label'), PRICES = uniq('price');
const newsHtml = (cls) => `<span class="fl-news ${cls}"><span class="fl-nl">${PLANE}${lines(LABELS.map((i) => NEWS[i].label))}</span><span class="fl-np">${lines(PRICES.map((i) => NEWS[i].price), 'fl-price')}<b class="fl-drop">${esc(NEWS.find((n) => n.drop).drop)}</b></span>${lines(NEWS.map((n) => n.sub), 'fl-sub')}</span>`;
function bindNews(box) {
  const [label, price, sub] = box.querySelectorAll('.ccp-lbl'), drop = box.querySelector('.fl-drop');
  const dropAt = NEWS.findIndex((n) => n.drop);
  return (T, t) => {
    paintLines(label, LABELS.map((i) => T.news[i]), t);
    paintLines(price, PRICES.map((i) => T.news[i]), t);
    paintLines(sub, T.news, t);
    // the fare's glow: a pink flare each time it changes
    const flare = Math.max(...PRICES.map((i) => { const k = seg(t, T.news[i], T.news[i] + 0.9); return k > 0 && k < 1 ? Math.sin(Math.PI * Math.min(1, k * 2.2)) * (1 - k) : 0; }));
    price.style.textShadow = flare > 0.01 ? `0 0 ${(10 * flare).toFixed(1)}px rgba(244,114,182,${(0.9 * flare).toFixed(3)})` : '';
    const d = T.news[dropAt], dn = outBack(seg(t, d + 0.15, d + 0.45)) * (1 - seg(t, d + 2.4, d + 2.7));
    drop.style.opacity = Math.min(1, dn).toFixed(3);
    drop.style.transform = `scale(${lerp(0.6, 1, Math.min(1, dn)).toFixed(3)})`;
  };
}
// the topline's box arrives with the first fare
const newsIn = (T, t) => outCubic(seg(t, T.news[0], T.news[0] + 0.4));

// a task chip top right: the status, the task and, unless the look shows the step elsewhere, its step of the plan
const chip = (n = true) => `<span class="ccp-hud ccp-chip fl-chip">${STATUS}${taskLines()}${n ? '<b class="ccp-n"></b>' : ''}</span>`;
function bindChip(root, memo) {
  const hud = root.querySelector('.fl-chip'), st = hud.querySelector('.ccp-st'), lbl = hud.querySelector('.ccp-lbl'), n = hud.querySelector('.ccp-n');
  return (T, t) => {
    rise(hud, shownAt(T, t));
    paintStatus(st, T, t);
    paintTask(lbl, T, t);
    if (n) text(n, stepOf(T, t), memo);
  };
}
// a bar along the screen's top edge (the progress cuts' edge bar)
function bindEdge(root) {
  const bar = root.querySelector('.ccp-edge'), fill = bar.querySelector('.ccp-fill');
  return (T, t) => { bar.style.opacity = shownAt(T, t).toFixed(3); fill.style.width = `${(progress(T, t) * 100).toFixed(2)}%`; };
}
// the frame header's foot as the bar and, unless the header carries the topline (no room for both), its percent after
// the title ("Live view 42%"); the header is the view's own
function headBar(root, memo, withPct = true) {
  const head = root.querySelector('.bk-head');
  head.classList.add('fl-hd');
  const bar = document.createElement('i'), pct = withPct ? document.createElement('b') : null;
  bar.className = 'ccp-bar fl-hdbar';
  bar.innerHTML = '<i class="ccp-fill"></i>';
  if (pct) { pct.className = 'fl-hdpct'; head.querySelector('.bk-title small').after(pct); }
  head.append(bar);
  const fill = bar.firstElementChild;
  return (T, t) => {
    const on = shownAt(T, t), p = progress(T, t);
    bar.style.opacity = on.toFixed(3);
    fill.style.width = `${(p * 100).toFixed(2)}%`;
    if (pct) { pct.style.opacity = on.toFixed(3); text(pct, `${Math.round(p * 100)}%`, memo); }
  };
}

export const LOOKS = {
  edge: {
    html: () => `<span class="ccp-edge">${BAR}</span>${chip()}`,
    bind(root) { const memo = new Map(), e = bindEdge(root), c = bindChip(root, memo); return (T, t) => { e(T, t); c(T, t); }; },
  },
  // the bar and the percent inside the takeover pill (moved in at bind), a Current task card top right
  pill: {
    html: () => `<span class="ccp-hud ccp-card fl-chip"><span class="ccp-eye"><i class="ccp-dot"></i>${lines(['Current task', 'Task complete'])}</span>${taskLines()}</span><b class="ccp-pct"></b>${BAR}`,
    bind(root) {
      const memo = new Map(), $ = (s) => root.querySelector(s);
      const hud = $('.ccp-card'), [eye, lbl] = hud.querySelectorAll('.ccp-lbl'), dot = $('.ccp-dot');
      const pct = $('.ccp-pct'), bar = $('.ccp-bar'), fill = bar.querySelector('.ccp-fill'), host = $('.cc3-pill');
      host.classList.add('ccp-pill');
      host.append(pct, bar);
      return (T, t) => {
        const p = progress(T, t), d = doneAt(T);
        rise(hud, shownAt(T, t));
        paintLines(eye, [T.tasks[0], d], t);
        paintTask(lbl, T, t);
        // the dot pulses while superbot works and settles once it is done
        dot.style.opacity = lerp(0.35 + 0.65 * (0.5 + 0.5 * Math.cos((t - T.take) * 6)), 1, seg(t, d, d + 0.2)).toFixed(3);
        fill.style.width = `${(p * 100).toFixed(2)}%`;
        text(pct, `${Math.round(p * 100)}%`, memo);
      };
    },
  },
  head: {
    html: () => chip(),
    bind(root) { const memo = new Map(), h = headBar(root, memo), c = bindChip(root, memo); return (T, t) => { h(T, t); c(T, t); }; },
  },
  // one card top right: the task row, the bar, then the topline, which opens under them with the first fare
  newsCard: {
    html: () => `<span class="ccp-hud fl-card"><span class="ccp-row">${STATUS}${taskLines()}<b class="ccp-n"></b></span>${BAR}<span class="fl-cardnews">${newsHtml('fl-in-card')}</span></span>`,
    bind(root) {
      const memo = new Map(), hud = root.querySelector('.fl-card'), st = hud.querySelector('.ccp-st'), lbl = hud.querySelector('.ccp-row .ccp-lbl');
      const n = hud.querySelector('.ccp-n'), fill = hud.querySelector('.ccp-fill'), wrap = hud.querySelector('.fl-cardnews'), news = bindNews(wrap);
      return (T, t) => {
        rise(hud, shownAt(T, t));
        paintStatus(st, T, t);
        paintTask(lbl, T, t);
        text(n, stepOf(T, t), memo);
        fill.style.width = `${(progress(T, t) * 100).toFixed(2)}%`;
        const o = newsIn(T, t);
        wrap.style.height = o >= 1 ? '' : `${(wrap.scrollHeight * o).toFixed(2)}px`;
        wrap.style.opacity = o.toFixed(3);
        news(T, t);
      };
    },
  },
  // the topline in the frame header beside its title, the bar along the header's foot, a task chip top right
  newsHead: {
    html: () => chip(),
    bind(root) {
      const memo = new Map(), head = root.querySelector('.bk-head');
      head.classList.add('fl-hd-news');
      const box = document.createElement('template');
      box.innerHTML = newsHtml('fl-in-head');
      const news = box.content.firstElementChild;
      head.querySelector('.bk-title').after(news);
      const h = headBar(root, memo, false), c = bindChip(root, memo), paint = bindNews(news);
      return (T, t) => { h(T, t); c(T, t); rise(news, newsIn(T, t), 3); paint(T, t); };
    },
  },
  // the topline in a card top left of the screen, opposite the task chip; the edge bar and the chip as `edge`. (The
  // bottom left would meet the pill once a fare's line runs long)
  newsLeft: {
    html: () => `<span class="ccp-edge">${BAR}</span>${chip()}<span class="ccp-hud fl-left">${newsHtml('fl-in-left')}</span>`,
    bind(root) {
      const memo = new Map(), e = bindEdge(root), c = bindChip(root, memo), box = root.querySelector('.fl-left'), paint = bindNews(box);
      return (T, t) => { e(T, t); c(T, t); rise(box, newsIn(T, t)); paint(T, t); };
    },
  },
};
