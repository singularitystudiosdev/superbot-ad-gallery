// Motorola's 'Create with AI' wallpaper picker on an Edge 50 Neo (Hello UI, Android 15): Settings > Personalize > Wallpaper > Choose new wallpaper >
// Create with AI > Style Sync (YouTube zZUdIjETMOQ, TimeToFixThis!, 2024-11-09; picker closes ~56.3 s, PENDING 56.5-68.3 s, 'Checking Content...' ~56.5-64.5 s
// with its tick at ~64 s, 'Generating Image...' 65.5-68.3 s, result 68.5 s; spec .tmp/clone-9e82faf1/reveal-refs/moto-ai-wallpaper/spec.json, confidence 0.60;
// frames av_create_with_ai_hub.png, av_before_wait.png, av_pending_checking_content.png, av_pending_generating_image.png, av_result_save_set.png,
// av_pending_sheet.png). Not the Moto AI Image Studio app (motorola-image-studio: a morphing gradient square and 'Getting started...'). Once the photo
// is confirmed the whole screen becomes a flat lavender page (#E7E0F2) with no title bar: a small ring spinner (about 56 px, a purple-to-pink gradient with
// a gap, arcing round) upper-middle and, beneath it, a left-aligned step list that only ever grows downward: 'Checking Content...' first, a dark tick
// appended to its right when that pass finishes, then 'Generating Image...' beneath it. No percentage, bar, queue note or timer. About twelve seconds
// on, the page is replaced in one step by a dark 'Preview' screen holding the generated wallpaper, a pager, a refresh and a download button and a
// 'Save & Set Wallpaper' pill.
// Adapted to ten images: the wait page runs as in the footage (ring, 'Checking Content...' with its tick, then 'Generating Image...'), then the Preview
// screen opens on ten empty portrait cards in a five-by-two block and the ten wallpapers land in reading order, the pager, the two round buttons and
// 'Save & Set Wallpaper' resting along the foot. Extrapolated: the ten cards, their reading-order landing and the Preview screen opening on empty
// cards (the footage jumps straight to one finished wallpaper); the second step's tick is never shown, as in the footage. Omitted: the phone bezel, camera
// hole and status bar, the capture's small round overlay button, the cutting mat, box and hands, the 'Set wallpaper on' sheet, and the 'Home screen' /
// 'Lock screen' choices. The footage's wallpaper is never reproduced: every card is our own meme, and no logo or platform font is drawn.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-mtw';
const ROOT_H = 440, COLS = 5, GAP = 8, SIDE = 20;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 14px; background: #15111d; color: #f1ecf8; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #2a2236; }
.${P}-pv { position: absolute; inset: 0; }
.${P}-bar { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; height: 44px; padding: 0 ${SIDE}px; font-size: 13px; font-weight: 600; color: #f1ecf8; }
.${P}-bar svg { flex: none; width: 14px; height: 14px; fill: none; stroke: #f1ecf8; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-bar span { margin-left: 14px; }
.${P}-bar .${P}-x { margin-left: auto; }
.${P}-g { position: absolute; left: ${SIDE}px; right: ${SIDE}px; top: 54px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 2 / 3; border-radius: 10px; overflow: hidden; background: #241d31; box-shadow: inset 0 0 0 1px #30283f; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; inset: 0; background: #241d31; }
.${P}-dots { position: absolute; left: 0; right: 0; bottom: 74px; display: flex; justify-content: center; align-items: center; gap: 5px; }
.${P}-dots i { display: block; width: 5px; height: 5px; border-radius: 50%; background: #7b6f93; }
.${P}-dots i:first-child { width: 16px; border-radius: 3px; background: #f1ecf8; }
.${P}-foot { position: absolute; left: ${SIDE}px; right: ${SIDE}px; bottom: 16px; display: flex; align-items: center; gap: 10px; height: 44px; }
.${P}-rb { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #2b2340; }
.${P}-rb svg { width: 18px; height: 18px; fill: none; stroke: #f1ecf8; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-save { flex: 1; display: grid; place-items: center; height: 44px; border-radius: 22px; background: #e7e0f2; font-size: 13px; font-weight: 700; color: #2b2033; }
.${P}-w { position: absolute; inset: 0; background: #e7e0f2; color: #2b2033; }
.${P}-ring { position: absolute; left: 50%; top: 128px; width: 56px; height: 56px; margin-left: -28px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(110, 63, 184, 0) 0deg, #6e3fb8 70deg, #c74bb0 190deg, #e8703a 300deg, rgba(232, 112, 58, 0) 340deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4.5px)); mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4.5px)); }
.${P}-steps { position: absolute; left: 50%; top: 214px; transform: translateX(-50%); display: flex; flex-direction: column; gap: 14px; }
.${P}-st { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 600; line-height: 20px; white-space: nowrap; }
.${P}-st svg { flex: none; width: 15px; height: 15px; }
`;

const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const S1 = 0.05;                                  // 'Checking Content...' appears under the ring
const TICK = 0.4;                                 // its tick lands
const S2 = 0.46;                                  // 'Generating Image...' appears beneath it
const WAIT_END = 0.86;                            // the lavender page gives way to the Preview screen
const LAND = Array.from({ length: 10 }, (_, i) => 0.94 + i * 0.0822);   // wallpaper i lands (reading order), the last at 1.68
const FADE = 0.05;                                // the empty card's cover thins away over this long before the wallpaper lands
const TURN = 560;                                 // the ring's degrees per layout second

export default {
  id: 'moto-ai-wallpaper',
  label: 'Motorola AI wallpaper (2024)',
  source: {
    platform: "Motorola Hello UI (Android 15) wallpaper picker, Settings > Personalize > Wallpaper > 'Create with AI' > Style Sync, on an Edge 50 Neo (phone, light page then dark preview; an overhead hands-on video)",
    feature: "a flat lavender full screen with a centred purple-to-pink gradient progress ring and a step list that only grows: 'Checking Content...' (a tick appended when it finishes), then 'Generating Image...' beneath it, no percentage or bar; then a dark 'Preview' screen with the wallpaper and a 'Save & Set Wallpaper' pill (adapted to 10: the Preview opens on a five-by-two block of empty portrait cards and the ten wallpapers land in reading order)",
    videos: [
      { id: 'zZUdIjETMOQ', date: '2024-11-09', note: 'TimeToFixThis!, Edge 50 Neo, pending t=56.5-68.3 s (Checking Content ~8 s, Generating Image ~3 s), result 68.5 s' },
    ],
    refs: [{ url: 'https://www.youtube.com/watch?v=zZUdIjETMOQ', retrieved: '2026-10-14' }],
    extrapolated: [
      'ten wallpapers: the footage shows one; the Preview screen opens on ten empty portrait cards in a five-by-two block and they land one every 0.08 s of the beat in reading order',
      "the wait page runs for about half the beat, the 'Checking Content...' tick and 'Generating Image...' step scaled from the footage's 8 s + 3 s",
      "no tick is drawn on 'Generating Image...': the footage replaces the page before it finishes",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'moto-ai-wallpaper');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cv"></div></div>`;
    const back = '<svg viewBox="0 0 16 16"><path d="M13 8H3.5M7.5 3.5L3 8l4.5 4.5"/></svg>';
    const cross = `<svg class="${P}-x" viewBox="0 0 16 16"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>`;
    const redo = '<svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.2-5.1M19 4v4.5h-4.5"/></svg>';
    const save = '<svg viewBox="0 0 24 24"><path d="M12 4v10.5M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/></svg>';
    const tick = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#2b2033"/><path d="M4.4 8.2l2.4 2.4 4.6-4.9" fill="none" stroke="#e7e0f2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const root = x.el(`<div class="${P}"><div class="${P}-pv"><div class="${P}-bar">${back}<span>Preview</span>${cross}</div><div class="${P}-g">${tiles.map(cell).join('')}</div><div class="${P}-dots"><i></i><i></i><i></i></div><div class="${P}-foot"><div class="${P}-rb">${redo}</div><div class="${P}-rb">${save}</div><div class="${P}-save">Save &amp; Set Wallpaper</div></div></div><div class="${P}-w"><i class="${P}-ring"></i><div class="${P}-steps"><div class="${P}-st ${P}-s1" style="display: none"><span>Checking Content...</span><i class="${P}-tk" style="visibility: hidden">${tick}</i></div><div class="${P}-st ${P}-s2" style="display: none"><span>Generating Image...</span><i style="visibility: hidden">${tick}</i></div></div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const wait = q('w'), ring = q('ring'), s1 = q('s1'), s2 = q('s2'), tk = q('tk');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sd = Math.max(0, Math.min(s, WAIT_END)); // the ring stops where the wait page is replaced

        // the wait page: the step list only grows, the first step gains its tick, the page is replaced in one step
        put('w', s < WAIT_END, (v) => { wait.style.display = v ? '' : 'none'; });
        put('s1', s >= S1, (v) => { s1.style.display = v ? '' : 'none'; });
        put('tk', s >= TICK, (v) => { tk.style.visibility = v ? '' : 'hidden'; });
        put('s2', s >= S2, (v) => { s2.style.display = v ? '' : 'none'; });
        // the ring arcs round with t (a function of t alone)
        const deg = ((sd * TURN) % 360 + 360) % 360;
        put('r', deg.toFixed(0), (d) => { ring.style.transform = `rotate(${d}deg)`; });

        // the Preview screen: ten empty cards, each handing over to its wallpaper in reading order
        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.cv.style.display = 'none'; c.cv.style.opacity = ''; } else { c.cv.style.display = ''; c.cv.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
        });
      },
    };
  },
};
