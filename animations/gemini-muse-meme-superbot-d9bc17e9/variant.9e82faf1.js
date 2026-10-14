// The spot's variant: what Gemini makes for the ask, '1' (one meme card), '10' (ten at once), '3d' (a 3D zombie
// model), 'game' (a zombie runner Gemini codes, then boots) or 'doordash', where superbot routes to DoorDash and orders a burger instead. Read from ?variant= so a frozen
// frame (?t=) keeps it; the top-right selector (variant-select.9e82faf1.js) changes it live, without a reload, and the
// beats read it every frame.
const KEY = 'variant';
export const VARIANTS = [
  { id: '1', label: '1 image' }, { id: '10', label: '10 images' }, { id: '3d', label: '3D model' }, { id: 'game', label: 'Game' },
  { id: 'doordash', label: 'DoorDash order' },
  { id: 'garden', label: 'Garden template' },
  { id: 'climbing', label: 'Climbing videos' },
  { id: 'logo', label: 'Coffee logo' },
];
const valid = (v) => VARIANTS.some((x) => x.id === v);
const asked = new URLSearchParams(location.search).get(KEY);
let current = valid(asked) ? asked : VARIANTS[0].id;

export const variant = () => current;

export function setVariant(v) {
  if (!valid(v) || v === current) return;
  current = v;
  const u = new URL(location.href);
  if (v === VARIANTS[0].id) u.searchParams.delete(KEY); else u.searchParams.set(KEY, v);
  history.replaceState(null, '', u);
  dispatchEvent(new CustomEvent('variantchange', { detail: v }));
}
