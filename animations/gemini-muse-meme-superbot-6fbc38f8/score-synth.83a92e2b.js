// The multicat score's instruments (score-mix.83a92e2b.js plays them): every voice is synthesised from oscillators and one
// seeded noise buffer, no samples. voices(ctx, rnd, bus) returns the kit; each call schedules one note or effect on an
// OfflineAudioContext at absolute spot seconds. Levels are linear gains before the master limiter.

export const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// a seeded PRNG (mulberry32), so every load renders the same score
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a generated stereo room: decorrelated noise under an exponential decay (-60 dB at `decay`) that darkens as it fades
export function impulse(ctx, rnd, secs = 2.8, decay = 2.3) {
  const sr = ctx.sampleRate, n = Math.floor(secs * sr), pre = Math.floor(0.014 * sr);
  const buf = ctx.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = pre; i < n; i++) {
      const t = (i - pre) / sr, k = 0.35 + 0.55 * Math.min(1, t / decay);
      lp = lp * k + (rnd() * 2 - 1) * (1 - k);
      d[i] = lp * Math.pow(10, (-3 * t) / decay);
    }
  }
  return buf;
}

// a gain curve of n points, f over 0..1 scaled to peak
const curve = (f, peak, n = 96) => Float32Array.from({ length: n }, (_, i) => peak * f(i / (n - 1)));
// a smooth rise to 1 at `pk` (0..1) and fall back to 0
const hump = (pk) => (x) => (x < pk ? Math.sin((Math.PI / 2) * (x / pk)) : Math.cos((Math.PI / 2) * ((x - pk) / (1 - pk)))) ** 2;

export function voices(ctx, rnd, bus) {
  const sr = ctx.sampleRate;
  const noise = ctx.createBuffer(1, sr * 2, sr);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  // a soft saw: harmonics falling as 1/n^1.6, warmer than a raw sawtooth
  const imag = Float32Array.from({ length: 28 }, (_, n) => (n ? Math.pow(n, -1.6) : 0));
  const warm = ctx.createPeriodicWave(new Float32Array(28), imag);

  const gain = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const filter = (type, f, Q = 0.707) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = Q; return b; };
  const pan = (p) => { const s = ctx.createStereoPanner(); s.pan.value = p; return s; };
  const chain = (...ns) => { for (let i = 0; i < ns.length - 1; i++) ns[i].connect(ns[i + 1]); return ns[ns.length - 1]; };
  const sends = (n, list) => { for (const [dest, amt] of list) if (amt > 0) chain(n, gain(amt), dest); };
  function tone(type, f, t, end) {
    const o = ctx.createOscillator();
    if (type === 'warm') o.setPeriodicWave(warm); else o.type = type;
    o.frequency.value = f;
    o.start(t); o.stop(end);
    return o;
  }
  function hiss(t, end) {
    const s = ctx.createBufferSource();
    s.buffer = noise; s.loop = true;
    s.start(t, rnd() * 1.8); s.stop(end);
    return s;
  }
  // a percussive envelope: up to `peak` in `a`, then an exponential fall to -60 dB over `d`
  function perc(p, t, peak, a, d) {
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(peak, t + a);
    p.exponentialRampToValueAtTime(peak * 1e-3, t + a + d);
  }
  const glide = (p, a, b, t, dt) => { p.setValueAtTime(a, t); p.exponentialRampToValueAtTime(b, t + dt); };

  // a sustained chord, two detuned voices a note spread left and right, under one lowpass that moves from cut0 to cut1
  function pad(notes, t0, t1, { level = 0.045, attack = 0.4, release = 0.6, cut0 = 1200, cut1 = 1600, out = bus.music, verb = 0.3 } = {}) {
    const lp = filter('lowpass', cut0, 0.6), amp = gain(0);
    lp.frequency.setValueAtTime(cut0, t0); lp.frequency.linearRampToValueAtTime(cut1, t1);
    const hold = Math.max(t0 + attack, t1);
    amp.gain.setValueAtTime(0, t0); amp.gain.linearRampToValueAtTime(level, t0 + attack);
    amp.gain.setValueAtTime(level, hold); amp.gain.linearRampToValueAtTime(0, hold + release);
    chain(lp, amp, out); sends(amp, [[bus.verb, verb]]);
    for (const m of notes) for (const side of [-1, 1]) {
      const o = tone('warm', midi(m), t0, hold + release + 0.05);
      o.detune.value = side * 7;
      chain(o, gain(1 / notes.length), pan(side * 0.55), lp);
    }
  }

  // a plucked arpeggio note: the soft saw and a sine an octave up, its filter snapping shut as it decays
  function pluck(m, t, { level = 0.036, cut = 2200, dur = 0.26, side = 0, delay = 0.2, verb = 0.16 } = {}) {
    const end = t + dur + 0.05;
    const lp = filter('lowpass', cut * 3, 0.9), amp = gain(0);
    glide(lp.frequency, cut * 3, cut, t, 0.09);
    perc(amp.gain, t, level, 0.003, dur);
    tone('warm', midi(m), t, end).connect(lp);
    chain(tone('sine', midi(m + 12), t, end), gain(0.25), lp);
    chain(lp, amp, pan(side), bus.music);
    sends(amp, [[bus.delay, delay], [bus.verb, verb]]);
  }

  // a bass note: a sine sub and the soft saw through a low filter, so small speakers still hear the line
  function bass(m, t, dur, level = 0.15) {
    const end = t + dur, lp = filter('lowpass', 480, 0.8), amp = gain(0);
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(level, t + 0.006);
    amp.gain.linearRampToValueAtTime(level * 0.72, Math.max(t + 0.01, end - 0.03)); amp.gain.linearRampToValueAtTime(0, end);
    tone('sine', midi(m), t, end + 0.02).connect(lp);
    chain(tone('warm', midi(m), t, end + 0.02), gain(0.5), lp);
    chain(lp, amp, bus.music);
  }

  // a round kick (a pitch-dropping sine and a short click) that ducks the music bus under it
  function kick(t, level = 0.5) {
    const o = tone('sine', 150, t, t + 0.5), amp = gain(0);
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.06); o.frequency.exponentialRampToValueAtTime(42, t + 0.35);
    perc(amp.gain, t, level, 0.002, 0.42);
    chain(o, amp, bus.drums);
    const ca = gain(0); perc(ca.gain, t, level * 0.16, 0.0008, 0.012);
    chain(hiss(t, t + 0.03), filter('highpass', 1800), ca, bus.drums);
    bus.duck(t);
  }

  // a tight snap: three fast noise bursts and a short room tail through one band
  function clap(t, level = 0.15) {
    const bp = filter('bandpass', 1650, 1.1), amp = gain(1);
    chain(bp, amp, pan(-0.06), bus.drums); sends(amp, [[bus.verb, 0.35]]);
    [0, 0.009, 0.018].forEach((dt, i) => { const g = gain(0); perc(g.gain, t + dt, level * (i === 2 ? 1 : 0.65), 0.001, 0.012); chain(hiss(t + dt, t + dt + 0.04), g, bp); });
    const tg = gain(0); perc(tg.gain, t + 0.026, level * 0.55, 0.001, 0.14);
    chain(hiss(t + 0.026, t + 0.22), tg, bp);
  }

  // a hi-hat: bright noise, closed (40 ms) or open
  function hat(t, level = 0.03, open = false) {
    const d = open ? 0.22 : 0.04, pk = filter('peaking', 10500, 0.9), g = gain(0);
    pk.gain.value = 5;
    perc(g.gain, t, level, 0.001, d);
    chain(hiss(t, t + d + 0.05), filter('highpass', 7200), pk, g, pan(0.18), bus.drums);
  }

  // a build into a hit: a noise band sweeping up, and with `m` a soft saw pair gliding up an octave from that note
  function riser(t0, t1, { level = 0.05, f0 = 350, f1 = 6500, m = null } = {}) {
    const bp = filter('bandpass', f0, 2.2), g = gain(0);
    glide(bp.frequency, f0, f1, t0, t1 - t0);
    g.gain.setValueCurveAtTime(curve((x) => x * x * x, level), t0, t1 - t0); g.gain.linearRampToValueAtTime(0, t1 + 0.02);
    chain(hiss(t0, t1 + 0.04), bp, g, bus.fx); sends(g, [[bus.verb, 0.25]]);
    if (m === null) return;
    const lp = filter('lowpass', 500, 0.8), tg = gain(0);
    glide(lp.frequency, 500, 4200, t0, t1 - t0);
    tg.gain.setValueCurveAtTime(curve((x) => x * x, level * 0.45), t0, t1 - t0); tg.gain.linearRampToValueAtTime(0, t1 + 0.02);
    chain(lp, tg, bus.fx); sends(tg, [[bus.verb, 0.2]]);
    for (const side of [-1, 1]) {
      const o = tone('warm', midi(m), t0, t1 + 0.04);
      o.detune.value = side * 9;
      glide(o.frequency, midi(m), midi(m + 12), t0, t1 - t0);
      chain(o, gain(0.5), pan(side * 0.5), lp);
    }
  }

  // a chord swelling in from nothing and stopping dead at t1, a reversed bloom into the hit there
  function swell(notes, t0, t1, level = 0.05) {
    const lp = filter('lowpass', 500, 0.7), g = gain(0);
    glide(lp.frequency, 500, 5200, t0, t1 - t0);
    g.gain.setValueCurveAtTime(curve((x) => x * x * x, level), t0, t1 - t0); g.gain.linearRampToValueAtTime(0, t1 + 0.012);
    chain(lp, g, bus.fx); sends(g, [[bus.verb, 0.3]]);
    for (const m of notes) for (const side of [-1, 1]) {
      const o = tone('warm', midi(m), t0, t1 + 0.04);
      o.detune.value = side * 9;
      chain(o, gain(1 / notes.length), pan(side * 0.6), lp);
    }
  }

  // a glass bell: a sine with a decaying FM sparkle and an inharmonic partial
  function bell(m, t, { level = 0.03, decay = 0.6, side = 0, verb = 0.3, delay = 0.1, out = bus.sfx } = {}) {
    const f = midi(m), end = t + decay + 0.1, pn = pan(side);
    const c = tone('sine', f, t, end), idx = gain(0);
    idx.gain.setValueAtTime(f * 1.1, t); idx.gain.exponentialRampToValueAtTime(f * 0.01, t + decay * 0.5);
    chain(tone('sine', f * 3.5, t, end), idx); idx.connect(c.frequency);
    const g = gain(0); perc(g.gain, t, level, 0.0015, decay);
    chain(c, g, pn, out);
    const pg = gain(0); perc(pg.gain, t, level * 0.18, 0.001, decay * 0.35);
    chain(tone('sine', f * 2.76, t, end), pg, pn);
    sends(g, [[bus.verb, verb], [bus.delay, delay]]);
  }

  // a reveal: a sub drop, a soft body thump, a bright air tail and the chord's top notes strummed as bells
  function hit(t, { level = 0.36, chord = null, air = true } = {}) {
    const sub = tone('sine', 90, t, t + 1.4), sg = gain(0);
    glide(sub.frequency, 90, 40, t, 0.45);
    perc(sg.gain, t, level, 0.004, 1.1);
    chain(sub, sg, bus.fx);
    const bg = gain(0); perc(bg.gain, t, level * 0.2, 0.002, 0.22);
    chain(hiss(t, t + 0.4), filter('lowpass', 900, 0.7), bg, bus.fx);
    if (air) {
      const ag = gain(0); perc(ag.gain, t, level * 0.08, 0.012, 0.9);
      chain(hiss(t, t + 1.2), filter('highpass', 5500), ag, bus.fx); sends(ag, [[bus.verb, 0.6]]);
    }
    if (chord) chord.forEach((m, i) => bell(m, t + i * 0.035, { level: level * 0.1, decay: 1.6, side: (i - 1) * 0.35, verb: 0.5, delay: 0.18, out: bus.fx }));
  }

  // an air band swept left to right: f0 up to fp at the peak (pk of the way through), then down to f1
  function whoosh(t0, dur, { level = 0.04, f0 = 300, fp = 2000, f1 = 600, p0 = -0.5, p1 = 0.5, pk = 0.45, verb = 0.12 } = {}) {
    const t1 = t0 + dur, bp = filter('bandpass', f0, 0.9), g = gain(0), p = pan(p0);
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(fp, t0 + dur * pk); bp.frequency.exponentialRampToValueAtTime(f1, t1);
    g.gain.setValueCurveAtTime(curve(hump(pk), level), t0, dur);
    p.pan.setValueAtTime(p0, t0); p.pan.linearRampToValueAtTime(p1, t1);
    chain(hiss(t0, t1 + 0.02), bp, g, p, bus.sfx); sends(g, [[bus.verb, verb]]);
  }

  // a key: a 4 ms tick of band-passed noise over a falling sine blip
  function tick(t, level = 0.016) {
    const g = gain(0); perc(g.gain, t, level, 0.0008, 0.008);
    chain(hiss(t, t + 0.02), filter('bandpass', 2800 + rnd() * 1400, 2.4), g, pan((rnd() - 0.5) * 0.3), bus.sfx);
    const o = tone('sine', 2100, t, t + 0.02), og = gain(0);
    glide(o.frequency, 2100, 1300, t, 0.012);
    perc(og.gain, t, level * 0.35, 0.0008, 0.01);
    chain(o, og, bus.sfx);
  }

  // a button press: a quick falling blip over a low thock
  function click(t, level = 0.06) {
    const o = tone('sine', 1500, t, t + 0.06), g = gain(0);
    glide(o.frequency, 1500, 700, t, 0.025);
    perc(g.gain, t, level, 0.001, 0.035); chain(o, g, bus.sfx);
    const th = tone('sine', 280, t, t + 0.1), tg = gain(0);
    glide(th.frequency, 280, 150, t, 0.05);
    perc(tg.gain, t, level * 0.8, 0.002, 0.06); chain(th, tg, bus.sfx);
    const ng = gain(0); perc(ng.gain, t, level * 0.3, 0.0005, 0.005);
    chain(hiss(t, t + 0.01), filter('highpass', 3500), ng, bus.sfx);
  }

  // a chip landing: a sine flicking up a fourth (F#5 to B5)
  function pop(t, level = 0.032) {
    const o = tone('sine', midi(78), t, t + 0.2), g = gain(0);
    glide(o.frequency, midi(78), midi(83), t, 0.045);
    perc(g.gain, t, level, 0.002, 0.12);
    chain(o, g, pan(0.1), bus.sfx); sends(g, [[bus.verb, 0.12]]);
  }

  // the fast-forward under a generating card: a spinning, rising whirr and an air band, in over the badge's fade
  function whirr(t0, t1, level = 0.02) {
    const end = t1 + 0.06, bp = filter('bandpass', 700, 3), trem = gain(0.5), env = gain(0);
    const o = tone('warm', 80, t0, end);
    glide(o.frequency, 80, 380, t0, t1 - t0); glide(bp.frequency, 700, 3200, t0, t1 - t0);
    const lfo = tone('sine', 22, t0, end);
    glide(lfo.frequency, 22, 34, t0, t1 - t0);
    chain(lfo, gain(0.5)).connect(trem.gain);
    env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(level, t0 + Math.min(0.2, (t1 - t0) / 2));
    env.gain.linearRampToValueAtTime(level * 1.3, t1); env.gain.linearRampToValueAtTime(0, t1 + 0.05);
    chain(o, bp, trem, env, bus.sfx);
    const ag = gain(0);
    ag.gain.setValueCurveAtTime(curve((x) => x * x, level * 0.8), t0, t1 - t0); ag.gain.linearRampToValueAtTime(0, t1 + 0.04);
    const hp = filter('highpass', 3000); glide(hp.frequency, 3000, 7000, t0, t1 - t0);
    chain(hiss(t0, end), hp, ag, bus.sfx);
  }

  // the end card's lockup: the home chord blooming over a sub, its top notes rung as bells
  function sting(t, until, notes, bells, level = 0.3) {
    pad(notes, t, until, { level: 0.05, attack: 0.05, release: 1.8, cut0: 2800, cut1: 1300, verb: 0.45 });
    const sg = gain(0); perc(sg.gain, t, level, 0.01, 2.4);
    chain(tone('sine', midi(35), t, t + 2.6), sg, bus.fx);
    const ag = gain(0); perc(ag.gain, t, level * 0.07, 0.02, 1.4);
    chain(hiss(t, t + 1.6), filter('highpass', 6000), ag, bus.fx); sends(ag, [[bus.verb, 0.6]]);
    bells.forEach((m, i) => bell(m, t + i * 0.06, { level: 0.028, decay: 2.4, side: (i - 1) * 0.4, verb: 0.55, delay: 0.2, out: bus.fx }));
  }

  // the wordmark's blur-in: a high air band rising and settling, three glass notes across it
  function shimmer(t, dur = 1, level = 0.016) {
    const bp = filter('bandpass', 7500, 1.4), g = gain(0), p = pan(-0.3);
    g.gain.setValueCurveAtTime(curve(hump(0.4), level), t, dur);
    p.pan.setValueAtTime(-0.3, t); p.pan.linearRampToValueAtTime(0.3, t + dur);
    chain(hiss(t, t + dur + 0.02), bp, g, p, bus.sfx); sends(g, [[bus.verb, 0.5]]);
    [90, 95, 99].forEach((m, i) => bell(m, t + 0.05 + i * 0.12, { level: 0.011, decay: 1.2, side: (i - 1) * 0.5, verb: 0.6, delay: 0.25 }));
  }

  return { pad, pluck, bass, kick, clap, hat, riser, swell, bell, hit, whoosh, tick, click, pop, whirr, sting, shimmer };
}
