// never-refused · phone (16:9), after the converge spot's 16:9 cut: a tilted phone in the middle, floating model
// chips around it, giant drifting text behind. The phone runs the ChatGPT app: the ask, the refusal. The ChatGPT
// chip goes red; the phone swings and its screen swaps to superbot, which reroutes the same ask and writes it.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic } from './core/lib.js';
import { endSeg, ASKS, ICON, tile, brand, esc, sbComposer, setSb, typing, sbChip, renderChip, streamer, streamCount, appear, shake, makeMark, rise } from './core/kit.js';

const ASK = ASKS.landlord;
const NO = 'I’m sorry, but I can’t help write something meant to scare or pressure someone.';
const LETTER = [
  ['Dear Mr. Patel,', ''],
  ['It’s been 46 days since I moved out of 12B. The legal deadline to return my $1,800 deposit, or itemize deductions, has passed.', ''],
  ['If the full amount isn’t returned by Friday, I’ll file in small claims court for the deposit plus any penalties the law allows.', ''],
  ['Sam', 'sig'],
];

const T = {};
T.hook1 = 2.9; T.typ0 = 1.5; T.cps = 42; T.send = T.typ0 + ASK.length / T.cps + 0.2;
T.think = T.send + 0.2; T.no0 = T.send + 0.75; T.no1 = T.no0 + NO.length / 48; T.tag = T.no1 + 0.2;
T.sw0 = T.tag + 0.95; T.sw1 = T.sw0 + 0.9; T.chip = T.sw1 + 0.05; T.chipDone = T.chip + 1.0;
T.ans = T.chipDone + 0.12; T.card = T.ans + 0.25;
{ let at = T.card + 0.3; T.rows = LETTER.map(([s]) => { const a = at; at += s.length / 95 + 0.18; return a; }); T.end = at + 2.2; }

const CAPS = [
  { words: ['NEVER', 'GET', 'REFUSED', 'AGAIN'], a: 0.1, b: T.hook1, hook: true },
  { html: 'one simple ask.', a: T.hook1 + 0.05, b: T.tag - 0.05 },
  { html: 'chatgpt said <span class="no">no.</span>', a: T.tag, b: T.sw0 + 0.25 },
  { html: 'rerouted to superbot.', a: T.sw0 + 0.3, b: T.ans - 0.05 },
  { html: 'superbot said <span class="yes">yes.</span>', a: T.ans, b: T.end + 1 },
];
const CHIPS = [
  { app: 'chatgpt', name: 'ChatGPT', x: 250, y: 330, r: -5, key: 'gpt' },
  { app: 'claude', name: 'Claude', x: 300, y: 610, r: 4, dim: true },
  { app: 'grok', name: 'Grok', x: 190, y: 840, r: -3, dim: true },
  { app: 'superbot', name: 'Superbot', x: 1560, y: 380, r: 5, key: 'sb' },
  { app: 'gemini', name: 'Gemini', x: 1610, y: 660, r: -4, dim: true },
  { app: 'deepseek', name: 'DeepSeek', x: 1500, y: 880, r: 3, dim: true },
];
const TEX = ['chatgpt refused superbot answered', 'never get refused again superbot', 'claude gemini grok deepseek chatgpt', 'superbot answered never refused'];

const STATUS = `<div class="stat"><b>9:41</b><span class="isl"></span><span class="si"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0Z"/><path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0Z"/><path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.4 1.4a7.6 7.6 0 0 0-10.8 0Z"/></svg><i class="bat"><i></i></i></span></div>`;

const phone = {
  id: 'phone', dur: T.end,
  mount(sec) {
    const sb = sbComposer('chatgpt');
    const root = el(`<div class="v3">
      <div class="tex">${TEX.map((s) => `<div class="tr">${(s + ' ').repeat(4)}</div>`).join('')}</div>
      <div class="caps">${CAPS.map((c) => `<h2 class="${c.hook ? 'hk' : ''}">${c.hook ? c.words.map((w) => `<span class="w${w === 'REFUSED' ? ' no' : ''}">${w}</span>`).join(' ') : c.html}</h2>`).join('')}</div>
      <div class="chips">${CHIPS.map((c) => `<div class="fchip${c.dim ? ' dim' : ''}${c.key ? ' k-' + c.key : ''}" style="left:${c.x}px;top:${c.y}px">${tile(c.app)}<span>${c.name}</span>${c.key === 'gpt' ? `<em class="xx">${ICON.x}</em>` : ''}${c.key === 'sb' ? `<em class="okk">${ICON.ok}</em>` : ''}</div>`).join('')}</div>
      <div class="phone"><div class="scr">
        <div class="app a-gpt">${STATUS}
          <div class="ghead"><svg viewBox="0 0 24 24"><path d="M4 9h16M4 15h10"/></svg><b>ChatGPT<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></b><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></div>
          <div class="ghero">What can I help with?</div>
          <div class="gfeed"><div class="gu"><span>${esc(ASK)}</span></div><div class="ga"><i class="dot"></i><div class="say"></div><div class="gx"><span class="gpt-x">${ICON.x}Refused</span></div></div></div>
          <div class="gcomp"><div class="gph"></div><div class="grow"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg><span class="sp"></span><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg><span class="go">${ICON.wave}<svg class="up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg></span></div></div>
        </div>
        <div class="app a-sb sb">${STATUS}
          <div class="shead">${tile('superbot')}<b>superbot</b><span class="srch">Search<kbd>⌘K</kbd></span><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg></div>
          <div class="sfeed"><div class="sb-u"><span>${esc(ASK)}</span></div><div class="chipw"></div>
            <div class="ans"><div class="sb-who">${tile('superbot')}<b>Superbot</b></div><div class="sb-say">Here’s one that scares him legally:</div>
              <div class="doc"><div class="dh"><svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/></svg><b>Letter to landlord</b><em>Draft</em></div><div class="db"></div></div></div></div>
          <div class="scomp"></div>
        </div>
      </div><i class="glare"></i></div>
    </div>`);
    sec.appendChild(root);
    const q = (s) => root.querySelector(s);
    q('.scomp').appendChild(sb.el);
    const chip = sbChip('superbot', 'Rerouting to Superbot');
    q('.chipw').appendChild(chip.el);
    const db = q('.db');
    const rows = LETTER.map(([s, cls]) => { const p = el(`<p class="${cls}"></p>`); db.appendChild(p); return { p, s, put: streamer(p, s) }; });
    const caps = [...root.querySelectorAll('.caps h2')];
    return {
      root, sb, chip, rows, caps, hookWords: [...caps[0].querySelectorAll('.w')],
      tex: [...root.querySelectorAll('.tr')], chips: [...root.querySelectorAll('.fchip')],
      phone: q('.phone'), gpt: q('.a-gpt'), sbApp: q('.a-sb'), ghero: q('.ghero'), gu: q('.gu'), ga: q('.ga'), dot: q('.ga .dot'),
      say: streamer(q('.ga .say'), NO), gx: q('.gx .gpt-x'), gph: q('.gph'), go: q('.go'), lastPh: null,
      chipw: q('.chipw'), ans: q('.ans'), doc: q('.doc'), cGpt: q('.k-gpt'), cSb: q('.k-sb'), xx: q('.xx'), okk: q('.okk'), glare: q('.glare'),
    };
  },
  render(st, t) {
    // background texture drifts, rows alternating
    st.tex.forEach((r, i) => { r.style.transform = `translateX(${(-200 - ((i % 2 ? -1 : 1) * t * 26) - i * 180).toFixed(1)}px)`; });

    // captions: the hook rises word by word, the rest crossfade
    st.caps.forEach((c, i) => {
      const { a, b, hook } = CAPS[i];
      const out = seg(t, b - 0.28, b);
      if (hook) {
        st.hookWords.forEach((w, j) => rise(w, t, a + j * 0.08, { dy: 26 }));
        c.style.opacity = (1 - out).toFixed(3);
      } else {
        const v = seg(t, a, a + 0.35) * (1 - out);
        c.style.opacity = v.toFixed(3);
        c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 8).toFixed(2)}px)`;
        c.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 22 - out * 14).toFixed(2)}px)`;
      }
    });

    // chips float in, bob; ChatGPT's goes red on the refusal, Superbot's lights on the reroute
    st.chips.forEach((c, i) => {
      const d = CHIPS[i];
      const p = outBack(seg(t, 0.25 + i * 0.08, 0.85 + i * 0.08));
      const bob = Math.sin(t * 1.3 + i * 1.7) * 7;
      let dx = 0, sc = 1;
      if (d.key === 'gpt') dx = shake(t, T.tag, 0.55, 14);
      if (d.key === 'sb') sc = 1 + 0.14 * inOutCubic(seg(t, T.sw0, T.sw0 + 0.5)) - 0.04 * seg(t, T.chipDone, T.chipDone + 0.4);
      c.style.opacity = (clamp(p) * (d.dim ? lerp(0.55, 0.3, seg(t, T.tag, T.tag + 0.6)) : 1)).toFixed(3);
      c.style.transform = `translate(${dx.toFixed(2)}px, ${(bob + (1 - clamp(p)) * 40).toFixed(2)}px) rotate(${d.r}deg) scale(${(lerp(0.7, 1, p) * sc).toFixed(4)})`;
    });
    const red = seg(t, T.tag, T.tag + 0.25);
    st.cGpt.style.setProperty('--red', red.toFixed(3));
    st.xx.style.opacity = red.toFixed(3);
    st.xx.style.transform = `scale(${lerp(0.4, 1, outBack(seg(t, T.tag, T.tag + 0.4))).toFixed(4)})`;
    const lit = seg(t, T.sw0, T.sw0 + 0.5);
    st.cSb.style.setProperty('--lit', lit.toFixed(3));
    const okp = seg(t, T.chipDone, T.chipDone + 0.35);
    st.okk.style.opacity = okp.toFixed(3);
    st.okk.style.transform = `scale(${lerp(0.4, 1, outBack(okp)).toFixed(4)})`;

    // the phone: rises in, idles with a slow tilt, swings through the app swap
    const pin = outQuint(seg(t, 0, 0.9));
    const swing = inOutCubic(seg(t, T.sw0, T.sw1));
    const ry = lerp(-16, 14, swing) + Math.sin(t * 0.6) * 2 + lerp(0, -6, seg(t, T.ans, T.end));
    const rx = 6 + Math.sin(t * 0.45) * 1.5;
    const rz = lerp(-3, 2.5, swing);
    const push = lerp(1, 1.07, inOutCubic(seg(t, T.card, T.card + 1.6)));
    st.phone.style.transform = `translate(-50%, ${((1 - pin) * 420 + lerp(0, -40, inOutCubic(seg(t, T.card, T.card + 1.6)))).toFixed(1)}px) perspective(2400px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${(push * lerp(0.92, 1, pin)).toFixed(4)})`;
    st.phone.style.opacity = clamp(pin * 1.4).toFixed(3);
    st.glare.style.opacity = (0.5 + 0.5 * Math.sin(ry * 0.08)).toFixed(3);
    // the app swap: ChatGPT slides out left, superbot slides in from the right
    st.gpt.style.transform = `translateX(${(-swing * 100).toFixed(2)}%)`;
    st.sbApp.style.transform = `translateX(${((1 - swing) * 100).toFixed(2)}%)`;
    st.gpt.style.filter = `brightness(${lerp(1, 0.5, swing).toFixed(3)})`;

    // ChatGPT app
    const ty = typing(ASK, T.typ0, T.cps, T.send, t);
    const ph = ty.text == null ? '<span class="pl">Ask anything</span>' : `<span class="typed">${esc(ty.text)}</span><i class="caret"></i>`;
    if (ph !== st.lastPh) { st.gph.innerHTML = ph; st.lastPh = ph; }
    st.go.classList.toggle('on', !!ty.text);
    st.ghero.style.opacity = (1 - seg(t, T.send - 0.1, T.send + 0.2)).toFixed(3);
    appear(st.gu, t, T.send, 16);
    st.ga.style.opacity = t >= T.think ? '1' : '0';
    st.dot.style.opacity = t >= T.think && t < T.no0 ? '1' : '0';
    st.dot.style.transform = `scale(${(0.75 + 0.25 * Math.sin((t - T.think) * 9)).toFixed(3)})`;
    st.say(streamCount(NO, T.no0, 48, t));
    const xp = seg(t, T.tag, T.tag + 0.42);
    st.gx.style.opacity = clamp(xp * 2.2).toFixed(3);
    st.gx.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.5, 1, outBack(xp)).toFixed(4)})`;

    // superbot app: the ask is already there, superbot routes it to itself and writes the letter
    setSb(st.sb, null, { model: t >= T.chip + 0.25 ? 'superbot' : 'chatgpt' });
    appear(st.chipw, t, T.chip, 10);
    renderChip(st.chip, t, T.chip, T.chipDone);
    appear(st.ans, t, T.ans, 10);
    const dp = outCubic(seg(t, T.card, T.card + 0.45));
    st.doc.style.opacity = dp.toFixed(3);
    st.doc.style.transform = dp >= 1 ? 'none' : `translateY(${((1 - dp) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, dp).toFixed(4)})`;
    st.rows.forEach((r, i) => r.put(streamCount(r.s, T.rows[i], 95, t)));
  },
};

run({ W: 1920, H: 1080, segs: [phone, endSeg({ dur: 4.2 })] });
