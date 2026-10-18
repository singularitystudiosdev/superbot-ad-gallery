# the hooded mascot's announcement (hacker-announcement-superbot-7dfcf32a)

The hacker-video meme cut for X: the hooded figure in the superbot cat mask reads a statement, a VHS tear drops into the
superbot chat for the feature list, then back to the figure and the superbot.gg end card. 17.5 s, 16:9 and 1:1, two
takes. The renders ship in `assets/video/` as `hacker-announcement-superbot-7dfcf32a.{16x9,1x1}.mp4` (the fish.audio
take) and `hacker-announcement-licensed-superbot-7dfcf32a.{16x9,1x1}.mp4` (the licensed take); the page
`animations/hacker-announcement-superbot-7dfcf32a/` plays either (`?take=licensed`, `?ar=1x1`).

Script: "Superbot gives you better output." (licensed take: "Superbot does the work for you.") / "It can make calls,
generate images, 3D models, connect to your apps directly, so you don't need MCPs." / "Try it out today. Superbot."

On screen for X's policies: captions on every line; "AI-generated footage and voice" over the generated shots;
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
- `vo/licensed-line1.wav`, `vo/licensed-line2.wav`, `vo/licensed-line3.wav`: OpenAI `gpt-4o-mini-tts`, voice `onyx`,
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
(`compose.py <ar> <out> <take>`) and copies the four renders and the thumbnail into place.

`render-montage.mjs` reads the variant's voiceover cues (`window.__HACKER_CUES`) into `work/*/cues.json`; `compose.py` finds
each take's phrases from its pauses and lays them, and their captions, on those cues, so a retimed variant or a new take
re-cuts itself. The renders are H.264 High 4:2:0, 30 fps, two-pass 8 Mbps, AAC-LC 192 kbps, faststart: X's video ad specs.
