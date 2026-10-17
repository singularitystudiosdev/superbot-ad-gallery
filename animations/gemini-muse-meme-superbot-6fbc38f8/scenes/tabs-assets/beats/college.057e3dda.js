// College beat (the 'college' variant): a student's research study, three asks in one chat, cut like the bare
// multicat-credits chain (multicat.516afb1a.js `bare`): no routing chips, no model headers, no credits, the composer on
// Superbot throughout, every wait fast-forwarded under a badge in the frame's bottom right, and the house superbot.gg end
// card at the close. The engine types and sends the first ask ("Call 250 people with stratified random sample for my
// research study") and this beat answers it; then it carries the chat on by itself, typing, sending and answering two
// more asks, each in its own reply.
//   1. The calls: an artifact frame (bakery.005f5570.css .bk) with the spending variant's Export to Sheets button. Four
//      response counters over the sample, one row per class-year stratum (its roster N and its proportional n), and one
//      dot per call: all 250 dial at once, each rings, then resolves as a completed survey, a voicemail or a decline; the
//      live line under them names who is on the line. Its pill counts the campaign's real wall clock (the longest call).
//   2. The deck: the pitch deck variant's Slides card (pitchdeck.fad54971.css .pd: header, 16:9 stage, filmstrip and its
//      ring) holding six slides of the study's method and findings; the thumbs land as the deck generates, then it
//      advances to the method and the response slides.
//   3. The talk-through: that deck on the same stage, narrated in the user's cloned voice: a play strip with the take's
//      measured waveform (the song strip, multicat.516afb1a.css .mc-sg), the caption lighting word by word on its aligned
//      timings (the song's sung line), the slides turning on the words that name them, and the take itself kept in step
//      with the spot's clock; it plays to its last word, then
//   4. the house superbot.gg end card (the mascot, then the wordmark) covers the chat.
// The follow-up messages are built here and moved in after the engine's reply on the first render (they ride in
// inst.nodes, so the engine's show() hides them under every other variant). The engine reads inst.asks (the composer's
// typing and send presses) for them (chat.9b47fc30.js). A pure function of t, except the audio, which follows the clock
// and never drives it. Its stylesheet (../college.057e3dda.css) loads with the module. The study's numbers are mock data
// (college-data.057e3dda.js); the narration is a real Gemini TTS take (media/college.057e3dda/CREDITS.txt).
import { clamp, lerp, seg, outCubic, outQuint, streamCount, pressScale, rand } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the deck card's glyph-only Download, the pitch deck variant's own
import { DOWNLOAD as DECK_DL } from './pitchdeck.fad54971.js?v=2';
import { shareBtn } from './share.29a362ea.js';
import { DUR, PEAKS, LINES, WORDS, STRATA, ROSTER, SAMPLE, DONE, VOICEMAIL, DECLINED, SLEEP, ALLNIGHT } from './college-data.057e3dda.js';

const CSS = new URL('../college.057e3dda.css?v=1', import.meta.url).href;
// the deck card's own sheet, the pitch deck variant's (it loads it too; the browser fetches it once)
const DECK_CSS = new URL('../pitchdeck.fad54971.css?v=7', import.meta.url).href;
export const ID = 'college';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const VOICE = asset('media/college.057e3dda/narration.mp3');

export const TYPE_CPS = 55; // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const SAY1 = 'Calling 250 students, a stratified random sample by class year.';
// every wait plays fast-forwarded X times (the frame's badge says so): each card's pill counts its job's real wall-clock
// seconds, GEN, at X times the spot's clock, so it holds GEN / X seconds before the answer lands.
//   calls:  all 250 dialed at once, so the longest call sets the clock: the consent script and a ten-question survey,
//           about 7 minutes
//   slides: six slides written and laid out in Google Slides, about a minute
//   voice:  the voice cloned from the user's sample and the narration rendered in it, under a minute
const GEN = { calls: 432, slides: 64, voice: 52 };
const X = { calls: 100, slides: 50, voice: 50 };
const FF_IN = 0.2; // the frame's badge fades in over this, full as a wait starts
// a card's rise and the feed's glide to it (chat.9b47fc30.js renderScroll) both take this long: its wait starts once it is in view
const SEEN = 0.45;
const CALL_HOLD = 2.3; // the landed call results, from their settle to the next ask starting to type
const DIAL = 0.35;     // every call is dialed within this many seconds of the first, a wave across the grid
// each call's end as a share of the calling window, by outcome: declines hang up first, voicemails next, completed
// surveys run longest, and the longest of them closes the window
const ENDS = { ok: [0.42, 1], vm: [0.14, 0.52], no: [0.05, 0.3] };
const PLAY_AFTER = 0.25; // the narration's play press, after its card lands
const NARR_FOR = 10.1;   // the narration plays to its last word ("survey." ends at 9.99 s), then the end card covers the chat
const NARR_FADE = 0.6;
// the talk-through turns to slide 2 as "we called" starts and to slide 3 as "184" does (college-data.057e3dda.js WORDS)
const TURNS = [WORDS[6][1] - 0.12, WORDS[17][1] - 0.15];
// the house end card (multicat.516afb1a.js, the 16:9 cuts' ending): the chat fades to its black over END_IN, the card's
// own 2.5s run starts END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44; // the house card's gap between the wordmark and the 220px face, on a 1080-high stage
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="cr-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="crEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#crEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#crEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#crEndFace)"/></svg>';

// the two follow-up asks. `hold`: how long the landed answer shows before the next ask types (the last: the talk-through
// and the end card)
const STEPS = [
  { kind: 'deck', ask: 'Organize it into a google slides presentation', say: 'Here’s your study as a Google Slides deck.', gen: 'slides', hold: 2.6 },
  { kind: 'talk', ask: 'Use my voice to talk through the slides', say: 'Here’s the deck, talked through in your voice.', gen: 'voice', hold: PLAY_AFTER + NARR_FOR + END_DELAY + END_LEN },
];

// every time in the chain, laid end to end from the first reply r: each answer's card comes in at `card`, works (its pill
// running) from `gen0` until `done`, and has landed by `w1`. Chipless, so each reply comes where a first chip would have
// landed (the engine's own bare route, chat.9b47fc30.js)
function plan(r) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + GEN.calls / X.calls;
  const T = { r, card, gen0, done, w1: done + LAND, steps: [] };
  let s = T.w1 + CALL_HOLD;
  for (const st of STEPS) {
    const typeEnd = s + st.ask.length / TYPE_CPS, send = typeEnd + 0.15;
    const rr = send + 0.35 + 0.08, at = rr + 0.22, g0 = at + SEEN;
    const fin = g0 + GEN[st.gen] / X[st.gen], w1 = fin + LAND, play = w1 + PLAY_AFTER;
    T.steps.push({ ...st, s, typeEnd, send, chips: [], r: rr, card: at, gen0: g0, done: fin, w1, play, cut: play + NARR_FOR });
    s = w1 + st.hold;
  }
  T.end = s;
  return T;
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
// lucide phone (api.iconify.design/lucide/phone.svg)
const PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/></svg>';
// Google Sheets 2020 logo, inlined as the spending variant does (beats/spending.b92c87dc.js) so a frozen frame never waits on it
const SHEETS = '<svg viewBox="0 0 64 88" aria-hidden="true"><path fill="#188038" d="M 42,0 64,22 53,24 42,22 40,11 Z"/><path fill="#34a853" d="M 42,22 V 0 H 6 C 2.685,0 0,2.685 0,6 v 76 c 0,3.315 2.685,6 6,6 h 52 c 3.315,0 6,-2.685 6,-6 V 22 Z"/><path fill="#fff" d="M 12,34 V 63 H 52 V 34 Z M 29.5,58 H 17 v -7 h 12.5 z m 0,-12 H 17 V 39 H 29.5 Z M 47,58 H 34.5 V 51 H 47 Z M 47,46 H 34.5 V 39 H 47 Z"/></svg>';
// lucide chevrons (api.iconify.design/lucide/{chevron-left,chevron-right}.svg), the deck's nav
const ICON = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const PREV = ICON('m15 18l-6-6l6-6');
const NEXT = ICON('m9 18l6-6l-6-6');
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const num = (n) => n.toLocaleString('en-US');
const pct = (a, b) => `${(Math.round((a / b) * 1000) / 10).toFixed(1)}%`;

// who is on the line while the calls run, one after another: [name, stratum index]
const ON_LINE = [['Maya R.', 1], ['Jordan T.', 0], ['Priya S.', 3], ['Luis M.', 2], ['Hannah K.', 0], ['Omar B.', 1], ['Chloe W.', 3], ['Ethan P.', 2], ['Ava L.', 0], ['Noah G.', 1]];
const ONE = ['first-year', 'sophomore', 'junior', 'senior'];
const LINE_EVERY = 0.42; // seconds per name on the live line
const BARS = 14;         // the live line's voice bars

// the 250 calls, laid out stratum by stratum: each one's outcome (seeded shuffle, so the grid reads the same on every
// load), when it is dialed (seconds into the window) and when it ends (seconds into the window, never before it rings)
function makeCalls(span) {
  const list = [];
  let seed = 11;
  STRATA.forEach(([, , , ok, vm, no], si) => {
    const kinds = [...Array(ok).fill('ok'), ...Array(vm).fill('vm'), ...Array(no).fill('no')];
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rand(seed++) * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
    kinds.forEach((k) => {
      const dial = rand(seed++) * DIAL, [a, b] = ENDS[k];
      list.push({ si, k, dial, end: Math.max(dial + 0.18, lerp(a, b, rand(seed++)) * span) });
    });
  });
  list.filter((c) => c.k === 'ok').reduce((m, c) => (c.end > m.end ? c : m)).end = span;
  return list;
}

// the six slides' inner markup, authored once at stage size (496 x 279) in the pitch deck's paper, ink and green
// (pitchdeck.fad54971.css .pd-sl); the filmstrip scales the same markup down. data-fx marks what builds when the slide
// becomes active, data-k its order, data-s / data-d an own start offset and duration in seconds (the pitch deck's FX)
const MAXN = Math.max(...STRATA.map((r) => r[2]));
// the response slide's three outcomes: [label, count, fill]
const OUTCOMES = [['Completed', DONE, '#1f7a5a'], ['Voicemail', VOICEMAIL, 'rgba(31,122,90,.4)'], ['Declined', DECLINED, 'rgba(22,24,29,.16)']];
const SLIDES = [
  `<div class="pd-sl pd-s1"><div class="pd-rule" data-fx="x" data-k="0"></div><h3 class="pd-h">Sleep &amp; Study</h3><p>A stratified phone survey of ${SAMPLE} undergraduates</p><small>PSY 301 research study, fall 2026</small></div>`,
  `<div class="pd-sl"><h3 class="pd-h">A stratified random sample by class year</h3><div class="cr-tbl">${STRATA.map(([name, N, n], i) => `<div class="cr-tr" data-fx="row" data-k="${i}"><span>${name}</span><i><u style="width:${((n / MAXN) * 100).toFixed(1)}%" data-fx="x" data-s="${(0.12 + i * 0.07).toFixed(2)}"></u></i><b>${n}</b><small>of ${num(N)}</small></div>`).join('')}</div><p class="cr-foot">Proportional allocation, n = ${SAMPLE} of N = ${num(ROSTER)}</p></div>`,
  `<div class="pd-sl"><h3 class="pd-h">${DONE} of ${SAMPLE} finished the survey</h3><div class="cr-big" data-fx="row" data-k="0"><b>${pct(DONE, SAMPLE)}</b><span>response rate</span></div><div class="pd-fund cr-fund"><div class="pd-seg">${OUTCOMES.map(([, v, c], i) => `<i style="flex:${v} 1 0;background:${c}" data-fx="x" data-k="${i + 1}"></i>`).join('')}</div><div class="cr-key">${OUTCOMES.map(([k, v, c]) => `<span><i style="background:${c}"></i>${k}<b>${v}</b></span>`).join('')}</div></div></div>`,
  `<div class="pd-sl"><h3 class="pd-h">Sleep drops every class year</h3><div class="pd-chart cr-chart">${SLEEP.map((h, i) => `<div class="pd-col${i === SLEEP.length - 1 ? ' hi' : ''}"><b>${h.toFixed(1)} h</b><u style="height:${((h / SLEEP[0]) * 118).toFixed(1)}px" data-fx="y" data-k="${i}"></u><span>${STRATA[i][0]}</span></div>`).join('')}</div></div>`,
  `<div class="pd-sl"><h3 class="pd-h">41% pulled an all-nighter this month</h3><div class="cr-hb">${ALLNIGHT.map((p, i) => `<div class="cr-hr" data-fx="row" data-k="${i}"><span>${STRATA[i][0]}</span><i><u${i === ALLNIGHT.length - 1 ? ' class="hi"' : ''} style="width:${p}%" data-fx="x" data-s="${(0.12 + i * 0.07).toFixed(2)}"></u></i><b>${p}%</b></div>`).join('')}</div></div>`,
  `<div class="pd-sl"><h3 class="pd-h">Seniors sleep 54 minutes less than first-years</h3><ul class="pd-bul cr-bul">${['Sleep falls with every class year', 'All-nighters nearly double by senior year', 'Self-reported on one campus: replicate next term'].map((s, i) => `<li data-fx="row" data-k="${i}">${s}</li>`).join('')}</ul></div>`,
];
const N = SLIDES.length;
const STRIP_LAND = [0.3, 0.44, 0.58, 0.72, 0.86, 1]; // each thumb lands at this share of the deck's wait
const STEP = 84;  // filmstrip pitch: a 76px thumb plus the 8px gap (pitchdeck.fad54971.css)
const SLIDE = 40; // how far (px) a slide travels as it leaves or arrives

// how a built element moves at progress b (0..1), the pitch deck's
const FX = {
  row: (e, b) => { e.style.opacity = b.toFixed(3); e.style.transform = b >= 1 ? 'none' : `translateY(${((1 - b) * 8).toFixed(2)}px)`; },
  x: (e, b) => { e.style.transform = b >= 1 ? 'none' : `scaleX(${b.toFixed(4)})`; },
  y: (e, b) => { e.style.transform = b >= 1 ? 'none' : `scaleY(${b.toFixed(4)})`; },
};

// the take's measured envelope as one filled shape: the top edge left to right, then the bottom edge back
const WAVE_D = (() => {
  const n = PEAKS.top.length;
  const y = (v, dir) => (50 + dir * Math.max(1.5, v) * 0.48).toFixed(1);
  let d = 'M0 50';
  for (let i = 0; i < n; i++) d += `L${i} ${y(PEAKS.top[i], -1)}`;
  for (let i = n - 1; i >= 0; i--) d += `L${i} ${y(PEAKS.bot[i], 1)}`;
  return `${d}Z`;
})();
const wave = (cls) => `<svg class="${cls}" viewBox="0 0 ${PEAKS.top.length - 1} 100" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE_D}"/></svg>`;
// each caption's words, and when the caption takes the slot (just before its first word)
const LINE_WORDS = LINES.map((_, i) => WORDS.filter((w) => w[3] === i));
const LINE_AT = LINE_WORDS.map((ws) => ws[0][1] - 0.35);

const sheets = {};
function loadSheet(href, name) {
  if (sheets[href] || document.querySelector(`link[href="${href}"]`)) return;
  const l = sheets[href] = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  track(new Promise((done) => {
    l.onload = done;
    l.onerror = () => { console.error(new Error(`college variant ${name} stylesheet failed to load: ${href}`)); done(); };
  }));
  document.head.appendChild(l);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };

// the streamed line every reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// a working pill (the bare chain's: no tool tile): what runs and its timer. At t the timer counts the job's real seconds,
// x times the clock's rate from `gen0`, rests on the full `real` from `done`, and the pill fades out as the answer lands
// (by w1). Returns how much the card is working now, 0..1, which the frame's badge shows by
const genl = (what) => `<span class="qc-genl mc-genl-bare">${what}<b class="qc-genn">${clock(0)}</b></span>`;
function genPill(box, x) {
  const pill = box.querySelector('.qc-genl'), n = pill.querySelector('.qc-genn');
  let shown = clock(0), op = '';
  return (t, gen0, done, w1, real) => {
    const s = clock(t >= done ? real : Math.max(0, t - gen0) * x);
    if (s !== shown) { n.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.25, w1), o = out.toFixed(3);
    if (o !== op) { pill.style.opacity = o; op = o; }
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}

// 1. the calls: response counters, a row of dots per stratum, the live line
function buildCalls(x, T) {
  const span = T.done - T.gen0;
  const calls = makeCalls(span);
  const dots = (si) => calls.map((c, i) => (c.si === si ? `<i data-i="${i}"></i>` : '')).join('');
  const node = x.el(`<div class="bk cr-calls">
    <div class="bk-head"><b class="bk-title">Sleep study calls<small>${SAMPLE} of ${num(ROSTER)} students</small></b>${shareBtn('Sleep study calls')}<span class="bk-btn bk-publish cr-sheets">${SHEETS}Export to Sheets</span></div>
    <div class="bk-view cr-view">
      <div class="cr-kpis">
        <div class="cr-kpi"><small><i class="cr-sw ok"></i>Completed</small><b>0</b></div>
        <div class="cr-kpi"><small><i class="cr-sw vm"></i>Voicemail</small><b>0</b></div>
        <div class="cr-kpi"><small><i class="cr-sw no"></i>Declined</small><b>0</b></div>
        <div class="cr-kpi"><small>Response rate</small><b>0.0%</b></div>
      </div>
      <div class="cr-strata">${STRATA.map(([name, N, n], si) => `<div class="cr-row"><span class="cr-name"><b>${name}</b><small>${n} of ${num(N)}</small></span><span class="cr-dots">${dots(si)}</span><span class="cr-n"><b>0</b>/${n}</span></div>`).join('')}</div>
      <div class="cr-live">
        <div class="cr-on">${genl('Calling')}<span class="cr-bars">${'<i></i>'.repeat(BARS)}</span><span class="cr-who">On the line with <b></b><em></em></span><span class="cr-cnt"><b>0</b> live</span></div>
        <div class="cr-off"><span class="cr-ok">${x.OK}</span><span class="cr-who">Consent script read on every call</span><span class="cr-cnt">Answers saved to Sheets</span></div>
      </div>
    </div>
  </div>`);
  const q = (s) => node.querySelector(s), all = (s) => [...node.querySelectorAll(s)];
  const dotEls = all('.cr-dots i'), kpis = all('.cr-kpi b'), rowN = all('.cr-n b'), bars = all('.cr-bars i');
  const on = q('.cr-on'), off = q('.cr-off'), whoName = q('.cr-on .cr-who b'), whoYear = q('.cr-on .cr-who em'), live = q('.cr-on .cr-cnt b');
  const pill = genPill(on, X.calls);
  const state = dotEls.map(() => '');
  const texts = { kpi: kpis.map(() => ''), row: rowN.map(() => ''), live: '', who: -1 };
  const set = (arr, i, el, v) => { if (arr[i] !== v) { el.textContent = v; arr[i] = v; } };
  return { node, render(t) {
    enter(node, t, T.card);
    const at = t - T.gen0;
    const n = { ok: 0, vm: 0, no: 0, live: 0 }, rows = STRATA.map(() => 0);
    calls.forEach((c, i) => {
      const s = at < c.dial ? 'q' : at < c.end ? 'live' : c.k;
      if (s === 'live') n.live++; else if (s !== 'q') { n[s]++; if (s === 'ok') rows[c.si]++; }
      if (s !== state[i]) { dotEls[i].className = s; state[i] = s; }
    });
    set(texts.kpi, 0, kpis[0], num(n.ok));
    set(texts.kpi, 1, kpis[1], num(n.vm));
    set(texts.kpi, 2, kpis[2], num(n.no));
    set(texts.kpi, 3, kpis[3], pct(n.ok, SAMPLE));
    rows.forEach((v, i) => set(texts.row, i, rowN[i], String(v)));
    if (texts.live !== n.live) { live.textContent = num(n.live); texts.live = n.live; }
    // the live line while the calls run: the voice bars move and the name turns over; then the summary takes its place
    const w = pill(t, T.gen0, T.done, T.w1, GEN.calls);
    const swap = seg(t, T.done, T.w1);
    fade(on, Math.min(1, seg(t, T.card, T.card + 0.3)) * (1 - swap));
    fade(off, swap);
    const k = Math.max(0, Math.floor(at / LINE_EVERY)) % ON_LINE.length;
    if (k !== texts.who) { whoName.textContent = ON_LINE[k][0]; whoYear.textContent = `, ${ONE[ON_LINE[k][1]]}`; texts.who = k; }
    const talk = seg(t, T.gen0, T.gen0 + 0.2) * (1 - seg(t, T.done - 0.2, T.done));
    bars.forEach((b, i) => {
      const wob = 0.5 + 0.5 * Math.sin(t * (6 + 5 * rand(i + 40)) + i * 1.3);
      b.style.height = `${(3 + 13 * (0.35 + 0.65 * rand(i + 1)) * wob * talk).toFixed(2)}px`;
    });
    return w;
  } };
}

// a deck card narrower than its 496px stage (the 9:16 frame clamps a reply's column to 471px) zooms the stage and its
// filmstrip down to fit, so the slides keep their authored layout
const STAGE_W = 496, DECK_PAD = 24;
function deckFit(block) {
  const parts = [block.querySelector('.pd-stage'), block.querySelector('.pd-strip')].filter(Boolean);
  let k = 1;
  return () => {
    const kk = Math.min(1, (block.clientWidth - DECK_PAD) / STAGE_W);
    if (Math.abs(kk - k) < 1e-4) return;
    parts.forEach((p) => { p.style.zoom = kk < 1 ? kk.toFixed(4) : ''; });
    k = kk;
  };
}

// 2 and 3 share the deck: the stage's slides and their builds, moved to slide `idx` (0..N-1, fractional mid-move)
function deckStage(block) {
  const walls = [...block.querySelectorAll('.pd-stage .pd-sw')];
  const items = walls.map((w) => [...w.querySelectorAll('[data-fx]')].map((e) => ({ e, fx: FX[e.dataset.fx], s: e.dataset.s !== undefined ? +e.dataset.s : 0.08 + (+e.dataset.k || 0) * 0.07, d: +(e.dataset.d || 0.3) })));
  // land: slide 1's settle (0..1); arrive[i]: slide i + 1's arrival; starts[i]: when slide i became active
  return (t, land, arrive, starts) => {
    walls.forEach((w, i) => {
      const p = i === 0 ? land : (arrive[i - 1] || 0);
      const q = i < arrive.length ? arrive[i] : 0;
      const o = p * (1 - q);
      w.style.visibility = o > 0 ? '' : 'hidden';
      w.style.opacity = o.toFixed(3);
      const dx = (i ? (1 - p) * SLIDE : 0) - q * SLIDE;
      w.style.transform = dx ? `translateX(${dx.toFixed(2)}px)` : i === 0 && land < 1 ? `scale(${lerp(1.08, 1, land).toFixed(4)})` : 'none';
      const a0 = starts[i] === undefined ? Infinity : starts[i];
      items[i].forEach((it) => it.fx(it.e, outCubic(seg(t, a0 + it.s, a0 + it.s + it.d))));
    });
  };
}
const stageHtml = (extra) => `<div class="pd-stage"><div class="pd-shm"><i></i></div>${SLIDES.map((s) => `<div class="pd-sw">${s}</div>`).join('')}
  <div class="pd-nav"><span class="pd-nb pd-prev">${PREV}</span><em></em><span class="pd-nb pd-next">${NEXT}</span></div>${extra}</div>`;
const slidesBtn = (x, label) => `<span class="pd-exp"><img src="${x.brand('slides-logo.svg')}" alt=""/>${label}</span>`;

// 2. the Slides deck: the pitch deck's card, its thumbs landing through the wait, then the stage turns to the method and
// the response slides
function buildDeck(x, D) {
  const block = x.el(`<div class="pd cr-deck">
    <div class="pd-head"><b>Sleep study</b><span>${N} slides</span>${shareBtn('Sleep study deck')}${DECK_DL}${EXPAND}${slidesBtn(x, 'Open in Slides')}</div>
    ${stageHtml(genl('Creating slides'))}
    <div class="pd-strip">${SLIDES.map((s, i) => `<div><div class="pd-th"><div class="pd-shm"><i></i></div><div class="pd-tin">${s}</div></div><div class="pd-n">${i + 1}</div></div>`).join('')}<i class="pd-ring"></i></div>
  </div>`);
  const $ = (s) => block.querySelector(s);
  const thumbs = [...block.querySelectorAll('.pd-th')].map((n) => ({ tin: n.querySelector('.pd-tin'), shm: n.querySelector('.pd-shm'), sh: n.querySelector('.pd-shm i') }));
  const labels = [...block.querySelectorAll('.pd-n')];
  const ring = $('.pd-ring'), counter = $('.pd-nav em'), prev = $('.pd-prev'), next = $('.pd-next');
  const stageSh = $('.pd-stage > .pd-shm');
  const stage = deckStage(block);
  const pill = genPill($('.pd-stage'), X.slides);
  const fit = deckFit(block);
  const adv = [D.w1 + 0.5, D.w1 + 1.35];
  let cur = -1;
  return { node: block, render(t) {
    fit();
    enter(block, t, D.card);
    const span = D.done - D.gen0;
    const at = STRIP_LAND.map((s) => D.gen0 + span * s);
    thumbs.forEach((th, i) => {
      const p = landing(t, at[i]);
      th.shm.style.opacity = (1 - p).toFixed(3);
      th.sh.style.transform = `translateX(${lerp(-100, 100, ((t - D.card) * 1.4 + i * 0.17) % 1).toFixed(1)}%)`;
      settle(th.tin, p);
    });
    const land = landing(t, D.done);
    shimmer(stageSh.firstElementChild, t, D.card, 0, land);
    stageSh.style.opacity = (1 - land).toFixed(3);
    const arrive = adv.map((a) => outCubic(seg(t, a, a + 0.32)));
    stage(t, land, arrive, [D.done, ...adv]);
    const idx = arrive[0] + arrive[1];
    const now = Math.round(idx);
    if (now !== cur) { counter.textContent = `${now + 1} / ${N}`; labels.forEach((l, i) => l.classList.toggle('on', i === now)); cur = now; }
    prev.style.opacity = lerp(0.4, 1, Math.min(1, idx)).toFixed(3);
    next.style.transform = `scale(${adv.reduce((s, a) => s * pressScale(t, a, 0.18), 1).toFixed(4)})`;
    ring.style.opacity = outCubic(seg(t, at[0], at[0] + 0.3)).toFixed(3);
    ring.style.transform = now ? `translateX(${now * STEP}px)` : 'none';
    return pill(t, D.gen0, D.done, D.w1, GEN.slides);
  } };
}

// whether the spot's clock runs: the timeline says so (__AD.playing); failing that, it moved lately by about a frame's step
function makeClockRuns() {
  let lastT = null, movedAt = -1, lastStep = 0;
  return (t) => {
    const now = performance.now();
    if (lastT !== null && t !== lastT) { lastStep = t - lastT; movedAt = now; }
    lastT = t;
    const ad = window.__AD;
    const moving = now - movedAt < 400 && lastStep > 0 && lastStep < 0.2;
    return !document.body.classList.contains('freeze') && (ad && typeof ad.playing === 'boolean' ? ad.playing : moving);
  };
}

// the narration follows the clock: it plays while the clock runs through its window, at the clock's speed, and waits for
// a click or key when the browser holds sound back until a gesture. Its file loads on the route's first render
function makeVoice(V) {
  const audio = new Audio();
  audio.preload = 'auto';
  let blocked = false;
  const unblock = () => { blocked = false; };
  addEventListener('variantchange', () => audio.pause());
  // the gallery lightbox's nudge (a click in its chrome): the narration may try again
  addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unblock(); });
  return { audio, sync(t, running) {
    const at = t - V.play;
    if (!running || at < 0 || at >= Math.min(DUR, NARR_FOR + NARR_FADE)) { if (!audio.paused) audio.pause(); return; }
    audio.volume = Math.pow(0.01, seg(at, NARR_FOR, NARR_FOR + NARR_FADE));
    const rate = (window.__AD && window.__AD.speed) || 1;
    if (audio.playbackRate !== rate) audio.playbackRate = rate;
    if (Math.abs(audio.currentTime - at) > 0.3) audio.currentTime = at;
    if (audio.paused && !blocked) {
      audio.play().catch((e) => {
        blocked = true;
        console.warn('college: the narration waits for a click or key to play (autoplay policy)', e);
        addEventListener('pointerdown', unblock, { once: true });
        addEventListener('keydown', unblock, { once: true });
      });
    }
  } };
}

// 3. the talk-through: the deck on its stage under a skeleton while the voice clones and the narration renders, then the
// play strip presses into pause, the take's waveform uncovers to the playhead, the caption lights word by word and the
// slides turn on the words that name them
function buildTalk(x, V) {
  const block = x.el(`<div class="pd cr-talk">
    <div class="pd-head"><b>Narrated deck</b><span>In your voice</span>${shareBtn('Narrated sleep study deck', { file: VOICE })}${DECK_DL}${EXPAND}</div>
    ${stageHtml(genl('Cloning your voice'))}
    <div class="cr-pl"><span class="cr-btn">${PLAY}${PAUSE}</span><div class="cr-wave">${wave('cr-w0')}${wave('cr-w1')}</div><span class="cr-time">${clock(0)} / ${clock(DUR)}</span></div>
    <div class="cr-cap" aria-live="off"></div>
  </div>`);
  const $ = (s) => block.querySelector(s);
  const stageSh = $('.pd-stage > .pd-shm'), counter = $('.pd-nav em'), prev = $('.pd-prev'), next = $('.pd-next');
  const btn = $('.cr-btn'), time = $('.cr-time'), played = $('.cr-w1'), cap = $('.cr-cap'), strip = $('.cr-pl'), waveBox = $('.cr-wave');
  const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
  const stage = deckStage(block);
  const pill = genPill($('.pd-stage'), X.voice);
  const fit = deckFit(block);
  const turns = TURNS.map((w) => V.play + w);
  let sec = -1, cut = -1, playing = null, line = -1, lit = -1, cur = -1;
  return { node: block, render(t) {
    fit();
    enter(block, t, V.card);
    const land = landing(t, V.done);
    shimmer(stageSh.firstElementChild, t, V.card, 0, land);
    stageSh.style.opacity = (1 - land).toFixed(3);
    // the strip waits dim, its waveform drawn only once the narration it measures exists
    strip.style.opacity = lerp(0.4, 1, land).toFixed(3);
    waveBox.style.opacity = land.toFixed(3);
    const arrive = turns.map((a) => outCubic(seg(t, a, a + 0.32)));
    stage(t, land, arrive, [V.done, ...turns]);
    const idx = arrive[0] + arrive[1];
    const now = Math.round(idx);
    if (now !== cur) { counter.textContent = `${now + 1} / ${N}`; cur = now; }
    prev.style.opacity = lerp(0.4, 1, Math.min(1, idx)).toFixed(3);
    next.style.transform = `scale(${turns.reduce((s, a) => s * pressScale(t, a, 0.18), 1).toFixed(4)})`;
    const el = Math.min(DUR, Math.max(0, t - V.play));
    const s = Math.floor(el);
    if (s !== sec) { time.textContent = `${clock(s)} / ${clock(DUR)}`; sec = s; }
    const c = +((1 - el / DUR) * 100).toFixed(3);
    if (c !== cut) { played.style.clipPath = `inset(0 ${c}% 0 0)`; cut = c; }
    const press = seg(t, V.play - 0.12, V.play) * (1 - seg(t, V.play, V.play + 0.1));
    btn.style.transform = press > 0 ? `scale(${(1 - 0.12 * press).toFixed(4)})` : 'none';
    const on = t >= V.play;
    if (on !== playing) { playIcon.style.display = on ? 'none' : ''; pauseIcon.style.display = on ? '' : 'none'; playing = on; }
    let li = 0;
    while (li + 1 < LINES.length && el >= LINE_AT[li + 1]) li++;
    if (li !== line) { cap.innerHTML = LINE_WORDS[li].map((w) => `<span>${x.esc(w[0])}</span>`).join(' '); line = li; lit = -1; }
    const n = on ? LINE_WORDS[li].filter((w) => el >= w[1]).length : 0;
    if (n !== lit) { [...cap.children].forEach((w, i) => w.classList.toggle('on', i < n)); lit = n; }
    cap.style.opacity = seg(t, V.play - 0.2, V.play + 0.2).toFixed(3);
    return pill(t, V.gen0, V.done, V.w1, GEN.voice);
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet(CSS, 'own');
    loadSheet(DECK_CSS, 'deck');
    loadFrameSheet();
    const T = k.T;
    const [D, V] = T.steps;

    // 1. the calls, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const calls = buildCalls(x, T);
    // the feed glides to a zero-height anchor a little under each answer's card instead of the card's own bottom, so the
    // newest card clears the feed's clip with its edge and shadow (../college.057e3dda.css .cr-anchor)
    const anchor = () => x.el('<i class="cr-anchor" aria-hidden="true"></i>');
    const anchor1 = anchor();

    // 2-3: each ask's user bubble and its reply
    const follow = [];
    const steps = T.steps.map((st) => {
      const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(st.ask)}</div></div></div>`);
      const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
      const say = sayEl(x, st.say);
      reply.lastElementChild.append(say.n);
      follow.push(u, reply);
      return { st, u, reply, say };
    });
    const deck = buildDeck(x, D), talk = buildTalk(x, V);
    [deck, talk].forEach((b, i) => { const p = steps[i]; p.anchor = anchor(); p.reply.lastElementChild.append(b.node, p.anchor); });
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [calls.node, deck.node, talk.node]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup over the spot's black. It rides in nodes (so other variants hide it) and
    // moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="cr-end" role="img" aria-label="superbot.gg"><div class="cr-end-word"><b>superbot.gg</b></div><div class="cr-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.cr-end-word'), endBot = endCard.querySelector('.cr-end-bot');
    // the fast-forward badge over the whole frame's bottom right while any wait runs, naming that wait's rate
    const ff = x.el('<div class="cr-ff" aria-hidden="true"></div>');
    let endK = 1, ffText = '';

    const clockRuns = makeClockRuns();
    const voice = makeVoice(V);
    // QA: this route's narration element against the clock (__AD arrives after the timeline's first frame)
    const sound = () => ({ t: window.__AD.now, narration: { paused: voice.audio.paused, at: +voice.audio.currentTime.toFixed(3), volume: +voice.audio.volume.toFixed(3) } });
    let placed = false;
    return {
      nodes: [say1.n, calls.node, anchor1, ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, anchor1], ...steps.flatMap((p) => [[p.st.send, p.u], [p.st.r, p.say.n], [p.st.card, p.anchor]])],
      // the follow-up asks, typed into the composer and sent by the engine (renderComposer)
      asks: T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send })),
      chips: [],
      render(t) {
        if (!placed) {
          // the follow-ups leave the engine's reply for the feed, in order right after it
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          // the end card and the badge leave the hub for the scene section: stage px, unscaled by the hub's camera
          x.hub.closest('.scene').append(endCard, ff);
          voice.audio.src = VOICE;
          placed = true;
        }
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;

        say1.render(t, T.r);
        const wc = calls.render(t);
        for (const p of steps) {
          x.appear(p.u, t, p.st.send);
          x.appear(p.reply, t, p.st.r);
          p.say.render(t, p.st.r);
        }
        const wd = deck.render(t), wv = talk.render(t);
        voice.sync(t, clockRuns(t));

        // the frame's badge, while any of the three waits runs, at that wait's rate
        const w = Math.max(wc, wd, wv);
        const rate = wc >= wd && wc >= wv ? X.calls : wd >= wv ? X.slides : X.voice;
        if (`x${rate}` !== ffText) { ff.textContent = ffText = `x${rate}`; }
        fade(ff, w);

        // the end card: the chat fades to black, then the house card's own run
        const cover = seg(t, V.cut, V.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (V.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          // the house sizes on a 1080-high stage, scaled down (--k) only when a narrow ratio would crop the lockup
          const natW = endWord.offsetWidth / endK;
          const kk = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
          if (kk !== endK) { endCard.style.setProperty('--k', kk.toFixed(4)); endK = kk; }
          const bw = 220 * kk, wordW = natW * kk, gap = END_GAP * kk;
          const left = (W - (wordW + gap + bw)) / 2, midY = H / 2;
          const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - bw / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
};
