// Runtime settings: which background runs, its intensity, and the layout
// geometry of the framed wordmark, button and tagline. The background choice
// is saved so it survives reload. URL params override storage: ?bg=rain
// picks a variant.

const KEY = 'sb-settings'

const DEFAULTS = {
  bg: 'stars',
  bgSpeed: 2.2, // background time multiplier
  bgFade: 0.45, // background brightness multiplier
  padX: 3, // frame side padding, cells
  padY: 0, // extra frame rows above and below the banner
  boxDX: 0, // frame offset from the centered position
  boxDY: 0,
  btnW: 12,
  btnH: 3,
  gap: 2, // frame -> button gap
  tagGap: 1, // frame bottom -> tagline gap
  fxOn: 'copied,highlight', // enabled copy effects — all play together
  copiedDur: 1300, // how long the button reads the copied label, ms
  copiedText: 'COPIED',
}

// [min, max, step] per number, used to clamp stored values on load.
export const RANGES = {
  bgSpeed: [0, 4, 0.1],
  bgFade: [0, 1.5, 0.05],
  padX: [0, 24, 1],
  padY: [0, 8, 1],
  boxDX: [-40, 40, 1],
  boxDY: [-20, 20, 1],
  btnW: [6, 24, 1],
  btnH: [3, 7, 1],
  gap: [0, 12, 1],
  tagGap: [0, 8, 1],
  copiedDur: [400, 4000, 100],
}

export function clampSetting(key, value) {
  const r = RANGES[key]
  if (!r) return value
  const v = Math.round(value / r[2]) * r[2]
  return Math.max(r[0], Math.min(r[1], Math.round(v * 100) / 100))
}

export function loadSettings() {
  const s = { ...DEFAULTS }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const stored = JSON.parse(raw)
      for (const k of Object.keys(DEFAULTS)) {
        if (!(k in stored)) continue
        s[k] = typeof DEFAULTS[k] === 'number' ? clampSetting(k, Number(stored[k]) || 0) : String(stored[k])
      }
      // Effects come and go across versions; scrub fxOn down to the keys
      // that still exist so stale saves cannot enable ghosts.
      const known = ['copied', 'highlight']
      s.fxOn = String(s.fxOn)
        .split(',')
        .map(t => t.trim())
        .filter(k => known.includes(k))
        .join(',')
    }
  } catch (err) {
    console.error(err)
  }
  const q = new URLSearchParams(location.search)
  if (q.has('bg')) s.bg = q.get('bg')
  return s
}

export function saveSettings(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch (err) {
    console.error(err)
  }
}
