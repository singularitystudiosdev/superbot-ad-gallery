/* kit.93d8bde0.js: the Superbot desktop UI kit for the "Train your own
   Superbot" ad. Plain ES module, no build step, no React, no CDN. Every
   class is scoped under .sbk (kit.93d8bde0.css).

   DETERMINISM: the kit ships no CSS animation and no transition. Each factory
   returns a `paint(t)`; `t` is milliseconds and every moving thing (storm
   ring spin, working rail, thinking sheen, mascot bob and ears, red dot
   pulse, caret blink) is computed from `t` alone, so a frozen frame at any t
   is reproducible.

   ------------------------------------------------------------------
   API
   ------------------------------------------------------------------
   makeMark(opts) -> { el, paint(t) }
     The white Superbot head with its teal and magenta ghosts (the geometry of
     packages/ui/src/marks/mark-superbot.tsx).
     opts.size     px, the box (default 48)
     opts.ink      the face's fill (default '#ffffff')
     opts.ghosts   draw the duotone ghosts (default true)
     opts.listening  arms the listening motion: bob, ear tilt, pupils, blink

   makeApp(opts) -> {
     root,                       // the .sbk window (1536x864)
     sidebar, hud, mark, discs, newBtn,
     rows,                       // Map<id, {el, title, status, set(status)}>
     main, head, hero, heroMark, composer,
     addRowTop(id, title, status) -> row,   // inserts at the top of the list
     setRowStatus(id, status),              // 'working' | 'idle' | 'needs'
     setActive(id),
     setHero(visible),           // hero shown / thread area left empty
     paint(t)
   }
     opts.rows: [{id, title, status}]

   makeCreatePanel(opts) -> {
     root, scrim, panel, input, caret, primary, secondary, close,
     setName(text, caretOn),    // caretOn toggles the blinking caret
     setPrimary(state),         // 'rest' | 'hover' | 'press'
     paint(t)
   }

   makeRecPill(opts) -> {
     root, dot, timer, mark, caption, done,
     setCaption(words),         // [{text, age}] age 0..1 drives opacity
     setTimer(text),            // '0:41'
     setDone(state),            // 'rest' | 'hover' | 'press'
     paint(t)
   }

   makeThread(opts) -> {
     root, userTurn, poster, thinking, verify, reply, slot, outcome,
     setStep(i, state),         // 'pending' | 'running' | 'done'
     setVerifyStep(i, state),
     setOutcome(text),
     paint(t)
   }
   ------------------------------------------------------------------ */

const HEAD_D =
  'M29 32H71A15 15 0 0 1 86 47V71A15 15 0 0 1 71 86H29A15 15 0 0 1 14 71V47A15 15 0 0 1 29 32Z'
const EAR_L_D = 'M14 46V28Q14 20 21 21Q28 24 36 32Z'
const EAR_R_D = 'M86 46V28Q86 20 79 21Q72 24 64 32Z'
const EYES = { leftCx: 35, rightCx: 65, cy: 58, rx: 8, ry: 11 }

let uid = 0
const nextId = (p) => `${p}${(++uid).toString(36)}`

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Tiny element helper: props become attributes, except a few DOM ones. */
function h(tag, props, kids) {
  const el = document.createElement(tag)
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue
      if (k === 'class') el.className = v
      else if (k === 'text') el.textContent = v
      else if (k === 'html') el.innerHTML = v
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v)
      else el.setAttribute(k, v === true ? '' : String(v))
    }
  }
  if (kids) for (const kid of [].concat(kids)) if (kid) el.appendChild(kid)
  return el
}

/** An inline SVG icon from a path list, 24-unit viewBox, currentColor. */
function icon(paths, opts = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', opts.viewBox ?? '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.setAttribute('fill', opts.fill ?? 'none')
  svg.setAttribute('stroke', opts.fill ? 'none' : 'currentColor')
  svg.setAttribute('stroke-width', String(opts.width ?? 2))
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  for (const d of [].concat(paths)) {
    const p = document.createElementNS(SVG_NS, 'path')
    p.setAttribute('d', d)
    svg.appendChild(p)
  }
  return svg
}

const ICONS = {
  plus: ['M12 5v14', 'M5 12h14'],
  chevron: ['m7 10 5 5 5-5'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm20 20-4-4'],
  check: ['m5 13 4 4 10-10'],
  spinner: ['M12 3a9 9 0 1 0 9 9'],
  circle: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'],
  help: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.9-.9 1.6v.3', 'M12 17h.01'],
  record: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z'],
  monitor: ['M4 6h16v10H4z', 'M9 20h6', 'M12 16v4'],
  voice: ['M4 10v4', 'M8 7v10', 'M12 4v16', 'M16 8v8', 'M20 11v2'],
  mic: ['M12 4a2.5 2.5 0 0 0-2.5 2.5v5a2.5 2.5 0 0 0 5 0v-5A2.5 2.5 0 0 0 12 4Z', 'M6 11a6 6 0 0 0 12 0', 'M12 17v3'],
  send: ['M12 19V5', 'm6 11 6-6 6 6'],
  spark: ['M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8Z'],
  sidebar: ['M4 6h16v12H4z', 'M10 6v12'],
  clock: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 8v4.5l3 1.5'],
  dot: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z']
}

/* ------------------------------------------------------------------ */
/* the mark                                                            */
/* ------------------------------------------------------------------ */

/** The living Superbot head. Returns { el, paint(t) }.
    The geometry, the ghosts' offsets and the motion numbers are the app's
    (mark-superbot.tsx, mascot-motion.css): bob +/-1.5px on 2400ms, ears
    +/-3deg on 3100ms / 4300ms, blink ry 11 -> 1. */
export function makeMark(opts = {}) {
  const size = opts.size ?? 48
  const ink = opts.ink ?? '#ffffff'
  const ghosts = opts.ghosts !== false
  const listening = opts.listening === true
  const maskId = nextId('sbk-face-')

  const root = h('span', { class: 'sbk-mark', style: { width: size + 'px', height: size + 'px', display: 'block' } })

  /* Each tone layer is the SAME masked head (mark-superbot-glitch.tsx): the
     head path with the two eye ellipses punched out, so every copy is cut
     through and the surface shows in the eyes. */
  const layer = (cls, fill, dx, dy) => {
    const span = h('span', {
      class: 'sbk-mark-layer ' + cls,
      style: {
        position: 'absolute',
        inset: '0',
        display: 'block',
        transform: `translate(${dx}%, ${dy}%)`
      }
    })
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('style', 'display:block;width:100%;height:100%')
    {
      const layerMaskId = nextId('sbk-face-')
      const defs = document.createElementNS(SVG_NS, 'defs')
      const mask = document.createElementNS(SVG_NS, 'mask')
      mask.setAttribute('id', layerMaskId)
      mask.setAttribute('maskUnits', 'userSpaceOnUse')
      mask.setAttribute('x', '0')
      mask.setAttribute('y', '0')
      mask.setAttribute('width', '100')
      mask.setAttribute('height', '100')
      const head = document.createElementNS(SVG_NS, 'path')
      head.setAttribute('fill', '#ffffff')
      head.setAttribute('d', HEAD_D)
      mask.appendChild(head)
      const holes = document.createElementNS(SVG_NS, 'g')
      holes.setAttribute('fill', '#000000')
      for (const [cls2, cx] of [['sbk-eye-l', EYES.leftCx], ['sbk-eye-r', EYES.rightCx]]) {
        const e = document.createElementNS(SVG_NS, 'ellipse')
        e.setAttribute('class', 'sbk-eye ' + cls2)
        e.setAttribute('cx', String(cx))
        e.setAttribute('cy', String(EYES.cy))
        e.setAttribute('rx', String(EYES.rx))
        e.setAttribute('ry', String(EYES.ry))
        holes.appendChild(e)
      }
      mask.appendChild(holes)
      defs.appendChild(mask)
      svg.appendChild(defs)
      const rect = document.createElementNS(SVG_NS, 'rect')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '100')
      rect.setAttribute('fill', fill)
      rect.setAttribute('mask', `url(#${layerMaskId})`)
      svg.appendChild(rect)
    }
    span.appendChild(svg)
    for (const [cls2, d] of [['sbk-ear-l', EAR_L_D], ['sbk-ear-r', EAR_R_D]]) {
      const ear = document.createElementNS(SVG_NS, 'svg')
      ear.setAttribute('viewBox', '0 0 100 100')
      ear.setAttribute('aria-hidden', 'true')
      ear.setAttribute('style', 'display:block;width:100%;height:100%')
      const p = document.createElementNS(SVG_NS, 'path')
      p.setAttribute('fill', fill)
      p.setAttribute('d', d)
      ear.appendChild(p)
      const earSpan = h('span', {
        class: 'sbk-ear ' + cls2,
        style: {
          position: 'absolute',
          inset: '0',
          display: 'block',
          transformOrigin: cls2 === 'sbk-ear-l' ? '25% 46%' : '75% 46%'
        }
      })
      ear.appendChild(p)
      earSpan.appendChild(ear)
      span.appendChild(earSpan)
    }
    return span
  }

  if (ghosts) {
    root.appendChild(layer('sbk-mark-a', 'var(--color-brand-superbot-duo-a, #00e5c3)', -1.2, -1.2))
    root.appendChild(layer('sbk-mark-b', 'var(--color-brand-superbot-duo-b, #c026d3)', 1.2, 1.2))
  }
  const face = layer('sbk-mark-face', ink, 0, 0)
  root.appendChild(face)
  root.style.position = root.style.position || 'relative'

  const eyes = listening ? [...face.querySelectorAll('.sbk-eye')] : []
  const earsL = [...root.querySelectorAll('.sbk-ear-l')]
  const earsR = [...root.querySelectorAll('.sbk-ear-r')]

  const paint = (t = 0) => {
    if (!listening) return
    /* bob: +/-1.5px on a 2400ms ease-in-out, the mascot-motion.css number */
    const bob = Math.sin((t / 2400) * Math.PI * 2) * 1.5
    root.style.transform = `translateY(${bob.toFixed(2)}px)`
    /* ears: +/-3deg, 3100ms / 4300ms, opposed phase */
    const earL = Math.sin((t / 3100) * Math.PI * 2) * 3
    const earR = Math.sin((t / 4300) * Math.PI * 2 + Math.PI) * 3
    for (const e of earsL) e.style.transform = `rotate(${earL.toFixed(2)}deg)`
    for (const e of earsR) e.style.transform = `rotate(${earR.toFixed(2)}deg)`
    /* listening eyes: a slow open/close breath plus a small drift, so the
       head reads as attentive rather than asleep */
    const breath = 0.86 + 0.14 * (0.5 + 0.5 * Math.sin((t / 1700) * Math.PI * 2))
    const driftX = Math.sin((t / 2600) * Math.PI * 2) * 1.2
    const driftY = Math.sin((t / 3300) * Math.PI * 2 + 1.1) * 0.9
    for (let i = 0; i < eyes.length; i++) {
      const baseX = i === 0 ? EYES.leftCx : EYES.rightCx
      eyes[i].setAttribute('ry', (EYES.ry * breath).toFixed(2))
      eyes[i].setAttribute('cx', (baseX + driftX).toFixed(2))
      eyes[i].setAttribute('cy', (EYES.cy + driftY).toFixed(2))
    }
  }

  return { el: root, paint }
}

/* ------------------------------------------------------------------ */
/* the storm tile glyph for a chat row                                 */
/* ------------------------------------------------------------------ */

function makeTileGlyph() {
  const tile = h('span', { class: 'sbk-tile' })
  tile.appendChild(h('span', { class: 'sbk-tile-ring' }))
  const face = makeMark({ size: 12, ghosts: false })
  face.el.classList.add('sbk-tile-face')
  tile.appendChild(face.el)
  return { el: tile, ring: tile.querySelector('.sbk-tile-ring') }
}

/* ------------------------------------------------------------------ */
/* A. the window                                                       */
/* ------------------------------------------------------------------ */

const STATUS_SUB = {
  working: 'working',
  idle: 'idle',
  needs: 'needs you'
}

export function makeApp(opts = {}) {
  const rowsSpec = opts.rows ?? []
  const root = h('div', { class: 'sbk' })

  /* ---- sidebar ---- */
  const mark = makeMark({ size: 48 })
  const discs = h('div', { class: 'sbk-discs' })
  for (const [label, glyph] of [
    ['G', 'Gmail'],
    ['D', 'Drive'],
    ['C', 'Calendar'],
    ['S', 'Slack']
  ]) {
    discs.appendChild(h('span', { class: 'sbk-disc', title: glyph, text: label }))
  }
  discs.appendChild(h('span', { class: 'sbk-disc sbk-disc-add', title: 'Connect an app' }, [icon(ICONS.plus, { width: 2.4 })]))

  const hudHide = h('button', { class: 'sbk-hud-hide', type: 'button', 'aria-label': 'Hide sidebar' }, [
    icon(ICONS.sidebar, { width: 2 })
  ])

  const hud = h('div', { class: 'sbk-hud' }, [
    h('div', { class: 'sbk-hud-band' }, [
      h('div', { class: 'sbk-lights' }, [
        h('span', { class: 'sbk-light sbk-light-close' }),
        h('span', { class: 'sbk-light sbk-light-min' }),
        h('span', { class: 'sbk-light sbk-light-zoom' })
      ]),
      hudHide
    ]),
    h('div', { class: 'sbk-hud-row' }, [
      (mark.el.classList.add('sbk-hud-mark'), mark.el),
      h('div', { class: 'sbk-hud-text' }, [h('div', { class: 'sbk-wordmark', text: 'superbot' }), discs])
    ])
  ])

  /* the NEW control: styled as the app's dashed new-chat row */
  const newBtn = h('button', { class: 'sbk-newbot', type: 'button' }, [
    (() => {
      const m = makeMark({ size: 18, ghosts: false })
      m.el.classList.add('sbk-newbot-mark')
      return m.el
    })(),
    h('span', { text: 'New Superbot' }),
    h('span', { class: 'sbk-newbot-plus' }, [icon(ICONS.plus, { width: 2.4 })])
  ])

  const list = h('div', { class: 'sbk-list' }, [
    h('div', { class: 'sbk-list-head' }, [h('span', { text: 'Superbots' }), h('span', { text: String(rowsSpec.length) })])
  ])

  const rows = new Map()
  let activeId = rowsSpec.length > 0 ? rowsSpec[0].id : null

  function makeRow(id, title, status) {
    const glyph = makeTileGlyph()
    const live = h('span', { class: 'sbk-row-live' }, [
      h('span', { class: 'sbk-row-dot' }),
      h('span', { class: 'sbk-row-clock', text: '2:14' })
    ])
    const help = h('span', { class: 'sbk-row-help' }, [icon(ICONS.help, { width: 2 })])
    const rail = h('span', { class: 'sbk-row-rail' })
    const meta = h('span', { class: 'sbk-row-meta' }, [live, help])
    const el = h(
      'div',
      { class: 'sbk-row', 'data-id': id, 'data-status': status, 'data-active': String(id === activeId), role: 'button' },
      [
        h('span', { class: 'sbk-row-glyph' }, [glyph.el]),
        h('span', { class: 'sbk-row-main' }, [
          h('span', { class: 'sbk-row-title', text: title }),
          h('span', { class: 'sbk-row-sub', text: STATUS_SUB[status] ?? 'idle' })
        ]),
        meta,
        rail
      ]
    )
    const row = {
      el,
      id,
      title,
      status,
      clock: el.querySelector('.sbk-row-clock'),
      ring: glyph.ring,
      rail,
      set(next) {
        row.status = next
        el.setAttribute('data-status', next)
        el.querySelector('.sbk-row-sub').textContent = STATUS_SUB[next] ?? 'idle'
      }
    }
    return row
  }

  for (const spec of rowsSpec) {
    const row = makeRow(spec.id, spec.title, spec.status ?? 'idle')
    rows.set(spec.id, row)
    list.appendChild(row.el)
  }

  const foot = h('div', { class: 'sbk-foot' }, [
    h('span', { class: 'sbk-foot-avatar', text: 'A' }),
    h('span', { class: 'sbk-foot-text' }, [
      h('span', { class: 'sbk-foot-name', text: 'Alex Rivera' }),
      h('span', { class: 'sbk-foot-sub', text: 'Personal plan' })
    ])
  ])

  const sidebar = h('div', { class: 'sbk-sidebar' }, [hud, newBtn, list, foot])

  /* ---- main pane ---- */
  const headMark = makeMark({ size: 16, ghosts: false })
  headMark.el.classList.add('sbk-head-mark')
  const head = h('div', { class: 'sbk-head' }, [
    h('div', { class: 'sbk-head-title' }, [headMark.el, h('span', { class: 'sbk-head-name', text: 'New chat' })]),
    h('div', { class: 'sbk-search' }, [icon(ICONS.search, { width: 2.4 }), h('span', { text: 'Search' }), h('kbd', { text: '⌘K' })])
  ])

  const heroMark = makeMark({ size: 48, listening: true })
  heroMark.el.classList.add('sbk-hero-mark')
  const hero = h('div', { class: 'sbk-hero' }, [
    heroMark.el,
    h('h2', { class: 'sbk-hero-greeting', text: 'What should we build?' })
  ])

  const feed = h('div', { class: 'sbk-feed' }, [h('div', { class: 'sbk-feed-inner' }, [hero])])

  const composer = makeComposer()
  const main = h('div', { class: 'sbk-main' }, [head, feed, composer.row])
  root.appendChild(sidebar)
  root.appendChild(main)

  /* ---- setters ---- */
  function addRowTop(id, title, status = 'idle') {
    const row = makeRow(id, title, status)
    rows.set(id, row)
    list.insertBefore(row.el, list.children[1] ?? null)
    list.querySelector('.sbk-list-head span:last-child').textContent = String(rows.size)
    return row
  }
  function setRowStatus(id, status) {
    const row = rows.get(id)
    if (row) row.set(status)
  }
  function setActive(id) {
    activeId = id
    for (const [rid, row] of rows) row.el.setAttribute('data-active', String(rid === id))
  }

  const paint = (t = 0) => {
    mark.paint(t)
    heroMark.paint(t)
    /* the storm ring on every working row: one turn per 7s (styles.css
       .storm-tile-spin) */
    const from = ((t / 7000) % 1) * 360
    for (const row of rows.values()) {
      if (row.ring) row.ring.style.setProperty('--sbk-from', from.toFixed(1) + 'deg')
      row.ring.style.background = `conic-gradient(from ${from.toFixed(1)}deg, var(--color-brand-storm-0), var(--color-brand-storm-1), var(--color-brand-storm-2), var(--color-brand-storm-3), var(--color-brand-storm-4), var(--color-brand-storm-0))`
      /* the working dot's pulse and the rail's indeterminate sweep */
      if (row.status === 'working') {
        const dot = row.el.querySelector('.sbk-row-dot')
        const p = (t % 1400) / 1400
        dot.style.opacity = (1 - 0.55 * Math.abs(Math.sin(p * Math.PI))).toFixed(2)
        const sweep = (t % 1800) / 1800
        const eased = sweep < 0.5 ? 2 * sweep * sweep : 1 - Math.pow(-2 * sweep + 2, 2) / 2
        row.rail.style.left = (-34 + eased * 134).toFixed(2) + '%'
      }
    }
    composer.paint(t)
  }

  return {
    root,
    sidebar,
    hud,
    mark,
    discs,
    newBtn,
    rows,
    list,
    main,
    head,
    hero,
    heroMark,
    composer,
    foot,
    addRowTop,
    setRowStatus,
    setActive,
    setHero(visible) {
      hero.style.display = visible ? '' : 'none'
    },
    paint
  }
}

/* ------------------------------------------------------------------ */
/* the composer (Thread.tsx .hub-composer + packages/ui composer)      */
/* ------------------------------------------------------------------ */

function makeComposer() {
  const cap = h('span', { class: 'sbk-c-pill-cap' }, [(() => { const s = icon(ICONS.spark, { fill: 'currentColor' }); return s })()])
  const pill = h('span', { class: 'sbk-c-pill' }, [
    cap,
    h('span', { class: 'sbk-c-pill-tag', text: 'Superbot' }),
    h('span', { class: 'sbk-c-pill-mode', text: 'Agent' }),
    icon(ICONS.chevron, { width: 2.2 })
  ])
  pill.lastChild.classList.add('sbk-chev')

  const input = h('div', { class: 'sbk-composer-input' }, [
    h('div', { class: 'sbk-composer-ph', text: 'Ask anything, or drop a file' }),
    h('div', { class: 'sbk-composer-row2' }, [
      h('span', { class: 'sbk-c-plus' }, [icon(ICONS.plus, { width: 2.2 })]),
      pill,
      h('span', { class: 'sbk-c-right' }, [
        h('span', { class: 'sbk-c-target' }, [icon(ICONS.monitor, { width: 2.2 }), h('span', { text: 'This Mac' })]),
        h('span', { class: 'sbk-c-round sbk-c-computer', title: 'Computer' }, [icon(ICONS.monitor, { width: 2.3 })]),
        h('span', { class: 'sbk-c-round', title: 'Voice' }, [icon(ICONS.voice, { width: 2.2 })]),
        h('span', { class: 'sbk-c-round', title: 'Dictate' }, [icon(ICONS.mic, { width: 2.1 })]),
        h('span', { class: 'sbk-c-round sbk-c-send', title: 'Send' }, [icon(ICONS.send, { width: 2.2 })])
      ])
    ])
  ])
  const row = h('div', { class: 'sbk-composer-row' }, [h('div', { class: 'sbk-composer' }, [input])])
  const paint = () => {}
  return { row, input, pill, paint }
}

/* ------------------------------------------------------------------ */
/* B. the create panel                                                 */
/* ------------------------------------------------------------------ */

export function makeCreatePanel(opts = {}) {
  const root = h('div', { class: 'sbk-scrim' })
  const caret = h('span', { class: 'sbk-caret' })
  const valueEl = h('span', { class: 'sbk-field-value' })
  const input = h('div', { class: 'sbk-field-box' }, [valueEl, caret])

  const primary = h('button', { class: 'sbk-primary', type: 'button', 'data-state': 'rest' }, [
    h('span', { class: 'sbk-primary-glyph' }, [icon(ICONS.record, { fill: 'currentColor' })]),
    h('span', { class: 'sbk-primary-text' }, [
      h('span', { text: 'Start recording' }),
      h('small', { text: 'Teach it by showing it' })
    ])
  ])
  const secondary = h('button', { class: 'sbk-secondary', type: 'button', text: 'Describe it instead' })

  const panel = h('div', { class: 'sbk-panel' }, [
    h('div', { class: 'sbk-panel-title', text: 'New Superbot' }),
    h('div', { class: 'sbk-panel-sub', text: 'Give it a name, then show it the job once.' }),
    h('div', { class: 'sbk-field' }, [h('div', { class: 'sbk-field-label', text: 'Name' }), input]),
    h('div', { class: 'sbk-actions' }, [primary, secondary])
  ])
  root.appendChild(panel)

  let caretOn = false
  const paint = (t = 0) => {
    caret.style.opacity = caretOn ? ((t % 1060) < 530 ? '1' : '0') : '0'
  }

  return {
    root,
    panel,
    input,
    caret,
    primary,
    secondary,
    setName(text, caretVisible = false) {
      valueEl.textContent = text
      caretOn = caretVisible
    },
    setPrimary(state) {
      primary.setAttribute('data-state', state)
      primary.style.background = state === 'press' ? '#c9ccd4' : state === 'hover' ? '#f3f5f9' : 'var(--color-fg)'
      primary.style.transform = state === 'press' ? 'translateY(1px)' : 'none'
    },
    paint
  }
}

/* ------------------------------------------------------------------ */
/* C. the recording pill                                               */
/* ------------------------------------------------------------------ */

export function makeRecPill(opts = {}) {
  const dotCore = h('i')
  const dotHalo = h('b')
  const dot = h('span', { class: 'sbk-pill-dot' }, [dotHalo, dotCore])
  const timer = h('span', { class: 'sbk-pill-timer', text: opts.timer ?? '0:41' })
  const mark = makeMark({ size: 34, listening: true })
  mark.el.classList.add('sbk-pill-mark')
  const caption = h('div', { class: 'sbk-pill-caption' })
  const done = h('button', { class: 'sbk-pill-done', type: 'button', 'data-state': 'rest', text: 'Done' })
  const root = h('div', { class: 'sbk-pill' }, [dot, timer, mark.el, caption, done])

  let words = []
  const paint = (t = 0) => {
    mark.paint(t)
    /* the red dot: a 1.4s pulse, the halo breathing out behind it */
    const p = (t % 1400) / 1400
    const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 2)
    dotCore.style.transform = `scale(${(0.86 + pulse * 0.24).toFixed(3)})`
    dotHalo.style.transform = `scale(${(1 + pulse * 1.5).toFixed(3)})`
    dotHalo.style.opacity = (0.45 * (1 - pulse)).toFixed(3)
    /* the caption: older words fade, so the eye lands on the newest */
    for (const w of words) w.el.style.opacity = String(Math.max(0.22, 1 - w.age * 0.78))
  }

  return {
    root,
    dot,
    timer,
    mark,
    caption,
    done,
    setCaption(next) {
      words = (next ?? []).map((w) => {
        const el = h('span', { class: 'sbk-pill-word', text: w.text })
        return { el, text: w.text, age: w.age ?? 0 }
      })
      caption.replaceChildren(...words.map((w) => w.el))
      paint(0)
    },
    setTimer(text) {
      timer.textContent = text
    },
    setDone(state) {
      done.setAttribute('data-state', state)
      done.style.background = state === 'press' ? '#c9ccd4' : state === 'hover' ? '#f3f5f9' : 'var(--color-fg)'
      done.style.transform = state === 'press' ? 'scale(0.97)' : 'none'
    },
    paint
  }
}

/* ------------------------------------------------------------------ */
/* D. the thread                                                       */
/* ------------------------------------------------------------------ */

const THINK_STEPS = [
  'Open ROB-IT in Creator Hub',
  'Open Thumbnails',
  'Generate new thumbnails',
  'Replace the one with the lowest click rate',
  'Wait for statistical significance',
  'Repeat'
]
const VERIFY_STEPS = [
  'Launch a headless browser',
  'Open the ROB-IT thumbnails page',
  'Find the upload slot',
  'Verified in a headless browser'
]

function makeSteps(names) {
  const list = h('div', { class: 'sbk-think-steps' })
  const items = names.map((name, i) => {
    const ic = h('span', { class: 'sbk-step-ic' })
    const el = h('div', { class: 'sbk-step', 'data-state': 'pending', 'data-index': String(i) }, [
      ic,
      h('span', { class: 'sbk-step-text', text: name })
    ])
    list.appendChild(el)
    return { el, ic }
  })
  const set = (i, state) => {
    const item = items[i]
    if (!item) return
    item.el.setAttribute('data-state', state)
    item.ic.replaceChildren(state === 'done' ? icon(ICONS.check, { width: 2.6 }) : state === 'running' ? icon(ICONS.spinner, { width: 2.2 }) : icon(ICONS.circle, { width: 2 }))
  }
  return { el: list, items, set }
}

export function makeThread(opts = {}) {
  /* the recording attachment card */
  const poster = h('div', { class: 'sbk-rec-thumb' })
  const wave = h('div', { class: 'sbk-rec-wave' })
  for (let i = 0; i < 22; i++) {
    const hgt = 3 + Math.round(9 * Math.abs(Math.sin(i * 1.7)))
    wave.appendChild(h('i', { style: { height: hgt + 'px' } }))
  }
  const userTurn = h('div', { class: 'sbk-user-turn' }, [
    h('div', { class: 'sbk-rec-card' }, [
      poster,
      h('div', { class: 'sbk-rec-body' }, [
        h('div', { class: 'sbk-rec-label', text: 'Recording' }),
        h('div', { class: 'sbk-rec-meta', text: opts.duration ?? '0:41' }),
        wave
      ])
    ])
  ])

  /* the thinking panel: the ring glyph, the sheened label, the understood
     steps (ThinkingPanel.tsx + thinking-panel.css) */
  const thinkIc = icon(ICONS.spinner, { width: 2.2 })
  thinkIc.classList.add('sbk-think-ic')
  const thinkLabel = h('span', { class: 'sbk-think-label', text: opts.thinkingLabel ?? 'Analyzing the recording' })
  const steps = makeSteps(THINK_STEPS)
  const thinking = h('div', { class: 'sbk-think' }, [
    h('div', { class: 'sbk-think-head' }, [thinkIc, thinkLabel]),
    steps.el
  ])

  const verifySteps = makeSteps(VERIFY_STEPS)
  const verify = h('div', { class: 'sbk-think' }, [
    h('div', { class: 'sbk-think-head' }, [icon(ICONS.check, { width: 2.2 }), h('span', { class: 'sbk-think-label', text: 'Verifying the run' })]),
    verifySteps.el
  ])

  /* the assistant's name row and body, then the caller's own live-view slot */
  const replyMark = makeMark({ size: 24, ghosts: false })
  replyMark.el.classList.add('sbk-reply-mark')
  const slot = h('div', { class: 'sbk-reply-slot' })
  const reply = h('div', { class: 'sbk-reply' }, [
    replyMark.el,
    h('div', { class: 'sbk-reply-body' }, [
      h('div', { class: 'sbk-reply-name' }, [h('span', { text: 'Superbot' }), h('span', { text: 'just now' })]),
      h('div', { class: 'sbk-reply-text', text: 'Recorded it. ROB-IT now generates three thumbnails every Monday and swaps the weakest performer once the numbers settle.' }),
      slot
    ])
  ])

  const outcome = h('button', { class: 'sbk-outcome', type: 'button' }, [
    icon(ICONS.clock, { width: 2 }),
    h('span', {}, [h('b', { text: opts.outcome ?? 'Worked for 2h 14m' })]),
    icon(ICONS.chevron, { width: 2.2 })
  ])

  const root = h('div', { class: 'sbk-thread' }, [userTurn, thinking, verify, reply, h('div', {}, [outcome])])

  const paint = (t = 0) => {
    replyMark.paint(t)
    /* the thinking label's silver sheen: thinking-panel.css's one bold thing */
    const pos = ((t / 2200) % 1) * 200 - 50
    thinkLabel.style.backgroundPosition = `${pos.toFixed(1)}% 0`
    /* the ring glyph turns once a second while the turn works */
    const spin = ((t / 1000) % 1) * 360
    thinkIc.style.transform = `rotate(${spin.toFixed(1)}deg)`
    thinkIc.style.transformOrigin = '50% 50%'
  }

  return {
    root,
    userTurn,
    poster,
    thinking,
    verify,
    reply,
    slot,
    outcome,
    setStep: steps.set,
    setVerifyStep: verifySteps.set,
    setOutcome(text) {
      outcome.querySelector('b').textContent = text
    },
    paint
  }
}
