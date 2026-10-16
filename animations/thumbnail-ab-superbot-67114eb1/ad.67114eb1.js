/* Click-to-start timeline for the superbot thumbnail spot. render(d) writes every moving value from the
   DESIGN time d, the beat literals below and in index.html; warp() maps the real clock (seconds since the
   click, what cues.67114eb1.js is timed in) onto it, so playback, seek and headless renders share frames. */
(() => {
  'use strict';
  const qs = new URLSearchParams(location.search);
  // [real s, design s]: prompts type ~3x faster than the design, holds between lines are trimmed, the
  // latest-upload card (design 13.4 to 25.9) plays ~2.5x, the second prompt starts typing 0.35 s after the
  // copied thumbnail is pasted (design 43.4 to 47.6), and the rest gets ~0.44 s a spoken word.
  // One run is 45.2 s after the click.
  const KNOTS = [[0, 0], [.3, .6], [1.55, 4.3], [2.55, 5.6], [6.25, 10.2], [8.91, 13.4], [13, 25.9], [16.3, 30],
    [20.3, 36.8], [25.63, 43.4], [25.98, 47.6], [27.65, 52.6], [28.05, 53.2], [33.65, 61.2], [39.45, 68], [42.75, 72], [45.15, 75]];
  const CYCLE = KNOTS[KNOTS.length - 1][0];
  function warp(r) {
    for (let i = 1; i < KNOTS.length; i++) {
      const [r0, d0] = KNOTS[i - 1], [r1, d1] = KNOTS[i];
      if (r <= r1) return d0 + (d1 - d0) * Math.max(0, (r - r0) / (r1 - r0));
    }
    return KNOTS[KNOTS.length - 1][1];
  }
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
  const sEnd = $('#s-end');
  const hero = $('#hero');
  const composer = $('#composer'), typed = $('#typed'), caret = $('#caret'), ph = $('#cPh'), send = $('#send'), attIn = $('#attIn');
  const cModel = $('#cModel'), models = $$('#cModel .m');
  const items = $$('#feedIn > .it').map((el) => ({ el, inner: el.firstElementChild, tin: +el.dataset.in, h: 0 }));
  const says = $$('.say').map((el) => ({ el, text: el.textContent, a: +el.dataset.a, b: +el.dataset.b, n: -1 }));
  const chips = [
    { el: $('#cSw'), steps: [5.6], done: 7.0 },
    { el: $('#cYt'), steps: [10.4, 11.6], done: 11.6 },
    { el: $('#cGen'), steps: [26.1], done: 38.1 },
    { el: $('#cUp'), steps: [54.0, 56.0, 58.5], done: 58.5 },
  ].map((c) => ({ ...c, lbls: $$('.lbl', c.el), spin: $('.spin', c.el), ok: $('.ok', c.el) }));
  // each variant is its own job: its own start, a stall at a different point (w = share done before it),
  // and they land out of order, C then A then B
  const GEN = [
    { gs: 30.1, rev: 37.3, w: .4, d1: 1.6, hold: 1.8 },
    { gs: 30.6, rev: 38.1, w: .7, d1: 3.4, hold: .7 },
    { gs: 29.9, rev: 36.4, w: .62, d1: 2.0, hold: 1.1 },
  ];
  const vcs = ['A', 'B', 'C'].map((L, i) => {
    const el = $('#vc' + L);
    return { el, th: $('.thw > .th', el), sk: $('.sk', el), pct: $('.pct', el), ob: $('.ob', el), cp: $('.ob .cp', el), ck: $('.ob .ck', el), ...GEN[i], n: -1 };
  });
  const res = $('#res');
  const endMark = $('#endMark'), endH1 = $('#s-end h1'), endP = $('#s-end p');
  const cue = $('#cue'), toastEl = $('#toast');

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
    const mt = [0, 7.0, 26.1, 38.2], mi = [0, 1, 2, 1];
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
    says.forEach((s) => stream(s, t));
    vcs.forEach((v, i) => {
      // the percent updates in uneven ~0.23 s polls, phase-shifted per card
      const tq = t - frac((t + i * .09) / .23) * .23, d2 = v.rev - .2 - v.gs - v.d1 - v.hold;
      const p = Math.round((v.w * eio(P(tq, v.gs, v.d1)) + (1 - v.w) * eio(P(tq, v.gs + v.d1 + v.hold, d2))) * 100);
      if (p !== v.n) { v.pct.textContent = p + '%'; v.n = p; }
      v.sk.style.setProperty('--sh', `${100 - frac((t - v.gs) / 1.6) * 160}%`);
      const r = fin(t, v.rev, .5);
      v.sk.style.opacity = 1 - r;
      v.th.style.opacity = r;
      v.th.style.transform = `scale(${1.05 - .05 * r})`;
      v.ob.style.opacity = r;
      if (i === 1) {
        // B's copy button is pressed: it fills green with a white check while the image pastes, then settles back
        v.ob.style.transform = `scale(${press(t, 42.8)})`;
        const c = Math.min(fin(t, 42.85, .15), 1 - fin(t, 48.5, .3));
        v.ob.style.background = `rgba(${lerp(12, 35, c).toFixed(0)}, ${lerp(12, 165, c).toFixed(0)}, ${lerp(14, 89, c).toFixed(0)}, ${lerp(.72, 1, c).toFixed(2)})`;
        v.cp.style.opacity = 1 - c;
        v.ck.style.opacity = c;
      }
    });
    const rk = fin(t, 60.0, .45);
    res.style.opacity = rk;
    res.style.transform = `translateY(${(1 - rk) * 12}px)`;
  }

  function renderScenes(t) {
    hero.style.opacity = 1 - fin(t, SEND1, .35);
    hero.style.transform = `translateX(-50%) translateY(${-24 * fin(t, SEND1, .5)}px)`;
    // the finished chat holds while the presenter shows their own channel, then the end card
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


  function render(t) {
    renderComposer(t);
    renderFeed(t);
    renderScenes(t);
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
      html = `<small>${t.toFixed(1)}s</small>${esc(now)}` + (cur && nxt ? `<span class="nx">Next at ${nxt.a.toFixed(1)}s: ${esc(nxt.text)}</span>` : '');
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
  // One click starts it; after that it runs straight to the end card and later clicks do nothing.
  // `held` is only set by __AD.seek, so headless renders can step frame by frame.
  let started = false, held = false, t = 0, last = performance.now();
  let speed = clamp(+(qs.get('speed') || 1) || 1, .5, 1.5);
  const frozen = qs.has('t');
  // ?autoplay=1 (gallery tile): start without a click and loop, holding the end card 2.5 s
  const autoplay = qs.get('autoplay') === '1';
  let endAt = 0;
  function start() {
    if (started) return;
    started = true;
    held = false;
    t = 0;
    document.body.classList.remove('idle');
    document.body.classList.add('playing');
  }
  function reset() {
    started = false;
    held = false;
    t = 0;
    document.body.classList.add('idle');
    document.body.classList.remove('playing');
    caret.style.opacity = '';
    render(0);
  }
  stage.addEventListener('click', start);
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      start();
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
    if (started && !held && !frozen) t = Math.min(CYCLE, t + dt * speed);
    if (autoplay && started && !held && t >= CYCLE) {
      endAt = endAt || now;
      if (now - endAt > 2500) { endAt = 0; reset(); setTimeout(start, 1200); }
    }
    render(started ? warp(t) : 0);
    renderCue(t);
    requestAnimationFrame(loop);
  }

  window.__AD = {
    ready: false,
    CYCLE,
    seek(x) { start(); held = true; t = clamp(x, 0, CYCLE); render(warp(t)); },
    start,
    reset,
    warp,
    get t() { return t; },
  };
  document.fonts.ready.then(() => {
    measure();
    render(started ? warp(t) : 0);
    window.__AD.ready = true;
    last = performance.now();
    requestAnimationFrame(loop);
    if (autoplay && !frozen) setTimeout(start, 1200);
  });
})();
