// Venngage AI Design (2026): the wait of Venngage's DesignAI 'generate a design' flow in flyer mode, read from a third-party tutorial, MpNH4RAQ56A (2026-02-13; wait un-cut t = 253-271.5 s = 04:13.0-04:31.5; frames
// reveal-refs/venngage-ai/frames/bw_venngage-ai_{pending_t16,pending_t20,pending_t25,pending_t30,landed_t33}.png, spec .tmp/clone-9e82faf1/reveal-refs/venngage-ai/spec.json, confidence 0.58).
// The whole block is a page, not a panel: a thin white nav strip, a purple-to-blue gradient hero fading to white under 'What will you create today?', and ONE centred white card. The card's header line
// steps through four strings ('Generating your design....' -> 'Designing the flyer' -> "Optimizing the flyer's content" -> 'Finalizing the details') while the flyer inside the card builds as wireframe
// blocks (yellow bands, dark columns and bars), then its text, then ten dark photo slots; a small dark pill bottom-left reads 'Design is generating'. At the landing the ten slots fill with our pictures in
// strict reading order (5 x 2 inside the flyer), the header becomes the review bar with a blue 'Continue Editing' button and the pill reads 'Design has generated'. Omitted: the Venngage logo, the plan badge,
// the 'Upgrade' / sign-up chrome. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-vng';
const ROOT_W = 560, ROOT_H = 510;
const COLS = 5, TILE_W = 54, TILE_H = 68, GAP = 4;
const FLY_W = 312, FLY_H = 338;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #2c2c2c; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P}-nv { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 26px; background: #ffffff; box-shadow: inset 0 -1px #e7e7ec; z-index: 2; }
.${P}-ni { position: absolute; top: 8px; font-size: 7.6px; line-height: 10px; color: #2c2c2c; }
.${P}-na { position: absolute; left: 112px; top: 8px; display: flex; align-items: center; gap: 3px; font-size: 7.6px; line-height: 10px; color: #3b5bdb; }
.${P}-na svg { width: 9px; height: 9px; }
.${P}-iv { position: absolute; right: 74px; top: 5px; box-sizing: border-box; height: 16px; padding: 0 9px; border-radius: 3px; background: #0b6cdb; font-size: 7px; line-height: 16px; font-weight: 600; color: #ffffff; }
.${P}-wn { position: absolute; right: 12px; top: 5px; box-sizing: border-box; height: 16px; padding: 0 8px; border-radius: 3px; box-shadow: inset 0 0 0 1px #d9d9df; font-size: 7px; line-height: 16px; color: #2c2c2c; }
.${P}-hr { position: absolute; left: 0; top: 26px; width: ${ROOT_W}px; height: 190px; background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%, #ffffff 97%), linear-gradient(100deg, #9a66d9 0%, #6a3fe4 48%, #4668b4 100%); }
.${P}-hh { position: absolute; left: 0; right: 0; top: 40px; text-align: center; font-size: 19px; line-height: 24px; font-weight: 700; color: #ffffff; }
.${P}-cd { position: absolute; left: 30px; top: 62px; box-sizing: border-box; width: 500px; height: 416px; border-radius: 6px; background: #ffffff; box-shadow: 0 1px 5px rgba(30, 16, 80, .16); }
.${P}-bk { position: absolute; left: 14px; top: 18px; width: 12px; height: 12px; }
.${P}-hb { position: absolute; left: 94px; top: 12px; box-sizing: border-box; width: ${FLY_W}px; height: 28px; border-radius: 4px; background: #ffffff; box-shadow: inset 0 0 0 1px #ececf0; }
.${P}-sp { position: absolute; left: 9px; top: 8px; width: 12px; height: 12px; }
.${P}-st { position: absolute; left: 28px; top: 7px; font-size: 7.8px; line-height: 14px; color: #2c2c2c; }
.${P}-sx { position: absolute; right: 8px; top: 6px; width: 16px; height: 16px; }
.${P}-hq { position: absolute; left: 10px; top: 7px; font-size: 7.6px; line-height: 14px; color: #2c2c2c; }
.${P}-th { position: absolute; top: 8px; width: 12px; height: 12px; }
.${P}-ce { position: absolute; right: 4px; top: 4px; box-sizing: border-box; height: 20px; padding: 0 9px 0 22px; border-radius: 3px; background: #0b6cdb; font-size: 7.6px; line-height: 20px; font-weight: 600; color: #ffffff; }
.${P}-ce svg { position: absolute; left: 8px; top: 5px; width: 10px; height: 10px; }
.${P}-fy { position: absolute; left: 94px; top: 48px; width: ${FLY_W}px; height: ${FLY_H}px; background: #f7f7f4; box-shadow: 0 0 0 1px #e3e3df; overflow: hidden; }
.${P}-b1 { position: absolute; left: 0; top: 76px; width: ${FLY_W}px; height: 48px; background: #fdd44b; }
.${P}-b2 { position: absolute; left: 0; top: 310px; width: ${FLY_W}px; height: 28px; background: #fdd44b; }
.${P}-b2 p { text-align: center; font-size: 8px; line-height: 28px; font-weight: 800; letter-spacing: .6px; color: #14181f; }
.${P}-co { position: absolute; left: 223px; top: 13px; width: 76px; height: 120px; background: #151a21; }
.${P}-co i { position: absolute; left: 8px; top: 12px; width: 12px; height: 10px; background: #5fd08a; }
.${P}-co b { position: absolute; left: 24px; top: 17px; width: 44px; height: 1px; background: #cdb54a; }
.${P}-ch { position: absolute; left: 8px; top: 34px; font-size: 6.8px; line-height: 9px; font-weight: 700; color: #ffffff; }
.${P}-cb { position: absolute; left: 8px; top: 50px; white-space: normal !important; width: 60px; font-size: 5.4px; line-height: 7.2px; color: #c9ced6; }
.${P}-br { position: absolute; left: 13px; top: 138px; box-sizing: border-box; width: 286px; height: 16px; background: #151a21; }
.${P}-br p { position: absolute; left: 8px; top: 0; font-size: 5.8px; line-height: 16px; font-weight: 700; letter-spacing: .3px; color: #fdd44b; }
.${P}-t1 { position: absolute; left: 13px; top: 14px; font-size: 17px; line-height: 18px; font-weight: 800; color: #14181f; }
.${P}-t2 { position: absolute; left: 13px; top: 56px; font-size: 6.8px; line-height: 9px; font-weight: 700; letter-spacing: .3px; color: #14181f; }
.${P}-t3 { position: absolute; left: 13px; top: 82px; font-size: 8.6px; line-height: 11px; font-weight: 700; color: #14181f; }
.${P}-t4 { position: absolute; left: 13px; top: 96px; white-space: normal !important; width: 196px; font-size: 5.8px; line-height: 7.4px; color: #3a3320; }
.${P}-g { position: absolute; left: 13px; top: 162px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; overflow: hidden; background: #efefea; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #efefea; }
.${P}-ft { position: absolute; left: 94px; top: 394px; width: ${FLY_W}px; text-align: center; font-size: 6.2px; line-height: 10px; color: #777777; }
.${P}-pl { position: absolute; left: 12px; top: 484px; box-sizing: border-box; width: 126px; height: 20px; border-radius: 3px; background: #2e3036; }
.${P}-pl svg { position: absolute; left: 7px; top: 5px; width: 10px; height: 10px; }
.${P}-pt { position: absolute; left: 23px; top: 0; font-size: 6.8px; line-height: 20px; color: #ffffff; }
.${P}-px { position: absolute; right: 8px; top: 5px; width: 10px; height: 10px; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const STAGES = [0, 0.30, 0.60, 0.90];              // the header sentence swaps at each of these (layout seconds)
const SLOT = 0.90;                                 // the ten dark photo slots appear with the fourth sentence
const LAND = Array.from({ length: 10 }, (_, i) => 1.0 + i * (0.62 / 9));   // picture i lands in the flyer (strict reading order), the last at 1.62
const DONE = 1.70;                                 // the header becomes the review bar and the pill flips
// the flyer builds in three waves: blocks (yellow bands, dark column and bar), then each block's text
const BLOCKS = [0.34, 0.42, 0.50, 0.56];           // band, column, bar, footer band
const TEXTS = [0.62, 0.68, 0.74, 0.80, 0.84, 0.88];   // title, subtitle, band heading + body, column text, bar text, footer text

const STATUS = ['Generating your design....', 'Designing the flyer', "Optimizing the flyer's content", 'Finalizing the details'];

const SPARK = (c) => `<svg viewBox="0 0 12 12"><path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10 4.8 6.7 1.5 5.5 4.8 4.3z" fill="${c}"/></svg>`;
const THUMB = (x, flip) => `<svg class="${P}-th" style="left: ${x}px" viewBox="0 0 12 12"><g${flip ? ' transform="translate(0 12) scale(1 -1)"' : ''}><path d="M4 11V6.2L6.2 1.6c.7 0 1.3.6 1.1 1.4L6.9 5H10c.7 0 1.2.7 1 1.4l-1 3.8c-.1.5-.6.8-1.1.8H4zM1.5 6h1.8v5H1.5z" fill="none" stroke="#444" stroke-width=".9" stroke-linejoin="round"/></g></svg>`;

export default {
  id: 'venngage-ai',
  label: 'Venngage AI Design (2026)',
  source: {
    platform: "Venngage web app, the DesignAI 'generate a design' flow (not the AI image generator), desktop browser, 1280x720 screen recording of a third-party tutorial (Blog With Ben), signed in",
    feature: "DesignAI Universal Generator in flyer mode: after 'Generate flyer' the page is a purple-to-blue gradient hero ('What will you create today?') with one centred white card; the card's header line (back arrow, spinner, stop control) swaps in place through four sentences while the flyer inside builds as wireframe blocks (yellow bands, dark columns and bars), then text, then a photo; a small dark pill bottom-left reads 'Design is generating'. When it ends the header becomes 'How does this look?' with thumbs up / down and a blue 'Continue Editing' button, and the pill reads 'Design has generated'",
    capture: {
      url: 'https://www.youtube.com/watch?v=MpNH4RAQ56A',
      date: '2026-02-13',
      timestamps: "video MpNH4RAQ56A (wait un-cut, 36 consecutive 2 fps frames): 'Generate flyer' clicked 04:13.0, 'Generating your design....' ~04:16 (frame bw_venngage-ai_pending_t16), 'Designing the flyer' ~04:20 (pending_t20), \"Optimizing the flyer's content\" ~04:25 (pending_t25), 'Finalizing the details' ~04:30 (pending_t30), the finished flyer, the review bar and the pill 'Design has generated' 04:31.3-04:33 (landed_t33)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=MpNH4RAQ56A', published: '2026-02-13', retrieved: '2026-10-15', note: 'Venngage AI Flyer Generator Tutorial (Blog With Ben, third party): the wait un-cut, all four header sentences, the wireframe build, the pill and the review bar read from it' },
    ],
    extrapolated: [
      "all timing: the recording's wait runs ~18.5 s (one sample); here the four sentences, the wireframe build, the ten landings and the review bar share the 1.84 s beat, the sentences swapping every 0.30 layout seconds",
      "the flyer: the recording builds ONE flyer ('SCALE YOUR BUSINESS FASTER', black and yellow, one photo); here the flyer is our own black-and-yellow layout ('MUSE MEMES MADE FAST') with ten photo slots in a 5 x 2 grid, each a dark block until its picture lands, in strict reading order",
      "the wireframe order: the recording shows the blocks growing monotonically (skeleton -> blocks -> text -> photo); the exact moment each block and text line appears here is our own",
      "the spinner: the recording shows a thin ring spinner left of the sentence; here it is a ring with one arc stepped in eighths of a turn from t alone, because a spinning glyph needs no CSS animation",
      "omitted from the recording: the two-line grey sub-caption under the third and fourth sentences, the presenter's face bubble and watermark, the 'Want something else? Try a different template style.' row with its three thumbnails, the Venngage logo, the 'Business' plan badge and the other nav items",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'venngage-ai');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-nv"><p class="${P}-ni" style="left: 16px">Home</p><p class="${P}-ni" style="left: 54px">Templates</p><p class="${P}-na">${SPARK('#3b5bdb')}DesignAI</p><p class="${P}-iv">Invite Team</p><p class="${P}-wn">What's new</p></div>`
      + `<div class="${P}-hr"></div><p class="${P}-hh">What will you create today?</p>`
      + `<div class="${P}-cd">`
      + `<svg class="${P}-bk" viewBox="0 0 12 12"><path d="M10.5 6H2.5M5.8 2.5L2.3 6l3.5 3.5" fill="none" stroke="#333" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      + `<div class="${P}-hb">`
      + `<div class="${P}-hp"><svg class="${P}-sp" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.6" fill="none" stroke="#dcdce0" stroke-width="1.3"/><path d="M6 1.4a4.6 4.6 0 0 1 4.6 4.6" fill="none" stroke="#555" stroke-width="1.3" stroke-linecap="round"/></svg><p class="${P}-st"></p>`
      + `<svg class="${P}-sx" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.4" fill="none" stroke="#2a2a2a" stroke-width="1.2"/><rect x="5.6" y="5.6" width="4.8" height="4.8" rx=".8" fill="#2a2a2a"/></svg></div>`
      + `<div class="${P}-hd"><p class="${P}-hq">How does this look?</p>${THUMB(88, false)}${THUMB(106, true)}`
      + `<p class="${P}-ce"><svg viewBox="0 0 12 12"><path d="M2 10l.5-2.5 5.8-5.8 2 2L4.5 9.5z" fill="#ffffff"/></svg>Continue Editing</p></div>`
      + `</div>`
      + `<div class="${P}-fy">`
      + `<div class="${P}-b1"></div>`
      + `<div class="${P}-co"><i></i><b></b><p class="${P}-ch">Fresh set</p><p class="${P}-cb">Ten new takes on your photo, ready to post.</p></div>`
      + `<div class="${P}-br"><p>SEE ALL TEN PICKS BELOW</p></div>`
      + `<div class="${P}-b2"><p>MUSE MEMES</p></div>`
      + `<p class="${P}-t1">MUSE MEMES<br>MADE FAST</p><p class="${P}-t2">YOUR TEN PICKS ARE READY</p>`
      + `<p class="${P}-t3">Ten picks, one look</p><p class="${P}-t4">Each picture lands in its own slot, laid out in order from the top left.</p>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `</div>`
      + `<p class="${P}-ft">DesignAI may make mistakes or generate incorrect outputs.</p>`
      + `</div>`
      + `<div class="${P}-pl"><svg class="${P}-pw" viewBox="0 0 12 12"><path d="M2 10L7 5M8.5 1.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      + `<svg class="${P}-pk" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#2fbf71"/><path d="M3.6 6.2l1.8 1.8 3-3.4" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      + `<p class="${P}-pt"></p><svg class="${P}-px" viewBox="0 0 10 10"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="#d0d2d8" stroke-width="1" stroke-linecap="round"/></svg></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const hp = q('hp'), hd = q('hd'), sp = q('sp'), st = q('st'), ft = q('ft'), pw = q('pw'), pk = q('pk'), pt = q('pt');
    const blocks = [q('b1'), q('co'), q('br'), q('b2')];
    const texts = [q('t1'), q('t2'), [q('t3'), q('t4')], [q('ch'), q('cb')], root.querySelector(`.${P}-br p`), root.querySelector(`.${P}-b2 p`)].flat();
    const textAt = [TEXTS[0], TEXTS[1], TEXTS[2], TEXTS[2], TEXTS[3], TEXTS[3], TEXTS[4], TEXTS[5]];
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
        const done = s >= DONE;
        const stage = s >= STAGES[3] ? 3 : s >= STAGES[2] ? 2 : s >= STAGES[1] ? 1 : 0;
        const turn = done ? 0 : Math.floor(s * 10) % 8;   // the spinner's arc, stepped in eighths of a turn

        put('hd', done, (v) => { hp.style.visibility = v ? 'hidden' : ''; hd.style.visibility = v ? '' : 'hidden'; ft.style.visibility = v ? '' : 'hidden'; });
        put('st', stage, (v) => { st.textContent = STATUS[v]; });
        put('sp', turn, (v) => { sp.style.transform = `rotate(${v * 45}deg)`; });
        put('pl', done, (v) => { pt.textContent = v ? 'Design has generated' : 'Design is generating'; pw.style.visibility = v ? 'hidden' : ''; pk.style.visibility = v ? '' : 'hidden'; });
        blocks.forEach((b, i) => put(`b${i}`, s >= BLOCKS[i], (v) => { b.style.visibility = v ? '' : 'hidden'; }));
        texts.forEach((n, i) => put(`x${i}`, s >= textAt[i], (v) => { n.style.visibility = v ? '' : 'hidden'; }));

        cells.forEach((c, i) => {
          // 0: an empty slot, 1: a dark photo block, 2: the picture; a hard swap, never both, never neither
          const state = s >= LAND[i] ? 2 : s >= SLOT ? 1 : 0;
          put(`i${i}`, state, (v) => {
            c.im.style.visibility = v === 2 ? '' : 'hidden';
            c.cv.style.display = v === 2 ? 'none' : '';
            c.cv.style.background = v === 1 ? '#1c212a' : '#efefea';
          });
        });
      },
    };
  },
};
