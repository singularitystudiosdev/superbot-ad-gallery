/* The presenter's voicelines and the window (real seconds after the click) each one is timed to.
   Paced at ~0.44 s a word with short gaps; the latest-upload card runs quick, so lines 2 and 3 are
   brisk and the second prompt is read while it types. Nothing waits on a click after the first one.
   Press C in the page to show them as a prompter. */
window.SB_CUES = {
  pre: [
    "What's cool about superbot is unlike Devin or Perplexity, superbot uses all your existing subscriptions, so that are never upcharged API pricing.",
    "I'll show you a quick example of what it does.",
    'Say I want to make a thumbnail from my latest video, one with Nano Banana Pro and one with GPT Image 2.',
  ],
  timed: [
    { a: 0.0, b: 4.0, text: '(it types the request and sends it)', action: true },
    { a: 4.15, b: 7.65, text: 'There, it has switched to my ChatGPT subscription,' },
    { a: 7.8, b: 11.15, text: 'and look there, you see how it also connected to my YouTube channel,' },
    { a: 11.15, b: 14.6, text: "it can work with your platforms so you don't need to give much context at all." },
    { a: 14.7, b: 17.75, text: 'And now it is using Nano Banana Pro and GPT Image 2.' },
    { a: 17.85, b: 21.75, text: 'Now we wait for it to generate.' },
    { a: 21.8, b: 27.15, text: 'Oh, and it gave me one from each. Awesome, I like that one.' },
    { a: 27.2, b: 32.0, text: 'And then now I just ask: "Use this one and upload it to YouTube A/B tests."' },
    { a: 32.0, b: 35.15, text: '(it uploads and reports back)', action: true },
    { a: 35.2, b: 40.95, text: 'Lemme check on my channel, and there it is right there, all uploaded. (show your own channel)' },
    { a: 41.0, b: 44.25, text: 'Check out superbot.gg in the link below!' },
  ],
};
