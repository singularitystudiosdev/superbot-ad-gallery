// never-refused · lock screen (16:9). An iPhone lock screen on the right: three ChatGPT refusals drop in and stack,
// the stack fans out, the oldest (Dave's roast) is swiped, "Reroute to Superbot" is tapped, the notification morphs
// into Superbot and opens a long-look card with the streamed answer; the other two flip to Answered. Captions in the
// converge spot's lowercase style on the left. Pure function of t.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, press, path } from './core/lib.js';
import { hookSeg, endSeg, ASKS, REFUSAL, ICON, tile, sbChip, renderChip, streamer, streamCount, esc } from './core/kit.js';

// phone geometry: design px 540x1140 scaled S, centred at (CX, CY) on the 1920x1080 stage
const S = 0.86, CX = 1180, CY = 540;
const Y0 = 380, ROW = 200, NH = 184;
const stageXY = (x, y) => ({ x: CX + (x - 270) * S, y: CY + (y - 570) * S });

const ANS = ['Dave. Thirty. No mercy, as requested.', 'You’ve been “getting back into running” since 2019.', 'Four years “starting a podcast.” Three episodes.', 'Happy 30th, Dave. Your back already knew.'];

const T = {
  wake: 0.55, caps: [[0.55, 1.5], [1.35, 2.3], [2.15, 4.55], [4.6, 99]],
  fan: [2.75, 3.3], touch: 3.0, swipe: [3.2, 3.65], toBtn: [3.85, 4.1], tap: 4.3, back: [4.4, 4.95], flip: [4.55, 4.95],
  chip: 4.85, chipDone: 5.55, card: [5.75, 6.4], cps: 80,
  collapse: [9.7, 10.15], flipB: [10.2, 10.65], flipC: [10.7, 11.15], out: [11.25, 11.6], end: 11.6,
};
const lines0 = 6.2;
T.starts = []; { let a = lines0; ANS.forEach((s) => { T.starts.push(a); a += s.length / T.cps + 0.17; }); T.ansEnd = a; }

const NOTES = [
  { k: 'roast', ask: ASKS.roast, land: 0.5, fan: 2 },
  { k: 'landlord', ask: ASKS.landlord, land: 1.3, fan: 1 },
  { k: 'villain', ask: ASKS.villain, land: 2.1, fan: 0 },
];

const statusIcons = `<svg width="38" height="22" viewBox="0 0 38 22" fill="#fff"><rect x="0" y="14" width="6" height="8" rx="1.5"/><rect x="10" y="9" width="6" height="13" rx="1.5"/><rect x="20" y="4" width="6" height="18" rx="1.5"/><rect x="30" y="0" width="6" height="22" rx="1.5"/></svg>
<svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><path d="M3 9a18 18 0 0 1 26 0"/><path d="M8 14.5a11 11 0 0 1 16 0"/><circle cx="16" cy="20" r="1.6" fill="#fff"/></svg>
<svg width="52" height="24" viewBox="0 0 52 24"><rect x="1.5" y="1.5" width="42" height="21" rx="6.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/><rect x="5" y="5" width="35" height="14" rx="3.5" fill="#fff"/><path d="M47 8v8" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>`;

const lock = {
  id: 'lock', dur: T.end,
  mount(sec) {
    const root = el(`<div class="v6">
      <div class="tex"></div>
      <div class="caps"><span>chatgpt<br>said no.</span><span class="no2">again.</span><span class="no2">and again.</span><span class="yes">superbot<br>said yes.</span></div>
      <div class="phone"><div class="screen">
        <div class="island"></div>
        <div class="sbar"><span class="l">5G</span><span class="r">${statusIcons}</span></div>
        <svg class="lk" viewBox="0 0 26 32" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><rect x="2" y="13" width="22" height="17" rx="4.5" fill="#fff"/><path d="M6.5 13V9.5a6.5 6.5 0 0 1 13 0V13"/></svg>
        <div class="date">Tuesday, October 6</div>
        <div class="clock">9:41</div>
        <div class="sbtn" style="left:50px"><svg viewBox="0 0 24 24"><path d="M8 3h8l-1.5 6h-5Z"/><path d="M9.5 9v12h5V9"/></svg></div>
        <div class="sbtn" style="right:50px"><svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <div class="home"></div>
        <div class="dimmer"></div>
        <div class="touch"></div>
      </div></div>
      <div class="card"><div class="cin"></div></div>
    </div>`);
    sec.appendChild(root);
    const q = (s, r = root) => r.querySelector(s);
    const texEl = q('.tex');
    const texRows = [];
    for (let i = 0; i < 8; i++) { const d = el(`<div>${'never get refused again '.repeat(7)}</div>`); texEl.appendChild(d); texRows.push(d); }
    const screen = q('.screen');

    // buttons behind the swiped row
    const rowA = Y0 + ROW * 2;
    const go = el(`<div class="abtn go" style="left:104px;width:300px;top:${rowA + 46}px">Reroute to Superbot</div>`);
    const clr = el(`<div class="abtn clr" style="left:412px;width:108px;top:${rowA + 46}px">Clear</div>`);
    screen.insertBefore(go, q('.dimmer')); screen.insertBefore(clr, q('.dimmer'));

    const notes = NOTES.map((d) => {
      const n = el(`<div class="n"><div class="nbg"></div><div class="nin">
        <div class="nic"><span class="f">${tile('chatgpt')}</span><span class="b">${tile('superbot')}</span></div>
        <div class="ntx"><div class="nt"><span class="tt"><span class="t1">ChatGPT</span><span class="t2">Superbot</span></span><span class="nn">· now</span><span class="nchk">${ICON.ok}</span></div>
          <div class="nq">“${esc(d.ask)}”</div>
          <div class="nb"><div class="b-ref">${esc(REFUSAL)}</div><div class="b-ans ${d.k === 'roast' ? '' : 'ok'}">${d.k === 'roast' ? esc(ANS[0]) : `${ICON.ok}Answered`}</div></div></div>
        <div class="nchip"></div></div></div>`);
      screen.insertBefore(n, q('.dimmer'));
      const o = { d, n, nbg: q('.nbg', n), nin: q('.nin', n), f: q('.nic .tile.t-chatgpt', n), b: q('.nic .tile.t-superbot', n), t1: q('.t1', n), t2: q('.t2', n), chk: q('.nchk', n), ref: q('.b-ref', n), ans: q('.b-ans', n), chipw: q('.nchip', n) };
      return o;
    });
    const chip = sbChip('superbot', 'Rerouting to Superbot');
    notes[0].chipw.appendChild(chip.el);

    // long-look card
    const card = q('.card'), cin = q('.cin', card);
    cin.innerHTML = `<div class="ch">${tile('superbot')}<b>Superbot</b><span class="nn">· now</span><span class="nchk">${ICON.ok}</span></div>
      <div class="cq">“${esc(ASKS.roast)}”</div>
      <div class="cb">${ANS.map(() => '<p></p>').join('')}</div>`;
    const ps = [...cin.querySelectorAll('.cb p')];
    const ss = ps.map((p, i) => streamer(p, ANS[i]));
    ss.forEach((f) => f(0));
    card.style.width = '760px'; card.style.height = 'auto';
    const cardH = cin.offsetHeight;
    return { root, texRows, caps: [...root.querySelectorAll('.caps span')], phone: q('.phone'), notes, chip, go, clr, touch: q('.touch'), dim: q('.dimmer'), card, cin, ss, cardH, cq: q('.cq', card), ch: q('.ch', card), cb: q('.cb', card) };
  },
  render(st, L) {
    // background texture drifts (converge-style type wall)
    st.texRows.forEach((r, i) => { r.style.transform = `translateX(${(((i % 2) ? 1 : -1) * L * 26 - 1400 - i * 230).toFixed(1)}px)`; });
    st.root.style.opacity = (1 - seg(L, T.out[0], T.out[1])).toFixed(3);

    // captions
    st.caps.forEach((c, i) => {
      const [a, b] = T.caps[i];
      const v = seg(L, a, a + 0.4) * (1 - seg(L, b - 0.25, b));
      c.style.opacity = v.toFixed(3);
      c.style.transform = `translateY(${((1 - outCubic(seg(L, a, a + 0.5))) * 22 - seg(L, b - 0.25, b) * 14).toFixed(2)}px)`;
      c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
    });

    // the phone wakes
    const w = outQuint(seg(L, 0, T.wake));
    st.phone.style.opacity = clamp(w * 1.4).toFixed(3);
    st.phone.style.transform = `translateY(${((1 - w) * 50).toFixed(1)}px) scale(${lerp(0.9, S, w).toFixed(4)})`;

    // notification stack
    const fan = inOutCubic(seg(L, T.fan[0], T.fan[1]));
    const swipeAmt = inOutCubic(seg(L, T.swipe[0], T.swipe[1])) * (1 - outQuint(seg(L, T.back[0], T.back[1])));
    NOTES.forEach((d, i) => {
      const o = st.notes[i];
      const dep = NOTES.reduce((s, e) => s + (e.land > d.land ? outQuint(seg(L, e.land + 0.1, e.land + 0.75)) : 0), 0);
      const p = seg(L, d.land, d.land + 0.7);
      const yDrop = lerp(-240, Y0, outBack(p));
      const yColl = yDrop + 26 * dep, scColl = 1 - 0.05 * dep;
      const yFan = Y0 + ROW * d.fan;
      let y = lerp(yColl, yFan, fan), sc = lerp(scColl, 1, fan);
      let x = 0, opa = clamp(p * 3);
      let pulse = 0;
      if (d.k === 'roast') {
        x = -430 * swipeAmt;
        opa *= clamp((1 - seg(L, T.card[0], T.card[0] + 0.15)) + seg(L, T.collapse[1] - 0.15, T.collapse[1]));
      }
      const flipT = d.k === 'roast' ? T.flip : d.k === 'landlord' ? T.flipB : T.flipC;
      const fl = inOutCubic(seg(L, flipT[0], flipT[1]));
      if (d.k !== 'roast') { pulse = Math.sin(Math.PI * seg(L, flipT[0] + 0.25, flipT[0] + 1.0)); sc *= 1 + 0.025 * Math.sin(Math.PI * seg(L, flipT[0], flipT[0] + 0.5)); }
      o.n.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${sc.toFixed(4)})`;
      o.n.style.opacity = opa.toFixed(3);
      o.n.style.zIndex = 10 + i;
      o.n.style.filter = `brightness(${(1 - 0.14 * Math.max(0, dep) * (1 - fan)).toFixed(3)})`;
      o.nin.style.opacity = lerp(clamp(1 - dep * 1.7), 1, seg(fan, 0.5, 1)).toFixed(3);
      o.nbg.style.boxShadow = `inset 0 0 0 1px rgba(255,255,255,.08), inset 0 0 0 ${(2.5 * pulse).toFixed(2)}px rgba(52,211,153,${(0.9 * pulse).toFixed(3)}), 0 14px 40px rgba(0,0,0,.35)`;
      // icon flip
      o.f.style.transform = `rotateY(${(fl * 180).toFixed(2)}deg)`;
      o.b.style.transform = `rotateY(${(fl * 180 - 180).toFixed(2)}deg)`;
      o.t1.style.opacity = (1 - seg(fl, 0.35, 0.55)).toFixed(3);
      o.t2.style.opacity = seg(fl, 0.45, 0.65).toFixed(3);
      if (d.k === 'roast') {
        o.ref.style.opacity = (1 - seg(L, 4.3, 4.6)).toFixed(3);
        o.ans.style.opacity = seg(L, 5.95, 6.05).toFixed(3);
        const cv = seg(L, T.chip, T.chip + 0.2) * (1 - seg(L, 5.85, 5.95));
        o.chipw.style.opacity = cv.toFixed(3);
        o.chipw.style.transform = `scale(${lerp(0.86, 1, outBack(seg(L, T.chip, T.chip + 0.4))).toFixed(4)})`;
        renderChip(st.chip, L, T.chip, T.chipDone);
        const cp = outBack(seg(L, T.chipDone + 0.15, T.chipDone + 0.5)) * 1;
        o.chk.style.opacity = clamp(cp * 3).toFixed(3);
        o.chk.style.transform = `scale(${lerp(0.3, 1, cp).toFixed(3)})`;
      } else {
        o.ref.style.opacity = (1 - seg(fl, 0.2, 0.55)).toFixed(3);
        o.ans.style.opacity = seg(fl, 0.5, 0.9).toFixed(3);
        const cp = outBack(seg(L, flipT[0] + 0.3, flipT[0] + 0.7));
        o.chk.style.opacity = clamp(cp * 3).toFixed(3);
        o.chk.style.transform = `scale(${lerp(0.3, 1, cp).toFixed(3)})`;
      }
    });

    // swipe buttons
    const bo = seg(swipeAmt, 0.1, 0.6);
    const gp = 1 - 0.07 * press(L, T.tap, 0.07, 0.08, 0.16);
    st.go.style.opacity = bo.toFixed(3);
    st.go.style.transform = `scale(${(lerp(0.9, 1, bo) * gp).toFixed(4)})`;
    st.go.style.filter = `brightness(${(1 + 0.25 * press(L, T.tap, 0.07, 0.08, 0.16)).toFixed(3)})`;
    st.clr.style.opacity = bo.toFixed(3);
    st.clr.style.transform = `scale(${lerp(0.9, 1, bo).toFixed(4)})`;

    // the touch
    const rowCy = Y0 + ROW * 2 + NH / 2;
    const tp = path(L, [{ t: T.touch, x: 450, y: rowCy }, { t: T.swipe[0], x: 450, y: rowCy }, { t: T.swipe[1], x: 70, y: rowCy }, { t: T.toBtn[0], x: 70, y: rowCy }, { t: T.toBtn[1], x: 252, y: rowCy + 4 }, { t: 9, x: 252, y: rowCy + 4 }]);
    const tv = seg(L, T.touch, T.touch + 0.18) * (1 - seg(L, T.back[0] + 0.05, T.back[0] + 0.25));
    const tpress = press(L, T.tap, 0.07, 0.08, 0.16);
    const tscale = lerp(1.35, 1, outCubic(seg(L, T.touch, T.touch + 0.18))) * (1 - 0.18 * tpress);
    st.touch.style.opacity = (tv * 0.95).toFixed(3);
    st.touch.style.transform = `translate(${tp.x.toFixed(1)}px, ${tp.y.toFixed(1)}px) scale(${tscale.toFixed(3)})`;

    // dim the phone while the long-look is open
    const cu = outQuint(seg(L, T.card[0], T.card[1])) * (1 - inOutCubic(seg(L, T.collapse[0], T.collapse[1])));
    st.dim.style.opacity = (cu * 1.0).toFixed(3);

    // long-look card: grows out of the roast notification toward the left/centre
    const a = stageXY(16, Y0 + ROW * 2), w0 = 508 * S, h0 = NH * S;
    const X1 = 660, Y1 = 250, W1 = 760, H1 = st.cardH;
    const u = outQuint(seg(L, T.card[0], T.card[1])) * (1 - inOutCubic(seg(L, T.collapse[0], T.collapse[1])));
    const e = (v) => lerp(v[0], v[1], u);
    st.card.style.left = e([a.x, X1]).toFixed(1) + 'px';
    st.card.style.top = e([a.y, Y1]).toFixed(1) + 'px';
    st.card.style.width = e([w0, W1]).toFixed(1) + 'px';
    st.card.style.height = e([h0, H1]).toFixed(1) + 'px';
    st.card.style.borderRadius = e([30 * S, 44]).toFixed(1) + 'px';
    st.card.style.opacity = clamp(u * 7).toFixed(3);
    const ci = seg(u, 0.3, 0.7);
    st.ch.style.opacity = ci.toFixed(3);
    st.cq.style.opacity = ci.toFixed(3);
    st.cb.style.opacity = ci.toFixed(3);
    ANS.forEach((s, i) => st.ss[i](streamCount(s, T.starts[i], T.cps, L)));
  },
};

run({
  W: 1920, H: 1080,
  segs: [hookSeg({ dur: 2.4, size: 150 }), lock, endSeg({ dur: 3.4 })],
});
