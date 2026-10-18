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
// (scenes/tabs-assets/beats/halloween.37ff9e93.js), or 'hotelcall', cut as multicat-credits is, where superbot phones the
// hotel and moves the stay (scenes/tabs-assets/beats/hotelcall.f934b5ee.js), or 'refund', superbot calling support
// for a refund, emailing them while it holds and posting a 1-star review everywhere
// (scenes/tabs-assets/beats/refund.d3537b02.js)., or 'discord-credits', two asks cut like
// multicat-credits: a breakdown of the emojis the user sends most on Discord, then a GIF of a dancing frog made and sent
// to a friend in a Discord DM (scenes/tabs-assets/beats/discord.bccc0fdd.js), or 'studyguide', one ask told the way the credits cut tells its four:
// superbot reads the user's Google Classroom, then writes them a study guide as a Google Doc
// (scenes/tabs-assets/beats/studyguide.40e96f96.js), or 'koala-discord', a koala GIF sent to mrmoonshot on Discord,
// then a koala reaction on every message of his (scenes/tabs-assets/beats/koala.7f80a09a.js), or 'yt-thumbnail', a
// creator's demo paced for a voiceover, with no model on show: superbot reads the channel's latest video, makes three
// thumbnails for it, then uploads them to YouTube as an A/B test (scenes/tabs-assets/beats/ytthumb.c4e81a27.js)., or 'hacker', the hooded-mascot
// spot's montage: a live call, an image, a 3D model and apps connected with no MCP, each on its voiceover phrase
// (scenes/tabs-assets/beats/hacker.7dfcf32a.js), or 'voiceclone-call', cut as the hotel call is: superbot asks for one
// short take of the user's voice, clones it, then calls 30351235 in that voice (scenes/tabs-assets/beats/voiceclone.6ba3a0f8.js).
// Read from ?variant= so a frozen
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
  { id: 'hotelcall', label: 'Hotel call' },
  { id: 'garmin-strava', label: 'Garmin runs to Strava' }, // superbot connects Garmin, then posts the next morning's run to Strava by itself (scenes/tabs-assets/beats/garmin-strava.7a48d642.js)
  { id: 'refund', label: 'Refund call + 1-star reviews' },
  { id: 'discord-credits', label: 'Discord emojis + frog GIF · credits only' },
  { id: 'studyguide', label: 'Classroom study guide' },
  { id: 'koala-discord', label: 'Koala GIF + reactions on Discord' }, // a koala GIF sent to mrmoonshot, then a koala reaction on every message of his (scenes/tabs-assets/beats/koala.7f80a09a.js)
  { id: 'yt-thumbnail', label: 'YouTube thumbnail + A/B test · voiceover' }, // three thumbnails for the latest video, then uploaded as a YouTube A/B test (scenes/tabs-assets/beats/ytthumb.c4e81a27.js)
  { id: 'hacker', label: 'Hacker ad · calls, image, 3D, apps' }, // the hooded-mascot spot's montage: a live call, an image, a 3D model, apps connected with no MCP (scenes/tabs-assets/beats/hacker.7dfcf32a.js)
  { id: 'voice-clone-song', label: 'Voice clone song' }, // a voice sample recorded and cloned, then a song sung in that voice (scenes/tabs-assets/beats/voiceclone.986a9320.js)
  { id: 'voiceclone-call', label: 'Voice clone call' }, // one tap records the user's voice, superbot clones it and calls 30351235 in that voice, saying it is their AI (scenes/tabs-assets/beats/voiceclone.6ba3a0f8.js)
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
