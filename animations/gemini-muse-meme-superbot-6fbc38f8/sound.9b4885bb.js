// The spot's sound: one shared WebAudio context for the synthesized score (scenes/tabs-assets/beats/multicat-score.9b4885bb.js),
// the listener's on/off choice (the multicat song's <audio> follows it too), and the pill that shows both. Browsers start
// audio only after a gesture, so the context is made on the first click or key anywhere (or a press on the pill), never on
// load; until then the pill reads "Tap for sound". A press on the pill turns sound off and on again; the choice persists in
// localStorage. Shown only on the variants that carry sound (SOUNDED), hidden on a frozen capture (body.freeze).
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js';

const KEY = 'spot-sound';
const SOUNDED = new Set(['multicat']);
const PICK = 'v3'; // its id on the Music pill (music.47e5d94a.js): it plays, and shows its pill, only while picked
const on = () => SOUNDED.has(variant()) && music() === PICK;
const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { console.error(e); return null; } };
let off = stored() === 'off';
let ac = null, master = null, resuming = false;

// the master chain every score plays into, live or bounced offline: a gain, then a gentle limiter so stacked cues never clip
export function makeMaster(ctx) {
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -10; lim.knee.value = 6; lim.ratio.value = 8; lim.attack.value = 0.003; lim.release.value = 0.15;
  gain.connect(lim).connect(ctx.destination);
  return gain;
}

// the listener turned sound off (the pill)
export const soundOff = () => off;
// the running context and the master's input, or null while locked (no gesture yet), switched off or suspended
export const soundOut = () => (on() && ac && !off && ac.state === 'running' ? { ac, out: master } : null);

function unlock() {
  if (off) return;
  if (!ac) {
    ac = new AudioContext({ latencyHint: 'interactive' });
    master = makeMaster(ac);
    ac.addEventListener('statechange', sync);
  }
  if (ac.state === 'running' || resuming) return;
  // a resume asked for inside a gesture runs: the pill reads on at once, and falls back to locked only if it fails
  resuming = true;
  ac.resume()
    .catch((e) => console.error(new Error('spot sound: the audio context would not resume', { cause: e })))
    .finally(() => { resuming = false; sync(); });
}

const ICON_ON = '<svg class="st-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="st-wave" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg>';
const ICON_OFF = '<svg class="st-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="st-wave" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
const pill = document.createElement('button');
pill.type = 'button';
pill.className = 'sound-toggle';
pill.innerHTML = `${ICON_ON}${ICON_OFF}<span class="st-label"></span>`;
document.body.appendChild(pill);
const label = pill.querySelector('.st-label');

const state = () => (off ? 'off' : ac && (ac.state === 'running' || resuming) ? 'on' : 'locked');
function sync() {
  const s = state();
  pill.dataset.state = s;
  label.textContent = s === 'on' ? 'Sound on' : s === 'off' ? 'Sound off' : 'Tap for sound';
  pill.setAttribute('aria-pressed', String(s === 'on'));
  pill.setAttribute('aria-label', s === 'on' ? 'Sound on: turn off' : 'Turn sound on');
  pill.hidden = !on();
}

function set(nextOff) {
  off = nextOff;
  try { localStorage.setItem(KEY, off ? 'off' : 'on'); } catch (e) { console.error(e); }
  if (off) { if (ac && ac.state === 'running') ac.suspend().catch((e) => console.error(new Error('spot sound: the audio context would not suspend', { cause: e }))); }
  else unlock();
  dispatchEvent(new CustomEvent('soundchange', { detail: !off }));
  sync();
}

pill.addEventListener('click', (e) => {
  set(state() === 'on');
  if (e.detail > 0) pill.blur();
});
// Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js)
pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
// any other first gesture unlocks the context (the pill handles its own press, so a tap on it never unlocks and mutes at once)
const gesture = (e) => { if (on() && !(e.target instanceof Element && e.target.closest('.sound-toggle'))) { unlock(); sync(); } };
addEventListener('pointerdown', gesture, true);
addEventListener('keydown', gesture, true);
addEventListener('variantchange', sync);
// picked on the Music pill (a gesture), the context may start now
addEventListener('musicchange', () => { if (on()) unlock(); sync(); });
sync();
