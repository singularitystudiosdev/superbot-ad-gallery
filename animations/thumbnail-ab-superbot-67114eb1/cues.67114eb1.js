/* The presenter's voicelines and the window (real seconds after the click) each one is timed to.
   Paced at ~0.44 s a word with short gaps (the latest-upload card runs quicker, so lines 2 and 3 are
   brisk); the UI beat for each line lands in its first second and nothing waits on a click after the
   first one. Press C in the page to show them as a prompter. */
window.SB_CUES = {
  pre: [
    "What's cool about superbot is unlike Devin or Perplexity, superbot uses all your existing subscriptions, so that are never upcharged API pricing.",
    "I'll show you a quick example of what it does.",
    'Say I want to make a thumbnail from my latest video.',
  ],
  timed: [
    { a: 0.0, b: 2.5, text: '(it types the request and sends it)', action: true },
    { a: 2.6, b: 6.1, text: 'There, it has switched to my ChatGPT subscription,' },
    { a: 6.25, b: 10.5, text: 'and look there, you see how it also connected to my YouTube channel,' },
    { a: 10.6, b: 15.1, text: "it can work with your platforms so you don't need to give much context at all." },
    { a: 15.2, b: 18.2, text: 'And now it is using GPT Image 2.' },
    { a: 18.35, b: 22.2, text: 'Now we wait for it to generate.' },
    { a: 22.35, b: 28.6, text: 'Oh, and it gave me 3 variants to pick from. Awesome, I like that one.' },
    { a: 28.65, b: 31.2, text: 'And then now I just ask:' },
    { a: 31.25, b: 35.5, text: '"Use this one and upload it to YouTube A/B tests."' },
    { a: 35.5, b: 38.9, text: '(it uploads and reports back)', action: true },
    { a: 38.92, b: 44.6, text: 'Lemme check on my channel, and there it is right there, all uploaded. (show your own channel)' },
    { a: 44.72, b: 48.0, text: 'Check out superbot.gg in the link below!' },
  ],
};
