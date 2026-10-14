// The 10-image variant's appear style: how each of Gemini's ten generations arrives as they land one after another
// (scenes/tabs-assets/beats/appear-fx.9e82faf1.js draws each). Read from ?appear= so a frozen frame (?t=) keeps it;
// the sub-selector under the variant selector (variant-select.9e82faf1.js), shown only on the '10' variant, changes it
// live, without a reload, and the beat reads it every frame. Kept apart from variant.9e82faf1.js, which other variants
// extend. Every style ends on the same landed tile: the full-colour image, sharp, unclipped, at rest.
const KEY = 'appear';
export const APPEARS = [
  { id: 'default', label: 'Default' },          // the 1-image card's resolve: blur and desaturation clear under a sweeping band
  { id: 'granular', label: 'B&W granular' },    // 1-bit black-and-white granules (a dither) dissolve in at random, then colour floods in
  { id: 'grain', label: 'B&W grain' },          // a high-contrast monochrome print develops under heavy film grain, then colour returns
  { id: 'focus', label: 'Focus + size clip' },  // out of focus to in focus while it scales down inside a clip that opens to the tile
  { id: 'pixelate', label: 'Pixelate' },        // a mosaic halves its block size step by step down to full resolution
  { id: 'denoise', label: 'Denoise' },          // diffusion-style: colour noise clears in discrete steps as the image sharpens
  { id: 'scan', label: 'Scan line' },           // revealed top to bottom behind a bright Gemini-gradient scan line
  { id: 'iris', label: 'Iris' },                // a circle opens from the centre
  { id: 'glitch', label: 'Glitch' },            // RGB-split slices jitter and settle into place
];
const valid = (v) => APPEARS.some((x) => x.id === v);
const asked = new URLSearchParams(location.search).get(KEY);
let current = valid(asked) ? asked : APPEARS[0].id;

export const appear = () => current;

export function setAppear(v) {
  if (!valid(v) || v === current) return;
  current = v;
  const u = new URL(location.href);
  if (v === APPEARS[0].id) u.searchParams.delete(KEY); else u.searchParams.set(KEY, v);
  history.replaceState(null, '', u);
  dispatchEvent(new CustomEvent('appearchange', { detail: v }));
}
