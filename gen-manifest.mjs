// Generates manifest.json by scanning assets/. Run: node gen-manifest.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

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

for (const g of groups) {
  for (const f of readdirSync(g.dir).filter(f => f.endsWith('.png') && (!g.match || g.match(f))).sort()) {
    if (statSync(`${g.dir}/${f}`).isDirectory()) continue;
    const base = f.replace(/\.png$/, '');
    const title = g.titles ? (g.titles[base] ?? base) : base.replace(/-/g, ' ');
    const { w, h } = pngSize(`${g.dir}/${f}`);
    items.push({ id: base, type: 'image', group: g.group, title, w, h,
      src: `${g.dir}/${f}`, thumb: `${g.dir}/${f}` });
  }
}

writeFileSync('manifest.json', JSON.stringify(items, null, 2));
console.log(`manifest.json: ${items.length} items`);
