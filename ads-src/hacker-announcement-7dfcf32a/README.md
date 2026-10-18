# the hooded mascot's announcement (hacker-announcement-superbot-7dfcf32a)

The hacker-video meme cut for X: the hooded figure in the superbot cat mask reads a statement, a VHS tear drops into the
superbot chat for the feature list, then back to the figure and the superbot.gg end card. 17.5 s, at 60 fps in 16:9,
9:16, 4:5 and 1:1 (X's sizes, as every spot here), in the fish.audio HACKER VOICE. The renders ship in `assets/video/` as
`hacker-announcement-superbot-7dfcf32a.{16x9,9x16,4x5,1x1}.mp4`; the page `animations/hacker-announcement-superbot-7dfcf32a/`
plays them (`?ar=` picks the ratio). Every spot here is
rendered in the HACKER VOICE only: a licensed-voice take (OpenAI `onyx`) was cut too and retired at the user's call
(2026-10-18); its sources stay in `vo/`, but nothing renders it.

The talk cut (`compose.py ... talk`, `hacker-announcement-talk-superbot-7dfcf32a.*.mp4`, the page's
`?cut=talk`) keeps the mascot on screen the whole way, no chat: the voice runs at its own pace and the shots change on its
pauses (wide reading, close-up, wide lowering the paper, close-up, wide pointing, close-up on "Superbot."), each easing
in slowly, then the end card. About 15 s.

Script: "Superbot gives you better output." / "It can make calls,
generate images, 3D models, connect to your apps directly, so you don't need MCPs." / "Try it out today. Superbot."

## The other spots (spots.json)

Seven more scripts from the same brief, each one's lines in `spots.json` with its shots and gallery slug, cut by
`compose.py <ar> <out> <take> <talk|montage> <spot>` and played by the same page (`?spot=<slug>`): `hello` as a montage
cut on its own variant (`?variant=hacker-hello`: the same call, image and 3D model, then a theme song in a player and
the MCP row as its own card; the empty state held longer so "We built an agent that actually gets things done" plays
over the ask typing) and mascot only; `ask` (slug `output`), `cant` (`jobs`), `fail` (`when-ais-fail`), `message`,
`stopapi` (`stop-paying-api`) and `agents` (`does-things`) mascot only. Renders, at 60 fps in every ratio X lists:
`assets/video/hacker-<slug>[-talk]-superbot-7dfcf32a.{16x9,9x16,4x5,1x1}.mp4` at 1920x1080, 1080x1920,
1440x1800 and 1080x1080 (`FPS=60 compose.py`). At 60 the generated shots are motion-interpolated from their 24 fps
(ffmpeg minterpolate, `work/art60`), the chat and the end card captured at 60, and the bitrate eased under 10 Mbps so
each file stays under X's recommended 30 MB. X's specs ask not to upsample lower-frame-rate footage: the 60 fps cuts were
asked for; the 24 fps shots are the one part that is interpolated. A narrow ratio centre-crops the 16:9 shots on the figure.

`hellopc` (slug `hello-computer`, montage only) is hello with computer control in the call's place, on the
`hacker-hello-pc` variant: superbot takes over the shared screen (the computer-control-v3-soft cut's vignette and pill on
a plain, unbranded browser), searches "funny cat videos", opens the results and plays a kitten chasing a laser dot; the
list line opens "It can control your computer..." instead of "It can make calls...", its other lines are hello's. Its
chat is noted only "Dramatization" (no business in it) and superbot's on-screen moves are badged Sped up (the variant's
`sped` cue). The cats are generated: `art/cats/` (GPT Image thumbnails, a Gemini Omni clip of the first), staged into the
spot as `img/hacker.7dfcf32a/` (CREDITS.txt there). The clip's camera drifts and swings, which in the small player read as
the picture shaking, so `sprite.py` locks it off (its shift read off the room's background, taken out with a sub-pixel
warp) and tiles its first 105 frames at its own 24 fps into the sheet the card draws onto a canvas, cell by exact cell.

## The montage camera

`render-montage.mjs` captures the chat whole every frame at one fixed scale (1.7x the output's pixels, the camera's
closest push), and `camera.py` cuts each frame's camera crop out of it with sub-pixel precision and scales it to the
ratio's size. Until 2026-10-18 Chrome captured each crop at its own zoom: it rounded the crop's origin and size to whole
pixels (frames came out 1079 or 1080 high) and snapped images apart from text, so even a still camera shook by about a
pixel.

The scripts were edited from the brief only where X's ad policies (read 2026-10-17: help.x.com quality-policy,
deceptive-and-fraudulent-content; legal.x.com ads terms) required it: no absolute claims ("anything", "everything",
"almost anything"); superbot called an agent, not a model of its own; comparisons narrowed to "your chatbot", which
can't place a call or reach your apps without MCP servers; "stop paying API" and "pays API pricing" saying what the
viewer still pays (their subscriptions); grammar, which X applies to the audio too ("a announcement", "agent's").

Their voices: `vo/<spot>/fish[-n].wav`, the fish.audio HACKER VOICE as above (two takes a line, the cleaner kept); the
retired licensed take, `vo/<spot>/licensed[-n].wav`, is OpenAI `gpt-4o-mini-tts` `onyx` read phrase by phrase, each trimmed with its inner pauses
held to 0.2 s and joined by 0.38 s so each phrase boundary is the take's longest pause, then deepened 1.5 semitones and
6% quicker.

On screen for X's policies (no captions: asked off; X recommends them but does not require them): "AI-generated
footage and voice" over the generated shots;
"Dramatization · fictional business" over the chat (the call's hotel is unnamed, on a 555 number); "Sped up 150×" on the
generations (their timers count the tools' real seconds) and "Sped up" while the apps connect.

## Sources (all made for this ad, 2026-10-17)

- `art/key.png`: the key frame, GPT Image 2 from two references, `art/mascot-plain.png` (the superbot face) and
  `art/emblem-onwall.png` (the superbot emblem: two rings round the face). `art/key-close.png`: its close-up, a GPT Image 2
  edit of it. No third-party footage: the CBS News clip of the Anonymous video the meme comes from is not used anywhere,
  and the figure carries no Guy Fawkes mask, no Anonymous emblem and no news graphics.
- `art/omni-wide-gesture.mp4`, `art/omni-wide-point.mp4`, `art/omni-close.mp4`: Gemini Omni 1.1 Flash, image to video from
  those key frames (8 s, 1920x1080, 24 fps). Cut: gesture 2.10-4.80 s, point 3.95-5.25 s, close-up 3.85-5.25 s.
- `vo/line1.wav`, `vo/line2.wav`, `vo/line3.wav`: fish.audio API (`/v1/tts`, model `drama-3`), voice model
  `12d45eb3f90e4b8a9fb448a26c71367f` "HACKER VOICE" by Kahal edgar. That model is a community voice marked
  `licensed: false`; fish.audio's terms allow commercial use only on paid services and, for a voice you do not own, with
  its owner's consent. Clear that before the ad runs paid.
- `vo/licensed-line1.wav`, `vo/licensed-line2.wav`, `vo/licensed-line3.wav` (retired 2026-10-18, no longer rendered):
  OpenAI `gpt-4o-mini-tts`, voice `onyx`,
  deepened 1.5 semitones in ffmpeg (pitch only). OpenAI's terms give the output to the customer for commercial use and ask
  that listeners be told the voice is AI-generated: the "AI-generated footage and voice" note does that.
- `music/drone.flac`, `music/beat.flac`: Google Lyria 3 (clip preview), instrumental. The end chime and the glitch hits
  are synthesized in `compose.py`.
- The montage is the muse meme spot's `?variant=hacker` (`beats/hacker.7dfcf32a.js`): the hotel call cut's recorded call
  timings with the hotel left unnamed ("The Calder", that cut's made-up name, is also a real hotel's), the multidog cut's
  GPT Image 2 beagle and Meshy model (paid generations, `models/CREDITS.txt`), generic lucide app glyphs.

## Rebuild

From the repo root, serve it (`npx http-server -p 8737 -c-1 .`), then in this folder, with Playwright installed here
(`npm i playwright`) and python3 with numpy, opencv-python and pillow: `sh build.sh` (BASE, CHROME and PY pass through).
It captures the montage and end card at each ratio (`render-montage.mjs`), cuts both takes at both ratios
(`compose.py <ar> <out> <take>`) and copies the four renders and the thumbnail into place; then the same for every spot
of `spots.json` (`VARIANT=hacker-hello` captures the hello montage).

`render-montage.mjs` reads the variant's voiceover cues (`window.__HACKER_CUES`) into `work/*/cues.json`; `compose.py` finds
each take's phrases from its pauses and lays them on those cues, so a retimed variant or a new take
re-cuts itself. The renders are H.264 High 4:2:0, 30 fps, two-pass 8 Mbps, AAC-LC 192 kbps, faststart: X's video ad specs.
