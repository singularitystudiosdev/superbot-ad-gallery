// Click-to-play engine. Everything on screen is a function of t (seconds since the click) except the feed's
// push-up smoothing, which eases whatever height change layout produced. ?t=12.5 freezes a frame, ?cues=1 (or C)
// shows the voiceline teleprompter, ?name=Adrian personalises the greeting, ?rate=0.5 slows playback.
// Playback holds on the finished chat (the creator cuts to their own channel); the next click plays the end card.
import { T, VO, PRE, CREATOR, KEYS1, KEYS2, PROMPT1, PROMPT2, TEXT } from './beats.aecdec41.js?v=14';

const q = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const stage = $('#stage'), feed = $('#feed'), bar = $('#comp'), scrim = $('#scrim');
const greet = $('#greet'), links = $('#links'), endCard = $('#end'), gen = $('#gen');
const hint = $('#hint');
const typed = $('#c-typed'), placeholder = $('#c-ph'), caret = $('#caret'), send = $('#send');
const model = $('#model'), modelName = $('#m-name'), modelDial = $('#m-dial');
const cues = $('#cues'), cueNow = $('#cue-now'), cueNext = $('#cue-next'), cueT = $('#cue-t');
const endParts = { mark: $('.end-mark'), url: $('.end-url'), sub: $('.end-sub') };

// ---- marks: the mascot every superbot-ad-gallery-real-ui ad ships (app/mascot.svg, oval eyes), and the
//      composer's OpenAI tile --------------------------------------------------------------------------------------
const CAT_HEAD = 'M29 32H71A15 15 0 0 1 86 47V71A15 15 0 0 1 71 86H29A15 15 0 0 1 14 71V47A15 15 0 0 1 29 32ZZM35 47a8 11 0 1 0 0 22a8 11 0 1 0 0-22ZM65 47a8 11 0 1 0 0 22a8 11 0 1 0 0-22Z';
const CAT_EARS = 'M14 46V28Q14 20 21 21Q28 24 36 32ZM86 46V28Q86 20 79 21Q72 24 64 32Z';
const catLayer = (fill, d) => `<g fill="${fill}" stroke="none" transform="translate(${d} ${d})"><path fill-rule="evenodd" d="${CAT_HEAD}"/><path d="${CAT_EARS}"/></g>`;
const CAT_MARK = `<svg viewBox="12.8 19.3 74.4 67.9" aria-hidden="true">${catLayer('#00e5c3', -1.2)}${catLayer('#c026d3', 1.2)}${catLayer('#ffffff', 0)}</svg>`;
// the big marks are superbot.gg's live mascot: breathing, drifting ghosts, ear twitches, blinks, eyes on the pointer
window.sbMarkLive('#hero-mark', { size: 63, interactive: true });
window.sbMarkLive('#end-mark', { size: 150, interactive: false });
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


let stageScale = 1;

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
// t is read off the wall clock (anchorT + elapsed since anchorWall), never summed from frame deltas: a throttled
// pane or background window that delivers ~1 frame/s must still play the ad in real time
let anchorWall = lastNow;
let anchorT = 0;
function setState(next) {
  state = next;
  anchorWall = performance.now();
  anchorT = t;
}

if (q.has('t')) {
  t = Number(q.get('t'));
  setState('paused');
} else if (q.has('autoplay')) {
  setState('playing');
}

function render(t, dt, snap) {
  const idle = state === 'idle';
  setStyle(stage, '--sh', (100 - ((t * 0.75) % 1) * 100).toFixed(1) + '%');
  setStyle(stage, '--rot', ((t * 360) % 360).toFixed(1) + 'deg');
  setStyle(gen, '--gb', (100 - (((t - T.gen) * 0.6) % 1) * 100).toFixed(1) + '%');
  renderTimed(t);
  renderSays(t);
  renderComposer(t);
  smoothFeed(dt, snap);
  renderEnd(t);
  renderCues(t, idle);
  setStyle(hint, 'opacity', idle && performance.now() - loadedAt < 4000 && !q.has('clean') ? '1' : '0');
}

function tick(now) {
  const dt = Math.min(0.1, Math.max(0, now - lastNow) / 1000);
  lastNow = now;
  if (state === 'playing') {
    const next = anchorT + (Math.max(0, now - anchorWall) / 1000) * rate;
    if (t < T.done && next >= T.done) {
      t = T.done;
      setState('held');
    } else if (next >= T.fin) {
      t = T.fin;
      setState('ended');
    } else {
      t = next;
    }
  }
  // a starved frame (>=100 ms) snaps the feed instead of easing it from a stale position
  render(t, dt, jumped || state !== 'playing' || dt >= 0.1);
  jumped = false;
}
function frame(now) {
  tick(now);
  requestAnimationFrame(frame);
}
// panes that starve requestAnimationFrame (an unfocused preview, an occluded window) still get ~30 redraws a
// second from a timer, so the typing moves smoothly instead of in once-a-second jumps
setInterval(() => {
  const now = performance.now();
  if (now - lastNow > 50) tick(now);
}, 33);

function jump() {
  jumped = true;
}

function start() {
  t = 0;
  jump();
  setState('playing');
  document.body.classList.add('playing');
}

function reset() {
  t = 0;
  setState('idle');
  jump();
  document.body.classList.remove('playing');
}

addEventListener('pointerdown', () => {
  if (state === 'idle') start();
  else if (state === 'held') setState('playing');
});

addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state === 'idle') start();
    else if (state === 'playing') setState('paused');
    else if (state === 'paused' || state === 'held') setState('playing');
  } else if (e.key === 'r' || e.key === 'R') {
    reset();
  } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && state !== 'idle') {
    t = Math.max(0, Math.min(T.fin, t + (e.key === 'ArrowRight' ? 2 : -2)));
    setState('paused');
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
  seek(x) { t = x; setState('paused'); document.body.classList.add('playing'); jump(); },
  play() { setState('playing'); },
};

// start the clock only once the bundled Inter faces are in, so the first frames never reflow
document.fonts.ready.then(() => requestAnimationFrame(frame));
