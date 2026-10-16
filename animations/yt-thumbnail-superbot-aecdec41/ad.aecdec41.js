// Click-to-play engine. Everything on screen is a function of t (seconds since the click) except the feed's
// push-up smoothing, which eases whatever height change layout produced. ?t=12.5 freezes a frame, ?cues=1 (or C)
// shows the voiceline teleprompter, ?name=Adrian personalises the greeting, ?rate=0.5 slows playback.
// Playback holds on the finished chat (the creator cuts to their own channel); the next click plays the end card.
import { T, VO, PRE, CREATOR, CAM, KEYS1, KEYS2, PROMPT1, PROMPT2, TEXT } from './beats.aecdec41.js';

const q = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const stage = $('#stage'), cam = $('#cam'), feed = $('#feed'), bar = $('#comp'), scrim = $('#scrim');
const greet = $('#greet'), links = $('#links'), endCard = $('#end'), gen = $('#gen'), img = $('#img');
const cursor = $('#cursor'), hint = $('#hint');
const typed = $('#c-typed'), placeholder = $('#c-ph'), caret = $('#caret'), send = $('#send');
const model = $('#model'), modelName = $('#m-name'), modelDial = $('#m-dial');
const cues = $('#cues'), cueNow = $('#cue-now'), cueNext = $('#cue-next'), cueT = $('#cue-t');
const endParts = { mark: $('.end-mark'), url: $('.end-url'), sub: $('.end-sub') };

// ---- the app's own marks (marks/mark-superbot-glitch.tsx, the composer's OpenAI tile) ---------------------------
const CAT_HEAD = 'M29 32H71A15 15 0 0 1 86 47V71A15 15 0 0 1 71 86H29A15 15 0 0 1 14 71V47A15 15 0 0 1 29 32ZM33 43.5H37A9.5 12.5 0 0 1 46.5 56V60A9.5 12.5 0 0 1 37 72.5H33A9.5 12.5 0 0 1 23.5 60V56A9.5 12.5 0 0 1 33 43.5ZM63 43.5H67A9.5 12.5 0 0 1 76.5 56V60A9.5 12.5 0 0 1 67 72.5H63A9.5 12.5 0 0 1 53.5 60V56A9.5 12.5 0 0 1 63 43.5Z';
const CAT_EARS = 'M14 46V28Q14 20 21 21Q28 24 36 32ZM86 46V28Q86 20 79 21Q72 24 64 32Z';
const catLayer = (fill, d) => `<g fill="${fill}" stroke="none" transform="translate(${d} ${d})"><path fill-rule="evenodd" d="${CAT_HEAD}"/><path d="${CAT_EARS}"/></g>`;
const CAT_MARK = `<svg viewBox="0 0 100 100" aria-hidden="true">${catLayer('#00e5c3', -1.2)}${catLayer('#c026d3', 1.2)}${catLayer('#ffffff', 0)}</svg>`;
const PETAL = 'M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z';
const KNOT = `<svg viewBox="0 0 2406 2406" aria-hidden="true"><g fill="currentColor" stroke="none">${[0, 60, 120, 180, 240, 300].map((a) => `<path d="${PETAL}" transform="rotate(${a} 1203 1203)"/>`).join('')}</g></svg>`;
$$('.gm').forEach((el) => (el.innerHTML = CAT_MARK));
$$('.knot').forEach((el) => (el.innerHTML = KNOT));

// greeting copy from packages/core/src/greeting: a time-band LEAD plus the first-open ASK
const hour = new Date().getHours();
const band = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 22 ? 'evening' : 'night';
const name = q.get('name');
const LEAD = {
  morning: name ? `Morning, ${name}.` : 'Good morning.',
  afternoon: name ? `Afternoon, ${name}.` : 'Good afternoon.',
  evening: name ? `Evening, ${name}.` : 'Good evening.',
  night: 'Quiet hours.',
};
$('#greet-text').textContent = `${LEAD[band]} What's first?`;

// ---- easing ----------------------------------------------------------------------------------------------------
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
// minimum-jerk profile (Flash & Hogan 1985): how a hand actually moves a mouse between two points
const minJerk = (p) => p * p * p * (10 - 15 * p + 6 * p * p);

// write a style or custom property only when it changes: untouched rows cost no style recalc
const setStyle = (el, prop, value) => {
  const cache = (el._sty ??= {});
  if (cache[prop] === value) return;
  cache[prop] = value;
  if (prop.startsWith('--')) el.style.setProperty(prop, value);
  else el.style[prop] = value;
};
const setText = (el, value) => {
  if (el._txt !== value) el.textContent = el._txt = value;
};
const setClass = (el, cls, on) => {
  const key = '_c_' + cls;
  if (el[key] !== on) el.classList.toggle(cls, (el[key] = on));
};

// ---- timed rows: data-in shows (rise 10px + fade, as ProviderSwitchBlock enters), data-out hides,
//      data-done flips spinner to check ------------------------------------------------------------------------
const timed = $$('[data-in]').map((el) => {
  const row = { el, tin: T[el.dataset.in], tout: el.dataset.out ? T[el.dataset.out] : Infinity, tdone: el.dataset.done ? T[el.dataset.done] : null };
  if (row.tin === undefined || row.tout === undefined || row.tdone === undefined) console.error('unknown beat on', el, el.dataset);
  return row;
});

function renderTimed(t) {
  for (const { el, tin, tout, tdone } of timed) {
    const on = t >= tin && t < tout;
    setStyle(el, 'display', on ? '' : 'none');
    if (on) {
      const p = easeOut(seg(t, tin, tin + 0.42));
      setStyle(el, 'opacity', p.toFixed(3));
      setStyle(el, 'transform', p < 1 ? `translateY(${((1 - p) * 10).toFixed(2)}px)` : '');
    }
    if (tdone !== null) setClass(el, 'done', t >= tdone);
  }
}

// assistant prose: character playout with the app's trailing typing caret; the unrevealed tail is laid out
// transparent so the paragraph's height never jumps while it streams
const says = $$('[data-say]').map((el) => {
  const text = TEXT[el.dataset.say];
  const shown = document.createElement('span');
  const tip = document.createElement('i');
  const hid = document.createElement('span');
  tip.className = 'say-caret';
  hid.style.color = 'transparent';
  el.replaceChildren(shown, tip, hid);
  return { text, shown, tip, hid, a: T[el.dataset.a], b: T[el.dataset.b] };
});

function renderSays(t) {
  for (const s of says) {
    const n = Math.floor(s.text.length * seg(t, s.a, s.b));
    setText(s.shown, s.text.slice(0, n));
    setText(s.hid, s.text.slice(n));
    setStyle(s.tip, 'display', t >= s.a && t < s.b + 0.2 ? '' : 'none');
  }
}

const turnClocks = $$('.turn-dur').map((el) => ({ el, from: T[el.dataset.from], to: T[el.dataset.to] }));
function renderTurnClocks(t) {
  for (const c of turnClocks) setText(c.el, ` · ${Math.max(0, Math.floor(Math.min(t, c.to) - c.from))}s`);
}

// ---- composer: the home (hero) bar docks under the transcript on the first send ---------------------------------
const HERO = { x: 144, y: 229, w: 832, h: 172, ctl: 32, gly: 16, fpy: 16, fpx: 12, cpt: 4, cpb: 8, disc: 0 };
const DOCK = { x: 192, y: 528, w: 736, h: 94, ctl: 28, gly: 12, fpy: 12, fpx: 8, cpt: 0, cpb: 0, disc: 1 };

const keysDown = (keys, t) => {
  let n = 0;
  while (n < keys.length && keys[n] <= t) n++;
  return n;
};

function composerText(t) {
  if (t >= T.type1 && t < T.send1) {
    const n = keysDown(KEYS1, t);
    return { text: PROMPT1.slice(0, n), lastKey: n ? KEYS1[n - 1] : -9 };
  }
  if (t >= T.type2 && t < T.send2) {
    const n = keysDown(KEYS2, t);
    return { text: PROMPT2.slice(0, n), lastKey: n ? KEYS2[n - 1] : -9 };
  }
  return { text: '', lastKey: -9 };
}

function renderComposer(t) {
  const k = easeInOut(seg(t, T.send1, T.docked));
  for (const key of ['x', 'y', 'w', 'h']) {
    const prop = { x: 'left', y: 'top', w: 'width', h: 'height' }[key];
    setStyle(bar, prop, lerp(HERO[key], DOCK[key], k).toFixed(2) + 'px');
  }
  for (const key of ['ctl', 'gly', 'fpy', 'fpx', 'cpt', 'cpb']) setStyle(bar, '--' + key, lerp(HERO[key], DOCK[key], k).toFixed(2) + 'px');
  setStyle(bar, '--disc', lerp(HERO.disc, DOCK.disc, k).toFixed(3));

  // at rest a 40% scrim dims the whole bar; focusing it lifts the scrim over 450ms
  const focused = t >= T.click1;
  setStyle(scrim, 'opacity', (1 - easeOut(seg(t, T.click1, T.click1 + 0.45))).toFixed(3));

  const { text, lastKey } = composerText(t);
  setText(typed, text);
  setStyle(placeholder, 'display', text ? 'none' : '');
  const blinkOn = t - lastKey < 0.5 || Math.floor((t - lastKey) * 1.9) % 2 === 0;
  setStyle(caret, 'visibility', focused && blinkOn ? 'visible' : 'hidden');

  const live = (t >= T.send1 && t < T.turn1End) || (t >= T.send2 && t < T.turn2End);
  setClass(send, 'hero', t < T.send1);
  setClass(send, 'live', live);
  setClass(send, 'lit', !live && t >= T.send1 && text.length > 0);

  const fade = 1 - easeOut(seg(t, T.send1, T.send1 + 0.22));
  setStyle(greet, 'opacity', fade.toFixed(3));
  setStyle(greet, 'transform', `translateY(${(-10 * (1 - fade)).toFixed(2)}px)`);
  setStyle(links, 'opacity', fade.toFixed(3));
  setStyle(links, 'transform', `translateY(${(8 * (1 - fade)).toFixed(2)}px)`);
  setStyle(greet, 'visibility', fade > 0 ? 'visible' : 'hidden');
  setStyle(links, 'visibility', fade > 0 ? 'visible' : 'hidden');

  // Auto routes to the ChatGPT subscription: the model pill takes the picked model and its vendor tile
  const routed = t >= T.sw1Done;
  setClass(model, 'oa', routed);
  setText(modelName, routed ? 'GPT-5.6 Sol' : 'superbot');
  setText(modelDial, routed ? 'High, 200K' : 'High, 1M');
  setStyle(model, 'opacity', (routed ? 0.35 + 0.65 * easeOut(seg(t, T.sw1Done, T.sw1Done + 0.3)) : 1).toFixed(3));
}

// new feed rows push the column up smoothly: absorb each height change as an offset, then let it decay
let feedPrevH = 0;
let feedOffset = 0;
function smoothFeed(dt, snap) {
  const h = feed.offsetHeight;
  feedOffset = snap ? 0 : (feedOffset + h - feedPrevH) * Math.exp(-dt * 9);
  if (Math.abs(feedOffset) < 0.05) feedOffset = 0;
  feedPrevH = h;
  setStyle(feed, 'transform', feedOffset ? `translateY(${feedOffset.toFixed(2)}px)` : '');
}

// ---- end card --------------------------------------------------------------------------------------------------
function renderEnd(t) {
  setStyle(endCard, 'opacity', seg(t, T.end, T.end + 0.6).toFixed(3));
  if (t < T.end) return;
  const m = easeOut(seg(t, T.end + 0.1, T.end + 0.8));
  setStyle(endParts.mark, 'transform', `scale(${(0.85 + 0.15 * m).toFixed(4)})`);
  setStyle(endParts.mark, 'opacity', m.toFixed(3));
  const u = easeOut(seg(t, T.end + 0.3, T.end + 0.9));
  setStyle(endParts.url, 'opacity', u.toFixed(3));
  setStyle(endParts.url, 'transform', `translateY(${((1 - u) * 24).toFixed(2)}px)`);
  setStyle(endParts.sub, 'opacity', easeOut(seg(t, T.end + 0.7, T.end + 1.2)).toFixed(3));
  setStyle(endParts.sub, '--bob', (Math.sin(t * 4) * 5).toFixed(2) + 'px');
}

function camScale(t) {
  for (let i = 1; i < CAM.length; i++) {
    const [t0, s0] = CAM[i - 1];
    const [t1, s1] = CAM[i];
    if (t < t1) return s0 + (s1 - s0) * easeInOut(seg(t, t0, t1));
  }
  return CAM[CAM.length - 1][1];
}

// ---- scripted pointer ------------------------------------------------------------------------------------------
let stageScale = 1;
const at = (el, fx, fy) => () => {
  const r = el.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  return { x: (r.left + r.width * fx - sr.left) / stageScale, y: (r.top + r.height * fy - sr.top) / stageScale };
};
const fixed = (x, y) => () => ({ x, y });

const MOVES = [
  { a: T.move1, b: T.click1, to: at(bar, 0.3, 0.2) },
  { a: T.aside1, b: T.aside1 + 0.9, to: fixed(1600, 560) },
  { a: T.movePick, b: T.hoverPick, to: at(img, 0.62, 0.5) },
  { a: T.move2, b: T.click2, to: at(bar, 0.36, 0.27) },
  { a: T.aside2, b: T.aside2 + 0.9, to: fixed(1610, 520) },
];
const restAt = new Array(MOVES.length).fill(null);
let cursorStart = { x: 1320, y: 780 };

function arc(a, b, p) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
  const bow = Math.min(60, d * 0.1) * Math.sin(Math.PI * p);
  return { x: a.x + dx * p - (dy / d) * bow, y: a.y + dy * p + (dx / d) * bow };
}

function cursorAt(t) {
  let p = cursorStart;
  for (let i = 0; i < MOVES.length; i++) {
    const m = MOVES[i];
    if (t < m.a) break;
    if (t < m.b) return arc(p, m.to(), minJerk((t - m.a) / (m.b - m.a)));
    restAt[i] ??= m.to();
    p = restAt[i];
  }
  return p;
}

function renderCursor(t, idle) {
  // macOS hides the pointer while you type, until the mouse moves again
  const typing = (t >= T.type1 && t < T.aside1) || (t >= T.type2 && t < T.aside2);
  const visible = idle || typing ? 0 : 1 - seg(t, T.end, T.end + 0.3);
  const p = cursorAt(t);
  setStyle(cursor, 'opacity', String(visible));
  setStyle(cursor, 'transform', `translate(${(p.x - 7).toFixed(2)}px, ${(p.y - 3.5).toFixed(2)}px)`);
}

// ---- teleprompter ----------------------------------------------------------------------------------------------
let cuesOn = q.get('cues') === '1';
function renderCues(t, idle) {
  cues.hidden = !cuesOn;
  if (!cuesOn) return;
  setText(cueT, idle ? 'before the click' : `t = ${t.toFixed(1)}s`);
  if (idle) {
    setText(cueNow, PRE.join('\n'));
    setText(cueNext, 'then click');
    return;
  }
  if (state === 'held') {
    setText(cueNow, `your channel footage: ${CREATOR.join(' ')}`);
    setText(cueNext, 'then click for the end card');
    return;
  }
  const now = VO.filter((v) => t >= v.t - 0.15 && t < v.t + v.dur + 0.5).pop();
  const next = VO.find((v) => v.t > t + 0.15);
  setText(cueNow, now ? now.text : '…');
  setText(cueNext, next ? `next in ${(next.t - t).toFixed(1)}s: ${next.text}` : '');
}

// ---- clock -----------------------------------------------------------------------------------------------------
const rate = Number(q.get('rate')) || 1;
let state = 'idle'; // idle | playing | paused | held (on the finished chat) | ended
let t = 0;
let jumped = true;
let lastNow = performance.now();
const loadedAt = lastNow;

if (q.has('t')) {
  state = 'paused';
  t = Number(q.get('t'));
} else if (q.has('autoplay')) {
  state = 'playing';
}

function render(t, dt, snap) {
  const idle = state === 'idle';
  setStyle(stage, '--sh', (100 - ((t * 0.75) % 1) * 100).toFixed(1) + '%');
  setStyle(stage, '--rot', ((t * 360) % 360).toFixed(1) + 'deg');
  setStyle(gen, '--gb', (100 - (((t - T.gen) * 0.6) % 1) * 100).toFixed(1) + '%');
  setStyle(cam, 'transform', `scale(${camScale(t).toFixed(4)})`);
  renderTimed(t);
  renderSays(t);
  renderTurnClocks(t);
  renderComposer(t);
  smoothFeed(dt, snap);
  renderEnd(t);
  renderCursor(t, idle);
  renderCues(t, idle);
  setStyle(hint, 'opacity', idle && performance.now() - loadedAt < 4000 && !q.has('clean') ? '1' : '0');
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (state === 'playing') {
    const next = t + dt * rate;
    if (t < T.done && next >= T.done) {
      t = T.done;
      state = 'held';
    } else if (next >= T.fin) {
      t = T.fin;
      state = 'ended';
    } else {
      t = next;
    }
  }
  render(t, dt, jumped || state !== 'playing');
  jumped = false;
  requestAnimationFrame(frame);
}

function jump() {
  jumped = true;
  restAt.fill(null);
}

function start(evt) {
  if (evt) {
    const sr = stage.getBoundingClientRect();
    cursorStart = { x: (evt.clientX - sr.left) / stageScale, y: (evt.clientY - sr.top) / stageScale };
  }
  t = 0;
  jump();
  state = 'playing';
  document.body.classList.add('playing');
}

function reset() {
  state = 'idle';
  t = 0;
  jump();
  document.body.classList.remove('playing');
}

addEventListener('pointerdown', (e) => {
  if (state === 'idle') start(e);
  else if (state === 'held') state = 'playing';
});

addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state === 'idle') start(null);
    else if (state === 'playing') state = 'paused';
    else if (state === 'paused' || state === 'held') state = 'playing';
  } else if (e.key === 'r' || e.key === 'R') {
    reset();
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && state !== 'idle') {
    t = Math.max(0, Math.min(T.fin, t + (e.key === 'ArrowRight' ? 2 : -2)));
    state = 'paused';
    jump();
  } else if (e.key === 'c' || e.key === 'C') {
    cuesOn = !cuesOn;
  }
});

function fit() {
  stageScale = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${stageScale})`;
}
addEventListener('resize', () => {
  fit();
  jump();
});
fit();

// cue sheet for rehearsal, and a handle for headless checks
console.table(VO.map((v) => ({ line: v.id, start: +v.t.toFixed(2), end: +(v.t + v.dur).toFixed(2), text: v.text })));
window.__ad = {
  T, VO, KEYS1, KEYS2,
  get t() { return t; },
  get state() { return state; },
  seek(x) { t = x; state = 'paused'; document.body.classList.add('playing'); jump(); },
  play() { state = 'playing'; },
};

// start the clock only once the bundled Inter faces are in, so the first frames never reflow
document.fonts.ready.then(() => requestAnimationFrame(frame));
