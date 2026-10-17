// ColorBliss coloring pages (2026): the wait of the guest generator on colorbliss.com, read from a live no-login browser capture on 2026-10-16
// (22:23 MDT, 1280x800, frames reveal-refs/colorbliss/frames/cb_pending_submitting.png t~0.4 s, cb_pending_generating.png t~2.4 s, cb_landed.png
// t~8.0 s, spec .tmp/clone-9e82faf1/reveal-refs/colorbliss/spec.json, confidence 0.62). The wait happens IN PLACE on a live marketing page: a white
// page under a soft pink top band, a small pink 'Try it free' chip, the bold heading 'Make a free coloring page right here' and a grey subline;
// the left card carries the tabs 'From a prompt | From a photo', 'Describe your coloring page' with the prompt typed in, a 'Style' row
// ('Standard') and 'Aspect ratio' tiles ('Portrait' selected, 'Square'), and the pink submit button; the right result panel has a dashed pale
// pink border and stays EMPTY while a thin magenta determinate bar fills its grey track in the middle of it under a small grey caption that swaps
// in place 'Submitting prompt...' -> 'Generating your coloring page...', while the submit button turns a muted pink and reads 'Generating...'.
// Landing: the bar and caption go, the submit button reverts to 'Generate coloring page' and the panel shows the ten pictures as a 5 x 2 grid of
// printable line-art pages in strict reading order. Every picture is OUR meme under a static greyscale line-art grade; no ColorBliss logo, no
// 'Save more with a free account', no plan, upgrade or pricing chrome; system UI face only.
import { injectStyle, restTransform, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-clb';
const ROOT_W = 560, ROOT_H = 396;
const CARD_L = 14, CARD_T = 92, CARD_W = 200, CARD_H = 290;
const PN_L = CARD_L + CARD_W + 10, PN_W = ROOT_W - PN_L - 14;   // the result panel runs to the page margin
const COLS = 5, GAP = 4;
const BAR_W = 190;
const MAGENTA = '#d9006f', RASPBERRY = '#c7005b', INK = '#171a30', GREY = '#5f6477';
const LINE_ART = 'grayscale(1) brightness(2.3) contrast(.9)';   // a static high-key greyscale grade, a light-ink printed page (a CSS filter cannot trace outlines); never animated
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: linear-gradient(180deg, #fde9f2 0, #fff3f8 46px, #ffffff 150px); color: ${INK}; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .08); }
.${P} p { position: absolute; margin: 0; white-space: nowrap; }
.${P}-chip { left: 16px; top: 10px; box-sizing: border-box; height: 17px; padding: 0 9px; border-radius: 9px; background: #fbd9e8; font-size: 9.5px; line-height: 17px; font-weight: 700; color: ${RASPBERRY}; }
.${P}-h { left: 16px; top: 31px; font-size: 22px; line-height: 28px; font-weight: 800; letter-spacing: -.7px; color: ${INK}; }
.${P}-sub { left: 16px; top: 64px; font-size: 10.5px; line-height: 14px; color: ${GREY}; }
.${P}-card { position: absolute; left: ${CARD_L}px; top: ${CARD_T}px; box-sizing: border-box; width: ${CARD_W}px; height: ${CARD_H}px; border-radius: 16px; background: #ffffff; box-shadow: 0 0 0 1px #eeeaed, 0 4px 14px rgba(120, 40, 80, .05); }
.${P}-tabs { position: absolute; left: 10px; top: 11px; box-sizing: border-box; width: 180px; height: 26px; border-radius: 9px; background: #f1f2f4; box-shadow: inset 0 0 0 1px #e6e7ea; }
.${P}-tab { top: 3px; box-sizing: border-box; width: 86px; height: 20px; border-radius: 7px; font-size: 8.5px; line-height: 20px; font-weight: 600; text-align: center; color: #6d7184; }
.${P}-on { background: #ffffff; color: ${INK}; font-weight: 700; box-shadow: 0 0 0 1px #e7e5e8, 0 1px 2px rgba(0, 0, 0, .06); }
.${P}-lb { left: 10px; font-size: 8.5px; line-height: 12px; font-weight: 700; color: #3a3f55; }
.${P}-ta { position: absolute; left: 10px; top: 58px; box-sizing: border-box; width: 180px; height: 50px; border-radius: 8px; background: #ffffff; box-shadow: inset 0 0 0 1px #d8d8de; }
.${P}-ta p { left: 8px; top: 7px; width: 164px; white-space: normal; font-size: 9px; line-height: 12.5px; color: ${INK}; }
.${P}-hp { left: 10px; top: 112px; font-size: 7px; line-height: 10px; color: #7d8193; }
.${P}-st { position: absolute; left: 10px; top: 143px; box-sizing: border-box; width: 180px; height: 46px; border-radius: 8px; background: #fdf0f6; box-shadow: inset 0 0 0 1px #f8dce8; }
.${P}-st p { left: 9px; }
.${P}-stb { top: 7px; font-size: 10px; line-height: 14px; font-weight: 700; color: ${INK}; }
.${P} p.${P}-std { top: 22px; width: 162px; white-space: normal; font-size: 7px; line-height: 10px; color: ${GREY}; }
.${P}-as { position: absolute; top: 210px; box-sizing: border-box; width: 86px; height: 34px; border-radius: 8px; background: #ffffff; box-shadow: inset 0 0 0 1.2px #dcdce1; text-align: center; }
.${P}-as p { left: 0; width: 86px; }
.${P}-asb { top: 6px; font-size: 9.5px; line-height: 13px; font-weight: 700; color: ${INK}; }
.${P}-asd { top: 20px; font-size: 7px; line-height: 10px; color: #7d8193; }
.${P}-as.${P}-on { background: #fdf0f6; box-shadow: inset 0 0 0 1.5px #e5509a; }
.${P}-btn { position: absolute; left: 10px; top: 252px; box-sizing: border-box; width: 180px; height: 26px; border-radius: 6px; background: ${RASPBERRY}; text-align: center; }
.${P}-btn p { left: 0; width: 180px; top: 0; font-size: 9.5px; line-height: 26px; font-weight: 700; color: #ffffff; }
.${P}-pn { position: absolute; left: ${PN_L}px; top: ${CARD_T}px; box-sizing: border-box; width: ${PN_W}px; height: ${CARD_H}px; border-radius: 16px; background: #ffffff; border: 1.5px dashed #f4b3cd; }
.${P}-bw { position: absolute; left: ${(PN_W - 3 - BAR_W) / 2}px; top: ${CARD_H / 2 - 12}px; width: ${BAR_W}px; height: 5px; border-radius: 3px; background: #e6e6e9; overflow: hidden; }
.${P}-fill { position: absolute; left: 0; top: 0; height: 5px; width: 0; border-radius: 3px; background: ${MAGENTA}; }
.${P}-cap { left: 0; width: ${PN_W - 3}px; top: ${CARD_H / 2 - 3}px; text-align: center; font-size: 8.5px; line-height: 12px; color: ${GREY}; }
.${P}-g { position: absolute; left: ${(PN_W - 3 - (PN_W - 3 - 14)) / 2}px; top: 0; bottom: 0; width: ${PN_W - 3 - 14}px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; align-content: center; }
.${P}-t { position: relative; aspect-ratio: 17 / 22; border-radius: 4px; overflow: hidden; background: #ffffff; box-shadow: 0 0 0 1px #e8e4e7, 0 2px 5px rgba(120, 40, 80, .08); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #fdf1f7; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const BAR_END = 1.0;                               // the bar reaches 100 here, then holds a beat before the first landing
const SWAP = 0.32;                                 // the caption swaps 'Submitting prompt...' -> 'Generating your coloring page...' (cb_pending_generating: bar ~30%)
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i lands (strict reading order), the last at 1.70; the bar goes at the first
const PROMPT = 'a muse holding up a handwritten note in a lecture hall, meme style';

export default {
  id: 'colorbliss',
  label: 'ColorBliss coloring pages (2026)',
  source: {
    platform: "ColorBliss website (colorbliss.com), the inline 'Make a free coloring page right here' generator on the homepage, used as a guest with no account, desktop browser 1280x800",
    feature: "AI coloring-page generation from a text prompt ('From a prompt' tab) rendered as black-and-white printable line art: the wait stays IN PLACE on the live marketing page (no takeover, no scrim); a thin magenta determinate bar fills its grey track in the middle of the empty dashed result panel under a small grey caption that swaps 'Submitting prompt...' -> 'Generating your coloring page...', and the left card's submit button turns muted and reads 'Generating...' until the line-art page replaces the empty panel",
    capture: {
      url: 'https://colorbliss.com/',
      date: '2026-10-16',
      retrieved: '2026-10-16',
      timestamps: "live guest run, prompt 'a muse holding up a handwritten note in a lecture hall, meme style', PNG burst at ~300-400 ms (capture run 2026-10-16 22:23 MDT): t~0-0.4 s submit clicked, bar at the left of its track, caption 'Submitting prompt...' (cb_pending_submitting.png); t~2.4 s the caption swaps in place to 'Generating your coloring page...' with the bar ~30% (cb_pending_generating.png); t~8.0 s the finished line-art page fills the panel and the button reads 'Generate coloring page' again (cb_landed.png); one sample, ~7-8 s",
    },
    refs: [
      { url: 'https://colorbliss.com/', published: '2026-10-16', retrieved: '2026-10-16', note: "ColorBliss home page, the generator section (live guest capture): heading 'Make a free coloring page right here', the 'From a prompt' card, the dashed result panel, the bar and its two captions" },
    ],
    extrapolated: [
      "the landing: the live run lands ONE printable page filling the panel at t~8.0 s; here the bar and caption go together at the first landing (the submit button reverting to 'Generate coloring page' at the same moment) and the ten pictures fill a 5 x 2 grid of pages in the panel in strict reading order, the pages' empty slots appearing as pale pink sheets with the first landing",
      "the bar: the capture shows ~30% when the caption swaps at t~2.4 s of ~7.6 s and no printed figure; here the fill is a pure function of t, linear to 100% over the pending run, the caption swapping at 32% of it, and holding full for a beat before the first landing",
      "the line art: the pictures are OUR meme under a static greyscale / contrast / brightness grade (never animated) that reads them as printable pages, not the capture's drawn line art",
      "the page: redrawn at the 560 px block width, the heading, tabs, 'Describe your coloring page' field (with the capture's typed prompt), 'Style' row ('Standard') and 'Aspect ratio' tiles ('Portrait' selected, 'Square') as plain boxes in the system face; the subline is cut to its first sentence",
      "omitted from the capture: the site navigation, the 'Save more with a free account' link, the sentence of the subline that offers a free account, the free-demo allowance copy, any download / print affordance, every logo and wordmark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'colorbliss');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${LINE_ART}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const tab = (label, l, on) => `<p class="${P}-tab${on ? ` ${P}-on` : ''}" style="left: ${l}px">${label}</p>`;
    const aspect = (b, d, l, on) => `<div class="${P}-as${on ? ` ${P}-on` : ''}" style="left: ${l}px"><p class="${P}-asb">${b}</p><p class="${P}-asd">${d}</p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<p class="${P}-chip">Try it free</p>`
      + `<p class="${P}-h">Make a free coloring page right here</p>`
      + `<p class="${P}-sub">Type one idea and get a printable coloring page in a few seconds.</p>`
      + `<div class="${P}-card">`
      + `<div class="${P}-tabs">${tab('From a prompt', 3, true)}${tab('From a photo', 91, false)}</div>`
      + `<p class="${P}-lb" style="top: 45px">Describe your coloring page</p>`
      + `<div class="${P}-ta"><p>${PROMPT}</p></div>`
      + `<p class="${P}-hp">A few details help. Add the subject, setting, or mood.</p>`
      + `<p class="${P}-lb" style="top: 129px">Style:</p>`
      + `<div class="${P}-st"><p class="${P}-stb">Standard</p><p class="${P}-std">The free demo keeps things simple for clean printable lines.</p></div>`
      + `<p class="${P}-lb" style="top: 196px">Aspect ratio:</p>`
      + aspect('Portrait', 'Most printable pages', 10, true) + aspect('Square', 'Great for crafts', 104, false)
      + `<div class="${P}-btn"><p class="${P}-bt">Generate coloring page</p></div>`
      + `</div>`
      + `<div class="${P}-pn">`
      + `<div class="${P}-bw"><i class="${P}-fill"></i></div><p class="${P}-cap">Submitting prompt...</p>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const bw = q('bw'), fill = q('fill'), cap = q('cap'), btn = q('btn'), bt = q('bt'), grid = q('g');
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
        const gone = s >= LAND[0];                     // the bar and its caption go at the first landing
        const u = Math.min(s / BAR_END, 1);
        const w = Math.round(u * 1000) / 10;           // the bar's fill, a pure function of t
        const second = s >= SWAP;

        put('bw', gone, (v) => { bw.style.visibility = v ? 'hidden' : ''; cap.style.visibility = v ? 'hidden' : ''; });
        put('w', w, (v) => { fill.style.width = `${v}%`; });
        put('cap', second, (v) => { cap.textContent = v ? 'Generating your coloring page...' : 'Submitting prompt...'; });
        put('btn', gone, (v) => { btn.style.background = v ? RASPBERRY : '#e283b0'; bt.textContent = v ? 'Generate coloring page' : 'Generating...'; });
        put('gv', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a pale pink sheet until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
