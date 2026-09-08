/* superbot — orbit hero.
   Eight IDE panes pop in on a ring, wind up (angular velocity ramps, the ring
   spirals inward as anticipation), and are captured by the central circle:
   one flash, one shockwave, each IDE's accent handed to the ring in turn, the
   mascot revealed top-down. Then the hero settles, and replay is a REVERSE —
   the panes fly back out to the ring and the wind-up reruns.
   One rAF timeline, per-frame polar math, transform/opacity only.
   Technique per sweep: orbiting-logos hero + absorber convergence; polar
   formulation keeps panes upright by construction (no counter-rotation). */

import { Mascot } from './mascot.js';

// ---------------------------------------------------------------------------
// content
// ---------------------------------------------------------------------------

const IDES = [
  { name: 'VS Code', accent: '#4ba3f5', lines: [
    '<span class="c">// extension host</span>',
    '<span class="k">const</span> bot = <span class="k">await</span> wake()',
    'bot.<span class="k">delegate</span>(task)<span class="cur"></span>',
  ]},
  { name: 'Cursor', accent: '#c48be0', lines: [
    '<span class="c">// tab, tab, tab</span>',
    '<span class="k">if</span> (ghost.<span class="k">accepts</span>)',
    '  apply(diff)<span class="cur"></span>',
  ]},
  { name: 'JetBrains', accent: '#e07a5f', lines: [
    '<span class="c">// index resolved</span>',
    '<span class="k">fun</span> refactor(): Patch',
    '  <span class="k">return</span> plan.first()<span class="cur"></span>',
  ]},
  { name: 'Neovim', accent: '#7cb389', lines: [
    '<span class="c">":LspInfo"</span>',
    '3 clients attached',
    ':w<span class="cur"></span>',
  ]},
  { name: 'Zed', accent: '#c9b458', lines: [
    '<span class="c">// collab session</span>',
    'agent.<span class="k">join</span>(buffer)',
    'edges lit up<span class="cur"></span>',
  ]},
  { name: 'Windsurf', accent: '#59c2ff', lines: [
    '<span class="c">// cascade</span>',
    '<span class="k">flow</span>.<span class="k">step</span>({ edit })',
    '<span class="s">→ shipped</span><span class="cur"></span>',
  ]},
  { name: 'Sublime', accent: '#f5a65b', lines: [
    '<span class="c">// fuzzy find</span>',
    'goto(symbol, 1)',
    'instant.<span class="k">jump</span>()<span class="cur"></span>',
  ]},
  { name: 'Terminal', accent: '#8b8778', lines: [
    '$ <span class="k">superbot</span> "fix it"',
    '<span class="s">thinking…</span>',
    '✓ 14 files<span class="cur"></span>',
  ]},
];

// ---------------------------------------------------------------------------
// timeline constants (ms)
// ---------------------------------------------------------------------------

const POP_STAG = 70, POP_DUR = 380;
const POP_END = POP_STAG * (IDES.length - 1) + POP_DUR;          // 870
const WIND_START = 980, WIND_DUR = 3200;
const CAPTURE_T = WIND_START + WIND_DUR;                          // 4180
const CAPTURE_DUR = 520;
const HERO_START = CAPTURE_T + CAPTURE_DUR;                       // 4700
const UNWIND_T = HERO_START + 6800;                               // 11500
const UNWIND_DUR = 800;

const W_IDLE = 0.25;    // rad/s drift while the ring assembles
const W_MAX = 16;       // rad/s at peak — ~2.5 rev/s, still trackable
const LEAN_MAX = 6;     // deg, tangential lean into travel
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// dom
// ---------------------------------------------------------------------------

const stage = document.getElementById('stage');
const guide = document.getElementById('guide');
const core = document.getElementById('core');
const coreRing = core; // border lives on the circle itself
const mascotWrap = document.getElementById('mascotWrap');
const mascotPre = document.getElementById('mascot');
const shock = document.getElementById('shock');
const flash = document.getElementById('flash');
const satellite = document.getElementById('satellite');
const heroMain = document.body;

// the static merged state is OPT-IN now (?reduced=1): the OS Reduce Motion
// setting silently ate the whole deliverable — a user with it on saw no
// animation at all and a hidden replay button, twice reported as breakage.
// The animation is this page's entire point, so it plays unconditionally.
const reduced = new URLSearchParams(location.search).has('reduced');

// ---------------------------------------------------------------------------
// build panes + chips
// ---------------------------------------------------------------------------

const panes = IDES.map((ide, i) => {
  const el = document.createElement('article');
  el.className = 'pane';
  el.style.setProperty('--pane-accent', ide.accent);
  el.innerHTML =
    `<div class="pane-bar"><i></i><i></i><i class="dot"></i><span>${ide.name}</span></div>` +
    `<pre class="pane-body">${ide.lines.join('\n')}</pre>`;
  stage.appendChild(el);
  return { el, angle: -Math.PI / 2 + (i * TAU) / IDES.length };
});

const chips = document.getElementById('chips');
IDES.forEach((ide, i) => {
  const c = document.createElement('span');
  c.className = 'chip';
  c.style.setProperty('--chip-accent', ide.accent);
  c.style.setProperty('--d', `${i * 50}ms`);
  c.innerHTML = `<i></i>${ide.name}`;
  chips.appendChild(c);
});

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------

let CX = 0, CY = 0, R = 0;

function layout() {
  const r = stage.getBoundingClientRect();
  CX = r.width / 2;
  CY = r.height / 2;
  R = Math.max(150, Math.min(Math.min(r.width, r.height) * 0.34, 300));
  guide.style.width = guide.style.height = `${R * 2}px`;
  guide.style.transform = 'translate(-50%, -50%)';
  for (const p of panes) {
    p.w = p.el.offsetWidth;
    p.h = p.el.offsetHeight;
  }
}
addEventListener('resize', layout);
layout();

// ---------------------------------------------------------------------------
// easing (precomputed, referent curves)
// ---------------------------------------------------------------------------

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOutQuart = (u) => 1 - Math.pow(1 - u, 4);
const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
const easeOutBack = (u) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};

// place a pane at polar coords; upright by construction — no counter-rotation
function place(el, x, y, { scale = 1, opacity = 1, rot = 0, dy = 0, z = 0 } = {}) {
  const p = panes.find((q) => q.el === el) ?? { w: 168, h: 118 };
  el.style.transform =
    `translate3d(${(x - p.w / 2).toFixed(1)}px, ${(y - p.h / 2 + dy).toFixed(1)}px, 0)` +
    (rot ? ` rotate(${rot.toFixed(2)}deg)` : '') +
    ` scale(${scale.toFixed(3)})`;
  el.style.opacity = opacity.toFixed(3);
  el.style.zIndex = z;
}

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------

let t = 0;               // virtual clock, advanced by clamped dt
let theta = 0;           // integrated ring angle (rad)
let captured = false;    // mascot constructed + hero copy risen
let mascot = null;
let last = 0;

function setRingColor(color, glow) {
  coreRing.style.borderColor = color;
  coreRing.style.boxShadow = glow ? `0 0 26px ${color}55` : 'none';
}

function ensureMascot() {
  if (mascot) return;
  mascot = new Mascot(mascotPre, {
    cols: 30, rows: 14, variant: 'smolGrin', anim: 'perky',
    // reduced users get the merged state as a still frame
    respectReducedMotion: true,
  });
}

// ---------------------------------------------------------------------------
// phases
// ---------------------------------------------------------------------------

function drawPop() {
  const orbiting = t < WIND_START;
  for (let i = 0; i < panes.length; i++) {
    const { el, angle } = panes[i];
    const local = t - i * POP_STAG;
    if (orbiting) {
      if (local < 0) { place(el, 0, 0, { opacity: 0 }); continue; }
      const u = clamp01(local / POP_DUR);
      const e = easeOutQuart(u);
      place(el, CX + R * Math.cos(angle), CY + R * Math.sin(angle),
        { scale: 0.6 + 0.4 * e, opacity: Math.min(1, u * 1.8), dy: 14 * (1 - e) });
    } else {
      drawOrbitPane(i, 0); // assembled ring, ω≈0 until the wind starts
    }
  }
}

function drawOrbitPane(i, wNorm) {
  const { el, angle } = panes[i];
  const u = clamp01((t - WIND_START) / WIND_DUR);
  const cv = clamp01((u - 0.68) / 0.32);
  const cvEase = Math.pow(cv, 1.6);
  const r = R * (1 - cvEase);
  const a = angle + theta;
  const x = CX + r * Math.cos(a);
  const y = CY + r * Math.sin(a);
  // fake depth: the lower half of the ring is the front
  const depth = (Math.sin(a) + 1) / 2;
  // fade before the shrink reads small — a scaled-down editor is never seen
  let op = (0.78 + 0.22 * depth) * (cv > 0.58 ? 1 - (cv - 0.58) / 0.42 : 1);
  const scale = (0.9 + 0.16 * depth) * (1 - 0.35 * cvEase);
  place(el, x, y, {
    scale, opacity: Math.max(0, op),
    rot: LEAN_MAX * wNorm, z: 10 + Math.round(depth * 40),
  });
}

function drawCapture() {
  const c = t - CAPTURE_T;
  // the stage itself reacts to the impact
  flash.style.opacity = (0.06 * (1 - clamp01(c / 150))).toFixed(3);
  // one shockwave
  const su = clamp01(c / 550);
  shock.style.transform = `scale(${(1 + 0.6 * easeOutCubic(su)).toFixed(3)})`;
  shock.style.opacity = (0.5 * (1 - su)).toFixed(3);
  // the circle lands with momentum overshoot
  const pu = clamp01(c / 450);
  core.style.transform = `scale(${(0.8 + 0.2 * easeOutBack(pu)).toFixed(3)})`;
  core.style.opacity = Math.min(1, pu * 2.5).toFixed(3);
  // color absorption: the ring collects each IDE's accent in turn
  const k = Math.floor(c / 42);
  if (k < IDES.length) setRingColor(IDES[k].accent, true);
  else setRingColor('var(--accent)', false);
  // mascot revealed top-down
  const mu = clamp01((c - 50) / 280);
  mascotWrap.style.clipPath = `inset(0 0 ${((1 - mu) * 100).toFixed(1)}% 0)`;
  if (c > 380) ensureMascot();
}

function drawHero() {
  core.style.transform = 'scale(1)';
  core.style.opacity = '1';
  shock.style.opacity = '0';
  flash.style.opacity = '0';
  // one slow satellite keeps the system alive: 60s/rev, name cycles
  const sa = (t / 1000) * (TAU / 60);
  const rs = R * 0.7;
  satellite.style.transform =
    `translate3d(${(CX + rs * Math.cos(sa) - 40).toFixed(1)}px, ` +
    `${(CY + rs * Math.sin(sa) - 12).toFixed(1)}px, 0)`;
  satellite.style.opacity = '1';
  satellite.textContent =
    IDES[Math.floor(Math.max(0, t - HERO_START) / 7500) % IDES.length].name;
}

function drawUnwind() {
  const u = clamp01((t - UNWIND_T) / UNWIND_DUR);
  const e = easeOutCubic(u);
  const r = R * e;
  heroMain.classList.remove('on-set');
  for (let i = 0; i < panes.length; i++) {
    const { el, angle } = panes[i];
    const a = angle + theta;
    const depth = (Math.sin(a) + 1) / 2;
    place(el, CX + r * Math.cos(a), CY + r * Math.sin(a), {
      scale: (0.65 + 0.35 * e) * (0.9 + 0.16 * depth),
      opacity: e * (0.78 + 0.22 * depth),
      rot: LEAN_MAX * 0.2 * (1 - e), z: 10 + Math.round(depth * 40),
    });
  }
  core.style.transform = `scale(${(1 - 0.2 * e).toFixed(3)})`;
  core.style.opacity = (1 - e).toFixed(3);
  satellite.style.opacity = (1 - e).toFixed(3);
  guide.style.opacity = (0.7 * (1 - e)).toFixed(3);
}

// ---------------------------------------------------------------------------
// main loop
// ---------------------------------------------------------------------------

function frame(now) {
  requestAnimationFrame(frame);
  // no visibility gating at all: Chrome marks OCCLUDED windows as hidden on
  // macOS, which froze the timeline whenever another app was frontmost — and
  // in that frozen state the replay click changed the clock with nothing
  // redrawing. If rAF fires, we draw; throttling while hidden plus the dt
  // clamp already gives the pause for free, with no stuck state to recover.
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;
  t += dt * 1000;

  // replay is a reverse, not a reset — and the capture bookkeeping resets
  // HERE, unconditionally: a frame can land past the old in-branch reset
  // window (a 16.7ms step can jump straight over it), which desynced every
  // later cycle.
  if (t >= UNWIND_T + UNWIND_DUR) { t = WIND_START; captured = false; }

  const inWind = t >= WIND_START && t < CAPTURE_T;
  if (t < WIND_START) {
    // assemble: idle drift ω, panes popping in
    theta += W_IDLE * dt;
    guide.style.opacity = (0.7 * clamp01(t / 900)).toFixed(3);
    drawPop();
  } else if (inWind) {
    const u = (t - WIND_START) / WIND_DUR;
    const wNorm = u * u; // angular acceleration, C1 from the idle drift
    theta += (W_IDLE * (1 - u) + W_MAX * wNorm) * dt;
    const cv = clamp01((u - 0.68) / 0.32);
    guide.style.opacity = (0.7 * (1 - cv)).toFixed(3);
    guide.style.transform = `translate(-50%, -50%) scale(${Math.max(0.001, 1 - cv).toFixed(3)})`;
    for (let i = 0; i < panes.length; i++) drawOrbitPane(i, wNorm);
  } else if (t < HERO_START) {
    if (!captured && t >= CAPTURE_T) {
      captured = true;
      heroMain.classList.add('on-set'); // headline + chips rise as it lands
      for (const { el } of panes) el.style.opacity = '0';
    }
    drawCapture();
  } else if (t < UNWIND_T) {
    drawHero();
  } else {
    theta += 0.4 * (1 - clamp01((t - UNWIND_T) / UNWIND_DUR)) * dt;
    drawUnwind();
  }
}

// ---------------------------------------------------------------------------
// start (fonts gate — a pop-in in fallback mono reads cheap)
// ---------------------------------------------------------------------------

function start() {
  if (reduced) {
    // the merged state, as markup: circle + statue mascot, copy visible (CSS)
    document.body.classList.add('reduced');
    document.body.classList.add('on-set');
    core.style.opacity = '1';
    ensureMascot();
    return;
  }
  requestAnimationFrame((n) => { last = n; requestAnimationFrame(frame); });
}

if (document.fonts?.ready) {
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 300))]).then(start);
} else {
  start();
}

// replay: if the merge already happened, run the REVERSE out, then the wind
document.getElementById('replay').addEventListener('click', () => {
  if (reduced) return; // button is hidden by CSS in reduced motion
  if (t >= HERO_START) t = UNWIND_T;
  else t = 0;
});
