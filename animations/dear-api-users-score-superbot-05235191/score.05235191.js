// score.05235191.js: the spot's music, cue by cue against the picture's beat table (B in index.html), and the player that
// keeps it locked to the ad clock. Before the drop it is beatless D minor: the salutation, then the bill climbing to
// $30,000 with one coin-tick per $1,000 the counter passes. At the drop (6.29, as the price lands on $800) it turns to F
// major at 114.5 BPM, a tempo whose 16th grid lands the line (7.60), the strike (9.30) and the end card (10.22) to 3 ms.
// The strike tape-stops the groove ("stop paying"); the end card is the tonic, with the salutation's motif resolved.
(function () {
  const S = window.Synth;
  const BPM = 114.5, STEP = 60 / BPM / 4, DROP = 6.29;
  const step = (n) => DROP + n * STEP;
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = (name) => {
    const [, l, acc, oct] = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    const midi = 12 * (Number(oct) + 1) + NOTE[l] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  const chord = (names) => names.split(' ').map(hz);
  const outCubic = (x) => 1 - Math.pow(1 - x, 3);
  const sample = (fn, n = 64) => Array.from({ length: n }, (_, i) => fn(i / (n - 1)));

  // the counter's $1,000 crossings: count-up inverts outCubic, the roll inverts inOutCubic (index.html's price(t))
  function crossings(B) {
    const up = [], down = [];
    for (let n = 1; n < 30; n++) up.push(B.countA + (B.countB - B.countA) * (1 - Math.cbrt(1 - n / 30)));
    for (let v = 29; v >= 1; v--) {
      const y = (30 - v) / 29.2, p = y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2;
      down.push(B.rollA + (B.rollB - B.rollA) * p);
    }
    // no two ticks closer than 22 ms, or the fast end of the count turns into a buzz
    const thin = (ts) => ts.filter((t, i) => i === 0 || t - ts[i - 1] >= 0.022);
    return { up: thin(up), down: thin(down) };
  }

  // B1, 0 - 2.45: DEAR API USERS. A Dm9 bed, the tile's pop, and the salutation as a motif: A, C, D
  function salutation(k, B) {
    S.saws(k, 0, 2.55, chord('D3 A3 C4 E4 F4'), { amp: 0.016, cutoff: 600, cutoffTo: 1500, attack: 0.5, release: 0.4, detune: 7, send: 0.5 });
    S.bass(k, 0.1, 2.3, hz('D2'), { amp: 0.045, attack: 0.35, release: 0.4, cutoff: 300 });
    S.blip(k, B.dearIn, 300, 820, { amp: 0.15, glide: 0.05, decay: 0.2 });
    S.kick(k, B.dearIn, 0.32, 0);
    S.bell(k, B.dearIn + 0.03, hz('D6'), { amp: 0.035, decay: 1.1, pan: 0.2 });
    ['A4', 'C5', 'D5'].forEach((n, i) => {
      const t = B.dearIn + 0.4 + i * 0.14;
      S.pluck(k, t, hz(n), { amp: 0.15, decay: 0.6, pan: (i - 1) * 0.25, send: 0.4 });
      S.bell(k, t, hz(n) * 2, { amp: 0.03, decay: 0.8, pan: (i - 1) * 0.25 });
    });
    S.whoosh(k, 2.18, 0.42, { amp: 0.08, f0: 400, f1: 3200, p0: 0.4, p1: -0.4 });
  }

  // B2, 2.38 - 4.10: Before superbot, the bill climbs. A Dm(b6) bed whose filter opens with the price, coin-ticks rising
  // through D minor pentatonic, a riser and a saw that sonify the number itself
  function bill(k, B, ticks) {
    S.saws(k, B.costIn, B.countB - B.costIn + 0.02, chord('D3 A3 Bb3 F4'), { amp: 0.026, cutoff: 500, cutoffTo: 2600, sweep: 1.7, attack: 0.4, release: 0.05, send: 0.4 });
    const up = chord('D5 F5 G5 A5 C6 D6 F6 G6 A6');
    ticks.up.forEach((t, i) => {
      const x = i / ticks.up.length;
      S.bell(k, t, up[Math.floor(x * up.length)], { amp: 0.07 + 0.06 * x, decay: 0.08, ratio: 3.51, index: 1.2, pan: i % 2 ? 0.25 : -0.25, send: 0.12 });
    });
    const d = B.countB - B.countA;
    S.riser(k, B.countA, d, sample((x) => 0.5 * outCubic(x) + 0.5 * Math.pow(x, 1.5)), { amp: 0.32, f0: 300, f1: 7000 });
    S.riser(k, B.countA, d, sample(outCubic), { amp: 0, tone: [hz('D2'), hz('D4')], toneAmp: 0.07 });
  }

  // 4.10: $30,000 lands. An impact and a Dm7(b9) stab, then a trembling low D hanging over the number
  function damage(k, B) {
    S.boom(k, B.countB, hz('D2'), hz('D1'), 0.8, 1.2);
    S.kick(k, B.countB, 1, 0);
    S.saws(k, B.countB, 1.05, chord('D3 A3 C4 Eb4 F4'), { amp: 0.05, cutoff: 5000, cutoffTo: 900, sweep: 0.9, attack: 0.003, release: 0.7, send: 0.5, duck: false });
    S.crash(k, B.countB, 0.12, 1.4);
    S.drone(k, B.countB + 0.05, B.swap - B.countB + 0.05, hz('D1'), { amp: 0.13 });
  }

  // 5.20 - 6.29: the chip flips to After superbot and the price rolls down. A whoosh and a glitched sparkle on the flip,
  // the key turning to F major under it (a pad opening up into the drop), coin-ticks falling through F major, a snare
  // build on the groove's own grid, a riser and a reverse cymbal
  function relief(k, B, ticks) {
    S.whoosh(k, B.swap - 0.1, 0.45, { amp: 0.16, f0: 900, f1: 7000, p0: -0.7, p1: 0.7 });
    const open = B.swap + 0.08, cut = step(-0.38);
    S.saws(k, open, cut - open, chord('F3 A3 C4 E4 G4'), { amp: 0.026, cutoff: 700, cutoffTo: 4000, sweep: cut - open, attack: 0.35, release: 0.03, send: 0.45 });
    ['F6', 'A6', 'C7'].forEach((n, i) => {
      S.bell(k, B.swap + 0.12 + i * 0.05, hz(n), { amp: 0.045, decay: 0.7, pan: (i - 1) * 0.3, detune: -14 });
      S.bell(k, B.swap + 0.13 + i * 0.05, hz(n), { amp: 0.03, decay: 0.6, pan: (1 - i) * 0.3, detune: 14 });
    });
    const down = chord('C7 A6 G6 F6 D6 C6 A5 G5 F5');
    ticks.down.forEach((t, i) => {
      const x = i / ticks.down.length;
      S.bell(k, t, down[Math.floor(x * down.length)], { amp: 0.09, decay: 0.08, ratio: 3.51, index: 1.2, pan: i % 2 ? 0.25 : -0.25, send: 0.12 });
    });
    [[-6, 0.08], [-4, 0.12], [-3, 0.16], [-2, 0.21], [-1.5, 0.24], [-1, 0.29], [-0.5, 0.33]].forEach(([n, a]) => S.snare(k, step(n), a));
    const end = step(-0.38), d = end - B.rollA;
    S.riser(k, B.rollA, d, sample((x) => x * x), { amp: 0.24, f0: 600, f1: 9000, tone: [hz('F3'), hz('F4')], toneAmp: 0.055 });
    S.swell(k, B.rollA + 0.05, end - B.rollA - 0.05, 0.26);
  }

  // 6.29 - 9.30: the drop. Four on the floor, claps on 2 and 4, a house offbeat bass (the sub only ever on the "and", so
  // it never meets the kick's sine and cancels), Bbmaj9 (IV) then Csus4 to C (V); a bell on "97% less", and a run up
  // F major as the line's six words rise
  function groove(k, B) {
    const tape = { t: step(23), d: 0.34 };
    S.crash(k, step(0), 0.22, 1.6);
    S.boom(k, step(0), hz('Bb2'), hz('Bb1'), 0.35, 0.8);
    for (let n = 0; n < 23; n++) {
      if (n % 4 === 0) S.kick(k, step(n), 0.95, 0.42);
      if (n % 8 === 4) S.clap(k, step(n), 0.3);
      if (n % 4 === 2) S.hat(k, step(n), n === 10 || n === 22 ? 0.09 : 0.1, n === 10 || n === 22);
      else if (n % 2 === 1) S.hat(k, step(n), 0.035);
      if (n % 4 !== 2) continue;
      const [sub, top] = n < 16 ? ['Bb1', 'Bb2'] : ['C2', 'C3'], last = n === 22;
      S.bass(k, step(n), last ? tape.t + tape.d - step(n) : 1.6 * STEP, hz(sub), { amp: 0.34, release: last ? tape.d : 0.05, tape: last ? tape : null });
      S.pluck(k, step(n), hz(top), { amp: 0.1, decay: 0.16, bright: 1300, type: 'sawtooth', send: 0.05 });
    }
    S.saws(k, step(0), step(16) - step(0), chord('Bb3 D4 F4 A4 C5'), { amp: 0.04, cutoff: 3200, cutoffTo: 1800, sweep: 1, attack: 0.004, release: 0.06, detune: 12, send: 0.35 });
    S.saws(k, step(16), step(20) - step(16), chord('C4 F4 G4 C5'), { amp: 0.04, cutoff: 2400, attack: 0.004, release: 0.05, detune: 12, send: 0.35 });
    S.saws(k, step(20), tape.t + tape.d - step(20), chord('C4 E4 G4 D5'), { amp: 0.04, cutoff: 2600, attack: 0.004, release: tape.d, detune: 12, send: 0.35, tape });
    S.bell(k, B.less, hz('C6'), { amp: 0.13, decay: 1, index: 1.6, pan: -0.2 });
    S.bell(k, B.less + 0.03, hz('F6'), { amp: 0.11, decay: 1.1, index: 1.6, pan: 0.2 });
    S.whoosh(k, B.lineIn - 0.2, 0.25, { amp: 0.07, f0: 1200, f1: 5000, p0: 0.3, p1: -0.3 });
    ['F5', 'G5', 'A5', 'C6', 'D6', 'F6'].forEach((n, i) => {
      S.pluck(k, B.lineIn + 0.05 + i * 0.1, hz(n), { amp: 0.11, decay: 0.35, pan: -0.5 + i * 0.2, send: 0.35 });
    });
    S.bell(k, B.lineIn + 0.05, hz('F6'), { amp: 0.035, decay: 1 });
  }

  // 9.30: API pricing is struck. The bar's hiss and zap, a last kick and clap, and the groove runs down like tape; then
  // near silence, a reverse cymbal and two snare pickups into the end card
  function strike(k, B) {
    S.slash(k, B.strike, 0.3, 0.28);
    S.kick(k, step(23), 1, 0.3);
    S.clap(k, step(23), 0.3);
    S.boom(k, step(23), hz('C2'), hz('C1'), 0.35, 0.5);
    S.swell(k, 9.68, step(30) - 0.03 - 9.68, 0.22);
    [[27, 0.07], [28, 0.1], [29, 0.15], [29.5, 0.19]].forEach(([n, a]) => S.snare(k, step(n), a));
  }

  // 10.22: superbot.gg. The tonic at last (F add9 over a low F), the motif resolved (A, C, then the mascot springing up to
  // F), and a slow arpeggio while the mascot bobs; everything has rung out by 13
  function endCard(k, B) {
    const t = B.endIn;
    S.kick(k, t, 1, 0.55);
    S.boom(k, t, hz('F2'), hz('F1'), 0.7, 1.6);
    S.crash(k, t, 0.26, 2.2);
    S.clap(k, t, 0.28);
    S.saws(k, t, 12.95 - t, chord('F3 C4 F4 G4 A4 C5'), { amp: 0.036, cutoff: 4200, cutoffTo: 1100, sweep: 2.2, attack: 0.004, release: 1.2, detune: 14, send: 0.5 });
    S.saws(k, t, 12.95 - t, chord('F3 A3 C4 E4'), { amp: 0.02, cutoff: 900, attack: 0.25, release: 1, voices: 2, send: 0.5 });
    S.bass(k, step(31), 12.9 - step(31), hz('F1'), { amp: 0.3, attack: 0.08, release: 1.7 }); // in as the kick fades
    [[31, 'A5'], [32, 'C6']].forEach(([n, name]) => {
      S.pluck(k, step(n), hz(name), { amp: 0.14, decay: 0.7, send: 0.45 });
      S.bell(k, step(n), hz(name), { amp: 0.06, decay: 1 });
    });
    S.blip(k, t + 0.3, hz('C6'), hz('F6'), { amp: 0.18, glide: 0.08, decay: 0.5 });
    S.bell(k, t + 0.34, hz('F6'), { amp: 0.035, decay: 0.9, pan: -0.45, detune: -18 });
    S.bell(k, t + 0.35, hz('F6'), { amp: 0.035, decay: 0.9, pan: 0.45, detune: 18 });
    ['C6', 'A5', 'F5', 'G5', 'A5', 'C6', 'F6'].forEach((name, i) => {
      const last = i === 6;
      S.pluck(k, step(34 + i * 2), hz(name), { amp: 0.075 - i * 0.007, decay: last ? 0.9 : 0.5, pan: i % 2 ? 0.45 : -0.45, bright: 4200, send: 0.55 });
    });
  }

  const PARTS = { salutation, bill, damage, relief, groove, strike, endCard };
  // parts: a subset of PARTS' names to solo (QA renders); omitted, the whole score
  function score(k, B, parts = Object.keys(PARTS)) {
    const ticks = crossings(B);
    parts.forEach((name) => PARTS[name](k, B, ticks));
  }

  // ---------- the WAV for offline renders: 16-bit PCM ----------
  function wav(buf) {
    const ch = buf.numberOfChannels, n = buf.length, bytes = 44 + n * ch * 2;
    const v = new DataView(new ArrayBuffer(bytes));
    const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); v.setUint32(4, bytes - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, buf.sampleRate, true);
    v.setUint32(28, buf.sampleRate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * ch * 2, true);
    const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
    for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < ch; c++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, data[c][i])) * 0x7fff, true);
    return v.buffer;
  }

  // the whole score rendered offline, CYCLE seconds, faded over its last 0.3 s so it can sit under a 13 s video;
  // raw skips the master bus and parts solos sections, both for QA
  async function render(B, CYCLE, { sampleRate = 48000, fade = true, raw = false, parts } = {}) {
    const oc = new OfflineAudioContext(2, Math.round(CYCLE * sampleRate), sampleRate);
    const k = S.take(oc, raw ? oc.destination : S.chain(oc, oc.destination).input, 0, 0);
    score(k, B, parts);
    if (fade) {
      k.out.gain.setValueAtTime(1, CYCLE - 0.3);
      k.out.gain.linearRampToValueAtTime(0, CYCLE);
    }
    return wav(await oc.startRendering());
  }

  // ---------- live: one take at a time, restarted whenever the picture's clock and the heard audio part by > 0.1 s ----------
  function player(B, CYCLE) {
    const AC = window.AudioContext || window.webkitAudioContext;
    const LOOK = 0.04;
    let ctx = null, bus = null, live = null, muted = false, lastClock = -1;
    const latency = () => (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
    function ensure() {
      if (!ctx) {
        ctx = new AC({ latencyHint: 'interactive' });
        bus = S.chain(ctx, ctx.destination);
        ctx.addEventListener('statechange', () => api.onchange && api.onchange());
      }
      return ctx;
    }
    // the context time reaching the speakers right now: the output timestamp maps it onto performance.now() (the
    // picture's clock), device start-up included; without one, currentTime less the reported latencies
    function speakerClock() {
      const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
      return ctx.currentTime - latency();
    }
    // ad time t is on screen now, so it belongs at the speaker clock's now; the take's first schedulable moment is
    // LOOK past currentTime, which is that much further into the spot
    function begin(t) {
      const base = ctx.currentTime + LOOK, k = S.take(ctx, bus.input, t + (base - speakerClock()), base);
      score(k, B);
      return k;
    }
    function drop() {
      if (live) S.stop(live);
      live = null;
    }
    const heard = () => live.t0 + (speakerClock() - live.base);
    const api = {
      onchange: null,
      get running() { return !!ctx && ctx.state === 'running'; },
      // the ad time reaching the ear right now (null with no take), for QA against the picture's clock
      get heard() { return live ? heard() : null; },
      get muted() { return muted; },
      create: ensure,
      unlock() { return ensure().resume(); },
      toggleMute() {
        muted = !muted;
        if (muted) drop();
        if (api.onchange) api.onchange();
        return muted;
      },
      // every frame: the picture's time and whether it is playing. A spot that played to its end keeps ringing.
      sync(t, playing) {
        if (!ctx || ctx.state !== 'running' || muted) return drop();
        if (!playing) {
          if (t < CYCLE - 0.02) drop();
          return;
        }
        if (live) {
          if (Math.abs(heard() - t) < 0.1) return;
          drop();
        }
        // a context that has just started reports running before its clock moves; a take begun then lands late
        const ct = ctx.currentTime, moving = ct > 0 && ct !== lastClock;
        lastClock = ct;
        if (moving) live = begin(t);
      },
      render: (o) => render(B, CYCLE, o),
    };
    return api;
  }

  window.Score = { player, render, wav, BPM, DROP, step };
})();
