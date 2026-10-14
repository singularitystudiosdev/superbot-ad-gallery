// The roadtrip variant's art: Gemini answers 'Plan a road trip from LA to SF on a map' with a Google-Maps-style route card.
// The left panel is a real map: the coastline is Natural Earth land (public domain), clipped to lon -123.3..-117.6 and lat
// 33.5..38.3 and simplified to under 200 points, and the route is the real US-101 / CA-1 coastal drive as routed by OSRM,
// simplified to under 250 points. Both are [lon, lat] and are projected here (equirectangular, x scaled by cos 36 degrees).
// The right column is the three-day itinerary. paint(p) is a pure function of build progress: the basemap settles from
// faint to full, the blue route draws itself from Los Angeles to San Francisco, each stop pops and names itself as the
// head passes it, and each day's row comes in as the drive reaches it.
import { lerp, seg, outCubic, inOutCubic } from '../../../lib.9b47fc30.js';

const MW = 232, MH = 244;                 // the map panel, in card px (the card is 360 x 244)
const BB = { w: -123.3, n: 38.3, e: -117.6 };
const KX = Math.cos((36 * Math.PI) / 180);
const SC = Math.min(MW / ((BB.e - BB.w) * KX), 50.8); // px per degree of latitude
const OY = 1;                              // top inset that centres the box vertically
const mx = (lon) => +((lon - BB.w) * KX * SC).toFixed(2);
const my = (lat) => +(OY + (BB.n - lat) * SC).toFixed(2);

// Natural Earth ne_10m_land (public domain), clipped to the box and simplified: the mainland, then the Channel Islands
const LAND = [
  [[-117.777,33.529],[-117.979,33.636],[-118.153,33.759],[-118.207,33.764],[-118.193,33.732],[-118.222,33.771],[-118.277,33.757],[-118.272,33.715],[-118.291,33.703],[-118.412,33.742],[-118.428,33.774],[-118.391,33.836],[-118.445,33.949],[-118.544,34.039],[-118.748,34.032],[-118.807,33.999],[-118.853,34.034],[-119.129,34.101],[-119.217,34.146],[-119.281,34.269],[-119.563,34.415],[-119.678,34.414],[-119.708,34.395],[-119.788,34.417],[-119.879,34.407],[-120.01,34.461],[-120.133,34.473],[-120.454,34.443],[-120.51,34.521],[-120.637,34.563],[-120.648,34.586],[-120.603,34.705],[-120.64,34.759],[-120.616,34.858],[-120.673,34.908],[-120.634,35.035],[-120.645,35.139],[-120.706,35.174],[-120.75,35.177],[-120.766,35.16],[-120.877,35.224],[-120.896,35.274],[-120.862,35.362],[-120.856,35.322],[-120.831,35.336],[-120.887,35.433],[-121.005,35.461],[-121.169,35.637],[-121.288,35.665],[-121.337,35.787],[-121.463,35.887],[-121.507,36.003],[-121.567,36.02],[-121.678,36.163],[-121.825,36.239],[-121.9,36.304],[-121.904,36.385],[-121.957,36.518],[-121.928,36.524],[-121.933,36.555],[-121.981,36.584],[-121.938,36.639],[-121.87,36.607],[-121.827,36.656],[-121.805,36.738],[-121.764,36.722],[-121.803,36.75],[-121.804,36.836],[-121.906,36.969],[-121.937,36.978],[-122.047,36.948],[-122.135,36.966],[-122.222,37.024],[-122.298,37.111],[-122.339,37.119],[-122.404,37.195],[-122.418,37.252],[-122.4,37.36],[-122.449,37.477],[-122.479,37.503],[-122.499,37.493],[-122.52,37.531],[-122.495,37.665],[-122.515,37.781],[-122.476,37.811],[-122.409,37.81],[-122.355,37.73],[-122.392,37.71],[-122.384,37.631],[-122.354,37.614],[-122.374,37.604],[-122.251,37.568],[-122.199,37.535],[-122.207,37.517],[-122.134,37.498],[-122.1,37.455],[-122.059,37.447],[-122.032,37.463],[-122.062,37.502],[-122.109,37.518],[-122.192,37.7],[-122.252,37.723],[-122.262,37.743],[-122.212,37.743],[-122.217,37.758],[-122.332,37.782],[-122.341,37.807],[-122.296,37.831],[-122.314,37.886],[-122.329,37.908],[-122.391,37.908],[-122.43,37.964],[-122.398,37.956],[-122.36,37.988],[-122.366,38.012],[-122.299,38.011],[-122.227,38.058],[-122.148,38.024],[-122.004,38.056],[-121.69,38.009],[-121.721,38.032],[-121.682,38.048],[-121.671,38.084],[-121.607,38.099],[-121.577,38.074],[-121.621,38.062],[-121.613,38.021],[-121.584,38.029],[-121.569,38.066],[-121.445,38.004],[-121.604,38.106],[-121.68,38.093],[-121.699,38.051],[-121.742,38.029],[-121.779,38.036],[-121.78,38.061],[-121.717,38.093],[-121.683,38.147],[-121.803,38.063],[-121.846,38.073],[-121.898,38.053],[-121.929,38.058],[-121.908,38.079],[-121.971,38.075],[-122.015,38.099],[-121.986,38.111],[-122,38.137],[-122.055,38.134],[-122.13,38.042],[-122.261,38.069],[-122.397,38.153],[-122.434,38.123],[-122.502,38.114],[-122.482,38.077],[-122.506,38.017],[-122.445,37.985],[-122.493,37.97],[-122.48,37.942],[-122.503,37.925],[-122.439,37.882],[-122.459,37.862],[-122.499,37.894],[-122.47,37.832],[-122.528,37.816],[-122.645,37.899],[-122.728,37.903],[-122.821,37.998],[-122.921,38.035],[-122.92,38.065],[-122.948,38.061],[-122.936,38.031],[-122.979,38.015],[-122.963,37.992],[-123.027,37.994],[-122.95,38.144],[-122.996,38.243],[-122.826,38.072],[-123.002,38.295],[-123.065,38.3],[-117.6,38.3],[-117.6,33.5],[-117.749,33.5]],
  [[-119.56,33.994],[-119.817,33.959],[-119.933,34.06],[-119.759,34.056],[-119.633,34.014],[-119.565,34.055],[-119.521,34.034]],
  [[-120.034,33.99],[-119.98,33.983],[-119.969,33.941],[-120.11,33.893],[-120.249,34.001],[-120.044,34.037]],
  [[-120.311,34.034],[-120.36,34.015],[-120.449,34.036],[-120.369,34.076]],
];
// OSRM driving route LA > Malibu > Santa Barbara > San Luis Obispo > Big Sur > Monterey > Santa Cruz > Half Moon Bay > SF
const ROUTE = [
  [-118.244,34.052],[-118.247,34.05],[-118.256,34.057],[-118.275,34.039],[-118.285,34.037],[-118.361,34.034],[-118.379,34.037],[-118.395,34.029],
  [-118.441,34.03],[-118.474,34.023],[-118.495,34.011],[-118.541,34.039],[-118.57,34.042],[-118.61,34.037],[-118.665,34.04],[-118.685,34.034],
  [-118.742,34.033],[-118.796,34.021],[-118.809,34.022],[-118.821,34.016],[-118.853,34.036],[-118.925,34.047],[-118.939,34.045],[-118.978,34.061],
  [-119.007,34.066],[-119.036,34.084],[-119.061,34.087],[-119.08,34.101],[-119.081,34.111],[-119.104,34.141],[-119.141,34.164],[-119.141,34.224],
  [-119.168,34.228],[-119.18,34.239],[-119.235,34.265],[-119.255,34.259],[-119.275,34.271],[-119.334,34.29],[-119.364,34.317],[-119.39,34.322],
  [-119.429,34.354],[-119.443,34.357],[-119.458,34.373],[-119.478,34.377],[-119.517,34.401],[-119.546,34.407],[-119.561,34.416],[-119.601,34.421],
  [-119.658,34.423],[-119.69,34.419],[-119.696,34.423],[-119.701,34.412],[-119.72,34.426],[-119.742,34.43],[-119.76,34.442],[-119.772,34.468],
  [-119.778,34.471],[-119.769,34.477],[-119.772,34.482],[-119.781,34.484],[-119.783,34.49],[-119.792,34.487],[-119.802,34.502],[-119.823,34.51],
  [-119.837,34.528],[-119.858,34.534],[-119.867,34.542],[-119.908,34.55],[-119.92,34.561],[-119.952,34.568],[-119.957,34.573],[-119.995,34.585],
  [-120.031,34.589],[-120.111,34.666],[-120.125,34.669],[-120.141,34.682],[-120.155,34.681],[-120.173,34.708],[-120.264,34.738],[-120.298,34.759],
  [-120.317,34.783],[-120.337,34.795],[-120.348,34.816],[-120.417,34.89],[-120.417,34.956],[-120.439,35.003],[-120.463,35.017],[-120.555,35.107],
  [-120.636,35.14],[-120.686,35.164],[-120.696,35.174],[-120.701,35.184],[-120.696,35.215],[-120.674,35.258],[-120.668,35.282],[-120.662,35.288],
  [-120.659,35.283],[-120.679,35.306],[-120.696,35.319],[-120.714,35.32],[-120.733,35.331],[-120.753,35.334],[-120.777,35.353],[-120.852,35.374],
  [-120.863,35.399],[-120.901,35.452],[-120.943,35.451],[-120.989,35.474],[-121.005,35.494],[-121.072,35.551],[-121.074,35.565],[-121.092,35.563],
  [-121.11,35.571],[-121.127,35.598],[-121.166,35.636],[-121.205,35.652],[-121.243,35.654],[-121.278,35.67],[-121.287,35.691],[-121.304,35.703],
  [-121.315,35.727],[-121.312,35.752],[-121.321,35.76],[-121.33,35.782],[-121.35,35.804],[-121.361,35.809],[-121.359,35.816],[-121.366,35.812],
  [-121.401,35.84],[-121.413,35.856],[-121.432,35.864],[-121.46,35.887],[-121.469,35.935],[-121.501,36],[-121.539,36.019],[-121.571,36.024],
  [-121.59,36.049],[-121.592,36.066],[-121.606,36.072],[-121.617,36.087],[-121.631,36.121],[-121.678,36.168],[-121.698,36.177],[-121.711,36.197],
  [-121.75,36.215],[-121.795,36.264],[-121.876,36.3],[-121.891,36.316],[-121.894,36.327],[-121.885,36.333],[-121.903,36.357],[-121.899,36.365],
  [-121.905,36.374],[-121.9,36.385],[-121.904,36.398],[-121.915,36.41],[-121.912,36.424],[-121.926,36.449],[-121.925,36.46],[-121.935,36.473],
  [-121.938,36.513],[-121.908,36.542],[-121.913,36.573],[-121.894,36.593],[-121.896,36.6],[-121.88,36.592],[-121.868,36.595],[-121.86,36.609],
  [-121.816,36.647],[-121.808,36.692],[-121.791,36.723],[-121.766,36.753],[-121.765,36.77],[-121.781,36.783],[-121.786,36.818],[-121.771,36.831],
  [-121.774,36.894],[-121.792,36.922],[-121.839,36.942],[-121.872,36.97],[-121.887,36.975],[-121.937,36.984],[-121.953,36.972],[-121.958,36.978],
  [-121.965,36.978],[-121.964,36.984],[-122.022,36.991],[-122.05,36.961],[-122.095,36.961],[-122.125,36.971],[-122.177,36.998],[-122.225,37.034],
  [-122.321,37.14],[-122.349,37.15],[-122.365,37.175],[-122.391,37.185],[-122.399,37.195],[-122.418,37.242],[-122.405,37.287],[-122.403,37.319],
  [-122.391,37.331],[-122.397,37.358],[-122.405,37.366],[-122.406,37.387],[-122.419,37.4],[-122.426,37.422],[-122.43,37.468],[-122.385,37.492],
  [-122.378,37.493],[-122.371,37.486],[-122.37,37.495],[-122.357,37.5],[-122.358,37.507],[-122.35,37.512],[-122.367,37.542],[-122.428,37.605],
  [-122.424,37.616],[-122.429,37.628],[-122.404,37.635],[-122.406,37.656],[-122.388,37.678],[-122.408,37.738],[-122.403,37.752],[-122.405,37.767],
  [-122.422,37.771],[-122.419,37.775],
];

// the six stops: [name, lat, lon, label dx, label dy, label anchor]
const STOPS = [
  ['Los Angeles', 34.0522, -118.2437, 14, 12, 'end'],
  ['Santa Barbara', 34.4208, -119.6982, -7, 2, 'end'],
  ['San Luis Obispo', 35.2828, -120.6596, -7, 2, 'end'],
  ['Big Sur', 36.3715, -121.9017, -7, 2, 'end'],
  ['Monterey', 36.6002, -121.8947, 7, 2, 'start'],
  ['San Francisco', 37.7749, -122.4194, 9, -2, 'start'],
];
// the three days, from the route's own legs (OSRM distance and duration, rounded): the stop each begins at
const DAYS = [
  { from: 0, title: 'LA to Santa Barbara', mi: 100, mins: 135, see: 'Malibu, El Matador Beach' },
  { from: 1, title: 'Santa Barbara to Big Sur', mi: 213, mins: 285, see: 'Morro Rock, Piedras Blancas, McWay Falls' },
  { from: 3, title: 'Big Sur to San Francisco', mi: 140, mins: 195, see: 'Bixby Bridge, 17-Mile Drive, Golden Gate' },
];
const hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} m`;
const TOTAL = { mi: DAYS.reduce((s, d) => s + d.mi, 0), mins: DAYS.reduce((s, d) => s + d.mins, 0) };

const A = 0.04, B = 0.76;       // the route draws between these build progresses
const POP = 0.18, FADE = 0.24;   // seconds: a stop pops, its name fades in
const SLIDE = 4;                // px a day row slides in from

const CSS = `
#s-tabs .sbsite .hub .qc-rt { width: 360px; aspect-ratio: 360 / 244; background: #ffffff; font-family: var(--ui); }
#s-tabs .sbsite .hub .qc-rt .rt-map { position: absolute; left: 0; top: 0; width: ${MW}px; height: 100%; display: block; }
#s-tabs .sbsite .hub .qc-rt .rt-map text { font-family: var(--ui); font-size: 6.2px; font-weight: 500; fill: #5f6368; paint-order: stroke; stroke: #ffffff; stroke-width: 2px; stroke-linejoin: round; }
#s-tabs .sbsite .hub .qc-rt .rt-map .rt-sea { font-weight: 500; stroke: none; fill: #5f6368; }
#s-tabs .sbsite .hub .qc-rt .qc-gen { mix-blend-mode: multiply; }
#s-tabs .sbsite .hub .qc-rt .rt-col { position: absolute; left: ${MW}px; top: 0; right: 0; bottom: 0; box-sizing: border-box; padding: 12px 8px 8px 8px; display: flex; flex-direction: column; gap: 4px; background: #ffffff; box-shadow: inset 1px 0 0 #f1efe8; }
#s-tabs .sbsite .hub .qc-rt .rt-h { display: flex; flex-direction: column; gap: 4px; padding: 0 0 8px 8px; box-shadow: inset 0 -1px 0 #f1efe8; }
#s-tabs .sbsite .hub .qc-rt .rt-ht { font: 600 7px/9px var(--ui); color: #1f1f1f; }
#s-tabs .sbsite .hub .qc-rt .rt-c { display: flex; gap: 4px; flex-wrap: wrap; }
#s-tabs .sbsite .hub .qc-rt .rt-c i { font: 500 6.2px/12px var(--ui); font-style: normal; height: 12px; padding: 0 4px; border-radius: 999px; background: #f1efe8; color: #1f1f1f; font-variant-numeric: tabular-nums; white-space: nowrap; }
#s-tabs .sbsite .hub .qc-rt .rt-d { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 0 0 0 8px; }
#s-tabs .sbsite .hub .qc-rt .rt-bar { position: absolute; left: 0; top: 4px; bottom: 4px; width: 2px; border-radius: 999px; background: #1a73e8; opacity: 0; }
#s-tabs .sbsite .hub .qc-rt .rt-dl { display: flex; align-items: center; gap: 4px; }
#s-tabs .sbsite .hub .qc-rt .rt-dn { font: 500 6.2px/12px var(--ui); color: #5f6368; margin-right: 4px; }
#s-tabs .sbsite .hub .qc-rt .rt-dt { font: 600 7px/9px var(--ui); color: #1f1f1f; }
#s-tabs .sbsite .hub .qc-rt .rt-ds { font: 500 6.2px/8px var(--ui); color: #5f6368; }
`;

function injectCss() {
  if (document.getElementById('qc-rt-css')) return;
  const s = document.createElement('style');
  s.id = 'qc-rt-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const poly = (pts) => `M${pts.map((p) => `${mx(p[0])} ${my(p[1])}`).join('L')}Z`;
const RPTS = ROUTE.map((p) => [mx(p[0]), my(p[1])]);
const ROUTE_D = `M${RPTS.map((p) => p.join(' ')).join('L')}`;
// each stop's position, and how far along the route (0..1, by length) its nearest route vertex lies
const cum = RPTS.reduce((a, p, i) => { a.push(i ? a[i - 1] + Math.hypot(p[0] - RPTS[i - 1][0], p[1] - RPTS[i - 1][1]) : 0); return a; }, []);
const LEN = cum[cum.length - 1];
const PLACE = STOPS.map(([name, lat, lon]) => {
  const x = mx(lon), y = my(lat);
  let bi = 0, bd = 1e9;
  RPTS.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; bi = i; } });
  return { name, x: RPTS[bi][0], y: RPTS[bi][1], f: cum[bi] / LEN };
});
// the build progress at which the eased route head reaches fraction f
const eased = (p) => inOutCubic(seg(p, A, B));
function reach(f) {
  if (f <= 0) return A;
  if (f >= 1) return B;
  let lo = A, hi = B;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (eased(m) < f) lo = m; else hi = m; }
  return hi;
}
const AT = PLACE.map((s) => reach(s.f));

const PIN = 'M0 0L-4.02 -7.97A4.5 4.5 0 1 1 4.02 -7.97Z';

function mapSvg() {
  const land = LAND.map((r) => `<path d="${poly(r)}" fill="#f1efe8"/>`).join('');
  const stops = PLACE.map((s, i) => (i === PLACE.length - 1
    ? `<g class="rt-pin" transform="translate(${s.x} ${s.y}) scale(0)"><path d="${PIN}" fill="#1a73e8"/><circle cx="0" cy="-10" r="1.6" fill="#ffffff"/></g>`
    : `<g class="rt-dot" transform="translate(${s.x} ${s.y}) scale(0)"><circle r="3.2" fill="#ffffff" stroke="#1a73e8" stroke-width="1.5"/></g>`)).join('');
  const labels = STOPS.map((s, i) => `<text class="rt-name" x="${PLACE[i].x + s[3]}" y="${PLACE[i].y + s[4]}" text-anchor="${s[5]}" opacity="0">${s[0]}</text>`).join('');
  return `<svg class="rt-map" viewBox="0 0 ${MW} ${MH}" role="img" aria-label="Map of the coastal drive from Los Angeles to San Francisco">
<g class="rt-base" opacity=".4"><rect width="${MW}" height="${MH}" fill="#aad3f2"/>${land}</g>
<text class="rt-sea" x="8" y="130" opacity="0">Pacific Ocean</text>
<path class="rt-case" d="${ROUTE_D}" pathLength="1" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="1" opacity="0"/>
<path class="rt-line" d="${ROUTE_D}" pathLength="1" fill="none" stroke="#1a73e8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="1" opacity="0"/>
${stops}${labels}
</svg>`;
}

function colHtml() {
  const rows = DAYS.map((d, i) => `<div class="rt-d" style="opacity:0"><i class="rt-bar"></i><div class="rt-dl"><span class="rt-dn">Day ${i + 1}</span><div class="rt-c"><i>${d.mi} mi</i><i>${hm(d.mins)}</i></div></div><div class="rt-dt">${d.title}</div><div class="rt-ds">${d.see}</div></div>`).join('');
  return `<div class="rt-col"><div class="rt-h"><div class="rt-ht">LA to SF via Highway 1</div><div class="rt-c"><i>${TOTAL.mi} mi</i><i>${hm(TOTAL.mins)}</i></div></div>${rows}</div>`;
}

export function makeRoadtrip(x) {
  injectCss();
  const node = x.el(`<div class="qc-img qc-rt">${mapSvg()}${colHtml()}<i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Planning route<b class="qc-genn">0/${PLACE.length}</b></span></div>`);
  const gen = node.querySelector('.qc-gen'), pill = node.querySelector('.qc-genl'), cnt = node.querySelector('.qc-genn');
  const base = node.querySelector('.rt-base'), sea = node.querySelector('.rt-sea');
  const line = node.querySelector('.rt-line'), cas = node.querySelector('.rt-case');
  const marks = [...node.querySelectorAll('.rt-dot, .rt-pin')];
  const names = [...node.querySelectorAll('.rt-name')];
  const rows = [...node.querySelectorAll('.rt-d')].map((el) => ({ el, bar: el.querySelector('.rt-bar') }));
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastKey = '', lastCnt = -1;

  function paint(p, D, t) {
    const op = (el, v) => el.setAttribute('opacity', v.toFixed(3));
    const bm = outCubic(seg(p, 0, 0.25));
    op(base, lerp(0.4, 1, bm));
    op(sea, outCubic(seg(p, 0.1, 0.3)));
    const e = eased(p);
    for (const el of [line, cas]) {
      op(el, e > 0 ? 1 : 0);
      el.setAttribute('stroke-dashoffset', (1 - e).toFixed(4));
      el.setAttribute('stroke-dasharray', e >= 1 ? 'none' : '1 1');
    }
    let n = 0;
    PLACE.forEach((s, i) => {
      const k = seg(p, AT[i], AT[i] + POP / D);
      if (k > 0) n++;
      const sc = outCubic(k);
      marks[i].setAttribute('transform', `translate(${s.x} ${s.y}) scale(${sc.toFixed(4)})`);
      op(names[i], outCubic(seg(p, AT[i] + 0.04 / D, AT[i] + (0.04 + FADE) / D)));
    });
    DAYS.forEach((d, i) => {
      const a = AT[d.from], r = rows[i];
      const k = outCubic(seg(p, a, a + FADE / D));
      r.el.style.opacity = k.toFixed(3);
      r.el.style.transform = k >= 1 ? 'none' : `translateY(${((1 - k) * SLIDE).toFixed(2)}px)`;
      const nextA = i + 1 < DAYS.length ? AT[DAYS[i + 1].from] : B;
      r.bar.style.opacity = (k * (1 - seg(p, nextA, nextA + FADE / D))).toFixed(3);
    });
    if (n !== lastCnt) { cnt.textContent = `${n}/${PLACE.length}`; lastCnt = n; }
    gen.style.transform = `translateX(${lerp(-110, 110, (((t * 0.9) % 1) + 1) % 1).toFixed(1)}%)`;
    gen.style.opacity = (p >= 1 ? 0 : 1 - seg(p, 0.8, 1)).toFixed(3);
  }

  return {
    node,
    render(t, T, label) {
      const D = T.w1 - T.w0;
      // reduced motion: no draw-on, the finished card the moment the build window opens
      const p = still.matches ? (t >= T.w0 ? 1 : 0) : seg(t, T.w0, T.w1);
      const key = `${p}|${p < 1 ? t.toFixed(2) : ''}`;
      if (key !== lastKey) { paint(p, D, t); lastKey = key; }
      pill.style.opacity = label;
    },
  };
}
