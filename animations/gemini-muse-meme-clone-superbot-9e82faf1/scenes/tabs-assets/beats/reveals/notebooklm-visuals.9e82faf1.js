// NotebookLM Studio (2026): an open notebook of Google's research notebook app while its Studio rail generates an Infographic, read from two Paul J Lipsky walkthroughs
// (2rKAAf_LRVo 2026-01-25 t = 84-96 s; GJkZcOFHEYo 2026-01-21 t = 140-155 s, the Slide Deck twin; frames reveal-refs/notebooklm-visuals/frames/bu_nb_t{84,90,96}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/notebooklm-visuals/spec.json, confidence 0.5). The whole screen is the reveal: a light three-column notebook (Sources with checkbox rows | Chat with the
// emoji badge, title, summary paragraph, 'Save to note' and thumbs | Studio with the tinted tile grid, each tile its own pastel and a pencil), and under the tiles the pending row: a
// feature-tinted spinning sync glyph, the bold 'Generating Infographic...' and the grey 'based on 4 sources'. The wait is a row, not a bar: no percentage, ETA or cancel. The row gives way
// to the result row ('Wormholes: The Ultimate C...' / '4 sources · 1m ago') and the infographic card under it, a 5 x 2 grid of the ten pictures, fills in reading order. Omitted: the ULTRA
// badge, the presenter's webcam inset, any Google / NotebookLM wordmark. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-nbl';
const ROOT_W = 560, ROOT_H = 420;
const TINT = 'rgb(161, 66, 160)';                                            // the Infographic feature's magenta-purple (written as rgb() so a re-set never differs from the markup's own text)
const IG_BG = 'rgb(241, 229, 241)';
const COLY = 38, COLH = ROOT_H - COLY - 6;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f0f4f9; color: #1f1f1f; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; }
.${P}-ht { position: absolute; left: 12px; top: 0; height: ${COLY}px; line-height: ${COLY}px; font-size: 8px; font-weight: 500; color: #1f1f1f; }
.${P}-hr { position: absolute; right: 8px; top: 9px; display: flex; gap: 5px; }
.${P}-hb { height: 20px; box-sizing: border-box; border-radius: 10px; display: flex; align-items: center; gap: 3px; padding: 0 8px; font-size: 6.6px; line-height: 20px; font-weight: 500; white-space: nowrap; }
.${P}-hb svg { flex: none; width: 8px; height: 8px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cl { position: absolute; top: ${COLY}px; height: ${COLH}px; box-sizing: border-box; border-radius: 10px; background: #fff; overflow: hidden; }
.${P}-ch2 { position: absolute; left: 10px; top: 9px; font-size: 7.6px; line-height: 12px; font-weight: 500; color: #1f1f1f; }
.${P}-hi { position: absolute; top: 10px; width: 10px; height: 10px; fill: none; stroke: #444746; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ad { position: absolute; left: 8px; right: 8px; top: 30px; height: 18px; box-sizing: border-box; border-radius: 9px; box-shadow: inset 0 0 0 1px #c4c7c5; display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 6.6px; line-height: 18px; color: #1f1f1f; white-space: nowrap; }
.${P}-ad svg { flex: none; width: 7px; height: 7px; fill: none; stroke: #1f1f1f; stroke-width: 1.4; stroke-linecap: round; }
.${P}-sa { position: absolute; left: 10px; right: 10px; top: 58px; height: 12px; font-size: 6px; line-height: 12px; color: #444746; }
.${P}-sr { position: absolute; left: 8px; right: 8px; height: 32px; }
.${P}-sr p { position: absolute; left: 14px; right: 16px; top: 1px; font-size: 6px; line-height: 8px; color: #1f1f1f; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; height: 24px; }
.${P}-sr svg { position: absolute; left: 0; top: 2px; width: 8px; height: 8px; fill: none; stroke: #5f6368; stroke-width: 1.1; stroke-linejoin: round; }
.${P}-ck { position: absolute; right: 0; top: 2px; width: 7px; height: 7px; box-sizing: border-box; border-radius: 1.5px; background: #fff; box-shadow: inset 0 0 0 1px #444746; }
.${P}-ck::after { content: ''; position: absolute; left: 1.6px; top: .7px; width: 2px; height: 3.6px; border: solid #1f1f1f; border-width: 0 1.1px 1.1px 0; transform: rotate(40deg); }
.${P}-bh { position: absolute; left: 14px; top: 38px; width: 17px; height: 6px; border-radius: 50%; background: #111; }
.${P}-h1 { position: absolute; left: 14px; top: 46px; font-size: 20px; line-height: 24px; color: #1f1f1f; }
.${P}-n4 { position: absolute; left: 14px; top: 74px; font-size: 6.2px; line-height: 9px; color: #444746; }
.${P}-sm { position: absolute; left: 14px; right: 14px; top: 90px; font-size: 6.3px; line-height: 9.4px; color: #1f1f1f; }
.${P}-sm b { font-weight: 700; }
.${P}-ac { position: absolute; left: 14px; right: 14px; top: 244px; height: 16px; display: flex; align-items: center; gap: 8px; }
.${P}-sv { box-sizing: border-box; height: 15px; padding: 0 8px 0 6px; border-radius: 8px; box-shadow: inset 0 0 0 1px #c4c7c5; display: flex; align-items: center; gap: 3px; font-size: 6.2px; line-height: 15px; color: #1f1f1f; white-space: nowrap; }
.${P}-sv svg, .${P}-ac > svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #444746; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-qs { position: absolute; left: 14px; right: 14px; box-sizing: border-box; padding: 4px 7px; border-radius: 7px; background: #f0f4f9; font-size: 6.2px; line-height: 8.6px; color: #1f1f1f; }
.${P}-in { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 22px; box-sizing: border-box; border-radius: 11px; box-shadow: inset 0 0 0 1px #c4c7c5; }
.${P}-in p { position: absolute; left: 10px; top: 0; font-size: 6.6px; line-height: 22px; color: #747775; }
.${P}-in span { position: absolute; right: 30px; top: 0; font-size: 6px; line-height: 22px; color: #444746; }
.${P}-in i { position: absolute; right: 4px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: #e1e3e1; }
.${P}-tg { position: absolute; left: 8px; top: 29px; width: 206px; }
.${P}-st { position: absolute; width: 101px; height: 28px; box-sizing: border-box; border-radius: 7px; }
.${P}-st svg.${P}-g { position: absolute; left: 8px; top: 5px; width: 8px; height: 8px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-st p { position: absolute; left: 8px; top: 15px; font-size: 6.4px; line-height: 9px; font-weight: 500; white-space: nowrap; }
.${P}-st svg.${P}-pe { position: absolute; right: 5px; top: 5px; width: 16px; height: 16px; border-radius: 50%; background: #fff; }
.${P}-st svg.${P}-pe path { fill: none; stroke: #1f1f1f; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sl { position: absolute; left: 8px; right: 8px; top: 197px; height: 30px; }
.${P}-sp { position: absolute; left: 0; top: 0; width: 100%; height: 30px; }
.${P}-sy { position: absolute; left: 2px; top: 7px; width: 15px; height: 15px; }
.${P}-sy path { fill: none; stroke: ${TINT}; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sy polygon { fill: ${TINT}; }
.${P}-l1 { position: absolute; left: 24px; top: 4px; font-size: 7.8px; line-height: 12px; font-weight: 700; color: #1f1f1f; white-space: nowrap; }
.${P}-l2 { position: absolute; left: 24px; top: 16px; font-size: 6.4px; line-height: 10px; color: #5f6368; white-space: nowrap; }
.${P}-ig { position: absolute; left: 2px; top: 7px; width: 14px; height: 14px; fill: ${TINT}; }
.${P}-cd { position: absolute; left: 8px; width: 206px; top: 235px; height: 121px; box-sizing: border-box; border-radius: 8px; background: #fff; box-shadow: inset 0 0 0 1px #dadce0; }
.${P}-t { position: absolute; width: 36px; height: 54px; border-radius: 3px; overflow: hidden; background: #e3e5e9; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #e3e5e9; background-image: linear-gradient(135deg, #eceef1 0%, #dfe2e6 100%); }
`;

const REF = 1.84;                                                           // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 0.9 + i * (0.78 / 9));    // picture i fills its slot (strict reading order), the last at 1.68
const TURN = 540;                                                           // the sync glyph's travel, degrees per layout second

const TILES = [
  ['Audio Overview', '#e8eaf6', '#3f51b5', '<path d="M1.2 5v1M3 3.4v4.2M5 1.6v7.8M7 3.4v4.2M8.8 5v1"/>'],
  ['Video Overview', '#e2f0e3', '#2e7d32', '<rect x="1.2" y="2" width="7.6" height="6" rx="1"/><path d="M3.4 2V.8h3.2V2"/>'],
  ['Mind Map', '#f4e6ee', '#8e1f7a', '<circle cx="2" cy="5" r="1"/><circle cx="8" cy="2.2" r="1"/><circle cx="8" cy="7.8" r="1"/><path d="M3 5h2l2-2.2M5 5l2 2.8"/>'],
  ['Reports', '#ebe9dd', '#7a6a1f', '<path d="M2 1.4h6v7.2H2zM3.6 3.6h2.8M3.6 5.4h2.8"/>'],
  ['Flashcards', '#f7e5e2', '#b3261e', '<rect x="1.2" y="2.6" width="6.6" height="6" rx="1"/><path d="M2.8 1.2h6v6"/>'],
  ['Quiz', '#dcebf5', '#0b57d0', '<rect x="1.4" y="1.4" width="7.2" height="7.2" rx="1"/><path d="M3.8 4a1.3 1.3 0 1 1 1.6 1.3V6.4M5.2 7.6v.1"/>'],
  ['Infographic', IG_BG, TINT, '<path d="M2 8V5M4 8V2M6 8V4M8 8V6"/>'],
  ['Slide Deck', '#ecebde', '#6f6d1c', '<rect x="1.2" y="2" width="7.6" height="6" rx=".8"/>'],
  ['Data Table', '#e6e8f4', '#3949ab', '<rect x="1.2" y="1.4" width="7.6" height="7.2" rx="1"/><path d="M1.2 4h7.6M4 4v4.6"/>'],
];
const SRCS = ['Neil deGrasse Tyson Explains Wormholes and Black Holes', 'What Are Wormholes? An astrophysicist explains', 'What Are Wormholes? | Space', 'What is a Wormhole? With Neil deGrasse Tyson'];
const PEN = '<svg class="' + P + '-pe" viewBox="0 0 16 16"><path d="M5.2 10.8 5.6 9 9.8 4.8 11.2 6.2 7 10.4ZM9 5.6l1.4 1.4"/></svg>';
const DOC = '<svg viewBox="0 0 10 10"><path d="M2.2 1h4l1.8 1.8V9H2.2zM6.2 1v2H8"/></svg>';
const SYNC = `<svg class="${P}-sy" viewBox="0 0 24 24"><g class="${P}-sg"><path d="M5.2 12A6.8 6.8 0 0 1 16.6 7.2"/><polygon points="19,3.6 19,9.6 13.4,8.4"/><path d="M18.8 12A6.8 6.8 0 0 1 7.4 16.8"/><polygon points="5,20.4 5,14.4 10.6,15.6"/></g></svg>`;

const f1 = (v) => v.toFixed(1);
const cardPos = (i) => ({ x: 6 + (i % 5) * 39, y: 6 + Math.floor(i / 5) * 57 });

export default {
  id: 'notebooklm-visuals',
  label: 'NotebookLM Studio (2026)',
  source: {
    platform: "NotebookLM (notebooklm.google.com), the Studio rail of an open notebook in desktop Chrome, English UI, captured from two third-party YouTube tutorials (Paul J Lipsky)",
    feature: "the Infographic generator of the Studio rail: the Customize panel closes and the rail grows a two-line pending row under the live tile grid - a feature-tinted spinning sync glyph, the bold 'Generating Infographic...' and the grey 'based on 4 sources' - which the result row ('Wormholes: The Ultimate C...' / '4 sources · 1m ago') replaces; the notebook's source list and chat stay live and undimmed",
    capture: {
      url: 'https://www.youtube.com/watch?v=2rKAAf_LRVo',
      date: '2026-01-25',
      timestamps: "video 2rKAAf_LRVo 'How to Create INCREDIBLE Infographics with NotebookLM': t = 80 s 'Generate an AI infographic' prompt card, t = 84 s and t = 90 s 'Generating Infographic...' + 'based on 4 sources' with the Infographic tile greyed, t = 96 s the 'Customize Infographic' panel over the notebook and the result row 'Wormholes: The Ultimate C...' / '4 sources · 1m ago'; video GJkZcOFHEYo (2026-01-21) t = 140-155 s the Slide Deck twin 'Generating Slide Deck...' / 'based on 7 sources'",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=2rKAAf_LRVo', published: '2026-01-25', retrieved: '2026-10-15', note: "the three-column notebook (sources, chat 'Wormholes', Studio tile grid) with the pending row 'Generating Infographic...' / 'based on 4 sources' and the result row (frames bu_nb_t84 / t90 / t96)" },
      { url: 'https://www.youtube.com/watch?v=GJkZcOFHEYo', published: '2026-01-21', retrieved: '2026-10-15', note: "the Slide Deck variant of the same row ('Generating Slide Deck...' / 'based on 7 sources', olive glyph), confirming the row is shared by both visual generators" },
    ],
    extrapolated: [
      "the landing: footage shows one infographic result row replacing the pending row (t = 94 s row, t = 96 s result), cut between; here the result row appears when the last picture has landed and an infographic card under it, a 5 x 2 grid of the ten pictures filling in strict reading order, is ours (the card exists as empty slots from the start, which the recording never shows)",
      "all timing: the recorded wait is 13-20 s on camera with the tutorial cut either side and no progress shown; here the glyph turns for the first 0.9 s while the slots stay empty and the pictures land 0.087 s apart, the glyph's speed and tint of its arrows being a pure function of t, frozen at the last landing",
      "the source rows' titles and the chat's suggestion chips: the recording shows them truncated (only 'Wormholes and B...', 'astrophysicist explain...', '| Space', 'With Neil deGrasse Tyson' legible); the four titles here are completed in our own wording, the suggestions are the recording's two questions verbatim",
      "the glyph tints and pencil buttons of the Studio tiles are our reading of the pastel tiles in the recording (Audio Overview lavender, Video Overview green, Mind Map pink, Reports khaki, Flashcards salmon, Quiz blue, Infographic lavender-pink, Slide Deck beige, Data Table periwinkle); the Infographic tile greys out while pending as it does in the recording",
      "the header's 'Wormholes' title at left and the chat input bar ('Start typing...') are our own filler around the recorded 'Create notebook' / 'Analytics' / 'Share' / 'Settings' buttons; the ULTRA badge, the avatar and the presenter's webcam inset are omitted",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'notebooklm-visuals');
    const cell = (g, i) => {
      const p = cardPos(i);
      return `<div class="${P}-t" style="left: ${p.x}px; top: ${p.y}px"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
        + `<div class="${P}-cv"></div></div></div>`;
    };
    const studio = TILES.map(([name, bg, fg, glyph], i) => `<div class="${P}-st" data-i="${i}" style="left: ${(i % 2) * 105}px; top: ${Math.floor(i / 2) * 32}px; background: ${bg}; color: ${fg}"><svg class="${P}-g" viewBox="0 0 10 10">${glyph}</svg><p>${name}</p>${PEN}</div>`).join('');
    const sources = SRCS.map((s, i) => `<div class="${P}-sr" style="top: ${74 + i * 34}px">${DOC}<p>${s}</p><div class="${P}-ck"></div></div>`).join('');
    const root = x.el(`<div class="${P}">`
      + `<p class="${P}-ht">Wormholes</p>`
      + `<div class="${P}-hr"><p class="${P}-hb" style="background: #1f1f1f; color: #fff"><svg viewBox="0 0 10 10"><path d="M5 1.8v6.4M1.8 5h6.4"/></svg>Create notebook</p>`
      + `<p class="${P}-hb" style="box-shadow: inset 0 0 0 1px #c4c7c5; color: #1f1f1f"><svg viewBox="0 0 10 10"><path d="M1.2 7.6 3.8 4.8 5.6 6.4 8.8 2.4M6.6 2.4h2.2v2.2"/></svg>Analytics</p>`
      + `<p class="${P}-hb" style="box-shadow: inset 0 0 0 1px #c4c7c5; color: #1f1f1f"><svg viewBox="0 0 10 10"><circle cx="2.4" cy="5" r="1.1"/><circle cx="7.6" cy="2.2" r="1.1"/><circle cx="7.6" cy="7.8" r="1.1"/><path d="M3.4 4.5 6.6 2.7M3.4 5.5 6.6 7.3"/></svg>Share</p>`
      + `<p class="${P}-hb" style="box-shadow: inset 0 0 0 1px #c4c7c5; color: #1f1f1f"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="1.6"/><path d="M5 1v1.4M5 7.6V9M1 5h1.4M7.6 5H9M2.2 2.2l1 1M6.8 6.8l1 1M2.2 7.8l1-1M6.8 3.2l1-1"/></svg>Settings</p></div>`
      // Sources
      + `<div class="${P}-cl" style="left: 6px; width: 100px"><p class="${P}-ch2">Sources</p>`
      + `<p class="${P}-ad"><svg viewBox="0 0 10 10"><path d="M5 1.8v6.4M1.8 5h6.4"/></svg>Add sources</p>`
      + `<p class="${P}-sa">Select all sources</p><div class="${P}-ck" style="left: auto; right: 10px; top: 61px"></div>${sources}</div>`
      // Chat
      + `<div class="${P}-cl" style="left: 112px; width: 214px"><p class="${P}-ch2">Chat</p>`
      + `<svg class="${P}-hi" style="right: 26px" viewBox="0 0 10 10"><path d="M1.5 2.5h7M2.8 5h4.4M4 7.5h2"/></svg><svg class="${P}-hi" style="right: 10px" viewBox="0 0 10 10"><circle cx="5" cy="2" r=".8"/><circle cx="5" cy="5" r=".8"/><circle cx="5" cy="8" r=".8"/></svg>`
      + `<div class="${P}-bh"></div><p class="${P}-h1">Wormholes</p><p class="${P}-n4">4 sources</p>`
      + `<p class="${P}-sm">Scientific experts explain that <b>wormholes</b> are theoretical passages in <b>space-time</b> that function as shortcuts, potentially allowing for instantaneous travel across vast cosmic distances. Based on <b>Einstein's theory of general relativity</b>, these bridges—often called <b>Einstein-Rosen bridges</b>—mathematically describe a connection between two distant points through a curved portal. While frequently featured in <b>science fiction</b> as stable gates for space travel or <b>time machines</b>, physicists note that real wormholes would likely be microscopic and extremely <b>unstable</b>, collapsing quickly without the presence of <b>exotic matter</b>. These sources distinguish between <b>black holes</b>, which are high-gravity regions where light cannot escape, and the hypothetical <b>white holes</b> that might serve as a wormhole's exit.</p>`
      + `<div class="${P}-ac"><p class="${P}-sv"><svg viewBox="0 0 10 10"><path d="M3 1.4h4M4 1.4v3.2L2.6 6.4h4.8L6 4.6V1.4M5 6.4v2.4"/></svg>Save to note</p>`
      + `<svg viewBox="0 0 10 10"><rect x="3" y="1.4" width="5.6" height="6.6" rx=".8"/><path d="M1.6 3.2v5.4h4"/></svg>`
      + `<svg viewBox="0 0 10 10"><path d="M1.6 4.6h1.8v4H1.6zM3.4 4.8 5 1.4c.9 0 1.4.7 1.2 1.6L6 4h2.6c.6 0 1 .6.8 1.2l-.8 2.8c-.1.4-.5.6-.9.6H3.4"/></svg>`
      + `<svg viewBox="0 0 10 10"><path d="M1.6 5.4h1.8v-4H1.6zM3.4 5.2 5 8.6c.9 0 1.4-.7 1.2-1.6L6 6h2.6c.6 0 1-.6.8-1.2l-.8-2.8c-.1-.4-.5-.6-.9-.6H3.4"/></svg></div>`
      + `<p class="${P}-qs" style="top: 274px">Why do scientists consider wormholes unstable and what is required for stabilization?</p>`
      + `<p class="${P}-qs" style="top: 302px">How do wormholes differ from black holes in their potential for space travel?</p>`
      + `<div class="${P}-in"><p>Start typing...</p><span>4 sources</span><i></i></div></div>`
      // Studio
      + `<div class="${P}-cl" style="left: 332px; width: 222px"><p class="${P}-ch2">Studio</p>`
      + `<svg class="${P}-hi" style="right: 10px" viewBox="0 0 10 10"><rect x="1.2" y="1.4" width="7.6" height="7.2" rx="1"/><path d="M6 1.4v7.2"/></svg>`
      + `<div class="${P}-tg">${studio}</div>`
      + `<div class="${P}-sl"><div class="${P}-sp">${SYNC}<p class="${P}-l1">Generating Infographic...</p><p class="${P}-l2">based on 4 sources</p></div>`
      + `<div class="${P}-sp ${P}-rs"><svg class="${P}-ig" viewBox="0 0 10 10"><path d="M1.4 8.6V6h1.6v2.6zM4.2 8.6V1.8h1.6v6.8zM7 8.6V4.2h1.6v4.4z"/></svg><p class="${P}-l1">Wormholes: The Ultimate C...</p><p class="${P}-l2">4 sources · 1m ago</p></div></div>`
      + `<div class="${P}-cd">${tiles.map(cell).join('')}</div>`
      + `</div></div>`);
    const sp = root.querySelector(`.${P}-sp`);
    const rs = root.querySelector(`.${P}-rs`);
    const sg = root.querySelector(`.${P}-sg`);
    const ig = root.querySelector(`.${P}-st[data-i="6"]`);
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
        const pend = s < LAND[9];
        // the pending row until the last picture has landed, then the result row in the same slot; the Infographic tile is greyed while pending
        put('row', pend, (v) => { sp.style.visibility = v ? '' : 'hidden'; rs.style.visibility = v ? 'hidden' : ''; });
        put('ig', pend, (v) => { ig.style.background = v ? 'rgb(236, 236, 236)' : IG_BG; ig.style.color = v ? 'rgb(154, 154, 154)' : TINT; });
        put('sy', f1((Math.min(s, LAND[9]) * TURN) % 360), (v) => { sg.setAttribute('transform', `rotate(${v} 12 12)`); });
        cells.forEach((c, i) => {
          put(`i${i}`, s >= LAND[i], (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
        });
      },
    };
  },
};
