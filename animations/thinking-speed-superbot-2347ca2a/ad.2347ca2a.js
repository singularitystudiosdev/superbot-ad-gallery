// thinking-speed-superbot-2347ca2a: actual speed.
// Same engine contract as stop-api-pricing-superbot-e65959ff (superbot-ad-gallery-real-ui): the frame is a pure
// function of t on a 60 fps quantised clock, ?t=<s> freezes a frame (?t=<s>&play=1 plays on), space pauses, arrows
// step 0.25 s, R (or the replay button) restarts, and window.__AD = { CYCLE, ready, seek(t) } drives a frame-exact
// render. ?ar=16x9|4x3|1x1|4x5 reshapes the stage (default 16x9).
//   1. image 1, live: thought-variants/b's bubble thinking at its actual speed (about ten thoughts a second, the
//      clock running up to 11s) beside the thinking mascot, at the screenshot's crop; its last frame is image 1
//   2. hard cut to superbot.gg with the mascot to its right (the reference end card)
import { createThinkScene } from './think.2347ca2a.js';
import { THOUGHTS } from './thoughts.2347ca2a.js';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const outCubic = (x) => 1 - (1 - x) ** 3;
const outQuint = (x) => 1 - (1 - x) ** 5;
const outBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; };

const FPS = 60;
const CUT = 5.0;                 // the thinking runs until here, then the hard cut
const END_PREROLL = 0.06;        // the end card starts this far before the cut, so the first frame after it is not empty
const HAPPY = [6.7, 7.3];        // the mascot's happy eyes, once, on the hold
const CYCLE = 8.2, DIP = 0.35;   // the end card goes to black over its last DIP seconds
const END_TEXT = 'superbot.gg', END_MARK = 220;
// image 1's crop of the thought-variants page, in page px, and the scale it was captured at (1568 px wide)
const CROP = { x: 10.9, w: 1446, h: 280, scale: 1.084 };
const SIDE = 72;                 // minimum side margin, stage px, for the scene and the end card

const RATIOS = { '16x9': [16, 9], '4x3': [4, 3], '1x1': [1, 1], '4x5': [4, 5] };
const q = new URLSearchParams(location.search);
const AR = RATIOS[q.get('ar')] ? q.get('ar') : '16x9';
const H = 1080, W = Math.round(H * RATIOS[AR][0] / RATIOS[AR][1]);
const stage = document.getElementById('stage');
const dip = document.getElementById('dip');
const R = {};

// ---------- build ----------
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

// The assets/sb-mark-live mascot frozen off the wall clock (reference makeMark): its CSS loops are paused and
// seeked to t, it blinks on a fixed schedule, and `happy` swaps its eyes for the source's happy arcs.
function makeMark(size) {
  const host = el('span', 'markhost');
  host.style.cssText = `display:grid;place-items:center;width:${size}px;height:${size}px`;
  const tmp = el('div');
  tmp.style.cssText = 'position:absolute;left:-9999px;top:0';
  document.body.appendChild(tmp);
  const live = window.sbMarkLive(tmp, { size, interactive: false });
  const wrap = live.wrap.cloneNode(true);
  live.destroy(); tmp.remove();
  host.appendChild(wrap);
  const svg = wrap.querySelector('svg');
  const eyes = [...wrap.querySelectorAll('.mark-eye')];
  const baseRy = eyes.map((e) => e.getAttribute('ry'));
  let anims = null;
  return {
    el: host,
    render(t, happy = false) {
      if (!anims || !anims.length) anims = host.isConnected ? wrap.getAnimations({ subtree: true }) : null;
      if (anims) for (const a of anims) { a.pause(); a.currentTime = Math.max(0, t) * 1000; }
      svg.classList.toggle('is-happy', happy);
      // a 0.12 s blink every 3.6 s, every third one a one-eye wink
      const k = Math.floor(t / 3.6), ph = t - k * 3.6, shut = ph > 2.2 && ph < 2.32;
      eyes.forEach((e, i) => e.setAttribute('ry', shut && !(k % 3 === 2 && i === 0) ? '1' : baseRy[i]));
    },
  };
}

function build() {
  stage.style.width = W + 'px';
  const shot = el('div', 'layer shot');
  const tv = shot.appendChild(el('div', 'tv'));
  // image 1's size at 16:9, smaller only when a narrower frame needs the margin
  const s = Math.min(CROP.scale, (W - 2 * SIDE) / CROP.w);
  tv.style.transform = `translate(${((W - CROP.w * s) / 2 - CROP.x * s).toFixed(2)}px, ${((H - CROP.h * s) / 2).toFixed(2)}px) scale(${s.toFixed(5)})`;
  const scene = createThinkScene(tv, THOUGHTS, { lastFrameAt: (Math.round(CUT * FPS) - 1) / FPS });
  const end = el('div', 'layer end',
    `<div class="lock"><div class="words"><div class="end-slide"><h1>${END_TEXT}</h1></div></div><div class="face"></div></div>`);
  const endFace = end.querySelector('.face');
  const endMark = makeMark(END_MARK);
  endFace.appendChild(endMark.el);
  stage.insertBefore(shot, dip); stage.insertBefore(end, dip);
  Object.assign(R, { shot, tv, scene, end, lock: end.querySelector('.lock'), endFace, endMark, endSlide: end.querySelector('.end-slide') });
}

// the bubble's layout pass, and the lock-up kept at its reference size unless a narrower frame would clip it
function measure() {
  R.scene.measure();
  const k = Math.min(1, (W - 2 * SIDE) / R.lock.offsetWidth);
  R.lock.style.transform = k < 1 ? `scale(${k.toFixed(4)})` : 'none';
}

// ---------- the frame ----------
function render(t) {
  // beat 1: the thinking, gone on the cut (no fade: a hard cut)
  const on = t < CUT;
  R.shot.style.visibility = on ? 'visible' : 'hidden';
  if (on) R.scene.render(t);
  // beat 2: the reference end card, the mascot pops, then the line slides out from behind it
  const lt = t - (CUT - END_PREROLL);
  R.end.style.visibility = !on ? 'visible' : 'hidden';
  const f = seg(lt, 0, 0.5), w = seg(lt, 0.3, 1.0);
  R.endFace.style.opacity = outCubic(f).toFixed(3);
  R.endFace.style.transform = `scale(${lerp(0.5, 1, outBack(f)).toFixed(4)})`;
  R.endSlide.style.transform = `translateX(${((1 - outQuint(w)) * 110).toFixed(2)}%)`;
  R.endSlide.style.opacity = w.toFixed(3);
  R.endMark.render(t, t >= HAPPY[0] && t < HAPPY[1]);
  // the dip at the loop
  dip.style.opacity = seg(t, CYCLE - DIP, CYCLE).toFixed(3);
}

// ---------- fit the stage to the window ----------
function fit() {
  const k = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
}

// ---------- boot and the clock (reference timeline) ----------
build();
fit();
addEventListener('resize', fit);
// the bubble is measured in its own faces, so they must be in before the layout pass
await Promise.all([
  document.fonts.load('400 13px "Inter TV"'),
  document.fonts.load('600 40px "Caveat"'),
  R.tv.querySelector('.speed-arrow').decode(),
]).catch((e) => { console.error('think: a font or the arrow failed to load', e); throw e; });
await document.fonts.ready;
measure();

const hasT = q.has('t'), freeze = hasT && !q.has('play');
if (freeze) document.body.classList.add('freeze');
let paused = freeze, offset = hasT ? parseFloat(q.get('t')) || 0 : 0, t0 = performance.now();
const clockNow = () => (paused ? offset : offset + (performance.now() - t0) / 1000);
const wrapT = (t) => ((t % CYCLE) + CYCLE) % CYCLE;
const restart = () => { offset = 0; t0 = performance.now(); paused = false; };
addEventListener('keydown', (e) => {
  if (e.key === ' ') { e.preventDefault(); if (paused) { paused = false; t0 = performance.now(); } else { offset = clockNow(); paused = true; } }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { offset = Math.max(0, clockNow() + (e.key === 'ArrowRight' ? 0.25 : -0.25)); paused = true; }
  else if (e.key === 'r' || e.key === 'R') restart();
});
document.querySelector('.replay').addEventListener('click', restart);
function frame() {
  if (!paused) render(Math.round(wrapT(clockNow()) * FPS) / FPS % CYCLE);
  requestAnimationFrame(frame);
}
render(wrapT(offset));
requestAnimationFrame(frame);
window.__AD = {
  ar: AR, CYCLE, ready: true,
  // frame-exact export and QA: pause the clock and draw t now
  seek(t) { paused = true; offset = t; render(wrapT(t)); },
  // QA: the stream's script and the chunks it reveals
  stream: () => ({ texts: R.scene.texts.length, events: R.scene.events.length }),
};
