# the hooded mascot's statement (hooded-statement-superbot-382c1f0c)

The hacker-video meme read straight through, for X: the hooded figure in the superbot cat mask reads the whole statement
at the desk, both hands on the paper, then looks into the lens for the call to action, and a tape tear drops into the
superbot.gg end card with the mascot (the card the muse meme spot's multidog-credits cut ends on). No montage: the
figure carries every line. Two takes, 16:9 and 1:1. The renders ship in `assets/video/` as
`hooded-statement-superbot-382c1f0c.{16x9,1x1}.mp4` (the fish.audio take, 14.4 s) and
`hooded-statement-licensed-superbot-382c1f0c.{16x9,1x1}.mp4` (the licensed take, 15.0 s); the page
`animations/hooded-statement-superbot-382c1f0c/` plays either (`?take=licensed`, `?ar=1x1`).

Script: "Superbot does the work for you." / "It can make calls, generate images, 3D models, connect to your apps
directly, so you don't need MCPs." / "Try it out today. Superbot."

The brief's first line, "Superbot gives better output than any of the competitors", and its "connect to any of your
apps" were changed to pass X's ad terms: X's Master Services Agreement §8(v)(d) holds every ad to "not false, deceptive,
misleading", and the Deceptive and Fraudulent Content policy bars "misleading tactics or claims" and "non-existent
features or functionality". A claim to beat every competitor (X's own Grok among them) is unsubstantiated, and "any of
your apps" claims more than the product does. Every claim left is on superbot.gg/features: calls from your iPhone,
images, 3D models, apps used signed in through your own browser.

On screen: "AI-generated footage and voice" over the generated shots (OpenAI's usage policies require it for its TTS
voice; fish.audio's terms encourage it). No captions burned in; X "strongly recommends" captions, so each take ships an
SRT beside its renders (`assets/video/<id>.en.srt`, written by `compose.py` from the phrase timings) to upload with the
video as X's closed captions ("Upload caption file (.srt)", web only).

## Sources (all made for this ad, 2026-10-17)

- `art/omni-wide-read.mp4` (10 s) and `art/omni-close-look.mp4` (6 s, used from 1.6 s): Gemini Omni 1.1 Flash, image to
  video, 1920x1080, from the hacker-announcement spot's key frames (`../hacker-announcement-7dfcf32a/art/key.png`,
  `key-close.png`, GPT Image 2). The wide was asked for both hands on the paper throughout: no open palm, no gesture. No
  third-party footage: the CBS News clip of the Anonymous video the meme comes from is not used anywhere, and the figure
  carries no Guy Fawkes mask, no Anonymous emblem and no news graphics.
- `vo/line1.wav`, `vo/line2.wav`, `vo/line3.wav`: fish.audio API (`/v1/tts`, model `drama-3`), voice model
  `12d45eb3f90e4b8a9fb448a26c71367f` "HACKER VOICE" by Kahal edgar, picked from two or three takes each. That model is
  another user's community voice, marked `licensed: false`; fish.audio's terms forbid commercializing content "not owned
  by you … without the prior consent of the owner", and allow commercial use only on paid services. Until superbot holds
  the owner's written consent and a paid plan, run the licensed take on X instead (X's MSA §4: the advertiser warrants it
  has "secured all necessary rights, consents, waivers and licenses").
- The licensed take's voice is the hacker-announcement spot's `vo/licensed-line*.wav` (OpenAI `gpt-4o-mini-tts`, voice
  `onyx`, deepened 1.5 semitones), the same script, played at 1.07x (atempo, pitch kept) so the cut stays near 15 s.
  OpenAI's Services Agreement §4.1 assigns the output to the customer.
- `../hacker-announcement-7dfcf32a/music/drone.flac`, `beat.flac`: Google Lyria 3, instrumental (the Gemini API terms:
  "Google won't claim ownership over that content"). The end chime and glitch hits are synthesized in `compose.py`.
- `work/end16`, `work/end1`: the end card, captured by `endcard.mjs` from `?variant=multidog-credits` at 27.0-30.63 s;
  the cut uses it from frame 18 (27.6 s), where the chat has faded out and the mascot is about to pop.

## Rebuild

From the repo root, serve it (`npx http-server -p 8737 -c-1 .`), then in this folder, with Playwright installed here
(`npm i playwright`) and python3 with numpy, opencv-python and pillow: `sh build.sh` (BASE, CHROME and PY pass through).
It captures the end card at each ratio, cuts both takes at both ratios (`compose.py <ar> <out> <take>`) and copies the
four renders and the two thumbnails into place.

`compose.py` finds each take's phrases from its pauses and lays them end to end (a pause inside a line kept up to 0.3 s);
the shots follow the voice: the wide cuts to the close-up just after line 2, the close-up tears into the card just after
"Superbot.". `hood_shadow` hides the human chin the generated figure shows under the mask: everything in a band under the
mask goes to hood-shadow black except neutral greys (the mask, its underside, the paper). The renders are H.264 High 4:2:0,
30 fps, two-pass 8 Mbps, AAC-LC 192 kbps, -14 LUFS, faststart: X's video ad specs.
