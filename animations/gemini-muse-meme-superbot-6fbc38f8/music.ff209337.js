// The multicat variant's score (media/multicat.516afb1a/score.ff209337.mp3, CREDITS.txt there): a 120 bpm bed in B major
// rendered on the spot's own clock, so a second of the file is a second of the spot (the MP3 decodes with no offset in
// Chromium and WebKit, measured). Its bars sit on the song's play press, so the bed resolves into the song (it is silent
// while the song plays, beats/multicat.516afb1a.js) and comes back for the end card. It follows the clock as the song does,
// but through Web Audio for sample-exact starts: one buffer source started on the spot's time whenever the clock runs at 1×,
// restarted on a seek or a drift past DRIFT, faded out on a pause, on the end hold and under any other variant. At any other
// speed a media element plays it instead, time-stretched so it never changes pitch. The pill under the speed pill is the
// start gate (a fresh page may not make sound before a gesture: "Play with music" unlocks audio and plays the spot from the
// top), then the music switch, remembered across reloads; any other click or key on the page unlocks audio too, without a
// restart. A frozen capture (body.freeze) plays nothing.
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';

const SRC = new URL('./media/multicat.516afb1a/score.ff209337.mp3', import.meta.url).href;
const ON = 'multicat';
const PICK = 'v14';        // the Music pill's id for this score (music.47e5d94a.js)
// this score is live only on the multicat variant with it picked; otherwise it makes no sound and shows nothing
const picked = () => variant() === ON && music() === PICK;
const LEVEL = 1;          // the file is mastered to -16 LUFS over its groove, 2 dB under the song's -14
const DRIFT = 0.035;      // s the heard score may stray from the clock before it is restarted on it
const SLOW_DRIFT = 0.12;  // the same for the media element, whose clock is coarser
const FADE = 0.015;       // s: every start, stop and mute ramps, so a seek never clicks
const LEAD = 0.05;        // a start is scheduled this far ahead, on an exact context time
const VIDEO_LAG = 1 / 60; // a frame drawn in requestAnimationFrame reaches the screen about a frame later
const MUTED_KEY = 'multicat-score:muted';
// lucide volume-2 and volume-x (ISC)
const SPEAKER = '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>';
const icon = (rest) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SPEAKER}${rest}</svg>`;
const ICON = { on: icon('<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>'), off: icon('<path d="M22 9l-6 6"/><path d="M16 9l6 6"/>') };

const frozen = () => document.body.classList.contains('freeze');
const readMuted = () => { try { return localStorage.getItem(MUTED_KEY) === '1'; } catch (e) { console.warn('multicat score: the mute setting could not be read', e); return false; } };
let ctx = null, master = null, buffer = null, loading = null, loadFailed = false, voice = null, muted = readMuted();
let slow = null, slowGain = null, slowPending = false, slowStop = 0, timedSince = 0;

// decoded on an offline context, which no autoplay policy gates, so the score is ready before the first gesture
function load() {
  if (loading) return loading;
  loading = fetch(SRC)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
    .then((ab) => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab))
    .then((b) => { buffer = b; })
    .catch((e) => { loadFailed = true; console.error(new Error(`multicat score failed to load: ${SRC}`, { cause: e })); });
  return loading;
}

// the audio context, made (or resumed) inside a gesture so the browser lets it run
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { console.warn('multicat score: this browser has no Web Audio'); return; }
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : LEVEL;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', paint);
  }
  if (ctx.state !== 'running') ctx.resume().catch((e) => console.warn('multicat score: the audio context did not resume', e));
}
function setMuted(m) {
  muted = m;
  try { localStorage.setItem(MUTED_KEY, m ? '1' : '0'); } catch (e) { console.warn('multicat score: the mute setting could not be saved', e); }
  if (master) master.gain.setTargetAtTime(muted ? 0 : LEVEL, ctx.currentTime, FADE / 3);
  paint();
}

// the context time leaving the speakers at performance time `perf` (ms), from the browser's own output timestamp; without
// one, the context's reported latency behind its clock
function heardAt(perf) {
  const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
  if (ts && ts.performanceTime > 0) return ts.contextTime + (perf - ts.performanceTime) / 1000;
  return ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0);
}
// a just-started context reports no output timestamp for a few frames, then one that is still settling (Chromium): the
// first start waits until the timestamp has been there a while, or a start timed on it stays that far off
function timed() {
  if (!ctx.getOutputTimestamp) return true;
  if (!(ctx.getOutputTimestamp().performanceTime > 0)) { timedSince = 0; return false; }
  if (!timedSince) timedSince = performance.now();
  return performance.now() - timedSince > 150;
}
// the spot's time on screen at performance time `perf`, from the frame's clock reading `now`
const shown = (now, rate) => now - VIDEO_LAG * rate;
const heard = (perf) => voice.offset + (heardAt(perf) - voice.at);

function startVoice(now) {
  const perf = performance.now(), at = ctx.currentTime + LEAD, offset = shown(now, 1) + (at - heardAt(perf));
  if (offset >= buffer.duration) return;
  // a start just before the score's first sample waits for it
  const when = at - Math.min(0, offset), from = Math.max(0, offset);
  const src = ctx.createBufferSource(), gain = ctx.createGain();
  src.buffer = buffer;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(1, when + FADE);
  src.connect(gain).connect(master);
  src.onended = () => { src.disconnect(); gain.disconnect(); };
  src.start(when, from);
  voice = { src, gain, at: when, offset: from };
}
function stopVoice() {
  if (!voice) return;
  const { src, gain } = voice, t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + FADE);
  src.stop(t + FADE + 0.01);
  voice = null;
}
function syncVoice(now) {
  if (!buffer || !timed()) return;
  if (voice && Math.abs(heard(performance.now()) - shown(now, 1)) <= DRIFT) return;
  stopVoice();
  startVoice(now);
}

// any speed but 1×: a media element, time-stretched by the browser (preservesPitch), through the same master gain
function syncSlow(now, rate) {
  if (!slow) {
    slow = new Audio(SRC);
    slow.preload = 'auto';
    slow.preservesPitch = slow.webkitPreservesPitch = slow.mozPreservesPitch = true;
    slowGain = ctx.createGain();
    ctx.createMediaElementSource(slow).connect(slowGain).connect(master);
  }
  if (slowStop) { clearTimeout(slowStop); slowStop = 0; }
  slowGain.gain.setTargetAtTime(1, ctx.currentTime, FADE / 3);
  if (slow.playbackRate !== rate) slow.playbackRate = rate;
  const want = shown(now, rate);
  if (want >= (buffer ? buffer.duration : Infinity)) { stopSlow(); return; }
  if (Math.abs(slow.currentTime - want) > SLOW_DRIFT) slow.currentTime = Math.max(0, want);
  if (slow.paused && !slowPending) {
    slowPending = true;
    slow.play().catch((e) => console.warn('multicat score: the time-stretched score did not start', e)).finally(() => { slowPending = false; });
  }
}
// faded, then paused once the fade is through (a resync before then keeps it playing)
function stopSlow() {
  if (!slow || slow.paused || slowStop) return;
  slowGain.gain.setTargetAtTime(0, ctx.currentTime, FADE / 3);
  slowStop = setTimeout(() => { slowStop = 0; slow.pause(); }, 60);
}

// every frame: sound only while the multicat clock runs, on the spot's time (what is heard lines up with what is seen)
function tick() {
  requestAnimationFrame(tick);
  const ad = window.__AD;
  if (!(ad && ctx && ctx.state === 'running' && picked() && !frozen() && ad.playing)) { stopVoice(); stopSlow(); return; }
  if (ad.speed === 1) { stopSlow(); syncVoice(ad.now); }
  else { stopVoice(); syncSlow(ad.now, ad.speed); }
}

// ---------- the pill: "Play with music" until audio runs, then a Music on/off switch ----------
const bar = document.createElement('div');
bar.className = 'music-select';
bar.innerHTML = '<span class="vs-label" aria-hidden="true">Music</span><button type="button"></button>';
document.body.appendChild(bar);
const btn = bar.querySelector('button');

function paint() {
  bar.hidden = !picked();
  const st = !ctx || ctx.state !== 'running' ? 'locked' : muted ? 'off' : 'on';
  if (bar.dataset.state === st) return;
  bar.dataset.state = st;
  if (st === 'locked') {
    btn.removeAttribute('role'); btn.removeAttribute('aria-checked'); btn.removeAttribute('aria-label');
    btn.innerHTML = `${ICON.on}<span>Play with music</span>`;
  } else {
    btn.setAttribute('role', 'switch'); btn.setAttribute('aria-checked', String(st === 'on')); btn.setAttribute('aria-label', 'Music');
    btn.innerHTML = `${ICON[st]}<span>${st === 'on' ? 'On' : 'Off'}</span>`;
  }
}

btn.addEventListener('click', (e) => {
  if (bar.dataset.state === 'locked') {
    unlock();
    if (muted) setMuted(false);
    // the gate plays the spot from the top, so the score is heard from its first bar
    const ad = window.__AD;
    if (ad && (ad.now > 0.25 || !ad.playing)) ad.play(0);
  } else setMuted(!muted);
  if (e.detail > 0) btn.blur();
});
// Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js), as on the variant selector
btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });

// any other click, tap or key on the multicat page unlocks audio where it stands (the pill handles its own)
function gesture(e) {
  if (!picked() || frozen() || (e.target && e.target.closest && e.target.closest('.music-select'))) return;
  unlock();
}
for (const type of ['pointerdown', 'keydown', 'touchend']) addEventListener(type, gesture, { capture: true, passive: true });

function activate() {
  paint();
  if (!picked() || frozen()) return;
  load();
  // a page the browser already lets play (an earlier gesture, or an allowing autoplay policy) needs no gate
  const allowed = (navigator.userActivation && navigator.userActivation.hasBeenActive) || (navigator.getAutoplayPolicy && navigator.getAutoplayPolicy('audiocontext') === 'allowed');
  if ((!ctx || ctx.state !== 'running') && allowed) unlock();
}
addEventListener('variantchange', activate);
addEventListener('musicchange', activate);
activate();
requestAnimationFrame(tick);

// QA: the score's state, the score time heard now (null while silent) against the spot's time on screen
window.__MUSIC = {
  get state() { return bar.dataset.state; },
  get ready() { return !!buffer; },
  get settled() { return !!buffer || loadFailed; },
  get sounding() { return !!(voice || (slow && !slow.paused)) && picked(); },
  get heard() { return voice && ctx ? heard(performance.now()) : slow && !slow.paused ? slow.currentTime : null; },
  get shown() { const ad = window.__AD; return ad ? shown(ad.now, ad.speed) : null; },
  get muted() { return muted; },
};
// the Music pill reads its readiness and QA reads its sound here, as for every pick
(window.__PICKS ||= {})[PICK] = { ready: () => window.__MUSIC.settled, sounding: () => window.__MUSIC.sounding };
