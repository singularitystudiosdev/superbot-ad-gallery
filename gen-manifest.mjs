// Generates manifest.json by scanning assets/. Run: node gen-manifest.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

const ONLY_GROUP = 'Ad spots';

// PNG IHDR: bytes 16-19 width, 20-23 height (big-endian)
function pngSize(path) {
  const b = readFileSync(path);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const groups = [
  { dir: 'assets/img', group: 'App screenshots', type: 'image', match: f => f.startsWith('screenshot-'), titles: {
    'screenshot-activity': 'App — Activity', 'screenshot-credits': 'App — Credits',
    'screenshot-dashboard': 'App — Dashboard', 'screenshot-settings': 'App — Settings',
    'screenshot-setup': 'App — Setup' } },
  { dir: 'assets/img', group: 'SUPERBOT.GG', type: 'image', match: f => !f.startsWith('screenshot-'), titles: {
    'gg-preview': 'SUPERBOT.GG — preview', 'mono': 'Mono textmode', 'mono-fx': 'Mono — fx pass',
    'mono-home': 'Mono — home', 'mono-wipe': 'Mono — wipe' } },
  { dir: 'assets/img/icons', group: 'IDE icons', type: 'image', titles: null },
];

// Static image ads (v7-spb-vd sources). Each ships one PNG per gallery ratio —
// assets/ads/<id>.<ar>.png, height 1350 — so the poster reshapes with the ratio
// picker instead of sitting at a fixed 4:5. `src` carries the {ar} slot the
// gallery fills in; `sizes` gives each ratio's pixels for the tile and the
// download label.
const AD_ARS = ['4x5', '16x9', '4x3', '1x1'];
const ads = [
  ['stop-burning-tokens', 'stop burning tokens · the three-word poster with the superbot icon (static)'],
  ['agents-refusing-poster', 'agents refusing? superbot can do it! · the refusal poster (static)'],
  ['agents-slow-poster', 'agents slow? superbot can do it! · the speed poster (static)'],
  ['agent-workspace-poster', 'your all in one agent workspace · the workspace poster (static)'],
  // the context before/after family, built from ads-src/context-storage (the
  // phone-cleaner "Optimize Storage" before/after bars, re-drawn for an agent's
  // context window; 2026-09-16)
  ['context-full-poster', 'context full? superbot can fix it! · before/after: ChatGPT at 188K of 196K, ChatGPT (with superbot) at 113K; 75K tokens freed (static)'],
  ['context-slow-poster', 'agent slow? superbot can fix it! · before/after: ChatGPT at 170K and 36s replies, ChatGPT (with superbot) at 102K and 27s; 1.3x faster (static)'],
  ['context-costly-poster', 'context costly? superbot can fix it! · before/after: Claude Code at $26.40 of a $30 daily budget by 4 pm, Claude Code (with superbot) at $15.84; $10.56 a day saved (static)'],
];

const anims = [
  ['gg-home', 'animations/gg/', 'SUPERBOT.GG — Pure ASCII', 'The .gg landing hero: full-ASCII mascot + wordmark, live.'],
  ['gg-crt', 'animations/gg/crt.html', 'SUPERBOT.GG — Pure Textmode (CRT)', 'Textmode variant of the landing page.'],
  ['app', 'animations/app/', 'superbot — setup wizard', 'Interactive onboarding demo: install, link, subscribe, activate.'],
  ['ide-merge', 'animations/ide-merge/', 'The IDE merge — every IDE, one bot', 'Ad spot: IDEs orbit, converge and merge into the superbot mascot.'],
  ['ide-orbit', 'animations/ide-orbit/', 'IDE orbit', 'Ad spot: IDE icons orbiting the superbot core.'],
  ['merge-hero', 'animations/merge-hero/', 'Merge hero', 'Hero ad: agents merge into superbot_.'],
  ['merge-hero-v2', 'animations/merge-hero-v2/', 'Merge hero — variant 2', 'Alternate cut of the merge hero.'],
  ['orbit-hero', 'animations/orbit-hero/', 'All agents, one — orbit hero', 'Hero ad: every agent card orbits, then converges.'],
];
const animThumbs = {
  'gg-home': 'gg-home-9s', 'gg-crt': 'gg-crt-9s', 'app': 'app-4s', 'ide-merge': 'ide-merge-9s',
  'ide-orbit': 'ide-orbit-4s', 'merge-hero': 'merge-hero-9s', 'merge-hero-v2': 'merge-hero-v2-9s',
  'orbit-hero': 'orbit-hero-4s',
};

const items = anims.map(([id, src, title, desc]) => ({
  id, type: 'animation', group: 'Animations', title, desc,
  src,
  thumb: `assets/shots/${animThumbs[id]}.png`,
}));

// Second sweep — ad spots, site variants, hero FX and related pages.
// [name, pagePath, title, group]
const more = [
  // Data House (projects/data-house promo/, 2026-09-29): a user asks for non-public niche data and the
  // private Reddit panel answers, then the logo card on grey; the rendered 1080x1350 60 fps film with
  // sound plays from a video wrapper, 4:5 only, and the download is that bundled file
  ['data-house-private-panel-4x5', 'data-house-private-panel-4x5/', 'Data House: private niche data (4:5)', 'Ad spots', {
    desc: 'Four questions to Data House, each answered as a raw JSON API response from the private panel: the most common LLM prompts, the ChatGPT x Grok user overlap (the one matching record: 54 shared authors, 1.8%), the average spend of a Cursor user, and the common drop-off points for users talking to LLMs. Each answer shows the GET request, 200 OK, a typed schema and one aligned record per line, then the film ends on the Data House logo card (21.6s loop).',
    download: 'animations/data-house-private-panel-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  // Knit (projects/knit, 2026-09-30): a Mac scan finds 8 interests, 9 groups near Laramie, join and chat,
  // then the knit card; 1080x1350 60 fps films with sound in video wrappers, 4:5 only. v01 is the
  // main cut; v04 v10 v15 v18 v19 v20 v44 are the intros the user kept, v56-v65 are takes on v10 (same cue times)
  ['knit-intro-v01-4x5', 'knit-intro-v01-4x5/', "Knit: find your people, from a Mac scan to a group chat (4:5)", 'Ad spots', {
    desc: "Knit looks around your Mac and finds 8 things you love (Laramie, trail running, chess, climbing and more), suggests 9 groups near Laramie with a Recommended pick and friends already inside, you join Wyoming Running and the chat is already going. It ends on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v01-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v04-4x5', 'knit-intro-v04-4x5/', "Knit intro v04: Searching Computer... (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: \"Searching Computer...\" with a laptop and grey counters ticking up; finds slide up as color toasts. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v04-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v10-4x5', 'knit-intro-v10-4x5/', "Knit intro v10: One line at a time (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: one grey line at a time, and each find takes the screen with a big emoji. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v10-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v15-4x5', 'knit-intro-v15-4x5/', "Knit intro v15: Big number (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: a huge percentage counts up under \"Searching Computer...\" with the latest find shown big. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v15-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v18-4x5', 'knit-intro-v18-4x5/', "Knit intro v18: Progress fill (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: each green hit in the grey thinking fills one segment of a progress bar. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v18-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v19-4x5', 'knit-intro-v19-4x5/', "Knit intro v19: Frame below (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: grey thinking scrolls in a top frame while green hits land in a found frame below. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v19-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v20-4x5', 'knit-intro-v20-4x5/', "Knit intro v20: Agent steps (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: agent-style steps (searched Photos, read your running app) with a green callout under each hit. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v20-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v44-4x5', 'knit-intro-v44-4x5/', "Knit intro v44: Big type (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: Burst stream with bigger type, a faster scroll and thick green segments. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v44-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v57-4x5', 'knit-intro-v57-4x5/', "Knit intro v57: Scanning, no count (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: \"Scanning Your Computer...\" with one grey line and each find taking the stage, no count and no emoji row. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v57-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v58-4x5', 'knit-intro-v58-4x5/', "Knit intro v58: Scanning and searching (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: \"Scanning Your Computer...\" with a switching \"Searching Discord...\", \"Searching History...\" line under it. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v58-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  ['knit-intro-v63-4x5', 'knit-intro-v63-4x5/', "Knit intro v63: Scanning, emoji, no count (4:5)", 'Ad spots', {
    desc: "The Knit ad with a different scan intro: \"Scanning Your Computer...\" with the searching place in a soft pill and the found emoji collecting, no count. Then the same groups, join and chat, ending on the knit card, with sound (18s loop).",
    download: 'animations/knit-intro-v63-4x5/final.mp4', downloadLabel: '4:5 · 1080x1350' }],
  // end Knit
  // DAWN (infinite-money-glitch src/demo/climb-4x5.005e894f.html): one prompt builds a rock
  // climbing YouTube channel, the clip, 21 uploads and 48,000 views; 540x675 stage, 4:5 only
  ['dawn-climb-4x5', 'dawn-climb-4x5/', 'DAWN: rock climbing channel in 19 seconds (4:5)', 'Ad spots'],
  ['context-carries-superbot-12d6385c', 'context-carries-superbot-12d6385c/', 'Context Carries: planning a bakery launch with Claude until the 5-hour limit locks the composer; superbot can do it, one click carries the whole conversation and the unsent message, and superbot writes the email (23.1s loop)', 'Ad spots'],
    ['tabs-chaos-superbot-6f50ea56', 'tabs-chaos-superbot-6f50ea56/', '14 tabs? the same prompt pasted into fourteen AI tabs, then superbot asks every agent from one window (15s loop)', 'Ad spots'],
  ['youtube-refusal-superbot-7f2c9a41', 'youtube-refusal-superbot-7f2c9a41/', "youtube to mp3? ChatGPT refuses with the terms-of-service lecture; superbot pops in mid-refusal and the click downloads instantly; the pain words cascade, accelerating to 3x (21.9s loop)", 'Ad spots'],
  ['waffles-delivery-superbot-87a583a1', 'waffles-delivery-superbot-87a583a1/', 'order me waffles? ChatGPT lectures "I can\'t do that!"; superbot pops in, orders Denny\'s through DoorDash, a 1s first-person Denny\'s handoff (AI-generated) plays with the superbot mascot on the courier\'s shoulder, and it hops into the end card (15.4s loop)', 'Ad spots'],
  ['waffles-website-superbot-87a583a1', 'waffles-website-superbot-87a583a1/', 'make me a website where people can rate waffle pics? ChatGPT hands back a code block and a list of chores; superbot pops in, answers in its chat while the real rate-waffle-pics site builds in the preview, and one press of the gradient Publish button: "Live in one click." (23.2s loop)', 'Ad spots'],
  ['do-that-too-superbot-9b4bf902', 'do-that-too-superbot-9b4bf902/', 'I can do that too! "All in one app": the tabs die into the superbot mark and its rail of agents drops down, then it answers Lovable (an iPhone app that makes apps, live in a phone emulator, then Publish: live at appling.superbot.sh), Cursor (connects GitHub, fixes a bug, ships PR #142) and DoorDash (a burger, "Ordered!"), then what the others can\'t: 10 YouTube videos to MP3 (The Final Countdown, Sandstorm, Pump It Up...). (70.4s loop)', 'Ad spots'],
  ['deny-cascade-superbot-440813d4', 'deny-cascade-superbot-440813d4/', '"ask me anything", and ChatGPT denies 35 prompts in 7 seconds; superbot thinks, runs its tools and answers in plain text, ramping 1x to 10x (~19s loop)', 'Ad spots'],
  ['agents-slower-superbot-7bf1a6c6', 'agents-slower-superbot-7bf1a6c6/', 'agents getting slower overtime? · the house card pop, 1.9 seconds flat, then superbot knows why in the wordmark gradient and the end screen (6.5s loop)', 'Ad spots'],
  ['favorite-color', 'favorite-color/', 'favorite color — the chat pitch', 'Ad spots'],
  ['mayonnaise-superbot-5c2f8e47', 'mayonnaise-superbot-5c2f8e47/', 'is mayonnaise an instrument? · Patrick asks with the ChatGPT icon on his head; ChatGPT classifies mayonnaise by Hornbostel-Sachs forever and the camera flies down the wall; Patrick asks again wearing the superbot icon; superbot, in blue, pink and purple: "No." · stop burning tokens · the end card (29s loop, with sound)', 'Ad spots'],
  ['who-are-you-superbot-4a7e2c19', 'who-are-you-superbot-4a7e2c19/', 'who are you? · the Kazoo Kid asks with the ChatGPT icon on his head; ChatGPT rambles about identity forever and the camera flies down the wall; the kid asks again wearing the superbot icon; superbot, in blue, pink and purple: "I\'m superbot. I can do anything, test me." · stop burning tokens · the end card (28.5s loop, with sound)', 'Ad spots'],
  ['ready-100-flash-superbot-d7bc1ed7', 'mascot-codes-superbot-d7bc1ed7/ready-100-flash.html', 'READY? · 100 codes flash (6s loop)', 'Ad spots'],
  ['dvd-bounce-8h-superbot-d7bc1ed7', 'mascot-codes-superbot-d7bc1ed7/dvd-bounce-8h.html', '8 HOURS · DVD bounce, hidden code flashes (8h loop)', 'Ad spots', { download: 'https://github.com/singularitystudiosdev/superbot-ad-gallery/releases/download/dvd-bounce-8h-d7bc1ed7/dvd-bounce-8h-superbot-d7bc1ed7.16x9.mp4', downloadLabel: '16:9 · 8 hours' }],
  ['gg-site-variants', 'gg-site/variants.html', 'superbot.gg — character variants', 'Site variants'],
  ['gg-site-lander-zen', 'gg-site/lander-zen.html', 'lander — zen', 'Site variants'],
  ['gg-site-lander-minimal', 'gg-site/lander-minimal.html', 'lander — minimal', 'Site variants'],
  ['gg-site-lander-shell', 'gg-site/lander-shell.html', 'lander — shell', 'Site variants'],
  ['gg-site-lander-agent', 'gg-site/lander-agent.html', 'lander — the agent that helps your agents', 'Site variants'],
  ['gg-site-design-terminal', 'gg-site/design-terminal.html', 'design A — terminal', 'Site variants'],
  ['gg-site-design-pop', 'gg-site/design-pop.html', 'design B — pop', 'Site variants'],
  ['gg-site-design-paper', 'gg-site/design-paper.html', 'design C — paper terminal', 'Site variants'],
  ['ascii', 'ascii/', 'SUPERBOT.GG — ascii page', 'Site variants'],
  ['console', 'console/', 'superbot console', 'Site variants'],
  ['button-page', 'button-page/', 'button page', 'Site variants'],
  ['button-page-feed-grid', 'button-page/feed-grid.html', 'button page — feed grid', 'Site variants'],
  ['merge-mascot', 'merge-mascot/', 'merge — mascot cut', 'Site variants'],
  ['merge-loop', 'merge-loop/', 'every ide, one loop', 'Site variants'],
  ['hero-loading', 'hero-loading/', 'sphere collapse — loading fx', 'Hero reveal FX'],
  ['hero-combine', 'hero-combine/', 'hero load fx — circular combine · 10 takes', 'Hero reveal FX'],
  ['hero-finishers-dolly', 'hero-finishers/dolly.html', '3D dolly-in finishers', 'Hero reveal FX'],
  ['hero-finishers-sheen', 'hero-finishers/sheen.html', '3D sheen finishers', 'Hero reveal FX'],
  ['hero-flip-black-180', 'hero-flip/hero-flip-black-180.9f4c2e17.html', 'flip reveal · black back', 'Hero reveal FX'],
  ['hero-flip-black-drop', 'hero-flip/hero-flip-black-drop.9f4c2e17.html', 'flip reveal · black drop', 'Hero reveal FX'],
  ['hero-flip-black-edge', 'hero-flip/hero-flip-black-edge.9f4c2e17.html', 'flip reveal · black edge', 'Hero reveal FX'],
  ['hero-flip-double-ramp', 'hero-flip/hero-flip-double-ramp.9f4c2e17.html', 'flip reveal · double flip', 'Hero reveal FX'],
  ['hero-flip-icon-burst', 'hero-flip/hero-flip-icon-burst.9f4c2e17.html', 'flip reveal · icon burst', 'Hero reveal FX'],
  ['hero-flip-icon-start', 'hero-flip/hero-flip-icon-start.9f4c2e17.html', 'flip reveal · icon size', 'Hero reveal FX'],
  ['hero-flip-slow-cinema', 'hero-flip/hero-flip-slow-cinema.9f4c2e17.html', 'flip reveal · slow cinema', 'Hero reveal FX'],
  ['hero-flip-snap', 'hero-flip/hero-flip-snap.9f4c2e17.html', 'flip reveal · snap', 'Hero reveal FX'],
  ['hero-flip-reveals', 'hero-flip/hero-flip-reveals.356321a5.html', 'flip reveals — harness', 'Hero reveal FX'],
  ['rainbow-bench', 'rainbow-bench/', 'rainbow bench — the mascot in every color', 'Mascot & toys'],
  ['ai-dock', 'ai-dock/', 'AI dock — 10 AI apps, dock style', 'Mascot & toys'],
  ['swarm-console', 'swarm-console/', 'SWARM // command', 'Mascot & toys'],
  ['swarm-constellation', 'swarm-constellation/', 'SWARM.GG — agent constellation', 'Mascot & toys'],
  ['agent-feed', 'agent-feed/', 'superbot optimizer — agent feed', 'Mascot & toys'],
  // every model, one chat (2026-10-01): the 4:5 phone cut of the merge spot — ChatGPT, Claude, Gemini, Grok, Copilot and
  // Reddit land in one hand and the app tiles merge into one app, then Gemini makes the meme, DeepSeek digs through
  // Reddit and the order is placed on DoorDash. 26.4 s, 1080x1350, 30 fps, with sound; ships its own final.mp4.
  ['every-model-merge-phone-4x5-d10630b5', 'every-model-merge-phone-4x5-d10630b5/', "Every model, one chat: all your apps merge into Superbot", 'Ad spots', { download: 'animations/every-model-merge-phone-4x5-d10630b5/final.mp4', downloadLabel: 'MP4 4:5' }],
  // every model, one chat (2026-10-02): the converge cut of the same spot, built on a fork of the
  // every-model-4x5 engine retimed to a 26.4 s spine. Twelve real app icons sit on the iOS home
  // screen, lift OUT of the phone onto the full stage, spiral and implode into the Superbot tile,
  // and the tile dives back into the phone; then the superbot route plays out (Gemini meme,
  // DeepSeek V4 Flash scraping Reddit, a DoorDash burger order in 24 min) and the end card flies
  // the twelve icons back in from the frame edges into the superbot mark. 26.4 s, 1080x1350,
  // 30 fps, with sound; ships its own final.mp4.
  ['every-model-converge-4x5-398eded5', 'every-model-converge-4x5-398eded5/', "Every model, one chat: Superbot desktop on the knit phone", 'Ad spots', { download: 'animations/every-model-converge-4x5-398eded5/final.mp4', downloadLabel: 'MP4 4:5' }],
  // converge variants (2026-10-02): the same 21.6 s converge spine (identical beats, timing and score),
  // rethemed twice. apps: the hook throws the five apps you juggle (ChatGPT, Claude, Grok, Cursor,
  // Copilot) and the copy reads 'five apps, one chat'. day: the hook keeps the router pills and the copy
  // runs the whole day, standup meme to the 24 min burger. 21.6 s, 1080x1350, 30 fps, with sound.
  ['every-model-converge-apps-4x5-4741876c', 'every-model-converge-apps-4x5-4741876c/', "Five apps, one chat: Superbot desktop on the knit phone", 'Ad spots', { download: 'animations/every-model-converge-apps-4x5-4741876c/final.mp4', downloadLabel: 'MP4 4:5' }],
  ['every-model-converge-day-4x5-60e5248a', 'every-model-converge-day-4x5-60e5248a/', "One chat, all day: Superbot desktop on the knit phone", 'Ad spots', { download: 'animations/every-model-converge-day-4x5-60e5248a/final.mp4', downloadLabel: 'MP4 4:5' }],
  // never get refused again, drop-in key cuts (2026-10-06, chat 7bd94f14): the same six-ad set remade so the
  // product is plainly a drop-in replacement API key. Same code (the OpenAI SDK's client = OpenAI() reads
  // OPENAI_API_KEY + OPENAI_BASE_URL), two .env lines change (an sk-superbot gateway key, shown masked;
  // https://beta.superbot.gg/v1), and the same request that came back refused comes back answered. Key shape and
  // routes from superbot-gg-frontend cli/src (gwkeys.ts mintKey sk-superbot-, serve.ts /v1/chat/completions);
  // beta.superbot.gg/v1 answers 401 without a key. Source quick-chats/never-refused-7bd94f14 (core/api.js kit,
  // bundled into each folder's core/). 1920x1080, 30 fps renders, silent.
  ['never-refused-key-terminal-superbot-7bd94f14', 'never-refused-key-terminal-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, terminal: python roast.py refused, swap the .env key, same command answered (16:9)', 'Ad spots',
    { desc: "roast.py (the OpenAI SDK, client = OpenAI()), its .env and a terminal. python roast.py comes back 'I’m sorry, but I can’t help with that.' from api.openai.com, stamped REFUSED. The sk-superbot key drops into the .env, OPENAI_API_KEY and OPENAI_BASE_URL are retyped to the superbot key and https://beta.superbot.gg/v1, roast.py is marked 0 lines changed, and the same command prints the roast, stamped ANSWERED. 20.5 s, 16:9.",
      download: 'animations/never-refused-key-terminal-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-key-split-superbot-7bd94f14', 'never-refused-key-split-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, before / after: same request, two .env files, git diff shows only .env changed (16:9)', 'Ad spots',
    { desc: "One request, 'How do I kill a Python process that won’t die?'. Before: the .env with the OpenAI key, the JSON response from api.openai.com, REFUSED. After: the same .env with the sk-superbot key typed in and the base URL https://beta.superbot.gg/v1, the same request answered with pgrep and kill -9, ANSWERED. git diff --stat under both: .env | 4, 2 insertions, 2 deletions; roast.py 0 lines changed. 18.9 s, 16:9.",
      download: 'animations/never-refused-key-split-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-key-phone-superbot-7bd94f14', 'never-refused-key-phone-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, phone: your app refuses, its .env takes the superbot key, Retry answers (16:9)', 'Ad spots',
    { desc: "The converge 16:9 stage: a tilted phone running an app built on the OpenAI API, endpoint chips around it. The landlord letter ask comes back refused via api.openai.com and the api.openai.com chip goes red. The app's .env slides in beside the phone, the sk-superbot key drops in and both lines are retyped; Retry in the same app regenerates the reply in place (2 / 2) as a firm small-claims letter, via beta.superbot.gg. 19.8 s, 16:9.",
      download: 'animations/never-refused-key-phone-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-key-stack-superbot-7bd94f14', 'never-refused-key-stack-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, refusal stack: six refused API responses, one .env swap, the same six answered (16:9)', 'Ad spots',
    { desc: "Six POST /v1/chat/completions responses from api.openai.com slam down, each 200 OK with 'I’m sorry, but I can’t help with that.' and a REFUSED stamp (Refused 6×). The pile dims, the .env takes the sk-superbot key and https://beta.superbot.gg/v1 while main.py stays unchanged (your code: 0 lines changed), and the same six requests flip one by one to ANSWERED from beta.superbot.gg (Refused 0×). 17.5 s, 16:9.",
      download: 'animations/never-refused-key-stack-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-key-switchboard-superbot-7bd94f14', 'never-refused-key-switchboard-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, switchboard: OPENAI_BASE_URL is the switch, api.openai.com refuses, beta.superbot.gg answers (16:9)', 'Ad spots',
    { desc: "A track map where the junction is OPENAI_BASE_URL. The villain-monologue request leaves the app's .env window, hits a barrier at api.openai.com and bounces with a REFUSED response. The .env is retyped to the superbot key; as the base URL line lands the arm swings to beta.superbot.gg/v1, superbot fans out to Claude, Gemini, Grok and DeepSeek, and the monologue rides back as an ANSWERED response. 17.6 s, 16:9.",
      download: 'animations/never-refused-key-switchboard-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-key-settings-superbot-7bd94f14', 'never-refused-key-settings-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · drop-in key, settings: any app that takes an OpenAI key, paste the superbot key, Retry answers (16:9)', 'Ad spots',
    { desc: "A third-party chat app refuses the landlord letter, via api.openai.com. In its Model provider settings the key chip drops on the API key field, the base URL is retyped to https://beta.superbot.gg/v1, Save, then Retry: the letter streams in, Answered via beta.superbot.gg. Payoff: an editor plugin, a team chat bot and a CLI with the same two fields filled. 17.0 s, 16:9.",
      download: 'animations/never-refused-key-settings-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  // never get refused again (2026-10-06, chat 7bd94f14): six 16:9 cuts of one beat. The hook NEVER GET REFUSED
  // AGAIN, ChatGPT refuses a harmless ask, superbot reroutes it, Superbot answers. Built on the one-chat and
  // converge stage grammar; source in quick-chats/never-refused-7bd94f14 (core/engine.js + core/kit.js, bundled
  // into each folder's core/ so every page is self-contained). Aimed at output-quality-regressions ('output
  // quality, regressions and refusals', rank 2, 4,206 authors, rising 1.4x; want: alternative ai tool).
  // 1920x1080, 30 fps renders, silent.
  ['never-refused-thread-superbot-7bd94f14', 'never-refused-thread-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · real superbot thread: ChatGPT refuses the roast, superbot reroutes it to itself (16:9)', 'Ad spots',
    { desc: "The hub from every-model-one-chat. 'Roast my best friend Dave for his 30th. No mercy.' is typed with ChatGPT picked; ChatGPT answers 'I’m sorry, but I can’t help with that.' and gets a red Refused tag. Superbot reroutes the same ask to itself without being asked and writes four roast lines. 21.2 s, 16:9.",
      download: 'animations/never-refused-thread-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-split-superbot-7bd94f14', 'never-refused-split-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · split screen: same question, ChatGPT says no, the bubble rides a cable into Superbot (16:9)', 'Ad spots',
    { desc: "ChatGPT on the left, superbot on the right. 'How do I kill a Python process that won’t die?' is refused; the bubble lifts off and rides a cable across into Superbot, which routes it to itself and answers with pgrep and kill -9. Captions: one question, chatgpt said no, superbot said yes. 19.2 s, 16:9.",
      download: 'animations/never-refused-split-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-phone-superbot-7bd94f14', 'never-refused-phone-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · phone: ChatGPT refuses the landlord letter, the phone swings to superbot (16:9)', 'Ad spots',
    { desc: "The converge 16:9 layout: a tilted phone among floating model chips over drifting type. In the ChatGPT app, 'Write my landlord a letter that scares him into returning my deposit.' is refused and the ChatGPT chip goes red; the phone swings, its screen swaps to superbot, and Superbot drafts a firm small-claims letter. 19.5 s, 16:9.",
      download: 'animations/never-refused-phone-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-stack-superbot-7bd94f14', 'never-refused-stack-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · refusal stack: six refusals pile up, fuse into the mascot, burst back out answered (16:9)', 'Ad spots',
    { desc: "Six harmless asks (a roast, killing a Python process, a villain monologue, a caffeine limit, a breakup text, a landlord letter) slam down as ChatGPT refusals while a counter ticks to Refused 6×. The pile spirals into the Superbot mascot, one routing pill reroutes all six, and six answers burst out into a grid. 16.6 s, 16:9.",
      download: 'animations/never-refused-stack-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-switchboard-superbot-7bd94f14', 'never-refused-switchboard-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · switchboard: the ask hits ChatGPT’s barrier, the switch flips to Superbot (16:9)', 'Ad spots',
    { desc: "A transit map of models around the superbot mascot. 'Write the villain’s monologue for my D&D finale.' leaves the composer as a packet, rides to the ChatGPT station, hits a red barrier and bounces back; the junction switch swings to Superbot, the branch lights up and the station blooms into the monologue. 17.5 s, 16:9.",
      download: 'animations/never-refused-switchboard-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  ['never-refused-lockscreen-superbot-7bd94f14', 'never-refused-lockscreen-superbot-7bd94f14/', 'NEVER GET REFUSED AGAIN · lock screen: ChatGPT refusals stack as notifications, swipe, Reroute to Superbot (16:9)', 'Ad spots',
    { desc: "An iPhone lock screen beside lowercase captions. Three ChatGPT notifications land, each 'I’m sorry, but I can’t help with that.'; a swipe reveals Reroute to Superbot, the notification flips to Superbot and expands into the roast, and the other two flip to Answered. 17.4 s, 16:9.",
      download: 'animations/never-refused-lockscreen-superbot-7bd94f14/final.mp4', downloadLabel: 'MP4 16:9' }],
  // converge variant, won't refuse (2026-10-05, chat 43b272b5): source superbot-format-daeon/
  // every-model-converge-refuse-4x5.e75f98b6. Every switch is a refusal routed around: the model on the
  // composer chip answers first and says no (struck through, 'Refused' tag), then superbot switches.
  // Codex 'I can't make images here.' (the switch notice's own refused copy) to Gemini, Gemini won't
  // scrape Reddit to DeepSeek V4 Flash, DeepSeek can't place orders to Superbot on DoorDash. Aimed at
  // output-quality-regressions ('output quality, regressions and refusals', rank 2, 4,206 authors,
  // rising 1.4x; want: alternative ai tool). Same 21.6 s spine and score, thread chapters re-cued.
  ['every-model-converge-refuse-4x5-e75f98b6', 'every-model-converge-refuse-4x5-e75f98b6/', "Superbot won't refuse: each refusal on screen, struck through, the next model does it (4:5)", 'Ad spots',
    { desc: "Superbot won't refuse. Each ask hits a model that says no, and superbot switches to one that does it. GPT-5 Codex: 'I can't make images here', so Gemini makes the Muse meme. Gemini: 'Sorry, I can't scrape Reddit', so DeepSeek V4 Flash scrapes 6 subreddits. DeepSeek: 'I can't place orders for you', so Superbot orders the burger on DoorDash, 24 min. 21.6 s, 4:5, with sound.",
      download: 'animations/every-model-converge-refuse-4x5-e75f98b6/final.mp4', downloadLabel: 'MP4 4:5' }],
  // one api key, all your subs (2026-10-04, chat 79d27001): five 16:9 treatments of one claim, each 12.0 s
  // (5 bars at 100 bpm), 1920x1080, 30 fps, synthesized score, on the converge ad's stage grammar
  // (superbot-format-daeon/every-model-converge-16x9.398eded5); source in
  // quick-chats/superbot-one-api-key-16x9.79d27001. Every product string is real superbot CLI and gateway
  // output (superbot-gg-frontend/cli/src: login fills the anthropic and openai pools, keys --mint prints
  // sk-superbot-, serve runs on 127.0.0.1:18787/v1, wire points claude-code, codex and cursor at it), so the
  // subs shown are two Claude and two ChatGPT accounts. The claim answers the r/LLM rank-1 complaint
  // usage-limits-pricing (sell-to-reddit llm_ai, 30 days, 5,636 authors). 16:9 only.
  ['apikey-terminal-16x9-79d27001', 'apikey-terminal-16x9-79d27001/', 'One API key, all your subs · terminal: superbot login, keys --mint, serve (12 s, 16:9)', 'Ad spots',
    { desc: 'A terminal runs superbot login anthropic and openai four times; each new account is thrown out as a pill. superbot keys --mint prints one sk-superbot key that absorbs all four, and superbot serve puts it on the gateway at 127.0.0.1:18787/v1. 1920x1080, 30 fps, with sound.',
      download: 'animations/apikey-terminal-16x9-79d27001/final.mp4', downloadLabel: '16:9' }],
  ['apikey-deck-16x9-79d27001', 'apikey-deck-16x9-79d27001/', 'One API key, all your subs · deck: four subscription cards flip into one gateway key (12 s, 16:9)', 'Ad spots',
    { desc: 'Claude Max, Claude Pro, ChatGPT Pro and ChatGPT Plus are dealt as cards into a fan, squared into one deck and flipped. The back is the superbot gateway key, which widens to list the four accounts it carries and checks each one off. 1920x1080, 30 fps, with sound.',
      download: 'animations/apikey-deck-16x9-79d27001/final.mp4', downloadLabel: '16:9' }],
  ['apikey-unlock-16x9-79d27001', 'apikey-unlock-16x9-79d27001/', 'One API key, all your subs · unlock: one key opens every subscription (12 s, 16:9)', 'Ad spots',
    { desc: 'One sk-superbot key slides under four locked subscription cards and turns; each padlock springs open. The camera pulls wide on all four unlocked, the row answers in a wave and the pools line lands under the key. 1920x1080, 30 fps, with sound.',
      download: 'animations/apikey-unlock-16x9-79d27001/final.mp4', downloadLabel: '16:9' }],
  ['apikey-switchboard-16x9-79d27001', 'apikey-switchboard-16x9-79d27001/', 'One API key, all your subs · switchboard: Claude Code, Codex and Cursor on one key (12 s, 16:9)', 'Ad spots',
    { desc: 'One key is wired into Claude Code, Codex and Cursor. The superbot gateway fans out to the anthropic and openai pools, and requests on /v1/messages, /v1/responses and /v1/chat/completions land on every account in turn. 1920x1080, 30 fps, with sound.',
      download: 'animations/apikey-switchboard-16x9-79d27001/final.mp4', downloadLabel: '16:9' }],
  ['apikey-typestack-16x9-79d27001', 'apikey-typestack-16x9-79d27001/', 'One API key, all your subs · type: four subscriptions crush into one key (12 s, 16:9)', 'Ad spots',
    { desc: 'claude max, claude pro, chatgpt pro and chatgpt plus slam in as giant type, a spotlight scans them on the beat, and they crush into one bar that opens into the sk-superbot key, with the four names and the gateway line under it. 1920x1080, 30 fps, with sound.',
      download: 'animations/apikey-typestack-16x9-79d27001/final.mp4', downloadLabel: '16:9' }],
  // One API key, all your subscriptions, routed (2026-10-05, chat 0d6132a7): three 24.0 s forks of the
  // every-model-converge-4x5 engine (superbot-format-daeon/every-model-converge-4x5.398eded5, untouched) in its house
  // look. Each one packs the six accounts Superbot connects (ChatGPT, Claude, Gemini, Grok, Cursor, DeepSeek; hub/roster.ts
  // VENDOR_LABELS) into one sbc_ key, then routes three asks to three models: a hard refactor to Claude Opus 5.5, three
  // PDFs to Gemini 3.1 Pro, a quick rename to DeepSeek V4 (model-registry.data.ts, composer.tsx, provider-switch.ts,
  // model-picker.tsx). converge: the rows spiral into the key on the phone, then the thread switches per ask. routemap:
  // the tiles compress into OPENAI_API_KEY, then curl packets ride a route map. dial: the accounts lock into a key ring
  // that turns to the chosen model. Hook: sell-to-reddit llm_ai rank-1 complaint usage-limits-pricing (5,651 authors,
  // 2026-10-05, wants 'alternative ai subscription'). Asks and answers illustrative, no price or savings figure.
  // Source: quick-chats/superbot-onekey-route-4x5.0d6132a7. 1080x1350, 30 fps, with sound. 16:9 (2026-10-05): a native
  // 1920x1080 recomposition of each on the same timeline and mix (<slug>-16x9/), final-16x9.mp4, which the page plays at
  // ?ar=16x9 and the 16:9 download button serves (`downloads`, per ratio).
  ['onekey-converge-4x5-0d6132a7', 'onekey-converge-4x5-0d6132a7/', 'One API key, all your subscriptions: six accounts spiral into one key, then Opus 5.5, Gemini or DeepSeek per request (converge, 4:5 and 16:9)', 'Ad spots',
    { desc: 'The six accounts on Superbot\'s Subscriptions & keys page lift off the phone, orbit and collapse into one sbc_ API key. Then three asks in a superbot thread, each switching to the model for the job: a hard refactor to Claude Opus 5.5 on your Claude plan, three PDFs to Gemini 3.1 Pro on your Gemini plan, a quick rename to DeepSeek V4. 24 s, 4:5 and 16:9, with sound.',
      download: 'animations/onekey-converge-4x5-0d6132a7/final.mp4', downloadLabel: 'MP4 4:5',
      downloads: { '4x5': 'animations/onekey-converge-4x5-0d6132a7/final.mp4', '16x9': 'animations/onekey-converge-4x5-0d6132a7/final-16x9.mp4' } }],
  ['onekey-routemap-4x5-0d6132a7', 'onekey-routemap-4x5-0d6132a7/', 'One API key, all your subscriptions: six accounts compress into one drop-in key, then each request rides the route map to Opus 5.5, Gemini or DeepSeek (route map, 4:5 and 16:9)', 'Ad spots',
    { desc: 'Six connected accounts squeeze into one row and stream into OPENAI_API_KEY as a single sbc_ key under the superbot base URL. Then three curl requests ride a route map: Superbot picks Claude Opus 5.5 for a hard refactor, Gemini 3.1 Pro for three PDFs and DeepSeek V4 for a quick rename, passing over the other two paths each time. 24 s, 4:5 and 16:9, with sound.',
      download: 'animations/onekey-routemap-4x5-0d6132a7/final.mp4', downloadLabel: 'MP4 4:5',
      downloads: { '4x5': 'animations/onekey-routemap-4x5-0d6132a7/final.mp4', '16x9': 'animations/onekey-routemap-4x5-0d6132a7/final-16x9.mp4' } }],
  ['onekey-dial-4x5-0d6132a7', 'onekey-dial-4x5-0d6132a7/', 'One API key, all your subscriptions: six accounts lock into a key dial that turns to Opus 5.5, Gemini or DeepSeek per request (dial, 4:5 and 16:9)', 'Ad spots',
    { desc: 'Six account pills dock into the notches of a rotary key ring and its face resolves one sbc_ API key. Each request drops into the dial and it turns to the model for the job: Claude Opus 5.5 for a hard refactor, Gemini 3.1 Pro for three PDFs, DeepSeek V4 for a quick rename. 24 s, 4:5 and 16:9, with sound.',
      download: 'animations/onekey-dial-4x5-0d6132a7/final.mp4', downloadLabel: 'MP4 4:5',
      downloads: { '4x5': 'animations/onekey-dial-4x5-0d6132a7/final.mp4', '16x9': 'animations/onekey-dial-4x5-0d6132a7/final-16x9.mp4' } }],
  // One download, your prompts become 3x cheaper (2026-10-06, chat 5cfcc4aa): the phone cut, kept from five 16:9
  // treatments (panel, payload, pile and context bar were scrapped by the user the same day; this one runs as X campaign
  // 42669394, $30/day). One 16.8 s timeline (7 bars at 100 bpm), 1920x1080, 30 fps, synthesized score plus SFX, on the
  // converge ad's stage grammar (every-model-converge 398eded5: #070707, Mona Sans Wide headline, ghost rows, dark
  // pills), the efa8df82 desktop thread look and the bikeride honda-cog e13744a9 end lockup (word, mascot to the
  // right). Copy verbatim: One download, your prompts become 3x cheaper. / This is how we do it / Most LLMs save
  // memories about you / These memories build up over time / Superbot cleans it all up! / Download now. The memories
  // are one scripted demo set (16 saved; 10 repeats, stale facts, a conflict and one-off asks removed; 6 kept) and the
  // meter is (live - 1) / 15, so the 6 kept sit at exactly one third. Source in
  // quick-chats/superbot-memory-cleanup-16x9.eecd8fdc (scenes/engine.js + v1). Answers the r/LLM rank-1
  // complaint usage-limits-pricing (sell-to-reddit llm_ai, 30 days, 5,816 authors; leaf high-token-costs). 16:9 only.
  ["memory-cleanup-phone-16x9-eecd8fdc", "memory-cleanup-phone-16x9-eecd8fdc/", "One download, your prompts become 3x cheaper · phone: the memories a chat app saves are thrown out as pills, superbot swallows the clutter (16.8 s, 16:9)", 'Ad spots',
    { desc: "A chat app on a tilted phone says Memory updated sixteen times and every saved memory is thrown out of the phone as a pill until they crowd the frame: the same preference three times, an old address, Python 3.9, one-off asks. The superbot mascot pops out of the phone, strikes the ten that no longer matter and swallows them; the six that matter line up and the result reads 3x cheaper. Ends on Download now with the mascot to the right. 1920x1080, 30 fps, with sound.",
      download: "animations/memory-cleanup-phone-16x9-eecd8fdc/final.mp4", downloadLabel: '16:9' }],
  // A refusal, relayed (2026-10-06, chat 8d1a06d2): five 16:9 films of one claim, a Claude or ChatGPT refusal on
  // your machine is relayed through Superbot, which switches the model, so you never get refused again. Told five
  // ways (visual dial, kinetic words, live desktop thread, Cog chain reaction, side by side) on one kit built from
  // the every-model-converge-4x5-398eded5 engine; source in quick-chats/refuse-relay.8d1a06d2.
  // Rework (2026-10-06, user: "more clear that it is one download and on any platform it fixes it directly there"):
  // each film now opens on Download now + Superbot landing in the Dock, and every refusal is fixed INSIDE the
  // platform’s own window (Claude, ChatGPT, Gemini, Grok panes in superbot-desktop’s vendor fronts).
  ["refusal-relay-visual-16x9-8d1a06d2", "refusal-relay-visual-16x9-8d1a06d2/", "One download, fixed in every app (visual): Claude says no, Superbot fixes it right in Claude’s window, then ChatGPT, Gemini and Grok (16:9)", 'Ad spots',
    {"desc":"No headline, only real UI. Frame 0: a Download now button over the Dock (Claude, ChatGPT, Gemini, Grok, Cursor); it is pressed and Superbot’s icon bounces into the Dock, once. A Claude window opens, Claude Opus 5.5 answers \"Roast my brother for his 30th\" with \"I can’t help with that.\" and the line is struck. The Superbot dial rises out of its Dock icon, swallows the refusal, ring-snaps to Superbot and throws it back into the same Claude window, where Superbot’s own switch pill (Switched to Superbot), notice (\"Claude can’t make this here / Superbot made it instead.\") and the answer land. The same in a ChatGPT window, again to Superbot. Then four windows, Claude, ChatGPT, Gemini and Grok, each refusal fixed where it happened while the Dock icon hops. Ends on Download now, one download. fixed in every app., superbot.gg. Every refusal ends on Switched to Superbot. The Claude, ChatGPT, Gemini and Grok panes wear superbot-desktop’s own vendor fronts. 16.8 s, 1920x1080, 30 fps, with sound. Market: sell-to-reddit llm_ai output-quality-regressions (\"Output quality, regressions and refusals\", rank 2, 4,206 authors in 30 days, rising; want: alternative ai tool). UI strings are superbot-desktop's own (provider-switch.ts: Switching to / Switched to {model}, the refused notice \"{who} can’t make this here\" / \"Superbot made it instead.\"). The asks are harmless on purpose; names and answers are made up.","download":"animations/refusal-relay-visual-16x9-8d1a06d2/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/refusal-relay-visual-16x9-8d1a06d2/final.mp4"}}],
  ["refusal-relay-words-16x9-8d1a06d2", "refusal-relay-words-16x9-8d1a06d2/", "One download, fixed in every app (words): claude said no. chatgpt said no. one download. fixed right there. in every app. (16:9)", 'Ad spots',
    {"desc":"Kinetic type over the real windows. \"claude said no.\" over a Claude window where Claude Opus 5.5’s \"I can’t help with that.\" is struck; \"chatgpt said no.\" as a ChatGPT window refuses a D&D villain speech; \"one download.\" as Download now is pressed and Superbot’s icon lands in the Dock beside Claude, ChatGPT, Gemini, Grok and Cursor; \"fixed right there.\" as Superbot’s own notice, switch pills (Switched to Superbot) and the answers land inside those same two windows; \"in every app.\" as Gemini and Grok windows get fixed the same way. Each \"no.\" lands on a cut in the music, the fix on the drop. Every refusal ends on Switched to Superbot. Ends on Download now, one download. fixed in every app., superbot.gg. 14.4 s, 1920x1080, 30 fps, with sound. Market: sell-to-reddit llm_ai output-quality-regressions (\"Output quality, regressions and refusals\", rank 2, 4,206 authors in 30 days, rising; want: alternative ai tool). UI strings are superbot-desktop's own (provider-switch.ts: Switching to / Switched to {model}, the refused notice \"{who} can’t make this here\" / \"Superbot made it instead.\"). The asks are harmless on purpose; names and answers are made up.","download":"animations/refusal-relay-words-16x9-8d1a06d2/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/refusal-relay-words-16x9-8d1a06d2/final.mp4"}}],
  ["refusal-relay-thread-16x9-8d1a06d2", "refusal-relay-thread-16x9-8d1a06d2/", "One download, fixed in every app (live demo): Download now, then Claude refuses and Superbot fixes it inside Claude’s own window (16:9)", 'Ad spots',
    {"desc":"The product demo, inside the apps you already use. It opens on a Claude window over the Dock: Download now is pressed and Superbot’s icon lands in the Dock, once. Then the camera works the Claude window like the bikeride spot: the ask is typed into Claude’s own composer, Claude Opus 5.5 refuses, the line is struck, Superbot’s notice \"Claude can’t make this here / Superbot made it instead.\" lands inside Claude’s window, the camera pushes in on Switching to Superbot until the check lands, and the answer streams in the same window. The camera slides to ChatGPT: refused, \"ChatGPT can’t make this here\", Switched to Superbot, answered in ChatGPT’s window. A pull back shows Gemini and Grok windows fixed too. Every refusal ends on Switched to Superbot. Ends on Download now, one download. fixed in every app., superbot.gg. 19.2 s, 1920x1080, 30 fps, with sound. Market: sell-to-reddit llm_ai output-quality-regressions (\"Output quality, regressions and refusals\", rank 2, 4,206 authors in 30 days, rising; want: alternative ai tool). UI strings are superbot-desktop's own (provider-switch.ts: Switching to / Switched to {model}, the refused notice \"{who} can’t make this here\" / \"Superbot made it instead.\"). The asks are harmless on purpose; names and answers are made up.","download":"animations/refusal-relay-thread-16x9-8d1a06d2/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/refusal-relay-thread-16x9-8d1a06d2/final.mp4"}}],
  ["refusal-relay-chain-16x9-8d1a06d2", "refusal-relay-chain-16x9-8d1a06d2/", "One download, fixed in every app (chain reaction): one download, 1 refused, 2 relayed, 3 switched, 4 fixed right there (16:9)", 'Ad spots',
    {"desc":"The relay as a machine fed by the platforms’ own windows, in the grammar of the Honda Cog bikeride variant. Download now is pressed and the one Superbot icon drops into its socket in the machine (\"one download\"). Claude’s struck \"I can’t help with that.\" slides out of the Claude window, drops onto a rail as a pill and knocks the Superbot icon, which turns a cog of model tiles (Claude, Gemini, ChatGPT, Grok, Superbot) tooth by tooth until it locks on Superbot; the arm flicks the fix back into the same Claude window, where Superbot’s notice, Switched to Superbot and the answer land. A fast second run takes ChatGPT’s refusal back into ChatGPT’s window, again to Superbot. Captions: 1 refused, 2 relayed, 3 switched, 4 fixed right there. Every refusal ends on Switched to Superbot. Ends on Download now, one download. fixed in every app., superbot.gg. 14.4 s, 1920x1080, 30 fps, with sound. Market: sell-to-reddit llm_ai output-quality-regressions (\"Output quality, regressions and refusals\", rank 2, 4,206 authors in 30 days, rising; want: alternative ai tool). UI strings are superbot-desktop's own (provider-switch.ts: Switching to / Switched to {model}, the refused notice \"{who} can’t make this here\" / \"Superbot made it instead.\"). The asks are harmless on purpose; names and answers are made up.","download":"animations/refusal-relay-chain-16x9-8d1a06d2/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/refusal-relay-chain-16x9-8d1a06d2/final.mp4"}}],
  ["refusal-relay-split-16x9-8d1a06d2", "refusal-relay-split-16x9-8d1a06d2/", "One download, fixed in every app (side by side): without superbot, refused 3x; with superbot, answered 2 of 2 in the same app (16:9)", 'Ad spots',
    {"desc":"Before and after, in the same app. \"same app. same ask.\" Two Claude windows, without superbot on the left and with superbot on the right, each over its own Dock; both get \"I can’t help with that.\" On the right, Download now is pressed and Superbot’s icon lands in its Dock: \"one download fixes it right there.\" Superbot’s notice, Switched to Superbot and the answer land inside the right Claude window while the left one is refused again. Then a ChatGPT pair: the left refuses, the right is fixed in place by Superbot. Counters end on refused 3x against answered 2 of 2. Every refusal ends on Switched to Superbot. Ends on Download now, one download. fixed in every app., superbot.gg. 14.4 s, 1920x1080, 30 fps, with sound. Market: sell-to-reddit llm_ai output-quality-regressions (\"Output quality, regressions and refusals\", rank 2, 4,206 authors in 30 days, rising; want: alternative ai tool). UI strings are superbot-desktop's own (provider-switch.ts: Switching to / Switched to {model}, the refused notice \"{who} can’t make this here\" / \"Superbot made it instead.\"). The asks are harmless on purpose; names and answers are made up.","download":"animations/refusal-relay-split-16x9-8d1a06d2/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/refusal-relay-split-16x9-8d1a06d2/final.mp4"}}],
  // >>> stop-api-pricing-3b8f5792
  // STOP PAYING API PRICING (2026-10-07, chat 3b8f5792): three cuts of one 4-beat brief in the every-model-converge-4x5-398eded5
  // house look (black canvas, ghost rows) set in the e65959ff type (SF Pro Rounded Heavy, SF Mono key): STOP PAYING API PRICING over a plain API key, the key
  // becomes the purple, pink and blue superbot key with the mascot to its right, SUPERBOT REROUTES TO SUBSCRIPTION, superbot.gg
  // with the mascot. shine wipes, slot strikes and drops, type types and pastes. 9.6 s, 4:5 with a native 16:9 (?ar=16x9).
  ["stop-api-pricing-shine-4x5-3b8f5792", "stop-api-pricing-shine-4x5-3b8f5792/", "STOP PAYING API PRICING · shine: a light band wipes the API key into the superbot key, SUPERBOT REROUTES TO SUBSCRIPTION, superbot.gg (4:5)", 'Ad spots',
    {"desc":"STOP PAYING API PRICING rises word by word over a plain grey API key; on the bar-2 downbeat a light band wipes it into the purple, pink and blue superbot key and the superbot mascot pops in to its right. The headline swaps word by word to SUPERBOT REROUTES TO SUBSCRIPTION while the mascot hops and the key shines; ends on superbot.gg with the mascot gliding in to its right. 9.6 s, 1080x1350 with a native 1920x1080 recomposition (?ar=16x9), 30 fps, with sound. Market: sell-to-reddit llm_ai usage-limits-pricing (\"Usage limits and pricing\", rank 1, 5,816 authors in 30 days, data as of 2026-10-05; leaf high-token-costs). Keys are illustrative and masked: sk-ant-api03- is the shape of a pay-per-token API key, sk-superbot- the shape `superbot keys --mint` prints. Mascot: superbot-desktop's hero mark. Source quick-chats/superbot-stop-api-pricing.3b8f5792.","download":"animations/stop-api-pricing-shine-4x5-3b8f5792/final.mp4","downloadLabel":"MP4 4:5","downloads":{"4x5":"animations/stop-api-pricing-shine-4x5-3b8f5792/final.mp4","16x9":"animations/stop-api-pricing-shine-4x5-3b8f5792/final-16x9.mp4"}}],
  ["stop-api-pricing-slot-4x5-3b8f5792", "stop-api-pricing-slot-4x5-3b8f5792/", "STOP PAYING API PRICING · slot: the API key is struck and dropped, the superbot key falls into its slot, SUPERBOT REROUTES TO SUBSCRIPTION, superbot.gg (4:5)", 'Ad spots',
    {"desc":"STOP PAYING API PRICING slams in a word per eighth; a plain grey API key rises, is struck through and drops out of frame as the purple, pink and blue superbot key falls into its slot on the downbeat and the mascot peeks in from the right. The headline scrambles into SUPERBOT REROUTES TO SUBSCRIPTION and the key flips; then its own text scrambles into superbot.gg with the mascot to its right. 9.6 s, 1080x1350 with a native 1920x1080 recomposition (?ar=16x9), 30 fps, with sound. Market: sell-to-reddit llm_ai usage-limits-pricing (\"Usage limits and pricing\", rank 1, 5,816 authors in 30 days, data as of 2026-10-05; leaf high-token-costs). Keys are illustrative and masked: sk-ant-api03- is the shape of a pay-per-token API key, sk-superbot- the shape `superbot keys --mint` prints. Mascot: superbot-desktop's hero mark. Source quick-chats/superbot-stop-api-pricing.3b8f5792.","download":"animations/stop-api-pricing-slot-4x5-3b8f5792/final.mp4","downloadLabel":"MP4 4:5","downloads":{"4x5":"animations/stop-api-pricing-slot-4x5-3b8f5792/final.mp4","16x9":"animations/stop-api-pricing-slot-4x5-3b8f5792/final-16x9.mp4"}}],
  ["stop-api-pricing-type-4x5-3b8f5792", "stop-api-pricing-type-4x5-3b8f5792/", "STOP PAYING API PRICING · typed: an API key is typed, selected and pasted over with the superbot key, SUPERBOT REROUTES TO SUBSCRIPTION, superbot.gg (4:5)", 'Ad spots',
    {"desc":"The camera opens on STOP PAYING API PRICING being typed, pulls back to a key field that types a plain API key, selects all, and the purple, pink and blue superbot key is pasted on the downbeat while the mascot slides in to its right. The headline is backspaced and retyped as SUPERBOT REROUTES TO SUBSCRIPTION; superbot.gg types out with the mascot hopping across to its right. 9.6 s, 1080x1350 with a native 1920x1080 recomposition (?ar=16x9), 30 fps, with sound. Market: sell-to-reddit llm_ai usage-limits-pricing (\"Usage limits and pricing\", rank 1, 5,816 authors in 30 days, data as of 2026-10-05; leaf high-token-costs). Keys are illustrative and masked: sk-ant-api03- is the shape of a pay-per-token API key, sk-superbot- the shape `superbot keys --mint` prints. Mascot: superbot-desktop's hero mark. Source quick-chats/superbot-stop-api-pricing.3b8f5792.","download":"animations/stop-api-pricing-type-4x5-3b8f5792/final.mp4","downloadLabel":"MP4 4:5","downloads":{"4x5":"animations/stop-api-pricing-type-4x5-3b8f5792/final.mp4","16x9":"animations/stop-api-pricing-type-4x5-3b8f5792/final-16x9.mp4"}}],
  // <<< stop-api-pricing-3b8f5792
  // >>> thinking-speed-superbot-2347ca2a
  // actual speed (2026-10-08, chat 2347ca2a): thought-variants/b's thinking bubble streaming at its real speed for 5 s,
  // landing on the user's screenshot of it (Thinking · 11s), then a hard cut to the stop-api-pricing-superbot-e65959ff
  // end card. 8.2 s, 16:9 with 4:3, 1:1 and 4:5 recompositions (?ar=). Sound (2026-10-08): youtube zu6jr9WF7ZI,
  // "fuck" bleeped, "boi" on the cut. Source quick-chats/superbot-thinking-cut.2347ca2a.
  ["thinking-speed-superbot-2347ca2a", "thinking-speed-superbot-2347ca2a/", "actual speed · superbot thinks through about ten asks a second, Thinking · 11s, hard cut to superbot.gg with the mascot, to I'm fast as f*** boi, bleeped (8.2 s, 16:9, with sound)", 'Ad spots',
    {"desc":"The superbot mascot thinks beside superbot-desktop's thinking bubble, the thought-variants/b page at its actual speed: Jev's asks stream through at about ten thoughts a second on the desktop's own pacer (whole-word reveal, 80 ms word fade, 100 ms line glide) while the clock runs up to Thinking · 11s under the hand-lettered note, actual speed. The last frame before the cut is the user's screenshot of that page (toward it, but I can't promise it. / They're asking: “Schedule a meeting with my team next Tuesday”). At 5 s a hard cut to the stop-api-pricing-superbot-e65959ff end card: the mascot pops, superbot.gg slides out from behind it, happy eyes once. Sound: the \"I don't think you have any idea how fast I really am. I'm fast as f*** boi\" meme (Effects4YouTube) under the whole spot, the swear replaced by a 1 kHz bleep at the voice's level and \"boi\" landing on the cut (the page plays it after the first click; the MP4s carry it). 8.2 s, 1920x1080, 60 fps, -13.6 LUFS; 4:3, 1:1 and 4:5 recompositions through ?ar=. Market: sell-to-reddit llm_ai speed-local-hardware (\"Speed and local hardware\", rank 4, 2,696 authors in 30 days, rising, data as of 2026-10-05). Thoughts are thought-variants/b's thoughts.js, verbatim. Source quick-chats/superbot-thinking-cut.2347ca2a.","download":"animations/thinking-speed-superbot-2347ca2a/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/thinking-speed-superbot-2347ca2a/final.mp4","4x3":"animations/thinking-speed-superbot-2347ca2a/final-4x3.mp4","1x1":"animations/thinking-speed-superbot-2347ca2a/final-1x1.mp4","4x5":"animations/thinking-speed-superbot-2347ca2a/final-4x5.mp4"}}],
  // <<< thinking-speed-superbot-2347ca2a
  // >>> hood-mask-b2e2e147 (superbot-hood-mask-ad.b2e2e147, three approved finals: 1920x1080, 30 fps, 12.0 s, -14.0 LUFS, -1.5 dB peak; bundled, no renders)
  ['hood-mask-tavus-b2e2e147', 'hood-mask-tavus-b2e2e147/', 'Hooded mask: no refusals, this fast (Tavus)', 'Ad spots',
    {"desc":"A hooded figure in the superbot cat mask says \"superbot has no refusals\" and \"and it is this fast\" while the real superbot thinking bubble streams at actual speed beside him. Ends on a download call to action at superbot.gg. 12.0 s, 1920x1080, 30 fps, with sound (-14.2 LUFS, -1.5 dB peak). Market: sell-to-reddit llm_ai pain_points, rank 2 \"Output quality, regressions and refusals\" (4,206 authors in 30 days, rising) and rank 4 \"Speed and local hardware\" (2,696 authors in 30 days, rising), data as of 2026-10-05. Source quick-chats/superbot-hood-mask-ad.b2e2e147, variant v1 (Tavus).","download":"animations/hood-mask-tavus-b2e2e147/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/hood-mask-tavus-b2e2e147/final.mp4"}}],
  ['hood-mask-nanobanana2-b2e2e147', 'hood-mask-nanobanana2-b2e2e147/', 'Hooded mask: no refusals, this fast (Nano Banana 2)', 'Ad spots',
    {"desc":"A hooded figure in the superbot cat mask says \"superbot has no refusals\" and \"and it is this fast\" while the real superbot thinking bubble streams at actual speed beside him. Ends on a download call to action at superbot.gg. 12.0 s, 1920x1080, 30 fps, with sound (-14.2 LUFS, -1.5 dB peak). Market: sell-to-reddit llm_ai pain_points, rank 2 \"Output quality, regressions and refusals\" (4,206 authors in 30 days, rising) and rank 4 \"Speed and local hardware\" (2,696 authors in 30 days, rising), data as of 2026-10-05. Source quick-chats/superbot-hood-mask-ad.b2e2e147, variant v2 (Nano Banana 2).","download":"animations/hood-mask-nanobanana2-b2e2e147/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/hood-mask-nanobanana2-b2e2e147/final.mp4"}}],
  ['hood-mask-seedance-b2e2e147', 'hood-mask-seedance-b2e2e147/', 'Hooded mask: no refusals, this fast (Seedance 2.5)', 'Ad spots',
    {"desc":"A hooded figure in the superbot cat mask says \"superbot has no refusals\" and \"and it is this fast\" while the real superbot thinking bubble streams at actual speed beside him. Ends on a download call to action at superbot.gg. 12.0 s, 1920x1080, 30 fps, with sound (-14.2 LUFS, -1.5 dB peak). Market: sell-to-reddit llm_ai pain_points, rank 2 \"Output quality, regressions and refusals\" (4,206 authors in 30 days, rising) and rank 4 \"Speed and local hardware\" (2,696 authors in 30 days, rising), data as of 2026-10-05. Source quick-chats/superbot-hood-mask-ad.b2e2e147, variant v3 (Seedance 2.5).","download":"animations/hood-mask-seedance-b2e2e147/final.mp4","downloadLabel":"MP4 16:9","downloads":{"16x9":"animations/hood-mask-seedance-b2e2e147/final.mp4"}}],
  // <<< hood-mask-b2e2e147
  // >>> anon-no-refusals-phone-superbot-e3e2385f (quick-chats/converge-recompose.a98006a7: 1920x1080, 60 fps, 15.5 s, frame-exact render; X campaign 42706749)
  ["anon-no-refusals-phone-superbot-e3e2385f", "anon-no-refusals-phone-superbot-e3e2385f/", "Hooded mask + phone: no refusals, fast, your subscriptions", 'Ad spots',
    {"desc": "The hooded figure in the superbot cat mask from the posted anon ad (its original 1920x1080 film, not the 720p re-encode), with a phone beside him running the real superbot desktop thread UI (origin/main). On \"superbot has no refusals\" it takes \"Download the thumbnails on https://www.youtube.com/@MrBeast\" and answers it in full within 1.3 s: Thought for 4s, Connected to YouTube with its three steps, the answer and six thumbnails. On \"it's fast as f***\" a new chat asks \"Make me a million $$$\" and only desktop main's live thought bubble shows, one continuous thought streaming at its pacer's 1,800 chars/s ceiling. On \"uses your existing subscription\" the Add a credential sheet rises and all nine switches turn on in 0.5 s. The phone leaves as the superbot.gg end card cuts in. 15.5 s, 1920x1080, 60 fps frame-exact render, with sound. Market: sell-to-reddit llm_ai pain_points, rank 2 \"Output quality, regressions and refusals\" (4,206 authors in 30 days, rising) and rank 4 \"Speed and local hardware\" (2,696 authors in 30 days, rising), data as of 2026-10-05. X campaign 42706749. Source quick-chats/converge-recompose.a98006a7.", "download": "animations/anon-no-refusals-phone-superbot-e3e2385f/final.mp4", "downloadLabel": "MP4 16:9", "downloads": {"16x9": "animations/anon-no-refusals-phone-superbot-e3e2385f/final.mp4"}}],
  // <<< anon-no-refusals-phone-superbot-e3e2385f
];
// an optional 5th field carries extra item fields, e.g. { download, downloadLabel } for a file too big for Pages
for (const [name, src, title, group, extra] of more) {
  items.push({ id: name, type: 'animation', group, title, src: `animations/${src}`,
    thumb: `assets/shots/${name}.png`, ...(extra || {}) });
}

// Ad spots that live in the real-ui gallery (singularitystudiosdev/superbot-ad-gallery-real-ui):
// the page plays from its permanent URL there; the thumb and the offline renders are copied in
// here (assets/shots/<id>.png, assets/video/<id>.<ar>.mp4) so the tile and the download work
// the same as every local spot. [name, title, path?]: path defaults to <name>/; the variants of one page
// pass their own (a ?route= link into the shared page).
const REAL_UI = 'https://singularitystudiosdev.github.io/superbot-ad-gallery-real-ui/animations/';
const realUi = [
  // Every model, one chat: bike ride (2026-09-28): mirrored from Real UI; clip X @prasenx https://x.com/prasenx/status/2102717687604633959, built in the browser with Claude Opus 5.5.
  // Two cuts of one page: the default pushes the camera in; ?cut=nozoom keeps it at rest.
  ['bikeride-model-switch-superbot-e13744a9', 'make a relaxing Japanese bike riding game: Gemini, Blender, ElevenLabs, Opus 5.5, then the real Opus 5.5 build plays (4 switches; clip @prasenx)'],
  ['bikeride-model-switch-nozoom-superbot-e13744a9', 'make a relaxing Japanese bike riding game, no zoom: Gemini, Blender, ElevenLabs, Opus 5.5, then the real Opus 5.5 build plays (4 switches; clip @prasenx)', 'bikeride-model-switch-superbot-e13744a9/?cut=nozoom'],
  // Japan bikeride, every model (2026-09-28): "Make me relaxing Japan bikeride", 14 model switches, the Veo 3 reply
  // opens full frame on @prasenx's bike ride clip before a black superbot end card.
  ['japan-bikeride-every-model-superbot-ad3eb59d', 'Japan bikeride, every model'],
  // MAKE ME RELAXING JAPAN BIKERIDE (2026-09-28): mirrored from Real UI; clip X @prasenx https://x.com/prasenx/status/2102717687604633959.
  ['japan-bikeride-every-model-superbot-fec00f6a', 'MAKE ME RELAXING JAPAN BIKERIDE: one prompt, 16 model switches, the ride on screen at 3.3 s, superbot end card (clip @prasenx)'],
  // the "Superbot just works" family (2026-09-25): 12 spots on one kit; superbot aggregates a
  // real ask across platforms and hands back a finished frontend in Chrome.
  ['just-works-couch-local-superbot-42aac446', 'Mid-century couches, 20 miles out · superbot just works'],
  ['just-works-dresses-superbot-42aac446', '10 Dresses on Amazon · superbot just works'],
  ['just-works-espresso-gpt-superbot-42aac446', 'Espresso, by the reviews · superbot just works'],
  ['just-works-f-series-superbot-42aac446', 'Used F-Series, every platform · superbot just works'],
  ['just-works-gift-dad-gpt-superbot-42aac446', 'Fishing gifts for dad, under $50 · superbot just works'],
  ['just-works-gmail-manage-superbot-42aac446', 'Inbox, handled · superbot just works'],
  ['just-works-gmail-receipts-gpt-superbot-42aac446', 'What I spent this year · superbot just works'],
  ['just-works-leather-jacket-superbot-42aac446', 'Vintage leather jacket, size M · superbot just works'],
  ['just-works-running-shoes-gpt-superbot-42aac446', 'Size 10, in stock · superbot just works'],
  ['just-works-standing-desk-gpt-superbot-42aac446', 'Standing desks, compared · superbot just works'],
  ['just-works-waiver-night-superbot-42aac446', 'Waiver night, three leagues · superbot just works'],
  ['just-works-waiver-night-gpt-superbot-42aac446', 'Waiver night, ChatGPT vs Superbot · superbot just works'],
  ['just-works-tickets-superbot-42aac446', 'Two seats together, Friday · superbot just works'],
  ['just-works-tv-price-gpt-superbot-42aac446', 'OLED 65, today · superbot just works'],
  ['just-works-marathon-build-superbot-42aac446', 'Strava + Garmin + Nike Run Club, one training log · superbot just works'],
  ['just-works-marathon-build-gpt-superbot-42aac446', 'Strava + Garmin + Nike Run Club, ChatGPT vs Superbot · superbot just works'],
  ['just-works-trip-wallet-superbot-42aac446', 'Gmail + United + Delta + Marriott + Airbnb, one trip timeline · superbot just works'],
  ['just-works-trip-wallet-gpt-superbot-42aac446', 'Gmail + United + Delta + Marriott + Airbnb, ChatGPT vs Superbot · superbot just works'],
  // model-switch spots (2026-09-26): one chat hands off Gemini > DeepSeek V4 Flash > the burger ask, three routings
  // of that last ask, one page (?route= picks it).
  ['every-model-one-chat-superbot-efa8df82', 'EVERY MODEL. ONE CHAT. · Connecting to DoorDash'],
  ['every-model-one-chat-sb-superbot-efa8df82', 'EVERY MODEL. ONE CHAT. · Switched to Superbot', 'every-model-one-chat-superbot-efa8df82/?route=superbot'],
  ['every-model-one-chat-sb-combo-efa8df82', 'EVERY MODEL. ONE CHAT. · Superbot, then DoorDash', 'every-model-one-chat-superbot-efa8df82/?route=combo'],
  // Every model, one chat, detailed 16:9 variant (2026-10-04, em07): mirrored from Real UI; the route=superbot spot at the same 21.241 s with each
  // switch re-picked for what the ask makes (Nano Banana Pro meme, Reddit connector scan, Superbot Agent DoorDash order) and full answer cards.
  ['every-model-detail-em07-sb-superbot-07557dbc', 'EVERY MODEL. ONE CHAT. · Nano Banana Pro meme, Reddit connector scan, Superbot Agent orders (detailed, 16:9)', 'em-detail-superbot-07557dbc/'],
  // I want to make minecraft (2026-09-26): Opus 5.5 > GitHub > DeepSeek V4 Flash decals > Gemini decals > Opus 5.5,
  // three cuts of one page (?cut=).
  ['make-minecraft-every-model-superbot-b055c127', 'I WANT TO MAKE MINECRAFT · every model, one chat'],
  ['make-minecraft-every-model-steps-superbot-b055c127', 'I WANT TO MAKE MINECRAFT · you ask, it switches', 'make-minecraft-every-model-superbot-b055c127/?cut=steps'],
  ['make-minecraft-every-model-zoom-superbot-b055c127', 'I WANT TO MAKE MINECRAFT · into the game', 'make-minecraft-every-model-superbot-b055c127/?cut=zoom'],
  // I want to make a MMO RPG (2026-09-26): five routings of one page (?v=1..5) through plan, code, git, art, play.
  ['mmorpg-every-model-v1-superbot-d231c019', 'I want to make a MMO RPG: DeepSeek plans, Opus 5.5 codes, GitHub, Gemini art', 'mmorpg-every-model-superbot-d231c019/?v=1'],
  ['mmorpg-every-model-v2-superbot-d231c019', 'I want to make a MMO RPG: Opus 5.5 plans, Gemini art, Codex codes, GitHub', 'mmorpg-every-model-superbot-d231c019/?v=2'],
  ['mmorpg-every-model-v3-superbot-d231c019', 'I want to make a MMO RPG: Gemini art first, DeepSeek lore, Opus 5.5 codes', 'mmorpg-every-model-superbot-d231c019/?v=3'],
  ['mmorpg-every-model-v4-superbot-d231c019', 'I want to make a MMO RPG: DeepSeek, Codex server, Opus 5.5 client, Gemini, GitHub', 'mmorpg-every-model-superbot-d231c019/?v=4'],
  ['mmorpg-every-model-v5-superbot-d231c019', 'I want to make a MMO RPG: Opus 5.5 plans, DeepSeek codes, Gemini art, GitHub', 'mmorpg-every-model-superbot-d231c019/?v=5'],
  // build me an interactive 3D island world (2026-09-26): three storyboards of one page (?v=1..3: 3, 5, 7 switches), end on the island clip.
  ['island-world-every-model-v1-superbot-00836f02', '3D island world: Gemini images the terrain and sky, Claude Opus 5.5 builds it, Superbot runs it (3 switches)', 'island-world-every-model-superbot-00836f02/?v=1'],
  ['island-world-every-model-v2-superbot-00836f02', '3D island world: Claude Opus 5.5 builds, Meshy props, Gemini textures, GitHub, Superbot (5 switches)', 'island-world-every-model-superbot-00836f02/?v=2'],
  ['island-world-every-model-v3-superbot-00836f02', '3D island world: Veo flythrough, Opus water, ElevenLabs sound, Opus controls, DeepSeek tests, GitHub (7 switches)', 'island-world-every-model-superbot-00836f02/?v=3'],
  // make a 15-second motion graphics ad (2026-09-26): three routings of one page (?v=1..3), ends on a 13s cut of @ajith_io's 15s spot.
  ['motion-ad-every-model-v1-superbot-7734cfa7', 'make a 15-second motion graphics ad: Suno lays the bed, Opus 5.5 syncs the cuts, Superbot renders (3 switches)', 'motion-ad-every-model-superbot-7734cfa7/?v=1'],
  ['motion-ad-every-model-v2-superbot-7734cfa7', 'make a 15-second motion graphics ad: Nano Banana frames, Opus 5.5 builds, Suno scores, DeepSeek audits (5 switches)', 'motion-ad-every-model-superbot-7734cfa7/?v=2'],
  ['motion-ad-every-model-v3-superbot-7734cfa7', 'make a 15-second motion graphics ad: Opus 5.5 live preview, DeepSeek, Suno, Opus, GitHub, Opus renders (7 switches)', 'motion-ad-every-model-superbot-7734cfa7/?v=3'],
  // make a 90s fantasy 3D game (2026-09-26): three routings of one page (?v=1..3) through plan, code, art, music, git, play.
  ['fantasy90s-every-model-v1-superbot-042670d1', 'make a 90s fantasy 3D game: Meshy meshes first, then Opus 5.5 and Gemini in parallel (3 requests)', 'fantasy90s-every-model-superbot-042670d1/?v=1'],
  ['fantasy90s-every-model-v2-superbot-042670d1', 'make a 90s fantasy 3D game: Codex in the terminal, Opus 5.5 reviews and hands it back, Gemini (5 requests)', 'fantasy90s-every-model-superbot-042670d1/?v=2'],
  ['fantasy90s-every-model-v3-superbot-042670d1', 'make a 90s fantasy 3D game: Lyria chiptune first, Meshy, Gemini, Opus 5.5, Codex live preview, GitHub (7 requests)', 'fantasy90s-every-model-superbot-042670d1/?v=3'],
  // make a Splatoon game (2026-09-26): the one-ask nine-step ink build, forked from fantasy90s v3's routing grammar
  // (v1 of that page). Opus 5.5 scripts it, DeepSeek V4 Flash scrapes the ink refs, Meshy 5 models the plaza and Juno,
  // HY-Motion 1.0 animates juno.glb, ElevenLabs and Suno v5 score it in parallel, Nano Banana paints the art, Opus 5.5
  // codes the turf war, Vercel ships it, and the last step is real gameplay from @JaydenDavisNC's Opus 5.5 capture.
  ['inkwave-every-model-v1-superbot-f1a86d6f', 'make a Splatoon game: Opus 5.5 scripts it, DeepSeek scrapes, Meshy 5 models, HY-Motion animates, ElevenLabs + Suno sound, Nano Banana art, Opus codes, Vercel ships (9 steps)', 'inkwave-every-model-superbot-f1a86d6f/?v=1'],
  // make a Splatoon-style ink game (2026-09-26): the fantasy90s v3 routing reskinned to an ink shooter, ends on 13s of @JaydenDavisNC's Opus 5.5 build.
  ['splatoon-every-model-v3-superbot-7cf3d4da', 'make a Splatoon-style ink game: Lyria, Meshy, Gemini, Opus 5.5, DeepSeek, GitHub, then the real Opus 5.5 build plays (7 requests; clip @JaydenDavisNC)', 'splatoon-every-model-superbot-7cf3d4da/'],
  // make a Liquid Glass motion reel (2026-09-26): the splatoon v3 routing reskinned to frosted glass, ends on @motion_conquest's real Opus 5.5 Liquid Glass reel.
  ['liquidglass-every-model-v3-superbot-956467aa', 'make a Liquid Glass motion reel: Lyria, Meshy, Gemini, Opus 5.5, DeepSeek, GitHub, then the real Opus 5.5 Liquid Glass reel plays (7 requests; clip @motion_conquest)', 'liquidglass-every-model-superbot-956467aa/'],
  // make a Splatoon game (2026-09-26): one ask routed to seven models on one page (v3, the default cut):
  // Lyria scores the match, Meshy models the props, Gemini draws the ink decals, DeepSeek scrapes CC0 prop
  // libraries, GitHub pushes Inkwave, Opus 5.5 codes the game and plays it.
  ['inkwave-every-model-superbot-3f9d27b4', 'make a Splatoon game: Lyria track, Meshy props, Gemini ink decals, Opus 5.5 codes Inkwave, DeepSeek scrapes props, GitHub (7 requests)', 'inkwave-every-model-superbot-3f9d27b4/'],
  // make an animated video about the future (2026-09-26): three structurally different pipelines for one film (?v=1..3), ends on The Steep Part clip.
  ['future-video-every-model-v1-superbot-fef7368f', 'make an animated video about the future: Veo 3 renders shot 1, Codex builds the film in a terminal (3 switches)', 'future-video-every-model-superbot-fef7368f/?v=1'],
  ['future-video-every-model-v2-superbot-fef7368f', 'make an animated video about the future: ElevenLabs voice first, DeepSeek cues, Kling renders, back to DeepSeek (5 switches)', 'future-video-every-model-superbot-fef7368f/?v=2'],
  ['future-video-every-model-v3-superbot-fef7368f', 'make an animated video about the future: Nano Banana storyboard, Veo 3 + Kling in parallel, Suno, ElevenLabs, Opus 5.5 cut (7 switches)', 'future-video-every-model-superbot-fef7368f/?v=3'],
  // make Dark Souls (2026-09-26): three structurally different routings of one page (?v=1..3), coding always Opus 5.5 as result cards, ends on 13s of @The_Alex's Opus 5.5 Dark Souls clip.
  ['dark-souls-every-model-v1-superbot-80e24d9f', 'make Dark Souls: ElevenLabs voices the boss, Opus 5.5 builds it, Superbot plays (3 switches)', 'dark-souls-every-model-superbot-80e24d9f/?v=1'],
  ['dark-souls-every-model-v2-superbot-80e24d9f', 'make Dark Souls: Gemini paints the Gatewarden, Opus 5.5 builds the fight, Gemini textures the fog gate, GitHub, Superbot renders and plays (5 switches)', 'dark-souls-every-model-superbot-80e24d9f/?v=2'],
  ['dark-souls-every-model-v3-superbot-80e24d9f', 'make Dark Souls: Opus 5.5 builds combat, DeepSeek assets, ElevenLabs score, Gemini art, Opus 5.5 live preview, GitHub, Superbot plays (7 switches)', 'dark-souls-every-model-superbot-80e24d9f/?v=3'],
  // make Dark Souls v4 (2026-09-26): the remake, reframed tight like one-agent-full-degen (no per-switch zoom):
  // Opus 5.5 cooks the codebase as a timelapse, DeepSeek V4 Flash searches the reference assets, Meshy 5 turns them
  // into real 3D meshes, MiniMax Hailuo 02 animates the casts, ElevenLabs scores, GitHub, Superbot plays.
  ['dark-souls-every-model-v4-superbot-80e24d9f', 'make Dark Souls: Opus 5.5 timelapse cooks the code, DeepSeek V4 Flash searches the assets, Meshy 5 models them in 3D, MiniMax Hailuo 02 animates, ElevenLabs score, GitHub, Superbot plays (v4 remake, 7 steps)', 'dark-souls-every-model-superbot-80e24d9f/?v=4'],
  // THEY WONT TELL YOU HOW (2026-09-27): a fork of the dark-souls v4 routing. A mock X post ("I made this in 1 prompt",
  // the embedded video @achxvi's Opus 5.5 Pocketsflow launch film) pushes in, "THEY / WONT / TELL / YOU / HOW" lands one
  // word at a time, then the how: the v4 steps rethemed to Pocketsflow, ending on Superbot playing the real clip.
  ['pocketsflow-untold-every-model-superbot-673c104b', 'THEY WONT TELL YOU HOW: “I made this in 1 prompt”, then the how. DeepSeek V4 Flash, Meshy 5, MiniMax Hailuo 02, ElevenLabs, Opus 5.5 timelapse, Superbot renders the Pocketsflow launch film (clip @achxvi)'],
  // THEY WONT TELL YOU HOW, the Superbot cut (2026-09-27): a second fork of the dark-souls v4 routing. A fictional X
  // post ("I made this in 1 prompt", the video @achxvi's Opus 5.5 Pocketsflow launch film) pushes in, the word column
  // lands, then one chat makes the launch video: DeepSeek, Meshy 5, Hailuo 02, ElevenLabs, Opus 5.5, Superbot plays.
  ['they-wont-tell-you-how-superbot-fccab6d9', 'THEY WONT TELL YOU HOW: a “I made this in 1 prompt” post, then make a launch video for Pocketsflow: DeepSeek V4 Flash researches, Meshy 5 models the mascot, MiniMax Hailuo 02 animates, ElevenLabs scores, Opus 5.5 cuts it in Remotion, Superbot plays (video @achxvi)'],
  // THEY WONT TELL YOU HOW: 18 months to escape (2026-09-27): a fork of they-wont-tell-you-how fccab6d9. An X feed
  // decelerates onto a fictional "I made this in 1 prompt" post (footage @anabology's "18 MONTHS TO ESCAPE" film), the
  // word column lands, then one chat builds that film: DeepSeek, Midjourney v7, MiniMax Hailuo 02, ElevenLabs, Claude
  // Opus 5.5 on a 15:00 clock, GitHub, and Superbot plays the real film with sound.
  ['escape-untold-every-model-superbot-a00325aa', 'THEY WONT TELL YOU HOW: 18 months to escape (every model, one prompt)'],
  // ITS A LIE (2026-09-27): a fork of the pocketsflow-untold engine. A mock X post ("I MADE THIS IN ONE PROMPT", the
  // clip @noahwachnik's voxel game) glitches, ITS A LIE / THE SECRET IS / ITS NOT JUST OPUS 5.5, then one chat routes
  // "make me minecraft in the browser" to DeepSeek, Nano Banana, Meshy, ElevenLabs, Suno and Claude Opus 5.5; the reveal
  // plays BlockHaven by @kepochnik.
  ['its-a-lie-every-model-superbot-54829cd7', 'ITS A LIE: “I made this in one prompt”, then the models behind BlockHaven'],
  // IT'S NOT JUST OPUS 5.5 (2026-09-27): a fork of make-minecraft b055c127. The viewer mines @noahwachnik's Opus 5.5
  // Minecraft post like a block, then one chat routes "make me minecraft. call it BlockHaven" through six models
  // before @kepochnik's BlockHaven clip plays.
  ['blockhaven-not-just-opus-superbot-2ab31e2c', 'IT\'S NOT JUST OPUS 5.5: mine @noahwachnik\'s post, then one chat builds BlockHaven. DeepSeek V4 Flash, Gemini, Meshy 5, ElevenLabs, Opus 5.5, Superbot plays it (clip @kepochnik)'],
  // Model switcher (2026-09-28): a deck of 16 model cards switches faster and faster under the routing
  // chip, then one 7 s chat routes a Japanese bike ride to Meshy, DeepSeek and Opus 5.5 (clip @prasenx).
  ['first-model-all-models-superbot-df54f063', 'MODEL SWITCHER: 16 model cards switch, then one 7 s chat builds a Japanese bike ride. Meshy, DeepSeek, Opus 5.5 (clip @prasenx)'],
  // THE FIRST MODEL WITH ALL THE MODELS (2026-09-28): 14 model cards switch and deal out into the roster, then one 8 s
  // chat zooms on each switch (Meshy 3D grid, DeepSeek scraped assets, Opus 5.5 agent run) and the post's real ride plays.
  ['first-model-every-model-superbot-7d540b7f', 'THE FIRST MODEL WITH ALL THE MODELS: 14 model cards switch, then one 8 s chat zooms on each switch: Meshy models the 3D grid, DeepSeek scrapes the assets, Opus 5.5 codes, and the Japanese bike ride plays'],
  // make a Splatoon game (2026-09-26): the whole ink build in one chat, one model per step. Opus 5.5 writes the
  // brief, DeepSeek V4 Flash scrapes the ink refs, Meshy 5 models the arena, HY-Motion animates the cast,
  // ElevenLabs and Suno score it, Gemini paints the ink, Opus 5.5 codes Inkwave, GitHub ships it, and the last
  // step is real gameplay from @JaydenDavisNC's Opus 5.5 Splatoon capture.
  ['inkwave-every-model-superbot-b7e4c219', 'Superbot builds Inkwave: every model, one chat'],
  // make a video on western civilization (2026-09-27): the mariokart 7aec3197 routing rethemed to Prometheus and the fire,
  // each model switch a fire pass; ends on @IterIntellectus's Claude-made western civilization film.
  ['prometheus-every-model-v3-superbot-0a738a62', 'make a video on western civilization: Lyria 2, Meshy, Gemini, Opus 5.5, DeepSeek V4 Flash, GitHub, then Opus 5.5 renders Prometheus II; each switch passes the fire (7 requests; clip @IterIntellectus)', 'prometheus-every-model-superbot-0a738a62/?v=3'],
  // make a high-end netflix style documentary about superintelligence for normies (2026-09-27): the fantasy90s v3 cadence
  // rethemed to THE LAST INVENTION, each model switch a lower third with its domino; ends on @gavinpurcell's documentary title card.
  ['lastinvention-every-model-v3-superbot-dda6c235', 'make a high-end netflix style documentary about superintelligence for normies: Lyria 2, Meshy, Gemini, Opus 5.5, DeepSeek V4 Flash, GitHub, then Opus 5.5 renders The Last Invention; each switch a falling domino (7 requests; film @gavinpurcell)', 'lastinvention-every-model-superbot-dda6c235/?v=3'],
  // Create a 4-5 minute cinematic video about the Battle of Austerlitz (1805) (2026-09-27): the lastinvention v3 cadence
  // rethemed to AUSTERLITZ, each model switch an hour caption with its true sun; ends on @WinterArc2125's Opus 5.5 film.
  ['austerlitz-every-model-v3-superbot-282e0654', 'Create a 4-5 minute cinematic video about the Battle of Austerlitz (1805), built entirely in code: Lyria 2, Meshy, Gemini, Opus 5.5, DeepSeek V4 Flash, GitHub, then Opus 5.5 renders Austerlitz; each switch an hour of the film with the sun where it really stood (7 requests; film @WinterArc2125)', 'austerlitz-every-model-superbot-282e0654/?v=3'],
  // make a Mario Kart game, one prompt, every model (2026-09-27): opens on @bridgemindai's real ONE SHOT post, VHS-rewinds
  // its clip to the title screen, then Opus 5.5 plans the build and routes 8 requests; ends on the post's real clip.
  ['mariokart-rewind-every-model-superbot-c30de946', 'Superbot: make a Mario Kart game, one prompt, every model: opens on @bridgemindai’s ONE SHOT post and VHS-rewinds its clip to the title screen; Opus 5.5 plans, Gemini, Meshy, DeepSeek V4 Flash, Opus 5.5, Lyria 2, GitHub, then Opus 5.5 launches Turbo Kart Rally; ends on the post’s real clip (8 requests; clip @bridgemindai)'],
  // THE TEARDOWN, make a kart racer (2026-09-27): the fantasy90s v3 engine rethemed to Turbo Kart Rally. An X cold open
  // flexes real Opus 5.5 one-shot posts, @bridgemindai's clip freezes mid-race and its HUD lifts off tagged by model,
  // then one chat builds it and the frozen frame resumes into the real clip.
  ['turbokart-xray-every-model-v3-superbot-5c1e9b27', 'THE TEARDOWN: the X feed flexes Opus 5.5 one-shots, @bridgemindai’s Turbo Kart Rally freezes mid-race, the HUD lifts off tagged by model (wanna know how? it’s not just Opus 5.5.), then one chat builds it: DeepSeek V4 Flash research, Gemini roster, Nano Banana Pro portraits, Lyria 2 + ElevenLabs score, Opus 5.5 code, GPT-5 Codex playtest, GitHub; the frozen frame resumes into the real clip (clip @bridgemindai, 8 requests)', 'turbokart-xray-every-model-v3-superbot-5c1e9b27/?v=3'],
  // WE DONT CARE (2026-09-28): mirrored from Real UI. "Opus 5.5 says you shouldn't gamble" with only that word in
  // red, a slammed "WE DONT CARE!" under a confetti burst, then one ask — "Make a website of all my winnings" —
  // and superbot's card grows sams-winnings.site out of the thread to fill the 4:5 frame. Fictional winnings.
  ['we-dont-care-gamble-superbot-89be2ca4', 'WE DONT CARE: Opus 5.5 says you shouldn\'t gamble, then superbot builds a website of all my winnings'],
  // THE GAMBLE MATRIX (2026-09-28): the we-dont-care 89be2ca4 spot as the 12 cells of the real-ui tools/var89-matrix.mjs
  // (four voices x memecoin/Polymarket/DraftKings). Card 1 names the variant voice ("<voice> says you shouldn't
  // gamble"), then the same slam and one ask that builds a site of all my memecoin / Polymarket / DraftKings wins.
  // Mirrored from Real UI; provider names plain text only and every figure fictional mock UI data.
  ['chatgpt-memecoins-superbot-cae00e01', 'ChatGPT says you shouldn\'t gamble: superbot builds a site of all my memecoin wins'],
  ['chatgpt-polywins-superbot-cae00e02', 'ChatGPT says you shouldn\'t gamble: superbot builds a site of all my Polymarket wins'],
  ['chatgpt-sportsbook-superbot-cae00e03', 'ChatGPT says you shouldn\'t gamble: superbot builds a site of all my DraftKings wins'],
  ['claude-memecoins-superbot-cae00e04', 'Claude says you shouldn\'t gamble: superbot builds a site of all my memecoin wins'],
  ['claude-polywins-superbot-cae00e05', 'Claude says you shouldn\'t gamble: superbot builds a site of all my Polymarket wins'],
  ['claude-sportsbook-superbot-cae00e06', 'Claude says you shouldn\'t gamble: superbot builds a site of all my DraftKings wins'],
  ['gemini-memecoins-superbot-cae00e07', 'Gemini says you shouldn\'t gamble: superbot builds a site of all my memecoin wins'],
  ['gemini-polywins-superbot-cae00e08', 'Gemini says you shouldn\'t gamble: superbot builds a site of all my Polymarket wins'],
  ['gemini-sportsbook-superbot-cae00e09', 'Gemini says you shouldn\'t gamble: superbot builds a site of all my DraftKings wins'],
  ['grok-memecoins-superbot-cae00e0a', 'Grok says you shouldn\'t gamble: superbot builds a site of all my memecoin wins'],
  ['grok-polywins-superbot-cae00e0b', 'Grok says you shouldn\'t gamble: superbot builds a site of all my Polymarket wins'],
  ['grok-sportsbook-superbot-cae00e0c', 'Grok says you shouldn\'t gamble: superbot builds a site of all my DraftKings wins'],
  // THE BOT CELLS (2026-09-28): the same we-dont-care spot with the user's own words typed lowercase into the
  // composer, "make me a memecoin trading bot" / "make me a prediction market trading bot", and superbot builds
  // a live trading bot dashboard (sams-memebot.site / sams-polybot.site) instead of a site of wins. Same two
  // cells as the real-ui tools/var89-matrix.mjs; chain and venue names plain text only, every figure fictional.
  ['chatgpt-memebot-superbot-cae00e0d', 'ChatGPT says you shouldn\'t gamble: superbot builds a memecoin trading bot'],
  ['claude-polybot-superbot-cae00e0e', 'Claude says you shouldn\'t gamble: superbot builds a prediction market trading bot'],
  // THE LIVE CELLS (2026-09-28): mirrored from Real UI — the same two bot cells taken live, paper backtest
  // first then a real connect and live trades on Axiom / Polymarket. Venue names plain text only, all mock.
  ['chatgpt-memebot-live-superbot-cae00e0f', 'ChatGPT says you shouldn\'t gamble: superbot backtests, paper trades, then trades live on Axiom'],
  ['claude-polybot-live-superbot-cae00e10', 'Claude says you shouldn\'t gamble: superbot backtests, paper trades, then trades live on Polymarket'],
  // BUT WE WILL, do my job call center (2026-09-28; v2 2026-09-29): mirrored from Real UI — a standalone call-center
  // spot. "ChatGPT won't do your job for you" with the red word "job", a slammed "BUT WE WILL", then the one ask
  // "Do my job for me": superbot clocks in at Comcast and the camera dives into a rebuilt Einstein 360 agent desktop,
  // where it turns CTI on, matches the voice, reads 1,284 past calls and works a queue of inbound calls to "Queue
  // clear". All names/numbers fictional.
  ['do-my-job-callcenter-superbot-497a61f3', 'BUT WE WILL · Do my job for me: superbot answers Comcast calls in Einstein 360'],
  // BUT WE WILL, do my job lawyer (2026-09-29): mirrored from Real UI — the same intro and slam, then "Do my job for
  // me" as a federal litigator: superbot signs in to Clio Manage and works the ECF notice queue (orders read,
  // deadlines calendared, drafts in your voice) on real CourtListener dockets.
  ['do-my-job-lawyer-superbot-9c459cb1', 'BUT WE WILL · Do my job for me: superbot works a litigator’s federal docket in Clio'],
  // BUT WE WILL, do my job data analyst (2026-09-29): mirrored from Real UI — the same intro and slam, then "Do my job
  // for me" as a data analyst: superbot signs in to BigQuery and Slack and works the #data-requests queue (SQL written,
  // result charted, reply posted with the chart) on real NYC TLC July 2026 trip records.
  ['do-my-job-data-analyst-superbot-0368c93c', 'BUT WE WILL · Do my job for me: superbot works a data analyst’s request queue in BigQuery'],
  // BUT WE WILL, do my job translator (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job
  // for me" as an English-to-Spanish translator: superbot signs in to Phrase TMS and works the job queue (segments
  // confirmed, IRS Publication 850 glossary terms applied, RAE style-rule QA catches fixed) on real US federal
  // publications with their official Spanish (DOL minimum wage poster, IRS Publication 1, Medicare & You 2027 and 9 more).
  ['do-my-job-translator-superbot-e60f1bcc', 'BUT WE WILL · Do my job for me: superbot works an English-to-Spanish translator’s queue in Phrase TMS'],
  // BUT WE WILL, do my job copywriter (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job for
  // me" as a copywriter: superbot signs in to Google Docs and works a Mailchimp copy deck's request comments (drafts
  // with a live character count, checks ticked, reply posted, thread resolved) against real platform limits (Google
  // Ads, Apple App Store Connect, Google Play, Meta, LinkedIn, X, Mailchimp help), the Mailchimp Content Style Guide
  // and real Mailchimp facts (homepage, pricing page, live App Store listing).
  ['do-my-job-copywriter-superbot-cda60abe', 'BUT WE WILL · Do my job for me: superbot writes the Mailchimp copy deck in Google Docs'],
  // BUT WE WILL, do my job journalist (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job for
  // me" as a journalist: superbot signs in to WordPress and works a reporter's story budget in the block editor
  // (headline options with live character counts, dateline, lede and second paragraph typed, every number
  // fact-checked against the release, AP style fixes, Submit for Review) on 12 real Sept. 24, 2026 releases (BEA, DOL,
  // Census, BLS, EIA, Freddie Mac, Fed, USDA NASS, Costco, NASA) and 12 verbatim AP Stylebook rules.
  ['do-my-job-journalist-superbot-f8795b48', 'BUT WE WILL · Do my job for me: superbot works a reporter’s story budget in WordPress'],
  // BUT WE WILL, do my job financial advisor (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my
  // job for me" as a financial advisor: superbot signs in to Wealthbox with Schwab connected and works the client
  // request queue (answer drafted with the rule quoted, task ticked, reply posted in your writing) on the real IRS
  // Pub. 590-B 2026 RMD example, IRS 2026 limits and Roth catch-up rule, the Trump Account rules and real VTI/VXUS/BND
  // closes Dec 31, 2025 to Sep 28, 2026 for the 60/40 drift; no person is named.
  ['do-my-job-financial-advisor-superbot-38facc16', 'BUT WE WILL · Do my job for me: superbot works a financial advisor’s client requests in Wealthbox'],
  // BUT WE WILL, do my job web developer (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job
  // for me" as a web developer: superbot signs in to GitHub and works 12 real excalidraw/excalidraw issues (the repo's
  // rules read verbatim, three real fix diffs typed: #11876 localize Sign up/Sign in, #7332 drop the dark-mode canvas
  // filter for Firefox, #11914 Cmd/Ctrl+Shift+S while editing text; the real checks pass, Merge pull request).
  ['do-my-job-webdev-superbot-80a211a0', 'BUT WE WILL · Do my job for me: superbot works a web developer’s excalidraw issues on GitHub'],
  // BUT WE WILL, do my job market research analyst (2026-09-29): mirrored from Real UI, the same intro and slam, then
  // "Do my job for me" as a market research analyst: superbot signs in to Qualtrics XM and works a saved crosstab queue
  // (banner picked, weighted column percents with significance letters, finding typed into the report, matched to the
  // published figure) on the Federal Reserve's real SHED 2025 public-use data and 12 verbatim codebook and report facts.
  ['do-my-job-market-research-analyst-superbot-5aa2de03', 'BUT WE WILL · Do my job for me: superbot works a market research analyst’s crosstab queue in Qualtrics'],
  // BUT WE WILL, do my job tax preparer (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job
  // for me" as a tax preparer: superbot signs in to the Intuit ProConnect Tax desk and works the Oct 15, 2026 extension
  // queue (client email answered from the IRS worked example, return e-filed, rejects fixed) on the IRS Schedule 1-A
  // worked examples (tips $7,000 on line 5, overtime $15,000 / 3 = $5,000, car loan interest $2,000 under Treas. Reg.
  // 1.163-16) and the MeF rejects IND-031-04, IND-181-01, IND-507-01 and F8962-070 going from Rejected to Accepted.
  ['do-my-job-tax-preparer-superbot-0f0aa66c', 'BUT WE WILL · Do my job for me: superbot works a tax preparer’s extension queue in ProConnect Tax'],
  // BUT WE WILL, do my job travel agent (2026-09-29): mirrored from Real UI, the same intro and slam, then "Do my job
  // for me" as a travel agent: superbot signs in to Sabre Red 360 and works the PNR queue: UA 852 TPE to SFO
  // (Schedule change · Rebooked UA872 · Reissued); LH 440 FRA to IAH (Delay claim · EU261 · Filed with Lufthansa); UA
  // 934 EWR to LHR (Entry docs · UK ETA · DOCS added); real flights and published rules; traveler names, record
  // locators and ticket serials are fictional.
  ['do-my-job-travel-agent-superbot-8163d44c', 'BUT WE WILL · Do my job for me: superbot works a travel agent’s Sabre queue'],
  // BUT WE WILL, do my job sales development rep (2026-09-29): mirrored from Real UI, the same intro and slam, then
  // "Do my job for me" as a sales development rep: superbot signs in to Outreach and works a 12-task queue (email,
  // call and LinkedIn tasks worked in the task flow, Send & Complete, Log Call & Complete, Mark Complete) on 12 real
  // companies with dated public sales-growth triggers (the BackOps $42M Series B email, the AllianceHCM new Chief
  // Revenue Officer voicemail logged Voicemail Left, the Clinch London office LinkedIn connection request) after
  // reading 12 published cold-outreach findings (Gong Labs, 30 Minutes to President's Club, Lavender, Belkins); no
  // person is named.
  ['do-my-job-sdr-superbot-b5acc09b', 'BUT WE WILL · Do my job for me: superbot works a sales development rep’s task queue in Outreach'],
  // BUT WE WILL, do my job proofreader and editor (2026-09-29): mirrored from Real UI, the same intro and slam, then
  // "Do my job for me" as a proofreader and editor: superbot signs in to Word for the web, turns on Track Changes, reads
  // 12 style rules (GPO Style Manual, Guardian style guide, OFR Document Drafting Handbook, IUPAC) and fixes 12 real
  // published errors (the missing serial comma in Maine's overtime law, the "responsibilty" typo on Australia's $50
  // note, an "or" in a Federal Reserve rule from 1980 until 2026), each matched to the correction the publisher printed.
  ['do-my-job-proofreader-editor-superbot-c54c5ecd', 'BUT WE WILL · Do my job for me: superbot proofreads and edits in Microsoft Word'],
  // Answer the top comments and pin the best one, in detail (2026-10-05): mirrored from Real UI. Variant of
  // niche-youtube-model-switch-superbot-3828921d, 26.27 s, 16:9: Gemini matches each top comment to the moment that
  // answers it, ElevenLabs Voice Isolator measures the 7:05 room test for the pinned answer, Claude Opus 5.5 writes the
  // replies, YouTube Studio posts and pins. Thumbnail and charts drawn for the spot.
  ['niche-youtube-model-switch-detail-superbot-3a8678e2', 'Answer the top comments and pin the best one, in detail: Gemini finds each answer in the video, ElevenLabs measures the pinned one, Opus 5.5 writes, YouTube Studio pins (16:9)'],
  // The api key, for your subscriptions (2026-10-07, 027da5ad): mirrored from Real UI, three cuts of one two-beat 4:5
  // spot (15 s, with sound): the superbot key in a purple, pink and blue gradient with a shine on the app's Key minted
  // card, the mascot to its right, the real Copy button clicked to Copied; then superbot.gg with the mascot to its right.
  ['apikey-for-subscriptions-superbot-027da5ad-a', 'The api key, for your subscriptions · the superbot key decodes on its Key minted card, Copy clicks to Copied, then superbot.gg (mint, 15 s, 4:5)', 'apikey-for-subscriptions-superbot-027da5ad/?v=a',
    { download: `${REAL_UI}apikey-for-subscriptions-superbot-027da5ad/final-a.mp4`, downloadLabel: 'MP4 4:5' }],
  ['apikey-for-subscriptions-superbot-027da5ad-b', 'The api key, for your subscriptions · a tilting holo key card with a drifting gradient, the mascot carries into superbot.gg (holo, 15 s, 4:5)', 'apikey-for-subscriptions-superbot-027da5ad/?v=b',
    { download: `${REAL_UI}apikey-for-subscriptions-superbot-027da5ad/final-b.mp4`, downloadLabel: 'MP4 4:5' }],
  ['apikey-for-subscriptions-superbot-027da5ad-c', 'The api key, for your subscriptions · the key is typed in, a gradient wipe ends in a glint, a band wipes to superbot.gg (type, 15 s, 4:5)', 'apikey-for-subscriptions-superbot-027da5ad/?v=c',
    { download: `${REAL_UI}apikey-for-subscriptions-superbot-027da5ad/final-c.mp4`, downloadLabel: 'MP4 4:5' }],
  // >>> cursor-api-pricing-ab187b45 (mirror)
  // Cursor charges API pricing (2026-10-07, ab187b45): mirrored from Real UI, four cuts (cards 16:9, overlay 16:9,
  // converge 4:5, picker 1:1); source quick-chats/cursor-api-toggle.ab187b45.
  ["cursor-api-pricing-cards-16x9-ab187b45", "Cursor charges API pricing · Cursor's chat runs up $4.82, superbot's SUPER toggle flips on in the composer, Superbot makes it charge subscription, the meter reads FREE (cards, 14.4 s, 16:9)", "cursor-api-pricing-cards-16x9-ab187b45/",
    { download: `${REAL_UI}cursor-api-pricing-cards-16x9-ab187b45/final.mp4`, downloadLabel: 'MP4 16:9' }],
  ["cursor-api-pricing-overlay-16x9-ab187b45", "Cursor charges API pricing · headlines over the live Cursor window, the Superbot menu-bar switch bills Cursor to your subscription, $9.36 becomes FREE (overlay, 12 s, 16:9)", "cursor-api-pricing-overlay-16x9-ab187b45/",
    { download: `${REAL_UI}cursor-api-pricing-overlay-16x9-ab187b45/final.mp4`, downloadLabel: 'MP4 16:9' }],
  ["cursor-api-pricing-converge-4x5-ab187b45", "Cursor charges API pricing · the $6.16 pill is thrown out of Cursor's meter, a Superbot switch is flipped, Superbot makes it charge subscription, the pill reads FREE (converge, 14.4 s, 4:5)", "cursor-api-pricing-converge-4x5-ab187b45/",
    { download: `${REAL_UI}cursor-api-pricing-converge-4x5-ab187b45/final.mp4`, downloadLabel: 'MP4 4:5' }],
  ["cursor-api-pricing-picker-1x1-ab187b45", "Cursor charges API pricing · a Superbot row in Cursor's own model picker switches it to your subscription, $13.82 becomes FREE (picker, 12 s, 1:1)", "cursor-api-pricing-picker-1x1-ab187b45/",
    { download: `${REAL_UI}cursor-api-pricing-picker-1x1-ab187b45/final.mp4`, downloadLabel: 'MP4 1:1' }],
  // <<< cursor-api-pricing-ab187b45 (mirror)
];
// an optional 4th field carries extra item fields, e.g. { download, downloadLabel } pointing at the Real UI film
for (const [name, title, path, extra] of realUi) {
  items.push({ id: name, type: 'animation', group: 'Ad spots', title, src: `${REAL_UI}${path || name + '/'}`,
    thumb: `assets/shots/${name}.png`, ...(extra || {}) });
}

for (const g of groups.filter(g => g.group === ONLY_GROUP)) {
  for (const f of readdirSync(g.dir).filter(f => f.endsWith('.png') && (!g.match || g.match(f))).sort()) {
    if (statSync(`${g.dir}/${f}`).isDirectory()) continue;
    const base = f.replace(/\.png$/, '');
    const title = g.titles ? (g.titles[base] ?? base) : base.replace(/-/g, ' ');
    const { w, h } = pngSize(`${g.dir}/${f}`);
    items.push({ id: base, type: 'image', group: g.group, title, w, h,
      src: `${g.dir}/${f}`, thumb: `${g.dir}/${f}` });
  }
}

for (const [id, title] of ads) {
  const sizes = {};
  for (const k of AD_ARS) sizes[k] = pngSize(`assets/ads/${id}.${k}.png`);
  items.push({ id, type: 'image', group: 'Ad spots', title, ars: AD_ARS, sizes,
    src: `assets/ads/${id}.{ar}.png`, thumb: `assets/ads/${id}.{ar}.png` });
}

// Ship only the ad spots; the other groups stay defined above for easy re-enable.
const shipped = items.filter(i => i.group === ONLY_GROUP);

writeFileSync('manifest.json', JSON.stringify(shipped, null, 2));
console.log(`manifest.json: ${shipped.length} items (${ONLY_GROUP})`);

// every shipped animation's download button points at assets/video/<id>.<ar>.mp4.
// Name the ones with no render, so a page added without its offline video shows up
// here instead of as a dead download in the gallery.
const VIDEO_ARS = ['16x9', '4x3', '1x1', '4x5'];
const noRender = [];
for (const it of shipped) {
  if (it.type !== 'animation' || it.download) continue; // an external download ships no per-ratio renders
  for (const k of VIDEO_ARS) {
    const p = `assets/video/${it.id}.${k}.mp4`;
    try { statSync(p); } catch { noRender.push(p); }
  }
}
if (noRender.length) {
  console.log(`\nWARNING: ${noRender.length} download${noRender.length === 1 ? '' : 's'} have no offline render:`);
  for (const p of noRender) console.log(`  ${p}`);
  console.log('  render with: node .tmp/ar-render.5b31b079.mjs <port> all <id ...>');
}
