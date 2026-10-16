/* engine.29231211.js: the word clock, playback, input and HUD for the sponsor read.
   Every beat in scenes*.js is keyed to a spoken word through W(lineId, word), so the
   animation follows the voiceover, not a hand-tuned timestamp list.

   URL
     ?autoplay         start without the click          ?t=12.4    freeze one frame (renders)
     ?hold             wait at the end of every line until Space/click (live, on camera)
     ?align=file.json  exact word times from YOUR recorded read (align.29231211.mjs makes it; time 0 = audio start)
     ?audio=file.mp3   play that read and let it drive the clock (with ?align: hear and see the take in sync)
     ?lines=0,3.1,...  exact line starts from a take    ?wps=2.8   default reading pace
     ?rate=1           playback speed                   ?cues      teleprompter on
     ?pick=0|1|2       which thumbnail gets uploaded    ?clean     never show HUD hints
     ?channel= ?handle= ?title=   the creator's channel, @handle and video title
   Keys: Space/click play, pause or (hold) next line · ←/→ line · R restart · ,/. speed
         H hold mode · T restart in hold mode and record line starts · C cues · F full screen */
(() => {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const RAW = window.SB_LINES;
  const REF_WPS = 3.04;
  const WPS = +Q.get('wps') || 2.8;
  const TAIL = 2.4;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- word clock ---------- */
  /* Word durations fitted on a measured read (ElevenLabs TTS with timestamps, 213 words, 2026-10-16, mean error
     0.075 s/word): 0.024 s + 0.053 s per SPOKEN letter ("$50" = "fifty dollars", "FLUX.2" = "flux two",
     "fal.ai" = "fal dot ai"), then 0.29 s after a comma and 0.80 s after a sentence. That read ran at REF_WPS;
     ?wps rescales it. */
  const norm = (w) => w.toLowerCase().replace(/^[^a-z0-9$]+|[^a-z0-9]+$/g, '');
  const NUM = { 2: 'two', 30: 'thirty', 50: 'fifty' };
  const spokenLetters = (w) => norm(w)
    .replace(/^\$(\d+)$/, (_, n) => `${NUM[n] || n} dollars`)
    .replace(/^([a-z]+)\.(\d+)$/, (_, a, n) => `${a} ${NUM[n] || n}`)
    .replace(/([a-z])\.([a-z])/g, '$1 dot $2')
    .replace(/\b\d+\b/g, (n) => NUM[n] || n)
    .replace(/[^a-z]/g, '').length;
  const voiced = (w) => 0.024 + 0.053 * spokenLetters(w);
  const pauseAfter = (w) => (/[,;:]["”]?$/.test(w) ? 0.29 : /[.!?]["”]?$/.test(w) ? 0.8 : 0);

  function parseStarts(q) {
    if (!q) return null;
    const a = q.split(',').map(Number);
    if (a.length !== RAW.length || !a.every((x, i) => isFinite(x) && (i === 0 || x > a[i - 1]))) {
      console.error('[sb] ?lines= needs', RAW.length, 'increasing numbers, got', q);
      return null;
    }
    return a;
  }

  /* aligned: one {t, e} per script word (from ?align); starts: one start per line (from ?lines or tap-sync) */
  function build(starts, aligned) {
    let clock = 0, k = 0;
    const lines = RAW.map((l, i) => {
      const raw = l.text.split(/\s+/);
      const v = raw.map(voiced), p = raw.map(pauseAfter);
      const sum = v.reduce((a, b) => a + b, 0) + p.reduce((a, b) => a + b, 0);
      const natural = sum * (REF_WPS / WPS);
      const start = starts ? starts[i] : clock;
      const span = starts && i + 1 < RAW.length ? starts[i + 1] - start : natural;
      const scale = span / sum;
      let acc = 0;
      const words = raw.map((w, j) => {
        const al = aligned && aligned[k++];
        const t = al ? al.t : start + acc * scale;
        acc += v[j] + p[j];
        return { w, n: norm(w), t, e: al ? al.e : t + v[j] * scale };
      });
      clock = start + natural;
      return { id: l.id, text: l.text, i, start: words[0].t, end: words[words.length - 1].e, words };
    });
    lines.forEach((l, i) => { l.next = i + 1 < lines.length ? lines[i + 1].start : l.end + TAIL; });
    return lines;
  }

  /* ElevenLabs forced alignment ({words:[{text,start,end}]}) or TTS with-timestamps ({alignment:{characters,...}})
     -> one {t, e} per script word, matched in order by normalised text */
  function parseAlign(j) {
    let ws = [];
    if (Array.isArray(j.words)) ws = j.words.map((w) => ({ w: String(w.text), t: +w.start, e: +w.end }));
    else {
      const a = j.alignment || j.normalized_alignment || j;
      if (!Array.isArray(a.characters)) throw new Error('unrecognised alignment JSON');
      let cur = null;
      a.characters.forEach((c, i) => {
        if (/\s/.test(c)) { if (cur) ws.push(cur); cur = null; return; }
        if (!cur) cur = { w: '', t: a.character_start_times_seconds[i] };
        cur.w += c;
        cur.e = a.character_end_times_seconds[i];
      });
      if (cur) ws.push(cur);
    }
    const merged = [];
    for (const w of ws) {
      if (!/\S/.test(w.w)) continue;
      if (!/[a-z0-9$]/i.test(w.w) && merged.length) { merged[merged.length - 1].e = w.e; continue; }
      merged.push(w);
    }
    /* match in order with a short lookahead (a recogniser may split "FLUX.2" or hear "$50" as "fifty"), then give
       every unmatched script word a time interpolated between its matched neighbours */
    const script = RAW.flatMap((l) => l.text.split(/\s+/));
    const key = (w) => norm(w).replace(/[^a-z0-9]/g, '');
    const out = new Array(script.length).fill(null);
    let q = 0, missed = 0;
    script.forEach((sw, i) => {
      const n = key(sw);
      for (let r = q; r < Math.min(merged.length, q + 6); r++) {
        const m = key(merged[r].w);
        if (m && (m === n || (n.length > 3 && m.slice(0, 4) === n.slice(0, 4)))) { out[i] = merged[r]; q = r + 1; return; }
      }
      missed++;
    });
    if (!out.some(Boolean)) throw new Error('no script word found in the alignment');
    for (let i = 0; i < out.length; i++) {
      if (out[i]) continue;
      let j = i;
      while (j < out.length && !out[j]) j++;
      const a = i ? out[i - 1].e : out[j].t - 0.3 * (j - i);
      const b = j < out.length ? out[j].t : a + 0.3 * (j - i);
      for (let k = i; k < j; k++) out[k] = { w: script[k], t: a + ((b - a) * (k - i)) / (j - i), e: a + ((b - a) * (k - i + 1)) / (j - i) };
      i = j - 1;
    }
    if (missed) console.warn(`[sb] alignment: ${missed} of ${script.length} script words interpolated`);
    return out;
  }

  let lines = build(parseStarts(Q.get('lines')));
  let byId = {};
  const index = () => { byId = Object.fromEntries(lines.map((l) => [l.id, l])); };
  index();
  const ready = !Q.get('align') ? Promise.resolve() : fetch(Q.get('align'))
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    /* a whisper alignment carries speech-onset line starts: those plus the fitted word clock beat whisper's own
       word times (align.29231211.mjs); ElevenLabs forced alignment is word-exact and is used as is */
    .then((j) => {
      const starts = Array.isArray(j.line_starts) ? parseStarts(j.line_starts.join(',')) : null;
      lines = starts ? build(starts) : build(null, parseAlign(j));
      index();
    })
    .catch((e) => console.error('[sb] ?align failed, falling back to the word clock', e));

  function find(id, key, nth) {
    const l = byId[id];
    if (!l) { console.error('[sb] unknown line', id); return null; }
    const k = key.toLowerCase();
    let seen = 0;
    for (const w of l.words) if (w.n.startsWith(k) && seen++ === nth) return w;
    console.error('[sb] word not found', id, key, nth);
    return null;
  }
  /* W: when a word starts; W.end: when it ends; L: the line (start, end of speech, next start) */
  const W = (id, key, nth = 0) => { const w = find(id, key, nth); return w ? w.t : byId[id] ? byId[id].start : 0; };
  W.end = (id, key, nth = 0) => { const w = find(id, key, nth); return w ? w.e : byId[id] ? byId[id].end : 0; };
  const L = (id) => byId[id];
  const duration = () => lines[lines.length - 1].next;
  const lineAt = (t) => { let i = 0; while (i + 1 < lines.length && lines[i + 1].start <= t) i++; return i; };

  /* ---------- helpers shared with the scenes ---------- */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeIn = (x) => Math.pow(clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = (x) => { x = clamp(x); const c1 = 1.55, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const P = (t, a, d) => clamp((t - a) / Math.max(1e-4, d));
  /* opacity of something shown from a to b with fades */
  const win = (t, a, b = Infinity, fi = 0.35, fo = 0.3) => Math.min(easeOut(P(t, a, fi)), 1 - easeIn(P(t, b, fo)));
  function set(el, o) {
    if (!el) return;
    const s = el.style;
    if (o.o != null) { s.opacity = o.o; s.visibility = o.o <= 0.002 ? 'hidden' : 'inherit'; }
    if (o.x != null || o.y != null || o.s != null || o.r != null) {
      s.transform = `translate(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px) scale(${o.s == null ? 1 : o.s.toFixed(4)})${o.r ? ` rotate(${o.r.toFixed(2)}deg)` : ''}`;
    }
    if (o.b != null) s.filter = o.b > 0.05 ? `blur(${o.b.toFixed(2)}px)` : '';
  }
  /* rise-in: opacity + small lift + optional pop */
  function rise(el, t, a, { d = 0.45, y = 16, s = 1, out = Infinity, od = 0.3, spring = false } = {}) {
    const k = P(t, a, d);
    const e = spring ? back(k) : easeOut(k);
    const o = Math.min(easeOut(P(t, a, d * 0.7)), 1 - easeIn(P(t, out, od)));
    set(el, { o, y: (1 - e) * y, s: lerp(s, 1, e) });
    return o;
  }

  window.SBX = { $, $$, Q, W, L, lines: () => lines, clamp, lerp, easeOut, easeIn, easeInOut, back, P, win, set, rise };

  /* ---------- icons (lucide, ISC) ---------- */
  const IC = {
    plus: 'M5 12h14M12 5v14', chev: 'm6 9 6 6 6-6', up: 'm5 12 7-7 7 7M12 19V5', down: 'M12 5v14m7-7-7 7-7-7',
    monitor: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 21h8M12 17v4',
    voice: 'M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3',
    mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
    pointer: 'M4.04 4.69a.5.5 0 0 1 .65-.65l16 6.5a.5.5 0 0 1-.06.95l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.12a.5.5 0 0 1-.95.07z',
    share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
    expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    x: 'M18 6 6 18M6 6l12 12', left: 'm12 19-7-7 7-7M19 12H5', right: 'M5 12h14m-7-7 7 7-7 7',
    reload: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8M21 3v5h-5',
    tune: 'M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4',
    dots: 'M12 5h.01M12 12h.01M12 19h.01', menu: 'M4 6h16M4 12h16M4 18h16',
    search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.3-4.3',
    video: 'm16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    play: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8l6 4-6 4z',
    chart: 'M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3',
    msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    captions: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM7 15h4M15 15h2M7 11h2M13 11h4',
    dollar: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6',
    wand: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5',
    music: 'M9 18V5l12-2v13M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    imgplus: 'M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5M3 16l5-5c.93-.9 2.07-.9 3 0l7 7M9 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    /* the desktop app's chrome */
    check: 'M20 6 9 17l-5-5', chevL: 'm15 18-6-6 6-6',
    messageCircle: 'M7.9 20A9 9 0 1 0 4 16.1L2 22z', code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
    squarePen: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
    userPlus: 'M2 21a8 8 0 0 1 13.292-6M19 16v6M22 19h-6M10 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    settings: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    listChecks: 'm3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8', filter: 'M3 6h18M7 12h10M10 18h4',
    folderInput: 'M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1M2 13h10M9 16l3-3-3-3',
    globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    keyRound: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4zM16.5 7.5h.01',
    sparkles: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4M22 4h-4M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  };
  $$('[data-ic]').forEach((el) => {
    const d = IC[el.dataset.ic];
    if (!d) { console.error('[sb] missing icon', el.dataset.ic); return; }
    el.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`);
  });

  /* ---------- stage fit ---------- */
  const stage = $('#stage');
  const fit = () => { stage.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; };
  addEventListener('resize', fit);
  fit();

  /* ---------- playback ---------- */
  const freeze = Q.has('t') ? +Q.get('t') : null;
  const S = {
    t: freeze != null ? freeze : 0, playing: false, started: freeze != null, ended: false,
    rate: +Q.get('rate') || 1, hold: Q.has('hold'), released: new Set(), waiting: false,
    cues: Q.has('cues'), rec: null,
  };
  const clean = Q.has('clean') || freeze != null;
  document.documentElement.classList.toggle('is-clean', clean);

  /* ?audio=file plays a recorded read and becomes the clock, so a take (with ?align) previews in sync */
  const audio = Q.get('audio') && freeze == null ? new Audio(Q.get('audio')) : null;
  let audioOk = !!audio, audioPending = false;
  if (audio) {
    audio.preload = 'auto';
    audio.addEventListener('error', () => { audioOk = false; console.error('[sb] ?audio failed to load', Q.get('audio'), audio.error); });
    S.hold = false;
  }

  const toastEl = $('#toast');
  let toastT = 0;
  const toast = (msg) => { toastEl.textContent = msg; toastT = performance.now() + 1400; };

  function start() { S.started = true; S.playing = true; S.ended = false; if (S.hold) S.rec = { t0: performance.now(), marks: [0] }; }
  function restart(hold = S.hold) { S.t = 0; S.hold = hold; S.released.clear(); S.waiting = false; start(); }
  function jump(i) {
    i = clamp(i, 0, lines.length - 1);
    for (let k = 0; k < i; k++) S.released.add(k);
    S.t = lines[i].start; S.ended = false;
  }
  function advance() {
    const i = lineAt(S.t);
    if (i >= lines.length - 1) return;
    S.released.add(i);
    if (S.rec) S.rec.marks.push(((performance.now() - S.rec.t0) / 1000) * S.rate);
    S.t = Math.max(S.t, lines[i + 1].start);
    S.playing = true;
  }
  function primary() {
    if (!S.started) return start();
    if (S.ended) return restart();
    if (S.hold && S.playing) return advance();
    S.playing = !S.playing;
  }
  function finishRec() {
    if (!S.rec || S.rec.marks.length !== lines.length) return;
    const q = S.rec.marks.map((x) => x.toFixed(2)).join(',');
    S.rec = null;
    const url = new URL(location.href);
    url.searchParams.set('lines', q); url.searchParams.delete('hold');
    history.replaceState(null, '', url);
    lines = build(parseStarts(q)); index();
    console.info('[sb] synced line starts: ?lines=' + q);
    if (navigator.clipboard) navigator.clipboard.writeText(url.href).catch((e) => console.error('[sb] clipboard', e));
    const el = $('#sync');
    el.textContent = `Synced to your read. URL updated and copied: ?lines=${q}`;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 6000);
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === ' ' || k === 'Enter') { e.preventDefault(); primary(); }
    else if (k === 'ArrowRight') { if (!S.started) start(); S.hold ? advance() : jump(lineAt(S.t) + 1); }
    else if (k === 'ArrowLeft') { const i = lineAt(S.t); jump(S.t - lines[i].start > 0.8 ? i : i - 1); }
    else if (k === 'r' || k === 'R') restart();
    else if (k === ',' || k === '.') { S.rate = clamp(Math.round((S.rate + (k === '.' ? 0.25 : -0.25)) * 100) / 100, 0.25, 3); toast(`Speed ${S.rate}×`); }
    else if (k === 'h' || k === 'H') { S.hold = !S.hold; toast(S.hold ? 'Hold at each line: on (Space = next line)' : 'Hold at each line: off'); }
    else if (k === 't' || k === 'T') { restart(true); toast('Tap Space as you start each line'); }
    else if (k === 'c' || k === 'C') { S.cues = !S.cues; }
    else if (k === 'f' || k === 'F') {
      const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      p.catch((err) => console.error('[sb] fullscreen', err));
    }
  });
  $('#viewport').addEventListener('click', primary);

  /* ---------- HUD ---------- */
  const hud = { idle: $('#idle'), cue: $('#cue'), now: $('#cue-now'), next: $('#cue-next'), hint: $('#hint') };
  let cueLine = -1;
  function drawHud(now) {
    hud.idle.classList.toggle('on', !S.started && !clean);
    hud.hint.classList.toggle('on', !clean && (!S.started || !S.playing || S.ended));
    toastEl.classList.toggle('on', now < toastT);
    hud.cue.classList.toggle('on', S.cues && !clean);
    if (!S.cues) return;
    const i = lineAt(S.t);
    if (i !== cueLine) {
      cueLine = i;
      hud.now.innerHTML = lines[i].words.map((w) => `<span>${w.w}</span>`).join(' ');
      hud.next.textContent = lines[i + 1] ? lines[i + 1].text : '';
    }
    lines[i].words.forEach((w, j) => hud.now.children[j].classList.toggle('said', S.t >= w.t));
    hud.cue.classList.toggle('waiting', S.waiting);
  }

  /* ---------- loop ---------- */
  const scenes = window.SB_SCENES = window.SB_SCENES || [];
  let api = null;
  function draw() { for (const sc of scenes) sc.render(S.t, api); }

  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    if (S.playing && freeze == null) {
      let t = S.t + dt * S.rate;
      if (audioOk && S.t < audio.duration - 0.05) {
        if (Math.abs(audio.currentTime - S.t) > 0.3) audio.currentTime = S.t;
        audio.playbackRate = S.rate;
        if (audio.paused && !audioPending) {
          audioPending = true;
          audio.play().then(() => { audioPending = false; }, (e) => { audioPending = false; audioOk = false; console.error('[sb] audio play', e); });
        }
        t = audio.paused ? S.t : audio.currentTime;
      }
      const i = lineAt(S.t);
      const gate = lines[i].end + 0.3;
      S.waiting = false;
      if (S.hold && !audio && i < lines.length - 1 && !S.released.has(i) && t >= gate) { t = Math.max(S.t, gate); S.waiting = true; }
      if (S.rec && i === lines.length - 1) finishRec();
      S.t = Math.min(t, duration());
      if (S.t >= duration()) { S.playing = false; S.ended = true; }
    }
    if (audio && !audio.paused && !S.playing) audio.pause();
    draw();
    drawHud(now);
    requestAnimationFrame(frame);
  }

  addEventListener('DOMContentLoaded', () => {
    api = { W, L, Q };
    for (const sc of scenes) if (sc.init) sc.init(api);
    if (Q.has('autoplay')) ready.then(start);
    requestAnimationFrame(frame);
  });

  window.__ad = {
    seek(t) { S.t = clamp(+t, 0, duration()); S.started = true; S.playing = false; draw(); },
    play() { start(); }, pause() { S.playing = false; },
    get t() { return S.t; }, get duration() { return duration(); },
    get lines() { return lines.map((l) => ({ id: l.id, start: +l.start.toFixed(2), end: +l.end.toFixed(2) })); },
    W, ready,
  };
})();
