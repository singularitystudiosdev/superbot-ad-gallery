// The multicat score's arrangement and mix: which instrument plays where on the cue sheet (score-cues.83a92e2b.js),
// rendered offline into one stereo buffer with the ElevenLabs song laid in at its play press (fading as the beat's own
// player did), then look-ahead limited so the whole spot peaks under -1 dBFS. score.83a92e2b.js plays the result
// against the spot's clock. B major throughout, the song's key: IV-I-V-vi under the reveals, home on the end card.
import { voices, prng, impulse } from './score-synth.83a92e2b.js?v=1';
import { chordAt, plan } from './score-cues.83a92e2b.js?v=1';

export const SR = 48000;
const TAIL = 2.4;                        // the end chord rings this long past the clock's last frame
const CEIL = Math.pow(10, -1.5 / 20);    // the limiter's ceiling: -1.5 dBFS sample peak keeps true peak under -1
const LOOK = 0.005, REL = 0.12;          // its look-ahead and release (s)
const WINDOW = 1;                        // the render builds its notes this many seconds at a time
const SONG_GAIN = 0.92;                  // the song sits at its own master, a hair under, so the ceiling never bites it
const SCORE_TRIM = 0.74;                 // the score's groove sits about 2.5 LU under the song, so the song arrives as the lift
const VERB = 0.5;                        // the room's return

// MIDI voicings: the bass root, the pad's four notes, the arpeggio's four
const VOICING = {
  'G#m': { bass: 44, pad: [54, 58, 59, 63], arp: [66, 70, 71, 75] },
  E: { bass: 40, pad: [56, 59, 63, 66], arp: [68, 71, 75, 78] },
  B: { bass: 35, pad: [54, 59, 61, 63], arp: [66, 71, 73, 75] },
  'F#sus': { bass: 42, pad: [52, 56, 59, 61], arp: [64, 68, 71, 73] },
  'F#': { bass: 42, pad: [52, 58, 61, 66], arp: [64, 70, 73, 78] },
};
const HOME = { pad: [47, 54, 61, 63, 66], bells: [83, 90, 97] }; // B add9 on the end card
const UPDOWN = [0, 1, 2, 3, 4, 3, 2, 1], CROSS = [0, 2, 1, 3]; // arpeggio shapes; 4 is the root an octave up

// the pad's filter over the spot: dark under the greeting, opening into the reveals, closing for the order, open into the song
function cutAt(at, t) {
  const keys = [[0, 800], [at.send, 1000], [at.image, 1800], [at.model, 2300], [at.order, 1400], [at.play - 1.5, 1800], [at.play, 3200]];
  for (let i = 1; i < keys.length; i++) {
    const [a, fa] = keys[i - 1], [b, fb] = keys[i];
    if (t <= b) return fa + (fb - fa) * Math.max(0, (t - a) / (b - a));
  }
  return keys[keys.length - 1][1];
}

function buses(ctx, rnd) {
  const g = (v = 1) => { const n = ctx.createGain(); n.gain.value = v; return n; };
  const master = g(1);
  master.connect(ctx.destination);
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -16; glue.knee.value = 10; glue.ratio.value = 2.2; glue.attack.value = 0.012; glue.release.value = 0.22;
  glue.connect(g(SCORE_TRIM)).connect(master);
  const duck = g(1), music = g(1), drums = g(1), fx = g(1), sfx = g(1);
  music.connect(duck).connect(glue);
  drums.connect(glue); fx.connect(glue); sfx.connect(master);
  const verb = g(1), room = ctx.createConvolver(), wet = g(VERB);
  room.buffer = impulse(ctx, rnd);
  verb.connect(room).connect(wet).connect(master);
  // a dotted-eighth echo, darkened and thinned on every repeat, returned into the (ducked) music bus
  const delay = g(1), dl = ctx.createDelay(1), lp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter(), fb = g(0.3);
  dl.delayTime.value = 0.375; lp.frequency.value = 3800; hp.type = 'highpass'; hp.frequency.value = 280;
  delay.connect(dl).connect(lp).connect(hp).connect(fb).connect(dl);
  hp.connect(g(0.5)).connect(music);
  // sidechain: each kick dips the music bus and lets it breathe back
  const duckAt = (t) => { duck.gain.setTargetAtTime(0.5, t, 0.003); duck.gain.setTargetAtTime(1, t + 0.04, 0.1); };
  return { master, music, drums, fx, sfx, verb, delay, wet, duck: duckAt };
}

// the music: pad, arpeggio, bass and drums per section, the builds into each reveal, the end card's home chord
function music(v, bus, sheet) {
  const { at, sections } = sheet;
  const [pre, reveal, walk, order] = sections;
  // chord spans, consecutive repeats merged; the greeting holds the build's first chord from 0
  const spans = [];
  const push = (name, t0, t1) => { const l = spans[spans.length - 1]; if (l && l.name === name) l.t1 = t1; else spans.push({ name, t0, t1 }); };
  push('G#m', 0, pre.beats.length ? pre.beats[0] : at.image);
  for (const sec of sections) sec.beats.forEach((b, i) => push(chordAt(sec, i), b, i + 1 < sec.beats.length ? sec.beats[i + 1] : sec.t1));
  // before the first reveal the pad carries the music alone, so it sits forward; the groove takes over from there
  spans.forEach((s, i) => v.pad(VOICING[s.name].pad, s.t0, s.t1, {
    level: s.t0 < at.image ? 0.1 : 0.042, attack: i ? 0.22 : 1.4, release: s.t1 >= at.play - 1e-6 ? 0.1 : 0.32, cut0: cutAt(at, s.t0), cut1: cutAt(at, s.t1),
  }));

  // the arpeggio: n notes a beat in `shape`, its filter and level moving across the section
  const arp = (sec, from, to, n, shape, { cut = [2200, 2200], level = [0.036, 0.036], lift = false } = {}) => {
    for (let i = from; i < Math.min(to, sec.beats.length); i++) {
      const b = sec.beats[i], p = (i + 1 < sec.beats.length ? sec.beats[i + 1] : sec.t1) - b, tones = VOICING[chordAt(sec, i)].arp;
      for (let j = 0; j < n; j++) {
        const t = b + (j * p) / n, x = (t - sec.beats[0]) / (sec.t1 - sec.beats[0]), k = shape[(i * n + j) % shape.length];
        const m = (k === 4 ? tones[0] + 12 : tones[k]) + (lift && i % 4 === 3 && j % 2 ? 12 : 0);
        v.pluck(m, t, { cut: cut[0] + (cut[1] - cut[0]) * x, level: level[0] + (level[1] - level[0]) * x, side: j % 2 ? 0.22 : -0.22, dur: n > 2 ? 0.22 : 0.32 });
      }
    }
  };
  arp(pre, 0, pre.beats.length, 2, CROSS, { cut: [900, 2600], level: [0.03, 0.06] });
  arp(reveal, 0, reveal.beats.length, 4, UPDOWN, { cut: [2000, 2400] });
  arp(walk, 0, walk.beats.length, 4, UPDOWN, { cut: [3000, 3400], level: [0.038, 0.04], lift: true });
  arp(order, 0, 4, 2, CROSS, { cut: [1500, 1700], level: [0.03, 0.03] });
  arp(order, 4, order.beats.length, 4, UPDOWN, { cut: [1900, 4200], level: [0.03, 0.042] });

  // the groove: kick on 1, 3 and the and of 3, the snap on 2 and 4, eighth hats; `gap` empties the last half beat before
  // the section's reveal, `ghost` adds sixteenth hats and an open hat into each bar
  const groove = (sec, { gap = false, ghost = false } = {}) => sec.beats.forEach((b, i) => {
    const p = (i + 1 < sec.beats.length ? sec.beats[i + 1] : sec.t1) - b, q = i % 4, ok = (t) => !gap || t < sec.t1 - p * 0.5;
    const root = VOICING[chordAt(sec, i)].bass;
    if ((q === 0 || q === 2) && ok(b)) v.kick(b, 0.42);
    if (q === 2 && ok(b + p / 2)) v.kick(b + p / 2, 0.32);
    if ((q === 1 || q === 3) && ok(b)) v.clap(b);
    for (const h of [0, 0.5]) if (ok(b + h * p)) v.hat(b + h * p, h ? 0.04 : 0.026, ghost && q === 3 && h);
    if (ghost) for (const h of [0.25, 0.75]) if (ok(b + h * p)) v.hat(b + h * p, 0.013);
    for (const h of [0, 0.5]) if (ok(b + h * p)) v.bass(root + (q === 3 && h ? 12 : 0), b + h * p, p * 0.42);
  });
  groove(reveal, { gap: true });
  groove(walk, { ghost: true });
  // after the order lands: half time (kick on 1, snap on 3), the bass held; then two beats of rising hats into the song
  order.beats.forEach((b, i) => {
    const p = (i + 1 < order.beats.length ? order.beats[i + 1] : order.t1) - b;
    if (i < 8) {
      if (i % 4 === 0) v.kick(b, 0.42);
      if (i % 4 === 2) v.clap(b);
      for (const h of [0, 0.5]) v.hat(b + h * p, h ? 0.034 : 0.022);
      if (i % 2 === 0) v.bass(VOICING[chordAt(order, i)].bass, b, p * 1.9, 0.12);
    } else {
      for (let j = 0; j < 4; j++) { const t = b + (j * p) / 4; v.hat(t, 0.014 + 0.032 * ((t - order.beats[8]) / (order.t1 - order.beats[8]))); }
    }
  });

  // the builds: tonal into the image, the model and the song (F# rising to the home key), air only into the order
  v.riser(sheet.gen.image, at.image, { level: 0.05, m: 54 });
  v.riser(sheet.gen.model, at.model, { level: 0.055, m: 54 });
  v.riser(sheet.orderCard, at.order, { level: 0.022, f0: 900, f1: 7000 });
  v.riser(order.beats[Math.min(7, order.beats.length - 1)], at.play, { level: 0.05, m: 54 });
  // the end card: a reversed bloom into the mascot's pop, then home
  v.swell(HOME.pad, at.cut, at.pop, 0.045);
  v.sting(at.pop, at.end, HOME.pad, HOME.bells);

  // the room clears for the song and comes back for the end card
  bus.wet.gain.setValueAtTime(VERB, at.play); bus.wet.gain.linearRampToValueAtTime(0, at.play + 0.35);
  bus.wet.gain.setValueAtTime(0, at.cut - 0.05); bus.wet.gain.linearRampToValueAtTime(VERB, at.cut);
}

// the effects, each on the motion it scores
function effects(v, sheet, rnd) {
  const land = {
    image: (t) => v.hit(t, { level: 0.36, chord: [83, 87, 90] }),
    model: (t) => v.hit(t, { level: 0.4, chord: [80, 83, 87] }),
    order: (t) => { v.hit(t, { level: 0.2, air: false }); v.bell(90, t, { level: 0.03, decay: 0.7 }); v.bell(95, t + 0.09, { level: 0.034, decay: 0.9 }); },
    song: (t) => v.bell(90, t, { level: 0.018, decay: 0.5 }),
  };
  for (const c of sheet.sfx) {
    const t = c.at;
    if (c.kind === 'hero') { v.bell(95, t + 0.15, { level: 0.01, decay: 1.4, verb: 0.6 }); v.whoosh(t, 1, { level: 0.01, f0: 2500, fp: 6000, f1: 4000, p0: 0, p1: 0 }); }
    else if (c.kind === 'key') v.tick(t, 0.014 * (0.7 + 0.3 * rnd()));
    else if (c.kind === 'send') { v.click(t, 0.06); v.whoosh(t, 0.32, { level: 0.016, f0: 900, fp: 3200, f1: 2200, p0: 0, p1: 0.1 }); }
    else if (c.kind === 'camera') v.whoosh(t, c.dur, { level: 0.04, f0: 250, fp: 1500, f1: 400, p0: -0.4, p1: 0.4, pk: 0.35 });
    else if (c.kind === 'chip') v.pop(t);
    else if (c.kind === 'check') v.bell(95, t, { level: 0.026, decay: 0.55 });
    else if (c.kind === 'card') v.whoosh(t, 0.4, { level: 0.018, f0: 1000, fp: 3800, f1: 2600, p0: 0, p1: 0, pk: 0.3 });
    else if (c.kind === 'gen') v.whirr(t, c.until);
    else if (c.kind === 'land') land[c.what](t);
    else if (c.kind === 'play') v.click(t, 0.04);
    else if (c.kind === 'word') v.shimmer(t);
  }
}

// the ElevenLabs song from its play press: full through SONG_FOR, then a linear fade over SONG_FADE (the beat's own
// player's volume ramp, beats/multicat.516afb1a.js syncAudio)
function laySong(ctx, bus, song, at) {
  const s = ctx.createBufferSource(), g = ctx.createGain(), fadeAt = at.play + plan().SONG_FOR, out = fadeAt + plan().SONG_FADE;
  s.buffer = song;
  g.gain.value = SONG_GAIN;
  g.gain.setValueAtTime(SONG_GAIN, fadeAt); g.gain.linearRampToValueAtTime(0, out);
  s.connect(g).connect(bus.master);
  s.start(at.play, 0); s.stop(out + 0.01);
}

// a look-ahead brick wall over the render: the gain is already down LOOK before every peak (the minimum ahead, then
// averaged over LOOK, which never exceeds the need at the peak itself) and recovers over REL, so no sample passes CEIL
function limit(buf) {
  const n = buf.length, L = Math.max(1, Math.round(LOOK * buf.sampleRate)), k = 1 - Math.exp(-1 / (REL * buf.sampleRate));
  const ch = [buf.getChannelData(0), buf.getChannelData(1)];
  const need = new Float32Array(n), ahead = new Float32Array(n), q = new Int32Array(n);
  for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(ch[0][i]), Math.abs(ch[1][i])); need[i] = p > CEIL ? CEIL / p : 1; }
  let h = 0, tl = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (tl > h && need[q[tl - 1]] >= need[i]) tl--;
    q[tl++] = i;
    while (q[h] > i + L) h++;
    ahead[i] = need[q[h]];
  }
  let sum = 0, r = 1, most = 0;
  for (let i = 0; i < n; i++) {
    sum += ahead[i]; if (i >= L) sum -= ahead[i - L];
    r = Math.min(sum / Math.min(i + 1, L), r + (1 - r) * k);
    most = Math.max(most, 1 - r);
    for (const c of ch) c[i] = Math.max(-CEIL, Math.min(CEIL, c[i] * r));
  }
  return most; // the deepest gain reduction, 0..1
}

// the kit, deferred: each call is queued at its start time (the argument AT_ARG names, else the first) and built only when
// the render reaches its window, so the graph holds the half second now sounding, never the whole film's nodes at once
const AT_ARG = { pad: 1, pluck: 1, bass: 1, swell: 1, bell: 1 };
function deferred(kit, queue) {
  const out = {};
  for (const [name, fn] of Object.entries(kit)) out[name] = (...args) => { queue.push([args[AT_ARG[name] || 0], () => fn(...args)]); };
  return out;
}

// the score as one buffer: `until` renders only its first seconds (the same samples the whole render has there, since the
// notes, their order and the seeded noise are the same), `only` a stem ('music', 'sfx' or 'song') for QA, unlimited
export async function renderScore(sheet, { song = null, only = null, until = null } = {}) {
  const secs = until || sheet.at.end + TAIL, ctx = new OfflineAudioContext(2, Math.ceil(secs * SR), SR);
  const rnd = prng(0x83a92e2b);
  const bus = buses(ctx, rnd);
  const queue = [], v = deferred(voices(ctx, rnd, bus), queue);
  if (!only || only === 'music') music(v, bus, sheet);
  if (!only || only === 'sfx') effects(v, sheet, rnd);
  if (song && sheet.at.play < secs && (!only || only === 'song')) laySong(ctx, bus, song, sheet.at);
  queue.sort((a, b) => a[0] - b[0]);
  let next = 0;
  const upTo = (t) => { while (next < queue.length && queue[next][0] < Math.min(t, secs)) queue[next++][1](); };
  // the render pauses at each window's start (on a quantum boundary, so at or before it) while that window's notes are built
  upTo(WINDOW);
  for (let w = WINDOW; w < secs; w += WINDOW) ctx.suspend(w).then(() => { upTo(w + WINDOW); return ctx.resume(); });
  const buf = await ctx.startRendering();
  const reduction = only ? 0 : limit(buf);
  return { buf, reduction };
}
