/* Takes 06–10: pulse constellation, magnetic snap, pinwheel lock,
   bezier draw-in, collapse to mark. Each fn(ctx, P) returns update(t01). */
(function () {
  var S = window.SB;

  function slot(ctx, i, r, phase) {
    var a = -Math.PI / 2 + (i * S.TAU) / ctx.n + (phase || 0);
    return [ctx.W / 2 + Math.cos(a) * r, ctx.H / 2 + Math.sin(a) * r, a];
  }
  function outGate(t, a, b) { return 1 - S.easeInCubic(S.span(t, a, b)); }
  function ringR(ctx) { return Math.min(ctx.W, ctx.H) * 0.375; }
  function angDist(a, b) {
    var d = Math.abs(a - b) % S.TAU;
    return d > Math.PI ? S.TAU - d : d;
  }

  // 06 · pulse constellation — full ring breathes while light pulses travel
  // around it, briefly igniting each logo as a pulse passes.
  function pulseConstellation(ctx, P) {
    var n = ctx.n, rnd = ctx.rnd;
    var R = ringR(ctx), ph = rnd() * S.TAU;
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var rB = R + Math.sin(t * P * 1.15) * 5;
      var p1 = (t * 0.85 % 1) * S.TAU;
      var p2 = ((-t * 0.6) % 1 + 1) * S.TAU + Math.PI;
      for (var i = 0; i < n; i++) {
        var tin = (i / n) * 0.14;
        var base = S.easeOutBack(S.span(t, tin, tin + 0.08));
        var p = slot(ctx, i, rB, 0);
        var ang = p[2];
        var gl = Math.exp(-Math.pow(angDist(ang, p1) / 0.32, 2)) + Math.exp(-Math.pow(angDist(ang, p2) / 0.32, 2));
        gl = Math.min(1, gl);
        p[0] += Math.sin(t * P * 1.2 + ph + i) * 2.4;
        p[1] += Math.cos(t * P * 0.95 + ph + i * 1.7) * 2.4;
        ctx.set(i, p[0], p[1], Math.min(1.08, base * (1 + 0.07 * gl)) * g, 0);
        ctx.glow(i, gl * 0.85);
      }
      ctx.setCore(0.05 * g, 0.6);
    };
  }

  // 07 · magnetic snap — scattered logos drift, then snap one by one into the
  // circular lattice, each snap landing with a green flash.
  function magneticSnap(ctx, P) {
    var n = ctx.n, rnd = ctx.rnd;
    var R = ringR(ctx);
    var scat = [], snapT = [];
    for (var i = 0; i < n; i++) {
      scat.push([rnd() * ctx.W, ctx.H * 0.15 + rnd() * ctx.H * 0.7]);
      snapT.push(0.34 + (i / n) * 0.26 + rnd() * 0.03);
    }
    return function (t) {
      var g = outGate(t, 0.88, 1);
      for (var i = 0; i < n; i++) {
        var st = snapT[i];
        var k = S.span(t, st, st + 0.11);
        var p = slot(ctx, i, R, 0);
        var dx = scat[i][0] + Math.sin(t * P * 0.7 + i * 2.1) * 9;
        var dy = scat[i][1] + Math.cos(t * P * 0.55 + i * 1.3) * 9;
        var e = S.easeOutCubic(k);
        var x = S.lerp(dx, p[0], e), y = S.lerp(dy, p[1], e);
        var sc = k <= 0 ? 0 : S.lerp(0.7, 1, S.easeOutBack(k));
        var f = Math.exp(-Math.pow((t - st) / 0.045, 2));
        ctx.set(i, x, y, sc * (k < 1 ? Math.min(1, 0.4 + k) : 1) * g, 0);
        ctx.glow(i, f);
      }
      ctx.setCore(0.06 * g, 0.65);
    };
  }

  // 08 · pinwheel lock — logos fly in tangentially along curved arcs and lock
  // into a radial pinwheel; the finished wheel spins with a radial scale wave.
  function pinwheel(ctx, P) {
    var n = ctx.n;
    var R = ringR(ctx);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var spin = S.easeInOutCubic(S.span(t, 0.55, 0.86)) * 0.7;
      ctx.spinStage(spin);
      for (var i = 0; i < n; i++) {
        var tin = (i / n) * 0.22;
        var k = S.easeOutCubic(S.span(t, tin, tin + 0.3));
        if (k <= 0) { ctx.set(i, 0, 0, 0, 0, 0); ctx.glow(i, 0); continue; }
        var p = slot(ctx, i, R, 0);
        var a = p[2], sa = a + 1.15, sr = R + 300;
        var x0 = ctx.W / 2 + Math.cos(sa) * sr, y0 = ctx.H / 2 + Math.sin(sa) * sr;
        // quadratic bezier: start -> tangential control -> slot
        var cxp = ctx.W / 2 + Math.cos(a + 0.85) * (R + 165);
        var cyp = ctx.H / 2 + Math.sin(a + 0.85) * (R + 165);
        var u = 1 - k;
        var x = u * u * x0 + 2 * u * k * cxp + k * k * p[0];
        var y = u * u * y0 + 2 * u * k * cyp + k * k * p[1];
        var wave = 1 + 0.06 * Math.sin(t * S.TAU * 1.6 - (i * S.TAU) / n);
        ctx.set(i, x, y, Math.min(1.1, k * wave) * g, (1 - k) * 160);
        ctx.glow(i, k > 0.94 && k < 1 ? 0.5 : 0);
      }
      ctx.setCore(0.07 * g, 0.65);
    };
  }

  // 09 · bezier draw-in — the spot's connector-line payoff, inverted: curved
  // lines draw out from a pulsing hub and each logo rides its line into place.
  function bezierDraw(ctx, P) {
    var n = ctx.n;
    var R = ringR(ctx);
    var NS = "http://www.w3.org/2000/svg";
    var paths = [], lens = [];
    for (var i = 0; i < n; i++) {
      var p = slot(ctx, i, R, 0);
      var a = p[2];
      var c1x = ctx.W / 2 + Math.cos(a + 0.6) * R * 0.45;
      var c1y = ctx.H / 2 + Math.sin(a + 0.6) * R * 0.45;
      var c2x = ctx.W / 2 + Math.cos(a - 0.25) * R * 0.8;
      var c2y = ctx.H / 2 + Math.sin(a - 0.25) * R * 0.8;
      var el = document.createElementNS(NS, "path");
      el.setAttribute("d", "M " + ctx.W / 2 + " " + ctx.H / 2 +
        " C " + c1x + " " + c1y + " " + c2x + " " + c2y + " " + p[0] + " " + p[1]);
      ctx.svg.appendChild(el);
      paths.push(el); lens.push(el.getTotalLength());
    }
    return function (t) {
      var g = outGate(t, 0.88, 1);
      ctx.svg.style.opacity = g;
      var hub = 0.18 + 0.22 * Math.pow(Math.sin(t * P * 2.1), 2);
      for (var i = 0; i < n; i++) {
        var tin = (i / n) * 0.22;
        var d = S.span(t, tin, tin + 0.26);
        paths[i].style.strokeDasharray = lens[i];
        paths[i].style.strokeDashoffset = lens[i] * (1 - S.easeInOutCubic(d));
        var b = S.easeInOutCubic(S.span(t, tin + 0.07, tin + 0.33));
        var p = slot(ctx, i, R, 0);
        var pt = b > 0 && b < 1 ? paths[i].getPointAtLength(b * lens[i]) : { x: p[0], y: p[1] };
        var sc = b <= 0 ? 0 : b < 1 ? 0.62 : S.easeOutBack(S.clamp01(S.span(t, tin + 0.33, tin + 0.4)));
        hub += b > 0.96 && b < 1.04 ? 0.2 : 0;
        ctx.set(i, pt.x, pt.y, sc * g, 0);
      }
      ctx.setCore(Math.min(0.85, hub) * g, 0.55 + 0.1 * Math.sin(t * P * 2.1));
    };
  }

  // 10 · collapse to mark — ring assembles, breathes, then the whole set
  // collapses into a single glowing superbot mark.
  function collapseMark(ctx, P) {
    var n = ctx.n;
    var R = ringR(ctx);
    return function (t) {
      var g = outGate(t, 0.9, 1);
      var c = S.easeInCubic(S.span(t, 0.52, 0.7));           // collapse
      var m = S.easeOutBack(S.span(t, 0.66, 0.78));           // mark pops
      var mp = 1 - S.span(t, 0.94, 1);                        // mark fades at seam
      ctx.setMark(m * mp, 1 + 0.06 * Math.sin(t * P * 2.4));
      ctx.setCore((0.1 + 0.55 * c * m) * mp, 0.7 + 0.5 * m);
      var ang = t * S.TAU * 0.22 * (1 - c);
      for (var i = 0; i < n; i++) {
        var tin = (i / n) * 0.24;
        var base = S.easeOutBack(S.span(t, tin, tin + 0.08));
        var p = slot(ctx, i, R, 0);
        var q = [ctx.W / 2 + (p[0] - ctx.W / 2) * Math.cos(ang) - (p[1] - ctx.H / 2) * Math.sin(ang),
                 ctx.H / 2 + (p[0] - ctx.W / 2) * Math.sin(ang) + (p[1] - ctx.H / 2) * Math.cos(ang)];
        var x = S.lerp(q[0], ctx.W / 2, c), y = S.lerp(q[1], ctx.H / 2, c);
        var sc = S.lerp(Math.min(1.05, base), 0.12, c);
        ctx.set(i, x, y, sc * (c > 0.98 ? 0 : 1) * g, 0);
      }
    };
  }

  window.SB_VARIANTS_B = [
    { name: "pulse constellation", desc: "ring breathes while light pulses lap it, igniting each logo as they pass", fn: pulseConstellation, period: 8, n: 20 },
    { name: "magnetic snap", desc: "scattered icons drift, then snap one by one into the circular lattice, flash on landing", fn: magneticSnap, period: 8, n: 20 },
    { name: "pinwheel lock", desc: "icons fly in along tangential arcs and lock into a wheel that spins with a scale wave", fn: pinwheel, period: 8, n: 20 },
    { name: "bezier draw-in", desc: "the spot's connector lines, inverted: curves draw from the hub and logos ride them in", fn: bezierDraw, period: 9, n: 18 },
    { name: "collapse to mark", desc: "ring assembles, breathes, then folds into one glowing @ mark — all icons become superbot", fn: collapseMark, period: 8, n: 20 }
  ];
})();
