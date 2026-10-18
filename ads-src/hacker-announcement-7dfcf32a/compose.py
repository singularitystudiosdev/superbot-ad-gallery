# compose.py <ar 16x9|1x1> <out.mp4> [take fish|licensed] [cut montage|talk] : the Superbot hacker ad, cut and mixed.
# Cuts: `montage` (README.md) opens and closes on the hooded mascot and drops into the chat for the feature list (the
# gallery's 'hacker' variant, frames from render-montage.mjs in work/); `talk` keeps the mascot on screen the whole way,
# the generated shots intercut on the voice's own pauses, no chat. Picture: the generated hacker shots (the chin under the
# mask hidden in hood shadow, VHS-matched), the end card rendered from the variant, mild glitch transitions and the
# disclosure notes (the montage cut's "Dramatization" and "Sped up" too); no captions (asked off). Sound: the take's voice,
# the Lyria drone and beat ducked under it, a synthesized end chime and glitch hits; two-pass loudness normalization
# toward -14 LUFS / -1.5 dBTP.
# Takes: `fish` is the fish.audio HACKER VOICE (vo/line*.wav); `licensed` is OpenAI gpt-4o-mini-tts "onyx"
# (vo/licensed-line*.wav), the cut whose every element is licensed for commercial use, with its own first line.
# Needs python3 with numpy, opencv-python and pillow, ffmpeg, and macOS's SF Pro (/System/Library/Fonts/SFNS.ttf).
import sys, os, json, subprocess, math, re
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

AR, OUT = sys.argv[1], os.path.abspath(sys.argv[2])
TAKE = sys.argv[3] if len(sys.argv) > 3 else 'fish'
CUT = sys.argv[4] if len(sys.argv) > 4 else 'montage'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
FPS, SR = 30, 48000
W, H = (1920, 1080) if AR == '16x9' else (1080, 1080)
MT, END = P('work', f'mt{AR[:2].replace("x", "")}'), P('work', f'end{AR[:2].replace("x", "")}')
GESTURE, POINT, CLOSE = P('art', 'omni-wide-gesture.mp4'), P('art', 'omni-wide-point.mp4'), P('art', 'omni-close.mp4')
PALM = 2.45  # the gesture shot's figure reads until here; from 2.55 s it raises an open palm, which is never shown

TAKES = {
    'fish': {'files': ['line1.wav', 'line2.wav', 'line3.wav'], 'line1': 'Superbot gives you better output.'},
    'licensed': {'files': ['licensed-line1.wav', 'licensed-line2.wav', 'licensed-line3.wav'], 'line1': 'Superbot does the work for you.'},
}[TAKE]
L1, L2, L3 = (P('vo', f) for f in TAKES['files'])

def spans(path, n):
    # the take's spoken stretches (silencedetect at -38 dB, 0.1 s), merged into n phrases across its n-1 longest pauses
    log = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.1', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    gaps = list(zip(ss, se + [dur] * (len(ss) - len(se))))
    inner = sorted([g for g in gaps if g[0] > 0.02 and g[1] < dur - 0.02], key=lambda g: g[1] - g[0], reverse=True)[:n - 1]
    cuts = sorted(inner)
    s0 = next((e for s, e in gaps if s <= 0.02), 0.0)
    e1 = next((s for s, e in gaps if e >= dur - 0.02), dur)
    bounds = [s0] + [x for g in cuts for x in g] + [e1]
    return [(bounds[2 * i], bounds[2 * i + 1]) for i in range(n)]

S1, S2, S3 = spans(L1, 1), spans(L2, 5), spans(L3, 2)
lay3 = lambda at: [(L3, at + (sp[0] - S3[0][0]), sp) for sp in S3]  # line 3's two phrases at its own pace from `at`
END_LEN = 3.0

# ---------- the cut (edit seconds) ----------
# SEGS: (kind, source, edit start, edit end, source start, source speed, push) where push is a slow zoom-in over the shot.
# MUSIC: (file, edit at, source from, length, gain dB, fade in, fade out). GLITCH: (edit centre, length) tears.
if CUT == 'montage':
    A_END, M_END, B1_END, B2_END = 2.70, 11.80, 13.10, 14.50
    E_END = B2_END + END_LEN
    SPOT0 = 2.45  # the montage's first frame is the spot at this time (render-montage.mjs t0): the first ask just sent
    # the opening holds to the gesture shot's palm-free first 2.45 s, eased to 0.91x to fill its 2.7 s
    SEGS = [
        ('clip', GESTURE, 0.0, A_END, 0.0, PALM / A_END, 0),
        ('frames', MT, A_END, M_END, 0, 1, 0),
        ('clip', POINT, M_END, B1_END, 3.95, 1, 0),
        ('clip', CLOSE, B1_END, B2_END, 3.85, 1, 0),
        ('frames', END, B2_END, E_END, 0, 1, 0),
    ]
    GLITCH = [(A_END, 0.30), (M_END, 0.30)]
    cues = json.load(open(os.path.join(MT, 'cues.json')))
    meta = json.load(open(os.path.join(MT, 'meta.json')))
    spot = lambda s: A_END + (s - SPOT0)  # spot seconds -> edit seconds, inside the montage
    # line 1 on the gesture, line 2's five phrases each on its card's cue, line 3 on the point and the close-up
    L2_AT = [spot(cues[k]) for k in ('calls', 'images', 'models', 'apps', 'mcps')]
    VO = [(L1, 0.30, S1[0])] + [(L2, at, sp) for at, sp in zip(L2_AT, S2)] + lay3(11.95)
    MUSIC = [('drone', 0.0, 0.0, A_END + 0.12, -15, 0.4, 0.15), ('beat', A_END - 0.03, 0.06, M_END - A_END + 0.15, -13, 0.02, 0.18),
             ('drone', M_END - 0.03, 6.0, B2_END - M_END + 0.1, -15, 0.05, 0.12)]
    STING_AT = B2_END + 0.02
else:
    # the mascot alone: the voice runs at its own pace and the shots change on its pauses, as the old hacker videos cut
    # between their wide and close shots. Line 1 over the opening; line 2 straight on, a breath after it; line 3 a beat later
    l1_end = 0.30 + S1[0][1] - S1[0][0]
    L2_AT = max(2.55, l1_end + 0.6)
    VO = [(L1, 0.30, S1[0])] + [(L2, L2_AT + (sp[0] - S2[0][0]), sp) for sp in S2]
    rel = lambda i: L2_AT + (S2[i][0] - S2[0][0])
    end2 = lambda i: L2_AT + (S2[i][1] - S2[0][0])
    L3_AT = end2(4) + 0.65
    VO += lay3(L3_AT)
    l3a_end = L3_AT + S3[0][1] - S3[0][0]
    l3b_at = L3_AT + S3[1][0] - S3[0][0]
    cuts = [L2_AT - 0.1,                       # wide (reading) -> close-up as line 2 starts
            (end2(1) + rel(2)) / 2,            # -> wide (lowering the paper) after "generate images"
            (end2(3) + rel(4)) / 2,            # -> close-up for "so you don't need MCPs"
            L3_AT - 0.12,                      # -> wide, pointing, "Try it out today"
            (l3a_end + l3b_at) / 2,            # -> close-up on "Superbot."
            L3_AT + S3[1][1] - S3[0][0] + 0.45]  # -> the end card
    E_END = cuts[5] + END_LEN
    # each shot's source window: the close-up's steady stare (1.3 s on), the point shot reading then facing the camera,
    # the close-up again after its tilt (5.4 s on), the point shot pointing (3.95 s on), the close-up's tilt (3.85 s on)
    SEGS = [('clip', GESTURE, 0.0, cuts[0], 0.0, min(1.0, PALM / cuts[0]), 0.035),
            ('clip', CLOSE, cuts[0], cuts[1], 1.3, 1, 0.03),
            ('clip', POINT, cuts[1], cuts[2], 0.3, 1, 0.035),
            ('clip', CLOSE, cuts[2], cuts[3], 5.4, 1, 0.03),
            ('clip', POINT, cuts[3], cuts[4], 3.95, 1, 0.02),
            ('clip', CLOSE, cuts[4], cuts[5], 3.85, 1, 0.03),
            ('frames', END, cuts[5], E_END, 0, 1, 0)]
    for kind, src, a, b, s0, speed, _ in SEGS:
        if kind == 'clip':
            assert s0 + (b - a) * speed <= 7.95, (src, s0, b - a)
            assert src != GESTURE or s0 + (b - a) * speed <= PALM + 1e-6
    GLITCH = [(cuts[5], 0.30)]
    MUSIC = [('drone', 0.0, 0.0, cuts[5] + 0.1, -15, 0.4, 0.12),
             ('beat', L2_AT - 0.1, 0.06, end2(4) - L2_AT + 0.6, -19, 0.35, 0.4)]
    STING_AT = cuts[5] + 0.02
    print('  cuts', ' '.join(f'{c:.2f}' for c in cuts), 'end', f'{E_END:.2f}')
# where each phrase lands (logged; the cut carries no captions)
TEXTS = [TAKES['line1'], 'It can make calls,', 'generate images,', '3D models,', 'connect to your apps directly,',
         "so you don't need MCPs.", 'Try it out today.', 'Superbot.']
for (_, at, sp), text in zip(VO, TEXTS):
    print(f'  {at:6.2f}-{at + sp[1] - sp[0]:6.2f}  {text}')

# ---------- picture ----------
def font(size, weight='Bold'):
    f = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', size)
    f.set_variation_by_name(weight)
    return f
FF_FONT = font(28, 'Semibold')

class Clip:
    def __init__(self, path):
        self.cap, self.i, self.f = cv2.VideoCapture(path), -1, None
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
    def at(self, s):
        j = max(0, int(round(s * self.fps)))
        while self.i < j:
            ok, f = self.cap.read()
            if not ok: break
            self.f, self.i = f, self.i + 1
        return self.f

clips, LISTS = {}, {}
rng_scan = None
def vhs(img, n):
    # the key frame's analog look, re-applied evenly to every generated shot: fine scanlines, grain, a slight green cast
    global rng_scan
    if rng_scan is None or rng_scan.shape[:2] != img.shape[:2]:
        rows = np.ones((img.shape[0], 1, 1), np.float32)
        rows[2::4] = 0.9; rows[3::4] = 0.9
        rng_scan = np.broadcast_to(rows, img.shape).copy()
    f = img.astype(np.float32) * rng_scan
    f *= np.array([0.97, 1.0, 0.965], np.float32)
    g = np.random.default_rng(1000 + n).normal(0, 3.2, img.shape[:2]).astype(np.float32)[..., None]
    return np.clip(f + g, 0, 255).astype(np.uint8)

def hood_shadow(f, hold=0.28, depth=0.55):
    # The generated figure shows a human chin in the hood under the mask; it reads as a person in a mask, not the mascot,
    # so the hood's inside below the mask goes to deep shadow. The mask: the topmost sizeable bright region the dark
    # hood-and-body silhouette encloses (the wall lies outside it, the paper runs off the frame or meets the hands). Under
    # its lower edge a shadow eases in, holds full through `hold` of the mask's height (where the chin sits: on the wide
    # shots it reaches about a quarter of the mask's height down), fades out by `depth` and is feathered at its sides, and
    # it only takes what is already dark (a chin in shadow, the hood): the mask's grey lower shading and a hand stay as shot.
    h, w = f.shape[:2]
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    v, s, hue = hsv[:, :, 2].astype(np.int16), hsv[:, :, 1].astype(np.int16), hsv[:, :, 0].astype(np.int16)
    # the silhouette that encloses the mask: the dark hood and body, and a hand raised against them (skin hue; the wall is
    # green and the mask colourless), so a hand over the hood's edge never opens the ring
    skin_hue = (s >= 20) & (v > 60) & ((hue <= 30) | (hue >= 160))
    dark = cv2.morphologyEx(((v < 85) | skin_hue).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    if n < 2: return f
    inv = (lab != 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    seen = np.zeros((h + 2, w + 2), np.uint8)
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
        if inv[y, x] == 1: cv2.floodFill(inv, seen, (x, y), 2)
    # the mask is colourless (saturation about 5) where a hand raised beside it is not (about 30), so they never merge
    holes = cv2.morphologyEx(((inv == 1) & (v > 110) & (s < 18)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(holes)
    big = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w]
    if not big: return f
    k = min(big, key=lambda i: cen[i][1])
    x0, y0, bw, bh = st[k, :4]
    m = lab == k
    cols = np.arange(x0, x0 + bw)
    bottom = np.array([np.nonzero(m[:, c])[0].max() if m[:, c].any() else y0 for c in cols], np.float32)
    bottom = cv2.GaussianBlur(bottom.reshape(1, -1), (1, 31), 0).ravel()
    # from the mask's edge itself (the lips sit right under it): its grey lower shading is spared by the darkness rule below
    below = np.arange(h, dtype=np.float32)[:, None] - bottom[None, :] + 0.01 * bh
    ramp = np.clip(below / (0.025 * bh), 0, 1)
    vert = ramp * ramp * (3 - 2 * ramp) * np.clip(1 - (below - hold * bh) / ((depth - hold) * bh), 0, 1)
    xr = (cols - x0) / max(1, bw - 1)
    a = np.zeros((h, w), np.float32)
    a[:, x0:x0 + bw] = vert * np.clip((np.minimum(xr, 1 - xr) - 0.06) / 0.14, 0, 1)[None, :]
    # what it may take: anything under the chin's brightest highlight (value 150), except the mask (its edge feathered, so
    # the shadow never cuts a step into its shading) and a hand: every skin-hued pixel joined to a large bright skin core,
    # its shaded thumb and nail included, nothing around it (no halo). The chin is skin too, but the dark hood parts it
    # from the hand
    core = ((v > 140) & (s >= 20)).astype(np.uint8)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(core)
    core = np.isin(lab2, [i for i in range(1, n2) if st2[i, cv2.CC_STAT_AREA] > 0.0015 * h * w])
    n3, lab3 = cv2.connectedComponents(cv2.morphologyEx(skin_hue.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)))
    hand = np.isin(lab3, np.unique(lab3[core & (lab3 > 0)])) & (lab3 > 0) if core.any() else np.zeros((h, w), bool)
    hand = cv2.morphologyEx(hand.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((17, 17), np.uint8)).astype(bool)
    soft_m = cv2.GaussianBlur(cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 3)
    a = np.clip(cv2.GaussianBlur(a, (0, 0), 6) * 1.25, 0, 1) * np.clip((150 - v) / 30.0, 0, 1) * (1 - soft_m) * (~hand)
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
    out = f.astype(np.float32) * (1 - a[..., None]) + (g * 0.12 + 7) * a[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

def fit(img):
    h, w = img.shape[:2]
    if (w, h) == (W, H): return img
    if AR == '1x1' and w > h:  # a 16:9 shot into the square: centre crop on the figure
        x0 = (w - h) // 2
        img = img[:, x0:x0 + h]
    return cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA if img.shape[1] > W else cv2.INTER_CUBIC)

def glitch(img, n, p):
    # a short analog tear: displaced bands, a red/blue split and a few noise lines; never a full-frame flash
    if p <= 0: return img
    r = np.random.default_rng(n * 7 + 3)
    out = img.copy()
    for _ in range(int(3 + 7 * p)):
        y0 = int(r.integers(0, H - 8)); hh = int(r.integers(6, 70)); dx = int(r.normal(0, 70 * p))
        out[y0:y0 + hh] = np.roll(out[y0:y0 + hh], dx, axis=1)
    s = int(round(12 * p))
    if s:
        out[:, :, 2] = np.roll(out[:, :, 2], s, axis=1)
        out[:, :, 0] = np.roll(out[:, :, 0], -s, axis=1)
    for _ in range(int(6 * p)):
        y = int(r.integers(0, H - 2))
        out[y:y + 2] = np.clip(out[y:y + 2].astype(np.int16) + int(r.integers(30, 90)), 0, 255).astype(np.uint8)
    return out

def over(dst, rgba, x, y, a=1.0):
    h, w = rgba.shape[:2]
    roi = dst[y:y + h, x:x + w].astype(np.float32)
    al = rgba[:, :, 3:4].astype(np.float32) / 255 * a
    dst[y:y + h, x:x + w] = (roi * (1 - al) + rgba[:, :, :3].astype(np.float32) * al).astype(np.uint8)

def pill(text, fnt, pad=(28, 14), r=16, bg=(0, 0, 0, 165), fg=(255, 255, 255, 255), border=None):
    tw = int(fnt.getlength(text)); asc, desc = fnt.getmetrics()
    im = Image.new('RGBA', (tw + 2 * pad[0], asc + desc + 2 * pad[1]), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=bg, outline=border, width=2 if border else 0)
    d.text((pad[0], pad[1]), text, font=fnt, fill=fg)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGBA2BGRA)
# the montage's fast-forward, said in words: the generations' real factor, and plain "Sped up" while the apps connect
BADGE = lambda text: pill(text, FF_FONT, pad=(24, 14), r=30, bg=(12, 12, 14, 199), fg=(236, 236, 236, 255), border=(255, 255, 255, 31))
FF_IMG, APPS_IMG = BADGE('Sped up 150×'), BADGE('Sped up')
# the eight tiles connecting (beats/hacker.7dfcf32a.js TILE_*); the talk cut has no chat
APPS_FF = (spot(cues['apps']) - 0.1, spot(cues['apps']) + 1.3) if CUT == 'montage' else None
# disclosures: the generated shots and voice, and the montage as a dramatization with a fictional business on the call
NOTE_FONT = font(24 if AR == '16x9' else 22, 'Semibold')
NOTE = lambda text: pill(text, NOTE_FONT, pad=(16, 9), r=12, bg=(0, 0, 0, 150), fg=(255, 255, 255, 230))
AI_NOTE, DRAMA_NOTE = NOTE('AI-generated footage and voice'), NOTE('Dramatization · fictional business')

def push_in(img, z):
    # a slow centred zoom-in on a shot (z >= 1), so a held talking shot never sits dead still
    if z <= 1.0005: return img
    h, w = img.shape[:2]
    cw, ch = w / z, h / z
    m = np.float32([[z, 0, -(w - cw) / 2 * z], [0, z, -(h - ch) / 2 * z]])
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

def frame(n):
    t = n / FPS
    for kind, src, a, b, s0, speed, push in SEGS:
        if a - 1e-6 <= t < b - 1e-6 or (b == E_END and t >= a): break
    if kind == 'clip':
        c = clips.setdefault(src, Clip(src))
        shot = push_in(hood_shadow(c.at(s0 + (t - a) * speed)), 1 + push * (t - a) / (b - a))
        img = vhs(fit(shot), n)
    else:
        files = LISTS.setdefault(src, sorted(f for f in os.listdir(src) if f.startswith('f_')))
        k = min(len(files) - 1, int(round((t - a) * FPS)))
        img = fit(cv2.imread(os.path.join(src, files[k])))
    for c, d in GLITCH:
        if abs(t - c) < d / 2:
            img = glitch(img, n, 1 - abs(t - c) / (d / 2))
    # the montage: its disclosure top left, the "Sped up" badge while a generation runs or the apps connect (no corner
    # logo: the scrolling chat would run under it)
    if kind == 'frames' and src == MT:
        k = min(len(meta) - 1, int(round((t - a) * FPS)))
        over(img, DRAMA_NOTE, 32, 30, min(1, (t - a) / 0.2, (b - t) / 0.1))
        mx, my = (44, 40) if AR == '16x9' else (36, 150)
        app_on = min(1, max(0, (t - APPS_FF[0]) / 0.15), max(0, (APPS_FF[1] - t) / 0.2))
        if meta[k]['ff'] > 0.01:
            over(img, FF_IMG, W - FF_IMG.shape[1] - mx, H - FF_IMG.shape[0] - my, meta[k]['ff'])
        elif app_on > 0:
            over(img, APPS_IMG, W - APPS_IMG.shape[1] - mx, H - APPS_IMG.shape[0] - my, app_on)
    if kind == 'clip':
        over(img, AI_NOTE, W - AI_NOTE.shape[1] - 32, 30)
    return img

# ---------- sound ----------
def load(path, af=None):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, *(['-af', af] if af else []), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
N = int(E_END * SR)
mix_vo, mix_mu = np.zeros((N, 2), np.float32), np.zeros((N, 2), np.float32)
def lay(buf, at, x, gain=1.0, fin=0.01, fout=0.02):
    x = x.copy()
    fi, fo = int(fin * SR), int(fout * SR)
    if fi: x[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    i = int(round(at * SR)); j = min(N, i + len(x))
    if j > i: buf[i:j] += x[:j - i] * gain
def lufs(path):
    log = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', log)[-1])
# every phrase cut from 40 ms before its first word to 120 ms past its last, its first word landing on its cue; each take
# brought to -17 LUFS before the mix, its rumble cut and its consonants lifted so the words stay clear over the bed
VO_EQ = 'highpass=f=90,equalizer=f=3200:t=q:w=1.1:g=3.5,equalizer=f=250:t=q:w=1:g=-2'
for path, at, (s, e) in VO:
    a0 = max(0.0, s - 0.04)
    lay(mix_vo, at - (s - a0), load(path, VO_EQ)[int(a0 * SR):int((e + 0.12) * SR)], db(-17 - lufs(path)))
drone, beat = load(P('music', 'drone.flac')), load(P('music', 'beat.flac'))

def chime():
    # the end card's sting, synthesized: three glass notes of C major and its octave rolled in as the mascot pops (the
    # house card's "three glass notes"), over a soft sub thump and a short room tail; C major resolves the beat's A minor.
    # Voiced an octave down (C4 up), its upper partials kept low, so it lands warm after the dark bed rather than bright
    n = int(3.0 * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for k, f in enumerate([261.63, 329.63, 392.0, 523.25]):
        at = k * 0.07; tt = np.clip(t - at, 0, None); on = (t >= at)
        atk = np.clip(tt / 0.006, 0, 1)
        for m, a, tau in [(1, 1.0, 1.3), (2.0, 0.22, 0.55), (3.01, 0.06, 0.3), (4.2, 0.02, 0.18)]:
            out += on * atk * a * np.exp(-tt / tau) * np.sin(2 * np.pi * f * m * tt) * (0.8 if k == 3 else 1)
    ph = 2 * np.pi * np.cumsum(48 + 32 * np.exp(-t / 0.05)) / SR
    out += 1.6 * np.exp(-t / 0.22) * np.clip(t / 0.003, 0, 1) * np.sin(ph)
    out /= np.abs(out).max()
    r = np.random.default_rng(7)
    ir = [r.normal(0, 1, int(1.1 * SR)) * np.exp(-np.arange(int(1.1 * SR)) / (0.35 * SR)) for _ in range(2)]
    wet = [np.convolve(out, i)[:n] for i in ir]
    st = np.stack([out + 0.18 * wet[0] / np.abs(wet[0]).max(), out + 0.18 * wet[1] / np.abs(wet[1]).max()], 1)
    st *= np.clip((3.0 - t) / 0.4, 0, 1)[:, None]
    return (st / np.abs(st).max() * db(-3)).astype(np.float32)
sting = chime()
beds = {'drone': drone, 'beat': beat}
for name, at, frm, length, gain, fin, fout in MUSIC:
    lay(mix_mu, at, beds[name][int(frm * SR):int((frm + length) * SR)], db(gain), fin, fout)
lay(mix_mu, STING_AT, sting[:int((E_END - STING_AT) * SR)], db(-11), 0.005, 0.6)
# the glitch hits: crushed noise bursts on each tear
for c, d in GLITCH:
    n = int(0.32 * SR); r = np.random.default_rng(int(c * 100))
    env = np.exp(-np.linspace(0, 6, n)) * (0.6 + 0.4 * (r.random(n) > 0.5))
    z = r.normal(0, 1, n)
    z = np.repeat(z[::12], 12)[:n]
    z = np.round(z * 4) / 4
    lay(mix_mu, c - 0.12, np.stack([z * env, np.roll(z, 37) * env], 1).astype(np.float32), db(-20), 0.003, 0.05)
# duck the music under the voice: the voice's envelope (fast attack, slow release) pulls it down up to 9 dB
env = np.abs(mix_vo).max(1)
k = int(0.02 * SR)
env = np.convolve(env, np.ones(k) / k, 'same')
g = np.empty_like(env); s = 0.0
att, rel = 1 - math.exp(-1 / (0.015 * SR)), 1 - math.exp(-1 / (0.3 * SR))
for i, v in enumerate(env):
    s += (att if v > s else rel) * (v - s); g[i] = s
duck = db(-9 * np.clip(g / 0.05, 0, 1))
mix = mix_vo + mix_mu * duck[:, None]
tail = int(0.03 * SR); mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
wav = OUT.replace('.mp4', '.mix.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', wav], input=mix.astype(np.float32).tobytes(), check=True)
# two-pass loudness: measure, then normalize linearly to -14 LUFS / -1.5 dBTP
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
norm = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={st['input_i']}:measured_TP={st['input_tp']}:measured_LRA={st['input_lra']}"
        f":measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true,aresample={SR}")

# ---------- encode: H.264 High 4:2:0 at 30 fps, 8 Mbps two-pass (X: 6-10 Mbps at 1080p), AAC LC, faststart ----------
mezz = OUT.replace('.mp4', '.mezz.mkv')
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-pix_fmt', 'yuv444p', mezz], stdin=subprocess.PIPE)
for n in range(int(round(E_END * FPS))):
    enc.stdin.write(frame(n).tobytes())
enc.stdin.close(); enc.wait()
log = OUT.replace('.mp4', '.x264')
vopts = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level:v', '4.1', '-b:v', '8M', '-maxrate', '10M', '-bufsize', '16M',
    '-g', str(FPS), '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-passlogfile', log]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mezz, *vopts, '-pass', '1', '-an', '-f', 'null', '-'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mezz, '-i', wav, '-map', '0:v', '-map', '1:a', *vopts, '-pass', '2', '-af', norm,
    '-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', '192k', '-ar', str(SR), '-shortest', '-movflags', '+faststart', OUT], check=True)
for f in os.listdir(os.path.dirname(OUT)):
    if f.startswith(os.path.basename(log)): os.remove(os.path.join(os.path.dirname(OUT), f))
print(OUT, 'loudness in', st['input_i'], 'LUFS')
