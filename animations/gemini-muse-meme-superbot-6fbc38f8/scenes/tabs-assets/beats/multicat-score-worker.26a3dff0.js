// Renders the multicat score off the main thread (about a second of DSP) from the cue sheet it is sent, and hands the
// two channels back as transferred buffers (multicat-sound.26a3dff0.js).
import { renderScore } from './multicat-score.26a3dff0.js';

self.onmessage = ({ data }) => {
  try {
    const { L, R, sr, stats } = renderScore(data);
    self.postMessage({ L, R, sr, stats }, [L.buffer, R.buffer]);
  } catch (e) {
    console.error(e);
    self.postMessage({ error: String((e && e.stack) || e) });
  }
};
