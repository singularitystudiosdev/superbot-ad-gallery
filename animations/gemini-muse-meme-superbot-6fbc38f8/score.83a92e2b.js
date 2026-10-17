// The multicat variant's score (?variant=multicat): an original soundtrack, music and sound effects, synthesised at load
// (score-mix.83a92e2b.js) on the spot's own cue sheet (score-cues.83a92e2b.js) and played as one buffer locked to the
// spot's clock (__AD, timeline.9b47fc30.js). It follows play, pause, steps, restarts, variant picks and the speed pill
// (tape-style: a faster clock plays it faster), re-locking whenever it drifts past DRIFT, and lets its tail ring out when
// the run ends on its own. The ElevenLabs song rides inside the mix, so the beat's own song player
// (beats/multicat.516afb1a.js) stands down once the render is in (__SCORE.ownsSong). Browsers start sound only after a
// gesture: a pill at the left (under the variant bar) opens it, playing the spot from the top (any other click or key on the page opens it where the
// clock is), and mutes it after. Nothing runs on a frozen capture (?t= without play). Its stylesheet (score.83a92e2b.css)
// loads with the module.
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';
import { cueSheet, plan } from './score-cues.83a92e2b.js?v=1';
import { renderScore, SR } from './score-mix.83a92e2b.js?v=1';

// On the Music pill it is pick 'v15' (music.47e5d94a.js): it renders, sounds, shows its pill and opens audio only while
// the variant is multicat and v15 is the pick; the beat hands its clocks to score-cues (setPlan) as it builds.
const ID = 'multicat', PICK = 'v15';
const on = () => variant() === ID && music() === PICK;
const DRIFT = 0.045; // re-lock once the heard second is this far from the picture's
const FADE = 0.012;  // every start, stop and re-lock fades over this, so a seek never clicks
const LEAD = 0.01;   // a start is scheduled this far ahead, never late
const q = new URLSearchParams(location.search);
const frozen = document.body.classList.contains('freeze') || (q.has('t') && !q.has('play'));

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('score.83a92e2b.css?v=2', import.meta.url).href;
document.head.appendChild(css);

// ---------- the render ----------
// the opening HEAD seconds render first, so sound is ready almost at once; the whole score follows and takes over where
// the head is, sample for sample
const HEAD = 8;
let sheet = null, head = null, buffer = null, failed = false, songIn = false, reduction = 0, rendering = null, renderMs = null, headMs = null;
async function loadSong() {
  try {
    const r = await fetch(plan().SONG);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await new OfflineAudioContext(2, 1, SR).decodeAudioData(await r.arrayBuffer());
  } catch (e) {
    console.error(new Error(`multicat score: the song did not load, so it plays on the beat's own player: ${plan().SONG}`, { cause: e }));
    return null;
  }
}
function prepare() {
  if (rendering || frozen || !plan()) return rendering;
  sheet = cueSheet();
  const t0 = performance.now();
  rendering = (async () => {
    const songLoad = loadSong();
    head = (await renderScore(sheet, { until: HEAD })).buf;
    headMs = Math.round(performance.now() - t0);
    const song = await songLoad;
    const out = await renderScore(sheet, { song });
    buffer = out.buf; reduction = out.reduction; songIn = !!song;
    renderMs = Math.round(performance.now() - t0);
  })().catch((e) => { failed = true; console.error(new Error('multicat score: the render failed; the spot plays without its score', { cause: e })); });
  return rendering;
}

// ---------- the live player ----------
let ctx = null, out = null, src = null, muted = false;
const latency = () => (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
// the buffer second reaching the speakers now
const heard = () => src.offset + (ctx.currentTime - src.at) * src.rate - src.lat * src.rate;

function open() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' });
    out = ctx.createGain();
    out.connect(ctx.destination);
  }
  if (ctx.state !== 'running') ctx.resume().then(paint, (e) => console.error(new Error('multicat score: the browser would not start sound', { cause: e })));
  paint();
}

function stop() {
  if (!src) return;
  const { node, amp } = src, now = ctx.currentTime;
  amp.gain.cancelScheduledValues(now);
  amp.gain.setValueAtTime(amp.gain.value, now);
  amp.gain.linearRampToValueAtTime(0, now + FADE);
  node.stop(now + FADE + 0.005);
  src = null;
}

// play buf so that second t is heard as the picture shows it, at the clock's rate
function start(buf, t, rate) {
  const node = ctx.createBufferSource(), amp = ctx.createGain(), at = ctx.currentTime + LEAD, lat = latency();
  node.buffer = buf;
  node.playbackRate.value = rate;
  node.connect(amp).connect(out);
  amp.gain.setValueAtTime(0, at);
  amp.gain.linearRampToValueAtTime(1, at + FADE);
  const offset = t + (LEAD + lat) * rate;
  node.start(at, Math.min(offset, buf.duration));
  src = { node, amp, buf, offset, at, rate, lat };
}

function follow() {
  const ad = window.__AD, buf = buffer || head;
  if (!ctx || ctx.state !== 'running' || !buf || !ad) return;
  if (!on() || muted) { stop(); return; }
  const rate = ad.speed || 1;
  if (!ad.playing) {
    // a run that ended on its own holds its last frame while the end chord rings out; any other stop silences it
    const ended = ad.now >= ad.CYCLE - 1 / 30;
    if (!(ended && src && src.rate === rate)) stop();
    return;
  }
  const t = ad.now;
  // past the head before the whole score is in: quiet until it lands, then it picks up where the picture is
  if (t >= buf.duration - 0.05) { stop(); return; }
  // the whole score replacing the head crossfades between identical samples, so the swap is inaudible
  if (!src || src.buf !== buf || src.rate !== rate || Math.abs(heard() - t) > DRIFT) { stop(); start(buf, t, rate); }
}

// ---------- the sound pill ----------
// built once: a press must never have its target replaced under it, or the browser drops the click
const LABEL = { locked: 'Click for sound', on: 'Sound on', off: 'Sound off' };
const pill = document.createElement('button');
pill.type = 'button';
pill.className = 'score-sound';
pill.hidden = true;
pill.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/>'
  + '<path class="ss-waves" d="M15.6 9.2a4 4 0 0 1 0 5.6M18.4 6.6a7.6 7.6 0 0 1 0 10.8"/><path class="ss-cross" d="M16 9.5l5 5M21 9.5l-5 5"/></svg><span></span>';
document.body.appendChild(pill);
const label = pill.querySelector('span'), waves = pill.querySelector('.ss-waves'), cross = pill.querySelector('.ss-cross');
let shown = '';

function paint() {
  pill.hidden = frozen || !on();
  const state = !ctx || ctx.state !== 'running' ? 'locked' : muted ? 'off' : 'on';
  if (state === shown) return;
  shown = state;
  pill.dataset.state = state;
  pill.setAttribute('aria-pressed', String(state === 'on'));
  pill.setAttribute('aria-label', state === 'on' ? 'Sound on, click to mute' : LABEL[state]);
  waves.style.display = state === 'on' ? '' : 'none';
  cross.style.display = state === 'on' ? 'none' : '';
  label.textContent = LABEL[state];
}

pill.addEventListener('click', (e) => {
  if (ctx && ctx.state === 'running') {
    muted = !muted;
    out.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
  } else {
    // the spot autoplays silent, so the first sound plays it from the top: the score starts on its first note
    muted = false;
    open();
    if (window.__AD) window.__AD.play(0);
  }
  paint();
  if (e.detail > 0) pill.blur();
});
// Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js), as on the other pills
pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
// any other click or key on the page opens sound too, as the song's own player always has; never against a mute
const gesture = (e) => { if (!frozen && on() && !muted && !pill.contains(e.target)) open(); };
addEventListener('pointerdown', gesture, true);
addEventListener('keydown', gesture, true);

// picked (or its variant shown): render; picked through the Music pill (a gesture), audio may open now; else stop and hide
const pick = () => {
  if (on()) { prepare(); if (!frozen && !muted && navigator.userActivation && navigator.userActivation.hasBeenActive) open(); }
  else stop();
  paint();
};
addEventListener('variantchange', pick);
addEventListener('musicchange', pick);
if (on()) prepare();
paint();

function frame() {
  follow();
  requestAnimationFrame(frame);
}
if (!frozen) requestAnimationFrame(frame);

// QA: the cue sheet, the render, the live lock, and the mix as a 32-bit float WAV (base64) or a stem render
window.__SCORE_V15 = {
  get ownsSong() { return !!buffer && songIn; },
  get ready() { return !!buffer; },
  get sheet() { return sheet; },
  get reduction() { return reduction; },
  get renderMs() { return renderMs; },
  get headMs() { return headMs; },
  get playingFrom() { return src ? (src.buf === buffer ? 'score' : 'head') : null; },
  // the head against the whole score over the head's span: the largest sample difference (0 means the swap is seamless)
  headDiff() {
    if (!head || !buffer) return null;
    let most = 0;
    for (let c = 0; c < 2; c++) { const a = head.getChannelData(c), b = buffer.getChannelData(c); for (let i = 0; i < a.length - 2400; i++) most = Math.max(most, Math.abs(a[i] - b[i])); }
    return most;
  },
  get state() { return shown; },
  get heard() { return ctx && src ? heard() : null; },
  get latency() { return ctx ? latency() : null; },
  prepare,
  async wav(only = null) {
    await prepare();
    let buf = buffer;
    if (only) {
      let song = null;
      if (only === 'song') song = await new OfflineAudioContext(2, 1, SR).decodeAudioData(await (await fetch(plan().SONG)).arrayBuffer());
      buf = (await renderScore(sheet, { song, only })).buf;
    }
    return toWav(buf);
  },
};

(window.__PICKS ||= {})[PICK] = { ready: () => !!(buffer || head) || failed, sounding: () => !!src && !!ctx && ctx.state === 'running' && !muted };

function toWav(buf) {
  const n = buf.length, chans = buf.numberOfChannels, bytes = new ArrayBuffer(44 + n * chans * 4), dv = new DataView(bytes);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); dv.setUint32(4, 36 + n * chans * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 3, true); dv.setUint16(22, chans, true); dv.setUint32(24, buf.sampleRate, true);
  dv.setUint32(28, buf.sampleRate * chans * 4, true); dv.setUint16(32, chans * 4, true); dv.setUint16(34, 32, true);
  str(36, 'data'); dv.setUint32(40, n * chans * 4, true);
  const data = [...Array(chans)].map((_, c) => buf.getChannelData(c));
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < chans; c++, o += 4) dv.setFloat32(o, data[c][i], true);
  let s = '';
  const u8 = new Uint8Array(bytes);
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
