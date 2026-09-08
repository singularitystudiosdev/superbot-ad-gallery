/**
 * Hero scene: logo + wordmark + ASCII copy-icon button + hint over the field.
 */
import { LOGO, LOGO_HALF } from "./logo.js";
import { WORDMARKS } from "./wordmark.js";
import { INK, state, fieldCell } from "./shared.js";

const { max } = Math;

const HINT = "[ CLICK OR PRESS C TO COPY THE BANNER ]";

// The classic two-rect copy glyph (front square upper-right, back square
// lower-left), drawn in strict ASCII. This is the whole button.
export const COPY_ICON = [
  "   +-------+",
  "   |       |",
  "+--|       |",
  "|  |       |",
  "|  |       |",
  "|  +-------+",
  "|      |    ",
  "+------+    ",
];
const ICON_W = 12, ICON_H = COPY_ICON.length;

export function heroLayout(cols, rows) {
  const innerRows = rows - 2;
  const wordmark = WORDMARKS.find(t => t.w <= cols - 4) || WORDMARKS[WORDMARKS.length - 1];
  const rest = wordmark.h + 1 + 1 + ICON_H + 1 + 1;  // wm + gaps + icon + hint
  let logo = null;
  for (const art of [LOGO, LOGO_HALF]) {
    if (cols >= art[0].length + 4 && innerRows >= art.length + 1 + rest) { logo = art; break; }
  }
  const total = (logo ? logo.length + 1 : 0) + rest;
  let y = 1 + max(1, ((innerRows - total) / 2) | 0);
  const cx = w => ((cols - w) / 2) | 0;
  const L = { logo: null };
  if (logo) {
    L.logo = { x: cx(logo[0].length), y, art: logo, w: logo[0].length, h: logo.length };
    y += logo.length + 1;
  }
  L.wm = { x: cx(wordmark.w), y, rows: wordmark.rows, w: wordmark.w, h: wordmark.h };
  y += wordmark.h + 2;
  L.btn = { x: cx(ICON_W), y, w: ICON_W, h: ICON_H };
  y += ICON_H + 1;
  L.hint = { x: cx(HINT.length), y, w: HINT.length };
  return L;
}

export function heroCell(x, y, context, cursor) {
  const L = state.hero;
  if (!L) return fieldCell(x, y, context, cursor, 0.46);

  if (L.logo) {
    const lx = x - L.logo.x, ly = y - L.logo.y;
    if (lx >= 0 && ly >= 0 && lx < L.logo.w && ly < L.logo.h) {
      const ch = L.logo.art[ly][lx];
      if (ch !== " " && ch !== ".") return { char: ch, color: INK.bright, backgroundColor: INK.black };
      return fieldCell(x, y, context, cursor, 0.46);
    }
  }
  {
    const wx = x - L.wm.x, wy = y - L.wm.y;
    if (wx >= 0 && wy >= 0 && wx < L.wm.w && wy < L.wm.h) {
      const ch = L.wm.rows[wy][wx];
      if (ch !== " ") return { char: ch, color: INK.white, backgroundColor: INK.black };
      return fieldCell(x, y, context, cursor, 0.46);
    }
  }
  {
    const bx = x - L.btn.x, by = y - L.btn.y;
    if (bx >= 0 && by >= 0 && bx < L.btn.w && by < L.btn.h) {
      const ch = COPY_ICON[by][bx] || " ";
      const active = state.hover || context.time < state.copiedUntil;
      if (active) return { char: ch, color: INK.black, backgroundColor: INK.white };
      if (ch !== " ") return { char: ch, color: INK.white, backgroundColor: INK.black };
      return fieldCell(x, y, context, cursor, 0.46);
    }
  }
  if (y === L.hint.y && x >= L.hint.x && x < L.hint.x + L.hint.w) {
    const ch = HINT[x - L.hint.x];
    if (ch !== " ") return { char: ch, color: INK.faint, backgroundColor: INK.black };
    return fieldCell(x, y, context, cursor, 0.46);
  }
  return fieldCell(x, y, context, cursor, 0.46);
}
