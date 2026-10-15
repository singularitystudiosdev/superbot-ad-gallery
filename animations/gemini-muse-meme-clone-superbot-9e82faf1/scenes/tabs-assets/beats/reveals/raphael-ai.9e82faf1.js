// Raphael AI's inline image generator (raphael.app, home page), first-hand headless-Chrome capture 1280x800 on 2026-10-15 (spec
// .tmp/clone-9e82faf1/reveal-refs/raphael-ai/spec.json, confidence 0.55; frames be_raph_idle.png, be_raph_queue_37s.png,
// be_raph_queue_44s.png, be_raph_almostdone_62s.png, be_raph_settled_66s.png). A dark warm-brown page (#201913): the echoed prompt,
// a chip row ('Text to Image' in blue, the model chip 'Seedream 3.5', '1:1 · 0.5K · Low · x2') and a 2-up grid of result tiles,
// with a rounded prompt bar floating at the bottom whose send glyph becomes a ring spinner while the batch runs. Each pending tile
// is a flat #2A231A rounded square, no border, no shimmer: centred in it an amber (#CC905C) open-ring spinner, the word
// 'Generating', the live line 'In queue · about Ns left' and a thin determinate bar (amber fill on a #3D372E track). The number ticks
// down once a second from 60 and the bar is 1 - N/60 of the track; at 0 the line is replaced in place by 'Almost done...' with the
// bar full, the spinner still turning, and the finished picture replaces the placeholder in a hard swap (no cross-fade). The first
// tile landed at t=61.5 s, the second only at ~115 s.
// Adapted to ten images: ten tiles in a 5 + 5 block, every tile on its own 60 s countdown scaled into the beat (the countdowns run
// out one after another and the tiles land in strict reading order, each a hard swap). Spinner, counters and bars are computed from t
// and frozen at the last landing. Omitted: the logo and navigation, the promo banners and the 'Current results are temporary' notice,
// the in-tile 'Sign in for faster' line, the pricing and credit chrome and the action pills under the grid. The footage's pictures
// are never reproduced: every tile is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-rph';
const ROOT_H = 326, COLS = 5, GAP = 3;
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; padding: 14px 16px 14px; border-radius: 12px; background: #201913; color: #f0ebe4; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #34291f; }
.${P}-q { flex: none; height: 12px; font-size: 7.5px; line-height: 12px; color: #f2eee8; white-space: nowrap; overflow: hidden; }
.${P}-chips { flex: none; display: flex; align-items: center; gap: 3px; height: 14px; margin-top: 5px; }
.${P}-chips span { box-sizing: border-box; display: flex; align-items: center; height: 13px; padding: 0 4px; border-radius: 3px; background: #2d2721; font-size: 5.8px; color: #88827a; white-space: nowrap; }
.${P}-chips .${P}-ty { background: #242935; box-shadow: inset 0 0 0 1px #293b5c; color: #60a5fa; }
.${P}-sz { visibility: hidden; }
.${P}-g { flex: none; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; margin-top: 8px; }
.${P}-t { position: relative; aspect-ratio: 1; border-radius: 5px; overflow: hidden; background: #2a231a; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #2a231a; }
.${P}-pd { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #2a231a; }
.${P}-sk { display: block; width: 12px; height: 12px; }
.${P}-sk svg { display: block; width: 12px; height: 12px; fill: none; stroke: #cc905c; stroke-width: 1.5; stroke-linecap: round; }
.${P}-gn { margin-top: 7px; font-size: 6.2px; line-height: 9px; color: #a3988f; white-space: nowrap; }
.${P}-ln { margin-top: 7px; font-size: 6.2px; line-height: 9px; color: #a3988f; white-space: nowrap; }
.${P}-bar { position: relative; width: 84%; height: 2px; margin-top: 4px; background: #3d372e; }
.${P}-bar u { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: #cc905c; }
.${P}-pb { position: relative; flex: none; display: flex; align-items: center; gap: 7px; box-sizing: border-box; height: 30px; margin-top: auto; padding: 0 5px 0 5px; border-radius: 15px; background: #4a3d32; box-shadow: inset 0 0 0 1px #5b4a3b; }
.${P}-pp { flex: none; display: grid; place-items: center; box-sizing: border-box; width: 20px; height: 20px; border-radius: 5px; background: #3b3027; box-shadow: inset 0 0 0 1px #6a5744; color: #b68355; font-size: 11px; line-height: 11px; }
.${P}-pt { flex: 1; min-width: 0; font-size: 7.2px; color: #edeade; white-space: nowrap; overflow: hidden; }
.${P}-go { flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #8c6648; }
.${P}-go svg { display: block; width: 11px; height: 11px; fill: none; stroke: #f4e6d6; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-go .${P}-ar { display: none; }
.${P}-s2 .${P}-go { background: #cc905c; }
.${P}-s2 .${P}-go .${P}-ar { display: block; }
.${P}-s2 .${P}-go .${P}-rg { display: none; }
`;

const PROMPT = 'a muse holding up a handwritten note in a lecture hall, meme style';
const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ISSUE = 0.14;                               // the batch is submitted: ten tiles appear, every one at 'about 60s left'
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * 0.0644);        // tile i's picture replaces the placeholder (strict reading order), the last at 1.68
const ALMOST = 0.12;                              // 'Almost done...' shows this long before the swap
const ZERO = LAND.map((a) => a - ALMOST);         // tile i's countdown reaches 0
const NOW = (s, i) => Math.ceil(60 * (1 - seg(s, ISSUE, ZERO[i])) - 1e-9);   // seconds left: 60 .. 0, ticking down in step with t
const ARC = '<svg viewBox="0 0 12 12"><path d="M6 1.2a4.8 4.8 0 1 1-4.8 4.8"/></svg>';
const SEND = `<svg class="${P}-rg" viewBox="0 0 12 12"><path d="M6 1.4a4.6 4.6 0 1 1-4.6 4.6"/></svg><svg class="${P}-ar" viewBox="0 0 12 12"><path d="M6 10V2.6M2.8 5.6L6 2.4l3.2 3.2"/></svg>`;

export default {
  id: 'raphael-ai',
  label: 'Raphael AI (2026)',
  source: {
    platform: "Raphael AI, raphael.app home page (the generator lives inline on the landing page), desktop Chrome 1280x800, dark theme; first-hand headless-Chrome capture, two 120 s runs, ~300 frames plus DOM dumps, 2026-10-15 (no account, no login, no captcha)",
    feature: "flat #2A231A rounded tiles, each with an amber open-ring spinner, 'Generating', the live line 'In queue · about Ns left' and a thin determinate bar (fill = 1 - N/60) under it; at 0 the line is replaced by 'Almost done...' with the bar full, and the finished picture replaces the placeholder in a hard swap; a floating prompt bar below whose send glyph is a ring spinner while the batch runs (adapted to 10: a 5 + 5 block, every tile on its own countdown, landing in reading order; the logo, banners, notice bar, 'Sign in for faster' line and pricing chrome are omitted)",
    capture: { url: 'https://raphael.app/', date: '2026-10-15', timestamps: "press t=0; 'about 60s left' t=0.8 s; 'about 23s left' t=37.0 s; 'about 15s left' t=45.2 s; first picture t=61.5 s with the second tile reading 'Almost done...'; second picture t=115.5 s" },
    refs: [{ url: 'https://raphael.app/', published: '2026-10-15', retrieved: '2026-10-15', note: 'first-hand capture, 120 s runs, spec .tmp/clone-9e82faf1/reveal-refs/raphael-ai/spec.json' }],
    extrapolated: [
      "ten tiles in a 5 + 5 block, all in view with no scroll: the footage is a 2-up batch (x2) of 262 px tiles under a long scrolling page",
      "each tile's own countdown: in the footage both tiles share one batch number and the first lands at 61.5 s, the second only at ~115 s; here every tile counts 60 down to 0 on its own clock, compressed into the beat, runs out one after another and lands in strict reading order",
      "the landing itself: a hard swap of placeholder for picture, as the footage's first tile did; the swap's picture is our own meme and the hover download glyph and the action pills ('Img to Img', 'Img to Vid', 'Lip Sync') are not drawn",
      "the prompt bar's end state: its send glyph returns as an arrow once the last picture has landed (the footage's bar is back at an arrow when the batch settles); the 640x640 chip appears with the first landing, as in the footage",
      "the chip row's trailing date-time chip and the chip text 'x10' (the footage reads 'x2')",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'raphael-ai');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div><div class="${P}-pd"><i class="${P}-sk">${ARC}</i><div class="${P}-gn">Generating</div><div class="${P}-ln"></div><div class="${P}-bar"><u></u></div></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-q">${x.esc(PROMPT)}</div><div class="${P}-chips"><span class="${P}-ty">Text to Image</span><span>Seedream 3.5</span><span>1:1 · 0.5K · Low · x10</span><span class="${P}-sz">640x640</span></div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><div class="${P}-pb"><div class="${P}-pp">+</div><div class="${P}-pt">${x.esc(PROMPT)}</div><div class="${P}-go">${SEND}</div></div></div>`);
    const sz = root.querySelector(`.${P}-sz`), grid = root.querySelector(`.${P}-g`), go = root.querySelector(`.${P}-go .${P}-rg`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), pd: n.querySelector(`.${P}-pd`), sk: n.querySelector(`.${P}-sk`), ln: n.querySelector(`.${P}-ln`), fill: n.querySelector(`.${P}-bar u`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: spinners, counters and bars hold there

        // the batch is submitted: the ten tiles appear; the prompt bar's glyph is a ring spinner until the last picture lands
        put('iss', s >= ISSUE, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('stage', s >= LAND[9], (v) => { root.className = `${P}${v ? ` ${P}-s2` : ''}`; });
        put('go', (te * 420 % 360).toFixed(0), (d) => { go.style.transform = `rotate(${d}deg)`; });
        put('sz', s >= LAND[0], (v) => { sz.style.visibility = v ? 'visible' : ''; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const tt = Math.min(s, a), done = s >= a;
          // a hard swap: the placeholder is replaced by the picture
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; c.pd.style.display = v ? 'none' : ''; });
          const n = NOW(tt, i);
          put(`n${i}`, n, (v) => { c.ln.textContent = v > 0 ? `In queue · about ${v}s left` : 'Almost done...'; });
          const bar = 1 - n / 60;
          put(`b${i}`, bar.toFixed(4), () => { c.fill.style.width = `${(bar * 100).toFixed(2)}%`; });
          put(`r${i}`, (tt * 420 + i * 40) % 360 | 0, (d) => { c.sk.style.transform = `rotate(${d}deg)`; });
        });
      },
    };
  },
};
