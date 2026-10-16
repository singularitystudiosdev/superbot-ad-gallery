/* The presenter's voicelines and the window (real seconds after the click) each one is timed to.
   Paced at ~0.44 s a word with short gaps; the UI beat for each line lands in its first second and
   nothing waits on a click after the first one. Press C in the page to show them as a prompter. */
window.SB_CUES = {
  pre: [
    "What's cool about superbot is unlike Devin or Perplexity, superbot uses all your existing subscriptions, so that are never upcharged API pricing.",
    "I'll show you a quick example of what it does.",
    'Say I want to make a thumbnail from my latest video.',
  ],
  timed: [
    { a: 0.0, b: 2.5, text: '(it types the request and sends it)', action: true },
    { a: 2.6, b: 6.1, text: 'There, it has switched to my ChatGPT subscription,' },
    { a: 6.25, b: 12.0, text: 'and look there, you see how it also connected to my YouTube channel,' },
    { a: 12.15, b: 19.2, text: "it can work with your platforms so you don't need to give much context at all." },
    { a: 19.35, b: 22.5, text: 'And now it is using GPT Image 2.' },
    { a: 22.65, b: 26.5, text: 'Now we wait for it to generate.' },
    { a: 26.65, b: 32.9, text: 'Oh, and it gave me 3 variants to pick from. Awesome, I like that one.' },
    { a: 32.95, b: 35.5, text: 'And then now I just ask:' },
    { a: 35.55, b: 39.9, text: '"Use this one and upload it to YouTube A/B tests."' },
    { a: 39.9, b: 43.2, text: '(it uploads and reports back)', action: true },
    { a: 43.22, b: 48.9, text: 'Lemme check on my channel, and there it is right there, all uploaded.' },
    { a: 49.02, b: 52.3, text: 'Check out superbot.gg in the link below!' },
  ],
};
