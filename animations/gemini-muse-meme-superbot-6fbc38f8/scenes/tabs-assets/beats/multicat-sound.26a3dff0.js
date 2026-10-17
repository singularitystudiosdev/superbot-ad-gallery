// The multicat spot's sound design, live. The score (multicat-score.26a3dff0.js) renders once in a worker from the
// beat's own cue times, then plays from an AudioBuffer that follows the spot's clock the way the song does: it runs
// while the clock runs (window.__AD.playing), at the clock's speed, and re-seeks when it drifts past SYNC. It starts
// rendering on load when the page opens on this variant, else the first time the variant draws. Browsers hold sound
// until a gesture: the next click or key starts it, at the clock's current time.
// It is one pick on the Music pill (music.47e5d94a.js): it renders, sounds and unlocks audio only while the 'multicat'
// variant shows AND the pick is PICK; any other pick (or variant) stops it and it makes no sound, no context, no render.
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';

const PICK = 'v11'; // its id on the Music pill
const active = () => variant() === 'multicat' && music() === PICK;
const activated = () => !!(navigator.userActivation && navigator.userActivation.hasBeenActive);

const q = new URLSearchParams(location.search);
// ?mix=broadcast plays the US TV deliverable level (ATSC A/85: -24 LKFS, true peak under -2 dBTP), 8.2 dB under the web
// master (-15.8 LUFS with the song in it); the song is trimmed with it
const MASTER = q.get('mix') === 'broadcast' ? Math.pow(10, -8.2 / 20) : 1;
// the song's level in the mix: its opening 6.5 s measure -14.1 LUFS (ffmpeg ebur128), the bed's grooves about -15.2,
// so it plays 1.1 dB down to sit level with them
export const SONG_GAIN = 0.88 * MASTER;
const SYNC = 0.045; // seconds of drift (under three frames) before the buffer re-seeks to the picture
const SONG_FADE = 0.5; // the song's fade-out as the end card covers the chat, so the sting lands with the song 16 dB down
const FADE = 0.012; // every start and stop ramps over this, so a seek or a pause never clicks

export function makeSound(cues) {
  let buffer = null, rendering = false, failed = false, ctx = null, out = null, voice = null, stats = null, gestured = false, listening = false;
  const latency = () => (ctx && (ctx.outputLatency || ctx.baseLatency)) || 0;

  function render() {
    if (rendering) return;
    rendering = true;
    const worker = new Worker(new URL('./multicat-score-worker.26a3dff0.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      worker.terminate();
      if (data.error) { failed = true; console.error(new Error(`multicat sound: the score failed to render: ${data.error}`)); return; }
      buffer = new AudioBuffer({ numberOfChannels: 2, length: data.L.length, sampleRate: data.sr });
      buffer.copyToChannel(data.L, 0);
      buffer.copyToChannel(data.R, 1);
      stats = data.stats;
    };
    worker.onerror = (e) => {
      failed = true;
      console.error(new Error(`multicat sound: the score worker failed: ${e.message || 'module load error'}`), e);
      worker.terminate();
    };
    worker.postMessage(cues);
  }

  function context() {
    if (ctx) return;
    // no output until the page has been activated (a gesture), so it never trips the autoplay warning
    if (!gestured && !activated()) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    out = ctx.createGain();
    out.gain.value = MASTER;
    out.connect(ctx.destination);
    // held for a gesture (autoplay policy), or suspended later by the system: any click or key resumes it, as the song
    // waits for one
    resume();
  }
  let resuming = false;
  function resume() {
    if (!ctx || ctx.state === 'running' || resuming) return;
    resuming = true;
    ctx.resume()
      .catch((e) => console.error(new Error('multicat sound: the audio context would not resume', { cause: e })))
      .finally(() => { resuming = false; });
  }
  // a click or key counts (and resumes a held output) only while this pick is the sound
  function onGesture() {
    if (!active()) return;
    gestured = true;
    resume();
  }
  if (!listening) {
    listening = true;
    addEventListener('pointerdown', onGesture, true);
    addEventListener('keydown', onGesture, true);
  }

  function stop() {
    if (!voice) return;
    const { src, gain } = voice, now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE);
    src.stop(now + FADE + 0.005);
    voice = null;
  }

  // play from the picture's time t at the clock's rate; the offset leads by the output latency, so what is heard
  // now is what is on screen now
  function start(t, rate) {
    stop();
    const off = t + latency() * rate;
    if (off >= buffer.duration) return;
    const src = ctx.createBufferSource(), gain = ctx.createGain(), at = ctx.currentTime;
    src.buffer = buffer;
    src.playbackRate.value = rate;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(1, at + FADE);
    src.connect(gain).connect(out);
    src.onended = () => { src.disconnect(); gain.disconnect(); };
    src.start(at, off);
    voice = { src, gain, at, off, rate };
  }

  // where the buffer being heard is now, on the picture's clock
  const heard = () => (voice ? voice.off + (ctx.currentTime - voice.at) * voice.rate - latency() * voice.rate : null);

  // every frame the beat draws: t is the spot's clock, running whether it moves
  function sync(t, running) {
    if (!active()) { if (voice) stop(); return; }
    if (!buffer) { if (!failed) render(); return; }
    if (!running || t >= buffer.duration - FADE) { if (voice) stop(); return; }
    context();
    if (!ctx) return;
    if (ctx.state !== 'running') { resume(); return; }
    const rate = (window.__AD && window.__AD.speed) || 1;
    if (voice && voice.rate === rate && Math.abs(heard() - t) < SYNC) return;
    start(t, rate);
  }

  // picked (or the page opened on it): render now; any other pick or variant: stop the voice
  const follow = () => { if (active()) { if (!buffer && !failed) render(); } else if (voice) stop(); };
  follow();
  addEventListener('variantchange', follow);
  addEventListener('musicchange', follow);
  // frame-exact QA reads the render's measurements and the live drift here (its own name: v9 and v17 keep __AD_SOUND)
  window.__AD_SOUND_V11 = {
    cues,
    get stats() { return stats; },
    get ready() { return !!buffer; },
    get failed() { return failed; },
    get state() { return ctx ? ctx.state : 'none'; },
    get playing() { return !!voice; },
    drift(t) { const h = heard(); return h === null ? null : h - t; },
  };
  // the beat's song element sits in this mix at SONG_GAIN and fades on a squared curve over SONG_FADE as the end card covers
  // the chat; call it right after the beat's own syncAudio (at = seconds into the song, songFor = where its fade starts)
  const trim = (audio, at, songFor) => {
    if (!active() || at < 0) return;
    const p = Math.min(1, Math.max(0, (at - songFor) / SONG_FADE));
    audio.volume = SONG_GAIN * Math.pow(1 - p, 2);
  };
  (window.__PICKS ||= {})[PICK] = { ready: () => !!buffer || failed, sounding: () => !!voice && !!ctx && ctx.state === 'running' };
  return { sync, trim };
}
