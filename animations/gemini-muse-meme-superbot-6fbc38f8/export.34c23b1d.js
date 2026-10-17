// The Export button, the last control in the speed pill (variant-select.9e82faf1.js): it downloads the variant on show at the
// ratio picked, the same file the gallery lightbox's download serves (gallery.js renderDl): the offline render
// assets/video/<id>.<ar>.mp4, one loop with its sound at 30 fps, 1080 high (9:16 1080x1920), where <id> is the gallery entry
// (manifest.json at the gallery root) whose src opens this spot on that variant. A render exists only where one was made,
// so each (variant, ratio) is probed once. A plain link with `download`: the browser saves the file itself. With no render
// there, the button renders the variant at that ratio here instead (export.64039673.js: frame-exact, at the ratio's
// platform size, with the sound the spot plays, recorded in one real-time pass first), its label counting the sound pass
// then the render up, then saves it; only a browser without WebCodecs gets the old quiet 'No render'. Its stylesheet
// (export.34c23b1d.css) loads with the module.
import { variant, VARIANTS } from './variant.9e82faf1.js?v=3';
import { render, download, fileName, outSize, canRender, busy } from './export.64039673.js?v=3';

const ROOT = new URL('../../', import.meta.url);
// this spot's folder, as the manifest's srcs name it (animations/<folder>/?variant=...)
const FOLDER = new URL('./', import.meta.url).pathname.split('/').filter(Boolean).pop();
const LABEL = { '16x9': '16:9', '4x3': '4:3', '1x1': '1:1', '4x5': '4:5', '9x16': '9:16' };
const SIZE = { '16x9': '1920×1080', '4x3': '1440×1080', '1x1': '1080×1080', '4x5': '864×1080', '9x16': '1080×1920' };
const GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/></svg>';

const sheet = document.createElement('link');
sheet.rel = 'stylesheet';
sheet.href = new URL('./export.34c23b1d.css?v=2', import.meta.url).href;
sheet.onerror = () => console.error(new Error(`export button stylesheet failed to load: ${sheet.href}`));
document.head.appendChild(sheet);

// variant -> gallery entry id, read once from the manifest; the entry with no ?variant= is the spot's first variant
let ids = null;
const idsOf = () => ids || (ids = fetch(new URL('manifest.json', ROOT))
  .then((r) => (r.ok ? r.json() : []))
  .then((items) => {
    const map = {};
    for (const it of items) {
      const u = new URL(it.src || '', ROOT);
      if (it.type !== 'animation' || !u.pathname.split('/').includes(FOLDER)) continue;
      const v = u.searchParams.get('variant') || VARIANTS[0].id;
      if (!map[v]) map[v] = it.id;
    }
    return map;
  })
  .catch((e) => { console.error(new Error('export: the gallery manifest could not be read', { cause: e })); return {}; }));
// whether a render is there, probed once per file
const probes = new Map();
const exists = (href) => {
  if (!probes.has(href)) probes.set(href, fetch(href, { method: 'HEAD' }).then((r) => r.ok).catch(() => false));
  return probes.get(href);
};

// mount the button at the end of the speed pill
export function mountExport(pill) {
  const a = document.createElement('a');
  a.className = 'vs-export';
  a.setAttribute('role', 'button');
  a.innerHTML = `${GLYPH}<span>Export</span>`;
  pill.appendChild(a);
  const text = a.querySelector('span');
  let run = 0;

  // with no offline render here, a press renders one (live); `live` says which the button does now
  let live = false;
  async function sync() {
    if (busy()) return; // a render owns the label until it ends (a variant or ratio pick stops it)
    const key = (window.AR && window.AR.key) || '16x9', v = variant(), mine = ++run;
    a.removeAttribute('href');
    a.setAttribute('aria-busy', 'true');
    const id = (await idsOf())[v];
    const href = id ? new URL(`assets/video/${id}.${key}.mp4`, ROOT).href : '';
    const ok = !!href && (await exists(href));
    if (mine !== run || busy()) return; // a later variant or ratio pick won
    a.removeAttribute('aria-busy');
    live = !ok && canRender();
    a.classList.toggle('off', !ok && !live);
    if (ok) {
      a.href = href;
      a.download = `${id}-${key}.mp4`;
      a.removeAttribute('aria-disabled');
      text.textContent = 'Export';
      a.title = `Download this variant at ${LABEL[key]} (${SIZE[key]} MP4, with sound)`;
    } else if (live) {
      const [w, h] = outSize();
      a.removeAttribute('download');
      a.removeAttribute('aria-disabled');
      text.textContent = 'Export';
      a.title = `Render this variant at ${LABEL[key] || key} here and save it (${w}×${h} MP4, 30 fps, no sound)`;
    } else {
      a.removeAttribute('download');
      a.setAttribute('aria-disabled', 'true');
      text.textContent = 'No render';
      a.title = `This variant has no ${LABEL[key]} render yet, and this browser cannot render one (no WebCodecs)`;
    }
  }

  // the live render: the label counts it up, then the file is saved and the button goes back to Export
  async function renderHere() {
    a.setAttribute('aria-busy', 'true');
    text.textContent = 'Rendering…';
    let after = 'Saved';
    try {
      // the sound pass plays the spot through at 1x first (keep this tab in front), then the frames are painted
      const res = await render({ onProgress: (p, phase) => { text.textContent = `${phase === 'sound' ? 'Recording sound' : 'Rendering'} ${Math.round(p * 100)}%`; } });
      download(res.blob, fileName(res));
      console.info(`export: ${res.variant} ${res.width}x${res.height}, ${res.frames} frames, ${res.seconds.toFixed(1)}s, ${(res.blob.size / 1e6).toFixed(1)} MB, sound ${res.audio || 'none'}, ${res.missing} bitmap(s) missing`);
    } catch (e) {
      after = 'Export failed';
      console.error(new Error('export: the render failed', { cause: e }));
    }
    a.removeAttribute('aria-busy');
    text.textContent = after;
    setTimeout(() => { if (!busy()) sync(); }, 2500);
  }

  // Space and Enter press the button, not the spot's clock (timeline.9b47fc30.js); a mouse press drops focus after
  a.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.stopPropagation();
    if (e.key === ' ') { e.preventDefault(); a.click(); }
  });
  a.addEventListener('click', (e) => {
    if (e.detail > 0) a.blur();
    if (a.href) return; // an offline render: the link saves it
    e.preventDefault();
    if (live && !busy()) renderHere();
  });
  addEventListener('variantchange', sync);
  addEventListener('archange', sync);
  sync();
}
