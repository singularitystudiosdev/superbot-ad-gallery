// Entry: builds the stage for the picked variant (?variant=), fits it to the window and runs the clock. ?t= freezes a
// frame, ?clean=1 hides the picker. Space pauses. window.__cc.seek(t) paints any frame (the screenshot script uses it).
import { VARIANTS, buildFrame } from './frame.04568226.js';
import { buildThread } from './thread.04568226.js';
import { LOOP, T } from './script.04568226.js';
import { ease, seg, outCubic, show } from './lib.04568226.js';

const q = new URLSearchParams(location.search);
const frozen = q.has('t') ? Number(q.get('t')) : null;
if (q.get('clean') === '1') document.documentElement.classList.add('is-clean');
let variant = VARIANTS.find((x) => x.id === q.get('variant')) || VARIANTS[0];

const stage = document.getElementById('stage');
const pick = document.querySelector('.pick');
let paint = () => {};
let seekTo = null;

function build() {
  stage.innerHTML = '<div class="col"><div class="thread"></div><div class="dock"></div><div class="cmp"></div></div>';
  const dock = stage.querySelector('.dock');
  const frame = buildFrame(variant);
  dock.appendChild(frame.node);
  const paintThread = buildThread(stage.querySelector('.thread'), stage.querySelector('.cmp'));
  let cardH = 0;
  paint = (t) => {
    if (!cardH) cardH = frame.node.offsetHeight;
    // the live view rises in under the thread and stays docked above the composer for the rest of the run
    dock.style.height = `${(cardH * outCubic(seg(t, T.card, T.card + 0.55))).toFixed(2)}px`;
    show(frame.node, ease(t, T.card + 0.08, 0.5), 18, 0.97);
    paintThread(t);
    frame.paint(t);
    stage.style.opacity = Math.min(seg(t, 0, 0.3), 1 - seg(t, LOOP - 0.5, LOOP)).toFixed(3);
  };
  document.title = `superbot computer control, ${variant.label.replace(/^\d+ /, '').toLowerCase()}`;
}

function fit() {
  const box = stage.parentElement.getBoundingClientRect();
  const k = Math.min(box.width / 1440, box.height / 900);
  stage.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
}

function picker() {
  pick.innerHTML = `${VARIANTS.map((x) => `<button type="button" data-v="${x.id}" aria-pressed="${x === variant}">${x.label}</button>`).join('')}
    <span class="pick-sp"></span><button type="button" data-a="pause">⏸ Pause</button><button type="button" data-a="restart">↺ Restart</button>`;
  pick.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.v) {
      variant = VARIANTS.find((x) => x.id === b.dataset.v);
      const u = new URL(location.href);
      u.searchParams.set('variant', variant.id);
      history.replaceState(null, '', u);
      pick.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      build();
    } else if (b.dataset.a === 'pause') toggle();
    else restart();
  });
}

let start = performance.now(), paused = false, pausedAt = 0;
const now = () => (paused ? pausedAt : ((performance.now() - start) / 1000) % LOOP);
function toggle() {
  if (paused) { start = performance.now() - pausedAt * 1000; paused = false; } else { pausedAt = now(); paused = true; }
  const b = pick.querySelector('[data-a="pause"]');
  if (b) b.textContent = paused ? '▶ Play' : '⏸ Pause';
}
function restart() { start = performance.now(); if (paused) pausedAt = 0; }
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.target.closest('button')) { e.preventDefault(); toggle(); } });

function tick() {
  paint(seekTo != null ? seekTo : frozen != null ? frozen : now());
  if (frozen == null) requestAnimationFrame(tick);
}

await document.fonts.ready;
picker();
build();
fit();
addEventListener('resize', fit);
window.__cc = { seek(t) { seekTo = t; paint(t); }, LOOP };
tick();
