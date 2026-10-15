// Samsung 'Generative' wallpaper (One UI 8, Settings > Wallpaper and style > Wallpapers > Create with AI > Generative, a Galaxy S26 FE screen
// capture: YouTube L2lfYwAh2Ps 'Samsung Galaxy S26 FE: How to Create AI Wallpaper', 2026-09-24, tap at t~129.5 s, captions t=130.0-138.3 s;
// spec .tmp/clone-9e82faf1/reveal-refs/samsung-generative-wallpaper/spec.json, confidence 0.72; frames av_setup_generate.png,
// av_pending_caption_1..5.png, av_pending_sheet.png, av_result.png). Before the tap the composer shows a prompt field over a pale lilac wash and a
// 'Generate' pill. The tap swaps the WHOLE composer for a soft pastel aurora (lavender, pale blue, teal and pink, with faint horizontal streaks) with
// a centred frosted-glass rounded tile holding a small blue sparkle (a big and a small four-point star, the small one teal) and one dark-grey caption
// beneath it that is replaced every ~1.8 s - 'Generating image...', 'Transforming text into art...', 'Bringing your dream to life...', 'Making your
// masterpiece...', 'Painting in the pixels...' - with a tiny disclaimer ('Image generation may produce unexpected results') at the foot. No bar, no
// percentage, no spinner ring. The picture then lands in that same glass rectangle and the screen's chrome comes in: back / save / share / more up
// top, a 'View prompt' pill, an 'AI-generated content' chip on the picture, two pager dots, 'Done', and a bottom bar 'Add or change image' / 'Generate'.
// Adapted to ten images: the composer holds our own prompt; after the tap the aurora wash takes the screen and the glass rectangle is a 5 x 2 block of ten
// glass tiles, each with its own sparkle and the same rotating caption (the footage's one tile, repeated), which hand over to their pictures in strict
// reading order; the chrome comes in once the tenth has landed. The ten-picture block, the per-tile caption and the compressed caption cadence are
// extrapolated; the phone status bar and the first-run privacy dialog are omitted. The footage's picture is never reproduced: every tile is our own
// meme, and no logo, wordmark or Samsung font is drawn (system type, plain shapes).
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-sgw';
const ROOT_H = 432, COLS = 5, GAP = 6, CARD_PAD = 8;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 14px; background: #d6d0ea; color: #2a2a3e; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #c2bcd8; }
.${P}-wash { position: absolute; inset: 0; overflow: hidden; border-radius: 14px; }
.${P}-bl { position: absolute; display: block; border-radius: 50%; }
.${P}-b1 { left: 330px; top: -40px; width: 300px; height: 260px; background: radial-gradient(closest-side, rgba(150, 214, 222, .85), rgba(150, 214, 222, 0)); }
.${P}-b2 { left: 80px; top: 230px; width: 380px; height: 260px; background: radial-gradient(closest-side, rgba(178, 150, 238, .8), rgba(178, 150, 238, 0)); }
.${P}-b3 { left: -70px; top: 10px; width: 320px; height: 240px; background: radial-gradient(closest-side, rgba(168, 196, 238, .85), rgba(168, 196, 238, 0)); }
.${P}-b4 { left: 360px; top: 250px; width: 280px; height: 220px; background: radial-gradient(closest-side, rgba(236, 196, 226, .8), rgba(236, 196, 226, 0)); }
.${P}-str { position: absolute; inset: 0; background: repeating-linear-gradient(180deg, rgba(255, 255, 255, .2) 0 5px, rgba(255, 255, 255, 0) 5px 12px, rgba(188, 176, 232, .13) 12px 19px, rgba(255, 255, 255, 0) 19px 31px); filter: blur(2.2px); }
.${P}-top { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 12px; height: 30px; padding: 0 16px; }
.${P}-top svg { flex: none; width: 12px; height: 12px; fill: none; stroke: #34344c; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-top i { margin-left: auto; display: flex; gap: 14px; }
.${P}-box { position: absolute; left: 60px; right: 60px; top: 150px; box-sizing: border-box; height: 84px; padding: 12px 14px; border-radius: 16px; background: rgba(255, 255, 255, .5); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .7); font-size: 11.5px; line-height: 16px; color: #2d2d44; }
.${P}-box i { position: absolute; right: 14px; bottom: 10px; display: flex; gap: 9px; }
.${P}-box svg { width: 11px; height: 11px; fill: none; stroke: #4a4a64; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-gen { position: absolute; left: 50%; top: 250px; display: grid; place-items: center; width: 128px; height: 30px; margin-left: -64px; border-radius: 15px; background: rgba(255, 255, 255, .58); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .8); font-size: 11.5px; font-weight: 600; color: #3c3c8a; }
.${P}-card { position: absolute; left: 20px; right: 20px; top: 62px; box-sizing: border-box; padding: ${CARD_PAD}px; border-radius: 20px; background: rgba(255, 255, 255, .18); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .5), 0 10px 26px rgba(120, 104, 168, .18); }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 870 / 1024; border-radius: 12px; overflow: hidden; background: transparent; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pend { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; border-radius: 12px; background: linear-gradient(180deg, rgba(255, 255, 255, .44), rgba(255, 255, 255, .26)); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .62); }
.${P}-pend svg { display: block; width: 26px; height: 26px; }
.${P}-s1, .${P}-s2 { transform-box: fill-box; transform-origin: center; }
.${P}-s1 { transform: scale(var(--tw1, 1)); }
.${P}-s2 { transform: scale(var(--tw2, 1)); }
.${P}-pend span { display: block; width: 78px; font-size: 7.2px; line-height: 9px; text-align: center; color: #54546e; }
.${P}-vp { position: absolute; left: 50%; top: 38px; display: grid; place-items: center; width: 74px; height: 18px; margin-left: -37px; border-radius: 9px; background: rgba(255, 255, 255, .55); font-size: 8px; color: #3a3a52; }
.${P}-ai { position: absolute; left: 22px; bottom: 6px; padding: 0 5px; height: 11px; border-radius: 6px; background: rgba(40, 36, 70, .38); font-size: 6.5px; line-height: 11px; color: #ffffff; white-space: nowrap; }
.${P}-dots { position: absolute; left: 0; right: 0; top: 318px; display: flex; justify-content: center; gap: 5px; }
.${P}-dots b { display: block; width: 4px; height: 4px; border-radius: 50%; background: rgba(60, 56, 96, .3); }
.${P}-dots b.${P}-on { background: rgba(60, 56, 96, .75); }
.${P}-done { position: absolute; left: 50%; top: 332px; display: grid; place-items: center; width: 88px; height: 24px; margin-left: -44px; border-radius: 12px; background: rgba(255, 255, 255, .6); font-size: 10px; font-weight: 500; color: #2f2f46; }
.${P}-bar { position: absolute; left: 20px; right: 20px; top: 368px; display: flex; align-items: center; box-sizing: border-box; height: 34px; padding: 0 5px 0 14px; border-radius: 17px; background: rgba(255, 255, 255, .45); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .6); font-size: 9.5px; color: #6c6a88; }
.${P}-bar b { margin-left: auto; display: grid; place-items: center; width: 70px; height: 24px; border-radius: 12px; background: rgba(255, 255, 255, .6); font-size: 9.5px; font-weight: 500; color: #7a789a; }
.${P}-note { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font-size: 7px; line-height: 9px; color: #a69cc0; }
`;

const PROMPT = 'A muse holding a handwritten note in a lecture hall, meme style';
const PHRASES = ['Generating image...', 'Transforming text into art...', 'Bringing your dream to life...', 'Making your masterpiece...', 'Painting in the pixels...'];
const STAR = 'M12 1c.7 7 3.9 10.3 11 11-7.1.7-10.3 4-11 11-.7-7-3.9-10.3-11-11C8.1 11.3 11.3 8 12 1z';
const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                              // the cursor taps 'Generate'
const ISSUE = 0.16;                               // the composer gives way to the aurora and the glass tiles
const LAND = Array.from({ length: 10 }, (_, i) => 0.4 + i * 0.1425);   // glass tile i hands over to picture i (reading order), the last at 1.68

export default {
  id: 'samsung-generative-wallpaper',
  label: 'Samsung generative wallpaper (2024)',
  source: {
    platform: "Samsung Galaxy One UI 'Generative' wallpaper (Settings > Wallpaper and style > Create with AI; filmed on a Galaxy S26 FE running One UI 8, a screen recording)",
    feature: "pre-tap composer (a prompt field and a 'Generate' pill over a pale lilac wash); after the tap the WHOLE composer is swapped for a pastel aurora wash with a centred frosted-glass tile holding a blue four-point sparkle and one caption rotating 'Generating image...' / 'Transforming text into art...' / 'Bringing your dream to life...' / 'Making your masterpiece...' / 'Painting in the pixels...' (no bar, percentage or spinner ring), the disclaimer 'Image generation may produce unexpected results' at the foot, then the picture lands in that glass rectangle with back / save / share / more, 'View prompt', an 'AI-generated content' chip, pager dots, 'Done' and 'Add or change image' / 'Generate' (adapted to 10: a 5 x 2 block of ten glass tiles handing over to their pictures in reading order)",
    refs: [
      { id: 'L2lfYwAh2Ps', url: 'https://www.youtube.com/watch?v=L2lfYwAh2Ps', title: 'Samsung Galaxy S26 FE: How to Create AI Wallpaper (Generate Wallpaper with AI)', published: '2026-09-24', t: 't~129.5-138.5 s', retrieved: '2026-10-14' },
      { id: '7xFImjkQ34g', url: 'https://www.youtube.com/watch?v=7xFImjkQ34g', title: 'How To Generate AI Wallpaper On Samsung Galaxy S26 / S26 Ultra', published: '2026-03-13', retrieved: '2026-10-14' },
    ],
    extrapolated: [
      'ten glass tiles in a 5 x 2 block, each with its own sparkle and caption (the footage has ONE centred tile and ONE image)',
      "the five captions rotate on a compressed cadence (~0.3 layout-seconds each) instead of the footage's ~1.8 s",
      "the composer's prompt is our own sentence (the footage types 'A dog in a spacesuit')",
      'the tiles hand over to their pictures one every 0.1425 layout-seconds, the chrome arriving with the tenth',
      'two pager dots and the chip placement on the block follow the single result screen',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'samsung-generative-wallpaper');
    const glyph = `<svg viewBox="0 0 32 32"><g class="${P}-s2"><path d="${STAR}" transform="translate(5 3) scale(.34)" fill="#2eb0a8"/></g><g class="${P}-s1"><path d="${STAR}" transform="translate(14.5 11.5) scale(.62)" fill="#2f78e8"/><path d="${STAR}" transform="translate(3.5 15.5) scale(.5)" fill="#3a86f0"/></g></svg>`;
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-pend">${glyph}<span>${PHRASES[0]}</span></div></div>`;
    const back = '<svg viewBox="0 0 12 12"><path d="M7.6 2.2L3.8 6l3.8 3.8"/></svg>';
    const save = '<svg viewBox="0 0 12 12"><path d="M6 1.8v5.6M3.8 5.4L6 7.6l2.2-2.2M2 8.2v1.6h8V8.2"/></svg>';
    const share = '<svg viewBox="0 0 12 12"><path d="M8.6 4.4a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM3.4 7.3a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM8.6 10.2a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM4.5 6.4l3-1.7M4.5 5.6l3 1.7"/></svg>';
    const more = '<svg viewBox="0 0 12 12"><path d="M6 2.4v.1M6 6v.1M6 9.6v.1"/></svg>';
    const pen = '<svg viewBox="0 0 12 12"><path d="M1.6 8.8c1.6-3.4 2.8-5 3.6-3.6.8 1.4 1.8.6 3.2-2.4"/></svg>';
    const pic = '<svg viewBox="0 0 12 12"><rect x="1.4" y="1.8" width="9.2" height="8.4" rx="1.6"/><path d="M1.8 8.6l2.8-2.8 2.2 2.2 1.4-1.4 1.8 1.8"/></svg>';
    const root = x.el(`<div class="${P}"><div class="${P}-wash"><i class="${P}-bl ${P}-b3"></i><i class="${P}-bl ${P}-b1"></i><i class="${P}-bl ${P}-b2"></i><i class="${P}-bl ${P}-b4"></i><i class="${P}-str"></i></div><div class="${P}-top" style="visibility: hidden">${back}<i>${save}${share}${more}</i></div><div class="${P}-box">${x.esc(PROMPT)}<i>${pen}${pic}</i></div><div class="${P}-gen">Generate</div><div class="${P}-vp" style="visibility: hidden">View prompt</div><div class="${P}-card" style="visibility: hidden"><div class="${P}-g">${tiles.map(cell).join('')}</div><div class="${P}-ai" style="visibility: hidden">AI-generated content</div></div><div class="${P}-dots" style="visibility: hidden"><b class="${P}-on"></b><b></b></div><div class="${P}-done" style="visibility: hidden">Done</div><div class="${P}-bar" style="visibility: hidden">Add or change image<b>Generate</b></div><div class="${P}-note" style="visibility: hidden">Image generation may produce unexpected results</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const blobs = ['b1', 'b2', 'b3', 'b4'].map((c) => q(c));
    const box = q('box'), gen = q('gen'), card = q('card'), top = q('top'), vp = q('vp'), ai = q('ai'), dots = q('dots'), done = q('done'), bar = q('bar'), note = q('note');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), pend: n.querySelector(`.${P}-pend`), cap: n.querySelector(`.${P}-pend span`), g: tiles[i] }));
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

        // the aurora drifts slowly (a function of t, so it stops once the last picture has landed)
        blobs.forEach((b, i) => {
          const dx = (Math.sin(sc * 2.1 + i * 1.7) * 22).toFixed(1), dy = (Math.cos(sc * 1.6 + i * 2.3) * 14).toFixed(1);
          put(`b${i}`, `${dx}|${dy}`, () => { b.style.transform = `translate(${dx}px, ${dy}px)`; });
        });

        // 'Generate' is tapped
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('gen', gp.toFixed(3), () => { gen.style.transform = gp > 0 ? `scale(${(1 - 0.06 * gp).toFixed(4)})` : 'none'; });

        // the composer is swapped for the aurora and the glass block
        const on = s >= ISSUE;
        put('iss', on, (v) => {
          box.style.display = v ? 'none' : '';
          gen.style.display = v ? 'none' : '';
          card.style.visibility = v ? '' : 'hidden';
          note.style.visibility = v ? '' : 'hidden';
        });

        // the sparkle twinkles and the caption is replaced, both from t
        const tw1 = (0.9 + 0.1 * Math.sin(sc * 15)).toFixed(3), tw2 = (0.82 + 0.18 * Math.sin(sc * 11 + 1.4)).toFixed(3);
        put('tw', `${tw1}|${tw2}`, () => { card.style.setProperty('--tw1', tw1); card.style.setProperty('--tw2', tw2); });
        const ci = Math.max(0, Math.min(PHRASES.length - 1, Math.floor((sc - ISSUE) / ((LAND[9] - ISSUE) / PHRASES.length))));
        put('cap', ci, (v) => cells.forEach((c) => { c.cap.textContent = PHRASES[v]; }));

        // tile i hands over to its picture (reading order)
        cells.forEach((c, i) => {
          const d = s >= LAND[i];
          put(`i${i}`, d, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.pend.style.display = v ? 'none' : ''; });
        });

        // the chrome comes in with the tenth
        const fin = s >= LAND[9];
        put('fin', fin, (v) => { [top, vp, ai, dots, done, bar].forEach((n) => { n.style.visibility = v ? '' : 'hidden'; }); });
      },
    };
  },
};
