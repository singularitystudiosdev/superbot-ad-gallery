// Deterministic randomness and value noise.
// Value noise after the scratchapixel procedural-patterns lesson, the same
// construction play.core's demos/doom_flame.js uses (Apache-2.0).

function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), t | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// Stable per-cell random in [0,1); same (x, y, salt) always agree.
export function cellRand(x, y, salt) {
  return mulberry32(((x + 1) * 374761393) ^ ((y + 1) * 668265263) ^ (salt * 69069))()
}

function makeNoise(seed = 1) {
  const size = 256
  const mask = size - 1
  const rand = mulberry32(seed)
  const vals = new Float32Array(size)
  const perm = new Uint16Array(size * 2)
  for (let i = 0; i < size; i++) {
    vals[i] = rand()
    perm[i] = i
  }
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = perm[i]
    perm[i] = perm[j]
    perm[j] = tmp
  }
  for (let i = 0; i < size; i++) perm[size + i] = perm[i]
  const at = (ix, iy) => vals[perm[perm[ix & mask] + (iy & mask)]]
  return function (x, y) {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const ux = fx * fx * (3 - 2 * fx)
    const uy = fy * fy * (3 - 2 * fy)
    const a = at(ix, iy)
    const b = at(ix + 1, iy)
    const c = at(ix, iy + 1)
    const d = at(ix + 1, iy + 1)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
  }
}

export function makeFbm(seed, octaves = 3) {
  const n = makeNoise(seed)
  const norm = 1 - Math.pow(0.5, octaves)
  return function (x, y) {
    let v = 0
    let amp = 0.5
    let f = 1
    for (let i = 0; i < octaves; i++) {
      v += amp * n(x * f, y * f)
      amp *= 0.5
      f *= 2.03
    }
    return v / norm
  }
}
