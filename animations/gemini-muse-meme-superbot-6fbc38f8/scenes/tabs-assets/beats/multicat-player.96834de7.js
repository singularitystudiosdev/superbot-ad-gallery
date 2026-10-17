// Plays the multicat score (multicat-score.96834de7.js) on the spot's clock, as the song's <audio> follows it
// (multicat.516afb1a.js syncAudio): the score renders once, on the variant's first frame, then each frame checks that
// the buffer is where the clock says. Running (window.__AD.playing) it plays from the clock's t at the clock's speed,
// starting over (a 10 ms crossfade) when it drifts 60 ms, the speed changes or the clock seeks; paused, stepped or
// frozen it stops; once the run has ended it lets the tail ring. Output latency is added in, so what is heard is the
// frame being drawn. Nothing plays until the sound gate (sound.96834de7.js) has an AudioContext running.
import { renderScore } from './multicat-score.96834de7.js?v=3';
import { sound } from '../../../sound.96834de7.js?v=2';
import { variant } from '../../../variant.9e82faf1.js?v=3';

// one player per chain (multicat, multicat-credits, multidog-credits, discord-credits): the Music pill reads the shown variant's, QA any that sounds
const players = {};

const DRIFT = 0.06;

export function makePlayer(cues, id = 'multicat') {
  let job = null, buffer = null, failed = false, src = null, fade = null, startedAt = 0, from = 0, rate = 1;

  function prepare() {
    if (job) return;
    job = renderScore(cues).then((r) => {
      buffer = r.buffer;
      window.__MC_SCORE = { ...r.stats, cues, buffer }; // QA: the render's loudness, limiter and grid, its cues and audio
    }).catch((e) => { failed = true; console.error(new Error('multicat: the score failed to render', { cause: e })); });
  }

  function stop() {
    if (!src) return;
    const now = sound.ctx.currentTime;
    fade.gain.setTargetAtTime(0, now, 0.003);
    src.stop(now + 0.03);
    src = fade = null;
  }

  function start(at, r) {
    const ctx = sound.ctx, now = ctx.currentTime;
    src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = r;
    fade = ctx.createGain();
    fade.gain.setValueAtTime(0, now);
    fade.gain.linearRampToValueAtTime(1, now + 0.01);
    src.connect(fade).connect(sound.out);
    src.start(now, at);
    startedAt = now; from = at; rate = r;
  }

  // the beat calls sync(t) only while v16 is the pick (multicat.516afb1a.js), stop() otherwise
  players[id] = { ready: () => !!buffer || failed, sounding: () => !!src && !!sound.ctx && sound.ctx.state === 'running' && !sound.muted };
  (window.__PICKS ||= {}).v16 = {
    ready: () => { const p = players[variant()]; return !p || p.ready(); },
    sounding: () => Object.values(players).some((p) => p.sounding()),
  };
  return {
    stop,
    sync(t) {
      prepare();
      const ad = window.__AD, ctx = sound.ctx;
      if (!buffer || !ctx || ctx.state !== 'running' || document.body.classList.contains('freeze')) { if (src && ctx) stop(); return; }
      if (!ad || !ad.playing) {
        // the run is over and held on its last frame: the end card's tail rings out
        if (!(ad && t >= ad.CYCLE - 1e-3)) stop();
        return;
      }
      const r = ad.speed || 1;
      const want = t + ((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * r;
      if (want >= buffer.duration) { stop(); return; }
      const at = src ? from + (ctx.currentTime - startedAt) * rate : -1;
      if (!src || r !== rate || Math.abs(at - want) > DRIFT) { stop(); start(want, r); }
    },
  };
}
