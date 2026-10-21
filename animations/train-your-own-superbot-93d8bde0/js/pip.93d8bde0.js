// The presenter's facecam: a rounded bubble bottom left, on screen the whole film. The video is the lip-synced talking
// head (OmniHuman 1.5 over the film's own voice track) with the whole mix (voice, music bed, sound effects) as its
// audio, so one media clock carries the lips and the sound. It follows the film's clock: plays at the clock's speed,
// seeks when it drifts, pauses with it; a frozen frame (?t=) seeks it exactly and holds `ready` until the frame decodes.
// A fresh page may not make sound before a gesture: "Play with sound" unlocks it and plays the film from the top (the
// reference spot's start gate); after that it is the mute switch.
import { h } from './lib.93d8bde0.js';

const DRIFT = 0.12; // s the video may stray from the clock while playing before it is put back on it
const SPEAKER = '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6a1.4 1.4 0 0 1-1 .4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/>';
const ICON = { on: `<svg viewBox="0 0 24 24">${SPEAKER}<path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/></svg>`, off: `<svg viewBox="0 0 24 24">${SPEAKER}<path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>` };

export function makePip({ src, poster }) {
  const el = h(`<div class="pip" aria-label="Presenter"><img alt="" src="${poster}"><video muted playsinline preload="auto" src="${src}"></video></div>`);
  const video = el.querySelector('video');
  let pending = null, failed = false, unlocked = false, refused = false;
  video.addEventListener('error', () => { failed = true; console.error(new Error(`presenter video failed to load: ${src}`)); });
  const seekTo = (t) => {
    if (Math.abs(video.currentTime - t) < 1 / 50) return;
    pending = new Promise((done) => {
      const fin = () => { video.removeEventListener('seeked', fin); pending = null; done(); };
      video.addEventListener('seeked', fin);
    });
    video.currentTime = t;
  };
  return {
    el, video,
    get ready() { return failed || (video.readyState >= 2 && !pending); },
    /** start gate: the first gesture unmutes and replays from the top */
    mountSound(clock) {
      if (clock.frozen || document.body.classList.contains('clean')) return;
      const btn = h(`<button type="button" class="snd">${ICON.on}<span>Play with sound</span></button>`);
      document.body.appendChild(btn);
      const sync = () => {
        btn.classList.toggle('is-on', unlocked);
        const on = !unlocked || !video.muted;
        btn.innerHTML = `${on ? ICON.on : ICON.off}<span>${unlocked ? (video.muted ? 'Sound off' : 'Sound on') : 'Play with sound'}</span>`;
      };
      btn.addEventListener('click', () => {
        if (!unlocked) { unlocked = true; video.muted = false; clock.restart(); }
        else video.muted = !video.muted;
        sync();
        btn.blur();
      });
      // any other key or click unlocks sound where the film stands
      const any = (e) => {
        if (unlocked || e.target.closest?.('.snd')) return;
        unlocked = true; video.muted = false; sync();
      };
      addEventListener('keydown', any, { capture: true });
      addEventListener('pointerdown', any, { capture: true });
      sync();
    },
    render(t, clock) {
      const len = video.duration || Infinity;
      const at = Math.min(t, len - 0.04);
      if (clock.playing && !clock.frozen) {
        if (Math.abs(video.playbackRate - clock.speed) > 1e-3) video.playbackRate = clock.speed;
        if (Math.abs(video.currentTime - at) > DRIFT) video.currentTime = at;
        if (video.paused && t < len) video.play().catch((e) => {
          // a refused play (no gesture yet) leaves the bubble on its frame while the clock draws on; said once
          if (!refused) { refused = true; console.warn(new Error('the presenter video was refused playback; it plays after the first click or key', { cause: e })); }
        });
      } else {
        if (!video.paused) video.pause();
        seekTo(at);
      }
    },
  };
}
