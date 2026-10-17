// The multicat variant's score (media/multicat.516afb1a/score.942e79ba.mp3, CREDITS.txt there): a 120 bpm bed in B major
// rendered on the spot's own clock, so a second of the file is a second of the spot. Its beat grid is the shipped song's
// (tiny-chaos.mp3) run back from the song's play press, so the bed builds into the song's downbeat, sits out while the song
// plays (beats/multicat.516afb1a.js) and comes back as the end card's sting. It follows the clock as the song does, but
// through Web Audio, for sample-exact starts: one buffer source started at the spot's time whenever the clock runs,
// restarted on a seek, a speed change or a drift past DRIFT, faded out on a pause, on the end hold and under any other
// variant. A master gain sets its level. The pill under the speed pill is the start gate (a fresh page may not make sound
// before a gesture: "Play with music" unlocks audio and plays the spot from the top), then the mute switch; any other click
// or key on the page unlocks audio too, without a restart. A frozen capture (body.freeze) plays nothing.
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js';

const SRC = new URL('./media/multicat.516afb1a/score.942e79ba.mp3', import.meta.url).href;
const ON = 'multicat';
const PICK = 'v1'; // its id on the Music pill (music.47e5d94a.js): it plays, and shows its pill, only while picked
const on = () => variant() === ON && music() === PICK;
const LEVEL = 0.9;  // the master gain: the file is mastered to -17 LUFS, 3 dB under the song's -14
const DRIFT = 0.04; // s the heard score may stray from the clock before it is restarted on it
const FADE = 0.012; // s: every start, stop and mute ramps, so a seek never clicks
// lucide volume-2 and volume-x (api.iconify.design, 2026-10-17)
const SPEAKER = 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z';
const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${SPEAKER}${d}"/></svg>`;
// (the waves are absolute; the cross is relative to the speaker's closing z, as lucide draws it)
const ICON = { on: icon('M16 9a5 5 0 0 1 0 6m3.364 3.364a9 9 0 0 0 0-12.728'), off: icon('m5.5 9.798l5-5m-5 0l5 5') };

const frozen = () => document.body.classList.contains('freeze');
let ctx = null, master = null, buffer = null, loading = null, voice = null, muted = false, level = LEVEL;

// decoded on an offline context, which no autoplay policy gates, so the score is ready before the first gesture
function load() {
  if (loading) return loading;
  loading = fetch(SRC)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
    .then((ab) => new OfflineAudioContext(2, 1, 44100).decodeAudioData(ab))
    .then((b) => { buffer = b; })
    .catch((e) => console.error(new Error(`multicat score failed to load: ${SRC}`, { cause: e })));
  return loading;
}

// the audio context, made (or resumed) inside a gesture so the browser lets it run
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : level;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', paint);
  }
  if (ctx.state !== 'running') ctx.resume().catch((e) => console.warn('multicat score: the audio context did not resume', e));
}
const setMaster = () => { if (master) master.gain.setTargetAtTime(muted ? 0 : level, ctx.currentTime, FADE / 3); };

// the context time leaving the speakers at performance time `perf` (ms), from the browser's own output timestamp; without
// one, the context's reported latency behind its clock
function heardAt(perf) {
  const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
  if (ts && ts.performanceTime > 0) return ts.contextTime + (perf - ts.performanceTime) / 1000;
  return ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0);
}
// a context that has just started reports no output timestamp for a few frames, then a first one ~15 ms short of the
// ~30 ms it settles on a frame later (Chromium, measured); a start timed on either stays that far off for the whole run,
// so the first start waits until the timestamp has been there a while
let timedSince = 0;
function timed() {
  if (!ctx.getOutputTimestamp) return true;
  if (!(ctx.getOutputTimestamp().performanceTime > 0)) { timedSince = 0; return false; }
  if (!timedSince) timedSince = performance.now();
  return performance.now() - timedSince > 120;
}
// the score position heard now
const heard = () => voice.offset + (heardAt(performance.now()) - voice.at) * voice.rate;
// a start is scheduled this far ahead, on an exact context time: "now" would start on the next audio callback, ~10 ms late
const LEAD = 0.05;

// start the score so the sample heard at context time `at` is the spot's time at that moment
function start(spot, perf, rate) {
  const at = ctx.currentTime + LEAD, offset = spot + (at - heardAt(perf)) * rate;
  if (offset >= buffer.duration) return;
  const src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(1, at + FADE);
  src.connect(gain).connect(master);
  src.onended = () => { src.disconnect(); gain.disconnect(); };
  src.start(at, offset);
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

// every frame: sound only while the multicat clock runs, on the spot's time (what is heard lines up with what is seen)
function tick() {
  requestAnimationFrame(tick);
  const ad = window.__AD;
  if (!(ad && buffer && ctx && ctx.state === 'running' && on() && !frozen() && ad.playing)) { stop(); return; }
  if (!timed()) return;
  const rate = ad.speed;
  if (voice && voice.rate === rate && Math.abs(heard() - ad.now) <= DRIFT) return;
  stop();
  start(ad.now, performance.now(), rate);
}

// ---------- the pill: "Play with music" until audio runs, then a Music on/off switch ----------
const bar = document.createElement('div');
bar.className = 'music-select';
bar.innerHTML = '<span class="vs-label" aria-hidden="true">Music</span><button type="button"></button>';
document.body.appendChild(bar);
const btn = bar.querySelector('button');

function paint() {
  bar.hidden = !on();
  const st = !ctx || ctx.state !== 'running' ? 'locked' : muted ? 'off' : 'on';
  if (bar.dataset.state === st) return;
  bar.dataset.state = st;
  if (st === 'locked') {
    btn.removeAttribute('role'); btn.removeAttribute('aria-checked'); btn.removeAttribute('aria-label');
    btn.innerHTML = `${ICON.off}<span>Play with music</span>`;
  } else {
    btn.setAttribute('role', 'switch'); btn.setAttribute('aria-checked', String(st === 'on')); btn.setAttribute('aria-label', 'Music');
    btn.innerHTML = `${ICON[st]}<span>${st === 'on' ? 'On' : 'Off'}</span>`;
  }
}

btn.addEventListener('click', (e) => {
  if (bar.dataset.state === 'locked') {
    unlock();
    muted = false;
    setMaster();
    // the gate plays the spot from the top, so the score is heard from its first bar
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
  if (!on() || frozen() || (e.target && e.target.closest && e.target.closest('.music-select'))) return;
  unlock();
}
for (const type of ['pointerdown', 'keydown', 'touchend', 'click']) addEventListener(type, gesture, { capture: true, passive: true });

function activate() {
  paint();
  if (!on() || frozen()) return;
  load();
  // a page the browser already lets play (an earlier gesture, or an allowing autoplay policy) needs no gate
  if (!ctx && ((navigator.userActivation && navigator.userActivation.hasBeenActive) || (navigator.getAutoplayPolicy && navigator.getAutoplayPolicy('audiocontext') === 'allowed'))) unlock();
}
addEventListener('variantchange', activate);
addEventListener('musicchange', activate);
activate();
requestAnimationFrame(tick);

// QA: the score's state, the position heard now (null while silent) and the master level
window.__MUSIC = {
  get state() { return bar.dataset.state; },
  get ready() { return !!buffer; },
  get heard() { return voice && ctx ? heard() : null; },
  get level() { return level; },
  set level(v) { level = Math.min(1.5, Math.max(0, Number(v) || 0)); setMaster(); },
};
