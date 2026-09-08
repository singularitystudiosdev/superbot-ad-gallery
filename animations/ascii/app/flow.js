// Domain-warped fbm flow — ink drifting through the grid — stirred by the
// cursor. The background's small movement.
import { makeFbm } from './noise.js'

const warp = makeFbm(11, 3)
const base = makeFbm(47, 3)

// v in [0,1]; ctx = { cols, rows, time, aspect }; cursor in cell coords or null.
export function flowAt(x, y, ctx, cursor) {
  const t = ctx.time * 0.00006
  let ux = x * ctx.aspect * 0.07
  let uy = y * 0.07
  if (cursor) {
    const dx = (x - cursor.x) * ctx.aspect
    const dy = y - cursor.y
    const s = 1.4 * Math.exp(-(dx * dx + dy * dy) / 110)
    if (s > 0.01) {
      const cs = Math.cos(s)
      const sn = Math.sin(s)
      const cx = cursor.x * ctx.aspect * 0.07
      const cy = cursor.y * 0.07
      const ox = ux - cx
      const oy = uy - cy
      ux = cx + ox * cs - oy * sn
      uy = cy + ox * sn + oy * cs
    }
  }
  const wx = warp(ux + t * 2.4, uy - t * 1.1)
  const wy = warp(ux - t * 1.7, uy + t * 2.1 + 7.3)
  let v = base(ux + 1.9 * (wx - 0.5), uy + 1.9 * (wy - 0.5))
  v = v * v * 1.7
  return Math.max(0, Math.min(1, v))
}
