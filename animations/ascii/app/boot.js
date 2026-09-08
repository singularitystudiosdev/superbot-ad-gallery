// Boot: canvas metrics, the frame loop, input, clipboard. Everything on
// screen is a character cell, after play.core's textmode program model
// (github.com/ertdfgcvb/play.core, Apache-2.0).
import { createScene } from './scene.js'

const COPY_LINK = 'https://superbot.gg'
import { createFx } from './fx.js'
import { createBackgrounds } from './backgrounds.js'
import { loadSettings, saveSettings } from './config.js'

const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const TARGET_COLS = 112

const canvas = document.getElementById('grid')
const copyBtn = document.getElementById('copy')
const ctx2d = canvas.getContext('2d')
const settings = loadSettings()
const scene = createScene(settings)
const fx = createFx(settings)
const bgs = createBackgrounds(settings)
let bgv = bgs.get(settings.bg)

const g = { cols: 0, rows: 0, cellW: 9, cellH: 16, aspect: 0.55, fontSize: 16 }
const cursor = { x: -1e3, y: -1e3, active: false }
const state = { errMsg: '' }

// Debug handle for headless verification.
const dbg = { fx, lastFrame: 0 }
window.__sb = dbg

const STYLES = Array.from({ length: 33 }, (_, k) => {
  const v = Math.round(8 + (k / 32) * 232)
  return 'rgb(' + v + ',' + v + ',' + v + ')'
})

let needBtnPos = true

function fit() {
  const dpr = window.devicePixelRatio || 1
  const vw = window.innerWidth
  const vh = window.innerHeight
  ctx2d.font = '100px ' + FONT
  const adv = ctx2d.measureText('M').width / 100
  g.fontSize = Math.max(6, Math.min(24, Math.floor(vw / (TARGET_COLS * adv))))
  canvas.width = Math.round(vw * dpr)
  canvas.height = Math.round(vh * dpr)
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx2d.font = g.fontSize + 'px ' + FONT
  ctx2d.textBaseline = 'top'
  g.cellW = ctx2d.measureText('M').width
  g.cellH = g.fontSize
  g.cols = Math.max(20, Math.floor(vw / g.cellW))
  g.rows = Math.max(10, Math.floor(vh / g.cellH))
  g.aspect = g.cellW / g.cellH
  needBtnPos = true
}

function positionCopyButton() {
  const b = scene.geo.btn
  if (!b) return
  copyBtn.style.left = b.x * g.cellW + 'px'
  copyBtn.style.top = b.y * g.cellH + 'px'
  copyBtn.style.width = b.w * g.cellW + 'px'
  copyBtn.style.height = b.h * g.cellH + 'px'
  needBtnPos = false
}

function drawCell(x, y, chr, shade, inv) {
  const px = x * g.cellW
  const py = y * g.cellH
  if (inv) {
    ctx2d.fillStyle = STYLES[32]
    ctx2d.fillRect(px, py, g.cellW + 0.5, g.cellH + 0.5)
    if (chr !== ' ') {
      ctx2d.fillStyle = '#050505'
      ctx2d.fillText(chr, px, py)
    }
    return
  }
  if (chr === ' ' || shade <= 0) return
  ctx2d.fillStyle = STYLES[Math.max(0, Math.min(32, Math.round(shade * 32)))]
  ctx2d.fillText(chr, px, py)
}

function frame(now) {
  dbg.lastFrame = now
  const fctx = { cols: g.cols, rows: g.rows, time: now, aspect: g.aspect }
  const buf = scene.build(g, fctx, cursor.active ? cursor : null, state.errMsg, bgv)
  fx.apply(now, g, buf, scene.geo)
  if (needBtnPos) positionCopyButton()

  ctx2d.fillStyle = '#050505'
  ctx2d.fillRect(0, 0, window.innerWidth, window.innerHeight)

  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      const i = y * g.cols + x
      drawCell(x, y, buf.ch[i], buf.shade[i], buf.inv[i])
    }
  }
  requestAnimationFrame(frame)
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch (err) {
    console.error(err)
    return false
  }
}

async function doCopy() {
  let ok = false
  try {
    await navigator.clipboard.writeText(COPY_LINK)
    ok = true
  } catch (err) {
    console.error(err)
    ok = fallbackCopy(COPY_LINK)
  }
  if (!ok) {
    state.errMsg = 'clipboard unavailable'
    return
  }
  fx.trigger(performance.now())
}

window.addEventListener('resize', fit)
window.addEventListener('pointermove', e => {
  cursor.x = e.clientX / g.cellW
  cursor.y = e.clientY / g.cellH
  cursor.active = true
})
document.addEventListener('pointerleave', () => {
  cursor.active = false
})
copyBtn.addEventListener('click', () => {
  doCopy()
  // Drop focus so the C shortcut keeps working after a click — the keydown
  // guard ignores keys while a button is focused.
  copyBtn.blur()
})
window.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = e.target && e.target.tagName
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
  const k = e.key.toLowerCase()
  if (k === 'c') doCopy()
  else if (e.key === '[' || e.key === ']') {
    const n = bgs.list.length
    const idx = bgs.list.indexOf(bgv)
    bgv = bgs.list[(idx + (e.key === ']' ? 1 : n - 1)) % n]
    settings.bg = bgv.key
    saveSettings(settings)
  }
})
window.addEventListener('error', e => {
  state.errMsg = String(e.message || 'script error')
})
window.addEventListener('unhandledrejection', e => {
  state.errMsg = String((e.reason && e.reason.message) || e.reason || 'rejection')
})

// Demo hook: #burst cycles the effect pool back to back; #burst=<key>
// pins one effect, so a headless capture lands inside a chosen live burst.
const burstMatch = location.hash.match(/^#burst(?:=(\w+))?$/)
if (burstMatch) {
  const hold = t => {
    if (!fx.active(t)) fx.trigger(t - 120, burstMatch[1])
    requestAnimationFrame(hold)
  }
  requestAnimationFrame(hold)
}

fit()
requestAnimationFrame(frame)
