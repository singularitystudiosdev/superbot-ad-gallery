// The never-refused engine: every variant is a list of segments laid end to end, and the whole spot is a pure
// function of t (same clock as every-model-one-chat's timeline.js): ?t=<s> freezes a frame, ?t=<s>&play=1 plays on,
// space pauses, arrows step 0.25s, R restarts, a 60fps quantised clock, window.__AD.seek(t) for frame-exact export.
// A segment is { id, dur, mount(sec) -> state, render(state, lt, t) }; the engine owns visibility and the loop dip.
import { clamp, seg } from './lib.js';

export const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

export function run({ W = 1920, H = 1080, segs, dip = 0.35 }) {
  document.documentElement.dataset.ar = W > H ? '16x9' : W === H ? '1x1' : H / W > 1.5 ? '9x16' : '4x5';
  const stage = document.getElementById('stage');
  stage.style.width = W + 'px';
  stage.style.height = H + 'px';
  const dipEl = el('<div id="dip"></div>');
  stage.appendChild(dipEl);

  let acc = 0;
  const S = segs.map((s) => {
    const sec = el(`<section class="scene" id="s-${s.id}"></section>`);
    stage.insertBefore(sec, dipEl);
    const out = { ...s, sec, t0: acc, t1: acc + s.dur };
    acc += s.dur;
    return out;
  });
  const CYCLE = +acc.toFixed(4);
  for (const s of S) {
    try { s.state = s.mount(s.sec, s); } catch (err) { console.error(`[never-refused] mount "${s.id}" failed:`, err && err.stack ? err.stack : err); throw err; }
  }

  let active = null;
  function render(t) {
    let cur = S[S.length - 1];
    for (const s of S) if (t >= s.t0 && t < s.t1) { cur = s; break; }
    if (active !== cur) {
      if (active) active.sec.classList.remove('on');
      cur.sec.classList.add('on');
      active = cur;
    }
    const lt = clamp(t - cur.t0, 0, cur.dur);
    try { cur.render(cur.state, lt, t); } catch (err) { console.error(`[never-refused] render "${cur.id}" threw:`, err && err.stack ? err.stack : err); throw err; }
    dipEl.style.opacity = seg(t, CYCLE - dip, CYCLE).toFixed(3);
  }

  function fit() {
    const k = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  }
  addEventListener('resize', fit); fit();

  const q = new URLSearchParams(location.search);
  const hasT = q.has('t'), freeze = hasT && !q.has('play');
  if (freeze) document.body.classList.add('freeze');
  const FPS = 60;
  let paused = freeze, offset = hasT ? parseFloat(q.get('t')) || 0 : 0, t0 = performance.now();
  const clockNow = () => (paused ? offset : offset + (performance.now() - t0) / 1000);
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (paused) { paused = false; t0 = performance.now(); } else { offset = clockNow(); paused = true; } }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { offset = Math.max(0, clockNow() + (e.key === 'ArrowRight' ? 0.25 : -0.25)); paused = true; }
    else if (e.key === 'r' || e.key === 'R') { offset = 0; t0 = performance.now(); paused = false; }
  });
  const wrap = (t) => { const c = ((t % CYCLE) + CYCLE) % CYCLE; return c >= CYCLE ? 0 : c; };
  function frame() {
    if (!window.__AD.exporting) render(Math.round(wrap(clockNow()) * FPS) / FPS);
    requestAnimationFrame(frame);
  }
  window.__AD = {
    CYCLE, W, H,
    segments: S.map(({ id, t0: a, t1: b }) => ({ id, t0: a, t1: b })),
    seek(t) { window.__AD.exporting = true; paused = true; offset = t; render(wrap(t)); },
  };
  render(wrap(offset));
  requestAnimationFrame(frame);
  const ready = () => { window.__AD.ready = true; };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
  return window.__AD;
}
