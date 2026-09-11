# superbot — ad gallery

Every frontend ad creative for **superbot**, in one shareable page. Click any tile to
zoom the full-size image or watch the animation play live. Static — no build, no deps.

**Live:** https://singularitystudiosdev.github.io/superbot-ad-gallery/

## Contents

8 ad spots, gathered from the workspace projects and the GitHub repos:

- **a voice clone of you** — superbot takes the next support calls in the rep's cloned voice (~48s loop).
- **your all-in-one agent workspace** — the superbot.gg hero boots, then superbot answers every email in your style (~32s loop).
- **icons chaos** — 80 skill chips and app icons bounce like a screensaver, superbot organizes them (13.4s loop).
- **agents refusing? superbot rescues a ChatGPT refusal with a copy-paste scraper** (27s loop).
- **agents slow? ChatGPT dribbles at 30 wpm while superbot writes the whole email** (30.5s loop).
- **favorite color** — the chat pitch: "whats ur favorite color".
- **hi i am claude**.
- **yes man · pros**.

The other creative groups (hero animations, site variants, hero reveal FX, mascot toys,
images) are still defined in `gen-manifest.mjs` — re-enable by changing `ONLY_GROUP`.

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
