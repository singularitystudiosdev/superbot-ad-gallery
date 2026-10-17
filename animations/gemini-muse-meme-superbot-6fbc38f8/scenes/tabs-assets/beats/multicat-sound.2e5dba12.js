// The multicat variant's soundtrack, live (multicat.516afb1a.js drives it from its render). The score
// (multicat-score.2e5dba12.js) renders once, offline, into one buffer on the spot's own clock, then plays following that
// clock through one master gain: a seek, a pause, the end of the run or a Speed pick restarts it at the clock's time and
// rate, so the spot stays a pure function of t and the audio never drives it. Browsers start audio only after a gesture,
// so a pill top left reads "Tap for sound" until the page has had one (any click or key unlocks it, as any lets the song's
// own <audio> play); after that the pill, or M, mutes and unmutes. `muted` is that user mute, which the song follows too.
import { renderScore } from './multicat-score.2e5dba12.js';
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js';

const ID = 'multicat';
const PICK = 'v2'; // its id on the Music pill (music.47e5d94a.js): it plays, and shows its pill, only while picked
const on = () => variant() === ID && music() === PICK;
const CSS = new URL('../multicat-sound.2e5dba12.css', import.meta.url).href;
const RESYNC = 0.1; // how far (s) the audio may wander from the clock before it restarts at the clock's time
// lucide volume-2 and volume-x (api.iconify.design, lucide set)
const SPEAKER = 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z';
const ICON = {
  on: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SPEAKER}M16 9a5 5 0 0 1 0 6m3.364 3.364a9 9 0 0 0 0-12.728"/></svg>`,
  off: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SPEAKER}m5.5 9.798l5-5m-5 0l5 5"/></svg>`,
};
const LABEL = { locked: 'Tap for sound', on: 'Sound on', off: 'Sound off' };
const isField = (n) => /^(INPUT|SELECT|TEXTAREA)$/.test(n && n.tagName);
const fromPill = (e) => e.target instanceof Element && !!e.target.closest('.mc-sound');

// score: what renderScore takes ({ k, T, ends }, multicat-score.2e5dba12.js)
export function makeSound(score) {
  let ctx = null, master = null, buffer = null, rendering = null, voice = null, userMuted = false, pill = null;
  const state = () => (!ctx || ctx.state !== 'running' ? 'locked' : userMuted ? 'off' : 'on');

  function paint() {
    const s = state();
    if (!pill || pill.dataset.state === s) return;
    pill.dataset.state = s;
    pill.setAttribute('aria-pressed', String(s === 'on'));
    pill.innerHTML = `${ICON[s === 'on' ? 'on' : 'off']}<span>${LABEL[s]}</span>`;
  }
  // in a gesture (or after one): the context may start now
  function unlock() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = userMuted ? 0 : 1;
      master.connect(ctx.destination);
      ctx.addEventListener('statechange', paint);
    }
    if (ctx.state === 'suspended') ctx.resume().then(paint, (e) => console.error(new Error('multicat soundtrack: the audio context would not start', { cause: e })));
    paint();
  }
  function toggle() {
    if (state() === 'locked') { userMuted = false; unlock(); return; }
    userMuted = !userMuted;
    master.gain.setTargetAtTime(userMuted ? 0 : 1, ctx.currentTime, 0.02);
    paint();
  }

  function mount() {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = CSS;
    sheet.onerror = () => console.error(new Error(`multicat sound pill stylesheet failed to load: ${CSS}`));
    document.head.appendChild(sheet);
    pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'mc-sound';
    pill.addEventListener('click', (e) => { toggle(); if (e.detail > 0) pill.blur(); });
    // Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js)
    pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
    document.body.appendChild(pill);
    paint();
    addEventListener('pointerdown', (e) => { if (on() && !fromPill(e)) unlock(); }, true);
    addEventListener('keydown', (e) => {
      if (!on() || fromPill(e)) return;
      if ((e.key === 'm' || e.key === 'M') && !e.repeat && !isField(e.target)) toggle(); else unlock();
    }, true);
    // leaving the variant, or another pick on the Music pill, hides the pill and silences the soundtrack
    const leave = () => { pill.hidden = !on(); if (!on()) stop(); };
    addEventListener('variantchange', leave);
    addEventListener('musicchange', leave);
    // the page already had a gesture (the variant was picked by click): no need to ask
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) unlock();
  }

  function stop() {
    if (!voice) return;
    const { src, amp } = voice, now = ctx.currentTime;
    amp.gain.setTargetAtTime(0, now, 0.01);
    src.stop(now + 0.06);
    voice = null;
  }
  function start(at, rate) {
    const src = ctx.createBufferSource(), amp = ctx.createGain(), now = ctx.currentTime;
    src.buffer = buffer;
    src.playbackRate.value = rate;
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(1, now + 0.02);
    src.connect(amp).connect(master);
    src.start(now, at);
    voice = { src, amp, c0: now, at, rate };
  }
  const position = () => voice.at + (ctx.currentTime - voice.c0) * voice.rate;
  // plays while the clock runs, at the clock's time and rate
  function follow(t) {
    const ad = window.__AD, rate = (ad && ad.speed) || 1;
    const running = !!ad && ad.playing && !document.body.classList.contains('freeze');
    if (state() !== 'on' || !buffer || !running || t >= buffer.duration - 0.05) { stop(); return; }
    // what plays now is heard after the output latency, so it plays that much ahead
    const want = t + Math.min(0.1, ctx.outputLatency || ctx.baseLatency || 0) * rate;
    if (voice && (voice.rate !== rate || Math.abs(position() - want) > RESYNC)) stop();
    if (!voice) start(want, rate);
  }

  function prepare() {
    rendering = renderScore(score).then((r) => {
      buffer = r.buffer;
      // for QA: the cue sheet, the mix and its levels, the score's input (to render a stem), and what is playing now
      window.__MC_SOUND = { score, buffer, cues: r.cues, grid: r.grid, levels: r.levels, get state() { return { pill: state(), playing: !!voice, at: voice ? position() : null, rate: voice ? voice.rate : null }; } };
    }, (e) => console.error(new Error('multicat soundtrack failed to render', { cause: e })));
  }

  return {
    get muted() { return userMuted; },
    render(t) {
      if (!on()) { if (pill) pill.hidden = true; stop(); return; }
      if (!pill) mount();
      if (pill.hidden) pill.hidden = false;
      if (!rendering) prepare();
      follow(t);
    },
  };
}
