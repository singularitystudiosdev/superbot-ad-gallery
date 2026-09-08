// "PASTE INTO ANY LLM, UNLOCK ___" — the blank decodes through glyph noise
// into each capability, then holds until the next cycle.
import { cellRand } from './noise.js'

const PREFIX = 'PASTE INTO ANY LLM, UNLOCK '
const PHRASES = [
  'SAVED MEMORY BETWEEN AGENTS',
  'SHARED SKILLS ACROSS PLATFORMS',
  'PROMPT TRANSLATION',
  'LEADING AGENT ARCHETYPES',
  'CONTEXT OPTIMIZATION',
  'SCRAPING',
  'AND BEYOND',
]
const CYCLE = 2600
const DECODE = 520
const GLYPHS = '@#%*+=<>/\\:'

export function taglineAt(time) {
  const k = Math.floor(time / CYCLE) % PHRASES.length
  const target = PHRASES[k]
  const age = time % CYCLE
  if (age >= DECODE) return { prefix: PREFIX, phrase: target }
  const reveal = Math.floor((age / DECODE) * target.length)
  const tick = Math.floor(age / 45)
  let s = ''
  for (let i = 0; i < target.length; i++) {
    if (i < reveal || target[i] === ' ') s += target[i]
    else s += GLYPHS[Math.floor(cellRand(i, tick, k) * GLYPHS.length)]
  }
  return { prefix: PREFIX, phrase: s }
}
