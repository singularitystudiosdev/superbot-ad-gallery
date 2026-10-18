// Hacker-ad beats: the middles of the superbot "hacker announcement" spots, where the hooded mascot's voiceover runs
// over the chat, each phrase landing on its answer. Two cuts, one plan:
//   'hacker' (the default export): "It can make calls, generate images, 3D models, connect to your apps directly, so you
//   don't need MCPs";
//   'hacker-hello' (`hello`): "It can make calls, generate images, 3D models, audio, and it doesn't require MCPs", the
//   apps card swapped for an audio card and a card of its own for the MCP row, its empty state held longer
//   (HELLO_WAIT) so the spot's "We have built an agent that can actually do what you ask" plays over the ask typing;
//   'hacker-hello-pc' (`helloPc`): the same with the call swapped for computer control, as the computer-control-v3-soft
//   cut shows it (computer.ba3976b6.js): asked to find cat videos, superbot takes over the screen (the pink and purple
//   vignette, the "superbot is controlling your computer" pill), types the search into a plain browser, opens the
//   results and plays a kitten chasing a laser dot. The browser and the search page are generic, no company's marks;
//   the cats are generated (img/hacker.7dfcf32a/CREDITS.txt).
// Cut as the multicat-credits chain is (the engine routes it bare: no routing chips, no "<model> in superbot" header,
// the composer on Superbot throughout), but paced as a montage:
//   1. calls: asked to move a hotel stay, superbot is already on the line with the hotel's front desk (the hotelcall cut's
//      recorded call and timings, hotelcall-data.f934b5ee.js, the hotel left unnamed), the card coming in live mid-call,
//      its transcript filling in word by word on the call's own timings;
//   2. images: the multidog cut's beagle (GPT Image 2, img/dogs.7b007b09/CREDITS.txt) lands out of its skeleton;
//   3. 3D models: that beagle as the walking Meshy model (models/dog-meshy.7b007b09.glb, cat3d.516afb1a.js);
//   4. apps ('hacker'): eight everyday apps connect one by one, drawn as generic glyphs (no third-party marks), then the
//      "MCP server" chip strikes through to "Not needed" beside "Direct connection";
//      or audio ('hacker-hello'): the dog's theme song lands in a player and starts playing, then the MCP row comes in
//      as its own card and strikes the same way;
//   5. the house superbot.gg end card (multicat.516afb1a.js's, restated) covers the chat.
// Generations wait under skeletons whose pills count the tools' real seconds, fast-forwarded X times (the frame's badge
// says so). The voiceover is laid in by the spot's own cut (the hacker shots before and after this montage); its phrase
// cues are this plan's moments, published as window.__HACKER_CUES[<variant>] for that edit, with the card the camera
// frames from each moment (`focus`). A pure function of t. Its stylesheet (../hacker.7dfcf32a.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, outBack, streamCount, path, press, blink } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { makeCatViewer } from './cat3d.516afb1a.js?v=1';
import { PICK, LINES, ENV } from './hotelcall-data.f934b5ee.js';

const CSS = new URL('../hacker.7dfcf32a.css?v=3', import.meta.url).href;
export const ID = 'hacker';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const PHOTO = asset('img/dogs.7b007b09/beagle.jpg');
const MODEL = asset('models/dog-meshy.7b007b09.glb?v=2'); // the multidog cuts' URL, so they share one download

export const TYPE_CPS = 90;  // the first ask types at this rate (its route's typeCps, chat.9b47fc30.js)
export const HELLO_WAIT = 1.8; // 'hacker-hello' holds the empty state this much longer before its ask types (the route's wait)
const FOLLOW_CPS = 150;      // the montage's follow-up asks, quicker still
// the hotelcall cut's call, its hotel left unnamed: "The Calder" turned out to be a real hotel's name too, so the card
// reads "Your hotel" and the desk answers "Front desk" over the same recorded timings (a fictional 555 number)
const HOTEL = 'Your hotel', DESK = 'Front desk', PHONE = '+1 (415) 555-0142';
const SAY0 = 'Calling your hotel’s front desk now.';
const GREETING = ['Front', 'desk,', 'this', 'is', 'Maya.', 'How', 'can', 'I', 'help?']; // in place of "The Calder, this is Maya. How can I help?"
const CALL_FROM = 4.0;       // the call's own second (from the dial) the card comes in on: just before superbot speaks
const ROW_LEAD = 0.2, WORD_IN = 0.1;
const BARS = 60, BAR_STEP = 2; // the waveform, as the hotelcall card draws it: the last 4 s, newest on the right
// fast-forward: each pill counts its tool's real seconds X times the clock (GPT Image 2 about 47 s, Meshy about 105 s:
// multicat.516afb1a.js GEN; a 12 s song about 36 s), so the image waits 0.31 s, the model 0.7 s and the song 0.24 s
const X = 150;
const GEN = { image: 47, model: 105, audio: 36 };
const FF_IN = 0.15;
// a follow-up's moments from its ask starting to type: sent, answered, its card in, generating once the card is seen
const SEND_AFTER = 0.1, REPLY_AFTER = 0.22, CARD_AFTER = 0.12, SEEN = 0.2;
// the apps card: each tile starts connecting TILE_STAGGER after the last, spins TILE_SPIN, then shows its check
const TILE_FROM = 0.3, TILE_STAGGER = 0.11, TILE_SPIN = 0.3;
const MCP_IN = 1.75, MCP_STRIKE = 2.8; // after the apps card: the MCP row comes in, then its chip strikes through
const MCP_SOLO_STRIKE = 1.45; // the MCP row's own card: in with the card, striking as its phrase's last word lands
const HOLD = 1.2;            // the struck MCP row, from its strike to the end card's cover
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
const SONG = 12, WAVE = 56;  // the theme song's seconds, and its player's waveform bars
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
// the mascot's face, its mask id kept per beat: two beats on one page would otherwise share one id, and a mask in a
// hidden route resolves to nothing (the face drawn as a white square)
const END_FACE = (id) => '<svg class="hk-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="hkEndFace-' + id + '" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#hkEndFace-' + id + ')" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#hkEndFace-' + id + ')" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#hkEndFace-' + id + ')"/></svg>';
// lucide bed-double and phone (as hotelcall.f934b5ee.js has them)
const BED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4m-8-6v6M2 18h20"/></svg>';
const PHONE_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/></svg>';
// the player's play and pause (bedtime.b60749a3.js's play triangle)
const PLAY = '<svg class="hk-i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const PAUSE = '<svg class="hk-i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1"/><rect x="13.5" y="5.5" width="4" height="13" rx="1"/></svg>';
// the computer card ('hacker-hello-pc'): a plain browser on the shared screen. Its moments from the card coming in (c0):
// the takeover overlay, the cursor gliding to the search box and clicking, the query typing, Enter, the results, the
// cursor onto the first video and its click, the video playing. All in the screen's own px (hacker.7dfcf32a.css .hk-scr)
const SAY_PC = 'Taking control of your computer now.';
const PC = { take: 0.15, ptr: 0.35, box: 0.75, click: 0.8, type0: 0.86, type1: 1.42, enter: 1.5, ptr2: 1.8, hov2: 2.15, click2: 2.22, play: 2.36 };
const QUERY = 'funny cat videos';
const CUR = { rest: { x: 430, y: 300 }, box: { x: 280, y: 191 }, thumb: { x: 128, y: 152 }, away: { x: 486, y: 318 } };
const SPRITE = { src: 'img/hacker.7dfcf32a/cat-laser-sprite.jpg', cols: 10, n: 105, fps: 30 }; // the played clip, 480x270 a frame
const VIDEO_LEN = 42; // the played video's length on its clock (its result tile's 0:42)
// the results: generated photographs, made-up titles; the first is the one superbot opens
const CATS = [
  { img: 'cat-laser.jpg', title: 'Kitten vs. the laser dot', meta: '1.2M views · 3 days ago', dur: '0:42', alt: 'A grey-and-white kitten pouncing at a red laser dot' },
  { img: 'cat-mug.jpg', title: 'This cat knocks everything off the table', meta: '860K views · 1 week ago', dur: '1:08', alt: 'A tuxedo cat pushing a mug off a table' },
  { img: 'cat-box.jpg', title: 'If it fits, he sits', meta: '2.4M views · 2 weeks ago', dur: '0:57', alt: 'An orange cat squeezed into a small box' },
  { img: 'cat-sun.jpg', title: 'Sleepiest cat ever', meta: '540K views · 5 days ago', dur: '2:14', alt: 'A calico cat asleep in a sunbeam' },
  { img: 'cat-bubbles.jpg', title: 'Cat discovers bubbles', meta: '3.1M views · 1 month ago', dur: '0:36', alt: 'A tabby batting at soap bubbles' },
  { img: 'cat-kittens.jpg', title: 'Two kittens, one blanket', meta: '970K views · 4 days ago', dur: '1:21', alt: 'Two kittens play-wrestling on a blanket' },
];
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z'; // computer.ba3976b6.js's macOS-style arrow
// lucide monitor, and the browser's chrome glyphs (computer.ba3976b6.js's)
const MONITOR = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
const BROWSER = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
};
// the apps: everyday kinds, each a lucide glyph (ISC) in its own tint; generic on purpose, no company's mark
const G = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const APPS = [
  { name: 'Email', c: '#5b8dff', svg: G('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') },
  { name: 'Calendar', c: '#ff6b5b', svg: G('<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>') },
  { name: 'Files', c: '#f5b324', svg: G('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>') },
  { name: 'Chat', c: '#00e5c3', svg: G('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>') },
  { name: 'Notes', c: '#e8e8ed', svg: G('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>') },
  { name: 'Music', c: '#c026d3', svg: G('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') },
  { name: 'Photos', c: '#34d399', svg: G('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') },
  { name: 'Wallet', c: '#a78bfa', svg: G('<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>') },
];
const IMAGE = { kind: 'image', ask: 'Make me a realistic image of a dog', say: 'Here’s your realistic dog.', gen: 'image', at: 1.0 };
const MODEL3D = { kind: 'model', ask: 'Now make it an animated 3D model', say: 'Here’s your dog as an animated 3D model.', gen: 'model', at: 2.6 };
// each follow-up's `at`: when its ask starts typing, from the call card coming in (c0). Set so each card is in as its
// phrase of the voiceover starts (the cues), the phrases keeping the take's own pace with a breath between them
const STEPS = [IMAGE, MODEL3D,
  { kind: 'apps', ask: 'Connect all my apps', say: 'Connected directly. No MCP servers to set up.', at: 4.25 },
];
// 'hacker-hello': "audio" is one short word, so the MCP card follows the song's a beat sooner than a card would follow
// a phrase
const HELLO_STEPS = [IMAGE, MODEL3D,
  { kind: 'audio', ask: 'Make a theme song for my dog', say: 'Here’s your dog’s theme song.', gen: 'audio', at: 4.2 },
  { kind: 'mcp', ask: 'Do I need to set up MCP servers?', say: 'No. I connect to your apps directly.', at: 5.35 },
];
// 'hacker-hello-pc': the same asks, each 2 s later, so the search, the results and the video run before the image's
const PC_SHIFT = 2.0;
const HELLO_PC_STEPS = HELLO_STEPS.map((st) => ({ ...st, at: st.at + PC_SHIFT }));
// the card the camera frames once each answer is in (render-montage.mjs)
const SEL = { image: '.hk-img', model: '.hk-3d', apps: '.hk-apps', audio: '.hk-audio', mcp: '.hk-mcpc' };
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// every time in the beat, from the first reply r: the call card comes in at c0; each follow-up types from c0 + its `at`,
// its card comes in at `card` and (when it generates) waits from gen0 until done, landed by w1; the MCP row strikes at
// `strike`; then the end card covers the chat at `cut`
function plan(r, steps, lead = 'call') {
  const c0 = r + 0.2;
  const T = { r, c0, steps: [] };
  if (lead === 'pc') T.pc = Object.fromEntries(Object.entries(PC).map(([k, v]) => [k, c0 + v]));
  for (const st of steps) {
    const s = c0 + st.at, typeEnd = s + st.ask.length / FOLLOW_CPS, send = typeEnd + SEND_AFTER;
    const rr = send + REPLY_AFTER, card = rr + CARD_AFTER, gen0 = card + SEEN;
    const done = st.gen ? gen0 + GEN[st.gen] / X : card;
    T.steps.push({ ...st, s, typeEnd, send, r: rr, card, gen0, done, w1: done + LAND });
  }
  const L = T.steps[T.steps.length - 1];
  // the MCP row: inside the apps card (in MCP_IN after it, striking at MCP_STRIKE), or a card of its own
  T.mcp = L.kind === 'apps' ? L.card + MCP_IN : L.card;
  T.strike = L.card + (L.kind === 'apps' ? MCP_STRIKE : MCP_SOLO_STRIKE);
  T.cut = T.strike + HOLD;
  T.end = T.cut + END_DELAY + END_LEN;
  // the voiceover's phrases start on these moments (the spot's edit lays the take's phrases here): calls as the call
  // card comes in, images, 3D models and audio as their cards come in and generate, apps as the tiles start connecting,
  // and the MCP phrase so its last word lands on the strike (the apps card's) or as its own card comes in
  const by = Object.fromEntries(T.steps.map((st) => [st.kind, st]));
  T.cues = { [lead === 'pc' ? 'pc' : 'calls']: c0 + 0.05, images: by.image.card, models: by.model.card };
  if (by.apps) Object.assign(T.cues, { apps: by.apps.card + 0.1, mcps: T.strike - 1.0 });
  if (by.audio) Object.assign(T.cues, { audio: by.audio.card, mcps: by.mcp.card + 0.05 });
  T.cues.cut = T.cut;
  // superbot's moves on the screen run quicker than an agent's really do: the edit badges them "Sped up"
  if (lead === 'pc') T.cues.sped = [[T.pc.ptr - 0.05, T.pc.play]];
  T.focus = [[c0, lead === 'pc' ? '.hk-pc' : '.hk-call'], ...T.steps.map((st) => [st.card, SEL[st.kind]])];
  return T;
}

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`hacker variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a card's entrance: it rises and settles in over 0.45 s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };

// a streamed reply line: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// a generating card's pill (no tool tile: the bare cut names no model) and its timer: the real seconds X times the clock
// from gen0, resting on the full `real` from done, the pill fading as the answer lands. Returns how much it generates now
function genPill(box) {
  const pill = box.querySelector('.qc-genl'), num = pill.querySelector('.qc-genn');
  let shown = '', op = '';
  return (t, gen0, done, w1, real) => {
    const s = clock(t >= done ? real : Math.max(0, t - gen0) * X);
    if (s !== shown) { num.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.2, w1), o = out.toFixed(3);
    if (o !== op) { pill.style.opacity = o; op = o; }
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}
const genl = (what) => `<span class="qc-genl hk-genl">${what}<b class="qc-genn">${clock(0)}</b></span>`;

// the feed glides to a zero-height anchor a little under each card, so the newest card clears the feed's clip
const anchor = (x, cls = '') => x.el(`<i class="hk-anchor${cls}" aria-hidden="true"></i>`);

// the MCP row's markup and motion, in the apps card or a card of its own: it comes in at T.mcp, then the chip strikes
// through, "Not needed" and "Direct connection" landing on it
const mcpRow = (x) => `<div class="hk-mcp"><span class="hk-chip">MCP server<i class="hk-strike"></i></span><span class="hk-need">Not needed</span><span class="hk-direct">${x.OK}Direct connection</span></div>`;
function mcpMotion(root, T) {
  const mcp = root.querySelector('.hk-mcp'), strike = root.querySelector('.hk-strike'), chip = root.querySelector('.hk-chip');
  const need = root.querySelector('.hk-need'), direct = root.querySelector('.hk-direct');
  return (t) => {
    const mi = outCubic(seg(t, T.mcp, T.mcp + 0.35));
    mcp.style.opacity = mi.toFixed(3);
    mcp.style.transform = mi >= 1 ? 'none' : `translateY(${((1 - mi) * 8).toFixed(2)}px)`;
    const sp = outCubic(seg(t, T.strike, T.strike + 0.3));
    strike.style.transform = `scaleX(${sp.toFixed(4)})`;
    chip.style.opacity = lerp(1, 0.55, sp).toFixed(3);
    const np = outCubic(seg(t, T.strike + 0.05, T.strike + 0.35));
    need.style.opacity = np.toFixed(3);
    need.style.transform = np >= 1 ? 'none' : `translateX(${((1 - np) * -8).toFixed(2)}px)`;
    direct.style.opacity = np.toFixed(3);
    direct.style.transform = np >= 1 ? 'none' : `scale(${lerp(0.9, 1, outBack(np)).toFixed(4)})`;
  };
}

// each follow-up's answer card: built into its reply, then `init` (its decode or viewer, on the first render, in step
// order) and `render(t)`, which returns how much it generates now (the fast-forward badge)
const CARDS = {
  // the photo, out of its skeleton
  image(x, st) {
    const media = x.el(`<div class="qc-media"><div class="qc-img qc-skel hk-img"><img src="${PHOTO}" width="1536" height="1152" alt="A photorealistic tricolor beagle standing on a sunny lawn, three-quarter view"/><i class="qc-sk"></i>${genl('Creating image')}</div></div>`);
    const imgCard = media.firstElementChild, im = imgCard.querySelector('img'), sk = imgCard.querySelector('.qc-sk'), gen = genPill(imgCard);
    return { out: media,
      init() { track(im.decode().catch((e) => console.error(new Error(`hacker image failed to decode: ${im.src}`, { cause: e })))); },
      render(t) {
        enter(media, t, st.card);
        const lp = landing(t, st.done);
        shimmer(sk, t, st.card, 0, lp);
        settle(im, lp);
        return gen(t, st.gen0, st.done, st.w1, GEN.image);
      } };
  },
  // the model, in the 3D artifact frame, walking on its turntable: builds behind its skeleton, lands front three-quarter
  // and turns toward side-on as it walks
  model(x, st) {
    const model = x.el(`<div class="bk hk-3d"><div class="bk-head"><b class="bk-title">Dog 3D model<small>Animated · GLB</small></b></div><div class="bk-view qc-3d qc-skel"><canvas width="1400" height="875" role="img" aria-label="Animated 3D beagle model walking on a turntable"></canvas><i class="qc-sk"></i>${genl('Creating 3D model')}</div></div>`);
    const canvas = model.querySelector('canvas'), sk = model.querySelector('.qc-sk'), gen = genPill(model);
    let viewer = null;
    return { out: model,
      init() { viewer = makeCatViewer(canvas, MODEL); track(viewer.ready); },
      render(t) {
        const cm = enter(model, t, st.card);
        if (cm > 0) viewer.draw({ spin: -1.0 + 0.22 * (t - st.w1), time: t - st.card });
        const lp = landing(t, st.done);
        shimmer(sk, t, st.card, 0, lp);
        settle(canvas, lp);
        return gen(t, st.gen0, st.done, st.w1, GEN.model);
      } };
  },
  // the apps, connecting one by one (each tile's glyph lights as it connects, its spinner giving way to the check), then
  // the MCP row
  apps(x, st, T) {
    const apps = x.el(`<div class="bk hk-apps">
      <div class="bk-head"><b class="bk-title">Your apps<small>Connected directly</small></b><span class="hk-count"><b>0</b> of ${APPS.length} connected</span></div>
      <div class="hk-grid">${APPS.map((a) => `<div class="hk-app"><span class="hk-ic" style="--c:${a.c}">${a.svg}</span><span class="hk-nm">${a.name}</span><span class="hk-ast"><i class="qc-spin"></i>${x.OK}</span></div>`).join('')}</div>
      ${mcpRow(x)}
    </div>`);
    const count = apps.querySelector('.hk-count b');
    const tiles = [...apps.querySelectorAll('.hk-app')].map((n, i) => {
      const s = st.card + TILE_FROM + i * TILE_STAGGER;
      return { n, s, done: s + TILE_SPIN, spin: n.querySelector('.qc-spin'), ok: n.querySelector('.qc-ok'), ic: n.querySelector('.hk-ic') };
    });
    const row = mcpMotion(apps, T);
    let countShown = -1;
    return { out: apps, init() {},
      render(t) {
        enter(apps, t, st.card);
        let n = 0;
        for (const tl of tiles) {
          const on = seg(t, tl.s, tl.s + 0.15), ok = seg(t, tl.done, tl.done + 0.25);
          if (t >= tl.done) n++;
          tl.spin.style.opacity = (on * (1 - seg(t, tl.done - 0.06, tl.done + 0.06))).toFixed(3);
          tl.spin.style.transform = `rotate(${(Math.max(0, t - tl.s) * 420).toFixed(1)}deg)`;
          tl.ok.style.opacity = ok.toFixed(3);
          tl.ok.style.transform = `scale(${lerp(0.3, 1, outBack(ok)).toFixed(4)})`;
          tl.ic.classList.toggle('hk-on', t >= tl.done);
          tl.n.style.transform = ok > 0 && ok < 1 ? `scale(${(1 + 0.04 * Math.sin(Math.PI * ok)).toFixed(4)})` : 'none';
        }
        if (n !== countShown) { count.textContent = String(n); countShown = n; }
        row(t);
        return 0;
      } };
  },
  // the theme song, out of its skeleton into a player that starts playing as it lands: the play head walks the waveform
  // at the song's own pace, the bars behind it lit, the clock counting
  audio(x, st) {
    const bars = Array.from({ length: WAVE }, (_, i) => {
      const h = 0.28 + 0.42 * Math.abs(Math.sin(i * 0.71) * Math.sin(i * 0.23 + 1.3)) + 0.3 * Math.abs(Math.sin(i * 2.17));
      return `<i style="height:${Math.round(Math.min(1, h) * 100)}%"></i>`;
    }).join('');
    const card = x.el(`<div class="bk hk-audio"><div class="bk-head"><b class="bk-title">Dog theme song<small>Audio · MP3</small></b></div><div class="bk-view hk-au qc-skel"><div class="hk-player"><span class="hk-play">${PLAY}${PAUSE}</span><div class="hk-aw" aria-hidden="true">${bars}</div><b class="hk-at">0:00 / ${clock(SONG)}</b></div><i class="qc-sk"></i>${genl('Creating audio')}</div></div>`);
    const player = card.querySelector('.hk-player'), sk = card.querySelector('.qc-sk'), gen = genPill(card);
    const play = card.querySelector('.hk-play'), at = card.querySelector('.hk-at'), wave = [...card.querySelectorAll('.hk-aw i')];
    let lit = -1, shown = '', playing = null;
    return { out: card, init() {},
      render(t) {
        enter(card, t, st.card);
        const lp = landing(t, st.done);
        shimmer(sk, t, st.card, 0, lp);
        settle(player, lp);
        const pos = clamp((t - st.w1) / SONG) * SONG;
        const on = t >= st.w1;
        if (on !== playing) { play.classList.toggle('hk-on', on); playing = on; }
        const k = Math.floor((pos / SONG) * WAVE);
        if (k !== lit) { wave.forEach((b, i) => b.classList.toggle('hk-p', i < k)); lit = k; }
        const s = `${clock(pos)} / ${clock(SONG)}`;
        if (s !== shown) { at.textContent = s; shown = s; }
        return gen(t, st.gen0, st.done, st.w1, GEN.audio);
      } };
  },
  // the MCP row as a card of its own
  mcp(x, st, T) {
    const card = x.el(`<div class="bk hk-mcpc"><div class="bk-head"><b class="bk-title">Your apps<small>Connected directly</small></b></div>${mcpRow(x)}</div>`);
    const row = mcpMotion(card, T);
    return { out: card, init() {}, render(t) { enter(card, t, st.card); row(t); return 0; } };
  },
};

// the lead card of 'hacker' and 'hacker-hello': the call, live: header (the hotel, its number, the call's state and
// timer), the waveform, the transcript
function callCard(x, T) {
    const call = x.el(`<div class="bk hk-call">
      <div class="bk-head"><span class="qc-tile hk-av">${BED}</span><b class="bk-title">${HOTEL}<small>${DESK}, ${PHONE}</small></b><span class="hk-st"><i class="hk-dot"></i>${PHONE_GLYPH}<span>Live</span><b class="hk-time"></b></span></div>
      <div class="hk-wave" aria-hidden="true">${'<i></i>'.repeat(BARS)}</div>
      <div class="hk-tx" aria-live="off"></div>
    </div>`);
    const time = call.querySelector('.hk-time');
    const bars = [...call.querySelector('.hk-wave').children].map((n) => ({ n, lv: -1, sb: null }));
    const tx = call.querySelector('.hk-tx');
    // the call's own clock: its second CALL_FROM is the card's arrival
    const callT = (t) => CALL_FROM + (t - T.c0);
    // the first two turns: the desk's greeting (already said, shown whole) and superbot's reply, word by word
    const rows = LINES.slice(0, 2).map((l, li) => {
      const said = li === 0 ? GREETING : l.words.map(([w]) => w);
      const n = x.el(`<div class="hk-row hk-${l.who}"><span class="hk-who">${l.who === 'sb' ? 'Superbot' : 'Maya'}</span><p class="hk-line">${said.map((w) => `<span>${x.esc(w)}</span>`).join(' ')}</p></div>`);
      const a = anchor(x, ' hk-anchor-row');
      n.append(a);
      tx.append(n);
      return { n, a, at: T.c0 + (l.s - ROW_LEAD - CALL_FROM), words: [...n.querySelectorAll('.hk-line span')].map((w, i) => ({ w, at: T.c0 + (l.words[i][1] - CALL_FROM), op: '' })), on: null };
    });
    const callAnchor = anchor(x);
  let timeShown = null;
  return { el: call, anchor: callAnchor, marks: rows.map((rw) => [rw.at, rw.a]), render(t) {
    // live from the call's CALL_FROM
      enter(call, t, T.c0);
      const ct = callT(t);
      const tm = clock(Math.max(0, ct - PICK));
      if (tm !== timeShown) { time.textContent = tm; timeShown = tm; }
      const f = Math.floor(ct * ENV.fps);
      for (let i = 0; i < BARS; i++) {
        const j = f - (BARS - 1 - i) * BAR_STEP, b = bars[i];
        const h = j >= 0 && j < ENV.sb.length ? ENV.hotel[j] : 0, s = j >= 0 && j < ENV.sb.length ? ENV.sb[j] : 0;
        const lv = Math.max(h, s), sb = s > h;
        if (lv !== b.lv) { b.n.style.transform = `scaleY(${Math.max(0.08, lv / 99).toFixed(3)})`; b.lv = lv; }
        if (sb !== b.sb) { b.n.classList.toggle('hk-sb', sb); b.sb = sb; }
      }
      for (const rw of rows) {
        const on = t >= rw.at;
        if (on !== rw.on) { rw.n.style.display = on ? '' : 'none'; rw.on = on; }
        if (!on) continue;
        rw.n.style.opacity = outCubic(seg(t, rw.at, rw.at + 0.25)).toFixed(3);
        for (const w of rw.words) {
          const o = seg(t, w.at - 0.02, w.at - 0.02 + WORD_IN).toFixed(3);
          if (o !== w.op) { w.w.style.opacity = o; w.op = o; }
        }
      }
  } };
}

// the lead card of 'hacker-hello-pc': the user's screen, shared live, a plain browser on it. Superbot takes over (the
// pink and purple vignette turning round the screen's edge and the pill rising, as computer.ba3976b6.js draws them),
// glides the cursor to the search box and clicks, types the query, presses Enter, the video results come in, the
// cursor opens the first and it plays (frames from a sprite, so a frozen frame is exact)
function pcCard(x, T) {
  const P = T.pc;
  const el = x.el(`<div class="bk hk-pc">
    <div class="bk-head"><span class="qc-tile hk-av">${MONITOR}</span><b class="bk-title">Your computer<small>Screen shared</small></b><span class="hk-st"><i class="hk-dot"></i><span>Live</span></span></div>
    <div class="hk-scr">
      <div class="hk-win">
        <div class="hk-tabs"><span class="hk-tab"><i class="hk-fav"></i><span class="hk-tt">New tab</span><span class="hk-tcl">${BROWSER.x}</span></span><span class="hk-tplus">+</span></div>
        <div class="hk-bar"><span class="hk-nav">${BROWSER.back}${BROWSER.fwd}${BROWSER.reload}</span><span class="hk-url">${BROWSER.search}<span class="hk-ut">Search or type a URL</span></span></div>
        <div class="hk-pg">
          <div class="hk-home"><b class="hk-logo">Search</b><span class="hk-box">${BROWSER.search}<span class="hk-q"></span><i class="hk-caret"></i></span></div>
          <div class="hk-res"><div class="hk-rh"><span class="hk-fc">All</span><span class="hk-fc on">Videos</span><span class="hk-fc">Images</span><span class="hk-rq"></span></div>
            <div class="hk-rg">${CATS.map((c) => `<div class="hk-th"><span class="hk-ti"><img src="${asset('img/hacker.7dfcf32a/' + c.img)}" width="480" height="270" alt="${x.esc(c.alt)}"/><b class="hk-dur">${c.dur}</b></span><span class="hk-tn">${x.esc(c.title)}</span><span class="hk-tm">${c.meta}</span></div>`).join('')}</div></div>
          <div class="hk-vp"><span class="hk-vid"><i class="hk-spr" role="img" aria-label="${x.esc(CATS[0].alt)}" style="background-image:url('${asset(SPRITE.src)}')"></i></span>
            <div class="hk-ctrl"><span class="hk-pp">${PAUSE}</span><span class="hk-prog"><i></i></span><b class="hk-vt">0:00 / ${CATS[0].dur}</b></div></div>
        </div>
      </div>
      <i class="hk-edge"><i class="hk-soft"><i class="hk-band"></i></i></i>
      <span class="hk-pill">${x.tile('superbot', 'hk-sbt')}<span>superbot is controlling your computer</span></span>
      <svg class="hk-cur" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
  </div>`);
  const $ = (q) => el.querySelector(q);
  const v = { tt: $('.hk-tt'), ut: $('.hk-ut'), url: $('.hk-url'), q: $('.hk-q'), caret: $('.hk-caret'), box: $('.hk-box'), home: $('.hk-home'),
    res: $('.hk-res'), rq: $('.hk-rq'), ths: [...el.querySelectorAll('.hk-th')], play: $('.hk-vp'), spr: $('.hk-spr'), prog: $('.hk-prog i'),
    vt: $('.hk-vt'), edge: $('.hk-edge'), soft: $('.hk-soft'), pill: $('.hk-pill'), cur: $('.hk-cur') };
  const shown = { tt: '', ut: '', q: -1, f: -1, vt: '' };
  const set = (k, n, text) => { if (shown[k] !== text) { n.textContent = text; shown[k] = text; } };
  const pcAnchor = anchor(x);
  return { el, anchor: pcAnchor, marks: [], render(t) {
    enter(el, t, T.c0);
    // the takeover: the vignette fades in, its gradient turning and gently breathing, and the pill rises
    const g = outCubic(seg(t, P.take, P.take + 0.55));
    v.edge.style.opacity = g.toFixed(3);
    v.edge.style.setProperty('--hk-a', `${((t * 60) % 360).toFixed(1)}deg`);
    v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
    const pi = outCubic(seg(t, P.take + 0.12, P.take + 0.57));
    v.pill.style.opacity = pi.toFixed(3);
    v.pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;
    // the cursor: to the search box and a click, to the first video and a click, then out of the way
    const at = t < P.ptr ? CUR.rest
      : t < P.ptr2 ? path(t, [{ t: P.ptr, ...CUR.rest }, { t: P.box, ...CUR.box }])
      : t < P.play + 0.15 ? path(t, [{ t: P.ptr2, ...CUR.box }, { t: P.hov2, ...CUR.thumb }])
      : path(t, [{ t: P.play + 0.15, ...CUR.thumb }, { t: P.play + 0.55, ...CUR.away }]);
    const k = 1 - 0.12 * Math.max(press(t, P.click), press(t, P.click2));
    // the arrow's tip is at (4, 2.5) of its 24-unit box, drawn 18px: (3, 1.9) px
    v.cur.style.transform = `translate(${(at.x - 3).toFixed(2)}px, ${(at.y - 1.9).toFixed(2)}px) scale(${k.toFixed(3)})`;
    // the search box: focused on the click, the query typing in, then Enter
    v.box.classList.toggle('hk-on', t >= P.click);
    const n = Math.round(QUERY.length * seg(t, P.type0, P.type1));
    if (n !== shown.q) { v.q.textContent = QUERY.slice(0, n); shown.q = n; }
    v.caret.style.opacity = t >= P.click && t < P.enter ? String(blink(t - P.click) ? 1 : 0) : '0';
    // the results replace the home page: the address bar and the tab take the search, each video lands in turn
    const r = outCubic(seg(t, P.enter, P.enter + 0.2));
    v.home.style.opacity = (1 - r).toFixed(3);
    v.res.style.opacity = r.toFixed(3);
    set('ut', v.ut, t >= P.enter ? QUERY : 'Search or type a URL');
    v.url.classList.toggle('hk-typed', t >= P.enter);
    set('tt', v.tt, t >= P.click2 + 0.1 ? CATS[0].title : t >= P.enter ? `${QUERY} - Search` : 'New tab');
    if (shown.rq !== 1) { v.rq.textContent = QUERY; shown.rq = 1; }
    v.ths.forEach((th, i) => {
      const c = outCubic(seg(t, P.enter + 0.08 + i * 0.05, P.enter + 0.3 + i * 0.05));
      th.style.opacity = c.toFixed(3);
      th.style.transform = c >= 1 ? 'none' : `translateY(${((1 - c) * 6).toFixed(2)}px)`;
    });
    // the first video under the cursor: its hover ring, the press, then the player opens over the page and plays
    const hv = seg(t, P.hov2 - 0.1, P.hov2) * (1 - seg(t, P.click2 + 0.1, P.click2 + 0.2));
    v.ths[0].style.boxShadow = hv > 0 ? `0 0 0 ${(2 * hv).toFixed(2)}px rgba(26,115,232,${(0.9 * hv).toFixed(3)})` : 'none';
    const o = outCubic(seg(t, P.click2 + 0.04, P.click2 + 0.28));
    v.play.style.opacity = o.toFixed(3);
    v.play.style.transform = o >= 1 ? 'none' : `scale(${lerp(0.94, 1, o).toFixed(4)})`;
    const f = Math.max(0, Math.min(SPRITE.n - 1, Math.floor((t - P.play) * SPRITE.fps)));
    if (f !== shown.f) {
      // the sheet is SPRITE.cols frames across and ROWS down, sized to cols x rows of the view: frame f's cell
      const rows = Math.ceil(SPRITE.n / SPRITE.cols), c = f % SPRITE.cols, r = Math.floor(f / SPRITE.cols);
      v.spr.style.backgroundPosition = `${(100 * c / (SPRITE.cols - 1)).toFixed(4)}% ${(100 * r / (rows - 1)).toFixed(4)}%`;
      shown.f = f;
    }
    const pt = Math.max(0, t - P.play);
    v.prog.style.transform = `scaleX(${Math.min(1, pt / VIDEO_LEN).toFixed(4)})`;
    set('vt', v.vt, `${clock(pt)} / ${CATS[0].dur}`);
  } };
}

// one beat per step list: its loop length past the first reply, and the beat the engine runs
function makeBeat(id, list, lead = 'call') {
  const LEN = plan(0, list, lead).end;
  const beat = {
    // `end` (the base route's end plus `extra`) is LEN past r by construction, so the beat keeps its own clock
    times(r) { return plan(r, list, lead); },
    build(k, x) {
      loadSheet();
      loadFrameSheet();
      const T = k.T;
      // the spot's edit reads the voiceover's cues off the page (absolute spot seconds)
      (window.__HACKER_CUES ||= {})[id] = { ...T.cues, end: T.end, focus: T.focus };

      // 1. superbot's first answer: its line, then the lead card (the live call, or the shared screen)
      const say0 = sayEl(x, lead === 'pc' ? SAY_PC : SAY0);
      const lc = (lead === 'pc' ? pcCard : callCard)(x, T);

      // 2 on: each follow-up's bubble and its reply (the line it streams, then its card)
      const follow = [];
      const steps = T.steps.map((st) => {
        const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(st.ask)}</div></div></div>`);
        const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
        const say = sayEl(x, st.say);
        reply.lastElementChild.append(say.n);
        follow.push(u, reply);
        return { st, u, reply, say };
      });
      const cards = steps.map((p) => {
        const c = CARDS[p.st.kind](x, p.st, T);
        p.reply.lastElementChild.append(c.out);
        return c;
      });
      for (const p of steps) { p.anchor = anchor(x); p.reply.lastElementChild.append(p.anchor); }

      // 5. the end card and the fast-forward badge: they ride in nodes (so other variants hide them) and move to the scene
      // section on the first render, above the hub
      const endCard = x.el(`<div class="hk-end" role="img" aria-label="superbot.gg"><div class="hk-end-word"><b>superbot.gg</b></div><div class="hk-end-bot">${END_FACE(id)}</div></div>`);
      const endWord = endCard.querySelector('.hk-end-word'), endBot = endCard.querySelector('.hk-end-bot');
      const ff = x.el(`<div class="hk-ff" aria-hidden="true">x${X}</div>`);
      let endK = 1, placed = false, inited = false;
      const last = steps[steps.length - 1];

      return {
        nodes: [say0.n, lc.el, lc.anchor, ...follow, endCard, ff],
        // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
        marks: [[T.r, say0.n], [T.c0, lc.anchor], ...lc.marks,
          ...steps.flatMap((p) => [[p.st.send, p.u], [p.st.r, p.say.n], [p.st.card, p.anchor]]),
          [T.mcp, last.anchor]],
        asks: T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send })),
        render(t) {
          if (!placed) {
            // the follow-ups leave the engine's reply for the feed, in order right after it
            let at = say0.n.closest('.msg');
            for (const m of follow) { at.after(m); at = m; }
            x.hub.closest('.scene').append(endCard, ff);
            placed = true;
          }
          if (!inited) { inited = true; for (const c of cards) c.init(); }

          // 1. the line, then the lead card
          say0.render(t, T.r);
          lc.render(t);

          // 2 on: bubble and reply line, as the engine draws its own, then each answer card
          for (const p of steps) {
            x.appear(p.u, t, p.st.send);
            x.appear(p.reply, t, p.st.r);
            p.say.render(t, p.st.r);
          }
          let gen = 0;
          for (const c of cards) gen = Math.max(gen, c.render(t));
          fade(ff, gen);

          // 5. the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
          const cover = seg(t, T.cut, T.cut + END_IN);
          endCard.style.opacity = cover.toFixed(3);
          endCard.style.visibility = cover > 0 ? '' : 'hidden';
          if (cover > 0) {
            const tc = t - (T.cut + END_DELAY);
            const W = endCard.clientWidth, H = endCard.clientHeight;
            const natW = endWord.offsetWidth / endK;
            const kk = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
            if (kk !== endK) { endCard.style.setProperty('--k', kk.toFixed(4)); endK = kk; }
            const w = 220 * kk, wordW = natW * kk, gap = END_GAP * kk;
            const left = (W - (wordW + gap + w)) / 2, midY = H / 2;
            const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
            endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
            endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
            endWord.style.opacity = shift.toFixed(3);
            endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
            endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
          }
        },
      };
    },
  };
  return { LEN, beat };
}

const HACKER = makeBeat(ID, STEPS);
export const LEN = HACKER.LEN;
export default HACKER.beat;
const HELLO = makeBeat('hacker-hello', HELLO_STEPS);
export const HELLO_LEN = HELLO.LEN;
export const hello = HELLO.beat;
const HELLO_PC = makeBeat('hacker-hello-pc', HELLO_PC_STEPS, 'pc');
export const HELLO_PC_LEN = HELLO_PC.LEN;
export const helloPc = HELLO_PC.beat;
