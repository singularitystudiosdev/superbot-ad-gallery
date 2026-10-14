// Dog-song beat (the 'song' variant): asked "Make me a song about my dog", Gemini answers with a Lyria 3 track. The
// player card shimmers while "Composing song" counts to 100% and the waveform draws in left to right, the cover art
// sharpens out of a blur, then the track starts: the play button presses into pause, the playhead lights the waveform,
// every bar bounces on the beat and the first lyric line lights word by word. Squeezed into the window the Gemini beat
// leaves (times(r, end)) so every variant loops the same length. Visual only, no audio: the scene is a pure function
// of t. Its stylesheet (../song.b217c2c1.css) loads with the module. Cover: a CC0 photo from Wikimedia Commons
// (img/song.b217c2c1/CREDITS.txt); the title, genre and lyrics are made up.
import { lerp, seg, outCubic, outBack, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';

const SAY = "Here's an upbeat acoustic pop song about your dog.";
const CSS = new URL('../song.b217c2c1.css?v=1', import.meta.url).href;
const TITLE = 'Muddy Paws';
const META = 'Acoustic pop · Lyria 3';
const LEN = 30; // the track's length in seconds, for the playhead
const BEAT = 60 / 112; // its tempo, for the bounce
const BARS = 44;
// a fixed waveform (summed sines, a soft intro), so every frame and every ?t= freeze draws the same shape
const LEVELS = Array.from({ length: BARS }, (_, i) => {
  const v = 0.55 + 0.24 * Math.sin(i * 0.9) + 0.14 * Math.sin(i * 2.3 + 1) + 0.09 * Math.sin(i * 5.1 + 2);
  return Math.min(1, Math.max(0.16, v * lerp(0.55, 1, Math.min(1, i / 5))));
});
// timed lyrics: every word starts on the song clock, WORD apart, with a breath between lines; the window only has
// time for the first line, the rest wait dimmed below it
const LYRICS = ['Muddy paws and a wagging tail', 'you beat me home, you never fail', "who's a good dog? you're a good dog"];
const SING0 = 0.12, WORD = 0.26, BREATH = 0.3;
const WORDS = LYRICS.flatMap((line, l) => line.split(' ').map((w) => ({ w, l })));
WORDS.forEach((x, i) => { x.at = SING0 + i * WORD + x.l * BREATH; });
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
  // `end` is the base route's end (chat.9b47fc30.js routeBy), so the loop never changes length with the variant
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
    let wi = 0;
    const lines = LYRICS.map((line) => `<p>${line.split(' ').map((w) => `<span data-w="${wi++}">${x.esc(w)}</span>`).join(' ')}</p>`).join('');
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="sg">
      <div class="sg-card">
        <div class="sg-art"><img class="sg-pic" src="${x.img('song.b217c2c1/cover.jpg')}" width="640" height="640" alt="Cover art: a corgi puppy" fetchpriority="high"/></div>
        <div class="sg-side">
          <div class="sg-t"><b><span>${x.esc(TITLE)}</span></b><small><span>${x.esc(META)}</span></small></div>
          <div class="sg-row"><span class="sg-btn">${PLAY}${PAUSE}</span><div class="sg-wave">${'<i></i>'.repeat(BARS)}</div><span class="sg-time"></span></div>
        </div>
        <i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Composing song<b class="qc-genn"></b></span>
      </div>
      <div class="sg-lyr">${lines}</div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const pic = $('.sg-pic'), info = $('.sg-t'), btn = $('.sg-btn'), time = $('.sg-time'), lyr = $('.sg-lyr');
    const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
    const bars = [...block.querySelectorAll('.sg-wave i')];
    const rows = [...lyr.querySelectorAll('p')];
    const words = [...lyr.querySelectorAll('span')];
    const gen = $('.qc-gen'), genl = $('.qc-genl'), count = $('.qc-genn');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1, pct = -1, sec = -1, sung = -1, lit = -1, playing = null, decoding = false;

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
        const kick = t < T.play ? 0 : Math.exp(-(el % BEAT) / 0.11);
        pic.style.filter = rp >= 1 ? 'none' : `blur(${lerp(14, 0, rp).toFixed(2)}px) saturate(${lerp(0.6, 1, rp).toFixed(3)})`;
        pic.style.transform = `scale(${(lerp(1.14, 1, rp) * (1 + 0.025 * kick)).toFixed(4)})`;
        const ready = t >= T.w1 - 0.1;
        info.classList.toggle('sg-wait', !ready);
        lyr.classList.toggle('sg-wait', !ready);
        lyr.style.opacity = ready ? lerp(0.4, 1, outCubic(seg(t, T.w1 - 0.1, T.w1 + 0.25))).toFixed(3) : '';

        // playback: the button presses into pause, the playhead lights the bars it has passed and every bar
        // bounces on the beat
        const head = (el / LEN) * BARS;
        bars.forEach((b, i) => {
          const grow = outCubic(Math.min(1, Math.max(0, (cp * 1.15 * BARS - i) / 4)));
          const bounce = 1 + 0.16 * kick * (0.55 + 0.45 * Math.sin(i * 1.7));
          b.style.transform = `scaleY(${(Math.max(0.08, LEVELS[i] * grow) * bounce).toFixed(4)})`;
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

        // timed lyrics: sung words light, the line being sung brightens and the rest stay dim
        const w = t < T.play ? 0 : WORDS.filter((x) => el >= x.at).length;
        if (w !== sung) {
          const cur = w ? WORDS[w - 1].l : 0;
          words.forEach((sp, i) => sp.classList.toggle('on', i < w));
          rows.forEach((r, i) => r.classList.toggle('cur', i === cur));
          sung = w;
        }
      },
    };
  },
};
