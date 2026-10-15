// Designs.ai's Logo Maker, designs.ai/logomaker/start/create (YouTube N6hZm1XwePo 'How to Use Ai Logo Maker on Designs Ai [easy]',
// Tech Info, 2024-08-23, t=97.5-107.5 s; spec .tmp/clone-9e82faf1/reveal-refs/designs-ai/spec.json, confidence 0.55; frames
// au_designsai_098_generating.png, au_designsai_100_generating.png, au_designsai_103_generating.png, au_designsai_104_generating.png,
// au_designsai_108_results.png). The wizard's last step is a mostly empty white page: '< Back' at the top left and a 'Next ->'
// button at the top right, a thin orange-to-purple gradient bar under the header (the wizard's own progress bar, filled about three
// quarters), the centred heading 'Choose up to 5 best propositions' over the grey subtitle 'Pick one to start editing. We recommend
// to pick more to save for later.', and, in the middle of the otherwise blank grid, one loader around the designs.ai mark with the literal word
// 'Generating...' under it. The loader changes over the wait (frames at t=100 and t=104): first a thick sage-green solid arc (about #6A9E84,
// roughly 150 degrees) sweeping round the mark, then a ring of about eleven separate raspberry-pink (about #DD4D78) segments all the way
// around it. The ring is about 215 px across in the 1920-wide frame, i.e. about 63 px at this block's 560 px, its stroke about 6.5 px. There are no placeholder tiles, no percentage
// and no countdown, and the caption does not change; after ~10 s the propositions land in the same grid.
// Adapted to ten images: the loader holds the empty grid, then ten propositions (4 + 4 + 2) land one after another in strict
// reading order (the footage shows six, three across, landing together). The mark inside the ring is replaced by a neutral dot.
// Omitted: the Windows browser chrome and taskbar of the capture, and every plan / credit chrome. The footage's logos are never
// reproduced: every proposition is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-dsa';
const ROOT_H = 392, COLS = 4, GAP = 12, GRID_H = 246;
const RING = 62, STROKE = 6.5, ARC = 150, SEGS = 11, SEG = 23;   // ring size and stroke (px), the green arc's length, the pink ring's segment count and each segment's length (degrees)
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; overflow: hidden; border-radius: 10px; background: #fff; color: #2d2d45; font-family: ${UI_FONT}; }
.${P}-top { flex: none; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 40px; padding: 0 22px; }
.${P}-bk { display: flex; align-items: center; gap: 4px; font-size: 8px; color: #2d2d45; }
.${P}-bk svg, .${P}-nx svg { width: 8px; height: 8px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-nx { display: flex; align-items: center; justify-content: center; gap: 4px; box-sizing: border-box; width: 52px; height: 19px; border-radius: 4px; background: #f1f1f4; font-size: 8px; color: #9a9aa8; }
.${P}-bar { flex: none; position: relative; height: 3px; background: #eeeef3; }
.${P}-bar i { position: absolute; left: 0; top: 0; bottom: 0; width: 75%; background: linear-gradient(90deg, #f9bd96, #e58fb0 48%, #9a63e0); }
.${P}-ttl { flex: none; margin-top: 22px; text-align: center; font-size: 14px; font-weight: 600; line-height: 20px; color: #2d2d45; }
.${P}-sub { flex: none; margin-top: 6px; text-align: center; font-size: 7.5px; line-height: 12px; color: #4b4b60; }
.${P}-area { position: relative; flex: none; height: ${GRID_H}px; margin: 24px 40px 0; }
.${P}-g { position: absolute; left: 0; right: 0; top: 0; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 3 / 2; border-radius: 5px; overflow: hidden; background: #fff; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cover { position: absolute; inset: 0; background: #fff; }
.${P}-ld { position: absolute; left: 0; right: 0; top: 50%; display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: -44px; }
.${P}-ringw { position: relative; width: ${RING}px; height: ${RING}px; }
.${P}-ring { position: absolute; inset: 0; border-radius: 50%; -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - ${STROKE}px), #000 calc(100% - ${STROKE - 0.5}px)); mask: radial-gradient(farthest-side, transparent calc(100% - ${STROKE}px), #000 calc(100% - ${STROKE - 0.5}px)); }
.${P}-ring.${P}-sw { background: conic-gradient(from 0deg, rgba(106, 158, 132, 0) 0deg, #6a9e84 3deg, #6a9e84 ${ARC}deg, rgba(106, 158, 132, 0) ${ARC + 1}deg); }
.${P}-ring.${P}-sg { background: repeating-conic-gradient(from 0deg, #dd4d78 0deg ${SEG}deg, rgba(221, 77, 120, 0) ${SEG}deg ${360 / SEGS}deg); }
.${P}-dot { position: absolute; left: 50%; top: 50%; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; border-radius: 50%; background: #a9afc2; }
.${P}-ld span { display: block; font-size: 8.5px; line-height: 12px; color: #3f3f55; white-space: nowrap; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 0.9 + i * 0.0867);   // proposition i lands (reading order), the last at 1.68
const FADE = 0.05;                                 // the cover over a proposition thins away over this long as it lands
const SPIN = 420, SPIN2 = 150;                     // the green arc's and the pink ring's turn, in degrees per second
const SWAP = 0.42;                                 // the solid green sweep gives way to the segmented pink ring
const ARROW_L = '<svg viewBox="0 0 12 12"><path d="M10 6H2.5"/><path d="M5.5 2.5L2 6l3.5 3.5"/></svg>';
const ARROW_R = '<svg viewBox="0 0 12 12"><path d="M2 6h7.5"/><path d="M6.5 2.5L10 6 6.5 9.5"/></svg>';

export default {
  id: 'designs-ai',
  label: 'Designs.ai Logomaker (2024)',
  source: {
    platform: 'Designs.ai Logo Maker, designs.ai/logomaker (desktop browser; a tutorial screen recording on YouTube, 2024-08-23, captured 2024-08-11)',
    feature: "white wizard page: '< Back' and 'Next ->' top corners, a thin orange-to-purple gradient bar under the header, the heading 'Choose up to 5 best propositions' over 'Pick one to start editing. We recommend to pick more to save for later.', and in the empty grid one centred loader, a turning 3/4 arc with the literal 'Generating...' under it (no placeholder tiles, no percentage, no countdown); the propositions then land in the same grid (adapted to 10: a 4 + 4 + 2 grid landing in reading order; the designs.ai mark inside the ring is replaced by a neutral dot, and the browser chrome is omitted)",
    refs: [{ url: 'https://www.youtube.com/watch?v=N6hZm1XwePo', id: 'N6hZm1XwePo', published: '2024-08-23', retrieved: '2026-10-14', window: 't=97.5-107.5 s' }],
    extrapolated: [
      'ten propositions in a 4 + 4 + 2 grid landing one after another in strict reading order (extrapolated from six, three across, landing together in the footage)',
      "the gradient bar's pair of end colours (the loader's own colours are sampled from the frames: sage green ~#6A9E84 at t=100, raspberry pink ~#DD4D78 at t=104)",
      "the loader's two stages and their change-over moment (the frames at t=100 and t=104 show a solid green sweep and a segmented pink ring; the switch point, the turn speeds and the 150 degree arc length are read from two stills)",
      'the orange arc fragment of the first wait frame (t=98) is left out: only the green sweep and the pink ring are drawn',
      'the neutral dot in the ring, in place of the designs.ai mark (left out on purpose)',
      "the cover's quick fade as each proposition lands (the footage hard-swaps six tiles at full opacity)",
      'the propositions themselves (the footage shows Freelance Ace logo cards, never reproduced)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'designs-ai');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cover"></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-top"><div class="${P}-bk">${ARROW_L}Back</div><div class="${P}-nx">Next${ARROW_R}</div></div><div class="${P}-bar"><i></i></div><div class="${P}-ttl">Choose up to 5 best propositions</div><div class="${P}-sub">Pick one to start editing. We recommend to pick more to save for later.</div><div class="${P}-area"><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><div class="${P}-ld"><div class="${P}-ringw"><i class="${P}-ring ${P}-sw"></i><i class="${P}-ring ${P}-sg" style="display: none"></i><i class="${P}-dot"></i></div><span>Generating...</span></div></div></div>`);
    const grid = root.querySelector(`.${P}-g`), ld = root.querySelector(`.${P}-ld`), sweep = root.querySelector(`.${P}-sw`), segs = root.querySelector(`.${P}-sg`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cover: n.querySelector(`.${P}-cover`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.min((t - ctx.cardIn) / k, LAND[9]);   // layout seconds since the card entered; what moves from t stops at the last landing

        // the loader holds the empty grid until the first proposition starts to land
        const landing = s >= LAND[0] - FADE;
        put('ld', landing, (v) => { ld.style.display = v ? 'none' : ''; grid.style.visibility = v ? '' : 'hidden'; });
        // the green solid arc sweeps first, then the segmented pink ring turns; both from t, frozen once the last proposition has landed
        const pink = s >= SWAP;
        put('sw', pink, (v) => { sweep.style.display = v ? 'none' : ''; segs.style.display = v ? '' : 'none'; });
        const deg = (((Math.max(0, s) * SPIN) % 360) + 360) % 360, deg2 = (((Math.max(0, s - SWAP) * SPIN2) % 360) + 360) % 360;
        put('rg', deg.toFixed(0), (d) => { sweep.style.transform = `rotate(${d}deg)`; });
        put('rp', deg2.toFixed(0), (d) => { segs.style.transform = `rotate(${d}deg)`; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.cover.style.display = 'none'; c.cover.style.opacity = ''; } else { c.cover.style.display = ''; c.cover.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
        });
      },
    };
  },
};
