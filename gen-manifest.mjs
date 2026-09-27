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
];
for (const [name, title, path] of realUi) {
  items.push({ id: name, type: 'animation', group: 'Ad spots', title, src: `${REAL_UI}${path || name + '/'}`,
    thumb: `assets/shots/${name}.png` });
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
