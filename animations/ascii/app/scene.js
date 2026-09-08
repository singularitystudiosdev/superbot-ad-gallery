// Scene compositing: one cell buffer — the active background variant, the
// framed wordmark with the copy button at its right, and the capability
// tagline. A cell is (char, shade 0..1, inverse flag); inverse cells render
// as a filled white cell with a black glyph.
import { BANNER } from './type.js'
import { taglineAt } from './tagline.js'

export const RAMP = ' .:-=+*#%@'
const SMALL = ['S U P E R B O T . G G']

export function createScene(settings) {
  const buf = { cols: 0, rows: 0, ch: [], shade: null, inv: null }
  const geo = { box: null, btn: null, tagY: 0 }

  function alloc(b, g) {
    if (b.cols === g.cols && b.rows === g.rows) return false
    b.cols = g.cols
    b.rows = g.rows
    const n = g.cols * g.rows
    b.ch = new Array(n).fill(' ')
    b.shade = new Float32Array(n)
    b.inv = new Uint8Array(n)
    return true
  }

  function layoutGeo(g) {
    const s = settings
    const banner = g.cols >= 108 ? BANNER : SMALL
    const bw = Math.max(...banner.map(l => l.length))
    const w = bw + s.padX * 2 + 2
    const h = banner.length + 4 + s.padY * 2
    const total = w + s.gap + s.btnW
    const bx = Math.floor((g.cols - total) / 2) + s.boxDX
    const by = Math.max(1, Math.floor((g.rows - (h + 2)) / 2)) + s.boxDY
    geo.box = { x: bx, y: by, w, h, banner }
    geo.btn = { x: bx + w + s.gap, y: by + Math.floor((h - s.btnH) / 2), w: s.btnW, h: s.btnH }
    geo.tagY = by + h + s.tagGap
  }

  function inRect(x, y, r, m = 0) {
    return r && x >= r.x - m && x < r.x + r.w + m && y >= r.y - m && y < r.y + r.h + m
  }

  function paintStr(b, g, x, y, text, shade) {
    if (y < 0 || y >= g.rows) return
    for (let k = 0; k < text.length; k++) {
      const xx = x + k
      if (xx < 0 || xx >= g.cols) continue
      const i = y * g.cols + xx
      b.ch[i] = text[k]
      b.shade[i] = shade
      b.inv[i] = 0
    }
  }

  // The variant sees every cell; damp<1 near the wordmark so the field
  // quiets down around the type instead of cutting off at the border.
  function fieldInto(b, g, ctx, cursor, bgv) {
    bgv.frame(g, ctx, cursor)
    const fade = settings.bgFade
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        const i = y * g.cols + x
        b.inv[i] = 0
        if (inRect(x, y, geo.box) || inRect(x, y, geo.btn, 1) || y === geo.tagY) {
          b.ch[i] = ' '
          b.shade[i] = 0
          continue
        }
        let damp = 1
        if (inRect(x, y, geo.box, 2) || inRect(x, y, geo.btn, 2)) damp = 0.3
        const cell = bgv.at(x, y, damp)
        if (!cell || cell.ch === ' ') {
          b.ch[i] = ' '
          b.shade[i] = 0
          continue
        }
        b.ch[i] = cell.ch
        b.shade[i] = Math.min(1, cell.shade * fade)
      }
    }
  }

  function paintBox(b, g) {
    const { x, y, w, h, banner } = geo.box
    paintStr(b, g, x, y, '┌' + '─'.repeat(w - 2) + '┐', 0.9)
    for (let yy = y + 1; yy < y + h - 1; yy++) {
      paintStr(b, g, x, yy, '│' + ' '.repeat(w - 2) + '│', 0.9)
    }
    paintStr(b, g, x, y + h - 1, '└' + '─'.repeat(w - 2) + '┘', 0.9)
    const y0 = y + Math.floor((h - banner.length) / 2)
    banner.forEach((line, k) => {
      const bx = x + Math.floor((w - line.length) / 2)
      const by = y0 + k
      if (by < 0 || by >= g.rows) return
      for (let c = 0; c < line.length; c++) {
        if (line[c] === ' ') continue
        const xx = bx + c
        if (xx < 0 || xx >= g.cols) continue
        const i = by * g.cols + xx
        b.ch[i] = line[c]
        b.shade[i] = 1
        b.inv[i] = 0
      }
    })
  }

  // The copy button: a solid inverse block with its label. No hover or
  // press variants — the copied-label effect is the click feedback.
  function paintButton(b, g) {
    const { x, y, w, h } = geo.btn
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const px = x + xx
        const py = y + yy
        if (px < 0 || px >= g.cols || py < 0 || py >= g.rows) continue
        const i = py * g.cols + px
        b.shade[i] = 1
        b.inv[i] = 1
        b.ch[i] = ' '
      }
    }
    const label = 'COPY'
    const lx = x + Math.floor((w - label.length) / 2)
    const ly = y + (h >> 1)
    for (let c = 0; c < label.length; c++) {
      const xx = lx + c
      if (xx < 0 || xx >= g.cols || ly < 0 || ly >= g.rows) continue
      const i = ly * g.cols + xx
      b.ch[i] = label[c]
      b.shade[i] = 1
      b.inv[i] = 1
    }
  }

  function paintTagline(b, g, ctx) {
    const t = taglineAt(ctx.time)
    const x0 = Math.floor((g.cols - (t.prefix.length + t.phrase.length)) / 2)
    paintStr(b, g, x0, geo.tagY, t.prefix, 0.5)
    paintStr(b, g, x0 + t.prefix.length, geo.tagY, t.phrase, 1)
  }

  function build(g, ctx, cursor, errMsg, bgv) {
    if (alloc(buf, g) || !geo.box) layoutGeo(g)
    fieldInto(buf, g, ctx, cursor, bgv)
    paintBox(buf, g)
    paintButton(buf, g)
    paintTagline(buf, g, ctx)
    if (errMsg) paintStr(buf, g, 2, 1, (' ERR ' + errMsg + ' ').slice(0, g.cols - 4), 1)
    return buf
  }

  return { build, geo }
}
