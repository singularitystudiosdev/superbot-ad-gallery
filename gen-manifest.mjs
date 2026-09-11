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
  ['agent-workspace-superbot-59d77e34', 'agent-workspace-superbot-59d77e34/', 'your all in one agent workspace — the superbot.gg hero boots 1:1 (apps spin, mark flips, rail drops, frontend extends), title card, the user asks superbot to answer every email in their style, 1:1 Gmail with the agent replying to each thread, second card, end screen (~34s loop)', 'Ad spots'],
  ['icons-chaos-slam-superbot-544078ab', 'icons-chaos-slam-superbot-544078ab/', 'skill chips + real app icons chaos — 65 filename bubbles (scraper.md, inbox-triage.md…) + 55 real brand tiles (chatgpt, claude, devin, cursor, hermes, vscode, warp…) bounce like a dvd screensaver, superbot slams in, sucks them in, spits out organized lists, "Your agent, for your agents" (13.4s loop)', 'Ad spots'],
  ['gpt-refusal-superbot-824cef28', 'gpt-refusal-superbot-824cef28/', 'agents refusing? superbot can do it — ChatGPT 1:1 refusal, hub zoom, copy-paste scraper (27s loop)', 'Ad spots'],
  ['urgent-email-slow-superbot-7c4a91b2', 'urgent-email-slow-superbot-7c4a91b2/', 'agents slow? superbot can do it — URGENT email, ChatGPT dribbles at 30 wpm, superbot writes the whole email with a fade typewriter, one-click copy (30.5s loop)', 'Ad spots'],
  ['favorite-color', 'favorite-color/', 'favorite color — the chat pitch', 'Ad spots'],
  ['hi-i-am-claude', 'hi-i-am-claude/', 'hi i am claude', 'Ad spots'],
  ['yes-man-pros', 'yes-man/pros.html', 'yes man · pros', 'Ad spots'],
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
for (const [name, src, title, group] of more) {
  items.push({ id: name, type: 'animation', group, title, src: `animations/${src}`,
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

// Ship only the ad spots; the other groups stay defined above for easy re-enable.
const shipped = items.filter(i => i.group === ONLY_GROUP);

writeFileSync('manifest.json', JSON.stringify(shipped, null, 2));
console.log(`manifest.json: ${shipped.length} items (${ONLY_GROUP})`);
