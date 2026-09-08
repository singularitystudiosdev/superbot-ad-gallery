/**
 * SUPERBOT.GG — MONO
 * Pure-ASCII textmode site in the play.core idiom: main() runs once per cell
 * per frame, like a fragment shader. Two scenes (hero landing, home skill
 * panels) joined by a circle wipe in cell space — the copy shockwave IS the
 * scene transition boundary.
 * Engine: ertdfgcvb/play.core, vendored in ../play (Apache-2.0, see LICENSE).
 */
import { run } from "../play/run.js";
import { clamp } from "../play/modules/num.js";
import { LOGO } from "./logo.js";
import { WORDMARKS } from "./wordmark.js";
import { INK, SCRAMBLE, state, hash2, barRow } from "./shared.js";
import { heroLayout, heroCell } from "./hero.js";
import { homeLayout, homeCell } from "./home.js";

const { sin, cos, floor, hypot, min, max, abs, pow, round } = Math;

const WIPE_DURATION = 1500;  // ms, circle wipe lifetime
const COPIED_HOLD = 2600;    // ms, status ticker shows the copied message

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const screen = document.getElementById("screen");
const copyButton = document.getElementById("copy");
const liveRegion = document.getElementById("live");

// ---- font sizing -----------------------------------------------------------
// Largest monospace size whose grid still fits the full hero stack.

const FULL_COLS = max(LOGO[0].length, WORDMARKS[0].w) + 6;
const FULL_ROWS = LOGO.length + WORDMARKS[0].h + 16;

function probeCell(fontSize) {
  const probe = document.createElement("pre");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;margin:0;visibility:hidden;line-height:1.2";
  probe.style.fontFamily = getComputedStyle(screen).fontFamily;
  probe.style.fontSize = fontSize + "px";
  probe.textContent = ("X".repeat(50) + "\n").repeat(10).trimEnd();
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return { w: rect.width / 50, h: rect.height / 10 };
}

function fitFontSize() {
  for (const size of [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7]) {
    const cell = probeCell(size);
    if (floor(innerWidth / cell.w) >= FULL_COLS && floor(innerHeight / cell.h) >= FULL_ROWS) return size;
  }
  return innerWidth < 640 ? 9 : 11;  // grid too small for the full stack: tiers degrade instead
}

// ---- program ---------------------------------------------------------------

function pre(context, cursor) {
  state.ctx = context;
  if (state.metricsStale) refreshMetrics(context);
  if (context.cols !== state.cols || context.rows !== state.rows) {
    state.cols = context.cols;
    state.rows = context.rows;
    state.hero = heroLayout(context.cols, context.rows);
    state.home = homeLayout(context.cols, context.rows);
    state.frameTopHero = barRow(context.cols, "+--[ SUPERBOT.GG ]", "[ MONO / TEXTMODE ]--+");
    state.frameTopHome = barRow(context.cols, "+--[ SUPERBOT.GG // HOME ]", "[ ESC / BACK ]--+");
    state.fpsAt = 0;  // force bottom bar rebuild
    syncOverlay(context);
  }
  const T = reduced ? 6100 : context.time;
  const t = T * 0.001;
  state.t = t;
  state.dir = { x: sin(t * 0.13), y: cos(t * 0.11) };
  state.orbit = { x: sin(-t * 0.21) * 0.8, y: cos(-t * 0.17) * 0.6 };
  state.scanY = ((T * 0.008) % (context.rows + 30)) - 15;
  if (context.time - state.fpsAt > 500) {
    state.fpsAt = context.time;
    state.fpsShown = round(context.runtime.fps) || 60;
    state.frameBottom = barRow(context.cols,
      "+--[ (c) 2026 SUPERBOT.GG / PURE ASCII ]",
      "[ " + state.fpsShown + " FPS / " + context.cols + "x" + context.rows + " ]--+");
  }
  if (cursor.x !== cursor.p.x || cursor.y !== cursor.p.y) state.pointerSeen = true;
  if (state.wipe && context.time - state.wipe.t0 > WIPE_DURATION + 120) {
    setScene(state.wipe.to);
    state.wipe = null;
    updateOverlayVisibility();
  }
  if (wipeHold !== null && state.hero) {
    // Debug: pin the wipe at a fixed phase for deterministic screenshots.
    const b = state.hero.btn;
    state.wipe = {
      from: "hero", to: "home",
      t0: context.time - wipeHold * WIPE_DURATION,
      cx: b.x + b.w / 2, cy: b.y + b.h / 2,
    };
  }
}

function sceneCell(name, x, y, context, cursor) {
  const cols = context.cols, rows = context.rows;
  if (y === 0) {
    const bar = name === "hero" ? state.frameTopHero : state.frameTopHome;
    return { char: bar[x] || "-", color: INK.faint, backgroundColor: INK.black };
  }
  if (y === rows - 1) return { char: state.frameBottom[x] || "-", color: INK.faint, backgroundColor: INK.black };
  if (x === 0 || x === cols - 1) return { char: "|", color: INK.faint, backgroundColor: INK.black };
  return name === "hero" ? heroCell(x, y, context, cursor) : homeCell(x, y, context, cursor);
}

function main(coord, context, cursor) {
  const x = coord.x, y = coord.y;
  const w = state.wipe;
  if (!w) return sceneCell(state.scene, x, y, context, cursor);

  const a = context.metrics.aspect;
  const tau = context.time - w.t0;
  const p = clamp(tau / WIPE_DURATION, 0, 1);
  const maxR = hypot(context.cols, context.rows / a) * 1.02;
  const R = maxR * (1 - pow(2, -5.5 * p));
  const d = hypot(x - w.cx, (y - w.cy) / a);
  const band = 5 + p * 6;

  let cell;
  if (d < R - band * 0.5) cell = sceneCell(w.to, x, y, context, cursor);
  else if (d > R + band * 0.5) cell = sceneCell(w.from, x, y, context, cursor);
  else if (abs(d - R) < band * 0.2) {
    cell = { char: SCRAMBLE[(hash2(x + context.frame, y) * SCRAMBLE.length) | 0], color: INK.black, backgroundColor: INK.white };
  } else {
    cell = { char: SCRAMBLE[(hash2(x, y + context.frame) * SCRAMBLE.length) | 0], color: INK.white, backgroundColor: INK.black };
  }
  if (p < 0.07 && hash2(x + context.frame * 13, y) > 0.92) {
    cell = { char: "@", color: INK.white, backgroundColor: INK.black };
  }
  return cell;
}

// ---- scenes + wipe ---------------------------------------------------------

function setScene(name) {
  state.scene = name;
  screen.setAttribute("aria-label", name === "home"
    ? "SUPERBOT.GG home — animated ASCII skill panels"
    : "SUPERBOT.GG — animated pure-ASCII textmode landing page");
  announce(name === "home" ? "Superbot home — skill panels" : "Landing page");
}

function startWipe(from, to, cx, cy) {
  if (reduced) {
    setScene(to);
    updateOverlayVisibility();
    return;
  }
  state.wipe = { from, to, t0: state.ctx ? state.ctx.time : performance.now(), cx, cy };
  updateOverlayVisibility();
}

function goHome() {
  const b = state.hero && state.hero.btn;
  startWipe("hero", "home",
    b ? b.x + b.w / 2 : state.cols / 2,
    b ? b.y + b.h / 2 : state.rows / 2);
}

function goBack() {
  if (state.scene !== "home" || state.wipe) return;
  startWipe("home", "hero", state.cols / 2, state.rows / 2);
}

// ---- copy ------------------------------------------------------------------

function copyPayload() {
  const art = WORDMARKS[0].rows.map(r => r.trimEnd()).join("\n");
  return art + "\n\n" + "superbot.gg";
}

let copyBusy = false;
function doCopy() {
  if (state.scene !== "hero" || state.wipe || copyBusy) return;
  copyBusy = true;
  writeClipboard(copyPayload()).finally(() => { copyBusy = false; });
  state.copiedUntil = (state.ctx ? state.ctx.time : performance.now()) + COPIED_HOLD;
  goHome();
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    announce("ASCII banner copied to clipboard");
  } catch (err) {
    console.error("navigator.clipboard.writeText failed, trying execCommand:", err);
    try {
      legacyCopy(text);
      announce("ASCII banner copied to clipboard");
    } catch (err2) {
      console.error("execCommand copy failed too:", err2);
      announce("Copy failed — clipboard is unavailable in this browser");
    }
  }
}

function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("execCommand('copy') returned false");
}

function announce(message) {
  liveRegion.textContent = "";
  liveRegion.textContent = message;
}

// ---- DOM plumbing ----------------------------------------------------------

// The engine's metrics._update references an undefined var upstream, so the
// shared metrics object is patched directly after a font-size change.
function refreshMetrics(context) {
  state.metricsStale = false;
  const cell = probeCell(parseFloat(getComputedStyle(screen).fontSize));
  context.metrics.cellWidth = cell.w;
  context.metrics.lineHeight = cell.h;
  context.metrics.aspect = cell.w / cell.h;
  state.cols = 0;  // force layout rebuild once the engine recomputes the grid
}

// Keeps the real (focusable, screen-reader visible) button glued to the
// ASCII copy icon, and hides it away from the hero scene.
function syncOverlay(context) {
  const L = state.hero, m = context.metrics;
  if (!L) return;
  copyButton.style.left = L.btn.x * m.cellWidth + "px";
  copyButton.style.top = L.btn.y * m.lineHeight + "px";
  copyButton.style.width = L.btn.w * m.cellWidth + "px";
  copyButton.style.height = L.btn.h * m.lineHeight + "px";
  updateOverlayVisibility();
}

function updateOverlayVisibility() {
  copyButton.style.display = state.scene === "hero" && !state.wipe ? "block" : "none";
}

copyButton.addEventListener("click", doCopy);
copyButton.addEventListener("pointerenter", () => { state.hover = true; });
copyButton.addEventListener("pointerleave", () => { state.hover = false; });
window.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "c" || e.key === "C") doCopy();
  else if (e.key === "Escape") goBack();
});
window.addEventListener("resize", () => {
  clearTimeout(state.resizeTimer);
  state.resizeTimer = setTimeout(() => {
    screen.style.fontSize = fitFontSize() + "px";
    state.metricsStale = true;
  }, 150);
});

// Dev params for the headless screenshot check:
//   ?scene=home boots straight into the home scene
//   ?fx=<ms>    auto-fires the copy wipe after that delay
//   ?wipehold=<0..1> freezes the wipe at a phase
const query = new URLSearchParams(location.search);
if (query.get("scene") === "home") state.scene = "home";
const fxParam = query.get("fx");
if (fxParam !== null) setTimeout(goHome, max(200, Number(fxParam) || 1200));
const wipeHoldParam = query.get("wipehold");
const wipeHold = wipeHoldParam !== null ? clamp(Number(wipeHoldParam) || 0, 0, 1) : null;

screen.style.fontSize = fitFontSize() + "px";
updateOverlayVisibility();

run({
  settings: {
    element: screen,
    fps: 60,
    renderer: "text",
    backgroundColor: INK.black,
    color: INK.dim,
    allowSelect: false,
  },
  pre,
  main,
}, {}).catch(err => {
  console.error("play.core runner failed:", err);
});
