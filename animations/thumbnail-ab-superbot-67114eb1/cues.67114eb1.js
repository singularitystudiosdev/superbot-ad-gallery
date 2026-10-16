/* The presenter's voicelines and the window (real seconds after the click) each one is timed to.
   Paced at ~0.44 s a word with short gaps; the latest-upload card now runs quick, so lines 2 and 3 are
   brisk and the second prompt is read while it types. Nothing waits on a click after the first one.
   Press C in the page to show them as a prompter. */
window.SB_CUES = {
  pre: [
    "What's cool about superbot is unlike Devin or Perplexity, superbot uses all your existing subscriptions, so that are never upcharged API pricing.",
    "I'll show you a quick example of what it does.",
    'Say I want to make a thumbnail from my latest video.',
  ],
  timed: [
    { a: 0.0, b: 2.5, text: '(it types the request and sends it)', action: true },
    { a: 2.6, b: 6.1, text: 'There, it has switched to my ChatGPT subscription,' },
    { a: 6.25, b: 9.6, text: 'and look there, you see how it also connected to my YouTube channel,' },
    { a: 9.6, b: 13.1, text: "it can work with your platforms so you don't need to give much context at all." },
    { a: 13.15, b: 16.2, text: 'And now it is using GPT Image 2.' },
    { a: 16.3, b: 20.2, text: 'Now we wait for it to generate.' },
    { a: 20.3, b: 25.6, text: 'Oh, and it gave me 3 variants to pick from. Awesome, I like that one.' },
    { a: 25.65, b: 30.5, text: 'And then now I just ask: "Use this one and upload it to YouTube A/B tests."' },
    { a: 30.5, b: 33.6, text: '(it uploads and reports back)', action: true },
    { a: 33.65, b: 39.4, text: 'Lemme check on my channel, and there it is right there, all uploaded. (show your own channel)' },
    { a: 39.45, b: 42.7, text: 'Check out superbot.gg in the link below!' },
  ],
};
