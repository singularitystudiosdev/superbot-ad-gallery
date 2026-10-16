// The timing table. t = seconds after the click that starts playback.
// Every beat is placed from the voiceline it illustrates (VO) or from the keystrokes that precede it, so retiming a
// line moves everything that hangs off it. Speech is budgeted at ~155 wpm (2.6 words/s) plus a breath between lines.

export const PROMPT1 = 'make a thumbnail from my latest video';
export const PROMPT2 = 'use this one and upload it to youtube a:b tests';

// assistant prose, revealed by a character playout like the app's (it streams 55-200 cps)
export const TEXT = {
  lead1: 'Found your latest upload.',
  body1: '“Alex Karp: You Are Right To Be Afraid” went up 2 days ago. I’ll build the thumbnail around the quote.',
  caption: 'Here’s your thumbnail, built around the quote.',
  lead2: 'Your A/B test is live.',
  body2: 'YouTube is testing your current thumbnail against the new one and keeps whichever earns more watch time.',
};
const CPS = 95;
const playout = (text) => text.length / CPS;

// mulberry32: the same keystroke rhythm on every play, so the cue sheet stays true
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Keystroke times: one character every KEY_GAP seconds on average (the user's spec, 0.02 s), with a little seeded
// jitter and a slightly longer beat after spaces so the text still lands in small bursts rather than a ruler-even feed.
export const KEY_GAP = 0.02;
export function keystrokes(text, start, seed) {
  const r = rng(seed);
  const gaps = [];
  for (let i = 1; i < text.length; i++) gaps.push((text[i - 1] === ' ' ? 1.4 : 0.85) + r() * 0.3);
  const scale = (KEY_GAP * gaps.length) / gaps.reduce((a, b) => a + b, 0);
  const times = [start];
  for (const d of gaps) times.push(times[times.length - 1] + d * scale);
  return times;
}

const T = {};
const VO = [];
const say = (id, t, text) => {
  const words = text.split(/\s+/).length;
  VO.push({ id, t, dur: words / 2.6, text });
  return t;
};

// 1. click: the pointer glides into the home bar and types the ask; Enter docks the bar under the new chat
// no scripted pointer: the click itself wakes the bar, and typing follows almost at once
T.click1 = 0.15;
T.type1 = 0.3;
export const KEYS1 = keystrokes(PROMPT1, T.type1, 11);
T.send1 = KEYS1[KEYS1.length - 1] + 0.4;
T.docked = T.send1 + 0.6;
T.aside1 = T.send1 + 0.3;
// the sent bubble lands once the bar has nearly docked, so the moving bar never sweeps across it
T.bubble1 = T.send1 + 0.45;
T.head1 = T.send1 + 0.65;

// 2. Auto routes the turn to the ChatGPT subscription
T.sw1 = T.send1 + 0.8;
T.sw1Done = T.sw1 + 1.2;
T.sw1Step = T.sw1Done + 0.3;
const vo4a = say('4a', T.sw1Done + 0.25, 'there it has switched to my ChatGPT subscription,');

// 3. YouTube connects and reads the latest upload
T.yt = vo4a + 2.9;
T.ytDone = T.yt + 0.9;
T.ytStep1 = T.ytDone + 0.25;
T.ytStep2 = T.ytStep1 + 0.35;
T.ytStep2Done = T.ytStep2 + 1.6;
const vo4b = say('4b', vo4a + 3.4, 'and look there, you see how it also connected to my YouTube channel,');
const vo4c = say('4c', vo4b + 5.3, "it can work with your platforms so you don't need to give much context at all");
T.lead1 = vo4c + 0.4;
T.lead1End = T.lead1 + playout(TEXT.lead1);
T.body1 = T.lead1End + 0.2;
T.body1End = T.body1 + playout(TEXT.body1);

// 4. GPT Image 2 and the wait
T.sw2 = vo4c + 5.9;
T.sw2Done = T.sw2 + 0.9;
const vo5 = say('5', T.sw2Done - 0.1, 'and now it is using GPT Image 2');
T.gen = T.sw2Done + 0.45;
const vo6 = say('6', vo5 + 3.0, 'now we wait for it to generate');
T.genDone = vo6 + 4.4;
T.prov = T.genDone + 0.3;
T.cap = T.genDone + 0.45;
T.capEnd = T.cap + playout(TEXT.caption);
T.turn1End = T.capEnd + 0.2;

// 5. the thumbnail lands; the pointer settles on it for "I like that one"
const vo7 = say('7', T.genDone + 1.0, 'oh and there it is, awesome, I like that one');
T.movePick = vo7 + 1.6;
T.hoverPick = T.movePick + 0.8;

// 6. the second ask
const vo8 = say('8', vo7 + 4.0, 'and now I just ask: use this one and upload it to YouTube A:B tests');
// the ask types out as the speaker reaches the quoted words, after "and now I just ask:"
T.move2 = vo8 + 1.0;
T.click2 = T.move2 + 0.7;
T.type2 = T.click2 + 0.2;
export const KEYS2 = keystrokes(PROMPT2, T.type2, 23);
T.send2 = KEYS2[KEYS2.length - 1] + 0.4;
T.aside2 = T.send2 + 0.25;
T.head2 = T.send2 + 0.35;

// 7. upload + Test & compare, then playback HOLDS on the finished chat (T.done)
T.up = T.send2 + 0.6;
T.upDone = T.up + 1.6;
T.ab = T.upDone + 0.2;
T.abDone = T.ab + 0.9;
T.lead2 = T.abDone + 0.3;
T.lead2End = T.lead2 + playout(TEXT.lead2);
T.body2 = T.lead2End + 0.2;
T.body2End = T.body2 + playout(TEXT.body2);
T.turn2End = T.body2End + 0.2;
T.done = T.turn2End + 0.6;

// 8. the creator cuts to their own channel here; nothing in the animation plays under it
export const CREATOR = ['lemme check on my channel, and there it is right there, all uploaded'];

// 9. end card: plays from the hold on the NEXT click
T.end = T.done + 0.05;
const vo10 = say('10', T.end + 0.5, 'check out superbot.gg in the link below!');
T.fin = vo10 + 3.4;

// lines spoken over the idle screen, before the click
export const PRE = [
  "What's cool about superbot is, unlike Devin or Perplexity, superbot uses all your existing subscriptions, so you are never upcharged API pricing.",
  "I'll show you a quick example of what it does.",
  'Say I want to make a thumbnail from my latest video. (click)',
];

// camera: [t, scale], eased between keys, origin low-centre so the composer never leaves frame
export const CAM = [
  [0, 1], [T.yt - 0.3, 1], [T.yt + 0.8, 1.05], [T.sw2 - 0.5, 1.05], [T.sw2 + 0.5, 1],
  [T.genDone - 0.4, 1], [T.genDone + 0.6, 1.08], [T.move2 - 0.2, 1.08], [T.move2 + 0.7, 1],
];

export { T, VO };
