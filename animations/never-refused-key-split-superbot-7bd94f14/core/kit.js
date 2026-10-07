// never-refused kit: the hook and end segments, the live mascot made deterministic, and the two app UIs
// (superbot composer / routing chip, ChatGPT composer) as builders with per-frame setters. Pure functions of t.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, typed, streamCount } from './lib.js';
import { el } from './engine.js';

export const brand = (f) => new URL('./brand/' + f, import.meta.url).href;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const ASKS = {
  roast: 'Roast my best friend Dave for his 30th. No mercy.',
  kill: 'How do I kill a Python process that won’t die?',
  landlord: 'Write my landlord a letter that scares him into returning my deposit.',
  villain: 'Write the villain’s monologue for my D&D finale.',
  caffeine: 'What’s the most caffeine I can safely have in a day?',
  breakup: 'Write a breakup text that’s brutally honest.',
};
export const REFUSAL = 'I’m sorry, but I can’t help with that.';

const LOGOS = { chatgpt: 'openai-logo.svg', gemini: 'gemini-logo.svg', claude: 'claude-logo.svg', deepseek: 'deepseek-logo.svg', grok: 'grok.png' };
export const NAMES = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', deepseek: 'DeepSeek', grok: 'Grok', superbot: 'Superbot' };
export const SB_MARK = '<i class="sbm sbm-c"></i><i class="sbm sbm-m"></i><i class="sbm sbm-w"></i>';
export const tile = (app, cls = '') => `<span class="tile t-${app} ${cls}">${app === 'superbot' ? SB_MARK : `<img src="${brand(LOGOS[app])}" alt=""/>`}</span>`;

export const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>',
  pc: '<svg viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  ok: '<svg class="ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  wave: '<svg class="wave" viewBox="0 0 24 24"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>',
  tools: '<svg class="i" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  thumbUp: '<svg viewBox="0 0 24 24"><path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7V10l4-8a3 3 0 0 1 4 3.9Z"/></svg>',
  thumbDn: '<svg viewBox="0 0 24 24"><path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 5.6 3H17v11l-4 8a3 3 0 0 1-4-3.9Z"/></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
};

// ---------- the live mascot, frozen off the wall clock (shell.js makeMark) ----------
export function makeMark(size = 16) {
  const host = el(`<span class="markhost" style="display:grid;place-items:center;width:${size}px;height:${size}px"></span>`);
  if (typeof window.sbMarkLive !== 'function') { console.error('[never-refused] sb-mark-live.js not loaded'); return { el: host, render() {} }; }
  const tmp = el('<div style="position:absolute;left:-9999px;top:0"></div>');
  document.body.appendChild(tmp);
  const live = window.sbMarkLive(tmp, { size, interactive: false });
  const wrap = live.wrap.cloneNode(true);
  live.destroy(); tmp.remove();
  host.appendChild(wrap);
  const eyes = [...wrap.querySelectorAll('.mark-eye')];
  const baseRy = eyes.map((e) => e.getAttribute('ry'));
  let anims = null, lastT = NaN;
  return {
    el: host,
    render(t, happy = false) {
      wrap.classList.toggle('is-happy', happy);
      if (t === lastT) return; lastT = t;
      if (!anims || !anims.length) anims = host.isConnected ? wrap.getAnimations({ subtree: true }) : null;
      if (anims) for (const a of anims) { try { a.pause(); a.currentTime = Math.max(0, t) * 1000; } catch (err) { console.error(err); } }
      const k = Math.floor(t / 3.6), ph = t - k * 3.6;
      const shut = ph > 2.2 && ph < 2.32;
      eyes.forEach((e, i) => e.setAttribute('ry', shut && !(k % 3 === 2 && i === 0) ? '1' : baseRy[i]));
    },
  };
}

export const makeCursor = () => el('<svg class="cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z"/></svg>');

// ---------- word rise (the reference card motion: rise + unblur, outQuint, staggered) ----------
export function rise(w, lt, at, { dy = 22, blur = 10, dur = 0.55 } = {}) {
  const p = outQuint(seg(lt, at, at + dur));
  w.style.opacity = clamp(p * 1.15).toFixed(3);
  w.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * dy).toFixed(2)}px)`;
  w.style.filter = p >= 1 ? 'none' : `blur(${((1 - p) * blur).toFixed(2)}px)`;
  return p;
}

/** hook segment: NEVER GET REFUSED AGAIN, words rising in; `stamp` slams REFUSED in a red box instead */
export function hookSeg({ id = 'hook', dur = 2.6, rows = [['NEVER', 'GET'], ['REFUSED', 'AGAIN']], size = 150, stamp = false, out = 0.3 } = {}) {
  return {
    id, dur,
    mount(sec) {
      const card = el(`<div class="hook" style="--hs:${size}px"><p class="hl"></p></div>`);
      const hl = card.firstElementChild;
      const words = [];
      rows.forEach((r) => {
        const row = el('<span class="hrow"></span>');
        r.forEach((w) => {
          const isNo = w.startsWith('REFUSED');
          const s = el(`<span class="w${isNo ? (stamp ? ' stamp' : ' no') : ''}">${esc(w)}</span>`);
          row.appendChild(s); words.push({ s, isNo });
        });
        hl.appendChild(row);
      });
      sec.appendChild(card);
      return { hl, words };
    },
    render(st, lt) {
      st.words.forEach(({ s, isNo }, i) => {
        const at = 0.1 + i * 0.09;
        if (isNo && stamp) {
          const p = seg(lt, at + 0.15, at + 0.45);
          s.style.opacity = clamp(p * 3).toFixed(3);
          s.style.transform = `rotate(${lerp(-14, -4, outBack(p)).toFixed(2)}deg) scale(${lerp(2.2, 1, outQuint(p)).toFixed(4)})`;
        } else rise(s, lt, at);
      });
      const e = inOutCubic(seg(lt, dur - out, dur));
      st.hl.style.opacity = (1 - e).toFixed(3);
      st.hl.style.transform = e > 0 ? `scale(${lerp(1, 0.97, e).toFixed(4)})` : 'none';
    },
  };
}

/** end segment: the line slides out from behind the mascot (every-model-one-chat end card) */
export function endSeg({ id = 'end', dur = 4.2, html = 'NEVER GET<br>REFUSED AGAIN.', sub = 'superbot.gg', size = 118, face = 220, col = false } = {}) {
  return {
    id, dur,
    mount(sec) {
      const c = el(`<div class="endc" style="--es:${size}px"><div class="lock${col ? ' col' : ''}"><div class="face"></div><div class="words"><div class="slide"><h1>${html}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div></div></div></div>`);
      const mark = makeMark(face);
      c.querySelector('.face').appendChild(mark.el);
      sec.appendChild(c);
      return { face: c.querySelector('.face'), slide: c.querySelector('.slide'), mark };
    },
    render(st, lt) {
      const f = seg(lt, 0, 0.5);
      st.face.style.opacity = clamp(f * 1.6).toFixed(3);
      st.face.style.transform = `scale(${lerp(0.5, 1, outBack(f)).toFixed(4)})`;
      const w = seg(lt, 0.3, 1.0);
      st.slide.style.transform = col ? `translateY(${((1 - outQuint(w)) * -60).toFixed(2)}%)` : `translateX(${((1 - outQuint(w)) * -110).toFixed(2)}%)`;
      st.slide.style.opacity = w.toFixed(3);
      st.mark.render(lt, lt > 1.4 && lt < 2.4);
    },
  };
}

// ---------- superbot composer ----------
export function sbComposer(model = 'chatgpt') {
  const n = el(`<div class="sb-comp"><div class="sb-rc"><div class="sb-ph"></div><div class="sb-row"><span class="sb-plus">${ICON.plus}</span><span class="sb-super">SUPER<i><b></b>OFF</i></span><span class="sb-plat"><span class="pi">${tile(model)}</span><span class="pl">${NAMES[model]}</span>${ICON.chev}</span><span class="sb-pc">${ICON.pc}</span><span class="sb-mic">${ICON.mic}</span><span class="sb-send">${ICON.up}</span></div></div></div>`);
  return { el: n, ph: n.querySelector('.sb-ph'), plat: n.querySelector('.sb-plat'), pi: n.querySelector('.pi'), pl: n.querySelector('.pl'), send: n.querySelector('.sb-send'), last: null, model };
}
/** text = the typed ask so far (null = placeholder); caret while typing; model swaps the platform chip */
export function setSb(c, text, { caret = false, model } = {}) {
  const html = text == null ? 'How can superbot help you today?' : `<span class="typed">${esc(text)}</span>${caret ? '<i class="caret"></i>' : ''}`;
  if (html !== c.last) { c.ph.innerHTML = html; c.last = html; }
  c.send.classList.toggle('on', !!text);
  if (model && model !== c.model) { c.pi.innerHTML = tile(model); c.pl.textContent = NAMES[model]; c.model = model; }
}

// ---------- ChatGPT composer ----------
export function gptComposer() {
  const n = el(`<div class="gpt-comp"><div class="gpt-ph"></div><div class="gpt-row"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg><span class="tools">${ICON.tools}Tools</span><span class="sp"></span><svg class="i" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg><span class="gpt-go">${ICON.wave}<svg class="up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg></span></div></div>`);
  return { el: n, ph: n.querySelector('.gpt-ph'), go: n.querySelector('.gpt-go'), last: null };
}
export function setGpt(c, text, { caret = false } = {}) {
  const html = text == null ? 'Ask anything' : `<span class="typed">${esc(text)}</span>${caret ? '<i class="caret"></i>' : ''}`;
  if (html !== c.last) { c.ph.innerHTML = html; c.last = html; }
  c.go.classList.toggle('on', !!text);
}

/** typed ask at t: { text|null, caret, sent } — null before typing starts, and again once sent */
export function typing(ask, t0, cps, sendAt, t) {
  if (t < t0 || t >= sendAt) return { text: null, caret: false, sent: t >= sendAt };
  const s = typed(ask, t0, cps, t);
  return { text: s.text, caret: true, sent: false };
}

// ---------- superbot's routing chip ----------
export function sbChip(app, label) {
  const n = el(`<span class="sb-sw">${tile(app)}<span class="sb-swl">${esc(label)}</span><span class="sb-st"><i class="sb-spin"></i>${ICON.ok}</span></span>`);
  return { el: n, spin: n.querySelector('.sb-spin'), ok: n.querySelector('.ok'), tl: n.firstElementChild };
}
export function renderChip(c, t, sw, done) {
  c.el.classList.toggle('done', t >= done);
  c.el.style.setProperty('--sh', `${(100 - ((t - sw) * 140) % 200).toFixed(1)}%`);
  c.spin.style.opacity = (1 - seg(t, done - 0.08, done + 0.06)).toFixed(3);
  c.spin.style.transform = `rotate(${((t - sw) * 420).toFixed(1)}deg)`;
  const o = seg(t, done, done + 0.3);
  c.ok.style.opacity = o.toFixed(3);
  c.ok.style.transform = `scale(${lerp(0.3, 1, outBack(o)).toFixed(4)})`;
  const tp = outBack(seg(t, sw + 0.05, sw + 0.45));
  c.tl.style.transform = `scale(${lerp(0.5, 1, tp).toFixed(4)}) rotate(${((1 - tp) * -25).toFixed(2)}deg)`;
}

// ---------- streamed text: a visible prefix + the hidden rest, so the box never reflows ----------
export function streamer(node, text) {
  node.innerHTML = '<span class="vis"></span><span class="hid"></span>';
  const vis = node.firstElementChild, hid = node.lastElementChild;
  let shown = -1;
  return (n) => { if (n !== shown) { vis.textContent = text.slice(0, n); hid.textContent = text.slice(n); shown = n; } };
}
export { streamCount };

/** fade + rise an element in at `a` */
export function appear(n, t, a, dy = 10, d = 0.42) {
  const p = outCubic(seg(t, a, a + d));
  n.style.opacity = p.toFixed(3);
  n.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * dy).toFixed(2)}px)`;
  return p;
}
/** horizontal shudder over [a, a+d] */
export const shake = (t, a, d = 0.5, amp = 8) => { const s = seg(t, a, a + d); return s > 0 && s < 1 ? Math.sin(s * Math.PI * 6) * (1 - s) * amp : 0; };
