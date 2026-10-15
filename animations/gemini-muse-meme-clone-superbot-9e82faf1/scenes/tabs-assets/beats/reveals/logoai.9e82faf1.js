// LogoAI's logo maker, logoai.com/make (YouTube nmyGNu5FkRs 'Effortless Logo Creation with AI', The AI Review, 2023-04-26,
// t=401.0-422.5 s; spec .tmp/clone-9e82faf1/reveal-refs/logoai/spec.json, confidence 0.6; frames au_logoai_402_gen.png,
// au_logoai_410_gen.png). Once the wizard's last step is done the page keeps its white nav with the four wizard steps (Name, Color,
// Fonts, Symbol) over a #F6F6F6 body and a bold left-aligned heading 'We are generating logos for you...'. Under it the result
// slots are white rounded cards with a soft drop shadow, each holding a heavily blurred grey skeleton (a soft disc over a rounded
// bar) at about 10% opacity that pulses a little. There is no spinner, no percentage and no countdown, and the heading's dots are a
// static literal. After ~21 s the heading flips to 'Click on the logo you like the most' and the cards take their finished logos.
// Adapted to ten images: ten cards (4 + 4 + 2) on the grid; the header flips and the cards then hand their skeleton over to a
// picture one after another in strict reading order (the footage swaps the whole grid in one cut). Omitted: the logoai mark at the
// far left of the nav, every pricing / plan chrome, and the macOS browser chrome and webcam inset of the capture. The footage's
// logos are never reproduced: every card is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lgo';
const ROOT_H = 440, COLS = 4, GAP = 10;
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; overflow: hidden; border-radius: 10px; background: #f6f6f6; color: #3a3a3a; font-family: ${UI_FONT}; }
.${P}-nav { position: relative; flex: none; display: flex; align-items: center; justify-content: center; gap: 26px; box-sizing: border-box; height: 42px; background: #fff; box-shadow: 0 1px 0 #ececec; }
.${P}-st { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 6.5px; font-weight: 500; line-height: 8px; color: #333; }
.${P}-st i { display: block; height: 12px; font-size: 11px; font-style: normal; font-weight: 800; line-height: 12px; color: #2e2e2e; }
.${P}-st u { display: block; width: 11px; height: 11px; margin: 0.5px 0; border-radius: 50% 50% 50% 4px; background: #2e2e2e; }
.${P}-st s { display: grid; grid-template-columns: 4px 4px; gap: 1.5px; width: 9.5px; height: 12px; align-content: center; text-decoration: none; }
.${P}-st s b { display: block; width: 4px; height: 4px; border-radius: 50%; background: #2e2e2e; }
.${P}-st s b:nth-child(n+3) { border-radius: 1px; }
.${P}-heart { position: absolute; right: 16px; top: 50%; width: 11px; height: 11px; margin-top: -5px; fill: none; stroke: #555; stroke-width: 1.6; stroke-linejoin: round; }
.${P}-hd { flex: none; box-sizing: border-box; height: 52px; padding: 22px 0 0 52px; font-size: 13px; font-weight: 700; line-height: 18px; color: #3a3a3a; white-space: nowrap; }
.${P}-g { flex: none; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; padding: 4px 52px 0; }
.${P}-t { position: relative; aspect-ratio: 1.06 / 1; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 3px 9px rgba(0, 0, 0, .09); }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cover { position: absolute; inset: 0; background: #fff; }
.${P}-sk { position: absolute; left: 50%; top: 50%; width: 58px; height: 44px; margin: -22px 0 0 -29px; filter: blur(4px); opacity: .1; }
.${P}-sk i { position: absolute; left: 16px; top: 0; width: 26px; height: 26px; border-radius: 50%; background: #7c7c7c; }
.${P}-sk b { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; border-radius: 4px; background: #9a9a9a; }
`;

const HEAD1 = 'We are generating logos for you...';
const HEAD2 = 'Click on the logo you like the most';
const STEPS = [['Name', '<i>T</i>'], ['Color', `<u></u>`], ['Fonts', '<i>A</i>'], ['Symbol', '<s><b></b><b></b><b></b><b></b></s>']];
const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ISSUE = 0.1;                                 // the ten result slots are drawn
const FLIP = 0.62;                                 // the heading flips to 'Click on the logo you like the most'
const LAND = Array.from({ length: 10 }, (_, i) => 0.78 + i * 0.1);   // card i swaps its skeleton for the picture (reading order), the last at 1.68
const FADE = 0.05;                                 // the skeleton's cover thins away over this long before the picture lands
const PULSE = 0.55;                                // the skeleton's slow pulse, in seconds per cycle

export default {
  id: 'logoai',
  label: 'LogoAI (2023)',
  source: {
    platform: 'LogoAI logo maker, logoai.com/make (desktop browser; a tutorial screen recording on YouTube, 2023-04-26)',
    feature: "white nav with the wizard steps Name / Color / Fonts / Symbol over a #F6F6F6 page, the bold heading 'We are generating logos for you...' over white rounded cards with a soft shadow, each holding a heavily blurred grey disc-and-bar skeleton at about 10% opacity (no spinner, no percentage, no countdown); the heading then flips to 'Click on the logo you like the most' and the cards take their pictures (adapted to 10: a 4 + 4 + 2 card grid taking pictures one after another in reading order; the logoai mark and pricing chrome are omitted)",
    refs: [{ url: 'https://www.youtube.com/watch?v=nmyGNu5FkRs', id: 'nmyGNu5FkRs', published: '2023-04-26', retrieved: '2026-10-14', window: 't=401.0-422.5 s' }],
    extrapolated: [
      'ten cards in a 4 + 4 + 2 grid (the footage resolves one card and about six by eye, three across, and the grid is white on white)',
      'the cards taking their pictures one after another in strict reading order (the footage swaps the finished grid in one cut after the heading flips)',
      "the length of the generating hold and of the swap: the footage holds ~21 s, here it is compressed to the beat's window",
      "the skeleton's pulse: the spec only says it appears to pulse very slightly, so a slow +-40% opacity pulse around the 10% is drawn from t",
      'the skeleton shape: a soft grey disc over a rounded bar, read from a 1080p frame where it barely resolves',
      "all ten slots drawn from the start (the footage's first frames show one card, the rest of the grid white on white)",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'logoai');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cover"><div class="${P}-sk"><i></i><b></b></div></div></div>`;
    const heart = '<svg class="' + P + '-heart" viewBox="0 0 12 12"><path d="M6 10.6C2.2 7.7 1 6 1 4.2 1 2.8 2.1 1.8 3.4 1.8c1 0 2 .5 2.6 1.5.6-1 1.6-1.5 2.6-1.5C9.9 1.8 11 2.8 11 4.2 11 6 9.8 7.7 6 10.6z"/></svg>';
    const root = x.el(`<div class="${P}"><div class="${P}-nav">${STEPS.map(([n, ic]) => `<div class="${P}-st">${ic}<span>${n}</span></div>`).join('')}${heart}</div><div class="${P}-hd">${x.esc(HEAD1)}</div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div></div>`);
    const head = root.querySelector(`.${P}-hd`), grid = root.querySelector(`.${P}-g`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cover: n.querySelector(`.${P}-cover`), sk: n.querySelector(`.${P}-sk`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.min((t - ctx.cardIn) / k, LAND[9]);   // layout seconds since the card entered; what moves from t stops at the last landing

        // the ten result slots are drawn; the heading flips once the set is ready
        put('iss', s >= ISSUE, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('hd', s >= FLIP, (v) => { head.textContent = v ? HEAD2 : HEAD1; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.cover.style.display = 'none'; c.cover.style.opacity = ''; } else { c.cover.style.display = ''; c.cover.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
          // the skeleton pulses slowly around 10% (a function of t alone, phase differs per card; covered once the card has landed)
          const pulse = (0.1 * (1 + 0.4 * Math.sin(((s / PULSE) + i * 0.17) * Math.PI * 2))).toFixed(3);
          put(`k${i}`, pulse, (v) => { c.sk.style.opacity = v; });
        });
      },
    };
  },
};
