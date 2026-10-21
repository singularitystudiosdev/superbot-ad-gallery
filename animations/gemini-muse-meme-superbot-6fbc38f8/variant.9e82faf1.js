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
// (scenes/tabs-assets/beats/hacker.7dfcf32a.js), or 'hacker-hello', the "Hello AI users" spot's: the same call, image and
// 3D model, then a theme song and the MCP row as its own card (the same module's `hello`; 'hacker-hello-pc' with computer
// control in the call's place, `helloPc`), or 'voiceclone-call', cut as
// the hotel call is: superbot asks for one short take of the user's voice, clones it, then calls 30351235 in that voice
// (scenes/tabs-assets/beats/voiceclone.6ba3a0f8.js). Read from ?variant= so a frozen
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
  // v3-soft with superbot's progress on the overlay: the running task top right of the screen, a bar inside the frame (scenes/tabs-assets/beats/computer-progress.a05be571.js)
  { id: 'computer-control-progress-edge', label: 'Computer Control V3 · Progress: edge bar + task chip' },
  { id: 'computer-control-progress-pill', label: 'Computer Control V3 · Progress: bar in the pill + task card' },
  { id: 'computer-control-progress-steps', label: 'Computer Control V3 · Progress: step bar in the task card' },
  // the v3-soft cut carried on into a cat-video task, with a progress bar and the current task in the frame and two
  // follow-ups typed mid-run (scenes/tabs-assets/beats/progress.81e9d268.js): a top line, the search redone for kittens;
  // a step card, the pick switched mid-glide; the pill as the bar, a full screen step added
  { id: 'computer-control-v3-progress-a', label: 'Computer Control V3 · Progress + chat: line, kittens redirect' },
  { id: 'computer-control-v3-progress-b', label: 'Computer Control V3 · Progress + chat: step card, newest video' },
  { id: 'computer-control-v3-progress-c', label: 'Computer Control V3 · Progress + chat: pill, full screen added' },
  // the v3-soft live view on a looping flight search, the user's messages growing in above it as it works, superbot's
  // task and progress on the frame and, in the news looks, the cheapest fare so far (scenes/tabs-assets/beats/flightloop.97eee3b5.js)
  { id: 'flight-loop-edge-97eee3b5', label: 'Flight loop · Edge bar + task chip' },
  { id: 'flight-loop-header-97eee3b5', label: 'Flight loop · Task and bar in the header' },
  { id: 'flight-loop-pill-97eee3b5', label: 'Flight loop · Bar in the pill' },
  { id: 'flight-loop-news-corner-97eee3b5', label: 'Flight loop · Cheapest fare chip' },
  { id: 'flight-loop-news-footer-97eee3b5', label: 'Flight loop · Cheapest fare footer' },
  { id: 'flight-loop-news-header-97eee3b5', label: 'Flight loop · Cheapest fare in the header' },
  // a cheapest-flight search across three sites, the user checking in and changing the job mid-run, the live view docked under the thread; three with the cheapest fare so far on show (scenes/tabs-assets/beats/flights.92b9b0b0.js)
  { id: 'computer-control-flights-edge', label: 'Computer Control V3 · Flight loop: edge bar + task chip' },
  { id: 'computer-control-flights-pill', label: 'Computer Control V3 · Flight loop: bar in the pill + task card' },
  { id: 'computer-control-flights-head', label: 'Computer Control V3 · Flight loop: bar under the header + task chip' },
  { id: 'computer-control-flights-news-card', label: 'Computer Control V3 · Flight loop + cheapest fare: one card' },
  { id: 'computer-control-flights-news-head', label: 'Computer Control V3 · Flight loop + cheapest fare: in the header' },
  { id: 'computer-control-flights-news-left', label: 'Computer Control V3 · Flight loop + cheapest fare: top-left card' },
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
  { id: 'hacker-hello', label: 'Hacker ad · hello: calls, image, 3D, audio, no MCP' }, // the hooded mascot's "Hello AI users" spot: the same call, image and 3D model, then a theme song and the MCP row as its own card (scenes/tabs-assets/beats/hacker.7dfcf32a.js hello)
  { id: 'hacker-hello-pc', label: 'Hacker ad · hello: computer control, image, 3D, audio, no MCP' }, // the "Hello AI users" montage with computer control in the call's place: superbot takes over the screen, searches cat videos and plays one (scenes/tabs-assets/beats/hacker.7dfcf32a.js helloPc)
  { id: 'hacker-pc', label: 'Hacker ad · computer control, image, 3D, apps' }, // the announcement's montage with computer control in the call's place: superbot takes over the screen, searches cat videos and plays one, then the image, 3D model and apps (scenes/tabs-assets/beats/hacker.7dfcf32a.js computer)
  { id: 'voice-clone-song', label: 'Voice clone song' }, // a voice sample recorded and cloned, then a song sung in that voice (scenes/tabs-assets/beats/voiceclone.986a9320.js)
  { id: 'voiceclone-call', label: 'Voice clone call' }, // one tap records the user's voice, superbot clones it and calls 30351235 in that voice, saying it is their AI (scenes/tabs-assets/beats/voiceclone.6ba3a0f8.js)
  { id: 'cats-chatbot', label: 'Cats: Discord GIF, 3D cat, DoorDash, song, unsubscribe' }, // five asks: a cat GIF sent to MrCatMan131 on Discord, a 3D cat, cat food on DoorDash, a cat song, then the user's other AI plans cancelled (scenes/tabs-assets/beats/cats.70783379.js)
  { id: 'gym-site', label: 'Gym website · voiceover' }, // a gym bro site built in the chat, previewed, then taking the whole frame and scrolling, with no model on show (scenes/tabs-assets/beats/gymsite.6e110402.js)
  // computer-control loops: v3-soft's live view running a job in rounds, a progress row and task HUD on the card, the
  // user's follow-ups landing above it (scenes/tabs-assets/beats/ccloop.0c0f5071.js)
  { id: 'cc-loop-thumbs', label: 'Computer control loop · thumbnail optimizer' },
  { id: 'cc-loop-comments', label: 'Computer control loop · comment replies' },
  { id: 'cc-loop-sponsors', label: 'Computer control loop · sponsor outreach' },
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
