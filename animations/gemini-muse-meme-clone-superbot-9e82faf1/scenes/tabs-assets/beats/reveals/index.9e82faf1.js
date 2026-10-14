// The reveal registry: one module per platform, in the order the Appear dropdown lists them (after Default). A module is
//   { id, label, source: { platform, feature, refs: [{ url, retrieved }] }, build(x, ctx) -> { root, render(t) } }
// and builds the WHOLE generation UI (container, header, status, count, timer, progress, tile layout, placeholders and
// per-tile reveal) for the 10-image variant. A new platform is one new file here plus one import and one entry below.
//   x   the beat's helpers: x.el(html), x.esc, x.img(name), x.tile(app)
//   ctx { src            the tile image URL
//         tiles          TILES: per-tile crop { zoom, origin, grade }
//         count          10
//         win(i)         [start, end] of tile i in the beat's overlapping cascade (Default's)
//         seq(i)         [start, end] of tile i in ten NON-overlapping windows splitting [win(0)[0], lastLand] evenly:
//                        landed tiles, at most one in progress, the rest placeholders
//         lastLand       the moment the last tile has landed
//         cardIn         when the card starts to enter
//         track          loads.9e82faf1.js track(promise), for image-load gating
//         gate(imgs)     track each image until it has loaded (a failed load settles and logs)  }
// render(t) is pure in t. In the landed state every image rests at its crop's own CSS (transform 'none' at zoom 1).
import chatgpt from './chatgpt.9e82faf1.js';
import gemini from './gemini.9e82faf1.js';
import sdwebui from './sdwebui.9e82faf1.js';
import krea from './krea.9e82faf1.js';
import bing from './bing-image-creator.9e82faf1.js';
import ideogram from './ideogram.9e82faf1.js';
import perplexity from './perplexity.9e82faf1.js';
import leonardo from './leonardo.9e82faf1.js';
import firefly from './firefly.9e82faf1.js';
import copilot from './copilot.9e82faf1.js';
import higgsfield from './higgsfield.9e82faf1.js';
import midjourney from './midjourney.9e82faf1.js';
import grok from './grok.9e82faf1.js';
import geminiApp from './gemini-app.9e82faf1.js';
import meta from './meta.9e82faf1.js';
import metaChat from './meta-chat.9e82faf1.js';
import kling from './kling.9e82faf1.js';
import flux from './flux.9e82faf1.js';
import recraft from './recraft.9e82faf1.js';
import luma from './luma.9e82faf1.js';
import qwen from './qwen.9e82faf1.js';
import reve from './reve.9e82faf1.js';
import canva from './canva.9e82faf1.js';
import freepik from './freepik.9e82faf1.js';
import jimeng from './jimeng.9e82faf1.js';
import hunyuan from './hunyuan.9e82faf1.js';
import jimengWeb from './jimeng-web.9e82faf1.js';
import kandinsky from './kandinsky.9e82faf1.js';
import tensorArt from './tensor-art.9e82faf1.js';
import picsart from './picsart.9e82faf1.js';
import dreamstudio from './dreamstudio.9e82faf1.js';
import hailuo from './hailuo.9e82faf1.js';
import midjourneyDiscord from './midjourney-discord.9e82faf1.js';
import chatgptDalle3 from './chatgpt-dalle3.9e82faf1.js';
import appleImagePlayground from './apple-image-playground.9e82faf1.js';
import googleWhisk from './google-whisk.9e82faf1.js';
import googleImagefx from './google-imagefx.9e82faf1.js';
import leonardoFlow from './leonardo-flow.9e82faf1.js';

export const REVEALS = [chatgpt, gemini, sdwebui, krea, bing, ideogram, perplexity, leonardo, firefly, copilot, higgsfield, midjourney, grok, geminiApp, meta, metaChat, kling, flux, recraft, luma, qwen, reve, canva, freepik, jimeng, hunyuan, jimengWeb, kandinsky, tensorArt, picsart, dreamstudio, hailuo, midjourneyDiscord, chatgptDalle3, appleImagePlayground, googleWhisk, googleImagefx, leonardoFlow];
