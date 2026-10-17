// Brother Artspira AI (2026): the wait of the 'Artspira AI' photo-to-style conversion in the iPad embroidery app's 'Conversion' editor, from the uncut iPad screen recording
// https://www.youtube.com/watch?v=8f-ZpdhCiBQ (Sew Practical Sew Fun, 2026-05-10, t = 372-380 s of one continuous screen-recording take; stills t = 371.2 .. 383 s in
// reveal-refs/brother-artspira-ai/frames/ep_*.png, spec .tmp/clone-9e82faf1/reveal-refs/brother-artspira-ai/spec.json, confidence 0.55), corroborated by the first-party
// stream https://www.youtube.com/watch?v=U1wIig3CUMc (Brother Sews USA, 2024-08-01, t = 1078-1103 s). The page is the editor: white ground, the framed embroidery preview
// (a thin blue-bordered sheet with the stitched frame inside), the bottom tab bar 'Change' / 'Conversion' / 'Size' and the popover anchored to 'Conversion' with 'Cancel',
// the blue 'Convert' pill and the '?' button, the 'Artspira AI' switch (on), a row of four style thumbnails ('Black and White' selected), the style name, 'Convert your image
// to a style from the list', the link 'Recommended and non-recommended images', and the slider. The wait is the stock iOS alert over a grey scrim that dims the whole screen:
// 'Transformation is in progress...' / 'Please wait a moment.', first a grey eight-spoke activity spinner, then a thin determinate bar (empty, a small blue stub, nearly full)
// above a hairline and the blue 'Cancel'; behind the scrim the preview stays the speckled grey stitch map. Landing: scrim and alert go in one frame, the preview becomes the
// converted black-and-white artwork and 'Convert' reads 'Done'. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; no Brother or Artspira logo.
import { injectStyle, restTransform, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-bra';
const ROOT_W = 560, ROOT_H = 500;
const ACC = '#3f4fc4';                               // the app's indigo-blue: Cancel, Convert, link, progress fill, the selected thumbnail's border
const SH_L = 60, SH_T = 10, SH_W = 440, SH_H = 180;   // the framed embroidery preview sheet
const T_W = 74, T_H = 68, G_X = 8, G_Y = 8;           // the 5 x 2 sheet of converted pictures inside it
const G_L = (SH_W - (5 * T_W + 4 * G_X)) / 2, G_T = (SH_H - (2 * T_H + G_Y)) / 2;
const PO_L = 154, PO_T = 198, PO_W = 252, PO_H = 252; // the popover (anchored to 'Conversion' by its arrow)
const AL_W = 212, AL_H = 118, AL_L = (ROOT_W - AL_W) / 2, AL_T = 168;   // the alert
const BAR_L = 13, BAR_W = AL_W - 26;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #000000; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sh { position: absolute; left: ${SH_L}px; top: ${SH_T}px; box-sizing: border-box; width: ${SH_W}px; height: ${SH_H}px; background: #ffffff; border: 1px solid #2b3a9e; overflow: hidden; }
.${P}-fr { position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px; box-sizing: border-box; border: 2.5px solid #5a5a60; }
.${P}-fr2 { position: absolute; left: 11px; top: 11px; right: 11px; bottom: 11px; box-sizing: border-box; border: 1px solid #8a8a90; }
.${P}-sw { position: absolute; left: ${(SH_W - 150) / 2}px; top: ${(SH_H - 152) / 2}px; width: 150px; height: 152px; overflow: hidden; background: #ffffff; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-sw img, .${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-ht { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: radial-gradient(circle, rgba(60, 60, 66, .6) 0.7px, rgba(60, 60, 66, 0) 1.15px) 0 0 / 3px 3px, rgba(255, 255, 255, .42); }
.${P}-gd { position: absolute; left: ${G_L - 1}px; top: ${G_T - 1}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; width: ${T_W}px; height: ${T_H}px; overflow: hidden; background: #ffffff; box-shadow: 0 0 0 1px #111111; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
.${P}-po { position: absolute; left: ${PO_L}px; top: ${PO_T}px; box-sizing: border-box; width: ${PO_W}px; height: ${PO_H}px; border-radius: 9px; background: #fbfbfd; box-shadow: 0 2px 16px rgba(0, 0, 0, .2); }
.${P}-ar { position: absolute; left: ${PO_L + PO_W / 2 - 8}px; top: ${PO_T + PO_H - 1}px; width: 16px; height: 8px; }
.${P}-ar path { fill: #fbfbfd; stroke: none; }
.${P}-hl { position: absolute; left: 0; right: 0; height: 1px; background: #dcdce1; }
.${P}-cn, .${P}-ok, .${P}-lk, .${P}-rn { position: absolute; font-size: 11.5px; line-height: 14px; color: ${ACC}; }
.${P}-cn { left: 11px; top: 10px; }
.${P}-cb { position: absolute; right: 40px; top: 6px; height: 22px; padding: 0 13px; border-radius: 11px; background: ${ACC}; color: #ffffff; font-size: 11.5px; line-height: 22px; font-weight: 500; }
.${P}-qm { position: absolute; left: 218px; top: 10px; box-sizing: border-box; width: 15px; height: 15px; border-radius: 50%; background: ${ACC}; color: #ffffff; font-size: 9.5px; line-height: 15px; font-weight: 600; text-align: center; }
.${P}-ai { position: absolute; left: 11px; top: 52px; font-size: 11.5px; line-height: 14px; color: #111111; }
.${P}-sw2 { position: absolute; left: 207px; top: 49px; box-sizing: border-box; width: 35px; height: 20px; border-radius: 10px; background: #34c759; }
.${P}-sw2 i { position: absolute; left: 16px; top: 2px; display: block; width: 16px; height: 16px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 2px rgba(0, 0, 0, .25); }
.${P}-th { position: absolute; top: 80px; box-sizing: border-box; width: 53px; height: 53px; border-radius: 6px; overflow: hidden; background: #ffffff; box-shadow: 0 0 0 .5px #d4d4d9; }
.${P}-th svg { position: absolute; left: 0; top: 0; width: 53px; height: 53px; }
.${P}-th.${P}-on { box-shadow: 0 0 0 1.2px ${ACC}; }
.${P}-tn { position: absolute; left: 11px; top: 148px; font-size: 10.5px; line-height: 14px; color: #111111; }
.${P}-td { position: absolute; left: 11px; top: 164px; font-size: 10.5px; line-height: 14px; color: #2e2e32; }
.${P}-lk { left: 11px; top: 185px; font-size: 10.5px; }
.${P}-pv { position: absolute; left: 11px; top: 226px; box-sizing: border-box; width: 20px; height: 20px; border-radius: 3px; border: 1px solid #c4c4c9; background: radial-gradient(circle, rgba(70, 70, 76, .7) 0.5px, rgba(70, 70, 76, 0) 0.9px) 0 0 / 2px 2px, #dcdce0; }
.${P}-ld .${P}-pv { background: #111111; }
.${P}-pv i { position: absolute; display: none; background: #ffffff; }
.${P}-ld .${P}-pv i { display: block; }
.${P}-tr { position: absolute; left: 67px; top: 236px; width: 163px; height: 3px; border-radius: 2px; background: #e6e6ea; }
.${P}-kn { position: absolute; left: 49px; top: 227.5px; box-sizing: border-box; width: 19px; height: 19px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 4px rgba(0, 0, 0, .28); }
.${P}-tb { position: absolute; left: 0; top: 462px; width: ${ROOT_W}px; height: 38px; background: #ffffff; box-shadow: 0 -1px 0 #ececf0; }
.${P}-ti { position: absolute; top: 4px; width: 80px; text-align: center; font-size: 8.5px; line-height: 12px; color: ${ACC}; }
.${P}-ti svg { display: block; margin: 0 auto 3px; width: 15px; height: 15px; stroke: ${ACC}; stroke-width: 1.8; }
.${P}-sc { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0, 0, 10, 0); }
.${P}-al { position: absolute; left: ${AL_L}px; top: ${AL_T}px; box-sizing: border-box; width: ${AL_W}px; height: ${AL_H}px; border-radius: 11px; background: #f3f3f8; overflow: hidden; box-shadow: 0 0 0 .5px rgba(0, 0, 0, .06); }
.${P}-at { position: absolute; left: 0; right: 0; top: 17px; text-align: center; font-size: 10.5px; line-height: 13px; color: #000000; }
.${P}-sp { position: absolute; left: ${AL_W / 2 - 8}px; top: 59px; width: 16px; height: 16px; }
.${P}-bt { position: absolute; left: ${BAR_L}px; top: 66px; width: ${BAR_W}px; height: 3px; border-radius: 2px; background: #dedee3; overflow: hidden; }
.${P}-bf { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 2px; background: ${ACC}; }
.${P}-ah { position: absolute; left: 0; right: 0; top: 82px; height: 1px; background: #cfcfd6; }
.${P}-ac { position: absolute; left: 0; right: 0; top: 83px; text-align: center; font-size: 11.5px; line-height: 35px; color: ${ACC}; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i lands (strict reading order), the last at 1.70; scrim and alert go at the first
const SETTLE = LAND[0];
const WAIT = 1.04;                                 // the footage's 8 s wait (t = 372.0 -> 380.0 s) played over layout seconds 0 .. WAIT
const T_ALERT = 0.02, T_SCRIM = 0.06;              // the alert shows from here; the scrim reaches its full grey over T_SCRIM
const SCRIM_A = 0.22;                              // #c8c7cc over white
const SPIN_END = 3 / 8;                            // footage 372-375 s: the spinner; then the bar
const STEP = 0.0163;                               // one spoke per step: the footage's one turn a second (1.04 / 8 s per turn)
// the footage's bar: empty at 376.5 s, ~3% at 378.5 s, nearly full at 379.6 s, full by 380 s (fractions of the wait, then the filled fraction)
const BAR = [[SPIN_END, 0], [4.5 / 8, 0], [6.5 / 8, 0.03], [7.6 / 8, 0.95], [1, 1]];
const bar = (u) => {
  if (u <= BAR[0][0]) return 0;
  for (let i = 1; i < BAR.length; i++) {
    if (u <= BAR[i][0]) { const [a, b] = [BAR[i - 1], BAR[i]]; return a[1] + ((u - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); }
  }
  return 1;
};

const SVG = (cls, body, vb, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;
const ICON = {
  change: '<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',
  conv: '<path d="M13.5 4.5l6 6M14.5 9.5L7 17l-1.5 3.5L9 19l7.5-7.5M4 20.5h4"/>',
  size: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
};
// four drawn style swatches (plain shapes, never footage images): line art, silhouette, pop colour, simple colour
const SWATCH = [
  `<path d="M13 40c1-9 5-12 11-13M30 26c7 1 12 5 14 14M20 14c0-5 4-8 8-8s7 3 7 8-3 11-8 11-7-6-7-11zM38 32c3-3 8-3 11 0v12H35M44 36l3 1M26 30l4 5" stroke="#111111" stroke-width="1.1" fill="none"/><path d="M22 12c2-4 8-5 11-1M24 17c2 1 4 1 6 0" stroke="#111111" stroke-width=".9" fill="none"/>`,
  `<rect width="53" height="53" fill="#f2f2f4"/><path d="M12 53c0-14 6-19 13-20 7 1 15 6 16 20z" fill="#b6b6ba"/><ellipse cx="26" cy="21" rx="9" ry="11" fill="#b6b6ba"/>`,
  `<rect width="53" height="53" fill="#ffffff"/><path d="M6 53c0-12 6-17 14-18 8 1 14 6 14 18z" fill="#b98ac8"/><ellipse cx="20" cy="21" rx="8" ry="10" fill="#a4684a"/><path d="M12 17c1-8 14-9 16 0-4-3-11-3-16 0z" fill="#241c1c"/><path d="M26 40c2-8 10-12 18-8 4 3 5 12 5 21H28z" fill="#b8825f"/><circle cx="40" cy="38" r="2" fill="#2c211c"/>`,
  `<rect width="53" height="53" fill="#ffffff"/><path d="M4 53c0-11 6-16 14-17 8 1 14 6 14 17z" fill="#f2a7b9"/><ellipse cx="18" cy="21" rx="8" ry="10" fill="#f6c6a8"/><path d="M10 17c1-8 14-8 16 0-4-3-11-3-16 0z" fill="#3a2a22"/><path d="M26 40c2-8 10-12 18-8 4 3 5 12 5 21H28z" fill="#e9d5b4"/><circle cx="40" cy="38" r="2" fill="#2c211c"/>`,
];

export default {
  id: 'brother-artspira-ai',
  label: 'Brother Artspira AI (2026)',
  source: {
    platform: "Brother Artspira on iPad (iPadOS), the Image-to-Embroidery 'Conversion' editor with the 'Artspira AI' switch on; the busy state is the stock iOS alert over a dimmed screen. Third-party iPad screen recording, zoomed to the screen (no bezel)",
    feature: "Artspira AI photo-to-style conversion (style 'Black and White'): Convert is tapped, the whole screen dims to grey and a native alert 'Transformation is in progress... Please wait a moment.' shows a grey eight-spoke activity spinner for ~3 s, then a thin determinate progress bar (empty, then a small blue stub, then nearly full) above a hairline and a blue 'Cancel'; after ~8 s the alert and the dimming go in one frame, the speckled grey stitch preview becomes the converted black-and-white artwork and the popover's 'Convert' reads 'Done'",
    capture: {
      url: 'https://www.youtube.com/watch?v=8f-ZpdhCiBQ',
      page: 'https://www.youtube.com/watch?v=8f-ZpdhCiBQ',
      date: '2026-05-10',
      retrieved: '2026-10-17',
      timestamps: "8f-ZpdhCiBQ ('Master Brother Artspira Image to Embroidery Feature With Paid Subscription Tutorial 2026', Sew Practical Sew Fun, 2026-05-10), one continuous screen-recording take, stills ep_371.2 .. ep_383: t = 371.2 s the popover open (Artspira AI on, 'Black and White' selected, blue 'Convert'); t = 372.0 s Convert tapped, the screen dims and the alert shows with the spinner (ep_372.5, ep_374.5); t = 375 s the spinner gives way to the bar, empty at 376.5 s (ep_376.5), a small blue stub (~3%) at 378.5 s (ep_378.5), nearly full at 379.6 s (ep_379.6); t = 380.0-380.8 s alert and dimming vanish, the artwork is on the preview and 'Convert' reads 'Done' (ep_380.8); corroborated by U1wIig3CUMc (Brother Sews USA live-stream, 2024-08-01) t = 1078-1103 s: the same alert, spinner for ~2 s, then the bar creeping to ~15% over ~20 s before filling",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=8f-ZpdhCiBQ', published: '2026-05-10', retrieved: '2026-10-17', note: 'Master Brother Artspira Image to Embroidery Feature With Paid Subscription Tutorial 2026 (Sew Practical Sew Fun): the uncut iPad screen recording of the wait, t = 372-380 s' },
      { url: 'https://www.youtube.com/watch?v=U1wIig3CUMc', published: '2024-08-01', retrieved: '2026-10-17', note: 'New Artspira Features: Disney + Artspira AI (Brother Sews USA): the launch stream, the same alert over a longer (~27 s) wait, t = 1078-1103 s' },
    ],
    extrapolated: [
      "the landing: the footage converts ONE image and the artwork fills the single preview frame at t = 380 s; here the alert and the dimming go in the same frame as in the footage, the popover's 'Convert' reads 'Done', and ten converted pictures fill a 5 x 2 sheet inside the preview frame in strict reading order, the first with the frame",
      "the picture: the footage converts a speckled stitch map of a woodcut-style artwork (a boy among fish skeletons); here the picture being converted is one of OUR memes under a static black-and-white stitch grade (a grey halftone dot screen over it), and the converted pictures carry a black-and-white grade",
      "the pace: the footage waits ~8 s; the beat plays it over the same ~1.8 s window every module of this family uses, the spinner for the first 3/8 of it and the bar from there on, following the footage's samples (empty, ~3%, nearly full, full)",
      "the spinner: one spoke step every ~0.016 s of the beat, a pure function of the time (the footage turns once a second), not a CSS animation",
      "the scale: the iPad screen is redrawn at 560 px wide with the preview sheet above the popover instead of behind it, so that every converted picture stays in view; the popover, thumbnails and alert are plain boxes, the four style swatches drawn shapes",
      "omitted from the footage: the Brother and Artspira logos and the app's title bar, the banner and the subscription / paid-feature prompts, the 2024 build's first 'Artspira AI feature has some processing time.' / 'Do not show again' / 'OK' alert, the 'Silhouette', 'Pop', 'Simple', 'Crayon', 'Watercolor' and 'Manga' style names and the slider's value",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'brother-artspira-ai');
    const BW = 'grayscale(1) contrast(1.8)';
    const mix = (g, f) => [g.grade, f].filter(Boolean).join(' ');   // the grid's own grade, then this module's black-and-white grade
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${mix(g, BW)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const g0 = tiles[0];
    const thumb = (left, on, body) => `<div class="${P}-th${on ? ` ${P}-on` : ''}" style="left: ${left}px">${SVG('', body, '0 0 53 53')}</div>`;
    const spokes = Array.from({ length: 8 }, (_, i) => `<line x1="12" y1="3.4" x2="12" y2="8.2" stroke="#8e8e93" stroke-width="2.3" opacity="${(1 - i * 0.115).toFixed(3)}" transform="rotate(${-i * 45} 12 12)"/>`).join('');
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-sh"><div class="${P}-fr"></div><div class="${P}-fr2"></div>`
      + `<div class="${P}-sw"><div class="${P}-z" style="transform-origin: ${g0.origin}; transform: ${restTransform(g0)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Picture being converted" style="filter: grayscale(1) contrast(1.9) brightness(1.08)"/></div><div class="${P}-ht"></div></div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `<div class="${P}-po">`
      + `<p class="${P}-cn">Cancel</p><p class="${P}-cb">Convert</p><p class="${P}-qm">?</p><div class="${P}-hl" style="top: 33px"></div>`
      + `<p class="${P}-ai">Artspira AI</p><div class="${P}-sw2"><i></i></div><div class="${P}-hl" style="top: 73px"></div>`
      + thumb(11, true, SWATCH[0]) + thumb(71.5, false, SWATCH[1]) + thumb(132, false, SWATCH[2]) + thumb(192.5, false, SWATCH[3])
      + `<p class="${P}-tn">Black and White</p><p class="${P}-td">Convert your image to a style from the list</p><p class="${P}-lk">Recommended and non-recommended images</p>`
      + `<div class="${P}-hl" style="top: 202px"></div><div class="${P}-hl" style="top: 222px"></div>`
      + `<div class="${P}-pv"><i style="left: 4px; top: 4px; width: 5px; height: 3px"></i><i style="left: 11px; top: 6px; width: 4px; height: 3px"></i><i style="left: 6px; top: 12px; width: 7px; height: 2px"></i></div>`
      + `<div class="${P}-tr"></div><div class="${P}-kn"></div>`
      + `</div>`
      + `<svg class="${P}-ar" viewBox="0 0 16 8"><path d="M0 0h16L8 8z"/></svg>`
      + `<div class="${P}-tb">`
      + `<p class="${P}-ti" style="left: 40px">${SVG('', ICON.change)}Change</p><p class="${P}-ti" style="left: 240px">${SVG('', ICON.conv)}Conversion</p><p class="${P}-ti" style="left: 440px">${SVG('', ICON.size)}Size</p>`
      + `</div>`
      + `<div class="${P}-sc"></div>`
      + `<div class="${P}-al"><p class="${P}-at">Transformation is in progress...<br>Please wait a moment.</p>`
      + `<svg class="${P}-sp" viewBox="0 0 24 24"><g class="${P}-sg">${spokes}</g></svg>`
      + `<div class="${P}-bt"><div class="${P}-bf"></div></div>`
      + `<div class="${P}-ah"></div><p class="${P}-ac">Cancel</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sw = q('sw'), gd = q('gd'), cb = q('cb'), sc = q('sc'), al = q('al'), sp = q('sp'), sg = q('sg'), bt = q('bt'), bf = q('bf');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate([...cells.map((c) => c.im), sw.querySelector('img')]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const gone = s >= LAND[0];                     // scrim and alert go at the first landing
        const u = Math.min(s / WAIT, 1);               // the footage's 8 s wait as a fraction
        const showAl = !gone && s >= T_ALERT;
        const spin = showAl && u < SPIN_END;
        const barOn = showAl && u >= SPIN_END;
        const scrim = gone ? 0 : Math.round(SCRIM_A * Math.min(s / T_SCRIM, 1) * 200) / 200;
        const step = spin ? Math.floor(s / STEP) % 8 : 0;
        const fill = barOn ? Math.round(bar(u) * BAR_W * 10) / 10 : 0;

        put('sc', scrim, (v) => { sc.style.backgroundColor = `rgba(0, 0, 10, ${v})`; sc.style.visibility = v > 0 ? '' : 'hidden'; });
        put('al', showAl, (v) => { al.style.visibility = v ? '' : 'hidden'; });
        put('sp', spin, (v) => { sp.style.visibility = v ? '' : 'hidden'; });
        put('bt', barOn, (v) => { bt.style.visibility = v ? '' : 'hidden'; });
        put('step', step, (v) => { sg.setAttribute('transform', `rotate(${v * 45} 12 12)`); });
        put('fill', fill, (v) => { bf.style.width = `${v}px`; });
        put('src', gone, (v) => { sw.style.visibility = v ? 'hidden' : ''; });
        put('gd', gone, (v) => { gd.style.visibility = v ? '' : 'hidden'; });
        put('ld', gone, (v) => { root.classList.toggle(`${P}-ld`, v); cb.textContent = v ? 'Done' : 'Convert'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a white empty tile until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
