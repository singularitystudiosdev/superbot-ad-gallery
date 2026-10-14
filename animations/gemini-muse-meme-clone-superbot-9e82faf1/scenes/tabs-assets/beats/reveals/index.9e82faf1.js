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
import artbreeder from './artbreeder.9e82faf1.js';
import kolors from './kolors.9e82faf1.js';
import tongyiWanxiang from './tongyi-wanxiang.9e82faf1.js';
import wenxinYige from './wenxin-yige.9e82faf1.js';
import yuanbao from './yuanbao.9e82faf1.js';
import capcut from './capcut.9e82faf1.js';
import whatsappImagine from './whatsapp-imagine.9e82faf1.js';
import snapchatDreams from './snapchat-dreams.9e82faf1.js';
import seaart from './seaart.9e82faf1.js';
import comfyui from './comfyui.9e82faf1.js';
import fooocus from './fooocus.9e82faf1.js';
import ideogramCanvas from './ideogram-canvas.9e82faf1.js';
import mistralLeChat from './mistral-le-chat.9e82faf1.js';
import pixelStudio from './pixel-studio.9e82faf1.js';
import womboDream from './wombo-dream.9e82faf1.js';
import runway from './runway.9e82faf1.js';
import craiyon from './craiyon.9e82faf1.js';
import playground from './playground.9e82faf1.js';
import geminiMobile from './gemini-mobile.9e82faf1.js';
import nightcafe from './nightcafe.9e82faf1.js';
import higgsfieldStudio from './higgsfield-studio.9e82faf1.js';
import photoshopGenerativeFill from './photoshop-generative-fill.9e82faf1.js';
import invokeai from './invokeai.9e82faf1.js';
import getimg from './getimg.9e82faf1.js';
import starryai from './starryai.9e82faf1.js';
import mewxai from './mewxai.9e82faf1.js';
import zhipuQingyan from './zhipu-qingyan.9e82faf1.js';
import chatgptImages2 from './chatgpt-images-2.9e82faf1.js';
import drawThings from './draw-things.9e82faf1.js';
import diffusionbee from './diffusionbee.9e82faf1.js';
import mageSpace from './mage-space.9e82faf1.js';
import samsungGalaxyAi from './samsung-galaxy-ai.9e82faf1.js';
import dreamina from './dreamina.9e82faf1.js';
import bingImageCreator2026 from './bing-image-creator-2026.9e82faf1.js';
import ernieBot from './ernie-bot.9e82faf1.js';
import lensa from './lensa.9e82faf1.js';
import fotor from './fotor.9e82faf1.js';
import dzine from './dzine.9e82faf1.js';
import clipdrop from './clipdrop.9e82faf1.js';
import stableAssistant from './stable-assistant.9e82faf1.js';
import hotpot from './hotpot.9e82faf1.js';
import perchance from './perchance.9e82faf1.js';
import poe from './poe.9e82faf1.js';
import envatoImagegen from './envato-imagegen.9e82faf1.js';
import kittl from './kittl.9e82faf1.js';
import deepai from './deepai.9e82faf1.js';
import huggingchat from './huggingchat.9e82faf1.js';
import shutterstockAi from './shutterstock-ai.9e82faf1.js';
import pixlr from './pixlr.9e82faf1.js';
import scenario from './scenario.9e82faf1.js';
import zhihui360 from './360-zhihui.9e82faf1.js';
import snapchatAiSnaps from './snapchat-ai-snaps.9e82faf1.js';
import googlePhotosCreate from './google-photos-create.9e82faf1.js';
import yodayo from './yodayo.9e82faf1.js';
import adobeExpress from './adobe-express.9e82faf1.js';
import istockAiGenerator from './istock-ai-generator.9e82faf1.js';
import figmaMakeImage from './figma-make-image.9e82faf1.js';
import powerpointCopilot from './powerpoint-copilot.9e82faf1.js';
import googleSlidesVisualize from './google-slides-visualize.9e82faf1.js';
import youComCreate from './you-com-create.9e82faf1.js';
import dreaminaIntl from './dreamina-intl.9e82faf1.js';
import piclumen from './piclumen.9e82faf1.js';
import wixAiImage from './wix-ai-image.9e82faf1.js';
import remini from './remini.9e82faf1.js';
import canvaDreamLab from './canva-dream-lab.9e82faf1.js';
import imagineAi from './imagine-ai.9e82faf1.js';
import wonderAi from './wonder-ai.9e82faf1.js';
import photoroom from './photoroom.9e82faf1.js';
import leonardoRealtimeCanvas from './leonardo-realtime-canvas.9e82faf1.js';
import ideogramMobile from './ideogram-mobile.9e82faf1.js';
import hfSpacesGradio from './hf-spaces-gradio.9e82faf1.js';
import replicate from './replicate.9e82faf1.js';
import googleAiStudio from './google-ai-studio.9e82faf1.js';
import openaiPlaygroundImages from './openai-playground-images.9e82faf1.js';
import azureAiFoundryImages from './azure-ai-foundry-images.9e82faf1.js';
import awsBedrockImagePlayground from './aws-bedrock-image-playground.9e82faf1.js';
import instagramImagine from './instagram-imagine.9e82faf1.js';
import adobeStockGenerate from './adobe-stock-generate.9e82faf1.js';
import doubao from './doubao.9e82faf1.js';
import kakaoKarlo from './kakao-karlo.9e82faf1.js';
import wrtn from './wrtn.9e82faf1.js';
import quarkAi from './quark-ai.9e82faf1.js';
import motorolaImageStudio from './motorola-image-studio.9e82faf1.js';
import dalle2Labs from './dalle2-labs.9e82faf1.js';
import jasperArt from './jasper-art.9e82faf1.js';
import gencraft from './gencraft.9e82faf1.js';
import lexicaAperture from './lexica-aperture.9e82faf1.js';
import dezgo from './dezgo.9e82faf1.js';
import photoleap from './photoleap.9e82faf1.js';
import windowsPhotosImageCreator from './windows-photos-image-creator.9e82faf1.js';
import miroAiImage from './miro-ai-image.9e82faf1.js';
import googleAdsImageGen from './google-ads-image-gen.9e82faf1.js';
import visualElectric from './visual-electric.9e82faf1.js';
import xiaomiHyperai from './xiaomi-hyperai.9e82faf1.js';
import fireflyMobile from './firefly-mobile.9e82faf1.js';
import vistacreateAi from './vistacreate-ai.9e82faf1.js';
import oppoAiStudio from './oppo-ai-studio.9e82faf1.js';

export const REVEALS = [chatgpt, gemini, sdwebui, krea, bing, ideogram, perplexity, leonardo, firefly, copilot, higgsfield, midjourney, grok, geminiApp, meta, metaChat, kling, flux, recraft, luma, qwen, reve, canva, freepik, jimeng, hunyuan, jimengWeb, kandinsky, tensorArt, picsart, dreamstudio, hailuo, midjourneyDiscord, chatgptDalle3, appleImagePlayground, googleWhisk, googleImagefx, leonardoFlow, artbreeder, kolors, tongyiWanxiang, wenxinYige, yuanbao, capcut, whatsappImagine, snapchatDreams, seaart, comfyui, fooocus, ideogramCanvas, mistralLeChat, pixelStudio, womboDream, runway, craiyon, playground, geminiMobile, nightcafe, higgsfieldStudio, photoshopGenerativeFill, invokeai, getimg, starryai, mewxai, zhipuQingyan, chatgptImages2, drawThings, diffusionbee, mageSpace, samsungGalaxyAi, dreamina, bingImageCreator2026, ernieBot, lensa, fotor, dzine, clipdrop, stableAssistant, hotpot, perchance, poe, envatoImagegen, kittl, deepai, huggingchat, shutterstockAi, pixlr, scenario, zhihui360, snapchatAiSnaps, googlePhotosCreate, yodayo, adobeExpress, istockAiGenerator, figmaMakeImage, powerpointCopilot, googleSlidesVisualize, youComCreate, dreaminaIntl, piclumen, wixAiImage, remini, canvaDreamLab, imagineAi, wonderAi, photoroom, leonardoRealtimeCanvas, ideogramMobile, hfSpacesGradio, replicate, googleAiStudio, openaiPlaygroundImages, azureAiFoundryImages, awsBedrockImagePlayground, instagramImagine, adobeStockGenerate, doubao, kakaoKarlo, wrtn, quarkAi, motorolaImageStudio, dalle2Labs, jasperArt, gencraft, lexicaAperture, dezgo, photoleap, windowsPhotosImageCreator, miroAiImage, googleAdsImageGen, visualElectric, xiaomiHyperai, fireflyMobile, vistacreateAi, oppoAiStudio];
