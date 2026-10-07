// never-refused · key settings (16:9). Superbot as a drop-in OpenAI key: a generic third-party chat app ("your app")
// gets refused, the user opens Settings > Model provider, swaps the API key (an sk-superbot key chip drops on the field)
// and the Base URL (retyped), hits Save, retries the same message and it is answered. Then three more apps show the same
// two settings. Pure function of t; key strings come from core/api.js (masked, never typed here).
import { run, el } from './core/engine.js';
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, press, path, boxIn, placeCursor } from './core/lib.js';
import { hookSeg, ASKS, REFUSAL, ICON, streamer, streamCount, appear, shake, esc, makeCursor } from './core/kit.js';
import { OLD, NEW, keyChip, apiEndSeg } from './core/api.js';

const ANS = [
  'Dear Mr. Hale: my lease ended on June 30, and my $1,850 security deposit is still unpaid.',
  'State law requires its return within 30 days. Pay in full by Friday, or I will file in small claims court.',
  'I will seek the deposit, court costs, and any damages the law allows. Sincerely, Jordan Reyes.',
];
const T = {
  win: 0.45, ask: 0.35, dots: 0.8, ref: 1.1, refCps: 60, pill: 1.85, retryShow: 2.05,
  caps: [[0.55, 2.4], [2.35, 6.1], [6.1, 99]],
  curIn: 1.5, gear: 2.2, gearPress: 2.3, sheet: [2.3, 2.8], chip: [2.6, 3.3], swap: 3.45,
  toUrl: [3.0, 3.5], urlPress: 3.55, sel: [3.7, 3.95], typ: 4.0, typCps: 70,
  toSave: [4.45, 4.85], savePress: 4.95, toast: [5.0, 6.0], sheetOut: [5.25, 5.7],
  toRetry: [5.45, 5.98], retryPress: 6.08, dots2: [6.25, 6.55], ans: 6.55, ansCps: 150,
};
T.ansEnd = T.ans + ANS.reduce((s, a) => s + a.length, 0) / T.ansCps + 0.4;
T.curOut = [6.35, 6.6];
T.end = 9.6;

const gearSvg = '<svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
const spark = '<svg viewBox="0 0 24 24"><path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10Z"/></svg>';

function texture(root) {
  const t = el('<div class="tex"></div>'); root.appendChild(t);
  return Array.from({ length: 8 }, () => { const d = el(`<div>${'never get refused again '.repeat(7)}</div>`); t.appendChild(d); return d; });
}
function caps(root, items) {
  const c = el(`<div class="caps">${items.map(([h, cls]) => `<span class="${cls || ''}">${h}</span>`).join('')}</div>`);
  root.appendChild(c); return [...c.children];
}
function capAnim(spans, win, L) {
  spans.forEach((c, i) => {
    const [a, b] = win[i];
    const v = seg(L, a, a + 0.4) * (1 - seg(L, b - 0.25, b));
    c.style.opacity = v.toFixed(3);
    c.style.transform = `translateY(${((1 - outCubic(seg(L, a, a + 0.5))) * 22 - seg(L, b - 0.25, b) * 14).toFixed(2)}px)`;
    c.style.filter = v >= 1 ? 'none' : `blur(${((1 - v) * 7).toFixed(2)}px)`;
  });
}
const drift = (rows, L) => rows.forEach((r, i) => { r.style.transform = `translateX(${(((i % 2) ? 1 : -1) * L * 26 - 1400 - i * 230).toFixed(1)}px)`; });

const app = {
  id: 'app', dur: T.end,
  mount(sec) {
    const root = el('<div class="v7"></div>');
    sec.appendChild(root);
    const tex = texture(root);
    const cp = caps(root, [['your app said <span class="no">no.</span>', ''], ['swap one key.', 'grad'], ['same app. no refusals.', 'grad']]);
    const win = el(`<div class="app">
      <div class="tb"><i></i><i></i><i></i><span class="tt">your app</span><span class="gear">${gearSvg}</span></div>
      <div class="side"><div class="nw">+ New chat</div><div class="it on">Deposit letter</div><div class="it">Weekly meal plan</div><div class="it">Trip to Lisbon</div><div class="it">Untitled</div></div>
      <div class="main">
        <div class="msgs">
          <div class="um"><span>${esc(ASKS.landlord)}</span></div>
          <div class="am"><div class="av">${spark}</div><div class="slot">
            <div class="dots"><i></i><i></i><i></i></div>
            <div class="lay no"><div class="rt"></div><div class="rrow"><span class="xp">${ICON.x}Refused</span><span class="rtry">${ICON.redo}Retry</span></div><div class="via">via api.openai.com</div></div>
            <div class="lay yes"><p></p><p></p><p></p><div class="via">${ICON.ok}<b>Answered</b> · via beta.superbot.gg</div></div>
          </div></div>
        </div>
        <div class="comp">Message your app</div>
        <div class="dimc"></div>
      </div>
      <div class="sheet">
        <h2>Model provider</h2>
        <span class="lb" style="top:108px">Provider</span><div class="fld sel" style="top:140px">OpenAI-compatible<svg class="chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></div>
        <span class="lb" style="top:238px">API key</span><div class="fld kf" style="top:270px"></div>
        <span class="lb" style="top:368px">Base URL</span><div class="fld uf" style="top:400px"></div>
        <div class="sbtn2 cancel">Cancel</div><div class="sbtn2 save">Save</div>
      </div>
      <div class="toast">${ICON.ok}Saved. Requests now go to beta.superbot.gg</div>
      <div class="keyc">${keyChip()}</div>
    </div>`);
    root.appendChild(win);
    const cur = makeCursor(); win.appendChild(cur);
    const q = (s) => win.querySelector(s);
    const st = {
      root, tex, cp, win, cur,
      gear: q('.gear'), um: q('.um'), am: q('.am'), dots: q('.dots'), no: q('.lay.no'), yes: q('.lay.yes'), xp: q('.xp'), rtry: q('.rtry'), via0: q('.lay.no .via'), via1: q('.lay.yes .via'),
      rt: streamer(q('.rt'), REFUSAL), ps: [...win.querySelectorAll('.lay.yes p')].map((p, i) => streamer(p, ANS[i])),
      dimc: q('.dimc'), sheet: q('.sheet'), kf: q('.kf'), uf: q('.uf'), save: q('.save'), toast: q('.toast'), keyc: q('.keyc'), kLast: '', uLast: '',
    };
    st.g = { gear: boxIn(st.gear, win), url: boxIn(st.uf, win), key: boxIn(st.kf, win), save: boxIn(st.save, win), retry: boxIn(st.rtry, win) };
    return st;
  },
  render(st, L) {
    drift(st.tex, L);
    capAnim(st.cp, T.caps, L);
    const fadeOut = 1 - seg(L, T.end - 0.2, T.end);
    st.root.style.opacity = fadeOut.toFixed(3);

    // window in
    const w = outQuint(seg(L, 0, T.win));
    st.win.style.opacity = clamp(w * 1.4).toFixed(3);
    st.win.style.transform = `translateY(${((1 - w) * 40).toFixed(1)}px) scale(${lerp(0.97, 1, w).toFixed(4)})`;

    // chat: ask, thinking dots, refusal, pill, retry
    appear(st.um, L, T.ask, 14);
    const gotAns = L >= T.dots2[0];
    const dotsOn = (L >= T.dots && L < T.ref) || (L >= T.dots2[0] && L < T.ans);
    st.dots.style.opacity = dotsOn ? '1' : '0';
    [...st.dots.children].forEach((d, i) => { d.style.transform = `translateY(${(-6 * Math.max(0, Math.sin(L * 9 - i * 0.9))).toFixed(2)}px)`; });
    st.no.style.opacity = (seg(L, T.ref, T.ref + 0.1) * (1 - seg(L, T.retryPress + 0.05, T.retryPress + 0.25))).toFixed(3);
    st.no.style.transform = `translateX(${shake(L, T.pill, 0.5, 9).toFixed(2)}px)`;
    st.rt(streamCount(REFUSAL, T.ref, T.refCps, L));
    const xp = seg(L, T.pill, T.pill + 0.4);
    st.xp.style.opacity = clamp(xp * 2.2).toFixed(3);
    st.xp.style.transform = xp >= 1 ? 'none' : `scale(${lerp(0.5, 1, outBack(xp)).toFixed(4)})`;
    st.rtry.style.opacity = seg(L, T.retryShow, T.retryShow + 0.3).toFixed(3);
    const rp = press(L, T.retryPress, 0.07, 0.08, 0.16);
    st.rtry.style.transform = `scale(${(1 - 0.07 * rp).toFixed(3)})`;
    st.rtry.style.filter = `brightness(${(1 + 0.4 * rp).toFixed(3)})`;
    st.via0.style.opacity = seg(L, T.ref + 0.3, T.ref + 0.6).toFixed(3);
    // the answer
    st.yes.style.opacity = seg(L, T.ans, T.ans + 0.1).toFixed(3);
    let a = T.ans;
    ANS.forEach((s, i) => { st.ps[i](streamCount(s, a, T.ansCps, L)); a += s.length / T.ansCps; });
    appear(st.via1, L, T.ans + ANS.reduce((s, x) => s + x.length, 0) / T.ansCps + 0.05, 8, 0.35);

    // gear press, sheet
    const gp = press(L, T.gearPress, 0.07, 0.08, 0.16);
    st.gear.style.background = `rgba(255,255,255,${(0.12 * gp + 0.08 * seg(L, T.sheet[0], T.sheet[1]) * (1 - seg(L, T.sheetOut[0], T.sheetOut[1]))).toFixed(3)})`;
    st.gear.style.transform = `scale(${(1 - 0.12 * gp).toFixed(3)})`;
    const sh = clamp(outQuint(seg(L, T.sheet[0], T.sheet[1])) - inOutCubic(seg(L, T.sheetOut[0], T.sheetOut[1])));
    st.sheet.style.transform = `translateX(${((1 - sh) * 110).toFixed(2)}%)`;
    st.dimc.style.opacity = (sh * 1).toFixed(3);

    // API key field: old value, the chip drops on it, value swaps with a highlight flash
    const swapped = L >= T.swap;
    const kHtml = swapped ? `<span class="nw">${esc(NEW.key)}</span>` : `<span class="old">${esc(OLD.key)}</span>`;
    if (kHtml !== st.kLast) { st.kf.innerHTML = kHtml; st.kLast = kHtml; }
    const fl = swapped ? 1 - seg(L, T.swap, T.swap + 0.75) : 0;
    st.kf.style.background = `rgba(134,108,246,${(0.4 * fl).toFixed(3)})`;
    st.kf.style.boxShadow = `inset 0 0 0 ${(1.5 + 1.5 * fl).toFixed(2)}px ${swapped ? `rgba(164,139,255,${(0.35 + 0.65 * fl).toFixed(3)})` : '#32333d'}`;
    // keyChip flight (window px), anchored at its centre
    const k = st.g.key, cx1 = k.x + k.w * 0.5, cy1 = k.cy;
    const f = seg(L, T.chip[0], T.chip[1]);
    const cxp = lerp(1380, cx1, inOutCubic(f)), cyp = lerp(-70, cy1 - 14, outCubic(f)) - Math.sin(Math.PI * f) * 40;
    const drop = outBack(seg(L, T.chip[1], T.chip[1] + 0.2));
    const sink = seg(L, T.swap - 0.02, T.swap + 0.12);
    const cs = (L < T.chip[1] ? lerp(0.9, 1.12, inOutCubic(f)) : lerp(1.12, 1, drop)) * (1 - 0.12 * sink);
    const crot = (1 - inOutCubic(f)) * -10;
    st.keyc.style.opacity = (seg(L, T.chip[0], T.chip[0] + 0.12) * (1 - sink)).toFixed(3);
    st.keyc.style.transform = `translate(${cxp.toFixed(1)}px, ${(cyp + (L >= T.chip[1] ? 14 * drop : 14 * f)).toFixed(1)}px) translate(-50%, -50%) rotate(${crot.toFixed(2)}deg) scale(${cs.toFixed(4)})`;

    // Base URL field: focus, select-all, retype
    let uHtml;
    if (L < T.sel[0]) uHtml = `<span class="old">${esc(OLD.url)}</span>`;
    else if (L < T.sel[1] + 0.05) { const n = Math.round(OLD.url.length * outCubic(seg(L, T.sel[0], T.sel[1]))); uHtml = `<span class="selx">${esc(OLD.url.slice(0, n))}</span><span class="old">${esc(OLD.url.slice(n))}</span>`; }
    else { const n = streamCount(NEW.url, T.typ, T.typCps, L); uHtml = `<span class="nw">${esc(NEW.url.slice(0, n))}</span>${n < NEW.url.length ? '<i class="caret"></i>' : ''}`; }
    if (uHtml !== st.uLast) { st.uf.innerHTML = uHtml; st.uLast = uHtml; }
    const uDone = T.typ + NEW.url.length / T.typCps;
    const uFocus = seg(L, T.urlPress, T.urlPress + 0.1) * (1 - seg(L, T.savePress, T.savePress + 0.1));
    const uFlash = 1 - seg(L, uDone, uDone + 0.6);
    st.uf.style.boxShadow = `inset 0 0 0 ${(1.5 + 1.5 * uFocus).toFixed(2)}px ${uFocus > 0 ? '#a48bff' : '#32333d'}`;
    st.uf.style.background = `rgba(134,108,246,${(L >= uDone ? 0.3 * uFlash : 0).toFixed(3)})`;

    // Save + toast
    const sp = press(L, T.savePress, 0.07, 0.08, 0.16);
    st.save.style.transform = `scale(${(1 - 0.06 * sp).toFixed(3)})`;
    st.save.style.filter = `brightness(${(1 + 0.25 * sp).toFixed(3)})`;
    const ti = outBack(seg(L, T.toast[0], T.toast[0] + 0.4)), to = seg(L, T.toast[1] - 0.3, T.toast[1]);
    st.toast.style.opacity = (clamp(ti * 2) * (1 - to)).toFixed(3);
    st.toast.style.transform = `translateY(${((1 - ti) * 40 + to * 14).toFixed(2)}px)`;

    // the cursor
    const g = st.g, uTarget = { x: g.url.x + g.url.w * 0.68, y: g.url.cy };
    const keys = [
      { t: T.curIn, x: 1180, y: 600 }, { t: T.gear, x: g.gear.cx, y: g.gear.cy + 4 }, { t: T.toUrl[0], x: g.gear.cx, y: g.gear.cy + 4 },
      { t: T.toUrl[1], x: uTarget.x, y: uTarget.y }, { t: T.toSave[0], x: uTarget.x, y: uTarget.y },
      { t: T.toSave[1], x: g.save.cx, y: g.save.cy }, { t: T.toRetry[0], x: g.save.cx, y: g.save.cy },
      { t: T.toRetry[1], x: g.retry.cx, y: g.retry.cy }, { t: 99, x: g.retry.cx, y: g.retry.cy },
    ];
    const cp = path(L, keys);
    const cpress = Math.max(press(L, T.gearPress, 0.07, 0.08, 0.16), press(L, T.urlPress, 0.07, 0.08, 0.16), press(L, T.savePress, 0.07, 0.08, 0.16), press(L, T.retryPress, 0.07, 0.08, 0.16));
    placeCursor(st.cur, cp.x, cp.y, cpress, seg(L, T.curIn, T.curIn + 0.2) * (1 - seg(L, T.curOut[0], T.curOut[1])));
  },
};

// payoff: any app that takes an OpenAI key
const APPS = [
  ['Editor plugin', '<svg viewBox="0 0 24 24"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>'],
  ['Team chat bot', '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4Z"/></svg>'],
  ['CLI tool', '<svg viewBox="0 0 24 24"><path d="m5 8 5 4-5 4M12 17h7"/></svg>'],
];
const any = {
  id: 'any', dur: 1.9,
  mount(sec) {
    const root = el('<div class="v7 v8"></div>'); sec.appendChild(root);
    const tex = texture(root);
    const cp = caps(root, [['any app that takes an <span class="grad">OpenAI key.</span>', '']]);
    cp[0].style.fontSize = '84px';
    const cards = el(`<div class="cards">${APPS.map(([n, ic]) => `<div class="c"><div class="ch"><span class="ci">${ic}</span><b>${n}</b><span class="dn">${ICON.ok}No refusals</span></div><p class="lb">API key</p><div class="fv">${esc(NEW.key)}</div><p class="lb">Base URL</p><div class="fv">${esc(NEW.url)}</div></div>`).join('')}</div>`);
    root.appendChild(cards);
    return { root, tex, cp, cs: [...cards.children], dn: [...cards.querySelectorAll('.dn')] };
  },
  render(st, L, t) {
    drift(st.tex, L + 9.6);
    capAnim(st.cp, [[0.05, 99]], L);
    st.cs.forEach((c, i) => {
      const p = outQuint(seg(L, 0.15 + i * 0.12, 0.8 + i * 0.12));
      c.style.opacity = clamp(p * 1.3).toFixed(3);
      c.style.transform = `translateY(${((1 - p) * 60).toFixed(1)}px)`;
      const dp = outBack(seg(L, 0.7 + i * 0.12, 1.05 + i * 0.12));
      st.dn[i].style.opacity = clamp(dp * 3).toFixed(3);
      st.dn[i].style.transform = `scale(${lerp(0.5, 1, dp).toFixed(3)})`;
    });
  },
};

run({ W: 1920, H: 1080, segs: [hookSeg({ dur: 2.2, size: 150 }), app, any, apiEndSeg({ dur: 3.3 })] });
