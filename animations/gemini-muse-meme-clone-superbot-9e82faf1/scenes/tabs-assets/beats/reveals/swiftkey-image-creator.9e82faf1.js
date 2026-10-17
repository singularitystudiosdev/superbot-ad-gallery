// Microsoft SwiftKey Image Creator (2023): the keyboard's 'Create' panel, from Marcel Gagne's Android screen recording
// https://www.youtube.com/watch?v=NRm5Uc7rsls (2023-09-14, 864x1920; frames reveal-refs/swiftkey-image-creator/frames/nr-t65.5.png, nr-t76.0.png, nr-t88.0.png; corroboration
// KNp9eoLRLrY 2023-10-13 iOS and ecG9g7TcDUs 2023-09-21 official; spec .tmp/clone-9e82faf1/reveal-refs/swiftkey-image-creator/spec.json, confidence 0.50). The whole screen is an
// Android phone: a status bar, a chat app (a header and a few message bubbles) with its composer row, and below it the keyboard in a deep red theme: a toolbar row (back chevron,
// emoji, GIF, sticker, the 'Create' tab underlined), the prompt field with a sparkle glyph and a round send arrow, then the key grid. Sending the prompt replaces the key grid by the
// Create panel: a thin ring spinner with an open arc turning, the live percentage under it climbing 1% to 99%, 'Your image is being created' under that, and a tumbling hourglass at
// the right; the send arrow greys and the bottom row becomes 'abc', a clock, the image glyph and backspace. The pictures then fill the panel.
// Redrawn in plain boxes and line glyphs; the chat app is a neutral one of our own; every picture is OUR meme; no SwiftKey, Bing or DALL-E marks and no 'Powered by' label.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-skc';
const ROOT_W = 560, ROOT_H = 520, PH_W = 396, PH_L = (ROOT_W - PH_W) / 2;
const KB_T = 214, BODY_T = 290, BODY_H = 180, BOT_T = 470;      // the keyboard's top, the panel body, the bottom row
const T = 72, GAP = 5, COLS = 5;                                 // the picture grid: 5 x 2 square tiles across the panel (380 px of 396)
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0d0e10; color: #fff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .12); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ph { position: absolute; left: ${PH_L}px; top: 0; width: ${PH_W}px; height: ${ROOT_H}px; border-radius: 14px; overflow: hidden; background: #2b2d31; }
.${P}-sb { position: absolute; left: 0; top: 0; width: ${PH_W}px; height: 22px; background: #202225; }
.${P}-sb p { position: absolute; left: 14px; top: 0; font-size: 11px; line-height: 22px; font-weight: 600; }
.${P}-sb svg { position: absolute; top: 6px; width: 11px; height: 11px; }
.${P}-hr { position: absolute; left: 0; top: 22px; width: ${PH_W}px; height: 38px; background: #242629; border-bottom: 1px solid #1a1b1e; box-sizing: border-box; }
.${P}-hr p { position: absolute; left: 40px; top: 0; font-size: 13px; line-height: 37px; font-weight: 700; }
.${P}-hr svg { position: absolute; top: 11px; width: 15px; height: 15px; color: #c4c6cc; }
.${P}-bb { position: absolute; box-sizing: border-box; height: 32px; padding: 0 12px; border-radius: 16px; font-size: 12.5px; line-height: 32px; }
.${P}-cm { position: absolute; left: 0; top: 172px; width: ${PH_W}px; height: 36px; background: #2b2d31; }
.${P}-cb { position: absolute; top: 3px; width: 30px; height: 30px; border-radius: 15px; background: #202225; color: #dcdee2; }
.${P}-cb svg { position: absolute; left: 7px; top: 7px; width: 16px; height: 16px; }
.${P}-cf { position: absolute; left: 42px; top: 3px; box-sizing: border-box; width: 270px; height: 30px; border-radius: 15px; background: #202225; font-size: 12.5px; line-height: 30px; color: #8d9097; padding-left: 12px; }
.${P}-kb { position: absolute; left: 0; top: ${KB_T}px; width: ${PH_W}px; height: ${ROOT_H - KB_T}px; background: linear-gradient(180deg, #7a0a05 0%, #5e0703 100%); }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${PH_W}px; height: 34px; }
.${P}-tb svg { position: absolute; top: 8px; width: 18px; height: 18px; color: #f1d8d6; }
.${P}-gf { position: absolute; left: 76px; top: 9px; box-sizing: border-box; width: 24px; height: 16px; border: 1.5px solid #f1d8d6; border-radius: 3px; font-size: 7.5px; line-height: 13px; font-weight: 700; text-align: center; color: #f1d8d6; }
.${P}-ct { position: absolute; left: 132px; top: 0; width: 86px; height: 34px; border-bottom: 2px solid #fff; box-sizing: border-box; }
.${P}-ct p { position: absolute; left: 30px; top: 0; font-size: 13px; line-height: 32px; color: #fff; }
.${P}-ct svg { left: 4px; color: #fff; }
.${P}-pf { position: absolute; left: 8px; top: 38px; box-sizing: border-box; width: 336px; height: 30px; border-radius: 8px; background: rgba(255, 255, 255, .13); }
.${P}-pf p { position: absolute; left: 30px; top: 0; font-size: 13px; line-height: 30px; color: #f4e8e7; }
.${P}-pf svg { position: absolute; left: 8px; top: 7px; width: 16px; height: 16px; color: #f1d8d6; }
.${P}-xx { position: absolute; right: 9px; top: 9px; width: 11px; height: 11px; color: #d9bcb9; }
.${P}-sd { position: absolute; left: 352px; top: 37px; width: 32px; height: 32px; border-radius: 16px; background: #eed7d4; color: #7a0a05; }
.${P}-sd svg { position: absolute; left: 8px; top: 8px; width: 16px; height: 16px; }
.${P}-kk { position: absolute; left: 0; top: ${BODY_T - KB_T}px; width: ${PH_W}px; height: ${BODY_H}px; }
.${P}-sg { position: absolute; top: 0; box-sizing: border-box; height: 22px; border-radius: 6px; background: rgba(255, 255, 255, .08); text-align: center; font-size: 11.5px; line-height: 22px; color: #e8cfcc; }
.${P}-k { position: absolute; box-sizing: border-box; height: 40px; border-radius: 6px; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .12); text-align: center; font-size: 15px; line-height: 38px; color: #fff; }
.${P}-k svg { margin: 11px auto 0; width: 16px; height: 16px; }
.${P}-pn { position: absolute; left: 0; top: ${BODY_T - KB_T}px; width: ${PH_W}px; height: ${BODY_H}px; }
.${P}-rg { position: absolute; left: 181px; top: 34px; width: 34px; height: 34px; }
.${P}-rg circle { fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; }
.${P}-pc { position: absolute; left: 0; top: 78px; width: ${PH_W}px; text-align: center; font-size: 14px; line-height: 20px; }
.${P}-cp { position: absolute; left: 0; top: 99px; width: ${PH_W}px; text-align: center; font-size: 15px; line-height: 20px; }
.${P}-hg { position: absolute; left: 292px; top: 22px; width: 46px; height: 46px; }
.${P}-hg svg { width: 46px; height: 46px; stroke: none; }
.${P}-gd { position: absolute; left: 8px; top: ${BODY_T - KB_T + 15}px; display: grid; grid-template-columns: repeat(${COLS}, ${T}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${T}px; height: ${T}px; overflow: hidden; border-radius: 8px; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-bt { position: absolute; left: 0; top: ${BOT_T - KB_T}px; width: ${PH_W}px; height: 36px; }
.${P}-bt p { position: absolute; top: 0; font-size: 15px; line-height: 36px; color: #fff; }
.${P}-bt svg { position: absolute; top: 9px; width: 18px; height: 18px; color: #f1d8d6; }
.${P}-un { position: absolute; left: 207px; top: 31px; width: 24px; height: 2px; background: #fff; }
.${P}-gs { position: absolute; left: 108px; top: ${ROOT_H - KB_T - 8}px; width: 180px; height: 3px; border-radius: 2px; background: #f4e8e7; }
.${P}-gs2 { position: absolute; left: 14px; top: ${ROOT_H - KB_T - 13}px; width: 14px; height: 10px; color: #f1d8d6; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PEND = 0.22;                                 // the send arrow is tapped: the key grid gives way to the Create panel
const LAND0 = 1.40, STEP = 1 / 30;                 // the first picture lands at 1.40 layout s, the other nine one frame step apart (reading order), the last at 1.70
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * STEP);
const SPIN = 1.7;                                  // ring turns per layout second
const FLIP = 0.8;                                  // layout seconds per tumble of the hourglass
const PROMPT = 'A colorful shiny blue dinosaur';
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

const ICON = {
  back: '<path d="M14.5 5l-7 7 7 7"/>',
  emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0M9 9.5v.1M15 9.5v.1"/>',
  sticker: '<path d="M5 4h14v10l-6 6H5z"/><path d="M13 20v-5a1 1 0 0 1 1-1h5M9 9.5v.1M14 9.5v.1M9 12.3a3.5 3.5 0 0 0 5 0"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M4 17l5-5 4 4 3-3 4 4M9 9.5v.1"/>',
  sparkle: '<path d="M10 4l1.6 4.4L16 10l-4.4 1.6L10 16l-1.6-4.4L4 10l4.4-1.6zM17.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  send: '<path d="M4 12h16M13.5 5.5L20 12l-6.5 6.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  bksp: '<path d="M21 5H9l-6 7 6 7h12z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>',
  shift: '<path d="M12 4l8 9h-4.5v6h-7v-6H4z"/>',
  mic: '<rect x="9" y="3.5" width="6" height="10" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  hash: '<path d="M9 4L7 20M17 4l-2 16M4 9h16M3.5 15h16"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  people: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17.5 14a5 5 0 0 1 3 5"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  kbd: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.1M11 10h.1M15 10h.1M7 14h10"/>',
  batt: '<rect x="8" y="3" width="8" height="18" rx="2" fill="currentColor" stroke="none"/>',
  wifi: '<path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9.2 16a4 4 0 0 1 5.6 0"/>',
  sig: '<path d="M3 21h18V3z" fill="currentColor" stroke="none"/>',
};
const SVG = (name, cls = '', style = '') => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${ICON[name]}</svg>`;
// the tumbling hourglass: an amber frame (two caps and two glass bulbs) with pale sand, drawn flat
const HOURGLASS = '<svg viewBox="0 0 46 46"><rect x="8" y="3" width="30" height="5" rx="2" fill="#b3651d"/><rect x="8" y="38" width="30" height="5" rx="2" fill="#b3651d"/><path d="M12 8h22c0 9-6 12-9.5 15 3.5 3 9.5 6 9.5 15H12c0-9 6-12 9.5-15C18 20 12 17 12 8z" fill="#f1e7d8" fill-opacity=".92"/><path d="M15 8h16c0 5-3 7-8 11-5-4-8-6-8-11z" fill="#e0cbb0"/><path d="M14 38c1-5 5-7 9-10 4 3 8 5 9 10z" fill="#e0cbb0"/></svg>';

export default {
  id: 'swiftkey-image-creator',
  label: 'Microsoft SwiftKey Image Creator (2023)',
  source: {
    platform: "Android phone (Pixel-class, 864x1920 screen recording) in a chat app with the Microsoft SwiftKey keyboard in a deep red theme open at the bottom ~42%; SwiftKey's 'Create' tab replaces the key grid; a second take on iPhone (886x1920, light theme) and the official promo (1920x1080, dark theme) show the same panel; all 2023 footage, the feature has since been removed from SwiftKey",
    feature: "Text to image inside the keyboard: with the 'Create' tab open, a prompt is typed in the single-line field with a sparkle glyph and the round send arrow tapped; the key grid is swapped for the generation panel, a small ring spinner with an open arc turning, a live percentage under it climbing 1% to 99% and 'Your image is being created' under that, an animated hourglass tumbling at the right, the send arrow greyed; about 16.5 s later two image tiles land side by side and can be tapped to send into the chat",
    capture: {
      url: 'https://www.youtube.com/watch?v=NRm5Uc7rsls',
      page: 'https://www.youtube.com/watch?v=NRm5Uc7rsls',
      date: '2023-09-14',
      retrieved: '2026-10-17',
      timestamps: "t = 63.5-66.4 s the prompt 'A colorful shiny blue dinosaur' typed on the key grid, the send arrow tapped at ~66.4 (nr-t65.5); t = 66.5-83.0 s PENDING, uncut, ~16.5 s: the ring spinner with '1%' at t=66.8, '36%' at t=76 (nr-t76.0), '64%' at ~80 and '91%' at ~82.5 under it, 'Your image is being created' under that, the hourglass tumbling at the right, the send arrow greyed; t = 83.0-83.5 s the panel is blank; t = 84.0-84.5 s two tiles land (nr-t84.5), settled at t=88 (nr-t88.0). Corroboration: https://www.youtube.com/watch?v=KNp9eoLRLrY (2023-10-13, iPhone, pending t=75.5-99.5, '0%' at 76 s, '50%' at 90 s, '95%' at 99 s, the two tiles land at 100-101 s) and https://www.youtube.com/watch?v=ecG9g7TcDUs (2023-09-21, the official promo, pending t=7.0-10.0, the dark panel with '1%')",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=NRm5Uc7rsls', published: '2023-09-14', retrieved: '2026-10-17', note: "Create Your Own Ai Images Using Swiftkey! (Marcel Gagne), the primary take" },
      { url: 'https://www.youtube.com/watch?v=KNp9eoLRLrY', published: '2023-10-13', retrieved: '2026-10-17', note: 'iPhone corroboration (Asif Rehmani)' },
      { url: 'https://www.youtube.com/watch?v=ecG9g7TcDUs', published: '2023-09-21', retrieved: '2026-10-17', note: 'the official promo, corroboration' },
    ],
    extrapolated: [
      'the landing count: the footage lands TWO tiles side by side filling the panel; here ten square tiles sit in a 5 x 2 grid across the panel (the phone redrawn 396 px wide and 520 px tall so ten fit with no scroll), the panel body keeping the same keyboard colour',
      "the landing order: the footage lands both tiles in one frame after ~0.5 s of an empty panel; here the empty beat is dropped and the ten pictures land one frame step (1/30 of a layout second) apart in strict reading order, the ring, percentage, caption and hourglass going with the first",
      "the pace: the footage waits ~16.5 s; the beat plays it in the same ~1.8 s window every module of this family uses, the percentage climbing from 1% to 99% across it as a pure function of t (the footage is roughly linear, 1% at 66.8 s, 36% at 76 s, 91% at 82.5 s)",
      "the ring and the hourglass: the ring's open arc turns at a constant rate and the hourglass tumbles a half turn per cycle, both pure functions of t; the footage's rates were read off a few stills (the arc rotates continuously, the hourglass flips about every 1.4 s), not measured natively",
      "the key grid before the send: the footage shows the full red QWERTY keyboard with a suggestion strip; here it is redrawn flat (letters, shift, backspace, a bottom row of '123', an emoji key, a mic-comma key, the space bar, a period key and a search key) for the first 0.22 layout seconds only, the numerals above the top-row letters omitted",
      "the host app: the footage is Discord (a header, a sent image, a composer row); here a neutral chat of our own (a header with the title 'Chat', two text bubbles and a 'Message' composer) stands in, with no avatars, names, previously sent picture or status-bar icons beyond plain glyphs",
      "omitted from the footage: the 'Powered by DALL-E' label, every SwiftKey, Bing and DALL-E mark, the gesture-bar chrome beyond a plain pill, the sticker and GIF icons beyond plain glyphs, the second-take 'Creations' tab",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'swiftkey-image-creator');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    // the key grid: three rows of letters (the second inset, the third between shift and backspace) and the bottom row of the typing keyboard
    const KW = (PH_W - 8) / 10;
    const keys = ROWS.map((r, ri) => [...r].map((ch, ci) => {
      const left = ri === 0 ? 4 + ci * KW : ri === 1 ? 4 + KW / 2 + ci * KW : 4 + KW * 1.5 + ci * KW;
      return `<p class="${P}-k" style="left: ${left.toFixed(1)}px; top: ${26 + ri * 44}px; width: ${(KW - 3).toFixed(1)}px">${ch}</p>`;
    }).join('')).join('')
      + `<div class="${P}-k" style="left: 4px; top: ${26 + 88}px; width: ${(KW * 1.4 - 3).toFixed(1)}px">${SVG('shift')}</div>`
      + `<div class="${P}-k" style="left: ${(PH_W - 4 - KW * 1.4).toFixed(1)}px; top: ${26 + 88}px; width: ${(KW * 1.4 - 3).toFixed(1)}px">${SVG('bksp')}</div>`;
    const sugg = [['a', 4, 120], ['I', 130, 136], ['person', 272, 120]].map(([w, l, wd]) => `<p class="${P}-sg" style="left: ${l}px; width: ${wd}px">${w}</p>`).join('');
    const typeBot = `<p class="${P}-k" style="left: 4px; top: ${BOT_T - KB_T + 0}px; width: 56px; height: 36px; line-height: 34px; font-size: 14px">123</p>`
      + `<div class="${P}-k" style="left: 64px; top: ${BOT_T - KB_T}px; width: 38px; height: 36px">${SVG('emoji', '', 'margin-top: 9px')}</div>`
      + `<div class="${P}-k" style="left: 106px; top: ${BOT_T - KB_T}px; width: 38px; height: 36px">${SVG('mic', '', 'margin-top: 9px')}</div>`
      + `<div class="${P}-k" style="left: 148px; top: ${BOT_T - KB_T}px; width: 148px; height: 36px"></div>`
      + `<p class="${P}-k" style="left: 300px; top: ${BOT_T - KB_T}px; width: 40px; height: 36px; line-height: 34px">.</p>`
      + `<div class="${P}-k" style="left: 344px; top: ${BOT_T - KB_T}px; width: 48px; height: 36px">${SVG('search', '', 'margin-top: 9px')}</div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-ph">`
      + `<div class="${P}-sb"><p>11:14</p>${SVG('sig', '', `right: 36px`)}${SVG('wifi', '', `right: 52px`)}${SVG('batt', '', `right: 14px`)}</div>`
      + `<div class="${P}-hr">${SVG('menu', '', 'left: 12px')}<p>Chat</p>${SVG('search', '', 'right: 44px')}${SVG('people', '', 'right: 14px')}</div>`
      + `<p class="${P}-bb" style="left: 14px; top: 72px; background: #3b3e45; width: 188px">Can you send a picture?</p>`
      + `<p class="${P}-bb" style="left: 186px; top: 114px; background: #4a5fd0; width: 196px; text-align: right">One sec, making it now</p>`
      + `<div class="${P}-cm"><div class="${P}-cb" style="left: 6px">${SVG('plus')}</div><div class="${P}-cb" style="left: 348px">${SVG('mic')}</div><p class="${P}-cf">Message</p></div>`
      + `<div class="${P}-kb">`
      + `<div class="${P}-tb">${SVG('back', '', 'left: 10px')}${SVG('emoji', '', 'left: 42px')}<p class="${P}-gf">GIF</p>${SVG('sticker', '', 'left: 108px')}<div class="${P}-ct">${SVG('image')}<p>Create</p></div></div>`
      + `<div class="${P}-pf">${SVG('sparkle')}<p>${PROMPT}</p>${SVG('x', `${P}-xx`)}</div><div class="${P}-sd">${SVG('send')}</div>`
      + `<div class="${P}-kk">${sugg}${keys}</div>`
      + `<div class="${P}-pn" style="visibility: hidden"><svg class="${P}-rg" viewBox="0 0 34 34"><circle cx="17" cy="17" r="13" stroke-dasharray="24 58"/></svg><p class="${P}-pc">1%</p><p class="${P}-cp">Your image is being created</p><div class="${P}-hg">${HOURGLASS}</div></div>`
      + `<div class="${P}-gd" style="visibility: hidden">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-bt" style="visibility: hidden"><p style="left: 10px">abc</p>${SVG('clock', '', 'left: 76px')}${SVG('image', '', 'left: 120px')}<i class="${P}-un" style="left: 118px; top: 31px; width: 22px"></i>${SVG('bksp', '', 'left: 360px')}</div>`
      + `<div class="${P}-ty">${typeBot}</div>`
      + `${SVG('down', `${P}-gs2`)}<div class="${P}-gs"></div>${SVG('kbd', `${P}-gs2`, `left: 366px; width: 16px; height: 12px`)}`
      + `</div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const kk = q('kk'), ty = q('ty'), pn = q('pn'), gd = q('gd'), xx = q('xx'), sd = q('sd'), pf = q('pf');
    const bt = root.querySelector(`.${P}-bt`);
    const rg = q('rg'), pc = q('pc'), hg = q('hg');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const frac = (v) => ((v % 1) + 1) % 1;

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered

        // 0: typed, the key grid; 1: sent, the Create panel with the ring; 2: the pictures
        const mode = s < PEND ? 0 : s < LAND0 ? 1 : 2;
        put('mode', mode, (m) => {
          kk.style.visibility = m === 0 ? '' : 'hidden';
          ty.style.visibility = m === 0 ? '' : 'hidden';
          xx.style.visibility = m === 0 ? '' : 'hidden';
          bt.style.visibility = m === 0 ? 'hidden' : '';
          pn.style.visibility = m === 1 ? '' : 'hidden';
          gd.style.visibility = m === 2 ? '' : 'hidden';
          sd.style.background = m === 0 ? '#eed7d4' : '#8a4a46';
          sd.style.color = m === 0 ? '#7a0a05' : '#d9c0bd';
          pf.style.opacity = m === 0 ? '1' : '0.62';
        });

        // the live percentage, 1% to 99% across the wait; the ring's open arc turns and the hourglass tumbles, each a function of t alone
        const u = Math.min(Math.max((s - PEND) / (LAND0 - PEND - 0.06), 0), 1);
        const pct = Math.min(99, 1 + Math.floor(98.999 * Math.min(Math.max((u - 0.06) / 0.94, 0), 1)));   // 1% for the first moment, then linear to 99%
        put('pct', pct, (v) => { pc.textContent = `${v}%`; });
        const rot = mode === 1 ? Math.round(frac(s * SPIN) * 360) : 0;   // turning only while the panel shows, at rest otherwise
        put('rot', rot, (v) => { rg.style.transform = `rotate(${v}deg)`; });
        const flip = mode === 1 ? Math.round(frac(s / FLIP) * 72) * 5 : 0;
        put('flip', flip, (v) => { hg.style.transform = `rotate(${v}deg)`; });

        // the pictures land in reading order, a plain swap of the empty cover for the picture
        cells.forEach((c, i) => put(`i${i}`, mode === 2 && s >= LAND[i], (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; }));
      },
    };
  },
};
