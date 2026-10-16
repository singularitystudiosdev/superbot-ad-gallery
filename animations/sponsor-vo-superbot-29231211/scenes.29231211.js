/* scenes.29231211.js: the explainer scenes (sponsor, subscriptions, providers, $50), the channel check and the
   end card. Each render(t) writes every value from t; beats are keyed to spoken words with W(line, word). */
(() => {
  'use strict';
  const { $, $$, Q, W, L, set, rise, P, easeOut, easeIn, easeInOut, back, lerp, clamp } = window.SBX;
  const scenes = window.SB_SCENES = window.SB_SCENES || [];

  /* crossfade between scenes at line boundaries */
  function sceneIn(el, t, a, b) {
    const kin = a < 0 ? 1 : easeOut(P(t, a, 0.5));
    const kout = easeIn(P(t, b, 0.4));
    const o = Math.min(kin, 1 - kout);
    set(el, { o, s: lerp(1.025, 1, kin) * lerp(1, 0.975, kout) });
    return o > 0.002;
  }
  window.SBX.sceneIn = sceneIn;

  /* offset of el inside root, unaffected by transforms */
  function posIn(el, root) {
    let x = 0, y = 0, n = el;
    while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 };
  }
  window.SBX.posIn = posIn;

  function liveMark(el, size) {
    if (typeof window.sbMarkLive !== 'function') {
      console.error('[sb] sbMarkLive missing, using the static cat');
      el.innerHTML = `<span class="qc-tile qc-t-sb" style="width:${size}px;height:${size}px;border-radius:${size * 0.29}px"><span class="cat"></span></span>`;
      return { happy() {} };
    }
    return window.sbMarkLive(el, { size, interactive: false });
  }
  window.SBX.liveMark = liveMark;
  /* fire a side effect once when t crosses at, re-armed when t goes back */
  const once = (state, key, t, at, fn) => { if (t >= at && !state[key]) { state[key] = true; fn(); } else if (t < at) state[key] = false; };

  /* ---------- creator params: ?pick ?channel ?handle ?title ---------- */
  const PICKS = ['assets/thumb-nb2.jpg', 'assets/thumb-gpt.jpg', 'assets/thumb-flux.jpg'];
  const pick = clamp(Number.isFinite(+Q.get('pick')) && Q.get('pick') !== null ? +Q.get('pick') : 1, 0, 2) | 0;
  window.SBX.pick = pick;
  const channel = Q.get('channel') || 'Creator Lab';
  const handle = '@' + (Q.get('handle') || 'creatorlab').replace(/^@/, '');
  const title = Q.get('title') || 'I Let AI Run My Channel for 30 Days';
  $$('.js-pick').forEach((img) => { img.src = PICKS[pick]; });
  $$('.js-channel').forEach((el) => { el.textContent = channel; });
  $$('.js-handle').forEach((el) => { el.textContent = handle; });
  $$('.js-title').forEach((el) => { el.textContent = title; });
  $('#tri .bk-title small').textContent = `“${title}”`;
  /* Studio's auto-generated stills and the current thumbnail are frames of the video (the creator on camera),
     not the new art */
  $$('.st-auto img, .st-player-old').forEach((img) => { img.src = 'assets/avatar.jpg'; });

  /* ---------- L1 sponsor ---------- */
  {
    const el = $('#s-intro'), kicker = $('#intro-kicker'), word = $('#intro-word'), markEl = $('#intro-mark');
    kicker.innerHTML = kicker.textContent.split(' ').map((w) => `<span style="display:inline-block">${w}</span>`).join(' ');
    const kw = $$('span', kicker);
    let mark = null;
    const fx = {};
    scenes.push({
      init() { mark = liveMark(markEl, 200); },
      render(t) {
        if (!sceneIn(el, t, -1, L('subs').start)) return;
        const keys = ['a', 'word', 'from', 'our', 'sponsor'];
        kw.forEach((s, i) => rise(s, t, W('sponsor', keys[i]) - 0.08, { d: 0.35, y: 10 }));
        const at = W('sponsor', 'superbot');
        rise(markEl, t, at - 0.45, { d: 0.7, s: 0.55, y: 0, spring: true });
        rise(word, t, at - 0.12, { d: 0.55, y: 34 });
        once(fx, 'happy', t, at, () => mark && mark.happy());
      },
    });
  }

  /* ---------- L2 subscriptions vs API pricing ---------- */
  {
    const el = $('#s-subs'), head = $('#subs-h'), hub = $('#hub'), ring = $('.hub-ring', hub), tag = $('#hub-tag');
    const subs = $$('.sub', el), wires = $$('.wire', el), rivals = $$('.rival', el);
    wires.forEach((w) => { w.setAttribute('pathLength', '1'); w.style.strokeDasharray = '1'; });
    scenes.push({
      render(t) {
        const l = L('subs');
        if (!sceneIn(el, t, l.start, L('prov').start)) return;
        rise(hub, t, l.start + 0.05, { d: 0.7, s: 0.7, y: 0, spring: true });
        const f = ((t - l.start) % 1.8) / 1.8;
        set(ring, { o: t > l.start + 0.5 ? (1 - f) * 0.9 : 0, s: 1 + f * 0.28 });
        rise(head, t, W('subs', 'agent') - 0.15, { y: 22 });
        const c0 = W('subs', 'connects');
        subs.forEach((s, i) => {
          const k = easeOut(P(t, c0 + i * 0.2, 0.5));
          set(s, { o: k, x: (1 - k) * -46 });
          wires[i].style.strokeDashoffset = 1 - easeInOut(P(t, c0 + i * 0.2 + 0.2, 0.55));
          set($('.sub-st', s), { o: easeOut(P(t, W('subs', 'subscriptions') + i * 0.14, 0.3)) });
        });
        const strikeAt = W('subs', "don't");
        rivals.forEach((r, i) => {
          const a = W('subs', i ? 'devin' : 'perplexity') - 0.12;
          const k = easeOut(P(t, a, 0.5));
          const dim = easeOut(P(t, strikeAt + i * 0.12 + 0.3, 0.4));
          set(r, { o: k * lerp(1, 0.42, dim), x: (1 - k) * 46 });
          $('.meter i', r).style.width = `${(easeOut(P(t, a + 0.2, 2.6)) * 100).toFixed(1)}%`;
          $('.strike', r).style.transform = `scaleX(${easeOut(P(t, strikeAt + i * 0.12, 0.35)).toFixed(3)})`;
        });
        rise(tag, t, W('subs', 'billed') - 0.1, { d: 0.5, s: 0.85, y: 8, spring: true });
      },
    });
  }

  /* ---------- L3 providers, billed in credits ---------- */
  {
    const el = $('#s-prov'), head = $('#prov-h'), credits = $('#credits');
    const provs = $$('.prov', el), more = $$('.mtile', el);
    const tiles = provs.concat(more);
    let off = [];
    scenes.push({
      init() {
        off = tiles.map((n) => { const p = posIn(n, el); return { dx: 960 - p.cx, dy: 542 - p.cy }; });
      },
      render(t) {
        const l = L('prov');
        if (!sceneIn(el, t, l.start, L('fifty').start)) return;
        rise(head, t, W('prov', 'hooks') - 0.15, { y: 22, out: W('prov', 'only') + 0.1 });
        const keys = ['elevenlabs', 'higgsfield', 'meshy', 'fal.ai'];
        const c0 = W('prov', 'only') - 0.05;
        tiles.forEach((n, i) => {
          const a = i < 4 ? W('prov', keys[i]) - 0.14 : W('prov', 'anything') + (i - 4) * 0.08;
          const kin = P(t, a, 0.5);
          const o = easeOut(P(t, a, 0.3));
          const kc = easeInOut(P(t, c0 + i * 0.035, 0.55));
          const fade = 1 - easeIn(P(t, c0 + i * 0.035 + 0.3, 0.25));
          set(n, {
            o: o * fade,
            x: off[i] ? off[i].dx * kc : 0,
            y: (1 - easeOut(kin)) * 30 + (off[i] ? off[i].dy * kc : 0),
            s: lerp(0.86, 1, back(kin)) * lerp(1, 0.25, kc),
          });
        });
        rise(credits, t, W('prov', 'billed') - 0.2, { d: 0.6, s: 0.72, y: 0, spring: true });
        const chip = $('.cr-chip', credits);
        const kc = P(t, W('prov', 'credits') - 0.05, 0.4);
        set(chip, { s: kc > 0 && kc < 1 ? 1 + Math.sin(kc * Math.PI) * 0.12 : 1 });
      },
    });
  }

  /* ---------- L4 $50 ---------- */
  {
    const el = $('#s-fifty'), k = $('#fifty-k'), num = $('.fifty-num', el), n = $('#fifty-n'), sub = $('#fifty-sub');
    scenes.push({
      render(t) {
        const l = L('fifty');
        if (!sceneIn(el, t, l.start, L('ask').start)) return;
        rise(k, t, l.start + 0.1, { y: 14 });
        const at = W('fifty', '$50');
        rise(num, t, at - 0.4, { d: 0.7, s: 0.78, y: 0, spring: true });
        n.textContent = String(Math.round(50 * easeOut(P(t, at - 0.35, 0.75))));
        rise(sub, t, W('fifty', 'worth') - 0.1, { y: 22 });
      },
    });
  }

  /* ---------- L11 the real channel ---------- */
  {
    const el = $('#s-chan'), yt = $('#yt'), scroll = $('#yt-scroll'), card = $('#yt-new'), ring = $('#yt-ring');
    const thumb = $('#yt-new .yt-th img'), cursor = $('#yt-cursor');
    const B = 1920 / 1470;
    scenes.push({
      render(t) {
        const l = L('check');
        if (!sceneIn(el, t, l.start, L('cta').start)) return;
        const grid = posIn($('.yt-grid', el), scroll);
        const sy = (grid.y - 64) * easeInOut(P(t, W('check', 'channel') - 0.25, 0.8));
        scroll.style.transform = `translateY(${(-sy).toFixed(1)}px)`;
        const c = posIn(card, yt);
        const fx = c.cx, fy = c.cy - sy;
        const kz = easeInOut(P(t, W('check', 'see') - 0.3, 0.9));
        const s = B * lerp(1, 1.85, kz);
        const tx = clamp(lerp(0, 960 - fx * B * 1.85, kz), 1920 - 1470 * s, 0);
        const ty = clamp(lerp(0, 540 - fy * B * 1.85, kz), 1080 - 827 * s, 0);
        yt.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
        const th = posIn($('.yt-th', card), yt);
        const a = W('check', 'yeah') - 0.2;
        const k = easeInOut(P(t, a, 0.75));
        const x = lerp(1180, th.x + th.w * 0.62, k), y = lerp(720, th.y + th.h * 0.55 - sy, k);
        set(cursor, { o: Math.min(easeOut(P(t, l.start + 0.3, 0.3)), 1), x, y });
        const hov = easeOut(P(t, a + 0.75, 0.3));
        thumb.style.transform = `scale(${lerp(1, 1.04, hov).toFixed(4)})`;
        const pulse = P(t, W('check', 'uploaded') - 0.3, 0.6);
        set(ring, { o: easeOut(P(t, W('check', 'see') - 0.1, 0.35)) * (0.75 + 0.25 * Math.sin(pulse * Math.PI)) });
      },
    });
  }

  /* ---------- L12 end card ---------- */
  {
    const el = $('#s-end'), markEl = $('#end-mark'), url = $('#end-url'), offer = $('#end-offer'), link = $('#end-link');
    const arrow = $('i', link);
    let mark = null;
    const fx = {};
    scenes.push({
      init() { mark = liveMark(markEl, 180); },
      render(t) {
        const l = L('cta');
        if (!sceneIn(el, t, l.start, Infinity)) return;
        rise(markEl, t, l.start + 0.05, { d: 0.7, s: 0.6, y: 0, spring: true });
        const at = W('cta', 'superbot.gg');
        rise(url, t, at - 0.25, { d: 0.55, y: 34 });
        once(fx, 'happy', t, at, () => mark && mark.happy());
        rise(offer, t, W('cta', '$50') - 0.2, { d: 0.6, s: 0.8, y: 0, spring: true });
        const la = W('cta', 'link') - 0.2;
        rise(link, t, la, { y: 20 });
        set(arrow, { y: t > la ? Math.abs(Math.sin((t - la) * 4.2)) * 9 : 0 });
      },
    });
  }
})();
