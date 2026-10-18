#!/bin/sh
# Capture the end card from the served repo, then cut both takes at both ratios and ship them to assets/. BASE (where the
# repo is served, default http://127.0.0.1:8737), CHROME (an installed Chrome) and PY (a python3 with numpy, opencv-python
# and pillow) pass through.
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
V=../../assets/video
rm -rf work
node endcard.mjs 16x9 work/end16 capture 27.0 30.63 | tail -1
node endcard.mjs 1x1 work/end1 capture 27.0 30.63 | tail -1
for ar in 16x9 1x1; do
  for take in fish licensed; do $PY -I compose.py $ar out/$take.$ar.mp4 $take | tail -1; done
  cp out/fish.$ar.mp4 $V/hooded-statement-superbot-382c1f0c.$ar.mp4
  cp out/licensed.$ar.mp4 $V/hooded-statement-licensed-superbot-382c1f0c.$ar.mp4
done
# the closed-caption files X takes beside the video (the same timing at every ratio)
cp out/fish.16x9.srt $V/hooded-statement-superbot-382c1f0c.en.srt
cp out/licensed.16x9.srt $V/hooded-statement-licensed-superbot-382c1f0c.en.srt
for id in hooded-statement-superbot-382c1f0c hooded-statement-licensed-superbot-382c1f0c; do
  ffmpeg -v error -y -ss 1.0 -i $V/$id.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/$id.png
done
for f in out/*.mp4; do echo "$f $(ffprobe -v error -show_entries stream=width,height,bit_rate -show_entries format=duration,size -of compact "$f" | tr '\n' ' ')"; done
