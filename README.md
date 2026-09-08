# superbot — ad gallery

Every frontend ad creative for **superbot**, in one shareable page. Click any tile to
zoom the full-size image or watch the animation play live. Static — no build, no deps.

**Live:** https://singularitystudiosdev.github.io/superbot-ad-gallery/

## Contents

76 items, gathered from the workspace projects and the GitHub repos:

- **Animations (8)** — the .gg landing (ASCII + textmode), the setup-wizard demo, the
  IDE-merge / orbit hero spots and their variants.
- **Ad spots (17)** — favorite color (the chat pitch), hi i am claude, the yes-man
  family, and the superbot.gg / ads spots (fix board, comparison, they-said-we-did, spot).
- **Site variants (14)** — superbot.gg landers and design studies, the ascii page,
  console, button page, merge mascot + merge loop cuts.
- **Hero reveal FX (13)** — sphere collapse, circular combine takes, dolly/sheen
  finishers, and the flip-reveal variants.
- **Mascot & toys (5)** — rainbow bench, AI dock, SWARM console + constellation, agent feed.
- **Images (19)** — app screenshots, .GG/mono textmode shots, IDE icons, the superbot icon.

## Structure

```
index.html          gallery page (grid + lightbox)
gallery.js          data fetch + grid + lightbox (vanilla, no deps)
styles.css          dark textmode theme
manifest.json       generated item list
gen-manifest.mjs    regenerates manifest.json (node gen-manifest.mjs)
animations/         each animation page, self-contained, served as-is
assets/img/         static images
assets/shots/       animation thumbnails (playwright captures)
```

New animation thumbnails: capture with playwright headless at 1280x720
(`npx playwright screenshot --viewport-size "1280,720" --wait-for-timeout 4500 <url> <out>`), pick the better-looking frame.

## Regenerating

Add a file under `assets/img/` (or a folder under `animations/`), then:

```
node gen-manifest.mjs
```

Thumbnails for new animations are playwright captures at 1280x720; reuse
`capture-230cb400.mjs` and pick the better-looking frame.

## License

MIT
