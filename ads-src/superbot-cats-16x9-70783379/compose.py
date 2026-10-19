# compose.py <out.mp4> : the superbot cats film, 16:9 at 1920x1080 and 60 fps, cut and mixed.
# It opens as the X spot "Superbot does things your chatbot can't." does (gallery superbot-things-chatbot-cant-1x1-superbot-
# bf3b6bed, built by ../hacker-announcement-7dfcf32a/compose.py as its talk cut of spot `agents`): the same two generated
# shots of the hooded mascot at 16:9 (the chin under the mask hidden in hood shadow, VHS-matched), the line laid at the same
# second and the same cut to the close-up, the line read in the fish.audio HACKER VOICE that narrates the rest (vo/intro.wav).
# The close-up holds a beat, then a dive carries it into superbot's chat: the mask pushes in, softens and dims as the chat
# settles in out of a slight zoom (no tape tear). The chat is the muse meme spot's 'cats-chatbot' variant (beats/cats.70783379.js,
# captured by capture.mjs with the hacker montage's camera): five asks answered, the same voice narrating each (vo/*.wav), and
# it runs on through the variant's own superbot.gg end card. The spot's closing "Superbot." is not used.
# Disclosures as the hacker montage carries them: "AI-generated footage and voice" over the generated shots, "Dramatization
# · AI voice" over the chat (nothing in it was sent, ordered or cancelled; the narration goes on over it), and the variant's
# own x50 badge while a generation runs. After the last plan cancels, the mascot's voice laughs (vo/laugh.wav).
# Sound: the voice, the hacker spots' Lyria drone under the mascot easing out through the dive with a soft rising whoosh, the
# variant's own soundtrack (its v16 score with the song laid in and its end card's sounds, capture.mjs audio) easing in; the
# music ducked under the voice (the chat's soundtrack too, under the narration); the mascot's bus through the spot's own
# loudness pass, the chat's levelled a decibel under it. Encoded to X's video ad specs: H.264 High 4:2:0, BT.709, two-pass
# 10 Mbps, AAC-LC 192 kbps, faststart.
# Needs numpy, opencv-python and pillow (the poetry env build.sh names), ffmpeg, and macOS's SF Pro.
import sys, os, json, subprocess, math, re, traceback
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.abspath(sys.argv[1])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
HACK = lambda *a: os.path.join(ROOT, '..', 'hacker-announcement-7dfcf32a', *a)
FPS, SR, W, H = 60, 48000, 1920, 1080
GESTURE, CLOSE = P('work', 'art60', 'omni-wide-gesture.mp4'), P('work', 'art60', 'omni-close.mp4')
PALM = 2.45  # the gesture shot's figure reads until here; from 2.55 s it raises an open palm, which is never shown
MT = P('work', 'mt')
# the spot's line, read in the same fish.audio HACKER VOICE take settings as the narration (the best of four), so the film
# has one voice throughout
VO_FILE = P('vo', 'intro.wav')

def spans(path, n):
    # the take's spoken stretches (silencedetect at -38 dB, 0.1 s), merged into n phrases across its n-1 longest pauses
    # (../hacker-announcement-7dfcf32a/compose.py spans, verbatim)
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

# ---------- the cut (edit seconds) ----------
# The X spot's talk cut, as its compose.py lays it: the line at 0.30 s on the wide, the cut to the close-up just after it (the
# spot cuts 0.21 s after its line's last word; here 0.25). The close-up holds, then the dive (XF seconds, its middle at A_END)
# carries it into the chat, which runs from the variant's empty state through its own end card
S1 = spans(VO_FILE, 1)[0]
V1 = 0.30
C1 = V1 + (S1[1] - S1[0]) + 0.25
HOLD_A = 0.85
A_END = C1 + HOLD_A  # the dive's middle
XF = 0.8             # the dive's length
cues = json.load(open(os.path.join(MT, 'cues.json')))
meta = json.load(open(os.path.join(MT, 'meta.json')))
P_T0 = meta[0]['t']  # the capture's first page second: the empty state, under the dive's first half
P0 = 1.0             # the page second at the dive's middle, just before the first ask types
E_END = A_END + (cues['end'] - P0)  # the variant's end card run out
CUT = A_END + (cues['cut'] - P0)    # its end card starts to cover the chat
CLOSE0 = 5.4         # the close-up's window in the spot (CLOSE from 5.4 s)
assert P_T0 <= P0 - XF / 2 + 1e-6, (P_T0, P0)
assert CLOSE0 + (A_END + XF / 2 - C1) <= 7.95
print(f'  VO "Superbot does things your chatbot can\'t." {V1:.2f}-{V1 + S1[1] - S1[0]:.2f}')
print(f'  wide to {C1:.2f}, close-up, the dive {A_END - XF / 2:.2f}-{A_END + XF / 2:.2f}, chat (page {P0:.2f}-{cues["end"]:.2f}) to {E_END:.2f}, its end card from {CUT:.2f}')
# the narration over the chat: the same voice, a line on each ask as superbot answers it (vo/*.wav: fish.audio /v1/tts, model
# drama-3, voice 12d45eb3f90e4b8a9fb448a26c71367f HACKER VOICE, the best of three takes each), each laid at a second of the
# variant's own clock (cues.json: its first reply r, each later ask's send). The song's line ends before the track's first
# sung word; the cancels' line before the last plan cancels
SEND = [cues['focus'][i][0] + 0.2 for i in range(1, 5)]  # each later ask's send (beats/cats.70783379.js focus: send - 0.2)
edit = lambda page: A_END + (page - P0)
NARR = [(P('vo', 'discord.wav'), cues['r'] + 0.15), (P('vo', 'model.wav'), SEND[0] + 0.1), (P('vo', 'order.wav'), SEND[1] + 0.1),
        (P('vo', 'song.wav'), SEND[2] + 0.05), (P('vo', 'subs.wav'), SEND[3] + 0.1)]
NARR = [(f, edit(at), spans(f, 1)[0]) for f, at in NARR]
_, song_at, (song_s, song_e) = NARR[3]
assert song_at + song_e - song_s < edit(cues['play']) - 0.1, 'the song line runs into the sung track'
# and the laugh: the same voice laughing manically just after the last plan cancels (cues.json `cancelled`), done before
# the variant's end card starts to cover the chat (vo/laugh.wav: fish.audio s2.1-pro, the same voice, the best of 18 takes)
LAUGH = P('vo', 'laugh.wav')
NARR.append((LAUGH, edit(cues['cancelled']) + 0.15, spans(LAUGH, 1)[0]))
_, laugh_at, (laugh_s, laugh_e) = NARR[-1]
assert laugh_at + laugh_e - laugh_s < edit(cues['cut']) + 0.1, 'the laugh runs into the end card'
for f, at, (s, e) in NARR: print(f'  narration {os.path.basename(f)} {at:.2f}-{at + e - s:.2f}')

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
    # The generated figure shows a human chin in the hood under the mask; the hood's inside below the mask goes to deep
    # shadow, as the spot's does (../hacker-announcement-7dfcf32a/compose.py hood_shadow, verbatim)
    h, w = f.shape[:2]
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    v, s, hue = hsv[:, :, 2].astype(np.int16), hsv[:, :, 1].astype(np.int16), hsv[:, :, 0].astype(np.int16)
    skin_hue = (s >= 20) & (v > 60) & ((hue <= 30) | (hue >= 160))
    dark = cv2.morphologyEx(((v < 85) | skin_hue).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    if n < 2: return f
    inv = (lab != 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    seen = np.zeros((h + 2, w + 2), np.uint8)
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]:
        if inv[y, x] == 1: cv2.floodFill(inv, seen, (x, y), 2)
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
    below = np.arange(h, dtype=np.float32)[:, None] - bottom[None, :] + 0.01 * bh
    ramp = np.clip(below / (0.025 * bh), 0, 1)
    vert = ramp * ramp * (3 - 2 * ramp) * np.clip(1 - (below - hold * bh) / ((depth - hold) * bh), 0, 1)
    xr = (cols - x0) / max(1, bw - 1)
    a = np.zeros((h, w), np.float32)
    a[:, x0:x0 + bw] = vert * np.clip((np.minimum(xr, 1 - xr) - 0.06) / 0.14, 0, 1)[None, :]
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

def rgb_split(img, px):
    # the dive's one trace of the tape look: a soft red/blue split, a few px at its middle, no torn bands
    s = int(round(px))
    if s <= 0: return img
    out = img.copy()
    out[:, :, 2] = np.roll(out[:, :, 2], s, axis=1)
    out[:, :, 0] = np.roll(out[:, :, 0], -s, axis=1)
    return out

def over(dst, rgba, x, y, a=1.0):
    h, w = rgba.shape[:2]
    roi = dst[y:y + h, x:x + w].astype(np.float32)
    al = rgba[:, :, 3:4].astype(np.float32) / 255 * a
    dst[y:y + h, x:x + w] = (roi * (1 - al) + rgba[:, :, :3].astype(np.float32) * al).astype(np.uint8)

def pill(text, fnt, pad=(28, 14), r=16, bg=(0, 0, 0, 165), fg=(255, 255, 255, 255), border=None, h=None):
    tw = int(fnt.getlength(text)); asc, desc = fnt.getmetrics()
    ph = h or asc + desc + 2 * pad[1]
    im = Image.new('RGBA', (tw + 2 * pad[0], ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=bg, outline=border, width=2 if border else 0)
    d.text((pad[0], ph / 2), text, font=fnt, fill=fg, anchor='lm')
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGBA2BGRA)
NOTE = lambda text: pill(text, font(24, 'Semibold'), pad=(16, 9), r=12, bg=(0, 0, 0, 150), fg=(255, 255, 255, 230))
AI_NOTE, DRAMA_NOTE = NOTE('AI-generated footage and voice'), NOTE('Dramatization · AI voice')
# the variant's x50 badge (multicat.516afb1a.css .mc-ff: 60px high, 24px in, pill, 28px semibold, at 44 / 40 from the
# corner), drawn here at the output's own corner since the camera would crop and scale the page's
FF_IMG = pill('x50', font(28, 'Semibold'), pad=(24, 0), r=30, bg=(12, 12, 14, 199), fg=(236, 236, 236, 255), border=(255, 255, 255, 31), h=60)

def push_in(img, z):
    if z <= 1.0005: return img
    h, w = img.shape[:2]
    cw, ch = w / z, h / z
    m = np.float32([[z, 0, -(w - cw) / 2 * z], [0, z, -(h - ch) / 2 * z]])
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

clips, FILES = {}, sorted(f for f in os.listdir(MT) if f.startswith('f_'))
clamp = lambda x: min(1.0, max(0.0, x))
smooth = lambda u: u * u * (3 - 2 * u)
blur = lambda img, sigma: img if sigma < 0.3 else cv2.GaussianBlur(img, (0, 0), sigma)

def mascot(t, n, u):
    # the wide, then the close-up from CLOSE0 pushing in slowly; through the dive (u 0..1) it pushes on into the mask,
    # softens and dims
    if t < C1:
        c, s0, a, speed, z = clips.setdefault('g', Clip(GESTURE)), 0.0, 0.0, min(1.0, PALM / C1), 1 + 0.035 * t / C1
    else:
        c, s0, a, speed, z = clips.setdefault('c', Clip(CLOSE)), CLOSE0, C1, 1, 1 + 0.02 * (t - C1) / HOLD_A
    shot = push_in(hood_shadow(c.at(s0 + (t - a) * speed)), z * (1 + 0.32 * u ** 1.7))
    img = vhs(cv2.resize(shot, (W, H), interpolation=cv2.INTER_AREA) if shot.shape[1] != W else shot, n)
    img = blur(img, 7 * u ** 1.5)
    return (img.astype(np.float32) * (1 - 0.55 * smooth(u))).astype(np.uint8)

def chat(t, u):
    # the captured chat at its page second (held on the capture's first frame before it), settling in out of a 7% zoom and
    # a soft blur through the dive
    page = P0 + (t - A_END)
    k = min(len(FILES) - 1, max(0, int(round((page - P_T0) * FPS))))
    img = cv2.imread(os.path.join(MT, FILES[k]))
    if u < 1:
        img = blur(push_in(img, 1 + 0.07 * (1 - smooth(u)) ** 2), 5 * (1 - u) ** 1.5)
    return img, min(len(meta) - 1, k)

def frame(n):
    t = n / FPS
    u = clamp((t - (A_END - XF / 2)) / XF)  # the dive's progress
    a = smooth(clamp((u - 0.1) / 0.8))      # how much of the chat shows
    if a <= 0:
        img = mascot(t, n, u)
    elif a >= 1:
        img, k = chat(t, u)
    else:
        m = mascot(t, n, u).astype(np.float32)
        c, k = chat(t, u)
        img = rgb_split((m * (1 - a) + c.astype(np.float32) * a).astype(np.uint8), 3 * math.sin(math.pi * u))
    if a < 1:
        over(img, AI_NOTE, W - AI_NOTE.shape[1] - 32, 30, 1 - a)
    if a > 0:
        # the chat's notes: Dramatization in with the chat and out as its end card covers it; the x50 badge with the page's
        k = min(len(meta) - 1, max(0, int(round((P0 + (t - A_END) - P_T0) * FPS))))
        over(img, DRAMA_NOTE, 32, 30, a * (1 - clamp((t - CUT) / 0.3)))
        if meta[k]['ff'] > 0.01:
            over(img, FF_IMG, W - FF_IMG.shape[1] - 44, H - FF_IMG.shape[0] - 40, meta[k]['ff'] * a)
    return img

# ---------- sound ----------
def load(path, af=None):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, *(['-af', af] if af else []), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
N = int(E_END * SR)
mix_vo, mix_mu, mix_chat = (np.zeros((N, 2), np.float32) for _ in range(3))
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
# the voice as the spot lays it: each phrase from 40 ms before its first word to 120 ms past its last, the take at -17 LUFS,
# its rumble cut and its consonants lifted
VO_EQ = 'highpass=f=90,equalizer=f=3200:t=q:w=1.1:g=3.5,equalizer=f=250:t=q:w=1:g=-2'
# (every narration line brought to the same -17 LUFS on its own)
for path, lines in ((VO_FILE, ((V1, S1),)), *((f, ((at, sp),)) for f, at, sp in NARR)):
    vo, vo_gain = load(path, VO_EQ), db(-17 - lufs(path))
    for at, (s, e) in lines:
        a0 = max(0.0, s - 0.04)
        lay(mix_vo, at - (s - a0), vo[int(a0 * SR):int((e + 0.12) * SR)], vo_gain)
drone = load(HACK('music', 'drone.flac'))
# the drone under the mascot, easing out across the dive
lay(mix_mu, 0.0, drone[:int((A_END + XF / 2) * SR)], db(-15), 0.4, XF)
# the chat's own soundtrack (the page's v16 score, the song and its end card's sounds), easing in across the dive from the
# page second under its start, to the end of the film; its own bus, levelled on its own below
chat_wav = load(os.path.join(P('work', 'audio'), 'chat.wav'))
lay(mix_chat, A_END - XF / 2, chat_wav[int((P0 - XF / 2) * SR):int((P0 - XF / 2 + E_END - (A_END - XF / 2)) * SR)], 1.0, XF * 0.75, 0.05)

def whoosh(length):
    # the dive's sound: soft noise swelling through a low-pass that opens from 300 Hz to about 4 kHz, then easing off
    n = int(length * SR); u = np.arange(n) / n
    z = np.random.default_rng(11).normal(0, 1, (n, 2))
    a = 1 - np.exp(-2 * np.pi * 300 * 14 ** u / SR)
    y = np.empty_like(z); s = np.zeros(2)
    for i in range(n):
        s += a[i] * (z[i] - s); y[i] = s
    y *= (np.sin(np.pi * u) ** 1.5)[:, None]
    return (y / np.abs(y).max()).astype(np.float32)
lay(mix_mu, A_END - XF / 2, whoosh(XF + 0.2), db(-24), 0.01, 0.1)
# duck the music under the voice: the voice's envelope (fast attack, slow release) pulls it down up to 9 dB
env = np.abs(mix_vo).max(1)
k = int(0.02 * SR)
env = np.convolve(env, np.ones(k) / k, 'same')
g = np.empty_like(env); s = 0.0
att, rel = 1 - math.exp(-1 / (0.015 * SR)), 1 - math.exp(-1 / (0.3 * SR))
for i, v in enumerate(env):
    s += (att if v > s else rel) * (v - s); g[i] = s
duck = db(-9 * np.clip(g / 0.05, 0, 1))
# and the chat's soundtrack under the narration, up to 8 dB, so a line reads over the score and the sung track
mix_chat *= db(-8 * np.clip(g / 0.05, 0, 1))[:, None]
# the level, per bus. The mascot's (voice, drone, tears, chime) goes through the X spot's own two-pass loudnorm (I -14, TP
# -1.5, LRA 11, linear where it can), so its voice comes out with the spot's dynamics: the spot's first 3.2 s measure -13.5
# LUFS with -1.3 dBFS peaks, and the chat's long stretch is silence on this bus, which the gate leaves out. The chat's bus
# takes one gain to CHAT_LUFS, a decibel under the spot's opening; the two are summed under a -1.5 dBFS limiter (AAC adds about a decibel of overshoot)
CHAT_LUFS = -14.5
mascot_bus = mix_vo + mix_mu * duck[:, None]
tail = int(0.03 * SR)
for b in (mascot_bus, mix_chat): b[-tail:] *= np.linspace(1, 0, tail)[:, None]
wav_m, wav_c = OUT.replace('.mp4', '.mascot.wav'), OUT.replace('.mp4', '.chat.wav')
for path, buf in ((wav_m, mascot_bus), (wav_c, mix_chat)):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=buf.astype(np.float32).tobytes(), check=True)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav_m, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
norm_m = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={st['input_i']}:measured_TP={st['input_tp']}:measured_LRA={st['input_lra']}"
          f":measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true,aresample={SR}")
chat_in = lufs(wav_c)
gain_c = CHAT_LUFS - chat_in
AUDIO = (f'[1:a]{norm_m}[m];[2:a]volume={gain_c:.2f}dB[c];[m][c]amix=inputs=2:normalize=0:duration=longest,'
         f'alimiter=limit={db(-1.5):.4f}:attack=5:release=60:level=disabled,aresample={SR}[a]')
print(f'  mascot bus {st["input_i"]} LUFS in (loudnorm to -14), chat bus {chat_in:.1f} LUFS in, gain {gain_c:+.2f} dB')

# ---------- encode ----------
mezz = OUT.replace('.mp4', '.mezz.mkv')
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-pix_fmt', 'yuv444p', mezz], stdin=subprocess.PIPE)
try:
    for n in range(int(round(E_END * FPS))):
        enc.stdin.write(frame(n).tobytes())
        if n % 600 == 0: print(f'  frame {n}/{int(round(E_END * FPS))}', flush=True)
except Exception:
    traceback.print_exc()
    enc.kill()
    raise
enc.stdin.close(); enc.wait()
log = OUT.replace('.mp4', '.x264')
vopts = ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level:v', '4.2', '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M',
    '-g', str(FPS), '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-passlogfile', log]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mezz, *vopts, '-pass', '1', '-an', '-f', 'null', '-'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mezz, '-i', wav_m, '-i', wav_c, '-filter_complex', AUDIO, '-map', '0:v', '-map', '[a]', *vopts, '-pass', '2',
    '-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', '192k', '-ar', str(SR), '-shortest', '-movflags', '+faststart', OUT], check=True)
for f in os.listdir(os.path.dirname(OUT)):
    if f.startswith(os.path.basename(log)): os.remove(os.path.join(os.path.dirname(OUT), f))
json.dump({'V1': V1, 'C1': C1, 'A_END': A_END, 'XF': XF, 'CUT': CUT, 'E_END': E_END, 'P0': P0, 'P_T0': P_T0, 'page_cut': cues['cut']},
          open(OUT.replace('.mp4', '.cuts.json'), 'w'), indent=1)
print(OUT, 'done')
