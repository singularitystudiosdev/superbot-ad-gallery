# compose.py <out.mp4> : the superbot cats film, 16:9 at 1920x1080 and 60 fps, cut and mixed.
# It opens as the X spot "Superbot does things your chatbot can't." does (gallery superbot-things-chatbot-cant-1x1-superbot-
# bf3b6bed, built by ../hacker-announcement-7dfcf32a/compose.py as its talk cut of spot `agents`): the same two generated
# shots of the hooded mascot at 16:9 (the chin under the mask hidden in hood shadow, VHS-matched), the line laid at the same
# second, the same cut to the close-up, in the fish.audio HACKER VOICE take the hacker spots ship (vo/agents/fish.wav), and that
# voice carries on through the chat: a line on each ask (vo/*.wav). Where that spot says "Superbot." and tears into the end card,
# this one holds the close-up a beat and tears into superbot's chat, the muse meme spot's 'cats-chatbot' variant
# (beats/cats.70783379.js, captured by capture.mjs with the hacker montage's camera): five asks answered. Then a tear back to
# the close-up for the spot's "Superbot.", and a tear into the house superbot.gg end card (captured from the same variant).
# Disclosures as the hacker montage carries them: "AI-generated footage and voice" over the generated shots, "Dramatization
# · AI voice" over the chat (nothing in it was sent, ordered or cancelled; the narration goes on over it), and the variant's own x50 badge while a generation runs.
# Sound: the voice, the hacker spots' Lyria drone under the mascot, the variant's own soundtrack under the chat (its
# v16 score with the song laid in, capture.mjs audio), glitch hits on each tear and the house end chime; the music ducked
# under the voice (the chat's soundtrack too, under the narration); the mascot's bus through the spot's own loudness pass, the chat's levelled a decibel under it. Encoded to X's
# video ad specs: H.264 High
# 4:2:0, BT.709, two-pass 10 Mbps, AAC-LC 192 kbps, faststart.
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
MT, END = P('work', 'mt'), P('work', 'end')
# the spot's line in the fish.audio HACKER VOICE (the take the hacker spots ship since 2026-10-18; the X post itself ran the
# licensed take, vo/agents/licensed.wav), asked for over the whole film
VO_FILE = HACK('vo', 'agents', 'fish.wav')

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
# The X spot's talk cut, as its compose.py lays it: phrase 1 at 0.30 s, phrase 2 at the take's own pace after it, the wide
# cutting to the close-up midway between them (3.05 s). Here the close-up holds HOLD_A, then the chat; "Superbot." comes
# back on the same close-up after it, and the end card follows it by END_GAP as the spot's does
S1, S2 = spans(VO_FILE, 2)
V1 = 0.30
C1 = (V1 + (S1[1] - S1[0]) + V1 + (S2[0] - S1[0])) / 2
HOLD_A = 0.85
A_END = C1 + HOLD_A
cues = json.load(open(os.path.join(MT, 'cues.json')))
meta = json.load(open(os.path.join(MT, 'meta.json')))
P0 = meta[0]['t']             # the page second the chat enters on (the empty state, just before the first ask types)
M_END = A_END + (cues['cut'] - P0)  # out of the chat as its end card would start to cover it
V2 = M_END + 0.25
B_END = V2 + (S2[1] - S2[0]) + 0.45
END_LEN = 3.0
E_END = B_END + END_LEN
CLOSE0 = 5.4  # the close-up's window in the spot (CLOSE from 5.4 s); the closing shot carries on where the opening one left it
SEGS = [
    ('clip', GESTURE, 0.0, C1, 0.0, min(1.0, PALM / C1), 0.035),
    ('clip', CLOSE, C1, A_END, CLOSE0, 1, 0.02),
    ('frames', MT, A_END, M_END, 0, 1, 0),
    ('clip', CLOSE, M_END, B_END, CLOSE0 + HOLD_A, 1, 0.03),
    ('frames', END, B_END, E_END, 0, 1, 0),
]
for kind, src, a, b, s0, speed, _ in SEGS:
    if kind == 'clip':
        assert s0 + (b - a) * speed <= 7.95, (src, s0, b - a)
        assert src != GESTURE or s0 + (b - a) * speed <= PALM + 1e-6
GLITCH = [(A_END, 0.30), (M_END, 0.30), (B_END, 0.30)]
print(f'  VO "Superbot does things your chatbot can\'t." {V1:.2f}-{V1 + S1[1] - S1[0]:.2f}, "Superbot." {V2:.2f}-{V2 + S2[1] - S2[0]:.2f}')
print(f'  wide to {C1:.2f}, close-up to {A_END:.2f}, chat to {M_END:.2f} (page {P0:.2f}-{cues["cut"]:.2f}), close-up to {B_END:.2f}, card to {E_END:.2f}')
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
        if j < self.i:  # the closing close-up seeks back into a clip read past
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, j); self.i = j - 1
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

clips, LISTS = {}, {}
def frame(n):
    t = n / FPS
    for kind, src, a, b, s0, speed, push in SEGS:
        if a - 1e-6 <= t < b - 1e-6 or (b == E_END and t >= a): break
    if kind == 'clip':
        c = clips.setdefault((src, a), Clip(src))
        shot = push_in(hood_shadow(c.at(s0 + (t - a) * speed)), 1 + push * (t - a) / (b - a))
        img = vhs(cv2.resize(shot, (W, H), interpolation=cv2.INTER_AREA) if shot.shape[1] != W else shot, n)
    else:
        files = LISTS.setdefault(src, sorted(f for f in os.listdir(src) if f.startswith('f_')))
        k = min(len(files) - 1, int(round((t - a + s0) * FPS)))
        img = cv2.imread(os.path.join(src, files[k]))
    for c, d in GLITCH:
        if abs(t - c) < d / 2:
            img = glitch(img, n, 1 - abs(t - c) / (d / 2))
    if kind == 'frames' and src == MT:
        k = min(len(meta) - 1, int(round((t - a) * FPS)))
        over(img, DRAMA_NOTE, 32, 30, min(1, (t - a) / 0.2, (b - t) / 0.1))
        if meta[k]['ff'] > 0.01:
            over(img, FF_IMG, W - FF_IMG.shape[1] - 44, H - FF_IMG.shape[0] - 40, meta[k]['ff'])
    if kind == 'clip':
        over(img, AI_NOTE, W - AI_NOTE.shape[1] - 32, 30)
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
for path, lines in ((VO_FILE, ((V1, S1), (V2, S2))), *((f, ((at, sp),)) for f, at, sp in NARR)):
    vo, vo_gain = load(path, VO_EQ), db(-17 - lufs(path))
    for at, (s, e) in lines:
        a0 = max(0.0, s - 0.04)
        lay(mix_vo, at - (s - a0), vo[int(a0 * SR):int((e + 0.12) * SR)], vo_gain)
drone = load(HACK('music', 'drone.flac'))
lay(mix_mu, 0.0, drone[:int((A_END + 0.12) * SR)], db(-15), 0.4, 0.15)
lay(mix_mu, M_END - 0.03, drone[int(6.0 * SR):int((6.0 + B_END - M_END + 0.13) * SR)], db(-15), 0.05, 0.12)
# the chat's own soundtrack (the page's v16 score and song), from the page second the chat enters on to its tear out; its own
# bus, levelled on its own below
chat = load(os.path.join(P('work', 'audio'), 'chat.wav'))
lay(mix_chat, A_END, chat[int(P0 * SR):int((P0 + M_END - A_END + 0.12) * SR)], 1.0, 0.03, 0.2)

def chime():
    # the end card's sting, the spot's own (../hacker-announcement-7dfcf32a/compose.py chime, verbatim): three glass notes of
    # C major and its octave rolled in as the mascot pops, over a soft sub thump and a short room tail
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
STING_AT = B_END + 0.02
lay(mix_mu, STING_AT, chime()[:int((E_END - STING_AT) * SR)], db(-11), 0.005, 0.6)
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
# and the chat's soundtrack under the narration, up to 8 dB, so a line reads over the score and the sung track
mix_chat *= db(-8 * np.clip(g / 0.05, 0, 1))[:, None]
# the level, per bus. The mascot's (voice, drone, tears, chime) goes through the X spot's own two-pass loudnorm (I -14, TP
# -1.5, LRA 11, linear where it can), so its voice comes out with the spot's dynamics: the spot's first 3.2 s measure -13.5
# LUFS with -1.3 dBFS peaks, and the chat's long stretch is silence on this bus, which the gate leaves out. The chat's bus
# takes one gain to CHAT_LUFS, a decibel under the spot's opening; the two are summed under a -1.0 dBFS limiter
CHAT_LUFS = -14.5
mascot = mix_vo + mix_mu * duck[:, None]
tail = int(0.03 * SR)
for b in (mascot, mix_chat): b[-tail:] *= np.linspace(1, 0, tail)[:, None]
wav_m, wav_c = OUT.replace('.mp4', '.mascot.wav'), OUT.replace('.mp4', '.chat.wav')
for path, buf in ((wav_m, mascot), (wav_c, mix_chat)):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path], input=buf.astype(np.float32).tobytes(), check=True)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav_m, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
norm_m = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={st['input_i']}:measured_TP={st['input_tp']}:measured_LRA={st['input_lra']}"
          f":measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true,aresample={SR}")
chat_in = lufs(wav_c)
gain_c = CHAT_LUFS - chat_in
AUDIO = (f'[1:a]{norm_m}[m];[2:a]volume={gain_c:.2f}dB[c];[m][c]amix=inputs=2:normalize=0:duration=longest,'
         f'alimiter=limit={db(-1.0):.4f}:attack=5:release=60:level=disabled,aresample={SR}[a]')
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
json.dump({'V1': V1, 'C1': C1, 'A_END': A_END, 'M_END': M_END, 'V2': V2, 'B_END': B_END, 'E_END': E_END, 'P0': P0, 'cut': cues['cut']},
          open(OUT.replace('.mp4', '.cuts.json'), 'w'), indent=1)
print(OUT, 'done')
