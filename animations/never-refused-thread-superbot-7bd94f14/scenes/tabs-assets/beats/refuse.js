// ChatGPT's beat: the refusal streams, a red "Refused" tag lands under it and the line shudders once.
// Pure function of t (the tabs scene's local time).
import { lerp, seg, clamp, outCubic, outBack, streamCount } from '../../../lib.js';

const SAY = 'I’m sorry, but I can’t help with that.';
const CPS = 40;

export default {
  times(r) {
    const T = { r };
    T.s0 = r + 0.1;
    T.s1 = T.s0 + SAY.length / CPS;
    T.tag = T.s1 + 0.3;
    T.end = T.tag + 1.15;
    return T;
  },
  build(k, x) {
    const T = k.T;
    const say = x.el(`<div class="qc-say nr-no"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const tag = x.el('<span class="nr-refused"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>Refused</span>');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1;
    return {
      nodes: [say, tag],
      marks: [[T.r, say], [T.tag, tag]],
      render(t) {
        const n = streamCount(SAY, T.s0, CPS, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const p = seg(t, T.tag, T.tag + 0.42);
        tag.style.opacity = outCubic(clamp(p * 2.2)).toFixed(3);
        tag.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.55, 1, outBack(p)).toFixed(4)})`;
        // the refusal line shudders as the tag lands, then sits a little dimmer
        const sh = seg(t, T.tag, T.tag + 0.5);
        say.style.transform = sh > 0 && sh < 1 ? `translateX(${(Math.sin(sh * Math.PI * 6) * (1 - sh) * 7).toFixed(2)}px)` : 'none';
        say.style.opacity = lerp(1, 0.62, seg(t, T.tag + 0.5, T.end)).toFixed(3);
      },
    };
  },
};
