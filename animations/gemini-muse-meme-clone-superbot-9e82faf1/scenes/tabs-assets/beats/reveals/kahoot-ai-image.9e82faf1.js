// Kahoot! AI images (2025): the wait of the AI image generator inside Kahoot!'s media picker, read from Kahoot!'s own YouTube walkthrough JkUpLkw6ty0 (2025-05-16; wait un-cut t = 39.1-42.1 s, 'Adding image'
// 48.2-49.6 s; frames reveal-refs/kahoot-ai-image/frames/bw_kahoot-ai-image_{pending-generating-images_t39.4,pending-perfecting_t40.3,pending-final-touches_t41.7,landed-results_t42.2}.png, spec
// .tmp/clone-9e82faf1/reveal-refs/kahoot-ai-image/spec.json, confidence 0.62). The whole block is the quiz-question editor under a white 'Find and insert media' modal: the editor (deep-blue stage, four colour
// answer tiles, the question-settings rail, a thin question navigator) stays live behind a dark scrim; in the modal a left nav (Images > Getty Images / Unsplash / AI Generator, GIFs, Videos, Audio), the pills
// 'AI assisted' and 'Early access', the prompt box with a grey disabled 'Generate' button, a status row (ring glyph, a caption swapping in place 'Generating images' -> 'Perfecting it for you' ->
// 'Applying final touches', a 'Cancel' link) and grey skeleton tiles. At the result the status row clears, 'Generate' turns purple again and the ten tiles fill with our pictures in strict reading order
// (5 x 2). Omitted: the Kahoot! logo. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-kah';
const ROOT_W = 560, ROOT_H = 340;
const COLS = 5, TILE_W = 60, TILE_H = 76, GAP = 5;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0328a8; color: #222222; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P}-qn { position: absolute; left: 0; top: 0; width: 26px; height: ${ROOT_H}px; background: #f2f2f5; }
.${P}-qn i { position: absolute; left: 4px; width: 18px; height: 22px; border-radius: 2px; background: #ffffff; box-shadow: inset 0 0 0 1px #cfcfd6; }
.${P}-qt { position: absolute; box-sizing: border-box; height: 48px; border-radius: 3px; }
.${P}-qa { position: absolute; left: 477px; top: 150px; width: 13px; height: 18px; background: #ffffff; border-radius: 2px 0 0 2px; }
.${P}-rl { position: absolute; left: 490px; top: 0; width: 70px; height: ${ROOT_H}px; background: #ffffff; }
.${P}-rh { position: absolute; left: 8px; font-size: 6.2px; line-height: 9px; font-weight: 700; color: #222222; }
.${P}-rb { position: absolute; left: 6px; box-sizing: border-box; width: 64px; height: 18px; border-radius: 3px; box-shadow: inset 0 0 0 1px #d4d4d8; padding-left: 8px; font-size: 6.2px; line-height: 18px; color: #333333; }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: rgba(0, 0, 0, .67); }
.${P}-md { position: absolute; left: 36px; top: 12px; width: 440px; height: 316px; border-radius: 8px; background: #f8f8f8; overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, .35); }
.${P}-nv { position: absolute; left: 0; top: 0; width: 96px; height: 316px; background: #ffffff; }
.${P}-gi { position: absolute; left: 10px; width: 8px; height: 8px; border-radius: 1.5px; background: #222222; }
.${P}-gt { position: absolute; left: 24px; font-size: 7.2px; line-height: 10px; font-weight: 600; color: #222222; }
.${P}-gc { position: absolute; left: 80px; width: 0; height: 0; border-left: 2.4px solid transparent; border-right: 2.4px solid transparent; border-bottom: 3px solid #666666; }
.${P}-si { position: absolute; left: 24px; font-size: 6.9px; line-height: 10px; color: #333333; }
.${P}-sl { position: absolute; left: 20px; width: 70px; height: 14px; border-radius: 3px; background: #e6eefb; }
.${P}-ub { position: absolute; left: 10px; top: 270px; box-sizing: border-box; width: 76px; height: 24px; border-radius: 3px; background: #1368ce; font-size: 6.8px; line-height: 24px; font-weight: 700; color: #ffffff; padding-left: 24px; }
.${P}-ub svg { position: absolute; left: 8px; top: 7px; width: 10px; height: 10px; }
.${P}-pl { position: absolute; top: 10px; box-sizing: border-box; height: 12px; padding: 0 6px; border-radius: 4px; background: #ececec; font-size: 5.8px; line-height: 12px; font-weight: 700; color: #666666; }
.${P}-pr { position: absolute; left: 106px; top: 28px; box-sizing: border-box; width: 262px; height: 46px; border-radius: 3px; background: #ffffff; box-shadow: inset 0 0 0 1px #dedede; }
.${P}-pr svg { position: absolute; left: 8px; top: 17px; width: 10px; height: 10px; }
.${P}-pt { position: absolute; left: 26px; top: 7px; width: 230px; white-space: normal !important; font-size: 6.7px; line-height: 9.4px; font-weight: 500; color: #222222; }
.${P}-gn { position: absolute; left: 374px; top: 28px; box-sizing: border-box; width: 56px; height: 24px; border-radius: 3px; background: #a7a7a7; text-align: center; font-size: 7.2px; line-height: 24px; font-weight: 700; color: #ffffff; }
.${P}-sr { position: absolute; left: 106px; top: 84px; width: 324px; height: 14px; }
.${P}-sp { position: absolute; left: 1px; top: 2px; width: 10px; height: 10px; }
.${P}-st { position: absolute; left: 16px; top: 0; font-size: 7.2px; line-height: 14px; color: #333333; }
.${P}-cn { position: absolute; right: 2px; top: 0; font-size: 7px; line-height: 14px; color: #222222; text-decoration: underline; }
.${P}-g { position: absolute; left: 108px; top: 104px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; overflow: hidden; border-radius: 2px; background: #cdcdcd; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #cdcdcd; }
.${P}-lg { position: absolute; left: 106px; top: 294px; font-size: 5.9px; line-height: 9px; color: #444444; }
.${P}-lg u { color: #333333; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const STAGES = [0, 0.36, 0.72];                    // the status caption swaps at each of these (layout seconds)
const OPEN = 1.06;                                 // the results arrive: the status row clears and Generate turns purple
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i fills its tile (strict reading order), the last at 1.70

const CAPTIONS = ['Generating images', 'Perfecting it for you', 'Applying final touches'];
const PROMPT = 'Ten funny reaction memes with bold, vibrant colours and a playful, detailed style.';
// the left nav: [label, kind, y-slot]; group rows carry an icon and a caret, sub rows are indented
const NAV = [['Images', 'g'], ['Getty Images', 's'], ['Unsplash', 's'], ['AI Generator', 's'], ['GIFs', 'g'], ['Standard', 's'], ['Stickers', 's'], ['Videos', 'g'], ['YouTube', 's'], ['Vimeo', 's'], ['Audio', 'g'], ['Read aloud', 's'], ['Record', 's']];
const NAV_Y = (i) => Math.round(18 + i * 18.2);

export default {
  id: 'kahoot-ai-image',
  label: 'Kahoot! AI images (2025)',
  source: {
    platform: "Kahoot! creator (web), the quiz-question editor with the media modal open, desktop browser, 1280x720 screen recording of Kahoot!'s own first-party YouTube walkthrough, constant 30 fps",
    feature: "AI image generation inside the media picker ('AI Generator' under Images): a white modal over the dimmed quiz editor; after 'Generate' the button greys out and the results grid clears to flat grey skeleton tiles while a status row under the prompt shows a ring glyph and a caption that swaps in place ('Generating images' -> 'Perfecting it for you' -> 'Applying final touches') beside a right-aligned 'Cancel' link; the generated images then fill the skeleton tiles one by one and 'Generate' turns purple again",
    capture: {
      url: 'https://www.youtube.com/watch?v=JkUpLkw6ty0',
      date: '2025-05-16',
      timestamps: "video JkUpLkw6ty0 (wait un-cut, constant 30 fps): 'Generate' clicked t = 39.1 s; 'Generating images' t = 39.25-39.75 s (frame bw_kahoot-ai-image_pending-generating-images_t39.4), 'Perfecting it for you' t = 40.0-40.5 s (pending-perfecting_t40.3), 'Applying final touches' t = 41.5-42.0 s (pending-final-touches_t41.7); results arrive tile by tile t = 42.1-42.4 s (landed-results_t42.2, landed-allthree_t44.0); the 'Adding image' spinner after the modal closes t = 48.2-49.6 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=JkUpLkw6ty0', published: '2025-05-16', retrieved: '2026-10-15', note: 'How to generate Kahoot! images with AI (Kahoot!, first-party): the wait un-cut, all three captions read verbatim, the modal, the dimmed editor and the skeleton tiles' },
    ],
    extrapolated: [
      "all timing: the recording's wait runs ~3.0 s (one sample, a post-recorded voice-over, a global speed-up cannot be excluded); here the three captions, the arrival and the ten landings share the 1.84 s beat, the captions swapping every 0.36 layout seconds",
      "the grid: the recording shows a 3-across row of three landscape tiles (two images and one skeleton at t = 42.2 s); here the grid is ten portrait tiles in a 5 x 2 layout, all grey skeletons while pending, landing in strict reading order; the grid stays where it is when the status row clears (the recording moves it up by one row)",
      "the prompt: the recording shows a user-supplied underwater-scene prompt (auto-filled from a Suggested-prompt card); here the prompt box holds our own wording",
      "the ring glyph: the recording shows a small grey ring with two arrowheads beside the caption; here it is a ring drawn from two arcs, stepped in eighths of a turn from t alone, because a spinning glyph needs no CSS animation",
      "the editor behind the modal: read from the dimmed edges of the recording (deep-blue stage, four colour tiles, the question-settings rail with Question type / Poll, Time limit / 30 seconds, Answer options / Single select, a thin question navigator); the scrim, the rail and the tile colours are read from sampled pixels, the layout is squeezed to the 560 px column",
      "omitted from the recording: the Kahoot! logo, the 'Adding image' wait after the modal closes, the question title bar behind the modal",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'kahoot-ai-image');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const navRow = ([label, kind], i) => {
      const y = NAV_Y(i);
      if (kind === 'g') {
        const c = i === 0 ? '#1368ce' : '#222222';
        return `<i class="${P}-gi" style="top: ${y + 1}px; background: ${c}"></i><p class="${P}-gt" style="top: ${y}px; color: ${c}">${label}</p><i class="${P}-gc" style="top: ${y + 4}px"></i>`;
      }
      const sel = label === 'AI Generator';
      return (sel ? `<i class="${P}-sl" style="top: ${y - 2}px"></i>` : '') + `<p class="${P}-si" style="top: ${y}px${sel ? '; color: #1368ce' : ''}">${label}</p>`;
    };
    const tile = (l, tp, w, c) => `<div class="${P}-qt" style="left: ${l}px; top: ${tp}px; width: ${w}px; background: ${c}"></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-qn"><i style="top: 10px"></i><i style="top: 40px"></i><i style="top: 70px"></i><i style="top: 100px"></i></div>`
      + tile(30, 212, 210, '#e21b3c') + tile(246, 212, 210, '#1368ce') + tile(30, 268, 210, '#d89e00') + tile(246, 268, 210, '#26890c')
      + `<div class="${P}-qa"></div>`
      + `<div class="${P}-rl"><p class="${P}-rh" style="top: 12px">Question type</p><p class="${P}-rb" style="top: 25px">Poll</p><p class="${P}-rh" style="top: 54px">Time limit</p><p class="${P}-rb" style="top: 67px">30 seconds</p><p class="${P}-rh" style="top: 96px">Answer options</p><p class="${P}-rb" style="top: 109px">Single select</p></div>`
      + `<div class="${P}-sc"></div>`
      + `<div class="${P}-md">`
      + `<div class="${P}-nv">${NAV.map(navRow).join('')}<p class="${P}-ub"><svg viewBox="0 0 12 12"><path d="M6 9.5V2.8M3.2 5.4L6 2.6l2.8 2.8M2 10.2h8" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Upload media</p></div>`
      + `<p class="${P}-pl" style="left: 106px">AI assisted</p><p class="${P}-pl" style="left: 160px">Early access</p>`
      + `<div class="${P}-pr"><svg viewBox="0 0 12 12"><path d="M2 10L7 5M8 1.5l.5 1.2 1.2.5-1.2.5L8 4.9l-.5-1.2-1.2-.5 1.2-.5z" fill="none" stroke="#9a9a9a" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="${P}-pt">${PROMPT}</p></div>`
      + `<p class="${P}-gn">Generate</p>`
      + `<div class="${P}-sr"><svg class="${P}-sp" viewBox="0 0 12 12"><path d="M10 4.6A4.4 4.4 0 0 0 2.3 3.4M2 7.4a4.4 4.4 0 0 0 7.7 1.2" fill="none" stroke="#8a8a8a" stroke-width="1.1" stroke-linecap="round"/><path d="M10.6 2.2v2.6H8M1.4 9.8V7.2H4" fill="none" stroke="#8a8a8a" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="${P}-st"></p><p class="${P}-cn">Cancel</p></div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<p class="${P}-lg">Prompts can not contain any personal data and must comply with our <u>Acceptable Use Policy</u></p>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sr = q('sr'), sp = q('sp'), st = q('st'), gn = q('gn');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const open = s >= OPEN;
        const stage = s >= STAGES[2] ? 2 : s >= STAGES[1] ? 1 : 0;
        const turn = open ? 0 : Math.floor(s * 10) % 8;   // the ring's arrowheads, stepped in eighths of a turn

        // pending: a disabled grey Generate, the status row and grey skeleton tiles; then purple Generate and the pictures
        put('op', open, (v) => { sr.style.visibility = v ? 'hidden' : ''; gn.style.background = v ? '#5a2ea6' : ''; });
        put('st', stage, (v) => { st.textContent = CAPTIONS[v]; });
        put('sp', turn, (v) => { sp.style.transform = `rotate(${v * 45}deg)`; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a flat grey skeleton until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
