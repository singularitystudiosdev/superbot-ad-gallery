// Looka's logo maker, the 2019 wizard (first-party 'Online Logo Maker by Looka (How it Works)', YouTube dcXfE3f7IWk, 2019-04-01,
// t~22.0-26.5 s; spec .tmp/clone-9e82faf1/reveal-refs/looka/spec.json, confidence 0.6; frames au_looka_generating_logos.png,
// au_looka_generating_logos_dots.png, au_looka_tada_splash.png, au_looka_results_grid.png). Pressing the wizard's last 'Continue'
// blanks the page: a bare #FDFDFD viewport under a thin indigo bar carrying ONE centred, faint grey-lavender string 'Generating Logos'
// whose dot suffix cycles one-two-three. There is no spinner, no bar, no percentage and no skeleton. When the set is ready the page
// cuts to a flat #513DFC splash with bold white centred copy 'Tada! Browse your custom designs', and then the results page draws:
// a name field, a slogan field, three colour discs and a row of icon chips over a grid of logo cards, which fade up from a low
// opacity (the footage catches one card at about 0.35) one after another.
// Adapted to ten images: the grid is two rows of five cards; each card sits behind a white cover that thins from about 0.65 to
// nothing while its picture rises from about 0.35 opacity to full (the image itself never carries the opacity), the ten cards
// following one another in strict reading order. Omitted: the Looka wordmark and every pricing / plan chrome, the macOS window
// frame of the capture (traffic lights, hamburger), and the 2025 editor's separate 'Variations loading...' panel hold. The
// footage's logos are never reproduced: every card is our own meme and no logo is drawn.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lka';
const ROOT_H = 322, COLS = 5, GAP = 8;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; overflow: hidden; border-radius: 10px; background: #fdfdfd; color: #2b2b3b; font-family: ${UI_FONT}; }
.${P}-bar { position: absolute; left: 0; right: 0; top: 0; z-index: 4; height: 3px; background: #513dfc; }
.${P}-wait { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding-bottom: 22px; background: #fdfdfd; }
.${P}-gl { display: block; font-size: 16px; font-weight: 400; letter-spacing: .1px; line-height: 22px; color: #c9c9d9; white-space: nowrap; }
.${P}-gl b { font-weight: 400; }
.${P}-tada { position: absolute; inset: 0; z-index: 3; display: flex; align-items: center; justify-content: center; background: #513dfc; }
.${P}-tada span { display: block; font-size: 20px; font-weight: 700; letter-spacing: -.1px; line-height: 26px; color: #fff; white-space: nowrap; }
.${P}-res { position: absolute; inset: 0; display: flex; flex-direction: column; }
.${P}-top { flex: none; display: flex; align-items: center; gap: 8px; box-sizing: border-box; height: 48px; padding: 3px 18px 0; background: #fff; box-shadow: 0 1px 0 #ececf3; }
.${P}-fld { display: flex; align-items: center; box-sizing: border-box; height: 22px; padding: 0 9px; border-radius: 4px; background: #f5f5fa; font-size: 8px; color: #2b2b3b; white-space: nowrap; }
.${P}-fld.${P}-nm { width: 98px; }
.${P}-fld.${P}-sl { width: 98px; color: #a7a7b6; }
.${P}-cols { display: flex; align-items: center; gap: 5px; margin-left: 6px; }
.${P}-cols i { display: block; width: 14px; height: 14px; border-radius: 50%; }
.${P}-chips { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.${P}-chips i { display: block; box-sizing: border-box; width: 18px; height: 18px; border-radius: 4px; background: #f5f5fa; box-shadow: inset 0 0 0 1px #ececf3; }
.${P}-chips i::after { content: ""; display: block; width: 8px; height: 8px; margin: 5px; border-radius: 50%; background: #2b2b3b; opacity: .72; }
.${P}-chips i:nth-child(2)::after { border-radius: 2px; transform: rotate(45deg); }
.${P}-chips i:nth-child(3)::after { border-radius: 4px 4px 1px 1px; width: 5px; margin: 5px 6.5px; }
.${P}-chips i:nth-child(4)::after { border-radius: 2px; }
.${P}-chips i:nth-child(5)::after { opacity: .2; }
.${P}-g { flex: none; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; padding: 18px 18px 0; }
.${P}-t { position: relative; aspect-ratio: 1 / 1.16; border-radius: 6px; overflow: hidden; background: #f3f2fb; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cover { position: absolute; inset: 0; background: #f6f5fd; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const WAIT_END = 0.52;                             // 'Generating Logos' hands the page to the indigo splash
const TADA_END = 0.84;                             // the splash hands the page to the results grid
const DOT = 0.115;                                 // one dot step of the one-two-three cycle
const FADE = 0.16;                                 // a card rises from about 0.35 to full over this long
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * 0.0711);   // card i is fully up (reading order), the last at 1.68
const START = 0.35;                                // the opacity a card first shows at, the footage's own

export default {
  id: 'looka',
  label: 'Looka logo maker (2019)',
  source: {
    platform: "Looka's logo maker wizard, looka.com (first-party screen capture on YouTube, 2019-04-01, macOS window with a thin indigo accent bar)",
    feature: "a bare #FDFDFD page under a thin indigo bar with one centred faint #C9C9D9 string 'Generating Logos' whose dot suffix cycles 1-2-3 (no spinner, no percentage), a flat #513DFC splash 'Tada! Browse your custom designs', then a results page (name field, slogan field, three colour discs, icon chips) whose logo cards fade up from about 0.35 opacity one after another (adapted to 10: two rows of five cards behind covers, landing in reading order; the Looka wordmark, pricing chrome and window frame are omitted)",
    refs: [{ url: 'https://www.youtube.com/watch?v=dcXfE3f7IWk', id: 'dcXfE3f7IWk', published: '2019-04-01', retrieved: '2026-10-14', window: 't=22.0-26.5 s (first-party)' }],
    extrapolated: [
      'ten cards in two rows of five landing one after another in strict reading order (the footage shows a 2x2 grid with the last card still fading in)',
      "the length of each stage: the footage joins the 'Generating Logos' hold already in progress (2.5 s seen, a lower bound), the splash lasts about 1.5 s",
      'the staggered fade (about 0.16 s per card, a new card starting every 0.07 s), where the footage shows only one card caught at about 0.35 opacity',
      "the pending slots before a card starts to rise (a pale lavender slot; the footage's grid is already drawn)",
      'the tile pictures themselves (the footage shows Looka sample logos, never reproduced)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'looka');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cover"></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-bar"></div><div class="${P}-wait"><span class="${P}-gl">Generating Logos<b class="${P}-d1">.</b><b class="${P}-d2">.</b><b class="${P}-d3">.</b></span></div><div class="${P}-tada" style="visibility: hidden"><span>Tada! Browse your custom designs</span></div><div class="${P}-res" style="visibility: hidden"><div class="${P}-top"><div class="${P}-fld ${P}-nm">Muse Memes</div><div class="${P}-fld ${P}-sl">Add slogan</div><div class="${P}-cols"><i style="background: #4a90e2"></i><i style="background: #9370db"></i><i style="background: #e5a0d5"></i></div><div class="${P}-chips"><i></i><i></i><i></i><i></i><i></i></div></div><div class="${P}-g">${tiles.map(cell).join('')}</div></div></div>`);
    const wait = root.querySelector(`.${P}-wait`), tada = root.querySelector(`.${P}-tada`), res = root.querySelector(`.${P}-res`);
    const dots = [1, 2, 3].map((n) => root.querySelector(`.${P}-d${n}`));
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

        // 1 - the bare page: the dot suffix cycles one, two, three
        const n = 1 + (Math.floor(Math.max(0, s) / DOT + 1e-6) % 3);
        put('n', n, (v) => { dots.forEach((d, i) => { d.style.visibility = i < v ? '' : 'hidden'; }); });
        put('w', s < WAIT_END, (v) => { wait.style.visibility = v ? '' : 'hidden'; });

        // 2 - the flat indigo splash
        put('t', s >= WAIT_END && s < TADA_END, (v) => { tada.style.visibility = v ? '' : 'hidden'; });

        // 3 - the results page; its cards rise one after another from about 0.35 opacity (the cover thins, never the picture)
        put('r', s >= TADA_END, (v) => { res.style.visibility = v ? '' : 'hidden'; });
        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.cover.style.display = 'none'; c.cover.style.opacity = ''; }
            else { c.cover.style.display = ''; c.cover.style.opacity = f > 0 ? ((1 - START) * (1 - f)).toFixed(3) : ''; }
          });
        });
      },
    };
  },
};
