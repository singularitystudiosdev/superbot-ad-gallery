// The pitch, "what's 9 + 10" — a deterministic seekable render.
// Scene 1: the Vine kid asks "what's 9 plus 10?" with the ChatGPT icon on his
// head (clip-gpt.mp4, the icon composited offline from hand keyframes; the
// footage is too dark for a face detector). Scene 2: the ChatGPT-like screen
// (favorite-color's copy of the reference) is asked "What's 9 + 10", streams
// an opener, then a tirade about arithmetic that never stops and keeps
// speeding up, the text wall fills the frame, and the camera flies down
// through it under a motion blur. Scene 3: the same clip, the superbot icon
// on his head (clip-sb.mp4). Scene 4: the same frontend re-skinned in blue,
// pink and purple answers "21." and the camera punches in on the answer.
// Scene 5: Stop burning tokens. Scene 6: the superbot.gg end card.
// render(t) rebuilds every scene from t, so ?t=SECONDS freeze-frames exactly;
// the clips seek to their offset in freeze mode and play in real time live.

const Q = new URLSearchParams(location.search);
const num = (k, d) => { const v = parseFloat(Q.get(k)); return Number.isFinite(v) ? v : d; };

const SPEED = 1;                  // real time: the clips carry their own clock

/* ---- scene 1: "what's 9 plus 10?" (ChatGPT) ---- */
const CLIP_LEN = 2.3;             // 69 frames at 30 fps (1.80 to 4.07 of the Vine, before his "21")
const A_AT = 0, A_END = A_AT + CLIP_LEN;

/* ---- scene 2: the ChatGPT take ---- */
const GPT_AT = A_END;                              // the hard cut
const TYPE_AT = GPT_AT + 0.4, TYPE_DUR = 0.95;     // "What's 9 + 10"
const PRESS_AT = TYPE_AT + TYPE_DUR + 0.45;
const USER_MSG_AT = PRESS_AT + 0.1;
const THINK_AT = USER_MSG_AT + 0.15, THINK_LEN = 0.8;
const RESP_AT = THINK_AT + THINK_LEN, RESP_DUR = 1.1;   // the opener streams
const TIRADE_AT = RESP_AT + 1.2;                        // the tirade begins...
const TIRADE_END = TIRADE_AT + 4.2;                     // ...and never stops until the fly-down
const TIRADE_V0 = 90;                                   // chars/s at the start
const TIRADE_K = 1.0;                                   // accelerating e^{kt}
const TIRADE = " Let us take this one step at a time, because arithmetic deserves care. Nine is a single-digit integer. Ten is the first two-digit integer, the base of our positional numeral system, which means that every number you have ever written is secretly a polynomial in ten. So when you add nine and ten you are really adding nine ones to one ten and zero ones, and the question becomes how those ones and tens interact. In the ones column we have nine plus zero, which is nine. In the tens column we have zero plus one, which is one. Reading the columns back we get one ten and nine ones. That would suggest a certain answer, but I want to be thorough, because addition has a long and surprisingly contested history. The ancient Babylonians worked in base sixty, so for them nine plus ten was a completely different-looking object. The Romans had no zero at all, so IX plus X was a matter of pushing symbols around until they looked right. The Maya had a base-twenty system with a shell for zero. In every one of those systems the sum is the same quantity, but the way you would write it and reason about it differs, and I think that matters for how we understand the question. Then there is the matter of what plus means. In the Peano axioms, addition is defined recursively: a plus zero is a, and a plus the successor of b is the successor of a plus b. So nine plus ten is the successor of nine plus nine, which is the successor of the successor of nine plus eight, and so on, ten successors deep, each one a small formal step that a proof checker could verify. Let me actually unroll that. Nine plus one is ten. Nine plus two is eleven. Nine plus three is twelve. Nine plus four is thirteen. Nine plus five is fourteen. Nine plus six is fifteen. Nine plus seven is sixteen. Nine plus eight is seventeen. Nine plus nine is eighteen. Nine plus ten is, by the same successor step, the number after eighteen. I will hold off naming it for one more moment because there are edge cases worth acknowledging. Are we in the integers, the rationals, the reals, the complex plane? In each of those, nine and ten embed the same way and the sum is unchanged, so no problem there. Are we perhaps in modular arithmetic? Mod twelve, as on a clock face, nine plus ten wraps around to seven. Mod ten, it is nine. Mod two, it is one. Mod nineteen it is zero, which is a fun coincidence that I will get back to. Floating point is another concern. Nine and ten are both exactly representable in IEEE 754 binary64, and their sum is well under two to the fifty-three, so there is no rounding error, but if you were adding nine point one and ten point two you would get twenty-one dot three-oh-oh-oh-oh-oh-oh-oh-oh-oh-oh-oh-oh-two, which is the kind of thing that keeps engineers awake. Then there is the meme. I would be doing you a disservice if I did not mention that there is a well-known short video in which a child, asked what nine plus ten is, answers twenty-one, and is told that he is wrong, and the clip became a cultural touchstone for confidently incorrect answers. So there are, in a sense, two answers in circulation: the mathematical one and the memetic one. Which one you want depends on context, and context is something I genuinely cannot see from here. If you are a teacher preparing a worksheet you want the first. If you are captioning a video you may want the second. If you are testing whether I know the difference, well, now you know that I do. Let me also address units. Nine what plus ten what? Nine apples plus ten oranges is nineteen pieces of fruit, or it is an error, depending on how strict your type system is. Nine meters plus ten seconds is not a number at all. Nine plus ten in a string context, in JavaScript, with the plus operator, gives you nine-ten, the string, which is a famous footgun and honestly a good argument for writing the question down with types. Then there are the different notations for the sum itself. Nineteen. XIX. 10011 in binary. 23 in octal. 13 in hexadecimal. Dix-neuf. Diecinueve. Neunzehn. In some languages nineteen is literally nine-ten, which makes the question sound like its own answer, which I find charming. Historically, nineteen is a prime number, the eighth prime, part of the twin prime pair with seventeen, and the number of years in the Metonic cycle, after which the phases of the moon recur on the same days of the year. That has nothing to do with your question, but I want to be helpful. I also want to be careful. Large language models are known to make arithmetic mistakes, especially on multi-digit problems, and while this one is small, the responsible thing is to show my work, verify it twice, and flag any uncertainty. So let me verify. Nine plus ten. Counting on from nine: ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen. That is ten steps. Counting on from ten: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen. That is nine steps. Both routes land on the same number, which is reassuring, because addition is commutative in every structure we have discussed except the string one. I can also check by subtraction: nineteen minus ten is nine, nineteen minus nine is ten, and both are true. I can check by doubling: nine plus nine is eighteen, and one more is nineteen. I can check on my fingers, metaphorically, since I do not have fingers, which is a limitation I try to be honest about. So the answer, mathematically, in base ten, with no modulus, in the integers, is nineteen, and the answer, memetically, is twenty-one, and the answer, in JavaScript with strings, is nine-ten, and I would be glad to go deeper on any of those. Would you like me to write a short proof in Lean? A table of nine plus n for n from zero to a hundred? An explainer on why children learn the make-ten strategy, where you split ten into one and nine to make nine into ten and then add the rest? Because that strategy is actually beautiful. You take nine, borrow one from the ten, and now you have ten plus nine, which is trivially nineteen. Except you did not need to borrow, because the ten was already a ten, and this is where the strategy shows its true purpose: it is for problems like nine plus seven, where nine plus one is ten and six remain, giving sixteen. For nine plus ten it is overkill, but the habit is worth building. Another way to see it: nine is ten minus one, so nine plus ten is twenty minus one, and twenty minus one is nineteen. I like that one because it uses the structure of the number instead of counting. There is also the algebraic view, where nine plus ten is just a name for a point on the number line, and the question is really asking which name we usually use for that point. We usually use nineteen. Sometimes twenty-one, jokingly. Never nine-ten, unless we are being paid to write JavaScript. And I realize I have not addressed order of operations, which does not apply here because there is only one operation, but if the question had been nine plus ten times two, the answer would depend on whether you meant nine plus twenty or nineteen times two, which is why we invented parentheses and why every calculator app has a scientific mode hidden behind a rotation. I could keep going. There are the philosophical questions: is nineteen discovered or invented, does it exist independently of minds, would an alien civilization also find that nine and ten make nineteen? Most mathematicians think yes, but the debate is real and I would not want to shortchange it. There is the pedagogical question of when children should stop counting on fingers, and the historical question of when Europe adopted Hindu-Arabic numerals, and the computational question of how many transistors it takes to add two five-bit numbers, and the linguistic question of why English says nineteen but ninety and not nine-ten and nine-tens, and every one of those is a rabbit hole I would happily fall down with you. So, to summarize, and I know this has been a lot: nine plus ten is nineteen, unless it is twenty-one, unless it is nine-ten, unless it is seven, and the right answer depends on what you meant, which you did not say, so I have tried to cover the cases, and if I missed one, I apologize, and I can try again, and I am still here, and I can keep listing, and the list has no natural end, because the question, small as it is, touches every part of mathematics at once, and…";

/* ---- the fly-down: the whole transition into the second clip ---- */
const FLY_AT = TIRADE_END, FLY_LEN = num('fly', 0.9);
const FLY_ACCEL = 3.2;
const SETTLE_LEN = 0.45;                    // the blur clears over the arriving clip
const B_AT = FLY_AT + FLY_LEN + 0.1;        // the cut lands near the blur peak
const WALL_AT = TIRADE_AT + (TIRADE_END - TIRADE_AT) * 0.5;

/* ---- scene 3: "what's 9 plus 10?" (superbot) ---- */
const B_END = B_AT + CLIP_LEN;

/* ---- scene 4: the superbot take ---- */
const SB_AT = B_END;                                   // the hard cut
const SB_TYPE_AT = SB_AT + 0.4, SB_TYPE_DUR = 0.95;
const SB_PRESS = SB_TYPE_AT + SB_TYPE_DUR + 0.45;
const SB_MSG_AT = SB_PRESS + 0.1;
const SB_THINK_AT = SB_MSG_AT + 0.15, SB_THINK_LEN = 0.6;
const ANSWER_AT = SB_THINK_AT + SB_THINK_LEN, ANSWER_DUR = 0.25;   // "21."
/* the answer emphasis: a beat after the answer lands the camera punches in
   on the sentence, holds, and relaxes before the cut */
const EMPH_DELAY = num('delay', 0.8);
const EMPH_IN = 0.28, EMPH_HOLD = num('hold', 1.1), EMPH_OUT = 0.45;
// the punch-in depth per frame: the sentence must still fit the width
const EMPH_MAX = num('emph', { '16x9': 7, '4x3': 6, '1x1': 5, '4x5': 4.5 }[window.AR ? window.AR.key : '16x9'] || 7);   // a two-character answer: the favorite-color "Black." punch
const EMPH_END = ANSWER_AT + ANSWER_DUR + EMPH_DELAY + EMPH_IN + EMPH_HOLD + EMPH_OUT;

/* ---- scene 5: stop burning tokens. ---- */
const SIMPLE_AT = EMPH_END + 0.35;

/* ---- scene 6: the superbot.gg end card ---- */
const END_AT = SIMPLE_AT + 1.7;
const DRIFT_AT = 0.7;
const LOGO_GAP = 44;
const END_LEN = 4.8;
const CYCLE = END_AT + END_LEN + 1.8;
window.CYCLE = CYCLE;

const Q_TEXT = "What's 9 + 10";
const OPENER = "Great question! Addition is one of the most fundamental operations in mathematics, and this one is a nice example.";
const ANSWER = "21.";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeOutQuint = (p) => 1 - Math.pow(1 - p, 5);
const easeOutBack = (p) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);
const easeInOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
const inP = (p, dur) => clamp(p / dur, 0, 1);

/* ---- the stage: a 720-high design frame scaled to fill the viewport ---- */
const STAGE_H = 720;
const stageEl = document.querySelector('.stage');
let K = 1;
function fitStage() {
  const ar = window.AR ? window.AR.ratio : 16 / 9;
  const w = Math.round(STAGE_H * ar);
  K = Math.min(innerWidth / w, innerHeight / STAGE_H);
  document.documentElement.style.setProperty('--stage-w', w + 'px');
  document.documentElement.style.setProperty('--stage-k', K.toFixed(5));
}
fitStage();
addEventListener('resize', fitStage);
addEventListener('archange', fitStage);
if (window.self !== window.top || Q.get('ar') !== null) document.body.classList.add('embedded');

/* ---- chrome: the loop veil ---- */
function renderChrome(t) {
  const veil = document.getElementById('veil');
  let v = 0;
  if (t < 0.3) v = 1 - t / 0.3;
  if (t > CYCLE - 1.8) v = clamp((t - (CYCLE - 1.8)) / 1.4, 0, 1);
  veil.style.opacity = v.toFixed(3);
}

/* ---- the clips: real-time playback live, a seek in freeze mode ---- */
const FREEZE = Q.get('t') !== null;
const clips = [
  { box: document.getElementById('clipA'), vid: document.getElementById('vidA'), at: A_AT, end: A_END, started: false },
  { box: document.getElementById('clipB'), vid: document.getElementById('vidB'), at: B_AT, end: B_END, started: false },
];
function playClip(c) {
  c.vid.currentTime = 0;
  c.vid.muted = false;
  // sound when the browser allows it (the gallery opens on a click), muted otherwise
  c.vid.play().catch(() => { c.vid.muted = true; c.vid.play().catch(() => {}); });
}
function renderClips(t, wrapped) {
  for (const c of clips) {
    if (wrapped) c.started = false;
    const live = t >= c.at && t < c.end + 0.05;
    c.box.style.display = live ? 'block' : 'none';
    if (!live) {
      if (c.started && !c.vid.paused) c.vid.pause();
      if (t < c.at) c.started = false;
      continue;
    }
    const off = clamp(t - c.at, 0, CLIP_LEN - 0.001);
    if (FREEZE) {
      if (Math.abs(c.vid.currentTime - off) > 0.02) c.vid.currentTime = off;
    } else if (!c.started) {
      c.started = true;
      playClip(c);
    } else if (Math.abs(c.vid.currentTime - off) > 0.18 && c.vid.readyState >= 2) {
      c.vid.currentTime = off;   // resync if the decoder drifted
    }
    // the arriving second clip clears from under the fly-down's blur
    let blur = 0;
    if (c.at === B_AT && t < B_AT + SETTLE_LEN) blur = 8 * (1 - easeOutQuint(inP(t - B_AT, SETTLE_LEN)));
    c.box.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  }
}

/* ---- the accelerating tirade: chars(u) = v0/k · (e^{ku} − 1) ---- */
const tiradeChars = (u) => Math.floor((TIRADE_V0 / TIRADE_K) * (Math.exp(TIRADE_K * Math.min(u, TIRADE_END - TIRADE_AT)) - 1));

/* ---- the chat interface ---- */
function renderChat(t) {
  const chat = document.getElementById('chatui');
  const head = document.getElementById('gptHead');
  const msgArea = document.getElementById('msgArea');
  const pill = document.getElementById('pill');
  const inputText = document.getElementById('inputText');
  const caret = document.getElementById('caret');
  const placeholder = document.getElementById('placeholder');
  const msgUser = document.getElementById('msgUser');
  const msgAi = document.getElementById('msgAi');
  const dots = document.getElementById('typingDots');
  const suggestions = document.getElementById('suggestions');
  const gptLive = t >= GPT_AT && t < B_AT;
  const sbTake = t >= SB_AT && t < SIMPLE_AT + 0.6;
  const live = gptLive || sbTake;
  chat.style.display = live ? '' : 'none';
  chat.classList.toggle('sb', sbTake);
  if (!live) return;

  const typeAt = sbTake ? SB_TYPE_AT : TYPE_AT;
  const typeDur = sbTake ? SB_TYPE_DUR : TYPE_DUR;
  const msgAt = sbTake ? SB_MSG_AT : USER_MSG_AT;
  const thinkAt = sbTake ? SB_THINK_AT : THINK_AT;
  const thinkLen = sbTake ? SB_THINK_LEN : THINK_LEN;
  const respAt = sbTake ? ANSWER_AT : RESP_AT;

  // during the fly-down the pill gets out of the way
  pill.style.opacity = !sbTake && t >= FLY_AT ? clamp(1 - (t - FLY_AT) / 0.35, 0, 1).toFixed(3) : '1';

  // home state (greeting, composer, suggestions) until the message pops
  const convo = t >= msgAt;
  chat.classList.toggle('home', !convo);
  head.style.opacity = convo ? '0' : '1';
  head.style.filter = convo ? 'blur(3px)' : 'none';
  suggestions.style.display = convo ? 'none' : '';

  // the composer text: the question types and stays in the bar through the
  // stream (take 1); take 2 clears its bar the moment its message pops
  let txt = Q_TEXT.slice(0, Math.ceil(inP(t - typeAt, typeDur) * Q_TEXT.length));
  if (sbTake && t >= SB_MSG_AT) txt = '';
  inputText.textContent = txt;
  placeholder.style.display = txt.length === 0 ? '' : 'none';
  caret.style.opacity = (Math.floor(t * 2.6) % 2 === 0 ? 1 : 0.15).toFixed(2);
  caret.style.display = txt.length > 0 ? '' : 'none';

  // the message area
  const mp = t - msgAt;
  msgUser.textContent = Q_TEXT;
  msgUser.style.opacity = mp > 0 ? inP(mp, 0.18).toFixed(3) : '0';
  msgUser.style.transform = mp > 0 ? `scale(${(0.94 + 0.06 * easeOutBack(inP(mp, 0.28))).toFixed(3)})` : 'none';
  const think = t - thinkAt;
  const thinking = think > 0 && think < thinkLen;
  dots.style.display = thinking ? 'flex' : 'none';
  dots.querySelectorAll('i').forEach((d, i) => {
    d.style.opacity = (0.3 + 0.7 * Math.max(0, Math.sin(t * 7 - i * 0.9))).toFixed(2);
    d.style.transform = `translateY(${(-3 * Math.max(0, Math.sin(t * 7 - i * 0.9))).toFixed(2)}px)`;
  });

  // the response: opener + the accelerating tirade (take 1), the one-line
  // answer (take 2)
  const fp = t - FLY_AT;
  const inDesc = !sbTake && fp >= 0 && fp < FLY_LEN;
  const rsp = t - respAt;
  if (rsp <= 0) {
    msgAi.textContent = '';
    msgAi.style.opacity = '0';
    msgArea.scrollTop = 0;
  } else if (sbTake) {
    msgAi.textContent = ANSWER.slice(0, Math.ceil(inP(rsp, ANSWER_DUR) * ANSWER.length));
    msgAi.style.opacity = '1';
    msgArea.scrollTop = 0;
  } else {
    const streaming = t < TIRADE_END + 0.01;
    msgAi.textContent = t < TIRADE_AT
      ? OPENER.slice(0, Math.ceil(inP(rsp, RESP_DUR) * OPENER.length))
      : OPENER + TIRADE.slice(0, t < TIRADE_END ? Math.min(TIRADE.length, tiradeChars(t - TIRADE_AT)) : TIRADE.length);
    msgAi.style.opacity = '1';
    if (!inDesc) msgArea.scrollTop = streaming ? 1e6 : 1e6;
  }

  // the text wall: the streaming block grows until it fills the frame and
  // pushes the composer off-screen; it holds through the fly-down
  const wallP = sbTake || t <= WALL_AT ? 0 : Math.pow(inP(t - WALL_AT, TIRADE_END - WALL_AT), 1.5);
  if (wallP > 0) {
    msgArea.style.flex = `0 0 ${(56 + 44 * wallP).toFixed(1)}%`;
    msgArea.style.maxHeight = 'none';
    chat.style.justifyContent = wallP >= 1 ? 'flex-start' : '';
    chat.style.paddingBottom = wallP >= 1 ? '0px' : '';
  } else {
    msgArea.style.flex = '';
    msgArea.style.maxHeight = '';
    chat.style.justifyContent = '';
    chat.style.paddingBottom = '';
  }

  // the fly-down: 0.9s of accelerating descent, the text flying up past the
  // camera, the blur riding the descent into the cut
  if (inDesc) {
    const fly = Math.pow(inP(fp, FLY_LEN), FLY_ACCEL);
    const streamed = OPENER.length + tiradeChars(FLY_AT - TIRADE_AT);
    const full = msgArea.scrollHeight - msgArea.clientHeight;
    const start = Math.max(0, full * streamed / (OPENER.length + TIRADE.length));
    msgArea.scrollTop = (start + (full - start) * fly).toFixed(1);
  }
  if (!sbTake && fp >= 0) {
    const smear = fp < FLY_LEN ? 3.2 * Math.pow(inP(fp, FLY_LEN), 2) : 3.2 + 5.8 * inP(fp - FLY_LEN, 0.1);
    chat.style.filter = `blur(${smear.toFixed(2)}px)`;
  } else {
    chat.style.filter = 'none';
  }

  // the answer emphasis: the camera punches in on the sentence, its centre
  // solved to land at the frame's centre at full zoom
  chat.style.transform = 'none';
  const empStart = ANSWER_AT + ANSWER_DUR + EMPH_DELAY;
  if (sbTake && t >= empStart && t < EMPH_END) {
    const e = t < empStart + EMPH_IN ? easeOutQuint(inP(t - empStart, EMPH_IN))
      : t < empStart + EMPH_IN + EMPH_HOLD ? 1
      : 1 - easeInOutSine(inP(t - empStart - EMPH_IN - EMPH_HOLD, EMPH_OUT));
    const range = document.createRange();
    range.selectNodeContents(msgAi);
    const ar = range.getBoundingClientRect();
    const cr = chat.getBoundingClientRect();
    const px = ar.left + ar.width / 2 - cr.left;
    const py = ar.top + ar.height / 2 - cr.top;
    const ox = (cr.width / 2 - EMPH_MAX * px) / (1 - EMPH_MAX) / K;
    const oy = (cr.height / 2 - EMPH_MAX * py) / (1 - EMPH_MAX) / K;
    chat.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
    chat.style.transform = `scale(${(1 + (EMPH_MAX - 1) * e).toFixed(4)})`;
    const dim = 1 - e;
    pill.style.opacity = dim.toFixed(3);
    msgUser.style.opacity = (parseFloat(msgUser.style.opacity || '1') * dim).toFixed(3);
  } else {
    chat.style.transformOrigin = '';
  }
}

/* ---- stop burning tokens. ---- */
function renderSimple(t) {
  const simple = document.getElementById('simple');
  if (t < SIMPLE_AT || t >= END_AT) {
    simple.style.opacity = '0';
    return;
  }
  const s = t - SIMPLE_AT;
  simple.style.opacity = easeOutQuint(clamp(s / 0.35, 0, 1)).toFixed(3);
  simple.style.transform = `scale(${(0.92 + 0.08 * easeOutBack(inP(s, 0.5))).toFixed(3)})`;
  simple.style.filter = s < 0.4 ? `blur(${(5 * (1 - inP(s, 0.4))).toFixed(2)}px)` : 'none';
}

/* ---- the end card: the superbot.gg lockup ---- */
function renderEndcard(t) {
  const overlay = document.getElementById('endcard');
  const bot = document.getElementById('endBot');
  const word = document.getElementById('endWord');
  if (t < END_AT || t >= CYCLE) {
    overlay.style.display = 'none';
    return;
  }
  overlay.style.display = '';
  const s = t - END_AT;
  overlay.style.opacity = easeOutQuint(clamp(s / 0.5, 0, 1)).toFixed(3);
  const stage = { width: overlay.offsetWidth, height: overlay.offsetHeight };   // layout px (the stage is scaled by --k)
  const k = stage.height / 1080;
  overlay.style.setProperty('--k', k.toFixed(4));
  const gap = LOGO_GAP * k;
  const shift = easeOutQuint(clamp((s - DRIFT_AT) / 1.0, 0, 1));
  const w = bot.offsetWidth, h = bot.offsetHeight;
  const wordW = word.offsetWidth;
  const midY = stage.height / 2;
  word.style.opacity = shift.toFixed(3);
  word.style.filter = shift < 1 ? `blur(${(6 * (1 - shift)).toFixed(1)}px)` : 'none';
  const stacked = stage.width / stage.height < 1.2;
  overlay.classList.toggle('stacked', stacked);
  if (stacked) {
    const wordH = word.offsetHeight;
    const top = (stage.height - (h + gap + wordH)) / 2;
    const logoY = midY + (top + h / 2 - midY) * shift;
    bot.style.transform = `translate(${((stage.width - w) / 2).toFixed(1)}px, ${(logoY - h / 2).toFixed(1)}px)`;
    word.style.transform = `translate(${((stage.width - wordW) / 2).toFixed(1)}px, ${(top + h + gap - midY + 20 * (1 - shift)).toFixed(1)}px)`;
    return;
  }
  const total = w + gap + wordW;
  const left = (stage.width - total) / 2;
  const logoX = stage.width / 2 + (left + w / 2 - stage.width / 2) * shift;
  bot.style.transform = `translate(${(logoX - w / 2).toFixed(1)}px, ${(midY - h / 2).toFixed(1)}px)`;
  word.style.transform = `translate(${(left + w + gap + 20 * (1 - shift)).toFixed(1)}px, -50%)`;
}

/* ---- driving ---- */
let lastT = -1;
function render(t) {
  const wrapped = t < lastT;
  lastT = t;
  renderClips(t, wrapped);
  renderChat(t);
  renderSimple(t);
  renderEndcard(t);
  renderChrome(t);
}

const urlT = Q.get('t');
let t0 = performance.now();

if (urlT !== null) {
  let t = clamp(parseFloat(urlT) || 0, 0, CYCLE);
  document.body.classList.add('freeze');
  render(t);
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowRight') { t = clamp(t + 0.25, 0, CYCLE); render(t); }
    if (ev.key === 'ArrowLeft')  { t = clamp(t - 0.25, 0, CYCLE); render(t); }
  });
} else {
  // the clock starts once both clips can play through (capped at 1.5s), so
  // the first frame of scene 1 is the kid, not a black decoder
  const ready = () => clips.every(c => c.vid.readyState >= 3);
  const armed = performance.now();
  function tick(now) {
    if (t0 === null) {
      if (ready() || now - armed > 1500) t0 = now;
      else { requestAnimationFrame(tick); return; }
    }
    let t = ((now - t0) / 1000) * SPEED;
    if (t >= CYCLE) { t0 = now; t = 0; }
    render(t);
    requestAnimationFrame(tick);
  }
  t0 = null;
  render(0);
  requestAnimationFrame(tick);
}

// the recorder contract
window.__V7 = { CYCLE, SPEED };
window.__V7.restart = () => { t0 = performance.now(); lastT = -1; };
