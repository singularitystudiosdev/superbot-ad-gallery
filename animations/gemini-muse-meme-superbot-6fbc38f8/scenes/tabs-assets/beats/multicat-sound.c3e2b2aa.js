// The multicat variant's audio transport (multicat.516afb1a.js): it renders the score once (multicat-score.c3e2b2aa.js:
// the bed, the effects and the ElevenLabs song in one buffer), then plays that buffer in step with the spot's clock,
// which it follows and never drives: started at the clock's time and speed while the clock runs, stopped while it
// pauses, freezes or holds its last frame, restarted on a seek, a speed change or a drift past DRIFT.
// Browsers start sound only after a gesture, so the AudioContext is made on the first click or key while this variant
// shows (or at once when the page already has one), never before, which keeps the console quiet. Until then the pill
// in the bottom left offers "Play with sound", which replays the spot from the top with it; after that the pill mutes
// and unmutes the master gain. The pill is chrome outside the stage: hidden on a frozen capture (body.freeze) and on
// every other variant. window.__AD_SOUND exposes the cue list, the rendered buffer and stem renders for QA.
// On the Music pill it is pick 'v9' (music.47e5d94a.js): the beat calls sync(t) only while v9 is the pick, idle() otherwise,
// so it renders, sounds and shows its pill only then; `failed` hands the song back to the beat's own element.
import { cues, renderScore } from './multicat-score.c3e2b2aa.js';
import { track } from '../../../loads.9e82faf1.js';

const CSS = new URL('../multicat-sound.c3e2b2aa.css', import.meta.url).href;
const MASTER = 1;   // the master gain when sound is on
const DRIFT = 0.12; // seconds the audio may wander from the clock before it restarts on it
const FADE = 0.012; // every start's and stop's ramp, so a seek never clicks
const SHOWN_FOR = 400; // ms without a render before the pill counts the variant as gone

const ICON = {
  on: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="mc-sd-body" d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>',
  off: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="mc-sd-body" d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.8 9.6l4.8 4.8M20.6 9.6l-4.8 4.8"/></svg>',
};
const LABEL = { gate: 'Play with sound', wait: 'Loading sound…', on: 'Sound on', off: 'Sound off' };

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  sheet.onerror = () => console.error(new Error(`multicat sound pill stylesheet failed to load: ${CSS}`));
  document.head.appendChild(sheet);
}

// T: the beat's plan; o: what the score needs beyond it ({ song: url, first, cps, end, songFor, songFade })
export function makeSound(T, o) {
  let ctx = null, master = null, buffer = null, job = null, src = null, muted = false, state = '', failed = false;
  // pressed "Play with sound" before the score finished rendering: the spot waits on its first frame until it has
  let waiting = false;
  let lastT = null, movedAt = -1, lastStep = 0, seenAt = -Infinity;

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'mc-sound';
  pill.hidden = true;
  const showPill = () => {
    const s = waiting ? 'wait' : !ctx || ctx.state !== 'running' ? 'gate' : muted ? 'off' : 'on';
    if (s === state) return;
    state = s;
    pill.dataset.state = s;
    pill.innerHTML = `${ICON[s === 'off' ? 'off' : 'on']}<span>${LABEL[s]}</span>`;
    if (s === 'gate') pill.removeAttribute('aria-pressed'); else pill.setAttribute('aria-pressed', String(s === 'on'));
  };

  function open() {
    if (ctx) return;
    ctx = new AudioContext({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER;
    master.connect(ctx.destination);
    ctx.addEventListener('statechange', showPill);
  }
  function unlock() {
    open();
    if (ctx.state === 'suspended') ctx.resume().catch((e) => console.error(new Error('multicat: the AudioContext would not resume', { cause: e })));
  }
  // a gesture anywhere unlocks the sound while this variant shows; the pill's own press is the pill's to handle
  const gesture = (e) => { if (!pill.hidden && !(e.target instanceof Element && e.target.closest('.mc-sound'))) unlock(); };
  addEventListener('pointerdown', gesture, true);
  addEventListener('keydown', gesture, true);

  pill.addEventListener('click', (e) => {
    if (state === 'wait') return;
    if (state === 'gate') {
      // the first press: sound on, and the spot from the top so the score is heard from its first bar (held on that
      // frame while the score still renders)
      muted = false;
      unlock();
      master.gain.value = MASTER;
      if (window.__AD) { if (buffer) window.__AD.play(0); else { waiting = true; window.__AD.seek(0); } }
    } else {
      muted = !muted;
      master.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, 0.015);
    }
    showPill();
    if (e.detail > 0) pill.blur();
  });
  // Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js), as on the cards' controls
  pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });

  const opts = (cycle, extra = {}) => ({ first: o.first, cps: o.cps, end: o.end, songFor: o.songFor, songFade: o.songFade, cycle, ...extra });
  async function render(cycle) {
    let song = null;
    try {
      const r = await fetch(o.song);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      song = await r.arrayBuffer();
    } catch (e) {
      console.error(new Error(`multicat: the song failed to load, the score renders without it: ${o.song}`, { cause: e }));
    }
    const t0 = performance.now();
    try {
      buffer = await renderScore(T, opts(cycle, { song, sampleRate: ctx ? ctx.sampleRate : 48000 }));
    } finally {
      // a failed render must not leave the spot held on its first frame
      if (waiting) { waiting = false; if (window.__AD) window.__AD.play(0); showPill(); }
    }
    window.__AD_SOUND.renderMs = Math.round(performance.now() - t0);
    window.__AD_SOUND.song = song;
  }
  // the score is this variant's: its length is read once, while this variant shows
  const length = () => (buffer ? buffer.duration : window.__AD.CYCLE);
  window.__AD_SOUND = {
    get cues() { return window.__AD ? cues(T, opts(length())) : null; },
    get buffer() { return buffer; },
    get state() { return ctx ? ctx.state : 'none'; },
    get muted() { return muted; },
    // where the playing buffer is on the spot's clock now, or null while nothing plays
    get position() { return src ? src.t + (ctx.currentTime - src.at) * src.rate : null; },
    // a stem, for QA: only: any of ['music', 'sfx', 'song']; parts: instrument or effect names (multicat-score.c3e2b2aa.js)
    stem: (only, parts) => renderScore(T, opts(length(), { song: window.__AD_SOUND.song, sampleRate: buffer ? buffer.sampleRate : 48000, only, parts })),
  };

  function stop() {
    if (!src) return;
    const { node, gain } = src, now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE);
    node.stop(now + FADE + 0.01);
    src = null;
  }
  function start(t, rate) {
    stop();
    const node = ctx.createBufferSource(), gain = ctx.createGain(), now = ctx.currentTime;
    node.buffer = buffer;
    node.playbackRate.value = rate;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE);
    node.connect(gain).connect(master);
    // what starts now is heard after the output's latency, when the clock is that much on (less a frame's paint)
    const ahead = Math.max(0, (ctx.outputLatency || ctx.baseLatency || 0) - 0.016) * rate;
    node.start(now, Math.min(buffer.duration, t + ahead));
    src = { node, gain, t, at: now, rate };
  }

  addEventListener('variantchange', () => { stop(); pill.hidden = true; });
  addEventListener('musicchange', () => { stop(); pill.hidden = true; });
  // the pill leaves with the variant: a render is what shows it, so it hides once renders stop coming
  (function watch() {
    if (!pill.hidden && performance.now() - seenAt > SHOWN_FOR) { pill.hidden = true; stop(); }
    setTimeout(watch, SHOWN_FOR);
  })();

  (window.__PICKS ||= {}).v9 = { ready: () => !!buffer || failed, sounding: () => !!src && !!ctx && ctx.state === 'running' && !muted };
  return {
    get failed() { return failed; },
    // not the pick (or not this variant): silent, pill hidden
    idle() { stop(); pill.hidden = true; },
    sync(t) {
      const now = performance.now();
      seenAt = now;
      if (!pill.isConnected) { loadSheet(); document.body.appendChild(pill); }
      pill.hidden = false;
      const frozen = document.body.classList.contains('freeze');
      const ad = window.__AD;
      // a page that has already had a gesture may make the context without one
      if (!ctx && !frozen && navigator.userActivation && navigator.userActivation.hasBeenActive) open();
      showPill();
      // the score renders once the clock knows the spot's length (its first frame draws before __AD exists)
      if (!job && ad && !frozen) job = track(render(ad.CYCLE).catch((e) => { failed = true; console.error(new Error('multicat: the score failed to render', { cause: e })); }));
      if (lastT !== null && t !== lastT) { lastStep = t - lastT; movedAt = now; }
      lastT = t;
      // running: the timeline says so (__AD.playing); failing that, the clock moved lately by about a frame's step
      const moving = now - movedAt < 400 && lastStep > 0 && lastStep < 0.2;
      const running = !frozen && (ad && typeof ad.playing === 'boolean' ? ad.playing : moving);
      if (!running || !buffer || !ctx || ctx.state !== 'running' || t >= buffer.duration - 0.05) { if (ctx) stop(); return; }
      const rate = (ad && ad.speed) || 1;
      if (src && src.rate === rate && Math.abs(src.t + (ctx.currentTime - src.at) * rate - t) < DRIFT) return;
      start(t, rate);
    },
  };
}
