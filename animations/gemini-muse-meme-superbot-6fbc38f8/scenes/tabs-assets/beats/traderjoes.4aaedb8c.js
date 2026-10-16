// Trader Joe's list beat (the 'traderjoes' variant): asked for a college-budget week of Trader Joe's food for a runner who
// lifts, superbot connects Trader Joe's, then Gemini answers with a line and an artifact card in the bakery variant's frame
// (bakery.005f5570.js: title, Share, Expand and, in Publish's place, a View on Trader Joe's link to the store, as the
// doordash variant's View in DoorDash). The card first shows the real traderjoes.com search page being browsed: the capture
// scrolls under a small address pill and the products that make the list are ringed in Trader Joe's red one after another,
// while a status pill counts "Picked N of <COUNT>". At T.g0 the page lands as the finished list the way the spending
// variant's chart does (beats/thumb-land.309eb9c5.js: a soft sweep, then over LAND seconds the page fades out and the list
// fades in as it settles from 1.08x): a row of pills (total, item count, protein a day) over two columns of borderless
// grocery groups, thumbnail, name, size, quantity and line price per row. Squeezed into the window the router leaves
// (times(r, end)); the scene is a pure function of t, with no pointer. Its stylesheet (../traderjoes.4aaedb8c.css) loads
// with the module. Every product, size, price, thumbnail and the page capture are real, read from traderjoes.com on
// 2026-10-15 and kept in ./traderjoes-data.4aaedb8c.js (sources and the protein arithmetic are documented there and in
// img/traderjoes.4aaedb8c/CREDITS.txt); this module only lays them out, so no figure here is typed in by hand.
import { lerp, seg, outCubic, inOutCubic, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the Share control every output card carries, in front of Expand
import { shareBtn } from './share.29a362ea.js';
import { STORE, LOGO, RED, SITE, GROUPS, TOTAL, COUNT, PROTEIN_PER_DAY } from './traderjoes-data.4aaedb8c.js';

const SAY = "Here's your Trader Joe's list for the week: quick meals, carbs for your runs, and protein at every meal.";
const CSS = new URL('../traderjoes.4aaedb8c.css?v=1', import.meta.url).href;
const VIEW = { w: 560, h: 350 }; // the bakery frame's view
const SCALE = VIEW.w / SITE.w; // the capture fitted to the view's width
const PAGE_H = SITE.h * SCALE; // its height at that scale
const MAX_SCROLL = PAGE_H - VIEW.h; // the camera's last stop: the page's end at the view's bottom
const PICK_AT = 300; // a picked row is ringed when its centre crosses this y in the view, clear of the status pill
const SEC = 0.97; // the last row is ringed just before the camera comes to rest
// the two columns: groups by name, so a renamed group fails loudly instead of silently dropping out
const COLS = [['Protein', 'Carbs'], ['Fruit', 'Veggies', 'Fuel & recovery']];

const usd = (n) => `$${n.toFixed(2)}`;
const group = (name) => {
  const g = GROUPS.find((x) => x.name === name);
  if (!g) throw new Error(`traderjoes variant: no group named ${name} in the data module`);
  return g;
};

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`traderjoes variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

export default {
  // `end` is the base route's end plus this variant's `extra` (chat.9b47fc30.js routeBy), which holds the finished list
  times(r, end = r + 2.35) {
    const T = { r };
    T.card = r + 0.22;
    T.a0 = r + 0.5; T.a1 = r + 2.0; // the camera's scroll down the page
    T.g0 = r + 2.3; // the list's landing time, after the last row is ringed
    T.end = end;
    return T;
  },
  build(k, x) {
    loadFrameSheet();
    loadSheet();
    const T = k.T;
    // the camera's offset down the page at t: ease in and out, blended halfway with linear so the rows stay legible mid-scroll
    const scrollAt = (t) => { const p = seg(t, T.a0, T.a1); return MAX_SCROLL * lerp(p, inOutCubic(p), 0.5); };
    // when each picked row is ringed: the first t at which the camera has brought its centre up to PICK_AT
    const picks = SITE.picks.map((p) => {
      const need = Math.min(((p.y + p.h / 2) * SCALE) - PICK_AT, MAX_SCROLL * SEC);
      let lo = T.a0, hi = T.a1;
      for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (scrollAt(mid) < need) lo = mid; else hi = mid; }
      return { ...p, at: hi };
    });
    const rings = picks.map((p) => `<span class="tj-pick" style="left:${(p.x * SCALE).toFixed(2)}px;top:${(p.y * SCALE).toFixed(2)}px;width:${(p.w * SCALE).toFixed(2)}px;height:${(p.h * SCALE).toFixed(2)}px"><i>${CHECK}</i></span>`).join('');
    const sections = COLS.map((names) => `<div class="tj-col">${names.map((n) => {
      const g = group(n);
      const rows = g.items.map((it) => `<li><img src="${x.img(it.img)}" width="96" height="96" alt=""><span class="tj-n">${x.esc(it.name)}</span><span class="tj-s">${x.esc(it.size)}</span><span class="tj-q">${it.qty > 1 ? `x${it.qty}` : ''}</span><b>${x.esc(usd(it.price * it.qty))}</b></li>`).join('');
      return `<section class="tj-g"><h3><i></i>${x.esc(g.name)}<small>${g.items.length}</small></h3><ul>${rows}</ul></section>`;
    }).join('')}</div>`).join('');
    const proteinPill = PROTEIN_PER_DAY == null ? '' : `<span class="tj-kpi"><b>${PROTEIN_PER_DAY}g+</b> protein a day</span>`;
    const srRows = GROUPS.flatMap((g) => g.items.map((it) => `<tr><th scope="row">${x.esc(it.name)}</th><td>${x.esc(g.name)}</td><td>${x.esc(it.size)}</td><td>${it.qty}</td><td>${x.esc(usd(it.price * it.qty))}</td></tr>`)).join('');
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="bk tj" style="--tj-red:${RED}">
      <div class="bk-head">
        <b class="bk-title">Trader Joe's week list<small>${COUNT} items, ${x.esc(usd(TOTAL))}</small></b>
        ${shareBtn("Trader Joe's week list")}
        ${EXPAND}
        <a class="bk-btn bk-publish tj-open" href="${STORE}" target="_blank" rel="noopener noreferrer">View on<img src="${x.img(LOGO)}" alt="Trader Joe's"></a>
      </div>
      <div class="bk-view">
        <div class="tj-list">
          <div class="tj-pills"><span class="tj-kpi tj-total"><b>${x.esc(usd(TOTAL))}</b> total</span><span class="tj-kpi"><b>${COUNT}</b> items</span>${proteinPill}</div>
          <div class="tj-cols">${sections}</div>
        </div>
        <div class="tj-site" aria-hidden="true">
          <div class="tj-cam"><img class="tj-shot" src="${x.img(SITE.shot)}" width="${SITE.w}" height="${SITE.h}" alt="">${rings}</div>
          <span class="tj-url">${x.esc(SITE.url)}</span>
          <span class="tj-count">Picked <b>0</b> of ${COUNT}</span>
        </div>
        <i class="bk-sh"></i>
        <table class="tj-sr"><caption>Trader Joe's week list: ${COUNT} items, ${x.esc(usd(TOTAL))}</caption>
          <tr><th scope="col">Item</th><th scope="col">Group</th><th scope="col">Size</th><th scope="col">Quantity</th><th scope="col">Price</th></tr>${srRows}</table>
      </div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const list = $('.tj-list'), site = $('.tj-site'), cam = $('.tj-cam'), sh = $('.bk-sh'), tally = $('.tj-count b');
    const ringEls = [...block.querySelectorAll('.tj-pick')];
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1, decoding = false, counted = -1;

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        // a frozen frame waits on the capture, the logo and the thumbnails; decode() only works once the nodes have left
        // the template's inert document, which they have by the first render
        if (!decoding) {
          decoding = true;
          for (const pic of block.querySelectorAll('img')) {
            track(pic.decode().catch((e) => console.error(new Error(`traderjoes image failed to decode: ${pic.src}`, { cause: e }))));
          }
        }
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;

        // phase A, browsing: the capture scrolls and each picked row is ringed as it passes; the status pill counts up
        // through the six rings and on to COUNT as the camera settles
        cam.style.transform = `translateY(${(-scrollAt(t)).toFixed(2)}px)`;
        let ringed = 0;
        ringEls.forEach((el, i) => {
          const f = outCubic(seg(t, picks[i].at, picks[i].at + 0.18));
          if (f > 0) ringed = i + 1;
          el.style.opacity = f.toFixed(3);
          el.firstElementChild.style.transform = `scale(${lerp(0.6, 1, f).toFixed(3)})`;
        });
        const c = Math.min(COUNT, Math.max(ringed, Math.floor(COUNT * seg(t, picks[0].at, T.g0 - 0.12))));
        if (c !== counted) { tally.textContent = String(c); counted = c; }

        // phase B, the list lands the way a climbing thumbnail does (thumb-land.309eb9c5.js): a soft sweep runs until
        // T.g0, then over LAND seconds the sweep and the page fade out while the list fades in and settles from 1.08x
        const p = landing(t, T.g0);
        shimmer(sh, t, T.card, 0, p);
        site.style.opacity = Math.max(0, 1 - 1.8 * p).toFixed(3); // the page is gone by 0.55 of the way, so the two never share a muddy middle
        settle(list, p);
      },
    };
  },
};
