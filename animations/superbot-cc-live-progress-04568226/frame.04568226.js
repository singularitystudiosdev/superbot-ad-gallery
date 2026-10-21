// The live view's frame: the reference card (title, Share, Expand, Stop) over the screen share, plus what this run
// adds, placed per variant: the progress, the current task chip (top right), the takeover pill and, in the news
// variants, the cheapest fare so far. A pure function of t.
import { ease, seg, lerp, outCubic, outBack, keyed, latest, money, esc, el, show, mv, RM } from './lib.04568226.js';
import { SITES, STEPS, PROGRESS, TASKS, NEWS, T } from './script.04568226.js';
import { buildScreen, DESK } from './screen.04568226.js';
import { MARK } from './thread.04568226.js';

// where each variant puts things: progress (rail | seam | pill | foot), the task chip (view | head), the news
// (corner | head | foot | pill), the pill (center | right)
export const VARIANTS = [
  { id: 'classic', label: '1 Classic', bar: 'rail', chip: 'view', news: null, pill: 'center' },
  { id: 'header-chip', label: '2 Task in header', bar: 'seam', chip: 'head', news: null, pill: 'center' },
  { id: 'pill-progress', label: '3 Progress pill', bar: 'pill', chip: 'view', news: null, pill: 'center' },
  { id: 'news-corner', label: '4 News card', bar: 'rail', chip: 'view', news: 'corner', pill: 'right' },
  { id: 'news-header', label: '5 News in header', bar: 'seam', chip: 'view', news: 'head', pill: 'center' },
  { id: 'news-footer', label: '6 News footer', bar: 'foot', chip: 'view', news: 'foot', pill: 'center' },
  { id: 'news-pill', label: '7 News in pill', bar: 'rail', chip: 'view', news: 'pill', pill: 'center' },
];

const FIT = 640 / DESK.w;
const ICON = {
  share: '<svg viewBox="0 0 16 16"><path d="M8 10V2.5M5 5.5l3-3 3 3M3.5 8.5v4a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-4"/></svg>',
  expand: '<svg viewBox="0 0 16 16"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/></svg>',
};
const PULL = ['Taking control', 'superbot is controlling your computer', '✅ Done, you\'re back in control'];

const bar = (cls) => `<div class="pb ${cls}"><i class="pb-fill"></i></div>`;
const chip = (cls) => `<span class="tk ${cls}"><i class="spin"></i><span class="tk-ls">${TASKS.map((k) => `<span class="tk-l">${esc(k.text)}</span>`).join('')}</span><b class="tk-n"></b></span>`;
const KEY = '<span class="nw-k"><span class="nw-e"></span><span class="nw-l"></span></span>';
const newsInner = (corner) => corner
  ? `${KEY}<span class="nw-row"><b class="nw-p"></b><i class="nw-d"></i></span><span class="nw-s"></span>`
  : `${KEY}<span class="nw-sw"><b class="nw-p"></b><span class="nw-s"></span></span><i class="nw-d"></i>`;
const steps = () => `<span class="steps">${SITES.map((s, k) => `${k === 3 ? '<span class="step step-re" style="width:0"><span class="step-emo">🔁</span><i class="spin"></i><i class="ok">✓</i></span>' : ''}<span class="step"><img src="${s.fav}" alt="" width="14" height="14"><i class="spin"></i><i class="ok">✓</i></span>`).join('')}<b class="steps-n"></b></span>`;

export function buildFrame(V) {
  const head = `<div class="head${V.bar === 'rail' ? ' head-rail' : ''}">
      <b class="title">Your computer${V.news === 'head' ? `<span class="nw nw-head">${newsInner(false)}</span>` : '<small>Live view</small>'}</b>
      ${V.chip === 'head' ? chip('tk-head') : `<span class="btn btn-ic">${ICON.share}</span>${V.news === 'head' ? '' : `<span class="btn">${ICON.expand}Expand</span>`}`}
      <span class="btn btn-stop"><i></i>Stop</span>
      ${V.bar === 'seam' || V.bar === 'rail' ? bar(`pb-${V.bar}`) : ''}
    </div>`;
  const pill = `<span class="pill${V.pill === 'right' ? ' pill-right' : ''}">${V.bar === 'pill' ? '<i class="pill-fill"></i>' : ''}${MARK}<span class="pill-txt">${PULL.map((p) => `<span>${esc(p)}</span>`).join('')}</span>${V.bar === 'pill' ? '<b class="pill-pct">0%</b>' : ''}${V.news === 'pill' ? `<span class="pill-news nw">${newsInner(false)}</span>` : ''}</span>`;
  const view = `<div class="view">
      ${V.chip === 'view' ? chip('') : ''}
      ${V.news === 'corner' ? `<div class="nw nw-corner"><i class="flash"></i>${newsInner(true)}</div>` : ''}
      <i class="edge"><i class="soft"><i class="band"></i></i></i>
      ${pill}
    </div>`;
  const foot = V.news === 'foot' ? `<div class="foot">${bar('')}<i class="flash"></i><span class="nw nw-foot">${newsInner(false)}</span>${steps()}</div>` : '';
  const card = el(`<div class="card${foot ? ' has-foot' : ''}">${head}${view}${foot}</div>`);
  const screen = buildScreen();
  screen.node.style.transform = `scale(${FIT.toFixed(5)})`;
  card.querySelector('.view').prepend(screen.node);

  const $ = (s) => card.querySelector(s);
  const v = {
    pb: $('.pb'), fill: $('.pb-fill'), tk: $('.tk'), tls: $('.tk-ls'), tl: [...card.querySelectorAll('.tk-l')], tn: $('.tk-n'), spin: $('.tk .spin'),
    edge: $('.edge'), soft: $('.soft'), pill: $('.pill'), pillTxt: [...card.querySelectorAll('.pill-txt span')], pillTxtBox: $('.pill-txt'),
    pillFill: $('.pill-fill'), pillPct: $('.pill-pct'), stop: $('.btn-stop'),
    nw: $('.nw-corner, .nw-head, .nw-foot, .pill-news'), nk: $('.nw-k'), ne: $('.nw-e'), nl: $('.nw-l'), np: $('.nw-p'), ns: $('.nw-s'), nd: $('.nw-d'),
    flash: $('.flash'), steps: $('.steps'), stepEls: [...card.querySelectorAll('.step')], stepsN: $('.steps-n'),
  };
  let widths = null, pillW = null, last = { task: '', step: '', news: '' };

  // the chip's labels and the pill's lines are stacked; their box tweens between measured widths
  function measure() {
    widths = v.tl.map((l) => l.offsetWidth);
    pillW = v.pillTxt.map((l) => l.offsetWidth);
  }

  function paintTask(t, enter) {
    const k = Math.max(0, latest(TASKS, t));
    const cur = TASKS[k], prev = TASKS[k - 1];
    const sw = ease(t, cur.at, 0.4);
    v.tl.forEach((l, i) => {
      const o = i === k ? sw : prev && i === k - 1 ? 1 - sw : 0;
      l.style.opacity = o.toFixed(3);
      l.style.transform = i === k ? `translateY(${mv((1 - sw) * 10).toFixed(2)}px)` : `translateY(${mv(-sw * 10).toFixed(2)}px)`;
    });
    v.tls.style.width = `${lerp(prev ? widths[k - 1] : widths[k], widths[k], outCubic(sw)).toFixed(2)}px`;
    const done = ease(t, T.done, 0.3);
    v.spin.style.opacity = (1 - done).toFixed(3);
    v.spin.style.width = `${(14 * (1 - done)).toFixed(2)}px`;
    v.spin.style.transform = RM ? '' : `rotate(${((t * 420) % 360).toFixed(1)}deg)`;
    const s = STEPS[Math.max(0, latest(STEPS, t))];
    const label = t >= T.done ? `${s.of}/${s.of}` : `${s.n}/${s.of}`;
    if (label !== last.step) { v.tn.textContent = label; last.step = label; }
    const sAt = t >= T.done ? T.done : STEPS[Math.max(0, latest(STEPS, t))].at;
    v.tn.style.transform = RM ? '' : `scale(${(1 + 0.25 * (1 - outBack(seg(t, sAt, sAt + 0.4)))).toFixed(3)})`;
    show(v.tk, enter, -6, 0.92);
  }

  function paintNews(t) {
    const k = latest(NEWS, t);
    if (k < 0) { v.nw.style.opacity = '0'; return; }
    const n = NEWS[k], p = NEWS[k - 1];
    const enter = ease(t, NEWS[0].at + 0.2, 0.5, outBack);
    show(v.nw, Math.min(1, enter), 8, 0.94);
    // a cheaper fare counts down to itself; a re-scoped one (nonstop costs more) swaps with the source and label at the
    // dip of a quick crossfade, so no made-up price ever shows
    const swap = seg(t, n.at - 0.2, n.at + 0.25);
    const from = p && p.price != null ? p.price : n.price;
    const counts = n.price != null && from != null && n.price < from;
    const price = n.price == null ? null : counts ? lerp(from, n.price, outCubic(seg(t, n.at, n.at + 0.9))) : swap < 0.45 && from != null ? from : n.price;
    v.np.textContent = price == null ? '$ . . .' : money(price);
    const key = `${k}`;
    // emoji, label, source and detail; the header and the pill have room for the emoji, price and source only
    const textOf = (x) => ({
      e: x.final ? '🏆' : x.price == null ? '🔎' : x.label.includes('nonstop') ? '✈️' : '💸',
      l: x.label,
      s: x.site ? `<img src="${x.site.fav}" alt="" width="14" height="14">${esc(x.site.id === 'united' ? 'united.com' : x.site.id === 'kayak' ? 'Kayak' : x.site.name)}<span class="nw-det">, ${esc(x.detail)}</span>` : 'searching',
    });
    const showN = swap >= 0.45 || !p ? n : p;
    if (last.news !== (showN === n ? key : `${k - 1}`)) {
      last.news = showN === n ? key : `${k - 1}`;
      const tx = textOf(showN);
      v.ne.textContent = tx.e;
      v.nl.textContent = tx.l;
      v.ns.innerHTML = tx.s;
    }
    const dip = 1 - Math.sin(Math.PI * swap) * 0.9;
    v.ns.style.opacity = dip.toFixed(3);
    v.np.style.opacity = (counts ? 1 : dip).toFixed(3);
    v.nk.style.opacity = (n.label !== (p && p.label) || n.final ? dip : 1).toFixed(3);
    // the drop since the last best, as a badge; a re-scoped fare (nonstop) says so instead
    const drop = p && p.price != null && n.price < p.price ? `▼ ${money(p.price - n.price)}` : n.final ? '✓ nonstop' : n.price != null && p && p.price != null && n.price > p.price ? '🔁 nonstop only' : '';
    v.nd.textContent = drop;
    const badge = drop ? outBack(seg(t, n.at + 0.5, n.at + 0.9)) : 0;
    v.nd.style.opacity = Math.min(1, badge).toFixed(3);
    v.nd.style.transform = RM ? '' : `scale(${lerp(0.6, 1, Math.min(1.05, badge)).toFixed(3)})`;
    if (v.flash) v.flash.style.opacity = n.price == null ? '0' : (0.9 * Math.sin(Math.PI * seg(t, n.at, n.at + 0.8))).toFixed(3);
  }

  function paintSteps(t) {
    const re = v.stepEls[3];
    const g = ease(t, T.replan, 0.4);
    re.style.width = `${(22 * g).toFixed(2)}px`;
    re.style.marginLeft = re.style.marginRight = `${(-2 * (1 - g)).toFixed(2)}px`;
    re.style.opacity = g.toFixed(3);
    // order on screen: GF, Kayak, Sky, re-filter, Expedia, United
    const spans = [[SITES[0].at, SITES[0].found], [SITES[1].at, SITES[1].found], [SITES[2].at, SITES[2].found], [T.replan, T.refiltered], [SITES[3].at, SITES[3].found], [SITES[4].at, SITES[4].found]];
    v.stepEls.forEach((st, i) => {
      const [a, b] = spans[i];
      const ok = ease(t, b, 0.3, outBack);
      const live = t >= a && t < b ? 1 : 0;
      st.querySelector('.ok').style.opacity = Math.min(1, ok).toFixed(3);
      const sp = st.querySelector('.spin');
      sp.style.opacity = String(live);
      if (live) sp.style.transform = RM ? '' : `rotate(${((t * 420) % 360).toFixed(1)}deg)`;
      st.style.opacity = i === 3 ? st.style.opacity : (t >= a || ok > 0 ? 1 : 0.4).toFixed(2);
    });
    const s = STEPS[Math.max(0, latest(STEPS, t))];
    const label = t >= T.done ? `${s.of}/${s.of}` : `${s.n}/${s.of}`;
    if (v.stepsN.textContent !== label) v.stepsN.textContent = label;
    v.steps.style.opacity = ease(t, T.bar, 0.4).toFixed(3);
  }

  function paintPill(t) {
    const pi = ease(t, T.take + 0.12, 0.45);
    v.pill.style.opacity = pi.toFixed(3);
    const x = v.pill.classList.contains('pill-right') ? '0' : '-50%';
    v.pill.style.transform = `translate(${x}, ${mv((1 - pi) * 8).toFixed(2)}px)`;
    // the line: taking control, controlling, done (crossfades, the box tweening between widths)
    const keys = [T.take - 1, T.take + 0.6, T.release];
    const k = Math.max(0, latest(keys.map((at) => ({ at })), t));
    const sw = k === 0 ? 1 : ease(t, keys[k], 0.5);
    // the old line leaves before the new one arrives, so two lines never overlap
    v.pillTxt.forEach((s, i) => {
      s.style.opacity = (i === k ? seg(sw, 0.45, 1) : i === k - 1 ? 1 - seg(sw, 0, 0.45) : 0).toFixed(3);
    });
    v.pillTxtBox.style.width = `${lerp(pillW[Math.max(0, k - 1)], pillW[k], outCubic(sw)).toFixed(2)}px`;
  }

  function paintProgress(t) {
    const p = keyed(t, PROGRESS);
    const sx = RM ? '0' : `${(-((t * 0.5) % 1) * 300).toFixed(1)}%`;
    if (v.fill) {
      v.fill.style.width = `${(p * 100).toFixed(2)}%`;
      v.fill.style.setProperty('--sx', sx);
      v.pb.style.opacity = ease(t, T.bar, 0.4).toFixed(3);
    }
    if (v.pillFill) {
      v.pillFill.style.width = `${(p * 100).toFixed(2)}%`;
      const pct = `${Math.round(p * 100)}%`;
      if (v.pillPct.textContent !== pct) v.pillPct.textContent = pct;
    }
  }

  return {
    node: card,
    measure,
    paint(t) {
      if (!widths) measure();
      screen.paint(t);
      const g = outCubic(seg(t, T.take, T.take + 0.55));
      const off = 1 - ease(t, T.release, 0.6);
      v.edge.style.opacity = (g * off).toFixed(3);
      v.edge.style.setProperty('--a', RM ? '0deg' : `${((t * 60) % 360).toFixed(1)}deg`);
      v.soft.style.opacity = (0.9 + (RM ? 0 : 0.08 * Math.sin(t * 2.6))).toFixed(3);
      paintTask(t, Math.min(1, ease(t, T.take + 0.2, 0.5, outBack)));
      paintPill(t);
      paintProgress(t);
      if (v.nw) paintNews(t);
      if (v.steps) paintSteps(t);
      v.stop.style.opacity = (1 - 0.5 * ease(t, T.release, 0.4)).toFixed(3);
    },
  };
}
