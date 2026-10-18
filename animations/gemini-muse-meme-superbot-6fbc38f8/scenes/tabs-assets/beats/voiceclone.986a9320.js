// Voice-clone song beat (the 'voice-clone-song' variant): asked "Clone my voice and make a song in my voice", superbot
// opens the microphone (the route's one chip, chat.9b47fc30.js routeBy) and answers in two steps in one reply.
//   1. The sample: a Your voice card in the bakery artifact frame (bakery.005f5570.css .bk) with a line to read out loud.
//      The pointer presses the record button, the line lights word by word as the user reads it while a level meter
//      scrolls in from the right and the clock counts, then the pointer presses stop. The take freezes in the meter and
//      fills white as superbot clones the voice; the card's status pill reads Ready, Recording, Cloning your voice, then
//      Voice cloned.
//   2. The song: a second line, then the dog song's player strip (song.b217c2c1.css .sg) with the superbot mark as its
//      cover and "Sung in your voice" beside the title, the lyrics under the row. It plays: the button presses into pause,
//      the playhead turns the waveform white from the left and the sung line lights word by word, the next line under it.
// Squeezed into the route's window (its `extra` is LEN past the base beat), so the scene is a pure function of t. Visual
// only: no microphone opens, nothing is recorded or cloned, no audio plays. The line, the title and the lyrics are made
// up. Its stylesheet (../voiceclone.986a9320.css) loads with the module, the song strip's with it.
import { clamp, lerp, seg, outCubic, inOutCubic, path, press, blink, streamCount, rand } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { SHARE_GLYPH, shareAttrs } from './share.29a362ea.js';

const CSS = new URL('../voiceclone.986a9320.css?v=1', import.meta.url).href;
// the dog song's sheet, the same href its beat loads (song.b217c2c1.js), so the browser holds one copy
const SONG_CSS = new URL('../song.b217c2c1.css?v=11', import.meta.url).href;

const SAY1 = 'Read this line out loud and I’ll learn your voice.';
const SAY2 = 'Your voice is cloned. Here’s a pop song sung in it.';
// the line the user reads: [word, its start and its length in seconds from the record press], read at a talking pace
// with a breath after "superbot," and "voice."
const READ = [['Hey', 0.3, 0.2], ['superbot,', 0.52, 0.42], ['this', 1.2, 0.16], ['is', 1.38, 0.12], ['my', 1.52, 0.15],
  ['voice.', 1.7, 0.4], ['Sing', 2.42, 0.24], ['it', 2.68, 0.1], ['back', 2.8, 0.22], ['to', 3.04, 0.12], ['me.', 3.18, 0.36]];
const REC = 3.85;   // the stop press, after the last word has trailed off
const CLONE = 1.7;  // the clone's progress, from just after the stop to Voice cloned
const PLAY_FOR = 7.2; // the song plays this long before the loop ends: three sung lines
const BARS = 56;    // the level meter's bars
const RATE = 30;    // the meter's samples a second: it scrolls one bar left per sample

// the song (all made up): its title, its length for the clock and the playhead, and the lyrics, one [word, start] per
// word in seconds from the play press
const TITLE = 'Closer to Home';
const LEN_S = 154;
const LYRICS = [
  [['I’ve', 0.35], ['been', 0.6], ['chasing', 0.85], ['every', 1.35], ['sunrise', 1.7]],
  [['Singing', 2.6], ['louder', 3.05], ['than', 3.5], ['the', 3.7], ['rain', 3.95]],
  [['Every', 4.9], ['road', 5.15], ['I', 5.4], ['take', 5.55], ['brings', 5.8], ['me', 6.05], ['closer', 6.25]],
  // past the loop's end: it waits dim under the third line, which the last frame holds lit
  [['Closer', 7.8], ['to', 8.3], ['home', 8.5], ['again', 8.9]],
];
const LH = 22; // a lyric line's height (../voiceclone.986a9320.css .vc-ly p)

// the voice's loudness at s seconds into the take: a swell over each word, grained per sample, a faint room floor
function level(s) {
  if (s < 0 || s > REC) return 0;
  let a = 0;
  for (const [, at, d] of READ) {
    const u = (s - at) / d;
    if (u > -0.2 && u < 1.2) a = Math.max(a, Math.sin(Math.PI * clamp((u + 0.2) / 1.4)));
  }
  const i = Math.floor(s * RATE);
  return a * (0.45 + 0.55 * rand(i * 3 + 1)) + 0.05 * rand(i * 7 + 2);
}

// the song's waveform: one filled, mirrored envelope at about a sample per device pixel, as the dog song draws its own
const SAMPLES = 720;
const SHAPE = [[0, 0.05], [0.02, 0.42], [0.08, 0.6], [0.3, 0.64], [0.36, 0.9], [0.56, 0.93], [0.58, 0.45], [0.62, 0.62],
  [0.78, 0.66], [0.82, 0.94], [0.96, 0.92], [1, 0.1]];
function loudness(u) {
  let k = 1;
  while (k < SHAPE.length - 1 && SHAPE[k][0] < u) k++;
  const [x0, y0] = SHAPE[k - 1], [x1, y1] = SHAPE[k];
  return lerp(y0, y1, inOutCubic(clamp((u - x0) / (x1 - x0))));
}
const edge = (seed) => Array.from({ length: SAMPLES }, (_, i) => Math.max(0.03, loudness(i / (SAMPLES - 1)) * (0.68 + 0.32 * rand(seed + i))));
const WAVE_D = (() => {
  const top = edge(41), bottom = edge(977);
  const y = (v, dir) => (50 + dir * v * 48).toFixed(1);
  let d = 'M0 50';
  top.forEach((v, i) => { d += `L${i} ${y(v, -1)}`; });
  for (let i = SAMPLES - 1; i >= 0; i--) d += `L${i} ${y(bottom[i], 1)}`;
  return `${d}Z`;
})();
const wave = (cls) => `<svg class="${cls}" viewBox="0 0 ${SAMPLES - 1} 100" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE_D}"/></svg>`;
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const DOWNLOAD = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const sheets = {};
function loadSheet(href, name) {
  if (sheets[href] || document.querySelector(`link[href="${href}"]`)) return;
  const l = sheets[href] = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  track(new Promise((done) => {
    l.onload = done;
    l.onerror = () => { console.error(new Error(`voice-clone-song variant ${name} stylesheet failed to load: ${href}`)); done(); };
  }));
  document.head.appendChild(l);
}

// a card's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
}

// a streamed line: the visible prefix, the rest held in place transparent
function sayEl(x, text, cls = '') {
  const n = x.el(`<div class="qc-say ${cls}"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
    n.style.opacity = t >= at ? '1' : '0';
  } };
}

// 1. the sample card: the line to read, the record button, the level meter and its clock, the status pill
function buildSample(x, T) {
  const node = x.el(`<div class="bk vc">
    <div class="bk-head">
      <b class="bk-title">Your voice<small>Voice sample</small></b>
      <span class="bk-btn vc-st"></span>
    </div>
    <div class="bk-view vc-view">
      <div class="vc-cue">Read this out loud</div>
      <div class="vc-line">${READ.map(([w]) => `<span>${x.esc(w)}</span>`).join(' ')}</div>
      <div class="vc-row">
        <span class="vc-rec" role="img" aria-label="Record"><i class="vc-ring"></i><i class="vc-dot"></i></span>
        <span class="vc-meter">${'<i></i>'.repeat(BARS)}</span>
        <span class="vc-time">0:00</span>
      </div>
    </div>
  </div>`);
  const q = (s) => node.querySelector(s);
  const words = [...node.querySelectorAll('.vc-line span')], bars = [...node.querySelectorAll('.vc-meter i')];
  const st = q('.vc-st'), rec = q('.vc-rec'), ring = q('.vc-ring'), dot = q('.vc-dot'), time = q('.vc-time');
  const lit = words.map(() => false), scale = bars.map(() => -1), white = bars.map(() => null);
  let state = '', sec = -1, pctN = null, spin = null, recDot = null, pctShown = -1;

  // the status pill's face per state: a dot, the spinner with the clone's percent, or the check
  const FACE = {
    ready: '<span class="vc-st-i"><i class="vc-st-dot"></i></span><span>Ready</span>',
    rec: '<span class="vc-st-i"><i class="vc-st-dot vc-on"></i></span><span>Recording</span>',
    clone: '<span class="vc-st-i"><i class="qc-spin"></i></span><span>Cloning your voice <b class="vc-pct">0%</b></span>',
    done: `<span class="vc-st-i">${x.OK}</span><span>Voice cloned</span>`,
  };

  function render(t) {
    enter(node, t, T.card);
    // the line lights word by word as it is read
    READ.forEach(([, at], i) => { const on = t >= T.rec + at; if (on !== lit[i]) { words[i].classList.toggle('on', on); lit[i] = on; } });

    // the meter: the newest sample on the right, scrolling left while the take runs; frozen at the stop, then filled
    // white from the left as the clone runs
    const s = Math.min(t, T.stop) - T.rec, head = Math.floor(s * RATE);
    const cp = inOutCubic(seg(t, T.clone0, T.cloned));
    bars.forEach((b, i) => {
      const a = t < T.rec ? 0 : level((head - (BARS - 1 - i)) / RATE);
      const k = +Math.max(0.09, Math.min(1, a)).toFixed(3);
      if (k !== scale[i]) { b.style.transform = `scaleY(${k})`; scale[i] = k; }
      const w = t < T.rec ? false : t < T.stop ? true : (i + 0.5) / BARS <= cp;
      if (w !== white[i]) { b.classList.toggle('vc-on', w); white[i] = w; }
    });
    const c = Math.floor(clamp(s, 0, REC));
    if (c !== sec) { time.textContent = clock(c); sec = c; }

    // the record button: pressed in, its dot squares into a stop while the take runs and a ring pulses out of it; after
    // the stop it dims, its work done
    const p = Math.max(press(t, T.rec), press(t, T.stop));
    rec.style.transform = p > 0 ? `scale(${(1 - 0.1 * p).toFixed(4)})` : 'none';
    rec.style.opacity = lerp(1, 0.45, seg(t, T.stop + 0.1, T.stop + 0.4)).toFixed(3);
    const m = outCubic(seg(t, T.rec, T.rec + 0.18)) * (1 - outCubic(seg(t, T.stop, T.stop + 0.18)));
    dot.style.width = dot.style.height = `${lerp(14, 12, m).toFixed(2)}px`;
    dot.style.borderRadius = `${lerp(7, 3, m).toFixed(2)}px`;
    const recording = t >= T.rec && t < T.stop;
    const ph = recording ? ((t - T.rec) % 1.2) / 1.2 : 0;
    ring.style.opacity = recording ? ((1 - ph) * 0.6).toFixed(3) : '0';
    ring.style.transform = `scale(${(1 + 0.32 * ph).toFixed(4)})`;

    // the status pill
    const now = t < T.rec ? 'ready' : t < T.stop ? 'rec' : t < T.cloned ? 'clone' : 'done';
    if (now !== state) {
      st.innerHTML = FACE[now];
      pctN = st.querySelector('.vc-pct'); spin = st.querySelector('.qc-spin'); recDot = st.querySelector('.vc-on');
      state = now; pctShown = -1;
    }
    if (recDot) recDot.style.opacity = blink(t - T.rec, 1) ? '1' : '0.35';
    if (spin) spin.style.transform = `rotate(${((t - T.stop) * 420).toFixed(1)}deg)`;
    if (pctN) { const n = Math.round(cp * 100); if (n !== pctShown) { pctN.textContent = `${n}%`; pctShown = n; } }
  }
  return { node, rec, render };
}

// 2. the song: the dog song's strip, the superbot mark as cover, the lyrics under the row
function buildSong(x, T) {
  const node = x.el(`<div class="sg vc-song">
    <div class="sg-card">
      ${x.tile('superbot', 'vc-cover')}
      <div class="sg-side">
        <div class="sg-t"><b>${x.esc(TITLE)}</b><small>Sung in your voice</small></div>
        <div class="sg-row"><span class="sg-btn">${PLAY}${PAUSE}</span><div class="sg-wave">${wave('sg-w0')}${wave('sg-w1')}</div><span class="sg-time">${clock(0)} / ${clock(LEN_S)}</span></div>
      </div>
      <button type="button" class="sg-share" ${shareAttrs(`${TITLE}, a song in my voice`)}>${SHARE_GLYPH}</button>
      <span class="sg-dl" role="img" aria-label="Download">${DOWNLOAD}</span>
      <div class="vc-ly"><div class="vc-ly-in">${LYRICS.map((ln) => `<p>${ln.map(([w]) => `<span>${x.esc(w)}</span>`).join(' ')}</p>`).join('')}</div></div>
    </div>
  </div>`);
  const q = (s) => node.querySelector(s);
  const btn = q('.sg-btn'), time = q('.sg-time'), played = q('.sg-w1'), lyIn = q('.vc-ly-in');
  const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
  const sung = LYRICS.map((ln, i) => ln.map((_, j) => ({ el: lyIn.children[i].children[j], on: false })));
  let sec = -1, cut = -1, playing = null, lift = -1;
  // Space and Enter press the card's Share, not the spot's clock (timeline.9b47fc30.js), as on the other beats
  node.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button')) e.stopPropagation(); });

  function render(t) {
    enter(node, t, T.card2);
    const el = Math.max(0, t - T.play);
    const s = Math.floor(el);
    if (s !== sec) { time.textContent = `${clock(s)} / ${clock(LEN_S)}`; sec = s; }
    const c = +((1 - Math.min(1, el / LEN_S)) * 100).toFixed(3);
    if (c !== cut) { played.style.clipPath = `inset(0 ${c}% 0 0)`; cut = c; }
    const pr = seg(t, T.play - 0.12, T.play) * (1 - seg(t, T.play, T.play + 0.1));
    btn.style.transform = pr > 0 ? `scale(${(1 - 0.12 * pr).toFixed(4)})` : 'none';
    const isPlaying = t >= T.play;
    if (isPlaying !== playing) { playIcon.style.display = isPlaying ? 'none' : ''; pauseIcon.style.display = isPlaying ? '' : 'none'; playing = isPlaying; }

    // the lyrics: each word lights as it is sung; a line lifts away just before the next one starts
    const pt = t - T.play;
    LYRICS.forEach((ln, i) => ln.forEach(([, at], j) => { const w = sung[i][j], on = pt >= at; if (on !== w.on) { w.el.classList.toggle('on', on); w.on = on; } }));
    const y = LYRICS.slice(1).reduce((a, ln) => a + outCubic(seg(pt, ln[0][1] - 0.45, ln[0][1] - 0.1)), 0) * LH;
    const yy = +y.toFixed(2);
    if (yy !== lift) { lyIn.style.transform = yy ? `translateY(${-yy}px)` : 'none'; lift = yy; }
  }
  return { node, render };
}

// every time in the beat from its reply r
function plan(r) {
  const T = { r };
  T.card = r + 0.22;
  T.ptr = r + 0.7;    // the pointer comes in for the record button
  T.hov = r + 1.3;
  T.rec = r + 1.45;   // the record press: the take starts
  T.stop = T.rec + REC;
  T.away = T.stop + 0.9;
  T.clone0 = T.stop + 0.2;
  T.cloned = T.clone0 + CLONE;
  T.r2 = T.cloned + 0.35; // the second line
  T.card2 = T.r2 + 0.22;
  T.play = T.card2 + 0.6; // once the strip's entrance has settled
  T.end = T.play + PLAY_FOR;
  return T;
}
// the beat's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

export default {
  // `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra), so the run length is the router's call
  times(r, end) {
    const T = plan(r);
    if (end !== undefined) T.end = end;
    return T;
  },
  build(k, x) {
    loadFrameSheet();
    loadSheet(SONG_CSS, 'song strip');
    loadSheet(CSS, 'own');
    const T = k.T;
    const say1 = sayEl(x, SAY1), say2 = sayEl(x, SAY2, 'vc-say2');
    const sample = buildSample(x, T), song = buildSong(x, T);
    return {
      nodes: [say1.n, sample.node, say2.n, song.node],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, sample.node], [T.r2, say2.n], [T.card2, song.node]],
      render(t) {
        say1.render(t, T.r);
        sample.render(t);
        say2.render(t, T.r2);
        song.render(t);
      },
      // the user's pointer: in from the lower right onto the record button, a press; off it a little while the line is
      // read, back on it for the stop press, then away. In the section's px (x.box)
      pointer(t, toScr) {
        if (t < T.ptr || t > T.away) return null;
        const b = x.box(sample.rec);
        const on = toScr({ x: b.cx + 3, y: b.cy + 4 });
        const off = toScr({ x: b.cx + 130, y: b.cy + 96 });
        const rest = toScr({ x: b.cx + 22, y: b.cy + 26 });
        const at = path(t, [{ t: T.ptr, ...off }, { t: T.hov, ...on }, { t: T.rec + 0.5, ...on }, { t: T.rec + 1.2, ...rest },
          { t: T.stop - 0.6, ...rest }, { t: T.stop - 0.12, ...on }, { t: T.stop + 0.3, ...on }, { t: T.away, ...off }]);
        const v = seg(t, T.ptr, T.ptr + 0.15) * (1 - seg(t, T.away - 0.35, T.away));
        return { x: at.x, y: at.y, p: Math.max(press(t, T.rec), press(t, T.stop)), v };
      },
    };
  },
};
