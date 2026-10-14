// Bakery-website beat (the 'bakery' variant): asked "Build me a website for my bakery", Gemini answers with a Canvas
// card. Its viewport streams the page's HTML while "Building website" counts to 100%, the Code / Preview toggle slides
// to Preview, the rendered one-page site lands section by section (sticky nav, hero photo sharpening out of a blur,
// headline and order buttons, today's bakes, hours and address), the page scrolls down to the menu and hours, and the
// nav's Order button presses. Squeezed into the window the Gemini beat leaves (times(r, end)) so every variant loops
// the same length. The scene is a pure function of t. Its stylesheet (../bakery.005f5570.css) loads with the module.
// Hero: a CC0 photo from Wikimedia Commons (img/bakery.005f5570/CREDITS.txt); the bakery, menu and address are made up.
import { lerp, seg, outCubic, inOutCubic, streamCount, press } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';

const SAY = "Here's a one-page site for your bakery, with your menu, hours and a pickup order button.";
const CSS = new URL('../bakery.005f5570.css?v=1', import.meta.url).href;
const SCROLL = 150; // page height (30 nav + 370 sections, fixed in the stylesheet) minus the 250px viewport
// the HTML Gemini writes, streamed into the Code tab; tokenized once so a partial line keeps its colours
const CODE = [
  '<header class="nav">',
  '  <b class="logo">Crumb &amp; Co.</b>',
  '  <a href="#order">Order</a>',
  '</header>',
  '<section class="hero">',
  '  <h1>Baked at 5 a.m. Gone by noon.</h1>',
  '  <a class="cta">Order for pickup</a>',
  '</section>',
  '<section id="menu">',
  "  <h2>Today's bakes</h2>",
  '  <li>Butter croissant <b>$4.50</b></li>',
  '  <li>Country sourdough <b>$9</b></li>',
  '</section>',
  '<section id="hours">',
  '  <p>Tue to Fri, 7am to 6pm</p>',
];
const TOKEN = /(<\/?[\w-]+)|(\s[\w-]+=)|("[^"]*")|(\/?>)|([^<>"]+|.)/g;
const KINDS = ['tg', 'at', 'st', 'tg', 'tx'];
let at = 0;
const LINES = CODE.map((line) => {
  const toks = [...line.matchAll(TOKEN)].map((m) => {
    const tok = { s: m[0], k: KINDS[m.slice(1).findIndex(Boolean)], at };
    at += tok.s.length;
    return tok;
  });
  const row = { toks, at: toks.length ? toks[0].at : at, end: at };
  at += 1; // the newline
  return row;
});
const CHARS = at;
const MENU = [['Butter croissant', '$4.50'], ['Pain au chocolat', '$5'], ['Country sourdough', '$9'], ['Seeded rye', '$8'], ['Cinnamon bun', '$5'], ['Lemon tart', '$6']];
const HOURS = [['Tue to Fri', '7am to 6pm'], ['Sat, Sun', '8am to 3pm'], ['Mon', 'Closed']];

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`bakery variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

export default {
  // `end` is the base route's end (chat.9b47fc30.js routeBy), so the loop never changes length with the variant
  times(r, end = r + 2.35) {
    const T = { r };
    T.card = r + 0.22;
    T.c0 = r + 0.3; T.c1 = T.c0 + 0.7;
    T.flip = T.c1 + 0.04;
    T.s0 = T.flip + 0.5; T.s1 = T.s0 + 0.5;
    T.tap = T.s1 + 0.05;
    T.end = end;
    return T;
  },
  build(k, x) {
    loadSheet();
    const T = k.T;
    const code = LINES.map((l, i) => `<div class="bk-ln"><u>${i + 1}</u>${l.toks.map((tok) => `<span class="t-${tok.k}"></span>`).join('')}</div>`).join('');
    const menu = MENU.map(([n, p]) => `<li><span>${x.esc(n)}</span><i></i><b>${x.esc(p)}</b></li>`).join('');
    const hours = HOURS.map(([d, h]) => `<p><span>${x.esc(d)}</span><b>${x.esc(h)}</b></p>`).join('');
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="bk">
      <div class="bk-card">
        <div class="bk-bar">
          <b>Crumb &amp; Co. website</b>
          <span class="bk-tabs"><i class="bk-pill"></i><span class="bk-tab">Code</span><span class="bk-tab">Preview</span></span>
        </div>
        <div class="bk-view">
          <div class="bk-site">
            <div class="bk-page">
              <div class="bk-s bk-hero">
                <img class="bk-pic" src="${x.img('bakery.005f5570/hero.jpg')}" width="800" height="450" alt="Fresh butter croissants on a baking tray" fetchpriority="high"/>
                <div class="bk-copy">
                  <h1>Baked at 5 a.m.<br/>Gone by noon.</h1>
                  <p>Sourdough, croissants and cakes on Elm Street.</p>
                  <span class="bk-ctas"><span class="bk-cta">Order for pickup</span><span class="bk-ghost">See the menu</span></span>
                </div>
              </div>
              <div class="bk-s bk-menu"><h2>Today's bakes</h2><ul>${menu}</ul></div>
              <div class="bk-s bk-info">
                <div><h3>Hours</h3>${hours}</div>
                <div><h3>Visit us</h3><p>214 Elm Street</p><p>Pickup at the side door</p><p>Cakes: order 2 days ahead</p></div>
              </div>
            </div>
            <div class="bk-s bk-nav"><b class="bk-logo">Crumb &amp; Co.</b><span>Menu</span><span>Hours</span><span>Visit</span><span class="bk-order">Order</span></div>
          </div>
          <div class="bk-code">${code}</div>
          <i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Building website<b class="qc-genn"></b></span>
        </div>
      </div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const pic = $('.bk-pic'), page = $('.bk-page'), codeEl = $('.bk-code'), pill = $('.bk-pill'), order = $('.bk-order');
    const [codeTab, viewTab] = block.querySelectorAll('.bk-tab');
    // reveal order: nav, hero, menu, hours and address
    const secs = ['.bk-nav', '.bk-hero', '.bk-menu', '.bk-info'].map((s) => $(s));
    const copy = $('.bk-copy');
    const rows = [...block.querySelectorAll('.bk-ln')];
    const spans = rows.map((r) => [...r.querySelectorAll('span')]);
    const gen = $('.qc-gen'), genl = $('.qc-genl'), count = $('.qc-genn');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1, pct = -1, typed = -1, tab = null, decoding = false;

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        // a frozen frame waits on the hero; decode() only works once the nodes have left the template's inert
        // document, which they have by the first render
        if (!decoding) {
          decoding = true;
          track(pic.decode().catch((e) => console.error(new Error(`bakery hero failed to decode: ${pic.src}`, { cause: e }))));
        }
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;

        // building: the HTML streams in line by line under the shimmer while the counter climbs
        const cp = seg(t, T.c0, T.c1);
        const p = Math.floor(cp * 100);
        if (p !== pct) { count.textContent = `${p}%`; pct = p; }
        const c = Math.floor(cp * CHARS);
        if (c !== typed) {
          LINES.forEach((l, i) => {
            l.toks.forEach((tok, j) => { spans[i][j].textContent = tok.s.slice(0, Math.max(0, c - tok.at)); });
            rows[i].classList.toggle('cur', c >= l.at && c <= l.end && cp < 1);
          });
          typed = c;
        }
        gen.style.transform = `translateX(${lerp(-100, 100, ((t - T.card) * 1.3) % 1).toFixed(1)}%)`;
        gen.style.opacity = (1 - seg(t, T.c1 - 0.2, T.flip)).toFixed(3);
        genl.style.opacity = (1 - seg(t, T.c1 - 0.15, T.flip)).toFixed(3);

        // the toggle slides to Preview and the code pane gives way to the rendered page
        const fp = inOutCubic(seg(t, T.flip - 0.08, T.flip + 0.16));
        pill.style.transform = `translateX(${(fp * 56).toFixed(2)}px)`;
        const onView = fp >= 0.5;
        if (onView !== tab) { codeTab.classList.toggle('on', !onView); viewTab.classList.toggle('on', onView); tab = onView; }
        codeEl.style.opacity = (1 - seg(t, T.flip - 0.02, T.flip + 0.1)).toFixed(3);
        secs.forEach((s, i) => {
          const a = outCubic(seg(t, T.flip + i * 0.07, T.flip + i * 0.07 + 0.32));
          s.style.opacity = a.toFixed(3);
          s.style.transform = a >= 1 ? 'none' : `translateY(${((1 - a) * 8).toFixed(2)}px)`;
        });
        const hp = outCubic(seg(t, T.flip + 0.07, T.flip + 0.55));
        pic.style.filter = hp >= 1 ? 'none' : `blur(${lerp(10, 0, hp).toFixed(2)}px) saturate(${lerp(0.7, 1, hp).toFixed(3)})`;
        pic.style.transform = `scale(${lerp(1.1, 1, hp).toFixed(4)})`;
        const tp = outCubic(seg(t, T.flip + 0.16, T.flip + 0.46));
        copy.style.opacity = tp.toFixed(3);
        copy.style.transform = tp >= 1 ? 'none' : `translateY(${((1 - tp) * 6).toFixed(2)}px)`;

        // the page scrolls under the sticky nav to the menu and hours, then the nav's Order button presses
        const sp = inOutCubic(seg(t, T.s0, T.s1));
        page.style.transform = `translateY(${(-sp * SCROLL).toFixed(2)}px)`;
        const pr = press(t, T.tap);
        order.style.transform = `scale(${(1 - 0.08 * pr).toFixed(4)})`;
        order.style.boxShadow = `0 0 0 ${(3 * pr).toFixed(2)}px rgba(181, 101, 43, ${(0.35 * pr).toFixed(3)})`;
      },
    };
  },
};
