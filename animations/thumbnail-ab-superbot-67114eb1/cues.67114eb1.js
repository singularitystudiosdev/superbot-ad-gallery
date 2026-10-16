/* The presenter's voicelines and the window (seconds after the click) each one is timed to.
   Paced at 0.5 s per word (150 wpm plus 25% headroom) with ~0.6 s between lines; the UI beat for
   each line lands in its first second. Press C in the page to show them as a prompter. */
window.SB_CUES = {
  pre: [
    "What's cool about superbot is unlike Devin or Perplexity, superbot uses all your existing subscriptions, so that are never upcharged API pricing.",
    "I'll show you a quick example of what it does.",
    'Say I want to make a thumbnail from my latest video.',
  ],
  timed: [
    { a: 0.0, b: 5.0, text: '(it types the request and sends it)', action: true },
    { a: 5.6, b: 9.6, text: 'There, it has switched to my ChatGPT subscription,' },
    { a: 10.2, b: 16.7, text: 'and look there, you see how it also connected to my YouTube channel,' },
    { a: 17.3, b: 25.3, text: "it can work with your platforms so you don't need to give much context at all." },
    { a: 25.9, b: 29.4, text: 'And now it is using GPT Image 2.' },
    { a: 30.0, b: 33.5, text: 'Now we wait for it to generate.' },
    { a: 37.0, b: 44.0, text: 'Oh, and it gave me 3 variants to pick from. Awesome, I like that one.' },
    { a: 44.6, b: 47.6, text: 'And then now I just ask:' },
    { a: 47.6, b: 53.0, text: '"Use this one and upload it to YouTube A/B tests."' },
    { a: 53.2, b: 60.8, text: '(wait while it uploads and reports back)', action: true },
    { a: 61.2, b: 67.7, text: 'Lemme check on my channel, and there it is right there, all uploaded.' },
    { a: 68.3, b: 71.8, text: 'Check out superbot.gg in the link below!' },
  ],
};
