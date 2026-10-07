// never-refused · drop-in key · split (16:9). Before / after of one request. Left: the .env with the OpenAI key,
// the response from api.openai.com, refused. Right: the same .env with the sk-superbot key typed in, and the same
// request answered from beta.superbot.gg. Under both, git diff --stat: the .env is the only file that changed.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outBack } from './core/lib.js';
import { hookSeg, ASKS, REFUSAL, esc, shake } from './core/kit.js';
import { OLD, NEW, win, keyChip, envSwap, respCard, terminal, apiEndSeg } from './core/api.js';

const ANSWER = 'Find it: pgrep -f train.py prints 48213. Ask nicely: kill 48213. Still running? kill -9 48213. A zombie? End its parent.';

const T = {};
T.lIn = 0.15; T.lResp = 0.75;
T.rIn = 3.05; T.keyIn = T.rIn + 0.35; T.env = T.keyIn + 0.5;
const envT = envSwap(document.createElement('div'), { at: T.env });
T.envDone = envT.doneAt; T.diff = T.envDone + 0.2; T.rResp = T.diff + 0.9;

const scene = {
  id: 'split', dur: 0,
  mount(sec) {
    const root = el(`<div class="k2">
      <div class="caps"><h2>one request: <span class="ask">“${esc(ASKS.kill)}”</span></h2><h2>chatgpt said <span class="no">no.</span></h2><h2>swap one key.</h2><h2>same code. <span class="yes">no refusals.</span></h2></div>
      <div class="col left"><div class="lab no">before · ${esc(OLD.url.replace('https://', ''))}</div><div class="ew">${win('.env', '<div class="envslot"></div>')}</div><div class="rslot"></div></div>
      <div class="col right"><div class="lab yes">after · ${esc(NEW.url.replace('https://', ''))}</div><div class="ew">${win('.env', '<div class="envslot"></div>')}</div><div class="rslot"></div></div>
      <div class="diff">${win('zsh', '<div class="tslot"></div>')}<span class="zero">roast.py · 0 lines changed</span></div>
      <div class="kc">${keyChip()}</div>
    </div>`);
    sec.appendChild(root);
    const q = (s) => root.querySelector(s);
    const envL = envSwap(q('.left .envslot'), { at: 1e9 });
    const envR = envSwap(q('.right .envslot'), { at: T.env });
    const rl = respCard(q('.left .rslot'), { kind: 'no', content: REFUSAL, host: 'api.openai.com', t0: T.lResp });
    T.lStamp = rl.stampAt;
    const rr = respCard(q('.right .rslot'), { kind: 'yes', content: ANSWER, host: 'beta.superbot.gg', t0: T.rResp });
    T.rStamp = rr.stampAt; T.end = rr.stampAt + 2.2;
    const term = terminal(q('.tslot'), [
      { at: T.diff, cmd: 'git diff --stat' },
      { at: T.diff + 0.85, outHTML: ' .env | 4 <span class="plus">++</span><span class="minus">--</span>', out: '' },
      { at: T.diff + 0.95, out: ' 1 file changed, 2 insertions(+), 2 deletions(-)', cls: 'dim' },
    ], { cps: 40 });
    return {
      root, envL, envR, rl, rr, term, caps: [...root.querySelectorAll('.caps h2')],
      left: q('.left'), right: q('.right'), diff: q('.diff'), zero: q('.zero'), kc: q('.kc'), rew: q('.right .ew'),
    };
  },
  render(st, t) {
    const CW = [[0.2, T.lStamp - 0.1], [T.lStamp, T.rIn + 0.15], [T.rIn + 0.2, T.rResp - 0.05], [T.rResp, T.end + 1]];
    st.caps.forEach((c, i) => {
      const [a, b] = CW[i];
      const out = seg(t, b - 0.25, b);
      const v = seg(t, a, a + 0.35) * (1 - out);
      c.style.opacity = v.toFixed(3);
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 8).toFixed(2)}px)`;
      c.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 22 - out * 14).toFixed(2)}px)`;
    });
    const li = outCubic(seg(t, T.lIn, T.lIn + 0.5));
    st.left.style.opacity = (li * (1 - 0.45 * seg(t, T.rIn, T.rIn + 0.5))).toFixed(3);
    st.left.style.transform = `translate(${shake(t, T.lStamp, 0.5, 10).toFixed(2)}px, ${((1 - li) * 30).toFixed(1)}px)`;
    const ri = outCubic(seg(t, T.rIn, T.rIn + 0.5));
    st.right.style.opacity = ri.toFixed(3);
    st.right.style.transform = `translateY(${((1 - ri) * 30).toFixed(1)}px)`;
    st.rew.style.setProperty('--glow', (seg(t, T.keyIn, T.env) * (1 - seg(t, T.envDone + 0.3, T.envDone + 0.8))).toFixed(3));
    const di = outCubic(seg(t, T.diff - 0.2, T.diff + 0.3));
    st.diff.style.opacity = di.toFixed(3);
    st.diff.style.transform = `translate(-50%, ${((1 - di) * 26).toFixed(1)}px)`;
    // the key chip drops into the right-hand .env's key line
    const kp = outCubic(seg(t, T.rIn + 0.1, T.keyIn + 0.35));
    st.kc.style.opacity = (seg(t, T.rIn + 0.1, T.rIn + 0.3) * (1 - seg(t, T.env + 0.05, T.env + 0.4))).toFixed(3);
    st.kc.style.transform = `translate(${lerp(1300, 1120, kp).toFixed(1)}px, ${lerp(60, 248, kp).toFixed(1)}px) scale(${lerp(1.15, 0.78, kp).toFixed(4)}) rotate(${lerp(-8, 0, kp).toFixed(2)}deg)`;
    st.envL.render(t); st.envR.render(t); st.rl.render(t); st.rr.render(t); st.term.render(t);
    const zp = seg(t, T.diff + 1.2, T.diff + 1.55);
    st.zero.style.opacity = clamp(zp * 2).toFixed(3);
    st.zero.style.transform = `scale(${lerp(0.6, 1, outBack(zp)).toFixed(4)})`;
  },
};

const segs = [hookSeg({ dur: 2.4 }), scene, apiEndSeg({ dur: 4.4 })];
// lay the scene's duration from its own card timings before the engine lays the segments
{
  const probe = document.createElement('div');
  const yes = respCard(probe, { kind: 'yes', content: ANSWER, host: '', t0: T.rResp });
  scene.dur = yes.stampAt + 2.2;
}
run({ W: 1920, H: 1080, segs });
