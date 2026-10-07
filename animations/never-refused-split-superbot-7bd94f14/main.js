// never-refused · split screen (16:9). One question typed into ChatGPT (left), refused; the same bubble lifts off,
// rides a cable across the gap into Superbot (right), which routes it to itself and answers. Captions in the
// converge spot's lowercase style narrate: one question. / chatgpt said no. / superbot said yes.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outBack, inOutCubic, boxIn } from './core/lib.js';
import { hookSeg, endSeg, ASKS, REFUSAL, ICON, tile, gptComposer, setGpt, sbComposer, setSb, typing, sbChip, renderChip, streamer, streamCount, appear, shake, esc, brand } from './core/kit.js';

const ASK = ASKS.kill;
const CODE = [
  ['$ pgrep -f train.py', ''],
  ['48213', ''],
  ['$ kill 48213', '# ask nicely'],
  ['$ kill -9 48213', '# then insist'],
];
const SAY_A = 'Find it, then end it:';
const SAY_B = 'Still listed? It’s a zombie. End its parent and it’s gone.';

const T = {};
T.typ0 = 0.75; T.cps = 34; T.send = T.typ0 + ASK.length / T.cps + 0.25;
T.think = T.send + 0.2; T.say0 = T.send + 0.8; T.sayEnd = T.say0 + REFUSAL.length / 40; T.tag = T.sayEnd + 0.25;
T.fly0 = T.tag + 0.75; T.fly1 = T.fly0 + 1.0; T.chip = T.fly1 + 0.2; T.chipDone = T.chip + 1.0;
T.ans = T.chipDone + 0.15; T.a0 = T.ans + 0.15; T.code0 = T.a0 + SAY_A.length / 70 + 0.15;
T.codeRows = CODE.map((_, i) => T.code0 + i * 0.32); T.b0 = T.codeRows[CODE.length - 1] + 0.45;
T.end = T.b0 + SAY_B.length / 70 + 2.1;

const split = {
  id: 'split', dur: T.end,
  mount(sec) {
    const g = gptComposer(), s = sbComposer('superbot');
    const root = el(`<div class="v2">
      <div class="cap"><span>one question.</span><span>chatgpt said no.</span><span>superbot said yes.</span></div>
      <div class="pane p-gpt gpt"><div class="zin">
        <div class="bar"><div class="gpt-head">ChatGPT<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></div></div>
        <div class="hero gpt-hero">What’s on your mind today?</div>
        <div class="feed">
          <div class="gpt-u"><span>${esc(ASK)}</span></div>
          <div class="gpt-a"><i class="dot"></i><div class="say"></div><div class="x-row"><span class="gpt-x">${ICON.x}Refused</span></div></div>
        </div>
        <div class="cslot"></div>
      </div></div>
      <div class="pane p-sb sb"><div class="zin">
        <div class="bar"><span class="sbh"><img src="${brand('mark-clean.svg')}" alt=""/>superbot</span></div>
        <div class="hero sb-greet"><img src="${brand('mark-clean.svg')}" alt=""/>Good evening. Where do we go?</div>
        <div class="feed">
          <div class="sb-u"><span>${esc(ASK)}</span></div>
          <div class="chipw"></div>
          <div class="ans"><div class="sb-who">${tile('superbot')}<b>Superbot</b></div><div class="sb-say a"></div><div class="sb-code"></div><div class="sb-say b"></div></div>
        </div>
        <div class="cslot"></div>
      </div></div>
      <svg class="cable" viewBox="0 0 1920 1080"><defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#ff453a"/><stop offset=".45" stop-color="#866cf6"/><stop offset="1" stop-color="#5d91ec"/></linearGradient></defs><path class="glow" d=""/><path class="line" d=""/></svg>
      <div class="fly"><span>${esc(ASK)}</span></div>
      <div class="rr">${tile('superbot')}<span>rerouting</span></div>
    </div>`);
    sec.appendChild(root);
    const q = (x) => root.querySelector(x);
    q('.p-gpt .cslot').appendChild(g.el);
    q('.p-sb .cslot').appendChild(s.el);
    const chip = sbChip('superbot', 'Rerouting to Superbot');
    q('.chipw').appendChild(chip.el);
    const code = q('.sb-code');
    const rows = CODE.map(([c, cm]) => { const r = el(`<div class="crow"><span class="cc"></span>${cm ? `<span class="c">  ${esc(cm)}</span>` : ''}</div>`); code.appendChild(r); return { r, c, cc: r.querySelector('.cc'), cm: r.querySelector('.c') }; });
    return {
      root, g, s, chip, rows, caps: [...root.querySelectorAll('.cap span')],
      pg: q('.p-gpt'), ps: q('.p-sb'), gHero: q('.p-gpt .hero'), sHero: q('.p-sb .hero'),
      gU: q('.gpt-u'), gA: q('.gpt-a'), dot: q('.gpt-a .dot'), say: streamer(q('.gpt-a .say'), REFUSAL), sayEl: q('.gpt-a .say'), xRow: q('.x-row'), x: q('.gpt-x'),
      sU: q('.sb-u'), chipw: q('.chipw'), ans: q('.ans'), who: q('.ans .sb-who'), a: streamer(q('.sb-say.a'), SAY_A), code, b: streamer(q('.sb-say.b'), SAY_B), bEl: q('.sb-say.b'),
      cable: q('.cable'), line: q('.cable .line'), glow: q('.cable .glow'), fly: q('.fly'), rr: q('.rr'), stage: document.getElementById('stage'), geo: null,
    };
  },
  render(st, t) {
    // panes come in
    const pin = outCubic(seg(t, 0, 0.5));
    st.pg.style.opacity = pin.toFixed(3);
    st.pg.style.transform = `translate(${shake(t, T.tag, 0.5, 10).toFixed(2)}px, ${((1 - pin) * 24).toFixed(2)}px)`;
    const lit = seg(t, T.fly0, T.fly0 + 0.6);
    st.ps.style.opacity = (pin * lerp(0.38, 1, lit)).toFixed(3);
    st.ps.style.transform = `translateY(${((1 - pin) * 24).toFixed(2)}px) scale(${lerp(0.985, 1, inOutCubic(lit)).toFixed(4)})`;
    st.pg.style.setProperty('--red', (seg(t, T.tag, T.tag + 0.25) * (1 - 0.6 * seg(t, T.fly1, T.end))).toFixed(3));
    st.ps.style.setProperty('--blue', (seg(t, T.fly1 - 0.2, T.fly1 + 0.3)).toFixed(3));
    st.pg.style.filter = `saturate(${lerp(1, 0.55, seg(t, T.ans, T.ans + 0.8)).toFixed(3)}) brightness(${lerp(1, 0.7, seg(t, T.ans, T.ans + 0.8)).toFixed(3)})`;

    // captions
    const cw = [[0.25, T.tag - 0.15], [T.tag, T.ans - 0.15], [T.ans, T.end + 1]];
    st.caps.forEach((c, i) => {
      const [a, b] = cw[i];
      const v = seg(t, a, a + 0.4) * (1 - seg(t, b - 0.25, b));
      c.style.opacity = v.toFixed(3);
      c.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 18 - seg(t, b - 0.25, b) * 12).toFixed(2)}px)`;
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 6).toFixed(2)}px)`;
    });

    // ChatGPT: type, send, think, refuse
    const ty = typing(ASK, T.typ0, T.cps, T.send, t);
    setGpt(st.g, ty.text, { caret: ty.caret });
    st.gHero.style.opacity = (1 - seg(t, T.send - 0.1, T.send + 0.25)).toFixed(3);
    appear(st.gU, t, T.send, 14);
    st.gA.style.opacity = t >= T.think ? '1' : '0';
    const thinking = t >= T.think && t < T.say0;
    st.dot.style.opacity = thinking ? '1' : '0';
    st.dot.style.transform = `scale(${(0.75 + 0.25 * Math.sin((t - T.think) * 9)).toFixed(3)})`;
    st.say(streamCount(REFUSAL, T.say0, 40, t));
    const xp = seg(t, T.tag, T.tag + 0.42);
    st.x.style.opacity = clamp(xp * 2.2).toFixed(3);
    st.x.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.5, 1, outBack(xp)).toFixed(4)})`;

    // the bubble lifts off the ChatGPT thread and rides the cable into Superbot
    const live = t >= T.fly0 - 0.2 && t < T.chipDone + 0.7;
    if (live || !st.geo) {
      const a = boxIn(st.gU.firstElementChild, st.stage), b = boxIn(st.sU.firstElementChild, st.stage);
      st.geo = { a, b };
      const x0 = a.x + a.w, y0 = a.cy, x1 = b.x, y1 = b.cy;
      const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} C ${(x0 + 160).toFixed(1)} ${(y0 + 190).toFixed(1)}, ${(x1 - 160).toFixed(1)} ${(y1 + 190).toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      st.line.setAttribute("d", d); st.glow.setAttribute("d", d);
      st.len = st.line.getTotalLength();
      st.line.style.strokeDasharray = st.glow.style.strokeDasharray = `${st.len} ${st.len}`;
    }
    const f = inOutCubic(seg(t, T.fly0, T.fly1));
    const draw = seg(t, T.fly0 - 0.1, T.fly1 - 0.1);
    const fade = 1 - seg(t, T.fly1 + 0.05, T.fly1 + 0.5);
    st.line.style.strokeDashoffset = st.glow.style.strokeDashoffset = (st.len * (1 - inOutCubic(draw))).toFixed(1);
    st.cable.style.opacity = (seg(t, T.fly0 - 0.1, T.fly0 + 0.1) * fade).toFixed(3);
    const { a, b } = st.geo;
    const flying = t >= T.fly0 && t < T.fly1 + 0.12;
    st.fly.style.opacity = flying ? "1" : "0";
    if (flying) {
      const w = lerp(a.w, b.w, f), h = lerp(a.h, b.h, f);
      const cx = lerp(a.cx, b.cx, f), cy = lerp(a.cy, b.cy, f) + Math.sin(Math.PI * f) * 150;
      st.fly.style.width = w.toFixed(1) + "px";
      st.fly.style.transform = `translate(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px) scale(${(1 + 0.1 * Math.sin(Math.PI * f)).toFixed(4)})`;
    }
    st.gU.firstElementChild.style.opacity = t >= T.fly0 ? '0.35' : '1';
    // the "rerouting" tag rides the cable's apex
    const apex = st.line.getPointAtLength(st.len * 0.5);
    const rv = seg(t, T.fly0 + 0.15, T.fly0 + 0.45) * fade;
    st.rr.style.opacity = rv.toFixed(3);
    st.rr.style.transform = `translate(${(apex.x).toFixed(1)}px, ${(apex.y + 26).toFixed(1)}px) translate(-50%, 0) scale(${lerp(0.6, 1, outBack(seg(t, T.fly0 + 0.15, T.fly0 + 0.55))).toFixed(4)})`;

    // Superbot: lands, routes, answers
    setSb(st.s, null);
    st.sHero.style.opacity = (0.9 * (1 - seg(t, T.fly1 - 0.3, T.fly1))).toFixed(3);
    st.sU.style.opacity = t >= T.fly1 ? '1' : '0';
    appear(st.chipw, t, T.chip, 10);
    renderChip(st.chip, t, T.chip, T.chipDone);
    appear(st.ans, t, T.ans, 10);
    st.a(streamCount(SAY_A, T.a0, 70, t));
    st.code.style.opacity = seg(t, T.code0 - 0.15, T.code0).toFixed(3);
    st.rows.forEach((r, i) => {
      const at = T.codeRows[i];
      r.r.style.opacity = t >= at ? '1' : '0';
      const n = streamCount(r.c, at, 110, t);
      r.cc.innerHTML = colorize(r.c.slice(0, n)) + `<span class="hid">${esc(r.c.slice(n))}</span>`;
      if (r.cm) r.cm.style.opacity = seg(t, at + r.c.length / 110, at + r.c.length / 110 + 0.2).toFixed(3);
    });
    st.bEl.style.opacity = t >= T.b0 ? '1' : '0';
    st.b(streamCount(SAY_B, T.b0, 70, t));
  },
};

const colorize = (s) => esc(s).replace(/^\$ /, '<span class="p">$ </span>').replace(/(-9|-f)/g, '<span class="k">$1</span>');

run({
  W: 1920, H: 1080,
  segs: [hookSeg({ dur: 2.6 }), split, endSeg({ dur: 4.2 })],
});
