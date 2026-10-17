// Microsoft Teams Decorate background (2024): the wait of 'Decorate your background' in the Teams desktop client (Windows, light theme) during a meeting, from the
// UT Dallas IT uncut screen recording https://www.youtube.com/watch?v=6Dd9BDJKc2A (2024-01-11, 1920x1080; frames reveal-refs/teams-ai-background/frames/
// utd_gen_{47.5,48.5,49.5,52,54.5,56.5,57.5,59}.jpg and utd_more_{109,117}.png, spec .tmp/clone-9e82faf1/reveal-refs/teams-ai-background/spec.json, confidence 0.62).
// The whole screen is a meeting window on a pale grey ground: a toolbar (Chat, People, Raise, React, View, Rooms, Apps, More | Camera, Mic, Share and a red
// 'Leave'), a stage holding a round avatar over 'Waiting for others to join...', and a docked right rail 'Background settings' > '< Decorate your background' with
// a self-view preview, 'Choose a theme' and its chips (Clean up, Fancy [chosen, violet], Greenhouse, Celebration, Surprise me). The wait is ONE cue: the
// 'Generate backgrounds' button is gone and a 1-2 px indeterminate line (a short violet segment sweeping along a pale track) sits under the chips, ~8 s. The landing
// is a hard swap in one frame: 'Select to preview' + 'Clear', the tiles (the first selected, violet outline and tick), 'Generate more' and the violet 'Apply and
// turn on video'. Everything is redrawn in plain boxes and line glyphs; the avatar carries OUR initials and every picture is OUR meme; no photo of the presenter,
// no watermark, no Microsoft logo, no window title or taskbar; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-tab';
const ROOT_W = 560, ROOT_H = 520;
const TOP_H = 36, RL_L = 348, RL_W = 212;                    // toolbar strip, docked rail
const PAD = 11, IN_W = 190;                                  // rail padding, inner width
const G_T = 161, T_W = 89, T_H = 50, G_X = 12, G_Y = 4;       // the 2-col grid of 16:9 tiles in the rail
const VIOLET = '#5b5fc7';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f5f5f5; color: #242424; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${TOP_H}px; box-sizing: border-box; border-bottom: 1px solid #e1e1e1; background: #f5f5f5; }
.${P}-sd { position: absolute; left: 13px; top: 12px; width: 12px; height: 12px; stroke: #424242; stroke-width: 1.8; }
.${P}-ti { position: absolute; top: 3px; height: 30px; text-align: center; }
.${P}-ti svg { display: block; margin: 0 auto; width: 13px; height: 13px; stroke: #242424; stroke-width: 1.7; }
.${P}-ti p { margin-top: 3px; font-size: 6px; line-height: 8px; color: #424242; }
.${P}-dv { position: absolute; left: 338px; top: 6px; width: 1px; height: 24px; background: #d1d1d1; }
.${P}-lv { position: absolute; left: 466px; top: 7px; box-sizing: border-box; width: 78px; height: 22px; border-radius: 4px; background: #c4314b; color: #ffffff; font-size: 8px; line-height: 22px; font-weight: 600; padding-left: 28px; }
.${P}-lv svg { position: absolute; top: 5px; width: 12px; height: 12px; stroke: #ffffff; stroke-width: 2; }
.${P}-stg { position: absolute; left: 0; top: ${TOP_H}px; width: ${RL_L}px; height: ${ROOT_H - TOP_H}px; }
.${P}-av { position: absolute; left: ${(RL_L - 66) / 2}px; top: 170px; box-sizing: border-box; width: 66px; height: 66px; border-radius: 50%; background: #5b5fc7; color: #ffffff; text-align: center; font-size: 22px; line-height: 66px; font-weight: 600; letter-spacing: .5px; }
.${P}-wt { position: absolute; left: 0; top: 260px; width: ${RL_L}px; text-align: center; font-size: 12px; line-height: 16px; font-weight: 500; color: #242424; }
.${P}-rl { position: absolute; left: ${RL_L}px; top: ${TOP_H}px; box-sizing: border-box; width: ${RL_W}px; height: ${ROOT_H - TOP_H}px; border-left: 1px solid #e1e1e1; background: #f5f5f5; }
.${P}-hd { position: absolute; left: ${PAD}px; top: 7px; font-size: 9.6px; line-height: 14px; font-weight: 700; color: #242424; }
.${P}-hx { position: absolute; right: ${PAD}px; top: 9px; width: 10px; height: 10px; stroke: #242424; stroke-width: 1.8; }
.${P}-bk { position: absolute; left: ${PAD}px; top: 25px; font-size: 8.2px; line-height: 16px; color: #424242; padding-left: 18px; }
.${P}-bk svg { position: absolute; left: 2px; top: 3px; width: 10px; height: 10px; stroke: #424242; stroke-width: 2; }
.${P}-pv { position: absolute; left: ${PAD}px; top: 44px; box-sizing: border-box; width: ${IN_W}px; height: 44px; overflow: hidden; background: linear-gradient(180deg, #c9ced8, #aab2c2); }
.${P}-pv i { position: absolute; display: block; background: #6f788a; }
.${P}-ct { position: absolute; left: ${PAD}px; top: 91px; font-size: 6.8px; line-height: 10px; font-weight: 700; color: #242424; }
.${P}-ch { position: absolute; box-sizing: border-box; height: 16px; border-radius: 8px; border: 1px solid #d1d1d1; background: #f5f5f5; font-size: 7px; line-height: 14px; text-align: center; color: #242424; }
.${P}-ch.${P}-on { border-color: ${VIOLET}; background: ${VIOLET}; color: #ffffff; }
.${P}-ln { position: absolute; left: ${PAD}px; top: 142px; width: ${IN_W}px; height: 2px; overflow: hidden; background: #e8e8e8; }
.${P}-sg { position: absolute; left: 0; top: 0; width: 48px; height: 2px; background: linear-gradient(90deg, rgba(91, 95, 199, 0), ${VIOLET} 35%, ${VIOLET} 65%, rgba(91, 95, 199, 0)); }
.${P}-sp { position: absolute; left: ${PAD}px; top: 144px; font-size: 7px; line-height: 14px; font-weight: 700; color: #242424; }
.${P}-cl { position: absolute; left: ${RL_W - PAD - 38}px; top: 141px; box-sizing: border-box; width: 38px; height: 16px; border-radius: 3px; border: 1px solid #e1e1e1; background: #ffffff; font-size: 6.6px; line-height: 14px; color: #242424; padding-left: 15px; }
.${P}-cl svg { position: absolute; left: 3px; top: 2px; width: 9px; height: 9px; stroke: #424242; stroke-width: 2; }
.${P}-gd { position: absolute; left: ${PAD}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(2, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; width: ${T_W}px; height: ${T_H}px; overflow: hidden; border-radius: 3px; background: #f5f5f5; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f5f5f5; }
.${P}-sl { position: absolute; left: ${PAD}px; top: ${G_T}px; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; border-radius: 3px; border: 1.5px solid ${VIOLET}; }
.${P}-sl svg { position: absolute; right: 2px; top: 2px; width: 8px; height: 8px; stroke: #ffffff; stroke-width: 2.6; }
.${P}-gm { position: absolute; left: ${PAD}px; top: 433px; box-sizing: border-box; width: ${IN_W}px; height: 18px; border: 1px solid #e1e1e1; border-radius: 3px; background: #ffffff; text-align: center; font-size: 7.4px; line-height: 16px; font-weight: 600; color: #242424; }
.${P}-ap { position: absolute; left: ${PAD}px; top: 455px; box-sizing: border-box; width: ${IN_W}px; height: 20px; border-radius: 3px; background: ${VIOLET}; text-align: center; font-size: 7.6px; line-height: 20px; font-weight: 700; color: #ffffff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // the swap at the first, then tile i fills (strict reading order), the last at 1.70
const SWEEP = 0.55;                                // layout seconds per pass of the violet segment (the footage's period is not measured)
const SEG = 48;                                    // the segment's width in px

const ICON = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3 7.8-7.5 9.5-4.5-1.7-7.5-4.9-7.5-9.5V6z"/>',
  chat: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4.5 3.5V17H6a2 2 0 0 1-2-2z"/><path d="M8 9.5h8M8 13h5"/>',
  people: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.8-4 3.3-6 7-6s6.2 2 7 6"/>',
  raise: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10V6.5a1.5 1.5 0 0 1 3 0V14c0 3.5-2.5 6-5.5 6C9 20 7.5 18.5 6 16l-1.6-3c-.5-.9.6-1.8 1.4-1.2L8 13.5"/>',
  react: '<circle cx="12" cy="12" r="9"/><path d="M8.7 14c1.9 2 4.7 2 6.6 0M9 9.5v.01M15 9.5v.01"/>',
  view: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>',
  rooms: '<rect x="4.5" y="5" width="15" height="14" rx="3.5"/><path d="M8 5v-.5"/>',
  apps: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>',
  more: '<path d="M5 12v.01M12 12v.01M19 12v.01" stroke-width="3"/>',
  cam: '<rect x="3" y="6.5" width="12" height="11" rx="2"/><path d="M15 11l6-3.5v9L15 13"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  share: '<rect x="4" y="4.5" width="16" height="15" rx="2" fill="#242424"/><path d="M12 16V9M9 12l3-3 3 3" stroke="#f5f5f5"/>',
  leave: '<path d="M3 14.5c4-4.5 14-4.5 18 0l-2.4 2.4-3-1.2v-2.4c-2.2-.6-3.8-.6-6 0v2.4l-3 1.2z"/>',
  erase: '<path d="M4 15l9-9 6 6-6 6H8zM9 20h11"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

export default {
  id: 'teams-ai-background',
  label: 'Microsoft Teams Decorate background (2024)',
  source: {
    platform: "Microsoft Teams desktop client (Windows, light theme, Jan 2024) in a meeting: the stage 'Waiting for others to join...' and the right rail 'Background settings' > 'Decorate your background'; third-party university tutorial, uncut screen recording at 1920x1080",
    feature: "Generate room backgrounds from a theme chip (Clean up / Fancy / Greenhouse / Celebration / Surprise me): on 'Generate backgrounds' the button vanishes and a 1-2 px indeterminate line (a short violet segment sweeping along a pale track) sits under the chips for ~8 s with no text and no placeholder tiles; the result is a hard swap in one frame to 'Select to preview' + 'Clear', the tiles (the first selected), 'Generate more' and 'Apply and turn on video'",
    capture: {
      url: 'https://www.youtube.com/watch?v=6Dd9BDJKc2A',
      page: 'https://www.youtube.com/watch?v=6Dd9BDJKc2A',
      date: '2024-01-11',
      retrieved: '2026-10-17',
      timestamps: "first run (theme 'Fancy'): t = 47.5 s the chips ringed, 'Generate backgrounds' violet (utd_gen_47.5); t = 48.5 s the cursor on it, the button darkens (utd_gen_48.5); t = 48.7-56.7 s PENDING ~8 s, the button gone, the thin violet-on-pale line under the chips, nothing else moves in the rail (utd_gen_49.5, utd_gen_52, utd_gen_54.5, utd_gen_56.5); t = 56.8-57.5 s LANDED, hard swap to 'Select to preview' + 'Clear', two tiles, 'Generate more', 'Apply and turn on video' (utd_gen_57.5); t = 59 s more tiles scroll in (utd_gen_59). 'Generate more' re-runs at t ~ 75-86 s (Greenhouse) and t ~ 106-116 s (Surprise me; utd_more_109, utd_more_117): the old tiles stay, the two buttons go grey and the line sits above the grid",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=6Dd9BDJKc2A', published: '2024-01-11', retrieved: '2026-10-17', note: 'Decorate Feature in Microsoft Teams Changes Backgrounds Using AI (UTD Information Technology, UT Dallas)' },
      { url: 'https://www.youtube.com/watch?v=PhbowtYOkyw', published: '2024-01-30', retrieved: '2026-10-17', note: "Make meetings more fun and personal with Decorate your background (Microsoft Teams); corroborates the strings and the panel only, the wait is cut" },
    ],
    extrapolated: [
      "the landing: the footage lands TWO tiles in one frame (more scroll in over the next ~2 s, a 2 x 2 grid by t ~ 62 s); here ten 16:9 tiles sit in a 2-column grid of five rows in the rail, the first appearing with the swap and the rest filling in strict reading order across the beat, the unfilled slots left as bare rail ground",
      "the pace: the footage waits ~8 s; the beat plays it in the same ~1.8 s window every module of this family uses",
      "the line: the footage's segment slides left to right along a pale track, sampled at only 2-8 fps (the period is not measured); here the segment is 48 px wide with soft ends and makes one pass per 0.55 s of the layout clock, its position a pure function of t",
      "the pending rail: the footage shows no button during the wait (the pressed button vanishes), so none is drawn here either; the 'Generate backgrounds' button of the ready state is not part of the beat",
      "the page's scale: the footage is a 1920 x 1080 desktop with a ~380 px rail; here the window is redrawn at 560 px wide with a 212 px rail and 89 x 50 px tiles so ten fit (chrome redrawn, not scaled copies); the toolbar's window title bar, the tenant name and the taskbar are not drawn",
      "the avatar, the self-view and the presenter: the footage's round avatar and live preview show the presenter; here a violet initials circle ('MS') and a drawn neutral silhouette on a grey ground stand in",
      "the selected tile: the first tile carries the violet outline and tick as in the footage; the tile's hover tooltip and the 'Generate more' re-run state (buttons grey, line over the grid) are not drawn",
      "omitted from the footage: the UTD 'Information Technology' watermark, the 'Decorate recording' window title, the call timer, the Microsoft logo, the presenter's photos",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'teams-ai-background');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const tool = (cx, w, icon, label) => `<div class="${P}-ti" style="left: ${cx - w / 2}px; width: ${w}px">${SVG('', icon)}<p>${label}</p></div>`;
    const chip = (left, top, w, label, on) => `<p class="${P}-ch${on ? ` ${P}-on` : ''}" style="left: ${left}px; top: ${top}px; width: ${w}px">${label}</p>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tb">${SVG(`${P}-sd`, ICON.shield)}`
      + tool(66, 36, ICON.chat, 'Chat') + tool(102, 36, ICON.people, 'People') + tool(138, 36, ICON.raise, 'Raise') + tool(174, 36, ICON.react, 'React')
      + tool(210, 36, ICON.view, 'View') + tool(246, 36, ICON.rooms, 'Rooms') + tool(282, 36, ICON.apps, 'Apps') + tool(318, 36, ICON.more, 'More')
      + `<div class="${P}-dv"></div>`
      + tool(360, 36, ICON.cam, 'Camera') + tool(396, 36, ICON.mic, 'Mic') + tool(432, 36, ICON.share, 'Share')
      + `<p class="${P}-lv">${SVG('', ICON.leave, 'left: 9px')}Leave</p>`
      + `</div>`
      + `<div class="${P}-stg"><div class="${P}-av">MS</div><p class="${P}-wt">Waiting for others to join...</p></div>`
      + `<div class="${P}-rl">`
      + `<p class="${P}-hd">Background settings</p>${SVG(`${P}-hx`, ICON.x)}`
      + `<p class="${P}-bk">${SVG('', ICON.back)}Decorate your background</p>`
      + `<div class="${P}-pv"><i style="left: 81px; top: 6px; width: 28px; height: 28px; border-radius: 50%"></i><i style="left: 61px; top: 32px; width: 68px; height: 30px; border-radius: 34px 34px 0 0"></i></div>`
      + `<p class="${P}-ct">Choose a theme</p>`
      + chip(PAD, 103, 42, 'Clean up', false) + chip(PAD + 47, 103, 38, 'Fancy', true) + chip(PAD + 90, 103, 56, 'Greenhouse', false)
      + chip(PAD, 121, 54, 'Celebration', false) + chip(PAD + 59, 121, 52, 'Surprise me', false)
      + `<div class="${P}-ln"><div class="${P}-sg"></div></div>`
      + `<div class="${P}-lg">`
      + `<p class="${P}-sp">Select to preview</p><p class="${P}-cl">${SVG('', ICON.erase)}Clear</p>`
      + `<p class="${P}-gm">Generate more</p><p class="${P}-ap">Apply and turn on video</p>`
      + `</div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-sl">${SVG('', ICON.tick)}</div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const ln = q('ln'), sg = q('sg'), lg = q('lg'), sl = q('sl');
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
        const landed = s >= LAND[0];                   // the hard swap: the line goes, the chrome and the first tile arrive together
        const pos = s >= LAND[0] ? -SEG : Math.round((-SEG + ((s / SWEEP) % 1) * (IN_W + SEG)) * 2) / 2;   // the segment's left edge, a pure function of s

        put('ln', landed, (v) => { ln.style.visibility = v ? 'hidden' : ''; });
        put('pos', pos, (v) => { sg.style.left = `${v}px`; });
        put('lg', landed, (v) => { lg.style.visibility = v ? '' : 'hidden'; sl.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // bare rail ground until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
