# the hooded mascot's statement (hooded-statement-superbot-382c1f0c)

The hacker-video meme read straight through, for X: the hooded figure in the superbot cat mask reads the whole statement
at the desk, both hands on the paper, then looks into the lens for the call to action, and a tape tear drops into the
superbot.gg end card with the mascot (the card the muse meme spot's multidog-credits cut ends on). No montage: the
figure carries every line. Two takes, 16:9 and 1:1. The renders ship in `assets/video/` as
`hooded-statement-superbot-382c1f0c.{16x9,1x1}.mp4` (the fish.audio take, 14.6 s) and
`hooded-statement-licensed-superbot-382c1f0c.{16x9,1x1}.mp4` (the licensed take, 15.0 s), each with an `.en.srt`; the
page `animations/hooded-statement-superbot-382c1f0c/` plays either (`?take=licensed`, `?ar=1x1`).

Script: "Superbot is here." / "It can make calls, generate images and 3D models, and connect to your apps directly, so
you don't have to set up MCPs." / "Try it out today. Superbot."

## Held to X's ad terms (read live 2026-10-17)

Every line is what superbot.gg/features shows the product doing, because X's Master Services Agreement §8(v)(d) holds an
ad to "not false, deceptive, misleading" with "any results or outcomes therein … representative of outcomes a typical user
can expect", and the Deceptive and Fraudulent Content policy bars "misleading tactics or claims" and "non-existent
features or functionality":

- "make calls": "ask it to call someone for you. your Mac dials from your iPhone."
- "generate images": "it draws images and builds real files" (on your ChatGPT plan or your own key).
- "3D models": the "tools no chat box has" list.
- "connect to your apps directly": "it drives your own browser, signed in … anything you do in a browser, it can."
- "so you don't have to set up MCPs": "it installs and updates MCP servers. a broken one gets fixed for you."

Changed on the way: the brief's "better output than any of the competitors" (an unsubstantiated superiority claim, X's
own Grok among the competitors) and "any of your apps" (more than the product does); then "Superbot does the work for
you" (an open-ended outcome) became "Superbot is here.", and "so you don't need MCPs", which superbot.gg itself
contradicts (it ships and manages MCP servers), became "so you don't have to set up MCPs". Line 2 is one grammatical
sentence (the Quality policy: "Ads must use proper grammar").

On screen: "AI-generated video and voice" over the generated shots, a small quiet label in the top right (OpenAI's
usage policies ask for a "clear disclosure" of its TTS voice, and §8(v)(a) holds the ad to the advertiser's other
agreements); superbot's app-icon tile held in the upper left (X's video spec: a logo "should be persistent in the upper
left hand corner"). No captions burned in; X "strongly recommends" captions, so each take ships an SRT (written by
`compose.py` from the phrase timings, its first cue marked "[AI-generated voice]") to upload with the video as X's
closed captions ("Upload caption file (.srt)", web only).

Run it pointing at `https://superbot.gg/` (the home page): /features names Grok among the models superbot connects to,
which X's Unacceptable Content policy treats as an unauthorized reference ("Claims of affiliation, endorsement or
integration with our products or services without permission"), and the landing page "should be compliant with all ads
policies".

## Sources (all made for this ad, 2026-10-17)

- `art/omni-wide-read.mp4` (10 s) and `art/omni-close-look.mp4` (6 s, used from 1.6 s): Gemini Omni 1.1 Flash, image to
  video, 1920x1080, from the hacker-announcement spot's key frames (`../hacker-announcement-7dfcf32a/art/key.png`,
  `key-close.png`, GPT Image 2). The wide was asked for both hands on the paper throughout: no open palm, no gesture. No
  third-party footage: the CBS News clip of the Anonymous video the meme comes from is not used anywhere, and the figure
  carries no Guy Fawkes mask, no Anonymous emblem and no news graphics.
- `vo/line1.wav`, `vo/line2.wav`, `vo/line3.wav`: fish.audio API (`/v1/tts`, model `drama-3`), voice model
  `12d45eb3f90e4b8a9fb448a26c71367f` "HACKER VOICE" by Kahal edgar, picked from three takes each. That model is another
  user's community voice, marked `licensed: false`, its source not stated; fish.audio's terms forbid commercializing
  content "not owned by you … without the prior consent of the owner", and allow commercial use only on paid services.
  Until superbot holds the owner's written consent (and what the voice was made from) and a paid plan, the fish take does
  not clear X's MSA §4 ("secured all necessary rights, consents, waivers and licenses") or §8(v)(c) (rights of
  publicity): run the licensed take.
- `vo/licensed-line*.wav`: OpenAI `gpt-4o-mini-tts`, voice `onyx`, deepened 1.5 semitones (`asetrate`×0.917 then
  `atempo` 1.0905, the announcement spot's chain); lines 1 and 2 are new takes of this script, line 3 is the announcement
  spot's. The cut plays them at 1.07x (atempo, pitch kept) to land at 15 s. OpenAI's Services Agreement §4.1 assigns the
  output to the customer.
- `../hacker-announcement-7dfcf32a/music/drone.flac`, `beat.flac`: Google Lyria 3, instrumental (the Gemini API terms:
  "Google won't claim ownership over that content"). The end chime and glitch hits are synthesized in `compose.py`.
- The upper-left tile is drawn in `compose.py` from superbot.gg's own `site/assets/brand/tile.svg` geometry.
- `work/end16`, `work/end1`: the end card, captured by `endcard.mjs` from `?variant=multidog-credits` at 27.0-30.63 s;
  the cut uses it from frame 18 (27.6 s), where the chat has faded out and the mascot is about to pop.

## Rebuild

From the repo root, serve it (`npx http-server -p 8737 -c-1 .`), then in this folder, with Playwright installed here
(`npm i playwright`) and python3 with numpy, opencv-python and pillow: `sh build.sh` (BASE, CHROME and PY pass through).
It captures the end card at each ratio, cuts both takes at both ratios (`compose.py <ar> <out> <take>`) and copies the
four renders, the two SRTs and the two thumbnails into place.

`compose.py` finds each take's phrases from its pauses and lays them end to end (a pause inside a line kept up to 0.3 s);
the shots follow the voice: the wide cuts to the close-up just after line 2, the close-up tears into the card just after
"Superbot.". `hood_shadow` hides the human chin the generated figure shows under the mask: everything in a band under the
mask goes to hood-shadow black except neutral greys (the mask, its underside, the paper). The renders are H.264 High 4:2:0,
30 fps, two-pass 8 Mbps, AAC-LC 192 kbps, -14 LUFS, faststart: X's video ad specs.
