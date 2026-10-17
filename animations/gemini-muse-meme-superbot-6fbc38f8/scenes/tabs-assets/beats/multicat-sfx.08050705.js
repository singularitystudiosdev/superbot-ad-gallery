// The multicat spot's sound effects, each placed on the frame its picture lands (the beat's plan, multicat.516afb1a.js,
// and the engine's composer and chip clocks, chat.9b47fc30.js), not on the score's grid:
//   typing      a soft key click per character as each ask types into the composer (spaces a deeper thock)
//   send        the button's press, an upward air swoosh and a small "sent" lift; the first send also carries the camera
//   chips       a pop as each routing chip lands, a two-bell tick as it resolves
//   x50         while a tool generates under its fast-forward badge: a stopwatch ratcheting at fifty times over a tape whirr
//   landings    the photo: a two-blade shutter and a sparkle; the 3D model: a sub impact out of a reversed swell; the order: a
//               ka-ching chime; the song card: a small glint; the play press: a click
//   end card    a reversed swell as the chat goes to black, a bubble pop on the mascot (the sting itself is in the score)
// Into b.ui (dry) and b.room (the short room's send).
import { SR, mtof, place, bell, mallet, blip, click, sweep, impact, swell, SVF } from './multicat-dsp.08050705.js';

// the time each character of `text` appears in the composer: n = round(len * seg(t, s, typeEnd)) (chat.9b47fc30.js)
const charTimes = (text, s, typeEnd) => [...text].map((ch, i) => [ch, s + ((i + 0.5) / text.length) * (typeEnd - s)]);

export function renderSfx(b, { T, ask0, chips0, S }, r) {
  const ui = (sig, t, g, pan = 0, room = 0.25) => { place(b.ui, sig, t, g, pan); if (room) place(b.room, sig, t, g * room, pan); };
  const asks = [ask0, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send }))];

  // ---------- typing and sending ----------
  for (const a of asks) {
    for (const [ch, t] of charTimes(a.text, a.s, a.typeEnd)) {
      const space = ch === ' ';
      const k = space
        ? click({ tone: 1700 + 300 * r(), body: 150, tick: 0.7, thock: 0.7, len: 0.006, r })
        : click({ tone: 2600 + 1600 * r(), body: 190 + 70 * r(), tick: 1, thock: 0.35, len: 0.0035, r });
      ui(k, t + (r() - 0.5) * 0.004, (space ? 0.075 : 0.055) * (0.6 + 0.4 * r()), -0.12, 0.1);
    }
    // the send button's press bottoms out 40 ms after the send (its scale bump, chat.9b47fc30.js renderComposer)
    ui(click({ tone: 2300, body: 165, tick: 0.8, thock: 0.9, len: 0.005, r }), a.send + 0.03, 0.13, 0.1, 0.15);
    ui(sweep(0.34, { f0: 650, f1: 5200, q: 1.3, peak: 0.55, curve: 0.85, r }), a.send + 0.01, 0.2, 0.25, 0.3);
    ui(blip(mtof(83), mtof(90), { glide: 0.045, tau: 0.05, r }), a.send + 0.06, 0.035, 0.2, 0.4);
  }
  // the first send drops the composer and eases the camera out (tabs.9b47fc30.js): a low, wide air move
  ui(sweep(0.62, { f0: 160, f1: 1100, q: 0.8, peak: 0.45, curve: 1, r }), ask0.send - 0.1, 0.28, -0.1, 0.2);

  // ---------- routing chips ----------
  const chips = [...chips0, ...T.steps.flatMap((st) => st.chips)];
  for (const c of chips) {
    ui(blip(1500, 2250, { glide: 0.02, tau: 0.022, r }), c.sw + 0.06, 0.05, 0.15, 0.3);
    ui(click({ tone: 4200, body: 0, tick: 0.6, thock: 0, len: 0.002, r }), c.sw + 0.06, 0.04, 0.15, 0);
    // the check mark scales in from `done`: two quick bells, F#6 then B6
    ui(bell(mtof(90), { decay: 0.22, r }), c.done + 0.02, 0.035, 0.2, 0.5);
    ui(bell(mtof(95), { decay: 0.3, r }), c.done + 0.085, 0.03, 0.25, 0.5);
  }

  // ---------- the x50 generations ----------
  fastForward(b, T.gen0, T.done, r);
  fastForward(b, T.steps[0].gen0, T.steps[0].done, r);
  fastForward(b, S.gen0, S.done, r);

  // ---------- landings ----------
  // the photo: a two-blade shutter, then a three-bell sparkle and a breath of air
  ui(click({ tone: 2100, body: 120, tick: 1, thock: 1, len: 0.004, r }), T.done, 0.2, -0.05, 0.2);
  ui(click({ tone: 2500, body: 105, tick: 0.8, thock: 0.8, len: 0.004, r }), T.done + 0.045, 0.16, 0.05, 0.2);
  [[0, 95, -0.35], [0.05, 99, 0], [0.1, 102, 0.35]].forEach(([dt, m, pan]) => ui(bell(mtof(m), { decay: 0.6, r }), T.done + 0.02 + dt, 0.04, pan, 0.6));
  ui(sweep(0.4, { f0: 5500, f1: 9500, q: 0.7, peak: 0.2, curve: 1, r }), T.done, 0.06, 0, 0.3);
  // the 3D model: drawn in by a reversed swell, landing with a sub impact and a four-bell rise (the band stops on it)
  const M = T.steps[0];
  ui(swell(0.42, { tone: 3200, pow: 2.4, r }), M.done - 0.42, 0.14, 0, 0.2);
  ui(impact({ f0: 78, f1: 40, tau: 0.5, r }), M.done, 0.42, 0, 0);
  [[0, 83, -0.4], [0.045, 87, -0.1], [0.09, 90, 0.2], [0.135, 95, 0.45]].forEach(([dt, m, pan]) => ui(bell(mtof(m), { decay: 0.7, r }), M.done + 0.01 + dt, 0.045, pan, 0.6));
  // the order: a ka-ching, two bars (D#6 then B6) over a coin shimmer
  const O = T.steps[1];
  ui(mallet(mtof(87), { decay: 0.35, r }), O.done, 0.17, 0.1, 0.35);
  ui(bell(mtof(99), { decay: 0.5, r }), O.done, 0.045, 0.1, 0.5);
  ui(mallet(mtof(95), { decay: 0.5, r }), O.done + 0.09, 0.15, 0.2, 0.35);
  ui(bell(mtof(107), { decay: 0.6, r }), O.done + 0.09, 0.04, 0.2, 0.5);
  for (const [dt, f] of [[0.09, 6200], [0.11, 7900], [0.13, 9400], [0.16, 8600]]) ui(blip(f, f * 1.01, { glide: 0.01, tau: 0.05, r }), O.done + dt, 0.018, 0.3, 0.5);
  // the song card: a small glint inside the build's gap
  ui(bell(mtof(90), { decay: 0.4, r }), S.done + 0.01, 0.035, -0.2, 0.6);
  ui(bell(mtof(95), { decay: 0.5, r }), S.done + 0.06, 0.03, 0.2, 0.6);
  // the play press: its scale bottoms out at S.play (multicat.516afb1a.js press)
  ui(click({ tone: 2000, body: 150, tick: 0.9, thock: 1, len: 0.005, r }), S.play - 0.015, 0.16, 0.05, 0.15);

  // ---------- end card ----------
  const pop = S.cut + 0.3;
  ui(swell(pop - S.cut, { tone: 3000, pow: 2.2, r }), S.cut, 0.12, 0, 0.3);
  ui(blip(260, 1000, { glide: 0.035, tau: 0.045, r }), pop, 0.18, 0, 0.35);
  ui(click({ tone: 3000, body: 0, tick: 0.7, thock: 0, len: 0.002, r }), pop, 0.06, 0, 0);
}

// a generation running at fifty times under the frame's x50 badge (fades in over 0.2 s before `t0`, gone at `t1`): a
// stopwatch ticking faster and faster over a band-passed sawtooth whirr that climbs in pitch, with a tape flutter
function fastForward(b, t0, t1, r) {
  const a = t0 - 0.2;
  let t = a, k = 0;
  while (t < t1 - 0.012) {
    const p = (t - a) / (t1 - a), g = Math.min(1, (t - a) / 0.2);
    place(b.ui, click({ tone: 4800 + 900 * r(), body: 0, tick: 1, thock: 0, len: 0.0011, r }), t, 0.045 * g, k % 2 ? 0.3 : -0.3);
    t += 1 / (15 + 20 * p); k++;
  }
  const n = Math.round((t1 - a) * SR), o = new Float32Array(n), bp = new SVF(1100, 3);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / SR, p = i / n, f = 92 * Math.pow(1.6, p) * (1 + 0.012 * Math.sin(2 * Math.PI * 9 * tt));
    ph += f / SR; if (ph >= 1) ph -= 1;
    if ((i & 31) === 0) bp.set(900 + 900 * p, 3);
    bp.run(2 * ph - 1);
    o[i] = bp.bp * Math.min(1, tt / 0.2) * Math.min(1, (n - i) / (0.03 * SR));
  }
  place(b.ui, o, a, 0.06, 0);
}
