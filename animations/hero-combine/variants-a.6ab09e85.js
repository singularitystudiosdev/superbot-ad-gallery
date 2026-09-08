/* Takes 01–05: faithful ring assembly, vortex converge, merge-to-core,
   ring relay, conic sweep. Each fn(ctx, P) returns update(t01). */
(function () {
  var S = window.SB;

  // shared geometry helpers -------------------------------------------------
  function slot(ctx, i, r, phase) {
    var a = -Math.PI / 2 + (i * S.TAU) / ctx.n + (phase || 0);
    return [ctx.W / 2 + Math.cos(a) * r, ctx.H / 2 + Math.sin(a) * r, a];
  }
  function rotAround(cx, cy, x, y, ang) {
    var c = Math.cos(ang), s = Math.sin(ang);
    var rx = x - cx, ry = y - cy;
    return [cx + rx * c - ry * s, cy + rx * s + ry * c];
  }
  function outGate(t, a, b) { // 1 -> 0 near the loop seam
    return 1 - S.easeInCubic(S.span(t, a, b));
  }
  function ringR(ctx) { return Math.min(ctx.W, ctx.H) * 0.375; }

  // 01 · ring assembly — faithful to the spot: bubbles pop in around a ring,
  // cluster rotates slowly while every bubble wobbles on its own phase.
  function ringAssembly(ctx, P) {
    var n = ctx.n, rnd = ctx.rnd;
    var off = rnd() * S.TAU, ph = rnd() * S.TAU;
    var R = ringR(ctx);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var ang = off + t * S.TAU * 0.5;
      for (var i = 0; i < n; i++) {
        var tin = (i / n) * 0.4;
        var sc = S.easeOutBack(S.span(t, tin, tin + 0.09)) * g;
        var p = slot(ctx, i, R, 0);
        var q = rotAround(ctx.W / 2, ctx.H / 2, p[0], p[1], ang);
        q[0] += Math.sin(t * P * 1.4 + ph + i) * 3;
        q[1] += Math.cos(t * P * 1.1 + ph + i * 1.7) * 3;
        ctx.set(i, q[0], q[1], sc, 0);
      }
      ctx.setCore(0.06 * g, 0.6);
    };
  }

  // 02 · vortex converge — logos spiral in from off-stage, swirl decays, lock into ring.
  function vortex(ctx, P) {
    var n = ctx.n, rnd = ctx.rnd;
    var R = ringR(ctx);
    var a0 = [];
    for (var i = 0; i < n; i++) a0.push(rnd() * S.TAU);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      for (var i = 0; i < n; i++) {
        var k = S.easeInOutCubic(S.span(t, (i / n) * 0.16, (i / n) * 0.16 + 0.55));
        var r = S.lerp(R + 260, R, k) + (1 - g) * 170;
        var a = a0[i] + k * 3.3 + t * S.TAU * 0.16;
        var sc = (0.35 + 0.65 * k) * g;
        ctx.set(i, ctx.W / 2 + Math.cos(a) * r, ctx.H / 2 + Math.sin(a) * r, sc, k * 220);
      }
      ctx.setCore(0.12 * k * g, 0.7);
    };
  }

  // 03 · merge to core — every logo dives into the center, flash, then the
  // combined set expands back out as a finished ring.
  function mergeCore(ctx, P) {
    var n = ctx.n, rnd = ctx.rnd;
    var R = ringR(ctx);
    var a0 = [];
    for (var i = 0; i < n; i++) a0.push(-Math.PI / 2 + rnd() * S.TAU);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var flash = Math.exp(-Math.pow((t - 0.4) / 0.05, 2));
      var p2 = S.easeOutBack(S.span(t, 0.42, 0.62));
      var coreOp = 0.45 * S.easeInOutCubic(S.span(t, 0.25, 0.42)) + 0.5 * flash - 0.55 * S.span(t, 0.55, 0.75);
      ctx.setCore(Math.max(0, coreOp) * g, 0.8 + 0.4 * flash);
      for (var i = 0; i < n; i++) {
        var dive = S.easeInCubic(S.span(t, (i / n) * 0.2, (i / n) * 0.2 + 0.28));
        var r0 = R + 190, a = a0[i] + dive * 1.6;
        var sx = ctx.W / 2 + Math.cos(a) * r0, sy = ctx.H / 2 + Math.sin(a) * r0;
        var p = slot(ctx, i, R, 0);
        var x = S.lerp(S.lerp(sx, ctx.W / 2, dive), p[0], p2);
        var y = S.lerp(S.lerp(sy, ctx.H / 2, dive), p[1], p2);
        var sc = S.lerp(S.lerp(0.9, 0.3, dive), 1, p2) * (dive <= 0 ? 0 : 1) * g;
        ctx.set(i, x, y, sc, a * 57.3 * 0.2);
      }
    };
  }

  // 04 · ring relay — a leader sweep grows the ring logo by logo, tip glows.
  function ringRelay(ctx, P) {
    var n = ctx.n;
    var R = ringR(ctx);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var sweep = S.easeInOutCubic(S.span(t, 0.04, 0.62)) * S.TAU;
      for (var i = 0; i < n; i++) {
        var A = ((i + 1) / n) * S.TAU;
        var lead = sweep - A;
        var sc = lead < -0.16 ? 0 : S.easeOutBack(S.clamp01((lead + 0.16) / 0.16));
        var tip = lead >= -0.02 && lead < 0.2 && sc < 1.02 ? 1 : 0;
        var p = slot(ctx, i, R, 0);
        ctx.set(i, p[0], p[1], sc * g, 0);
        ctx.glow(i, tip ? 0.9 : 0);
      }
      ctx.setCore(0.08 * g, 0.6);
    };
  }

  // 05 · conic sweep — superbot's own conic-gradient motif: a green radar wedge
  // rotates once; every logo slot it passes pops in behind it.
  function conicSweep(ctx, P) {
    var n = ctx.n;
    var R = ringR(ctx);
    return function (t) {
      var g = outGate(t, 0.88, 1);
      var ang = S.easeInOutCubic(S.span(t, 0.05, 0.62)) * S.TAU;
      var wob = S.span(t, 0.62, 1) > 0 ? Math.sin(t * P * 1.3) * 3 : 0;
      ctx.setWedge(ang, (S.span(t, 0.05, 0.1) * (1 - S.span(t, 0.6, 0.68))) * g);
      for (var i = 0; i < n; i++) {
        var d = ang - (i * S.TAU) / n;
        var sc = d < -0.1 ? 0 : S.easeOutBack(S.clamp01((d + 0.1) / 0.22));
        var p = slot(ctx, i, R, 0);
        ctx.set(i, p[0], p[1] + wob * (i % 2 ? 1 : -1) * 0.6, sc * g, 0);
      }
      ctx.setCore(0.16 * g * S.span(t, 0.5, 0.62), 0.75);
    };
  }

  window.SB_VARIANTS_A = [
    { name: "ring assembly", desc: "the spot's own move: bubbles spring in one by one, cluster rotates, wobble holds", fn: ringAssembly, period: 8, n: 20 },
    { name: "vortex converge", desc: "logos spiral in from off-stage, swirl decays, the ring locks", fn: vortex, period: 8, n: 20 },
    { name: "merge to core", desc: "every icon dives into the center, flash, combined set expands as a ring", fn: mergeCore, period: 8, n: 20 },
    { name: "ring relay", desc: "a glowing leader sweeps the circle and attaches logos at the tip", fn: ringRelay, period: 8, n: 20 },
    { name: "conic sweep", desc: "superbot's conic-gradient motif as a radar pass that pops each logo in", fn: conicSweep, period: 8, n: 20 }
  ];
})();
