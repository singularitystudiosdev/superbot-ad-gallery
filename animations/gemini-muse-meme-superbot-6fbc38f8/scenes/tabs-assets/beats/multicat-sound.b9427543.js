// The multicat variant's sound (beats/multicat.516afb1a.js): the score (multicat-score.b9427543.js) renders once,
// offline, then plays as one buffer that follows the spot's clock as the song's audio does: it runs while the clock
// runs, re-cues on a seek, a pause or a speed change, and stays silent on a frozen capture.
// A browser starts audio only after a click or key, so the Sound pill (under the speed pill, this variant only) says
// whether sound is on and switches it, as M does; `muted` mutes the song too. window.__AD_SOUND is the QA hook: the cue
// sheet, the render's peak, and a full mixdown (score plus song) as a WAV.
import { cueSheet, renderScore } from './multicat-score.b9427543.js';
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';

const CSS = new URL('../multicat-sound.b9427543.css', import.meta.url).href;
const DRIFT = 0.06; // re-cue once the heard position strays this far from the clock
const FADE = 0.012; // every start and stop ramps over this, so a re-cue never clicks
// the score takes about 2 s to render, off the main thread: it starts once v17 is picked on the multicat variant (the
// Music pill holds the spot on its first frame until it is in)
const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="sp-body" d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="sp-on" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/><path class="sp-off" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';

let ctx = null, out = null, score = null, rendering = null, failed = false, voice = null, muted = false, pill = null;
// whether audio was still locked when the current click or key began: that gesture unlocks sound, never mutes it
let lockedAtPress = false;
// On the Music pill it is pick 'v17' (music.47e5d94a.js): it renders, wakes, sounds and shows its pill only while picked
const on = () => variant() === 'multicat' && music() === 'v17';

// the realtime context: made inside a gesture (or once the page has had one), so it starts running and never warns
function ensureCtx() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch((e) => console.error(new Error('multicat sound: resume failed', { cause: e }))); return; }
  ctx = new AudioContext({ latencyHint: 'interactive' });
  out = ctx.createGain();
  out.gain.value = muted ? 0 : 1;
  out.connect(ctx.destination);
  ctx.addEventListener('statechange', paint);
  paint();
}
const gesture = () => { lockedAtPress = !ctx || ctx.state !== 'running'; if (on()) ensureCtx(); };
addEventListener('pointerdown', gesture, true);
addEventListener('keydown', gesture, true);

function setMuted(m) {
  muted = m;
  if (out) out.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.015);
  paint();
}

function stop() {
  if (!voice) return;
  const { src, g } = voice, now = ctx.currentTime;
  g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(g.gain.value, now);
  g.gain.linearRampToValueAtTime(0, now + FADE);
  src.stop(now + FADE + 0.005);
  voice = null;
}

function start(off, rate) {
  stop();
  const src = ctx.createBufferSource(), g = ctx.createGain(), now = ctx.currentTime;
  src.buffer = score.buffer;
  src.playbackRate.value = rate;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(1, now + FADE);
  src.connect(g).connect(out);
  src.start(now, off);
  voice = { src, g, off, at: now, rate };
  src.onended = () => { if (voice && voice.src === src) voice = null; };
}

// follow the clock at t: what is heard now should be the buffer at t (offset by the output's latency)
function follow(t) {
  const ad = window.__AD;
  const running = on() && !!ad && ad.playing && !document.body.classList.contains('freeze');
  if (!ctx || ctx.state !== 'running' || !score) return;
  // a finished run lets the closing chord ring out; any other stop silences it
  if (!running) { if (!(ad && t >= ad.CYCLE - 0.02)) stop(); return; }
  const rate = ad.speed || 1;
  const want = t + ((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * rate;
  if (want >= score.buffer.duration - 0.05) return;
  if (voice && voice.rate === rate && Math.abs(voice.off + (ctx.currentTime - voice.at) * rate - want) < DRIFT) return;
  start(want, rate);
}

function paint() {
  if (!pill) return;
  pill.hidden = !on();
  const state = !ctx || ctx.state !== 'running' ? 'locked' : muted ? 'muted' : 'on';
  pill.dataset.state = state;
  pill.setAttribute('aria-pressed', String(state === 'on'));
  pill.querySelector('.sp-text').textContent = state === 'locked' ? 'Click for sound' : state === 'muted' ? 'Off' : 'On';
}

function toggle() {
  if (lockedAtPress || !ctx || ctx.state !== 'running') { lockedAtPress = false; ensureCtx(); setMuted(false); return; }
  setMuted(!muted);
}

function mountPill() {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  sheet.onerror = () => console.error(new Error(`multicat sound pill stylesheet failed to load: ${CSS}`));
  document.head.appendChild(sheet);
  pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'sound-pill-v17';
  pill.innerHTML = `<span class="vs-label" aria-hidden="true">Sound</span><span class="sp-state">${SPEAKER}<span class="sp-text"></span></span>`;
  pill.setAttribute('aria-label', 'Sound');
  document.body.appendChild(pill);
  // the pill takes its own Space and Enter (not the spot's clock), and a mouse press hands the keys back to the clock
  pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
  pill.addEventListener('click', (e) => { toggle(); if (e.detail > 0) pill.blur(); });
  addEventListener('keydown', (e) => {
    if (!on() || e.metaKey || e.ctrlKey || e.altKey || (e.key !== 'm' && e.key !== 'M')) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target && e.target.tagName)) return;
    toggle();
  });
  // picking this variant in the pill is itself a click: sound can start with it
  const pick = () => {
    if (on()) { if (navigator.userActivation && navigator.userActivation.hasBeenActive) ensureCtx(); } else if (ctx) stop();
    paint();
  };
  addEventListener('variantchange', pick);
  // picked through the Music pill (a gesture): sound can start with it, as with a variant pick
  addEventListener('musicchange', pick);
  paint();
}

// a 16-bit PCM WAV of an AudioBuffer
function wav(buf) {
  const n = buf.length, ch = buf.numberOfChannels, bytes = 44 + n * ch * 2, v = new DataView(new ArrayBuffer(bytes));
  const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, ch, true); v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * ch * 2, true);
  v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * ch * 2, true);
  const data = [...Array(ch).keys()].map((c) => buf.getChannelData(c));
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < ch; c++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, data[c][i])) * 0x7fff, true);
  return new Blob([v], { type: 'audio/wav' });
}

// the score with the song laid in as the beat plays it (its gain, its fade under the end card, its stop)
async function mixdown(song) {
  const { buffer } = await rendering;
  const ac = new OfflineAudioContext({ numberOfChannels: 2, length: buffer.length, sampleRate: buffer.sampleRate });
  const a = ac.createBufferSource();
  a.buffer = buffer; a.connect(ac.destination); a.start(0);
  const res = await fetch(song.url);
  if (!res.ok) throw new Error(`multicat sound: the song failed to load for the mixdown (${res.status} ${song.url})`);
  const s = ac.createBufferSource(), g = ac.createGain();
  s.buffer = await ac.decodeAudioData(await res.arrayBuffer());
  g.gain.setValueAtTime(song.gain, 0); g.gain.setValueAtTime(song.gain, song.fadeAt); g.gain.linearRampToValueAtTime(0, song.fadeAt + song.fadeLen);
  s.connect(g).connect(ac.destination);
  s.start(song.at, 0, song.stopAt - song.at);
  const mix = await ac.startRendering();
  return { wav: wav(mix), duration: mix.duration };
}

// opts: { first, T, endDelay, endLen, song: { url, at, gain, fadeAt, fadeLen, stopAt } }
export function makeSound(opts) {
  const cues = cueSheet(opts);
  const render = () => {
    if (rendering) return;
    rendering = renderScore(cues).then((r) => { score = r; return r; });
    rendering.catch((e) => { failed = true; console.error(new Error('multicat sound: the score failed to render', { cause: e })); });
  };
  // rendered when first picked (sync renders too), never in the background while another soundtrack plays
  if (on()) render();
  mountPill();
  if (navigator.userActivation && navigator.userActivation.hasBeenActive && on()) ensureCtx();
  window.__AD_SOUND_V17 = {
    cues,
    get ready() { return rendering && rendering.then(({ buffer, peak }) => ({ duration: buffer.duration, peak })); },
    get state() { return pill ? pill.dataset.state : 'none'; },
    // the buffer position being fed to the output now, and its rate, or null while nothing plays
    get voice() { return voice && { at: voice.off + (ctx.currentTime - voice.at) * voice.rate, rate: voice.rate }; },
    mixdown: () => mixdown(opts.song),
    score: () => rendering && rendering.then(({ buffer }) => wav(buffer)),
    stem: (name) => renderScore(cues, name).then(({ buffer }) => wav(buffer)),
  };
  (window.__PICKS ||= {}).v17 = { ready: () => !!score || failed, sounding: () => !!voice && !!ctx && ctx.state === 'running' && !muted };
  return {
    sync(t) {
      render();
      follow(t);
    },
    get muted() { return muted; },
  };
}
