// PosterMont AI Poster (2026): the wait of the guest generator on the marketing homepage https://aipostergenerator.ai/ (live no-login capture 2026-10-16,
// 22:50 MDT, 1280x800, ~13 s wait; frames reveal-refs/aipostergenerator/frames/cc_{pending_15pct,pending_45pct,landed}.png, spec
// .tmp/clone-9e82faf1/reveal-refs/aipostergenerator/spec.json, confidence 0.6). The page is a near-black two-column hero with a warm dark-red glow: the
// left half stays fully lit (the huge white 'AI Poster Generator' headline with 'Poster' in orange, a grey subline, a dark prompt card holding the typed
// prompt, an orange 'Generate' pill and the chip row Image / Video / GIF, the model chip and the 3:4 ratio chip) while the right half is a tall dark
// poster panel with a 1 px border and a caption strip under it echoing the prompt. The wait lives only inside that panel: a thin orange arc spinner on a
// grey ring, the single label 'Generating...' and a slim orange determinate bar with a small grey live percentage under it. Landing: the spinner block
// goes and the panel is filled; here the ten pictures fill a 2 x 5 poster sheet inside the panel in strict reading order and 'Download' (orange) and
// 'Print 300 DPI' appear under the caption. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; no wordmark, no nav
// buttons, no credit badge, no pricing; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-apg';
const ROOT_W = 560, ROOT_H = 520;
const PN_L = 392, PN_T = 44, PN_W = 150, PA_H = 404, CAP_H = 28, BTN_H = 36;   // the poster panel: poster area, caption strip, button row (landed only)
const ACCENT = '#ff4b2b';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0a0a0a; color: #f4f0ea; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P}-gl { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: radial-gradient(ellipse 260px 220px at 560px 90px, rgba(120, 30, 18, .42) 0, rgba(120, 30, 18, 0) 100%), radial-gradient(ellipse 200px 220px at 0px 420px, rgba(90, 24, 16, .26) 0, rgba(90, 24, 16, 0) 100%); }
.${P}-nv { position: absolute; left: 0; top: 14px; width: ${ROOT_W}px; height: 14px; display: flex; justify-content: center; gap: 20px; font-size: 9.5px; line-height: 14px; font-weight: 500; color: #c9c4c0; }
.${P}-nv span { display: inline-flex; align-items: center; gap: 3px; }
.${P}-nv svg { width: 7px; height: 7px; fill: none; stroke: #8f8a88; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-h { position: absolute; left: 24px; font-size: 56px; line-height: 52px; font-weight: 800; letter-spacing: -2.6px; color: #f6f2ec; }
.${P}-h b { color: ${ACCENT}; font-weight: 800; }
.${P}-sb { position: absolute; left: 24px; top: 240px; width: 336px; white-space: normal !important; font-size: 10px; line-height: 16px; color: #aaa4a2; }
.${P}-cd { position: absolute; left: 24px; top: 304px; box-sizing: border-box; width: 336px; height: 98px; border-radius: 9px; background: #19161a; box-shadow: inset 0 0 0 1px #2e292d; }
.${P}-up { position: absolute; left: 10px; top: 10px; box-sizing: border-box; width: 22px; height: 22px; border-radius: 5px; border: 1px dashed #4a4448; background: #201c20; }
.${P}-up svg { position: absolute; left: 5px; top: 5px; width: 10px; height: 10px; fill: none; stroke: #8f8a88; stroke-width: 1.6; stroke-linecap: round; }
.${P}-pt { position: absolute; left: 42px; top: 9px; width: 196px; white-space: normal !important; font-size: 10.5px; line-height: 14px; color: #ece7e1; }
.${P}-gb { position: absolute; left: 252px; top: 10px; box-sizing: border-box; width: 74px; height: 22px; border-radius: 11px; background: ${ACCENT}; color: #ffffff; font-size: 9.5px; line-height: 22px; font-weight: 700; padding-left: 24px; }
.${P}-gb svg { position: absolute; left: 9px; top: 6px; width: 10px; height: 10px; fill: none; stroke: #ffffff; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tg { position: absolute; left: 10px; top: 58px; box-sizing: border-box; height: 28px; width: 148px; border-radius: 7px; background: #211d21; box-shadow: inset 0 0 0 1px #2e292d; }
.${P}-tg p { position: absolute; top: 3px; height: 22px; box-sizing: border-box; border-radius: 5px; font-size: 9px; line-height: 22px; font-weight: 600; color: #8f8a88; }
.${P}-tg p.${P}-on { background: #f4f0ea; color: #141214; }
.${P}-tg svg { position: absolute; top: 7px; width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ch { position: absolute; top: 58px; box-sizing: border-box; height: 28px; border-radius: 7px; background: #1d191d; box-shadow: inset 0 0 0 1px #2e292d; font-size: 9px; line-height: 28px; font-weight: 500; color: #d9d4d0; }
.${P}-ch svg { position: absolute; fill: none; stroke: #a8a3a0; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pn { position: absolute; left: ${PN_L}px; top: ${PN_T}px; box-sizing: border-box; width: ${PN_W}px; height: ${PA_H + CAP_H + 2}px; border-radius: 9px; background: #0d0c0e; box-shadow: inset 0 0 0 1px #3a3236, 0 10px 28px rgba(0, 0, 0, .55); overflow: hidden; }
.${P}-pa { position: absolute; left: 1px; top: 1px; width: ${PN_W - 2}px; height: ${PA_H}px; background: #0d0c0e; }
.${P}-pg { position: absolute; left: 0; top: 0; width: ${PN_W - 2}px; height: ${PA_H}px; }
.${P}-sp { position: absolute; left: 59px; top: 160px; width: 30px; height: 30px; }
.${P}-sp svg { position: absolute; left: 0; top: 0; width: 30px; height: 30px; }
.${P}-gn { position: absolute; left: 0; width: ${PN_W - 2}px; top: 200px; text-align: center; font-size: 9px; line-height: 12px; font-weight: 600; color: #d8d2d4; }
.${P}-bt { position: absolute; left: 35px; top: 219px; width: 78px; height: 3px; border-radius: 2px; background: #2a2629; overflow: hidden; }
.${P}-bf { position: absolute; left: 0; top: 0; height: 3px; width: 15%; border-radius: 2px; background: ${ACCENT}; }
.${P}-pc { position: absolute; left: 0; width: ${PN_W - 2}px; top: 229px; text-align: center; font-size: 8px; line-height: 10px; color: #8a8588; }
.${P}-g { position: absolute; left: 8px; top: 7px; display: grid; grid-template-columns: repeat(2, 63px); column-gap: 6px; row-gap: 5px; }
.${P}-t { position: relative; width: 63px; height: 74px; border-radius: 3px; overflow: hidden; background: #1d191c; box-shadow: 0 0 0 1px #2e292d; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #1d191c; }
.${P}-cp { position: absolute; left: 1px; top: ${PA_H + 1}px; box-sizing: border-box; width: ${PN_W - 2}px; height: ${CAP_H}px; padding: 5px 8px 0; background: #19161a; white-space: normal !important; font-size: 7.6px; line-height: 9.5px; color: #aaa4a2; }
.${P}-bk { position: absolute; left: 1px; top: ${PA_H + CAP_H + 1}px; width: ${PN_W - 2}px; height: ${BTN_H}px; background: #19161a; }
.${P}-dl { position: absolute; left: 8px; top: 3px; box-sizing: border-box; width: 66px; height: 22px; border-radius: 5px; background: ${ACCENT}; color: #ffffff; font-size: 8.5px; line-height: 22px; font-weight: 700; padding-left: 21px; }
.${P}-dl svg { position: absolute; left: 7px; top: 6px; width: 10px; height: 10px; fill: none; stroke: #ffffff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pr { position: absolute; left: 80px; top: 3px; box-sizing: border-box; width: 60px; height: 22px; border-radius: 5px; background: #19161a; box-shadow: inset 0 0 0 1px #3a3236; color: #d9d4d0; font-size: 7.6px; line-height: 22px; font-weight: 600; text-align: center; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ARC_END = 1.0;                               // the figure reaches 100 here
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i fills its slot (strict reading order), the last at 1.70; the spinner block goes at the first
const SETTLE = LAND[0];                            // the spinner is frozen from the first landing on (it is hidden then)
const PROMPT = 'a minimal lecture-hall poster with bold type, meme style';
const SUBLINE = 'The AI poster generator turns a prompt or photo into a print-ready poster — with text you can edit, including Chinese.';

// the live percent as a pure function of t: linear like the footage (15% -> 45% over ~6.7 s), here carried 15 -> 100 across the wait
const percent = (s) => {
  const u = Math.min(Math.max(s / ARC_END, 0), 1);
  return Math.min(100, Math.round(15 + 85 * u));
};

const SVG = (cls, body, style) => `<svg class="${cls}"${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;
const CHEV = `<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>`;
const SPARK = '<path d="M9 3l1.6 4.4L15 9l-4.4 1.6L9 15l-1.6-4.4L3 9l4.4-1.6zM17 13l.9 2.6L20.5 16.5l-2.6.9L17 20l-.9-2.6-2.6-.9 2.6-.9z"/>';

export default {
  id: 'aipostergenerator',
  label: 'PosterMont AI Poster (2026)',
  source: {
    platform: "PosterMont 'AI Poster Generator' (aipostergenerator.ai), the inline homepage generator of the marketing site, used as a guest with no account; live capture in a desktop browser at 1280x800, dark UI",
    feature: "AI poster generation from a text prompt (Image tab, 'PosterMont AI' model, 3:4): the page stays fully lit and only the tall right poster panel changes - a thin orange arc spinner, 'Generating...' and a slim orange determinate bar with a live percentage (15% -> 33% -> 45%) wait inside it; the finished poster then replaces that block in place",
    capture: {
      url: 'https://aipostergenerator.ai/',
      page: 'https://aipostergenerator.ai/',
      date: '2026-10-16',
      retrieved: '2026-10-16',
      timestamps: "live guest run 2026-10-16 22:50 MDT, PNG burst at ~300 ms: t ~ 0 s the Generate pill clicked and the panel shows the arc spinner + 'Generating...' + the bar at 15% (cc_pending_15pct); t ~ 6.7 s the same block at 45% (cc_pending_45pct; the figure advances ~4-5 %/s, 33% seen on a second-look frame); t ~ 13.0 s the block clears and the finished poster fills the panel (cc_landed, t ~ 14.8 s); the wait is ~13 s on this single sample",
    },
    refs: [
      { url: 'https://aipostergenerator.ai/', published: '2026-10-16', retrieved: '2026-10-16', note: "PosterMont - AI Poster Generator (the live guest homepage generator): 'The AI poster generator turns a prompt or photo into a print-ready poster - with text you can edit, including Chinese.'" },
    ],
    extrapolated: [
      "the landing: the footage lands ONE poster that fills the panel at t ~ 13.0 s; here the spinner block goes at the first landing (the landed state then stays static) and the ten pictures fill a 2 x 5 poster sheet inside the panel in strict reading order, the empty slots showing as dark cards from the first landing",
      "the figure: the footage shows 15% -> 45% (one sample, no value at the end); here it climbs 15 -> 100 linearly as a pure function of t and holds 100% for a beat before the first landing; the bar's fill length equals the printed figure",
      "the spinner: the footage shows a short orange arc on a grey ring; here the arc turns at a constant rate as a pure function of t and is frozen when the block goes",
      "the panel's size: the live panel is ~343 x 530 px of a 1280 px page; here the page is redrawn at 560 px wide with the panel 150 px wide (the headline, prompt card and chips are redrawn, not scaled copies)",
      "the buttons: 'Download' and 'Print 300 DPI' sit in the footage's landed panel under the caption (with a regenerate icon button, omitted); here they appear with the first landing",
      "omitted from the footage: the 'PosterMont' wordmark, 'Pricing', the language switch, 'Login', 'Start for free' and the '0' credit badge on the Generate pill",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'aipostergenerator');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-gl"></div>`
      + `<div class="${P}-nv"><span>Poster Tools${CHEV}</span><span>Blog</span><span>Contact</span></div>`
      + `<p class="${P}-h" style="top: 118px">AI <b>Poster</b></p><p class="${P}-h" style="top: 170px">Generator</p>`
      + `<p class="${P}-sb">${SUBLINE}</p>`
      + `<div class="${P}-cd">`
      + `<div class="${P}-up">${SVG('', '<path d="M12 5v14M5 12h14"/>')}</div>`
      + `<p class="${P}-pt">${PROMPT}</p>`
      + `<p class="${P}-gb">${SVG('', SPARK)}Generate</p>`
      + `<div class="${P}-tg">`
      + `<p class="${P}-on" style="left: 3px; width: 50px; padding-left: 17px">${SVG('', '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>', 'left: 5px')}Image</p>`
      + `<p style="left: 57px; width: 46px; padding-left: 17px">${SVG('', '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3"/>', 'left: 5px')}Video</p>`
      + `<p style="left: 107px; width: 38px; padding-left: 17px">${SVG('', '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M4 9h16M4 15h16M9 3v18M15 3v18"/>', 'left: 5px')}GIF</p>`
      + `</div>`
      + `<p class="${P}-ch" style="left: 164px; width: 108px; padding-left: 23px">${SVG('', SPARK, 'left: 8px; top: 9px; width: 11px; height: 11px')}PosterMont AI${SVG('', '<path d="M6 9l6 6 6-6"/>', 'right: 7px; top: 10px; width: 9px; height: 9px')}</p>`
      + `<p class="${P}-ch" style="left: 280px; width: 44px; padding-left: 10px">3:4${SVG('', '<path d="M6 9l6 6 6-6"/>', 'right: 7px; top: 10px; width: 9px; height: 9px')}</p>`
      + `</div>`
      + `<div class="${P}-pn">`
      + `<div class="${P}-pa">`
      + `<div class="${P}-pg">`
      + `<div class="${P}-sp"><svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="none" stroke="#2c282b" stroke-width="2.2"/>`
      + `<circle class="${P}-arc" cx="15" cy="15" r="12" fill="none" stroke="${ACCENT}" stroke-width="2.4" stroke-linecap="round" pathLength="100" stroke-dasharray="26 74" transform="rotate(0 15 15)"/></svg></div>`
      + `<p class="${P}-gn">Generating...</p>`
      + `<div class="${P}-bt"><div class="${P}-bf"></div></div>`
      + `<p class="${P}-pc">15%</p>`
      + `</div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `</div>`
      + `<p class="${P}-cp">${PROMPT}</p>`
      + `<div class="${P}-bk"><p class="${P}-dl">${SVG('', '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>')}Download</p><p class="${P}-pr">Print 300 DPI</p></div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const pn = q('pn'), pg = q('pg'), arc = q('arc'), bf = q('bf'), pc = q('pc'), grid = q('g'), bk = q('bk');
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
        const gone = s >= LAND[0];                     // the spinner block goes at the first landing
        const pct = percent(s);
        const e = Math.min(s, SETTLE);                 // the spinner is frozen from the first landing on
        const deg = Math.round(((e * 1.15) % 1) * 360);

        put('rot', deg, (v) => { arc.setAttribute('transform', `rotate(${v} 15 15)`); });
        put('pg', gone, (v) => { pg.style.visibility = v ? 'hidden' : ''; });
        put('pc', pct, (v) => { pc.textContent = `${v}%`; bf.style.width = `${v}%`; });
        put('gv', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('bk', gone, (v) => { bk.style.visibility = v ? '' : 'hidden'; pn.style.height = `${PA_H + CAP_H + 2 + (v ? BTN_H : 0)}px`; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a dark slot until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
