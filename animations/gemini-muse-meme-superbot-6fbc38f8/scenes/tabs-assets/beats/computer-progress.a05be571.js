// Computer-control progress cuts ('computer-control-progress-edge', '-pill', '-steps'): the computer-control-v3-soft cut
// (computer.ba3976b6.js, same ask, same live view, same moves) with superbot's progress drawn on its takeover overlay, as
// a desktop agent's click-through overlay window can: the task it is on, top right of the shared screen, and a progress
// bar inside the frame. The moves are paced so each task reads: take control, find the new-tab button, open the tab,
// check the page; then done holds until the loop ends. Three looks, one per variant: `edge`, a thin bar along the
// screen's top edge and a task chip with the step count; `pill`, the bar and the percent inside the "superbot is
// controlling your computer" pill and a Current task card; `steps`, a four-segment bar under the task in one card. All
// in the pill's dark glass and the vignette's pink and purple, drawn at the view's own size in the card and the Expand
// panel alike, and every value is set from t, so frozen ?t= frames hold. Its stylesheet
// (../computer-progress.a05be571.css) loads with the module.
import { lerp, seg, outCubic, outBack, esc } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { make } from './computer.ba3976b6.js?v=9';

const CSS = new URL('../computer-progress.a05be571.css?v=1', import.meta.url).href;
// the reply comes as the work starts, so it says what superbot is doing rather than that it is done
const SAY = 'On it. Taking control of your computer to open a new tab.';
const TASKS = ['Taking control', 'Finding the new tab button', 'Opening a new tab', 'Checking the page loaded'];
const DONE = 'New tab opened';
const AT = [0, 0.22, 0.58, 0.86, 1]; // the bar as each task starts, then at done
const OK = '<svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg>';
// the route's `extra` (chat.9b47fc30.js routeBy): v3-soft's 1.6 s plus the 1.65 s the slower moves and the done hold add
export const EXTRA = 3.25;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`computer-control progress stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// v3-soft's moments, slowed so each task holds long enough to read; `tasks` is each task's start, then done
function times(r, end = r + 5.6) {
  const T = { r, card: r + 0.22, take: r + 0.62, ptr: r + 1.6, hov: r + 2.6, click: r + 2.75, open: r + 2.83, end };
  T.tasks = [r + 0.75, T.ptr, T.hov, r + 3.4, r + 4.2];
  return T;
}
const doneAt = (T) => T.tasks[TASKS.length];
// the task running at t: -1 before the first, TASKS.length once done
function taskAt(T, t) {
  let i = -1;
  while (i < TASKS.length && t >= T.tasks[i + 1]) i++;
  return i;
}
// the bar: each task eases from its start value to the next one's, so it moves in steps as a real one does
function progress(T, t) {
  const i = taskAt(T, t);
  if (i < 0) return 0;
  if (i >= TASKS.length) return 1;
  return lerp(AT[i], AT[i + 1], outCubic(seg(t, T.tasks[i], T.tasks[i + 1])));
}
// the layer comes up with the vignette, just after it
const shownAt = (T, t) => outCubic(seg(t, T.take + 0.1, T.take + 0.5));

// a line that changes with the task: every version stacked in one cell (computer-progress.a05be571.css .ccp-lbl), the
// running one rising in, the last one rising out; the cell's width follows the running line's, so its box fits the text
const lines = (list) => `<span class="ccp-lbl">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</span>`;
function paintLines(cell, starts, t) {
  const spans = cell.children;
  let cur = 0;
  for (let i = 0; i < spans.length; i++) {
    const a = starts[i], b = starts[i + 1];
    if (t >= a) cur = i;
    const into = outCubic(seg(t, a, a + 0.24)), out = b === undefined ? 0 : outCubic(seg(t, b, b + 0.18));
    spans[i].style.opacity = (into * (1 - out)).toFixed(3);
    spans[i].style.transform = `translateY(${((1 - into) * 5 - out * 5).toFixed(2)}px)`;
  }
  const f = outCubic(seg(t, starts[cur], starts[cur] + 0.24));
  const w = lerp(spans[Math.max(cur - 1, 0)].offsetWidth, spans[cur].offsetWidth, f);
  cell.style.width = w ? `${w.toFixed(2)}px` : '';
}

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
const stepOf = (T, t) => Math.min(Math.max(taskAt(T, t), 0), TASKS.length - 1) + 1;

// edge: a thin bar along the screen's top edge; top right, a chip with the status, the task and its step count
const edge = {
  html: () => `<span class="ccp-edge">${BAR}</span>
    <span class="ccp-hud ccp-chip">${STATUS}${lines([...TASKS, DONE])}<b class="ccp-n"></b></span>`,
  bind(root) {
    const $ = (s) => root.querySelector(s);
    const bar = $('.ccp-edge'), fill = bar.querySelector('.ccp-fill'), hud = $('.ccp-chip');
    const st = hud.querySelector('.ccp-st'), lbl = hud.querySelector('.ccp-lbl'), n = hud.querySelector('.ccp-n');
    let shown = '';
    return (T, t) => {
      const on = shownAt(T, t);
      bar.style.opacity = on.toFixed(3);
      hud.style.opacity = on.toFixed(3);
      hud.style.transform = `translateY(${((1 - on) * -4).toFixed(2)}px)`;
      fill.style.width = `${(progress(T, t) * 100).toFixed(2)}%`;
      paintStatus(st, T, t);
      paintLines(lbl, T.tasks, t);
      const s = `${stepOf(T, t)}/${TASKS.length}`;
      if (s !== shown) { n.textContent = s; shown = s; }
    };
  },
};

// pill: the bar and the percent inside the takeover pill (moved in at bind); top right, a Current task card
const pill = {
  html: () => `<span class="ccp-hud ccp-card"><span class="ccp-eye"><i class="ccp-dot"></i>${lines(['Current task', 'Task complete'])}</span>${lines([...TASKS, DONE])}</span>
    <b class="ccp-pct"></b>${BAR}`,
  bind(root) {
    const $ = (s) => root.querySelector(s);
    const hud = $('.ccp-card'), [eye, lbl] = hud.querySelectorAll('.ccp-lbl'), dot = $('.ccp-dot');
    const pct = $('.ccp-pct'), bar = $('.ccp-bar'), fill = bar.querySelector('.ccp-fill');
    const host = $('.cc3-pill');
    host.classList.add('ccp-pill');
    host.append(pct, bar);
    let shown = '';
    return (T, t) => {
      const on = shownAt(T, t), p = progress(T, t), d = doneAt(T);
      hud.style.opacity = on.toFixed(3);
      hud.style.transform = `translateY(${((1 - on) * -4).toFixed(2)}px)`;
      paintLines(eye, [T.tasks[0], d], t);
      paintLines(lbl, T.tasks, t);
      // the dot pulses while superbot works and settles once it is done
      dot.style.opacity = lerp(0.35 + 0.65 * (0.5 + 0.5 * Math.cos((t - T.take) * 6)), 1, seg(t, d, d + 0.2)).toFixed(3);
      fill.style.width = `${(p * 100).toFixed(2)}%`;
      const s = `${Math.round(p * 100)}%`;
      if (s !== shown) { pct.textContent = s; shown = s; }
    };
  },
};

// steps: one card top right, the status, the task and "2 of 4" over a bar of four segments, one per task
const steps = {
  html: () => `<span class="ccp-hud ccp-steps"><span class="ccp-row">${STATUS}${lines([...TASKS, DONE])}<b class="ccp-n"></b></span>
    <span class="ccp-segs">${TASKS.map(() => '<i><i></i></i>').join('')}</span></span>`,
  bind(root) {
    const hud = root.querySelector('.ccp-steps');
    const st = hud.querySelector('.ccp-st'), lbl = hud.querySelector('.ccp-lbl'), n = hud.querySelector('.ccp-n');
    const segs = [...hud.querySelectorAll('.ccp-segs > i > i')];
    let shown = '';
    return (T, t) => {
      const on = shownAt(T, t);
      hud.style.opacity = on.toFixed(3);
      hud.style.transform = `translateY(${((1 - on) * -4).toFixed(2)}px)`;
      paintStatus(st, T, t);
      paintLines(lbl, T.tasks, t);
      segs.forEach((s, i) => { s.style.width = `${(outCubic(seg(t, T.tasks[i], T.tasks[i + 1])) * 100).toFixed(2)}%`; });
      const s = t >= doneAt(T) ? 'Done' : `${stepOf(T, t)} of ${TASKS.length}`;
      if (s !== shown) { n.textContent = s; shown = s; }
    };
  },
};

// each look as a beat: v3-soft's, with this cut's line, clock and layer; the layer's sheet loads with the first build
const cut = (hud) => {
  const mod = make({ say: SAY, times, hud });
  return { times, build(k, x) { loadSheet(); return mod.build(k, x); } };
};
export const progressEdge = cut(edge);
export const progressPill = cut(pill);
export const progressSteps = cut(steps);
