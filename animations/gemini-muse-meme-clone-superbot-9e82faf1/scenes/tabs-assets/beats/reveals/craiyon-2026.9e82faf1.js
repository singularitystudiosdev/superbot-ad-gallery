// Craiyon (2026 redesign), craiyon.com's /en home composer (a screen recording on YouTube, qv_4jooSp7s, pub. 2026-07-29, t~56.25-68.0 s,
// plus a live DOM read of craiyon.com/en on 2026-10-15; spec .tmp/clone-9e82faf1/reveal-refs/craiyon-2026/spec.json, confidence 0.60;
// frames bg_cra26_t056.25 .. t068.00). A near-black page (#0B0D12) under a centred subtitle and a dark rounded composer card: the
// white bold prompt, a chip row (Reference | Public | Auto | Auto | Excluded), an attach icon top right and an orange circular up-arrow
// submit (aria-label 'Draw now'). There is no pending sentence at all. Pressing the submit leaves its label alone (it only dims) and
// two cues appear: a slim DETERMINATE fill along the composer card's own TOP edge (a dim orange-red band with a brighter orange head
// growing left to right) and, in the feed just below the card, a small dark rounded-square PENDING TILE (#1B1E26) carrying one very
// faint ~14 px indeterminate arc and nothing else (no caption, no percentage, no estimate). When the image is ready the tile gives
// way to the picture and a pill toast '✓ Image generated' appears at the bottom.
// Adapted to ten images: ten pending tiles in a 5 + 5 block under the card, left-aligned to it like the single tile of the footage, each
// handing over to its picture in strict reading order with everything in view and no scroll. The top-edge fill is a function of t that
// reaches its end at the last landing, the arcs turn from the same clock, and both are frozen there; the toast comes with the last
// picture. Differs from the built 'craiyon' (V3, 2024) in every part of the wait: no generation panel, no 'Estimated time' line, no
// 'Drawing...' relabel, the bar moved from a panel onto the composer's edge, the tiles pending in the feed instead of an empty grid.
// Omitted: 'Yearly 17% off', 'Priority queue', '× Generated images are public', the logo and left rail, the header chrome, the
// Grammarly badge and the recording's cursor highlight. Every tile is our own meme; no logo or platform font is drawn.
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-c26';
const ROOT_W = 560, ROOT_H = 372, COL_W = 432, COLS = 5, GAP = 8;
const TILE = (COL_W - (COLS - 1) * GAP) / COLS;   // 80: the footage's 102 px tile against its 540 px card, at this card's 432
const CSS = `
.${P} { position: relative; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; padding: 20px 0 0; border-radius: 12px; background: #0b0d12; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #171a21; }
.${P}-sub { flex: none; width: ${COL_W}px; height: 12px; font-size: 7.6px; line-height: 12px; text-align: center; color: #8a8f98; white-space: nowrap; overflow: hidden; }
.${P}-card { position: relative; flex: none; box-sizing: border-box; width: ${COL_W}px; height: 90px; margin-top: 14px; border-radius: 13px; background: #1c222e; overflow: hidden; }
.${P}-trk { position: absolute; left: 0; right: 0; top: 0; height: 2.6px; background: #8f3a1e; }
.${P}-fil { position: absolute; left: 0; top: 0; bottom: 0; width: 0%; background: linear-gradient(90deg, #c4321c 0%, #e8552a 60%, #ff9a45 100%); }
.${P}-tx { position: absolute; left: 12px; top: 15px; right: 40px; height: 14px; font-size: 11px; line-height: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.${P}-att { position: absolute; right: 13px; top: 14px; width: 11px; height: 11px; fill: none; stroke: #c9ccd3; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-chips { position: absolute; left: 10px; bottom: 14px; display: flex; align-items: center; gap: 12px; height: 12px; font-size: 8.4px; line-height: 12px; color: #8a8f98; white-space: nowrap; }
.${P}-chips span { display: flex; align-items: center; gap: 3.5px; }
.${P}-chips svg { flex: none; width: 9px; height: 9px; fill: none; stroke: #8a8f98; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-go { position: absolute; right: 11px; bottom: 10px; display: grid; place-items: center; width: 27px; height: 27px; border-radius: 50%; background: #e8552a; }
.${P}-go svg { width: 11px; height: 11px; fill: none; stroke: #ffffff; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-g { flex: none; display: grid; grid-template-columns: repeat(${COLS}, ${TILE}px); gap: ${GAP}px; width: ${COL_W}px; margin-top: 14px; }
.${P}-t { position: relative; width: ${TILE}px; height: ${TILE}px; border-radius: 11px; overflow: hidden; background: #1b1e26; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #1b1e26; }
.${P}-pd { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: grid; place-items: center; background: #1b1e26; box-shadow: inset 0 0 0 1px #20242d; border-radius: 11px; }
.${P}-arc { display: block; width: 11px; height: 11px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(168, 174, 186, 0) 0deg, rgba(168, 174, 186, .5) 40deg, rgba(168, 174, 186, .5) 250deg, rgba(168, 174, 186, 0) 290deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.1px)); mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.1px)); }
.${P}-toast { position: absolute; left: 50%; bottom: 14px; display: flex; align-items: center; gap: 6px; box-sizing: border-box; height: 26px; margin-left: -57px; width: 114px; padding: 0 10px; border-radius: 13px; background: #242936; box-shadow: 0 0 0 1px #313745; font-size: 8.8px; line-height: 12px; font-weight: 500; color: #ffffff; white-space: nowrap; }
.${P}-toast i { flex: none; display: grid; place-items: center; width: 11px; height: 11px; border-radius: 50%; background: #3fbf5f; }
.${P}-toast svg { width: 7px; height: 7px; fill: none; stroke: #ffffff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
`;

const PROMPT = 'Create the image of a muse holding up a handwritten note';
const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                               // the cursor presses the submit
const ISSUE = 0.14;                                // the ten pending tiles appear under the card and the edge starts to fill
const LAND = Array.from({ length: 10 }, (_, i) => 0.48 + i * (1.2 / 9));   // tile i hands over to its picture (strict reading order), the last at 1.68
const SPIN = 420;                                  // the arc's turn in degrees per layout second

const I = (body) => `<svg viewBox="0 0 12 12">${body}</svg>`;
const ICON_ATT = '<svg class="' + P + '-att" viewBox="0 0 12 12"><path d="M5.5 2H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6.5M2 8.5l2.4-2.4 1.8 1.8 1-1M9 1.5v3M7.5 3h3"/></svg>';
const ICON_REF = I('<path d="M5.5 2H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6.5M2 8.5l2.4-2.4 1.8 1.8 1-1M9 1.5v3M7.5 3h3"/>');
const ICON_LOCK = I('<rect x="2.5" y="5.2" width="7" height="5" rx="1.2"/><path d="M4 5.2V3.8a2 2 0 014 0v1.4"/>');
const ICON_PAL = I('<path d="M6 1.5a4.5 4.5 0 100 9c.9 0 1.2-.7.8-1.3-.5-.7-.1-1.5.8-1.5h.6A1.8 1.8 0 009.9 5.9 4.4 4.4 0 006 1.5z"/><path d="M3.8 6.2v.01M5 3.9v.01M7.2 3.9v.01"/>');
const ICON_FR = I('<path d="M1.8 4.2V2.4a.6.6 0 01.6-.6h1.8M7.8 1.8h1.8a.6.6 0 01.6.6v1.8M10.2 7.8v1.8a.6.6 0 01-.6.6H7.8M4.2 10.2H2.4a.6.6 0 01-.6-.6V7.8"/>');
const ICON_EYE = I('<path d="M1.5 6S3 3 6 3s4.5 3 4.5 3S9 9 6 9 1.5 6 1.5 6z"/><path d="M2 10L10 2"/>');
const ICON_UP = '<svg viewBox="0 0 12 12"><path d="M6 9.5V2.8M3 5.6l3-3 3 3"/></svg>';
const ICON_OK = '<svg viewBox="0 0 8 8"><path d="M1.6 4.2l1.6 1.6 3.2-3.4"/></svg>';

export default {
  id: 'craiyon-2026',
  label: 'Craiyon (2026 redesign)',
  source: {
    platform: "craiyon.com /en home composer (desktop Chrome, dark theme; a 1280x720 screen recording on YouTube, 2026-07-29, plus a live headless DOM read of the page on 2026-10-15)",
    feature: "dark page with a centred composer card (white bold prompt, chips Reference | Public | Auto | Auto | Excluded, attach icon, orange circular up-arrow submit 'Draw now' that only dims, never relabels); the determinate progress is a slim orange fill drawn along the card's TOP edge, a small dark rounded-square pending tile in the feed under the card carries one faint ~14 px indeterminate arc (no text, no percentage, no estimate); on completion the tile gives way to the picture and a pill toast '✓ Image generated' appears (adapted to 10: a 5 + 5 block of pending tiles under the card landing in strict reading order; the promo chips, the 'Generated images are public' line, the logo and the credits are omitted)",
    videoId: 'qv_4jooSp7s',
    capture: { url: 'https://www.youtube.com/watch?v=qv_4jooSp7s', date: '2026-07-29', timestamps: 'wait at t=56.25-68.0 s of the video: tile and top-edge band present at 56.25, fill advanced to ~60% by 65.0, finished image plus the toast at 68.0' },
    refs: [
      { url: 'https://www.youtube.com/watch?v=qv_4jooSp7s', published: '2026-07-29', retrieved: '2026-10-15', note: 'Generate Free Images with Craiyon AI; frames bg_cra26_t056.25 .. t068.00' },
      { url: 'https://www.craiyon.com/en', published: '2026-10-15', retrieved: '2026-10-15', note: 'live DOM read: composer chips and the circular submit with aria-label Draw now (the generate call is Turnstile-gated, so no live wait)' },
    ],
    extrapolated: [
      'ten pending tiles in a 5 + 5 block, all in view with no scroll, landing in strict reading order: the footage shows ONE tile under the composer and the finished image jumping to a full-bleed viewer, so the block, the order and the pace are ours',
      "the top-edge fill: the frames show the whole edge as a dim orange band with a brighter orange head at ~60% by t=65; the fill here is a plain linear sweep from the press to the last landing, then held full, which is not measured",
      'the hand-over of a tile to its picture is a hard swap (the footage went straight to the viewer, never showing the tile filling in)',
      "the toast '✓ Image generated' is shown from the last landing and held; the footage's toast fades after a moment",
      'the composer is drawn at 0.8 of the footage (432 px card, 80 px tiles) to fit the 560 px column; the chip glyphs are plain strokes, not the site icons, and the prompt is our own sentence',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'craiyon-2026');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div><div class="${P}-pd"><i class="${P}-arc"></i></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-sub">Create free AI images from text for art, photos, illustrations, and quick visual ideas.</div><div class="${P}-card"><div class="${P}-trk" style="visibility: hidden"><div class="${P}-fil"></div></div><div class="${P}-tx">${x.esc(PROMPT)}</div>${ICON_ATT}<div class="${P}-chips"><span>${ICON_REF}Reference</span><span>${ICON_LOCK}Public</span><span>${ICON_PAL}Auto</span><span>${ICON_FR}Auto</span><span>${ICON_EYE}Excluded</span></div><div class="${P}-go" role="button" aria-label="Draw now">${ICON_UP}</div></div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><div class="${P}-toast" style="display: none"><i>${ICON_OK}</i>Image generated</div></div>`);
    const go = root.querySelector(`.${P}-go`), trk = root.querySelector(`.${P}-trk`), fil = root.querySelector(`.${P}-fil`), grid = root.querySelector(`.${P}-g`), toast = root.querySelector(`.${P}-toast`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), pd: n.querySelector(`.${P}-pd`), arc: n.querySelector(`.${P}-arc`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: the edge fill and every arc hold there

        // the submit is pressed; its label never changes, it dims while the run is on and returns once the last picture has landed
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { go.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });
        const busy = s >= GEN_AT && s < LAND[9];
        put('busy', busy, (v) => { go.style.background = v ? '#a9512b' : ''; });

        // the composer's top edge: a dim band with a bright determinate fill growing from the left cap (linear in t, full and held at the last landing)
        put('trk', s >= GEN_AT, (v) => { trk.style.visibility = v ? '' : 'hidden'; });
        const w = (100 * seg(te, GEN_AT, LAND[9])).toFixed(2);
        put('fil', w, (v) => { fil.style.width = `${v}%`; });

        // the ten pending tiles appear under the card
        put('iss', s >= ISSUE, (v) => { grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a hard swap: the pending tile is replaced by the picture (the footage's hand-over was never sampled)
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; c.pd.style.display = v ? 'none' : ''; });
          // the arc turns with the wait's clock (its phase differs per tile), held at the last landing
          const deg = (((te * SPIN + i * 47) % 360) + 360) % 360;
          put(`a${i}`, deg.toFixed(0), (d) => { c.arc.style.transform = `rotate(${d}deg)`; });
        });

        // the toast comes with the last picture
        put('toast', s >= LAND[9], (v) => { toast.style.display = v ? '' : 'none'; });
      },
    };
  },
};
