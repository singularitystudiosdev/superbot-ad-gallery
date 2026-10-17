// The multicat cut's soundtrack pick, kept in ?music= like the variant and picked from the Music pill
// (variant-select.9e82faf1.js). v5 (the default) is the broadcast mix made for the spot in its own chat from the silent cut
// (media/multicat.516afb1a/CREDITS.txt names its maker and parts); 'none' leaves the song alone. A soundtrack plays, shows
// its own controls and unlocks audio only while it is the pick; a pick fires 'musicchange', which each one answers as it
// does 'variantchange'.
export const MUSICS = [
  { id: 'v5', label: '5 · Broadcast mix' },
  { id: 'none', label: 'None (song only)' },
];
const IDS = new Set(MUSICS.map((m) => m.id));
const DEFAULT = 'v5';

let current = (() => {
  const v = new URLSearchParams(location.search).get('music');
  return IDS.has(v) ? v : DEFAULT;
})();

export const music = () => current;

// pick a soundtrack (anything else is ignored), persist it in ?music=, and tell every soundtrack
export function setMusic(id) {
  if (!IDS.has(id) || id === current) return;
  current = id;
  const u = new URL(location.href);
  if (id === DEFAULT) u.searchParams.delete('music'); else u.searchParams.set('music', id);
  history.replaceState(null, '', u);
  dispatchEvent(new CustomEvent('musicchange', { detail: id }));
}
