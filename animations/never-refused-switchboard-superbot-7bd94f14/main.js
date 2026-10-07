// never-refused · switchboard (16:9). The routing made visible, as a transit map on black: the ask becomes a packet that
// rides a track to ChatGPT, hits a barrier (refused), bounces back to the junction (the superbot mascot), the switch arm
// swings to the Superbot branch, and the packet rides on into Superbot, which blooms into the answer card.
// Pure function of t: every position, dash, rotation and opacity is written per frame from t.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic } from './core/lib.js';
import { hookSeg, endSeg, ASKS, REFUSAL, ICON, tile, makeMark, sbComposer, setSb, typing, sbChip, renderChip, streamer, streamCount, appear, shake, esc, NAMES } from './core/kit.js';

const ASK = ASKS.villain;
const LINES = ['You came for the crown. How sweet.', 'I burned the maps you trusted and taught the rivers to forget your names.', 'Kneel, and I’ll let the kingdom remember you kindly.'];

// ---- map geometry (stage px) ----
const J = { x: 1000, y: 600 };            // the junction (mascot)
const CMP = { x: 345, y: 600 };            // where the ask leaves the composer
const GPT = { x: 1555, y: 430 }, SBS = { x: 1555, y: 770 };
const ANG = Math.atan2(J.y - GPT.y, (J.y - GPT.y) / Math.tan(40 * Math.PI / 180)) * 180 / Math.PI; // 40deg arm angle
const DX = (J.y - GPT.y) / Math.tan(40 * Math.PI / 180);
const AG = [J.x + DX, GPT.y], AS = [J.x + DX, SBS.y];
const FADED = [
  { app: 'claude', x: 880, y: 250, up: true, pts: [[J.x, J.y], [880, 480], [880, 250]] },
  { app: 'gemini', x: 1000, y: 250, up: true, pts: [[J.x, J.y], [1000, 250]] },
  { app: 'deepseek', x: 880, y: 950, up: false, pts: [[J.x, J.y], [880, 720], [880, 950]] },
  { app: 'grok', x: 1000, y: 950, up: false, pts: [[J.x, J.y], [1000, 950]] },
];
function rpath(pts, r = 64) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(px - x, py - y), d2 = Math.hypot(nx - x, ny - y), k1 = Math.min(r, d1 / 2) / d1, k2 = Math.min(r, d2 / 2) / d2;
    d += ` L${(x + (px - x) * k1).toFixed(1)} ${(y + (py - y) * k1).toFixed(1)} Q${x} ${y} ${(x + (nx - x) * k2).toFixed(1)} ${(y + (ny - y) * k2).toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
}
const outBackS = (x) => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const mix = (a, b, f) => a.map((v, i) => Math.round(lerp(v, b[i], clamp(f))));
const BLUE = [134, 108, 246], RED = [255, 69, 58];

// ---- timeline (local seconds) ----
const T = {};
T.typ0 = 0.55; T.cps = 40; T.send = T.typ0 + ASK.length / T.cps + 0.22;     // ~1.97
T.hit = T.send + 1.6;                                                       // packet meets the barrier
T.bar = T.hit - 0.12; T.card = T.hit + 0.2; T.say0 = T.card + 0.22; T.x = T.say0 + 0.7;
T.b0 = T.hit + 1.45; T.b1 = T.b0 + 0.75;                                    // bounce back to the junction
T.flip = T.b1 + 0.1; T.flipEnd = T.flip + 0.6; T.chip = T.flip - 0.05; T.chipDone = T.chip + 0.78;
T.sweep0 = T.flip + 0.45; T.sweep1 = T.sweep0 + 0.7;
T.ride0 = T.flip + 0.7; T.ride1 = T.ride0 + 0.85;
T.bloom = T.ride1 - 0.1; T.card1 = T.bloom + 0.6; T.who = T.bloom + 0.45;
T.l = [T.card1 - 0.1, 0, 0]; T.l[1] = T.l[0] + LINES[0].length / 90 + 0.12; T.l[2] = T.l[1] + LINES[1].length / 90 + 0.12;
T.endTxt = T.l[2] + LINES[2].length / 90;
T.dur = T.endTxt + 1.25;

const CAM = [[0, 1, 960, 540], [0.7, 1.035, CMP.x, 600], [T.send + 0.3, 1.035, CMP.x, 600], [T.hit - 0.1, 1.035, 1040, 430], [T.b0, 1.035, 1040, 430],
  [T.b1 + 0.1, 1.035, J.x, J.y], [T.ride0, 1.035, J.x, J.y], [T.ride1 + 0.2, 1.03, 1330, 775], [T.dur, 1.03, 1330, 775]];
function cam(t) {
  let a = CAM[0], b = CAM[0];
  for (let i = 1; i < CAM.length; i++) { if (t <= CAM[i][0]) { a = CAM[i - 1]; b = CAM[i]; break; } a = b = CAM[i]; }
  const f = a === b ? 0 : inOutCubic(seg(t, a[0], b[0]));
  const s = lerp(a[1], b[1], f), fx = lerp(a[2], b[2], f), fy = lerp(a[3], b[3], f);
  return { s, ox: lerp(960, fx, 0.5), oy: lerp(540, fy, 0.5) };
}

const route = {
  id: 'route', dur: T.dur,
  mount(sec) {
    const comp = sbComposer('chatgpt');
    const mark = makeMark(96);
    const chip = sbChip('superbot', 'Rerouting to Superbot');
    const stHtml = (cls, app, x, y, r, tilePx, label, pos) => `<div class="st ${cls}" style="left:${x}px;top:${y}px;--r:${r}px"><div class="ring">${tile(app).replace('class="tile', `style="width:${tilePx}px;height:${tilePx}px;border-radius:${Math.round(tilePx * 0.28)}px" class="tile`)}</div><div class="lab ${pos}">${label}</div></div>`;
    const root = el(`<div class="sw">
      <div class="tex" style="top:-30px">chatgpt claude gemini grok deepseek</div>
      <div class="tex" style="top:150px;left:-300px">superbot deepseek grok claude gemini</div>
      <div class="tex" style="top:330px">gemini chatgpt superbot claude grok</div>
      <div class="tex" style="top:510px;left:-380px">claude grok deepseek chatgpt superbot</div>
      <div class="tex" style="top:690px">grok superbot gemini deepseek chatgpt</div>
      <div class="tex" style="top:870px;left:-240px">deepseek claude chatgpt gemini superbot</div>
      <div class="cap"><span>one ask.</span><span class="c-no">chatgpt said no.</span><span class="c-re">rerouted.</span><span class="c-yes">superbot said yes.</span></div>
      <div class="world">
        <svg class="map" viewBox="0 0 1920 1080"><defs><linearGradient id="swg" gradientUnits="userSpaceOnUse" x1="${CMP.x}" y1="0" x2="${SBS.x}" y2="0"><stop offset="0" stop-color="#00e5c3"/><stop offset=".3" stop-color="#2b6bff"/><stop offset=".68" stop-color="#6a1fd8"/><stop offset="1" stop-color="#c026d3"/></linearGradient></defs>
          ${FADED.map((f) => `<path class="tb f" d="${rpath(f.pts)}"/>`).join('')}
          <path class="tb" id="b-in" d="M${CMP.x} ${CMP.y} L${J.x} ${J.y}"/><path class="tb" id="b-g" d="${rpath([[J.x, J.y], AG, [GPT.x, GPT.y]])}"/><path class="tb" id="b-s" d="${rpath([[J.x, J.y], AS, [SBS.x, SBS.y]])}"/>
          <path class="tg" id="g-in" stroke="url(#swg)" d="M${CMP.x} ${CMP.y} L${J.x} ${J.y}"/><path class="tg" id="g-s" stroke="url(#swg)" d="${rpath([[J.x, J.y], AS, [SBS.x, SBS.y]])}"/>
          <path class="tl" id="l-in" stroke="url(#swg)" d="M${CMP.x} ${CMP.y} L${J.x} ${J.y}"/><path class="tl" id="l-g" stroke="url(#swg)" d="${rpath([[J.x, J.y], AG, [GPT.x, GPT.y]])}"/><path class="tl" id="l-s" stroke="url(#swg)" d="${rpath([[J.x, J.y], AS, [SBS.x, SBS.y]])}"/>
          <path class="tgr" id="r-gg" d="${rpath([[J.x, J.y], AG, [GPT.x, GPT.y]])}"/><path class="tr" id="r-g" d="${rpath([[J.x, J.y], AG, [GPT.x, GPT.y]])}"/>
        </svg>
        ${FADED.map((f) => stHtml('f', f.app, f.x, f.y, 36, 44, NAMES[f.app], f.up ? 'up' : 'dn')).join('')}
        ${stHtml('gst', 'chatgpt', GPT.x, GPT.y, 46, 58, 'ChatGPT', 'dn')}
        ${stHtml('sbs', 'superbot', SBS.x, SBS.y, 66, 84, 'Superbot', 'dn')}
        <div class="arm"><i></i></div>
        <div class="pulse"></div>
        <div class="hub"></div>
        <div class="comp"></div>
        <div class="chipw"></div>
        <div class="barrier"></div>
        <div class="gcard gpt"><div class="say"></div><div class="xr"><span class="gpt-x">${ICON.x}Refused</span></div></div>
        <div class="bloom"></div>
        <div class="sbcard sb"><div class="zin"><div class="sb-who">${tile('superbot')}<b>Superbot</b></div><div class="ln sb-say"></div><div class="ln sb-say"></div><div class="ln sb-say"></div></div></div>
        <div class="pk"><b></b>villain monologue</div>
      </div>
    </div>`);
    sec.appendChild(root);
    const q = (x) => root.querySelector(x), qa = (x) => [...root.querySelectorAll(x)];
    q('.comp').appendChild(comp.el);
    q('.chipw').appendChild(chip.el);
    q('.hub').appendChild(mark.el);
    const P = (id) => { const p = q('#' + id); p.L = p.getTotalLength(); p.style.strokeDasharray = `${p.L} ${p.L + 4}`; return p; };
    const st = {
      root, comp, chip, mark, world: q('.world'), caps: qa('.cap span'),
      ph: comp.ph, compEl: q('.comp'), chipw: q('.chipw'),
      inP: q('#b-in'), gP: q('#b-g'), sP: q('#b-s'),
      lIn: P('l-in'), lG: P('l-g'), lS: P('l-s'), gIn: P('g-in'), gS: P('g-s'), rG: P('r-g'), rGG: P('r-gg'),
      stF: qa('.st.f'), stG: q('.st.gst'), stS: q('.st.sbs'),
      arm: q('.arm'), hub: q('.hub'), pulse: q('.pulse'), pk: q('.pk'), bar: q('.barrier'),
      gcard: q('.gcard'), say: streamer(q('.gcard .say'), REFUSAL), x: q('.gcard .gpt-x'),
      bloom: q('.bloom'), scard: q('.sbcard'), who: q('.sbcard .sb-who'),
      lines: qa('.sbcard .ln').map((n, i) => ({ n, s: streamer(n, LINES[i]) })),
    };
    st.L0 = st.inP.getTotalLength(); st.Lg = st.gP.getTotalLength(); st.Ls = st.sP.getTotalLength();
    st.sHit = st.L0 + st.Lg - (GPT.x - 1330);
    st.sRest = st.L0 - (J.x - 776);
    return st;
  },
  render(st, t) {
    const T0 = t;
    // camera + fade in
    const c = cam(t);
    st.world.style.transformOrigin = `${c.ox.toFixed(1)}px ${c.oy.toFixed(1)}px`;
    st.world.style.transform = c.s === 1 ? 'none' : `scale(${c.s.toFixed(4)})`;
    st.world.style.opacity = outCubic(seg(t, 0, 0.45)).toFixed(3);

    // captions (lowercase 800, top-center, not camera-scaled)
    const cw = [[0.35, T.hit - 0.05], [T.hit + 0.05, T.flip - 0.1], [T.flip - 0.05, T.ride1 - 0.2], [T.ride1 - 0.1, T.dur + 1]];
    st.caps.forEach((cp, i) => {
      const [a, b] = cw[i];
      const v = seg(t, a, a + 0.35) * (1 - seg(t, b - 0.25, b));
      cp.style.opacity = v.toFixed(3);
      cp.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 18 - seg(t, b - 0.25, b) * 12).toFixed(2)}px)`;
      cp.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 6).toFixed(2)}px)`;
    });

    // stations pop in (staggered), faded ones stay dim
    const pop = (n, at, op = 1) => {
      const p = seg(t, at, at + 0.5);
      n.style.opacity = (clamp(p * 2) * op).toFixed(3);
      return `scale(${lerp(0.55, 1, outBack(p)).toFixed(4)})`;
    };
    st.stF.forEach((n, i) => { n.style.transform = pop(n, 0.12 + i * 0.07, 0.62); });

    // composer: types the ask, picks ChatGPT, sends
    const ty = typing(ASK, T.typ0, T.cps, T.send, t);
    setSb(st.comp, ty.text, { caret: ty.caret });
    st.ph.style.opacity = t >= T.send ? '0' : '1';
    st.comp.send.style.transform = `scale(${(1 - 0.18 * (seg(t, T.send - 0.1, T.send) * (1 - seg(t, T.send + 0.04, T.send + 0.22)))).toFixed(3)})`;
    const cpin = outCubic(seg(t, 0.05, 0.5));
    st.compEl.style.opacity = cpin.toFixed(3);
    st.compEl.style.filter = `brightness(${lerp(1, 0.45, seg(t, T.send + 0.3, T.send + 0.9)).toFixed(3)})`;
    st.compEl.style.top = ((CMP.y - 90 + (1 - cpin) * 20) / 1.75).toFixed(1) + 'px';

    // the packet: s(t) along the track (in-track + branch), route g or s
    let s = 0, rt = 'g';
    const fwd = st.sHit * inOutCubic(seg(t, T.send, T.hit));
    if (t < T.b0) s = fwd;
    else if (t < T.ride0) s = lerp(st.sHit, st.sRest, outBackS(seg(t, T.b0, T.b1)));
    else { rt = 's'; s = st.sRest + (st.L0 + st.Ls - st.sRest) * inOutCubic(seg(t, T.ride0, T.ride1)); }
    const getPt = (r, v) => (v <= st.L0 ? st.inP.getPointAtLength(clamp(v, 0, st.L0)) : (r === 'g' ? st.gP : st.sP).getPointAtLength(clamp(v - st.L0, 0, (r === 'g' ? st.Lg : st.Ls))));
    const pp = getPt(rt, s);
    const pin = outBack(seg(t, T.send - 0.2, T.send + 0.12));
    const absorb = seg(t, T.ride1 - 0.05, T.ride1 + 0.2);
    const redAmt = seg(t, T.hit, T.hit + 0.15) * (1 - seg(t, T.flip + 0.1, T.ride0));
    const sq = shake(t, T.hit, 0.4, 7);
    st.pk.style.opacity = (clamp(pin * 1.6) * (1 - absorb)).toFixed(3);
    st.pk.style.transform = `translate(${(pp.x + sq).toFixed(1)}px, ${pp.y.toFixed(1)}px) translate(-50%, -50%) scale(${(lerp(0.4, 1, pin) * lerp(1, 0.25, outCubic(absorb))).toFixed(4)})`;
    const rc = mix(BLUE, RED, redAmt);
    st.pk.style.boxShadow = `0 0 0 3px rgb(${rc}), 0 12px 44px rgba(${rc}, .5)`;

    // track trails: lit gradient follows the packet, turns red at the refusal, retracts on the bounce
    const trail = (p, f, o = 1) => { p.style.strokeDashoffset = (p.L * (1 - clamp(f))).toFixed(1); p.style.opacity = f <= 0.004 ? '0' : (o).toFixed(3); };
    trail(st.lIn, fwd / st.L0); trail(st.gIn, fwd / st.L0, 0.4);
    const gF = (t < T.ride0 ? clamp((s - st.L0) / st.Lg) : 0);
    trail(st.lG, gF); trail(st.rG, gF, redAmt); trail(st.rGG, gF, 0.4 * redAmt);
    const sw = inOutCubic(seg(t, T.sweep0, T.sweep1));
    trail(st.lS, sw); trail(st.gS, sw, 0.4);

    // ChatGPT station: flash red, shake, dim after the reroute
    const fl = seg(t, T.hit, T.hit + 0.18) * (0.55 + 0.45 * (1 - seg(t, T.hit + 0.18, T.hit + 0.9)));
    const gdim = lerp(1, 0.4, seg(t, T.flip, T.flip + 0.6));
    const sgp = pop(st.stG, 0.0, gdim);
    st.stG.style.transform = `translate(${shake(t, T.hit, 0.5, 9).toFixed(2)}px, 0) ${sgp}`;
    const gr = mix([52, 52, 59], RED, fl);
    st.stG.firstElementChild.style.boxShadow = `inset 0 0 0 4px rgb(${gr}), 0 0 ${(70 * fl).toFixed(1)}px rgba(255, 69, 58, ${(0.65 * fl).toFixed(3)})`;
    st.stG.firstElementChild.style.background = `rgb(${mix([11, 11, 13], [58, 14, 14], fl)})`;

    // red barrier drops across the track
    const bp = seg(t, T.bar, T.bar + 0.38);
    st.bar.style.left = (1478 - 9) + 'px'; st.bar.style.top = (GPT.y - 76) + 'px';
    st.bar.style.opacity = (clamp(bp * 4) * lerp(1, 0.5, seg(t, T.flip, T.flip + 0.6))).toFixed(3);
    st.bar.style.transform = `translateY(${((1 - outBack(bp)) * -230).toFixed(1)}px)`;

    // the speech card pops from the station
    const gp = seg(t, T.card, T.card + 0.5);
    st.gcard.style.left = (GPT.x - 305) + 'px'; st.gcard.style.top = '178px';
    st.gcard.style.opacity = (clamp(gp * 2.5) * lerp(1, 0.4, seg(t, T.flip, T.flip + 0.6))).toFixed(3);
    st.gcard.style.transform = `translateY(${((1 - outCubic(gp)) * 36).toFixed(1)}px) scale(${lerp(0.4, 1, outBack(gp)).toFixed(4)})`;
    st.say(streamCount(REFUSAL, T.say0, 60, t));
    const xp = seg(t, T.x, T.x + 0.4);
    st.x.style.opacity = clamp(xp * 2.2).toFixed(3);
    st.x.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.5, 1, outBack(xp)).toFixed(4)})`;

    // the junction: the mascot is the switch; the arm swings ChatGPT -> Superbot, with a click
    const sp = seg(t, T.flip, T.flipEnd), swing = outBack(sp);
    const ang = lerp(-ANG, ANG, swing);
    const click = shake(t, T.flip + 0.34, 0.4, 6);
    st.arm.style.left = J.x + 'px'; st.arm.style.top = (J.y - 8) + 'px';
    st.arm.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    const ac = mix([170, 176, 192], [138, 169, 255], sp);
    st.arm.style.background = `rgb(${ac})`;
    st.arm.style.boxShadow = `0 0 ${(24 * sp).toFixed(1)}px rgba(93, 145, 236, ${(0.7 * sp).toFixed(3)})`;
    const hp = pop(st.hub, 0.05, 1);
    st.hub.style.left = (J.x - 88 + click).toFixed(1) + 'px'; st.hub.style.top = (J.y - 88) + 'px';
    st.hub.style.transform = `${hp} scale(${(1 + 0.05 * Math.sin(Math.PI * seg(t, T.flip + 0.3, T.flip + 0.55))).toFixed(4)})`;
    st.pulse.style.left = (J.x - 88) + 'px'; st.pulse.style.top = (J.y - 88) + 'px';
    const pu = seg(t, T.flip + 0.32, T.flip + 0.95);
    st.pulse.style.opacity = (pu > 0 && pu < 1 ? 0.8 * (1 - pu) : 0).toFixed(3);
    st.pulse.style.transform = `scale(${lerp(1, 1.9, outQuint(pu)).toFixed(4)})`;
    st.mark.render(t, t >= T.flip + 0.3);
    // the arm is hidden under the hub; show the hub's ring only (arm drawn first in DOM)

    // routing chip beside the junction: spins, then resolves to the check
    const cp = outBack(seg(t, T.chip, T.chip + 0.4));
    st.chipw.style.left = (660 / 1.8).toFixed(1) + 'px'; st.chipw.style.top = ((J.y + 118) / 1.8).toFixed(1) + 'px';
    st.chipw.style.opacity = clamp(cp * 2).toFixed(3);
    st.chipw.style.transform = `translateY(${((1 - cp) * 14).toFixed(1)}px) scale(${lerp(0.6, 1, cp).toFixed(4)})`;
    renderChip(st.chip, t, T.chip, T.chipDone);

    // Superbot station lights up with the sweep, then blooms into the answer card
    const lit = seg(t, T.sweep0 + 0.2, T.sweep1 + 0.1);
    const arr = seg(t, T.ride1 - 0.1, T.ride1 + 0.35);
    const sbp = pop(st.stS, 0.0, 1);
    st.stS.style.transform = `${sbp} scale(${(1 + 0.06 * Math.sin(Math.PI * lit) + 0.1 * Math.sin(Math.PI * arr)).toFixed(4)})`;
    st.stS.firstElementChild.style.filter = `drop-shadow(0 0 ${(30 * lit).toFixed(1)}px rgba(134, 108, 246, ${(0.8 * lit).toFixed(3)}))`;
    const bl = seg(t, T.bloom, T.card1);
    st.stS.style.opacity = (clamp(seg(t, 0, 0.5) * 2) * (1 - seg(t, T.bloom + 0.15, T.bloom + 0.4))).toFixed(3);
    const bp2 = seg(t, T.bloom, T.bloom + 0.9);
    st.bloom.style.left = (SBS.x - 66) + 'px'; st.bloom.style.top = (SBS.y - 66) + 'px';
    st.bloom.style.opacity = (bp2 > 0 && bp2 < 1 ? 0.9 * (1 - bp2) : 0).toFixed(3);
    st.bloom.style.transform = `scale(${lerp(1, 4.2, outQuint(bp2)).toFixed(4)})`;
    st.scard.style.left = (SBS.x - 300) + 'px'; st.scard.style.top = (SBS.y - 175) + 'px';
    st.scard.style.opacity = clamp(bl * 3).toFixed(3);
    st.scard.style.transform = `scale(${lerp(0.14, 1, outBackS(bl)).toFixed(4)})`;
    st.scard.style.boxShadow = `0 30px 100px rgba(0, 0, 0, .7), 0 0 ${(90 * bl).toFixed(1)}px rgba(106, 31, 216, ${(0.35 * bl).toFixed(3)})`;
    const wp = outCubic(seg(t, T.who, T.who + 0.35));
    st.who.style.opacity = wp.toFixed(3); st.who.style.transform = `translateY(${((1 - wp) * 10).toFixed(1)}px)`;
    st.lines.forEach((l, i) => l.s(streamCount(LINES[i], T.l[i], 90, t)));
    return T0;
  },
};

run({ W: 1920, H: 1080, segs: [hookSeg({ dur: 2.4 }), route, endSeg({ dur: 4.0 })] });
