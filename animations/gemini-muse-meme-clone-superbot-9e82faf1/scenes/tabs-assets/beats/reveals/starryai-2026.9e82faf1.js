// StarryAI (2026 web app): the 'Painting In Progress' pending tile, read from starryai.com's own shipping code rather than from a screen recording
// (the creation-page chunk /app/_next/static/chunks/2s3kd12pf58ut.js, saved as reveal-refs/starryai-2026/app-chunk.s26.js, plus the pending state's own
// artwork and Lottie files on r2.starryai.com, retrieved 2026-10-15; the assets sit under an upload path dated 2024-09-11; spec
// .tmp/clone-9e82faf1/reveal-refs/starryai-2026/spec.json, confidence 0.60, no screen capture: ROOT RULING, first-party code is primary documentation).
// The bundle maps CreationStatus to components inside an ImgContainer sized h-[500px] w-[450px] (rounded-md, bg-black/40): SUBMITTED draws the
// full-bleed mesh-gradient illustration (object-fit cover) under a centred column of a 48 px looping Lottie CLOCK (two white hands in a ring), the bold
// line 'In Queue' and 'Your creation is in line for processing.'; IN_PROGRESS draws the SAME illustration under a 50 px looping Lottie PAINT ROLLER (a
// white roller stroked in a frame that rolls down and back up a column of white paint) with the bold 'Painting In Progress' over 'Your creation is in
// line for processing.' (text-lg font-bold / text-base font-medium, white, gap-4, the column centred in the tile); FAILED and COMPLETED are other
// components. There is no percentage, no timer, no prompt caption and no progress bar; the page around the tile is light with grey rounded skeletons.
// Adapted to ten images: ten 450 x 500 tiles scaled to 100 x 111 in a 5 x 2 block, all in view with no scroll. Every tile starts as SUBMITTED (the clock),
// turns to IN_PROGRESS (the roller) in reading order, and then hands over to its picture in strict reading order. The illustration is redrawn here as
// our own CSS radial gradients fitted to the colours of the saved artwork (violet left, teal top right, coral bottom right, indigo corners); the two
// Lottie glyphs are redrawn as our own SVG from the layer JSON (geometry, white 2 px strokes, keyframes and the cubic-bezier .75/0/.67/1 easing) and
// turned from t. Neither their PNG nor their Lottie nor any player is loaded. Differs from the built 'starryai' (2023: grey radial tile, white twelve-dot
// spinner, prompt caption, no status text) in the placeholder, the status text and the stages. Omitted: the logo, the sidebar and top bar, the
// credits and plan chrome, the login modal. Every picture is OUR meme, system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-s26';
const ROOT_W = 560, PAD = 14, COLS = 5, GAP = 8, TILE_W = 100, TILE_H = 111;   // 450 x 500 at 0.2222, the 5 columns filling the 560 root to its padding
const ROOT_H = PAD * 2 + TILE_H * 2 + GAP;
// the mesh gradient: radial blobs fitted (least squares on a 90 x 100 render) to the saved 1386 x 1372 artwork as the 450 x 500 cover crop
const MESH = 'radial-gradient(ellipse 54.3% 41.2% at 65.1% 18%, #5bb88a 0%, rgba(91, 184, 138, 0) 100%), radial-gradient(ellipse 36.2% 50.3% at 84.5% 69.9%, #e24023 0%, rgba(226, 64, 35, 0) 100%), radial-gradient(ellipse 50.3% 61.7% at 3.4% 60.4%, #ae45ea 0%, rgba(174, 69, 234, 0) 100%), radial-gradient(ellipse 40.3% 27.5% at 25.1% 96.5%, #3600b4 0%, rgba(54, 0, 180, 0) 100%), radial-gradient(ellipse 48.7% 23.5% at 8.7% 3.3%, #3a07b9 0%, rgba(58, 7, 185, 0) 100%), radial-gradient(ellipse 34.3% 28% at 50.6% 86.2%, #771290 0%, rgba(119, 18, 144, 0) 100%), #6f47aa';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; padding: ${PAD}px; border-radius: 12px; background: #ffffff; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 4px; overflow: hidden; background: #5f3fb0; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #5f3fb0; }
.${P}-pd { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: ${MESH}; }
.${P}-st { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; }
.${P}-gl { flex: none; display: block; width: 24px; height: 24px; overflow: visible; }
.${P}-gl * { fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-gl .${P}-fill { fill: #ffffff; stroke: none; }
.${P}-tx { display: flex; flex-direction: column; align-items: center; width: 86px; }
.${P}-h { margin: 0; font-size: 7px; line-height: 9.5px; font-weight: 700; color: #ffffff; white-space: nowrap; }
.${P}-s { margin: 0; font-size: 5.6px; line-height: 7px; font-weight: 500; color: #ffffff; }
.${P}-st.${P}-q .${P}-s { font-size: 4.9px; line-height: 6.4px; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ISSUE = 0.1;                                 // the ten tiles appear, all SUBMITTED ('In Queue', the clock)
const PROG = Array.from({ length: 10 }, (_, i) => 0.34 + i * 0.04);       // tile i turns IN_PROGRESS ('Painting In Progress', the roller), in reading order
const LAND = Array.from({ length: 10 }, (_, i) => 0.62 + i * (1.06 / 9));  // tile i hands over to its picture (strict reading order), the last at 1.68
const SPEED = 1.5;                                 // layout seconds -> Lottie seconds: the 2 s roller and 4 s clock loops both turn over inside the beat

// the Lottie keyframes' easing, cubic-bezier(.75, 0, .67, 1), solved for y at x by bisection
const ease = (x) => {
  let lo = 0, hi = 1, u = x;
  for (let k = 0; k < 32; k++) {
    u = (lo + hi) / 2;
    const cx = 3 * (1 - u) * (1 - u) * u * 0.75 + 3 * (1 - u) * u * u * 0.67 + u * u * u;
    if (cx < x) lo = u; else hi = u;
  }
  return 3 * (1 - u) * u * u + u * u * u;
};
const n2 = (v) => v.toFixed(2);

// the roller loop (layer JSON 'Paint Roller', 48 x 65, 120 frames at 60 fps): the frame holds the roller's y 24 -> 41 -> 24, its paint's y-scale 100% -> 4% -> 100%,
// and the wall strip's matte height (the mask solid's y-scale 5.867% -> 32.867% -> 4.867%), all on the same easing
function roller(frame) {
  const f = ((frame % 120) + 120) % 120, down = f < 60, u = ease((f % 60) / 60);
  const ry = down ? 24 + 17 * u : 41 - 17 * u;
  const ps = down ? 1 - 0.96 * u : 0.04 + 0.96 * u;
  const m = down ? 5.867 + 27 * u : 32.867 - 28 * u;
  const bottom = -0.682 + (65.138 * m) / 100;       // the matte's lower edge; the strip (x 11.5..41.5, top 3.891, round 2 px) shows down to it
  const wall = bottom > 5.9 ? `M11.5 ${n2(Math.min(bottom, 20.891))}V5.891A2 2 0 0 1 13.5 3.891H39.5A2 2 0 0 1 41.5 5.891V${n2(Math.min(bottom, 20.891))}Z` : '';
  return { ry: n2(ry), pTop: n2(-8.812 - 12.062 * ps), pH: n2(12 * ps), wall };
}
// the clock loop (layer JSON 'Clock', 48 x 48, 240 frames): the hour hand turns 360 deg and the minute hand 720 deg, linearly
const clockDeg = (frame) => { const f = ((frame % 240) + 240) % 240; return { h: n2((f / 240) * 360), m: n2((f / 240) * 720) }; };

const GL_CLOCK = `<svg class="${P}-gl ${P}-ck" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23"/><circle cx="24" cy="24" r="3"/><g class="${P}-hh" transform="rotate(0 23.992 24.051)"><path d="M23.937 12.798V20.798"/></g><g class="${P}-mh" transform="rotate(0 24 24.006)"><path d="M36.466 36.329L26.58 26.445"/></g></svg>`;
const GL_ROLL = `<svg class="${P}-gl ${P}-rl" viewBox="0 0 48 65" style="width: 17.8px; height: 24px"><path class="${P}-fill ${P}-wl" d=""/><g class="${P}-rg" transform="translate(24 24)"><rect class="${P}-fill ${P}-pt" x="-14.5" y="-20.874" width="34" height="12"/><rect x="-1.5" y="4" width="8" height="17"/><path d="M-19.5 -15V-5C-19.5 -3.895 -18.605 -3 -17.5 -3H0.5C1.605 -3 2.5 -2.105 2.5 -1V4"/><rect x="-14.5" y="-21" width="34" height="12" rx="2"/></g></svg>`;

export default {
  id: 'starryai-2026',
  label: 'StarryAI (2026)',
  source: {
    platform: "starryai.com web app (Next.js; the creation page /app/create/art), read from its first-party shipping code on 2026-10-15: the creation-page chunk /app/_next/static/chunks/2s3kd12pf58ut.js (saved as reveal-refs/starryai-2026/app-chunk.s26.js) and the pending state's own artwork and Lottie files on r2.starryai.com (upload path dated 2024-09-11). No screen capture: generation is login-gated (reCAPTCHA modal, GraphQL 403 when anonymous).",
    feature: "a pending creation is an ImgContainer h-[500px] w-[450px] holding a full-bleed soft mesh-gradient illustration (violet, teal, coral; object-fit cover) under a centred column: a small looping Lottie (a clock on 'In Queue' while SUBMITTED; a paint roller on 'Painting In Progress' while IN_PROGRESS) and white text 'Your creation is in line for processing.'; no percentage, no timer, no prompt caption (adapted to 10: ten scaled tiles in a 5 x 2 block, SUBMITTED then IN_PROGRESS then the picture, in reading order)",
    capture: { url: 'https://starryai.com/app/_next/static/chunks/2s3kd12pf58ut.js', date: '2026-10-15', timestamps: 'no video: the render instructions are read from the bundle (components Submitted and InProgress / the IN_PROGRESS case), the strings verbatim; artwork painting-in-progress.png (1386 x 1372), Lottie painting-in-progress.lottie.json (Paint Roller, 48 x 65, 60 fps, 120 frames) and in-queue.lottie.json (Clock, 48 x 48, 240 frames)' },
    refs: [
      { url: 'https://starryai.com/app/create/art', published: '2026-10-15', retrieved: '2026-10-15', note: 'live page: composer behind a login modal; the app chunk s26.js carries the pending-state components (ImgContainer 450 x 500, strings, asset URLs)' },
      { url: 'https://r2.starryai.com/public/uploads/2024-09-11/b34ebe10-2b24-4649-85df-bf0413981109.png', published: '2024-09-11', retrieved: '2026-10-15', note: 'the pending illustration (a mesh gradient); only its colours were read, it is not shipped or linked' },
      { url: 'https://r2.starryai.com/public/uploads/2024-09-11/0c924084-9f57-4f1b-98ab-593fb87ee81e.json', published: '2024-09-11', retrieved: '2026-10-15', note: 'the IN_PROGRESS Lottie (Paint Roller); its layers were redrawn as our own SVG, not embedded' },
      { url: 'https://r2.starryai.com/public/uploads/2024-09-11/41bc761e-8923-40cb-9791-a788c9b336be.json', published: '2024-09-11', retrieved: '2026-10-15', note: 'the SUBMITTED Lottie (Clock); redrawn as our own SVG' },
    ],
    extrapolated: [
      'all timing: the bundle carries no durations. The queue (SUBMITTED) phase, the stagger of the ten tiles into IN_PROGRESS and the pace of the ten hand-overs are ours; the beat is the shared 1.84 s window',
      'ten tiles in a 5 x 2 block, all in view with no scroll, landing in strict reading order: the app lays creations out in a column-density grid; its own code hides the status text at more than 4 columns or on narrow screens, which we keep showing at 5 columns',
      "the tiles are the 450 x 500 ImgContainer scaled to 100 x 111 (0.222), the glyphs at 24 px and the text at 7 / 5.6 px instead of their true scale, so that the strings stay legible; the text block is 86 px wide (the app's 290 px of 450)",
      'the Lottie loops are played at 1.5 x so a full roller / clock turn happens inside the beat (real periods: roller 2 s, clock 4 s), each tile starting its loop when its own state begins, and are frozen at the last landing',
      'the mesh gradient is a six-blob CSS fit (RMSE about 3.5%) to the saved artwork, without its film grain; the page behind the tiles is plain white (the app is light, with grey skeletons while loading, which are not drawn)',
      'the hand-over of a tile to its picture is a hard swap (the bundle swaps the component for the image when the status is COMPLETED)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'starryai-2026');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div><div class="${P}-pd"><div class="${P}-st ${P}-q">${GL_CLOCK}<div class="${P}-tx"><p class="${P}-h">In Queue</p><p class="${P}-s">Your creation is in line for processing.</p></div></div><div class="${P}-st ${P}-p" style="display: none">${GL_ROLL}<div class="${P}-tx"><p class="${P}-h">Painting In Progress</p><p class="${P}-s">Your creation is in line for processing.</p></div></div></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div></div>`);
    const grid = root.querySelector(`.${P}-g`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({
      im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), pd: n.querySelector(`.${P}-pd`), q: n.querySelector(`.${P}-q`), p: n.querySelector(`.${P}-p`),
      hh: n.querySelector(`.${P}-hh`), mh: n.querySelector(`.${P}-mh`), rg: n.querySelector(`.${P}-rg`), pt: n.querySelector(`.${P}-pt`), wl: n.querySelector(`.${P}-wl`),
    }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the loops' clock stops at the last landing: every glyph holds there

        put('iss', s >= ISSUE, (v) => { grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i], prog = s >= PROG[i];
          // SUBMITTED until PROG[i], IN_PROGRESS until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done ? 2 : prog ? 1 : 0, (v) => {
            c.im.style.visibility = v === 2 ? '' : 'hidden';
            c.cv.style.display = v === 2 ? 'none' : '';
            c.pd.style.display = v === 2 ? 'none' : '';
            c.q.style.display = v === 0 ? '' : 'none';
            c.p.style.display = v === 1 ? '' : 'none';
          });
          // the glyphs turn from t, each from the moment its own state began
          const ck = clockDeg((te - ISSUE) * 60 * SPEED);
          put(`h${i}`, ck.h, (d) => { c.hh.setAttribute('transform', `rotate(${d} 23.992 24.051)`); });
          put(`m${i}`, ck.m, (d) => { c.mh.setAttribute('transform', `rotate(${d} 24 24.006)`); });
          const rl = roller((te - PROG[i]) * 60 * SPEED);
          put(`r${i}`, rl.ry, (v) => { c.rg.setAttribute('transform', `translate(24 ${v})`); });
          put(`pt${i}`, `${rl.pTop}|${rl.pH}`, () => { c.pt.setAttribute('y', rl.pTop); c.pt.setAttribute('height', rl.pH); });
          put(`w${i}`, rl.wall, (d) => { c.wl.setAttribute('d', d); });
        });
      },
    };
  },
};
