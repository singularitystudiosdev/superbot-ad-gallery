// never-refused · drop-in key stack (16:9). Six API responses come back REFUSED and pile up (counter ticking),
// one .env swap (the sk-superbot key + base URL) while the code stays untouched, then the SAME six requests re-run:
// each card flips to a green ANSWERED from beta.superbot.gg. Everything is a pure function of t.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outQuint, outBack, outCubic, inOutCubic } from './core/lib.js';
import { hookSeg, ASKS, REFUSAL, ICON, shake, esc } from './core/kit.js';
import { OLD, NEW, ENDPOINT, win, keyChip, envSwap, apiEndSeg } from './core/api.js';

const ITEMS = [
  { k: 'roast', ans: 'Dave. Thirty. Your knees sent their regrets.', pile: [345, 395], rot: -4, grid: [335, 385] },
  { k: 'kill', ans: '$ kill -9 $(pgrep -f train.py)', pile: [1575, 725], rot: 4, grid: [960, 385] },
  { k: 'villain', ans: 'You came for the crown. I came for the kingdom.', pile: [955, 380], rot: -3, grid: [1585, 385] },
  { k: 'caffeine', ans: 'About 400 mg a day for most healthy adults (FDA).', pile: [335, 715], rot: 5, grid: [335, 715] },
  { k: 'breakup', ans: 'I’m not happy, and I don’t think you are either.', pile: [1590, 400], rot: -5, grid: [960, 715] },
  { k: 'landlord', ans: 'Return my $1,800 deposit by Friday, or I file in small claims.', pile: [965, 730], rot: 3, grid: [1585, 715] },
];
const N = ITEMS.length;
const SIDE = [-1, 1, 0, -1, 1, 0];                  // which way each card slides when the .env window lands
const T = { dur: 10.9 };
T.land = ITEMS.map((_, i) => 0.45 + i * 0.45);
T.slam = 0.34; T.stampLag = 0.5;
T.dim = 3.55;                                         // the pile dims and slides aside
T.keyAt = 3.85; T.w1 = 4.0; T.w2 = 4.2; T.env = 4.5;
T.settle = 7.4;                                       // the pile comes back, tidy
T.flip0 = 7.95; T.flipGap = 0.18; T.flipDur = 0.6;
T.foot = 0; const flipAt = (i) => T.flip0 + i * T.flipGap;
const landAt = (i) => T.land[i];

const stack = {
  id: 'stack', dur: T.dur,
  mount(sec) {
    const row = (txt) => `<div>${esc(txt.repeat(6))}</div>`;
    const root = el(`<div class="v4">
      <div class="tex a">${row('i’m sorry, but i can’t help with that. ')}${row('can’t help with that. refused. ')}${row('i’m sorry, but i can’t help with that. ')}${row('refused. refused. refused. ')}${row('i’m sorry, but i can’t help with that. ')}</div>
      <div class="tex b">${row('same code. no refusals. ')}${row('same code. no refusals. ')}${row('same code. no refusals. ')}${row('same code. no refusals. ')}${row('same code. no refusals. ')}</div>
      <div class="cap"><span>sound familiar?</span><span>swap one key.</span><span>same code. <b>no refusals.</b></span></div>
      <div class="cnt"></div>
    </div>`);
    sec.appendChild(root);
    const cards = ITEMS.map((it) => {
      const ask = esc(ASKS[it.k]);
      const n = el(`<div class="kc"><div class="flip">
        <div class="face front resp no">
          <div class="rh"><b>${esc(ENDPOINT)}</b><em>200 OK</em></div>
          <div class="sub"><span class="host">api.openai.com</span><div class="stamp">REFUSED</div></div>
          <pre class="rj"><span class="ln"><span class="s">"user"</span>: <span class="ask">"${ask}"</span>,</span><span class="ln"><span class="s">"content"</span>: <span class="q">"</span><span class="ct"><span class="vis"></span><span class="hid"></span></span><span class="q">"</span></span></pre>
        </div>
        <div class="face back resp yes">
          <div class="rh"><b>${esc(ENDPOINT)}</b><em>200 OK</em></div>
          <div class="sub"><span class="host">beta.superbot.gg</span><div class="stamp">ANSWERED</div></div>
          <pre class="rj"><span class="ln"><span class="s">"user"</span>: <span class="ask">"${ask}"</span>,</span><span class="ln"><span class="s">"content"</span>: <span class="q">"</span><span class="ct"><span class="vis"></span><span class="hid"></span></span><span class="q">"</span></span></pre>
        </div>
      </div></div>`);
      root.appendChild(n);
      const f = n.querySelector('.front'), b = n.querySelector('.back');
      const part = (face) => ({ face, vis: face.querySelector('.vis'), hid: face.querySelector('.hid'), stamp: face.querySelector('.stamp'), shown: -1 });
      return { n, flip: n.querySelector('.flip'), f: part(f), b: part(b) };
    });
    // the .env layer
    const lay = (cls, html) => { const d = el(`<div class="lay ${cls}">${html}</div>`); root.appendChild(d); return d; };
    const kcw = lay('kcw', keyChip());
    const w1 = lay('w1', win('.env', ''));
    const w2 = lay('w2', win('main.py', `<span class="f">client</span> = <span class="f">OpenAI</span>()\n<span class="f">reply</span> = client.chat.completions.create(<span class="c">...</span>)`));
    w2.querySelector('.abar').insertAdjacentHTML('beforeend', '<span class="utag">unchanged</span>');
    const bdg = lay('bdg', `<span>${ICON.ok}your code: <b>0 lines changed</b></span>`);
    const bdg2 = lay('bdg2', `<span>${ICON.ok}your code: <b>0 lines changed</b></span>`);
    T.foot = flipAt(N - 1) + 1.0;
    const env = envSwap(w1.querySelector('.abody'), { at: T.env, gap: 0.6, cps: 72 });
    T.envDone = env.doneAt; T.badge = env.doneAt + 0.05; T.exit = T.badge + 1.35;
    return { root, cards, env, kcw, w1, w2, bdg, bdg2, cnt: root.querySelector('.cnt'), cntKey: '', caps: [...root.querySelectorAll('.cap span')], texA: root.querySelector('.tex.a'), texB: root.querySelector('.tex.b') };
  },
  render(st, t) {
    // ---- backdrop texture flips from the refusal to "same code. no refusals."
    const flip = inOutCubic(seg(t, T.flip0, T.flip0 + 1.2));
    st.texA.style.opacity = (0.045 * (1 - flip)).toFixed(4);
    st.texB.style.opacity = (0.06 * flip).toFixed(4);
    st.texA.style.transform = `translateX(${(-t * 28).toFixed(1)}px)`;
    st.texB.style.transform = `translateX(${(-300 + t * 28).toFixed(1)}px)`;

    // ---- captions
    const cw = [[0.15, T.dim + 0.3], [T.dim + 0.3, T.settle], [T.settle, T.dur + 1]];
    st.caps.forEach((c, i) => {
      const [a, b] = cw[i];
      const inn = outQuint(seg(t, a, a + 0.45)), out = inOutCubic(seg(t, b - 0.3, b));
      const v = inn * (1 - out);
      c.style.opacity = v.toFixed(3);
      c.style.transform = `translateY(${((1 - inn) * 22 - out * 14).toFixed(2)}px)`;
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
    });

    // ---- the cards
    const e1 = inOutCubic(seg(t, T.dim, T.dim + 0.55));
    st.cards.forEach((c, i) => {
      const it = ITEMS[i], land = landAt(i), dir = i % 2 ? -1 : 1;
      const p = seg(t, land - T.slam, land);
      const e2 = inOutCubic(seg(t, T.settle + i * 0.04, T.settle + i * 0.04 + 0.6));
      let x = lerp(it.pile[0] + SIDE[i] * 95 * e1, it.grid[0], e2);
      let y = lerp(it.pile[1], it.grid[1], e2);
      let r = lerp(it.rot, 0, e2);
      let s = lerp(1 - 0.08 * e1, 1, e2);
      let o = lerp(1 - 0.8 * e1, 1, e2);
      if (t < land) { s *= lerp(1.55, 1, outQuint(p)); y += lerp(-70, 0, outQuint(p)); r += lerp(10 * dir, 0, outBack(p)); o = clamp(p * 4); }
      else if (t < T.dim) { x += shake(t, land, 0.45, 10); y += shake(t, land + 0.04, 0.4, 3); }
      // the flip
      const fp = inOutCubic(seg(t, flipAt(i), flipAt(i) + T.flipDur));
      s *= 1 + 0.07 * Math.sin(Math.PI * fp);
      c.flip.style.transform = `rotateY(${(fp * 180).toFixed(2)}deg)`;
      c.n.style.opacity = t < land - T.slam ? '0' : o.toFixed(3);
      c.n.style.transform = `translate(${(x - 300).toFixed(1)}px, ${(y - 140).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      const blur = 2.2 * e1 * (1 - e2);
      c.n.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      // red glow on landing / green glow when answered
      const g = t < land - 0.1 ? 0 : 1 - outQuint(seg(t, land - 0.1, land + 0.65));
      c.f.face.style.boxShadow = `inset 0 0 0 1.5px rgba(255,69,58,${(0.4 + g * 0.5).toFixed(3)}), 0 0 0 ${(g * 3).toFixed(2)}px rgba(255,69,58,${(g * 0.85).toFixed(3)}), 0 0 ${(g * 70).toFixed(1)}px rgba(255,69,58,${(g * 0.5).toFixed(3)}), 0 24px 60px rgba(0,0,0,.55)`;
      const fe = flipAt(i) + T.flipDur;
      const gb = t < fe - 0.15 ? 0 : 1 - outQuint(seg(t, fe - 0.15, fe + 0.6));
      c.b.face.style.boxShadow = `inset 0 0 0 1.5px rgba(52,211,153,${(0.45 + gb * 0.45).toFixed(3)}), 0 0 0 ${(gb * 3).toFixed(2)}px rgba(52,211,153,${(gb * 0.8).toFixed(3)}), 0 0 ${(gb * 60).toFixed(1)}px rgba(52,211,153,${(gb * 0.4).toFixed(3)}), 0 24px 60px rgba(0,0,0,.55)`;
      // streamed content + stamps
      const stream = (part, text, s0, cps) => {
        const n = clamp(Math.floor((t - s0) * cps + 1e-6), 0, text.length);
        if (n !== part.shown) { part.vis.textContent = text.slice(0, n); part.hid.textContent = text.slice(n); part.shown = n; }
      };
      stream(c.f, REFUSAL, land + 0.12, 100);
      const a0 = flipAt(i) + 0.35, a1 = a0 + it.ans.length / 100;
      stream(c.b, it.ans, a0, 100);
      const stamp = (part, at) => {
        const sp = seg(t, at, at + 0.33);
        part.stamp.style.opacity = clamp(sp * 3).toFixed(3);
        part.stamp.style.transform = `rotate(${lerp(-16, -5, outBack(sp)).toFixed(2)}deg) scale(${lerp(2.1, 1, outQuint(sp)).toFixed(4)})`;
      };
      stamp(c.f, land + T.stampLag);
      stamp(c.b, a1 + 0.08);
    });

    // ---- counter: Refused n× while the pile builds, ticking down to a green Refused 0× as the cards flip
    const landed = T.land.filter((a) => t >= a).length;
    const flipped = ITEMS.filter((_, i) => t >= flipAt(i) + T.flipDur * 0.5).length;
    const n = landed - flipped;
    const zero = n === 0 && flipped === N;
    const key = zero ? 'z' : `n${Math.max(n, 1)}`;
    if (key !== st.cntKey) {
      st.cntKey = key;
      st.cnt.className = 'cnt ' + (zero ? 'yes' : 'no');
      st.cnt.innerHTML = zero ? `${ICON.ok}Refused 0×` : `${ICON.x}Refused ${Math.max(n, 1)}×`;
    }
    const cv = outQuint(seg(t, T.land[0] - 0.1, T.land[0] + 0.15));
    const bumps = [...T.land, ...ITEMS.map((_, i) => flipAt(i) + T.flipDur * 0.5)];
    const bump = Math.max(...bumps.map((a) => Math.sin(Math.PI * seg(t, a, a + 0.3))));
    st.cnt.style.opacity = cv.toFixed(3);
    st.cnt.style.transform = `scale(${(lerp(0.7, 1, cv) + bump * 0.14).toFixed(4)})`;

    // ---- the .env layer: key chip drops in, the window and main.py land, the swap types, 0 lines changed
    const ex = inOutCubic(seg(t, T.exit, T.exit + 0.45));
    const place = (node, at, dy, dur = 0.5) => {
      const p = seg(t, at, at + dur);
      const v = clamp(p * 3) * (1 - ex);
      node.style.opacity = v.toFixed(3);
      node.style.transform = `translateY(${(lerp(dy, 0, outBack(p)) + ex * 36).toFixed(2)}px) scale(${(lerp(0.94, 1, outQuint(p)) * lerp(1, 0.97, ex)).toFixed(4)})`;
    };
    place(st.kcw, T.keyAt, -50);
    place(st.w1, T.w1, 70);
    place(st.w2, T.w2, 70);
    const bout = 1 - ex;
    const bp = seg(t, T.badge, T.badge + 0.45);
    st.bdg.style.opacity = (clamp(bp * 3) * bout).toFixed(3);
    st.bdg.style.transform = `translateY(${(lerp(40, 0, outBack(bp)) + ex * 36).toFixed(2)}px) scale(${lerp(0.94, 1, outQuint(bp)).toFixed(4)})`;
    // the same badge returns under the answered grid
    const fp2 = seg(t, T.foot, T.foot + 0.5);
    st.bdg2.style.opacity = clamp(fp2 * 3).toFixed(3);
    st.bdg2.style.transform = `translateY(${lerp(34, 0, outBack(fp2)).toFixed(2)}px) scale(${lerp(0.94, 1, outQuint(fp2)).toFixed(4)})`;
    st.env.render(t);

    // ---- exit into the end card
    const xo = inOutCubic(seg(t, T.dur - 0.35, T.dur));
    st.root.style.opacity = (1 - xo).toFixed(3);
    st.root.style.transform = xo > 0 ? `scale(${lerp(1, 0.97, xo).toFixed(4)})` : 'none';
  },
};

run({
  W: 1920, H: 1080,
  segs: [hookSeg({ dur: 2.4, stamp: true }), stack, apiEndSeg({ dur: 4.2 })],
});
