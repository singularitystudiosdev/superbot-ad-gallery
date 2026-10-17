// A variant's soundtrack: one AudioBuffer holding the spot's whole audio from t = 0 (the multicat score,
// multicat-score.d9e95fc7.js, renders it with the song mixed in), played on the spot's clock (timeline.9b47fc30.js __AD)
// through one master gain, with the two controls sound needs on the web:
//   - a "Play with sound" gate, bottom left, while the browser holds audio back for a gesture; it unlocks the audio and
//     replays the spot from the top. Any click or key unlocks it too, without the replay.
//   - a Sound pill under the Speed pill (and the M key) that mutes and unmutes; the choice is kept in localStorage.
// The audio follows the clock and never drives it: a pause, a step or a frozen ?t= capture silences it, a seek, a restart
// or a drift past DRIFT restarts it at the clock's time, the clock's speed sets its playback rate (tape speed: the pitch
// moves with it), and the run's natural end lets the end card's ring play out. ?gain= (0 to 1.5) sets the master level.
// Controls show only while the current variant has a soundtrack, and never on a frozen capture (body.freeze).
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js';

const CSS = new URL('../soundtrack.d9e95fc7.css', import.meta.url).href;
const MUTED_KEY = 'spot-sound-muted';
const PICK = 'v4'; // its id on the Music pill (music.47e5d94a.js): it plays, and shows its pill, only while picked
const LEVEL = (() => {
  const g = parseFloat(new URLSearchParams(location.search).get('gain'));
  return Number.isFinite(g) ? Math.min(1.5, Math.max(0, g)) : 0.9;
})();
const DRIFT = 0.08; // seconds the audio may stray from the clock before it is restarted on it
// seconds a context runs before a first voice starts: a fresh context reports its output latency only once it has run, and a
// voice started on the old figure would sound that much late
const WARM = 0.15;
const SPEAKER = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
const ON_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true">${SPEAKER}<path fill="none" d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>`;
const OFF_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true">${SPEAKER}<path fill="none" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>`;

const tracks = new Map();
let ctx = null, master = null, ui = null;
let muted = readMuted();

function readMuted() {
  try { return localStorage.getItem(MUTED_KEY) === '1'; }
  catch (e) { console.warn('soundtrack: localStorage is unavailable, so mute is not remembered', e); return false; }
}
const frozen = () => document.body.classList.contains('freeze');
const running = () => !!ctx && ctx.state === 'running';
// the current variant has a soundtrack here, and it is the Music pill's pick
const scored = () => tracks.has(variant()) && music() === PICK;

// whether audio may start without a gesture: the autoplay policy where the browser says, else a gesture already made.
// The context is never made before then, so a page nobody touched logs no autoplay warning.
function allowed() {
  if (typeof navigator.getAutoplayPolicy === 'function') return navigator.getAutoplayPolicy('audiocontext') === 'allowed';
  return !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
}

// make the context, or wake it; called from a gesture (or at load when no gesture is needed)
function unlock() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : LEVEL;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', refresh);
  }
  if (ctx.state === 'suspended') ctx.resume().catch((e) => console.error(new Error('soundtrack: the audio context would not resume'), e));
  refresh();
}

function setMuted(on) {
  muted = on;
  try { localStorage.setItem(MUTED_KEY, on ? '1' : '0'); }
  catch (e) { console.warn('soundtrack: localStorage is unavailable, so mute is not remembered', e); }
  if (master) master.gain.setTargetAtTime(on ? 0 : LEVEL, ctx.currentTime, 0.015);
  refresh();
}

function start(tr, off, rate, lat) {
  const now = ctx.currentTime, src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = tr.buffer;
  src.playbackRate.value = rate;
  // a 12 ms fade in, so a start mid-buffer never clicks
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(1, now + 0.012);
  src.connect(g).connect(master);
  src.start(now, off);
  const v = { src, g, at: now, off, rate, lat };
  src.onended = () => { src.disconnect(); g.disconnect(); if (tr.voice === v) tr.voice = null; };
  tr.voice = v;
}
function stop(tr) {
  const v = tr.voice;
  if (!v) return;
  tr.voice = null;
  const now = ctx.currentTime;
  v.g.gain.cancelScheduledValues(now);
  v.g.gain.setValueAtTime(v.g.gain.value, now);
  v.g.gain.linearRampToValueAtTime(0, now + 0.04);
  v.src.stop(now + 0.05);
}

// the gate's replay from the top waits for the track's render and for the context to run WARM seconds (its output latency
// is reported by then), so the audio starts with the clock on the opening's first note; it gives up after 3 s of waiting
async function replay() {
  const tr = tracks.get(variant());
  if (tr && tr.rendering) await tr.rendering;
  for (let waited = 0; (!running() || ctx.currentTime < WARM) && waited < 3000; waited += 30) await new Promise((r) => setTimeout(r, 30));
  const ad = window.__AD;
  if (ad && scored() && !frozen()) ad.play(0);
}

// ---------- the controls ----------
function mountUI() {
  if (ui) return;
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  sheet.onerror = () => console.error(new Error(`soundtrack stylesheet failed to load: ${CSS}`));
  document.head.appendChild(sheet);
  const gate = document.createElement('button');
  gate.type = 'button';
  gate.className = 'st-gate';
  gate.hidden = true;
  gate.innerHTML = `${ON_ICON}<span>Play with sound</span>`;
  const pill = document.createElement('div');
  pill.className = 'st-mute';
  pill.hidden = true;
  pill.innerHTML = '<span class="vs-label" aria-hidden="true">Sound</span><button type="button" aria-label="Mute" aria-pressed="false"></button>';
  document.body.append(gate, pill);
  const toggle = pill.querySelector('button');
  ui = { gate, pill, toggle, state: '' };

  gate.addEventListener('click', (e) => {
    unlock();
    if (muted) setMuted(false);
    replay();
    if (e.detail > 0) gate.blur();
  });
  toggle.addEventListener('click', (e) => {
    unlock();
    setMuted(!muted);
    if (e.detail > 0) toggle.blur();
  });
  // Space and Enter press the buttons, not the spot's clock
  for (const b of [gate, toggle]) b.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
  addEventListener('keydown', (e) => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target && e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key === 'm' || e.key === 'M') && scored() && !frozen()) { unlock(); setMuted(!muted); }
  });
  // any gesture unlocks the audio while a scored variant shows (the events that grant a page user activation), except one
  // on the controls: the gate must stay up until its own click lands, or that click (and its replay) would fall through
  for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'keydown', 'touchend']) {
    addEventListener(ev, (e) => { if (scored() && !(e.target instanceof Node && (gate.contains(e.target) || pill.contains(e.target)))) unlock(); }, true);
  }
  // picking a scored variant (a click or an arrow key in the selector, so a gesture) unlocks it too; leaving one silences it
  const pick = () => {
    for (const tr of tracks.values()) if ((tr.id !== variant() || music() !== PICK) && ctx) stop(tr);
    if (scored() && allowed()) unlock();
    refresh();
  };
  addEventListener('variantchange', pick);
  addEventListener('musicchange', pick);
}

// show the controls the current variant needs; writes the DOM only when that changes
function refresh() {
  if (!ui) return;
  const on = scored() && !frozen();
  const gateOn = on && !muted && !running();
  const state = `${on}|${gateOn}|${muted}`;
  if (state === ui.state) return;
  ui.state = state;
  ui.pill.hidden = !on;
  ui.gate.hidden = !gateOn;
  ui.toggle.innerHTML = `${muted ? OFF_ICON : ON_ICON}<span>${muted ? 'Off' : 'On'}</span>`;
  ui.toggle.setAttribute('aria-pressed', String(muted));
}

/** A soundtrack for variant `id`: `render()` resolves to the AudioBuffer of the spot's audio from t = 0 (called once, the
    first time the variant shows). The beat calls sync(t) on every frame it draws. `failed` says the render failed (the
    beat then falls back to its own audio); `muted` is the page's mute, for that fallback to follow. */
export function makeSoundtrack({ id, render }) {
  const tr = { id, render, buffer: null, rendering: null, failed: false, voice: null };
  tracks.set(id, tr);
  mountUI();
  if (variant() === id && music() === PICK && allowed()) unlock();
  // QA and export: the rendered audio once it is in, and the sounding voice's offset from the clock (heard minus drawn, s)
  (window.__SOUNDTRACK ||= {})[id] = {
    get buffer() { return tr.buffer; },
    get failed() { return tr.failed; },
    get sounding() { return !!tr.voice && running() && !muted; },
    get drift() {
      const v = tr.voice, ad = window.__AD;
      if (!v || !ad) return null;
      const lat = (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
      return v.off + (ctx.currentTime - v.at) * v.rate - lat * v.rate - ad.now;
    },
  };
  return {
    get failed() { return tr.failed; },
    get muted() { return muted; },
    sync(t) {
      const ad = window.__AD;
      if (!tr.rendering && ad && music() === PICK) {
        tr.rendering = tr.render().then((b) => { tr.buffer = b; }, (e) => { tr.failed = true; console.error(new Error(`soundtrack ${id}: the audio failed to render`), e); });
      }
      refresh();
      if (!ctx) return;
      const playing = !!ad && ad.playing && !frozen() && variant() === id && music() === PICK;
      // the run's natural end: the clock stops on its last frame and the end card rings on
      const ended = !!ad && !ad.playing && t >= ad.CYCLE - 1e-3;
      if (!playing) { if (!ended || frozen()) stop(tr); return; }
      if (!tr.buffer || !running()) return;
      const rate = ad.speed || 1, lat = (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
      // the buffer position entering the graph now is the one heard `lat` from now
      const want = t + lat * rate, v = tr.voice;
      // restarted on the clock after a seek, a speed change, a drift, or the output latency moving under it
      if (v && (v.rate !== rate || Math.abs(lat - v.lat) > 0.015 || Math.abs(v.off + (ctx.currentTime - v.at) * v.rate - want) > DRIFT)) stop(tr);
      if (!tr.voice && ctx.currentTime >= WARM && want < tr.buffer.duration - 0.05) start(tr, want, rate, lat);
    },
  };
}
