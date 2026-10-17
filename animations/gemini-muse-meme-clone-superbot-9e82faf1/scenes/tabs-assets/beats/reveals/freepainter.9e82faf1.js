// FreePainter (2026): the wait of the free 'AI book cover generator' tool page on freepainter.com, read from a live no-login browser capture on
// 2026-10-16 (22:26 MDT, 1280x800; frames reveal-refs/freepainter/frames/cb_pending_palette.png t~0.7 s, cb_pending_pct.png t~9.1 s, cb_landed.png,
// spec .tmp/clone-9e82faf1/reveal-refs/freepainter/spec.json, confidence 0.60; the same pending card was also seen on the landscape-design page).
// A warm cream editorial page: a thin promo strip, a small nav ('Painters', 'Gallery', 'Blog'), the breadcrumb 'FreePainter > Free AI book cover
// generator', the pill 'Free to use . No signup . No paid credits', a big serif italic headline and a grey serif intro. Pressing 'Paint' puts ONE
// floating white rounded card under the intro: a small painterly brush-stroke swatch on its left, the italic line 'Painting your artwork...',
// a grey sub-caption that rotates 'Preparing palette' -> 'First layer' -> 'Building texture', and a thin bar (sage fading to warm orange on a
// light track) with a live percentage at its right end. Landing (OURS, see source.extrapolated): the card gives way to the ten pictures as a 5 x 2
// grid of painted covers filling in strict reading order. Every picture is OUR meme under a static warm grade; no FreePainter logo, no sale text
// in the promo strip, no cookie banner, no error string; system UI face and the system serif only.
import { injectStyle, restTransform, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-fpt';
const ROOT_W = 560, ROOT_H = 428;
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const CARD_W = 306, CARD_H = 64, CARD_T = 268;
const BAR_L = 66, BAR_W = 176;
const SLOT_T = 204, COLS = 5, GAP = 6, GRID_W = 454;
const INK = '#2a3b2e', SERIF_GREY = '#6a6a5e', SAGE = '#8d9a78', ORANGE = '#e0805a';
const PAINTED = 'sepia(.3) saturate(1.25) contrast(1.05) brightness(1.04)';   // a static warm grade; never animated
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #fbf8f1; color: ${INK}; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(60, 50, 30, .12); }
.${P} p { position: absolute; margin: 0; white-space: nowrap; }
.${P}-promo { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 15px; background: linear-gradient(90deg, #b58f55 0%, #d79278 55%, #a99cc2 100%); }
.${P}-nav { position: absolute; left: 0; top: 15px; box-sizing: border-box; width: ${ROOT_W}px; height: 31px; background: #fcf9f2; border-bottom: 1px solid #e9e3d5; }
.${P}-nl { top: 9px; font-size: 8.5px; line-height: 12px; color: #55574e; text-align: center; width: 50px; }
.${P}-bc { top: 54px; font-family: ${SERIF}; font-size: 8.5px; line-height: 12px; color: #77786c; }
.${P}-bc b { font-weight: 400; color: #2f3a30; }
.${P}-pill { position: absolute; left: 192px; top: 88px; box-sizing: border-box; width: 176px; height: 16px; border-radius: 8px; background: #fffdf8; box-shadow: inset 0 0 0 1px #e4dece; }
.${P}-pill p { left: 0; width: 176px; top: 0; text-align: center; font-size: 7.5px; line-height: 16px; letter-spacing: .1px; color: #55574e; }
.${P}-h { left: 0; width: ${ROOT_W}px; top: 111px; text-align: center; font-family: ${SERIF}; font-size: 27.5px; line-height: 36px; font-weight: 700; font-style: italic; letter-spacing: -.4px; color: ${INK}; }
.${P}-in { left: 0; width: ${ROOT_W}px; top: 149px; text-align: center; font-family: ${SERIF}; font-size: 9.5px; line-height: 13.2px; color: ${SERIF_GREY}; }
.${P}-card { position: absolute; left: ${(ROOT_W - CARD_W) / 2}px; top: ${CARD_T}px; box-sizing: border-box; width: ${CARD_W}px; height: ${CARD_H}px; border-radius: 14px; background: #ffffff; box-shadow: 0 0 0 1px #e8e1d1, 0 8px 24px rgba(70, 55, 25, .11); }
.${P}-sw { position: absolute; left: 13px; top: 12px; box-sizing: border-box; width: 40px; height: 40px; border-radius: 8px; background: #fcf8ee; box-shadow: inset 0 0 0 1px #ebe3d0; overflow: hidden; }
.${P}-sw svg { position: absolute; left: 0; top: 0; width: 40px; height: 40px; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ttl { left: ${BAR_L}px; top: 12px; font-family: ${SERIF}; font-size: 12.5px; line-height: 16px; font-style: italic; font-weight: 600; color: #2b2f27; }
.${P}-sub { left: ${BAR_L}px; top: 30px; font-size: 8.5px; line-height: 12px; color: #9a9a8c; }
.${P}-tr { position: absolute; left: ${BAR_L}px; top: 49px; width: ${BAR_W}px; height: 3px; border-radius: 2px; background: #e9e5d9; overflow: hidden; }
.${P}-fill { position: absolute; left: 0; top: 0; height: 3px; width: 0; border-radius: 2px; background: linear-gradient(90deg, ${SAGE} 0, ${ORANGE} ${BAR_W}px); background-size: ${BAR_W}px 3px; background-repeat: no-repeat; }
.${P}-pc { left: ${BAR_L + BAR_W + 6}px; width: 34px; top: 44px; text-align: right; font-size: 8.5px; line-height: 12px; color: #7a7b6c; }
.${P}-g { position: absolute; left: ${(ROOT_W - GRID_W) / 2}px; top: ${SLOT_T}px; width: ${GRID_W}px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 870 / 1024; border-radius: 5px; overflow: hidden; background: #efe7d6; box-shadow: 0 0 0 1px #e2d9c4, 0 3px 8px rgba(70, 55, 25, .14); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(160deg, #f4eddd 0%, #e8decb 100%); }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const BAR_END = 1.0;                               // the figure reaches 100 here, then holds a beat before the first landing
const COAT = [[0, 'Preparing palette'], [0.25, 'First layer'], [0.5, 'Building texture']];   // the grey sub-caption's rotation, [from s, text]
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i lands (strict reading order), the last at 1.70; the card goes at the first

// the live percent as a pure function of t: 4 -> 100, a hair slow at the start like the capture's 4-13% first second
const exact = (s) => Math.round((4 + 96 * Math.pow(Math.min(Math.max(s / BAR_END, 0), 1), 1.12)) * 10) / 10;
const coat = (s) => COAT.filter(([from]) => s >= from).pop()[1];

const STROKES = '<svg viewBox="0 0 40 40">'
  + '<path d="M6 27c6-9 12-13 19-12s7 6 9 5" stroke="#c9a15d" stroke-width="5.5"/>'
  + '<path d="M8 21c5-6 10-8 17-7" stroke="#b9663f" stroke-width="3.2"/>'
  + '<path d="M9 31c7-3 14-3 23-8" stroke="#8d9a78" stroke-width="3"/>'
  + '</svg>';

export default {
  id: 'freepainter',
  label: 'FreePainter (2026)',
  source: {
    platform: "FreePainter website (freepainter.com), the 'Free AI book cover generator' tool page, used as a guest with no account, desktop browser 1280x800",
    feature: "AI book-cover concept art from a text prompt ('Paint'): the page keeps its whole layout and ONE floating white rounded card appears under the intro: a small painterly brush-stroke swatch, the italic line 'Painting your artwork...', a grey sub-caption rotating 'Preparing palette' -> 'First layer' -> 'Building texture' and a thin determinate bar with a live percentage at its right end",
    capture: {
      url: 'https://www.freepainter.com/ai-book-cover-generator',
      date: '2026-10-16',
      retrieved: '2026-10-16',
      timestamps: "live guest run, prompt 'a gothic manor above sea cliffs with dark space at the top for a title', PNG burst at ~300-400 ms (capture run 2026-10-16 22:26 MDT): t~0-1.6 s 'Paint' pressed, the card appears reading 'Painting your artwork...' / 'Preparing palette' with the bar at 4-13% (cb_pending_palette.png, 7%); t~8.7-9.1 s the sub-caption reads 'Building texture' with the figure still climbing, 43-46% (cb_pending_pct.png); t~10.4 s the run ended in a session error, not a picture (cb_landed.png); 'First layer' read from the same card on the sibling landscape-design page; one sample, ~10 s",
    },
    refs: [
      { url: 'https://www.freepainter.com/ai-book-cover-generator', published: '2026-10-16', retrieved: '2026-10-16', note: "FreePainter 'Free AI book cover generator' tool page (live guest capture): the cream editorial layout and the floating 'Painting your artwork...' card" },
    ],
    extrapolated: [
      "the landing: the live run ended in a session error (no picture), so the landed state is ours: the card gives way at the first landing to the ten pictures as a 5 x 2 grid of painted covers filling in strict reading order, the covers' empty slots appearing as pale paper sheets with the first landing",
      "the figure and bar: the capture shows 4-13% in the first 1.6 s and 43-46% near t~9 s of ~10 s; here the printed figure and the bar's fill are one pure function of t, 4 -> 100 over the pending run, holding 100% for a beat before the first landing",
      "the sub-caption: the capture reads 'Preparing palette' (7%) and 'Building texture' (43-46%), 'First layer' on a sibling page; here the three rotate in that order at 0.25 and 0.5 of the pending run",
      "the pictures: OUR meme under a static warm grade and per-tile crop, not painted covers",
      "the page: redrawn at the 560 px block width in the system face and the system serif; the promo strip is drawn blank (its sale text is omitted), the capture's input, aspect row and 'Paint' button, which the card replaces in the capture, are not drawn",
      "omitted from the capture: the FreePainter logo and wordmark in the nav, the strip's sale text and close cross, the cookie banner, the error string, the 'Try again' link, the 'More styles' section below",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'freepainter');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${PAINTED}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const nav = (label, cx) => `<p class="${P}-nl" style="left: ${cx - 25}px">${label}</p>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-promo"></div>`
      + `<div class="${P}-nav">${nav('Painters', 415)}${nav('Gallery', 454)}${nav('Blog', 489)}</div>`
      + `<p class="${P}-bc" style="left: 52px">FreePainter &nbsp;›&nbsp; <b>Free AI book cover generator</b></p>`
      + `<div class="${P}-pill"><p>Free to use &nbsp;·&nbsp; No signup &nbsp;·&nbsp; No paid credits</p></div>`
      + `<p class="${P}-h">Free AI book cover generator</p>`
      + `<p class="${P}-in">Create cover-ready concept art organized around genre, focal point, and<br>title-safe space. Describe the subject, composition, palette, and finish;<br>generate online with no signup or paid credits.</p>`
      + `<div class="${P}-card"><div class="${P}-sw">${STROKES}</div>`
      + `<p class="${P}-ttl">Painting your artwork...</p><p class="${P}-sub">Preparing palette</p>`
      + `<div class="${P}-tr"><i class="${P}-fill"></i></div><p class="${P}-pc">4%</p></div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const card = q('card'), sub = q('sub'), fill = q('fill'), pc = q('pc'), grid = q('g');
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
        const gone = s >= LAND[0];                     // the card goes at the first landing
        const e = exact(s);

        put('card', gone, (v) => { card.style.visibility = v ? 'hidden' : ''; });
        put('e', e, (v) => { fill.style.width = `${v}%`; pc.textContent = `${Math.round(v)}%`; });
        put('sub', coat(s), (v) => { sub.textContent = v; });
        put('gv', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a pale paper sheet until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
