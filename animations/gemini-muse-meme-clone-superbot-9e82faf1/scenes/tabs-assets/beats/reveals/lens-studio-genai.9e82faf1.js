// Lens Studio v5.12 GenAI Suite 'Create new Garment' (Snap, 2025): the wait of one garment, from a third-party screen recording of the desktop tool
// https://www.youtube.com/watch?v=72dS45bHK8I (Bharat XR, 2025-08-06, 1080p, 1637 s, uncut: the idle dialog t=754 s, the Generate click t=755.0 s, the wait t=756.5-762 s, the image lands in one frame at t=763.0 s, settled t=765 s), stills
// reveal-refs/lens-studio-genai/frames/{bharat_t754,bharat_t755,bharat_t756.5,bharat_t758,bharat_t760,bharat_t762,bharat_t763.2,bharat_t765}.png, spec .tmp/clone-9e82faf1/reveal-refs/lens-studio-genai/spec.json, confidence 0.6. The surface is
// a dark macOS tool window titled 'Garment' on a dark desktop, two panes. Left: 'Create new Garment', two info rows, a 'Type' grid of five tiles (T-shirt ringed in blue), a 'Prompt' box with a 'Surprise me' link and a blue
// 'Generate' pill. Right: an idle multicolour orb with four small sparkles over 'Create garment by specifying type and prompt.'. On Generate the button greys, the hint line goes, a small white spinner turns under the orb (the
// sparkles twinkle) and the status bar reads 'Generating garment...' with its own tiny spinner; it ends with a hard swap in one frame: the result fills the right pane, the left button reads 'Regenerate', 'Import to Project'
// turns bright blue and the status bar reports success. Here the orb is our own abstract gradient blob, the type tiles hold plain line glyphs and labels (no garment photos), the info rows are our own wording, the prompt is
// our own, no presenter or person is drawn, and the right pane lands the ten pictures as a 5 x 2 sheet whose empty plates dissolve into their pictures in strict reading order.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lsg';
const ROOT_W = 560, ROOT_H = 460;
const WL = 8, WT = 8, WW = 544, WH = 444;                                    // the window in the root
const TB = 22, LW = 216, FT = 36, SB = 22;                                    // title bar, left column width, footer row, status bar
const BODY = WH - TB - FT - SB;                                               // 364: the body above the footer
const RW = WW - LW - 1;                                                       // the right pane's width, 327
const TW = 60, TH = 71, TG = 4;                                               // a result tile; 5 * 60 + 4 * 4 = 316, 2 * 71 + 4 = 146
const GD_L = Math.floor((RW - (5 * TW + 4 * TG)) / 2), GD_T = Math.floor((BODY - (2 * TH + TG)) / 2);
const OCX = RW / 2, OCY = 150;                                                // the orb's centre in the right pane
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #14161a; color: #c4c9cf; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(10, 12, 16, .6); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-w { position: absolute; left: ${WL}px; top: ${WT}px; box-sizing: border-box; width: ${WW}px; height: ${WH}px; border-radius: 10px; background: #353b43; box-shadow: 0 0 0 1px #0a0b0d, 0 10px 24px rgba(0, 0, 0, .5); overflow: hidden; }
.${P}-tt { position: absolute; left: 0; top: 0; width: ${WW}px; height: ${TB}px; background: #181a1e; text-align: center; font-size: 9px; line-height: ${TB}px; font-weight: 600; color: #bfc4ca; }
.${P}-lt { position: absolute; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: #3a3e45; }
.${P}-lt.${P}-rd { background: #ee5f57; }
.${P}-lc { position: absolute; left: 0; top: ${TB}px; width: ${LW}px; height: ${BODY + FT}px; background: #353b43; }
.${P}-lh { position: absolute; left: 0; top: 0; width: ${LW}px; height: 20px; box-sizing: border-box; border-bottom: 1px solid #2a3037; background: #363d45; text-align: center; font-size: 8.5px; line-height: 20px; font-weight: 600; color: #bcc2c8; }
.${P}-hh { position: absolute; left: 0; top: 26px; width: ${LW}px; text-align: center; font-size: 13px; line-height: 18px; font-weight: 700; color: #c9ced4; }
.${P}-if { position: absolute; left: 11px; box-sizing: border-box; width: ${LW - 22}px; height: 24px; border-radius: 3px; background: #1b212c; }
.${P}-if svg { position: absolute; left: 5px; top: 7px; width: 10px; height: 10px; stroke-width: 1.8; color: #aab1b8; }
.${P}-if p { position: absolute; left: 21px; top: 3px; white-space: normal; width: ${LW - 50}px; font-size: 7.2px; line-height: 9px; color: #aab1b8; }
.${P}-if u { color: #1ea7e6; }
.${P}-tl { position: absolute; left: 11px; font-size: 8px; line-height: 12px; color: #c4cad0; }
.${P}-ty { position: absolute; box-sizing: border-box; width: 58px; height: 70px; border-radius: 5px; background: #2d343c; box-shadow: inset 0 0 0 1.5px #464e57; }
.${P}-ty.${P}-sel { box-shadow: inset 0 0 0 1.5px #1fa8ec, 0 0 0 1px #1fa8ec; background: #313a44; }
.${P}-ty svg { position: absolute; left: 14px; top: 10px; width: 30px; height: 30px; stroke-width: 1.5; color: #8c97a3; }
.${P}-ty.${P}-sel svg { color: #bfe3f6; }
.${P}-ty p { position: absolute; left: 0; right: 0; top: 52px; text-align: center; font-size: 7.8px; line-height: 12px; color: #c4cad0; }
.${P}-pl { position: absolute; left: 11px; font-size: 8px; line-height: 12px; color: #c4cad0; }
.${P}-pl svg { position: absolute; left: 33px; top: 1px; width: 10px; height: 10px; stroke-width: 1.8; color: #aab1b8; }
.${P}-sm { position: absolute; right: 11px; font-size: 8px; line-height: 12px; color: #1ea7e6; text-decoration: underline; }
.${P}-pb { position: absolute; left: 11px; box-sizing: border-box; width: ${LW - 22}px; height: 56px; border-radius: 3px; background: #1b212c; box-shadow: inset 0 0 0 1px #2c343d; padding: 5px 5px; font-size: 8.4px; line-height: 11px; color: #d2d7dc; }
.${P}-ft { position: absolute; left: 0; top: ${TB + BODY}px; width: ${WW}px; height: ${FT}px; box-sizing: border-box; border-top: 1px solid #262c33; }
.${P}-rp { position: absolute; left: ${LW + 1}px; top: ${TB}px; width: ${RW}px; height: ${BODY + FT}px; background: #313b44; box-shadow: -1px 0 0 #20262c; }
.${P}-gb { position: absolute; left: ${(LW - 82) / 2}px; top: ${TB + BODY + 9}px; box-sizing: border-box; width: 82px; height: 18px; border-radius: 9px; background: #17abee; color: #ffffff; text-align: center; font-size: 8.4px; line-height: 18px; font-weight: 600; }
.${P}-gb svg { position: absolute; left: 9px; top: 4px; width: 10px; height: 10px; stroke-width: 1.8; }
.${P}-gb span { display: block; padding-left: 11px; }
.${P}-gb.${P}-ds { background: #2f678c; color: #698ba6; }
.${P}-gb.${P}-rg { background: #4a525b; color: #d3d8dd; }
.${P}-ib { position: absolute; right: 11px; top: ${TB + BODY + 9}px; box-sizing: border-box; width: 104px; height: 18px; border-radius: 3px; background: #2f678c; color: #7ea6c4; text-align: center; font-size: 8px; line-height: 18px; }
.${P}-ib svg { position: absolute; left: 8px; top: 4px; width: 10px; height: 10px; stroke-width: 1.8; }
.${P}-ib span { display: block; padding-left: 12px; }
.${P}-ib.${P}-on { background: #17abee; color: #ffffff; }
.${P}-st { position: absolute; left: 0; top: ${WH - SB}px; width: ${WW}px; height: ${SB}px; background: #2c333a; text-align: center; font-size: 8px; line-height: ${SB}px; color: #b5bcc3; }
.${P}-ss { position: absolute; left: 214px; top: 5px; width: 11px; height: 11px; color: #ffffff; }
.${P}-ss svg { width: 11px; height: 11px; stroke-width: 1.6; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${RW}px; height: ${BODY}px; }
.${P}-or { position: absolute; left: ${OCX - 21}px; top: ${OCY - 20}px; width: 42px; height: 40px; border-radius: 52% 48% 55% 45% / 47% 56% 44% 53%; background: radial-gradient(circle at 36% 30%, rgba(255, 255, 255, .55) 0%, rgba(255, 255, 255, 0) 38%), conic-gradient(from 20deg, #ff7aa8, #ffb35a, #f4e35e, #62d7a4, #4aa8ff, #9b7bff, #ff7aa8); box-shadow: 0 0 16px rgba(140, 160, 255, .3); }
.${P}-sk { position: absolute; }
.${P}-sk svg { width: 100%; height: 100%; stroke-width: 1.5; }
.${P}-hn { position: absolute; left: ${OCX - 70}px; width: 140px; top: ${OCY + 66}px; text-align: center; white-space: normal; font-size: 7.6px; line-height: 10.5px; color: #c0c6cc; }
.${P}-sn { position: absolute; left: ${OCX - 6}px; top: ${OCY + 67}px; width: 12px; height: 12px; color: #ffffff; }
.${P}-sn svg { width: 12px; height: 12px; stroke-width: 1.8; }
.${P}-gd { position: absolute; left: ${GD_L}px; top: ${GD_T}px; display: grid; grid-template-columns: repeat(5, ${TW}px); grid-template-rows: repeat(2, ${TH}px); gap: ${TG}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TW}px; height: ${TH}px; border-radius: 2px; background: #3f4b56; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #3f4b56; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN0 = 0.34;                                 // layout seconds: the idle dialog, then Generate is pressed
const LAND_AT = 1.24;                              // ... the spinner turns until the result swaps in (one frame, as in the footage)
const DIS = 0.14;                                  // one tile's dissolve into its picture (a cover's opacity), layout seconds
const LAND0 = 1.3;
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * ((1.78 - DIS - LAND0) / 9));   // tile i starts to dissolve (strict reading order), the last is done at 1.78
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const STATUS = ['', 'Generating garment...', 'Garment has been successfully generated and could be imported into the project.'];
const PROMPT = 'Muse meme print, bold and bright';   // our own wording, never the footage's
const TYPES = ['Hoodie', 'Sweater', 'T-shirt', 'Dress Suit', 'Bomber'];

const ICONS = {
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.5"/>',
  gen: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
  imp: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  spin: '<path d="M12 3a9 9 0 1 0 9 9" />',
  star: '<path d="M12 2c.8 5.2 4.8 9.2 10 10-5.2.8-9.2 4.8-10 10-.8-5.2-4.8-9.2-10-10 5.2-.8 9.2-4.8 10-10z"/>',
  hoodie: '<path d="M10 5L3 10l3 6 3-1.5V28h14V14.5l3 1.5 3-6-7-5"/><path d="M10 5c1 5 11 5 12 0M12 22h8"/>',
  sweater: '<path d="M11 5L3 11l2 17h4l1-12v13h12V16l1 12h4l2-17-8-6c-1 2-3 3-5 3s-4-1-5-3z"/>',
  tee: '<path d="M10 5L3 10l3 5 3-2v15h14V13l3 2 3-5-7-5c-1 3-3.5 4-6 4s-5-1-6-4z"/>',
  suit: '<path d="M11 5L4 10l2 18h20l2-18-7-5-5 12z"/><path d="M11 5l5 9M21 5l-5 9"/>',
  bomber: '<path d="M11 5L3 11l2 17h4l1-12v13h12V16l1 12h4l2-17-8-6c-1 2-3 3-5 3s-4-1-5-3z"/><path d="M16 8v21M5 25h5M22 25h5"/>',
};
const icon = (k, cls, vb = '0 0 24 24') => `<svg${cls ? ` class="${P}-${cls}"` : ''} viewBox="${vb}">${ICONS[k]}</svg>`;
const GLYPH = ['hoodie', 'sweater', 'tee', 'suit', 'bomber'];
// the four sparkles round the orb: [dx, dy, size, colour, outline?]
const SPK = [[23, -40, 10, '#e9c93e', 0], [46, -32, 17, '#3f9288', 1], [-43, 27, 17, '#3f9288', 1], [-21, 36, 10, '#e9c93e', 0]];

export default {
  id: 'lens-studio-genai',
  label: 'Lens Studio GenAI Garment (2025)',
  source: {
    platform: "Lens Studio 5.12 desktop app on macOS: a floating dark tool window titled 'Garment' on top of the dark IDE, recorded with a presenter face-cam (not drawn here); not a web page",
    feature: "'Create new Garment': pick a type, write a prompt, press Generate; the right pane keeps an idle multicolour orb with sparkles, adds a small spinner and the status bar reads 'Generating garment...'; it ends in a one-frame swap to the result with 'Regenerate' and a blue 'Import to Project' and a success status line",
    capture: {
      url: 'https://www.youtube.com/watch?v=72dS45bHK8I',
      page: 'https://www.youtube.com/watch?v=72dS45bHK8I',
      date: '2025-08-06',
      retrieved: '2026-10-17',
      timestamps: "t = 754 s the idle dialog: T-shirt ringed in blue, prompt typed, the orb and 'Create garment by specifying type and prompt.' (bharat_t754); t = 755.0 s the click on the blue 'Generate' (bharat_t755); t = 756.5 s status bar 'Generating garment...' with a spinner, the button greyed, the hint line gone (bharat_t756.5); t = 758, 760, 762 s the orb with sparkles and a small spinner, unchanged (bharat_t758, bharat_t760, bharat_t762); t = 763.0-763.2 s the result in one frame, 'Regenerate' / 'Import to Project' (bharat_t763.2); t = 765 s settled with the success status line (bharat_t765); 4 fps frame diff over t = 753-767: no cut, one jump at the landing",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=72dS45bHK8I', published: '2025-08-06', retrieved: '2026-10-17', note: 'How to make Snapchat Filters (SnapAR Lenses) using Lens Studio v5.12 (GenAI) | Bharat XR | MoodHack: the only source of the wait, one uncut 8 s generation' },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE portrait garment photo (a person in a tie-dye T-shirt, face masked in the stills) filling the right pane; here the right pane holds the ten pictures as a 5 x 2 sheet of small tiles, each an empty plate dissolving (a cover's opacity) into its picture in strict reading order right after the one-frame swap",
      "the orb: Snap's orb is overlapping pink, yellow, green and blue lobes; here our own abstract blob (a conic swirl of warm and cool colours with a soft highlight and glow) that turns slowly, plus four sparkles at the footage's positions (two small yellow, two larger teal outlines) that twinkle as a pure function of t",
      "the type tiles: the footage's tiles are garment photos on models; here a plain line glyph and the label (Hoodie, Sweater, T-shirt, Dress Suit, Bomber), T-shirt ringed in blue as in the footage",
      "our wording: the two info rows (about guidelines and the terms of use) and the prompt 'Muse meme print, bold and bright' are our own, the footage's rows name the product's terms and its prompt is 'tie dye'; the footage's success line has the spelling 'succesfully', here it is spelt correctly",
      "the pace: the footage waits ~8 s; the beat plays idle -> Generate -> spinner -> swap -> landed in the ~1.8 s window every module of this family uses; the spinner turns as a pure function of t in 30-degree steps",
      "the window: the footage is 740 x 595 px over a dark IDE with tool tiles behind it; here the same two-pane window drawn at 544 x 444 on a plain dark desktop, no menu bar, no IDE, no presenter bubble, no click ring or mouse cursor",
      "omitted from the footage: the 'Surprise me' behaviour (the link is drawn), the second spinner's exact glyph (a plain open ring turns instead), any brand mark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'lens-studio-genai');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const tys = TYPES.map((l, i) => `<div class="${P}-ty${i === 2 ? ` ${P}-sel` : ''}" style="left: ${11 + (i % 3) * 64}px; top: ${126 + Math.floor(i / 3) * 76}px">${icon(GLYPH[i], '', '0 0 32 32')}<p>${l}</p></div>`).join('');
    const sks = SPK.map(([dx, dy, sz, col, ol], i) => `<div class="${P}-sk" style="left: ${OCX + dx - sz / 2}px; top: ${OCY + dy - sz / 2}px; width: ${sz}px; height: ${sz}px; color: ${col}"><svg viewBox="0 0 24 24" style="${ol ? '' : `fill: ${col}; stroke: none`}">${ICONS.star}</svg></div>`).join('');
    const root = x.el(`<div class="${P}"><div class="${P}-w">`
      + `<div class="${P}-tt"><span class="${P}-lt ${P}-rd" style="left: 9px"></span><span class="${P}-lt" style="left: 22px"></span><span class="${P}-lt" style="left: 35px"></span>Garment</div>`
      // the left column: the same in every state
      + `<div class="${P}-lc"><p class="${P}-lh">Garment</p><p class="${P}-hh">Create new Garment</p>`
      + `<div class="${P}-if" style="top: 52px">${icon('info')}<p>Check the guidelines for examples, prompting tips and usage notes.</p></div>`
      + `<div class="${P}-if" style="top: 80px">${icon('info')}<p>By using this feature you agree to the generative tool terms.</p></div>`
      + `<p class="${P}-tl" style="top: 111px">Type</p>${tys}`
      + `<p class="${P}-pl" style="top: 278px">Prompt${icon('info')}</p><p class="${P}-sm" style="top: 278px">Surprise me</p><div class="${P}-pb" style="top: 294px">${PROMPT}</div></div>`
      + `<div class="${P}-rp">`
      + `<div class="${P}-g ${P}-id"><div class="${P}-or"></div>${sks}<p class="${P}-hn">Create garment by specifying type and prompt.</p><div class="${P}-sn" style="visibility: hidden;">${icon('spin', 'sa')}</div></div>`
      + `<div class="${P}-g ${P}-ld" style="visibility: hidden;"><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `</div>`
      + `<div class="${P}-ft"></div>`
      + `<div class="${P}-gb">${icon('gen')}<span class="${P}-gx">Generate</span></div>`
      + `<div class="${P}-ib">${icon('imp')}<span>Import to Project</span></div>`
      + `<p class="${P}-st"><span class="${P}-ss" style="visibility: hidden;">${icon('spin', 'sb')}</span><span class="${P}-sx"></span></p>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sa = q('sa'), sb = q('sb'), id = q('id'), ld = q('ld'), hn = q('hn'), sn = q('sn'), or = q('or'), gb = q('gb'), gx = q('gx'), ib = q('ib'), st = q('st'), sx = q('sx'), ss = q('ss');
    const sks2 = [...root.querySelectorAll(`.${P}-sk`)];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const ph = s < GEN0 ? 0 : s < LAND_AT ? 1 : 2;   // idle, generating, landed

        put('ph', ph, (v) => {
          show(id, v < 2); show(ld, v === 2); show(hn, v === 0); show(sn, v === 1); show(ss, v === 1);
          sx.textContent = STATUS[v]; gx.textContent = v === 2 ? 'Regenerate' : 'Generate';
          gb.classList.toggle(`${P}-ds`, v === 1); gb.classList.toggle(`${P}-rg`, v === 2); ib.classList.toggle(`${P}-on`, v === 2);
        });

        // the orb turns slowly, the sparkles twinkle, the spinner turns in 30-degree steps: all pure functions of s
        const sm = Math.min(s, LAND_AT);   // frozen once the result has landed, so the landed state is static
        put('or', Math.round(sm * 40), (v) => { or.style.transform = `rotate(${v}deg)`; });
        sks2.forEach((n, i) => put(`sk${i}`, Math.round((0.6 + 0.4 * Math.sin(sm * 9 + i * 1.7)) * 20) / 20, (v) => { n.style.opacity = String(v); n.style.transform = `scale(${(0.82 + 0.18 * v).toFixed(2)})`; }));
        put('sn', ph === 1 ? Math.floor((s - GEN0) * 24) % 12 : 0, (v) => { sa.style.transform = `rotate(${v * 30}deg)`; sb.style.transform = `rotate(${v * 30}deg)`; });

        cells.forEach((c, i) => {
          const d = ph === 2 ? clamp01((s - LAND[i]) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the tile cover's opacity, a pure function of s
          put(`i${i}`, cov, () => {
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
          });
        });
      },
    };
  },
};
