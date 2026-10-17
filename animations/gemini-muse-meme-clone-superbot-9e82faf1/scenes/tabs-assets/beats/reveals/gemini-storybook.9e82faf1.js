// Gemini Storybook (2026): the in-chat wait of the Gemini web app's Storybook tool, read from the YouTube walkthrough YgNKexDQpJw (2026-02-06; wait un-cut t = 28-57 s,
// result t = 61 s; frames reveal-refs/gemini-storybook/frames/bp_sb_*.png, spec .tmp/clone-9e82faf1/reveal-refs/gemini-storybook/spec.json, confidence 0.55). The whole screen is
// the Gemini web page, light: a narrow left rail, the '2.5 Flash' model chip top-left, the right-aligned grey user bubble, then the app's one-line 'Just a sec...' beside a small
// sparkle, replaced by the assistant's own rounded grey card carrying the multicolour book glyph, the bold headline 'Creating storybook...' and a smaller sub-line that swaps in
// place ('Writing first draft' -> 'Creating illustrations'); no percentage, bar, spinner or ETA exists. At the result the page splits: the reply stays on the left ('I've written
// a story for you about ...' and a small title card) and the storybook canvas opens on the right, a header with the title, Cover navigation, Listen and Close above the page
// thumbnails, which fill with the pictures in strict reading order. Omitted: the Gemini wordmark, the 'Upgrade' pill and the 'Welcome to Gemini' privacy card (upsell and
// clutter), the EXPERIMENT chip. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-gsb';
const ROOT_W = 560, ROOT_H = 350;
const COLS = 5, TILE_W = 56, TILE_H = 74, GAP_X = 10, GAP_Y = 14;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #1f1f1f; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: #ffffff; }
.${P}-ic { fill: none; stroke: #444746; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rl { position: absolute; left: 0; top: 0; bottom: 0; width: 26px; }
.${P}-rl svg { position: absolute; left: 7px; width: 12px; height: 12px; }
.${P}-md { position: absolute; left: 34px; top: 14px; height: 15px; box-sizing: border-box; padding: 0 6px 0 7px; border-radius: 8px; background: #f0f4f9; display: flex; align-items: center; gap: 3px; margin: 0; font-size: 7.6px; line-height: 15px; color: #444746; white-space: nowrap; }
.${P}-md svg { width: 6px; height: 6px; }
.${P}-av { position: absolute; right: 12px; top: 12px; width: 15px; height: 15px; border-radius: 50%; background: #c2503a; color: #ffffff; font-size: 7.4px; line-height: 15px; text-align: center; margin: 0; }
.${P}-ub { position: absolute; box-sizing: border-box; padding: 6px 8px; border-radius: 9px; background: #e9eef6; font-size: 7.4px; line-height: 10.6px; color: #1f1f1f; margin: 0; }
.${P}-sp { position: absolute; width: 11px; height: 11px; }
.${P}-js { position: absolute; margin: 0; font-size: 7.4px; line-height: 11px; color: #5f6368; white-space: nowrap; }
.${P}-cd { position: absolute; left: 174px; top: 96px; box-sizing: border-box; width: 257px; height: 31px; border-radius: 9px; background: #edf2fa; }
.${P}-cg { position: absolute; left: 9px; top: 7px; width: 16px; height: 16px; }
.${P}-hd { position: absolute; left: 32px; top: 5px; margin: 0; font-size: 7.8px; line-height: 10px; font-weight: 600; color: #1f1f1f; white-space: nowrap; }
.${P}-sb { position: absolute; left: 32px; top: 16px; margin: 0; font-size: 6.4px; line-height: 9px; color: #5f6368; white-space: nowrap; }
.${P}-cm { position: absolute; box-sizing: border-box; border-radius: 11px; background: #ffffff; box-shadow: inset 0 0 0 1px #c7c7c7; }
.${P}-ph { position: absolute; left: 11px; top: 9px; margin: 0; font-size: 7.6px; line-height: 11px; color: #5f6368; white-space: nowrap; }
.${P}-tl { position: absolute; left: 11px; bottom: 8px; display: flex; align-items: center; gap: 12px; margin: 0; font-size: 7px; line-height: 11px; color: #444746; }
.${P}-tl svg { width: 8px; height: 8px; margin-right: 3px; vertical-align: -1px; }
.${P}-st { position: absolute; right: 12px; bottom: 9px; width: 11px; height: 11px; border-radius: 50%; background: #d3e3fd; }
.${P}-st i { position: absolute; left: 3.5px; top: 3.5px; width: 4px; height: 4px; border-radius: 1px; background: #0b57d0; }
.${P}-sn { position: absolute; right: 12px; bottom: 9px; width: 11px; height: 11px; }
.${P}-ft { position: absolute; margin: 0; text-align: center; font-size: 5.8px; line-height: 8px; color: #5f6368; white-space: nowrap; }
.${P}-tc { position: absolute; left: 34px; top: 158px; box-sizing: border-box; width: 162px; height: 34px; border-radius: 8px; background: #edf2fa; }
.${P}-tc svg { position: absolute; left: 9px; top: 10px; width: 14px; height: 14px; }
.${P}-t1 { position: absolute; left: 30px; top: 8px; margin: 0; font-size: 7.4px; line-height: 10px; font-weight: 600; color: #1f1f1f; white-space: nowrap; }
.${P}-t2 { position: absolute; left: 30px; top: 19px; margin: 0; font-size: 6px; line-height: 8px; color: #5f6368; white-space: nowrap; }
.${P}-rp { position: absolute; left: 34px; top: 117px; width: 160px; margin: 0; font-size: 7.4px; line-height: 10.6px; color: #1f1f1f; }
.${P}-cn { position: absolute; left: 204px; top: 40px; box-sizing: border-box; width: 344px; height: 262px; border-radius: 10px; background: #ffffff; box-shadow: inset 0 0 0 1px #dfe1e5; }
.${P}-ch { position: absolute; left: 0; right: 0; top: 0; height: 30px; }
svg.${P}-bi { position: absolute; left: 11px; top: 9px; width: 12px; height: 12px; }
.${P}-ct { position: absolute; left: 29px; top: 10px; margin: 0; font-size: 7.4px; line-height: 10px; font-weight: 500; color: #1f1f1f; white-space: nowrap; }
.${P}-nv { position: absolute; left: 134px; top: 10px; display: flex; align-items: center; gap: 7px; margin: 0; font-size: 7px; line-height: 10px; color: #444746; }
.${P}-nv svg { width: 7px; height: 7px; }
.${P}-ls { position: absolute; right: 31px; top: 7px; height: 16px; box-sizing: border-box; padding: 0 8px 0 6px; border-radius: 8px; background: #d3e3fd; display: flex; align-items: center; gap: 3px; margin: 0; font-size: 7px; line-height: 16px; color: #0842a0; font-weight: 500; }
.${P}-ls svg { width: 8px; height: 8px; fill: none; stroke: #0842a0; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cx { position: absolute; right: 11px; top: 11px; width: 8px; height: 8px; }
.${P}-hl { position: absolute; left: 0; right: 0; top: 30px; height: 1px; background: #ebedf0; }
.${P}-g { position: absolute; left: 12px; top: 54px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); gap: ${GAP_Y}px ${GAP_X}px; }
.${P}-c { position: relative; width: ${TILE_W}px; height: ${TILE_H + 11}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 4px; overflow: hidden; background: #f1f3f4; box-shadow: 0 0 0 1px #dfe1e5; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f6f8fa; }
.${P}-pn { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; text-align: center; font-size: 5.8px; line-height: 9px; color: #5f6368; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const CARD = 0.22;                                 // 'Just a sec...' hands over to the card
const ILLUS = 0.62;                                // the card's sub-line swaps from the first draft to the illustrations
const OPEN = 0.98;                                 // the page splits and the storybook canvas opens
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // page i receives its picture (strict reading order), the last at 1.68

const PHASES = ['Writing first draft', 'Creating illustrations'];
const PROMPT = 'Create a storybook about ten Muse memes';
const SPARK = (cls, st) => `<svg class="${cls}" viewBox="0 0 12 12" style="${st}"><path d="M6 0C6.4 3.6 8.4 5.6 12 6 8.4 6.4 6.4 8.4 6 12 5.6 8.4 3.6 6.4 0 6 3.6 5.6 5.6 3.6 6 0Z" fill="#4285f4"/></svg>`;
const BOOK = (cls) => `<svg class="${cls}" viewBox="0 0 16 16"><path d="M13.3 5.6A6 6 0 0 0 4.2 3" fill="none" stroke="#fbbc04" stroke-width="1.5" stroke-linecap="round"/><path d="M4.2 3A6 6 0 0 0 2.3 10" fill="none" stroke="#f29900" stroke-width="1.5" stroke-linecap="round"/><path d="M2.5 10.8A6 6 0 0 0 13.3 10.4" fill="none" stroke="#ea4335" stroke-width="1.5" stroke-linecap="round"/><path d="M8 5.6v5M8 5.6C7 5.1 5.9 5 4.9 5.2v4.8c1-.2 2.1-.1 3.1.4 1-.5 2.1-.6 3.1-.4V5.2C10.1 5 9 5.1 8 5.6Z" fill="none" stroke="#444746" stroke-width="1" stroke-linejoin="round"/></svg>`;
const BOOKS = `<svg class="${P}-bi" viewBox="0 0 14 14"><path d="M7 3.4v7.6M7 3.4C5.6 2.7 4 2.6 2.6 2.9v7.6c1.4-.3 3-.2 4.4.5 1.4-.7 3-.8 4.4-.5V2.9C10 2.6 8.4 2.7 7 3.4Z" fill="none" stroke="#444746" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
const CARET = `<svg class="${P}-ic" viewBox="0 0 10 10"><path d="M2 3.6 5 6.6 8 3.6"/></svg>`;
const composer = (left, top, w, ending) => `<div class="${P}-cm" style="left: ${left}px; top: ${top}px; width: ${w}px; height: 44px"><p class="${P}-ph">Ask Gemini</p>`
  + `<p class="${P}-tl"><span><svg class="${P}-ic" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg></span><span><svg class="${P}-ic" viewBox="0 0 10 10"><path d="M1.5 3h7M1.5 7h7"/><circle cx="3.6" cy="3" r="1" fill="#fff"/><circle cx="6.4" cy="7" r="1" fill="#fff"/></svg>Tools</span></p>${ending}</div>`;
const STOP = `<div class="${P}-st"><i></i></div>`;
const SEND = `<svg class="${P}-sn ${P}-ic" viewBox="0 0 12 12" style="stroke: #9aa0a6"><path d="M1.8 6h8.4M6.6 2.4 10.2 6 6.6 9.6"/></svg>`;
const FOOT = 'Gemini can make mistakes, so double-check it';

export default {
  id: 'gemini-storybook',
  label: 'Gemini Storybook (2026)',
  source: {
    platform: "Gemini web app (gemini.google.com/u/3/app) in desktop Chrome on macOS, model chip '2.5 Flash', English UI, 1280x720 screen recording from a third-party YouTube walkthrough, already signed in",
    feature: "Storybook tool inside a Gemini chat: after the prompt the send button becomes a stop square and a small sparkle with the grey line 'Just a sec...' appears; about a second later it is replaced by the assistant's own rounded pale card carrying the multicolour book glyph, the bold headline 'Creating storybook...' and a smaller sub-line that swaps in place from 'Writing first draft' to 'Creating illustrations' (no percentage, bar, spinner or ETA); when it ends the page splits, the reply stays on the left with a small title card and the storybook canvas opens on the right with its header (title, Cover navigation, Listen, Close)",
    capture: {
      url: 'https://www.youtube.com/watch?v=YgNKexDQpJw',
      date: '2026-02-06',
      timestamps: "video YgNKexDQpJw (wait un-cut): 'Just a sec...' t = 28.0-29.5 s (frame bp_sb_justasec_t29), 'Creating storybook...' + 'Writing first draft' t = 30.5-40.5 s (bp_sb_draft_t31, bp_sb_bubble_zoom_t31), 'Creating illustrations' t = 41.0-57 s (bp_sb_illus_t41, bp_sb_bubble_zoom_t41, bp_sb_illus_t57), the split page with the storybook canvas open t = 61 s (bp_sb_result_t61, bp_sb_zoom_result_t61)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=YgNKexDQpJw', published: '2026-02-06', retrieved: '2026-10-15', note: "the whole wait un-cut: the 'Just a sec...' line, the card with 'Creating storybook...' and its two phase sub-lines, the result page with the storybook canvas on the right" },
    ],
    extrapolated: [
      "all timing: the recording runs 29 s (1.5 s 'Just a sec...', 10 s first draft, 16 s illustrations, then the canvas); here the same four states share the 1.84 s beat",
      "ten page thumbnails in a 5 x 2 grid: the recording's canvas opens on the Cover (frame t61 shows it still blank); here the canvas shows ten pages, each blank pale until its picture lands, in strict reading order, labelled 'Cover' and 'Page 1' .. 'Page 9' (our own labels)",
      "the canvas controls: the recording's header carries title, undo / redo, Cover navigation, fullscreen / print / share, the Listen pill and Close; here title, Cover navigation, Listen and Close only",
      "the user prompt, the reply line 'I've written a story for you about ten Muse memes.', the title 'Ten Muse Memes' and its 'Storybook' sub-line are ours (the recording's are the Aesop fable story and its date line); the 'Upgrade' pill, the 'Welcome to Gemini' privacy card, the wordmark and the EXPERIMENT chip are omitted",
      "the canvas's page thumbnails are our own memes (the recording never showed the illustrated pages inside the wait)",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'gemini-storybook');
    const labels = ['Cover', ...Array.from({ length: 9 }, (_, i) => `Page ${i + 1}`)];
    const cell = (g, i) => `<div class="${P}-c"><div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div><p class="${P}-pn">${labels[i]}</p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-rl"><svg class="${P}-ic" viewBox="0 0 12 12" style="top: 15px"><path d="M1.5 3h9M1.5 6h9M1.5 9h9"/></svg><svg class="${P}-ic" viewBox="0 0 12 12" style="top: 50px"><path d="M2 10V4M2 10h6M3.6 8.4 9.4 2.6a1 1 0 0 0-1.4-1.4L2.2 7Z"/></svg><svg class="${P}-ic" viewBox="0 0 12 12" style="bottom: 17px"><circle cx="6" cy="6" r="2.2"/><path d="M6 1v1.4M6 9.6V11M1 6h1.4M9.6 6H11M2.5 2.5l1 1M8.5 8.5l1 1M2.5 9.5l1-1M8.5 3.5l1-1"/></svg></div>`
      + `<p class="${P}-md">2.5 Flash${CARET}</p><p class="${P}-av">M</p>`
      + `<div class="${P}-sc ${P}-wt" style="background: transparent">`
      + `<p class="${P}-ub" style="left: 250px; top: 52px; width: 181px">${PROMPT}</p>`
      + `${SPARK(`${P}-sp`, 'left: 156px; top: 106px')}<div class="${P}-jw"><p class="${P}-js" style="left: 176px; top: 105px">Just a sec...</p></div>`
      + `<div class="${P}-cd ${P}-cw">${BOOK(`${P}-cg`)}<p class="${P}-hd">Creating storybook...</p><p class="${P}-sb"></p></div>`
      + composer(155, 258, 276, STOP) + `<p class="${P}-ft" style="left: 155px; width: 276px; top: 312px">${FOOT}</p>`
      + `</div>`
      + `<div class="${P}-sc ${P}-rs" style="background: transparent">`
      + `<p class="${P}-ub" style="left: 66px; top: 52px; width: 130px">${PROMPT}</p>`
      + SPARK(`${P}-sp`, 'left: 34px; top: 99px')
      + `<p class="${P}-rp">I've written a story for you about ten Muse memes.</p>`
      + `<div class="${P}-tc">${BOOK(`${P}-bk`)}<p class="${P}-t1">Ten Muse Memes</p><p class="${P}-t2">Storybook</p></div>`
      + composer(34, 258, 162, SEND) + `<p class="${P}-ft" style="left: 34px; width: 162px; top: 312px">${FOOT}</p>`
      + `<div class="${P}-cn"><div class="${P}-ch">${BOOKS}<p class="${P}-ct">Ten Muse Memes</p>`
      + `<p class="${P}-nv"><svg class="${P}-ic" viewBox="0 0 10 10"><path d="M6.4 2 3.4 5l3 3"/></svg>Cover<svg class="${P}-ic" viewBox="0 0 10 10"><path d="M3.6 2l3 3-3 3"/></svg></p>`
      + `<p class="${P}-ls"><svg viewBox="0 0 10 10"><path d="M1.4 3.8h1.6L5.2 2v6L3 6.2H1.4ZM6.8 3.4a2.2 2.2 0 0 1 0 3.2"/></svg>Listen</p>`
      + `<svg class="${P}-cx ${P}-ic" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2 2 8"/></svg><div class="${P}-hl"></div></div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div></div>`
      + `</div></div>`);
    const wt = root.querySelector(`.${P}-wt`);
    const rs = root.querySelector(`.${P}-rs`);
    const jw = root.querySelector(`.${P}-jw`);
    const cw = root.querySelector(`.${P}-cw`);
    const sb = root.querySelector(`.${P}-sb`);
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
        const stage = s >= ILLUS ? 2 : s >= CARD ? 1 : 0;

        // the chat page with the wait, then the split page with the canvas; each screen is shown by visibility alone
        put('sc', open, (v) => { wt.style.visibility = v ? 'hidden' : ''; rs.style.visibility = v ? '' : 'hidden'; });
        put('jw', stage === 0, (v) => { jw.style.visibility = v ? '' : 'hidden'; cw.style.visibility = v ? 'hidden' : ''; });
        put('sb', stage, (v) => { sb.textContent = v ? PHASES[v - 1] : ''; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a blank pale page until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
