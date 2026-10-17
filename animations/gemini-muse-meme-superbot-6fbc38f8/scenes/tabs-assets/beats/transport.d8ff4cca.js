// Plays the multicat cue sheet (score.d8ff4cca.js) on the spot's clock. The clock owns time and the audio follows it,
// as the beat's song already does (multicat.516afb1a.js syncAudio): sync(t) runs every frame from the beat's render and
// schedules what falls in the next LOOK seconds onto the AudioContext.
//   An epoch is one unbroken run of the clock: the spot second t0 pinned to the context time heard at that frame
//   (getOutputTimestamp), every cue placed off that line at the clock's speed. A pause, a seek, a speed change or a
//   variant pick ends the epoch (its voices fade in PAUSE_FADE and stop); the next frame starts a fresh one where the
//   clock now is, and a held chord already under way comes back in. The run's end lets the last chord ring out.
//   Mix: the bed (music) through its level, lowpass and duck lanes, the SFX, and a short synthesised room, all trimmed
//   under the song (routed in through attachSong) into one mute gain and a brickwall limiter.
//   Nothing sounds until a click or key unlocks audio (the browsers' autoplay rule); the sound pill
//   (sound-gate.d8ff4cca.js) shows the state and mutes.
import { whiteNoise, roomImpulse } from './sfx.d8ff4cca.js';

const LOOK = 0.25;       // spot seconds scheduled ahead of the clock
const SLIP = 0.12;       // the clock this far off its epoch's line is a seek or a hitch: a new epoch starts
const LATE = 0.06;       // a cue this late (a stalled frame) is dropped rather than played off the picture
const PAUSE_FADE = 0.05, END_FADE = 1.8;
// the score runs about 5 LU under the song (-19 LUFS to the song's -14) and peaks near -4 dBFS on its landings (an
// offline mixdown through makeMix measured these)
const LEVEL = { score: 1.9, music: 1, sfx: 1, room: 0.32, song: 1 };
// Chrome's DynamicsCompressorNode adds makeup gain of 0.6 x the gain it takes off a full-scale input; this cancels it,
// so the song leaves the limiter at its own level: 1.5 dB threshold, ratio 20 -> 1.425 dB x 0.6 = 0.855 dB
const MAKEUP_TRIM = Math.pow(10, -0.855 / 20);

// a lane's value at spot s: linear between its points, or geometric (`exp`) for a frequency
function laneAt(pts, s, exp) {
  if (s <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [a, va] = pts[i - 1], [b, vb] = pts[i];
    if (s <= b) { const f = (s - a) / (b - a); return exp ? va * Math.pow(vb / va, f) : va + (vb - va) * f; }
  }
  return pts[pts.length - 1][1];
}

// the mix on any context (the live one, or an OfflineAudioContext for a mixdown): the buses an epoch feeds, the song's
// input, the mute gain and the limiter
export function makeMix(ac) {
  const master = ac.createGain(), limit = ac.createDynamicsCompressor();
  limit.threshold.value = -1.5; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.12;
  const gain = (v, to) => { const g = ac.createGain(); g.gain.value = v; g.connect(to); return g; };
  master.connect(limit).connect(gain(MAKEUP_TRIM, ac.destination));
  const score = gain(LEVEL.score, master);
  const room = ac.createConvolver();
  room.buffer = roomImpulse(ac);
  room.connect(gain(LEVEL.room, score));
  return { master, limit, music: gain(LEVEL.music, score), sfx: gain(LEVEL.sfx, score), room, song: gain(LEVEL.song, master), noise: whiteNoise(ac) };
}

// one epoch's graph on `bus`, with spot second t pinned to context time c0 at `rate`: the bed's chain (in -> level lane
// -> lowpass lane -> duck -> out), the SFX and room inputs, the lanes and ducks from t on, and any held cue already under
// way at t brought in now. Cues from `i` on are the caller's to place (toCtx)
export function arm(ac, bus, sheet, t, rate, c0) {
  const now = ac.currentTime;
  const gain = (to) => { const g = ac.createGain(); g.connect(to); return g; };
  const musicOut = gain(bus.music), duck = gain(musicOut), cut = ac.createBiquadFilter(), level = gain(cut), music = gain(level);
  cut.type = 'lowpass'; cut.Q.value = 0.6; cut.connect(duck);
  const sfx = gain(bus.sfx), rvb = gain(bus.room);
  const toCtx = (s) => c0 + (s - t) / rate;
  const e = { t0: t, c0, rate, toCtx, outs: [musicOut, sfx, rvb], nodes: [music, level, cut, duck, musicOut, sfx, rvb], srcs: [], i: 0, pruned: now };
  e.v = { ac, sfx, music, rvb, noise: bus.noise, rate, keep: (s, end) => e.srcs.push([s, end]) };

  const start = Math.max(c0, now);
  const lane = (param, pts, exp) => {
    param.setValueAtTime(laneAt(pts, t, exp), start);
    for (const [s, val] of pts) if (s > t) exp ? param.exponentialRampToValueAtTime(val, toCtx(s)) : param.linearRampToValueAtTime(val, toCtx(s));
  };
  lane(level.gain, sheet.lanes.level, false);
  lane(cut.frequency, sheet.lanes.cutoff, true);
  for (const d of sheet.ducks) if (d >= t) { const w = toCtx(d); duck.gain.setTargetAtTime(0.5, w, 0.01); duck.gain.setTargetAtTime(1, w + 0.08, 0.15); }

  const cs = sheet.cues;
  for (const c of cs) if (c.hold > 0 && c.at < t && c.at + c.hold > t) c.fn(e.v, start + 0.005, t - c.at);
  while (e.i < cs.length && cs[e.i].at < t) e.i++;
  return e;
}

export function makeTransport(sheet, { active }) {
  let ac = null, bus = null, epoch = null, muted = false, song = null, songRouted = false;
  const watchers = new Set();
  const state = () => (!ac || ac.state !== 'running' ? 'locked' : muted ? 'off' : 'on');
  const emit = () => watchers.forEach((fn) => fn(state()));

  function build() {
    ac = new AudioContext({ latencyHint: 'interactive' });
    bus = makeMix(ac);
    ac.addEventListener('statechange', emit);
  }

  // the song element's output joins the mix (unused in the Music pill's v7: the beat's element stays on its own output, so
  // no other soundtrack's element is ever captured by this context), so the mute and the limiter cover it; a failure leaves it on its own output
  function routeSong() {
    if (!ac || !song || songRouted) return;
    try {
      ac.createMediaElementSource(song).connect(bus.song);
      songRouted = true;
    } catch (e) {
      console.error(new Error('multicat score: the song could not join the mix; it plays on its own output', { cause: e }));
      songRouted = true; // never retried: an element takes one source node
    }
  }

  function unlock() {
    if (!active()) return;
    if (!ac) {
      try { build(); } catch (e) { console.error(new Error('multicat score: Web Audio is unavailable', { cause: e })); return; }
    }
    if (ac.state !== 'running') ac.resume().then(emit, (e) => console.error(new Error('multicat score: audio did not resume', { cause: e })));
    routeSong();
    emit();
  }
  // any click or key unlocks, except on the gate itself ([data-audio-gate]), which decides on/off from the state it showed
  const onGesture = (e) => { if (!(e.target && e.target.closest && e.target.closest('[data-audio-gate]'))) unlock(); };
  addEventListener('pointerdown', onGesture, true);
  addEventListener('keydown', onGesture, true);

  // the context time heard at performance time p (ms)
  function heardAt(p) {
    const ts = ac.getOutputTimestamp ? ac.getOutputTimestamp() : null;
    if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return ts.contextTime + (p - ts.performanceTime) / 1000;
    return ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) + (p - performance.now()) / 1000;
  }

  function begin(t, rate) {
    const p0 = performance.now();
    return Object.assign(arm(ac, bus, sheet, t, rate, heardAt(p0)), { p0 });
  }

  function pump(e, t) {
    const cs = sheet.cues, horizon = t + LOOK * e.rate, now = ac.currentTime;
    while (e.i < cs.length && cs[e.i].at <= horizon) {
      const c = cs[e.i++], w = e.toCtx(c.at);
      if (now - w > LATE) continue;
      c.fn(e.v, Math.max(w, now + 0.002), 0);
    }
    if (now - e.pruned > 2) { e.srcs = e.srcs.filter(([, end]) => end > now); e.pruned = now; }
  }

  function close(fade) {
    const e = epoch;
    epoch = null;
    if (!e) return;
    const now = ac.currentTime;
    for (const g of e.outs) { g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0, now + fade); }
    for (const [s, end] of e.srcs) if (end > now) s.stop(now + fade + 0.02);
    setTimeout(() => e.nodes.forEach((n) => n.disconnect()), (fade + 0.5) * 1000);
  }

  function sync(t) {
    if (!active() || !ac || ac.state !== 'running') { if (epoch) close(PAUSE_FADE); return; }
    const ad = window.__AD;
    const running = !!ad && ad.playing && !document.body.classList.contains('freeze') && document.visibilityState === 'visible';
    if (!running) { if (epoch) close(ad && t >= ad.CYCLE - 0.05 ? END_FADE : PAUSE_FADE); return; }
    const rate = ad.speed || 1;
    if (epoch && (epoch.rate !== rate || Math.abs(epoch.t0 + ((performance.now() - epoch.p0) / 1000) * epoch.rate - t) > SLIP)) close(PAUSE_FADE);
    if (!epoch) epoch = begin(t, rate);
    pump(epoch, t);
  }

  function setMuted(m) {
    muted = m;
    if (ac) bus.master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.02);
    if (song && !songRouted) song.muted = m;
    emit();
  }

  return {
    sync,
    unlock,
    state,
    setMuted,
    get muted() { return muted; },
    // stop at once: another variant or soundtrack took the frame; the output goes idle until this soundtrack is picked again
    stop() { if (epoch) close(PAUSE_FADE); if (ac && ac.state === 'running') ac.suspend().then(emit, () => {}); },
    // QA: true while the score is making sound right now (unlocked, unmuted, a run of the clock in hand)
    get sounding() { return !!epoch && !muted && !!ac && ac.state === 'running'; },
    // (v7 on the Music pill: the song keeps its own output, the beat mutes it with this pill's mute; it never joins the mix)
    attachSong(audio) { song = audio; },
    watch(fn) { watchers.add(fn); fn(state()); },
    // QA: the context, the mix, the sheet and the running epoch's line, to check a cue against the frame it belongs to
    get debug() { return { ac, bus, sheet, epoch: epoch && { t0: epoch.t0, c0: epoch.c0, p0: epoch.p0, rate: epoch.rate, next: epoch.i } }; },
  };
}
