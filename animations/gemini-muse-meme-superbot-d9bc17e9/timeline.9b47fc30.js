// Gemini-only spot: "make me a muse meme" in the superbot hub. The spot is a pure function of t, like the source
// engine: ?t=<s> freezes a frame, ?t=<s>&play=1 plays on from there, space pauses, arrows step 0.25s, R restarts;
// a 60fps quantised clock. The one scene (scenes/tabs.js) loops forever.
import * as lib from './lib.9b47fc30.js';
import tabs from './scenes/tabs.9b47fc30.js';
import { settled } from './loads.9e82faf1.js';

const { seg } = lib;
const H = 1080;
const W = () => (window.AR && window.AR.w) || 1920;
const stage = document.getElementById('stage');
const SCENE_FADE = 0.3;
const CYCLE = tabs.dur;

// the scene section, mounted once; it is shown only while its opacity is above zero
const section = document.createElement('section');
section.className = 'scene';
section.id = 's-tabs';
stage.prepend(section);
tabs.mount(section);

// one frame: fade the section at the loop's ends, then draw the scene at its local time
function render(t) {
  const o = seg(t, 0, SCENE_FADE) * (1 - seg(t, CYCLE - SCENE_FADE, CYCLE));
  section.style.opacity = o.toFixed(3);
  section.classList.toggle('on', o > 0);
  tabs.render(t, { W: W(), H });
}

// ---------- fit the stage to the window (assets/ar.js sets the width) ----------
function fit() {
  const w = W();
  stage.style.width = w + 'px';
  stage.style.height = H + 'px';
  const k = Math.min(innerWidth / w, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
}
addEventListener('resize', fit);
addEventListener('archange', fit);
fit();

// ---------- the clock ----------
// time = base + (performance.now() - started) while playing; base alone while paused, so seeks and pauses are exact
const q = new URLSearchParams(location.search);
const hasT = q.has('t'), freeze = hasT && !q.has('play');
if (freeze) document.body.classList.add('freeze');
const FPS = 60;
let paused = freeze, base = hasT ? parseFloat(q.get('t')) || 0 : 0, started = performance.now();
const now = () => (paused ? base : base + (performance.now() - started) / 1000);

// the clock wrapped into [0, CYCLE) and quantised to whole frames
function timeNow() {
  const t = ((now() % CYCLE) + CYCLE) % CYCLE;
  const f = Math.round(t * FPS) / FPS;
  return f >= CYCLE ? 0 : f;
}

addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    if (paused) { paused = false; started = performance.now(); }
    else { base = now(); paused = true; }
  }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { base = Math.max(0, now() + (e.key === 'ArrowRight' ? 0.25 : -0.25)); paused = true; }
  else if (e.key === 'r' || e.key === 'R') { base = 0; started = performance.now(); paused = false; }
});

function frame() {
  render(timeNow());
  requestAnimationFrame(frame);
}
render(timeNow());
requestAnimationFrame(frame);

// frame-exact QA: pause the clock and draw t now; ready once every tracked asset (loads.9e82faf1.js) is in
window.__AD = {
  CYCLE,
  get ready() { return settled(); },
  seek(t) { paused = true; base = t; started = performance.now(); render(timeNow()); },
};
