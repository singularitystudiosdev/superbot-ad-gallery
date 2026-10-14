// Dog-song beat (the 'song' variant): asked "Make me a song about my dog", superbot connects to ElevenLabs and it
// answers with an Eleven Music track. The player card shimmers while "Composing song" counts to 100% and the waveform
// draws in left to right, the ElevenLabs icon (the cover art) sharpens out of a blur, then the track starts: the play
// button presses into pause and the playhead fills the waveform white. Its window runs the route's `extra` past the
// base route's end (chat.9b47fc30.js routeBy), so this variant's loop is longer. Visual only, no audio: the scene is a
// pure function of t. Its stylesheet (../song.b217c2c1.css) loads with the module. Cover: the official ElevenLabs
// icon (brand/CREDITS.txt); the title and genre are made up.
import { lerp, seg, outCubic, outBack, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';

const SAY = "Here's an upbeat acoustic pop song about your dog.";
const CSS = new URL('../song.b217c2c1.css?v=3', import.meta.url).href;
const TITLE = 'Muddy Paws';
const META = 'Acoustic pop · Eleven Music';
const LEN = 30; // the track's length in seconds, for the playhead
const BARS = 44;
// a fixed waveform (summed sines, a soft intro), so every frame and every ?t= freeze draws the same shape
const LEVELS = Array.from({ length: BARS }, (_, i) => {
  const v = 0.55 + 0.24 * Math.sin(i * 0.9) + 0.14 * Math.sin(i * 2.3 + 1) + 0.09 * Math.sin(i * 5.1 + 2);
  return Math.min(1, Math.max(0.16, v * lerp(0.55, 1, Math.min(1, i / 5))));
});
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`song variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

export default {
  // `end` is the base route's end plus this route's `extra` (chat.9b47fc30.js routeBy)
  times(r, end = r + 2.35) {
    const T = { r };
    T.card = r + 0.22;
    T.w0 = r + 0.3; T.w1 = T.w0 + 1.0;
    T.play = T.w1 + 0.12;
    T.end = end;
    return T;
  },
  build(k, x) {
    loadSheet();
    const T = k.T;
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="sg">
      <div class="sg-card">
        <div class="sg-art"><img class="sg-pic" src="${x.brand('elevenlabs-icon.svg')}" width="500" height="500" alt="ElevenLabs logo" fetchpriority="high"/></div>
        <div class="sg-side">
          <div class="sg-t"><b><span>${x.esc(TITLE)}</span></b><small><span>${x.esc(META)}</span></small></div>
          <div class="sg-row"><span class="sg-btn">${PLAY}${PAUSE}</span><div class="sg-wave">${'<i></i>'.repeat(BARS)}</div><span class="sg-time"></span></div>
        </div>
        <i class="qc-gen"></i><span class="qc-genl">${x.tile('elevenlabs')}Composing song<b class="qc-genn"></b></span>
      </div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const pic = $('.sg-pic'), info = $('.sg-t'), btn = $('.sg-btn'), time = $('.sg-time');
    const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
    const bars = [...block.querySelectorAll('.sg-wave i')];
    const gen = $('.qc-gen'), genl = $('.qc-genl'), count = $('.qc-genn');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1, pct = -1, sec = -1, lit = -1, playing = null, decoding = false;

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        // a frozen frame waits on the cover; decode() only works once the nodes have left the template's inert
        // document, which they have by the first render
        if (!decoding) {
          decoding = true;
          track(pic.decode().catch((e) => console.error(new Error(`song cover failed to decode: ${pic.src}`, { cause: e }))));
        }
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;

        // composing: the shimmer sweeps, the counter climbs, the waveform draws in left to right and the cover
        // sharpens out of a blur as it nears 100%
        const cp = seg(t, T.w0, T.w1);
        const p = Math.floor(cp * 100);
        if (p !== pct) { count.textContent = `${p}%`; pct = p; }
        const rp = outCubic(seg(t, T.w1 - 0.35, T.w1 + 0.2));
        gen.style.opacity = (1 - rp).toFixed(3);
        gen.style.transform = `translateX(${lerp(-100, 100, ((t - T.card) * 1.3) % 1).toFixed(1)}%)`;
        genl.style.opacity = (1 - seg(t, T.w1 - 0.2, T.w1)).toFixed(3);
        const el = Math.max(0, t - T.play);
        pic.style.filter = rp >= 1 ? 'none' : `blur(${lerp(14, 0, rp).toFixed(2)}px)`;
        pic.style.transform = rp >= 1 ? 'none' : `scale(${lerp(1.14, 1, rp).toFixed(4)})`;
        info.classList.toggle('sg-wait', t < T.w1 - 0.1);

        // playback: the button presses into pause and the playhead fills the bars it has passed; the bars hold
        // still once drawn in
        const head = (el / LEN) * BARS;
        bars.forEach((b, i) => {
          const grow = outCubic(Math.min(1, Math.max(0, (cp * 1.15 * BARS - i) / 4)));
          b.style.transform = `scaleY(${Math.max(0.08, LEVELS[i] * grow).toFixed(4)})`;
        });
        const on = t < T.play ? 0 : Math.ceil(head);
        if (on !== lit) { bars.forEach((b, i) => b.classList.toggle('on', i < on)); lit = on; }
        const pop = outBack(seg(t, T.w1 - 0.15, T.w1 + 0.2));
        const press = seg(t, T.play - 0.12, T.play) * (1 - seg(t, T.play, T.play + 0.1));
        // the controls stay hidden under the "Composing song" chip until it clears
        btn.style.opacity = seg(t, T.w1 - 0.15, T.w1 + 0.1).toFixed(3);
        btn.style.transform = `scale(${(lerp(0.85, 1, pop) * (1 - 0.12 * press)).toFixed(4)})`;
        const isPlaying = t >= T.play;
        if (isPlaying !== playing) { playIcon.style.display = isPlaying ? 'none' : ''; pauseIcon.style.display = isPlaying ? '' : 'none'; playing = isPlaying; }
        time.style.opacity = btn.style.opacity;
        const s = Math.floor(el);
        if (s !== sec) { time.textContent = `${clock(s)} / ${clock(LEN)}`; sec = s; }
      },
    };
  },
};
