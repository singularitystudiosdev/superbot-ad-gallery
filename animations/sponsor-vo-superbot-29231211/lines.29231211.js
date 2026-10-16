/* The voiceover, line by line. Every on-screen beat is keyed to a word in here
   (engine W(lineId, word)), so re-timing the read re-times the whole spot.
   Default pacing: 2.6 words/s with comma and sentence pauses (?wps= to change),
   or exact line starts from a take with ?lines=0,3.1,12.6,... (T to tap them live). */
window.SB_LINES = [
  { id: 'sponsor', text: 'And a word from our sponsor, Superbot.' },
  { id: 'subs', text: "Superbot is an agent that connects to all your existing subscriptions, so unlike Perplexity or Devin, you don't get billed API pricing." },
  { id: 'prov', text: 'It also hooks into all the state of the art systems, like ElevenLabs, Higgsfield, Meshy, fal.ai, anything you know and love, and you only get billed in credits.' },
  { id: 'fifty', text: 'They are also giving out $50 worth of credits to any new user.' },
  { id: 'ask', text: "I'll give you a quick demo before you check it out, but say I want to create a thumbnail for my latest video through my subscriptions, from multiple providers. Instead of switching around tabs, I can just ask it to make one from each: Nano Banana 2, GPT Image 2, and FLUX.2." },
  { id: 'gen', text: "Here you can see it's generating," },
  { id: 'boom', text: 'and boom, there we go, all three generated.' },
  { id: 'pick', text: "Another cool thing is I can just ask it: \"Ok, use this one and upload it to my channel's latest video.\"" },
  { id: 'upload', text: "And just like that, you can see it's uploading it to my channel," },
  { id: 'done', text: 'and boom, there we go, it has been uploaded, it says.' },
  { id: 'check', text: 'Now if I check my actual channel, yeah, as you can see, it has been uploaded.' },
  { id: 'cta', text: 'Try out Superbot today at superbot.gg and get $50 in free credits, using my link below.' },
];
