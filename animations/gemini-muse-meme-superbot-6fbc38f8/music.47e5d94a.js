// The multicat cut's soundtrack pick, kept in ?music= like the variant and picked from the Music pill
// (variant-select.9e82faf1.js). v5 (the default) is the broadcast mix made for the spot in its own chat from the silent cut
// (media/multicat.516afb1a/CREDITS.txt names its maker and parts); 'none' leaves the song alone. A soundtrack plays, shows
// its own controls and unlocks audio only while it is the pick; a pick fires 'musicchange', which each one answers as it
// does 'variantchange'. `only` names the one variant a soundtrack was made for: elsewhere it is not offered, and while it
// is the pick there, the default plays instead.
import { variant } from './variant.9e82faf1.js?v=3';

export const MUSICS = [
  { id: 'v5', label: '5 · Broadcast mix' },
  { id: 'v6', label: '6 · FM plucks + bells', only: 'multicat' },
  { id: 'v7', label: '7 · Minimal pulse + SFX', only: 'multicat' },
  { id: 'v8', label: '8 · Deep house bed', only: 'multicat' },
  { id: 'v9', label: '9 · Understated bed', only: 'multicat' },
  { id: 'v10', label: '10 · Tight synth + crisp SFX', only: 'multicat' },
  { id: 'v11', label: '11 · TV spot score', only: 'multicat' },
  { id: 'v12', label: '12 · Deliberate hits', only: 'multicat' },
  { id: 'v13', label: '13 · Crisp modern mix', only: 'multicat' },
  { id: 'v14', label: '14 · FM keys, tight low end', only: 'multicat' },
  { id: 'v15', label: '15 · Flagship film score', only: 'multicat' },
  { id: 'v16', label: '16 · Punchy premium groove', only: 'multicat' },
  { id: 'v17', label: '17 · Sharp SFX + bed', only: 'multicat' },
  { id: 'none', label: 'None (song only)' },
];
const BY_ID = new Map(MUSICS.map((m) => [m.id, m]));
const DEFAULT = 'v5';

let current = (() => {
  const v = new URLSearchParams(location.search).get('music');
  return BY_ID.has(v) ? v : DEFAULT;
})();

// whether a soundtrack is offered on the variant showing now
export const offered = (id) => { const m = BY_ID.get(id); return !!m && (!m.only || m.only === variant()); };
export const music = () => (offered(current) ? current : DEFAULT);

// pick a soundtrack (anything else is ignored), persist it in ?music=, and tell every soundtrack
export function setMusic(id) {
  if (!BY_ID.has(id) || id === current) return;
  current = id;
  const u = new URL(location.href);
  if (id === DEFAULT) u.searchParams.delete('music'); else u.searchParams.set('music', id);
  history.replaceState(null, '', u);
  dispatchEvent(new CustomEvent('musicchange', { detail: id }));
}
