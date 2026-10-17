// Renders the multicat soundtrack off the main thread (multicat-mix.08050705.js posts the cues and the decoded song,
// gets the mastered stereo mix back as transferred Float32Arrays).
import { renderMix } from './multicat-score.08050705.js';

self.onmessage = (e) => {
  try {
    const out = renderMix(e.data);
    self.postMessage(out, [out.L.buffer, out.R.buffer]);
  } catch (err) {
    console.error(err);
    self.postMessage({ error: String((err && err.stack) || err) });
  }
};
