/* Click-to-start timeline for the superbot thumbnail spot. render(t) writes every moving value from t
   (seconds since the click), so play, pause, seek and headless renders all land on the same frame.
   Beat times line up with cues.67114eb1.js. */
(() => {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const CYCLE = 75;
  const SEND1 = 4.9, SEND2 = 53.2;
  const P1 = 'Make a thumbnail from my latest video';
  const P2 = 'Use this one and upload it to YouTube A/B tests';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const P = (t, a, d) => clamp((t - a) / d);
  const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const eio = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const eb = (x) => { x = clamp(x); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const fin = (t, a, d = .4) => eo(P(t, a, d));
  const frac = (x) => x - Math.floor(x);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const press = (t, p) => (t >= p && t < p + .24 ? 1 - .14 * Math.sin(Math.PI * (t - p) / .24) : 1);

  const stage = $('#stage');
  if (window.__RENDER__) document.documentElement.classList.add('render');
  let scale = 1;
  function fit() {
    scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  addEventListener('resize', fit);
  fit();

  /* human typing: per-character gaps jittered by a fixed hash, spaces a little longer */
  function typer(text, a, b) {
    const w = [...text].map((c, i) => (c === ' ' ? 1.7 : 1) * (.7 + .6 * frac(Math.sin((i + 1) * 12.9898) * 43758.5453)));
    const tot = w.reduce((s, x) => s + x, 0);
    let acc = 0;
    const at = w.map((x) => a + (b - a) * (acc += x) / tot);
    return (t) => { let n = 0; while (n < at.length && at[n] <= t) n++; return n; };
  }
  const T1 = typer(P1, .6, 4.3), T2 = typer(P2, 47.6, 52.6);

  // ---------- element handles ----------
  const sChat = $('#s-chat'), sStudio = $('#s-studio'), sEnd = $('#s-end');
  const hero = $('#hero'), subs = $('#subs');
  const composer = $('#composer'), typed = $('#typed'), caret = $('#caret'), ph = $('#cPh'), send = $('#send'), attIn = $('#attIn');
  const cModel = $('#cModel'), models = $$('#cModel .m');
  const items = $$('#feedIn > .it').map((el) => ({ el, inner: el.firstElementChild, tin: +el.dataset.in, h: 0 }));
  const says = $$('.say').map((el) => ({ el, text: el.textContent, a: +el.dataset.a, b: +el.dataset.b, n: -1 }));
  const chips = [
    { el: $('#cSw'), steps: [5.6], done: 7.0 },
    { el: $('#cYt'), steps: [10.4, 11.6], done: 11.6 },
    { el: $('#cGen'), steps: [26.1], done: 36.6 },
    { el: $('#cUp'), steps: [54.0, 56.0, 58.5], done: 58.5 },
  ].map((c) => ({ ...c, lbls: $$('.lbl', c.el), spin: $('.spin', c.el), ok: $('.ok', c.el) }));
  const ytName = $('#ytName');
  const ticks = $$('.tick').map((el) => ({ el, at: +el.dataset.at }));
  const vcs = ['A', 'B', 'C'].map((L, i) => {
    const el = $('#vc' + L);
    return { el, thw: $('.thw', el), th: $('.thw > .th', el), sk: $('.sk', el), pct: $('.pct', el), ob: $('.ob', el), ring: $('.ring', el), sel: $('.sel', el), gs: 29.9 + i * .25, rev: 36.8 + i * .4, n: -1 };
  });
  const res = $('#res'), openBtn = $('#openBtn');
  const row1Thumb = $('#row1Thumb'), row1Hl = $('#row1Hl'), tcBadge = $('#tcBadge'), snack = $('#snack');
  const endMark = $('#endMark'), endH1 = $('#s-end h1'), endP = $('#s-end p');
  const cursor = $('#cursor'), ripple = $('#ripple'), cue = $('#cue'), toastEl = $('#toast');

  if (window.sbMarkLive) {
    window.sbMarkLive('#heroMark', { size: 62 });
    window.sbMarkLive('#endMark', { size: 200, interactive: false });
  }

  function measure() {
    items.forEach((it) => { it.el.style.height = 'auto'; it.h = it.el.offsetHeight; });
  }

  function stream(s, t) {
    const n = Math.round(s.text.length * P(t, s.a, s.b - s.a));
    if (n === s.n) return;
    s.n = n;
    s.el.innerHTML = esc(s.text.slice(0, n)) + '<span class="h">' + esc(s.text.slice(n)) + '</span>';
  }

  function chip(c, t) {
    c.el.classList.toggle('done', t >= c.done);
    const sh = `${100 - frac((t - c.steps[0]) / 1.8) * 150}% 0`;
    c.lbls.forEach((l, i) => {
      const a = c.steps[i], b = c.steps[i + 1] ?? Infinity;
      l.style.opacity = i === 0 ? 1 - fin(t, b, .3) : Math.min(fin(t, a, .3), 1 - fin(t, b, .3));
      l.style.backgroundPosition = sh;
    });
    const k = P(t, c.done, .3);
    c.spin.style.opacity = 1 - k;
    c.spin.style.transform = `rotate(${t * 420}deg)`;
    c.ok.style.opacity = k;
    c.ok.style.transform = `scale(${.5 + .5 * eb(k)})`;
  }

  function renderComposer(t) {
    const dock = eio(P(t, SEND1, .7));
    composer.style.top = lerp(474, 914, dock).toFixed(2) + 'px';
    let txt = '';
    if (t < SEND1 + .1) txt = P1.slice(0, T1(t));
    else if (t >= 47 && t < SEND2 + .1) txt = P2.slice(0, T2(t));
    typed.textContent = txt;
    const att = t >= 43.2 && t < SEND2 + .1;
    attIn.style.display = att ? 'inline-flex' : 'none';
    attIn.style.opacity = fin(t, 43.2, .3);
    ph.style.opacity = txt || att ? 0 : 1;
    if (started) {
      const typing = (t > .5 && t < SEND1) || (t > 47.4 && t < SEND2);
      caret.style.opacity = typing || frac(t / 1.05) < .5 ? 1 : 0;
    }
    send.classList.toggle('on', !!txt || att);
    send.style.transform = `scale(${press(t, SEND1) * press(t, SEND2)})`;
    // model pill: Auto -> ChatGPT -> GPT Image 2 -> ChatGPT
    const mt = [0, 7.0, 26.1, 37.0], mi = [0, 1, 2, 1];
    let j = 0;
    while (j + 1 < mt.length && t >= mt[j + 1]) j++;
    const k = j ? fin(t, mt[j], .3) : 1;
    models.forEach((m, i) => { m.style.opacity = i === mi[j] ? k : j && i === mi[j - 1] ? 1 - k : 0; });
    cModel.style.transform = j ? `scale(${1 + .08 * Math.sin(Math.PI * P(t, mt[j], .35))})` : '';
  }

  function renderFeed(t) {
    items.forEach((it) => {
      const k = eio(P(t, it.tin, .55));
      it.el.style.height = (it.h * k).toFixed(2) + 'px';
      it.el.style.overflow = k < 1 ? 'hidden' : 'visible';
      const k2 = eo(P(t, it.tin + .1, .5));
      it.inner.style.opacity = k2;
      it.inner.style.transform = `translateY(${((1 - k2) * 16).toFixed(2)}px)`;
    });
    chips.forEach((c) => chip(c, t));
    ytName.style.opacity = fin(t, 11.7, .3);
    ticks.forEach((x) => { const k = fin(t, x.at, .35); x.el.style.opacity = k; x.el.style.transform = `scale(${.9 + .1 * eb(k)})`; });
    says.forEach((s) => stream(s, t));
    vcs.forEach((v, i) => {
      const p = Math.round(eio(P(t, v.gs, v.rev - .2 - v.gs)) * 100);
      if (p !== v.n) { v.pct.textContent = p + '%'; v.n = p; }
      v.sk.style.setProperty('--sh', `${100 - frac((t - v.gs) / 1.6) * 160}%`);
      const r = fin(t, v.rev, .5);
      v.sk.style.opacity = 1 - r;
      v.th.style.opacity = r;
      v.th.style.transform = `scale(${1.05 - .05 * r})`;
      const picked = fin(t, 42.8, .2);
      v.ob.style.opacity = r * (i === 1 ? 1 - picked : 1);
      v.el.style.opacity = i === 1 ? 1 : 1 - .5 * fin(t, 43.0, .4);
      v.el.style.transform = i === 1 ? `translateY(${-4 * fin(t, 42.2, .3)}px)` : '';
      if (i === 1) {
        v.ring.style.opacity = picked;
        const s = fin(t, 42.85, .35);
        v.sel.style.opacity = s;
        v.sel.style.transform = `scale(${.4 + .6 * eb(s)})`;
      }
    });
    const rk = fin(t, 60.0, .45);
    res.style.opacity = rk;
    res.style.transform = `translateY(${(1 - rk) * 12}px)`;
    openBtn.style.transform = `scale(${press(t, 61.6)})`;
  }

  function renderScenes(t) {
    hero.style.opacity = 1 - fin(t, SEND1, .35);
    hero.style.transform = `translateX(-50%) translateY(${-24 * fin(t, SEND1, .5)}px)`;
    subs.style.opacity = 1 - fin(t, SEND1 - .1, .3);
    const out = eio(P(t, 62.3, .6));
    sChat.style.opacity = 1 - out;
    sChat.style.transform = out ? `scale(${1 - .02 * out})` : '';
    const st = eio(P(t, 62.4, .6));
    sStudio.style.opacity = st;
    sStudio.style.visibility = st > 0 ? 'visible' : 'hidden';
    sStudio.style.transform = `scale(${1.02 - .02 * st})`;
    row1Hl.style.opacity = Math.min(fin(t, 64.0, .3), 1 - fin(t, 67.6, .4)) * (.82 + .18 * Math.cos((t - 64) * 5));
    const tb = fin(t, 64.4, .35);
    tcBadge.style.transform = `scale(${t < 64.4 ? 1 : 1 + .1 * Math.sin(Math.PI * tb)})`;
    const sn = Math.min(fin(t, 64.8, .35), 1 - fin(t, 67.6, .3));
    snack.style.opacity = sn;
    snack.style.transform = `translateY(${(1 - sn) * 20}px)`;
    const e = fin(t, 68.0, .5);
    sEnd.style.opacity = e;
    sEnd.style.visibility = e > 0 ? 'visible' : 'hidden';
    endMark.style.transform = `scale(${.6 + .4 * eb(P(t, 68.1, .6))})`;
    const h = fin(t, 68.3, .5), pk = fin(t, 68.7, .5);
    endH1.style.opacity = h;
    endH1.style.transform = `translateX(${(1 - h) * -40}px)`;
    endP.style.opacity = pk;
    endP.style.transform = `translateY(${(1 - pk) * 12}px)`;
  }

  // ---------- pointer ----------
  let click = { x: 960, y: 537 };
  function center(el) {
    const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - s.left) / scale, y: (r.top + r.height / 2 - s.top) / scale };
  }
  const legs = [
    { a: 40.4, b: 44.6, from: [1560, 1010], el: vcs[1].thw, m0: 41.0, md: 1.25, press: 42.8 },
    { a: 60.5, b: 62.4, from: [1520, 1000], el: openBtn, m0: 60.7, md: .8, press: 61.6 },
    { a: 63.0, b: 67.8, from: [1240, 820], el: row1Thumb, m0: 63.2, md: .9, press: -1, dx: -52, dy: 26 },
  ];
  function cursorAt(t) {
    if (t < 1.3) return { ...click, o: 1 - fin(t, .8, .45), s: press(t, .02) };
    for (const L of legs) {
      if (t < L.a || t >= L.b) continue;
      const c = center(L.el), k = eio(P(t, L.m0, L.md));
      return { x: lerp(L.from[0], c.x + (L.dx || 0), k), y: lerp(L.from[1], c.y + (L.dy || 0), k), o: Math.min(fin(t, L.a, .3), 1 - fin(t, L.b - .4, .4)), s: press(t, L.press) };
    }
    return null;
  }
  const presses = [.02, 42.8, 61.6];
  function renderPointer(t) {
    const c = started ? cursorAt(t) : null;
    cursor.style.opacity = c ? c.o : 0;
    if (c) cursor.style.transform = `translate(${(c.x - 9.5).toFixed(1)}px, ${(c.y - 4.75).toFixed(1)}px) scale(${c.s})`;
    const p = started ? presses.find((x) => t >= x && t < x + .55) : undefined;
    if (p === undefined) { ripple.style.opacity = 0; return; }
    const at = cursorAt(p + .001) || click, k = P(t, p, .55);
    ripple.style.left = at.x + 'px';
    ripple.style.top = at.y + 'px';
    ripple.style.opacity = .9 * (1 - k);
    ripple.style.transform = `scale(${.3 + 1.1 * eo(k)})`;
  }

  function render(t) {
    renderComposer(t);
    renderFeed(t);
    renderScenes(t);
    renderPointer(t);
  }

  // ---------- prompter ----------
  const C = window.SB_CUES || { pre: [], timed: [] };
  let lastCue = '';
  function renderCue(t) {
    if (!cue.classList.contains('on')) return;
    let html;
    if (!started) {
      html = '<small>Before the click</small><ol>' + C.pre.map((l) => `<li>${esc(l)}</li>`).join('') + '</ol><span class="nx">Then click the screen</span>';
    } else {
      const cur = C.timed.find((c) => t >= c.a && t < c.b), nxt = C.timed.find((c) => c.a > t);
      const now = cur ? cur.text : nxt ? `Next at ${nxt.a.toFixed(1)}s: ${nxt.text}` : '';
      html = `<small>${t.toFixed(1)}s${paused ? ' · paused' : ''}</small>${esc(now)}` + (cur && nxt ? `<span class="nx">Next at ${nxt.a.toFixed(1)}s: ${esc(nxt.text)}</span>` : '');
    }
    if (html !== lastCue) { cue.innerHTML = html; lastCue = html; }
  }
  if (qs.get('cues') === '1') cue.classList.add('on');

  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 1100);
  }

  // ---------- clock + controls ----------
  let started = false, paused = false, t = 0, last = performance.now();
  let speed = clamp(+(qs.get('speed') || 1) || 1, .5, 1.5);
  const frozen = qs.has('t');
  // ?autoplay=1 (gallery tile): start without a click and loop, holding the end card 2.5 s
  const autoplay = qs.get('autoplay') === '1';
  let endAt = 0;
  function start(x, y) {
    if (started) return;
    started = true;
    paused = false;
    t = 0;
    if (x != null) click = { x, y };
    document.body.classList.remove('idle');
    document.body.classList.add('playing');
  }
  function reset() {
    started = false;
    paused = false;
    t = 0;
    document.body.classList.add('idle');
    document.body.classList.remove('playing');
    caret.style.opacity = '';
    render(0);
  }
  stage.addEventListener('click', (e) => {
    if (started) return;
    const s = stage.getBoundingClientRect();
    start((e.clientX - s.left) / scale, (e.clientY - s.top) / scale);
  });
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!started) start();
      else { paused = !paused; toast(paused ? 'Paused' : 'Playing'); }
    } else if (e.key === 'r' || e.key === 'R') reset();
    else if (e.key === 'ArrowRight') { if (!started) start(); t = Math.min(CYCLE, t + 2); }
    else if (e.key === 'ArrowLeft') t = Math.max(0, t - 2);
    else if (e.key === 'c' || e.key === 'C') cue.classList.toggle('on');
    else if (e.key === ']' || e.key === '[') {
      speed = clamp(+(speed + (e.key === ']' ? .05 : -.05)).toFixed(2), .5, 1.5);
      toast(`Speed ${speed.toFixed(2)}x`);
    }
  });

  if (frozen) { start(); t = clamp(+qs.get('t') || 0, 0, CYCLE); }

  function loop(now) {
    const dt = Math.min(.1, (now - last) / 1000);
    last = now;
    if (started && !paused && !frozen) t = Math.min(CYCLE, t + dt * speed);
    if (autoplay && started && !paused && t >= CYCLE) {
      endAt = endAt || now;
      if (now - endAt > 2500) { endAt = 0; reset(); setTimeout(() => start(), 1200); }
    }
    render(started ? t : 0);
    renderCue(t);
    requestAnimationFrame(loop);
  }

  window.__AD = {
    ready: false,
    CYCLE,
    seek(x) { if (!started) start(); paused = true; t = clamp(x, 0, CYCLE); render(t); },
    start,
    reset,
    get t() { return t; },
  };
  document.fonts.ready.then(() => {
    measure();
    render(started ? t : 0);
    window.__AD.ready = true;
    last = performance.now();
    requestAnimationFrame(loop);
    if (autoplay && !frozen) setTimeout(() => start(), 1200);
  });
})();
