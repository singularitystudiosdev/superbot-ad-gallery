// never-refused · drop-in key · phone (16:9), on the converge 16:9 stage: a tilted phone running "your app" (an app
// built on the OpenAI API), its .env floating beside it, endpoint chips around. The app's answer is a refusal
// (via api.openai.com); the sk-superbot key drops into the .env and both lines are retyped; Retry in the same app
// regenerates the reply in place (2 / 2), now via beta.superbot.gg.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, press } from './core/lib.js';
import { ASKS, ICON, tile, esc, streamer, streamCount, appear, shake, rise, makeCursor } from './core/kit.js';
import { OLD, NEW, win, keyChip, envSwap, apiEndSeg } from './core/api.js';

const ASK = ASKS.landlord;
const NO = 'I’m sorry, but I can’t help with that.';
const LETTER = [
  ['Dear Mr. Patel,', ''],
  ['It’s been 46 days since I moved out of 12B. The legal deadline to return my $1,800 deposit, or itemize deductions, has passed.', ''],
  ['If the full amount isn’t returned by Friday, I’ll file in small claims court for the deposit plus any penalties the law allows.', ''],
  ['Sam', 'sig'],
];

const T = {};
T.hook1 = 2.7; T.typ0 = 1.3; T.cps = 44; T.send = T.typ0 + ASK.length / T.cps + 0.2;
T.think = T.send + 0.2; T.no0 = T.send + 0.7; T.no1 = T.no0 + NO.length / 44; T.tag = T.no1 + 0.2;
T.envIn = T.tag + 0.7; T.keyIn = T.envIn + 0.35; T.env = T.keyIn + 0.55;
const envT = envSwap(document.createElement('div'), { at: T.env });
T.envDone = envT.doneAt; T.retry = T.envDone + 0.55; T.regen = T.retry + 0.35;
{ let at = T.regen + 0.55; T.rows = LETTER.map(([s]) => { const a = at; at += s.length / 100 + 0.16; return a; }); T.via2 = at; T.end = at + 2.1; }

const CAPS = [
  { words: ['NEVER', 'GET', 'REFUSED', 'AGAIN'], a: 0.1, b: T.hook1 },
  { html: 'your app said <span class="no">no.</span>', a: T.tag, b: T.envIn + 0.2 },
  { html: 'swap one key.', a: T.envIn + 0.25, b: T.regen - 0.05 },
  { html: 'same app. <span class="yes">no refusals.</span>', a: T.regen, b: T.end + 1 },
];
const CHIPS = [
  { key: 'old', x: 170, y: 250, r: -4, html: `${tile('chatgpt')}<span>api.openai.com</span><em class="xx">${ICON.x}</em>` },
  { key: 'new', x: 1530, y: 300, r: 4, html: `${tile('superbot')}<span>beta.superbot.gg</span><em class="okk">${ICON.ok}</em>` },
  { x: 1590, y: 520, r: -3, dim: true, html: `${tile('claude')}<span>Claude</span>` },
  { x: 1560, y: 700, r: 3, dim: true, html: `${tile('gemini')}<span>Gemini</span>` },
  { x: 1610, y: 870, r: -2, dim: true, html: `${tile('deepseek')}<span>DeepSeek</span>` },
];
const TEX = ['same code swap one key no refusals', 'never get refused again superbot', 'openai base url beta superbot gg v1'];
const STATUS = `<div class="stat"><b>9:41</b><span class="isl"></span><span class="si"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><i class="bat"><i></i></i></span></div>`;

const scene = {
  id: 'phone', dur: T.end,
  mount(sec) {
    const root = el(`<div class="k3">
      <div class="tex">${TEX.map((s) => `<div class="tr">${(s + ' ').repeat(4)}</div>`).join('')}</div>
      <div class="caps">${CAPS.map((c) => `<h2 class="${c.words ? 'hk' : ''}">${c.words ? c.words.map((w) => `<span class="w${w === 'REFUSED' ? ' no' : ''}">${w}</span>`).join(' ') : c.html}</h2>`).join('')}</div>
      <div class="chips">${CHIPS.map((c) => `<div class="fchip${c.dim ? ' dim' : ''}${c.key ? ' k-' + c.key : ''}" style="left:${c.x}px;top:${c.y}px">${c.html}</div>`).join('')}</div>
      <div class="ew">${win('.env · your app', '<div class="envslot"></div>')}</div>
      <div class="kc">${keyChip()}</div>
      <div class="phone"><div class="scr">${STATUS}
        <div class="ahead"><span class="aic">Aa</span><b>your app</b><span class="pro">Pro</span></div>
        <div class="afeed">
          <div class="au"><span>${esc(ASK)}</span></div>
          <div class="aa">
            <i class="dot"></i>
            <div class="ver v1"><div class="say"></div><div class="foot"><span class="gpt-x">${ICON.x}Refused</span><span class="via no">via api.openai.com</span><span class="retry"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Retry</span></div></div>
            <div class="ver v2"><div class="doc"><div class="dh"><svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/></svg><b>Letter to landlord</b><em>Draft</em></div><div class="db"></div></div><div class="foot"><span class="okp">${ICON.ok}Answered</span><span class="via yes">via beta.superbot.gg</span><span class="pg">2 / 2</span></div></div>
          </div>
        </div>
        <div class="acomp"><span class="aph"></span><span class="go">${ICON.up}</span></div>
      </div><i class="glare"></i><i class="touch"></i></div>
    </div>`);
    sec.appendChild(root);
    const q = (s) => root.querySelector(s);
    const db = q('.db');
    const rows = LETTER.map(([s, cls]) => { const p = el(`<p class="${cls}"></p>`); db.appendChild(p); return { s, put: streamer(p, s) }; });
    const caps = [...root.querySelectorAll('.caps h2')];
    return {
      root, rows, caps, hookWords: [...caps[0].querySelectorAll('.w')], env: envSwap(q('.envslot'), { at: T.env }),
      tex: [...root.querySelectorAll('.tr')], chips: [...root.querySelectorAll('.fchip')], ew: q('.ew'), kc: q('.kc'),
      phone: q('.phone'), glare: q('.glare'), touch: q('.touch'), au: q('.au'), aa: q('.aa'), dot: q('.aa .dot'),
      v1: q('.v1'), v2: q('.v2'), say: streamer(q('.v1 .say'), NO), gx: q('.v1 .gpt-x'), retry: q('.retry'), via1: q('.via.no'),
      doc: q('.doc'), foot2: q('.v2 .foot'), aph: q('.aph'), go: q('.go'), lastPh: null,
      cOld: q('.k-old'), cNew: q('.k-new'), xx: q('.xx'), okk: q('.okk'),
    };
  },
  render(st, t) {
    st.tex.forEach((r, i) => { r.style.transform = `translateX(${(-200 - ((i % 2 ? -1 : 1) * t * 24) - i * 260).toFixed(1)}px)`; });
    st.caps.forEach((c, i) => {
      const { a, b, words } = CAPS[i];
      const out = seg(t, b - 0.28, b);
      if (words) { st.hookWords.forEach((w, j) => rise(w, t, a + j * 0.08, { dy: 26 })); c.style.opacity = (1 - out).toFixed(3); return; }
      const v = seg(t, a, a + 0.35) * (1 - out);
      c.style.opacity = v.toFixed(3);
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 8).toFixed(2)}px)`;
      c.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 22 - out * 14).toFixed(2)}px)`;
    });

    // endpoint chips: openai goes red on the refusal, superbot lights when the base URL lands
    st.chips.forEach((c, i) => {
      const d = CHIPS[i];
      const p = outBack(seg(t, 0.3 + i * 0.08, 0.9 + i * 0.08));
      const bob = Math.sin(t * 1.3 + i * 1.7) * 6;
      const dx = d.key === 'old' ? shake(t, T.tag, 0.55, 14) : 0;
      const sc = d.key === 'new' ? 1 + 0.12 * inOutCubic(seg(t, T.envDone - 0.3, T.envDone + 0.2)) - 0.04 * seg(t, T.regen, T.regen + 0.4) : 1;
      c.style.opacity = (clamp(p) * (d.dim ? 0.4 : 1)).toFixed(3);
      c.style.transform = `translate(${dx.toFixed(2)}px, ${(bob + (1 - clamp(p)) * 40).toFixed(2)}px) rotate(${d.r}deg) scale(${(lerp(0.7, 1, p) * sc).toFixed(4)})`;
    });
    const red = seg(t, T.tag, T.tag + 0.25);
    st.cOld.style.setProperty('--red', red.toFixed(3));
    st.xx.style.opacity = red.toFixed(3);
    st.xx.style.transform = `scale(${lerp(0.4, 1, outBack(seg(t, T.tag, T.tag + 0.4))).toFixed(4)})`;
    st.cNew.style.setProperty('--lit', seg(t, T.envDone - 0.3, T.envDone + 0.1).toFixed(3));
    const okp = seg(t, T.via2, T.via2 + 0.35);
    st.okk.style.opacity = okp.toFixed(3);
    st.okk.style.transform = `scale(${lerp(0.4, 1, outBack(okp)).toFixed(4)})`;

    // the .env window slides in beside the phone; the key chip drops into its first line
    const ei = outQuint(seg(t, T.envIn, T.envIn + 0.6));
    const eo = seg(t, T.end - 1.6, T.end - 1.0);
    st.ew.style.opacity = (ei * (1 - 0.5 * eo)).toFixed(3);
    st.ew.style.transform = `translate(${((1 - ei) * -80).toFixed(1)}px, 0) rotate(-2deg)`;
    st.ew.style.setProperty('--glow', (seg(t, T.keyIn, T.env) * (1 - seg(t, T.envDone + 0.2, T.envDone + 0.8))).toFixed(3));
    const kp = inOutCubic(seg(t, T.envIn + 0.1, T.keyIn + 0.35));
    st.kc.style.opacity = (seg(t, T.envIn + 0.1, T.envIn + 0.3) * (1 - seg(t, T.env + 0.05, T.env + 0.4))).toFixed(3);
    st.kc.style.transform = `translate(${lerp(1450, 400, kp).toFixed(1)}px, ${lerp(150, 560, kp).toFixed(1)}px) scale(${lerp(1.05, 0.72, kp).toFixed(4)}) rotate(${lerp(8, -2, kp).toFixed(2)}deg)`;
    st.env.render(t);

    // the phone: rises in, idles, nods when the key lands, pushes in on the letter
    const pin = outQuint(seg(t, 0, 0.9));
    const nod = Math.sin(Math.PI * seg(t, T.envDone - 0.1, T.envDone + 0.5));
    const ry = -14 + Math.sin(t * 0.6) * 2 + nod * 10 + lerp(0, 6, seg(t, T.regen, T.end));
    const push = lerp(1, 1.06, inOutCubic(seg(t, T.regen, T.regen + 1.4)));
    st.phone.style.transform = `translate(-50%, ${((1 - pin) * 420 - lerp(0, 30, inOutCubic(seg(t, T.regen, T.regen + 1.4)))).toFixed(1)}px) perspective(2400px) rotateX(${(5 + Math.sin(t * 0.45) * 1.5).toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${lerp(2, -1.5, seg(t, T.envIn, T.regen)).toFixed(2)}deg) scale(${(push * lerp(0.92, 1, pin)).toFixed(4)})`;
    st.phone.style.opacity = clamp(pin * 1.4).toFixed(3);
    st.glare.style.opacity = (0.5 + 0.5 * Math.sin(ry * 0.08)).toFixed(3);

    // the app: type, send, refuse
    const ty = t >= T.typ0 && t < T.send;
    const n = ty ? clamp(Math.floor((t - T.typ0) * T.cps) + 1, 0, ASK.length) : 0;
    const ph = ty ? `<span class="typed">${esc(ASK.slice(0, n))}</span><i class="caret"></i>` : '<span class="pl">Message your app</span>';
    if (ph !== st.lastPh) { st.aph.innerHTML = ph; st.lastPh = ph; }
    st.go.classList.toggle('on', ty);
    appear(st.au, t, T.send, 16);
    st.aa.style.opacity = t >= T.think ? '1' : '0';
    st.dot.style.opacity = t >= T.think && t < T.no0 ? '1' : '0';
    st.dot.style.transform = `scale(${(0.75 + 0.25 * Math.sin((t - T.think) * 9)).toFixed(3)})`;
    st.say(streamCount(NO, T.no0, 44, t));
    const xp = seg(t, T.tag, T.tag + 0.42);
    st.gx.style.opacity = clamp(xp * 2.2).toFixed(3);
    st.gx.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.5, 1, outBack(xp)).toFixed(4)})`;
    st.via1.style.opacity = seg(t, T.tag + 0.1, T.tag + 0.4).toFixed(3);
    st.retry.style.opacity = seg(t, T.envDone, T.envDone + 0.3).toFixed(3);
    st.retry.style.transform = `scale(${(1 - 0.12 * press(t, T.retry)).toFixed(4)})`;
    st.retry.classList.toggle('hot', t >= T.envDone + 0.2);
    // Retry: the refusal gives way to version 2 in the same slot
    const sw = inOutCubic(seg(t, T.regen, T.regen + 0.45));
    st.v1.style.opacity = (1 - sw).toFixed(3);
    st.v1.style.transform = `translateY(${(-sw * 18).toFixed(2)}px)`;
    st.v2.style.opacity = sw.toFixed(3);
    st.v2.style.transform = `translateY(${((1 - sw) * 18).toFixed(2)}px)`;
    st.rows.forEach((r, i) => r.put(streamCount(r.s, T.rows[i], 100, t)));
    const fp = seg(t, T.via2, T.via2 + 0.35);
    st.foot2.style.opacity = fp.toFixed(3);
    // the touch: a soft disc taps Retry
    const tp = seg(t, T.retry - 0.45, T.retry) * (1 - seg(t, T.retry + 0.25, T.retry + 0.55));
    st.touch.style.opacity = (tp * 0.9).toFixed(3);
    // aim at the Retry button: its offset box inside the phone (pre-transform, so the tilt carries the touch)
    let rx0 = 0, ry0 = 0, nd = st.retry;
    while (nd && nd !== st.phone) { rx0 += nd.offsetLeft; ry0 += nd.offsetTop; nd = nd.offsetParent; }
    const tx = rx0 + st.retry.offsetWidth / 2, ty2 = ry0 + st.retry.offsetHeight / 2;
    const mv = outCubic(seg(t, T.retry - 0.45, T.retry));
    st.touch.style.transform = `translate(${lerp(tx + 120, tx, mv).toFixed(1)}px, ${lerp(ty2 + 90, ty2, mv).toFixed(1)}px) scale(${(1 - 0.25 * press(t, T.retry)).toFixed(3)})`;
  },
};

run({ W: 1920, H: 1080, segs: [scene, apiEndSeg({ dur: 4.4 })] });
