// The thread and the composer. The user types into the composer and sends; each message grows in at the bottom of
// the thread, which sits above the docked live view, so the view never moves and older messages slide up and fade
// under the top edge. Agent replies show typing dots, then stream. A pure function of t.
import { ease, seg, outCubic, outBack, press, blink, typed, esc, el, show, mv, RM } from './lib.04568226.js';
import { THREAD, T } from './script.04568226.js';

export const MARK = '<span class="sb"><i class="c"></i><i class="g"></i><i class="w"></i></span>';
const DOTS = '<i class="dots"><i></i><i></i><i></i></i>';
const SEND = '<svg viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>';
const STREAM_CPS = 62;
const DOTS_FOR = 0.4;

function message(m) {
  if (m.kind === 'user') return `<div class="m m-user"><div class="mi"><div class="bu">${esc(m.text)}</div></div></div>`;
  if (m.kind === 'status') return `<div class="m m-status"><div class="mi"><span class="st">${MARK}${esc(m.text)}<span class="st-end"><i class="spin"></i><i class="ok">✓</i></span></span></div></div>`;
  return `<div class="m m-agent"><div class="mi">${MARK}<div class="ba"><span class="vis"></span><span class="hid">${esc(m.text)}</span>${DOTS}</div></div></div>`;
}

export function buildThread(thread, composer) {
  const nodes = THREAD.map((m) => {
    const n = el(message(m));
    thread.appendChild(n);
    return { m, n, mi: n.firstElementChild, h: 0, vis: n.querySelector('.vis'), hid: n.querySelector('.hid'), dots: n.querySelector('.dots'), shown: -1 };
  });
  composer.innerHTML = `<div class="cmp-in"><span class="cmp-ph" data-k="0">How can superbot help you today?</span><span class="cmp-ph" data-k="1">Ask for an update or change the plan 💬</span><span class="cmp-txt"></span><i class="cmp-caret"></i></div>
    <div class="cmp-row"><span class="cmp-plus">+</span><span class="cmp-chip">🖥️ Computer control</span><span class="cmp-sp"></span><span class="cmp-send"><i class="on"></i>${SEND}</span></div>`;
  const c = { ph: [...composer.querySelectorAll('.cmp-ph')], txt: composer.querySelector('.cmp-txt'), caret: composer.querySelector('.cmp-caret'), send: composer.querySelector('.cmp-send'), on: composer.querySelector('.cmp-send .on') };
  const users = THREAD.filter((m) => m.kind === 'user');
  let measured = false, typedNow = '';

  // natural heights, once, with every message laid out whole (agent text is reserved in full by its hidden tail)
  function measure() {
    for (const x of nodes) { x.n.style.height = 'auto'; x.h = x.n.offsetHeight; x.n.style.height = '0px'; }
    measured = true;
  }

  function paintComposer(t) {
    const u = users.find((m) => t >= m.type && t < m.at + 0.05);
    const text = u ? typed(u.text, u.type, Math.max(14, Array.from(u.text).length / (u.at - u.type - 0.25)), t) : '';
    if (text !== typedNow) { c.txt.textContent = text; typedNow = text; }
    const working = ease(t, T.card, 0.3);
    c.ph[0].style.opacity = text ? '0' : (1 - working).toFixed(3);
    c.ph[1].style.opacity = text ? '0' : working.toFixed(3);
    c.caret.style.opacity = u && (text || !blink(t)) ? '1' : '0';
    // the send button lights while there is text, and presses on send
    const sent = users.find((m) => Math.abs(t - m.at) < 0.2);
    c.on.style.opacity = text ? '1' : sent ? (1 - seg(t, sent.at, sent.at + 0.2)).toFixed(3) : '0';
    c.send.style.color = text || sent ? '#1a0d00' : '';
    c.send.style.transform = sent && !RM ? `scale(${(1 - 0.12 * press(t, sent.at, 0.2)).toFixed(3)})` : '';
  }

  function paintMessage(t, x) {
    const { m } = x;
    const g = outCubic(seg(t, m.at, m.at + 0.45));
    x.n.style.height = `${(x.h * g).toFixed(2)}px`;
    const pop = outBack(seg(t, m.at + 0.05, m.at + 0.5));
    show(x.mi, Math.min(1, pop), m.kind === 'user' ? 14 : 10, 0.96);
    if (m.kind === 'status') {
      const ok = ease(t, m.doneAt, 0.25);
      const spin = x.n.querySelector('.spin');
      spin.style.opacity = (1 - ok).toFixed(3);
      spin.style.transform = RM ? '' : `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
      x.n.querySelector('.ok').style.opacity = ok.toFixed(3);
      return;
    }
    if (m.kind !== 'agent') return;
    const from = m.at + DOTS_FOR;
    const cs = Array.from(m.text);
    const n = Math.max(0, Math.min(cs.length, Math.floor((t - from) * STREAM_CPS)));
    if (n !== x.shown) { x.vis.textContent = cs.slice(0, n).join(''); x.hid.textContent = cs.slice(n).join(''); x.shown = n; }
    const dots = t >= m.at && t < from ? 1 : 0;
    x.dots.style.opacity = String(dots);
    if (dots) [...x.dots.children].forEach((d, k) => { d.style.opacity = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 9 - k * 0.9))).toFixed(3); d.style.transform = `translateY(${mv(-2 * Math.max(0, Math.sin(t * 9 - k * 0.9))).toFixed(2)}px)`; });
  }

  return function paint(t) {
    if (!measured) measure();
    for (const x of nodes) paintMessage(t, x);
    paintComposer(t);
  };
}
