# camera.py <dir> <stage w> <stage h> : the montage camera, applied after capture (capture.mjs runs it). The hacker
# montage's (ads-src/hacker-announcement-7dfcf32a/camera.py) at 16:9 only: capture.mjs takes every frame whole at one fixed
# scale (m_*.png) and logs each frame's crop in stage px (meta.json); this cuts each crop out with sub-pixel precision and
# scales it to 1920x1080 (f_*.png), removing the masters, so a still camera holds still.
import json, os, sys, traceback
from multiprocessing import Pool
import cv2
import numpy as np

D, SW, SH = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
OW, OH = 1920, 1080

def one(job):
    i, c = job
    try:
        src_p = os.path.join(D, f'm_{i:04d}.png')
        src = cv2.imread(src_p)
        mh, mw = src.shape[:2]
        mx, my = mw / SW, mh / SH  # master px per stage px
        s = c['h'] / OH
        x0, y0 = c['x'] + c['w'] / 2 - OW * s / 2, c['y']
        rx, ry = mx * s, my * s  # master px per output px, 1..ZMAX
        sx0, sy0 = mx * x0, my * y0
        if rx > 1.001 or ry > 1.001:
            # area-average the crop down to about output size first (no aliasing), then place it with a sub-pixel warp
            ix0, iy0 = max(0, int(np.floor(sx0)) - 3), max(0, int(np.floor(sy0)) - 3)
            ix1, iy1 = min(mw, int(np.ceil(sx0 + rx * OW)) + 3), min(mh, int(np.ceil(sy0 + ry * OH)) + 3)
            dw, dh = max(1, round((ix1 - ix0) / rx)), max(1, round((iy1 - iy0) / ry))
            src = cv2.resize(src[iy0:iy1, ix0:ix1], (dw, dh), interpolation=cv2.INTER_AREA)
            fx, fy = dw / (ix1 - ix0), dh / (iy1 - iy0)
            a = [[rx * fx, 0, (sx0 - ix0 + 0.5 * rx) * fx - 0.5], [0, ry * fy, (sy0 - iy0 + 0.5 * ry) * fy - 0.5]]
        else:
            a = [[rx, 0, sx0 + 0.5 * rx - 0.5], [0, ry, sy0 + 0.5 * ry - 0.5]]
        out = cv2.warpAffine(src, np.float32(a), (OW, OH), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
        cv2.imwrite(os.path.join(D, f'f_{i:04d}.png'), out, [cv2.IMWRITE_PNG_COMPRESSION, 1])
        os.remove(src_p)
    except Exception:
        traceback.print_exc()
        raise

if __name__ == '__main__':
    meta = json.load(open(os.path.join(D, 'meta.json')))
    with Pool(8) as p:
        p.map(one, [(i, m['crop']) for i, m in enumerate(meta)], chunksize=8)
    print(f'camera {len(meta)} frames {OW}x{OH}')
