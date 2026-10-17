// The multicat variant's soundtrack player. The score (score.28656fd8.js) ships rendered, as FILE; while the spot's cue sheet
// still matches the one that file was rendered for (FILE_FOR), the file is decoded at load, else the score renders live (a few
// seconds of CPU). The buffer follows the spot's clock
// (window.__AD) as the song does, but through Web Audio, for sample-exact starts: one buffer source started at the clock's
// time (ahead by the output latency, so a sound meets its frame) whenever the clock runs, restarted on a seek, a speed
// change or a drift past DRIFT, ramped out on a pause, on the end hold, under any other variant and on a frozen capture
// (body.freeze). A fresh page may not make sound before a gesture, so the pill under the speed pill is the gate: "Tap for
// sound" until a click or key anywhere unlocks audio (a tap on the pill after the run has ended replays it), then a mute
// switch. The choice persists, and the song's <audio> (beats/multicat.516afb1a.js) follows it (the mounted player's `off`).
// On the Music pill it is pick 'v8' (music.47e5d94a.js): it renders, sounds, shows its pill and unlocks audio only while the
// variant is 'multicat' and v8 is the pick; the beat mounts it once (mountMusic) with the spot's clocks.
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';
import { renderScore, cueSheet, fingerprint, setClocks } from './score.28656fd8.js';

const ON = 'multicat', PICK = 'v8';
const here = () => variant() === ON && music() === PICK;
const FILE = new URL('./media/multicat.516afb1a/score.28656fd8.mp3', import.meta.url).href;
const FILE_FOR = '0.700 2.700 4.075 5.075 7.325 9.825 11.950 15.575 17.450 19.950 21.700 21.950 22.450 22.700 28.075 28.700 31.593';
const KEY = 'sound.28656fd8'; // localStorage: 'off' once the listener mutes
const DRIFT = 0.05;           // s the heard score may stray from the clock (which reads whole 60fps frames) before a restart
const SETTLE = 250;           // ms after a start before drift is judged, while the audio thread spins up
const FADE = 0.015;           // s: every start and stop ramps, so a seek never clicks
const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="${d}"/></svg>`;
const ICON = { on: icon('M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14'), off: icon('m22 9-6 6M16 9l6 6') };
const LABEL = { locked: 'Tap for sound', on: 'Sound on', off: 'Sound off' };
const TITLE = { locked: 'Play the soundtrack', on: 'Mute', off: 'Unmute' };

function stored() {
  try { return localStorage.getItem(KEY); } catch (e) { console.error(new Error('multicat score: the sound choice could not be read', { cause: e })); return null; }
}
function save() {
  try { if (off) localStorage.setItem(KEY, 'off'); else localStorage.removeItem(KEY); } catch (e) { console.error(new Error('multicat score: the sound choice could not be saved', { cause: e })); }
}

let off = stored() === 'off';
let ctx = null, master = null, buffer = null, rendering = null, voice = null, failed = false, mounted = null;
const frozen = () => document.body.classList.contains('freeze');
const live = () => !!ctx && ctx.state === 'running';

// decoded on an offline context, which no autoplay policy gates, so the score is ready before the first gesture
function load() {
  if (fingerprint() !== FILE_FOR) return Promise.reject(new Error(`the spot's cue sheet changed since ${FILE} was rendered`));
  return fetch(FILE)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
    .then((ab) => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab));
}

// once, the first time the variant is on: the shipped file, else a live render after the spot's first frames are drawn
function ensureScore() {
  if (rendering) return;
  rendering = load()
    .catch((e) => {
      console.warn('multicat score: rendering it live', e);
      return new Promise((r) => setTimeout(r, 200)).then(renderScore);
    })
    .then((b) => { buffer = b; })
    .catch((e) => { failed = true; console.error(new Error('multicat score failed to render', { cause: e })); });
}

// the audio context, made (or resumed) inside a gesture so the browser lets it run
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', sync);
  }
  if (ctx.state !== 'running') ctx.resume().then(sync, (e) => console.error(new Error('multicat score: audio did not start', { cause: e })));
  sync();
}

function start(from, rate) {
  const now = ctx.currentTime, src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(1, now + FADE);
  src.connect(g).connect(master);
  src.start(now, Math.max(0, from));
  voice = { src, g, from, at: now, rate, judge: performance.now() + SETTLE };
}

function stop() {
  if (!voice) return;
  const now = ctx.currentTime, { src, g } = voice;
  g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(g.gain.value, now);
  g.gain.linearRampToValueAtTime(0, now + FADE);
  src.stop(now + FADE + 0.01);
  voice = null;
}

function tick() {
  requestAnimationFrame(tick);
  const ad = window.__AD, on = here();
  if (on && ad) ensureScore();
  if (!on || off || !ad || !ad.playing || frozen() || !buffer || !live()) { stop(); return; }
  const rate = ad.speed, lat = (ctx.outputLatency || ctx.baseLatency || 0) * rate;
  const want = ad.now + lat; // where the buffer should read now, for its sound to meet the frame it belongs to
  if (want >= buffer.duration) { stop(); return; }
  if (voice) {
    if (voice.rate === rate && (performance.now() < voice.judge || Math.abs(voice.from + (ctx.currentTime - voice.at) * rate - want) < DRIFT)) return;
    stop();
  }
  start(want, rate);
}

// the gate and mute switch
const pill = document.createElement('button');
pill.type = 'button';
pill.className = 'sound-pill';
pill.hidden = true;

function sync() {
  pill.hidden = !here();
  const state = off ? 'off' : live() ? 'on' : 'locked';
  if (pill.dataset.state === state) return;
  pill.dataset.state = state;
  pill.title = TITLE[state];
  pill.innerHTML = `${ICON[state === 'on' ? 'on' : 'off']}<span>${LABEL[state]}</span>`;
}

pill.addEventListener('click', (e) => {
  if (live() && !off) { off = true; stop(); }
  else {
    off = false;
    unlock();
    // a tap after the run has ended plays it again, with sound
    const ad = window.__AD;
    if (ad && !ad.playing && ad.now >= ad.CYCLE - 0.02) ad.play(0);
  }
  save();
  sync();
  if (e.detail > 0) pill.blur();
});
// Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js)
pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
// any other click, tap or key unlocks audio too, unless the listener muted
const gesture = (e) => { if (here() && !off && !(e.target instanceof Element && e.target.closest('.sound-pill'))) unlock(); };
// the beat mounts the player once, on the multicat chain, with the spot's clocks (score.28656fd8.js setClocks)
export function mountMusic(clocks) {
  if (mounted) return mounted;
  setClocks(clocks);
  document.body.appendChild(pill);
  for (const type of ['pointerdown', 'keydown', 'touchend']) addEventListener(type, gesture, { capture: true });
  addEventListener('variantchange', sync);
  // picked through the Music pill (a gesture): the page has been active, so audio may start now
  addEventListener('musicchange', () => { if (here() && !off && navigator.userActivation && navigator.userActivation.hasBeenActive) unlock(); else sync(); });
  sync();
  requestAnimationFrame(tick);
  mounted = { get off() { return off; } };
  (window.__PICKS ||= {})[PICK] = { ready: () => !!buffer || failed, sounding: () => !!voice && live() && !off };
  return mounted;
}

// QA: the cue sheet, the buffer, and the score time heard now (null while silent), which tracks window.__AD.now
window.__scoreV8 = {
  cues: () => cueSheet().cues,
  render: renderScore,
  get buffer() { return buffer; },
  get heard() { return voice ? voice.from + (ctx.currentTime - voice.at - (ctx.outputLatency || ctx.baseLatency || 0)) * voice.rate : null; },
};
