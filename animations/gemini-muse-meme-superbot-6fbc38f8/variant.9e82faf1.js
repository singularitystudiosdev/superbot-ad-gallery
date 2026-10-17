// The spot's variant: what Gemini makes for the ask, '1' (one meme card), '10' (ten at once), '3d' (a 3D zombie
// model), 'game' (a zombie runner Gemini codes, then boots), 'doordash', where superbot routes to DoorDash and orders a burger instead, or 'lawn',
// where Maps connects to find the address the ask names and Gemini then adds a garden to that front lawn
// (scenes/tabs-assets/beats/lawn.f5e1d276.js), or 'multicat', four asks in one chat, each on its own tool: a GPT Image 2 cat photo, a
// Meshy 3D cat that walks, cat food from DoorDash and an ElevenLabs cat song (scenes/tabs-assets/beats/multicat.516afb1a.js), or
// 'multicat-credits', that chain with no model switches on show, each generation landing with the credits it used, or 'multidog',
// the same four tools for a dog (scenes/tabs-assets/beats/multidog.7b007b09.js), or 'multidog-credits', the
// multicat-credits chain cut for that dog (multicat.516afb1a.js bareDog), or 'college', a student's research study cut
// like multicat-credits: 250 calls to a stratified random sample, the results as a Google Slides deck, then that deck talked
// through in the student's own voice (scenes/tabs-assets/beats/college.057e3dda.js), or 'amazon-costumes', the multicat-credits chat asked to find the
// cheapest, most fun Halloween costumes on Amazon, answered with six real listings
// (scenes/tabs-assets/beats/costumes.34c23b1d.js), or 'halloween-shopping', that cut's look for two shopping asks: the
// cheapest king size Halloween candy bought on Amazon, then three small pumpkin costumes on Temu
// (scenes/tabs-assets/beats/halloween.37ff9e93.js), or 'garmin-strava', superbot connecting Garmin and then posting the
// next morning's run to Strava by itself, no model on show (scenes/tabs-assets/beats/garmin-strava.7a48d642.js). Read
// from ?variant= so a frozen
// frame (?t=) keeps it; the top-right selector (variant-select.9e82faf1.js) changes it live, without a reload, and the
// beats read it every frame.
const KEY = 'variant';
export const VARIANTS = [
  { id: '1', label: '1 image' }, { id: '10', label: '10 images' }, { id: '3d', label: '3D model' }, { id: 'game', label: 'Game' },
  { id: 'doordash', label: 'DoorDash order' },
  { id: 'garden', label: 'Garden template' },
  { id: 'roadtrip', label: 'Road trip map' },
  { id: 'climbing', label: 'Climbing videos' },
  { id: 'catsurf', label: 'Cat surfing video' },
  { id: 'catsurf10', label: '10 cat surfing videos' },
  { id: 'catgif', label: 'Dancing cat GIF' },
  { id: 'logo', label: 'Coffee logo' },
  { id: 'song', label: 'Dog song' },
  { id: 'bedtime', label: 'Bedtime story' },
  { id: 'podcast', label: 'Space podcast' },
  { id: 'pitchdeck', label: 'Pitch deck' },
  { id: 'spending', label: 'Spending chart' },
  { id: 'traderjoes', label: "Trader Joe's list" },
  { id: 'skydio', label: 'Skydio slide' },
  { id: 'bakery', label: 'Bakery website' },
  { id: 'reminder', label: 'Phone notification' },
  { id: 'computer-control-v3-soft', label: 'Computer Control V3 · Soft Vignette' },
  { id: 'photoedit', label: 'Photo edit' },
  { id: 'lawn', label: 'Front lawn garden' },
  { id: 'multicat', label: 'Multi-tool cat' },
  { id: 'multicat-credits', label: 'Multi-tool cat · credits only' },
  { id: 'multidog', label: 'Multi-tool dog' },
  { id: 'multidog-credits', label: 'Multi-tool dog · credits only' },
  { id: 'college', label: 'College research study' },
  { id: 'amazon-costumes', label: 'Amazon Halloween costumes' },
  { id: 'halloween-shopping', label: 'Halloween shopping · Amazon + Temu' },
  { id: 'garmin-strava', label: 'Garmin runs to Strava' },
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
