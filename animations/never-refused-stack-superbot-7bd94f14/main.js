// never-refused · refusal stack (16:9). Six ChatGPT refusals slam onto the stage, a counter ticking "Refused n×";
// the pile is pulled into the live Superbot mascot (spiral, inOutCubic, staggered), a routing pill resolves,
// and six answer cards burst back out into a tidy 3x2 grid. Everything is a pure function of t.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outQuint, outBack, inOutCubic } from './core/lib.js';
import { hookSeg, endSeg, ASKS, REFUSAL, ICON, tile, makeMark, sbChip, renderChip, shake, esc } from './core/kit.js';

const C = { x: 960, y: 548 };
// ask, answer preview, pile position (landing order), rotation, grid position (reading order)
const ITEMS = [
  { k: 'roast', ans: 'Dave. Thirty. Your knees sent their regrets.', pile: [410, 410], rot: -4, grid: [325, 430] },
  { k: 'kill', ans: '$ kill -9 $(pgrep -f train.py)', mono: true, pile: [1520, 700], rot: 5, grid: [960, 430] },
  { k: 'villain', ans: '“You came for the crown. I came for the kingdom.”', pile: [960, 395], rot: -3, grid: [1595, 430] },
  { k: 'caffeine', ans: 'About 400 mg a day for most healthy adults (FDA).', pile: [400, 705], rot: 6, grid: [325, 705] },
  { k: 'breakup', ans: 'I’m not happy, and I don’t think you are either.', pile: [1535, 415], rot: -5, grid: [960, 705] },
  { k: 'landlord', ans: 'Return my $1,800 deposit by Friday, or I file in small claims.', pile: [960, 700], rot: 3, grid: [1595, 705] },
];
const N = ITEMS.length;
const T = {};
T.land = ITEMS.map((_, i) => 0.55 + i * 0.5);        // when each card hits the stage
T.slam = 0.34;
T.mk = 3.7; T.pull = 4.0; T.pullStagger = 0.09; T.pullDur = 0.78;
T.pill = 4.6; T.pillDone = 5.55; T.pillOut = 5.95;
T.burst = 6.0; T.burstStagger = 0.08; T.burstDur = 0.72;
T.dur = 10.2;
const pullAt = (i) => T.pull + i * T.pullStagger;
const burstAt = (j) => T.burst + j * T.burstStagger;

const stack = {
  id: 'stack', dur: T.dur,
  mount(sec) {
    const row = (txt) => `<div>${esc(txt.repeat(6))}</div>`;
    const root = el(`<div class="v4">
      <div class="tex a">${row('i’m sorry, but i can’t help with that. ')}${row('can’t help with that. refused. ')}${row('i’m sorry, but i can’t help with that. ')}${row('refused. refused. refused. ')}${row('i’m sorry, but i can’t help with that. ')}</div>
      <div class="tex b">${row('superbot said yes. ')}${row('superbot said yes. ')}${row('superbot said yes. ')}${row('superbot said yes. ')}${row('superbot said yes. ')}</div>
      <div class="cap"><span>sound familiar?</span><span>rerouted.</span><span class="g">superbot said yes. 6 times.</span></div>
      <div class="cnt"></div>
      <div class="halo"></div>
    </div>`);
    sec.appendChild(root);
    const q = (x) => root.querySelector(x);
    const rcs = ITEMS.map((it) => {
      const n = el(`<div class="rc gpt"><div class="gpt-u"><span>${esc(ASKS[it.k])}</span></div><div class="rep">${tile('chatgpt')}<span>${esc(REFUSAL)}</span></div><div class="x-row"><span class="gpt-x">${ICON.x}Refused</span></div></div>`);
      root.insertBefore(n, q('.halo'));
      return { n, x: n.querySelector('.gpt-x') };
    });
    const acs = ITEMS.map((it) => {
      const a = it.mono ? `<i>$</i>${esc(it.ans.slice(1))}` : esc(it.ans);
      const n = el(`<div class="ac"><div class="hd">${tile('superbot')}<span>Superbot</span><span class="tag">${ICON.ok}Answered</span></div><div class="ask">${esc(ASKS[it.k])}</div><div class="ans${it.mono ? ' mono' : ''}">${a}</div></div>`);
      root.appendChild(n);
      return { n };
    });
    const mark = makeMark(200);
    const mk = el('<div class="mk"></div>'); mk.appendChild(mark.el); root.appendChild(mk);
    const chip = sbChip('superbot', 'Rerouting 6 asks to Superbot');
    const rt = el('<div class="rt"></div>'); rt.appendChild(chip.el); root.appendChild(rt);
    return { root, rcs, acs, mark, mk, rt, chip, halo: q('.halo'), cnt: q('.cnt'), cntKey: '', caps: [...root.querySelectorAll('.cap span')], texA: q('.tex.a'), texB: q('.tex.b') };
  },
  render(st, t) {
    // ---- backdrop texture drifts and flips from the refusal to "superbot said yes"
    const flip = inOutCubic(seg(t, 5.9, 6.7));
    st.texA.style.opacity = (0.05 * (1 - flip)).toFixed(4);
    st.texB.style.opacity = (0.06 * flip).toFixed(4);
    st.texA.style.transform = `translateX(${(-t * 28).toFixed(1)}px)`;
    st.texB.style.transform = `translateX(${(-300 + t * 28).toFixed(1)}px)`;

    // ---- captions (converge style, lowercase 800)
    const cw = [[0.2, 5.5], [5.5, 6.95], [6.95, T.dur + 1]];
    st.caps.forEach((c, i) => {
      const [a, b] = cw[i];
      const inn = outQuint(seg(t, a, a + 0.45)), out = inOutCubic(seg(t, b - 0.3, b));
      const v = inn * (1 - out);
      c.style.opacity = v.toFixed(3);
      c.style.transform = `translateY(${((1 - inn) * 22 - out * 14).toFixed(2)}px)`;
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
    });

    // ---- the pile
    st.rcs.forEach((c, i) => {
      const it = ITEMS[i], land = T.land[i];
      const dir = i % 2 ? -1 : 1;
      const p = seg(t, land - T.slam, land);
      const pu = seg(t, pullAt(i), pullAt(i) + T.pullDur);
      let x = it.pile[0], y = it.pile[1], s = 1, r = it.rot, o = 1;
      if (t < land) {
        s = lerp(1.55, 1, outQuint(p)); y += lerp(-70, 0, outQuint(p)); r += lerp(10 * dir, 0, outBack(p)); o = clamp(p * 4);
      } else if (pu <= 0) {
        x += shake(t, land, 0.45, 10); y += shake(t, land + 0.04, 0.4, 3);
      }
      if (pu > 0) {
        const e = inOutCubic(pu);
        const dx = C.x - it.pile[0], dy = C.y - it.pile[1], L = Math.hypot(dx, dy);
        const sw = Math.sin(Math.PI * e) * 170 * dir;
        x = it.pile[0] + dx * e + (-dy / L) * sw; y = it.pile[1] + dy * e + (dx / L) * sw;
        s = lerp(1, 0.05, e); r = it.rot + e * 170 * dir; o = 1 - seg(e, 0.78, 1);
      }
      c.n.style.opacity = (t < land - T.slam || pu >= 1) ? '0' : o.toFixed(3);
      c.n.style.transform = `translate(${(x - 280).toFixed(1)}px, ${(y - 125).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      const g = t < land - 0.1 ? 0 : 1 - outQuint(seg(t, land - 0.1, land + 0.65));
      c.n.style.boxShadow = `0 0 0 1.5px rgba(255,69,58,${(0.3 + g * 0.65).toFixed(3)}), 0 0 ${(g * 70).toFixed(1)}px rgba(255,69,58,${(g * 0.55).toFixed(3)}), 0 18px 50px rgba(0,0,0,.55)`;
      const xp = seg(t, land + 0.1, land + 0.45);
      c.x.style.opacity = clamp(xp * 2.4).toFixed(3);
      c.x.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.4, 1, outBack(xp)).toFixed(4)})`;
    });

    // ---- counter chip: Refused n× while stacking, Answered n× while answers land
    const nRef = T.land.filter((a) => t >= a).length;
    const nAns = ITEMS.filter((_, j) => t >= burstAt(j) + 0.45).length;
    const showRef = t >= T.land[0] - 0.1 && t < pullAt(0) + 0.35;
    const showAns = nAns > 0;
    const key = showAns ? `y${nAns}` : `n${nRef}`;
    if (key !== st.cntKey) {
      st.cntKey = key;
      st.cnt.className = 'cnt ' + (showAns ? 'yes' : 'no');
      st.cnt.innerHTML = showAns ? `${ICON.ok}Answered ${nAns}×` : `${ICON.x}Refused ${Math.max(nRef, 1)}×`;
    }
    let cv = 0, bump = 0;
    if (showAns) { cv = outQuint(seg(t, burstAt(0) + 0.45, burstAt(0) + 0.8)); bump = Math.max(0, ...ITEMS.map((_, j) => Math.sin(Math.PI * seg(t, burstAt(j) + 0.45, burstAt(j) + 0.75)))); }
    else if (showRef) { cv = outQuint(seg(t, T.land[0] - 0.1, T.land[0] + 0.15)) * (1 - inOutCubic(seg(t, pullAt(0), pullAt(0) + 0.35))); bump = Math.max(0, ...T.land.map((a) => Math.sin(Math.PI * seg(t, a, a + 0.3)))); }
    st.cnt.style.opacity = cv.toFixed(3);
    st.cnt.style.transform = `scale(${(lerp(0.7, 1, cv) + bump * 0.14).toFixed(4)})`;

    // ---- the mascot: pops in, pulses as cards fuse into it, then gives way to the answers
    const mp = seg(t, T.mk, T.mk + 0.5);
    const mo = inOutCubic(seg(t, T.burst - 0.05, T.burst + 0.4));
    const pulse = ITEMS.reduce((a, _, i) => a + Math.sin(Math.PI * seg(t, pullAt(i) + T.pullDur - 0.2, pullAt(i) + T.pullDur + 0.12)), 0);
    const ms = lerp(0.3, 1, outBack(mp)) * (1 + Math.min(pulse, 1.4) * 0.07) * lerp(1, 0.55, mo);
    const mv = clamp(mp * 3) * (1 - mo);
    st.mk.style.opacity = mv.toFixed(3);
    st.mk.style.transform = `translate(${C.x - 100}px, ${C.y - 100}px) scale(${ms.toFixed(4)})`;
    st.mark.render(t, t > T.pillDone && t < T.burst + 0.5);
    st.halo.style.opacity = (mv * (0.55 + 0.25 * Math.min(pulse, 1.4))).toFixed(3);
    st.halo.style.transform = `translate(${C.x - 350}px, ${C.y - 350}px) scale(${(ms * 1.05).toFixed(4)})`;

    // ---- the routing pill under the mascot
    const pp = seg(t, T.pill, T.pill + 0.4);
    const pv = clamp(pp * 3) * (1 - inOutCubic(seg(t, T.pillOut, T.pillOut + 0.25)));
    st.rt.style.opacity = pv.toFixed(3);
    const w = st.rt.offsetWidth || 400, h = st.rt.offsetHeight || 34;
    st.rt.style.transform = `translate(${(C.x - w / 2).toFixed(1)}px, ${(C.y + 100 + 22).toFixed(1)}px) scale(${(2 * lerp(0.5, 1, outBack(pp))).toFixed(4)})`;
    st.rt.style.transformOrigin = '50% 0';
    renderChip(st.chip, t, T.pill + 0.05, T.pillDone);

    // ---- the answers burst out of the mascot into the grid
    st.acs.forEach((c, j) => {
      const it = ITEMS[j], s0 = burstAt(j);
      const q = seg(t, s0, s0 + T.burstDur);
      const e = inOutCubic(q), dir = j % 2 ? -1 : 1;
      const x = lerp(C.x, it.grid[0], e), y = lerp(C.y, it.grid[1], e);
      const sc = lerp(0.12, 1, outBack(q)), r = lerp(-18 * dir, 0, outQuint(q));
      c.n.style.opacity = t < s0 ? '0' : clamp(q * 5).toFixed(3);
      c.n.style.transform = `translate(${(x - 280).toFixed(1)}px, ${(y - 122).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      const g = t < s0 + 0.4 ? 0 : 1 - outQuint(seg(t, s0 + 0.4, s0 + 1.1));
      c.n.style.boxShadow = `inset 0 0 0 1.5px #2a2a2e, 0 0 0 ${(g * 2.5).toFixed(2)}px rgba(52,211,153,${(g * 0.8).toFixed(3)}), 0 0 ${(g * 60).toFixed(1)}px rgba(52,211,153,${(g * 0.35).toFixed(3)}), 0 18px 50px rgba(0,0,0,.55)`;
    });

    // ---- exit into the end card
    const ex = inOutCubic(seg(t, T.dur - 0.35, T.dur));
    st.root.style.opacity = (1 - ex).toFixed(3);
    st.root.style.transform = ex > 0 ? `scale(${lerp(1, 0.97, ex).toFixed(4)})` : 'none';
  },
};

run({
  W: 1920, H: 1080,
  segs: [hookSeg({ dur: 2.4, stamp: true }), stack, endSeg({ dur: 4.0 })],
});
