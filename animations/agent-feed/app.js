/* Superbot Optimizer — agent feed engine.
   Plays a scripted sweep: scan rows, thinking blocks, result cards, summary. */

// ---------- timing primitives (pause + speed aware) ----------
let paused = false;
let speed = 1;
let mode = 'ask'; // nag | ask | auto
let wakeWaiters = [];

function onWake() { wakeWaiters.splice(0).forEach((fn) => fn()); }

function sleep(ms) {
  return new Promise((resolve) => {
    const start = Date.now();
    let left = ms;
    let timer = null;
    const tick = () => {
      if (paused) { wakeWaiters.push(tick); return; }
      const delta = Date.now() - start;
      left -= delta;
      if (left <= 0) { resolve(); return; }
      start = Date.now();
      timer = setTimeout(tick, left / speed);
    };
    timer = setTimeout(tick, ms / speed);
  });
}

const $feed = document.getElementById('feed');
const $status = document.getElementById('status');
const $statusText = document.getElementById('status-text');

function setStatus(text, busy) {
  // status indicator was removed from the topbar — keep the calls cheap no-ops
  if (!$status || !$statusText || $status.hidden) return;
  $statusText.textContent = text;
  $status.classList.toggle('is-busy', !!busy);
}

function scrollFeed() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

const MAX_FEED_ENTRIES = 12;

function addEntry(node) {
  const wrap = document.createElement('div');
  wrap.className = 'entry';
  wrap.appendChild(node);
  $feed.appendChild(wrap);
  // once the log is full, the oldest entries go away
  while ($feed.children.length > MAX_FEED_ENTRIES) {
    const oldest = $feed.firstElementChild;
    oldest.style.opacity = '0';
    setTimeout(() => oldest.remove(), 350);
  }
  scrollFeed();
  return wrap;
}

// ---------- renderers ----------
const ICONS = { merge: '⑂', cache: '⚡', skill: '✦', rule: '§' };

function renderEvent(e) {
  const row = document.createElement('div');
  row.className = 'timestamp-row';
  row.textContent = e.time ? `${e.time} — ` : '';
  const span = document.createElement('span');
  span.style.color = 'var(--dim)';
  span.textContent = e.text;
  row.appendChild(span);
  addEntry(row);
}

// ---------- approval mode ----------
document.querySelectorAll('#mode-seg .seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    document.querySelectorAll('#mode-seg .seg-btn').forEach((b) => b.classList.toggle('is-selected', b === btn));
  });
});

const nowHM = () => new Date().toTimeString().slice(0, 5);

function renderScan(e) {
  const node = document.createElement('div');
  node.className = 'scan';
  node.innerHTML = `<span class="scan-icon">▣</span>
    <span class="scan-label-text"></span>
    <span class="scan-result dim"></span>
    <span class="scan-tail"></span>`;
  node.querySelector('.scan-label-text').textContent = e.label;
  const resultEl = node.querySelector('.scan-result');
  const tailEl = node.querySelector('.scan-tail');
  tailEl.textContent = '';
  addEntry(node);
  setStatus(e.label.toLowerCase(), true);
  return (async () => {
    await sleep(e.ms);
    resultEl.textContent = e.result;
    tailEl.innerHTML = '<span class="tick">✓</span>';
    node.classList.add('is-done');
    setStatus('analyzing', true);
    await sleep(400);
  })();
};

function renderThinking(e) {
  const node = document.createElement('div');
  node.className = 'thinking is-active';
  node.innerHTML = `
    <div class="thinking-head">
      <span class="thinking-caret">▶</span>
      <span class="thinking-title">Thinking</span>
      <span class="thinking-preview"></span>
    </div>
    <div class="thinking-body"><div class="thinking-body-inner">
      <div class="thinking-lines"></div>
    </div></div>`;
  const previewEl = node.querySelector('.thinking-preview');
  const linesEl = node.querySelector('.thinking-lines');

  node.querySelector('.thinking-head').addEventListener('click', () => {
    node.classList.toggle('open');
  });

  addEntry(node);
  scrollFeed();

  return (async () => {
    // stream the first thought into the collapsed preview, Cursor-style
    const first = e.lines[0];
    for (let i = 1; i <= first.length; i++) {
      previewEl.textContent = first.slice(0, i);
      if (node.classList.contains('open')) scrollFeed();
      await sleep(14);
    }
    // then fill the body whether or not it is expanded
    for (const line of e.lines) {
      const div = document.createElement('div');
      div.className = 'thinking-line';
      linesEl.appendChild(div);
      for (let i = 1; i <= line.length; i++) {
        div.textContent = line.slice(0, i);
        if (node.classList.contains('open')) scrollFeed();
        await sleep(9);
      }
    }
    node.classList.remove('is-active');
    previewEl.textContent = first;
    node.querySelector('.thinking-title').textContent = 'Thought';
    setStatus('reviewing results', true);
    // collapse after it is done (demo mode ?open=1 keeps everything open)
    if (!openParam && node.classList.contains('open')) {
      await sleep(700);
      node.classList.remove('open');
    }
    await sleep(300);
  })();
};

function buildTable(details) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const col of details.cols) {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (const row of details.rows) {
    const tr = document.createElement('tr');
    row.forEach((cell, i) => {
      const td = document.createElement('td');
      td.textContent = cell;
      if (i === 0) td.className = 'ide-cell';
      if (i === row.length - 1 && /tok|—/.test(cell)) td.className = 'saved-cell';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

function renderCard(e) {
  const wantsApproval = mode === 'ask';
  const node = document.createElement('div');
  node.className = 'card' + (wantsApproval ? ' pending' : '');
  node.innerHTML = `
    <div class="card-head">
      <span class="card-icon">${ICONS[e.icon] || '◆'}</span>
      <span class="card-titles">
        <div class="card-title"></div>
        <div class="card-save"></div>
      </span>
      <span class="card-chevron">▼</span>
    </div>
    <div class="card-details"><div class="card-details-inner">
      <div class="card-details-pad">
        <div class="card-note"></div>
      </div>
    </div></div>`;
  node.querySelector('.card-title').textContent = e.title;
  node.querySelector('.card-save').textContent = wantsApproval
    ? e.save.replace(/^Saved /, 'Would save ')
    : e.save;
  node.querySelector('.card-note').textContent = e.note;
  node.querySelector('.card-details-pad').appendChild(buildTable(e.details));

  node.querySelector('.card-head').addEventListener('click', () => {
    node.classList.toggle('open');
  });

  addEntry(node);
  scrollFeed();

  if (!wantsApproval) {
    return (async () => {
      await sleep(900);
      setStatus('scanning for next optimization', true);
    })();
  }

  // ask-first: orange approval card, playback waits on the decision
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  actions.innerHTML = `
    <button class="mini-btn" data-view>View</button>
    <button class="mini-btn" data-approve>Approve</button>
    <button class="mini-btn" data-skip>Skip</button>`;
  node.appendChild(actions);
  setStatus('waiting for your approval', true);
  scrollFeed();

  return new Promise((resolve) => {
    const decide = (approved) => {
      if (decided) return;
      decided = true;
      actions.remove();
      node.classList.toggle('pending', false);
      if (approved) {
        node.classList.add('is-approved');
        node.querySelector('.card-save').textContent = e.save;
        const note = document.createElement('div');
        note.className = 'approve-note';
        note.textContent = 'approved — applied just now';
        node.appendChild(note);
      } else {
        node.classList.add('is-skipped');
        node.querySelector('.card-save').textContent = 'skipped — not applied';
      }
      setStatus('scanning for next optimization', true);
      resolve();
    };
    let decided = false;
    actions.querySelector('[data-view]').addEventListener('click', () => node.classList.toggle('open'));
    actions.querySelector('[data-approve]').addEventListener('click', () => decide(true));
    actions.querySelector('[data-skip]').addEventListener('click', () => decide(false));
    // ?autoapprove=N — demo hook: decide every pending card after N ms
    const auto = parseInt(new URLSearchParams(location.search).get('autoapprove'), 10);
    if (auto > 0) setTimeout(() => decide(true), auto);
  });
};

function renderSummary(e) {
  const node = document.createElement('div');
  node.className = 'card summary open';
  node.innerHTML = `
    <div class="card-head">
      <span class="card-icon">☰</span>
      <span class="card-titles">
        <div class="card-title"></div>
        <div class="card-save">tap Review for the full ledger</div>
      </span>
      <span class="card-chevron">▼</span>
    </div>
    <div class="summary-block">
      <div class="summary-grid"></div>
      <div class="summary-sub"></div>
      <div class="summary-actions">
        <button class="mini-btn primary" data-open-review>Review</button>
      </div>
    </div>`;
  node.querySelector('.card-title').textContent = e.heading;
  node.querySelector('.summary-sub').textContent = e.sub;
  const grid = node.querySelector('.summary-grid');
  for (const s of e.stats) {
    const stat = document.createElement('div');
    stat.className = 'summary-stat';
    stat.innerHTML = '<div class="v"></div><div class="l"></div>';
    stat.querySelector('.v').textContent = s.value;
    stat.querySelector('.l').textContent = s.label;
    grid.appendChild(stat);
  }
  node.querySelector('[data-open-review]').addEventListener('click', () => openReview());
  addEntry(node);
  scrollFeed();
  return (async () => {
    setStatus('idle', false);
    startCountdown();
    await sleep(600);
  })();
};

const RENDERERS = {
  event: (e) => { renderEvent(e); return Promise.resolve(); },
  scan: renderScan,
  thinking: renderThinking,
  card: renderCard,
  summary: renderSummary,
};

// ---------- playback ----------
let playing = false;

async function play() {
  if (playing) return;
  playing = true;
  for (const entry of SCRIPT) {
    await sleep(700);
    if (entry.type === 'card' && mode === 'nag') {
      renderEvent({ time: nowHM(), text: `heads-up: ${entry.title.toLowerCase()} — ${entry.save.toLowerCase()}` });
      await sleep(600);
    }
    const run = RENDERERS[entry.type](entry);
    if (run) await run;
  }
  playing = false;
}

function resetFeed() {
  stopCountdown();
  $feed.innerHTML = '';
  paused = false;
  setStatus('connecting…', true);
}

// ---------- controls (removed from the page — demo params cover replay/speed) ----------

// ---------- idle countdown ----------
let countdownTimer = null;
function startCountdown() {
  stopCountdown();
  let secs = 30 * 60;
  const fmt = () => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    setStatus(`idle · next sweep in ${m}:${s}`, false);
  };
  fmt();
  countdownTimer = setInterval(() => {
    secs -= 1;
    if (secs <= 0) { stopCountdown(); setStatus('sweeping…', true); return; }
    fmt();
  }, 1000);
}
function stopCountdown() { if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; } }

// ---------- review overlay ----------
const $review = document.getElementById('review');

function openReview() {
  buildReview();
  $review.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeReview() {
  $review.hidden = true;
  document.body.style.overflow = '';
}

$review.addEventListener('click', (ev) => { if (ev.target === $review) closeReview(); });

function buildReview() {
  document.getElementById('review-date').textContent = REVIEW.date;

  const totals = document.getElementById('review-totals');
  totals.innerHTML = '';
  for (const t of REVIEW.totals) {
    const box = document.createElement('div');
    box.className = 'review-total';
    box.innerHTML = '<div class="big"></div><div class="lbl"></div><div class="sub"></div>';
    box.querySelector('.big').textContent = t.value;
    box.querySelector('.lbl').textContent = t.label;
    box.querySelector('.sub').textContent = t.sub;
    totals.appendChild(box);
  }

  const max = Math.max(...REVIEW.week.map((d) => d.tokens));
  const bars = document.getElementById('week-bars');
  bars.innerHTML = '';
  for (const d of REVIEW.week) {
    const bar = document.createElement('div');
    bar.className = 'week-bar' + (d.day === 'Sep 4' ? ' is-today' : '');
    bar.innerHTML = '<div class="bar"></div><div class="day"></div>';
    bar.querySelector('.bar').style.height = `${(d.tokens / max) * 100}%`;
    bar.title = `${d.day} — ${d.tokens}K tokens saved`;
    bar.querySelector('.day').textContent = d.day.replace('Aug ', 'A').replace('Sep ', 'S') + ' ';
    bar.querySelector('.day').textContent = d.day;
    bars.appendChild(bar);
  }

  const tbody = document.getElementById('review-tasks');
  tbody.innerHTML = '';
  for (const t of REVIEW.tasks) {
    const tr = document.createElement('tr');
    for (const [key, cls] of [['time', 'dim'], ['task', ''], ['ide', 'ide-cell'], ['tokens', 'flair'], ['cost', 'dim'], ['minutes', 'dim']]) {
      const td = document.createElement('td');
      td.textContent = key === 'minutes' ? `${t.minutes} min` : t[key];
      if (cls) td.className = cls;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

// ---------- starfield (from superbot-console) ----------
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];

function seedStars() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stars = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.1 + 0.2,
    phase: Math.random() * Math.PI * 2,
    rate: 0.4 + Math.random() * 1.2,
  }));
}
seedStars();
addEventListener('resize', seedStars);

(function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(s.phase + t / 1000 * s.rate));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
})(0);

// ---------- tabs ----------
let lastTab = 'feed';
function activateTab(name) {
  for (const t of ['feed', 'chat']) {
    document.getElementById(`tab-${t}`)?.classList.remove('is-active');
    document.getElementById(`${t}-view`).hidden = t !== name;
  }
  document.getElementById(`tab-${name}`).classList.add('is-active');
  lastTab = name;
  if (name === 'feed') scrollFeed();
}

document.getElementById('tab-feed').addEventListener('click', () => activateTab('feed'));
document.getElementById('tab-chat').addEventListener('click', () => {
  activateTab('chat');
  document.getElementById('chat-input').focus();
});
document.getElementById('tab-review').addEventListener('click', () => {
  document.getElementById('tab-review').classList.add('is-active');
  openReview();
});
document.getElementById('review-close').addEventListener('click', () => {
  document.getElementById('tab-review').classList.remove('is-active');
  document.getElementById(`tab-${lastTab}`).classList.add('is-active');
  closeReview();
});

// ---------- chat ----------
const $msgs = document.getElementById('chat-msgs');
const $input = document.getElementById('chat-input');

function addChatMsg(who, text) {
  const row = document.createElement('div');
  row.className = `chat-msg ${who}`;
  row.innerHTML = `<span class="chat-bubble"><span class="txt"></span></span>`;
  row.querySelector('.txt').textContent = text;
  $msgs.appendChild(row);
  $msgs.scrollTop = $msgs.scrollHeight;
  return row.querySelector('.txt');
}

function agentReply(text) {
  const typing = document.createElement('div');
  typing.className = 'chat-msg agent chat-typing';
  typing.innerHTML = `<span class="chat-bubble">thinking…</span>`;
  $msgs.appendChild(typing);
  $msgs.scrollTop = $msgs.scrollHeight;

  return (async () => {
    await sleep(1100);
    typing.remove();
    const txt = addChatMsg('agent', '');
    for (let i = 1; i <= text.length; i++) {
      txt.textContent = text.slice(0, i);
      $msgs.scrollTop = $msgs.scrollHeight;
      await sleep(9);
    }
  })();
}

function chatReplyFor(msg) {
  const hit = CHAT_REPLIES.find((r) => r.match.test(msg));
  return hit ? hit.text : CHAT_FALLBACK;
}

let chatting = false;
async function sendChat() {
  const text = $input.value.trim();
  if (!text || chatting) return;
  chatting = true;
  $input.value = '';
  addChatMsg('user', text);
  await agentReply(chatReplyFor(text));
  chatting = false;
  $input.focus();
}

document.getElementById('chat-send').addEventListener('click', sendChat);
$input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') sendChat(); });

// starter suggestions removed — chat starts empty, no greeting

// ---------- go ----------
// ?open=1 pre-expands every thinking block and card (demo/screenshot mode)
const openParam = new URLSearchParams(location.search).has('open');
// ?view=chat opens on the chat pane; &say=<text> auto-sends a message (demo)
const demoParams = new URLSearchParams(location.search);
if (demoParams.get('view') === 'chat') {
  activateTab('chat');
  const say = demoParams.get('say');
  if (say) { $input.value = say; sendChat(); }
}
if (openParam) {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.card:not(.open), .thinking:not(.open)').forEach((n) => n.classList.add('open'));
  });
  observer.observe($feed, { childList: true, subtree: true });
}

play();
