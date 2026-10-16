/* scenes-app.29231211.js: L5-L10 inside the superbot app. The prompt types as the creator names each model,
   the three thumbnails resolve on "boom", the cursor picks one on "ask it", and the Live view drives YouTube
   Studio while the creator says "uploading" / "boom" / "it says". A camera (zoom + focus in app px) and the thread
   scroll are both keyframed on spoken words, so the frame always shows what is being talked about. */
(() => {
  'use strict';
  const { $, $$, W, L, set, rise, P, easeOut, easeIn, easeInOut, back, lerp, clamp, sceneIn, posIn, liveMark, pick } = window.SBX;
  const scenes = window.SB_SCENES;
  const BASE = 1920 / 1120;
  const VP_H = 630 - 112;
  const HERO_DY = 290 - 531;
  const minJerk = (x) => { x = clamp(x); return x * x * x * (10 - 15 * x + 6 * x * x); };

  const el = $('#s-app'), app = $('#app'), hero = $('#hero'), heroMark = $('#hero-mark'), greet = $('.hero-greet', hero);
  const feed = $('#feed'), u1 = $('#u1'), sw1 = $('#sw1'), sw1l = $('#sw1-l'), who1 = $('#who1'), tri = $('#tri');
  const gens = $$('.gen', tri);
  const u2 = $('#u2'), sw2 = $('#sw2'), sw2l = $('#sw2-l'), who2 = $('#who2'), a2text = $('#a2-text'), live = $('#live'), a2done = $('#a2-done');
  const tabsGag = $('#tabs-gag'), tabs = $$('.tg', tabsGag);
  const composer = $('#composer'), typed = $('#typed'), caret = $('#caret'), ph = $('#ph'), pchip = $('#pchip'), send = $('#send');
  const platStack = $('#plat-stack'), platCat = $('#plat-cat');
  const cursor = $('#app-cursor'), ring = $('#click-ring');
  const desk = $('#desk'), dcur = $('#desk-cursor'), edge = $('#edge'), band = $('#band'), pill = $('#cc3-pill');
  const stUp = $('#st-up'), upIdle = $('.st-up-idle', stUp), upImg = $('.st-up-img', stUp), upBar = $('.st-up-bar', stUp), upFill = $('#st-up-fill');
  const auto1 = $('.st-auto-1'), save = $('#st-save'), toast = $('#st-toast'), playerNew = $('#st-player-new'), stopL = $('#cc3-stop-l');

  const pickSrc = $('.gen-img img', gens[pick]).src;
  pchip.src = pickSrc;
  $('#u2-att').src = pickSrc;

  /* every beat, keyed to the words that cue it */
  function times() {
    const ask = L('ask'), pk = L('pick');
    return {
      in: ask.start, out: L('check').start, say: W('ask', 'say'),
      segs1: [
        ['Make a thumbnail for my latest video', W('ask', 'create'), W.end('ask', 'video')],
        [', one from each: ', W('ask', 'make'), W.end('ask', 'each')],
        ['Nano Banana 2', W('ask', 'nano'), W.end('ask', '2', 0)],
        [', GPT Image 2', W('ask', 'gpt') - 0.12, W.end('ask', '2', 1)],
        [' and FLUX.2', W('ask', 'and'), W.end('ask', 'flux.2')],
      ],
      multi: W('ask', 'multiple'), tabsA: W('ask', 'instead'), tabsB: W('ask', 'just'),
      send1: ask.end + 0.15,
      see: W('gen', 'see'), boom: W('boom', 'boom'),
      pickIn: pk.start, pickArrive: W('pick', 'just'), click: W('pick', 'ask') + 0.05, okT: W('pick', 'ok'),
      segs2: [["Ok, use this one and upload it to my channel's latest video", W('pick', 'ok'), W.end('pick', 'video')]],
      send2: pk.end + 0.12,
      that: W('upload', 'that'), liveIn: W('upload', 'you'), zoomLive: W('upload', 'see') - 0.35,
      upClick: W('upload', 'uploading'), upDone: W.end('upload', 'channel') + 0.15,
      saveClick: W('done', 'boom'), uploaded: W('done', 'uploaded'), itHas: W('done', 'it', 0),
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

  const shimmer = (t, speed = 0.75, phase = 0) => `${(100 - ((t * speed + phase) % 1) * 100).toFixed(1)}%`;
  const feedPt = (n, scroll) => { const p = posIn(n, feed); return { x: 260 + p.cx, y: p.cy - scroll, p }; };
  const bottomOf = (n) => posIn(n, feed).y + n.offsetHeight;

  function feedScroll(t, T) {
    const keys = [[T.send1 + 0.2, u1], [T.see - 0.2, tri], [T.send2 + 0.2, u2], [T.that, a2text], [T.liveIn, live], [T.itHas - 0.35, a2done]];
    let v = 0;
    for (const [at, n] of keys) v = lerp(v, Math.max(0, bottomOf(n) + 24 - VP_H), easeInOut(P(t, at, 0.6)));
    return v;
  }

  function camera(t, T, scroll) {
    const triC = feedPt(tri, scroll), liveC = feedPt(live, scroll), doneC = feedPt(a2done, scroll);
    const keys = [
      [T.say - 0.3, 1.28, 560, 300, 1.0],
      [T.send1 - 0.05, 1, 560, 315, 0.7],
      [T.see - 0.25, 1.32, triC.x, triC.y, 0.8],
      [T.okT - 0.2, 1.16, 560, (triC.y + 572) / 2, 0.8],
      [T.send2, 1, 560, 315, 0.6],
      [T.zoomLive, 1.55, liveC.x, liveC.y + 18, 0.85],
      [T.itHas - 0.4, 1.2, 560, doneC.y - 150, 0.8],
    ];
    let z = 1, fx = 560, fy = 315;
    for (const [a, kz, kx, ky, d] of keys) { const k = easeInOut(P(t, a, d)); z = lerp(z, kz, k); fx = lerp(fx, kx, k); fy = lerp(fy, ky, k); }
    const s = BASE * z;
    const tx = clamp(960 - fx * s, 1920 - 1120 * s, 0);
    const ty = clamp(540 - fy * s, 1080 - 630 * s, 0);
    app.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  }

  function composerBeats(t, T) {
    const k1 = easeInOut(P(t, T.send1, 0.6));
    rise(composer, t, T.in + 0.35, { y: 0 });
    set(composer, { y: HERO_DY * (1 - k1) });
    const o = Math.min(rise(hero, t, T.in + 0.1, { y: 0 }), 1 - easeIn(P(t, T.send1 - 0.05, 0.35)));
    set(hero, { o, y: -14 * easeIn(P(t, T.send1 - 0.05, 0.35)) });
    rise(heroMark, t, T.in + 0.15, { d: 0.6, s: 0.6, y: 0, spring: true });
    rise(greet, t, T.in + 0.3, { y: 10 });

    const r = t < T.send1 ? typeSegs(T.segs1, t) : t < T.send2 ? typeSegs(T.segs2, t) : { s: '', active: false, lastKey: -Infinity };
    if (typed.textContent !== r.s) typed.textContent = r.s;
    ph.style.opacity = r.s ? 0 : 1;
    const focused = (t > T.in + 0.6 && t < T.send1) || (t > T.okT - 0.5 && t < T.send2);
    const steady = r.active || t - r.lastKey < 0.45;
    caret.style.opacity = focused && (steady || Math.floor(t * 2.2) % 2 === 0) ? 1 : 0;
    send.classList.toggle('qc-on', !!r.s);
    const press = (at) => Math.sin(clamp((t - at + 0.08) / 0.2) * Math.PI);
    set(send, { s: 1 - 0.14 * Math.max(press(T.send1), press(T.send2)) });

    const kc = t < T.send2 ? easeOut(P(t, T.click + 0.15, 0.3)) : 0;
    pchip.style.width = `${(34 * kc).toFixed(2)}px`;
    pchip.style.marginRight = `${(7 * kc).toFixed(2)}px`;
    pchip.style.opacity = kc;

    const km = easeOut(P(t, T.multi - 0.1, 0.35));
    platStack.style.maxWidth = `${(44 * km).toFixed(1)}px`;
    platStack.style.opacity = km;
    platCat.style.display = km > 0.5 ? 'none' : '';

    const kb = easeIn(P(t, T.tabsB - 0.1, 0.4));
    const active = Math.floor(Math.max(0, t - T.tabsA) / 0.3) % 3;
    tabs.forEach((tb, i) => {
      const ki = easeOut(P(t, T.tabsA - 0.05 + i * 0.08, 0.35));
      const on = active === i && t < T.tabsB;
      const p = posIn(tb, tabsGag);
      set(tb, { o: ki * (1 - kb) * (on ? 1 : 0.62), x: (560 - p.cx) * kb, y: (1 - ki) * 10 + kb * 60, s: (on ? 1.07 : 1) * lerp(1, 0.55, kb) });
    });
  }

  function thumbBeats(t, T) {
    rise(u1, t, T.send1 + 0.2, { y: 10 });
    rise(sw1, t, T.send1 + 0.55, { y: 8 });
    const done = t >= T.boom + 0.35;
    sw1.classList.toggle('qc-done', done);
    const lbl = done ? 'Generated 3 thumbnails' : 'Running 3 models in parallel';
    if (sw1l.textContent !== lbl) sw1l.textContent = lbl;
    sw1l.style.setProperty('--sh', shimmer(t));
    set($('.qc-ok', sw1), { o: easeOut(P(t, T.boom + 0.35, 0.3)), s: lerp(0.5, 1, back(P(t, T.boom + 0.35, 0.4))) });
    rise(who1, t, T.see - 0.25, { y: 8 });
    rise(tri, t, T.see - 0.1, { y: 14 });
    const kp = easeOut(P(t, T.click, 0.25));
    gens.forEach((g, i) => {
      const gi = $('.gen-img', g), img = $('img', gi), shim = $('.gen-shim', gi), pct = $('.gen-pct', gi), sel = $('.gen-sel', gi);
      const r = T.boom - 0.05 + i * 0.08;
      const kr = easeOut(P(t, r, 0.42));
      img.style.opacity = kr;
      img.style.filter = kr < 0.999 ? `blur(${((1 - kr) * 14).toFixed(2)}px)` : '';
      img.style.transform = `scale(${lerp(1.08, 1, kr).toFixed(4)})`;
      const ks = 1 - easeOut(P(t, r, 0.3));
      shim.style.opacity = ks;
      shim.style.setProperty('--sh', shimmer(t, 0.75, i * 0.2));
      pct.style.opacity = ks;
      pct.textContent = `${Math.round(easeOut(P(t, T.see - 0.2, r - T.see + 0.2)) * (91 + i * 3))}%`;
      if (i === pick) {
        set(sel, { o: kp, s: lerp(0.6, 1, back(P(t, T.click, 0.35))) });
        gi.style.boxShadow = kp > 0 ? `0 0 0 1px #2a2a2e, 0 0 0 ${(2.5 * kp).toFixed(2)}px #e8e8e8` : '';
      } else set(g, { o: lerp(1, 0.5, kp) });
    });
  }

  function appCursor(t, T, scroll) {
    const target = feedPt($('.gen-img', gens[pick]), scroll);
    const tx = target.x + 18, ty = target.y + 10;
    const k1 = minJerk(P(t, T.pickIn + 0.1, Math.max(0.4, T.pickArrive - T.pickIn - 0.1)));
    const arc = Math.sin(k1 * Math.PI) * 26;
    let x = lerp(950, tx, k1) + arc * 0.4, y = lerp(590, ty, k1) - arc;
    const k2 = easeInOut(P(t, T.click + 0.35, 0.55));
    x = lerp(x, 790, k2); y = lerp(y, 585, k2);
    const o = Math.min(easeOut(P(t, T.pickIn, 0.3)), 1 - easeIn(P(t, T.click + 0.75, 0.35)));
    const press = Math.sin(clamp((t - T.click + 0.06) / 0.18) * Math.PI);
    set(cursor, { o, x: x - 4, y: y - 2, s: 1 - 0.15 * press });
    const kr = P(t, T.click, 0.45);
    set(ring, { o: kr > 0 && kr < 1 ? (1 - kr) * 0.9 : 0, x: tx, y: ty, s: lerp(0.5, 1.7, easeOut(kr)) });
  }

  function uploadBeats(t, T) {
    rise(u2, t, T.send2 + 0.2, { y: 10 });
    rise(sw2, t, T.send2 + 0.5, { y: 8 });
    const ctl = t >= T.that;
    sw2.classList.toggle('qc-done', ctl);
    sw2l.style.setProperty('--sh', shimmer(t));
    set($('.qc-ok', sw2), { o: easeOut(P(t, T.that, 0.3)), s: lerp(0.5, 1, back(P(t, T.that, 0.4))) });
    rise(who2, t, T.that + 0.05, { y: 8 });
    rise(a2text, t, T.that + 0.15, { y: 8 });
    rise(live, t, T.liveIn - 0.05, { y: 14 });
    rise(a2done, t, T.itHas - 0.2, { y: 10 });
    const stop = t >= T.uploaded ? 'Done' : 'Stop';
    if (stopL.textContent !== stop) stopL.textContent = stop;

    edge.style.opacity = Math.min(easeOut(P(t, T.liveIn + 0.25, 0.5)), 1 - easeOut(P(t, T.uploaded, 0.6)));
    band.style.setProperty('--cc3-a', `${((t * 110) % 360).toFixed(1)}deg`);
    const kp = Math.min(easeOut(P(t, T.liveIn + 0.45, 0.35)), 1 - easeIn(P(t, T.uploaded + 0.1, 0.3)));
    pill.style.opacity = kp;
    pill.style.transform = `translate(-50%, ${((1 - kp) * 8).toFixed(2)}px)`;

    /* the desktop: Upload file -> progress -> new thumbnail -> Save -> "Changes saved" */
    const up = posIn(stUp, desk), sv = posIn(save, desk);
    let x = 1150, y = 650;
    const k1 = minJerk(P(t, T.liveIn + 0.4, Math.max(0.4, T.upClick - 0.1 - T.liveIn - 0.4)));
    x = lerp(x, up.cx, k1); y = lerp(y, up.cy, k1) - Math.sin(k1 * Math.PI) * 40;
    const kAway = easeInOut(P(t, T.upClick + 0.25, 0.5));
    x = lerp(x, up.cx + 150, kAway); y = lerp(y, up.cy + 70, kAway);
    const k2 = minJerk(P(t, T.upDone + 0.05, Math.max(0.35, T.saveClick - 0.08 - T.upDone - 0.05)));
    x = lerp(x, sv.cx, k2); y = lerp(y, sv.cy, k2) - Math.sin(k2 * Math.PI) * 50;
    const press = Math.max(Math.sin(clamp((t - T.upClick + 0.06) / 0.18) * Math.PI), Math.sin(clamp((t - T.saveClick + 0.06) / 0.18) * Math.PI));
    const od = Math.min(easeOut(P(t, T.liveIn + 0.3, 0.3)), 1 - easeIn(P(t, T.uploaded + 0.5, 0.3)));
    set(dcur, { o: od, x: x - 7, y: y - 3.5, s: 1 - 0.15 * press });

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
    init() { liveMark(heroMark, 46); },
    render(t) {
      const T = times();
      if (!sceneIn(el, t, T.in, T.out)) return;
      const scroll = feedScroll(t, T);
      feed.style.transform = `translateY(${(-scroll).toFixed(1)}px)`;
      camera(t, T, scroll);
      composerBeats(t, T);
      thumbBeats(t, T);
      appCursor(t, T, scroll);
      uploadBeats(t, T);
    },
  });
})();
