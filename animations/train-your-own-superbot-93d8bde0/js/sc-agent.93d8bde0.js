// Scenes 6 and 7, Superbot's part, inside the new "ROB-IT Thumbnails" chat: the recording as the first message, the
// thinking panel reading the steps it understood, the headless check ticking off, then the reply with its live view.
// The live view is the reference's computer-control card (bakery frame: title, Share, Expand, Stop; the soft vignette;
// the status pill) over the same real Thumbnails capture, seen the way a headless browser sees it (the page, no
// browser frame), with Superbot's own pointer at work; beside it the job's panel: the rounds, the thumbnails each round
// generates (real image-model outputs, img/thumbs), and the meter toward significance. The thread is laid out once,
// top down, and scrolled like a chat (the newest block's bottom held at the feed's foot), so every frame is exact.
import { seg, lerp, clamp, outCubic, inOutCubic, outBack, press, h, css, op, vis, countUp, fmtInt, esc } from './lib.93d8bde0.js';
import { Track, makeCursor } from './cursor.93d8bde0.js';
import { makeDesk, PAGE, COL } from './desk.93d8bde0.js';
import { NAME } from './timing.93d8bde0.js';

const X0 = 380;                     // the live view shows the page from this x (the Creator Hub nav is cut at its edge)
const VIEW_W = 780;                 // layout px
const S = VIEW_W / (PAGE.w - X0);   // page px -> view px (about 0.675)
const VIEW_H = Math.round(PAGE.h * S);
const SCROLL = 560;
const rowTop = (k) => 564 + 89 * k; // content px
const vpt = (x, y) => ({ x: (x - X0) * S, y: y * S }); // page px -> view px
const SAY = 'Running it on ROB-IT now. Every round: new thumbnails, swap out the lowest click rate, wait for real data, learn, repeat.';
const ROUNDS = [
  { tiles: ['r1a', 'r1b', 'r1c', 'r1d'] },
  { tiles: ['r2a', 'r2b', 'r2c', 'r1c'] },
  { tiles: ['r3a', 'r3b', 'r2a', 'r1c'] },
];
const ICON = {
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  expand: '<svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  spin: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 1-9 9"/></svg>',
  box: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
  boxOn: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" stroke="none"/><path d="M8 12.2l2.7 2.7L16.2 9" stroke="#131215" stroke-width="2.4" fill="none"/></svg>',
};

/** the eased chat scroll: keyframes [{t, off}], each easing over 0.55 s from wherever the last one left it */
function scrollAt(keys, t) {
  let off = keys[0].off;
  for (let i = 1; i < keys.length; i++) off = lerp(off, keys[i].off, outCubic(seg(t, keys[i].t, keys[i].t + 0.55)));
  return off;
}

export function buildAgent({ T, app, thread, kitMark }) {
  // ---- the thread in its own layer over the feed (the hero stays where the kit put it) ----
  const feed = app.root.querySelector('.sbk-feed');
  const layer = h('<div class="tf"><div class="tf-in"></div></div>');
  feed.appendChild(layer);
  const inner = layer.firstElementChild;
  inner.appendChild(thread.root);
  // the recording card's poster: a frame of the recording itself
  thread.poster.replaceChildren(h('<img src="img/rbx/thumbs-edit-0.webp" alt="">'), h('<i class="rec-play"></i>'));
  thread.reply.querySelector('.sbk-reply-text').textContent = '';
  const sayVis = h('<span class="say-v"></span>'), sayHid = h(`<span class="say-h">${esc(SAY)}</span>`);
  thread.reply.querySelector('.sbk-reply-text').append(sayVis, sayHid);
  const outcomeRow = thread.root.lastElementChild;

  // ---- the live view card ----
  const desk = makeDesk({ scale: S });
  const card = h(`<div class="lv">
    <div class="lv-head"><b class="lv-title">${esc(NAME)}<small>Live view</small></b>
      <span class="lv-btn lv-icon">${ICON.share}</span><span class="lv-btn">${ICON.expand}Expand</span><span class="lv-btn lv-stop"><i></i>Stop</span></div>
    <div class="lv-body">
      <div class="lv-view" style="width:${VIEW_W}px;height:${VIEW_H}px"><div class="lv-desk"></div>
        <i class="lv-edge"><i class="lv-soft"><i class="lv-band"></i></i></i>
        <span class="lv-pill"><span class="lv-pill-mark"></span><span>Superbot is working in a headless browser</span></span>
      </div>
      <div class="lv-side">
        <div class="lv-rounds">${[1, 2, 3].map((n) => `<span class="lv-round" data-n="${n}"><i class="lv-r-ic"></i>Round ${n}</span>`).join('')}</div>
        <div class="lv-stage"><i class="lv-st-ic"></i><span class="lv-st-t"></span></div>
        <div class="lv-grid">${[0, 1, 2, 3].map((i) => `<div class="lv-tile" data-i="${i}"><i class="lv-shim"></i><img alt=""><span class="lv-tag"></span></div>`).join('')}</div>
        <div class="lv-meter">
          <div class="lv-m-top"><span class="lv-m-l">Waiting for significance</span><span class="lv-m-p">0%</span></div>
          <div class="lv-bar"><i></i></div>
          <div class="lv-m-row"><span>Impressions</span><b class="lv-m-imp">0</b></div>
          <div class="lv-m-row"><span>Click rate, new vs old</span><b class="lv-m-ctr">N/A</b></div>
        </div>
        <div class="lv-note"></div>
      </div>
    </div>
  </div>`);
  thread.slot.appendChild(card);
  const $ = (s) => card.querySelector(s);
  const deskHost = $('.lv-desk');
  deskHost.appendChild(desk.root);
  css(desk.root, 'transform', `translate(${(-X0 * S).toFixed(2)}px, ${(-PAGE.top * S).toFixed(2)}px) scale(${S.toFixed(5)})`);
  const pillMark = kitMark({ size: 18, ghosts: true });
  $('.lv-pill-mark').appendChild(pillMark.el);
  const view = $('.lv-view'), edge = $('.lv-edge'), soft = $('.lv-soft');
  const rounds = [...card.querySelectorAll('.lv-round')];
  const stIc = $('.lv-st-ic'), stT = $('.lv-st-t');
  const tiles = [...card.querySelectorAll('.lv-tile')].map((el) => ({ el, img: el.querySelector('img'), shim: el.querySelector('.lv-shim'), tag: el.querySelector('.lv-tag') }));
  // every image has its source from the start, so a frozen frame can wait for all of them to decode
  tiles.forEach((tl, i) => { tl.img.src = `img/thumbs/${ROUNDS[0].tiles[i]}.webp`; tl.img.dataset.src = tl.img.src; });
  const mP = $('.lv-m-p'), mBar = $('.lv-bar i'), mImp = $('.lv-m-imp'), mCtr = $('.lv-m-ctr'), meter = $('.lv-meter'), note = $('.lv-note');

  // the agent's marks on the page, in content px (they scroll with the table)
  const C = desk.content;
  const mk = (cls, html = '') => { const el = h(`<div class="am ${cls}">${html}</div>`); C.appendChild(el); return el; };
  const place = (el, x, y, w, hh) => { el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.width = `${w}px`; el.style.height = `${hh}px`; };
  const cx = (pageX) => pageX - COL.x; // page x -> content x
  const ctrCells = [0, 1, 2, 3, 4].map((k) => { const el = mk('am-ctr'); place(el, cx(1103), rowTop(k), 156, 89); return el; });
  // each live thumbnail wears its click rate (the table's Qualified Play Through Rate) as a badge
  const CTR = ['0.61%', '0.92%', '1.18%', '1.02%', '0.92%'];
  const badges = CTR.map((v, k) => { const el = mk('am-badge', v); place(el, cx(538) + 40, rowTop(k) + 52, 50, 22); return el; });
  badges[0].classList.add('is-low');
  const lowRow = mk('am-row', '<span class="am-tag">Lowest click rate</span>'); place(lowRow, cx(436), rowTop(0), 1056, 89);
  const swapImg = mk('am-swap', '<img alt="" src="img/thumbs/r1c.webp">'); place(swapImg, cx(538), rowTop(0) + 16, 83, 56);
  const box = mk('am-box'); place(box, cx(464), rowTop(0) + 31, 28, 28);
  const cells = ['impr', 'plays', 'sess', 'ptr'].map((k, i) => { const el = mk('am-cell'); place(el, cx([638, 793, 948, 1103][i]) + 2, rowTop(0) + 2, 151, 85); return el; });
  const swap2 = mk('am-swap', '<img alt="" src="img/thumbs/r2a.webp">'); place(swap2, cx(538), rowTop(1) + 16, 83, 56);

  // ---- Superbot's pointer in the live view ----
  const cur = makeCursor(1.0);
  view.appendChild(cur.el);
  const A = T.s7;
  const at = {
    card: A + 0.35, gen: [A + 1.0, A + 1.6, A + 2.2, A + 2.8], ready: A + 3.4,
    upMove: [A + 2.6, A + 3.3], upClick: A + 3.45, scroll: [A + 4.2, A + 4.9],
    ctr: A + 4.95, low: A + 5.4, boxMove: [A + 5.6, A + 6.2], uncheck: A + 6.35, swap: A + 6.8, recheck: A + 7.3,
    wait: [A + 7.6, A + 10.5], sig: A + 10.6,
    r2: A + 10.9, gen2: [A + 11.15, A + 11.6, A + 12.05], swap2: A + 12.45, wait2: [A + 12.6, A + 13.4], r3: A + 13.55, gen3: [A + 13.75, A + 14.15],
    outcome: A + 13.2,
  };
  const tr = new Track(VIEW_W * 0.62, VIEW_H * 0.55);
  const up = vpt(666.5, 309);
  tr.move(at.upMove[0], at.upMove[1], up.x, up.y).shape(at.upMove[1] - 0.1, 'hand').click(at.upClick).shape(at.upClick + 0.3, 'arrow');
  const boxPt = vpt(478, COL.y + rowTop(0) - SCROLL + 45);
  tr.move(at.boxMove[0], at.boxMove[1], boxPt.x, boxPt.y).shape(at.boxMove[1] - 0.1, 'hand').click(at.uncheck).click(at.recheck);
  tr.shape(at.recheck + 0.3, 'arrow').move(at.recheck + 0.4, at.recheck + 1.1, VIEW_W * 0.7, VIEW_H * 0.78);
  tr.hidden(-1e9, at.card);

  // ---- chat scroll keyframes: the newest block's bottom at the feed's foot ----
  let keys = null;
  function measure() {
    const feedH = feed.clientHeight, pad = 18;
    const bottom = (el) => el.offsetTop + el.offsetHeight;
    // the newest block's bottom at the feed's foot: a short thread sits low, a long one scrolls up
    const off = (el) => feedH - pad - bottom(el);
    keys = [
      { t: -1, off: off(thread.userTurn) },
      { t: T.thinkIn, off: off(thread.thinking) },
      { t: T.verifyIn, off: off(thread.verify) },
      { t: A, off: off(thread.reply) },
      { t: at.outcome, off: off(outcomeRow) },
    ];
  }
  /** the thread as it stands when the recording lands (only the card shown, at rest), for measuring the fly target */
  function restPose() {
    if (!keys) measure();
    css(inner, 'transform', `translateY(${keys[0].off.toFixed(2)}px)`);
    css(thread.userTurn, 'transform', 'none');
  }
  const appear = (el, t0, t) => { const p = outCubic(seg(t, t0, t0 + 0.4)); op(el, p); vis(el, p > 0); css(el, 'transform', `translateY(${((1 - p) * 10).toFixed(2)}px)`); };

  let shownStep = [], shownV = [];
  const stepState = (t, at0) => (t < at0 ? 'pending' : t < at0 + 0.42 ? 'running' : 'done');
  const shown = { say: -1, stage: '' };

  // the two panels' head glyphs: a turning ring while it works, a check once done
  const headIc = (panel) => { const old = panel.querySelector('.sbk-think-head svg'); const el = h(`<i class="th-ic">${ICON.spin}</i>`); old.replaceWith(el); return el; };
  const thinkIc = headIc(thread.thinking), verIc = headIc(thread.verify);
  const setIc = (el, done, t) => {
    const k = done ? 'done' : 'run';
    if (el.dataset.k !== k) { el.innerHTML = done ? ICON.check : ICON.spin; el.dataset.k = k; }
    css(el, 'transform', done ? 'none' : `rotate(${((t * 360) % 360).toFixed(1)}deg)`);
  };

  return {
    measure, restPose,
    render(t) {
      if (!keys) measure();
      const appIn = t >= T.appBack[0];
      op(layer, appIn ? 1 : 0);
      css(inner, 'transform', `translateY(${scrollAt(keys, t).toFixed(2)}px)`);
      // the blocks arrive in turn
      appear(thread.userTurn, T.fly[1] - 0.06, t);
      appear(thread.thinking, T.thinkIn, t);
      appear(thread.verify, T.verifyIn, t);
      appear(thread.reply, A, t);
      appear(outcomeRow, at.outcome, t);
      // thinking: each understood step goes running, then done
      T.steps.forEach((s, i) => { const st = stepState(t, s); if (shownStep[i] !== st) { thread.setStep(i, st); shownStep[i] = st; } });
      T.vsteps.forEach((s, i) => { const st = stepState(t, s); if (shownV[i] !== st) { thread.setVerifyStep(i, st); shownV[i] = st; } });
      const thinkLabel = thread.thinking.querySelector('.sbk-think-label');
      const tl = t < T.thinkDone ? 'Analyzing the recording' : 'Learned 6 steps from the recording';
      if (thinkLabel.textContent !== tl) thinkLabel.textContent = tl;
      const verLabel = thread.verify.querySelector('.sbk-think-label');
      const vl = t < T.verified ? 'Checking it can run alone' : 'Verified in a headless browser';
      if (verLabel.textContent !== vl) verLabel.textContent = vl;
      thread.paint(t * 1000);
      setIc(thinkIc, t >= T.thinkDone, t);
      setIc(verIc, t >= T.verified, t);
      if (t < A - 0.5) return;

      // ---- scene 7 ----
      const n = clamp(Math.floor((t - A - 0.1) * 75), 0, SAY.length);
      if (n !== shown.say) { sayVis.textContent = SAY.slice(0, n); sayHid.textContent = SAY.slice(n); shown.say = n; }
      const ci = outCubic(seg(t, at.card, at.card + 0.45));
      op(card, ci); css(card, 'transform', ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.97, 1, ci).toFixed(4)})`);
      // the takeover look inside the view: the vignette turning and breathing, the pill
      const g = outCubic(seg(t, at.card + 0.2, at.card + 0.75));
      op(edge, g); css(edge, '--lv-a', `${((t * 60) % 360).toFixed(1)}deg`); op(soft, 0.9 + 0.08 * Math.sin(t * 2.6));
      op($('.lv-pill'), g);
      pillMark.paint(t * 1000);

      // the page: the edit view, scrolled by the agent to the table and back for round 2
      const scroll = SCROLL * outCubic(seg(t, at.scroll[0], at.scroll[1]));
      const uploading = press(t, at.upClick);
      desk.render({ pages: { edit: 1 }, edit: 1, scroll, tab: {}, omni: {},
        hovers: t > at.upMove[1] - 0.1 && t < at.upClick + 0.35 ? [{ x: 580, y: 289 - scroll, w: 173, h: 40, r: 8, bg: `rgba(255,255,255,${(0.12 + 0.12 * uploading).toFixed(3)})` }] : [] });
      // the click rates and the lowest performer
      const cr = outCubic(seg(t, at.ctr, at.ctr + 0.4));
      ctrCells.forEach((el, k) => op(el, cr * (k === 0 ? 1 - seg(t, at.swap, at.swap + 0.3) : 1)));
      badges.forEach((el, k) => op(el, cr));
      const b0 = t >= at.sig ? '1.27%' : t >= at.swap ? 'N/A' : '0.61%';
      if (badges[0].textContent !== b0) badges[0].textContent = b0;
      badges[0].classList.toggle('is-low', t < at.swap);
      badges[0].classList.toggle('is-win', t >= at.sig);
      css(badges[0], 'z-index', '3');
      const low = outCubic(seg(t, at.low, at.low + 0.35));
      op(lowRow, low);
      lowRow.classList.toggle('is-new', t >= at.swap);
      const tag = lowRow.firstElementChild, tagText = t >= at.swap ? 'New thumbnail, now live' : 'Lowest click rate';
      if (tag.textContent !== tagText) tag.textContent = tagText;
      // uncheck, swap in the best new one, check it
      const boxHtml = t >= at.uncheck && t < at.recheck ? ICON.box : ICON.boxOn;
      if (box.dataset.k !== boxHtml) { box.innerHTML = boxHtml; box.dataset.k = boxHtml; }
      op(box, t >= at.uncheck - 0.05 ? 1 : 0);
      css(lowRow, '--dim', t >= at.uncheck && t < at.swap ? '1' : '0');
      const sw = outBack(seg(t, at.swap, at.swap + 0.45), 1.3);
      op(swapImg, clamp(sw)); css(swapImg, 'transform', `scale(${lerp(0.6, 1, clamp(sw)).toFixed(3)})`);
      // the new row's numbers start from nothing and count up while it waits for data
      const wv = seg(t, at.wait[0], at.wait[1]);
      const imp = countUp(t, at.wait[0], at.wait[1], 0, 9860, (x) => x);
      const plays = countUp(t, at.wait[0], at.wait[1], 0, 125, (x) => x);
      const cellTxt = [fmtInt(imp), fmtInt(plays), t >= at.wait[0] + 0.6 ? '9.6 min' : '0.0 min', t >= at.sig ? '1.27%' : 'N/A'];
      cells.forEach((el, i) => { if (el.textContent !== cellTxt[i]) el.textContent = cellTxt[i]; op(el, t >= at.swap + 0.15 ? 1 : 0); });
      cells[3].classList.toggle('is-win', t >= at.sig);
      // round 2's swap, quicker, on the next row
      const s2 = outBack(seg(t, at.swap2, at.swap2 + 0.4), 1.3);
      op(swap2, clamp(s2)); css(swap2, 'transform', `scale(${lerp(0.6, 1, clamp(s2)).toFixed(3)})`);

      // ---- the job's panel ----
      const round = t < at.r2 ? 0 : t < at.r3 ? 1 : 2;
      rounds.forEach((el, i) => { el.dataset.state = i < round ? 'done' : i === round ? 'on' : 'next'; });
      const gens = [at.gen, at.gen2, at.gen3][round];
      const roundT0 = [at.gen[0] - 0.2, at.r2, at.r3][round];
      ROUNDS[round].tiles.forEach((name, i) => {
        const tl = tiles[i], g0 = gens[i];
        const carried = g0 === undefined; // a tile carried over from the round before (the live winner)
        const src = `img/thumbs/${name}.webp`;
        if (tl.img.getAttribute('src') !== src) tl.img.setAttribute('src', src);
        const rv = carried ? 1 : outCubic(seg(t, g0, g0 + 0.6));
        const live = t >= roundT0 - 0.2;
        op(tl.el, live ? 1 : 0);
        op(tl.img, rv); css(tl.img, 'filter', rv < 1 ? `blur(${((1 - rv) * 16).toFixed(1)}px) saturate(${(0.6 + 0.4 * rv).toFixed(2)})` : 'none');
        css(tl.img, 'transform', `scale(${lerp(1.06, 1, rv).toFixed(4)})`);
        op(tl.shim, (1 - rv) * (live ? 1 : 0));
        css(tl.shim, 'background-position', `${(((t * 0.9) % 1) * 200 - 50).toFixed(1)}% 0`);
        const isLive = (round === 0 && name === 'r1c' && t >= at.recheck) || (round > 0 && name === 'r1c') || (round === 1 && name === 'r2a' && t >= at.swap2);
        const tagT = isLive ? 'Live' : (!carried && rv >= 1 && round === 0 && t >= at.upClick + 0.3) ? 'Uploaded' : (!carried && rv >= 1) ? 'New' : '';
        if (tl.tag.textContent !== tagT) { tl.tag.textContent = tagT; tl.tag.dataset.k = isLive ? 'live' : 'new'; }
        op(tl.tag, tagT ? 1 : 0);
      });
      const stage = t < at.ready ? ['spin', round === 0 ? 'Generating 4 thumbnails' : ''] : t < at.upClick + 0.6 ? ['check', '4 thumbnails ready'] : t < at.scroll[1] ? ['spin', 'Uploading to Creator Hub'] : t < at.recheck + 0.2 ? ['spin', 'Replacing the lowest performer'] : t < at.sig ? ['spin', 'Waiting for significance'] : t < at.r2 ? ['check', 'Significant: the new one wins'] : t < at.swap2 ? ['spin', 'Generating the next batch'] : t < at.wait2[1] ? ['spin', 'Waiting for significance'] : ['spin', 'Generating the next batch'];
      const key = stage.join('|');
      if (key !== shown.stage) { stT.textContent = stage[1]; stIc.innerHTML = stage[0] === 'spin' ? ICON.spin : ICON.check; stIc.dataset.k = stage[0]; shown.stage = key; }
      css(stIc, 'transform', stage[0] === 'spin' ? `rotate(${((t * 400) % 360).toFixed(1)}deg)` : 'none');
      // the meter: toward significance, then reset for round 2's wait
      const w2 = seg(t, at.wait2[0], at.wait2[1]);
      const prog = round === 0 ? inOutCubic(wv) : round === 1 ? (t < at.wait2[0] ? 0 : inOutCubic(w2)) : 0.08;
      op(meter, t >= at.wait[0] - 0.3 ? 1 : 0.35);
      css(mBar, 'transform', `scaleX(${prog.toFixed(4)})`);
      mBar.classList.toggle('is-done', (round === 0 && t >= at.sig) || (round === 1 && w2 >= 1));
      const pTxt = `${Math.round(prog * 95)}% of 95% confidence`;
      if (mP.textContent !== pTxt) mP.textContent = pTxt;
      const impTxt = fmtInt(round === 0 ? imp : round === 1 ? countUp(t, at.wait2[0], at.wait2[1], 0, 10240, (x) => x) : 0);
      if (mImp.textContent !== impTxt) mImp.textContent = impTxt;
      const ctrTxt = round === 0 ? (t >= at.sig ? '1.27% vs 0.61%' : 'collecting') : 'collecting';
      if (mCtr.textContent !== ctrTxt) mCtr.textContent = ctrTxt;
      const nt = round === 0 ? '' : 'Learned: close-up faces holding the diamond get more clicks. This batch leans into that.';
      if (note.textContent !== nt) note.textContent = nt;
      op(note, round === 0 ? 0 : outCubic(seg(t, at.r2, at.r2 + 0.4)));
      cur.render(t, tr);
    },
  };
}
