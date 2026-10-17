// The multicat score's instruments (multicat-score.b9427543.js), all synthesized into one OfflineAudioContext: no
// samples. Each voice is a short graph scheduled at an absolute time and wired to a bus; noise comes from one seeded
// buffer, so a render is the same every time. Reverb impulses are generated here too (decaying, darkening noise).

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// a small seeded PRNG (mulberry32): the same seed gives the same score
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// attack to `peak`, then an exponential decay to silence over `d`
function hit(param, t, peak, a, d) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(peak, t + a);
  param.exponentialRampToValueAtTime(1e-4, t + a + d);
  param.setValueAtTime(0, t + a + d);
}

// a stereo impulse response: noise under an exponential decay, through a one-pole lowpass that closes as it decays
function impulse(ac, rnd, secs, decay, bright) {
  const n = Math.floor(ac.sampleRate * secs), pre = Math.floor(ac.sampleRate * 0.014);
  const b = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let lp = 0;
    for (let i = pre; i < n; i++) {
      const tt = (i - pre) / ac.sampleRate;
      lp += (bright * Math.exp(-tt * 2.2) + 0.04) * (rnd() * 2 - 1 - lp);
      d[i] = lp * Math.exp(-tt / decay);
    }
  }
  return b;
}

function softClip(ac, drive) {
  const n = 1024, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(drive * x) / Math.tanh(drive); }
  return new WaveShaperNode(ac, { curve, oversample: '2x' });
}

// the buses every voice routes into, the master chain after them, and the voices themselves
export function makeKit(ac, seed) {
  const rnd = rng(seed);
  const noise = ac.createBuffer(2, ac.sampleRate * 2, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = noise.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }

  // master: a gentle glue compressor, then a fast limiter-style compressor a hair under full scale
  const master = new GainNode(ac);
  const glue = new DynamicsCompressorNode(ac, { threshold: -14, knee: 8, ratio: 2.5, attack: 0.006, release: 0.18 });
  const limit = new DynamicsCompressorNode(ac, { threshold: -3, knee: 0, ratio: 20, attack: 0.001, release: 0.06 });
  master.connect(glue).connect(limit).connect(ac.destination);

  const bus = (to, gain = 1) => { const g = new GainNode(ac, { gain }); g.connect(to); return g; };
  const sfx = bus(master);
  // the bed: everything under `duck` (the SFX sidechain), pad and bass also under `pump` (the kick sidechain); kick and
  // bass reach theirs through a soft clip, for weight on small speakers
  const bedOut = bus(master), duck = bus(bedOut), pump = bus(duck);
  const kickBus = new GainNode(ac), bassBus = new GainNode(ac);
  kickBus.connect(softClip(ac, 1.6)).connect(duck);
  bassBus.connect(softClip(ac, 2.2)).connect(pump);

  // reverbs: a short bright plate for the SFX, a softer room for the bed (its return closes at the song handoff)
  const verb = (secs, decay, bright, ret) => { const cv = new ConvolverNode(ac, { buffer: impulse(ac, rnd, secs, decay, bright) }); const r = bus(ret); cv.connect(r); return { in: cv, ret: r }; };
  const sfxVerb = verb(2.6, 0.55, 0.55, master);
  const bedVerb = verb(1.8, 0.4, 0.4, duck);
  // a ping-pong delay at a dotted eighth for the bed's plucks
  const delayIn = new GainNode(ac), delayRet = bus(duck, 1);
  const dl = new DelayNode(ac, { maxDelayTime: 1, delayTime: 0.375 }), dr = new DelayNode(ac, { maxDelayTime: 1, delayTime: 0.375 });
  const fb = new GainNode(ac, { gain: 0.3 }), dlp = new BiquadFilterNode(ac, { type: 'lowpass', frequency: 3200 });
  const pl = new StereoPannerNode(ac, { pan: -0.7 }), pr = new StereoPannerNode(ac, { pan: 0.7 });
  delayIn.connect(dl); dl.connect(pl).connect(delayRet); dl.connect(dr); dr.connect(pr).connect(delayRet); dr.connect(dlp).connect(fb).connect(dl);

  const B = { master, sfx, bedOut, duck, pump, kickBus, bassBus, sfxVerb, bedVerb, delayIn, delayRet };

  // node -> panner -> out, with optional reverb and delay sends. Voices are built while the render is suspended
  // (multicat-score.b9427543.js), so every node takes its values as constructor options: a .value set then is a
  // setValueAtTime at a currentTime that is not stable mid-render, and the same score rendered twice came out different
  function route(node, { out, pan = 0, rvb = 0, verbIn = out === sfx ? sfxVerb.in : bedVerb.in, dly = 0 }) {
    const p = new StereoPannerNode(ac, { pan });
    node.connect(p).connect(out);
    if (rvb) p.connect(new GainNode(ac, { gain: rvb })).connect(verbIn);
    if (dly) p.connect(new GainNode(ac, { gain: dly })).connect(delayIn);
  }

  // a filtered noise burst; `f1` sweeps the filter to there over the burst
  function noiseHit(t, { type = 'bandpass', f = 3000, f1 = 0, q = 1, a = 0.001, d = 0.02, gain = 0.1, ...r }) {
    const src = new AudioBufferSourceNode(ac, { buffer: noise, loop: true });
    const flt = new BiquadFilterNode(ac, { type, Q: q, frequency: f });
    if (f1) { flt.frequency.setValueAtTime(f, t); flt.frequency.exponentialRampToValueAtTime(f1, t + a + d); }
    const g = new GainNode(ac, { gain: 0 }); hit(g.gain, t, gain, a, d);
    src.connect(flt).connect(g); route(g, r);
    src.start(t, rnd() * 1.8); src.stop(t + a + d + 0.02);
  }

  // a noise swell: rises over [t0, t1] (exponential-ish), the filter sweeping f0 -> f1, then a short release
  function swell(t0, t1, { type = 'bandpass', f0 = 500, f1 = 5000, q = 1.2, gain = 0.06, rel = 0.03, pan0 = 0, pan1 = 0, ...r }) {
    const src = new AudioBufferSourceNode(ac, { buffer: noise, loop: true });
    const flt = new BiquadFilterNode(ac, { type, Q: q, frequency: f0 });
    flt.frequency.setValueAtTime(f0, t0); flt.frequency.exponentialRampToValueAtTime(f1, t1);
    const g = new GainNode(ac, { gain: 0 });
    g.gain.setValueAtTime(1e-4, t0); g.gain.exponentialRampToValueAtTime(gain, t1); g.gain.linearRampToValueAtTime(0, t1 + rel);
    const p = new StereoPannerNode(ac, { pan: pan0 }); p.pan.setValueAtTime(pan0, t0); p.pan.linearRampToValueAtTime(pan1, t1);
    src.connect(flt).connect(g).connect(p); route(p, r);
    src.start(t0, rnd() * 1.8); src.stop(t1 + rel + 0.02);
  }

  // an oscillator blip, optionally gliding f -> f1 over `glide`
  function tone(t, { f, f1 = 0, glide = 0.05, type = 'sine', a = 0.002, d = 0.1, gain = 0.05, ...r }) {
    const o = new OscillatorNode(ac, { type, frequency: f });
    if (f1) { o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f1, t + glide); }
    const g = new GainNode(ac, { gain: 0 }); hit(g.gain, t, gain, a, d);
    o.connect(g); route(g, r);
    o.start(t); o.stop(t + a + d + 0.02);
  }

  // the house timbre: a two-operator FM mallet, glassy while its index is high, settling to a near sine
  function glass(t, { m, gain = 0.05, d = 0.6, ratio = 2, index = 1.4, bloom = 0.12, ...r }) {
    const f = mtof(m);
    const car = new OscillatorNode(ac, { frequency: f }), mod = new OscillatorNode(ac, { frequency: f * ratio });
    const mg = new GainNode(ac, { gain: f * index }), g = new GainNode(ac, { gain: 0 });
    mg.gain.setValueAtTime(f * index, t); mg.gain.exponentialRampToValueAtTime(f * 0.03, t + bloom);
    mod.connect(mg).connect(car.frequency);
    hit(g.gain, t, gain, 0.002, d);
    car.connect(g); route(g, r);
    car.start(t); mod.start(t); car.stop(t + d + 0.03); mod.stop(t + d + 0.03);
  }

  // a sub thump: a sine falling from f0 to f1, for impacts
  function thump(t, { f0 = 110, f1 = 46, gain = 0.3, d = 0.3, out = sfx }) {
    const o = new OscillatorNode(ac, { frequency: f0 }), g = new GainNode(ac, { gain: 0 });
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.09);
    hit(g.gain, t, gain, 0.003, d);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + d + 0.03);
  }

  // drums
  function kick(t, gain) {
    const o = new OscillatorNode(ac, { frequency: 148 }), g = new GainNode(ac, { gain: 0 });
    o.frequency.setValueAtTime(148, t); o.frequency.exponentialRampToValueAtTime(54, t + 0.06); o.frequency.exponentialRampToValueAtTime(44, t + 0.3);
    hit(g.gain, t, gain, 0.0015, 0.22);
    o.connect(g).connect(kickBus);
    o.start(t); o.stop(t + 0.25);
    noiseHit(t, { type: 'highpass', f: 2600, d: 0.005, gain: gain * 0.12, out: kickBus });
  }
  function clap(t, gain, pan = 0) {
    [[0, 0.6, 0.008], [0.01, 0.75, 0.008], [0.021, 1, 0.11]].forEach(([dt, k, d]) =>
      noiseHit(t + dt, { type: 'bandpass', f: 1650, q: 0.9, a: 0.0006, d, gain: gain * k, out: duck, pan, rvb: 0.35 }));
  }
  const hat = (t, gain, d = 0.028, pan = 0.12) => noiseHit(t, { type: 'highpass', f: 8200, q: 0.6, a: 0.0006, d, gain, out: duck, pan });
  const shaker = (t, gain, pan = -0.18) => noiseHit(t, { type: 'bandpass', f: 7000, q: 1.4, a: 0.004, d: 0.02, gain, out: duck, pan });

  // a pad chord: two detuned saws a note into one lowpass that opens from c0 to c1, held `len` with a soft release
  function pad(t, { notes, len, gain = 0.02, c0 = 700, c1 = 1600, a = 0.3, rel = 0.35, out = pump, rvb = 0.3, cut = 0, verbIn = bedVerb.in }) {
    const flt = new BiquadFilterNode(ac, { type: 'lowpass', Q: 0.4, frequency: c0 }), g = new GainNode(ac, { gain: 0 });
    flt.frequency.setValueAtTime(c0, t); flt.frequency.exponentialRampToValueAtTime(c1, t + len * 0.7);
    const end = t + len, stop = cut ? Math.min(end + rel, cut) : end + rel;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + a); g.gain.setValueAtTime(gain, Math.min(end, stop - 0.06));
    g.gain.linearRampToValueAtTime(0, stop);
    flt.connect(g); route(g, { out, rvb, verbIn });
    notes.forEach((m, i) => [-7, 6].forEach((ct, j) => {
      const o = new OscillatorNode(ac, { type: 'sawtooth', frequency: mtof(m), detune: ct + (i % 2 ? 2 : -2) });
      const p = new StereoPannerNode(ac, { pan: (j ? 0.35 : -0.35) * (i % 2 ? -1 : 1) });
      o.connect(p).connect(flt); o.start(t); o.stop(stop + 0.02);
    }));
  }

  // the bass: a sine root with a triangle an octave up for small speakers, saturated on its bus
  function bass(t, { m, len, gain = 0.15, cut = 0 }) {
    const g = new GainNode(ac, { gain: 0 }), end = cut ? Math.min(t + len, cut) : t + len;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008); g.gain.setValueAtTime(gain, end - 0.07); g.gain.linearRampToValueAtTime(0, end);
    g.connect(bassBus);
    const o1 = new OscillatorNode(ac, { frequency: mtof(m) }), o2 = new OscillatorNode(ac, { type: 'triangle', frequency: mtof(m + 12) });
    const g2 = new GainNode(ac, { gain: 0.28 });
    o1.connect(g); o2.connect(g2).connect(g);
    [o1, o2].forEach((o) => { o.start(t); o.stop(end + 0.02); });
  }

  return { ac, rnd, B, route, noiseHit, swell, tone, glass, thump, kick, clap, hat, shaker, pad, bass };
}
