// TattoosAI's 'Create Tattoo' page (tattoosai.com, 2023), as it appears in a third-party screen recording of the app (YouTube VzKdM5pb9vk
// 'TattoosAI neural network generates tattoo designs', channel IA NEWS, 2023-03-02, t~7.2-9.3 s; spec
// .tmp/clone-9e82faf1/reveal-refs/tattoo-ai/spec.json, confidence 0.55; frames ax_tt_btn_7.2 / ax_tt_pending_7.6 / ax_tt_pending_8.2 /
// ax_tt_btn_9.0 / ax_tt_results_9.3). A slim dark bar, a white left control column ('Describe your tattoo here', the prompt box, the 'Pick a
// style' and 'Pick a color' selects, a bright-green 'Generate tattoos' button) and a light-grey canvas under a white 'New | Previous |
// Favorite' strip. The wait is TWO components at once: (1) the green button's own rectangle turns into a rounded bar whose colours sweep
// across it, a white open-ring spinner and the white label 'Designing tattoos' sitting INSIDE the bar (a tiktok-ai-greenscreen bar puts its
// caption below the track and has no spinner); (2) the canvas shows flat grey plates, each with a thin grey ring spinner and nothing else
// (no percentage, no ETA, no shimmer, no tile text). The bar gives way to the green button again just BEFORE the designs land.
// The footage's frames read differently from the spec's text in three places and the FRAMES are followed: the sweep is a looping gradient
// (orange -> red -> pink -> violet -> blue -> teal, read at 7.6 / 8.2 / 9.0 s) rather than blue -> teal -> green; the ring sits beside the
// centred label rather than at the head of the sweep; the strip reads 'Previous', not 'Preview'. The footage's tab and wordmark read
// 'Tattoo Idea AI' while the copy and the style/colour names match tattoosai.com; the wordmark is not drawn.
// Adapted to ten images: the footage shows a 2 x 2 grid, so ten plates in a 4 + 4 + 2 block landing in strict reading order is
// EXTRAPOLATED (as is the wait's length, the clip being cut between runs, and the settle, which the footage never shows: a plate is
// handed straight to its picture). Omitted: the wordmark, the credit counter beside the button label, the upsell rows and the footage's own
// sample sheet. The footage's pictures are never reproduced: every tile is our own meme, and no logo or platform font is drawn.
import { injectStyle, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-tat';
const ROOT_H = 324, LEFT_W = 118, COLS = 4, GAP = 5;
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #111827; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #d9dce2; }
.${P}-top { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 6px; height: 18px; padding: 0 8px; background: #151b27; }
.${P}-chat { display: flex; align-items: center; gap: 3px; box-sizing: border-box; height: 12px; padding: 0 5px; border-radius: 3px; background: #1d1d1f; font-size: 5.5px; font-weight: 600; color: #f4f5f7; }
.${P}-chat i { display: block; width: 5px; height: 4.5px; border-radius: 1.5px; background: #f4f5f7; }
.${P}-av { display: block; width: 11px; height: 11px; border-radius: 50%; background: #1d1d1f; box-shadow: inset 0 0 0 3px #1d1d1f, inset 0 0 0 6px #e9ebef; }
.${P}-body { flex: 1; min-height: 0; display: flex; }
.${P}-left { flex: none; box-sizing: border-box; width: ${LEFT_W}px; padding: 8px 5px 8px 5px; background: #ffffff; box-shadow: 1px 0 0 #eef0f3; }
.${P}-h { font-size: 7px; font-weight: 700; line-height: 10px; padding-bottom: 5px; border-bottom: 0.7px solid #eceef1; color: #0b1019; white-space: nowrap; }
.${P}-lab { margin-top: 6px; height: 8px; font-size: 5.5px; line-height: 8px; color: #1f2937; white-space: nowrap; }
.${P}-ta { position: relative; margin-top: 2px; box-sizing: border-box; height: 52px; padding: 5px 4px; border-radius: 2px; background: #f1f1f1; font-size: 5.5px; line-height: 8px; color: #1f2937; box-shadow: inset 0 0 0 0.6px #e4e6ea; }
.${P}-ta i { position: absolute; right: 3px; bottom: 3px; display: block; width: 9px; height: 9px; border-radius: 50%; background: #1cb38f; box-shadow: inset 0 0 0 2px #1cb38f, inset 0 0 0 3.4px #d9f5ec; }
.${P}-sel { position: relative; margin-top: 2px; box-sizing: border-box; height: 15px; padding: 0 5px; border-radius: 2px; background: #f1f2f4; box-shadow: inset 0 0 0 0.6px #e4e6ea; font-size: 5.5px; line-height: 15px; color: #111827; white-space: nowrap; }
.${P}-sel::after { content: ""; position: absolute; right: 6px; top: 5.5px; width: 3px; height: 3px; border-right: 0.8px solid #8b93a1; border-bottom: 0.8px solid #8b93a1; transform: rotate(45deg); }
.${P}-go { position: relative; margin-top: 9px; box-sizing: border-box; height: 18px; border-radius: 2px; background: #07d099; overflow: hidden; }
.${P}-idle { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 6.2px; font-weight: 600; color: #08231b; white-space: nowrap; }
.${P}-idle svg { width: 6px; height: 6px; fill: none; stroke: #08231b; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-bar { position: absolute; inset: 0; border-radius: 2px; overflow: hidden; }
.${P}-sw { position: absolute; inset: 0; background-repeat: repeat-x; background-size: 330% 100%; background-image: linear-gradient(90deg, #f36b46 0%, #ec4b66 10%, #c14d8c 20%, #7a5ea8 30%, #3f6db0 40%, #0f9a98 50%, #3f6db0 60%, #7a5ea8 70%, #c14d8c 80%, #ec4b66 90%, #f36b46 100%); }
.${P}-lock { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 4px; }
.${P}-sp { display: block; flex: none; width: 8px; height: 8px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(255, 255, 255, 0) 0deg, rgba(255, 255, 255, .35) 60deg, rgba(255, 255, 255, .55) 200deg, #ffffff 330deg, rgba(255, 255, 255, 0) 345deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.1px)); mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.1px)); }
.${P}-lb { font-size: 6.2px; font-weight: 700; color: #ffffff; white-space: nowrap; }
.${P}-cv { position: relative; flex: 1; min-width: 0; background: #e3e5e9; }
.${P}-strip { display: flex; align-items: center; gap: 4px; height: 19px; margin: 6px 8px 0 10px; padding: 0 4px; border-radius: 2px; background: #ffffff; font-size: 5.5px; font-weight: 500; color: #4b5563; }
.${P}-strip span { display: block; box-sizing: border-box; height: 13px; padding: 0 5px; border-radius: 2px; line-height: 13px; white-space: nowrap; }
.${P}-strip .${P}-on { background: #e9ebef; color: #374151; }
.${P}-es { position: absolute; left: 50%; top: 96px; display: flex; flex-direction: column; align-items: center; gap: 5px; box-sizing: border-box; width: 190px; margin-left: -88px; padding: 14px 12px; border-radius: 2px; background: #ffffff; text-align: center; }
.${P}-es b { font-size: 7.4px; font-weight: 700; color: #0b1019; white-space: nowrap; }
.${P}-es span { font-size: 5.4px; line-height: 8px; color: #1f2937; }
.${P}-g { position: absolute; left: 10px; right: 8px; top: 32px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 6 / 5; overflow: hidden; border-radius: 1.5px; background: #cbcfd5; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-plate { position: absolute; inset: 0; background: #cbcfd5; }
.${P}-ring { position: absolute; left: 50%; top: 50%; display: block; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: conic-gradient(from 0deg, #bfc3ca 0deg, #bfc3ca 150deg, #8d919a 200deg, #3a3e48 250deg, #23262e 310deg, #bfc3ca 345deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.7px), #000 calc(100% - 1.3px)); mask: radial-gradient(farthest-side, transparent calc(100% - 1.7px), #000 calc(100% - 1.3px)); }
`;

const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ISSUE = 0.12;                               // 'Generate tattoos' is pressed: the button becomes the bar and the empty state gives way to ten plates
const BAR_END = 0.80;                             // the bar reverts to the green button just before the designs land
const LAND = Array.from({ length: 10 }, (_, i) => 0.86 + i * 0.0909);   // plate i hands over to its picture (reading order), the last at 1.678
const SWEEP = 1.05;                               // cycles of the bar's colours per layout second
const SPIN = 520;                                 // degrees per layout second, both spinners
const REFRESH = '<svg viewBox="0 0 12 12"><path d="M10 4.5A4.3 4.3 0 0 0 2.4 3.2L1.6 4.2M2 7.5a4.3 4.3 0 0 0 7.6 1.3l.8-1"/><path d="M1.5 1.8v2.6h2.6M10.5 10.2V7.6H7.9"/></svg>';

export default {
  id: 'tattoo-ai',
  label: 'TattoosAI (2023)',
  source: {
    platform: "TattoosAI, the tattoosai.com 'Create Tattoo' page (desktop browser, light theme; a third-party screen recording, channel IA NEWS, 2023-03-02; the footage's tab and wordmark read 'Tattoo Idea AI' while the copy, the 'Old school' / 'Black and white' choices and the 'Generate tattoos' button match tattoosai.com)",
    feature: "left control column ('Pick a style' Old school, 'Pick a color' Black and white, a bright-green 'Generate tattoos' button) and a grey canvas; pressing the button turns the button's own rectangle into a rounded bar of sweeping colours with a white ring spinner and the white label 'Designing tattoos' inside it, while the canvas shows flat grey plates each with a thin grey ring spinner (no percentage, ETA, shimmer or tile text); the bar reverts to the green button just before the designs land (the footage shows 2 x 2 plates; the ten-tile 4 + 4 + 2 block in reading order is extrapolated; the wordmark, credit counter and upsell rows are omitted)",
    refs: [
      { url: 'https://www.youtube.com/watch?v=VzKdM5pb9vk', retrieved: '2026-10-14', published: '2023-03-02', note: 'primary: t=7.2-9.3 s, the pending bar, the plates and the landing' },
      { url: 'https://www.tattoosai.com/', retrieved: '2026-10-14', note: 'identity only: the style/colour names and the three-step copy match the footage' },
    ],
    extrapolated: [
      'ten plates (4 + 4 + 2) landing in strict reading order: the footage shows a 2 x 2 grid',
      "the length of the wait, the moment the bar reverts and the landing times: the clip is cut between runs (~1.9 s of 'Designing tattoos' is only a lower bound)",
      'the plate-to-picture settle (never shown: the footage hands a plate straight to its design), drawn here as an instant swap',
      'the colour order and speed of the sweep beyond the three frames read (7.6, 8.2, 9.0 s)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'tattoo-ai');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-plate"><i class="${P}-ring"></i></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-top"><div class="${P}-chat"><i></i>Chat</div><i class="${P}-av"></i></div><div class="${P}-body"><div class="${P}-left"><div class="${P}-h">Describe your tattoo here</div><div class="${P}-lab">Describe your tattoo</div><div class="${P}-ta">A bouquet of roses<i></i></div><div class="${P}-lab">Pick a style</div><div class="${P}-sel">Old school</div><div class="${P}-lab">Pick a color</div><div class="${P}-sel">Black and white</div><div class="${P}-go"><div class="${P}-idle">${REFRESH}Generate tattoos</div><div class="${P}-bar" style="display: none"><div class="${P}-sw"></div><div class="${P}-lock"><i class="${P}-sp"></i><span class="${P}-lb">Designing tattoos</span></div></div></div></div><div class="${P}-cv"><div class="${P}-strip"><span class="${P}-on">New</span><span>Previous</span><span>Favorite</span></div><div class="${P}-es"><b>Your tattoos will appear here</b><span>Fill in the fields on the right side, press the green button and our AI will design your tattoos for you!</span></div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div></div></div></div>`);
    const idle = root.querySelector(`.${P}-idle`), bar = root.querySelector(`.${P}-bar`), sw = root.querySelector(`.${P}-sw`), sp = root.querySelector(`.${P}-sp`);
    const es = root.querySelector(`.${P}-es`), grid = root.querySelector(`.${P}-g`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), plate: n.querySelector(`.${P}-plate`), ring: n.querySelector(`.${P}-ring`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sc = Math.min(s, LAND[9]);               // the sweep and both spinners stop at the last landing

        // the button is the bar from the press until just before the designs land; the empty state gives way to the plates at the same moment
        const issued = s >= ISSUE;
        const working = issued && s < BAR_END;
        put('iss', issued, (v) => { es.style.display = v ? 'none' : ''; grid.style.visibility = v ? '' : 'hidden'; });
        put('bar', working, (v) => { bar.style.display = v ? '' : 'none'; idle.style.display = v ? 'none' : ''; });

        // the bar's colours sweep to the right; the ring beside the label turns (both functions of t alone, frozen at the last landing)
        const ph = (((sc * SWEEP) % 1) + 1) % 1;
        put('sw', ph.toFixed(3), (v) => { sw.style.backgroundPosition = `${(parseFloat(v) * 100).toFixed(1)}% 0`; });
        const bd = (((sc * SPIN) % 360) + 360) % 360;
        put('sp', bd.toFixed(0), (d) => { sp.style.transform = `rotate(${d}deg)`; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.plate.style.display = v ? 'none' : ''; });
          c.im.style.filter = c.g.grade || 'none';
          c.im.style.transform = c.g.zoom === 1 ? 'none' : `scale(${c.g.zoom.toFixed(4)})`;
          // the plate's ring turns with t (its phase differs per tile); a function of t alone, covered or not
          const deg = (((sc * SPIN + i * 47) % 360) + 360) % 360;
          put(`r${i}`, deg.toFixed(0), (d) => { c.ring.style.transform = `rotate(${d}deg)`; });
        });
      },
    };
  },
};
