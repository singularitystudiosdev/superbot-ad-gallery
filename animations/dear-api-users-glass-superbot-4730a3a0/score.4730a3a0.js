// The DEAR API USERS score: an original cue-for-cue soundtrack synthesized in Web Audio (oscillators, seeded noise,
// filters, a generated room and a ping-pong echo) and rendered offline into one buffer whose time is the ad's time, so
// the page plays it like a track and every hit lands where the picture puts it. Nothing is sampled or licensed.
// 91.8 BPM: a beat is (endIn - costIn) / 12, which puts the price, the line and the end card on bar lines and the $800
// landing on beat 6. D minor while the price hurts, an A sus4 build under the roll-down, D major from the drop on.
// Usage: SbScore.render({ cues: B, price }, sampleRate, seconds?) -> Promise<{ buffer, cues, peakDb, ms }>
// The render is deterministic (seeded noise, a fixed master trim), so a short render is sample for sample the start of
// the full one: the page plays a few seconds' head while the rest renders and crosses to the full buffer under it.
(function () {
  'use strict';
  const LENGTH = 15; // seconds rendered: the 13 s spot plus the end chord's tail under the held end card
  const TRIM = 0.85; // after the limiter: -14 LUFS like the house master and its sibling scores, a -2.1 dBFS sample peak

  // ---------- notes and a seeded noise source (the same score on every render) ----------
  const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(n) {
    if (typeof n === 'number') return n;
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
    if (!m) throw new Error(`score: bad note ${n}`);
    return 12 * (Number(m[3]) + 1) + STEP[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const hz = (n) => 440 * Math.pow(2, (midi(n) - 69) / 12);
  // degree d of a mode rooted on midi note `root` (degrees past 6 climb octaves)
  const degree = (root, mode, d) => root + 12 * Math.floor(d / 7) + mode[((d % 7) + 7) % 7];
  const MINOR = [0, 2, 3, 5, 7, 8, 10], MIXO = [0, 2, 4, 5, 7, 9, 10];
  function mulberry(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // a generated room: decorrelated stereo noise under a 2 s RT60, its one-pole lowpass closing as the tail ages
  function room(ctx, rand, seconds = 2.1, rt60 = 2) {
    const n = Math.round(ctx.sampleRate * seconds), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    const k = 6.91 / rt60, pre = Math.round(ctx.sampleRate * 0.012);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      let y = 0;
      for (let i = pre; i < n; i++) {
        const age = i / n, s = (i - pre) / ctx.sampleRate;
        y += (0.85 - 0.7 * age) * ((rand() * 2 - 1) - y);
        d[i] = y * Math.exp(-k * s) * Math.min(1, s / 0.02);
      }
    }
    return ir;
  }

  // ---------- the studio: buses, sends and the instruments, all on one offline context ----------
  function studio(ctx, beat) {
    const rand = mulberry(0x5b07a11);
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;

    // master: trimmed into a glue compressor and a fast limiter that only catches the hits' peaks, then TRIM
    const mix = ctx.createGain();
    const glue = ctx.createDynamicsCompressor(), limit = ctx.createDynamicsCompressor(), out = ctx.createGain();
    mix.gain.value = 0.85;
    Object.entries({ threshold: -18, knee: 10, ratio: 2.2, attack: 0.015, release: 0.2 }).forEach(([k, v]) => { glue[k].value = v; });
    Object.entries({ threshold: -4.5, knee: 0, ratio: 20, attack: 0.001, release: 0.08 }).forEach(([k, v]) => { limit[k].value = v; });
    mix.connect(glue).connect(limit).connect(out).connect(ctx.destination);
    out.gain.setValueAtTime(TRIM, 0);
    out.gain.setValueAtTime(TRIM, LENGTH - 0.8);
    out.gain.linearRampToValueAtTime(0, LENGTH - 0.02);

    // the music bus (chords, bass, arp) breathes under every kick (a sidechain pump drawn as gain automation) and dips
    // again, on its own gain stage, under the effects that must read through a full band (duck)
    const music = ctx.createGain(), ducker = ctx.createGain(), sfx = ctx.createGain();
    music.connect(ducker).connect(mix);
    sfx.connect(mix);
    const verb = ctx.createConvolver();
    verb.buffer = room(ctx, rand);
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.8;
    verb.connect(verbOut).connect(mix);
    // a dotted-eighth ping-pong for the bells: left, right, then each pair again 0.34 down and darker. Unrolled into a
    // chain of six taps, not a feedback loop: Chrome runs a delay inside a cycle a render quantum early or late
    // depending on graph order, so a looped echo differs from render to render and the head would not match the full
    const echo = ctx.createGain(), pl = ctx.createStereoPanner(), pr = ctx.createStereoPanner();
    pl.pan.value = -0.75; pr.pan.value = 0.75;
    pl.connect(mix);
    pr.connect(mix);
    let tap = echo;
    for (let n = 0; n < 6; n++) {
      const d = ctx.createDelay(1);
      d.delayTime.value = 0.75 * beat;
      if (n && n % 2 === 0) {
        const dark = ctx.createBiquadFilter(), fb = ctx.createGain();
        dark.type = 'lowpass'; dark.frequency.value = 3200; fb.gain.value = 0.34;
        tap = tap.connect(dark).connect(fb);
      }
      tap = tap.connect(d);
      d.connect(n % 2 ? pr : pl);
    }
    const kicks = [], ducks = [], BUS = { mix, music, sfx }, channels = new Map(), filters = new Map();

    // every voice ends in a channel shared per (bus, pan, room send, echo send), so a voice costs only its own sources,
    // envelope and filters: the render time is the node count (about 1,200, under 500 sources)
    function channel(bus, pan, v, e) {
      const key = `${bus}|${pan}|${v}|${e}`;
      let ch = channels.get(key);
      if (!ch) {
        ch = ctx.createGain();
        let n = ch;
        if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; ch.connect(p); n = p; }
        n.connect(BUS[bus]);
        if (v) { const g = ctx.createGain(); g.gain.value = v; n.connect(g).connect(verb); }
        if (e) { const g = ctx.createGain(); g.gain.value = e; n.connect(g).connect(echo); }
        channels.set(key, ch);
      }
      return ch;
    }
    const q20 = (x) => Math.round(x * 20) / 20;
    // `bus` is a bus name ('mix' | 'music' | 'sfx') or one of the bus nodes; pan and sends snap to 0.05 steps
    function route(node, bus, { pan = 0, verb: v = 0, echo: e = 0 } = {}) {
      const name = typeof bus === 'string' ? bus : Object.keys(BUS).find((k) => BUS[k] === bus);
      node.connect(channel(name, q20(pan), q20(v), q20(e)));
    }
    // one fixed filter shared by every voice of a kind (hats, ticks), feeding its channel
    function shared(type, freq, bus, opts) {
      const key = `${type}|${freq}|${bus}|${JSON.stringify(opts)}`;
      let f = filters.get(key);
      if (!f) { f = filter(type, freq); route(f, bus, opts); filters.set(key, f); }
      return f;
    }
    // silent until `at`, up to `peak` in `a`, an exponential fall to -80 dB over `d` (-20 dB a quarter of the way)
    function amp(at, a, peak, d) {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(peak, at + a);
      g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
      g.gain.linearRampToValueAtTime(0, at + a + d + 0.01);
      return g;
    }
    function osc(type, freq, at, stop) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, at);
      o.start(at);
      o.stop(stop);
      return o;
    }
    function noise(at, stop) {
      const s = ctx.createBufferSource();
      s.buffer = noiseBuf;
      s.loop = true;
      s.start(at, rand() * 1.8);
      s.stop(stop);
      return s;
    }
    function filter(type, freq, q = 0.707) {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      return f;
    }

    // ---------- drums ----------
    function kick(at, g = 1) {
      const o = osc('sine', 155, at, at + 0.8), v = amp(at, 0.002, g, 0.65);
      o.frequency.exponentialRampToValueAtTime(46, at + 0.12);
      o.connect(v);
      route(v, mix);
      const c = noise(at, at + 0.03), cv = amp(at, 0.0005, 0.3 * g, 0.012);
      c.connect(filter('highpass', 3000)).connect(cv);
      route(cv, mix);
      kicks.push(at);
    }
    function crash(at, g = 0.3, d = 2.8) {
      [-0.45, 0.45].forEach((pan) => {
        const n = noise(at, at + d + 0.1), v = amp(at, 0.003, g, d);
        n.connect(filter('highpass', 5200)).connect(v);
        route(v, sfx, { pan, verb: 0.35 });
      });
    }
    // a section hit: kick, a falling sub, a low thump of air and a crash (`cr` scales the crash alone)
    function impact(at, g = 1, cr = 1) {
      kick(at, g);
      const sub = osc('sine', 54, at, at + 2.6), sv = amp(at, 0.004, 0.55 * g, 2.4);
      sub.frequency.exponentialRampToValueAtTime(38, at + 1.3);
      sub.connect(sv);
      route(sv, mix);
      const n = noise(at, at + 0.8), lp = filter('lowpass', 1100), nv = amp(at, 0.002, 0.55 * g, 0.6);
      lp.frequency.exponentialRampToValueAtTime(110, at + 0.32);
      n.connect(lp).connect(nv);
      route(nv, sfx, { verb: 0.25 });
      crash(at, 0.22 * g * cr);
    }
    function clap(at, g = 1) {
      const v = ctx.createGain(), n = noise(at, at + 0.3);
      v.gain.value = 0;
      [0, 0.011, 0.023].forEach((dt) => {
        v.gain.setValueAtTime(g, at + dt);
        v.gain.exponentialRampToValueAtTime(g * 0.15, at + dt + 0.009);
      });
      v.gain.setValueAtTime(g * 0.55, at + 0.032);
      v.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);
      n.connect(filter('bandpass', 1450, 0.9)).connect(v);
      route(v, sfx, { verb: 0.3 });
    }
    function snare(at, g = 1) {
      const n = noise(at, at + 0.4), nv = amp(at, 0.001, 0.8 * g, 0.3);
      n.connect(filter('bandpass', 1900, 0.75)).connect(nv);
      route(nv, sfx, { verb: 0.22 });
      const b = osc('sine', 215, at, at + 0.2), bv = amp(at, 0.001, 0.45 * g, 0.15);
      b.frequency.exponentialRampToValueAtTime(165, at + 0.07);
      b.connect(bv);
      route(bv, sfx);
    }
    function hat(at, g = 0.08, open = false, pan = 0) {
      const n = noise(at, at + (open ? 0.3 : 0.06)), v = amp(at, 0.001, g, open ? 0.22 : 0.034);
      n.connect(v).connect(shared('highpass', open ? 7000 : 8200, 'sfx', { pan, verb: open ? 0.12 : 0 }));
    }
    // a dry wooden clock tick
    function clock(at, g = 0.15, pan = 0) {
      const o = osc('sine', 1750, at, at + 0.07), ov = amp(at, 0.0006, g, 0.045);
      o.connect(ov);
      route(ov, sfx, { pan, verb: 0.18 });
      const n = noise(at, at + 0.03), nv = amp(at, 0.0005, g * 0.6, 0.018);
      n.connect(filter('bandpass', 2600, 2)).connect(nv);
      route(nv, sfx, { pan });
    }

    // ---------- tone ----------
    // a pumping bass note: saw plus a sub an octave down, its filter snapping shut; its tail runs under the next note
    function bass(at, dur, note, g = 0.5) {
      const f = hz(note), lp = filter('lowpass', 1100, 3), v = amp(at, 0.004, g, Math.max(0.05, 2 * dur)), stop = at + 2 * dur + 0.05;
      lp.frequency.setValueAtTime(1100, at);
      lp.frequency.exponentialRampToValueAtTime(170, at + Math.min(0.2, dur));
      osc('sawtooth', f, at, stop).connect(lp);
      const sub = osc('sine', f / 2, at, stop), sg = ctx.createGain();
      sub.connect(sg).connect(v);
      sg.gain.value = 1.4;
      lp.connect(v);
      route(v, music);
    }
    // a supersaw chord: three detuned saws a note, spread across the stereo field, through one moving lowpass
    function chord(at, end, notes, { g = 0.05, attack = 0.02, release = 0.25, cut = 2000, cutTo = cut, q = 0.9, spread = 0.6, detune = 13, verb: v = 0.3, bus = music, type = 'sawtooth' } = {}) {
      const lp = filter('lowpass', cut, q), vca = ctx.createGain();
      lp.frequency.setValueAtTime(cut, at);
      if (cutTo !== cut) lp.frequency.exponentialRampToValueAtTime(cutTo, end);
      vca.gain.value = 0;
      vca.gain.setValueAtTime(0, at);
      vca.gain.linearRampToValueAtTime(g, at + attack);
      vca.gain.setValueAtTime(g, end);
      vca.gain.exponentialRampToValueAtTime(0.0001, end + release);
      vca.gain.linearRampToValueAtTime(0, end + release + 0.01);
      lp.connect(vca);
      route(vca, bus, { verb: v });
      // the flat, low and high detunes of every note share a left, centre and right panner
      const sides = [-1, 0, 1].map((d) => { const p = ctx.createStereoPanner(); p.pan.value = d * spread; p.connect(lp); return p; });
      notes.forEach((n) => [-1, 0, 1].forEach((d, k) => {
        const o = osc(type, hz(n), at, end + release + 0.05);
        o.detune.value = d * detune + (rand() * 4 - 2);
        o.connect(sides[k]);
      }));
    }
    // FM glass: a sine carrier, a sine modulator at 3.5x whose depth dies fast, and a soft octave on top
    function bell(at, note, g = 0.2, { dur = 1.3, ratio = 3.5, index = 2.2, pan = 0, echo: e = 0.25, verb: v = 0.3, bus = sfx } = {}) {
      const f = hz(note), sum = ctx.createGain();
      const car = osc('sine', f, at, at + dur + 0.1), mod = osc('sine', f * ratio, at, at + dur + 0.1), depth = ctx.createGain();
      depth.gain.setValueAtTime(f * index, at);
      depth.gain.exponentialRampToValueAtTime(f * 0.04, at + dur * 0.45);
      mod.connect(depth).connect(car.frequency);
      car.connect(amp(at, 0.003, g, dur)).connect(sum);
      osc('sine', f * 2, at, at + dur).connect(amp(at, 0.002, g * 0.22, dur * 0.35)).connect(sum);
      route(sum, bus, { pan, verb: v, echo: e });
    }
    // a counter digit: a short filtered square blip
    function tick(at, note, g = 0.05, pan = 0) {
      const o = osc('square', hz(note), at, at + 0.06), v = amp(at, 0.0008, g, 0.038);
      o.connect(v).connect(shared('lowpass', 4500, 'sfx', { pan, verb: 0.08 }));
    }
    // a pop: a sine that jumps up in pitch, with a click on the front
    function pop(at, from, to, g = 0.25, pan = 0) {
      const o = osc('sine', from, at, at + 0.5), v = amp(at, 0.002, g, 0.4);
      o.frequency.exponentialRampToValueAtTime(to, at + 0.06);
      o.connect(v);
      route(v, sfx, { pan, verb: 0.15 });
      const n = noise(at, at + 0.02), nv = amp(at, 0.0005, g * 0.3, 0.008);
      n.connect(filter('highpass', 2500)).connect(nv);
      route(nv, sfx, { pan });
    }
    // an FM droplet: a warm bell whose pitch flicks up from `from` to `to` in 45 ms, in key
    function blip(at, from, to, g = 0.3, pan = 0) {
      const sum = ctx.createGain(), car = osc('sine', hz(from), at, at + 0.9), mod = osc('sine', hz(from) * 2, at, at + 0.9), depth = ctx.createGain();
      car.frequency.exponentialRampToValueAtTime(hz(to), at + 0.045);
      mod.frequency.exponentialRampToValueAtTime(hz(to) * 2, at + 0.045);
      depth.gain.setValueAtTime(hz(to) * 1.6, at);
      depth.gain.exponentialRampToValueAtTime(hz(to) * 0.05, at + 0.3);
      mod.connect(depth).connect(car.frequency);
      car.connect(amp(at, 0.002, g, 0.8)).connect(sum);
      route(sum, sfx, { pan, verb: 0.3, echo: 0.2 });
    }
    // band-passed air swept from `from` to `to`, loudest at `peak`, panned across
    function whoosh(at, peak, end, { from = 400, to = 4000, g = 0.4, q = 1.1, pan = [-0.4, 0.4], verb: v = 0.2 } = {}) {
      const n = noise(at, end + 0.02), bp = filter('bandpass', from, q), vca = ctx.createGain(), p = ctx.createStereoPanner();
      bp.frequency.setValueAtTime(from, at);
      bp.frequency.exponentialRampToValueAtTime(to, end);
      vca.gain.value = 0;
      vca.gain.setValueAtTime(0.0001, at);
      vca.gain.exponentialRampToValueAtTime(g, peak);
      vca.gain.exponentialRampToValueAtTime(0.0001, end);
      p.pan.setValueAtTime(pan[0], at);
      p.pan.linearRampToValueAtTime(pan[1], end);
      n.connect(bp).connect(vca).connect(p);
      route(p, sfx, { verb: v });
    }
    // a reversed-cymbal swell: high-passed noise growing to `g` and cut dead at `end` (the gap before a hit)
    function swell(at, end, { from = 2000, to = 9000, g = 0.15 } = {}) {
      [-0.5, 0.5].forEach((pan) => {
        const n = noise(at, end + 0.02), hp = filter('highpass', from), vca = ctx.createGain();
        hp.frequency.setValueAtTime(from, at);
        hp.frequency.exponentialRampToValueAtTime(to, end);
        vca.gain.value = 0;
        vca.gain.setValueAtTime(0.0001, at);
        vca.gain.exponentialRampToValueAtTime(g, end - 0.004);
        vca.gain.linearRampToValueAtTime(0, end);
        n.connect(hp).connect(vca);
        route(vca, sfx, { pan, verb: 0.3 });
      });
    }
    // two detuned saws gliding up an interval under a widening filter: the build's pitch
    function rise(at, end, from, to, g = 0.05) {
      const lp = filter('lowpass', 500, 2), vca = ctx.createGain();
      lp.frequency.setValueAtTime(500, at);
      lp.frequency.exponentialRampToValueAtTime(5000, end);
      vca.gain.value = 0;
      vca.gain.setValueAtTime(0.0001, at);
      vca.gain.exponentialRampToValueAtTime(g, end - 0.004);
      vca.gain.linearRampToValueAtTime(0, end);
      [-9, 9].forEach((cents) => {
        const o = osc('sawtooth', hz(from), at, end + 0.02);
        o.detune.value = cents;
        o.frequency.exponentialRampToValueAtTime(hz(to), end);
        o.connect(lp);
      });
      lp.connect(vca);
      route(vca, sfx, { verb: 0.25 });
    }
    function drone(at, end, note, g = 0.1) {
      const f = hz(note), lp = filter('lowpass', 260), vca = ctx.createGain();
      vca.gain.value = 0;
      vca.gain.setValueAtTime(0.0001, at);
      vca.gain.exponentialRampToValueAtTime(g, end - 0.05);
      vca.gain.linearRampToValueAtTime(0, end);
      osc('sine', f, at, end + 0.02).connect(vca);
      osc('sawtooth', f, at, end + 0.02).connect(lp).connect(vca);
      route(vca, mix, { verb: 0.2 });
    }

    // ---------- the hard hits ----------
    // $30,000 lands: a low stamp and a tritone cluster that sours the room
    function stamp(at) {
      kick(at, 0.9);
      const o = osc('sine', 70, at, at + 1.1), ov = amp(at, 0.002, 0.8, 0.9);
      o.frequency.exponentialRampToValueAtTime(45, at + 0.35);
      o.connect(ov);
      route(ov, mix);
      const n = noise(at, at + 0.6), nv = amp(at, 0.001, 0.5, 0.45);
      n.connect(filter('lowpass', 420)).connect(nv);
      route(nv, sfx, { verb: 0.3 });
      chord(at, at + 0.05, ['Ab3', 'D4', 'Eb4', 'Ab4'], { g: 0.08, attack: 0.004, release: 0.28, cut: 1800, cutTo: 800, bus: sfx, verb: 0.35 });
      crash(at, 0.07, 0.6);
    }
    // the strike: a marker snap, a swipe left to right as the bar grows, a red zap and a thud
    function slash(at) {
      const k = noise(at, at + 0.1), kv = amp(at, 0.0008, 1.3, 0.08);
      k.connect(filter('bandpass', 4000, 1.4)).connect(kv);
      route(kv, sfx, { pan: -0.5, verb: 0.3 });
      // the felt tip's squeak as it bites
      const q = osc('sine', 2400, at, at + 0.15), qv = amp(at, 0.003, 0.09, 0.12);
      q.frequency.exponentialRampToValueAtTime(3300, at + 0.06);
      q.connect(qv);
      route(qv, sfx, { pan: -0.4, verb: 0.25 });
      const n = noise(at, at + 0.4), bp = filter('bandpass', 1800, 1.6), vca = amp(at, 0.004, 0.75, 0.26), p = ctx.createStereoPanner();
      bp.frequency.setValueAtTime(1800, at);
      bp.frequency.exponentialRampToValueAtTime(7500, at + 0.24);
      p.pan.setValueAtTime(-0.6, at);
      p.pan.linearRampToValueAtTime(0.6, at + 0.3);
      n.connect(bp).connect(vca).connect(p);
      route(p, sfx, { verb: 0.25 });
      const z = osc('sawtooth', 820, at, at + 0.4), zv = amp(at, 0.002, 0.16, 0.3);
      z.frequency.exponentialRampToValueAtTime(130, at + 0.18);
      z.connect(filter('lowpass', 5500)).connect(zv);
      route(zv, sfx, { verb: 0.2 });
      const o = osc('sine', 95, at, at + 0.6), ov = amp(at, 0.002, 0.55, 0.5);
      o.frequency.exponentialRampToValueAtTime(44, at + 0.2);
      o.connect(ov);
      route(ov, mix);
    }

    // the music bus dips to `depth` for `hold` seconds from `at` (an effect that has to read through the band)
    function duck(at, depth = 0.5, hold = 0.25) { ducks.push({ at, depth, hold }); }

    // the pump: every kick pulls the music bus down and lets it swell back over a quarter second; then the ducks
    function finish() {
      music.gain.setValueAtTime(1, 0);
      kicks.sort((a, b) => a - b).forEach((k) => {
        music.gain.setValueAtTime(1, k);
        music.gain.linearRampToValueAtTime(0.38, k + 0.012);
        music.gain.linearRampToValueAtTime(1, k + 0.27);
      });
      ducker.gain.setValueAtTime(1, 0);
      ducks.sort((a, b) => a.at - b.at).forEach(({ at, depth, hold }) => {
        ducker.gain.setValueAtTime(1, at - 0.02);
        ducker.gain.linearRampToValueAtTime(depth, at);
        ducker.gain.setValueAtTime(depth, at + hold);
        ducker.gain.linearRampToValueAtTime(1, at + hold + 0.2);
      });
    }

    return { kick, crash, impact, clap, snare, hat, clock, bass, chord, bell, tick, pop, blip, whoosh, swell, rise, drone, stamp, slash, duck, finish };
  }

  // ---------- the price ticks: one per $1,000 the counter crosses, timed off the page's own price() ----------
  function priceTicks(c, price) {
    const up = [], down = [];
    let last = Math.floor(price(c.countA) / 1000);
    for (let t = c.countA; t <= c.rollB + 1e-9; t += 0.001) {
      const k = Math.floor(price(t) / 1000 + 1e-9);
      if (k !== last) { (k > last ? up : down).push(t); last = k; }
    }
    return { up, down };
  }

  // ---------- the arrangement: every cue in ad seconds ----------
  // a beat: the price, the line and the end card on bar lines (costIn + 0, 8 and 12 beats)
  const beatOf = (c) => (c.endIn - c.costIn) / 12;

  function arrange(s, c, price) {
    const beat = beatOf(c), g = (b) => c.costIn + b * beat;
    const out = 0.3; // the page's beat exit (OUT): fade, lift and blur
    const cues = [];
    const cue = (name, t) => { cues.push({ name, t: +t.toFixed(4) }); return t; };
    // closed sixteenths (the eighths louder) from beat `from` up to time `to` except the beats in `skip`, open hats on
    // the beats in `opens`
    const hats = (from, to, loud = 0.085, opens = [], skip = []) => {
      for (let b = from; g(b) < to - 0.01; b += 0.25) {
        if (skip.includes(b)) continue;
        const on8 = b % 0.5 === 0;
        s.hat(g(b), on8 ? loud : loud * 0.55, false, on8 ? -0.2 : 0.25);
      }
      opens.forEach((b) => s.hat(g(b), loud * 0.7, true, 0.3));
    };
    // sixteenth-note glass, chord tones, from beat `from` up to time `to`
    const arp = (from, to, notes) => {
      for (let b = from, i = 0; g(b) < to - 0.01; b += 0.25, i++) s.bell(g(b), notes[i % notes.length], 0.045, { dur: 0.35, index: 1.4, echo: 0.3, verb: 0.15, pan: i % 2 ? 0.4 : -0.4, bus: 'music' });
    };

    // I. DEAR API USERS, D minor add9: air, a glass tap on the tile, a note a word, a reversed swell into the price
    s.chord(0, c.dearOut - 0.06, ['D3', 'A3', 'E4', 'F4'], { g: 0.03, attack: 1.3, release: 0.3, cut: 450, cutTo: 1500, verb: 0.5, spread: 0.8 });
    s.drone(0, c.costIn - 0.01, 'D2', 0.05);
    s.bell(cue('tile pop', c.dearIn + 0.02), 'D4', 0.38, { dur: 1.8, echo: 0.2 });
    s.bell(c.dearIn + 0.02, 'D6', 0.09, { dur: 0.7, index: 1.2, verb: 0.4 });
    s.bell(c.dearIn + 0.02, 'A5', 0.12, { dur: 0.25, ratio: 1.41, index: 3, verb: 0.2 }); // the knock of glass: mid body
    s.pop(c.dearIn + 0.02, 70, 150, 0.35);
    ['F4', 'A4', 'D5'].forEach((n, i) => s.bell(cue(`word ${i + 1}`, c.dearIn + 0.46 + i * 0.14), n, 0.2 + 0.06 * i, { pan: (i - 1) * 0.35, dur: 1 + 0.4 * i }));
    // closed hats creep in two beats out, so the tempo is set before the first bar line
    for (let b = -2; b < 0; b += 0.25) s.hat(g(b), 0.012 + 0.03 * ((b + 2) / 2), false, b % 0.5 ? 0.25 : -0.2);
    s.swell(1.1, c.costIn - 0.012, { from: 900, to: 7500, g: 0.1 });
    s.whoosh(c.dearOut - out - 0.06, c.costIn - 0.02, c.dearOut + 0.12, { from: 300, to: 3500, g: 0.32, pan: [0.3, -0.2] });

    // II. Before superbot, D minor: the price climbs over a pulsing bass, every $1,000 a tick one step up the scale
    s.impact(cue('price in', g(0)), 0.75);
    s.chord(g(0), g(2), ['D3', 'F3', 'A3', 'D4'], { g: 0.045, cut: 700, cutTo: 1400, release: 0.06 });
    s.chord(g(2), c.countB - 0.09, ['Bb2', 'D3', 'F3', 'Bb3'], { g: 0.05, cut: 1400, cutTo: 2200, release: 0.05 });
    // the last eighth before $30,000 is left empty, so the stamp lands out of a gap
    [0, 0.5, 1, 1.5, 2].forEach((b) => s.bass(g(b), beat / 2 - 0.01, b < 2 ? 'D2' : 'Bb1', 0.42));
    s.kick(g(1.5), 0.7);
    s.clap(g(2), 0.55);
    hats(0, g(2.5), 0.07);
    const { up, down } = priceTicks(c, price);
    up.forEach((t, i) => s.tick(t, degree(62, MINOR, Math.round((i + 1) / up.length * 14)), 0.06 + 0.03 * (i / up.length), i % 2 ? 0.3 : -0.3));
    cue('count ticks', up[0]);

    // III. $30,000 lands and hangs: the band stops dead, a clock ticks on the beat, a reversed cymbal pulls to the swap
    s.stamp(cue('$30,000 stamp', c.countB));
    s.drone(c.countB, c.swap, 'A1', 0.09);
    [3, 3.5, 4].forEach((b, i) => s.clock(cue(`clock ${i + 1}`, g(b)), 0.2 + 0.05 * i, i % 2 ? 0.25 : -0.25));
    s.swell(c.countB + 0.2, c.swap - 0.004, { from: 3000, to: 9500, g: 0.12 });

    // IV. After superbot: a whoosh and a glass sparkle as the chip flips, then A sus4 opens up while the price rolls
    //     down, every $1,000 a tick one step HIGHER (a falling price is the good news), a snare run into the drop
    s.whoosh(c.swap - 0.03, c.swap + 0.1, c.swap + 0.45, { from: 500, to: 6500, g: 0.36, pan: [-0.35, 0.5] });
    ['E5', 'A5', 'B5', 'E6', 'A6', 'B6'].forEach((n, i) => s.bell(c.swap + 0.1 + i * 0.035, n, 0.1, { dur: 1, pan: -0.5 + i * 0.2, echo: 0.35, verb: 0.5 }));
    cue('swap sparkle', c.swap + 0.1);
    s.chord(c.swap, g(6) - 0.012, ['A2', 'D3', 'E3', 'A3'], { g: 0.05, attack: 0.9, cut: 500, cutTo: 7000, release: 0.008, spread: 0.8 });
    s.rise(c.swap + 0.05, g(6) - 0.012, 'A2', 'A4', 0.04);
    s.swell(c.swap + 0.15, g(6) - 0.012, { from: 700, to: 11000, g: 0.14 });
    down.forEach((t, i) => s.tick(t, degree(69, MIXO, Math.round((i + 1) / down.length * 14)), 0.09 + 0.05 * (i / down.length), i % 2 ? 0.35 : -0.35));
    s.duck(c.rollA, 0.7, c.rollB - c.rollA - 0.2);
    cue('roll ticks', down[0]);
    [4.5, 5, 5.25, 5.5, 5.625, 5.75, 5.875].forEach((b, i) => s.snare(g(b), 0.22 + 0.09 * i));

    // V. $800: the drop, D major, the full band; 97% less gets a pop and a two-note chime
    s.impact(cue('drop: $800', g(6)), 1, 0.55); // a lighter crash: its 5 kHz wash would cover the 97% chime
    s.chord(g(6), g(8), ['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4'], { g: 0.04, cut: 5200, release: 0.04, spread: 0.85 });
    [6, 6.5, 7, 7.5].forEach((b) => s.bass(g(b), beat / 2 - 0.01, 'D2', 0.45));
    s.clap(g(7), 0.7);
    s.kick(g(7.5), 0.8);
    // the chime gets a hole: no hat on the sixteenth under it, and the music bus ducks hard
    hats(6, g(8), 0.085, [6.5, 7.5], [6.25]);
    s.duck(c.less - 0.02, 0.3, 0.38);
    s.pop(cue('97% less', c.less), 520, 1600, 0.5, 0.15);
    s.bell(c.less + 0.01, 'A5', 0.36, { pan: 0.15, index: 3 });
    s.bell(c.less + 0.1, 'D6', 0.36, { pan: 0.25, index: 3 });
    s.bell(c.less + 0.1, 'D7', 0.08, { dur: 0.8, pan: 0.4, verb: 0.5 });

    // VI. One download and stop paying API pricing: G then A under the words; the strike slashes and stops the band,
    //     a snare run and a reversed swell pull into the end card
    s.whoosh(c.costOut - out - 0.04, g(8) - 0.02, c.costOut + 0.12, { from: 350, to: 4500, g: 0.4, pan: [-0.3, 0.3] });
    s.kick(cue('line in', g(8)), 0.9);
    s.crash(g(8), 0.16);
    s.chord(g(8), g(10), ['G3', 'B3', 'D4', 'G4'], { g: 0.045, cut: 4200, release: 0.04, spread: 0.85 });
    s.chord(g(10), c.strike, ['A3', 'C#4', 'E4', 'A4'], { g: 0.048, cut: 4800, release: 0.06, spread: 0.85 });
    [8, 8.5, 9, 9.5].forEach((b) => s.bass(g(b), beat / 2 - 0.01, 'G1', 0.45));
    s.bass(g(10), beat / 2 - 0.01, 'A1', 0.45);
    s.bass(g(10.5), c.strike - g(10.5) - 0.005, 'A1', 0.45);
    s.clap(g(9), 0.7);
    s.kick(g(9.5), 0.75);
    s.kick(g(10), 0.85);
    hats(8, c.strike, 0.085, [8.5, 9.5]);
    [[['B5', 'D6'], 0.24], [['G5'], 0.1], [['A5'], 0.1], [['B5'], 0.1], [['D5'], 0.08], [['C5'], 0.08]].forEach(([notes, gain], i) => {
      const t = c.lineIn + 0.05 + i * 0.1 + 0.05;
      notes.forEach((n) => s.bell(t, n, gain, { dur: i < 4 ? 0.9 : 0.4, index: i < 4 ? 2.2 : 0.6, pan: -0.4 + i * 0.16 }));
      if (i === 0) { cue('One download', t); s.duck(t, 0.6, 0.55); }
    });
    s.slash(cue('strike', c.strike));
    [11, 11.25, 11.5, 11.75, 11.875].forEach((b, i) => s.snare(g(b), 0.25 + 0.11 * i));
    s.swell(c.strike + 0.12, g(12) - 0.012, { from: 1500, to: 10000, g: 0.14 });
    s.rise(c.strike + 0.2, g(12) - 0.012, 'E3', 'A4', 0.03);
    s.whoosh(c.lineOut - out - 0.04, g(12) - 0.03, c.lineOut + 0.14, { from: 300, to: 4500, g: 0.3, pan: [0.3, -0.3] });

    // the arp through the drop and the line, stopped by the strike
    arp(6, g(8), ['D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'A5', 'E6']);
    arp(8, g(10), ['D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'B5', 'E6']);
    arp(10, c.strike, ['E5', 'A5', 'C#6', 'E6']);

    // VII. superbot.gg: the last hit on the bar, D major add9 rings out, the opening motif comes back in major with its
    //      third note sung by the mascot's pop (a glide up to A5); a quiet button on the next bar line as the clock stops
    s.impact(cue('end card', g(12)), 1);
    s.chord(g(12), 12.5, ['D3', 'A3', 'D4', 'F#4', 'A4', 'E5'], { g: 0.045, cut: 6500, cutTo: 2400, release: 2.2, spread: 0.9, verb: 0.55 });
    s.chord(g(12) + 0.15, 12.5, ['D6', 'A6'], { g: 0.02, attack: 0.6, release: 2, cut: 9000, type: 'triangle', verb: 0.8, bus: 'sfx' });
    s.bass(g(12), 2.4, 'D2', 0.4);
    ['D5', 'F#5', null, 'D6'].forEach((n, i) => n && s.bell(g(12 + i * 0.25), n, 0.2, { dur: 2, echo: 0.3, verb: 0.4, pan: -0.3 + i * 0.2 }));
    s.duck(c.endIn + 0.33, 0.45, 0.3);
    s.blip(cue('mascot', c.endIn + 0.33), 'A4', 'A5', 0.55, 0.2);
    s.bell(cue('button', g(16)), 'D6', 0.09, { dur: 1.8, echo: 0.25, verb: 0.5 });
    s.bass(g(16), 1.4, 'D2', 0.22);
    s.finish();
    return cues.sort((a, b) => a.t - b.t);
  }

  async function render({ cues, price }, sampleRate = 48000, seconds = LENGTH) {
    const t0 = performance.now();
    const ctx = new OfflineAudioContext(2, Math.round(Math.min(seconds, LENGTH) * sampleRate), sampleRate);
    const sheet = arrange(studio(ctx, beatOf(cues)), cues, price);
    const buffer = await ctx.startRendering();
    let peak = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
    }
    if (!(peak > 0)) throw new Error('score: the render is silent');
    // another browser's compressor could overshoot where Chrome's does not: never let that clip
    if (peak > 0.98) {
      console.warn(`score: the render peaks at ${(20 * Math.log10(peak)).toFixed(2)} dBFS, scaled to -0.2`);
      for (let c = 0; c < buffer.numberOfChannels; c++) { const d = buffer.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= 0.98 / peak; }
    }
    return { buffer, cues: sheet, peakDb: 20 * Math.log10(peak), ms: Math.round(performance.now() - t0) };
  }

  window.SbScore = { render, LENGTH };
})();
