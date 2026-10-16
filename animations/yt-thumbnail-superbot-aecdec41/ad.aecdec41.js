// Click-to-play engine. Everything on screen is a function of t (seconds since the click) except the feed's
// push-up smoothing, which eases whatever height change layout produced. ?t=12.5 freezes a frame, ?cues=1 (or C)
// shows the voiceline teleprompter, ?channel=Name&handle=@x personalises the channel, ?rate=0.5 slows playback.
import { T, VO, PRE, CAM, KEYS1, KEYS2, PROMPT1, PROMPT2 } from './beats.aecdec41.js';

const q = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const stage = $('#stage'), cam = $('#cam'), feed = $('#feed'), comp = $('#comp');
const greet = $('#greet'), subs = $('#subs'), studio = $('#studio'), endCard = $('#end');
const cursor = $('#cursor'), ripple = $('#ripple'), hint = $('#hint');
const typed = $('#c-typed'), placeholder = $('#c-ph'), caret = $('#caret'), attach = $('#c-att'), send = $('#send');
const model = $('#model'), modelName = $('#m-name'), ytApp = $('#c-yt');
const tiles = [0, 1, 2].map((i) => $('#gt' + i));
const upFill = $('#up-fill'), upPct = $('#up-pct');
const btnStudio = $('#btn-studio'), tcRing = $('#tc-ring'), tcB = $('#tc-b'), tcDot = $('.tc-st i');
const cues = $('#cues'), cueNow = $('#cue-now'), cueNext = $('#cue-next'), cueT = $('#cue-t');
const keyFrames = $$('.kf');
const endParts = { mark: $('#end .mark'), url: $('.end-url'), sub: $('.end-sub') };

const COMPOSER_IDLE_LIFT = 295; // logical px between the idle spot (under the greeting) and the docked spot
const CLICKS = [T.click1, T.clickPick, T.click2, T.click3];

// ---- personalisation -------------------------------------------------------------------------------------------
const channel = q.get('channel') || 'My Channel';
const handle = q.get('handle') || '@' + channel.toLowerCase().replace(/[^a-z0-9]/g, '');
$$('[data-ch=name]').forEach((el) => (el.textContent = channel));
$$('[data-ch=handle]').forEach((el) => (el.textContent = handle));
$$('[data-ch=initial]').forEach((el) => (el.textContent = channel.trim()[0].toUpperCase()));
const hour = new Date().getHours();
$('#greet-text').textContent = `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}. Where do we go?`;

// ---- easing ----------------------------------------------------------------------------------------------------
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const bump = (t, at, half) => clamp01(1 - Math.abs(t - at) / half);

// ---- timed elements: data-in shows, data-done flips spinner to check --------------------------------------------
const timed = $$('[data-in]').map((el) => {
  const tin = T[el.dataset.in];
  const tdone = el.dataset.done ? T[el.dataset.done] : null;
  if (tin === undefined || tdone === undefined) console.error('unknown beat on', el, el.dataset);
  return { el, tin, tdone };
});

function renderTimed(t) {
  for (const { el, tin, tdone } of timed) {
    const on = t >= tin;
    el.style.display = on ? '' : 'none';
    if (on) {
      const p = easeOut(seg(t, tin, tin + 0.32));
      el.style.opacity = p;
      el.style.transform = p < 1 ? `translateY(${(1 - p) * 8}px)` : '';
    }
    if (tdone !== null) el.classList.toggle('done', t >= tdone);
  }
}

// assistant text streams word by word; the unrevealed tail is laid out transparent so the height never jumps
const says = $$('.say').map((el) => {
  const text = el.textContent.trim();
  const shown = document.createElement('span');
  const hid = document.createElement('span');
  hid.className = 'hid';
  el.replaceChildren(shown, hid);
  return { text, shown, hid, a: T[el.dataset.a], b: T[el.dataset.b], n: -1 };
});

function renderSays(t) {
  for (const s of says) {
    let n = Math.round(s.text.length * seg(t, s.a, s.b));
    if (n < s.text.length) n = Math.max(0, s.text.lastIndexOf(' ', n));
    if (n === s.n) continue;
    s.n = n;
    s.shown.textContent = s.text.slice(0, n);
    s.hid.textContent = s.text.slice(n);
  }
}

// ---- composer --------------------------------------------------------------------------------------------------
const keysDown = (keys, t) => {
  let n = 0;
  while (n < keys.length && keys[n] <= t) n++;
  return n;
};

function composerState(t) {
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
  const { text, lastKey } = composerState(t);
  const focused = (t >= T.click1 && t < T.send1) || (t >= T.click2 && t < T.send2);
  const hasAttach = t >= T.attach && t < T.send2;
  if (typed.textContent !== text) typed.textContent = text;
  placeholder.style.display = text || hasAttach || focused ? 'none' : '';
  attach.style.display = hasAttach ? '' : 'none';
  attach.style.opacity = easeOut(seg(t, T.attach, T.attach + 0.25));
  caret.style.visibility = focused && (t - lastKey < 0.45 || Math.floor(t * 1.9) % 2 === 0) ? 'visible' : 'hidden';
  comp.classList.toggle('focus', focused);
  send.classList.toggle('lit', text.length > 0);
  send.style.transform = `scale(${1 - 0.14 * Math.max(bump(t, T.send1, 0.12), bump(t, T.send2, 0.12))})`;

  const dock = easeInOut(seg(t, T.send1, T.send1 + 0.6));
  comp.style.transform = `translateY(${-COMPOSER_IDLE_LIFT * (1 - dock)}px)`;
  const fade = 1 - seg(t, T.send1, T.send1 + 0.35);
  greet.style.opacity = subs.style.opacity = fade;
  greet.style.transform = subs.style.transform = `translateY(${-14 * (1 - fade)}px)`;

  const name = t < T.sw1Done ? 'Auto' : t < T.sw2Done ? 'ChatGPT' : t < T.send2 ? 'GPT Image 2' : 'ChatGPT';
  if (modelName.textContent !== name) modelName.textContent = name;
  model.classList.toggle('oa', t >= T.sw1Done);
  const modelPop = Math.max(bump(t, T.sw1Done + 0.1, 0.18), bump(t, T.sw2Done + 0.1, 0.18), bump(t, T.send2 + 0.1, 0.18));
  model.style.transform = `scale(${1 + 0.12 * modelPop})`;

  ytApp.style.display = t >= T.ytDone ? '' : 'none';
  ytApp.style.transform = `scale(${easeOut(seg(t, T.ytDone, T.ytDone + 0.3)) + 0.25 * bump(t, T.ytDone + 0.3, 0.2)})`;
}

// ---- feed contents with their own clocks -----------------------------------------------------------------------
function renderFeedDetails(t) {
  keyFrames.forEach((kf, i) => kf.classList.toggle('on', t >= T.tool2 + 0.3 * (i + 1)));

  tiles.forEach((tile, i) => {
    const r = T.reveal[i];
    const gen = seg(t, T.gen, r);
    const rev = easeOut(seg(t, r, r + 0.6));
    const blur = t < r ? 24 - 14 * gen : 10 * (1 - rev);
    tile.style.setProperty('--blur', blur.toFixed(2) + 'px');
    tile.style.setProperty('--sat', (0.5 + 0.5 * rev).toFixed(3));
    tile.style.setProperty('--bri', (t < r ? 0.35 + 0.25 * gen : 0.6 + 0.4 * rev).toFixed(3));
    tile.style.setProperty('--bx', (-60 + 120 * (((t - T.gen) * 0.75 + i * 0.22) % 1)).toFixed(1) + '%');
    tile.style.setProperty('--bo', (1 - seg(t, r, r + 0.35)).toFixed(3));
    const gl = tile.querySelector('.gl');
    gl.style.opacity = 1 - seg(t, r, r + 0.3);
    gl.querySelector('.gl-p').textContent = Math.min(100, Math.floor(100 * (1 - Math.pow(1 - gen, 1.6)))) + '%';
    const isPick = i === 1;
    tile.classList.toggle('hover', isPick && t >= T.hoverPick && t < T.move2);
    tile.classList.toggle('picked', isPick && t >= T.clickPick);
    tile.style.opacity = isPick ? 1 : 1 - 0.5 * seg(t, T.clickPick, T.clickPick + 0.3);
  });

  const up = easeInOut(seg(t, T.up + 0.15, T.upDone - 0.1));
  upFill.style.width = (up * 100).toFixed(1) + '%';
  upPct.textContent = Math.round(up * 100) + '%';

  btnStudio.classList.toggle('hover', t >= T.click3 - 0.3 && t < T.studio + 0.2);
}

// new feed rows push the column up smoothly: absorb each height change as an offset, then let it decay
let feedPrevH = 0;
let feedOffset = 0;
function smoothFeed(dt, snap) {
  const h = feed.offsetHeight;
  feedOffset = snap ? 0 : (feedOffset + h - feedPrevH) * Math.exp(-dt * 11);
  if (Math.abs(feedOffset) < 0.05) feedOffset = 0;
  feedPrevH = h;
  feed.style.transform = feedOffset ? `translateY(${feedOffset.toFixed(2)}px)` : '';
}

// ---- studio + end card -----------------------------------------------------------------------------------------
function renderStudio(t) {
  if (t < T.studio) {
    studio.style.display = 'none';
    return;
  }
  const k = easeOut(seg(t, T.studio, T.studioIn));
  const s = 0.94 + 0.06 * k;
  studio.style.display = 'block';
  studio.style.opacity = k;
  studio.style.transform = `scale(1.6) translate(${(1 - s) * 600}px, ${(1 - s) * 337.5 + (1 - k) * 12}px) scale(${s})`;
  tcRing.style.opacity = (seg(t, T.ring, T.ring + 0.35) * (0.7 + 0.3 * Math.cos((t - T.ring) * 4))).toFixed(3);
  tcB.classList.toggle('hover', t >= T.move4 + 0.75);
  tcDot.style.setProperty('--pulse', (((t * 1.2) % 1) * 6).toFixed(2) + 'px');
}

function renderEnd(t) {
  endCard.style.opacity = seg(t, T.end, T.end + 0.6);
  const m = easeOut(seg(t, T.end + 0.1, T.end + 0.8));
  endParts.mark.style.transform = `scale(${0.85 + 0.15 * m})`;
  endParts.mark.style.opacity = m;
  const u = easeOut(seg(t, T.end + 0.3, T.end + 0.9));
  endParts.url.style.opacity = u;
  endParts.url.style.transform = `translateY(${(1 - u) * 24}px)`;
  endParts.sub.style.opacity = easeOut(seg(t, T.end + 0.7, T.end + 1.2));
  endParts.sub.style.setProperty('--bob', (Math.sin(t * 4) * 5).toFixed(2) + 'px');
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
  { a: T.move1, b: T.click1, to: at(comp, 0.3, 0.28) },
  { a: T.aside1, b: T.aside1 + 0.9, to: fixed(1530, 610) },
  { a: T.movePick, b: T.hoverPick, to: at(tiles[1], 0.56, 0.55) },
  { a: T.move2, b: T.click2, to: at(comp, 0.36, 0.28) },
  { a: T.aside2, b: T.aside2 + 0.9, to: fixed(1540, 560) },
  { a: T.move3, b: T.click3 - 0.05, to: at(btnStudio, 0.45, 0.55) },
  { a: T.move4, b: T.move4 + 0.8, to: at(tcB, 0.5, 0.4) },
];
const restAt = new Array(MOVES.length).fill(null);
let cursorStart = { x: 1320, y: 780 };

function arc(a, b, p) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
  const bow = Math.min(70, d * 0.12) * Math.sin(Math.PI * p);
  return { x: a.x + dx * p - (dy / d) * bow, y: a.y + dy * p + (dx / d) * bow };
}

function cursorAt(t) {
  let p = cursorStart;
  for (let i = 0; i < MOVES.length; i++) {
    const m = MOVES[i];
    if (t < m.a) break;
    if (t < m.b) return arc(p, m.to(), easeInOut((t - m.a) / (m.b - m.a)));
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
  const press = Math.max(...CLICKS.map((c) => bump(t, c, 0.09)));
  cursor.style.opacity = visible;
  cursor.style.transform = `translate(${(p.x - 7).toFixed(1)}px, ${(p.y - 3.5).toFixed(1)}px) scale(${1 - 0.16 * press})`;

  const since = Math.min(...CLICKS.map((c) => (t >= c ? t - c : 99)));
  const r = seg(since, 0, 0.45);
  ripple.style.opacity = !idle && since < 0.45 ? (0.6 * (1 - r)).toFixed(3) : 0;
  ripple.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) scale(${0.3 + 0.7 * easeOut(r)})`;
}

// ---- teleprompter ----------------------------------------------------------------------------------------------
let cuesOn = q.get('cues') === '1';
function renderCues(t, idle) {
  cues.hidden = !cuesOn;
  if (!cuesOn) return;
  cueT.textContent = idle ? 'before the click' : `t = ${t.toFixed(1)}s`;
  if (idle) {
    cueNow.textContent = PRE.join('\n');
    cueNext.textContent = 'then click';
    return;
  }
  const now = VO.filter((v) => t >= v.t - 0.15 && t < v.t + v.dur + 0.5).pop();
  const next = VO.find((v) => v.t > t + 0.15);
  cueNow.textContent = now ? now.text : '…';
  cueNext.textContent = next ? `next in ${(next.t - t).toFixed(1)}s: ${next.text}` : '';
}

// ---- clock -----------------------------------------------------------------------------------------------------
const rate = Number(q.get('rate')) || 1;
let state = 'idle'; // idle | playing | paused | ended
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
  stage.style.setProperty('--sh', (100 - ((t * 0.75) % 1) * 100).toFixed(1) + '%');
  stage.style.setProperty('--rot', ((t * 400) % 360).toFixed(1) + 'deg');
  cam.style.transform = `scale(${camScale(t).toFixed(4)})`;
  renderTimed(t);
  renderSays(t);
  renderComposer(t);
  renderFeedDetails(t);
  smoothFeed(dt, snap);
  renderStudio(t);
  renderEnd(t);
  renderCursor(t, idle);
  renderCues(t, idle);
  hint.style.opacity = idle && performance.now() - loadedAt < 4000 && !q.has('clean') ? 1 : 0;
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (state === 'playing') {
    t += dt * rate;
    if (t >= T.done) {
      t = T.done;
      state = 'ended';
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
});

addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state === 'idle') start(null);
    else if (state === 'playing') state = 'paused';
    else if (state === 'paused') state = 'playing';
  } else if (e.key === 'r' || e.key === 'R') {
    reset();
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && state !== 'idle') {
    t = Math.max(0, Math.min(T.done, t + (e.key === 'ArrowRight' ? 2 : -2)));
    if (state === 'ended' && t < T.done) state = 'paused';
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

requestAnimationFrame(frame);
