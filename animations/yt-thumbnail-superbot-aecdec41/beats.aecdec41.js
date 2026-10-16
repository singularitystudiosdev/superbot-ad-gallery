// The timing table. t = seconds after the click that starts playback.
// Every beat is placed from the voiceline it illustrates (VO) or from the keystrokes that precede it, so retiming a
// line moves everything that hangs off it. Speech is budgeted at ~155 wpm (2.6 words/s) plus a breath between lines.

export const PROMPT1 = 'make a thumbnail from my latest video';
export const PROMPT2 = 'use this one and upload it to youtube a:b tests';

// mulberry32: the same keystroke rhythm on every play, so the cue sheet stays true
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Keystroke times for a ~80 wpm typist: 95-165 ms per key, a beat after each space, the odd hesitation between
// words, shift held for ':' and capitals.
export function keystrokes(text, start, seed) {
  const r = rng(seed);
  const times = [];
  let t = start;
  for (let i = 0; i < text.length; i++) {
    if (i > 0) {
      let d = 0.095 + r() * 0.07;
      if (text[i - 1] === ' ') d += 0.03 + r() * 0.05;
      if (text[i - 1] === ' ' && r() < 0.18) d += 0.16 + r() * 0.12;
      if (/[:A-Z]/.test(text[i])) d += 0.09;
      t += d;
    }
    times.push(t);
  }
  return times;
}

const T = {};
const VO = [];
const say = (id, t, text) => {
  const words = text.split(/\s+/).length;
  VO.push({ id, t, dur: words / 2.6, text });
  return t;
};

// 1. click: the cursor glides to the composer and types the ask
T.move1 = 0.1;
T.click1 = T.move1 + 0.75;
T.type1 = T.click1 + 0.2;
export const KEYS1 = keystrokes(PROMPT1, T.type1, 11);
T.send1 = KEYS1[KEYS1.length - 1] + 0.4;
T.aside1 = T.send1 + 0.3;

// 2. routing to the ChatGPT subscription
T.sw1 = T.send1 + 0.45;
T.sw1Done = T.sw1 + 1.2;
T.sub = T.sw1Done + 0.35;
const vo4a = say('4a', T.sw1Done + 0.25, 'there it has switched to my ChatGPT subscription,');

// 3. YouTube connects and reads the latest upload
T.yt = vo4a + 2.9;
T.ytDone = T.yt + 0.9;
const vo4b = say('4b', vo4a + 3.4, 'and look there, you see how it also connected to my YouTube channel,');
T.vid = T.ytDone + 0.55;
// superbot finds the video on its own while the line says it needs no context
const vo4c = say('4c', vo4b + 5.3, "it can work with your platforms so you don't need to give much context at all");
T.say1 = vo4c + 0.4;
T.say1End = T.say1 + 2.6;

// 4. GPT Image 2 and the wait
T.sw2 = vo4c + 5.9;
T.sw2Done = T.sw2 + 0.9;
const vo5 = say('5', T.sw2Done - 0.1, 'and now it is using GPT Image 2');
T.gen = T.sw2Done + 0.45;
const vo6 = say('6', vo5 + 3.0, 'now we wait for it to generate');
T.genDone = vo6 + 4.4;
T.say2 = T.genDone + 0.9;
T.say2End = T.say2 + 1.2;

// 5. the one thumbnail lands; click it to attach it to the next ask
const vo7 = say('7', T.genDone + 1.0, 'oh and there it is, awesome, I like that one');
T.movePick = vo7 + 1.5;
T.hoverPick = T.movePick + 0.8;
T.clickPick = T.hoverPick + 0.35;
T.attach = T.clickPick + 0.25;

// 6. the second ask
const vo8 = say('8', vo7 + 4.0, 'and now I just ask: use this one and upload it to YouTube A:B tests');
T.move2 = vo8 + 0.2;
T.click2 = T.move2 + 0.7;
T.type2 = T.click2 + 0.2;
export const KEYS2 = keystrokes(PROMPT2, T.type2, 23);
T.send2 = KEYS2[KEYS2.length - 1] + 0.4;
T.aside2 = T.send2 + 0.25;

// 7. upload + Test & compare, then playback HOLDS on the finished chat (T.done)
T.up = T.send2 + 0.45;
T.upDone = T.up + 1.6;
T.tool3 = T.upDone + 0.2;
T.tool3Done = T.tool3 + 0.5;
T.tool4 = T.tool3Done + 0.15;
T.tool4Done = T.tool4 + 0.8;
T.say3 = T.tool4Done + 0.3;
T.say3End = T.say3 + 1.8;
T.done = T.say3End + 0.6;

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
  [0, 1], [T.yt - 0.3, 1], [T.yt + 0.7, 1.06], [T.sw2 - 0.4, 1.06], [T.sw2 + 0.5, 1],
  [T.genDone - 0.3, 1], [T.genDone + 0.6, 1.1], [T.move2 - 0.1, 1.1], [T.move2 + 0.6, 1],
];

export { T, VO };
