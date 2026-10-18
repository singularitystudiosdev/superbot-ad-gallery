# compose.py <ar 16x9|1x1> <out.mp4> [take fish|licensed] : the hooded mascot's statement, cut and mixed (README.md).
# Picture: the two generated shots of the hooded figure (art/, the chin under the mask hidden in hood shadow, VHS-matched to
# the key frame), a slow push-in on the wide, a short tape tear into the close-up and another into the superbot.gg end card
# (work/end*, captured from the muse meme spot's multidog-credits cut by endcard.mjs), the AI disclosure over the
# generated shots and the superbot mark held in the upper left (X's video spec: a logo "persistent in the upper left hand
# corner"); no burned-in captions, an SRT beside the render instead. Sound: the take's voice, the hacker-announcement
# spot's Lyria drone and beat ducked under it, a synthesized end chime and two glitch hits; two-pass loudness
# normalization toward -14 LUFS / -1.5 dBTP.
# Takes: `fish` is the fish.audio HACKER VOICE (vo/line*.wav); `licensed` is OpenAI gpt-4o-mini-tts "onyx", deepened 1.5
# semitones (vo/licensed-line*.wav), the cut whose every element is cleared for commercial use.
# Needs python3 with numpy, opencv-python and pillow, ffmpeg, and macOS's SF Pro (/System/Library/Fonts/SFNS.ttf).
import sys, os, json, subprocess, math, re
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

AR, OUT = sys.argv[1], os.path.abspath(sys.argv[2])
TAKE = sys.argv[3] if len(sys.argv) > 3 else 'fish'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
SIB = lambda *a: P('..', 'hacker-announcement-7dfcf32a', *a)
FPS, SR = 30, 48000
W, H = (1920, 1080) if AR == '16x9' else (1080, 1080)
END = P('work', f'end{AR[:2].replace("x", "")}')
END_F0 = 18  # the capture's first frame with the chat gone (27.6 s into multidog-credits): the card over black
END_LEN = 3.1  # the card on screen: the mascot pops, the wordmark lands, about two seconds held

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

# ---------- the voice, and the cut it sets (edit seconds) ----------
# Each line split into phrases at its longest pauses and laid end to end: a pause inside a line is kept up to MAXGAP, the
# lines are LINE_GAP apart. Lines 1 and 2 play on the wide, which cuts to the close-up just after line 2; line 3 plays on
# the close-up, which tears into the card just after "Superbot." The licensed take reads slower: it runs at TEMPO (pitch
# kept, atempo) so both cuts land at about 15 s, X's recommended length.
# The script is held to what superbot.gg/features shows the product doing (X's ads terms §8(v)(d): not "false, deceptive,
# misleading", outcomes "representative of outcomes a typical user can expect"), in whole sentences (X's Quality policy:
# "proper grammar"): line 2's four phrases are its four commas.
TAKES = {
    'fish': {'files': [P('vo', f'line{i}.wav') for i in (1, 2, 3)], 'tempo': 1.0},
    'licensed': {'files': [P('vo', f'licensed-line{i}.wav') for i in (1, 2, 3)], 'tempo': 1.07},
}[TAKE]
TEMPO, LEAD, LINE_GAP, MAXGAP = TAKES['tempo'], 0.35, 0.35, 0.30
L1, L2, L3 = TAKES['files']
VO, t = [], LEAD
for path, n, gap in ((L1, 1, LINE_GAP), (L2, 4, 0.0), (L3, 2, 0.0)):
    sps = spans(path, n)
    for i, sp in enumerate(sps):
        VO.append((path, t, sp))
        t += (sp[1] - sp[0]) / TEMPO
        if i + 1 < len(sps): t += min(MAXGAP, (sps[i + 1][0] - sp[1]) / TEMPO)
    if path == L2:
        WIDE_END = t + 0.22
        t = WIDE_END + 0.20
    else:
        t += gap
CLOSE_END = t + 0.40
E_END = CLOSE_END + min(END_LEN, max(2.6, 15.0 - CLOSE_END))  # the card gives up to half a second to stay within 15 s
TEXTS = ['Superbot is here.', 'It can make calls,', 'generate images and 3D models,', 'and connect to your apps directly,',
         "so you don't have to set up MCPs.", 'Try it out today.', 'Superbot.']
SPANS = [(at, at + (sp[1] - sp[0]) / TEMPO) for _, at, sp in VO]
for (a, b), text in zip(SPANS, TEXTS):
    print(f'  {a:6.2f}-{b:6.2f}  {text}')
print(f'  wide to {WIDE_END:.2f}, close-up to {CLOSE_END:.2f}, card to {E_END:.2f}')
# the closed captions X plays when a viewer turns them on (<out>.srt, uploaded beside the video): one cue per idea, each
# held 0.3 s past its last word unless the next begins sooner; nothing is burned into the picture. The first cue names the
# voice as AI-generated, so a captions viewer gets the same disclosure the picture gives
CUES = [(0, 0), (1, 2), (3, 4), (5, 6)]
def ts(s): return f'{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round(s % 1 * 1000)) % 1000:03d}'
with open(OUT.replace('.mp4', '.srt'), 'w') as srt:
    for k, (i, j) in enumerate(CUES):
        end = min(SPANS[j][1] + 0.3, SPANS[CUES[k + 1][0]][0] - 0.05) if k + 1 < len(CUES) else SPANS[j][1] + 0.3
        text = ('[AI-generated voice] ' if k == 0 else '') + ' '.join(TEXTS[i:j + 1])
        srt.write(f"{k + 1}\n{ts(SPANS[i][0])} --> {ts(end)}\n{text}\n\n")

# (kind, source, edit start, edit end, source start, source speed). The wide reads lines 1 and 2 under a slow push-in,
# eased below 1x only if the take runs past its 10 s; the close-up, from 1.6 s (after its opening reframe), looks into the
# lens for line 3; the card's last frame holds to the end
WIDE_SRC = 9.95
SEGS = [
    ('clip', P('art', 'omni-wide-read.mp4'), 0.0, WIDE_END, 0.0, min(1.0, WIDE_SRC / WIDE_END)),
    ('clip', P('art', 'omni-close-look.mp4'), WIDE_END, CLOSE_END, 1.6, 1.0),
    ('frames', END, CLOSE_END, E_END, 0, 1.0),
]
GLITCH = [(WIDE_END, 0.24, 0.6), (CLOSE_END, 0.30, 1.0)]  # (edit time, length, strength)
PUSH = 0.07  # the wide's push-in, 1.0x to 1.07x over the shot

# ---------- picture ----------
def font(size, weight='Bold'):
    f = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', size)
    f.set_variation_by_name(weight)
    return f

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

def hood_shadow(f, depth=0.5):
    # The generated figure shows a human chin in the hood under the mask; it reads as a person in a mask, not the mascot,
    # so the hood's inside below the mask goes to deep shadow. The mask: the topmost sizeable bright region the dark
    # hood-and-body silhouette encloses (the wall lies outside it, the paper runs off the frame or meets the hands). Under
    # its lower edge a shadow eases in, fades out over `depth` of the mask's height and is feathered at its sides, and it
    # takes everything there but the neutral greys (the mask and its lower shading, saturation under about 12 under the
    # tape's green tint, and the paper): skin (hue 0-25 or 160 up, saturation 20-55), a lit lip, a beard in shadow and the
    # hood all go dark. The shadow starts just inside the mask's edge, so no strip of chin survives under it.
    h, w = f.shape[:2]
    # (judged on a softened copy and smoothed, so the mask's edge stays clean instead of fraying pixel by pixel)
    hsv = cv2.cvtColor(cv2.GaussianBlur(f, (0, 0), 2), cv2.COLOR_BGR2HSV)
    hue, sat, v = (hsv[:, :, i].astype(np.int16) for i in range(3))
    tinted = (hue >= 30) & (hue <= 150)
    keep = np.where(tinted, np.clip((20 - sat) / 6.0, 0, 1), np.clip((8 - sat) / 4.0, 0, 1)) * np.clip((v - 70) / 20.0, 0, 1)
    keep = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 3)
    v = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)[:, :, 2].astype(np.int16)
    dark = cv2.morphologyEx((v < 85).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    if n < 2: return f
    inv = (lab != 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    seen = np.zeros((h + 2, w + 2), np.uint8)
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
        if inv[y, x] == 1: cv2.floodFill(inv, seen, (x, y), 2)
    holes = cv2.morphologyEx(((inv == 1) & (v > 110) & (sat < 20)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(holes)
    big = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w]
    if not big: return f
    k = min(big, key=lambda i: cen[i][1])
    x0, y0, bw, bh = st[k, :4]
    m = lab == k
    cols = np.arange(x0, x0 + bw)
    bottom = np.array([np.nonzero(m[:, c])[0].max() if m[:, c].any() else y0 for c in cols], np.float32)
    bottom = cv2.GaussianBlur(bottom.reshape(1, -1), (1, 31), 0).ravel()
    below = np.arange(h, dtype=np.float32)[:, None] - bottom[None, :] + 0.03 * bh
    ramp = np.clip(below / (0.04 * bh), 0, 1)
    vert = ramp * ramp * (3 - 2 * ramp) * np.clip(1 - below / (depth * bh), 0, 1)
    xr = (cols - x0) / max(1, bw - 1)
    a = np.zeros((h, w), np.float32)
    a[:, x0:x0 + bw] = vert * np.clip(np.minimum(xr, 1 - xr) / 0.12, 0, 1)[None, :]
    a = np.clip(cv2.GaussianBlur(a, (0, 0), 6) * 1.25, 0, 1) * (1 - keep)
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
    out = f.astype(np.float32) * (1 - a[..., None]) + (g * 0.12 + 7) * a[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

def fit(img, z=1.0):
    # a 16:9 shot into the frame: the square takes the centre on the figure; a push-in of z crops toward the mask
    # (centred across, 45% down) before the resize, so the zoom is re-sampled once
    h, w = img.shape[:2]
    if AR == '1x1' and w > h:
        x0 = (w - h) // 2
        img = img[:, x0:x0 + h]
        h, w = img.shape[:2]
    if z > 1.0:
        cw, ch = w / z, h / z
        x = (w - cw) / 2
        y = min(max(0.45 * h - ch / 2, 0), h - ch)
        M = np.float32([[1 / z, 0, x], [0, 1 / z, y]])
        return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE) \
            if (w, h) == (W, H) else cv2.resize(img[int(y):int(y + ch), int(x):int(x + cw)], (W, H), interpolation=cv2.INTER_CUBIC)
    if (w, h) == (W, H): return img
    return cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA if w > W else cv2.INTER_CUBIC)

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

def pill(text, fnt, pad=(28, 14), r=16, bg=(0, 0, 0, 165), fg=(255, 255, 255, 255)):
    tw = int(fnt.getlength(text)); asc, desc = fnt.getmetrics()
    im = Image.new('RGBA', (tw + 2 * pad[0], asc + desc + 2 * pad[1]), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=bg)
    d.text((pad[0], pad[1]), text, font=fnt, fill=fg)
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGBA2BGRA)
# the disclosure over the generated shots: the figure and the voice are both synthetic (OpenAI's usage policies ask for a
# "clear disclosure" of an AI voice). Kept small and quiet in the corner, at 40% of a phone-legible size: the SRT's first
# cue and the post copy carry the same disclosure at full size
NOTE_PX = 22 if AR == '16x9' else 13
AI_NOTE = pill('AI-generated video and voice', font(NOTE_PX, 'Semibold'), pad=(round(NOTE_PX * 0.42), round(NOTE_PX * 0.26)),
               r=round(NOTE_PX * 0.4), bg=(0, 0, 0, 170), fg=(255, 255, 255, 240))

def tile(px):
    # superbot's app icon (superbot.gg/site/assets/brand/tile.svg), drawn from its own geometry at 8x and scaled down: the
    # cat face (a rounded rect and two ears, the eyes cut out) in white over its teal and magenta ghosts, on a black tile
    S = px * 8; k = S / 100
    def face(dx, dy):
        m = Image.new('L', (S, S), 0); d = ImageDraw.Draw(m)
        q = lambda x, y: ((x + dx) * k, (y + dy) * k)
        d.rounded_rectangle([q(14, 32), q(86, 86)], 15 * k, fill=255)
        for side in (1, -1):
            X = lambda x: 50 + side * (x - 50)
            pts = [(X(14), 46), (X(14), 28)]
            for (x0, y0), (cx, cy), (x1, y1) in [((14, 28), (14, 20), (21, 21)), ((21, 21), (28, 24), (36, 32))]:
                pts += [(X((1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1), (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1)
                        for u in np.linspace(0, 1, 24)[1:]]
            d.polygon([q(x, y) for x, y in pts], fill=255)
        for cx in (35, 65):
            d.ellipse([q(cx - 8, 58 - 11), q(cx + 8, 58 + 11)], fill=0)
        return m
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, S - 1, S - 1], 115 / 512 * S, fill=(0, 0, 0, 255))
    for (dx, dy), col in [((-1.2, -1.2), (0, 229, 195)), ((1.2, 1.2), (192, 38, 211)), ((0, 0), (255, 255, 255))]:
        im.paste(Image.new('RGBA', (S, S), col + (255,)), (0, 0), face(dx, dy))
    return cv2.cvtColor(np.array(im.resize((px, px), Image.LANCZOS)), cv2.COLOR_RGBA2BGRA)
LOGO = tile(93 if AR == '16x9' else 54)  # the app icon held at its size; the disclosure sits level with its middle

def frame(n):
    t = n / FPS
    for kind, src, a, b, s0, speed in SEGS:
        if a - 1e-6 <= t < b - 1e-6 or (b == E_END and t >= a): break
    if kind == 'clip':
        c = clips.setdefault(src, Clip(src))
        z = 1.0
        if a == 0.0:
            u = min(1.0, t / WIDE_END)
            z = 1.0 + PUSH * (u * u * (3 - 2 * u) * 0.35 + u * 0.65)  # near-linear, eased at its start
        img = vhs(fit(hood_shadow(c.at(s0 + (t - a) * speed)), z), n)
    else:
        files = LISTS.setdefault(src, sorted(f for f in os.listdir(src) if f.startswith('f_')))
        k = min(len(files) - 1, END_F0 + int(round((t - a) * FPS)))
        img = fit(cv2.imread(os.path.join(src, files[k])))
    for c, d, s in GLITCH:
        if abs(t - c) < d / 2:
            img = glitch(img, n, s * (1 - abs(t - c) / (d / 2)))
    if kind == 'clip':
        over(img, LOGO, 32, 30)
        over(img, AI_NOTE, W - AI_NOTE.shape[1] - 32, 30 + (LOGO.shape[0] - AI_NOTE.shape[0]) // 2)
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
VO_EQ = 'highpass=f=90,equalizer=f=3200:t=q:w=1.1:g=3.5,equalizer=f=250:t=q:w=1:g=-2' + (f',atempo={TEMPO}' if TEMPO != 1 else '')
takes = {}
for path, at, (s, e) in VO:
    x = takes.setdefault(path, load(path, VO_EQ))
    a0 = max(0.0, s - 0.04)
    lay(mix_vo, at - (s - a0) / TEMPO, x[int(a0 / TEMPO * SR):int((e + 0.12) / TEMPO * SR)], db(-17 - lufs(path)))
drone, beat = load(SIB('music', 'drone.flac')), load(SIB('music', 'beat.flac'))

def chime():
    # the end card's sting, synthesized: three glass notes of C major and its octave rolled in as the mascot pops, over a
    # soft sub thump and a short room tail; voiced from C4 with its upper partials kept low, so it lands warm after the bed
    n = int(3.5 * SR); t = np.arange(n) / SR
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
    st *= np.clip((3.5 - t) / 0.4, 0, 1)[:, None]
    return (st / np.abs(st).max() * db(-3)).astype(np.float32)
# the bed: the drone under the whole statement, the beat entering with line 2, both cut by the tear into the card; the
# chime lands as the card's mascot pops (END_F0 is the card's first black frame, the pop about 0.15 s later)
B0 = VO[1][1] - 0.15  # the beat comes in just ahead of line 2
lay(mix_mu, 0.0, drone[:int((CLOSE_END + 0.12) * SR)], db(-15), 0.4, 0.15)
lay(mix_mu, B0, beat[int(0.06 * SR):int((0.06 + CLOSE_END - B0 + 0.12) * SR)], db(-16), 0.6, 0.15)
lay(mix_mu, CLOSE_END + 0.02, chime()[:int((E_END - CLOSE_END - 0.02) * SR)], db(-11), 0.005, 0.6)
# the glitch hits: crushed noise bursts on each tear
for c, d, s in GLITCH:
    n = int(0.32 * SR); r = np.random.default_rng(int(c * 100))
    env = np.exp(-np.linspace(0, 6, n)) * (0.6 + 0.4 * (r.random(n) > 0.5))
    z = r.normal(0, 1, n)
    z = np.repeat(z[::12], 12)[:n]
    z = np.round(z * 4) / 4
    lay(mix_mu, c - 0.12, np.stack([z * env, np.roll(z, 37) * env], 1).astype(np.float32), db(-20 - 6 * (1 - s)), 0.003, 0.05)
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

# ---------- encode: H.264 High 4:2:0 at 30 fps, 8 Mbps two-pass, AAC LC, faststart ----------
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
