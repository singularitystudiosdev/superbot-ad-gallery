// The 'cc-loop-thumbs' variant (the computer-control loop engine, ccloop.0c0f5071.js): "Keep optimizing my video
// thumbnails..." and superbot runs the job in rounds on the creator's own screen. Each round: it reads which of the
// channel's thumbnails get clicked most (a click-through table, notes on what the winners share), sorts the table and
// marks the weakest, makes a new thumbnail for that video, then sets the new one against the live one (an A/B result) and
// replaces the weaker, and saves. Round 1 swaps the video's own thumbnail (3.2%) for a new one (5.4%); "Make the text
// bigger on the next one." comes in during round 2, superbot takes the note (a note step, the HUD ringed violet) and the
// bigger-text thumbnail wins again (6.6%), which lifts that video off the bottom; round 3 marks the next weakest and is
// generating its replacement when the spot ends. "How's it going?" and "Any update?" get short answers above the card.
// The channel is Mevesa, the creator the yt-thumbnail cut is made for: the four thumbnails on the table are the channel's
// own, the three new ones are that cut's real GPT Image 2 generations (img/ytthumb.c4e81a27/CREDITS.txt, and
// img/ccloop.0c0f5071/CREDITS.txt for the rest). Impressions, click-through rates and test results are made up for the
// demo; the pages are drawn here, at the desk's px, and name no video platform (hosts end in .channel, which is no real
// domain). Its page styles are ../ccloop-thumbs.0c0f5071.css.
import { lerp, seg, outCubic, inOutCubic, press, streamCount } from '../../../lib.9b47fc30.js';
import { makeLoop } from './ccloop.0c0f5071.js?v=1';

const img = (p) => new URL('../../../img/' + p, import.meta.url).href;
const AVATAR = img('ytthumb.c4e81a27/avatar.jpg');
const NEW = [img('ytthumb.c4e81a27/agents-1.jpg'), img('ytthumb.c4e81a27/agents-3.jpg')]; // round 1's and round 2's winners
const VIDS = {
  proof: { title: 'Soon, Video Will No Longer Be Proof', pic: img('ccloop.0c0f5071/not-proof.jpg'), imp: '412K', ctr: 7.8 },
  agents: { title: 'AI Agents Are Taking Over the Internet', pic: img('ytthumb.c4e81a27/agents-video.jpg'), imp: '296K', ctr: 3.2 },
  already: { title: 'We’re Entering the Age of AI', pic: img('ccloop.0c0f5071/already-here.jpg'), imp: '380K', ctr: 6.9 },
  world: { title: 'How AI Is Changing the World', pic: img('ccloop.0c0f5071/changes-world.jpg'), imp: '351K', ctr: 6.1 },
};
const ROW_H = 132;
const NOTES = ['Face on one side, eyes to camera', 'Three to five words, huge type', 'One accent colour on a bright ground', 'Even bigger text (your note)'];
// each round's prompt, typed into the generator
const PROMPTS = [
  'New thumbnail for "AI Agents Are Taking Over": the host on the right, a four-word hook in huge type, lavender ground.',
  'New thumbnail for "AI Agents Are Taking Over": the host on the right, a four-word hook in extra-large type, lavender ground.',
  'New thumbnail for "How AI Is Changing the World": the host on the left, a three-word hook in extra-large type.',
];
// the A/B results the swap step shows, new against live
const TESTS = [{ cur: 3.2, neu: 5.4 }, { cur: 5.4, neu: 6.6 }];

const tab = (title, path, mark, color) => ({ title, host: 'studio.mevesa.channel', path, mark, color });

const script = {
  id: 'cc-loop-thumbs',
  css: new URL('../ccloop-thumbs.0c0f5071.css?v=1', import.meta.url).href,
  ask: 'Keep optimizing my video thumbnails. Research what works, make a new one, replace the weaker one, repeat.',
  say: 'On it. I’ll keep looping until you stop me.',
  rest: [1180, 700],
  tabs: [tab('Channel analytics', '/analytics/ctr', 'M', '#6d28d9'), tab('Thumbnail lab', '/thumbnail-lab', 'T', '#db2777'), tab('Video details', '/video/edit', 'V', '#0f766e')],
  steps: [
    { key: 'r1-research', round: 1, task: 'Researching your best thumbnails', dur: 3.0, tab: 0, page: 'stats', ptr: [{ dt: 0.6, at: '.ct-row[data-v="proof"] .ct-th' }, { dt: 1.5, at: '.ct-row[data-v="already"] .ct-th' }, { dt: 2.4, at: '.ct-notes h2' }] },
    { key: 'r1-weak', round: 1, task: 'Finding the weakest thumbnail', dur: 2.2, tab: 0, page: 'stats', ptr: [{ dt: 0.55, at: '.ct-sort', click: true }, { dt: 1.5, at: '.ct-row[data-v="agents"] .ct-ctr b' }] },
    { key: 'r1-gen', round: 1, task: 'Generating a new thumbnail', dur: 3.4, tab: 1, page: 'gen', ptr: [{ dt: 1.05, at: '.ct-go', click: true }] },
    { key: 'r1-swap', round: 1, task: 'Replacing the weaker thumbnail', dur: 3.2, tab: 2, page: 'edit', ptr: [{ dt: 1.1, at: '.ct-use', click: true }, { dt: 2.05, at: '.ct-save', click: true }] },
    { key: 'r1-done', round: 1, done: true, task: 'Round 1 done: 3.2% to 5.4% CTR', dur: 1.1, tab: 2, page: 'edit' },
    { key: 'r2-research', round: 2, task: 'Researching your best thumbnails', dur: 2.4, tab: 0, page: 'stats', ptr: [{ dt: 0.7, at: '.ct-row[data-v="already"] .ct-th' }, { dt: 1.7, at: '.ct-row[data-v="agents"] .ct-th' }] },
    { key: 'r2-note', round: 2, note: true, task: 'Applying your note: bigger text', dur: 1.2, tab: 0, page: 'stats', ptr: [{ dt: 0.5, at: '.ct-notes li:nth-child(4)' }] },
    { key: 'r2-weak', round: 2, task: 'Finding the weakest thumbnail', dur: 1.8, tab: 0, page: 'stats', ptr: [{ dt: 0.8, at: '.ct-row[data-v="agents"] .ct-ctr b' }] },
    { key: 'r2-gen', round: 2, task: 'Generating with bigger text', dur: 3.0, tab: 1, page: 'gen', ptr: [{ dt: 0.95, at: '.ct-go', click: true }] },
    { key: 'r2-swap', round: 2, task: 'Replacing the weaker thumbnail', dur: 3.0, tab: 2, page: 'edit', ptr: [{ dt: 1.0, at: '.ct-use', click: true }, { dt: 1.9, at: '.ct-save', click: true }] },
    { key: 'r2-done', round: 2, done: true, task: 'Round 2 done: 5.4% to 6.6% CTR', dur: 1.1, tab: 2, page: 'edit' },
    { key: 'r3-research', round: 3, task: 'Researching your best thumbnails', dur: 2.6, tab: 0, page: 'stats', ptr: [{ dt: 0.6, at: '.ct-sort', click: true }, { dt: 1.8, at: '.ct-row[data-v="agents"] .ct-ctr b' }] },
    { key: 'r3-weak', round: 3, task: 'Finding the weakest thumbnail', dur: 2.0, tab: 0, page: 'stats', ptr: [{ dt: 0.8, at: '.ct-row[data-v="world"] .ct-ctr b' }] },
    { key: 'r3-gen', round: 3, task: 'Generating a new thumbnail', dur: 3.6, tab: 1, page: 'gen', ptr: [{ dt: 1.05, at: '.ct-go', click: true }] },
  ],
  tail: 0,
  of: { 3: 4 }, // round 3 is cut off while it generates; it would replace next
  follow: [
    { at: ['r1-gen', 0.25], ask: 'How’s it going?', reply: 'Round 1. Your weakest thumbnail sits at 3.2% CTR, so I’m making it a replacement now.' },
    { at: ['r2-research', 0.05], ask: 'Make the text bigger on the next one.', reply: 'Got it. Bigger text from this round on.' },
    { at: ['r3-research', 0.25], ask: 'Any update?', reply: 'Round 2 done: bigger text took that video from 5.4% to 6.6% CTR. On round 3 now.' },
  ],
  pages(x) {
    const row = (id) => {
      const v = VIDS[id];
      const pics = id === 'agents' ? [v.pic, ...NEW] : [v.pic];
      return `<div class="ct-row" data-v="${id}">
        <span class="ct-th">${pics.map((p) => `<img src="${p}" width="640" height="360" alt="">`).join('')}</span>
        <span class="ct-t">${x.esc(v.title)}<small>${v.imp} impressions</small></span>
        <span class="ct-ctr"><b>${v.ctr.toFixed(1)}%</b><i class="ct-bar"><i></i></i></span>
        <em class="ct-tag">Weakest</em>
      </div>`;
    };
    const top = (label) => `<header class="ct-top"><img class="ct-av" src="${AVATAR}" width="160" height="160" alt=""><b>Mevesa</b><span>${label}</span></header>`;
    return `<div class="ccl-page ct-page" data-page="stats">
        ${top('Channel analytics')}
        <div class="ct-stats">
          <section class="ct-table">
            <h1>Thumbnail click-through rate<small>Last 28 days</small></h1>
            <div class="ct-head"><span>Video</span><span class="ct-sort">CTR <i>↓</i></span></div>
            <div class="ct-rows">${Object.keys(VIDS).map(row).join('')}</div>
          </section>
          <aside class="ct-notes"><h2>What your best thumbnails share</h2><ul>${NOTES.map((n) => `<li>${x.esc(n)}</li>`).join('')}</ul></aside>
        </div>
      </div>
      <div class="ccl-page ct-page" data-page="gen">
        ${top('Thumbnail lab')}
        <div class="ct-gen">
          <div class="ct-prompt"><label>Prompt</label><p><span class="ct-ptyped"></span><span class="ct-prest"></span></p><span class="ct-go">Generate</span></div>
          <div class="ct-canvas">${NEW.map((p) => `<img class="ct-out" src="${p}" width="1280" height="720" alt="">`).join('')}<i class="ct-sk"></i><span class="ct-genl"><i></i>Generating</span></div>
          <div class="ct-refs"><span>Styled after your top two</span><img src="${VIDS.proof.pic}" width="640" height="360" alt=""><img src="${VIDS.already.pic}" width="640" height="360" alt=""></div>
        </div>
      </div>
      <div class="ccl-page ct-page" data-page="edit">
        ${top('Video details')}
        <div class="ct-edit">
          <label>Title</label><div class="ct-field">AI Agents Are Taking Over the Internet</div>
          <label>Thumbnail</label>
          <div class="ct-slots">
            <div class="ct-slot ct-cur"><span class="ct-sp"><img src="${VIDS.agents.pic}" width="640" height="360" alt=""><img src="${NEW[0]}" width="640" height="360" alt=""></span><b class="ct-was">Live</b><i class="ct-stamp">Replaced</i></div>
            <div class="ct-slot ct-new"><span class="ct-sp"><img src="${NEW[0]}" width="640" height="360" alt=""><img src="${NEW[1]}" width="640" height="360" alt=""></span><b class="ct-is">New</b><span class="ct-use">Use this one</span></div>
          </div>
          <div class="ct-test"><h3>A/B test, 2 days</h3>
            <div class="ct-ab"><span>New</span><i class="ct-abar ct-an"><i></i></i><b class="ct-anv"></b></div>
            <div class="ct-ab"><span>Live</span><i class="ct-abar ct-ac"><i></i></i><b class="ct-acv"></b></div>
          </div>
          <div class="ct-actions"><span class="ct-saved">✓ Saved</span><span class="ct-save">Save</span></div>
        </div>
      </div>`;
  },
  bind(root) {
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const rows = Object.fromEntries($$('.ct-row').map((n) => [n.dataset.v, n]));
    return {
      rows, agentPics: $$('.ct-row[data-v="agents"] .ct-th img'), agentCtr: $('.ct-row[data-v="agents"] .ct-ctr b'), agentBar: $('.ct-row[data-v="agents"] .ct-bar i'),
      bars: Object.fromEntries(Object.entries(rows).map(([k, n]) => [k, n.querySelector('.ct-bar i')])), sort: $('.ct-sort'),
      notes: $$('.ct-notes li'), typed: $('.ct-ptyped'), rest: $('.ct-prest'), go: $('.ct-go'), outs: $$('.ct-out'), sk: $('.ct-sk'), genl: $('.ct-genl'),
      curPics: $$('.ct-cur img'), newPics: $$('.ct-new img'), cur: $('.ct-cur'), neu: $('.ct-new'), use: $('.ct-use'), save: $('.ct-save'), saved: $('.ct-saved'),
      an: $('.ct-an i'), ac: $('.ct-ac i'), anv: $('.ct-anv'), acv: $('.ct-acv'), last: { prompt: -1, n: -1, ctr: null, tests: -1 },
    };
  },
  paint(p, t, T) {
    paintStats(p, t, T);
    paintLab(p, t, T);
    paintSwap(p, t, T);
  },
};

// when each round's Save lands: the agents video's live thumbnail and rate change then
const savedAt = (T) => [T.clicks['r1-swap'][1] + 0.1, T.clicks['r2-swap'][1] + 0.1];

// the analytics page: the agents video's live thumbnail and rate; the table by date, sorted by rate in round 1 (the
// agents video sinks) and re-sorted in round 3 (it climbs one); the weakest row marked from the moment the cursor reaches
// its rate until it is replaced; the notes, three as round 1 reads the winners, the fourth with the user's note
function paintStats(p, t, T) {
  const S = T.S, saved = savedAt(T);
  const gen = saved.filter((s) => t >= s).length;
  p.agentPics.forEach((n, i) => { n.style.opacity = i === gen ? '1' : '0'; });
  const ctr = [3.2, 5.4, 6.6][gen];
  if (p.last.ctr !== ctr) { p.agentCtr.textContent = `${ctr.toFixed(1)}%`; p.agentBar.style.width = `${ctr * 10}%`; p.last.ctr = ctr; }
  for (const [k, n] of Object.entries(p.bars)) if (k !== 'agents') n.style.width = `${VIDS[k].ctr * 10}%`;
  const orders = [[0, ['proof', 'agents', 'already', 'world']], [S['r1-weak'].a + 0.65, ['proof', 'already', 'world', 'agents']], [S['r3-research'].a + 0.7, ['proof', 'already', 'agents', 'world']]];
  let i = 0;
  while (i + 1 < orders.length && t >= orders[i + 1][0]) i++;
  const f = i === 0 ? 1 : inOutCubic(seg(t, orders[i][0], orders[i][0] + 0.6));
  const marks = [['agents', S['r1-weak'].a + 1.4, saved[0]], ['agents', S['r2-weak'].a + 0.7, saved[1]], ['world', S['r3-weak'].a + 0.7, Infinity]];
  for (const [k, n] of Object.entries(p.rows)) {
    const from = orders[Math.max(0, i - 1)][1].indexOf(k), to = orders[i][1].indexOf(k);
    n.style.transform = `translateY(${(lerp(from, to, f) * ROW_H).toFixed(2)}px)`;
    const m = marks.find(([id, a, b]) => id === k && t >= a && t < b);
    n.classList.toggle('is-weak', !!m);
    n.style.setProperty('--ct-w', m ? outCubic(seg(t, m[1], m[1] + 0.3)).toFixed(3) : '0');
  }
  p.sort.style.background = `rgba(124,58,237,${(0.08 + 0.14 * Math.max(press(t, T.clicks['r1-weak'][0]), press(t, T.clicks['r3-research'][0]))).toFixed(3)})`;
  const noteAt = [S['r1-research'].a + 0.7, S['r1-research'].a + 1.3, S['r1-research'].a + 1.9, S['r2-note'].a + 0.25];
  p.notes.forEach((n, j) => {
    const o = outCubic(seg(t, noteAt[j], noteAt[j] + 0.3));
    n.style.opacity = o.toFixed(3);
    n.style.transform = `translateX(${((1 - o) * 14).toFixed(2)}px)`;
  });
}

// the lab: this round's prompt types in, Generate is pressed, the skeleton shimmers, the thumbnail lands (round 3's is
// still generating when the spot ends)
function paintLab(p, t, T) {
  const S = T.S, keys = ['r1-gen', 'r2-gen', 'r3-gen'];
  const g = t < S['r2-gen'].a ? 0 : t < S['r3-gen'].a ? 1 : 2;
  const ga = S[keys[g]].a, go = T.clicks[keys[g]][0], land = ga + 2.55;
  const prompt = PROMPTS[g], n = streamCount(prompt, ga + 0.1, 110, t);
  if (p.last.prompt !== g || p.last.n !== n) { p.typed.textContent = prompt.slice(0, n); p.rest.textContent = prompt.slice(n); p.last.prompt = g; p.last.n = n; }
  p.go.style.transform = `scale(${(1 - 0.06 * press(t, go)).toFixed(4)})`;
  const out = g < 2 ? outCubic(seg(t, land, land + 0.45)) : 0;
  p.outs.forEach((o, j) => {
    o.style.opacity = (j === g ? out : 0).toFixed(3);
    o.style.transform = j === g ? `scale(${lerp(1.04, 1, out).toFixed(4)})` : '';
  });
  const busy = t >= go && (g === 2 || t < land);
  p.sk.style.opacity = busy ? '1' : '0';
  p.sk.style.backgroundPosition = `${(-((t - go) * 900) % 1800).toFixed(1)}px 0`;
  p.genl.style.opacity = busy ? '1' : '0';
  p.genl.firstElementChild.style.transform = `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
}

// the swap: the test's bars grow, "Use this one" takes the new thumbnail, the live one is stamped Replaced, then Save
function paintSwap(p, t, T) {
  const r = t < T.S['r2-swap'].a ? 0 : 1, key = ['r1-swap', 'r2-swap'][r], sa = T.S[key].a, [use, save] = T.clicks[key];
  p.curPics.forEach((o, j) => { o.style.opacity = j === r ? '1' : '0'; });
  p.newPics.forEach((o, j) => { o.style.opacity = j === r ? '1' : '0'; });
  if (p.last.tests !== r) { p.anv.textContent = `${TESTS[r].neu.toFixed(1)}%`; p.acv.textContent = `${TESTS[r].cur.toFixed(1)}%`; p.last.tests = r; }
  const bars = outCubic(seg(t, sa + 0.15, sa + 0.85));
  p.an.style.width = `${(TESTS[r].neu * 12 * bars).toFixed(2)}%`;
  p.ac.style.width = `${(TESTS[r].cur * 12 * bars).toFixed(2)}%`;
  const u = outCubic(seg(t, use + 0.05, use + 0.4));
  p.cur.style.setProperty('--ct-u', u.toFixed(3));
  p.neu.style.setProperty('--ct-u', u.toFixed(3));
  p.use.style.transform = `scale(${(1 - 0.06 * press(t, use)).toFixed(4)})`;
  p.save.style.transform = `scale(${(1 - 0.06 * press(t, save)).toFixed(4)})`;
  p.saved.style.opacity = outCubic(seg(t, save + 0.15, save + 0.4)).toFixed(3);
}

const loop = makeLoop(script);
export default loop.beat;
export const { LEN, ASK, TYPE_CPS } = loop;
