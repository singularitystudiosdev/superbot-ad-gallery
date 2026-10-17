// The multicat variant's music bed (media/multicat.516afb1a/score.535ee6dc.mp3, CREDITS.txt there): 120 bpm in B major,
// rendered on the spot's own clock, so second t of the file is second t of the spot. Its grid is the shipped song's
// (tiny-chaos.mp3, whose beat 1 plays at 22.628 s): the bed hits the sends, chips, fast-forwards and landings, stops a
// beat before the song, sits out while the song plays (beats/multicat.516afb1a.js) and comes back as the end card's sting.
// Played through Web Audio for sample-exact starts: one buffer source started at the clock's time whenever the clock runs,
// restarted on a seek, a speed change or drift past DRIFT, and faded out on a pause, at the end, frozen (body.freeze) or
// under any other variant. MASTER sets its level. A fresh page may not make sound before a gesture, so the pill under the
// speed pill is first the gate ("Play with sound" unlocks audio and plays the spot from the top), then the mute switch;
// any other click or key unlocks audio too, without a restart.
// Merged onto the Music pill as pick 'v6' (music.47e5d94a.js): it sounds, shows its pill, listens for gestures and holds
// its file only while the variant is 'multicat' AND the pick is v6; the beat mounts it once (mountScore, multicat only).
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';

const SRC = new URL('./media/multicat.516afb1a/score.535ee6dc.mp3', import.meta.url).href;
const VARIANT = 'multicat';
const PICK = 'v6';
const MASTER = 0.9;  // the file sits at -16.3 LUFS over the bed; this keeps it about 2.5 dB under the song's -14
const DRIFT = 0.045; // s the heard bed may stray from the clock (a 60 fps clock steps 17 ms) before it restarts on it
const RAMP = 0.015;  // s: every start, stop and mute ramps, so a seek never clicks

let ctx = null, master = null, buffer = null, voice = null, muted = false, state = 'idle', loading = null, looping = false, mounted = null;
const picked = () => variant() === VARIANT && music() === PICK;

// decoded on an offline context, which no autoplay policy gates, so the bed is ready before the first gesture
// (fetched on the first time it is picked, so the other picks never pay for it)
function load() {
  if (loading) return loading;
  state = 'loading';
  loading = fetch(SRC)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
    .then((bytes) => new OfflineAudioContext(2, 1, 44100).decodeAudioData(bytes))
    .then((b) => { buffer = b; state = 'ready'; })
    .catch((e) => { state = 'failed'; console.error(new Error(`multicat score failed to load: ${SRC}`, { cause: e })); });
  return loading;
}

// the live context, created (or resumed) inside a gesture so the browser lets it sound
function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', paint);
  }
  if (ctx.state !== 'running') ctx.resume().catch((e) => console.warn('multicat score: the audio context did not resume', e));
}
const live = () => !!ctx && ctx.state === 'running';

function stop() {
  if (!voice) return;
  const { src, amp } = voice, at = ctx.currentTime;
  amp.gain.cancelScheduledValues(at);
  amp.gain.setValueAtTime(amp.gain.value, at);
  amp.gain.linearRampToValueAtTime(0, at + RAMP);
  src.stop(at + RAMP + 0.005);
  voice = null;
}

// start the file at spot time t; what leaves the speakers lags the context clock by its output latency, so the source
// starts that much further in and the heard bed lines up with the frame on screen
function start(t, rate) {
  stop();
  const lag = (ctx.outputLatency || ctx.baseLatency || 0) * rate;
  const offset = t + lag;
  if (offset >= buffer.duration) return;
  const src = ctx.createBufferSource(), amp = ctx.createGain();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  src.connect(amp).connect(master);
  const at = ctx.currentTime;
  amp.gain.setValueAtTime(0, at);
  amp.gain.linearRampToValueAtTime(1, at + RAMP);
  src.start(at, offset);
  voice = { src, amp, at, offset, rate, lag };
}

// once a frame: should the bed sound, and is it where the clock is?
function follow() {
  const picks = picked();
  if (!picks) { looping = false; stop(); pill.hidden = true; return; }
  requestAnimationFrame(follow);
  const ad = window.__AD;
  const on = !document.body.classList.contains('freeze');
  pill.hidden = !on;
  if (!ad || !buffer || !live()) return;
  const t = ad.now, rate = ad.speed || 1;
  if (!on || !ad.playing || t >= ad.CYCLE) { stop(); return; }
  if (!voice || voice.rate !== rate) { start(t, rate); return; }
  const heard = voice.offset - voice.lag + (ctx.currentTime - voice.at) * rate;
  if (Math.abs(heard - t) > DRIFT * rate) start(t, rate);
}

// ---------- the sound pill ----------
const SPEAKER = '<path d="M11 5 6 9H3v6h3l5 4z"/>';
const ICON = {
  on: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SPEAKER}<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`,
  off: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SPEAKER}<path d="m16 9.5 5 5m0-5-5 5"/></svg>`,
};
const pill = document.createElement('div');
pill.className = 'score-pill';
pill.hidden = true;
pill.innerHTML = '<button type="button"></button>';
const btn = pill.firstElementChild;

function paint() {
  const gate = !live();
  const label = gate ? 'Play with sound' : muted ? 'Music off' : 'Music on';
  btn.innerHTML = `${gate || muted ? ICON.off : ICON.on}<span>${label}</span>`;
  btn.setAttribute('aria-pressed', String(!gate && !muted));
  btn.setAttribute('aria-label', gate ? 'Play the spot from the start with sound' : muted ? 'Unmute the music' : 'Mute the music');
  pill.classList.toggle('gate', gate);
}

btn.addEventListener('click', (e) => {
  if (!live()) {
    unlock();
    // the gate replays from the top, so the bed is heard from its first bar
    load().then(() => { if (picked() && window.__AD) window.__AD.play(0); });
  } else {
    muted = !muted;
    master.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, RAMP / 3);
  }
  paint();
  // a mouse press hands the keys (space, arrows, R) back to the spot's clock
  if (e.detail > 0) btn.blur();
});
// its own Space and Enter press the pill, not the clock
btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
// any other gesture unlocks audio in place (the song's own unlock listens for the same two)
addEventListener('pointerdown', (e) => { if (picked() && !pill.contains(e.target)) { unlock(); paint(); } }, true);
addEventListener('keydown', () => { if (picked()) { unlock(); paint(); } }, true);

// the pick or the variant changed: start (load, show, follow) or stop (silence, hide) the bed
function sync() {
  if (!mounted) return;
  if (!picked()) { stop(); pill.hidden = true; return; }
  load();
  // picked through the Music pill (a user gesture), the page has been active: unlock in place
  if (navigator.userActivation && navigator.userActivation.hasBeenActive) unlock();
  paint();
  if (!looping) { looping = true; requestAnimationFrame(follow); }
}
addEventListener('variantchange', sync);
addEventListener('musicchange', sync);

// the beat mounts the bed once (multicat only); window.__PICKS.v6 is the ready/QA hook the Music pill reads
export function mountScore() {
  if (mounted) return mounted;
  document.body.appendChild(pill);
  mounted = {
    get state() { return state; },
    sounding: () => !!voice && live() && !muted && picked(),
  };
  (window.__PICKS ||= {})[PICK] = { ready: () => state === 'ready' || state === 'failed', sounding: mounted.sounding };
  paint();
  sync();
  return mounted;
}
