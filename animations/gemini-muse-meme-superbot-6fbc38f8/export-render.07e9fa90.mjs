// Offline render for the Export button (export.34c23b1d.js) and the gallery's download: a cut at every ratio as an exact
// 60fps MP4 with its soundtrack, written to assets/video/<gallery id>.<ar>.mp4, where the button looks first.
//
// Picture. The spot is a pure function of t (timeline.9b47fc30.js, a 60fps quantised clock; the 3D viewer sets its mixer
// per t), so this is not a screen recording: headless Chromium opens the cut frozen (?t=0, which hides every control pill)
// at its stage size, seeks the clock to i/60 for frame i and screenshots the stage, and ffmpeg takes the PNGs at exactly
// 60fps. Frame i of the file is the spot at i/60, whatever a screenshot cost. 9:16 is drawn at 16/9 device scale and
// cropped to 1080x1920 (the platform size the other renders ship at), so it is re-rendered sharp, not upscaled.
//
// Sound. The cut's default soundtrack as the page plays it, mixed offline in the page: the v16 score buffer the player
// renders (multicat-player.96834de7.js, window.__MC_SCORE, sample 0 = t 0) plus the song from its play press at 0.9
// (songRules.v16 in beats/multicat.516afb1a.js), faded evenly in dB to -40 dB over SONG_FADE after SONG_FOR, as syncAudio
// does there. Keep SOUND in step with that file. A cut whose soundtrack is one narration (`take`: the college cut) reads its
// timing from the beat itself (window.__COLLEGE_SOUND in beats/college.057e3dda.js) and lays that take alone. A cut whose
// beat mixes its whole soundtrack itself (`registered`: the refund cut, its score with the call laid in) hands it over as
// one buffer, window.__EXPORT_AUDIO[variant], and that goes in from t 0 as it is.
//
// usage (from the repo root, with the repo served, e.g. `npx http-server -p 8737 -c-1 .`):
//   node animations/gemini-muse-meme-superbot-6fbc38f8/export-render.07e9fa90.mjs http://127.0.0.1:8737 [16x9,4x3,1x1,4x5,9x16]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const FPS = 60;
const SR = 48000;
const SPOT = 'animations/gemini-muse-meme-superbot-6fbc38f8/';
// variant -> its gallery id (manifest.json, which the button reads) and its soundtrack
const RENDERS = {
  'multicat-credits': {
    id: 'gemini-muse-meme-multicat-credits-superbot-0808d12c',
    sound: { song: 'media/multicat.516afb1a/tiny-chaos.mp3', songData: 'scenes/tabs-assets/beats/multicat-data.516afb1a.js', level: 0.9, songFor: 5.6, songFade: 0.9 },
  },
  // the dog's bare chain (PETS.dog in beats/multicat.516afb1a.js): Tails Up through its second sung line (DOG_SONG_FOR)
  'multidog-credits': {
    id: 'gemini-muse-meme-multidog-credits-superbot-17c0131d',
    sound: { song: 'media/dogs.7b007b09/tails-up.mp3', songData: 'scenes/tabs-assets/beats/multidog-data.7b007b09.js', level: 0.9, songFor: 7.8, songFade: 0.9 },
  },
  // the college cut: its narration (media/college.057e3dda/narration.mp3) is its whole soundtrack, timed by the beat
  college: {
    id: 'gemini-muse-meme-college-superbot-057e3dda',
    sound: { take: '__COLLEGE_SOUND' },
  },
  // the refund cut: its beat's own mixdown (beats/refund.d3537b02.js: its v16 re-cue with the support call laid in at its cue)
  refund: {
    id: 'gemini-muse-meme-refund-superbot-d3537b02',
    sound: { registered: true },
  },
  // the YouTube thumbnail cut: made for a creator to voice over (beats/ytthumb.c4e81a27.js), so its track is silence
  'yt-thumbnail': {
    id: 'gemini-muse-meme-yt-thumbnail-superbot-c4e81a27',
    sound: { silent: true },
  },
  // the gym site cut: made for a creator to voice over (beats/gymsite.6e110402.js), so its track is silence
  'gym-site': {
    id: 'gemini-muse-meme-gym-site-superbot-6e110402',
    sound: { silent: true },
  },
  // the voice clone song cut: visual only (beats/voiceclone.986a9320.js plays no audio), so its track is silence
  'voice-clone-song': {
    id: 'gemini-muse-meme-voice-clone-song-superbot-986a9320',
    sound: { silent: true },
  },
  // the voice clone call cut: its beat's own mixdown (beats/voiceclone-score.6ba3a0f8.js: the bed with the take and the
  // call laid in at their cues)
  'voiceclone-call': {
    id: 'gemini-muse-meme-voiceclone-call-superbot-6ba3a0f8',
    sound: { registered: true },
  },
  // the cats chain: its beat's own mixdown (beats/cats.70783379.js: its v16 re-cue with the song laid in under its level curve)
  'cats-chatbot': {
    id: 'gemini-muse-meme-cats-chatbot-superbot-70783379',
    sound: { registered: true },
  },
};
// stage width at 1080 high, and the scale it is drawn at (9:16 to 1080x1920)
const SIZES = { '16x9': [1920, 1], '4x3': [1440, 1], '1x1': [1080, 1], '4x5': [864, 1], '9x16': [608, 1920 / 1080] };
const H = 1080;
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const [base = 'http://127.0.0.1:8737', arList = Object.keys(SIZES).join(','), only] = process.argv.slice(2);

function run(args, input) {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}: ${args.at(-1)}`)))));
  return { ff, done };
}

// PNG in, H.264 High 4.2 out: BT.709 matrix applied and flagged, a keyframe every 2s, the AAC soundtrack muxed beside it
function encoder(out, wav, crop) {
  return run(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-i', wav,
    '-vf', `${crop ? `crop=${crop},` : ''}scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level:v', '4.2', '-g', String(FPS * 2),
    '-r', String(FPS), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '256k', '-ar', String(SR), '-shortest', '-movflags', '+faststart', out], true);
}

async function open(browser, variant, ar) {
  const [W, scale] = SIZES[ar];
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  page.on('pageerror', (e) => console.error(`[${ar}] pageerror`, e));
  await page.goto(`${base}/${SPOT}?variant=${variant}&ar=${ar}&t=0`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__AD && window.__AD.ready, null, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// the soundtrack, frames/60 long, as a 32-bit float WAV
async function renderSound(browser, variant, sound, frames, wav) {
  const page = await open(browser, variant, '16x9');
  if (sound.take) {
    // a narration-only cut publishes its take once its beat is built (the college beat's window.__COLLEGE_SOUND)
    await page.waitForFunction((k) => window[k], sound.take, { timeout: 60000 });
  } else if (sound.registered) {
    // a self-mixing beat registers its soundtrack once it is built
    await page.waitForFunction((v) => window.__EXPORT_AUDIO && window.__EXPORT_AUDIO[v], variant, { timeout: 60000 });
  } else if (sound.silent) {
    // a cut made to be voiced over waits on nothing: its track stays empty
  } else {
    // a frame on the cut renders the v16 score (the player prepares it on its first sync)
    await page.evaluate(() => { window.__AD.seek(0); window.__AD.seek(window.__AD.CYCLE / 2); });
    await page.waitForFunction(() => window.__MC_SCORE && window.__MC_SCORE.buffer, null, { timeout: 180000 });
  }
  const { b64, peak } = await page.evaluate(async ({ sound, seconds, SR, spot, variant }) => {
    const at = (p) => new URL(p, new URL(spot, location.href)).href;
    const len = Math.round(seconds * SR);
    const ctx = new OfflineAudioContext(2, len, SR);
    // a voice from its press at `level`, faded evenly in dB to -40 dB from fadeAt to fadeEnd, stopped at `stop`
    const lay = (buf, play, level, fadeAt, fadeEnd, stop) => {
      const voice = ctx.createBufferSource(), gain = ctx.createGain();
      voice.buffer = buf;
      gain.gain.setValueAtTime(level, 0);
      gain.gain.setValueAtTime(level, fadeAt);
      gain.gain.exponentialRampToValueAtTime(level * 0.01, fadeEnd);
      gain.gain.linearRampToValueAtTime(0, stop + 0.01);
      voice.connect(gain).connect(ctx.destination);
      voice.start(play, 0);
      voice.stop(stop + 0.01);
    };
    if (sound.take) {
      // the narration alone, as the beat plays it (no score under it)
      const t = window[sound.take];
      lay(await ctx.decodeAudioData(await (await fetch(t.url)).arrayBuffer()), t.play, 1, t.fadeAt, t.fadeEnd, t.stop);
    } else if (sound.registered) {
      // the beat's own mixdown, sample 0 = t 0
      const bed = ctx.createBufferSource();
      bed.buffer = await window.__EXPORT_AUDIO[variant]();
      bed.connect(ctx.destination);
      bed.start(0);
    } else if (sound.silent) {
      // nothing is laid: the render is the cut's length of silence, a track for the voiceover to replace
    } else {
      const score = window.__MC_SCORE.buffer, play = window.__MC_SCORE.cues.play;
      const { DUR } = await import(at(sound.songData));
      const song = await ctx.decodeAudioData(await (await fetch(at(sound.song))).arrayBuffer());
      const bed = ctx.createBufferSource();
      bed.buffer = score;
      bed.connect(ctx.destination);
      bed.start(0);
      const fadeAt = play + sound.songFor, fadeEnd = fadeAt + sound.songFade, stop = play + Math.min(DUR, sound.songFor + sound.songFade);
      lay(song, play, sound.level, fadeAt, fadeEnd, stop);
    }
    const out = await ctx.startRendering();
    // the file ends on the end card's last frame: 30 ms out, so the cut never clicks
    const L = out.getChannelData(0), R = out.getChannelData(1), tail = Math.round(0.03 * SR);
    for (let i = 0; i < tail; i++) { const g = i / tail; L[len - 1 - i] *= g; R[len - 1 - i] *= g; }
    let peak = 0;
    const pcm = new Float32Array(len * 2);
    for (let i = 0; i < len; i++) { pcm[2 * i] = L[i]; pcm[2 * i + 1] = R[i]; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
    const bytes = new Uint8Array(pcm.buffer);
    let s = '';
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return { b64: btoa(s), peak };
  }, { sound, seconds: frames / FPS, SR, spot: './', variant });
  await page.close();
  console.log(`[sound] ${variant}: ${(frames / FPS).toFixed(3)}s, ${peak > 0 ? `peak ${(20 * Math.log10(peak)).toFixed(2)} dBFS` : 'silent'}`);
  const pcm = Buffer.from(b64, 'base64');
  const head = Buffer.alloc(44);
  head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8);
  head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(3, 20); head.writeUInt16LE(2, 22);
  head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 8, 28); head.writeUInt16LE(8, 32); head.writeUInt16LE(32, 34);
  head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(wav, Buffer.concat([head, pcm]));
}

async function renderOne(browser, variant, id, ar, wav) {
  const [W, scale] = SIZES[ar];
  const page = await open(browser, variant, ar);
  const cycle = await page.evaluate(() => window.__AD.CYCLE);
  const last = Math.round(cycle * FPS);

  // warm-up: walk the run once so every bitmap has decoded and the 3D viewer has drawn before frame 0 is taken
  await page.evaluate(async (cycle) => {
    for (let t = 0; t <= cycle; t += 0.25) {
      window.__AD.seek(t);
      await Promise.all([...document.querySelectorAll('#stage img')].map((im) => im.decode().catch(() => {})));
      await new Promise(requestAnimationFrame);
    }
  }, cycle);

  const cdp = await page.context().newCDPSession(page);
  const out = path.join(REPO, 'assets/video', `${id}.${ar}.mp4`);
  // a scaled stage lands a fraction of a pixel over its platform size: cropped to it (1080x1920 at 9:16)
  const crop = scale === 1 ? '' : `${Math.floor((W * scale) / 2) * 2}:${Math.round(H * scale)}:0:0`;
  const { ff, done } = encoder(out, wav, crop);
  const t0 = Date.now();
  for (let i = 0; i <= last; i++) {
    await page.evaluate((t) => window.__AD.seek(t), i / FPS);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale }, optimizeForSpeed: true });
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (FPS * 5) === 0) console.log(`[${ar}] ${i}/${last} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await done;
  await page.close();
  console.log(`[${ar}] ${out}: ${last + 1} frames, ${((last + 1) / FPS).toFixed(3)}s at ${FPS}fps`);
}

// CHROME: an installed Chrome to drive instead of Playwright's own build (e.g. /Applications/Google Chrome.app/...)
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}) });
try {
  for (const [variant, { id, sound }] of Object.entries(RENDERS)) {
    if (only && only !== variant) continue;
    const probe = await open(browser, variant, '16x9');
    const frames = Math.round((await probe.evaluate(() => window.__AD.CYCLE)) * FPS) + 1;
    await probe.close();
    const wav = path.join(fs.mkdtempSync(path.join(REPO, '.tmp-export-')), `${variant}.wav`);
    await renderSound(browser, variant, sound, frames, wav);
    await Promise.all(arList.split(',').map((ar) => renderOne(browser, variant, id, ar, wav)));
    fs.rmSync(path.dirname(wav), { recursive: true, force: true });
  }
} finally {
  await browser.close();
}
