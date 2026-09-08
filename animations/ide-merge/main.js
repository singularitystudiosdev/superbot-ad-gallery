/* superbot · the IDE merge — one master rAF clock, dt-clamped.
   Timeline (the build brief's beat table): white pop-in → background flips to
   black mid-orbit → 3D ellipse orbit with ghost/streak motion blur → tiles are
   absorbed one by one into the center ring (brand-color hand-off + trail arcs)
   → white flash + shockwaves + ASCII sparkle burst → per-glyph mascot reveal
   (the verbatim engine in index.html keeps its own live loop underneath) →
   ambient twinkles + idle + replay.
   Click anywhere (except on the mascot) to replay. ?t=<seconds> freezes the
   master clock there for screenshot verification (theta is fast-forwarded).
   Only transform / opacity / filter animate on the tiles. */
(function () {
  'use strict';

  // ---------- timeline (seconds) — beat table, brief verbatim ----------
  var T = {
    popStart: 0.3, popStagger: 0.17, popDur: 0.52, // pop-in on WHITE, backOut 1.7
    bgFlip: 2.08, bgFlipDur: 0.9,                  // white -> #050505 crossfade, mid-orbit
    orbitStart: 2.05, w0: 0.4, w1: 8.5,            // omega ramps 0.4 -> 8.5 rad/s (easeIn)
    collapseStart: 4.65, collapseStagger: 0.04, collapseDur: 0.62,
    flashAt: 5.55, flashDur: 0.46, shock2Delay: 0.09,
    sparkleAt: 5.72,
    glowPulse0: 5.85,                              // hatch pulse 0.55 -> 0.80, decay 300ms
    fillAt: 5.90, fillDur: 0.40,                   // ring inner fill fades in
    revealStart: 5.85, colStagger: 0.035,          // per-column reveal stagger
    idleAt: 7.3,
  };
  var ANTIC = 0.09;          // anticipation window (0.145 of the 620ms collapse)
  var W_PEAK = 13.7;         // omega boost peak at collapseStart + 280ms
  var W_DECAY_BASE = 2.2, TAU = 0.22;
  var W_IDLE = 0.35;         // idle spin
  var W_AT_REVEAL = W_DECAY_BASE + (W_PEAK - W_DECAY_BASE) * Math.exp(-(T.revealStart - T.collapseStart - 0.28) / TAU);

  // ---------- easing / math ----------
  function clamp01(u) { return u < 0 ? 0 : u > 1 ? 1 : u; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function easeOutCubic(u) { u = clamp01(u); return 1 - Math.pow(1 - u, 3); }
  function easeInCubic(u) { u = clamp01(u); return u * u * u; }
  function easeInQuad(u) { u = clamp01(u); return u * u; }
  function easeInQuart(u) { u = clamp01(u); return u * u * u * u; }
  function easeInOutCubic(u) {
    u = clamp01(u);
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  function easeOutBack(u, s) { // overshoot param s (~1.7 -> peak ~1.10)
    s = s ?? 1.70158;
    u = clamp01(u) - 1;
    return 1 + (s + 1) * u * u * u + s * u * u;
  }
  function smoothstep(a, b, x) {
    var u = clamp01((x - a) / (b - a));
    return u * u * (3 - 2 * u);
  }
  function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  function mixRgb(a, b, u) {
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  }
  function rgbaStr(c, a) {
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')';
  }

  // ---------- omega profile ----------
  // 0.4 -> 8.5 easeIn up to collapse start, boost to 13.7 by +280ms, exp decay
  // tau=220ms to ~2.9 at the flash, then ease to the 0.35 rad/s idle spin.
  function omegaAt(t) {
    if (t < T.orbitStart) return 0;
    if (t < T.collapseStart) return T.w0 + (T.w1 - T.w0) * easeInQuad((t - T.orbitStart) / (T.collapseStart - T.orbitStart));
    if (t < T.collapseStart + 0.28) return T.w1 + (W_PEAK - T.w1) * easeInQuad((t - T.collapseStart) / 0.28);
    if (t < T.revealStart) return W_DECAY_BASE + (W_PEAK - W_DECAY_BASE) * Math.exp(-(t - T.collapseStart - 0.28) / TAU);
    if (t < T.revealStart + 0.55) return lerp(W_AT_REVEAL, W_IDLE, easeInOutCubic((t - T.revealStart) / 0.55));
    return W_IDLE;
  }
  // blurGain = smoothstep(1.5,4,w)*0.7 + smoothstep(4,7,w)*0.3 — zero work at 0
  function blurGainFor(w) {
    return smoothstep(1.5, 4, w) * 0.7 + smoothstep(4, 7, w) * 0.3;
  }

  // ---------- icon tiles + absorption order ----------
  // PNG 1:1 brand icons in assets/icons; accents hand-picked per brand.
  // Absorption order: the two whites lead (tau 520ms treatment), blues follow,
  // warm Claude, teal Codex — and the accent-adjacent mint (Windsurf) lands last.
  var ICONS = [
    { name: 'Cursor',     file: 'cursor.png',      accent: '#f7f7f7', white: true },
    { name: 'Hermes',     file: 'hermes.png',      accent: '#ffffff', white: true },
    { name: 'Windsurf',   file: 'windsurf.png',    accent: '#3DDC97' },
    { name: 'VS Code',    file: 'vscode.png',      bg: '#007ACC', accent: '#007ACC' },
    { name: 'Zed',        file: 'zed.png',         accent: '#084CCF' },
    { name: 'Claude Code', file: 'claude-code.png', accent: '#D97757' },
    { name: 'Codex',      file: 'codex.png',       accent: '#74AA9C' },
    { name: 'Gemini',     file: 'gemini.png',      bg: '#ffffff', accent: '#4285F4' },
  ];
  var ABSORB_ORDER = [0, 1, 3, 4, 7, 5, 6, 2];
  var WHITE_TAU = 0.52;    // whites decay slower in the ring color hand-off
  var ACCENT = hexToRgb('#7cb389');
  var FG = hexToRgb('#e8e4d9');

  // ---------- dom ----------
  var stage = document.getElementById('stage');
  var veil = document.getElementById('veil');
  var vignette = document.getElementById('vignette');
  var flash = document.getElementById('flash');
  var mascotStage = document.getElementById('mascot-stage');
  var glow = document.getElementById('mascot-glow');
  var caption = document.getElementById('caption');
  var replay = document.getElementById('replay');
  var fx = document.getElementById('fx');
  var ctx = fx.getContext('2d');
  var botPre = document.getElementById('merge-bot');

  // ---------- build the 8 tiles (in absorption order) + their ghosts ----------
  var GHOST_MAX = 8; // brief: ghost count grows 2 -> 8, excluding the tile itself
  var tiles = ABSORB_ORDER.map(function (iconIdx, slot) {
    var icon = ICONS[iconIdx];
    var el = document.createElement('div');
    el.className = 'tile';
    var face = document.createElement('div');
    face.className = 'tile-face';
    if (icon.bg) face.style.setProperty('--tile-bg', icon.bg);
    var url = 'assets/icons/' + icon.file;
    var img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.draggable = false;
    face.appendChild(img);
    el.appendChild(face);
    el.setAttribute('aria-label', icon.name);
    el.setAttribute('role', 'img');
    stage.appendChild(el);

    var ghosts = [];
    for (var g = 0; g < GHOST_MAX; g++) {
      var gh = document.createElement('div');
      gh.className = 'ghost';
      gh.style.backgroundImage = 'url("' + url + '")';
      gh.style.opacity = '0';
      stage.appendChild(gh);
      ghosts.push(gh);
    }
    return {
      el: el, ghosts: ghosts, icon: icon,
      brand: hexToRgb(icon.accent),
      white: !!icon.white,
      slot: slot,
      base: (slot / ABSORB_ORDER.length) * Math.PI * 2 - Math.PI / 2, // first at 12 o'clock
      popDelay: T.popStart + slot * T.popStagger,
      absorbed: false, hidden: false,
      launch: null,      // orbit origin + theta captured when collapse starts
      lastX: 0, lastY: 0, // tracked so the absorb trail spawns at the entry angle
      onGhosts: 0, filtered: false,
    };
  });

  // ---------- center ring (capture-and-color-absorb) ----------
  var ring = document.createElement('div');
  ring.id = 'ring';
  var ringFill = document.createElement('div');
  ringFill.id = 'ring-fill';
  ring.appendChild(ringFill);
  stage.appendChild(ring); // inside #stage so tiles z-interleave with it

  // ---------- fx state ----------
  var burst = [], trails = [], shocks = [], twinkles = [];
  var burstSpawned = false, twinklesSpawned = false, shock1 = false, shock2 = false;
  var lastBrand = null;    // accent of the most recent absorption
  var theta = 0;           // shared orbital angle, numerically integrated
  var trailPhase = 0;      // spin phase trails race along (2.6 + 0.5*omega rad/s)
  var reveal = { started: false, done: false, mirror: null, end: 0 };
  var replayShown = false;
  var BURST_GLYPHS = ['.', '+', '˙', '*', '▚'];
  var TWINKLE_GLYPHS = ['·', '.', '*', '˙', '+'];
  var TWINKLE_W = [0.30, 0.25, 0.20, 0.15, 0.10];
  var monoFont = null;
  function fontFor(size) {
    if (!monoFont) monoFont = getComputedStyle(document.body).fontFamily;
    return size.toFixed(1) + 'px ' + monoFont;
  }
  function weightedGlyph() {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < TWINKLE_GLYPHS.length; i++) { acc += TWINKLE_W[i]; if (r < acc) return TWINKLE_GLYPHS[i]; }
    return TWINKLE_GLYPHS[0];
  }

  // ---------- viewport ----------
  var W = 0, H = 0, R = 0, CX = 0, CY = 0, ringBase = 0, ELL = 0.42;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    // R = clamp(min(0.30*vh, 0.24*vw), 180, 300); tile = clamp(0.38*R, 56, 116)
    R = Math.min(Math.max(Math.min(H * 0.30, W * 0.24), 180), 300);
    document.documentElement.style.setProperty('--tile', Math.min(Math.max(R * 0.38, 56), 116).toFixed(1) + 'px');
    ELL = W < 720 ? 0.36 : 0.42;
    CX = W / 2; CY = H * 0.484; // brief's center: (720, 436) at 1440x900
    ringBase = R * 0.265;
    var DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    fx.width = Math.round(W * DPR);
    fx.height = Math.round(H * DPR);
    fx.style.width = W + 'px';
    fx.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- absorption bookkeeping (pure functions of t) ----------
  function absorbTime(slot) { return T.collapseStart + slot * T.collapseStagger + T.collapseDur; }
  function absorbCount(t) {
    var n = 0;
    for (var i = 0; i < tiles.length; i++) if (t >= absorbTime(i)) n++;
    return n;
  }
  // running mix: lerps 0.45 toward each absorbed brand as it lands, then
  // resolves to accent over 400ms after the flash (5550 -> 5950)
  function runningMix(t) {
    var c = ACCENT.slice();
    for (var i = 0; i < tiles.length; i++) {
      if (t >= absorbTime(i)) c = mixRgb(c, tiles[i].brand, 0.45);
    }
    var ur = clamp01((t - T.flashAt) / 0.4);
    if (ur > 0) c = mixRgb(c, ACCENT, easeInOutCubic(ur));
    return c;
  }
  // displayed ring color = lerp(runningMix, brand_i, weight_i) — the hand-off
  // lerps from the RUNNING mix so the colors chain
  function ringDisplayColor(t) {
    var c = runningMix(t);
    for (var i = 0; i < tiles.length; i++) {
      var da = t - absorbTime(i);
      if (da < 0 || da > 1.2) continue;
      var tau = tiles[i].white ? WHITE_TAU : 0.4;
      var w = easeOutCubic(clamp01(da / 0.18)) * Math.exp(-Math.max(0, da - T.collapseDur) / tau);
      c = mixRgb(c, tiles[i].brand, w);
    }
    return c;
  }
  function ringRadius(t) { return ringBase + 2 * absorbCount(t); } // +2px per absorb, 72 -> 88

  // ---------- ring per frame ----------
  function updateRing(t) {
    var op = easeOutCubic(clamp01((t - T.orbitStart) / 0.4));
    ring.style.opacity = op.toFixed(3);
    if (op <= 0.001) return;
    // gulp envelope over the most recent absorptions (whites gulp 1.10)
    var bump = 0, bright = 0;
    for (var i = 0; i < tiles.length; i++) {
      var da = t - absorbTime(i);
      if (da < 0 || da > 0.5) continue;
      var gu = clamp01(da / 0.14);
      var amp = tiles[i].white ? 0.10 : 0.07;
      var g = Math.sin(Math.PI * gu) * (1 - gu * 0.3) * amp;
      if (g > bump) bump = g;
      var br = 0.30 * Math.exp(-da / 0.26); // brightness +0.30, decaying 260ms
      if (br > bright) bright = br;
    }
    var col = ringDisplayColor(t);
    // hatch pulse: glow re-brightens 0.55 -> 0.80 at the reveal, decaying 300ms
    var pulse = t >= T.glowPulse0 ? 1 + 0.45 * Math.exp(-(t - T.glowPulse0) / 0.3) : 1;
    var alpha = Math.min(0.85, 0.55 * op * pulse);
    var glowPx = 14 + 12 * Math.min(1, bump / 0.07); // 14 -> 26 at gulp peak
    var stroke = 2.5 + 0.5 * (absorbCount(t) / tiles.length) + 2.5 * Math.min(1, bump / 0.07);
    // ring bounce 1 -> 1.14 -> 1 over 300ms, peaking with the flash
    var bu = clamp01((t - T.flashAt) / 0.3);
    var bounce = t >= T.flashAt
      ? (bu < 0.4 ? 1 + 0.14 * easeOutCubic(bu / 0.4) : 1 + 0.14 * (1 - easeInCubic((bu - 0.4) / 0.6)))
      : 1;
    ring.style.width = ring.style.height = (2 * ringRadius(t)).toFixed(2) + 'px';
    ring.style.transform = 'translate(-50%,-50%) scale(' + (bounce * (1 + bump)).toFixed(4) + ')';
    ring.style.borderWidth = stroke.toFixed(2) + 'px';
    ring.style.borderColor = rgbaStr(col, alpha);
    ring.style.boxShadow = '0 0 ' + glowPx.toFixed(1) + 'px ' + rgbaStr(col, alpha) +
      ', inset 0 0 ' + (glowPx * 0.75).toFixed(1) + 'px ' + rgbaStr(col, alpha * 0.5);
    ring.style.filter = bright > 0.01 ? 'brightness(' + (1 + bright).toFixed(3) + ')' : '';
    ringFill.style.opacity = easeOutCubic(clamp01((t - T.fillAt) / T.fillDur)).toFixed(3);
  }

  // ---------- mascot reveal (per-glyph, over the engine's live loop) ----------
  // The engine owns the row spans and re-renders them as it bobs, so the
  // reveal snapshots the current frame into a mirror <pre> of per-glyph spans,
  // cascades those, then hands back to the live pre (a short crossfade hides
  // the bob-phase delta). The engine's own animation never stops.
  function startReveal(t) {
    reveal.started = true;
    var cols = (window.mergeBot && window.mergeBot.cols) || 30;
    reveal.end = T.revealStart + (cols - 1) * T.colStagger + 0.22;
    var bot = window.mergeBot;
    var rows = bot && bot.spans ? bot.spans.map(function (s) { return s.textContent; }) : [];
    var hasArt = rows.join('').replace(/ /g, '').length > 40;
    if (hasArt) {
      botPre.style.visibility = 'hidden'; // engine keeps rendering underneath
      var mirror = document.createElement('pre');
      mirror.className = 'race-bot reveal-mirror';
      mirror.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < rows.length; y++) {
        var row = document.createElement('span');
        row.style.display = 'block';
        var chars = rows[y].split('');
        for (var x = 0; x < chars.length; x++) {
          if (chars[x] === ' ') { row.appendChild(document.createTextNode(' ')); continue; }
          var g = document.createElement('span');
          g.className = 'rg';
          g.textContent = chars[x];
          g.dataset.x = x;
          var d = (x * T.colStagger).toFixed(3) + 's';
          g.style.animationDelay = d + ', ' + d;
          row.appendChild(g);
        }
        mirror.appendChild(row);
      }
      mascotStage.appendChild(mirror);
      reveal.mirror = mirror;
    }
  }
  function finishReveal() {
    reveal.done = true;
    if (reveal.mirror) { reveal.mirror.remove(); reveal.mirror = null; }
    botPre.style.visibility = '';
  }

  // ---------- particles ----------
  function spawnBurst(t) {
    for (var i = 0; i < 140; i++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 120 + Math.random() * 400; // 120-520 px/s
      burst.push({
        x: CX, y: CY,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        g: Math.random() < 0.08 ? '✦' : BURST_GLYPHS[(Math.random() * BURST_GLYPHS.length) | 0],
        size: 9 + Math.random() * 6, // 9-15px
        born: t, ttl: 0.48 + Math.random() * 0.47, // 480-950ms
        col: Math.random() < 0.3 ? FG : ACCENT, // 30% bright #e8e4d9, rest accent
        base: 0, // set below: bright full, accent at 0.7
      });
      burst[burst.length - 1].base = burst[burst.length - 1].col === FG ? 1 : 0.7;
    }
  }
  function spawnTwinkles(t) {
    var bw = ((botPre.offsetWidth || 180) / 2 + 24), bh = ((botPre.offsetHeight || 120) / 2 + 24);
    var nearest = [];
    for (var i = 0; i < 10; i++) {
      var r = 130 + i * 11, phi = i * 2.399; // golden-angle ring
      var x = CX + Math.cos(phi) * r + (Math.random() * 36 - 18);
      var y = CY + Math.sin(phi) * r * 0.85 + (Math.random() * 36 - 18);
      // reject inside the mascot bbox (+24px): push radially clear
      var dx = x - CX, dy = y - CY;
      if (Math.abs(dx) < bw && Math.abs(dy) < bh) {
        var f = Math.max(bw / Math.max(1, Math.abs(dx)), bh / Math.max(1, Math.abs(dy)));
        x = CX + dx * (f + 0.08); y = CY + dy * (f + 0.08);
      }
      var tw = {
        x: x, y: y, g: weightedGlyph(), size: 9 + Math.random() * 4,
        period: 1.9 + Math.random() * 1.5, phi: Math.random() * Math.PI * 2,
        born: t + i * 0.04, // seeded 5820, all in by ~6200
        flareOff: (i % 4) * 2.9, flares: [2, 5, 8].indexOf(i) >= 0,
        near: false,
      };
      twinkles.push(tw);
      nearest.push({ d: dx * dx + dy * dy, tw: tw });
    }
    // the 2 nearest the ring mix 10% of the last absorbed brand for 2s of idle
    nearest.sort(function (a, b) { return a.d - b.d; });
    nearest[0].tw.near = true;
    if (nearest[1]) nearest[1].tw.near = true;
  }
  function drawFx(t, dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // arc streaks (motion blur), only when blurGain > 0.3
    var w = omegaAt(t), gain = blurGainFor(w);
    if (gain > 0.3 && t < T.collapseStart + 0.1) {
      var dTheta = Math.min(0.22, Math.max(0.035, 0.028 * w));
      var arcLen = Math.min(0.42, Math.max(0.05, 0.05 * w));
      for (var i = 0; i < tiles.length; i++) {
        var tl = tiles[i];
        if (tl.hidden) continue;
        var ang = tl.base + theta + tileLag(tl, t);
        var depth = (Math.sin(ang) + 1) / 2;
        var col = mixRgb(tl.brand, FG, 0.6); // 40% brand + 60% #e8e4d9
        var alpha = 0.28 * gain * (0.45 + 0.55 * depth);
        var seg = arcLen / 4;
        for (var s = 0; s < 4; s++) {
          ctx.strokeStyle = rgbaStr(col, alpha * [1, 0.66, 0.40, 0.20][s]);
          ctx.lineWidth = lerp(1.5, 3, depth);
          ctx.beginPath();
          ctx.ellipse(CX, CY, R, R * ELL, 0, ang - (s + 1) * seg, ang - s * seg);
          ctx.stroke();
        }
      }
    }

    // absorb trail arcs: race with the spin, 'lighter'
    ctx.globalCompositeOperation = 'lighter';
    for (i = trails.length - 1; i >= 0; i--) {
      var tr = trails[i], age = t - tr.born;
      if (age > 0.4) { trails.splice(i, 1); continue; }
      var u = age / 0.4;
      var sweep = (Math.PI / 2) * (1 - easeInQuad(u)); // 90deg -> 0, easeInQuad
      var a = tr.a0 + (trailPhase - tr.phase);
      var tc = age < 0.15 ? tr.brand : mixRgb(tr.brand, ACCENT, clamp01((age - 0.15) / 0.25));
      ctx.strokeStyle = rgbaStr(tc, 0.9 * (1 - easeInQuad(u)));
      ctx.lineWidth = lerp(tr.thick, 1, u);
      ctx.beginPath();
      ctx.arc(CX, CY, ringRadius(t), a - sweep, a);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // flash shockwaves: r 90->460 over 520ms, lineWidth 6 -> 0.5, easeOutCubic
    for (i = shocks.length - 1; i >= 0; i--) {
      var sh = shocks[i], su = (t - sh.born) / 0.52;
      if (su >= 1) { shocks.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(232,240,233,' + (sh.a0 * (1 - easeOutCubic(su))).toFixed(3) + ')';
      ctx.lineWidth = lerp(6, 0.5, easeOutCubic(su));
      ctx.beginPath();
      ctx.arc(CX, CY, lerp(sh.r1, sh.r2, easeOutCubic(su)), 0, Math.PI * 2);
      ctx.stroke();
    }

    // ASCII sparkle burst from the ring center
    for (i = burst.length - 1; i >= 0; i--) {
      var sp2 = burst[i], age2 = t - sp2.born;
      if (age2 >= sp2.ttl) { burst.splice(i, 1); continue; }
      sp2.x += sp2.vx * dt; sp2.y += sp2.vy * dt;
      var a2 = sp2.base * clamp01(age2 / 0.06) * (1 - age2 / sp2.ttl);
      if (a2 <= 0.004) continue;
      ctx.font = fontFor(sp2.size);
      ctx.fillStyle = rgbaStr(sp2.col, a2);
      ctx.fillText(sp2.g, sp2.x, sp2.y);
    }

    // ambient twinkles: slow faint oscillation, 3 flare once per ~9s
    var idle2s = t >= T.revealStart + 0.55 && t <= T.revealStart + 0.55 + 2;
    for (i = 0; i < twinkles.length; i++) {
      var twk = twinkles[i];
      if (t < twk.born) continue;
      var tin = easeOutCubic(clamp01((t - twk.born) / 0.38));
      var al = (0.06 + 0.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (t - twk.phi) / twk.period))) * tin;
      var g2 = twk.g;
      if (twk.flares) {
        var cyc = t >= 6.4 ? (t - 6.4 - twk.flareOff) % 9 : -1;
        if (cyc >= 0 && cyc < 0.18) { al = Math.min(1, al * 1.8); g2 = '✦'; }
      }
      var tkCol = ACCENT;
      if (twk.near && idle2s && lastBrand) tkCol = mixRgb(ACCENT, lastBrand, 0.10);
      ctx.font = fontFor(twk.size);
      ctx.fillStyle = rgbaStr(tkCol, al);
      ctx.fillText(g2, twk.x, twk.y);
    }
  }

  // per-tile angle lag during anticipation (tiles share theta; each slows
  // itself by up to 70% for the 90ms wind-up before launch)
  function tileLag(tl, t) {
    if (!tl.launch || t >= T.collapseStart + tl.slot * T.collapseStagger + ANTIC) return 0;
    var tC = T.collapseStart + tl.slot * T.collapseStagger;
    var aD = easeOutCubic(clamp01((t - tC) / ANTIC));
    return (theta - tl.launch.theta) * (1 - 0.7 * aD);
  }

  function hideTile(tl) {
    if (!tl.hidden) { tl.el.style.visibility = 'hidden'; tl.hidden = true; }
    for (var k = 0; k < tl.onGhosts; k++) tl.ghosts[k].style.opacity = '0';
    tl.onGhosts = 0;
  }

  // ---------- per-frame update ----------
  var lastK = -1;
  function setK(k) {
    if (Math.abs(k - lastK) < 0.005) return;
    lastK = k;
    document.documentElement.style.setProperty('--k', k.toFixed(3));
    vignette.style.opacity = k.toFixed(3);
  }

  function update(t, dt) {
    // ----- backdrop: warm white veil -> #050505, keyed stroke + vignette -----
    var veilOp = t < T.bgFlip ? 1
      : t < T.bgFlip + T.bgFlipDur ? 1 - easeInOutCubic((t - T.bgFlip) / T.bgFlipDur)
      : 0;
    veil.style.opacity = veilOp.toFixed(3);
    setK(1 - veilOp);

    // ----- shared orbital angle + trail race phase -----
    var w = omegaAt(t);
    theta += w * dt;
    trailPhase += (2.6 + 0.5 * w) * dt;
    var gain = blurGainFor(w);
    var ghostN = gain > 0 ? 2 + Math.round(6 * smoothstep(1.5, 7, w)) : 0;
    var dTheta = Math.min(0.22, Math.max(0.035, 0.028 * w));

    updateRing(t);

    // ----- tiles: pop-in / orbit / ghosts / collapse -----
    for (var i = 0; i < tiles.length; i++) {
      var tl = tiles[i];
      var popU = (t - tl.popDelay) / T.popDur;
      if (popU <= 0) continue; // still at scale(0)
      if (tl.hidden) { tl.el.style.visibility = ''; tl.hidden = false; }

      var tC = T.collapseStart + tl.slot * T.collapseStagger;
      var cU = (t - tC) / T.collapseDur;
      var ang, x, y, scale, rot = 0, sy = 1, opacity, blurPx = 0, depth, popE = 1;

      if (cU >= 1) { hideTile(tl); continue; }

      if (t < tC) {
        // ----- orbit (ellipse, depth-sorted) + pop-in envelope -----
        popE = easeOutBack(Math.min(1, popU), 1.7);
        ang = tl.base + theta;
        depth = (Math.sin(ang) + 1) / 2;
        x = Math.cos(ang) * R;
        y = Math.sin(ang) * R * ELL + 26 * (1 - popE);
        scale = (0.62 + 0.38 * popE) * (0.72 + 0.43 * depth);
        rot = -6 * (1 - popE);
        opacity = easeOutCubic(Math.min(1, popU * T.popDur / 0.18));
        blurPx = 8 * (1 - easeOutCubic(Math.min(1, popU * T.popDur / 0.26)));
        if (opacity >= 0.999) opacity = 1;
        if (blurPx <= 0.05) blurPx = 0;
      } else {
        // ----- collapse: anticipation, then launch into the ring -----
        if (!tl.launch) tl.launch = { x: tl.lastX, y: tl.lastY, theta: theta, w: Math.max(w, 1) };
        var u = clamp01(cU);
        if (u < 0.145) {
          var aD = easeOutCubic(u / 0.145);
          ang = tl.base + tl.launch.theta + (theta - tl.launch.theta) * (1 - 0.7 * aD);
          depth = (Math.sin(ang) + 1) / 2;
          x = Math.cos(ang) * R;
          y = Math.sin(ang) * R * ELL;
          scale = 0.72 + 0.43 * depth;
          sy = 1 + 0.08 * aD;                       // scaleY x1.08
          rot = -4 * aD * (Math.cos(ang) >= 0 ? 1 : -1); // lean 4deg toward center
          opacity = 1;
        } else {
          var ul = (u - 0.145) / 0.855;
          var p = easeInCubic(ul);
          // tile translate space is CENTER-relative (#stage is a point at
          // screen center), so the ring entry is just the unit vector · radius
          var dirx = tl.launch.x, diry = tl.launch.y;
          var dl = Math.max(1, Math.hypot(dirx, diry));
          var rr = ringRadius(t);
          var ex = (dirx / dl) * rr, ey = (diry / dl) * rr; // ring entry
          x = lerp(tl.launch.x, ex, p);
          y = lerp(tl.launch.y, ey, p);
          scale = lerp(1, 0.10, easeInQuart(ul));   // easeInQuart 1.0 -> 0.10
          opacity = ul < 0.75 ? 1 : 1 - easeInQuad((ul - 0.75) / 0.25);
          rot = (tl.launch.w * 0.35 * (t - tC) * 180) / Math.PI; // slight corkscrew
          sy = 1.08;
          depth = (Math.sin(theta) + 1) / 2;
        }
      }
      tl.lastX = x; tl.lastY = y;

      // z-order: depth swaps front/back around the ring; collapse rides above
      // the ring for 500ms then drops below for the final 120ms (the entry
      // point occludes the tile = "into the ring")
      var z = t >= tC ? ((t - tC) < 0.5 ? 60 : 40) : (depth < 0.5 ? 40 : 60);
      tl.el.style.zIndex = z;

      tl.el.style.opacity = opacity.toFixed(3);
      tl.el.style.transform =
        'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)' +
        ' translate(-50%,-50%)' +
        ' rotate(' + rot.toFixed(2) + 'deg)' +
        ' scale(' + scale.toFixed(4) + ',' + (scale * sy).toFixed(4) + ')';
      // CSS blur: pop-in blur + motion blur on FRONT tiles only, cap 6px
      var cssBlur = blurPx + (depth > 0.5 ? Math.min(6, 6 * gain * depth) : 0);
      if (cssBlur > 0.05) {
        tl.el.style.filter = 'blur(' + cssBlur.toFixed(2) + 'px) brightness(' + (0.8 + 0.3 * depth).toFixed(3) + ')';
        tl.filtered = true;
      } else if (tl.filtered) {
        tl.el.style.filter = '';
        tl.filtered = false;
      }

      // ghost trails: each evaluated at ITS OWN angle for depth
      if (ghostN > 0 && t < tC) {
        for (var k = 1; k <= GHOST_MAX; k++) {
          var gh = tl.ghosts[k - 1];
          if (k > ghostN) {
            if (k <= tl.onGhosts) gh.style.opacity = '0';
            continue;
          }
          var ga = ang - k * dTheta;
          var gd = (Math.sin(ga) + 1) / 2;
          var gAl = (0.6 / (k + 1)) * gain * (0.45 + 0.55 * gd);
          if (gAl < 0.05) { if (k <= tl.onGhosts) gh.style.opacity = '0'; continue; }
          gh.style.zIndex = gd < 0.5 ? 40 : 60;
          gh.style.transform =
            'translate(' + (Math.cos(ga) * R).toFixed(2) + 'px,' + (Math.sin(ga) * R * ELL).toFixed(2) + 'px)' +
            ' translate(-50%,-50%) scale(' + (0.72 + 0.43 * gd).toFixed(4) + ')';
          gh.style.opacity = gAl.toFixed(3);
        }
        tl.onGhosts = ghostN;
      } else if (tl.onGhosts) {
        for (k = 0; k < tl.onGhosts; k++) tl.ghosts[k].style.opacity = '0';
        tl.onGhosts = 0;
      }

      // absorb: hand-off the brand, spawn a racing trail arc
      if (!tl.absorbed && t >= absorbTime(tl.slot)) {
        tl.absorbed = true;
        lastBrand = tl.brand;
        trails.push({
          a0: Math.atan2(tl.lastY - CY, tl.lastX - CX),
          phase: trailPhase, born: t,
          brand: tl.brand.slice(), thick: tl.white ? 5 : 4, // whites: 1px thicker
        });
      }
    }

    // ----- flash + shockwaves -----
    if (t >= T.flashAt && t < T.flashAt + T.flashDur + 0.3) {
      var d = t - T.flashAt, fOp;
      if (d < 0.06) fOp = 0.96 * easeOutCubic(d / 0.06);           // attack 60ms
      else if (d < 0.14) fOp = lerp(0.96, 0.62, (d - 0.06) / 0.08); // to 0.62 by +140ms
      else fOp = 0.62 * Math.exp(-(d - 0.14) / 0.13);               // exp tau=130ms
      flash.style.opacity = Math.max(0, fOp).toFixed(3);
      // radial gradient radius 120 -> 640px
      var rad = lerp(120, 640, easeOutCubic(clamp01(d / T.flashDur)));
      flash.style.setProperty('--flash-r', rad.toFixed(1) + 'px');
    } else if (t >= T.flashAt + T.flashDur + 0.3) {
      flash.style.opacity = '0';
    }
    if (!shock1 && t >= T.flashAt) { shock1 = true; shocks.push({ born: t, r1: 90, r2: 460, a0: 0.7 }); }
    if (!shock2 && t >= T.flashAt + T.shock2Delay) { shock2 = true; shocks.push({ born: t, r1: 90, r2: 380, a0: 0.45 }); }

    // ----- sparkle burst / twinkles -----
    if (!burstSpawned && t >= T.sparkleAt) { burstSpawned = true; spawnBurst(t); }
    if (!twinklesSpawned && t >= T.revealStart - 0.03) { twinklesSpawned = true; spawnTwinkles(t); }

    // ----- mascot reveal + glow -----
    if (!reveal.started && t >= T.revealStart) startReveal(t);
    if (reveal.started && !reveal.done && t >= reveal.end) finishReveal();
    if (reveal.started) {
      var um = easeOutBack(clamp01((t - T.revealStart) / 0.3), 1.7);
      mascotStage.style.opacity = '1';
      mascotStage.style.transform = 'translate(-50%,-50%) scale(' + um.toFixed(4) + ')';
      // ember glow: rises with the reveal, breathes faintly at idle
      var gOp = 0.22 * easeOutCubic(clamp01((t - T.revealStart) / 0.3)) +
        (t >= T.glowPulse0 ? 0.18 * Math.exp(-(t - T.glowPulse0) / 0.3) : 0) +
        (t >= reveal.end ? 0.05 + 0.03 * Math.sin((t - reveal.end) * 2.1) : 0);
      glow.style.opacity = clamp01(gOp).toFixed(3);
    }

    // ----- end state: caption + replay -----
    if (t >= T.idleAt) {
      caption.style.opacity = easeOutCubic(clamp01((t - T.idleAt) / 0.6)).toFixed(3);
      if (!replayShown) { replayShown = true; replay.classList.add('show'); }
    }

    drawFx(t, dt);
  }

  // ---------- restart ----------
  function reset() {
    theta = 0; trailPhase = 0; lastBrand = null;
    burst.length = 0; trails.length = 0; shocks.length = 0; twinkles.length = 0;
    burstSpawned = twinklesSpawned = shock1 = shock2 = false;
    ctx.clearRect(0, 0, W, H);
    flash.style.opacity = '0';
    veil.style.opacity = '1';
    mascotStage.style.opacity = '0';
    mascotStage.style.transform = 'translate(-50%,-50%) scale(0)';
    glow.style.opacity = '0';
    caption.style.opacity = '0';
    replay.classList.remove('show');
    replayShown = false;
    if (reveal.mirror) { reveal.mirror.remove(); reveal.mirror = null; }
    reveal.started = reveal.done = false;
    botPre.style.visibility = '';
    setK(0); lastK = -1; setK(0);
    ring.style.opacity = '0';
    for (var i = 0; i < tiles.length; i++) {
      var tl = tiles[i];
      tl.absorbed = tl.hidden = false;
      tl.launch = null;
      tl.el.style.visibility = '';
      tl.el.style.transform = 'translate(-50%,-50%) scale(0)';
      tl.el.style.opacity = '0';
      tl.el.style.filter = '';
      for (var g = 0; g < GHOST_MAX; g++) tl.ghosts[g].style.opacity = '0';
      tl.onGhosts = 0;
    }
  }

  window.addEventListener('click', function (e) {
    // the mascot <pre> has its own click game (morphs to an emoji) — leave it be
    if (e.target && e.target.closest && e.target.closest('#merge-bot')) return;
    reset();
    if (FROZEN_T !== null) fastForward(FROZEN_T);
  });

  // ---------- debug ?t= + reduced motion ----------
  var FROZEN_T = null;
  try {
    var qp = new URLSearchParams(window.location.search).get('t');
    if (qp !== null && isFinite(parseFloat(qp))) FROZEN_T = Math.max(0, Math.min(8.2, parseFloat(qp)));
  } catch (e) { /* optional hook */ }
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED && FROZEN_T === null) FROZEN_T = T.idleAt; // jump straight to the end state

  // fast-forward: step the real update() so theta integrates, absorption
  // events fire, particles age and state transitions capture correctly
  function fastForward(target) {
    var step = 1 / 60;
    for (var tt = 0; tt < target; tt += step) update(Math.min(target, tt + step), Math.min(step, target - tt));
    if (reveal.mirror) {
      // hold the glyph cascade at the frozen instant (negative delay + paused)
      reveal.mirror.classList.add('frozen');
      var glyphs = reveal.mirror.querySelectorAll('.rg');
      for (var i = 0; i < glyphs.length; i++) {
        var g = glyphs[i];
        var d = (+g.dataset.x) * T.colStagger - (target - T.revealStart);
        g.style.animationDelay = d.toFixed(3) + 's, ' + d.toFixed(3) + 's';
      }
    }
    update(target, 0);
  }

  // ---------- master loop ----------
  var lastNow = performance.now();
  var t0 = lastNow;
  function frame(now) {
    var dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (FROZEN_T !== null) { update(FROZEN_T, 0); requestAnimationFrame(frame); return; }
    update((now - t0) / 1000, dt);
    requestAnimationFrame(frame);
  }

  reset();
  if (FROZEN_T !== null) fastForward(FROZEN_T);
  requestAnimationFrame(frame);
})();
