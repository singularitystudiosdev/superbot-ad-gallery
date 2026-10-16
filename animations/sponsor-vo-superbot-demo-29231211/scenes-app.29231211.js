/* scenes-app.29231211.js: L5-L10 inside the real superbot desktop app. The spot opens on the finished answer (the
   prompt bubble, three provider switches, the asset strip), so t=0 is already settled. The creator's cursor picks a
   tile, drags it into the composer and the prompt types; turn 2 shows Thinking, then step rows while Chrome comes
   forward with the takeover HUD and the ghost cursor driving YouTube Studio. There is no camera: #app and the Chrome
   window keep one constant transform, only the thread scroll (keyframed on words) and opacity/position of parts move. */
(() => {
  'use strict';
  const { $, $$, W, L, set, rise, P, easeOut, easeIn, easeInOut, lerp, clamp, sceneIn, posIn, liveMark, pick } = window.SBX;
  const scenes = window.SB_SCENES;
  if (!window.SB_MARKS) throw new Error('[sb] marks.29231211.js must load before scenes-app');
  const { CAT_MARK, KNOT } = window.SB_MARKS;
  $$('.gm').forEach((el) => { el.innerHTML = CAT_MARK; });
  $$('.knot').forEach((el) => { el.innerHTML = KNOT; });

  const minJerk = (x) => { x = clamp(x); return x * x * x * (10 - 15 * x + 6 * x * x); };
  const PICK_NAMES = ['nano-banana-2.png', 'gpt-image-2.png', 'flux-2.png'];
  const MAIN_X = 320, HEAD_H = 48, WIN_H = 630;
  const CHROME_S = 1.115;
  const CH_X = (1920 - 1470 * CHROME_S) / 2, CH_Y = (1080 - 919 * CHROME_S) / 2;
  const CHIP_H = 42;

  const el = $('#s-app'), feedVp = $('#feed-vp'), feed = $('#feed'), comp = $('#comp');
  const batch = $('#batch'), tiles = $$('.bt');
  const u2 = $('#u2'), chips = $('#u2-chips'), answer = $('#a2-answer');
  const think = $('#think'), thinkL = $('#think-l'), thinkMark = $('#think-mark');
  const stp = [1, 2, 3, 4].map((i) => $(`#stp${i}`)), stp1d = $('#stp1-d');
  const attach = $('#attach'), chip = $('#chip'), chipImg = $('#chip-img'), chipN = $('#chip-n');
  const typed = $('#c-typed'), caret = $('#caret'), ph = $('#c-ph'), send = $('#send');
  const cursor = $('#app-cursor'), dragimg = $('#dragimg');
  const desk = $('#desk'), hud = $('#takeover'), ghost = $('#ghost'), gTarget = $('#g-target'), gPulse = $('#g-pulse'), gChip = $('#g-chip'), gArrow = $('#g-arrow');
  const stUp = $('#st-up'), upIdle = $('.st-up-idle', stUp), upImg = $('.st-up-img', stUp), upBar = $('.st-up-bar', stUp), upFill = $('#st-up-fill');
  const auto1 = $('.st-auto-1'), save = $('#st-save'), toast = $('#st-toast'), playerNew = $('#st-player-new');

  /* the picked tile feeds the drag image, the composer chip and the attachment card */
  const pickSrc = $('img', tiles[pick]).getAttribute('src');
  $('img', dragimg).src = pickSrc;
  chipImg.src = pickSrc;
  $('#u2-img').src = pickSrc;
  chipN.textContent = PICK_NAMES[pick];

  /* every beat, keyed to the words that cue it */
  function times() {
    const pk = L('pick');
    return {
      out: L('check').start,
      pickIn: pk.start, arrive: W('pick', 'just'), press: W('pick', 'ask'), drop: W('pick', 'ok') - 0.1,
      segs: [["Ok, use this one and upload it to my channel's latest video", W('pick', 'ok'), W.end('pick', 'video')]],
      send: pk.end + 0.12,
      think: pk.end + 0.12 + 0.45,
      that: W('upload', 'that'), you: W('upload', 'you'),
      upClick: W('upload', 'uploading'), upDone: W.end('upload', 'channel') + 0.15,
      saveClick: W('done', 'boom'), uploaded: W('done', 'uploaded'), says: W('done', 'it', 1) - 0.3,
    };
  }

  function typeSegs(segs, t) {
    let s = '', active = false, lastKey = -Infinity;
    for (const [txt, a, b] of segs) {
      if (t < a) break;
      const k = clamp((t - a) / Math.max(0.25, b - a));
      s += txt.slice(0, Math.round(txt.length * k));
      lastKey = Math.min(t, b);
      if (k < 1) { active = true; break; }
    }
    return { s, active, lastKey };
  }

  const shimmer = (t, speed = 0.75) => `${(100 - ((t * speed) % 1) * 100).toFixed(1)}%`;
  const bottomOf = (n) => posIn(n, feed).y + n.offsetHeight;

  /* thread scroll: the newest content stays in view; the viewport shrinks as the composer grows */
  function feedScroll(t, T, vpH) {
    /* [time, node, bottom pad]: the opening frame is packed tight, later turns breathe */
    const keys = [[-10, batch, 8], [T.send + 0.1, chips, 16], [T.send + 0.4, stp[0], 16], [T.upClick + 0.1, stp[1], 16], [T.saveClick + 0.1, stp[2], 16], [T.saveClick + 1, stp[3], 16], [T.says - 0.15, answer, 24]];
    let v = 0;
    for (const [at, n, pad] of keys) v = lerp(v, Math.max(0, bottomOf(n) + pad - vpH), easeInOut(P(t, at, 0.6)));
    return v;
  }

  function composerBeats(t, T) {
    const kc = t < T.send + 0.05 ? easeOut(P(t, T.drop, 0.25)) : 0;
    attach.style.height = `${(CHIP_H * kc).toFixed(2)}px`;
    chip.style.opacity = kc;
    chip.style.transform = `scale(${lerp(0.9, 1, kc).toFixed(4)})`;
    const r = t < T.send ? typeSegs(T.segs, t) : { s: '', active: false, lastKey: -Infinity };
    if (typed.textContent !== r.s) typed.textContent = r.s;
    ph.style.opacity = r.s ? 0 : 1;
    const focused = t > T.drop && t < T.send + 0.05;
    comp.style.boxShadow = focused ? 'inset 0 0 0 1px rgba(43,107,255,0.8)' : '';
    const steady = r.active || t - r.lastKey < 0.45;
    caret.style.opacity = focused && (steady || Math.floor(t * 2.2) % 2 === 0) ? 1 : 0;
    send.classList.toggle('lit', !!r.s);
    const press = Math.sin(clamp((t - T.send + 0.08) / 0.2) * Math.PI);
    set(send, { s: 1 - 0.14 * press });
  }

  /* the creator's own cursor: hover a tile, press, drag it to the composer, drop */
  function pickBeats(t, T, scroll) {
    const tile = tiles[pick], p = posIn(tile, feed);
    const tx = MAIN_X + p.cx, ty = HEAD_H + p.cy - scroll;
    const dx = MAIN_X + 368, dy = 556;
    const k1 = minJerk(P(t, T.pickIn + 0.1, Math.max(0.4, T.arrive - T.pickIn - 0.1)));
    let x = lerp(1000, tx, k1) + Math.sin(k1 * Math.PI) * 14, y = lerp(600, ty, k1) - Math.sin(k1 * Math.PI) * 22;
    const dragStart = T.press + 0.08, dragLen = Math.max(0.35, T.drop - dragStart);
    const k2 = minJerk(P(t, dragStart, dragLen));
    x = lerp(x, dx, k2); y = lerp(y, dy, k2) - Math.sin(k2 * Math.PI) * 30;
    const o = Math.min(easeOut(P(t, T.pickIn, 0.3)), 1 - easeIn(P(t, T.drop + 0.35, 0.3)));
    const press = Math.sin(clamp((t - T.press + 0.06) / 0.18) * Math.PI);
    set(cursor, { o, x: x - 4, y: y - 2, s: 1 - 0.15 * press });
    /* the drag image holds the picked tile at the cursor until the drop */
    const dk = Math.min(easeOut(P(t, T.press, 0.1)), 1 - easeOut(P(t, T.drop - 0.05, 0.15)));
    set(dragimg, { o: 0.7 * dk, x: x - 48, y: y - 48, s: lerp(1, 0.82, k2) });
    /* hover-only TileActions on the source tile; the source dims while it is dragged */
    $('.ta', tile).style.opacity = Math.min(easeOut(P(t, T.arrive - 0.1, 0.15)), 1 - easeOut(P(t, T.press + 0.2, 0.2)));
    $('img', tile).style.opacity = 1 - 0.45 * Math.min(easeOut(P(t, T.press, 0.1)), 1 - easeOut(P(t, T.drop, 0.2)));
  }

  function turn2(t, T) {
    rise(u2, t, T.send + 0.05, { y: 10 });
    rise(chips, t, T.send + 0.2, { y: 10 });
    rise(think, t, T.think, { y: 6, out: T.that, od: 0.12 });
    thinkL.style.setProperty('--sh', shimmer(t));
    stp[0].classList.toggle('done', t >= T.you + 0.1);
    rise(stp[0], t, T.that + 0.1, { y: 6 });
    set(stp1d, { o: easeOut(P(t, T.you + 0.1, 0.3)) });
    $('.spin', stp[0]).style.setProperty('--rot', `${((t * 420) % 360).toFixed(1)}deg`);
    [[1, T.upClick + 0.12], [2, T.saveClick + 0.12], [3, T.saveClick + 1]].forEach(([i, at]) => {
      stp[i].classList.add('done');
      rise(stp[i], t, at, { y: 6 });
    });
    rise(answer, t, T.says, { y: 10 });
  }

  /* Chrome forward + takeover HUD + ghost cursor, then the Studio logic: Upload file, progress, new thumbnail, Save, toast */
  function chromeBeats(t, T) {
    const kin = easeOut(P(t, T.you, 0.45)), kout = easeIn(P(t, T.uploaded - 0.1, 0.5));
    set(desk, { o: Math.min(kin, 1 - kout) });
    desk.style.transform = `translate(${CH_X.toFixed(2)}px,${(CH_Y + (1 - kin) * 16 + kout * 20).toFixed(2)}px) scale(${CHROME_S})`;
    const kh = Math.min(easeOut(P(t, T.you + 0.15, 0.2)), 1 - easeIn(P(t, T.uploaded - 0.1, 0.3)));
    set(hud, { o: kh, y: -4 * (1 - easeOut(P(t, T.you + 0.15, 0.2))) });
    ghost.style.opacity = 1 - easeIn(P(t, T.uploaded - 0.1, 0.5));

    const up = posIn(stUp, desk), sv = posIn(save, desk);
    const g1e = T.upClick - 0.05, g1s = Math.min(Math.max(T.you + 0.25, g1e - 0.9), g1e - 0.3);
    const g2e = T.saveClick - 0.08, g2s = Math.min(T.upDone + 0.05, g2e - 0.35);
    const k1 = minJerk(P(t, g1s, g1e - g1s)), k2 = minJerk(P(t, g2s, g2e - g2s));
    let x = lerp(980, up.cx, k1), y = lerp(300, up.cy, k1) - Math.sin(k1 * Math.PI) * 40;
    x = lerp(x, sv.cx, k2); y = lerp(y, sv.cy, k2) - Math.sin(k2 * Math.PI) * 50;
    const second = t >= g2s;
    const act = second ? sv : up;
    gTarget.style.transform = `translate(${act.cx.toFixed(2)}px,${act.cy.toFixed(2)}px)`;
    gTarget.style.opacity = easeOut(P(t, second ? g2s : g1s, 0.15));
    const lbl = second ? 'Save' : 'Upload file';
    if (gChip.textContent !== lbl) gChip.textContent = lbl;
    const pk = P(t, second ? T.saveClick : T.upClick, 0.5);
    gPulse.style.opacity = pk > 0 && pk < 1 ? 0.8 * (1 - pk) : 0;
    gPulse.style.transform = `scale(${lerp(1, 2.2, easeOut(pk)).toFixed(3)})`;
    const press = Math.max(Math.sin(clamp((t - T.upClick + 0.06) / 0.18) * Math.PI), Math.sin(clamp((t - T.saveClick + 0.06) / 0.18) * Math.PI));
    gArrow.style.opacity = easeOut(P(t, g1s, 0.15));
    gArrow.style.transform = `translate(${(x - 5).toFixed(2)}px,${(y - 2.5).toFixed(2)}px) scale(${(1 - 0.12 * press).toFixed(3)})`;

    upIdle.style.opacity = 1 - easeOut(P(t, T.upClick + 0.12, 0.25));
    upBar.style.opacity = Math.min(easeOut(P(t, T.upClick + 0.15, 0.2)), 1 - easeOut(P(t, T.upDone + 0.1, 0.25)));
    upFill.style.width = `${(easeInOut(P(t, T.upClick + 0.2, Math.max(0.3, T.upDone - T.upClick - 0.2))) * 100).toFixed(1)}%`;
    upImg.style.opacity = easeOut(P(t, T.upDone - 0.05, 0.35));
    stUp.classList.toggle('st-sel', t >= T.upDone);
    auto1.classList.toggle('st-sel', t < T.upDone);
    playerNew.style.opacity = easeOut(P(t, T.upDone + 0.1, 0.4));
    save.classList.toggle('on', t >= T.upDone + 0.1 && t < T.saveClick + 0.12);
    const kt = Math.min(easeOut(P(t, T.saveClick + 0.15, 0.25)), 1 - easeIn(P(t, T.saveClick + 3.2, 0.3)));
    set(toast, { o: kt, y: (1 - kt) * 12 });
  }

  scenes.push({
    init() { liveMark(thinkMark, 24); },
    render(t) {
      const T = times();
      if (!sceneIn(el, t, -1, T.out)) return;
      composerBeats(t, T);
      const vpH = WIN_H - 8 - comp.offsetHeight - HEAD_H;
      feedVp.style.height = `${vpH.toFixed(2)}px`;
      const scroll = feedScroll(t, T, vpH);
      feed.style.transform = `translateY(${(-scroll).toFixed(2)}px)`;
      pickBeats(t, T, scroll);
      turn2(t, T);
      chromeBeats(t, T);
    },
  });
})();
