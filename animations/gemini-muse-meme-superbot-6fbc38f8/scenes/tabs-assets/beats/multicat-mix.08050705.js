// The multicat spot's soundtrack in the page. It is rendered once, in a worker (multicat-score.08050705.js: the original
// score and effects with the ElevenLabs song mixed in, mastered to -16 LUFS), then played in step with the spot's clock:
// it follows window.__AD (now, playing, speed) and never drives it, restarting at the clock's time whenever it drifts
// more than 50 ms (a seek, a step, a speed change, R). Browsers start sound only after a gesture, so the variant opens on
// a start gate that holds the clock until "Play with sound" is pressed; any click or key does the same.
//   ?sound=0  no soundtrack (and no gate): the beat plays its song element alone, as before
//   ?t=<s>    a frozen frame renders and plays nothing
// window.__MIX reports the render's state and loudness for QA.
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js';

const q = new URLSearchParams(location.search);
const OFF = q.get('sound') === '0';
const FROZEN = q.has('t') && !q.has('play');
const RESYNC = 0.05;
const PICK = 'v5'; // its id on the Music pill (music.47e5d94a.js): it plays, and shows its pill, only while picked
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>';

let cues = null, songUrl = '';
let state = 'idle', buffer = null, report = null;
let ctx = null, src = null, srcGain = null, srcAt = 0, srcOff = 0, srcRate = 1;
let gate = null, held = null, gestured = false;

// the beat's song element stays silent while the soundtrack (which carries the song) is on
export const mixOwnsSong = () => !OFF && state !== 'failed' && music() === PICK;

// called once by the beat's build with its plan; the soundtrack does nothing until the variant is multicat
export function mountMix(c) {
  if (cues || OFF) return;
  cues = c.cues; songUrl = c.song;
  for (const type of ['pointerdown', 'keydown']) addEventListener(type, onGesture, { capture: true });
  window.__MIX = {
    get state() { return state; },
    get report() { return report; },
    get position() { return src ? srcOff + (ctx.currentTime - srcAt) * srcRate : null; },
  };
  requestAnimationFrame(tick);
}

function onGesture() {
  gestured = true;
  if (music() === PICK) wake();
}
const activated = () => gestured || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
// the output, created and resumed only once the page has been activated (so it never trips the autoplay warning)
let waking = false;
function wake() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ctx && AC) ctx = new AC({ latencyHint: 'interactive' });
  if (!ctx || ctx.state === 'running' || waking) return;
  waking = true;
  ctx.resume()
    .catch((e) => console.error(new Error('multicat soundtrack: the audio output would not start', { cause: e })))
    .finally(() => { waking = false; });
}

// ---------- render ----------
async function render() {
  state = 'rendering';
  try {
    const res = await fetch(songUrl);
    if (!res.ok) throw new Error(`song fetch ${res.status} ${songUrl}`);
    const decoded = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await res.arrayBuffer());
    const n = Math.min(decoded.length, 7 * 48000);
    const L = decoded.getChannelData(0).slice(0, n), R = decoded.getChannelData(decoded.numberOfChannels > 1 ? 1 : 0).slice(0, n);
    const out = await inWorker({ ...cues, cycle: window.__AD.CYCLE, song: { L, R } }, [L.buffer, R.buffer]);
    buffer = new AudioBuffer({ numberOfChannels: 2, length: out.L.length, sampleRate: out.sr });
    buffer.copyToChannel(out.L, 0);
    buffer.copyToChannel(out.R, 1);
    report = out.report;
    state = 'ready';
  } catch (e) {
    state = 'failed';
    console.error(new Error('multicat soundtrack failed to render; the beat plays its song alone', { cause: e }));
    if (gate) showGate(false);
  }
}
function inWorker(payload, transfer) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('./multicat-mix-worker.08050705.js', import.meta.url), { type: 'module' });
    w.onmessage = (e) => { w.terminate(); if (e.data.error) reject(new Error(e.data.error)); else resolve(e.data); };
    w.onerror = (e) => { w.terminate(); reject(new Error(`soundtrack worker: ${e.message || 'failed to load'}`)); };
    w.postMessage(payload, transfer);
  });
}

// ---------- the start gate ----------
function showGate(on) {
  if (on && !gate) {
    gate = document.createElement('div');
    gate.className = 'mix-gate';
    gate.innerHTML = `<button type="button" class="mix-gate-btn" aria-busy="false">${PLAY_ICON}<span>Play with sound</span></button>`;
    // its press wakes the output; the clock plays on from the held frame once the mix is ready (tick)
    gate.addEventListener('click', onGesture);
    document.body.appendChild(gate);
  }
  if (gate) gate.hidden = !on;
}
// pressed before the mix is ready: the button says so until the clock starts
function busy(on) {
  const btn = gate.querySelector('button');
  if (on === (btn.getAttribute('aria-busy') === 'true')) return;
  btn.setAttribute('aria-busy', String(on));
  btn.lastElementChild.textContent = on ? 'Preparing sound…' : 'Play with sound';
}

// ---------- playback ----------
function stop(fade = 0.02) {
  if (!src) return;
  const now = ctx.currentTime;
  srcGain.gain.cancelScheduledValues(now);
  srcGain.gain.setTargetAtTime(0, now, fade / 3);
  src.stop(now + fade);
  src = null;
}
function play(off, rate) {
  const node = ctx.createBufferSource(), g = ctx.createGain(), now = ctx.currentTime;
  node.buffer = buffer;
  node.playbackRate.value = rate;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(1, now + 0.008);
  node.connect(g).connect(ctx.destination);
  node.onended = () => { if (src === node) src = null; };
  node.start(now, off);
  src = node; srcGain = g; srcAt = now; srcOff = off; srcRate = rate;
}

function tick() {
  requestAnimationFrame(tick);
  const ad = window.__AD;
  if (!ad || variant() !== 'multicat' || music() !== PICK || FROZEN || document.body.classList.contains('freeze')) {
    if (ctx) stop();
    if (gate) showGate(false);
    held = null;
    return;
  }
  if (state === 'idle') render();

  // the gate holds the clock on its frame until a press (or any click or key) lets sound start, and past the press
  // until the mix is rendered, so the spot always starts with its sound
  const gateUp = !!gate && !gate.hidden;
  if (state !== 'failed' && (!activated() || (gateUp && state !== 'ready'))) {
    if (held === null) held = ad.now;
    if (ad.playing || ad.now !== held) ad.seek(held);
    showGate(true);
    busy(activated());
    return;
  }
  if (gateUp) {
    showGate(false);
    if (held !== null && !ad.playing) ad.play(held);
  }
  held = null;

  if (state !== 'ready') return;
  if (!ctx || ctx.state !== 'running') { wake(); return; }
  const t = ad.now, rate = ad.speed;
  if (!ad.playing) {
    // held on the last frame: the tail rings out; paused or stepped anywhere else: silence
    if (!(src && t >= ad.CYCLE - 0.02)) stop();
    return;
  }
  // what is heard now should be what is on screen a frame from now
  const lat = Math.max(0, (ctx.outputLatency || 0) + (ctx.baseLatency || 0) - 1 / 60);
  const want = t + lat * rate;
  if (src && (srcRate !== rate || Math.abs(srcOff + (ctx.currentTime - srcAt) * srcRate - want) > RESYNC)) stop(0.012);
  if (!src && want < buffer.duration - 0.05) play(want, rate);
}
