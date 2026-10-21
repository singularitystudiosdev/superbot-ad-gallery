// Scenes 1 to 5, the creator's part: the Superbot app's home, New Superbot, the name typed live, Start recording; then
// his own Chrome under the recording overlay (the reference's soft vignette, full screen, and the recording pill with
// the live caption), the real Roblox pages driven by his pointer phrase by phrase, Done, and the recording flying back
// into the app as the new bot's first message. One pointer Track covers it all, in stage px.
import { seg, lerp, clamp, outCubic, inOutCubic, outBack, press, boxIn, typedAt, css, op, vis } from './lib.93d8bde0.js';
import { Track, makeCursor } from './cursor.93d8bde0.js';
import { PAGE, COL } from './desk.93d8bde0.js';
import { NAME, URL_GAME } from './timing.93d8bde0.js';

const K = 1.25; // desktop px -> stage px
const P = (x, y) => ({ x: x * K, y: (y + PAGE.top) * K }); // a point on the page (page px) on the stage
const SCROLL = 560; // how far he scrolls the Thumbnails column to bring the table up
// the table's rows in the scrolling column (content px): first data row 564, 89 px each; thumbnail button x 538..621
const rowY = (k) => COL.y + 564 + 89 * k; // page y of row k's top before scrolling
const URL = {
  game: URL_GAME,
  details: 'create.roblox.com/dashboard/creations/experiences/9472441390/game-details',
  thumbs: 'create.roblox.com/dashboard/creations/experiences/9472441390/places/96168869671905/thumbnails',
};
const TITLE = { ntp: 'New Tab', game: 'ROB IT | Play on Roblox', details: '[🎃] 💎 ROB IT / Game details', thumbs: '[🎃] 💎 ROB IT / Thumbnails' };
// the ⋯ menu's seven items (page px), in the order Roblox lists them
const MENU = { x: 1276, y: 106, w: 198, h: 43, n: 7 };

export function buildUser({ stage, T, VO, app, create, desk, deskWrap, pill, pillWrap, edge, soft, ptrLayer, appWrap, poster }) {
  const cursor = makeCursor(1.5);
  ptrLayer.appendChild(cursor.el);

  // ---- targets, measured once with everything in its resting place ----
  const newBox = boxIn(app.newBtn, stage);
  const nameBox = boxIn(create.input, stage);
  const recBox = boxIn(create.primary, stage);
  const doneBox = boxIn(pill.done, stage);
  const omni = { x: (110 + 64) * K, y: 62 * K };
  const posterBox = boxIn(poster, stage);

  // ---- his pointer ----
  const tr = new Track(1210, 742);
  tr.move(T.newMove[0], T.newMove[1], newBox.x + newBox.w * 0.4, newBox.cy + 2).shape(T.newMove[1] - 0.12, 'hand').click(T.newClick);
  tr.shape(T.newClick + 0.25, 'arrow');
  tr.move(T.nameMove[0], T.nameMove[1], nameBox.x + 60, nameBox.cy + 1).shape(T.nameMove[1] - 0.1, 'ibeam').click(T.nameClick);
  tr.hidden(T.nameTimes[0], T.recMove[0]); // macOS hides the pointer while he types
  tr.shape(T.recMove[0] + 0.25, 'arrow');
  tr.move(T.recMove[0], T.recMove[1], recBox.x + recBox.w * 0.3, recBox.cy).shape(T.recMove[1] - 0.12, 'hand').click(T.recClick);
  tr.shape(T.recClick + 0.3, 'arrow');
  tr.move(T.omniMove[0], T.omniMove[1], omni.x, omni.y).shape(T.omniMove[1] - 0.12, 'ibeam').click(T.omniClick);
  tr.hidden(T.urlTimes[0], T.menuMove[0]);
  tr.shape(T.enter, 'arrow');
  // P2: the ⋯ menu, then Configure this Experience
  const dots = P(1375, 85);
  tr.move(T.menuMove[0], T.menuMove[1], dots.x, dots.y).shape(T.menuMove[1] - 0.1, 'hand').click(T.menuClick);
  const cfg = P(1350, MENU.y + 4 * MENU.h + MENU.h / 2);
  tr.move(T.cfgMove[0], T.cfgMove[1], cfg.x, cfg.y, { c: 0.05 }).click(T.cfgClick);
  tr.shape(T.cfgClick + 0.15, 'arrow');
  // P3: the thumbnail's Edit Thumbnails pencil
  const pencil = P(689, 162);
  tr.move(T.pencilMove[0], T.pencilMove[1], pencil.x, pencil.y).shape(T.pencilMove[1] - 0.1, 'hand').click(T.pencilClick);
  tr.shape(T.pencilClick + 0.15, 'arrow');
  // P4: Edit active thumbnails, then circle Upload thumbnails
  const editBtn = P(520, 309), up = P(666.5, 309), rx = 94 * K, ry = 29 * K;
  tr.move(T.editMove[0], T.editMove[1], editBtn.x, editBtn.y).shape(T.editMove[1] - 0.1, 'hand').click(T.editClick);
  tr.move(T.uploadMove[0], T.uploadMove[1], up.x + rx, up.y, { c: 0.2 });
  tr.orbit(T.uploadOrbit[0], T.uploadOrbit[1], up.x, up.y, rx, ry, 1.1);
  tr.shape(T.uploadOrbit[1], 'arrow');
  // P5: (the page scrolls under the pointer) the lowest performer, row 1, pointed at on "right here"
  const thumbAt = (k) => P(579.5, rowY(k) - SCROLL + 44);
  const r0 = thumbAt(0);
  tr.move(T.rowMove[0], T.rowMove[1], r0.x + 6, r0.y + 4).shape(T.rowMove[1] - 0.1, 'hand');
  tr.orbit(T.rowTap - 0.1, T.rowTap + 0.55, r0.x, r0.y, 9, 7, 1);
  // P6: down the Impressions column on "statistically significant amount of data", then circle the click rates
  const impr = (k) => P(718, rowY(k) - SCROLL + 44);
  tr.shape(T.imprMove[0] + 0.15, 'arrow');
  tr.move(T.imprMove[0], T.imprMove[1], impr(0).x, impr(0).y);
  tr.move(T.imprSweep[0], T.imprSweep[1], impr(4).x, impr(4).y, { c: 0.03, o: 0.01 });
  const ptr = P(1181, (rowY(0) + rowY(4)) / 2 - SCROLL + 44), pry = (rowY(4) - rowY(0)) / 2 * K + 34 * K;
  tr.move(T.ptrMove[0], T.ptrMove[1], ptr.x, ptr.y - pry);
  tr.orbit(T.ptrOrbit[0], T.ptrOrbit[1], ptr.x, ptr.y, 84 * K, pry, 1);
  // P7: down the thumbnails
  tr.move(T.thumbMove[0], T.thumbMove[1], thumbAt(0).x, thumbAt(0).y).shape(T.thumbMove[1] - 0.1, 'hand');
  tr.move(T.thumbSweep[0], T.thumbSweep[1], thumbAt(4).x, thumbAt(4).y, { c: 0.03, o: 0.01 });
  tr.shape(T.thumbSweep[1] + 0.2, 'arrow');
  // L8: Done on the recording pill
  tr.move(T.doneMove[0], T.doneMove[1], doneBox.cx, doneBox.cy + 2).shape(T.doneMove[1] - 0.1, 'hand').click(T.doneClick);
  tr.hidden(T.fly[0], 1e9);

  // ---- the pill's live caption: every spoken word from the recording, the newest bright, the older fading ----
  const recWords = VO.lines.filter((l) => /^(P|L8)/.test(l.id)).flatMap((l) => l.words);
  const capEls = recWords.map((w) => { const el = document.createElement('span'); el.className = 'sbk-pill-word'; el.textContent = w.w; return el; });
  let capShown = '';
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const recLen = fmt(Math.max(0, T.doneClick - T.rec0));

  // the hover states on his own pages, in page px: what lights up under the pointer
  function hovers(t, page, menuOpen, scroll, pp, pressing) {
    const out = [];
    const hit = (r) => pp.x >= r.x && pp.x <= r.x + r.w && pp.y >= r.y && pp.y <= r.y + r.h;
    const add = (r, bg, extra = {}) => { if (hit(r)) out.push({ ...r, bg: pressing ? bg.replace(/[\d.]+\)$/, (a) => `${(parseFloat(a) * 1.8).toFixed(2)})`) : bg, ...extra }); };
    if (page === 'game' && !menuOpen) add({ x: 1360, y: 70, w: 30, h: 30, r: 4 }, 'rgba(0,0,0,.08)');
    if (page === 'game' && menuOpen) for (let k = 0; k < MENU.n; k++) add({ x: MENU.x, y: MENU.y + k * MENU.h, w: MENU.w, h: MENU.h, r: 0 }, 'rgba(0,0,0,.055)');
    if (page === 'details') add({ x: 673, y: 146, w: 32, h: 32, r: 16 }, 'rgba(255,255,255,.2)');
    if (page === 'thumbs') add({ x: 435, y: 289, w: 200, h: 40, r: 8 }, 'rgba(255,255,255,.12)');
    if (page === 'edit') {
      const y = 289 - scroll;
      if (y > COL.y - 10) { add({ x: 435, y, w: 137, h: 40, r: 8 }, 'rgba(255,255,255,.14)'); add({ x: 580, y, w: 173, h: 40, r: 8 }, 'rgba(255,255,255,.12)'); }
      for (let k = 0; k < 5; k++) add({ x: 538, y: rowY(k) - scroll + 16, w: 83, h: 56, r: 6 }, 'rgba(255,255,255,.06)', { ring: '0 0 0 2px rgba(255,255,255,.9)' });
    }
    return out;
  }

  return {
    track: tr,
    recLen,
    render(t) {
      // ---- scene 2: the create panel over the app ----
      const pin = outCubic(seg(t, T.panelIn, T.panelIn + 0.3)), pout = seg(t, T.panelOut[0], T.panelOut[1]);
      const pv = pin * (1 - pout);
      op(create.root, pv); vis(create.root, pv > 0);
      css(create.panel, 'transform', `translateY(${((1 - pin) * 14 + pout * 8).toFixed(2)}px) scale(${(lerp(0.96, 1, pin) - pout * 0.02).toFixed(4)})`);
      const typed = typedAt(NAME, T.nameTimes, t);
      create.setName(typed.text, t >= T.nameClick && t < T.recClick);
      const onRec = t >= T.recMove[1] - 0.12 && t < T.recClick + 0.25;
      create.setPrimary(press(t, T.recClick) > 0.3 ? 'press' : onRec ? 'hover' : 'rest');
      const onNew = t >= T.newMove[1] - 0.12 && t < T.newClick + 0.3;
      css(app.newBtn, 'background', onNew ? (press(t, T.newClick) > 0.3 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)') : '');

      // ---- scene 3: the app gives way to Chrome ----
      const ch = outCubic(seg(t, T.toChrome[0], T.toChrome[1]));
      const fl = seg(t, T.fly[0], T.fly[1]);
      op(deskWrap, fl >= 1 ? 0 : ch * (1 - seg(t, T.fly[1] - 0.12, T.fly[1])));
      vis(deskWrap, ch > 0 && fl < 1);
      if (fl > 0) {
        // the recording shrinks into its card in the new bot's chat
        const f = inOutCubic(fl), s = lerp(1, posterBox.w / 1920, f);
        const x = lerp(0, posterBox.x, f), y = lerp(0, posterBox.y, f) - Math.sin(Math.PI * f) * 60;
        css(deskWrap, 'transform', `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`);
        css(deskWrap, 'border-radius', `${lerp(0, 180, f).toFixed(1)}px`);
      } else css(deskWrap, 'transform', `scale(${lerp(0.965, 1, ch).toFixed(4)})`);

      // ---- the pages ----
      const page = t < T.gameIn ? 'ntp' : t < T.detailsIn ? 'game' : t < T.thumbsIn ? 'details' : t < T.editIn ? 'thumbs' : 'edit';
      const menuOpen = t >= T.menuClick + 0.04 && t < T.cfgClick + 0.06;
      const scroll = SCROLL * outCubic(seg(t, T.scroll[0], T.scroll[1]));
      const loading = (t >= T.enter && t < T.gameIn) || (t >= T.cfgClick + 0.05 && t < T.detailsIn) || (t >= T.pencilClick + 0.05 && t < T.thumbsIn);
      const tabPage = page === 'edit' ? 'thumbs' : page;
      const focus = t >= T.omniClick && t < T.enter;
      const typedUrl = typedAt('roblox.com', T.urlTimes, t);
      const showInline = focus && typedUrl.n >= 3;
      const p = tr.at(t), pp = { x: p.x / K, y: p.y / K - PAGE.top };
      const pressing = tr.pressAt(t) > 0.3;
      desk.render({
        pages: { ntp: +(page === 'ntp'), game: +(page === 'game' && !menuOpen), menu: +(page === 'game' && menuOpen), details: +(page === 'details'), thumbs: +(page === 'thumbs'), edit: +(page === 'edit') },
        edit: +(page === 'edit'), scroll,
        tab: { title: TITLE[tabPage], fav: page !== 'ntp', loading, spin: t * 520 },
        omni: page === 'ntp'
          ? { typed: typedUrl.text, sel: showInline ? URL_GAME.slice(typedUrl.n) : '', caret: focus && !showInline && ((t - T.omniClick) % 1.06 < 0.53 || typedUrl.n > 0), focus, ph: !focus && typedUrl.n === 0 }
          : { typed: URL[tabPage] },
        suggest: focus && typedUrl.n > 0 ? 1 : 0, suggestSel: 0,
        hovers: hovers(t, page, menuOpen, scroll, pp, pressing),
      });

      // ---- the recording overlay: the vignette breathing round the screen, the pill at top centre ----
      const vin = outCubic(seg(t, T.vigIn, T.vigIn + 0.6)), vout = seg(t, T.recOut[0], T.recOut[1]);
      op(edge, vin * (1 - vout)); vis(edge, vin > 0 && vout < 1);
      css(edge, '--rv-a', `${((t * 24) % 360).toFixed(1)}deg`);
      op(soft, 0.82 + 0.16 * Math.sin(t * 1.7));
      const pdrop = clamp(outBack(seg(t, T.pillIn, T.pillIn + 0.5), 1.2), 0, 1.2);
      op(pillWrap, seg(t, T.pillIn, T.pillIn + 0.25) * (1 - vout)); vis(pillWrap, t >= T.pillIn && vout < 1);
      css(pillWrap, 'transform', `translate(-50%, ${((1 - pdrop) * -90 - vout * 18).toFixed(2)}px) scale(1.25)`);
      if (t >= T.pillIn - 0.1 && vout < 1) {
        pill.setTimer(fmt(Math.max(0, Math.min(t, T.doneClick) - T.rec0)));
        const onDone = t >= T.doneMove[1] - 0.12;
        pill.setDone(press(t, T.doneClick) > 0.3 ? 'press' : onDone ? 'hover' : 'rest');
        // the caption: the last 9 words he has started saying; a word's brightness falls with its place from the newest
        // and the whole caption fades a few seconds into a silence
        let n = 0;
        while (n < recWords.length && recWords[n].t0 <= t) n++;
        const from = Math.max(0, n - 9);
        const key = `${from}:${n}`;
        if (key !== capShown) { pill.caption.replaceChildren(...capEls.slice(from, n)); capShown = key; }
        for (let i = from; i < n; i++) {
          const age = n - 1 - i, w = recWords[i];
          const fresh = seg(t, w.t0, w.t0 + 0.12), idle = 1 - seg(t, recWords[n - 1].t1 + 2.6, recWords[n - 1].t1 + 3.2);
          op(capEls[i], Math.max(0.18, 1 - age * 0.1) * fresh * idle);
        }
        pill.paint(t * 1000);
      }
      cursor.render(t, tr);
    },
  };
}
