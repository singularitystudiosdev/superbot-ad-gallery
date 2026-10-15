// Google Pixel / Android 14 'AI wallpaper' (Settings > Wallpaper & style > AI wallpaper) as it appears while the wallpaper generates
// (YouTube KikNplG6Z4A 'How to Create Android 14 AI Wallpaper', 2023-12-07, tap at t~65.2 s -> sharp wallpaper at t~73.4 s, cross-checked
// with OTJtBFjlyhk 'Android 14 AI Wallpaper is DOPE', 2023-10-07; spec .tmp/clone-9e82faf1/reveal-refs/pixel-ai-wallpaper/spec.json,
// confidence 0.55; frames av_composer_create_wallpaper.png, av_pending_blur_early.png, av_pending_blur_mid.png, av_pending_resolving.png,
// av_pending_sheet.png, av_result_set_wallpaper.png). Before the tap a dark sheet of eight theme-backdrop chips (Alpine lake, Space galaxy,
// Sand dunes, Humid swamp (picked), Foggy swamp, Beach, Desert, Mountains) sits over the preview with the sentence 'A hazy image of <subject>
// on a backdrop of <backdrop>' and a pale 'Create wallpaper' button. The tap collapses the sheet and the preview fills the screen with a very
// soft, out-of-focus, film-grained wash of the wallpaper's own palette, the sentence staying pinned over its foot; the button becomes a small
// scalloped image-sparkle disc. There is no spinner, no caption, no bar and no percentage: the image only sharpens, a little at a time, with
// four pager dots appearing along the way, until it is crisp; the chrome (the 'Bloom' chip, the confirm tick, the rating pill) takes the
// wallpaper's warm colour and a pale 'Inspire me' pill replaces the disc.
// Adapted to ten images: the full-screen preview is a full-bleed 5 x 2 block of ten wallpapers, each a heavily blurred, grainy wash of its own
// palette that sharpens and then lands, in strict reading order, with the sentence pinned under the block. The blur is a backdrop-filter on a
// cover laid over each picture (never a filter on the <img>), the grain is a seeded noise layer, and both are driven from t and stop at the last
// landing. The ten-wallpaper count, the 4 + 6 stagger and the sentence's subject ('muse memes' in place of the footage's sunflowers) are
// extrapolated; the phone status bar, the floating expand control and the 'Choose a theme' grid are omitted. The footage's wallpapers are
// never reproduced: every tile is our own meme, and no logo, wordmark or Google font is drawn (system type, plain shapes).
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, hash, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-paw';
const ROOT_H = 468, TOP_H = 32, ROW_H = 170, COLS = 5, GAP = 2, FOOT_H = 94;
// a fine film-grain: white specks with a noisy alpha, tiled; its offset jitters from t through hash()
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 4.2 -2.35'/></filter><rect width='90' height='90' filter='url(%23n)'/></svg>\")";
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0b1c1e; color: #f4f7f7; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #12292c; }
.${P}-top { position: relative; flex: none; display: flex; align-items: center; height: ${TOP_H}px; padding: 0 10px; background: linear-gradient(#0e3f43, #0d4a4f); }
.${P}-chip { position: absolute; left: 50%; top: 5px; display: flex; align-items: center; gap: 4px; box-sizing: border-box; height: 22px; padding: 0 9px 0 11px; border-radius: 11px; background: #0a3034; transform: translateX(-50%); font-size: 10px; font-weight: 500; color: #8ff3ef; white-space: nowrap; }
.${P}-chip svg { width: 8px; height: 8px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rt { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.${P}-rate { display: flex; height: 20px; border-radius: 10px; background: #8be8e6; overflow: hidden; }
.${P}-rate span { display: grid; place-items: center; width: 22px; }
.${P}-rate span + span { box-shadow: inset 1px 0 0 rgba(10, 48, 52, .25); }
.${P}-rate svg, .${P}-tick svg { width: 10px; height: 10px; fill: none; stroke: #0a3034; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tick { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #8be8e6; }
.${P}-body { position: relative; flex: none; height: ${ROW_H * 2 + GAP}px; background: linear-gradient(180deg, #1d9aa4 0%, #108089 55%, #0b5a62 100%); }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); grid-auto-rows: ${ROW_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; overflow: hidden; background: #0f7e86; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; inset: 0; overflow: hidden; background-color: rgba(34, 160, 170, 0); }
.${P}-gr { position: absolute; inset: 0; background-image: ${GRAIN}; background-size: 90px 90px; opacity: 0; }
.${P}-sheet { position: absolute; left: 62px; right: 62px; top: 57px; height: 228px; box-sizing: border-box; padding: 10px; border-radius: 22px; background: rgba(54, 59, 59, .97); box-shadow: 0 6px 18px rgba(0, 0, 0, .28); overflow: hidden; }
.${P}-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.${P}-opt { display: flex; align-items: center; gap: 7px; box-sizing: border-box; height: 46px; padding: 0 12px; border-radius: 13px; background: rgba(255, 255, 255, .08); font-size: 11.5px; line-height: 12px; color: #eef1f1; }
.${P}-opt i { flex: none; display: block; width: 24px; height: 24px; border-radius: 50%; }
.${P}-opt.${P}-on { box-shadow: inset 0 0 0 1.5px #ffffff; }
.${P}-foot { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; height: ${FOOT_H}px; background: linear-gradient(180deg, #0b5a62, #0a4a50); }
.${P}-sen { width: 330px; font-size: 14.5px; line-height: 19px; text-align: center; color: #ffffff; }
.${P}-sen u { text-decoration: underline dotted; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.${P}-pre .${P}-dim { color: #a7acac; }
.${P}-dots { position: absolute; left: 0; right: 0; top: 6px; display: flex; justify-content: center; gap: 5px; }
.${P}-dots i { display: block; width: 4px; height: 4px; border-radius: 50%; background: rgba(255, 255, 255, .45); }
.${P}-dots i.${P}-on { background: #ffffff; }
.${P}-go, .${P}-ins { display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; height: 28px; padding: 0 16px; border-radius: 14px; background: #8be8e6; font-size: 11px; font-weight: 600; color: #0a3034; white-space: nowrap; }
.${P}-go svg, .${P}-ins svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-wait { width: 32px; height: 32px; }
.${P}-wait svg { display: block; width: 32px; height: 32px; }
.${P}-wait path.${P}-disc { fill: #8be8e6; }
.${P}-wait path.${P}-gl { fill: none; stroke: #0a3034; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-fin .${P}-top { background: linear-gradient(#4a2412, #3c1d0e); }
.${P}-fin .${P}-chip { background: #35170a; color: #ffd6bf; }
.${P}-fin .${P}-rate, .${P}-fin .${P}-tick, .${P}-fin .${P}-ins { background: #ffd9c6; }
.${P}-fin .${P}-rate svg, .${P}-fin .${P}-tick svg, .${P}-fin .${P}-ins { stroke: #35170a; color: #35170a; }
.${P}-fin .${P}-foot { background: linear-gradient(180deg, #3c1d0e, #2f170b); }
`;

const SENTENCE = '<span class="${P}-dim">A hazy image of </span><u class="${P}-dim">muse memes</u><span class="${P}-dim"> on a backdrop of </span><u class="${P}-dim">orange</u> <u>humid swamp</u>';
const CHIPS = [
  ['Alpine lake', 'linear-gradient(160deg, #7ea4c6, #1f3446)'],
  ['Space galaxy', 'linear-gradient(160deg, #6a4ab0, #d0488c)'],
  ['Sand dunes', 'linear-gradient(160deg, #e0a35a, #8a5a2c)'],
  ['Humid swamp', 'linear-gradient(160deg, #42c08f, #1b5f8c)'],
  ['Foggy swamp', 'linear-gradient(160deg, #94a594, #4c5c50)'],
  ['Beach', 'linear-gradient(160deg, #38a8cc, #e6a863)'],
  ['Desert', 'linear-gradient(160deg, #d6d6d6, #7c7c7c)'],
  ['Mountains', 'linear-gradient(160deg, #5e8cc4, #e9f0f7)'],
];
const SCALLOP = (() => {
  let d = '';
  for (let k = 0; k <= 96; k++) { const a = (k / 96) * 2 * Math.PI, r = 13.4 + 1.5 * Math.cos(8 * a); d += `${k ? 'L' : 'M'}${(16 + r * Math.cos(a)).toFixed(2)} ${(16 + r * Math.sin(a)).toFixed(2)}`; }
  return `${d}Z`;
})();

const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                              // the cursor taps 'Create wallpaper'
const ISSUE = 0.16;                               // the sheet collapses and the washes fill the preview
const LAND = Array.from({ length: 10 }, (_, i) => 0.4 + i * 0.1425);   // wallpaper i is crisp (reading order), the last at 1.68
const SPAN = 0.9;                                 // how long a wallpaper takes to sharpen out of its wash before it lands
const MAXB = 20;                                  // the wash's blur radius, in CSS px on a ~110 px tile (the footage's 60 px on a 1080 px screen, scaled up so it still reads as a wash)
const GRAIN_FPS = 30;

export default {
  id: 'pixel-ai-wallpaper',
  label: 'Pixel AI wallpaper (2023)',
  source: {
    platform: "Google Pixel / Android 14 'AI wallpaper' in Wallpaper & style (Android 14 QPR, Pixel 8, a third-party tutorial screen recording)",
    feature: "pre-tap: a dark sheet of eight theme-backdrop chips (Humid swamp picked) over the preview, the sentence 'A hazy image of <subject> on a backdrop of <backdrop>' and a pale 'Create wallpaper' button; after the tap the preview fills the screen with a heavily blurred, film-grained wash of the wallpaper's own palette that sharpens progressively (no spinner, caption, bar or percentage), the sentence pinned at the foot, pager dots appearing, and the chrome ('Bloom' chip, tick, rating pill) taking the wallpaper's warm colour with an 'Inspire me' pill at the end (adapted to 10: a full-bleed 5 x 2 block of ten washes sharpening and landing in reading order)",
    refs: [
      { id: 'KikNplG6Z4A', url: 'https://www.youtube.com/watch?v=KikNplG6Z4A', title: 'How to Create Android 14 AI Wallpaper', published: '2023-12-07', t: 't~65.2-73.4 s', retrieved: '2026-10-14' },
      { id: 'OTJtBFjlyhk', url: 'https://www.youtube.com/watch?v=OTJtBFjlyhk', title: 'Android 14 AI Wallpaper is DOPE', published: '2023-10-07', retrieved: '2026-10-14' },
    ],
    extrapolated: [
      'ten wallpapers in a 5 x 2 block (the footage generates one full-screen wallpaper at a time)',
      'each wallpaper sharpens over 0.9 layout-seconds and lands 0.1425 s after the previous one (the footage sharpens one image over ~7.5 s)',
      "the sentence's subject reads 'muse memes' (the footage: sunflowers)",
      'the blur radius (20 px on a ~110 px tile) and the grain strength are tuned to read as the footage\'s wash at this scale',
      'four pager dots after the first landing (the footage shows four while it resolves)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'pixel-ai-wallpaper');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="transform-origin: ${g.origin}"/><div class="${P}-cv"><i class="${P}-gr"></i></div></div>`;
    const chev = '<svg viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3"/></svg>';
    const up = '<svg viewBox="0 0 12 12"><path d="M3.2 5.6h1.8v4.4H3.2zM5 5.8l1.8-3.6c.9 0 1.3.7 1.1 1.5l-.2 1.1h2c.6 0 1 .5.9 1.1l-.5 2.6c-.1.5-.5.8-1 .8H5"/></svg>';
    const down = '<svg viewBox="0 0 12 12"><path d="M3.2 2h1.8v4.4H3.2zM5 6.2l1.8 3.6c.9 0 1.3-.7 1.1-1.5l-.2-1.1h2c.6 0 1-.5.9-1.1l-.5-2.6C9.9 3 9.5 2.7 9 2.7H5"/></svg>';
    const tick = '<svg viewBox="0 0 12 12"><path d="M2.6 6.4l2.3 2.3 4.5-4.9"/></svg>';
    const pic = '<svg viewBox="0 0 12 12"><rect x="1.2" y="2.4" width="8.2" height="8" rx="1.6"/><path d="M1.6 9l2.6-2.6 2 2 1.2-1.2 1.8 1.8M9.4 1v2.4M8.2 2.2h2.4"/></svg>';
    const bulb = '<svg viewBox="0 0 12 12"><path d="M4.4 9h3.2M4.8 10.6h2.4M3.6 5.2a2.4 2.4 0 114.8 0c0 1.1-.7 1.6-1 2.3L7.2 8.2H4.8l-.2-.7c-.3-.7-1-1.2-1-2.3z"/></svg>';
    const wait = `<svg viewBox="0 0 32 32"><path class="${P}-disc" d="${SCALLOP}"/><path class="${P}-gl" d="M10.6 11.2h7.6a1.6 1.6 0 011.6 1.6v7.6a1.6 1.6 0 01-1.6 1.6h-7.6a1.6 1.6 0 01-1.6-1.6v-7.6a1.6 1.6 0 011.6-1.6zM9.4 20.4l3.2-3.2 2.2 2.2 1.6-1.6 3 3M21.6 8.6v4M19.6 10.6h4"/></svg>`;
    const chips = CHIPS.map(([n, bg], i) => `<div class="${P}-opt${i === 3 ? ` ${P}-on` : ''}"><i style="background: ${bg}"></i>${n}</div>`).join('');
    const root = x.el(`<div class="${P} ${P}-pre"><div class="${P}-top"><div class="${P}-chip">Bloom${chev}</div><div class="${P}-rt"><div class="${P}-rate"><span>${up}</span><span>${down}</span></div><div class="${P}-tick">${tick}</div></div></div><div class="${P}-body"><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><div class="${P}-sheet"><div class="${P}-opts">${chips}</div></div></div><div class="${P}-foot"><div class="${P}-dots" style="visibility: hidden"><i class="${P}-on"></i><i></i><i></i><i></i></div><div class="${P}-sen">${SENTENCE.replace(/\$\{P\}/g, P)}</div><div class="${P}-go">${pic}Create wallpaper</div><div class="${P}-wait" style="display: none">${wait}</div><div class="${P}-ins" style="display: none">${bulb}Inspire me</div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const grid = q('g'), sheet = q('sheet'), go = q('go'), waitEl = q('wait'), ins = q('ins'), dots = q('dots');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ cv: n.querySelector(`.${P}-cv`), gr: n.querySelector(`.${P}-gr`), im: n.querySelector('img'), g: tiles[i] }));
    cells.forEach((c) => { c.im.style.filter = restFilter(c.g); c.im.style.transform = restTransform(c.g); });
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sc = Math.min(s, LAND[9]);               // everything that moves from t stops at the last landing

        // 'Create wallpaper' is tapped (its label never changes before the sheet goes)
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { go.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });

        // the sheet collapses and the washes fill the preview
        const on = s >= ISSUE;
        put('iss', on, (v) => {
          sheet.style.display = v ? 'none' : '';
          grid.style.visibility = v ? '' : 'hidden';
          go.style.display = v ? 'none' : '';
          root.classList.toggle(`${P}-pre`, !v);
        });

        // each wallpaper sharpens out of its own wash (blur, a teal cast and the grain all thin with the same progress) and lands in reading order
        cells.forEach((c, i) => {
          const p = seg(sc, Math.max(ISSUE, LAND[i] - SPAN), LAND[i]);
          const left = 1 - p;
          const blur = (MAXB * left * left).toFixed(2);
          const cast = (0.22 * left).toFixed(3);
          const grain = (0.6 * left).toFixed(3);
          const fr = Math.floor(sc * GRAIN_FPS);
          const ox = Math.floor(hash(i + 3, fr) * 90), oy = Math.floor(hash(i + 31, fr) * 90);
          put(`c${i}`, `${blur}|${cast}|${grain}|${ox}|${oy}`, () => {
            if (p >= 1) { c.cv.style.display = 'none'; return; }
            c.cv.style.display = '';
            c.cv.style.backdropFilter = `blur(${blur}px) saturate(1.05)`;
            c.cv.style.backgroundColor = `rgba(34, 160, 170, ${cast})`;
            c.gr.style.opacity = grain;
            c.gr.style.backgroundPosition = `${ox}px ${oy}px`;
          });
        });

        // the disc in place of the button while it works; the pager dots once the first is crisp; 'Inspire me' and the warm chrome at the end
        const fin = sc >= LAND[9];
        put('wt', on && !fin, (v) => { waitEl.style.display = v ? '' : 'none'; });
        put('dt', sc >= LAND[0], (v) => { dots.style.visibility = v ? '' : 'hidden'; });
        put('fin', fin, (v) => { ins.style.display = v ? '' : 'none'; root.classList.toggle(`${P}-fin`, v); });
      },
    };
  },
};
