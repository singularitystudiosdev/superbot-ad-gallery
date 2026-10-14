// What the 10-image variant's beat (gemini.9b47fc30.js) needs from the appear machinery besides the reveal modules
// (reveals/index.9e82faf1.js, one per platform, each drawing its own whole UI):
//  - makeTileFx: the Default grid's tile rest states. The Default cascade's resolve() runs in the beat for 0 < p < 1; this
//    holds the two ends, an empty slot (p <= 0) and the landed tile (p >= 1, sharp, graded, unclipped), in the exact CSS
//    the grid has always rested in.
//  - gateImages: a frozen ?t= capture waits on __AD.ready (loads.9e82faf1.js), so a reveal module's tile images are tracked
//    until they have loaded and (in a frozen capture) settled; a failed load settles too and is logged. loads.9e82faf1.js
//    gateTiles does the work, and says why it never calls img.decode().
import { gateTiles } from '../../../loads.9e82faf1.js';

export function makeTileFx(im, gen, g) {
  const rest = (opacity) => {
    im.style.opacity = opacity.toFixed(3);
    im.style.filter = g.grade || 'none';
    im.style.transform = g.zoom === 1 ? 'none' : `scale(${g.zoom.toFixed(4)})`;
    im.style.clipPath = '';
    gen.style.opacity = '0';
    gen.style.transform = ''; // the band's resolve() position is not carried into a rest state: a seeked page equals a fresh load
  };
  return {
    // paints the tile's resting end at progress p and returns true; false when the beat should run resolve() (0 < p < 1)
    draw(p) {
      im.style.clipPath = '';
      if (p <= 0) { rest(0); return true; }
      if (p >= 1) { rest(1); return true; }
      return false;
    },
  };
}

export function gateImages(imgs) {
  // decode-free, and in a frozen ?t= capture the tiles are held out of the first paint until they have settled: see gateTiles in loads.9e82faf1.js
  gateTiles(imgs);
}
