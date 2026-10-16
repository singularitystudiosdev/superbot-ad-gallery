// The lawn variant's art: Maps (in superbot) answers 'Add a garden in my front lawn visually, address is Raleigh,
// North Carolina, USA' with a Google-Maps-style card. The card is the ask's three beats: Maps opens on the address
// (a stylised Streets view of Raleigh, drawn here as SVG, no API key and no embed), the camera flies from the whole
// metro down to a residential street, a red pin drops on the house and a small place card names the city, then the
// view hands over to the photograph of the house's front lawn the way tapping a pin opens its photo, and a before/
// after wipe sweeps across it so the plain lawn turns into the planted garden. Every value is a pure function of t
// in the beat's window, so a frozen frame (?t=) renders identically to a live one.
//
// The two photographs are img/lawn.f5e1d276/{before,after}.jpg: a sourced CC0 house photo, and a model edit of that
// same photograph by which the garden is planted, so the wipe reads as one lawn changing. The edit is a full
// regeneration of the frame, not a garden drawn or composited onto the photo's own pixels (see
// img/lawn.f5e1d276/CREDITS.txt for the model, prompt and the framing measurements that hold the two together). The
// card is the inner 400x250 panel that goes inside the reply's artifact frame (gemini.9b47fc30.js .bk-fit); the frame,
// its title and its Open in Maps pill belong to the wiring, not here.
import { seg, lerp, outCubic, inOutCubic, outBack, clamp } from '../../../lib.9b47fc30.js';
import { landing, shimmer, settle } from './thumb-land.309eb9c5.js';

// Where the card's Open in Maps pill and the reply link point: the address the ask names, as a Maps search URL
// (developers.google.com/maps/documentation/urls/get-started), never a keyed Embed API call.
export const MAPS_QUERY = 'https://www.google.com/maps/search/?api=1&query=Raleigh%2C+North+Carolina';
export const LM_OPEN_IN_MAPS = MAPS_QUERY;

const CW = 400, CH = 250;    // the card's natural size, which is exactly the artifact frame's .bk-fit
const WW = 1200, WH = 750;   // the map's own drawing space: a 3x2 tile of the metro, zoomed into at the fly-to
// the world point the camera settles on (the house's block) and the three camera stops
const HOME = { x: 706, y: 428 };
const CAM = [
  { p: 0.00, s: 0.335, x: 604, y: 372 },        // the whole metro: both beltways, the lake and the river in frame
  { p: 0.26, s: 0.620, x: 662, y: 404 },        // the north west districts and the street grid resolve
  { p: 0.50, s: 1.000, x: HOME.x, y: HOME.y },  // street level: the pin's block fills the card
];
const ADDRESS = 'Raleigh, North Carolina, USA';
const TYPE0 = 0.05, TYPE1 = 0.45;    // the address types into the search pill across these
const PIN0 = 0.50, PIN1 = 0.66;      // the pin drops
const CARD0 = 0.62, CARD1 = 0.74;    // the place card rises
const HAND0 = 0.70, HAND1 = 0.82;    // the map hands over to the photograph
const WIPE0 = 0.80, WIPE1 = 0.96;    // the before/after wipe sweeps
const SUN0 = 0.94, SUN1 = 1.00;      // a warm sun wash crosses the beds as the garden settles
const CHIPS = ['Directions', 'Save', 'Nearby', 'Send to phone'];

const CSS = `
#s-tabs .sbsite .hub .qc-lm { width: ${CW}px; aspect-ratio: ${CW} / ${CH}; background: #f1efe8; }
#s-tabs .sbsite .hub .qc-lm .lm-stage { position: absolute; inset: 0; overflow: hidden; }
#s-tabs .sbsite .hub .qc-lm .lm-body { position: absolute; inset: 0; }
#s-tabs .sbsite .hub .qc-lm .lm-map { position: absolute; inset: 0; background: #f1efe8; will-change: transform, opacity; }
#s-tabs .sbsite .hub .qc-lm .lm-svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
#s-tabs .sbsite .hub .qc-lm .lm-svg text { font-family: var(--ui); font-weight: 500; fill: #5f6368; paint-order: stroke; stroke: #ffffff; stroke-width: 2.4px; stroke-linejoin: round; }
#s-tabs .sbsite .hub .qc-lm .lm-svg .lm-city { font-weight: 600; fill: #3c4043; }
#s-tabs .sbsite .hub .qc-lm .lm-svg .lm-hw { font-weight: 600; fill: #8a6a12; }
#s-tabs .sbsite .hub .qc-lm .lm-svg .lm-water { font-weight: 500; fill: #3f6f9c; stroke: none; }
/* the search pill: white, rounded, with Maps' magnifier, typing the address as a Maps search does. It stays on
   top of the photograph once the pin opens, exactly as Maps' search bar does */
#s-tabs .sbsite .hub .qc-lm .lm-search { position: absolute; left: 10px; top: 10px; right: 10px; z-index: 3; display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 10px; border-radius: 17px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,.22), 0 0 0 1px rgba(0,0,0,.04); overflow: hidden; }
#s-tabs .sbsite .hub .qc-lm .lm-glyph { flex: none; width: 15px; height: 15px; fill: none; stroke: #5f6368; stroke-width: 2; stroke-linecap: round; }
#s-tabs .sbsite .hub .qc-lm .lm-q { font: 500 12px/1 var(--ui); color: #3c4043; white-space: nowrap; }
#s-tabs .sbsite .hub .qc-lm .lm-caret { flex: none; width: 1.5px; height: 13px; background: #3c4043; }
#s-tabs .sbsite .hub .qc-lm .lm-chips { position: absolute; left: 10px; top: 52px; z-index: 2; display: flex; gap: 5px; }
#s-tabs .sbsite .hub .qc-lm .lm-chip { height: 22px; padding: 0 9px; border-radius: 11px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.05); font: 500 9.5px/22px var(--ui); color: #3c4043; white-space: nowrap; }
/* the pin, its soft ground shadow and the once-only pulse ring */
#s-tabs .sbsite .hub .qc-lm .lm-pin { position: absolute; left: 0; top: 0; z-index: 2; width: 0; height: 0; }
#s-tabs .sbsite .hub .qc-lm .lm-pin svg { position: absolute; left: 0; top: 0; display: block; overflow: visible; }
#s-tabs .sbsite .hub .qc-lm .lm-pshade { position: absolute; width: 46px; height: 14px; margin: -7px 0 0 -23px; border-radius: 50%; background: radial-gradient(closest-side, rgba(24,20,16,.45), rgba(24,20,16,0)); }
#s-tabs .sbsite .hub .qc-lm .lm-pulse { position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; box-shadow: 0 0 0 2px rgba(234,67,53,.55); }
/* the place card Maps shows for a dropped pin */
#s-tabs .sbsite .hub .qc-lm .lm-place { position: absolute; left: 10px; bottom: 10px; z-index: 2; width: 152px; padding: 8px 10px 9px; border-radius: 10px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,.24), 0 0 0 1px rgba(0,0,0,.05); }
#s-tabs .sbsite .hub .qc-lm .lm-pt { font: 600 11.5px/14px var(--ui); color: #202124; }
#s-tabs .sbsite .hub .qc-lm .lm-ps { margin-top: 2px; font: 500 10px/13px var(--ui); color: #5f6368; }
#s-tabs .sbsite .hub .qc-lm .lm-pr { display: flex; gap: 4px; margin-top: 7px; }
#s-tabs .sbsite .hub .qc-lm .lm-pr i { width: 24px; height: 20px; border-radius: 6px; background: #f1f3f4; box-shadow: inset 0 0 0 1px #e8eaed; }
/* the photograph the pin opens onto: the lawn, and the garden wipe over it */
#s-tabs .sbsite .hub .qc-lm .lm-photo { position: absolute; inset: 0; z-index: 1; background: #101010; }
#s-tabs .sbsite .hub .qc-lm .lm-photo img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
#s-tabs .sbsite .hub .qc-lm .lm-wipe { position: absolute; inset: 0; will-change: clip-path; }
#s-tabs .sbsite .hub .qc-lm .lm-div { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: #ffffff; box-shadow: 0 0 3px rgba(0,0,0,.45); }
#s-tabs .sbsite .hub .qc-lm .lm-knob { position: absolute; top: 50%; width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,.4); display: grid; place-items: center; }
#s-tabs .sbsite .hub .qc-lm .lm-knob svg { width: 17px; height: 17px; fill: none; stroke: #3c4043; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round; }
/* the tag rides the address chips row (top 52, 22px tall, as .lm-chip) and not the pill's band: .lm-search is 34px tall
   from top 10 at z-index 3 over .lm-photo, so a tag inside the pill's rows would be painted over and its word never read.
   The row's own chips are gone by the time the wipe starts (they fade with the map handover), so both tags read alone
   across the whole wipe */
#s-tabs .sbsite .hub .qc-lm .lm-tag { position: absolute; top: 52px; height: 22px; padding: 0 8px; border-radius: 11px; background: rgba(12,12,14,.62); font: 600 9.5px/22px var(--ui); color: #ffffff; letter-spacing: .02em; }
#s-tabs .sbsite .hub .qc-lm .lm-t-after { left: 10px; }
#s-tabs .sbsite .hub .qc-lm .lm-t-before { right: 10px; }
/* the warm sun wash: it rides inside .lm-photo, after the two photographs and before the divider, the handle and the
   tags, so it washes the ground the ask planted rather than the pin, the place card, the chips or the before/after
   divider. It is opaque-only through mix-blend-mode, so it must not be above chrome whose text it would tint */
#s-tabs .sbsite .hub .qc-lm .lm-wash { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(255,214,140,0) 30%, rgba(255,222,158,.34) 50%, rgba(255,214,140,0) 70%); mix-blend-mode: soft-light; opacity: 0; }
/* in the reply's artifact frame the card fills its 400x250 .bk-fit, so the map's own tile is the frame's tile */
#s-tabs .sbsite .hub .bk-fit > .qc-lm { width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; box-shadow: none; }
`;

function injectCss() {
  if (document.getElementById('qc-lm-css')) return;
  const s = document.createElement('style');
  s.id = 'qc-lm-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// --- the map -------------------------------------------------------------------------------------
// Public street and place names only (Fayetteville St, Hillsborough St, Glenwood Ave, Capital Blvd, Western Blvd,
// I-40, I-440, Pullen Park, the Neuse River, Falls Lake): street names are facts, and no business is invented.
// Land, water, park, blocks and the two beltways are stylised to Google's own Streets palette.
const PAL = { land: '#f1efe8', water: '#aad3f2', park: '#c6e8bf', block: '#e8eaed', block2: '#e2e4e7', minor: '#ffffff', minorCase: '#e0e2e5', arterialCase: '#dfe1e5', hw: '#fbbc04', hwCase: '#f6dd93',
  // the metro tier's own tones (wideFabric): the street grid above is a sub pixel shimmer at the far stop, so the far
  // stop needs streets that survive the downscale
  wideRoad: '#d7dae0', wideRoad2: '#c8ccd5', fabric: '#e1e4e9', fabric2: '#e9ebef' };

const way = (pts) => `M${pts.map((p) => `${p[0]} ${p[1]}`).join('L')}`;
// a road: its casing under a white core, and no hard black outline anywhere
function road(pts, w) {
  const d = way(pts);
  return `<path d="${d}" fill="none" stroke="${PAL.minorCase}" stroke-width="${(w + 1.4).toFixed(2)}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${PAL.minor}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function blockRow(x, y, w, h, n, seed) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const bw = w / n - 3, bh = h - 3;
    const jx = ((Math.sin(i * 12.9 + seed) + 1) / 2) * 1.6;
    out += `<rect x="${(x + i * (w / n) + 1.4 + jx).toFixed(1)}" y="${(y + 1.6).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.4" fill="${PAL.block}"/>`;
  }
  return out;
}

// --- the metro tier ----------------------------------------------------------------------------------------------
// At the far stop the camera scale is 0.335, so the whole 1200x750 world sits inside the 400x250 card: a 2.6 world px
// arterial is 0.87 card px and the grid above dissolves into a shimmer, which left the metro reading as pale land
// under the beltways. This is the density a map has at that zoom: town blocks parted by white streets, laid over the
// whole metro, plus the arterials that carry across it. Both halves ride .lm-wide groups that paint() takes to zero
// before the camera reaches the districts, so the mid tier and the street tier are exactly the map they were.
let wideSeq = 0;
function wideFabric() {
  const id = `qc-lm-w${++wideSeq}`;
  const patch = (x, y, w, h, layer) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}${layer})"/>`;
  const blocks = patch(0, 0, WW, WH, 'b') +
    patch(372, 246, 330, 340, 'a') + patch(700, 186, 320, 300, 'a') + patch(520, 540, 360, 180, 'a');
  const routes = [
    [[-30, 168], [220, 208], [440, 200], [650, 236], [860, 216], [1040, 236]],
    [[-30, 292], [230, 322], [470, 306], [700, 352], [950, 330], [1070, 344]],
    [[-30, 466], [200, 496], [430, 476], [650, 520], [880, 560], [1040, 604]],
    [[-30, 616], [240, 640], [490, 606], [760, 648], [1010, 630], [1140, 648]],
    [[148, -30], [204, 176], [188, 392], [232, 560], [208, 782]],
    [[388, -30], [424, 158], [406, 330], [452, 520], [430, 782]],
    [[636, -30], [664, 150], [700, 356], [676, 560], [702, 782]],
    [[876, -30], [860, 168], [902, 340], [884, 520], [922, 700]],
    [[-30, 58], [300, 28], [700, 58], [1010, 30], [1050, 44]],
    [[330, 246], [520, 330], [700, 402], [880, 470], [1046, 556]],
    [[-30, 700], [300, 688], [640, 720], [900, 698], [1120, 716]],
    [[516, 128], [700, 200], [860, 298], [986, 428]],
    [[236, 616], [420, 542], [620, 470], [806, 418]],
  ].map((pts) => `<path d="${way(pts)}" fill="none" stroke="${PAL.wideRoad}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const majors = [
    [[-30, 344], [300, 302], [664, 252], [1000, 182], [1058, 162]],
    [[200, -30], [300, 300], [360, 620], [344, 782]],
    [[-30, 560], [300, 600], [660, 662], [980, 700], [1080, 716]],
  ].map((pts) => `<path d="${way(pts)}" fill="none" stroke="${PAL.wideRoad2}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const defs = `<defs>
    <pattern id="${id}a" width="30" height="26" patternUnits="userSpaceOnUse"><rect width="30" height="26" fill="#ffffff"/><rect x="3" y="3" width="24" height="20" fill="${PAL.fabric}"/></pattern>
    <pattern id="${id}b" width="54" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-11)"><rect width="54" height="44" fill="#ffffff"/><rect x="4" y="4" width="46" height="36" fill="${PAL.fabric2}"/></pattern>
  </defs>`;
  return { blocks: `${defs}${blocks}`, roads: `${routes}${majors}` };
}

function mapSvg() {
  const wide = wideFabric();
  // the street grid of the residential quarter: arterials cross the whole world, the locals only where the camera
  // actually reaches, the way a map's detail appears as you zoom in
  const arterialV = [300, 470, 640, 810, 980].map((x) => road([[x, 0], [x + 14, WH]], 2.6));
  const arterialH = [180, 330, 470, 610, 720].map((y) => road([[0, y], [WW, y - 8]], 2.6));
  let locals = '';
  for (let i = 0; i < 11; i++) { const x = 560 + i * 26; locals += road([[x, 330], [x + 5, 560]], 1.5); }
  for (let j = 0; j < 8; j++) { const y = 352 + j * 26; locals += road([[560, y], [850, y + 4]], 1.5); }
  let blocks = '';
  for (let j = 0; j < 7; j++) blocks += blockRow(566, 338 + j * 26, 274, 22, 10, j * 3.1);
  for (let j = 0; j < 4; j++) blocks += blockRow(120, 350 + j * 34, 150, 28, 5, 40 + j * 2.3);
  for (let j = 0; j < 3; j++) blocks += blockRow(900, 470 + j * 34, 150, 28, 5, 70 + j * 4.1);
  // the built up area seen from away: streets and blocks at the metro scale, so the wide stop reads as a
  // city and not as empty land. Each patch is a small street grid, which is what a map shows from there.
  let sprawl = '';
  for (let i = 0; i < 190; i++) {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 43758.5453;
    const px = 250 + (a - Math.floor(a)) * 850;
    const py = 120 + (b - Math.floor(b)) * 560;
    const w = 9 + ((a * 7) % 1) * 22, h = 7 + ((b * 11) % 1) * 15;
    // the noise lands negative a little over half the time: an invalid side is not rendered, so the rect was never on
    // the map either way - dropping it draws the same map and keeps the console clean (a live parse reports each one)
    if (w <= 0 || h <= 0) continue;
    sprawl += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${PAL.block}" opacity=".9"/>`;
  }
  // six developed patches, each a grid of blocks between thin white streets, at the scale the wide stop sees
  let patches = '';
  const PATCH = [[330, 250, 190, 130], [900, 160, 210, 150], [1020, 380, 170, 190], [300, 520, 210, 150], [640, 150, 170, 120], [980, 600, 200, 130]];
  PATCH.forEach(([px, py, pw, ph], n) => {
    const cols = 6, rows = 4;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const jx = ((Math.sin((n * 31 + c * 7 + r * 3) * 12.9) + 1) / 2) * 2.2;
      patches += `<rect x="${(px + c * (pw / cols) + 2 + jx).toFixed(1)}" y="${(py + r * (ph / rows) + 2).toFixed(1)}" width="${(pw / cols - 5).toFixed(1)}" height="${(ph / rows - 5).toFixed(1)}" rx="1.2" fill="${PAL.block}"/>`;
    }
  });
  const radials = [[[-40, 250], [WW + 40, 190]], [[-40, 430], [WW + 40, 350]], [[180, -30], [260, WH + 30]],
    [[520, -30], [560, WH + 30]], [[900, -30], [860, WH + 30]], [[-40, 660], [WW + 40, 700]],
    [[-40, 100], [WW + 40, 60]], [[-40, 540], [WW + 40, 620]], [[80, -30], [30, WH + 30]],
    [[380, -30], [430, WH + 30]], [[700, -30], [660, WH + 30]], [[1080, -30], [1130, WH + 30]],
    [[-40, 340], [WW + 40, 520]], [[-40, 720], [WW + 40, 160]]]
    .map((pts) => road(pts, 1.9)).join('');
  // the town centres the sprawl hangs off, so the metro stop carries its outlying names
  const towns =
    `<circle cx="742" cy="470" r="3.4" fill="#3c4043" stroke="#ffffff" stroke-width="1.4"/>` +
    [[430, 700], [866, 92], [1012, 430], [352, 262], [1090, 640]].map(([tx, ty]) =>
      `<circle cx="${tx}" cy="${ty}" r="2.2" fill="#5f6368" stroke="#ffffff" stroke-width="1.1"/>`).join('');
  const belt = way([[700, 60], [880, 96], [1000, 210], [1016, 380], [940, 540], [790, 610], [620, 600], [500, 520], [466, 380], [500, 220], [600, 110], [700, 60]]);
  // I-540, the outer beltline: a second, wider arc to the north east of I-440, as Raleigh's two loops sit
  const outer = way([[-40, 300], [200, 120], [520, 30], [860, 20], [1060, 150], [1140, 330], [1120, 540], [1020, 700], [900, WH + 20]]);
  const i40 = way([[-20, 560], [180, 580], [360, 640], [560, 700], [780, 736], [1020, 748], [WW + 20, 742]]);
  const highways =
    `<path d="${outer}" fill="none" stroke="${PAL.hwCase}" stroke-width="7.4" stroke-linejoin="round"/>` +
    `<path d="${outer}" fill="none" stroke="${PAL.hw}" stroke-width="4.6" stroke-linejoin="round"/>` +
    `<path d="${belt}" fill="none" stroke="${PAL.hwCase}" stroke-width="7.4" stroke-linejoin="round"/>` +
    `<path d="${belt}" fill="none" stroke="${PAL.hw}" stroke-width="4.6" stroke-linejoin="round"/>` +
    `<path d="${i40}" fill="none" stroke="${PAL.hwCase}" stroke-width="7.4" stroke-linejoin="round"/>` +
    `<path d="${i40}" fill="none" stroke="${PAL.hw}" stroke-width="4.6" stroke-linejoin="round"/>`;
  const water =
    `<path d="${way([[1060, -20], [1120, 120], [1080, 300], [1150, 470], [1110, 640], [1170, 780], [1260, 780], [1180, 560], [1230, 380], [1170, 190], [1210, -20]])}Z" fill="${PAL.water}"/>` +
    `<ellipse cx="140" cy="70" rx="190" ry="70" fill="${PAL.water}"/>` +
    `<path d="${way([[880, 470], [960, 500], [1040, 560], [1120, 590], [1140, 566], [1050, 528], [960, 470], [890, 448]])}Z" fill="${PAL.water}"/>`;
  const park =
    `<path d="${way([[596, 470], [664, 452], [700, 486], [692, 548], [624, 566], [586, 526]])}Z" fill="${PAL.park}"/>` +
    `<ellipse cx="330" cy="640" rx="96" ry="58" fill="${PAL.park}"/>`;
  const labels = `
<g class="lm-far">
  <text class="lm-city" x="626" y="286" font-size="34" text-anchor="middle">Raleigh</text>
  <text x="646" y="316" font-size="19" text-anchor="middle">North Carolina</text>
  <text x="430" y="736" font-size="24" text-anchor="middle">Cary</text>
  <text x="900" y="74" font-size="24" text-anchor="middle">Wake Forest</text>
  <text x="1060" y="470" font-size="24" text-anchor="middle">Knightdale</text>
  <text class="lm-hw" x="1000" y="80" font-size="17">I-540</text>
</g>
<g class="lm-mid">
  <text x="760" y="404" font-size="22" text-anchor="middle">Five Points</text>
  <text x="596" y="470" font-size="20" text-anchor="middle">Boylan Heights</text>
  <text x="812" y="284" font-size="22" text-anchor="middle">Mordecai</text>
  <text x="742" y="560" font-size="22" text-anchor="middle">Downtown</text>
</g>
<g class="lm-near">
  <text x="628" y="336" font-size="8.4">Hillsborough St</text>
  <text x="700" y="376" font-size="8.4">Glenwood Ave</text>
  <text x="700" y="470" font-size="8.4" transform="rotate(90 700 470)">Fayetteville St</text>
  <text x="700" y="96" font-size="8.4">Capital Blvd</text>
  <text x="474" y="700" font-size="8.4">Western Blvd</text>
  <text class="lm-hw" x="700" y="44" font-size="9" text-anchor="middle">I-440</text>
  <text class="lm-hw" x="960" y="754" font-size="9" text-anchor="middle">I-40</text>
  <text x="646" y="516" font-size="8">Pullen Park</text>
  <text class="lm-water" x="1128" y="300" font-size="9.5" transform="rotate(72 1128 300)">Neuse River</text>
  <text class="lm-water" x="120" y="58" font-size="9.5">Falls Lake</text>
</g>`;
  return `<svg class="lm-svg" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Google Maps open on Raleigh, North Carolina">
<rect width="${CW}" height="${CH}" fill="${PAL.land}"/>
<g class="lm-world">
  <rect x="0" y="0" width="${WW}" height="${WH}" fill="${PAL.land}"/>
  <rect x="118" y="336" width="156" height="172" fill="${PAL.block2}" opacity=".55"/>
  <rect x="896" y="456" width="158" height="140" fill="${PAL.block2}" opacity=".55"/>
  <g class="lm-wide">${wide.blocks}</g>
  ${water}${park}${sprawl}${patches}${radials}${towns}${blocks}${highways}
  <g class="lm-wide">${wide.roads}</g>
  ${arterialV.join('')}${arterialH.join('')}${locals}
  ${labels}
</g>
</svg>`;
}

// the pin, drawn once (Google's teardrop), and the arrow glyph on the wipe's handle
const PIN = '<svg width="30" height="40" viewBox="-15 -40 30 40" aria-hidden="true"><path d="M0 0c-1.2-1.4-9.6-11-9.6-18.4A9.6 9.6 0 0 1 9.6-18.4C9.6-11 1.2-1.4 0 0Z" fill="#ea4335"/><circle cx="0" cy="-18.4" r="3.6" fill="#7a2018"/></svg>';
const KNOB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 7 4.5 12l5 5M14.5 7l5 5-5 5"/></svg>';

export function makeLawn(x) {
  injectCss();
  // The card's shell: the build pill, which the artifact frame takes out of it at build time (gemini.9b47fc30.js), and
  // nothing else. mountChat calls this builder once per route the beat carries and appends every route's nodes, so a map
  // built here would be built on each of those routes whether or not the lawn variant ever shows. The art waits for
  // mountCard() below, which runs the first time this variant shows, as the 3D viewer is built on its variant's first
  // show and the 10-image reveals build on theirs.
  const node = x.el(`<div class="qc-img qc-lm">
<span class="qc-genl">${x.tile('superbot')}Adding the garden<b class="qc-genn">0%</b></span>
</div>`);
  const pill = node.querySelector('.qc-genl'), pct = node.querySelector('.qc-genn');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let body, sk, map, world, far, mid, near, wide, search, q, caret, chips, pin, psvg, pulse, pshade, place, photo, wipe, div, knob, tAfter, tBefore, wash;
  let mounted = false, lastKey = '', lastPc = -1, typed = -1;

  // The whole card, behind a null guard: the map SVG with its block fabric, streets, water, parks, beltways, labels and
  // street names, the pin with its pulse and ground shadow, the search pill, the photographs and the wipe. It is
  // synchronous, and render() mounts it before painting anything, so the first frame the lawn variant draws is the frame
  // it drew when the card was built eagerly: no blank frame and no flash.
  function mountCard() {
    if (mounted) return;
    node.prepend(x.el(`<div class="lm-stage qc-skel">
  <div class="lm-body" style="opacity:0">
    <div class="lm-map" style="opacity:0">${mapSvg()}</div>
    <div class="lm-photo" style="opacity:0">
      <img class="lm-before" src="${x.img('lawn.f5e1d276/before.jpg')}" width="1200" height="900" alt="This house and its plain front lawn"/>
      <div class="lm-wipe" style="clip-path:inset(0 100% 0 0)"><img class="lm-after" src="${x.img('lawn.f5e1d276/after.jpg')}" width="1200" height="900" alt="The same front lawn planted with garden beds"/></div>
      <i class="lm-wash"></i><i class="lm-div"></i><span class="lm-knob">${KNOB}</span>
      <span class="lm-tag lm-t-after">After</span><span class="lm-tag lm-t-before">Before</span>
    </div>
    <div class="lm-search" style="opacity:0"><svg class="lm-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><span class="lm-q"></span><i class="lm-caret"></i></div>
    <div class="lm-chips" style="opacity:0">${CHIPS.map((c) => `<span class="lm-chip">${x.esc(c)}</span>`).join('')}</div>
    <div class="lm-pin" style="opacity:0"><div class="lm-pulse" style="opacity:0"></div><div class="lm-pshade" style="opacity:0"></div>${PIN}</div>
    <div class="lm-place" style="opacity:0"><div class="lm-pt">Your address</div><div class="lm-ps">Raleigh, North Carolina</div><div class="lm-pr"><i></i><i></i><i></i></div></div>
  </div>
  <i class="qc-sk"></i>
</div>`));
    body = node.querySelector('.lm-body'); sk = node.querySelector('.qc-sk');
    map = node.querySelector('.lm-map'); world = node.querySelector('.lm-world');
    far = node.querySelector('.lm-far'); mid = node.querySelector('.lm-mid'); near = node.querySelector('.lm-near');
    wide = node.querySelectorAll('.lm-wide');
    search = node.querySelector('.lm-search'); q = node.querySelector('.lm-q'); caret = node.querySelector('.lm-caret');
    chips = node.querySelector('.lm-chips');
    pin = node.querySelector('.lm-pin'); psvg = pin.querySelector('svg');
    pulse = node.querySelector('.lm-pulse'); pshade = node.querySelector('.lm-pshade');
    place = node.querySelector('.lm-place');
    photo = node.querySelector('.lm-photo');
    wipe = node.querySelector('.lm-wipe'); div = node.querySelector('.lm-div'); knob = node.querySelector('.lm-knob');
    tAfter = node.querySelector('.lm-t-after'); tBefore = node.querySelector('.lm-t-before');
    wash = node.querySelector('.lm-wash');
    mounted = true;
  }

  // The Before tag's own box, in the card's px, read once from its computed style: its width and its 10px inset from the
  // card's right edge (.lm-t-before, and .lm-tag's font: the box is 8px padding either side of the word). It cannot be
  // read with offsetLeft on the frame the card mounts: that resolves against a layout which has not settled there (341
  // reads as 107) while the computed width and right are already correct, and a frozen ?t= frame never repaints, so the
  // bad value would stick. Cached, because the card is a fixed 400x250 and the word never changes.
  let tagSpan = 0, tagLeft = 0;
  function measureBeforeTag() {
    const cs = getComputedStyle(tBefore);
    const tw = parseFloat(cs.width), right = parseFloat(cs.right);
    if (tw > 0 && isFinite(right)) { tagSpan = tw; tagLeft = CW - right - tw; }
  }
  // how much of the tag the wipe's edge has covered at progress w across the 1200px world: 0 while the edge is still left
  // of the tag, 1 once it has passed the tag's right edge. While the box is unknown the tag keeps its legible state.
  function tagCover(w) {
    if (!tagSpan) measureBeforeTag();
    return tagSpan > 0 ? clamp((w * CW - tagLeft) / tagSpan) : 0;
  }

  // the camera: the scale, and the translate that keeps the world point (x, y) centred in the card
  function camAt(p) {
    const e = inOutCubic(clamp(p / CAM[CAM.length - 1].p));
    let a = CAM[0], b = CAM[CAM.length - 1];
    for (let i = 1; i < CAM.length; i++) if (e <= CAM[i].p) { a = CAM[i - 1]; b = CAM[i]; break; }
    const k = inOutCubic(seg(e, a.p, b.p));
    const s = lerp(a.s, b.s, k);
    return { s, tx: CW / 2 - lerp(a.x, b.x, k) * s, ty: CH / 2 - lerp(a.y, b.y, k) * s };
  }

  function paint(p) {
    const pc = Math.round(p * 100);
    // 1. the map, zooming from the whole metro to the pin's block
    const cam = camAt(p);
    world.setAttribute('transform', `translate(${cam.tx.toFixed(2)} ${cam.ty.toFixed(2)}) scale(${cam.s.toFixed(4)})`);
    const zoom = clamp((cam.s - CAM[0].s) / (CAM[CAM.length - 1].s - CAM[0].s));
    far.setAttribute('opacity', (1 - seg(zoom, 0.42, 0.66)).toFixed(3));
    mid.setAttribute('opacity', (seg(zoom, 0.34, 0.54) * (1 - seg(zoom, 0.80, 0.97))).toFixed(3));
    near.setAttribute('opacity', seg(zoom, 0.72, 0.97).toFixed(3));
    // the metro fabric is gone before the camera reaches the districts (zoom 0.34), so the mid and street tiers keep
    // exactly the map they had
    const wv = (1 - seg(zoom, 0.10, 0.34)).toFixed(3);
    for (const g of wide) g.setAttribute('opacity', wv);
    // 2. the search pill typing the address, and the chips row once the pin has landed
    const n = Math.round(ADDRESS.length * clamp((p - TYPE0) / (TYPE1 - TYPE0)));
    if (n !== typed) { q.textContent = ADDRESS.slice(0, n); typed = n; }
    caret.style.display = p < TYPE1 ? '' : 'none';
    search.style.opacity = (0.35 + 0.65 * outCubic(seg(p, TYPE0 - 0.03, TYPE0 + 0.05))).toFixed(3);
    // 3. the pin: an outBack drop, its ground shadow growing under it, one pulse ring
    const k = outCubic(seg(p, PIN0, PIN1));
    const drop = p <= PIN0 ? 0 : outBack(seg(p, PIN0, PIN1));
    psvg.setAttribute('transform', `scale(${lerp(0.74, 1, k).toFixed(4)})`);
    pin.style.transform = `translate(${(CW / 2).toFixed(1)}px, ${(CH / 2 + 10 - 52 * (1 - drop)).toFixed(1)}px)`;
    pshade.style.opacity = (0.9 * k).toFixed(3);
    pshade.style.transform = `scale(${lerp(0.4, 1, k).toFixed(3)})`;
    const pu = seg(p, PIN0 + 0.10, PIN1 + 0.10);
    pulse.style.opacity = (pu <= 0 || pu >= 1 ? 0 : ((1 - pu) * 0.8).toFixed(3));
    pulse.style.transform = `scale(${lerp(0.35, 2.6, pu).toFixed(3)})`;
    // 4. the place card rises in
    const cr = outCubic(seg(p, CARD0, CARD1));
    place.style.opacity = cr.toFixed(3);
    place.style.transform = cr >= 1 ? 'none' : `translateY(${((1 - cr) * 12).toFixed(2)}px)`;
    // 5. the map hands over to the photograph, which lands as a thumbnail does
    const h = inOutCubic(seg(p, HAND0, HAND1));
    map.style.opacity = p <= HAND0 ? '1' : (1 - h).toFixed(3);
    map.style.transform = `scale(${lerp(1, 1.5, h).toFixed(4)})`;
    map.style.display = p >= HAND1 ? 'none' : '';
    chips.style.opacity = (outCubic(seg(p, PIN1 - 0.03, PIN1 + 0.05)) * (1 - h)).toFixed(3);
    pin.style.opacity = (p <= PIN0 ? 0 : 1 - h).toFixed(3);
    place.style.visibility = p >= HAND0 ? 'hidden' : '';
    const ph = outCubic(seg(p, HAND0, HAND1));
    photo.style.opacity = ph.toFixed(3);
    // 6. the before/after wipe: the garden is revealed from the left, the divider riding its edge.
    //    The clip keeps the strip LEFT of the edge, so the reveal runs left to right as the ask's
    //    "lawn becomes garden" reads. The After tag stays left of the edge, so it always sits over the garden;
    //    the Before tag is at the far right and the garden simply arrives under it, so its fade is the edge itself.
    const w = outCubic(seg(p, WIPE0, WIPE1));
    const edge = `${(100 * w).toFixed(2)}%`;
    wipe.style.clipPath = `inset(0 ${(100 - 100 * w).toFixed(2)}% 0 0)`;
    div.style.left = edge;
    knob.style.left = edge;
    const live = p > WIPE0 + 0.015 && p < WIPE1 + 0.03;
    div.style.opacity = knob.style.opacity = live ? '1' : '0';
    tAfter.style.opacity = p < WIPE1 + 0.03 ? '1' : '0';
    // the Before tag names the plain lawn, so it is opaque until the wipe's edge reaches its left edge and clear by the
    // time the edge passes its right edge: the fade is the edge crossing the tag's own box (measured in the 400x250
    // card's px, whatever the artifact frame scales the card to), at p 0.8757 to 0.9134 rather than at the times 0.90
    // and 0.96 that faded it while it was already over garden it does not name
    tBefore.style.opacity = p < WIPE1 + 0.03 ? (1 - tagCover(w)).toFixed(3) : '0';
    // 7. a warm sun wash crossing the beds as the garden settles
    const s = seg(p, SUN0, SUN1);
    wash.style.opacity = (s <= 0 || s >= 1 ? 0 : Math.sin(Math.PI * s) * 0.9).toFixed(3);
    wash.style.transform = `translateX(${lerp(-26, 26, s).toFixed(2)}%)`;
    if (pc !== lastPc) { pct.textContent = `${pc}%`; lastPc = pc; }
  }

  return {
    node,
    render(t, T, label) {
      // the first time this variant shows: build the card before it is drawn (no-op after that)
      mountCard();
      // the card shimmers as a skeleton until it lands; the ask's whole window drives the build
      const lp = still.matches ? (t >= T.w0 ? 1 : 0) : landing(t, T.w0);
      const p = still.matches ? lp : seg(t, T.w0, T.w1 + 1.2);
      const key = `${t.toFixed(3)}|${lp.toFixed(4)}|${label}`;
      if (key !== lastKey) {
        shimmer(sk, t, T.card, 0, lp);
        settle(body, lp);
        paint(p);
        if (still.matches) {
          // reduced motion: no fly-to, no wipe: the address already found, straight to the garden
          map.style.display = 'none';
          chips.style.display = 'none';
          pin.style.display = 'none';
          place.style.display = 'none';
          search.style.opacity = '1';
          q.textContent = ADDRESS;
          caret.style.display = 'none';
          photo.style.opacity = '1';
          wipe.style.clipPath = 'inset(0 0 0 0)';
          div.style.opacity = knob.style.opacity = '0';
          tAfter.style.opacity = tBefore.style.opacity = '0';
          wash.style.opacity = '0';
        }
        lastKey = key;
      }
      pill.style.opacity = label;
    },
  };
}
