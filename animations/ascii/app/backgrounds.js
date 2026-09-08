// Background variants: fundamentally different textmode fields behind the
// wordmark, from dense to nearly nothing. Contract per variant:
//   frame(g, ctx, cursor)  — once per painted frame; cache ctx, step state.
//   at(x, y, damp) -> null | { ch, shade }  — pure per-cell sample; damp<1
//     near the wordmark. All randomness comes from cellRand/mulberry32 so a
//     frozen time (prefers-reduced-motion) still renders a stable frame.
import { RAMP } from './scene.js'
import { flowAt } from './flow.js'
import { cellRand } from './noise.js'

const clamp01 = v => Math.max(0, Math.min(1, v))

// Map a damped intensity through the shared ramp, like the original field.
function rampCell(v) {
  const idx = Math.round(v * (RAMP.length - 1))
  const ch = RAMP[Math.max(0, Math.min(RAMP.length - 1, idx))]
  if (ch === ' ') return null
  return { ch, shade: 0.12 + v * 0.62 }
}

export function createBackgrounds(settings) {
  // ---- flow: the original domain-warped fbm ink (density ~70%) ----
  const flowS = { ctx: null, cursor: null }
  const flow = {
    key: 'flow',
    frame(g, ctx, cursor) {
      flowS.ctx = { ...ctx, time: ctx.time * settings.bgSpeed }
      flowS.cursor = cursor
    },
    at(x, y, damp) {
      return rampCell(clamp01(flowAt(x, y, flowS.ctx, flowS.cursor)) * damp)
    },
  }

  // ---- rain: falling columns, bright head, fading trail (density ~15%).
  // Stateless Matrix-style rain: each column's head position is a function
  // of time, so a frozen frame still shows hanging streaks.
  const RAIN_CHARS = '01<>[]{}|/\\+=*:;.xzkq'
  const rainS = { t: 0, rows: 0 }
  const rain = {
    key: 'rain',
    frame(g, ctx) {
      rainS.t = ctx.time * settings.bgSpeed
      rainS.rows = g.rows
    },
    at(x, y, damp) {
      const phase = cellRand(x, 0, 11)
      const speed = 0.006 + cellRand(x, 1, 12) * 0.011
      const trail = 6 + Math.floor(cellRand(x, 2, 13) * 10)
      const cycle = rainS.rows + trail + 16 + Math.floor(phase * 44)
      const head = (rainS.t * speed + phase * cycle * 3) % cycle
      const d = head - y
      if (d < 0 || d > trail) return null
      const v = (1 - d / trail) * damp
      if (v <= 0.03) return null
      const flicker = cellRand(x, y, 17 + (((rainS.t / 180) | 0) % 97))
      const ch = RAIN_CHARS[(flicker * RAIN_CHARS.length) | 0]
      return { ch, shade: d < 1 ? Math.min(1, 0.9 * damp + 0.1) : 0.14 + v * 0.55 }
    },
  }

  // ---- life: Conway's Game of Life, ~8 ticks/s, toroidal, reseeded when
  // it dies out and stirred with random cells so it never goes still.
  // (Gardner, Scientific American 223, 1970.) Density ~8-12%.
  const lifeS = { cols: 0, rows: 0, cells: null, next: null, age: null, last: 0, salt: 1, step: 0 }
  function seedLife(cols, rows) {
    const n = cols * rows
    lifeS.cols = cols
    lifeS.rows = rows
    lifeS.cells = new Uint8Array(n)
    lifeS.next = new Uint8Array(n)
    lifeS.age = new Uint8Array(n)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        lifeS.cells[y * cols + x] = cellRand(x, y, lifeS.salt * 31 + 5) < 0.16 ? 1 : 0
      }
    }
    lifeS.step = 0
  }
  function stepLife() {
    const { cols, rows, cells, next, age } = lifeS
    let pop = 0
    for (let y = 0; y < rows; y++) {
      const up = ((y + rows - 1) % rows) * cols
      const mid = y * cols
      const dn = ((y + 1) % rows) * cols
      for (let x = 0; x < cols; x++) {
        const l = (x + cols - 1) % cols
        const r = (x + 1) % cols
        const n =
          cells[up + l] + cells[up + x] + cells[up + r] +
          cells[mid + l] + cells[mid + r] +
          cells[dn + l] + cells[dn + x] + cells[dn + r]
        const alive = cells[mid + x] ? (n === 2 || n === 3) : n === 3
        next[mid + x] = alive ? 1 : 0
        age[mid + x] = alive ? Math.min(250, cells[mid + x] ? age[mid + x] + 1 : 1) : 0
        pop += alive ? 1 : 0
      }
    }
    lifeS.cells = next
    lifeS.next = cells
    lifeS.step++
    // Stir: a pinch of random cells every ~8s keeps still lifes moving.
    if (lifeS.step % 64 === 0) {
      for (let k = 0; k < 30; k++) {
        const x = (cellRand(k, lifeS.step, 41) * cols) | 0
        const y = (cellRand(k, lifeS.step, 43) * rows) | 0
        lifeS.cells[y * cols + x] = 1
        lifeS.age[y * cols + x] = 1
      }
    }
    if (pop < (cols * rows) / 200) {
      lifeS.salt++
      seedLife(cols, rows)
    }
  }
  const life = {
    key: 'life',
    frame(g, ctx, cursor) {
      if (lifeS.cols !== g.cols || lifeS.rows !== g.rows) seedLife(g.cols, g.rows)
      const t = ctx.time * settings.bgSpeed
      // Re-anchor after a speed change or first frame so the tick loop
      // never storms forward or stalls waiting for the clock to catch up.
      if (lifeS.last === 0 || t < lifeS.last || t - lifeS.last > 1000) lifeS.last = t - 125
      while (t - lifeS.last >= 125) {
        stepLife()
        lifeS.last += 125
      }
      if (cursor) {
        const cx = cursor.x | 0
        const cy = cursor.y | 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const x = cx + dx
            const y = cy + dy
            if (x < 0 || x >= lifeS.cols || y < 0 || y >= lifeS.rows) continue
            if (cellRand(x, y, lifeS.step + 47) < 0.4) {
              lifeS.cells[y * lifeS.cols + x] = 1
              lifeS.age[y * lifeS.cols + x] = 1
            }
          }
        }
      }
    },
    at(x, y, damp) {
      if (!lifeS.cells || !lifeS.cells[y * lifeS.cols + x]) return null
      const a = lifeS.age[y * lifeS.cols + x]
      const ch = a <= 1 ? '#' : a < 6 ? 'o' : '·'
      const shade = (a <= 1 ? 0.95 : a < 6 ? 0.7 : 0.42) * damp
      if (shade <= 0.05) return null
      return { ch, shade }
    },
  }

  // ---- rings: interference of two drifting circular waves, mapped through
  // the shared ramp — slow structural geometry (density ~55%).
  const ringS = { t: 0, c1: [0, 0], c2: [0, 0], aspect: 0.55 }
  const rings = {
    key: 'rings',
    frame(g, ctx) {
      const t = ctx.time * settings.bgSpeed * 0.001
      ringS.t = t
      ringS.aspect = ctx.aspect
      ringS.c1 = [g.cols * (0.5 + 0.35 * Math.sin(t * 0.21)), g.rows * (0.5 + 0.3 * Math.cos(t * 0.17))]
      ringS.c2 = [g.cols * (0.5 + 0.35 * Math.sin(t * 0.13 + 2.6)), g.rows * (0.5 + 0.3 * Math.cos(t * 0.23 + 1.2))]
    },
    at(x, y, damp) {
      const a = ringS.aspect
      const d1 = Math.hypot((x - ringS.c1[0]) * a, y - ringS.c1[1])
      const d2 = Math.hypot((x - ringS.c2[0]) * a, y - ringS.c2[1])
      let v = 0.5 + 0.25 * Math.sin(d1 * 0.9 - ringS.t * 2.4) + 0.25 * Math.sin(d2 * 0.9 + ringS.t * 2.0)
      v = clamp01(v)
      return rampCell(v * v * damp)
    },
  }

  // ---- static: low-glow receiver noise with a sweeping scanline
  // (density ~45%, but dim).
  const STATIC_CHARS = '·:;+'
  const staticS = { gen: 0, scanY: -10 }
  const staticv = {
    key: 'static',
    frame(g, ctx) {
      const t = ctx.time * settings.bgSpeed
      staticS.gen = 23 + (((t / 90) | 0) % 251)
      staticS.scanY = ((t * 0.02) % (g.rows + 8)) - 4
    },
    at(x, y, damp) {
      const r = cellRand(x, y, staticS.gen)
      const band = Math.exp(-((y - staticS.scanY) ** 2) / 6)
      let v = (r < 0.55 ? 0 : (r - 0.55) * 0.5) + band * r * 0.5
      v *= damp
      if (v <= 0.04) return null
      const ch = STATIC_CHARS[Math.min(STATIC_CHARS.length - 1, (r * STATIC_CHARS.length) | 0)]
      return { ch, shade: 0.1 + v }
    },
  }

  // ---- stars: near-empty night sky, ~1.5% of cells, slow twinkle ----
  const starS = { t: 0 }
  const stars = {
    key: 'stars',
    frame(g, ctx) {
      starS.t = ctx.time * settings.bgSpeed
    },
    at(x, y, damp) {
      const r = cellRand(x, y, 3)
      if (r < 0.985) return null
      const base = cellRand(x, y, 5)
      const tw = 0.55 + 0.45 * Math.sin(starS.t * 0.0015 * (0.5 + base) + r * 400)
      const ch = base > 0.92 ? '*' : base > 0.6 ? '+' : '.'
      const shade = (0.25 + 0.6 * base) * tw * damp
      if (shade <= 0.05) return null
      return { ch, shade }
    },
  }

  // ---- void: close to nothing — two drifting motes and a blinking
  // cursor, under 0.2% of cells lit.
  const voidS = { dots: [] }
  const voidv = {
    key: 'void',
    frame(g, ctx) {
      const t = ctx.time * settings.bgSpeed
      voidS.dots = [
        {
          x: Math.round(g.cols * (0.5 + 0.38 * Math.sin(t * 0.00013 + 1.7))),
          y: Math.round(g.rows * (0.5 + 0.32 * Math.sin(t * 0.00027 + 4.2))),
          ch: '·',
          shade: 0.5,
        },
        {
          x: Math.round(g.cols * (0.5 + 0.42 * Math.sin(t * 0.00009 + 3.9))),
          y: Math.round(g.rows * (0.5 + 0.36 * Math.sin(t * 0.00019 + 0.8))),
          ch: '.',
          shade: 0.35,
        },
        {
          x: Math.round(g.cols * 0.86),
          y: Math.round(g.rows * 0.14),
          ch: '_',
          shade: ((t / 900) | 0) % 2 === 0 ? 0.7 : 0,
        },
      ]
    },
    at(x, y, damp) {
      for (const d of voidS.dots) {
        if (d.x === x && d.y === y && d.shade > 0) return { ch: d.ch, shade: d.shade * damp }
      }
      return null
    },
  }

  const list = [flow, rain, life, rings, staticv, stars, voidv]
  return {
    list,
    get(key) {
      return list.find(v => v.key === key) || list[0]
    },
  }
}
