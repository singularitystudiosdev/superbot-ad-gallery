// The spot's sound gate: one AudioContext every score plays through (made on the first click or key anywhere, since a
// browser starts audio only after a gesture), its master gain, the mute state, and the Sound pill that shows them. The
// pill sits under the speed pill (variant-select.9e82faf1.js), only on a variant that scores itself (SCORED), and hides on a
// frozen capture (body.freeze) like the other pills. Clicking it or pressing M turns the sound on, and from then on
// toggles it; the multicat song (an <audio>, beats/multicat.516afb1a.js) follows the same mute through songLevel().
// On the Music pill it is pick 'v16' (music.47e5d94a.js): it wakes audio, takes M and shows its pill only while the variant
// is multicat (or multicat-credits, multidog-credits, amazon-costumes, halloween-shopping or discord-credits) and v16 is the
// pick. A variant in OWN plays its own score through this gate whatever the Music pick (hotelcall: its call and score,
// beats/hotelcall-score.f934b5ee.js); it has no Music pill, so its Sound pill takes that pill's place
// (sound.96834de7.css .sound-own).
import { variant } from './variant.9e82faf1.js?v=3';
import { music } from './music.47e5d94a.js?v=2';

// the base chain and its bare twins, cat and dog (v16 is their default soundtrack), and the Amazon costumes cut, which
// plays it re-cued (beats/costumes.34c23b1d.js), as does the Halloween shopping chain (beats/halloween.37ff9e93.js)
// (and the refund chain, beats/refund-score.d3537b02.js)
// (and the bare Discord chain, beats/discord.bccc0fdd.js)
const SCORED = new Set(['multicat', 'multicat-credits', 'multidog-credits', 'amazon-costumes', 'halloween-shopping', 'garmin-strava', 'refund', 'discord-credits']);
const OWN = new Set(['hotelcall']);
const on = () => OWN.has(variant()) || (SCORED.has(variant()) && music() === 'v16');
const LEVEL = 1; // the master gain while unmuted
export const sound = { ctx: null, out: null, muted: false };

const blocked = () => !sound.ctx || sound.ctx.state !== 'running';
// the song element's volume factor: silent only when muted (its own play() waits out the autoplay policy)
export const songLevel = () => (sound.muted ? 0 : 1);

function wake() {
  if (!sound.ctx) {
    sound.ctx = new AudioContext({ latencyHint: 'interactive' });
    sound.out = sound.ctx.createGain();
    sound.out.gain.value = sound.muted ? 0 : LEVEL;
    sound.out.connect(sound.ctx.destination);
    sound.ctx.addEventListener('statechange', sync);
  }
  if (sound.ctx.state === 'suspended') sound.ctx.resume().catch((e) => console.error(new Error('the spot\'s audio could not start', { cause: e })));
  sync();
}

function setMuted(v) {
  sound.muted = v;
  if (sound.out) sound.out.gain.setTargetAtTime(v ? 0 : LEVEL, sound.ctx.currentTime, 0.015);
  sync();
}

// the pill's press and M: a blocked gate turns the sound on, an open one toggles it
function press() {
  if (blocked()) { wake(); setMuted(false); } else setMuted(!sound.muted);
}

// any other click or key wakes the audio too (capture, so a control that stops its key still counts); never a mute change
const gesture = (e) => {
  if (!on()) return;
  if (e.target && e.target.closest && e.target.closest('.sound-toggle')) return;
  if (e.type === 'keydown' && (e.key === 'm' || e.key === 'M')) return;
  wake();
};
addEventListener('pointerdown', gesture, { capture: true });
addEventListener('keydown', gesture, { capture: true });
addEventListener('keydown', (e) => {
  if ((e.key !== 'm' && e.key !== 'M') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target && e.target.tagName)) return;
  if (!on()) return;
  press();
});

const sheet = document.createElement('link');
sheet.rel = 'stylesheet';
sheet.href = new URL('./sound.96834de7.css', import.meta.url).href;
sheet.onerror = () => console.error(new Error(`sound pill stylesheet failed to load: ${sheet.href}`));
document.head.appendChild(sheet);

const ON = '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="sw" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.6a7.6 7.6 0 0 1 0 10.8"/>';
const OFF = '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="sw" d="M16 9.5l5 5M21 9.5l-5 5"/>';
const pill = document.createElement('div');
pill.className = 'sound-toggle';
pill.hidden = true;
pill.innerHTML = '<button type="button" aria-pressed="false" title="Sound (M)"><svg viewBox="0 0 24 24" aria-hidden="true"></svg><span></span></button>';
document.body.appendChild(pill);
const btn = pill.querySelector('button'), icon = btn.querySelector('svg'), label = btn.querySelector('span');
btn.addEventListener('click', (e) => { press(); if (e.detail > 0) btn.blur(); });
// space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js)
btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });

let shown = '';
function sync() {
  pill.hidden = !on();
  pill.classList.toggle('sound-own', OWN.has(variant()));
  const state = sound.muted ? 'off' : blocked() ? 'blocked' : 'on';
  if (state === shown) return;
  shown = state;
  icon.innerHTML = state === 'on' ? ON : OFF;
  label.textContent = state === 'on' ? 'Sound on' : state === 'off' ? 'Sound off' : 'Turn sound on';
  btn.setAttribute('aria-pressed', String(state === 'on'));
  pill.dataset.state = state;
}
addEventListener('variantchange', sync);
// picked through the Music pill (a gesture): audio may wake now
addEventListener('musicchange', () => { if (on() && navigator.userActivation && navigator.userActivation.hasBeenActive) wake(); else sync(); });
sync();
