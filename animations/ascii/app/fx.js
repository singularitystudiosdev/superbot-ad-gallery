// Copy feedback: every effect enabled in settings.fxOn plays TOGETHER on
// each copy. The pool is the quiet microinteraction pair that survived
// the cull — the button label swaps to COPIED, and the wordmark frame
// blinks like a selection. Each effect is a transform of the built cell
// buffer under a shared attack/hold/release envelope.

function smooth(u) {
  return u * u * (3 - 2 * u)
}

function envOf(age, dur, rise, fall) {
  if (age < 0 || age >= dur) return 0
  if (age < rise) return smooth(age / rise)
  if (age > dur - fall) return smooth((dur - age) / fall)
  return 1
}

export function createFx(settings) {
  let playing = [] // {e, t0} — every enabled effect runs together

  function invertRect(buf, g, r) {
    for (let yy = Math.max(0, r.y); yy < Math.min(g.rows, r.y + r.h); yy++) {
      for (let xx = Math.max(0, r.x); xx < Math.min(g.cols, r.x + r.w); xx++) {
        const i = yy * g.cols + xx
        buf.inv[i] = buf.inv[i] ? 0 : 1
        if (!buf.inv[i]) buf.shade[i] = Math.max(buf.shade[i], 0.9)
      }
    }
  }

  const effects = [
    {
      key: 'copied', // small: the button label reads COPIED for a moment
      label: 'copied label',
      kind: 'small',
      durOf: () => settings.copiedDur || 1300,
      rise: 40,
      fall: 200,
      apply(buf, g, geo, env) {
        if (env < 0.2) return
        const b = geo.btn
        // Text-only feedback: the label swaps, nothing changes color.
        const text = String(settings.copiedText || 'COPIED')
          .toUpperCase()
          .slice(0, Math.max(1, b.w - 2))
        const ly = b.y + (b.h >> 1)
        if (ly < 0 || ly >= g.rows) return
        for (let xx = b.x + 1; xx < b.x + b.w - 1; xx++) {
          if (xx < 0 || xx >= g.cols) continue
          buf.ch[ly * g.cols + xx] = ' '
        }
        const lx = b.x + Math.floor((b.w - text.length) / 2)
        for (let c = 0; c < text.length; c++) {
          const xx = lx + c
          if (xx < 0 || xx >= g.cols) continue
          const i = ly * g.cols + xx
          buf.ch[i] = text[c]
          buf.shade[i] = 1
        }
      },
    },
    {
      key: 'highlight', // text: the wordmark frame blinks like a selection
      label: 'highlight flash',
      kind: 'text',
      dur: 550,
      rise: 30,
      fall: 120,
      apply(buf, g, geo, env, age) {
        if (env < 0.3) return
        if (((age / 140) | 0) % 2 === 1) return
        invertRect(buf, g, geo.box)
      },
    },
  ]

  function pool() {
    const on = String(settings.fxOn || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    return effects.filter(e => on.includes(e.key))
  }

  function trigger(t, key) {
    let list
    if (key) {
      const e = effects.find(x => x.key === key)
      list = e ? [e] : []
    } else {
      list = pool()
    }
    playing = list.map(e => ({ e, t0: t }))
  }

  // dur may be a live function of settings (durOf).
  function envFor(e, age) {
    const dur = e.durOf ? e.durOf() : e.dur
    return envOf(age, dur, e.rise, e.fall)
  }

  function active(t) {
    return playing.some(p => envFor(p.e, t - p.t0) > 0)
  }

  // Mutates the built cell buffer in place; call between build and draw.
  // Stacked: text effects paint first, then small, so the button label
  // lands on top of the frame blink.
  const KIND_ORDER = { text: 1, small: 2 }
  function apply(now, g, buf, geo) {
    if (!playing.length) return
    const live = []
    for (const p of playing) {
      const env = envFor(p.e, now - p.t0)
      if (env > 0) live.push({ e: p.e, env, age: now - p.t0 })
    }
    live.sort((a, b) => KIND_ORDER[a.e.kind] - KIND_ORDER[b.e.kind])
    for (const l of live) l.e.apply(buf, g, geo, l.env, l.age, now)
  }

  return {
    trigger,
    apply,
    active,
    meta: effects.map(e => ({ key: e.key, label: e.label, kind: e.kind })),
  }
}
