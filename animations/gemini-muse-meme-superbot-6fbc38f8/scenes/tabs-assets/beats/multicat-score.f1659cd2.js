// The multicat variant's soundtrack, rendered offline from the route's own cue times (multicat.516afb1a.js ROUTE), so a
// second of the buffer is a second of the spot. Three layers on one master:
//   bed:  a 120 bpm B major groove (the song's tempo and key) whose bar lines run back from the song's play press, so its
//         build lands on the song's first downbeat; it cuts 50 ms before the song for a clean drop
//   sfx:  one short sound per thing seen: each typed key, send, routing chip and its check, card, x50 generation (a
//         riser cut on the landing), landing, the play press, and the end card's sting and sparkle
//   song: tiny-chaos.mp3 at its play press, through a light EQ (rumble cut, low-mid dip, air), faded under the end card
// Carving keeps it clean: the bed's harmony is high-passed at 220 Hz and dipped at 320 Hz and 2.8 kHz (where the sfx
// speak), the bass and harmony duck under each kick, sfx are high-passed at 140 Hz, nothing has a reverb tail (the sting
// gets a short filtered echo). The master high-passes at 28 Hz, glues with a 2:1 compressor, trims and limits at -1.5 dBFS.
import { makeKit, hz } from './multicat-synth.f1659cd2.js';
import { compress, trim, limit, peakDb } from './multicat-master.f1659cd2.js';

export const RATE = 48000;
const BEAT = 0.5, BAR = 4 * BEAT; // 120 bpm, 4/4 (tiny-chaos.mp3 measures 119.95 bpm, its first beat on 0)
const BARS = 11;                  // bars of bed before the song: the first starts 0.49 s in, as the scene has faded up
const FF_IN = 0.2;                // the x50 badge's fade-in ahead of a generation (multicat.516afb1a.js): its riser starts with it
// layer levels, set against raw stem renders (ffmpeg ebur128): the bed about 18 LUFS raw under the chat, the song at its
// own -13.5, the sting near -16; the master then trims the song section to about -14 LUFS
const LEVEL = { bed: 0.8, harm: 0.8, bass: 0.32, sfx: 0.8, sting: 0.7 };
// every voice is built just in time, WINDOW s at a time and up to PRE s ahead of its start (a send's swish leads it by
// 90 ms): an offline context pulls every connected node on every render quantum, started or not, so a spot's worth of
// voices built up front renders many times slower
const WINDOW = 0.5, PRE = 0.15;
// the glue's threshold sits at the song's loud passages (about -13 dB RMS), so it only shaves 1 to 2 dB there
const MASTER = { glue: { threshold: -13, ratio: 2, knee: 6, attack: 0.01, release: 0.15 }, trimDb: 0.8, ceiling: -1.5 };

// I-V-vi-IV in B major as add9 plucks, voiced close around B4 so they never crowd the vocal's low register; roots for the bass
const CHORD = {
  B: { notes: [63, 66, 71, 73], root: 35 },
  Fs: { notes: [61, 66, 70, 73], root: 42 },
  Gsm: { notes: [63, 68, 71, 75], root: 44 },
  E: { notes: [59, 64, 68, 71], root: 40 },
};
// bar by bar: the intro opens on IV so the first full bar lands on I; bar 10 sits on V and resolves into the song's B
const PROG = ['E', 'B', 'Fs', 'Gsm', 'E', 'B', 'Fs', 'Gsm', 'E', 'B', 'Fs'];
const FULL = { kick: [0, 2, 2.5], clap: [1, 3], hats: 16, bass: true, pluck: true };
const SECTION = [
  { hats: 8, pluck: true, intro: true, hook: 0 },     // the hub settles on the hook, the first ask types
  FULL, FULL, FULL, FULL, FULL,
  { ...FULL, hook: 0 }, { ...FULL, hook: 1 },          // the walking cat on its turntable
  FULL,
  { hats: 8, clap: [3], pluck: true, open: true },     // the break: the song's ask types into space
  { kick: [0, 1, 2, 3], hats: 16, bass: 'pulse', pluck: true, build: true },
];
// the tresillo pluck rhythm, beats [at, decay s, velocity]
const PLUCKS = [[0, 0.26, 1], [1.5, 0.22, 0.85], [3, 0.2, 0.9], [3.5, 0.12, 0.55]];
// the bass line, beats [at, length beats, velocity]
const BASS = [[0, 0.75, 1], [1.5, 0.4, 0.8], [2, 0.45, 0.9], [3, 0.4, 0.85], [3.5, 0.35, 0.75]];
// the bell hook over bars 6 and 7, B major pentatonic, beats [at, midi]
const HOOK = [
  [[0, 78], [0.5, 75], [1, 71], [1.5, 73], [2, 75], [3, 78], [3.5, 80]],
  [[0, 78], [0.5, 75], [1, 73], [1.5, 71], [2.5, 73], [3, 75]],
];

// the cue list: every visible moment the sfx follow, in spot seconds
export function cuesOf(route) {
  const T = route.T, [M, O, S] = T.steps;
  const asks = [{ text: route.ask, s: route.s, typeEnd: route.typeEnd, send: route.send }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send }))];
  const chips = [...route.chips, ...T.steps.flatMap((st) => st.chips)];
  return {
    asks, chips,
    cards: [T.card, M.card, O.card, S.card],
    gens: [[T.gen0, T.done], [M.gen0, M.done], [S.gen0, S.done]],
    photo: T.done, model: M.done, order: O.done, songCard: S.done,
    play: S.play, cut: S.cut, end: T.end,
  };
}

// QA: `master: false` skips the master stage (the raw sum, to set levels against); `mute` names layers to leave out
// ('bed', 'sfx', 'song', 'sting')
export async function renderScore({ route, song, songFor, songFade, endDelay, master = true, mute = [] }) {
  const C = cuesOf(route);
  const G = C.play, B0 = G - BARS * BAR, len = C.end + 0.7;
  const ctx = new OfflineAudioContext(2, Math.ceil(len * RATE), RATE);
  const kit = makeKit(ctx, 0x6d756c74);
  const { filter, gain } = kit;
  // a kit voice, queued to be built a window before its start time (its first argument)
  const jobs = [];
  const voice = (name, ...args) => jobs.push([args[0], () => kit[name](...args)]);
  // nodes wired in order; returns the first
  const wire = (...nodes) => { nodes.reduce((a, b) => (a.connect(b), b)); return nodes[0]; };
  const eq = filter;

  // ---------- buses ----------
  const pre = gain(1);
  const music = gain(1), bed = gain(LEVEL.bed);
  // the bed's EQ: lows leaned out, the mud dipped, a narrow slot at 2.8 kHz for the ticks and pings, a lift above 4.5 kHz
  wire(music, eq('lowshelf', 120, 0.707, -3), eq('peaking', 320, 1, -2), eq('peaking', 2800, 2, -1.5), eq('highshelf', 4500, 0.707, 3), bed, pre);
  const drums = gain(0.85), bassSC = gain(1), harmSC = gain(1);
  drums.connect(music);
  wire(bassSC, gain(LEVEL.bass), music);
  wire(harmSC, filter('highpass', 220), gain(LEVEL.harm), music);
  const sfx = gain(LEVEL.sfx);
  wire(sfx, filter('highpass', 140), pre);
  const songIn = gain(1);
  wire(songIn, filter('highpass', 30), eq('peaking', 260, 1, -1.5), eq('highshelf', 9500, 0.707, 2), pre);
  // the sting's short echo: a dotted eighth, filtered so it repeats as a bright tick, never a wash
  const sting = gain(LEVEL.sting), echo = ctx.createDelay(1), fb = gain(0.26);
  echo.delayTime.value = 0.375;
  sting.connect(pre);
  wire(sting, echo, filter('highpass', 900), filter('lowpass', 6000), fb, echo);
  fb.connect(gain(0.3)).connect(pre);
  // the master's rumble cut, a 4th-order Butterworth high-pass at 28 Hz, and a gentle 18 kHz low-pass that takes the
  // noise voices' energy near Nyquist (inaudible, but it draws true-peak overs between samples)
  wire(pre, filter('highpass', 28, 0.5412), filter('highpass', 28, 1.3066), filter('lowpass', 18000), ctx.destination);
  for (const [name, n] of Object.entries({ bed, sfx, song: songIn, sting })) if (mute.includes(name)) n.disconnect();

  // ---------- bed ----------
  const at = (bar, beat) => B0 + bar * BAR + beat * BEAT;
  const hits = [C.photo, C.model]; // landings that hit with their own kick: the bed leaves them the room
  const clear = (t, w) => hits.every((h) => Math.abs(h - t) > w);
  const kicks = [];
  for (let b = 0; b < BARS; b++) {
    const sec = SECTION[b], ch = CHORD[PROG[b]], t0 = at(b, 0);
    for (const k of sec.kick || []) { const t = at(b, k); if (clear(t, 0.07)) { voice('kick', t, drums, k === 2.5 ? 0.7 : 1); kicks.push(t); } }
    for (const c of sec.clap || []) { const t = at(b, c); if (clear(t, 0.09)) voice('clap', t, drums, sec.open ? 1 : 1.3); }
    if (sec.hats) {
      const step = sec.hats === 16 ? 0.25 : 0.5;
      for (let x = sec.hatsFrom || 0; x < 4; x += step) {
        const accent = x % 1 === 0.5 ? 0.75 : x % 1 === 0 ? 0.55 : 0.4;
        const open = sec.hats === 16 && b % 2 === 0 && x === 3.5;
        voice('hat', at(b, x), drums, (sec.intro ? 0.8 : 1) * accent * (0.9 + 0.1 * kit.rand()), open, x % 0.5 ? -0.14 : 0.14);
      }
    }
    if (sec.kick) for (let x = 0; x < 4; x += 0.25) voice('shaker', at(b, x), drums, (x % 0.5 ? 1 : 0.55) * (0.85 + 0.15 * kit.rand()));
    if (sec.bass === true) for (const [x, l, v] of BASS) voice('bass', at(b, x), l * BEAT, hz(ch.root), bassSC, v);
    if (sec.bass === 'pulse') for (let x = 0; x < 4; x += 0.5) voice('bass', at(b, x), 0.2, hz(ch.root), bassSC, x % 1 ? 0.7 : 0.9);
    if (sec.pluck) {
      for (const [x, d, v] of PLUCKS) {
        // the intro and the build open the filter as the bar goes; the break keeps it darker
        const bright = sec.intro ? 3000 + 3500 * (x / 4) : sec.build ? 4000 + 5000 * (x / 4) : sec.open ? 3500 : 6500;
        voice('pluck', at(b, x), d, ch.notes, harmSC, v * (sec.intro ? 1.3 : 1), bright);
      }
    }
    if (sec.hook !== undefined) for (const [x, m] of HOOK[sec.hook]) voice('bell', at(b, x), hz(m), harmSC, 0.55, 0.28, x % 1 ? 0.2 : -0.2);
    if (sec.build) {
      // a clap roll over the last two beats, rising into the song, under a riser that cuts with the bed
      for (let x = 2; x < 4; x += 0.25) voice('clap', at(b, x), drums, 0.35 + 0.5 * ((x - 2) / 2), 0);
      voice('riser', t0, G - 0.05, drums, 0.9);
    }
  }
  // the intro's swell into the first bar, as the scene fades up
  voice('riser', 0.08, B0, sfx, 0.5);
  // the bed ducks under each kick (bass and harmony), the modern pump, and cuts cleanly before the song's downbeat
  for (const p of [bassSC.gain, harmSC.gain]) {
    p.setValueAtTime(1, 0);
    for (const t of kicks) { p.setValueAtTime(1, t); p.linearRampToValueAtTime(0.5, t + 0.008); p.setTargetAtTime(1, t + 0.008, 0.07); }
  }
  bed.gain.setValueAtTime(LEVEL.bed, G - 0.065);
  bed.gain.linearRampToValueAtTime(0, G - 0.05);

  // ---------- sfx ----------
  for (const a of C.asks) {
    const per = (a.typeEnd - a.s) / a.text.length;
    [...a.text].forEach((c, i) => { if (c !== ' ') voice('tick', a.s + (i + 0.5) * per, sfx, i === 0 || a.text[i - 1] === ' ' ? 1 : 0.7); });
    voice('send', a.send, sfx, 1);
  }
  for (const c of C.chips) { voice('blip', c.sw, sfx, 1, c.tool ? 784 : 988); voice('check', c.done, sfx, 1.3); }
  for (const t of C.cards) voice('thup', t, sfx, 1);
  for (const [g0, done] of C.gens) voice('riser', g0 - FF_IN, done, sfx, 0.8);
  // the photo lands with a shutter, the model with a lift, the order with a two-note ding, the song's card with a pop
  voice('impact', C.photo, sfx, 0.7); voice('shutter', C.photo, sfx, 1);
  voice('impact', C.model, sfx, 0.7); voice('sparkle', C.model + 0.02, [hz(78), hz(83)], sfx, 0.6, 0.07, 0.25);
  voice('thup', C.order, sfx, 0.8); voice('bell', C.order, hz(83), sfx, 0.7, 0.22, -0.1); voice('bell', C.order + 0.09, hz(87), sfx, 0.7, 0.4, 0.1);
  voice('blip', C.songCard, sfx, 1.3, 1245);
  voice('click', G - 0.04, sfx, 1);

  // ---------- song ----------
  const src = ctx.createBufferSource(), fade = gain(1);
  src.buffer = song;
  fade.gain.setValueAtTime(1, G + songFor);
  fade.gain.linearRampToValueAtTime(0, G + songFor + songFade);
  wire(src, fade, songIn);
  src.start(G, 0);
  src.stop(G + songFor + songFade + 0.02);

  // ---------- end card ----------
  // the mascot pops (endDelay after the cut): a kick and sub on B with a bright B add9 stab; the wordmark slides in 0.3 s
  // later on a rising B major sparkle
  const pop = C.cut + endDelay, word = pop + 0.3;
  voice('kick', pop, sting, 1);
  voice('bass', pop, 0.45, hz(35), sting, 0.25);
  voice('pluck', pop, 0.7, [63, 66, 71, 73, 78], sting, 0.9, 6500);
  voice('noise', pop, sting, 0.22, 0.002, 0.35, [filter('highpass', 7000)]);
  voice('sparkle', word, [hz(83), hz(87), hz(90), hz(95)], sting, 0.7, 0.0625, 0.35);
  voice('noise', word, sting, 0.1, 0.12, 0.3, [filter('highpass', 9000)]);

  // build the first window's voices now and each next window's at a suspend, a window ahead of where they sound. Firefox
  // has no offline suspend (bugzil.la/1265406): there every voice is built up front, slower but the same mix
  jobs.sort((p, q) => p[0] - q[0]);
  let next = 0;
  const buildUntil = (limit) => { while (next < jobs.length && jobs[next][0] < limit) jobs[next++][1](); };
  const windowed = typeof ctx.suspend === 'function';
  buildUntil(windowed ? WINDOW + PRE : Infinity);
  for (let w = WINDOW; windowed && w < len - WINDOW; w += WINDOW) {
    ctx.suspend(w).then(() => { buildUntil(w + WINDOW + PRE); return ctx.resume(); })
      .catch((e) => console.error(new Error(`multicat soundtrack: the render's suspend at ${w}s failed`, { cause: e })));
  }
  const buffer = await ctx.startRendering();
  if (next < jobs.length) throw new Error(`multicat soundtrack: ${jobs.length - next} voices were never built`);
  const glue = master ? compress(buffer, MASTER.glue) : 0;
  if (master) trim(buffer, MASTER.trimDb);
  const lim = master ? limit(buffer, { ceiling: MASTER.ceiling, attack: 0.003, release: 0.08 }) : { maxReductionDb: 0 };
  const cues = [
    ...C.asks.map((a) => ['send', a.send]), ...C.chips.flatMap((c) => [['chip', c.sw], ['check', c.done]]), ...C.cards.map((t) => ['card', t]),
    ['photo', C.photo], ['model', C.model], ['order', C.order], ['songCard', C.songCard], ['play', G], ['pop', pop], ['word', word],
  ].sort((p, q) => p[1] - q[1]);
  return { buffer, cues, grid: { bpm: 120, firstBar: B0 }, glueDb: glue, limitDb: lim.maxReductionDb, peakDb: peakDb(buffer) };
}
