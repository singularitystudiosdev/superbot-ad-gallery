// The multicat soundtrack's instruments (multicat-score.f1659cd2.js plays them): every voice is built from Web Audio
// oscillators and one seeded noise buffer, scheduled on an (Offline)AudioContext, so a render is the same every load. The
// palette is short and bright on purpose: fast attacks, decays under a third of a second, noise high-passed out of the
// low end, no reverb; the low end belongs to the kick and the bass alone.

// mulberry32: a small seeded PRNG, so the noise and the velocity jitter never change between renders
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// an attack/decay envelope on a gain param: 0 up to `peak` over `a` s, an exponential fall to silence over `d` s, then 0.
// Returns when it is silent
function ad(p, t, peak, a, d) {
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  p.exponentialRampToValueAtTime(Math.max(1e-5, peak * 1e-4), t + a + d);
  p.setValueAtTime(0, t + a + d + 0.002);
  return t + a + d + 0.004;
}

export function makeKit(ctx, seed = 1) {
  const rand = rng(seed);
  const NOISE = (() => {
    const len = Math.round(ctx.sampleRate * 2), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = rand() * 2 - 1;
    return b;
  })();

  const gain = (v = 1) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  // `dB` is the boost or cut of a peaking or shelving filter
  const filter = (type, f, q = 0.707, dB = 0) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; n.gain.value = dB; return n; };
  const pan = (p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };
  // a chain of nodes wired in order, ending in `out`; returns the first
  const chain = (nodes, out) => { nodes.reduce((a, b) => (a.connect(b), b)); nodes[nodes.length - 1].connect(out); return nodes[0]; };
  const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; };

  // a burst of the seeded noise through `filters`, enveloped (attack a, decay d)
  function noise(t, out, peak, a, d, filters = [], p = 0) {
    const src = ctx.createBufferSource(), g = gain(0);
    src.buffer = NOISE;
    const end = ad(g.gain, t, peak, a, d);
    chain([src, ...filters, g, ...(p ? [pan(p)] : [])], out);
    src.start(t, rand() * 1.5);
    src.stop(end);
  }
  // one oscillator, enveloped, with an optional pitch glide f0 -> f1 over `glide` s
  function tone(t, out, type, f0, peak, a, d, f1 = f0, glide = 0, p = 0, filters = []) {
    const o = osc(type, f0), g = gain(0);
    if (f1 !== f0) {
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + glide);
    }
    const end = ad(g.gain, t, peak, a, d);
    chain([o, ...filters, g, ...(p ? [pan(p)] : [])], out);
    o.start(t);
    o.stop(end);
  }

  return {
    rand,
    // tight kick: a sine falling 180 -> 55 Hz in 45 ms and gone in 180 ms, under a 5 ms noise beater and a short 2 kHz
    // knock, so it punches on a phone speaker without a boomy tail
    kick(t, out, v = 1) {
      const o = osc('sine', 180), g = gain(0);
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.045);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
      const end = ad(g.gain, t, v, 0.0015, 0.18);
      chain([o, g], out);
      o.start(t);
      o.stop(end);
      noise(t, out, 0.3 * v, 0.0005, 0.006, [filter('highpass', 3200)]);
      tone(t, out, 'triangle', 2000, 0.06 * v, 0.0005, 0.012, 900, 0.012);
    },
    // clap: three 8 ms slaps then a 90 ms tail, band-passed around 2 kHz and kept out of the mids, with a high snap on top
    clap(t, out, v = 1, p = 0) {
      for (let i = 0; i < 3; i++) noise(t + i * 0.0085, out, 0.6 * v, 0.0005, 0.009, [filter('highpass', 800), filter('bandpass', 2100, 0.9)], p);
      noise(t + 0.025, out, 0.55 * v, 0.001, 0.09, [filter('highpass', 800), filter('bandpass', 1900, 0.8)], p);
      noise(t, out, 0.3 * v, 0.0005, 0.05, [filter('highpass', 5500)], -p);
    },
    // hat: noise above 7 kHz with a lift at 11 kHz; closed 30 ms, open 110 ms (short, so the top stays clean)
    hat(t, out, v = 1, open = false, p = 0.12) {
      noise(t, out, 0.55 * v, 0.0005, open ? 0.11 : 0.03, [filter('highpass', 7000), filter('peaking', 11000, 0.8, 4)], p);
    },
    // shaker: a 25 ms grain of noise band-passed at 5 kHz, the 16th-note top line that gives the groove its edge
    shaker(t, out, v = 1, p = -0.2) {
      noise(t, out, 0.45 * v, 0.004, 0.025, [filter('bandpass', 5200, 1.1)], p);
    },
    // bass: a sine with a low-passed saw on top for harmonics, staccato: 4 ms in, a quick fall to half, a 25 ms release
    // at the note's end; the saw carries it on small speakers so the sine can stay lean
    bass(t, len, f, out, v = 1) {
      const g = gain(0), sat = gain(0.55), lp = filter('lowpass', 1600, 1.1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.004);
      g.gain.setTargetAtTime(v * 0.45, t + 0.004, 0.07);
      g.gain.setTargetAtTime(0, t + len, 0.008);
      lp.frequency.setValueAtTime(2200, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + 0.16);
      const s = osc('sine', f), w = osc('sawtooth', f);
      s.connect(g);
      chain([w, lp, sat], g);
      g.connect(out);
      for (const o of [s, w]) { o.start(t); o.stop(t + len + 0.08); }
    },
    // pluck chord: two saws a note, detuned 8 cents apart and spread left/right, through a resonant low-pass that snaps
    // from `bright` Hz down to 1.8 kHz: the short modern pluck
    pluck(t, len, notes, out, v = 1, bright = 6000) {
      const g = gain(0), lp = filter('lowpass', bright, 2.2), sides = [pan(-0.35), pan(0.35)];
      lp.frequency.setValueAtTime(bright, t);
      lp.frequency.exponentialRampToValueAtTime(1800, t + 0.16);
      const end = ad(g.gain, t, v / notes.length, 0.003, len);
      for (const s of sides) s.connect(lp);
      chain([lp, g], out);
      for (const m of notes) {
        [-8, 8].forEach((det, side) => {
          const o = osc('sawtooth', hz(m));
          o.detune.value = det;
          o.connect(sides[side]);
          o.start(t);
          o.stop(end);
        });
      }
    },
    // glassy bell: a sine with its 2nd and 3rd partials decaying faster, so the strike is bright and the ring clean
    bell(t, f, out, v = 1, d = 0.45, p = 0) {
      tone(t, out, 'sine', f, 0.55 * v, 0.001, d, f, 0, p);
      tone(t, out, 'sine', f * 2, 0.22 * v, 0.001, d * 0.45, f * 2, 0, p);
      tone(t, out, 'triangle', f * 3.01, 0.08 * v, 0.0008, d * 0.2, f * 3.01, 0, p);
    },
    // a typed key: a 4 ms band-passed tick with a little pitch, varied per key
    tick(t, out, v = 1) {
      const f = 3600 + rand() * 1600;
      noise(t, out, 0.2 * v, 0.0004, 0.005, [filter('bandpass', f, 1.6)], (rand() - 0.5) * 0.25);
      tone(t, out, 'sine', 2200 + rand() * 400, 0.05 * v, 0.0005, 0.007);
    },
    // the send: an upward band-passed swish into a short rising blip
    send(t, out, v = 1) {
      const bp = filter('bandpass', 900, 1.3);
      bp.frequency.setValueAtTime(900, t - 0.09);
      bp.frequency.exponentialRampToValueAtTime(6000, t + 0.03);
      noise(t - 0.09, out, 0.32 * v, 0.07, 0.05, [filter('highpass', 400), bp]);
      tone(t, out, 'sine', 620, 0.32 * v, 0.002, 0.07, 1250, 0.045);
      tone(t, out, 'triangle', 1240, 0.08 * v, 0.002, 0.05, 2500, 0.045);
    },
    // a routing chip landing: a quick sine pop gliding up a fifth
    blip(t, out, v = 1, f = 988) {
      tone(t, out, 'sine', f, 0.3 * v, 0.002, 0.08, f * 1.5, 0.035);
      tone(t, out, 'triangle', f * 2, 0.05 * v, 0.002, 0.04, f * 3, 0.035);
    },
    // a chip resolving: two quick glass notes a major third apart
    check(t, out, v = 1, f = 1245) {
      this.bell(t, f, out, 0.42 * v, 0.14, -0.1);
      this.bell(t + 0.055, f * 1.26, out, 0.42 * v, 0.2, 0.1);
    },
    // a card rising in: a soft low thup, sub-free
    thup(t, out, v = 1) {
      tone(t, out, 'sine', 210, 0.3 * v, 0.003, 0.09, 105, 0.06, 0, [filter('highpass', 70)]);
      noise(t, out, 0.06 * v, 0.004, 0.05, [filter('bandpass', 2400, 0.7)]);
    },
    // the x50 generation: band-passed noise sweeping up with a sine glide under it, swelling until it cuts at t1
    riser(t0, t1, out, v = 1) {
      const len = Math.max(0.12, t1 - t0), bp = filter('bandpass', 700, 1.4), g = gain(0);
      bp.frequency.setValueAtTime(700, t0);
      bp.frequency.exponentialRampToValueAtTime(9000, t1);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.05 * v, t0 + len * 0.3);
      g.gain.exponentialRampToValueAtTime(0.32 * v, t1 - 0.004);
      g.gain.linearRampToValueAtTime(0, t1);
      const src = ctx.createBufferSource();
      src.buffer = NOISE;
      chain([src, filter('highpass', 500), bp, g], out);
      src.start(t0, rand());
      src.stop(t1 + 0.01);
      const o = osc('sine', 330), og = gain(0);
      o.frequency.setValueAtTime(330, t0);
      o.frequency.exponentialRampToValueAtTime(1320, t1);
      og.gain.setValueAtTime(0, t0);
      og.gain.linearRampToValueAtTime(0.06 * v, t1 - 0.004);
      og.gain.linearRampToValueAtTime(0, t1);
      chain([o, og], out);
      o.start(t0);
      o.stop(t1 + 0.01);
    },
    // an answer landing: a short kick, a high crack and a 300 ms air burst (a crash with its wash cut off)
    impact(t, out, v = 1) {
      this.kick(t, out, 0.9 * v);
      noise(t, out, 0.4 * v, 0.0005, 0.05, [filter('highpass', 1800), filter('peaking', 4500, 1, 4)]);
      noise(t, out, 0.16 * v, 0.002, 0.3, [filter('highpass', 6500)], 0.15);
      noise(t, out, 0.16 * v, 0.002, 0.3, [filter('highpass', 6500)], -0.15);
    },
    // a camera shutter: two clicks 40 ms apart
    shutter(t, out, v = 1) {
      for (const [dt, f] of [[0, 3200], [0.04, 2600]]) {
        noise(t + dt, out, 0.35 * v, 0.0004, 0.012, [filter('bandpass', f, 1.2)]);
        tone(t + dt, out, 'square', 1800, 0.03 * v, 0.0005, 0.006, 900, 0.006, 0, [filter('lowpass', 5000)]);
      }
    },
    // a button press: a hard 3 ms tick over a short wooden tok
    click(t, out, v = 1) {
      noise(t, out, 0.3 * v, 0.0003, 0.004, [filter('highpass', 2500)]);
      tone(t, out, 'sine', 900, 0.22 * v, 0.001, 0.03, 420, 0.02);
    },
    // a run of bells, `step` s apart, alternating sides
    sparkle(t, freqs, out, v = 1, step = 0.0625, d = 0.3) {
      freqs.forEach((f, i) => this.bell(t + i * step, f, out, v * (1 - i * 0.08), d, i % 2 ? 0.3 : -0.3));
    },
    noise,
    tone,
    filter,
    gain,
    pan,
  };
}
