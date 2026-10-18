#!/bin/sh
# Render the montage and end card from the served repo, then cut both cuts (the montage cut and the mascot-only talk cut)
# in both takes at both ratios and ship them to assets/video with their thumbnails; then the other spots of spots.json the
# same way (their talk cuts, and hello's montage from the 'hacker-hello' variant). BASE (where the repo is served,
# default http://127.0.0.1:8737), CHROME (an installed Chrome) and PY (a python3 with numpy, opencv-python and pillow)
# pass through.
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
V=../../assets/video
rm -rf work
for ar in 16x9 1x1; do
  w=$(echo $ar | sed 's/x.*//')
  node render-montage.mjs $ar 2.45 11.6 work/mt$w montage | tail -1
  node render-montage.mjs $ar 12.02 15.2 work/end$w end | tail -1
  for take in fish licensed; do
    $PY -I compose.py $ar out/$take.$ar.mp4 $take montage
    $PY -I compose.py $ar out/talk-$take.$ar.mp4 $take talk
  done
done
for ar in 16x9 1x1; do
  cp out/fish.$ar.mp4 $V/hacker-announcement-superbot-7dfcf32a.$ar.mp4
  cp out/licensed.$ar.mp4 $V/hacker-announcement-licensed-superbot-7dfcf32a.$ar.mp4
  cp out/talk-fish.$ar.mp4 $V/hacker-announcement-talk-superbot-7dfcf32a.$ar.mp4
  cp out/talk-licensed.$ar.mp4 $V/hacker-announcement-talk-licensed-superbot-7dfcf32a.$ar.mp4
done
# thumbnails: the montage cut's opening, the talk cut's close-up (its second shot)
for id in hacker-announcement-superbot-7dfcf32a hacker-announcement-licensed-superbot-7dfcf32a; do
  ffmpeg -v error -y -ss 0.15 -i $V/$id.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/$id.png
done
for id in hacker-announcement-talk-superbot-7dfcf32a hacker-announcement-talk-licensed-superbot-7dfcf32a; do
  ffmpeg -v error -y -ss 3.6 -i $V/$id.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/$id.png
done
# the other spots (spots.json): every one's talk cut, and the hello spot's montage (the 'hacker-hello' variant, captured
# from its empty state to just past its end-card cover), in both takes at both ratios; thumbnails from the first shot
for ar in 16x9 1x1; do
  w=$(echo $ar | sed 's/x.*//')
  VARIANT=hacker-hello node render-montage.mjs $ar 0.6 13.46 work/hello-mt$w montage | tail -1
done
$PY -I -c "import json; [print(k, v['slug'], 'montage' in v) for k, v in json.load(open('spots.json')).items() if k != '_']" | while read spot slug montage; do
  for take in fish licensed; do
    t=$([ $take = licensed ] && echo -licensed || true)
    for ar in 16x9 1x1; do
      $PY -I compose.py $ar out/$spot-talk-$take.$ar.mp4 $take talk $spot
      cp out/$spot-talk-$take.$ar.mp4 $V/hacker-$slug-talk$t-superbot-7dfcf32a.$ar.mp4
      if [ $montage = True ]; then
        $PY -I compose.py $ar out/$spot-$take.$ar.mp4 $take montage $spot
        cp out/$spot-$take.$ar.mp4 $V/hacker-$slug$t-superbot-7dfcf32a.$ar.mp4
      fi
    done
    ffmpeg -v error -y -ss 1.2 -i $V/hacker-$slug-talk$t-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-$slug-talk$t-superbot-7dfcf32a.png
    [ $montage = True ] && ffmpeg -v error -y -ss 0.15 -i $V/hacker-$slug$t-superbot-7dfcf32a.16x9.mp4 -frames:v 1 -vf scale=1280:720:flags=lanczos ../../assets/shots/hacker-$slug$t-superbot-7dfcf32a.png || true
  done
done
for f in out/*.mp4; do echo "$f $(ffprobe -v error -show_entries stream=width,height,bit_rate -show_entries format=duration,size -of compact "$f" | tr '\n' ' ')"; done
