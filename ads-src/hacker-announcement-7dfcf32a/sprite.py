# sprite.py : the computer-control cut's played video (beats/hacker.7dfcf32a.js SPRITE), built from the generated kitten
# clip (art/cats/laser-clip.mp4, 1280x720 at 24 fps). The clip's camera drifts and swings (about 12 px left over its first
# second, then 35 px right in under one), which in the small shared-screen player reads as the picture shaking, so it is
# locked off first: each frame's shift against the first is read off the room's background in three places (the sofa,
# the left wall, the rug; phase correlation, their median), lightly smoothed against read noise, taken out with a
# sub-pixel warp, and a slight centred zoom hides the edges. Then its first N frames at the clip's own 24 fps (no repeated
# frames) are scaled to 640x360 and tiled COLS across into one sheet, which the card draws frame by frame onto a canvas.
# Run from this folder with a python3 that has numpy and opencv-python: python3 -I sprite.py
import os
import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'art/cats/laser-clip.mp4')
OUT = os.path.join(HERE, '../../animations/gemini-muse-meme-superbot-6fbc38f8/img/hacker.7dfcf32a/cat-laser-sprite.jpg')
N, COLS, FW, FH = 105, 10, 640, 360  # beats/hacker.7dfcf32a.js SPRITE
REGIONS = [(20, 300, 860, 1270), (20, 300, 0, 150), (470, 700, 960, 1270)]  # y0, y1, x0, x1: sofa, left wall, rug

cap = cv2.VideoCapture(SRC)
frames = []
while len(frames) < N:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
assert len(frames) == N, f'{SRC}: {len(frames)} frames, {N} needed'
h, w = frames[0].shape[:2]
grey = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32) for f in frames]

shift = []
for g in grey:
    est = []
    for y0, y1, x0, x1 in REGIONS:
        win = cv2.createHanningWindow((x1 - x0, y1 - y0), cv2.CV_32F)
        (dx, dy), _ = cv2.phaseCorrelate(grey[0][y0:y1, x0:x1], g[y0:y1, x0:x1], win)
        est.append((dx, dy))
    shift.append(np.median(np.array(est), axis=0))
shift = np.array(shift)
k = cv2.getGaussianKernel(7, 1.0)[:, 0]
shift = np.stack([np.convolve(np.pad(shift[:, i], 3, mode='edge'), k, mode='valid') for i in range(2)], 1)

# hold the room where the clip's own path is centred, zoomed just enough that no warped edge shows
c = (shift.max(0) + shift.min(0)) / 2
z = 1 + 2 * max(np.abs(shift[:, 0] - c[0]).max() / w, np.abs(shift[:, 1] - c[1]).max() / h) + 0.004
sheet = np.zeros((FH * -(-N // COLS), FW * COLS, 3), np.uint8)
for i, f in enumerate(frames):
    dx, dy = shift[i] - c
    # output pixel (u, v) shows the source at the centre plus ((u, v) - centre) / z, moved by this frame's shift
    m = np.float32([[1 / z, 0, (w / 2 - 0.5) * (1 - 1 / z) + dx], [0, 1 / z, (h / 2 - 0.5) * (1 - 1 / z) + dy]])
    locked = cv2.warpAffine(f, m, (w, h), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    r, col = divmod(i, COLS)
    sheet[r * FH:(r + 1) * FH, col * FW:(col + 1) * FW] = cv2.resize(locked, (FW, FH), interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT, sheet, [cv2.IMWRITE_JPEG_QUALITY, 90])
print(f'{OUT}: {sheet.shape[1]}x{sheet.shape[0]}, {N} frames, zoom {z:.4f}, path x {shift[:, 0].min():.1f}..{shift[:, 0].max():.1f} y {shift[:, 1].min():.1f}..{shift[:, 1].max():.1f}')
