#!/bin/sh
# Render the montage and end card from the served repo, then cut every take at every ratio and ship them to the spot
# folder. BASE (where the repo is served, default http://127.0.0.1:8737), CHROME (an installed Chrome) and PY (a python3
# with numpy, opencv-python and pillow) pass through.
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
V=../../assets/video
rm -rf work
for ar in 16x9 1x1; do
  w=$(echo $ar | sed 's/x.*//')
  node render-montage.mjs $ar 2.45 11.6 work/mt$w montage | tail -1
  node render-montage.mjs $ar 12.02 15.2 work/end$w end | tail -1
  for take in fish licensed; do $PY -I compose.py $ar out/$take.$ar.mp4 $take; done
done
for ar in 16x9 1x1; do
  cp out/fish.$ar.mp4 $V/hacker-announcement-superbot-7dfcf32a.$ar.mp4
  cp out/licensed.$ar.mp4 $V/hacker-announcement-licensed-superbot-7dfcf32a.$ar.mp4
done
for id in hacker-announcement-superbot-7dfcf32a hacker-announcement-licensed-superbot-7dfcf32a; do
  ffmpeg -v error -y -ss 0.15 -i $V/$id.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/$id.png
done
for f in out/*.mp4; do echo "$f $(ffprobe -v error -show_entries stream=width,height,bit_rate -show_entries format=duration,size -of compact "$f" | tr '\n' ' ')"; done
