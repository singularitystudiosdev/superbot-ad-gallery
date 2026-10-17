// The multicat variant's soundtrack on the spot's clock. The whole mix (bed, sound effects and the song, mastered) is
// rendered once, offline, from the route's cue times (scenes/tabs-assets/beats/multicat-score.f1659cd2.js), so a second of
// the buffer is a second of the spot. It plays as one buffer source started at the spot's time whenever the clock runs,
// restarted on a seek, a speed change or a drift past DRIFT, and faded out on a pause, on the end hold and under any other
// variant; a frozen capture (body.freeze) plays nothing. The pill under the speed pill is the start gate (a fresh page may
// not make sound before a gesture: "Play with sound" unlocks audio and plays the spot from the top), then the mute switch;
// any other click or key on the page unlocks audio where it stands.
// On the Music pill it is pick 'v13' (music.47e5d94a.js): the beat mounts it once with its route (mountSound), and it renders,
// sounds, shows its pill and unlocks audio only while the variant is multicat and v13 is the pick.
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';
import { renderScore, RATE } from './scenes/tabs-assets/beats/multicat-score.f1659cd2.js';

const ON = 'multicat', PICK = 'v13';
const on = () => variant() === ON && music() === PICK;
const DRIFT = 0.04; // s the heard mix may stray from the clock before it is restarted on it
const FADE = 0.012; // s: every start, stop and mute ramps, so a seek never clicks
const LEAD = 0.05;  // s: a start is scheduled this far ahead on an exact context time, never "now"
// lucide volume-2 and volume-x
const SPEAKER = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>';
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SPEAKER}${d}</svg>`;
const ICON = { on: svg('<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>'), off: svg('<path d="m22 9-6 6"/><path d="m16 9 6 6"/>') };

const frozen = () => document.body.classList.contains('freeze');
let ctx = null, master = null, mix = null, rendering = null, voice = null, muted = false, failed = false, cfg = null, mounted = null;

// the song decoded and the mix rendered on offline contexts, which no autoplay policy gates, so it is ready before the
// first gesture. The route and the song's constants come from the beat at mount (cfg)
function prepare() {
  if (rendering) return rendering;
  rendering = (async () => {
    const res = await fetch(cfg.song);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${cfg.song}`);
    const song = await new OfflineAudioContext(2, 1, RATE).decodeAudioData(await res.arrayBuffer());
    const t0 = performance.now();
    mix = await renderScore({ route: cfg.route, song, songFor: cfg.songFor, songFade: cfg.songFade, endDelay: cfg.endDelay });
    mix.renderMs = Math.round(performance.now() - t0);
  })().catch((e) => { failed = true; console.error(new Error('multicat soundtrack failed to render', { cause: e })); });
  return rendering;
}

// the audio context, made (or resumed) inside a gesture so the browser lets it run
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { console.error(new Error('multicat soundtrack: this browser has no Web Audio')); return; }
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', paint);
  }
  if (ctx.state !== 'running') ctx.resume().catch((e) => console.error(new Error('multicat soundtrack: the audio context did not resume', { cause: e })));
}
const setMaster = () => { if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, FADE / 3); };

// the context time reaching the speakers at performance time `perf` (ms): the browser's own output timestamp, or failing
// one, the context clock less its reported latency
function heardAt(perf) {
  const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
  if (ts && ts.performanceTime > 0) return ts.contextTime + (perf - ts.performanceTime) / 1000;
  return ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
}
// a fresh context reports no output timestamp for a few frames, then a short one before it settles (Chromium): the first
// start waits until it has been reported for a while, or a start timed on it stays off for the whole run
let stampedSince = 0;
function settledClock() {
  if (!ctx.getOutputTimestamp) return true;
  if (!(ctx.getOutputTimestamp().performanceTime > 0)) { stampedSince = 0; return false; }
  if (!stampedSince) stampedSince = performance.now();
  return performance.now() - stampedSince > 120;
}
// the mix position heard now
const heard = () => voice.offset + (heardAt(performance.now()) - voice.at) * voice.rate;

// start the mix so the sample heard at context time `at` is the spot's time at that moment
function start(spot, rate) {
  const perf = performance.now(), at = ctx.currentTime + LEAD, offset = spot + (at - heardAt(perf)) * rate;
  if (offset >= mix.buffer.duration) return;
  const src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = mix.buffer;
  src.playbackRate.value = rate;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(1, at + FADE);
  src.connect(gain).connect(master);
  src.onended = () => { src.disconnect(); gain.disconnect(); };
  src.start(at, Math.max(0, offset));
  voice = { src, gain, at, offset, rate };
}
function stop() {
  if (!voice) return;
  const { src, gain } = voice, t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + FADE);
  src.stop(t + FADE + 0.01);
  voice = null;
}

// every frame: sound only while the multicat clock runs, on the spot's time
function tick() {
  requestAnimationFrame(tick);
  const ad = window.__AD;
  if (!(ad && mix && ctx && ctx.state === 'running' && on() && !frozen() && ad.playing)) { stop(); return; }
  if (!settledClock()) return;
  const rate = ad.speed;
  if (voice && voice.rate === rate && Math.abs(heard() - ad.now) <= DRIFT) return;
  stop();
  start(ad.now, rate);
}

// ---------- the pill: "Play with sound" until audio runs, then a Sound on/off switch ----------
const bar = document.createElement('div');
bar.className = 'sound-select-v13';
bar.hidden = true;
bar.innerHTML = '<span class="vs-label" aria-hidden="true">Sound</span><button type="button"></button>';
const btn = bar.querySelector('button');

function paint() {
  bar.hidden = !on();
  const st = !ctx || ctx.state !== 'running' ? 'locked' : muted ? 'off' : 'on';
  if (bar.dataset.state === st) return;
  bar.dataset.state = st;
  if (st === 'locked') {
    btn.removeAttribute('role'); btn.removeAttribute('aria-checked'); btn.removeAttribute('aria-label');
    btn.innerHTML = `${ICON.off}<span>Play with sound</span>`;
  } else {
    btn.setAttribute('role', 'switch'); btn.setAttribute('aria-checked', String(st === 'on')); btn.setAttribute('aria-label', 'Sound');
    btn.innerHTML = `${ICON[st]}<span>${st === 'on' ? 'On' : 'Off'}</span>`;
  }
}

btn.addEventListener('click', (e) => {
  if (bar.dataset.state === 'locked') {
    unlock();
    muted = false;
    setMaster();
    // the gate plays the spot from the top, so the mix is heard from its first bar
    const ad = window.__AD;
    if (ad && (ad.now > 0.25 || !ad.playing)) ad.play(0);
  } else {
    muted = !muted;
    setMaster();
    paint();
  }
  if (e.detail > 0) btn.blur();
});
// Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js), as on the variant selector
btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });

// any other click, tap or key on the multicat page unlocks audio where it stands (the pill handles its own)
function gesture(e) {
  if (!on() || frozen() || (e.target && e.target.closest && e.target.closest('.sound-select-v13'))) return;
  unlock();
}

function activate() {
  paint();
  if (!on() || frozen()) return;
  prepare();
  // a page the browser already lets play (an earlier gesture, or an allowing autoplay policy) needs no gate
  if (!ctx && ((navigator.userActivation && navigator.userActivation.hasBeenActive) || (navigator.getAutoplayPolicy && navigator.getAutoplayPolicy('audiocontext') === 'allowed'))) unlock();
}
// the beat mounts the soundtrack once, on the multicat chain: cfg { route: { ask, s, typeEnd, send, chips, T }, song, songFor,
// songFade, endDelay }
export function mountSound(c) {
  if (mounted) return mounted;
  cfg = c;
  document.body.appendChild(bar);
  for (const type of ['pointerdown', 'keydown', 'touchend']) addEventListener(type, gesture, { capture: true, passive: true });
  addEventListener('variantchange', activate);
  addEventListener('musicchange', activate);
  activate();
  requestAnimationFrame(tick);
  mounted = { get failed() { return failed; } };
  (window.__PICKS ||= {})[PICK] = { ready: () => !!mix || failed, sounding: () => !!voice && !!ctx && ctx.state === 'running' && !muted };
  return mounted;
}

// QA: the gate's state, the rendered mix (its buffer, cue list, grid and master readings) and the position heard now
window.__SOUND_V13 = {
  get state() { return bar.dataset.state; },
  get ready() { return !!mix; },
  get mix() { return mix; },
  get heard() { return voice && ctx ? heard() : null; },
  prepare,
};
