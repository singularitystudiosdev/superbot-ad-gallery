// Pomelli (Google Labs, 2025-26): the two waits of the marketing-campaign generator, read from three YouTube walkthroughs (0AbtXEBXtKM 2026-02-22, 27I_Ft--v-8
// 2025-12-12, lTcdfaPUyU4 2026-06-18; frames reveal-refs/pomelli/frames/bm_*.png, spec .tmp/clone-9e82faf1/reveal-refs/pomelli/spec.json, confidence 0.62).
// Stage 1 is the 'Generating your Business DNA' interstitial: ONE centred dark rounded card with a soft halo, the serif-italic title, a two-line explanation, a lime
// stadium chip that swaps its task sentence in place ('Studying your brand values' -> 'Summarizing your business' -> 'Determining your visual aesthetic'), a glowing
// white mock of the customer's own website inside the card, a URL pill under it and, OUTSIDE the card, the grey clock line 'About 10 minutes left'. Stage 2 is the
// 'Campaign' page: a left rail (campaign name chip, the lime user bubble) and a grid of tall portrait tiles each washed edge to edge in the brand's olive gradient;
// every pending tile carries its own footer, a small lime circular arc plus the lime caption 'About N minutes left', and a tile hard-swaps to its finished creative
// in place when it lands, the lime '+ Add Creative' pill staying below the grid. No percentage, spinner, bar, queue or cancel control exists on either wait.
// Omitted: the Pomelli / Google Labs wordmark, the EXPERIMENT badge, the avatar, the 'Animate' promo and pills (upsell), and every real brand (the site mock is
// generic blocks of our own with a placeholder address). Every picture is OUR meme, system UI face and a generic serif stack only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-pom';
const ROOT_W = 560, ROOT_H = 410;
const SERIF = "Georgia, 'Times New Roman', 'Noto Serif', serif";
const LIME = '#d9e58a';
const COLS = 5, TILE_W = 81, TILE_H = 134, GAP = 7;                        // tall portrait tiles (0.60), five columns by two rows
const GRID_X = 120, GRID_Y = 100;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0e0e0e; color: #c9c9c4; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .08); }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: #0e0e0e; }
.${P}-bk { position: absolute; left: 12px; top: 12px; height: 17px; box-sizing: border-box; padding: 0 8px 0 6px; border-radius: 9px; background: #1c1c1b; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06); display: flex; align-items: center; gap: 4px; margin: 0; font-size: 7.4px; line-height: 17px; font-weight: 500; color: ${LIME}; white-space: nowrap; }
.${P}-bk svg { flex: none; width: 7px; height: 7px; fill: none; stroke: ${LIME}; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cd { position: absolute; left: 160px; top: 16px; box-sizing: border-box; width: 240px; height: 330px; border-radius: 16px; background: #1b1c1b; box-shadow: 0 0 0 1px rgba(255, 255, 255, .06), 0 -4px 22px rgba(255, 255, 255, .13), 0 0 26px rgba(217, 229, 138, .13); }
.${P}-tt { position: absolute; left: 0; right: 0; top: 17px; margin: 0; text-align: center; font-family: ${SERIF}; font-style: italic; font-size: 16px; line-height: 19px; font-weight: 400; color: #f1f1ee; }
.${P}-bd { position: absolute; left: 0; right: 0; top: 64px; margin: 0; text-align: center; font-size: 7.4px; line-height: 10.5px; color: #a1a19d; }
.${P}-ch { position: absolute; left: 0; right: 0; top: 96px; display: flex; justify-content: center; }
.${P}-ci { box-sizing: border-box; height: 17px; padding: 0 9px 0 6px; border-radius: 9px; background: ${LIME}; color: #20250c; display: flex; align-items: center; gap: 4px; margin: 0; font-size: 7.2px; line-height: 17px; font-weight: 500; white-space: nowrap; }
.${P}-ci svg { flex: none; width: 7.5px; height: 7.5px; fill: #20250c; }
.${P}-mk { position: absolute; left: 16px; top: 126px; width: 208px; height: 150px; box-sizing: border-box; border-radius: 5px; background: #f6f1ea; overflow: hidden; box-shadow: 0 0 14px rgba(255, 255, 255, .16), 0 0 0 1px rgba(255, 255, 255, .25); }
.${P}-mn { position: absolute; left: 0; right: 0; top: 0; height: 11px; background: #3b2f2a; }
.${P}-mn i { position: absolute; top: 4.5px; height: 2px; border-radius: 1px; background: rgba(255, 255, 255, .55); }
.${P}-mb { position: absolute; left: 0; right: 0; top: 11px; height: 14px; background: #fffdf9; }
.${P}-mb i { position: absolute; top: 6px; height: 2px; border-radius: 1px; background: #8e857d; }
.${P}-mh { position: absolute; left: 0; right: 0; top: 25px; height: 78px; background: linear-gradient(100deg, #efe3d4 0%, #e9d6c0 55%, #dcc2a8 100%); }
.${P}-mh i { position: absolute; display: block; }
.${P}-mt { position: absolute; left: 0; right: 0; top: 103px; bottom: 0; background: #fffdf9; }
.${P}-mt i { position: absolute; top: 3px; bottom: 0; width: 100px; background: #8a0f28; }
.${P}-mt b { position: absolute; top: 33px; height: 5px; width: 30px; border-radius: 1px; background: #f6efe9; }
.${P}-ur { position: absolute; left: 16px; right: 16px; top: 288px; height: 22px; box-sizing: border-box; border-radius: 11px; background: #232422; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .07); display: flex; align-items: center; justify-content: center; gap: 5px; margin: 0; font-size: 7.6px; line-height: 22px; color: #e7e8e3; white-space: nowrap; }
.${P}-ur svg { flex: none; width: 8px; height: 8px; fill: none; stroke: ${LIME}; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-lf { position: absolute; left: 0; right: 0; top: 358px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 7.4px; line-height: 12px; color: #8f8f8a; }
.${P}-lf svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #8f8f8a; stroke-width: 1.2; stroke-linecap: round; }
.${P}-cb { position: absolute; left: 12px; top: 12px; }
.${P}-rl { position: absolute; left: 12px; top: 46px; width: 98px; }
.${P}-nm { box-sizing: border-box; padding: 7px 8px 8px; border-radius: 9px; background: #1c1c1b; }
.${P}-nm p { margin: 0; }
.${P}-n1 { font-size: 7.4px; line-height: 9.6px; font-weight: 500; color: #ecece8; }
.${P}-n2 { margin-top: 5px !important; font-size: 6px; line-height: 8.2px; color: #9d9d98; }
.${P}-um { margin: 9px 0 0 12px; box-sizing: border-box; padding: 6px 8px; border-radius: 9px 9px 2px 9px; background: ${LIME}; color: #20250c; font-size: 6.8px; line-height: 9px; font-weight: 500; }
.${P}-ct { position: absolute; left: ${GRID_X}px; width: ${COLS * TILE_W + (COLS - 1) * GAP}px; top: 28px; margin: 0; text-align: center; font-family: ${SERIF}; font-style: italic; font-size: 20px; line-height: 24px; color: #f1f1ee; }
.${P}-cs { position: absolute; left: ${GRID_X}px; width: ${COLS * TILE_W + (COLS - 1) * GAP}px; top: 60px; margin: 0; text-align: center; font-size: 7px; line-height: 10px; color: #a1a19d; }
.${P}-g { position: absolute; left: ${GRID_X}px; top: ${GRID_Y}px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 8px; overflow: hidden; background: #1a1a19; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #4a5428; background-image: radial-gradient(ellipse at 50% 52%, #6f7c3b 0%, #55612f 42%, #343b1b 78%, #2a2f17 100%); background-size: 170% 150%; background-repeat: no-repeat; }
.${P}-ft { position: absolute; left: 0; right: 0; bottom: 6px; height: 11px; display: flex; align-items: center; justify-content: center; gap: 3px; }
.${P}-ar { flex: none; width: 10px; height: 10px; }
.${P}-ar circle { fill: none; stroke-width: 1.5; stroke-linecap: round; }
.${P}-tr { stroke: rgba(217, 229, 138, .22); }
.${P}-sw { stroke: ${LIME}; }
.${P}-et { margin: 0; font-size: 5.8px; line-height: 11px; color: #d4df86; white-space: nowrap; }
.${P}-mo { position: absolute; right: 5px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: ${LIME}; }
.${P}-mo i { position: absolute; left: 5.2px; width: 1.6px; height: 1.6px; border-radius: 50%; background: #20250c; }
.${P}-ad { position: absolute; left: ${GRID_X}px; width: ${COLS * TILE_W + (COLS - 1) * GAP}px; top: 380px; display: flex; justify-content: center; }
.${P}-ap { box-sizing: border-box; height: 22px; padding: 0 12px 0 9px; border-radius: 11px; background: ${LIME}; color: #20250c; display: flex; align-items: center; gap: 4px; margin: 0; font-size: 8px; line-height: 22px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 8px rgba(0, 0, 0, .35); }
.${P}-ap svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #20250c; stroke-width: 1.8; stroke-linecap: round; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const CAMP = 0.6;                                  // the Business DNA card hands over to the Campaign page of pending tiles
const CHIP = [0, 0.2, 0.4];                        // the DNA chip swaps its task sentence in place
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // tile i hands over to its creative (strict reading order), the last at 1.68
const STEP = 1.2;                                  // the per-tile ETA steps from 3 to 2 minutes (extrapolated: the decrement itself was never captured)
const TURN = 540;                                  // the footer arc's travel, degrees per layout second

const CHIPS = ['Studying your brand values', 'Summarizing your business', 'Determining your visual aesthetic'];
const f1 = (v) => v.toFixed(1);
const SPARK = '<svg viewBox="0 0 10 10"><path d="M4 .6 5 3 7.4 4 5 5 4 7.4 3 5 .6 4 3 3ZM8 5.6 8.6 7 10 7.6 8.6 8.2 8 9.6 7.4 8.2 6 7.6 7.4 7Z"/></svg>';
const R = 3.9, CIRC = 2 * Math.PI * R;
const arc = `<svg class="${P}-ar" viewBox="0 0 10 10"><circle class="${P}-tr" cx="5" cy="5" r="${R}"/><g class="${P}-ag"><circle class="${P}-sw" cx="5" cy="5" r="${R}" stroke-dasharray="${(CIRC * 0.72).toFixed(2)} ${(CIRC * 0.28).toFixed(2)}"/></g></svg>`;
const dots = `<i style="top: 2.7px"></i><i style="top: 5.2px"></i><i style="top: 7.7px"></i>`;
const mockSite = `<div class="${P}-mk">`
  + `<div class="${P}-mn"><i style="left: 56px; width: 70px"></i><i style="left: 8px; width: 22px"></i><i style="right: 8px; width: 16px"></i></div>`
  + `<div class="${P}-mb"><i style="left: 74px; width: 60px"></i><i style="left: 10px; width: 20px"></i><i style="right: 10px; width: 24px"></i></div>`
  + `<div class="${P}-mh"><i style="left: 128px; top: 12px; width: 18px; height: 58px; border-radius: 4px 4px 3px 3px; background: #f4efe7; box-shadow: 0 2px 6px rgba(80, 50, 30, .25)"></i>`
  + `<i style="left: 150px; top: 22px; width: 18px; height: 48px; border-radius: 4px 4px 3px 3px; background: #f9f5ee; box-shadow: 0 2px 6px rgba(80, 50, 30, .25)"></i>`
  + `<i style="left: 112px; top: 6px; width: 22px; height: 22px; border-radius: 50%; background: #d6679a; opacity: .92"></i>`
  + `<i style="left: 168px; top: 50px; width: 20px; height: 20px; border-radius: 50%; background: #e48a3c"></i>`
  + `<i style="left: 14px; top: 28px; width: 70px; height: 5px; border-radius: 2px; background: rgba(120, 80, 60, .55)"></i>`
  + `<i style="left: 14px; top: 38px; width: 48px; height: 5px; border-radius: 2px; background: rgba(120, 80, 60, .4)"></i>`
  + `<i style="left: 14px; top: 50px; width: 40px; height: 11px; background: #fffdf9; box-shadow: 0 0 0 1px rgba(80, 50, 30, .18)"></i></div>`
  + `<div class="${P}-mt"><i style="left: 2px"><b style="left: 35px"></b></i><i style="left: 106px"><b style="left: 35px"></b></i></div></div>`;

export default {
  id: 'pomelli',
  label: 'Google Pomelli (2025)',
  source: {
    platform: "Pomelli by Google Labs (labs.google/pomelli), the marketing-campaign generator in desktop Chrome and a vertical phone capture, English UI, captured from third-party YouTube walkthroughs",
    feature: "two waits on one product: (1) the 'Generating your Business DNA' interstitial, a single centred dark card holding a serif title, a two-line explanation, a lime task chip that swaps its sentence in place, a glowing mock of the user's own website and a URL pill, with the grey clock line 'About 10 minutes left' under the card; (2) the Campaign page, where 'Add Creative' inserts tall portrait tiles painted edge to edge in the brand's olive gradient, each with its own footer (a small lime circular arc and 'About N minutes left'), beside finished creatives, with the lime '+ Add Creative' pill under the grid; a pending tile becomes its creative in place",
    capture: {
      url: 'https://www.youtube.com/watch?v=0AbtXEBXtKM',
      date: '2026-02-22',
      timestamps: "video 0AbtXEBXtKM 'From Product Shot to Full Campaign: The Pomelli Workflow': DNA card submitted t = 146 s, chip 'Studying your brand values' t = 152 s, 'Summarizing your business' t = 160 s, 'Determining your visual aesthetic' t = 168 and 176 s, 'Your Business DNA' page t = 190 s (frames bm_dna_t152 .. bm_dna_t190); video 27I_Ft--v-8 'How to Create Branded Social Media Videos with Google Pomelli AI in SECONDS' (2025-12-12): three pending tiles 'About 2 minutes left' t = 199 - 205 s, first creatives t = 207 s, 'About 3 minutes left' beside finished creatives t = 268 s (frames bm_camp_t199 .. bm_camp_t268); video lTcdfaPUyU4 (2026-06-18): the DNA card again, chip 'Analyzing your website', t = 142 s (frame bm_mobile_dna_t142)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=0AbtXEBXtKM', published: '2026-02-22', retrieved: '2026-10-15', note: "the Business DNA card: title, explanation, the three rotating task sentences, the site mock, the URL pill and 'About 10 minutes left'" },
      { url: 'https://www.youtube.com/watch?v=27I_Ft--v-8', published: '2025-12-12', retrieved: '2026-10-15', note: "the Campaign page: tall olive-gradient pending tiles with the lime arc and 'About 2 / 3 minutes left' footer, '+ Add Creative', the mixed grid of finished and pending tiles" },
      { url: 'https://www.youtube.com/watch?v=lTcdfaPUyU4', published: '2026-06-18', retrieved: '2026-10-15', note: 'vertical capture of the same DNA interstitial six months later, confirming the strings and the card unchanged' },
    ],
    extrapolated: [
      "both waits in one beat: the recordings show them as two separate screens minutes apart (the Business DNA card, then later a campaign); here the card runs for the first third of the shared 1.84 s beat and the Campaign page takes over, the ten tiles landing in strict reading order during the rest",
      "ten tiles from three (plus a fourth) observed: the recording's grid holds three portrait tiles in a row growing into a masonry; here ten equal tall tiles sit in a 5 x 2 grid, all in view with no scroll, each landing on its own clock",
      "all timing: the DNA chip rotates every 8 s in the recording and the campaign tiles resolve after about 8 s on a cut video against a printed ETA of 2 minutes; here the three chip sentences swap at 0.2 s intervals and the tiles land 0.07 s apart",
      "the 'About N minutes left' decrement: the recordings show 2 on one batch and 3 on a later one and never a live count-down (two DNA samples 34 s apart both read 'About 10 minutes left'); here every pending tile reads 3 and steps to 2 mid-wait, the DNA line holds at 10",
      "the arc is a lime ring with a gap spun by a pure function of t (the recording's arc is a small open ring whose motion was not sampled), frozen when its tile lands; the wash drift is ours too (the recording shows only a very slow drift of the olive gradient)",
      "the finished creatives are our own memes (the recording's are the brand's photographs and headline type); the site mock is generic blocks with the placeholder address https://yourstudio.example/ instead of the customer's brand and address",
      "the left rail carries the recording's verbatim campaign name chip '25% Off: Gift Greenery & Calm.' and its body, plus a lime user bubble of our own wording (the recording shows an 'Animate' promo card there, omitted as upsell)",
      "the olive wash is the recording's campaign colour; the brand-extracted hue of a different brand was never confirmed to differ",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'pomelli');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div><div class="${P}-ft">${arc}<p class="${P}-et"></p></div>${i === 2 ? `<div class="${P}-mo">${dots}</div>` : ''}</div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-sc ${P}-cp">`
      + `<p class="${P}-bk"><svg viewBox="0 0 10 10"><path d="M8.5 5H1.8M4.6 2 1.6 5 4.6 8"/></svg>Campaigns</p>`
      + `<div class="${P}-rl"><div class="${P}-nm"><p class="${P}-n1">25% Off: Gift Greenery &amp; Calm.</p><p class="${P}-n2">Stress-reduction and the calming effect of indoor plants, especially during the busy holiday season.</p></div><div class="${P}-um">Ten Muse memes, one picture per tile</div></div>`
      + `<p class="${P}-ct">Campaign</p><p class="${P}-cs">Here is a series of creatives to post for this campaign. You can edit, delete or generate more.</p>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-ad"><p class="${P}-ap"><svg viewBox="0 0 10 10"><path d="M5 1.8v6.4M1.8 5h6.4"/></svg>Add Creative</p></div>`
      + `</div>`
      + `<div class="${P}-sc ${P}-dn">`
      + `<p class="${P}-bk"><svg viewBox="0 0 10 10"><path d="M8.5 5H1.8M4.6 2 1.6 5 4.6 8"/></svg>Back</p>`
      + `<div class="${P}-cd"><p class="${P}-tt">Generating your Business<br/>DNA</p>`
      + `<p class="${P}-bd">We're researching and analyzing your business.<br/>It will take several minutes. Feel free to come back later.</p>`
      + `<div class="${P}-ch"><p class="${P}-ci">${SPARK}<span class="${P}-cx"></span></p></div>`
      + mockSite
      + `<p class="${P}-ur"><svg viewBox="0 0 10 10"><path d="M4.2 5.8a2 2 0 0 0 2.8 0l1.6-1.6a2 2 0 0 0-2.8-2.8l-.6.6M5.8 4.2a2 2 0 0 0-2.8 0L1.4 5.8a2 2 0 0 0 2.8 2.8l.6-.6"/></svg>https://yourstudio.example/</p></div>`
      + `<p class="${P}-lf"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.8"/><path d="M5 2.8V5l1.4.9"/></svg>About 10 minutes left</p>`
      + `</div></div>`);
    const cp = root.querySelector(`.${P}-cp`);
    const dn = root.querySelector(`.${P}-dn`);
    const cx = root.querySelector(`.${P}-cx`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({
      im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), ft: n.querySelector(`.${P}-ft`), mo: n.querySelector(`.${P}-mo`), ag: n.querySelector(`.${P}-ag`), et: n.querySelector(`.${P}-et`),
    }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const camp = s >= CAMP;
        const chip = s >= CHIP[2] ? 2 : s >= CHIP[1] ? 1 : 0;
        const mins = s >= STEP ? 2 : 3;

        // the Business DNA card, then the Campaign page; each screen is shown by visibility alone
        put('sc', camp, (v) => { dn.style.visibility = v ? 'hidden' : ''; cp.style.visibility = v ? '' : 'hidden'; });
        put('chip', chip, (v) => { cx.textContent = CHIPS[v]; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // wash, footer and overflow chip until LAND[i], then a hard swap to the creative (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
            c.ft.style.display = v ? 'none' : '';
            if (c.mo) c.mo.style.display = v ? 'none' : '';
          });
          const te = Math.min(Math.max(s - CAMP, 0), Math.max(LAND[i] - CAMP, 0));   // this tile's clock stops at its landing
          put(`a${i}`, f1((te * TURN + i * 37) % 360), (v) => { c.ag.setAttribute('transform', `rotate(${v} 5 5)`); });
          put(`d${i}`, f1(50 + 30 * Math.sin((te * 0.9 + i * 0.7) * Math.PI)), (v) => { c.cv.style.backgroundPosition = `${v}% ${f1(48 + 6 * Math.cos((te * 0.7 + i * 0.5) * Math.PI))}%`; });
          put(`e${i}`, done ? 0 : mins, (v) => { c.et.textContent = v ? `About ${v} minutes left` : ''; });
        });
      },
    };
  },
};
