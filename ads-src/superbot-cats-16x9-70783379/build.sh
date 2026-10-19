#!/bin/sh
# The superbot cats film (16:9, 1920x1080, 60 fps, with sound): the X spot "Superbot does things your chatbot can't." opening,
# then the muse meme spot's 'cats-chatbot' variant (nine asks: a cat GIF sent to MrCatMan131 on Discord, a hyperrealistic 3D
# cat, cat food on DoorDash, a cat song, the user's other AI subscriptions cancelled, a website style picked, a captcha
# solved, an email draft torn apart, the user's Claude plan connected) through its own superbot.gg end card, the hooded
# mascot's fish.audio voice narrating throughout and closing on it. compose.py has the cut; capture.mjs the frame-exact captures;
# the variant's img/cats.70783379/CREDITS.txt every source.
# Run from this folder with the gallery repo served (BASE, default http://127.0.0.1:8795: `npx http-server -p 8795 -c-1 .`
# at the repo root), Playwright importable here (a node_modules beside this file) and PY a python with numpy, opencv-python
# and pillow (the chat's poetry env: `poetry env info -e`).
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
ID=superbot-cats-chatbot-cant-16x9-70783379
D=../../animations/$ID
rm -rf work out
mkdir -p work/art60 out
# the spot's two generated shots, motion-interpolated to 60 fps as its 60 fps cuts are (../hacker-announcement-7dfcf32a/build.sh)
for c in omni-close omni-wide-gesture; do
  ffmpeg -v error -y -i ../hacker-announcement-7dfcf32a/art/$c.mp4 -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p -an work/art60/$c.mp4
done
# the variant's soundtrack and cues, then its chat at 60 fps from the empty state (0.6 s, under the dive) through its end card
node capture.mjs audio 0 0 work/audio | tail -1
PY=$PY node capture.mjs montage 0.6 $(node -e "console.log(require('./work/audio/cues.json').end)") work/mt 60 | tail -1
# the cut and the mix; the voice's takes are in vo/ (fish.audio HACKER VOICE: intro.wav the best of four, the narration the
# best of three each, compose.py VO_FILE and NARR)
$PY -I compose.py out/$ID.mp4
# the gallery page's film, poster and thumbnail
mkdir -p $D
cp out/$ID.mp4 $D/final.mp4
ffmpeg -v error -y -ss 1.2 -i $D/final.mp4 -frames:v 1 $D/poster.png
ffmpeg -v error -y -ss 1.2 -i $D/final.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/$ID.png
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -show_entries format=duration,size -of compact $D/final.mp4
