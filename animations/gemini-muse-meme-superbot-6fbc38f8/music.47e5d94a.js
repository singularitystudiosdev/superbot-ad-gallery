// The multicat cut's soundtrack pick, kept in ?music= like the variant and picked from the Music pill
// (variant-select.9e82faf1.js). 'bed' (the default) is the ElevenLabs bed under the chat (beats/bed.47e5d94a.js); v1 to v5
// are five soundtracks made for the spot in five separate chats from the same silent cut, each told only to add sound
// (media/multicat.516afb1a/CREDITS.txt names each one's makers and parts); 'none' leaves the song alone. Each soundtrack
// plays, shows its own sound pill and unlocks audio only while it is the pick; a pick fires 'musicchange', which each one
// answers as it does 'variantchange'.
export const MUSICS = [
  { id: 'bed', label: 'ElevenLabs bed' },
  { id: 'v1', label: '1 · Synth bed' },
  { id: 'v2', label: '2 · Band + effects' },
  { id: 'v3', label: '3 · Ad campaign nods' },
  { id: 'v4', label: '4 · Hit-synced score' },
  { id: 'v5', label: '5 · Broadcast mix' },
  { id: 'none', label: 'None (song only)' },
];
const IDS = new Set(MUSICS.map((m) => m.id));
const DEFAULT = 'bed';

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
