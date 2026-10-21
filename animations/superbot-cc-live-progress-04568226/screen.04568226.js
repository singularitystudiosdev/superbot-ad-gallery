// The live view's screen: Chrome on a 1470x919 desktop, scaled whole into the view. Superbot opens one tab per travel
// site, types the search into the omnibox, reads the results with the screen's own cursor and rings the cheapest
// row. A pure function of t: paint(t) sets every opacity, width and transform.
import { ease, seg, outCubic, outBack, path, latest, blink, typed, esc, el, money, mv, RM } from './lib.04568226.js';
import { SITES, T } from './script.04568226.js';

export const DESK = { w: 1470, h: 919 };
const TAB_W = 216; // .sc-tab
const TABS_X = 88; // the strip's left padding, the lights and their margin
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const REST = { x: 930, y: 640 };
const OMNI = { x: 620, y: 62 };
const plusAt = (n) => ({ x: TABS_X + TAB_W * n + 8 + 14, y: 25 }); // the new-tab button with n tabs open
const priceAt = (i) => ({ x: 1362, y: 356 + 92 * i }); // a row's fare (.pg-main, .pg-rows, .pg-row)
const RADIO = { x: 51, y: 350 }; // Nonstop only (.pg-side)
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
};
const TITLES = { gf: 'Google Flights', kayak: 'KAYAK', sky: 'Skyscanner', expedia: 'Expedia', united: 'United Airlines' };
const NAV = { gf: ['Travel', 'Explore', 'Flights', 'Hotels'], kayak: ['Flights', 'Stays', 'Cars', 'Trips'], sky: ['Flights', 'Hotels', 'Car hire'], expedia: ['Stays', 'Flights', 'Cars', 'Things to do'], united: ['Book', 'My trips', 'Travel info', 'MileagePlus'] };

// the cursor's route and every click, read off the sites' beats
function choreography() {
  const pts = [{ t: 0, ...REST }];
  const clicks = [];
  let at = REST;
  // a glide of up to 0.38s into `t`, held where it was until then (never before the last point: keyed() needs order)
  const go = (t, p) => {
    const from = Math.max(pts[pts.length - 1].t, t - 0.38);
    if (from > pts[pts.length - 1].t) pts.push({ t: from, ...at });
    pts.push({ t, ...p });
    at = p;
  };
  SITES.forEach((s, k) => {
    const target = k === 0 ? OMNI : plusAt(k);
    go(s.click - 0.02, target);
    clicks.push({ t: s.click, ...target });
    if (s.filter) { go(s.filterAt - 0.02, RADIO); clicks.push({ t: s.filterAt, ...RADIO }); }
    const last = Math.min(s.rows.length - 1, 4);
    go(s.rowsAt + 0.3, priceAt(0));
    pts.push({ t: s.scanTo, ...priceAt(last) });
    at = priceAt(last);
    go(s.found - 0.02, priceAt(s.best));
    if (s.id === 'sky') { go(T.replan + 0.5, priceAt(s.nonstopBest)); }
  });
  go(T.done + 0.6, REST);
  return { pts, clicks };
}

function page(s) {
  const rows = s.rows.map((r, i) => `<div class="pg-row" style="top:${92 * i}px">
      <span class="pg-code" style="background:${r.tint}">${esc(r.code)}</span>
      <span class="pg-when"><b>${esc(r.dep)} → ${esc(r.arr)}</b><small>${esc(r.air)}</small></span>
      <span class="pg-dur">${esc(r.dur)}<small>DEN to NRT</small></span>
      <span class="pg-stops${r.stops === 'Nonstop' ? ' is-direct' : ''}">${esc(r.stops)}</span>
      <span class="pg-cost"><b>${money(r.price)}</b><small>${esc(r.fare)}</small></span>
    </div>`).join('');
  const skel = [0, 1, 2, 3, 4].map((i) => `<div class="pg-sk" style="top:${92 * i}px"><span style="width:46px;height:46px;border-radius:23px"></span><span style="width:300px"></span><span style="width:140px"></span><span style="flex:1"></span><span style="width:90px"></span></div>`).join('');
  return `<div class="sc-page pg lk-${s.look}">
    <header class="pg-head"><img src="${s.fav}" alt="" width="30" height="30"><b>${esc(s.name)}</b><nav>${NAV[s.id].map((n) => `<span>${n}</span>`).join('')}</nav></header>
    <div class="pg-search">
      <span class="pg-f"><small>From</small><b>Denver (DEN)</b></span>
      <span class="pg-f"><small>To</small><b>Tokyo (TYO)</b></span>
      <span class="pg-f"><small>Depart</small><b>Fri, Mar 12</b></span>
      <span class="pg-f"><small>Return</small><b>Mon, Mar 22</b></span>
      <span class="pg-f"><small>Travelers</small><b>1 adult, Economy</b></span>
      <span class="pg-go">Search</span>
    </div>
    <aside class="pg-side"><h4>Stops</h4>
      <span class="pg-rad"><i></i>Any number of stops</span>
      <span class="pg-rad"><i></i>Nonstop only</span>
      <span class="pg-rad"><i></i>1 stop or fewer</span>
      <div class="pg-lines"><span style="width:70%"></span><span style="width:90%"></span><span style="width:60%"></span><span style="width:80%"></span></div>
    </aside>
    <div class="pg-main">
      <div class="pg-sort"><span>Best</span><span>Cheapest</span><span>Fastest</span><em>${s.fares} results</em></div>
      <div class="pg-skel">${skel}</div>
      <div class="pg-rows">${rows}<i class="pg-ring"><span class="pg-tag"></span></i></div>
    </div>
  </div>`;
}

export function buildScreen() {
  const tabs = SITES.map((s, k) => `<span class="sc-tab" data-k="${k}"><i class="sc-bg"></i><img class="sc-fav" src="${s.fav}" alt="" width="16" height="16"><span class="sc-tt">${k === 0 ? '<span class="sc-t0">New Tab</span>' : ''}<span class="sc-t1">${esc(TITLES[s.id])}</span></span><span class="sc-x">${ICON.x}</span></span>`).join('');
  const node = el(`<div class="sc-desk">
      <div class="sc-strip"><span class="sc-lights"><i></i><i></i><i></i></span>${tabs}<span class="sc-plus">${ICON.plus}</span></div>
      <div class="sc-bar">
        <span class="sc-ic">${ICON.back}</span><span class="sc-ic sc-dim">${ICON.fwd}</span><span class="sc-ic">${ICON.reload}</span>
        <span class="sc-omni"><span class="sc-ic sc-oi"></span><span class="sc-ot"></span><i class="sc-caret"></i><span class="sc-ph">Search Google or type a URL</span></span>
        <i class="sc-me"></i><span class="sc-ic">${ICON.more}</span>
      </div>
      <img class="sc-page sc-ntp" src="img/new-tab.png" width="1470" height="839" alt="Chrome New Tab page">
      ${SITES.map(page).join('')}
      <svg class="sc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>`);
  const $$ = (s) => [...node.querySelectorAll(s)];
  const { pts, clicks } = choreography();
  for (const c of clicks) node.appendChild(el('<i class="sc-ripple"></i>'));
  const v = {
    tabs: $$('.sc-tab'), omni: node.querySelector('.sc-omni'), oi: node.querySelector('.sc-oi'), ot: node.querySelector('.sc-ot'),
    caret: node.querySelector('.sc-caret'), ph: node.querySelector('.sc-ph'), ntp: node.querySelector('.sc-ntp'),
    pages: $$('.pg'), cursor: node.querySelector('.sc-cursor'), ripples: $$('.sc-ripple'),
  };
  v.pageParts = v.pages.map((p) => ({ skel: p.querySelector('.pg-skel'), sks: [...p.querySelectorAll('.pg-sk span')], rows: [...p.querySelectorAll('.pg-row')], ring: p.querySelector('.pg-ring'), tag: p.querySelector('.pg-tag'), rads: [...p.querySelectorAll('.pg-rad i')] }));
  v.t0 = node.querySelector('.sc-t0');
  v.t0b = v.tabs[0].querySelector('.sc-t1');
  v.fav0 = v.tabs[0].querySelector('.sc-fav');
  let omniKey = '';

  function paintTabs(t, active) {
    v.tabs.forEach((tab, k) => {
      const s = SITES[k];
      const w = k === 0 ? 1 : outCubic(seg(t, s.open, s.open + 0.3));
      tab.style.width = `${(TAB_W * w).toFixed(2)}px`;
      tab.style.opacity = w.toFixed(3);
      const on = k === active ? (k === 0 ? 1 : ease(t, s.open, 0.2)) : 0;
      tab.firstElementChild.style.opacity = on.toFixed(3);
    });
    const f = ease(t, SITES[0].load, 0.25);
    v.t0.style.opacity = (1 - f).toFixed(3);
    v.t0b.style.opacity = f.toFixed(3);
    v.fav0.style.opacity = f.toFixed(3);
  }

  // the omnibox: focused and typing from the click until the URL commits, then the URL at rest
  function paintOmni(t) {
    const k = latest(SITES.map((s) => ({ at: s.click })), t);
    const s = SITES[k];
    let mode = 'ntp', text = '';
    if (s && t < s.load) { mode = 'type'; text = typed(s.url, s.typeAt, 160, t); } else if (s) { mode = 'url'; text = s.url; }
    const key = `${mode}|${text}`;
    if (key !== omniKey) {
      omniKey = key;
      v.omni.classList.toggle('is-focus', mode !== 'url');
      v.oi.innerHTML = mode === 'url' ? ICON.tune : ICON.search;
      v.ot.textContent = text;
      v.ph.style.display = text ? 'none' : '';
    }
    v.caret.style.opacity = mode !== 'url' && !blink(t) ? '1' : mode !== 'url' && text ? '1' : '0';
  }

  function paintPage(t, s, p) {
    const sx = `${(-((t * 0.9) % 1) * 300).toFixed(1)}%`;
    const skel = 1 - ease(t, s.rowsAt, 0.25);
    p.skel.style.opacity = skel.toFixed(3);
    if (skel > 0) for (const b of p.sks) b.style.setProperty('--sx', RM ? '0' : sx);
    p.rows.forEach((r, i) => {
      const k = ease(t, s.rowsAt + 0.07 * i, 0.4);
      r.style.opacity = k.toFixed(3);
      r.style.transform = k >= 1 ? '' : `translateY(${mv((1 - k) * 18).toFixed(2)}px)`;
    });
    const nonstop = s.filter ? ease(t, s.filterAt, 0.2) : 0;
    p.rads[0].style.setProperty('--on', (1 - nonstop).toFixed(3));
    p.rads[1].style.setProperty('--on', nonstop.toFixed(3));
    // the ring pops round the cheapest row; on Skyscanner the change of plan moves it to the cheapest nonstop
    const ring = outBack(seg(t, s.found, s.found + 0.45));
    let i = s.best, tag = '👀 Cheapest';
    if (s.id === 'sky') {
      const m = ease(t, T.replan + 0.15, 0.4);
      i = s.best + (s.nonstopBest - s.best) * m;
      if (t >= T.replan + 0.3) tag = '✈️ Cheapest nonstop';
    } else if (s.filter) tag = '✈️ Cheapest nonstop';
    p.ring.style.top = `${(92 * i - 7).toFixed(2)}px`;
    p.ring.style.opacity = Math.min(1, ring).toFixed(3);
    p.ring.style.transform = RM ? '' : `scale(${(0.97 + 0.03 * ring).toFixed(4)})`;
    if (p.tag.textContent !== tag) p.tag.textContent = tag;
  }

  return {
    node,
    paint(t) {
      const active = Math.max(0, latest(SITES.map((s, k) => ({ at: k === 0 ? s.load : s.open })), t));
      paintTabs(t, active);
      paintOmni(t);
      // pages: the New Tab page until the first search commits, then the active tab's page
      const shown = t < SITES[0].load ? -1 : active;
      v.ntp.style.opacity = shown < 0 ? '1' : (1 - ease(t, SITES[0].load, 0.2)).toFixed(3);
      SITES.forEach((s, k) => {
        const p = v.pages[k];
        const at = k === 0 ? s.load : s.open + 0.15;
        const next = SITES[k + 1] ? SITES[k + 1].open + 0.15 : Infinity;
        const o = k === shown ? ease(t, at, 0.2) : k < shown ? 1 - ease(t, next, 0.2) : 0;
        p.style.opacity = o.toFixed(3);
        p.style.visibility = o > 0 ? 'visible' : 'hidden';
        if (o > 0) paintPage(t, s, v.pageParts[k]);
      });
      const at = path(t, pts);
      v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;
      clicks.forEach((c, k) => {
        const r = v.ripples[k];
        const g = seg(t, c.t, c.t + 0.5);
        r.style.opacity = g > 0 && g < 1 ? (0.9 * (1 - g)).toFixed(3) : '0';
        r.style.transform = `translate(${c.x}px, ${c.y}px) scale(${(0.3 + 0.9 * outCubic(g)).toFixed(3)})`;
      });
    },
  };
}
