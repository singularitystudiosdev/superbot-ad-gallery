/* superbot — all agents, one
   8 IDE tiles pop in, orbit with accelerating angular velocity, motion-blur
   into echo ghosts, spiral into the center, merge with a flash + ASCII
   sparkle burst, and reveal the superbot mascot.
   Single rAF timeline; DOM tiles + one canvas fx overlay. */

'use strict';

// ---------------------------------------------------------------------------
// content
// ---------------------------------------------------------------------------

const IDES = [
  { name: 'CURSOR',      sigil: '▚', stat: '[ tab-tab-tab ]'   },
  { name: 'CLAUDE CODE', sigil: '✳', stat: '[ ctx 200k ]'      },
  { name: 'COPILOT',     sigil: '◉', stat: '[ pair mode ]'     },
  { name: 'CODEX',       sigil: '◇', stat: '[ cloud agent ]'   },
  { name: 'WINDSURF',    sigil: '∿', stat: '[ riding flow ]'   },
  { name: 'GEMINI CLI',  sigil: '✦', stat: '[ 1m tokens ]'     },
  { name: 'AIDER',       sigil: 'λ', stat: '[ git aware ]'     },
  { name: 'CLINE',       sigil: '⌁', stat: '[ vscode native ]' },
];

const MASCOT = [
  '        .------..            ..------.        ',
  '       =+*++==-:.          .:-==++*+=       ',
  '     .+*+*+*+*+*+*+======+*+*+*+*+*+*+.     ',
  '    .+*+*+*+*+*+*+*+*==+*+*+*+*+*+*+*+.    ',
  '     :=+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*:     ',
  '       :=+*+*+*+*+*+*+*+*+*+*+*+*+*:       ',
  '         .+*+*+    :+==+:    +*+*+.         ',
  '         .+*+*+    :+==+:    +*+*+.         ',
  '         .+*+*+    :+==+:    +*+*+.         ',
  '          :+*+*+  .+====+.  +*+*+:          ',
  '           :+*+*+=+======+=+*+*+:           ',
  '            .+*+*+*+====+*+*+*+.            ',
  '              :+*+*+*+*+*+*+*:              ',
  '                .::-:....::-.               ',
].map((l) => l.replace(/\s+$/, '')).join('\n');

const SPARK_GLYPHS = ['·', '+', '*', '✦', ':', '¨', "'", '˙'];
const PH = { POP: 0, ORBIT: 1, CONVERGE: 2, MERGE: 3, REVEAL: 4 };
const T = { popEnd: 1.3, orbitEnd: 8.2, convEnd: 9.35, mergeDur: 0.5, typeStart: 9.85 };
const W0 = 0.55;    // rad/s at rest
const WMAX = 14.0;  // rad/s at peak
const N = IDES.length;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// dom + canvas setup
// ---------------------------------------------------------------------------

const orbitEl = document.getElementById('orbit');
const fxCanvas = document.getElementById('fx');
const fx = fxCanvas.getContext('2d');
const flashEl = document.getElementById('flash');
const heroEl = document.getElementById('hero');
const mascotEl = document.getElementById('mascot');
const captionEl = document.getElementById('caption');
const hudEl = document.getElementById('hud');
const hintEl = document.getElementById('hint');

let W = 0, H = 0, CX = 0, CY = 0, R0 = 0, DPR = 1;

function layout() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  CX = W / 2;
  CY = H / 2;
  R0 = Math.min(W, H) * 0.33;
  fxCanvas.width = W * DPR;
  fxCanvas.height = H * DPR;
  fxCanvas.style.width = W + 'px';
  fxCanvas.style.height = H + 'px';
  fx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', layout);
layout();

// build 8 tiles, each with 2 echo ghosts behind it
const tiles = [];
function buildTiles() {
  for (let i = 0; i < N; i++) {
    const ide = IDES[i];
    const ghosts = [];
    for (let k = 0; k < 2; k++) {
      const g = document.createElement('div');
      g.className = 'ghost';
      g.textContent = ide.sigil;
      g.style.opacity = '0';
      orbitEl.appendChild(g);
      ghosts.push(g);
    }
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML =
      '<span class="c tl">+</span><span class="c tr">+</span>' +
      '<span class="c bl">+</span><span class="c br">+</span>' +
      `<div class="sigil">${ide.sigil}</div>` +
      `<div class="name">${ide.name}</div>` +
      `<div class="stat">${ide.stat}</div>`;
    tile.style.opacity = '0';
    orbitEl.appendChild(tile);
    tiles.push({ tile, ghosts, phase: i * TAU / N, born: 0.18 + i * 0.1 });
  }
}
buildTiles();

// precompute mascot typing schedule: char index -> reveal time
const typeAt = [];
{
  let lines = 0;
  for (let i = 0; i < MASCOT.length; i++) {
    if (MASCOT[i] === '\n') lines++;
    typeAt.push(i / 240 + lines * 0.07);
  }
}

// ---------------------------------------------------------------------------
// fx state
// ---------------------------------------------------------------------------

let sparks = [];    // merge burst + ambient twinkles
let waves = [];     // shockwave rings
let mergeTimer = null;
let theta = 0;      // integrated orbit angle
let lastPhase = null;
let started = false;
let startT = 0;

function spawnBurst() {
  for (let i = 0; i < 150; i++) {
    const a = Math.random() * TAU;
    const sp = 70 + Math.random() * 380;
    sparks.push({
      x: CX, y: CY,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0, ttl: 0.5 + Math.random() * 0.9,
      glyph: SPARK_GLYPHS[(Math.random() * SPARK_GLYPHS.length) | 0],
      size: 8 + Math.random() * 7,
      bright: Math.random() < 0.3,
    });
  }
  waves.push({ r: 4, a: 0.85, lw: 2 });
  waves.push({ r: 4, a: 0.5, lw: 1 });
}

function spawnTwinkle() {
  sparks.push({
    x: CX + (Math.random() - 0.5) * W * 0.62,
    y: CY + (Math.random() - 0.5) * H * 0.62,
    vx: 0, vy: 0,
    life: 0, ttl: 0.8 + Math.random() * 0.9,
    glyph: SPARK_GLYPHS[(Math.random() * SPARK_GLYPHS.length) | 0],
    size: 7 + Math.random() * 6,
    bright: false,
  });
}

// ---------------------------------------------------------------------------
// easing
// ---------------------------------------------------------------------------

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeInCubic = (u) => u * u * u;
const easeInQuart = (u) => u * u * u * u;
const easeOutBack = (u) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};

// ---------------------------------------------------------------------------
// hud
// ---------------------------------------------------------------------------

function setHud(html) { hudEl.innerHTML = '> ' + html; }

// ---------------------------------------------------------------------------
// timeline
// ---------------------------------------------------------------------------

function phaseOf(t) {
  if (t < T.popEnd) return PH.POP;
  if (t < T.orbitEnd) return PH.ORBIT;
  if (t < T.convEnd) return PH.CONVERGE;
  return PH.REVEAL;
}

function omegaOf(t, phase) {
  if (phase === PH.POP) return W0 * 0.5 * (t / T.popEnd);
  if (phase === PH.ORBIT) {
    const u = (t - T.popEnd) / (T.orbitEnd - T.popEnd);
    return W0 + (WMAX - W0) * easeInCubic(u);
  }
  if (phase === PH.CONVERGE) {
    const u = (t - T.orbitEnd) / (T.convEnd - T.orbitEnd);
    return WMAX * (1 + 0.9 * u);
  }
  return 0;
}

function radiusOf(t, phase) {
  if (phase === PH.POP || phase === PH.ORBIT) return R0;
  const u = (t - T.orbitEnd) / (T.convEnd - T.orbitEnd);
  return R0 * (1 - easeInQuart(clamp(u, 0, 1)));
}

function place(el, x, y, angleDeg, scaleX, scale, blurPx, opacity) {
  el.style.transform =
    `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)` +
    ` rotate(${angleDeg.toFixed(2)}deg) scaleX(${scaleX.toFixed(3)}) rotate(${-angleDeg.toFixed(2)}deg)` +
    ` scale(${scale.toFixed(3)})`;
  // blur() is a filter function, not a transform function — putting it in the
  // transform string gets the whole declaration rejected by the parser
  el.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
  el.style.opacity = opacity;
}

function drawTiles(t, phase, omega, R) {
  const ghostGain = phase === PH.CONVERGE
    ? clamp(1.2 + (t - T.orbitEnd) / (T.convEnd - T.orbitEnd), 0, 1.6)
    : clamp((omega - 1.6) / 9, 0, 1);

  for (let i = 0; i < N; i++) {
    const { tile, ghosts, phase: off, born } = tiles[i];
    const a = theta + off - Math.PI / 2; // start at top
    const x = CX + R * Math.cos(a);
    const y = CY + R * Math.sin(a);
    const tangent = (a + Math.PI / 2) * 180 / Math.PI;

    // pop-in: overshoot scale + 0.1s glitch flicker
    const since = t - born;
    let s = 1, op = 1;
    if (phase === PH.POP && since < 0) { op = 0; }
    else if (since < 0.34) { s = Math.max(0.001, easeOutBack(since / 0.34)); }
    if (since >= 0 && since < 0.11) op = Math.random() < 0.55 ? 1 : 0.15;

    // converge: shrink, sharpen, die
    let cScale = 1, cOp = 1;
    if (phase === PH.CONVERGE) {
      const u = clamp((t - T.orbitEnd) / (T.convEnd - T.orbitEnd), 0, 1);
      cScale = 1 - 0.55 * u;
      cOp = u > 0.82 ? 1 - (u - 0.82) / 0.18 : 1;
    }

    place(tile, x, y, tangent, 1 + ghostGain * 0.4, s * cScale,
      Math.min(6, ghostGain * (2 + omega * 0.15)) * (phase === PH.CONVERGE ? 1 - clamp((t - T.orbitEnd) / (T.convEnd - T.orbitEnd), 0, 1) : 1),
      op * cOp);

    // echo ghosts: time-lagged angles -> spatial trail grows with omega
    if (ghostGain > 0.02 && since > 0.3) {
      for (let k = 0; k < 2; k++) {
        const gap = Math.min(110, omega * 0.03 * (k + 1) * R) * (phase === PH.CONVERGE ? 1.4 : 1);
        const ga = a - gap / R;
        const gx = CX + R * Math.cos(ga);
        const gy = CY + R * Math.sin(ga);
        place(ghosts[k], gx, gy, 0, 1, s * cScale * 0.92, 0, ghostGain * 0.6 / (k + 1) * op * cOp);
      }
    } else {
      ghosts[0].style.opacity = '0';
      ghosts[1].style.opacity = '0';
    }
  }
}

function drawFx(t, phase, dt, R) {
  fx.clearRect(0, 0, W, H);

  // dotted orbit guide
  if (phase <= PH.CONVERGE && R > 1) {
    const fadeIn = clamp(t / 0.9, 0, 1);
    fx.beginPath();
    fx.setLineDash([2, 8]);
    fx.strokeStyle = `rgba(230,230,223,${0.2 * fadeIn})`;
    fx.lineWidth = 1;
    fx.arc(CX, CY, R, 0, TAU);
    fx.stroke();
    fx.setLineDash([]);
  }

  // shockwave rings
  for (const w of waves) {
    w.r += dt * 480;
    w.a -= dt * 1.4;
    if (w.a <= 0) continue;
    fx.beginPath();
    fx.strokeStyle = `rgba(230,230,223,${w.a.toFixed(3)})`;
    fx.lineWidth = w.lw;
    fx.arc(CX, CY, w.r, 0, TAU);
    fx.stroke();
  }
  waves = waves.filter((w) => w.a > 0);

  // sparkles
  fx.textAlign = 'center';
  fx.textBaseline = 'middle';
  for (const p of sparks) {
    p.life += dt;
    if (p.life > p.ttl) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.18, dt);
    p.vy *= Math.pow(0.18, dt);
    const u = p.life / p.ttl;
    const tw = 0.7 + 0.3 * Math.sin(p.life * 34 + p.size);
    const a = (1 - u) * (p.bright ? 0.95 : 0.55) * tw;
    fx.fillStyle = `rgba(230,230,223,${a.toFixed(3)})`;
    fx.font = `${p.size}px ${getComputedStyle(document.body).fontFamily}`;
    fx.fillText(p.glyph, p.x, p.y);
  }
  sparks = sparks.filter((p) => p.life < p.ttl);
}

function updateMascot(t) {
  if (t < T.typeStart) return;
  const tt = t - T.typeStart;
  let idx = 0;
  while (idx < MASCOT.length && typeAt[idx] <= tt) idx++;
  const done = idx >= MASCOT.length;
  mascotEl.innerHTML = MASCOT.slice(0, idx) + '<span class="caret"></span>';
  if (done && !captionEl.classList.contains('on')) {
    captionEl.classList.add('on');
    hintEl.classList.add('on');
    setHud('<b>superbot online.</b>');
  }
}

// ---------------------------------------------------------------------------
// main loop
// ---------------------------------------------------------------------------

let twinkleAcc = 0;

function frame(now) {
  if (!started) startT = now;
  started = true;
  const t = (now - startT) / 1000;
  const dt = Math.min(0.05, (now - (frame.prev || now)) / 1000);
  frame.prev = now;

  const phase = t < T.convEnd ? phaseOf(t) : PH.REVEAL;
  const omega = omegaOf(t, phase);
  const R = radiusOf(t, phase);

  theta += omega * dt;

  // phase transitions
  if (phase !== lastPhase) {
    if (phase === PH.POP) setHud('spawning <b>8</b> ide agents…');
    if (phase === PH.ORBIT) setHud('orbit locked · ramping ω');
    if (phase === PH.CONVERGE) setHud('converge <b>r → 0</b>');
    if (phase === PH.REVEAL && lastPhase === PH.CONVERGE) onMerge(t);
    lastPhase = phase;
  }
  if (phase === PH.ORBIT) setHud(`orbit · ω = <b>${omega.toFixed(1)}</b> rad/s`);

  if (phase <= PH.CONVERGE) drawTiles(t, phase, omega, R);

  // ambient twinkles after the merge settles
  if (phase === PH.REVEAL) {
    twinkleAcc += dt;
    if (twinkleAcc > 0.16) { twinkleAcc = 0; spawnTwinkle(); }
    updateMascot(t);
  }

  drawFx(t, phase, dt, R);

  // merge flash
  if (phase === PH.REVEAL && t < T.convEnd + T.mergeDur) {
    flashEl.style.opacity = String(0.7 * (1 - (t - T.convEnd) / T.mergeDur));
  } else {
    flashEl.style.opacity = '0';
  }

  requestAnimationFrame(frame);
}

function onMerge() {
  orbitEl.style.display = 'none';
  heroEl.classList.add('on');
  // delay the burst so its brightest frames land as the flash clears
  mergeTimer = setTimeout(spawnBurst, 400);
  setHud('merge complete · <b>8 → 1</b>');
}

function reset() {
  theta = 0;
  sparks = [];
  waves = [];
  clearTimeout(mergeTimer);
  twinkleAcc = 0;
  lastPhase = null;
  started = false;
  orbitEl.style.display = '';
  heroEl.classList.remove('on');
  captionEl.classList.remove('on');
  hintEl.classList.remove('on');
  mascotEl.innerHTML = '';
  flashEl.style.opacity = '0';
  for (const { tile, ghosts } of tiles) {
    tile.style.opacity = '0';
    for (const g of ghosts) g.style.opacity = '0';
  }
  setHud('spawning <b>8</b> ide agents…');
}

// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------

const reduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !location.search.includes('motion=1'); // ?motion=1 forces the full timeline

// ?t=<seconds> starts the timeline at that point (debug/headless capture):
// numerically integrate theta up to the jump, then shift the master clock.
const jump = parseFloat(new URLSearchParams(location.search).get('t') || '0') || 0;

if (reduced) {
  // skip straight to the finished state
  orbitEl.style.display = 'none';
  heroEl.classList.add('on');
  mascotEl.innerHTML = MASCOT;
  captionEl.classList.add('on');
  hintEl.classList.add('on');
  setHud('<b>superbot online.</b>');
} else {
  reset();
  if (jump > 0) {
    for (let s = 0; s < jump; s += 1 / 120) {
      theta += omegaOf(s, phaseOf(s)) / 120;
    }
    startT = performance.now() - jump * 1000;
    started = true;
    lastPhase = phaseOf(jump);
    if (lastPhase === PH.REVEAL) onMerge();
    frame.prev = performance.now();
  }
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') { reset(); }
});
window.addEventListener('click', () => { reset(); });
