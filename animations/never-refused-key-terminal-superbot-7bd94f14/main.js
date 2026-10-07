// never-refused · drop-in key · terminal (16:9). The developer's view: roast.py (the OpenAI SDK, untouched), its .env
// and a terminal. `python roast.py` comes back refused from api.openai.com; the sk-superbot key drops into the .env,
// both lines are retyped, roast.py is marked 0 lines changed, and the SAME command comes back answered.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outBack, inOutCubic } from './core/lib.js';
import { hookSeg, ASKS, REFUSAL, esc, shake } from './core/kit.js';
import { OLD, NEW, win, pyHTML, keyChip, envSwap, terminal, cmdEnd, apiEndSeg } from './core/api.js';

const ASK = ASKS.roast.replace(' No mercy.', '');
const CMD = 'python roast.py';
const ANSWER = [
  'Dave. Thirty. No mercy, as requested.',
  '1. You’ve been “getting back into running” since 2019.',
  '   The couch has your outline.',
  '2. Four years “starting a podcast.” Three episodes.',
  '3. Happy 30th, Dave. Your back already knew.',
];

const T = {};
T.c1 = 0.75; T.no = cmdEnd({ at: T.c1, cmd: CMD }) + 0.65; T.noStamp = T.no + 0.45;
T.swap0 = T.noStamp + 1.0; T.keyIn = T.swap0 + 0.15; T.env = T.keyIn + 0.55;
T.zero = 0; T.c2 = 0; T.ans = 0; T.ansStamp = 0; T.end = 0;
function lay(doneAt) {
  T.envDone = doneAt; T.zero = doneAt + 0.15; T.c2 = doneAt + 0.55;
  T.ans = cmdEnd({ at: T.c2, cmd: CMD }) + 0.6;
  let at = T.ans; T.rows = ANSWER.map((s) => { const a = at; at += s.length / 72 + 0.12; return a; });
  T.ansStamp = at + 0.15; T.end = T.ansStamp + 2.0;
}
// envSwap's timing is fixed by its own constants, so a dry build gives doneAt before the segment is laid
lay(envSwap(document.createElement('div'), { at: T.env }).doneAt);

const CAPS = [
  ['one request.', 0.3, T.no - 0.05],
  ['chatgpt said <span class="no">no.</span>', T.no, T.swap0 + 0.05],
  ['swap one key.', T.swap0 + 0.1, T.c2 - 0.05],
  ['same code. <span class="yes">no refusals.</span>', T.c2, T.end + 1],
];

const scene = {
  id: 'term', dur: 0,
  mount(sec) {
    const root = el(`<div class="k1">
      <div class="caps">${CAPS.map(([h]) => `<h2>${h}</h2>`).join('')}</div>
      <div class="w code">${win('roast.py', pyHTML(ASK))}<span class="zero">roast.py · 0 lines changed</span></div>
      <div class="w env">${win('.env', '<div class="envslot"></div>')}</div>
      <div class="w trm">${win('zsh', '<div class="tslot"></div>')}<span class="hud h-old">→ ${esc(OLD.url)}</span><span class="hud h-new">→ ${esc(NEW.url)}</span><div class="tstamp no">REFUSED</div><div class="tstamp yes">ANSWERED</div></div>
      <div class="kc">${keyChip()}</div>
    </div>`);
    sec.appendChild(root);
    const q = (s) => root.querySelector(s);
    const env = envSwap(q('.envslot'), { at: T.env });
    const script = [
      { at: T.c1, cmd: CMD },
      { at: T.no, out: REFUSAL, cls: 'no' },
      { at: T.c2, cmd: CMD },
      ...ANSWER.map((s, i) => ({ at: T.rows[i], out: s, cls: i === ANSWER.length - 1 ? 'yes b' : 'yes', stream: 72 })),
    ];
    const term = terminal(q('.tslot'), script);
    return {
      root, env, term, caps: [...root.querySelectorAll('.caps h2')],
      code: q('.code'), envW: q('.env'), trm: q('.trm'), zero: q('.zero'), hOld: q('.h-old'), hNew: q('.h-new'),
      sNo: q('.tstamp.no'), sYes: q('.tstamp.yes'), kc: q('.kc'), same: null,
    };
  },
  render(st, t) {
    // windows rise in
    [st.code, st.envW, st.trm].forEach((w, i) => {
      const p = outCubic(seg(t, 0.05 + i * 0.1, 0.6 + i * 0.1));
      w.style.setProperty('--in', p.toFixed(3));
    });
    // focus: the .env takes the stage while the key goes in
    const focus = seg(t, T.swap0 - 0.1, T.swap0 + 0.35) * (1 - seg(t, T.envDone + 0.1, T.envDone + 0.5));
    st.code.style.setProperty('--dim', (focus * 0.55).toFixed(3));
    st.trm.style.setProperty('--dim', (focus * 0.55).toFixed(3));
    st.envW.style.setProperty('--glow', focus.toFixed(3));
    st.envW.style.setProperty('--push', (1 + 0.035 * inOutCubic(focus)).toFixed(4));
    st.trm.style.setProperty('--sx', shake(t, T.noStamp, 0.5, 9).toFixed(2) + 'px');

    // captions
    st.caps.forEach((c, i) => {
      const [, a, b] = CAPS[i];
      const out = seg(t, b - 0.25, b);
      const v = seg(t, a, a + 0.35) * (1 - out);
      c.style.opacity = v.toFixed(3);
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 8).toFixed(2)}px)`;
      c.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 22 - out * 14).toFixed(2)}px)`;
    });

    // the key chip drops from above into the API key line, then dissolves into the typed value
    const kp = inOutCubic(seg(t, T.swap0 - 0.25, T.keyIn + 0.35));
    const kv = seg(t, T.swap0 - 0.25, T.swap0) * (1 - seg(t, T.env + 0.1, T.env + 0.45));
    st.kc.style.opacity = kv.toFixed(3);
    st.kc.style.transform = `translate(${lerp(1180, 330, kp).toFixed(1)}px, ${lerp(80, 735, kp).toFixed(1)}px) scale(${lerp(1.1, 0.8, kp).toFixed(4)}) rotate(${lerp(-6, 0, kp).toFixed(2)}deg)`;

    st.env.render(t);
    st.term.render(t);
    // route HUD on the terminal: where the request went
    const hNew = seg(t, T.envDone - 0.1, T.envDone + 0.2);
    st.hOld.style.opacity = (seg(t, T.c1, T.c1 + 0.3) * (1 - hNew)).toFixed(3);
    st.hNew.style.opacity = hNew.toFixed(3);
    const zp = seg(t, T.zero, T.zero + 0.4);
    st.zero.style.opacity = clamp(zp * 2).toFixed(3);
    st.zero.style.transform = `scale(${lerp(0.6, 1, outBack(zp)).toFixed(4)})`;
    const stamp = (n, a, b = 99) => {
      const p = seg(t, a, a + 0.35);
      n.style.opacity = (clamp(p * 3) * (1 - seg(t, b, b + 0.3))).toFixed(3);
      n.style.transform = `rotate(${lerp(-18, -8, outBack(p)).toFixed(2)}deg) scale(${lerp(2.1, 1, outCubic(p)).toFixed(4)})`;
    };
    stamp(st.sNo, T.noStamp, T.swap0);
    stamp(st.sYes, T.ansStamp);
  },
};
scene.dur = T.end;

run({ W: 1920, H: 1080, segs: [hookSeg({ dur: 2.4 }), scene, apiEndSeg({ dur: 4.4 })] });
