/**
 * Shared palette, ramps, mutable app state and the background field
 * used by both scenes.
 */
const { sin, cos, exp, floor, hypot, min, max } = Math;

export const RAMP = " .:-=+*#%@";
export const SCRAMBLE = "@%#*+=!?$&";
export const INK = {
  faint:  "#3a3a3a",
  dim:    "#575757",  // element default color — the dominant tier costs no <span>
  mid:    "#9a9a9a",
  bright: "#e6e6e6",
  white:  "#ffffff",
  black:  "#000000",
};

export const state = {
  scene: "hero",          // 'hero' | 'home'
  wipe: null,             // { from, to, t0, cx, cy } — circle wipe in cell space
  cols: 0, rows: 0,
  hero: null,             // hero layout
  home: null,             // home layout
  frameTopHero: "", frameTopHome: "", frameBottom: "",
  t: 0,
  dir: { x: 0, y: 1 },
  orbit: { x: 0, y: 0 },
  scanY: -20,
  hover: false,
  pointerSeen: false,
  copiedUntil: 0,
  metricsStale: false,
  fpsShown: 60, fpsAt: 0,
  ctx: null,
  resizeTimer: 0,
};

export function hash2(x, y) {
  const n = sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - floor(n);
}

export function barRow(cols, left, right) {
  const fill = max(0, cols - left.length - right.length);
  return (left + "-".repeat(fill) + right).slice(0, cols).padEnd(cols, "-");
}

export function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Two-wave interference field with a counter-phase well, plasma family
// (see play.core demos/plasma.js and bidouille.org's plasma primer).
export function fieldCell(x, y, context, cursor, gain) {
  const cols = context.cols, rows = context.rows;
  const a = context.metrics.aspect;
  const m = min(cols, rows);
  const sx = 2 * (x - cols / 2) / m * a;
  const sy = 2 * (y - rows / 2) / m;
  const t = state.t;
  const v1 = sin(x * 0.055 * state.dir.x + y * 0.062 * state.dir.y + t * 0.7);
  const v2 = cos(hypot(sx - state.orbit.x, sy - state.orbit.y) * 3.4 - t * 0.55);
  const v3 = cos(hypot(sx + state.orbit.y, sy + state.orbit.x * 0.7) * 4.6 + t * 0.5);
  let b = (v1 * 0.8 + v2 + v3 + 2.8) / 5.6;
  b += (hash2(x, y) - 0.5) * 0.14;
  const dScan = y - state.scanY;
  b += 0.22 * exp(-dScan * dScan / 5);
  if (state.pointerSeen) {
    const dx = x - cursor.x;
    const dy = (y - cursor.y) / a;
    b += 0.55 * exp(-(dx * dx + dy * dy) / 110);
  }
  b = clamp01(b * gain);
  const idx = min(RAMP.length - 1, floor(b * RAMP.length));
  const color = b > 0.34 ? INK.mid : b > 0.16 ? INK.dim : INK.faint;
  return { char: RAMP[idx], color, backgroundColor: INK.black };
}
