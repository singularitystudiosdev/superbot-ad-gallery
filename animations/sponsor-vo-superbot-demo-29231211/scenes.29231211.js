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
  /* Studio's auto-generated stills and the current thumbnail are frames of the video (the creator on camera),
     not the new art */
  $$('.st-auto img, .st-player-old').forEach((img) => { img.src = 'assets/avatar.jpg'; });

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
        /* fixed framing, no zoom: the page scrolls to the Videos grid and the cursor points at the new upload */
        yt.style.transform = `scale(${B.toFixed(5)})`;
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
