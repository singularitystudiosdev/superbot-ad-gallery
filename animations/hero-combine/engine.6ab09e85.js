/* Shared stage engine for the 10 circular "icons combining" hero fx.
   Fixed 600x380 stage space, scaled to fit each tile. Classic script (no modules). */
(function () {
  var TAU = Math.PI * 2;
  var W = 600, H = 380;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function span(t, a, b) { return clamp01((t - a) / (b - a)); }
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOutBack(x) { var c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function lerp(a, b, k) { return a + (b - a) * k; }

  var stages = [];

  function fitAll() {
    for (var i = 0; i < stages.length; i++) {
      var st = stages[i];
      var s = Math.min(st.wrap.clientWidth / W, st.wrap.clientHeight / H) || 1;
      st.scale = s;
      st.stage.style.transform = "translate(-50%,-50%) scale(" + s + ") rotate(" + (st.spin || 0) + "rad)";
    }
  }

  function makeStage(host, n, seed) {
    var wrap = document.createElement("div"); wrap.className = "sb-wrap";
    var stage = document.createElement("div"); stage.className = "sb-stage";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.classList.add("sb-svg");
    var core = document.createElement("div"); core.className = "sb-core";
    var wedge = document.createElement("div"); wedge.className = "sb-wedge";
    stage.append(svg, core, wedge);
    var rnd = mulberry(seed);
    var icons = window.SB_ICONS.slice();
    // shuffle icon order so every tile leads with a different model
    for (var s = icons.length - 1; s > 0; s--) { var j = Math.floor(rnd() * (s + 1)); var tmp = icons[s]; icons[s] = icons[j]; icons[j] = tmp; }
    var bubbles = [];
    for (var i = 0; i < n; i++) {
      var icon = icons[i % icons.length];
      var b = document.createElement("div"); b.className = "sb-b";
      var size = 34 + Math.round(rnd() * 16);
      b.style.width = size + "px"; b.style.height = size + "px";
      b.style.color = icon.color;
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="' + icon.d + '"/></svg>';
      stage.appendChild(b);
      bubbles.push({ el: b, icon: icon });
    }
    var mark = document.createElement("div"); mark.className = "sb-mark"; mark.textContent = "@";
    stage.appendChild(mark);
    wrap.appendChild(stage); host.appendChild(wrap);
    var rec = { wrap: wrap, stage: stage, scale: 1, spin: 0 };
    stages.push(rec);
    fitAll();
    var ctx = {
      W: W, H: H, svg: svg, core: core, wedge: wedge, mark: mark,
      bubbles: bubbles, n: n, rnd: rnd,
      lerp: lerp, span: span, clamp01: clamp01,
      easeOutCubic: easeOutCubic, easeInCubic: easeInCubic,
      easeInOutCubic: easeInOutCubic, easeOutBack: easeOutBack, TAU: TAU,
      set: function (i, x, y, sc, rot, op) {
        var b = bubbles[i];
        b.el.style.opacity = op == null ? Math.min(1, sc * 2.5) : op;
        b.el.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%) rotate(" + (rot || 0) + "deg) scale(" + sc + ")";
      },
      glow: function (i, strength) {
        bubbles[i].el.style.filter = strength > 0.02
          ? "drop-shadow(0 0 " + (3 + 7 * strength) + "px rgba(87,255,168," + Math.min(0.95, strength) + "))"
          : "";
      },
      setCore: function (op, sc) {
        core.style.opacity = op == null ? 0 : op;
        core.style.transform = "translate(-50%,-50%) scale(" + (sc == null ? 1 : sc) + ")";
      },
      setWedge: function (angleRad, op) {
        wedge.style.opacity = op == null ? 0 : op;
        wedge.style.transform = "translate(-50%,-50%) rotate(" + angleRad + "rad)";
      },
      setMark: function (op, sc) {
        mark.style.opacity = op == null ? 0 : op;
        mark.style.transform = "translate(-50%,-50%) scale(" + (sc == null ? 1 : sc) + ")";
      },
      spinStage: function (angleRad) {
        rec.spin = angleRad || 0;
        stage.style.transform = "translate(-50%,-50%) scale(" + rec.scale + ") rotate(" + rec.spin + "rad)";
      }
    };
    return ctx;
  }

  window.SB = {
    TAU: TAU, W: W, H: H,
    clamp01: clamp01, span: span, lerp: lerp,
    easeOutCubic: easeOutCubic, easeInCubic: easeInCubic,
    easeInOutCubic: easeInOutCubic, easeOutBack: easeOutBack,
    mulberry: mulberry, makeStage: makeStage, fitAll: fitAll
  };
  window.addEventListener("resize", fitAll);
})();
