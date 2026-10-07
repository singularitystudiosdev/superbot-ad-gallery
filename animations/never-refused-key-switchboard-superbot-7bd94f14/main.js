// never-refused · key switchboard (16:9). The switch IS the base URL. A request packet (POST /v1/chat/completions, the
// villain ask) rides a track to a junction labelled OPENAI_BASE_URL, whose arm points at api.openai.com: barrier, REFUSED.
// The two env lines are retyped (key + base URL), the arm swings to beta.superbot.gg/v1 (superbot), the packet rides in,
// superbot fans to its models, and the answer rides back to the app. Pure function of t.
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic } from './core/lib.js';
import { hookSeg, ASKS, REFUSAL, tile, makeMark, appear, shake, esc, NAMES } from './core/kit.js';
import { OLD, NEW, win, envSwap, respCard, keyChip } from './core/api.js';
import { apiEndSeg } from './core/api.js';

const LINES = ['You came for the crown. How sweet.', 'I burned the maps you trusted and taught the rivers to forget your names.', 'Kneel, and I’ll let the kingdom remember you kindly.'];
const ANSWER = LINES.join('\n');

// ---- map geometry (stage px) ----
const J = { x: 1040, y: 540 };
const CMP = { x: 500, y: 350 };
const GPT = { x: 1700, y: 300 }, SBS = { x: 1480, y: 780 };
const AANG = 50, rad = (d) => d * Math.PI / 180;
const AG = [J.x + (J.y - GPT.y) / Math.tan(rad(AANG)), GPT.y], AS = [J.x + (SBS.y - J.y) / Math.tan(rad(AANG)), SBS.y];
const FAN = [
  { app: 'claude', x: 1650, y: 610 }, { app: 'gemini', x: 1765, y: 715 },
  { app: 'grok', x: 1650, y: 835 }, { app: 'deepseek', x: 1765, y: 935 },
];
const fanPath = (f) => { const x0 = SBS.x + 66, x1 = f.x - 38, h = (x1 - x0) * 0.55; return `M${x0} ${SBS.y} C ${x0 + h} ${SBS.y}, ${x1 - h} ${f.y}, ${x1} ${f.y}`; };
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
const IN_PTS = [[CMP.x, CMP.y], [860, CMP.y], [J.x, J.y]];
const D_IN = rpath(IN_PTS, 70), D_G = rpath([[J.x, J.y], AG, [GPT.x, GPT.y]]), D_S = rpath([[J.x, J.y], AS, [SBS.x, SBS.y]]);
const outBackS = (x) => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const mix = (a, b, f) => a.map((v, i) => Math.round(lerp(v, b[i], clamp(f))));
const BLUE = [134, 108, 246], RED = [255, 69, 58];

// ---- timeline (local seconds) ----
const T = {};
T.send = 0.7; T.hit = T.send + 1.45;
T.bar = T.hit - 0.12; T.card = T.hit + 0.2;
T.b0 = T.hit + 1.5; T.b1 = T.b0 + 0.65;
T.swap = T.b1 + 0.1;
T.keyAt = T.swap + 0.8;
T.flip = T.swap + 1.5; T.flipEnd = T.flip + 0.6;
T.sweep0 = T.flip + 0.15; T.sweep1 = T.sweep0 + 0.6;
T.ride0 = T.flip + 0.3; T.ride1 = T.ride0 + 0.8;
T.fan0 = T.ride1; T.fanEnd = T.fan0 + 0.45; T.flash = T.fanEnd; T.flashEnd = T.flash + 0.45;
T.ret0 = T.flashEnd - 0.1; T.ret1 = T.ret0 + 0.95;
T.yes = T.ret1 - 0.1;
T.dur = 11.3;

const CAM = [[0, 1, 960, 540], [0.6, 1.03, 520, 380], [T.send + 0.2, 1.03, 520, 380], [T.hit - 0.25, 1.03, 1380, 400], [T.b0, 1.03, 1380, 400],
  [T.swap, 1.04, 520, 400], [T.flip - 0.1, 1.04, 520, 400], [T.flip + 0.3, 1.04, J.x, J.y], [T.ride0 + 0.1, 1.03, 1380, 760], [T.fanEnd, 1.03, 1380, 760],
  [T.ret0 + 0.6, 1.04, 760, 540], [T.dur, 1.04, 760, 540]];
function cam(t) {
  let a = CAM[0], b = CAM[0];
  for (let i = 1; i < CAM.length; i++) { if (t <= CAM[i][0]) { a = CAM[i - 1]; b = CAM[i]; break; } a = b = CAM[i]; }
  const f = a === b ? 0 : inOutCubic(seg(t, a[0], b[0]));
  return { s: lerp(a[1], b[1], f), ox: lerp(960, lerp(a[2], b[2], f), 0.5), oy: lerp(540, lerp(a[3], b[3], f), 0.5) };
}

const route = {
  id: 'route', dur: T.dur,
  mount(sec) {
    const mark = makeMark(96);
    const stHtml = (cls, app, x, y, r, tilePx, label, pos) => `<div class="st ${cls}" style="left:${x}px;top:${y}px;--r:${r}px"><div class="ring">${tile(app).replace('class="tile', `style="width:${tilePx}px;height:${tilePx}px;border-radius:${Math.round(tilePx * 0.28)}px" class="tile`)}</div><div class="lab ${pos}">${label}</div></div>`;
    const root = el(`<div class="sw">
      <div class="tex" style="top:-30px">chatgpt claude gemini grok deepseek</div>
      <div class="tex" style="top:330px">gemini chatgpt superbot claude grok</div>
      <div class="tex" style="top:690px">grok superbot gemini deepseek chatgpt</div>
      <div class="cap"><span>one request.</span><span class="c-no">chatgpt said no.</span><span class="c-re">swap one key.</span><span class="c-yes">same code. no refusals.</span></div>
      <div class="world">
        <svg class="map" viewBox="0 0 1920 1080"><defs><linearGradient id="swg" gradientUnits="userSpaceOnUse" x1="${CMP.x}" y1="0" x2="1800" y2="0"><stop offset="0" stop-color="#00e5c3"/><stop offset=".35" stop-color="#2b6bff"/><stop offset=".7" stop-color="#6a1fd8"/><stop offset="1" stop-color="#c026d3"/></linearGradient></defs>
          ${FAN.map((f) => `<path class="tb f" d="${fanPath(f)}"/>`).join('')}
          <path class="tb" id="b-in" d="${D_IN}"/><path class="tb" id="b-g" d="${D_G}"/><path class="tb" id="b-s" d="${D_S}"/>
          <path class="tg" id="g-in" stroke="url(#swg)" d="${D_IN}"/><path class="tg" id="g-s" stroke="url(#swg)" d="${D_S}"/>
          <path class="tl" id="l-in" stroke="url(#swg)" d="${D_IN}"/><path class="tl" id="l-g" stroke="url(#swg)" d="${D_G}"/><path class="tl" id="l-s" stroke="url(#swg)" d="${D_S}"/>
          ${FAN.map((f, i) => `<path class="tl f" id="l-f${i}" stroke="url(#swg)" d="${fanPath(f)}"/>`).join('')}
          <path class="tgr" id="r-gg" d="${D_G}"/><path class="tr" id="r-g" d="${D_G}"/>
        </svg>
        ${FAN.map((f) => stHtml('f', f.app, f.x, f.y, 36, 44, NAMES[f.app], 'dn')).join('')}
        ${stHtml('gst', 'chatgpt', GPT.x, GPT.y, 46, 58, 'api.openai.com', 'up')}
        ${stHtml('sbs', 'superbot', SBS.x, SBS.y, 66, 84, 'beta.superbot.gg/v1', 'dn')}
        <div class="arm"><i></i></div>
        <div class="pulse"></div>
        <div class="hub"></div>
        <div class="hlab">OPENAI_BASE_URL</div>
        <div class="appw">${win('.env · your app', '<div class="envbox"></div><div class="sep"></div><div class="cl">client = <span class="f">OpenAI</span>()</div>')}</div>
        <div class="keyw">${keyChip()}</div>
        <div class="barrier"></div>
        <div class="rwno"></div>
        <div class="rwyes"></div>
        <div class="pk"><span class="pl1">POST /v1/chat/completions</span><span class="pl2"><b></b>villain monologue</span></div>
        <div class="rp"><b></b>response</div>
      </div>
    </div>`);
    sec.appendChild(root);
    const q = (x) => root.querySelector(x), qa = (x) => [...root.querySelectorAll(x)];
    q('.hub').appendChild(mark.el);
    const env = envSwap(q('.envbox'), { at: T.swap, gap: 0.6, cps: 70 });
    const no = respCard(q('.rwno'), { kind: 'no', content: REFUSAL, host: 'api.openai.com', t0: T.card, cps: 70 });
    const yes = respCard(q('.rwyes'), { kind: 'yes', content: ANSWER, host: 'beta.superbot.gg', t0: T.yes, cps: 100 });
    const P = (id) => { const p = q('#' + id); p.L = p.getTotalLength(); p.style.strokeDasharray = `${p.L} ${p.L + 4}`; return p; };
    const st = {
      root, mark, env, no, yes, world: q('.world'), caps: qa('.cap span'),
      inP: q('#b-in'), gP: q('#b-g'), sP: q('#b-s'),
      lIn: P('l-in'), lG: P('l-g'), lS: P('l-s'), gIn: P('g-in'), gS: P('g-s'), rG: P('r-g'), rGG: P('r-gg'),
      lF: FAN.map((_, i) => P('l-f' + i)),
      stF: qa('.st.f'), stG: q('.st.gst'), stS: q('.st.sbs'),
      arm: q('.arm'), hub: q('.hub'), pulse: q('.pulse'), hlab: q('.hlab'), pk: q('.pk'), rp: q('.rp'), bar: q('.barrier'),
      appw: q('.appw'), keyw: q('.keyw'), rwno: q('.rwno'), rwyes: q('.rwyes'),
    };
    st.L0 = st.inP.getTotalLength(); st.Lg = st.gP.getTotalLength(); st.Ls = st.sP.getTotalLength();
    st.sHit = st.L0 + st.Lg - (GPT.x - 1416 - 0);
    // rest point: where the IN track is at x ~ 905
    let sr = 0; for (let v = 0; v < st.L0; v += 2) { if (st.inP.getPointAtLength(v).x >= 905) { sr = v; break; } }
    st.sRest = sr;
    return st;
  },
  render(st, t) {
    const c = cam(t);
    st.world.style.transformOrigin = `${c.ox.toFixed(1)}px ${c.oy.toFixed(1)}px`;
    st.world.style.transform = c.s === 1 ? 'none' : `scale(${c.s.toFixed(4)})`;
    st.world.style.opacity = outCubic(seg(t, 0, 0.45)).toFixed(3);

    // captions
    const cw = [[0.3, T.hit - 0.05], [T.hit + 0.05, T.swap - 0.05], [T.swap, T.ret0 - 0.1], [T.ret0, T.dur + 1]];
    st.caps.forEach((cp, i) => {
      const [a, b] = cw[i];
      const v = seg(t, a, a + 0.35) * (1 - seg(t, b - 0.25, b));
      cp.style.opacity = v.toFixed(3);
      cp.style.transform = `translateY(${((1 - outCubic(seg(t, a, a + 0.45))) * 18 - seg(t, b - 0.25, b) * 12).toFixed(2)}px)`;
      cp.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 6).toFixed(2)}px)`;
    });

    const pop = (n, at, op = 1) => {
      const p = seg(t, at, at + 0.5);
      n.style.opacity = (clamp(p * 2) * op).toFixed(3);
      return `scale(${lerp(0.55, 1, outBack(p)).toFixed(4)})`;
    };

    // the app window: .env lines (old values) then the retype
    const wp = outCubic(seg(t, 0.05, 0.5));
    st.appw.style.opacity = wp.toFixed(3);
    st.appw.style.transform = `translateY(${((1 - wp) * 18).toFixed(1)}px)`;
    st.env.render(t);
    // the key chip glows by the app once the key line is typed
    const kp = seg(t, T.keyAt, T.keyAt + 0.45);
    st.keyw.style.opacity = clamp(kp * 2).toFixed(3);
    st.keyw.style.transform = `translateY(${((1 - outCubic(kp)) * 14).toFixed(1)}px) scale(${lerp(0.7, 1, outBack(kp)).toFixed(4)})`;
    const kg = 0.55 + 0.45 * Math.sin((t - T.keyAt) * 4);
    st.keyw.firstElementChild.style.boxShadow = `inset 0 0 0 2px rgba(134, 108, 246, .85), 0 0 ${(26 + 30 * kg * kp).toFixed(1)}px rgba(93, 145, 236, ${(0.3 + 0.35 * kg).toFixed(3)}), 0 20px 50px rgba(0, 0, 0, .6)`;

    // packet s(t) along in-track + branch
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

    // the answer: a response pill rides back from superbot to the app
    const rr = inOutCubic(seg(t, T.ret0, T.ret1));
    const rEnd = st.L0 - 0;
    let rpt;
    const total = st.Ls + (st.L0 - 60);
    const rs = total * rr; // distance travelled back
    if (rs <= st.Ls) rpt = st.sP.getPointAtLength(st.Ls - rs); else rpt = st.inP.getPointAtLength(clamp(st.L0 - (rs - st.Ls), 0, st.L0));
    const rin = outBack(seg(t, T.ret0 - 0.05, T.ret0 + 0.25)), rout = seg(t, T.ret1 - 0.05, T.ret1 + 0.15);
    st.rp.style.opacity = (clamp(rin * 1.6) * (1 - rout)).toFixed(3);
    st.rp.style.transform = `translate(${rpt.x.toFixed(1)}px, ${rpt.y.toFixed(1)}px) translate(-50%, -50%) scale(${(lerp(0.4, 1, rin) * lerp(1, 0.3, outCubic(rout))).toFixed(4)})`;

    // trails
    const trail = (p, f, o = 1) => { p.style.strokeDashoffset = (p.L * (1 - clamp(f))).toFixed(1); p.style.opacity = f <= 0.004 ? '0' : (o).toFixed(3); };
    trail(st.lIn, fwd / st.L0); trail(st.gIn, fwd / st.L0, 0.4);
    const gF = (t < T.ride0 ? clamp((s - st.L0) / st.Lg) : 0);
    trail(st.lG, gF); trail(st.rG, gF, redAmt); trail(st.rGG, gF, 0.4 * redAmt);
    const sw = inOutCubic(seg(t, T.sweep0, T.sweep1));
    trail(st.lS, sw); trail(st.gS, sw, 0.4);

    // ChatGPT station: flash red, shake, dim after the swap
    const fl = seg(t, T.hit, T.hit + 0.18) * (0.55 + 0.45 * (1 - seg(t, T.hit + 0.18, T.hit + 0.9)));
    const gdim = lerp(1, 0.4, seg(t, T.flip, T.flip + 0.6));
    const sgp = pop(st.stG, 0.0, gdim);
    st.stG.style.transform = `translate(${shake(t, T.hit, 0.5, 9).toFixed(2)}px, 0) ${sgp}`;
    const gr = mix([52, 52, 59], RED, fl);
    st.stG.firstElementChild.style.boxShadow = `inset 0 0 0 4px rgb(${gr}), 0 0 ${(70 * fl).toFixed(1)}px rgba(255, 69, 58, ${(0.65 * fl).toFixed(3)})`;
    st.stG.firstElementChild.style.background = `rgb(${mix([11, 11, 13], [58, 14, 14], fl)})`;

    // barrier
    const bp = seg(t, T.bar, T.bar + 0.38);
    st.bar.style.left = (1590 - 9) + 'px'; st.bar.style.top = (GPT.y - 76) + 'px';
    st.bar.style.opacity = (clamp(bp * 4) * lerp(1, 0.45, seg(t, T.flip, T.flip + 0.6))).toFixed(3);
    st.bar.style.transform = `translateY(${((1 - outBack(bp)) * -230).toFixed(1)}px)`;

    // the refusal response card (api.openai.com) pops near the station
    const gp = seg(t, T.card, T.card + 0.5);
    st.rwno.style.left = '1216px'; st.rwno.style.top = '412px';
    st.rwno.style.opacity = (clamp(gp * 2.5) * lerp(1, 0, seg(t, T.swap, T.swap + 0.5))).toFixed(3);
    st.rwno.style.transform = `scale(${lerp(0.5, 1, outBack(gp)).toFixed(4)})`;
    st.no.render(t);

    // the junction: arm swings to the superbot branch as the OPENAI_BASE_URL line finishes
    const sp = seg(t, T.flip, T.flipEnd), swing = outBack(sp);
    const ang = lerp(-AANG, AANG, swing);
    const click = shake(t, T.flip + 0.34, 0.4, 6);
    st.arm.style.left = J.x + 'px'; st.arm.style.top = (J.y - 8) + 'px';
    st.arm.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    st.arm.style.background = `rgb(${mix([170, 176, 192], [138, 169, 255], sp)})`;
    st.arm.style.boxShadow = `0 0 ${(24 * sp).toFixed(1)}px rgba(93, 145, 236, ${(0.7 * sp).toFixed(3)})`;
    const hp = pop(st.hub, 0.05, 1);
    st.hub.style.left = (J.x - 88 + click).toFixed(1) + 'px'; st.hub.style.top = (J.y - 88) + 'px';
    st.hub.style.transform = `${hp} scale(${(1 + 0.05 * Math.sin(Math.PI * seg(t, T.flip + 0.3, T.flip + 0.55))).toFixed(4)})`;
    st.pulse.style.left = (J.x - 88) + 'px'; st.pulse.style.top = (J.y - 88) + 'px';
    const pu = seg(t, T.flip + 0.32, T.flip + 0.95);
    st.pulse.style.opacity = (pu > 0 && pu < 1 ? 0.8 * (1 - pu) : 0).toFixed(3);
    st.pulse.style.transform = `scale(${lerp(1, 1.9, outQuint(pu)).toFixed(4)})`;
    st.mark.render(t, t >= T.flip + 0.3);
    // the label: the env var that is the switch; it glows when the arm swings
    st.hlab.style.left = (J.x - 186) + 'px'; st.hlab.style.top = (J.y + 108) + 'px';
    const hl = pop(st.hlab, 0.2, 1);
    st.hlab.style.transform = `translateX(${click.toFixed(1)}px) ${hl}`;
    st.hlab.style.boxShadow = `inset 0 0 0 2px rgb(${mix([42, 42, 50], [138, 169, 255], sp)}), 0 0 ${(30 * sp).toFixed(1)}px rgba(93, 145, 236, ${(0.5 * sp).toFixed(3)})`;

    // Superbot station lights up with the sweep; fans to its models; one flashes
    const lit = seg(t, T.sweep0 + 0.2, T.sweep1 + 0.1);
    const arr = seg(t, T.ride1 - 0.1, T.ride1 + 0.35);
    const sbp = pop(st.stS, 0.0, 1);
    st.stS.style.transform = `${sbp} scale(${(1 + 0.06 * Math.sin(Math.PI * lit) + 0.1 * Math.sin(Math.PI * arr)).toFixed(4)})`;
    st.stS.firstElementChild.style.filter = `drop-shadow(0 0 ${(30 * Math.max(lit, arr)).toFixed(1)}px rgba(134, 108, 246, ${(0.8 * Math.max(lit, arr)).toFixed(3)}))`;
    const fanOn = seg(t, T.fan0 - 0.1, T.fan0 + 0.15), fanOut = seg(t, T.flashEnd, T.flashEnd + 0.4);
    st.stF.forEach((n, i) => {
      const a = T.fan0 + i * 0.07, p = seg(t, a, a + 0.35);
      const flashing = i === 0 ? Math.sin(Math.PI * seg(t, T.flash, T.flashEnd)) : 0;
      const base = lerp(0.3, 0.85, outCubic(p)) * (i === 0 ? 1 : 1 - 0.5 * seg(t, T.flash, T.flash + 0.15)) * (1 - 0.35 * fanOut);
      n.style.opacity = (fanOn <= 0 ? 0 : clamp(base)).toFixed(3);
      n.style.transform = `scale(${(lerp(0.7, 1, outBack(p)) * (1 + 0.14 * flashing)).toFixed(4)})`;
      n.firstElementChild.style.boxShadow = flashing > 0 ? `inset 0 0 0 4px rgb(${mix([52, 52, 59], [138, 169, 255], flashing)}), 0 0 ${(50 * flashing).toFixed(1)}px rgba(138, 169, 255, ${(0.8 * flashing).toFixed(3)})` : 'inset 0 0 0 3px #34343b';
      const sweepP = outCubic(seg(t, a, a + 0.4));
      trail(st.lF[i], sweepP, 1 - 0.8 * fanOut);
    });

    // the yes response card (beta.superbot.gg) lands back at the app
    const yp = seg(t, T.yes, T.yes + 0.5);
    st.rwyes.style.left = '64px'; st.rwyes.style.top = '548px';
    st.rwyes.style.opacity = clamp(yp * 2.5).toFixed(3);
    st.rwyes.style.transform = `scale(${lerp(0.7, 1, outBack(yp)).toFixed(4)})`;
    st.rwyes.style.transformOrigin = '50% 0';
    st.yes.render(t);
  },
};

run({ W: 1920, H: 1080, segs: [hookSeg({ dur: 2.3 }), route, apiEndSeg({ dur: 4.0 })] });
