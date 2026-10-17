// synth.05235191.js: the instruments for the DEAR API USERS score, plain WebAudio oscillators and noise, no samples.
// Every voice takes AD time (seconds on the spot's own clock); a take maps that onto its context's clock, so one score
// plays live in an AudioContext or renders offline in an OfflineAudioContext unchanged. A take started part-way (a seek,
// a resume) drops one-shots that are already past and joins sustained voices late with a short fade-in.
(function () {
  const ASSETS = new WeakMap();

  // deterministic noise (an LCG), so two offline renders are byte-identical
  function lcg(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  }

  // per context: 2 s of stereo noise, a 2.2 s stereo room (darkening as it decays) and a soft-clip curve
  function assets(ctx) {
    let a = ASSETS.get(ctx);
    if (a) return a;
    const sr = ctx.sampleRate, rand = lcg(0x5eed);
    const noise = ctx.createBuffer(2, sr * 2, sr);
    for (let c = 0; c < 2; c++) {
      const d = noise.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = rand();
    }
    const len = Math.floor(sr * 2.2), pre = Math.floor(sr * 0.014), ir = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const x = (i - pre) / (len - pre);
        lp += (rand() - lp) * (0.7 - 0.55 * x);
        d[i] = lp * Math.pow(1 - x, 2.6);
      }
    }
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(2.2 * (i / 511.5 - 1)) / Math.tanh(2.2);
    a = { noise, ir, curve };
    ASSETS.set(ctx, a);
    return a;
  }

  // a take: one playback of the score into dest, ad time t0 sounding at context time base
  function take(ctx, dest, t0, base) {
    const A = assets(ctx);
    const out = ctx.createGain();
    out.connect(dest);
    const duck = ctx.createGain(); // pads and chords: pumped by the kick
    duck.connect(out);
    const bassDuck = ctx.createGain(); // the bass: cleared out from under every kick, or the two sines cancel
    bassDuck.connect(out);
    const verb = ctx.createConvolver();
    verb.buffer = A.ir;
    const send = ctx.createGain();
    send.connect(verb);
    const wetOut = ctx.createGain();
    wetOut.gain.value = 0.34;
    verb.connect(wetOut);
    wetOut.connect(out);
    return { ctx, A, out, duck, bassDuck, send, t0, base, nodes: [], at: (t) => base + (t - t0) };
  }

  // a fast fade, then every source of the take stopped and the take unplugged
  function stop(k) {
    const now = k.ctx.currentTime, g = k.out.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.04);
    for (const n of k.nodes) n.stop(now + 0.06);
    setTimeout(() => k.out.disconnect(), 150);
  }

  // ---------- timing ----------
  const past = (k, t) => t < k.t0 - 0.004;
  // a sustained voice's window clipped to the take: null once it is over, late when it joins part-way
  function span(k, t, d) {
    if (t + d <= k.t0 + 0.05) return null;
    if (t >= k.t0) return { t, d, late: false };
    return { t: k.t0, d: t + d - k.t0, late: true };
  }

  // ---------- nodes ----------
  function gain(k, v, ...to) {
    const g = k.ctx.createGain();
    g.gain.value = v;
    to.forEach((n) => g.connect(n));
    return g;
  }
  const wet = (k, amount) => gain(k, amount, k.send);
  function biquad(k, type, f, q, to) {
    const b = k.ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    b.connect(to);
    return b;
  }
  function panner(k, p, to) {
    const n = k.ctx.createStereoPanner();
    n.pan.value = p;
    n.connect(to);
    return n;
  }
  function osc(k, type, f, at, end, to, detune = 0) {
    const o = k.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.frequency.setValueAtTime(f, at);
    o.detune.value = detune;
    o.connect(to);
    o.start(at);
    o.stop(end);
    k.nodes.push(o);
    return o;
  }
  function noise(k, at, end, to) {
    const s = k.ctx.createBufferSource();
    s.buffer = k.A.noise;
    s.loop = true;
    s.connect(to);
    s.start(at, (at * 0.618) % 1.9);
    s.stop(end);
    k.nodes.push(s);
    return s;
  }

  // ---------- envelopes ----------
  // percussive: up over a, then an exponential fall to silence over d
  function perc(param, at, peak, a, d) {
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(peak, at + a);
    param.exponentialRampToValueAtTime(0.0001, at + a + d);
  }
  // sustained: up over a, held, down over r to the window's end
  function hold(param, at, end, peak, a, r) {
    const top = Math.min(at + a, end - 0.01), fall = Math.max(top, end - r);
    param.setValueAtTime(0, at);
    param.linearRampToValueAtTime(peak, top);
    param.setValueAtTime(peak, fall);
    param.linearRampToValueAtTime(0, end);
  }
  // the kick pulls the pads and chords down by depth and lets them swell back; the bass it clears out almost entirely
  // for the kick's first 120 ms, so the kick's falling sine never sits against the bass's and cancels it
  function pump(k, at, depth, rel = 0.18) {
    const p = k.duck.gain, b = k.bassDuck.gain;
    p.setValueAtTime(1, at);
    p.linearRampToValueAtTime(1 - depth, at + 0.008);
    p.linearRampToValueAtTime(1, at + rel);
    b.setValueAtTime(1, at);
    b.linearRampToValueAtTime(0.08, at + 0.006);
    b.setValueAtTime(0.08, at + 0.12);
    b.linearRampToValueAtTime(1, at + 0.25);
  }
  // a tape stop: the pitch runs down to nearly nothing over d, the way a reel slows
  function tapeStop(o, f, at, d) {
    o.frequency.setValueAtTime(f, at);
    o.frequency.linearRampToValueAtTime(f * 0.07, at + d);
  }

  // ---------- drums ----------
  function kick(k, t, amp = 1, depth = 0.7) {
    if (past(k, t)) return;
    const at = k.at(t), g = gain(k, 0, k.out);
    const o = osc(k, 'sine', 170, at, at + 0.45, g);
    o.frequency.exponentialRampToValueAtTime(55, at + 0.06);
    o.frequency.exponentialRampToValueAtTime(42, at + 0.32);
    // the body holds while the sidechain has the bass and pads down, then falls (-26 dB by 250 ms)
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(amp, at + 0.002);
    g.gain.setTargetAtTime(0, at + 0.04, 0.065);
    const cg = gain(k, 0, k.out);
    noise(k, at, at + 0.03, biquad(k, 'highpass', 3000, 0.7, cg));
    perc(cg.gain, at, amp * 0.22, 0.001, 0.02);
    if (depth) pump(k, at, depth);
  }

  function snare(k, t, amp = 0.2) {
    if (past(k, t)) return;
    const at = k.at(t), g = gain(k, 0, k.out, wet(k, 0.2));
    noise(k, at, at + 0.2, biquad(k, 'highpass', 1500, 0.7, g));
    perc(g.gain, at, amp, 0.001, 0.15);
    const tg = gain(k, 0, k.out);
    const o = osc(k, 'triangle', 200, at, at + 0.12, tg);
    o.frequency.exponentialRampToValueAtTime(160, at + 0.08);
    perc(tg.gain, at, amp * 0.6, 0.001, 0.09);
  }

  // three quick bursts and a tail through one band-pass
  function clap(k, t, amp = 0.3) {
    if (past(k, t)) return;
    const at = k.at(t), g = gain(k, 0, k.out, wet(k, 0.28));
    noise(k, at, at + 0.32, biquad(k, 'bandpass', 1350, 0.9, g));
    g.gain.setValueAtTime(0, at);
    for (let i = 0; i < 3; i++) {
      const b = at + i * 0.011;
      g.gain.setValueAtTime(amp, b);
      g.gain.exponentialRampToValueAtTime(amp * 0.12, b + 0.009);
    }
    g.gain.setValueAtTime(amp * 0.85, at + 0.033);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.26);
  }

  function hat(k, t, amp = 0.1, open = false) {
    if (past(k, t)) return;
    const at = k.at(t), d = open ? 0.26 : 0.04, g = gain(k, 0, panner(k, 0.18, k.out));
    noise(k, at, at + d + 0.03, biquad(k, 'highpass', 7600, 0.8, g));
    perc(g.gain, at, amp, 0.001, d);
  }

  function crash(k, t, amp = 0.2, d = 1.8) {
    if (past(k, t)) return;
    const at = k.at(t), g = gain(k, 0, k.out, wet(k, 0.35));
    noise(k, at, at + d + 0.05, biquad(k, 'highpass', 4200, 0.5, g));
    perc(g.gain, at, amp, 0.002, d);
  }

  // an impact: a falling sine under a dark burst
  function boom(k, t, f0, f1, amp = 0.8, d = 1.3) {
    if (past(k, t)) return;
    const at = k.at(t), g = gain(k, 0, k.out, wet(k, 0.22));
    const o = osc(k, 'sine', f0, at, at + d + 0.05, g);
    o.frequency.exponentialRampToValueAtTime(f1, at + d * 0.6);
    perc(g.gain, at, amp, 0.004, d);
    const ng = gain(k, 0, k.out, wet(k, 0.4));
    noise(k, at, at + 0.7, biquad(k, 'lowpass', 380, 0.7, ng));
    perc(ng.gain, at, amp * 0.55, 0.003, 0.6);
  }

  // ---------- tones ----------
  // a chord of detuned saws through one low-pass: the beds (slow attack, low cutoff) and the stabs (instant, bright, falling)
  function saws(k, t, d, freqs, o = {}) {
    const w = span(k, t, d);
    if (!w) return;
    const { amp = 0.03, cutoff = 1800, cutoffTo = cutoff, sweep = w.d, attack = 0.01, release = 0.3, detune = 9,
      voices = 3, send = 0.3, q = 0.6, duck = true, tape = null } = o;
    const at = k.at(w.t), end = at + w.d;
    const g = gain(k, 0, duck ? k.duck : k.out, wet(k, send));
    const lp = biquad(k, 'lowpass', cutoff, q, g);
    lp.frequency.setValueAtTime(cutoff, at);
    if (cutoffTo !== cutoff) lp.frequency.exponentialRampToValueAtTime(cutoffTo, at + Math.max(0.02, Math.min(sweep, w.d)));
    const tapeAt = tape && k.at(tape.t) > at ? k.at(tape.t) : null;
    freqs.forEach((f, i) => {
      for (let v = 0; v < voices; v++) {
        const spread = voices === 1 ? 0 : (v / (voices - 1)) * 2 - 1;
        const n = osc(k, 'sawtooth', f, at, end + 0.02, panner(k, spread * 0.6 * (i % 2 ? -1 : 1), lp), spread * detune);
        if (tapeAt) tapeStop(n, f, tapeAt, tape.d);
      }
    });
    if (tapeAt) {
      lp.frequency.setValueAtTime(cutoffTo, tapeAt);
      lp.frequency.exponentialRampToValueAtTime(260, tapeAt + tape.d);
    }
    hold(g.gain, at, end, amp, w.late ? 0.05 : attack, release);
  }

  // a sine and its octave through a soft clip and a low-pass, into the pumped bus
  function bass(k, t, d, f, o = {}) {
    const w = span(k, t, d);
    if (!w) return;
    const { amp = 0.3, cutoff = 700, attack = 0.006, release = 0.08, tape = null } = o;
    const at = k.at(w.t), end = at + w.d;
    const g = gain(k, 0, k.bassDuck);
    const sh = k.ctx.createWaveShaper();
    sh.curve = k.A.curve;
    sh.connect(biquad(k, 'lowpass', cutoff, 0.8, g));
    const a = osc(k, 'sine', f, at, end + 0.02, gain(k, 0.8, sh));
    const b = osc(k, 'triangle', f * 2, at, end + 0.02, gain(k, 0.22, sh));
    if (tape && k.at(tape.t) > at) {
      tapeStop(a, f, k.at(tape.t), tape.d);
      tapeStop(b, f * 2, k.at(tape.t), tape.d);
    }
    hold(g.gain, at, end, amp, w.late ? 0.04 : attack, release);
  }

  // a low hum that trembles: the $30,000 hanging there
  function drone(k, t, d, f, o = {}) {
    const w = span(k, t, d);
    if (!w) return;
    const { amp = 0.12, rate = 5.5, depth = 0.45, attack = 0.08, release = 0.25 } = o;
    const at = k.at(w.t), end = at + w.d;
    const g = gain(k, 0, k.out, wet(k, 0.25));
    const trem = gain(k, 1, g);
    const lfo = gain(k, depth, trem.gain);
    osc(k, 'sine', rate, at, end + 0.02, lfo);
    osc(k, 'sine', f, at, end + 0.02, trem);
    osc(k, 'sawtooth', f * 2, at, end + 0.02, biquad(k, 'lowpass', 320, 1.2, gain(k, 0.35, trem)));
    hold(g.gain, at, end, amp, w.late ? 0.04 : attack, release);
  }

  function pluck(k, t, f, o = {}) {
    if (past(k, t)) return;
    const { amp = 0.16, decay = 0.45, pan = 0, bright = 3200, send = 0.3, type = 'triangle' } = o;
    const at = k.at(t), end = at + decay + 0.05;
    const g = gain(k, 0, panner(k, pan, k.out), wet(k, send));
    const lp = biquad(k, 'lowpass', bright, 1.2, g);
    lp.frequency.setValueAtTime(bright, at);
    lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.2), at + decay);
    osc(k, type, f, at, end, lp);
    osc(k, 'square', f, at, end, gain(k, 0.16, lp), 6);
    perc(g.gain, at, amp, 0.002, decay);
  }

  // two-operator FM: ratio 2 rings like a glass bell, ratio ~3.5 like a coin
  function bell(k, t, f, o = {}) {
    if (past(k, t)) return;
    const { amp = 0.1, decay = 0.9, ratio = 2, index = 2.2, pan = 0, send = 0.45, detune = 0 } = o;
    const at = k.at(t), end = at + decay + 0.05;
    const g = gain(k, 0, panner(k, pan, k.out), wet(k, send));
    const car = osc(k, 'sine', f, at, end, g, detune);
    const mg = gain(k, 0, car.frequency);
    osc(k, 'sine', f * ratio, at, end, mg);
    mg.gain.setValueAtTime(f * index, at);
    mg.gain.exponentialRampToValueAtTime(f * index * 0.04, at + decay * 0.6);
    perc(g.gain, at, amp, 0.002, decay);
  }

  // a pitch that springs from f0 to f1: the pops
  function blip(k, t, f0, f1, o = {}) {
    if (past(k, t)) return;
    const { amp = 0.14, glide = 0.08, decay = 0.4, pan = 0, send = 0.35 } = o;
    const at = k.at(t), end = at + decay + 0.05;
    const g = gain(k, 0, panner(k, pan, k.out), wet(k, send));
    [['sine', 1, g], ['triangle', 2, gain(k, 0.18, g)]].forEach(([type, m, to]) => {
      const n = osc(k, type, f0 * m, at, end, to);
      n.frequency.exponentialRampToValueAtTime(f1 * m, at + glide);
    });
    perc(g.gain, at, amp, 0.003, decay);
  }

  // ---------- transitions ----------
  // band-passed noise (and optionally a saw) climbing along curve (0..1 samples) over d, cut dead at the end
  function riser(k, t, d, curve, o = {}) {
    if (past(k, t)) return;
    const { amp = 0.2, f0 = 300, f1 = 7000, q = 2.4, tone = null, toneAmp = 0.03, send = 0.3 } = o;
    const at = k.at(t);
    if (amp > 0) {
      const g = gain(k, 0, k.out, wet(k, send));
      const bp = biquad(k, 'bandpass', f0, q, g);
      noise(k, at, at + d + 0.01, bp);
      bp.frequency.setValueCurveAtTime(Float32Array.from(curve, (c) => f0 * Math.pow(f1 / f0, c)), at, d);
      g.gain.setValueCurveAtTime(Float32Array.from(curve, (c) => amp * c * c), at, d);
    }
    if (!tone) return;
    const tg = gain(k, 0, k.out, wet(k, send));
    const lp = biquad(k, 'lowpass', 400, 2, tg);
    const n = osc(k, 'sawtooth', tone[0], at, at + d + 0.01, lp);
    n.frequency.setValueCurveAtTime(Float32Array.from(curve, (c) => tone[0] * Math.pow(tone[1] / tone[0], c)), at, d);
    lp.frequency.setValueCurveAtTime(Float32Array.from(curve, (c) => 400 * Math.pow(12, c)), at, d);
    tg.gain.setValueCurveAtTime(Float32Array.from(curve, (c) => toneAmp * (0.25 + 0.75 * c)), at, d);
  }

  // a reverse cymbal: noise opening up and swelling into a hard stop
  function swell(k, t, d, amp = 0.22) {
    if (past(k, t)) return;
    const at = k.at(t), end = at + d, g = gain(k, 0, k.out, wet(k, 0.1));
    const lp = biquad(k, 'lowpass', 500, 0.7, g);
    lp.frequency.setValueAtTime(500, at);
    lp.frequency.exponentialRampToValueAtTime(13000, end);
    noise(k, at, end + 0.01, lp);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(amp, end - 0.006);
    g.gain.linearRampToValueAtTime(0, end);
  }

  // air moving across the stereo field
  function whoosh(k, t, d, o = {}) {
    if (past(k, t)) return;
    const { amp = 0.16, f0 = 700, f1 = 6000, p0 = -0.6, p1 = 0.6, send = 0.3, peak = 0.55 } = o;
    const at = k.at(t), end = at + d, pn = panner(k, p0, k.out), g = gain(k, 0, pn, wet(k, send));
    pn.pan.setValueAtTime(p0, at);
    pn.pan.linearRampToValueAtTime(p1, end);
    const bp = biquad(k, 'bandpass', f0, 1.1, g);
    bp.frequency.setValueAtTime(f0, at);
    bp.frequency.exponentialRampToValueAtTime(f1, end);
    noise(k, at, end + 0.02, bp);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(amp, at + d * peak);
    g.gain.exponentialRampToValueAtTime(0.0005, end);
  }

  // the strike: a hiss tearing left to right with the red bar, over a falling zap
  function slash(k, t, d = 0.3, amp = 0.28) {
    if (past(k, t)) return;
    const at = k.at(t), end = at + d, pn = panner(k, -0.7, k.out), g = gain(k, 0, pn, wet(k, 0.3));
    pn.pan.setValueAtTime(-0.7, at);
    pn.pan.linearRampToValueAtTime(0.7, end);
    const hp = biquad(k, 'highpass', 9000, 0.9, g);
    hp.frequency.setValueAtTime(9000, at);
    hp.frequency.exponentialRampToValueAtTime(1400, at + d * 0.9);
    noise(k, at, end + 0.05, hp);
    perc(g.gain, at, amp, 0.004, d);
    const zg = gain(k, 0, pn);
    const z = osc(k, 'sawtooth', 2400, at, end + 0.05, biquad(k, 'lowpass', 5000, 1, zg));
    z.frequency.exponentialRampToValueAtTime(160, at + d * 0.75);
    perc(zg.gain, at, amp * 0.22, 0.002, d);
  }

  // the bus the takes play into: a gentle glue compressor, a limiter, a trim, and a soft clip that holds the last
  // overshoot under -0.9 dBFS. WebAudio's compressors add their own make-up gain, so the input is padded down first.
  function chain(ctx, dest) {
    const mix = ctx.createGain();
    mix.gain.value = 0.5;
    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -16; glue.knee.value = 8; glue.ratio.value = 2.5; glue.attack.value = 0.01; glue.release.value = 0.18;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.06;
    const trim = ctx.createGain();
    trim.gain.value = 1.05;
    const clip = ctx.createWaveShaper();
    clip.curve = Float32Array.from({ length: 2048 }, (_, i) => 0.9 * Math.tanh((i / 1023.5 - 1) / 0.9));
    clip.oversample = '4x';
    mix.connect(glue);
    glue.connect(lim);
    lim.connect(trim);
    trim.connect(clip);
    clip.connect(dest);
    return { input: mix, mix, trim };
  }

  window.Synth = {
    take, stop, chain,
    kick, snare, clap, hat, crash, boom,
    saws, bass, drone, pluck, bell, blip,
    riser, swell, whoosh, slash,
  };
})();
