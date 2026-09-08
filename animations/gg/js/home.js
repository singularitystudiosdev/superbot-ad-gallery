/**
 * Home scene: status ticker + four skill panels, each a small textmode
 * animation in the same per-cell idiom. Panel algorithms are the canonical
 * visualizations for each concept: Matrix-style glyph rain (scraping),
 * defrag-style compaction (context), a compression funnel (token saving)
 * and meshed rotating gears (tooling).
 */
import { RAMP, INK, state, hash2, fieldCell } from "./shared.js";

const { sin, floor, hypot, min, max, abs, atan2, PI } = Math;

const BLANK = Object.freeze({ char: " ", color: INK.dim, backgroundColor: INK.black });

const STATUS = [
  "12,408 BOTS ONLINE",
  "SCRAPING 1,204 PAGES/MIN",
  "CONTEXT PACKED TO 38%",
  "4.1M TOKENS SAVED TODAY",
  "87 TOOLS LOADED",
  "ALL SYSTEMS NOMINAL",
];

export const PANEL_DEFS = [
  { title: "01 / WEB SCRAPING", anim: scrapeAnim, info: [
    "> crawls docs, forums + wikis",
    "> extracts structured data",
    "> [PLACEHOLDER] 1,204 pages/min",
  ] },
  { title: "02 / CONTEXT ENGINE", anim: contextAnim, info: [
    "> dedupes + files every fact",
    "> compacts fragmented memory",
    "> [PLACEHOLDER] 98.2% recall",
  ] },
  { title: "03 / TOKEN SAVING", anim: tokenAnim, info: [
    "> compresses prompts on the fly",
    "> caches repeated context",
    "> [PLACEHOLDER] 4.1M tokens saved",
  ] },
  { title: "04 / GENERAL TOOLING", anim: toolsAnim, info: [
    "> shell, browser + game APIs",
    "> self-built skill library",
    "> [PLACEHOLDER] 87 tools loaded",
  ] },
];

export function homeLayout(cols, rows) {
  const statusY = 2;
  const top = 4;
  const availH = rows - 2 - top;
  const twoCol = cols >= 96 && availH >= 26;
  const panels = [];
  if (twoCol) {
    const pw = ((cols - 4 - 2) / 2) | 0;
    const ph = ((availH - 1) / 2) | 0;
    const x2 = 2 + pw + 2;
    const y2 = top + ph + 1;
    const rects = [
      { x: 2, y: top }, { x: x2, y: top },
      { x: 2, y: y2 }, { x: x2, y: y2 },
    ];
    PANEL_DEFS.forEach((def, i) => panels.push(makePanel(def, rects[i].x, rects[i].y, pw, ph)));
  } else {
    const pw = cols - 4;
    const ph = max(6, ((availH - 3) / 4) | 0);
    PANEL_DEFS.forEach((def, i) => panels.push(makePanel(def, 2, top + i * (ph + 1), pw, ph)));
  }
  return { statusY, panels };
}

function makePanel(def, x, y, w, h) {
  const topRow = ("+--[ " + def.title + " ]").slice(0, w - 1).padEnd(w - 1, "-") + "+";
  const botRow = "+" + "-".repeat(max(0, w - 2)) + "+";
  const infoH = def.info.length;
  const animH = max(0, h - 2 - infoH - 1);
  const phAt = def.info.map(line => line.indexOf("[PLACEHOLDER]"));
  return { def, x, y, w, h, topRow, botRow, infoH, animH, phAt };
}

export function statusLine(context) {
  if (context.time < state.copiedUntil) return "> BANNER COPIED TO CLIPBOARD";
  return "> " + STATUS[floor(state.t / 3) % STATUS.length];
}

export function homeCell(x, y, context, cursor) {
  const L = state.home;
  if (!L) return fieldCell(x, y, context, cursor, 0.30);
  if (y === L.statusY) {
    const s = statusLine(context);
    const ix = x - 2;
    if (ix >= 0 && ix < s.length && s[ix] !== " ") {
      return { char: s[ix], color: ix === 0 ? INK.white : INK.mid, backgroundColor: INK.black };
    }
    return fieldCell(x, y, context, cursor, 0.30);
  }
  for (const p of L.panels) {
    const lx = x - p.x, ly = y - p.y;
    if (lx >= 0 && ly >= 0 && lx < p.w && ly < p.h) return panelCell(p, lx, ly, context);
  }
  return fieldCell(x, y, context, cursor, 0.30);
}

function panelCell(p, lx, ly, context) {
  if (ly === 0) return { char: p.topRow[lx] || "-", color: INK.mid, backgroundColor: INK.black };
  if (ly === p.h - 1) return { char: p.botRow[lx] || "-", color: INK.faint, backgroundColor: INK.black };
  if (lx === 0 || lx === p.w - 1) return { char: "|", color: INK.faint, backgroundColor: INK.black };
  const sepY = 1 + p.animH;
  if (ly === sepY) {
    return { char: lx % 2 === 0 ? "-" : " ", color: INK.faint, backgroundColor: INK.black };
  }
  if (ly > sepY) {
    const li = ly - sepY - 1;
    if (li < p.infoH) {
      const line = p.def.info[li];
      const ix = lx - 2;
      if (ix >= 0 && ix < line.length && line[ix] !== " ") {
        const inPh = p.phAt[li] >= 0 && ix >= p.phAt[li] && ix < p.phAt[li] + 13;
        const color = ix === 0 ? INK.white : inPh ? INK.faint : INK.dim;
        return { char: line[ix], color, backgroundColor: INK.black };
      }
    }
    return BLANK;
  }
  const cell = p.animH >= 3 ? p.def.anim(lx - 1, ly - 1, p.w - 2, p.animH, context) : null;
  return cell || BLANK;
}

// ---- 01: markup rain over a live request line ------------------------------
function scrapeAnim(ax, ay, aw, ah, context) {
  const t = state.t;
  if (ay === 0) {
    const spin = "|/-\\"[floor(t * 8) % 4];
    const url = " GET https://target.site/docs/" + (100 + floor(t * 0.7) % 900) + ".html " + spin;
    if (ax < url.length && url[ax] !== " ") {
      return { char: url[ax], color: INK.mid, backgroundColor: INK.black };
    }
    return null;
  }
  const ry = ay - 1, rh = ah - 1;
  if (rh < 2 || hash2(ax, 99) > 0.6) return null;  // only some columns stream
  const speed = 3.5 + hash2(ax, 7) * 7;
  const len = 5 + hash2(ax, 13) * 8;
  const head = ((t * speed + hash2(ax, 3) * 60) % (rh + len + 10)) - len;
  const k = head - ry;
  if (k >= 0 && k < len) {
    const MARK = "<>/=\"abcdehrft#";
    const ch = MARK[(hash2(ax * 1.7, ry * 2.3) * MARK.length) | 0];  // stable per cell
    const f = k / len;
    const color = f < 0.12 ? INK.white : f < 0.5 ? INK.mid : INK.dim;
    return { char: ch, color, backgroundColor: INK.black };
  }
  return null;
}

// ---- 02: defrag-style compaction sweep -------------------------------------
function contextAnim(ax, ay, aw, ah, context) {
  const t = state.t;
  const aw2 = aw - 2, ax2 = ax - 1;
  if (ax2 < 0 || ax2 >= aw2) return null;
  const total = aw2 * ah;
  const cycle = 8;
  const phase = ((t % cycle) / cycle) * 1.06;
  const seed = floor(t / cycle);
  const i = ay * aw2 + ax2;
  const hp = floor(phase * total);
  if (i >= hp - 1 && i <= hp) return { char: "@", color: INK.white, backgroundColor: INK.black };
  if (i < hp) {
    const packed = floor(hp * 0.38);
    if (i < packed) {
      if (hash2(i * 0.7, seed) > 0.94) return { char: ".", color: INK.faint, backgroundColor: INK.black };
      const fresh = i > packed - aw2;
      return { char: "#", color: fresh ? INK.bright : INK.mid, backgroundColor: INK.black };
    }
    return { char: ".", color: INK.faint, backgroundColor: INK.black };
  }
  return hash2(ax2 * 3 + seed * 31, ay * 5) < 0.45
    ? { char: "=", color: INK.dim, backgroundColor: INK.black }
    : { char: ".", color: INK.faint, backgroundColor: INK.black };
}

// ---- 03: compression funnel with live ratio --------------------------------
function tokenAnim(ax, ay, aw, ah, context) {
  const t = state.t;
  if (ah < 5) return null;
  const cy = (ah - 1) / 2;
  const dy = ay - cy;
  const zoneRaw = floor(aw * 0.40), zoneFun = floor(aw * 0.30);
  if (ax < zoneRaw) {
    const drift = floor(t * 7);
    if (hash2(ax + drift, ay * 3.1) < 0.55) {
      const ch = RAMP[2 + ((hash2(ax + drift, ay + 9) * 4) | 0)];
      return { char: ch, color: INK.dim, backgroundColor: INK.black };
    }
    return null;
  }
  if (ax < zoneRaw + zoneFun) {
    const f = (ax - zoneRaw) / zoneFun;
    const half = (1 - f) * (cy - 0.4) + f * 0.7;
    if (abs(abs(dy) - half) < 0.55) {
      return { char: dy < 0 ? "\\" : "/", color: INK.mid, backgroundColor: INK.black };
    }
    if (abs(dy) < half) {
      const drift = floor(t * 11);
      if (hash2(ax + drift, ay * 2.3) < 0.42 + f * 0.5) {
        return { char: RAMP[4 + ((f * 5) | 0)], color: f > 0.62 ? INK.bright : INK.dim, backgroundColor: INK.black };
      }
    }
    return null;
  }
  const label = "SAVED " + (58 + floor((sin(t * 0.6) + 1) * 7.5)) + "%";
  const lx0 = aw - label.length - 2;
  if (ay === floor(cy) - 2 && ax >= lx0 && ax < lx0 + label.length && label[ax - lx0] !== " ") {
    return { char: label[ax - lx0], color: INK.bright, backgroundColor: INK.black };
  }
  if (abs(dy) <= 0.55) {
    const ch = "#@%#"[(hash2(ax - floor(t * 14), 5.7) * 4) | 0];
    return { char: ch, color: INK.white, backgroundColor: INK.black };
  }
  return null;
}

// ---- 04: meshed rotating gears (SDF-style polar test) ----------------------
function toolsAnim(ax, ay, aw, ah, context) {
  const t = state.t;
  if (ah < 6) return null;
  const a = context.metrics.aspect;
  const cy = (ah - 1) / 2;
  const R1 = min(cy / a - 1, aw * 0.15);
  const R2 = R1 * 0.62;
  const rot = t * 0.8;
  const g1x = aw * 0.30;
  const g2x = g1x + R1 + R2 + 3;
  return gearCell(ax - g1x, (ay - cy) / a, R1, 10, rot)
      || gearCell(ax - g2x, (ay - cy) / a, R2, 7, -rot * (R1 / R2) + PI / 7);
}

function gearCell(dx, dyw, R, teeth, rot) {
  const r = hypot(dx, dyw);
  if (r > R + 3.2) return null;
  if (r < 1.6) return { char: "+", color: INK.mid, backgroundColor: INK.black };
  if (abs(r - R) < 0.85) return { char: "#", color: INK.mid, backgroundColor: INK.black };
  if (r > R && r < R + 2.7) {
    const ang = atan2(dyw, dx);
    const k = ((ang + rot) / (PI * 2)) * teeth * 2;
    if (((floor(k) % 2) + 2) % 2 === 0) {
      return { char: "#", color: INK.bright, backgroundColor: INK.black };
    }
  }
  return null;
}
