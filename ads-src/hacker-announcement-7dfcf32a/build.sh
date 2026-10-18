#!/bin/sh
# Render every cut of the hooded mascot's from the served repo at 60 fps in every ratio X lists (16:9, 9:16, 4:5 at
# 1440x1800, 1:1), in the fish.audio HACKER VOICE (the only take shipped since 2026-10-18; the licensed take is retired):
# the announcement's montage cut and its mascot-only talk cut, then the other spots of spots.json (their talk cuts, and
# the hello and hello-computer montages), shipped to assets/video with their thumbnails. BASE (where the repo is served,
# default http://127.0.0.1:8737), CHROME (an installed Chrome) and PY (a python3 with numpy, opencv-python and pillow)
# pass through.
set -e
cd "$(dirname "$0")"
export PY=${PY:-python3} # render-montage.mjs runs camera.py on it too
V=../../assets/video
rm -rf work
# the generated shots motion-interpolated to 60 (work/art60); the end card and the montages captured at 60: the
# announcement's ('hacker', from its first ask sent), hello's ('hacker-hello') and hello-computer's ('hacker-hello-pc'),
# those two from their empty states to just past their end-card covers
mkdir -p work/art60
for c in omni-close omni-wide-point omni-wide-gesture; do
  ffmpeg -v error -y -i art/$c.mp4 -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p -an work/art60/$c.mp4
done
for ar in 16x9 9x16 4x5 1x1; do
  w=$(echo $ar | sed 's/x.*//')
  node render-montage.mjs $ar 12.02 15.2 work/end$w-60 end 60 | tail -1
  node render-montage.mjs $ar 2.45 11.6 work/mt$w-60 montage 60 | tail -1
  VARIANT=hacker-hello node render-montage.mjs $ar 0.6 13.46 work/hello-mt$w-60 montage 60 | tail -1
  VARIANT=hacker-hello-pc node render-montage.mjs $ar 0.6 15.49 work/hellopc-mt$w-60 montage 60 | tail -1
  # the announcement: its montage cut and its talk cut
  FPS=60 $PY -I compose.py $ar out/fish.$ar.mp4 fish montage
  FPS=60 $PY -I compose.py $ar out/talk-fish.$ar.mp4 fish talk
  cp out/fish.$ar.mp4 $V/hacker-announcement-superbot-7dfcf32a.$ar.mp4
  cp out/talk-fish.$ar.mp4 $V/hacker-announcement-talk-superbot-7dfcf32a.$ar.mp4
done
# the announcement's thumbnails: the montage cut's opening, the talk cut's close-up (its second shot)
ffmpeg -v error -y -ss 0.15 -i $V/hacker-announcement-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-announcement-superbot-7dfcf32a.png
ffmpeg -v error -y -ss 3.6 -i $V/hacker-announcement-talk-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-announcement-talk-superbot-7dfcf32a.png
# the other spots: every spot's talk cut, and hello's and hello-computer's montages; thumbnails from the first shot
$PY -I -c "import json; [print(k, v['slug'], 'montage' in v, 'talk' in v) for k, v in json.load(open('spots.json')).items() if k != '_']" | while read spot slug montage talk; do
  for take in fish; do
    t=
    for ar in 16x9 9x16 4x5 1x1; do
      if [ $talk = True ]; then
        FPS=60 $PY -I compose.py $ar out/$spot-talk-$take.$ar.mp4 $take talk $spot
        cp out/$spot-talk-$take.$ar.mp4 $V/hacker-$slug-talk$t-superbot-7dfcf32a.$ar.mp4
      fi
      if [ $montage = True ]; then
        FPS=60 $PY -I compose.py $ar out/$spot-$take.$ar.mp4 $take montage $spot
        cp out/$spot-$take.$ar.mp4 $V/hacker-$slug$t-superbot-7dfcf32a.$ar.mp4
      fi
    done
    [ $talk = True ] && ffmpeg -v error -y -ss 1.2 -i $V/hacker-$slug-talk$t-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-$slug-talk$t-superbot-7dfcf32a.png || true
    [ $montage = True ] && ffmpeg -v error -y -ss 0.15 -i $V/hacker-$slug$t-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-$slug$t-superbot-7dfcf32a.png || true
  done
done
for f in out/*.mp4; do echo "$f $(ffprobe -v error -show_entries stream=width,height,bit_rate -show_entries format=duration,size -of compact "$f" | tr '\n' ' ')"; done
