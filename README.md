# superbot — ad gallery

Every frontend ad creative for **superbot**, in one shareable page. Click any tile to
zoom the full-size image or watch the animation play live. Static — no build, no deps.

**Live:** https://singularitystudiosdev.github.io/superbot-ad-gallery/

## Contents

14 ad spots, gathered from the workspace projects and the GitHub repos:

- **14 tabs?** — the same prompt pasted into fourteen AI tabs; superbot asks every agent from one window (15s loop).
- **youtube to mp3?** — ChatGPT refuses in 166 words; the superbot popup opens the app, which fetches,
  converts and hands back a clean download link, then the pain words roll through
  refusing / slow / forgetting / lying / unorganized (25.8s loop).
- **favorite color** — the chat pitch: "whats ur favorite color".
- **is mayonnaise an instrument?** — Patrick (Band Geeks, 2001) with the ChatGPT icon on his head;
  the ChatGPT screen is asked the question and classifies mayonnaise by Hornbostel-Sachs forever, the
  camera flies down the wall; the same clip wearing the superbot icon; the superbot screen answers
  "No."; stop burning tokens; the end card (29s loop, with sound).
  `animations/mayonnaise-superbot-5c2f8e47/`, built on the who-are-you spot; the icon sits on hand
  keyframes (a cartoon head, no face detector) and the last Patrick frame is held under the tail of
  the line because the episode cuts to Squidward mid-word.
- **who are you?** — the Kazoo Kid clip with the ChatGPT icon face-tracked onto his head; the
  ChatGPT screen is asked "Who are you" and rambles about identity forever, the camera flies down
  the wall of text; the same clip wearing the superbot icon; the superbot screen (blue, pink,
  purple) answers "I'm superbot. I can do anything, test me."; stop burning tokens; the end card
  (28.5s loop, with sound). The clips are `animations/who-are-you-superbot-4a7e2c19/clip-*.mp4`,
  the icon placed per frame from an Apple Vision face track (`.tmp/whoareyou/facetrack.swift`,
  `composite.swift`).
- **add a garden in my front lawn**: the muse meme spot's lawn cut
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=lawn`): superbot connects to Maps, the
  address "Raleigh, North Carolina, USA" types into its search pill, the camera flies from the
  whole metro down to the pin's residential block, and the map zooms through into the photograph
  of that front lawn, where a before/after wipe plants the garden (11.27s loop).
- **a cat, four tools**: the muse meme spot's multi-tool cut
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=multicat`): one chat asks for a realistic
  cat photo (GPT Image 2), an animated 3D model of it (Meshy, walk rigged by superbot), cat food from
  DoorDash (a Petco order card) and a song about cats (ElevenLabs, plays with sound), each answer a
  real generation; ends on the superbot.gg end card with the mascot (29s, with sound: an original
  broadcast-mixed score and effects with the song mixed in; a Music pill top right picks it, one of
  twelve more soundtracks made for the spot in separate chats, or none: `?music=v5` to `v17`, `none`).
- **a dog, four tools**: the same multi-tool cut for a dog
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=multidog`): a beagle photo (GPT Image 2),
  that beagle as a walking 3D model (Meshy, walk rigged by superbot), a PetSmart dog food order on
  DoorDash and "Tails Up", a song about dogs (ElevenLabs, plays with sound), each answer a real
  generation (about 29s, with sound).
- **a dog, four tools, no model on show**: the multi-tool cat's credits-only cut made for that dog
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=multidog-credits`): the same beagle photo,
  walking 3D beagle, PetSmart order and "Tails Up" with no routing chips or model headers, each
  generation fast-forwarded x50, ending on the superbot.gg end card (about 31s, with sound: the
  16 · Punchy premium groove score moved up a semitone into the song's key).
- **a college research study, three asks**: the muse meme spot's college cut
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=college`), made like the credits-only cat cut (no model on
  show): superbot calls a stratified random sample of 250 students, one dot per call in four class-year strata resolving
  to completed, voicemail or declined (184 completed, 73.6%); organizes it into a six-slide Google Slides deck (the pitch
  deck cut's card); then talks through the slides in the student's voice, a real Gemini TTS take under its measured
  waveform with word-by-word captions and the slides turning on cue; ends on the superbot.gg end card (about 34s, with
  sound). The study's numbers are mock data.
- **cheapest, most fun Halloween costumes**: the credits-only chat asked one shopping question
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=amazon-costumes`): "Search on amazon and find
  me the cheapest and most fun halloween costumes" gets a rebuilt Amazon results page; the search runs
  x50 under skeleton tiles while 240 listings are compared, six real listings land cheapest first ($7.99
  crayon to $24.99 inflatable chicken, as listed 2026-10-17), Cheapest and Most fun pop, then the
  superbot.gg end card (about 12.6s, with sound: the 16 · Punchy premium groove score re-cued to it).
- **halloween shopping, no model on show**: the credits-only cut's look for two shopping asks
  (`animations/gemini-muse-meme-superbot-6fbc38f8/?variant=halloween-shopping`): "Search on amazon and buy
  the cheapest halloween king sized bag of candy", then "Use Temu to buy x3 pumpkin costumes size small,
  cheapest and cutest". Each reply shows only the end result, as the burger cut does: one line saying
  what was ordered, then the order's confirmation landing out of a skeleton (Amazon: Reese's King Size
  Pumpkins, $28.99; Temu: three $7.82 pumpkin bodysuits with berets in size S, $23.46), rebuilt over
  real listings; ends on the superbot.gg end card (about 15s, with sound: the 16 · Punchy premium groove
  score re-cued to it). Nothing was ordered; provenance in `img/halloween.37ff9e93/CREDITS.txt`.
- **dear cursor users** (`animations/dear-cursor-users-superbot-417d180e/`): white type on black, word
  by word: "dear cursor users", "you are being upcharged and pay api pricing", "superbot reroutes to
  subscription and removes the cursor upcharge", "we did this to save people thousands", then the
  superbot.gg end card with the mascot from the multi-tool cat cut (17s, silent).
- **DEAR API USERS** (`animations/dear-api-users-superbot-417d180e/`): the before/after price spot
  (`dear-cursor-users-superbot-f187dd19`) with no vendor named or shown: a code glyph, $30,000/mo
  before superbot rolling down to $800/mo after, One download and stop paying API pricing, superbot.gg
  (13s, with sound: an ElevenLabs bed that drops on the chip flip, one effect per beat). The one spot with a 9:16
  cut: its manifest entry's `extraArs: ['9x16']` adds a 9:16 chip to the lightbox picker for it alone, playing
  `?ar=9x16` and downloading the 1080x1920 render.
- **If you use Cursor** (`animations/cursor-upcharged-relay-superbot-2727b383/`): three white-on-black
  title cards, each with its mark to the right: "IF YOU USE CURSOR" with the Cursor cube, "YOU ARE BEING
  UPCHARGED" with a money bag, "SAVE THOUSANDS WITH SUPERBOT RELAY" with a siren, then the superbot.gg
  end card with the mascot from the multi-tool cat cut (10.7s, silent).

Static image ads (`assets/ads/`):

- **stop burning tokens** · the three-word poster with the superbot icon. Rendered at every
  gallery ratio (`assets/ads/stop-burning-tokens.<ar>.png`, height 1350), so the ratio picker
  reshapes the poster the same way it reshapes the animations.
- **agents refusing? superbot can do it!** · the refusal poster (imported 1920x1080 art).
- **agents slow? superbot can do it!** · the speed poster (imported 1920x1080 art).
- **your all in one agent workspace** · the workspace poster (imported 1920x1080 art).
- **context full? / slow? / costly?** · the before/after family
  (`assets/ads/context-<pain>-poster.<ar>.png`), built from `ads-src/context-storage/`: the
  phone-cleaner "Optimize Storage" ad (a red Before bar at 250GB of 256GB, a green After bar
  at 50GB, then "you have cleaned 200GB · saved 1.2 hours") re-drawn for an agent's context
  window in the pain-poster type. Serve that folder on :8614, then
  `node ads-src/context-storage/render.mjs` from the repo root; a wide frame puts the card
  beside the headline, a tall one stacks them. The numbers per ad live in
  `ads-src/context-storage/ads.js`.

The two imported posters are flat-black art, so their other ratios are composed rather than
re-drawn: the artwork is scaled to the frame width and the frame is padded with the same black
(`ads-src/compose-imported.mjs`, native height 1080; the 16:9 file is the original bytes).

The other creative groups (hero animations, site variants, hero reveal FX, mascot toys,
images) are still defined in `gen-manifest.mjs` — re-enable by changing `ONLY_GROUP`.

## Structure

```
index.html          gallery page (grid + lightbox)
gallery.js          data fetch + grid + lightbox (vanilla, no deps)
styles.css          dark textmode theme
manifest.json       generated item list
gen-manifest.mjs    regenerates manifest.json (node gen-manifest.mjs)
animations/         each animation page, self-contained, served as-is
assets/img/         static images
assets/shots/       animation thumbnails (playwright captures)
```

New animation thumbnails: capture with playwright headless at 1280x720
(`npx playwright screenshot --viewport-size "1280,720" --wait-for-timeout 4500 <url> <out>`), pick the better-looking frame.

## Regenerating

Add a file under `assets/img/` (or a folder under `animations/`), then:

```
node gen-manifest.mjs
```

Thumbnails for new animations are playwright captures at 1280x720; reuse
`capture-230cb400.mjs` and pick the better-looking frame.

## License

MIT
