// A music bed on the spot's clock, through Web Audio: clips cut from one decoded track, each placed on the clock (`at`:
// the spot time its `from` plays at, until its `to`) and kept in step while the clock runs. A seek or a speed change
// restarts a clip at the right offset, a pause or a held frame silences it, and every start and stop is a short ramp, so
// none of them clicks. The caller hands each frame every clip's gain and low-pass cutoff (`mix`), which is how the bed
// steps back for another sound. Each clip starts ahead by the output latency, so what is heard matches the frame shown.
// The track loads, and the AudioContext is made, on the first sync (the multicat route's first render), never for the
// other variants. Sound waits for the browser's autoplay policy: the first click or key, or the gallery lightbox's
// { type: 'unmute' } message, starts the context. The context can also carry another sound's element (carry), so a
// fade on it works where an element's own volume is ignored (iOS).
const TC = 0.02;      // the gain and cutoff follow `mix` with this time constant (s)
const RAMP = 0.012;   // a clip's stop ramp (s)
const SLIP = 0.08;    // a clip this far off the clock (s) restarts where the clock is
const OPEN = 20000;   // a clip's cutoff when nothing muffles it (Hz)

export function makeBed(url, clips) {
  let ctx = null, buffer = null, warned = false, carried = null;
  const live = clips.map(() => null); // per clip, while it sounds: { src, filter, gain, off0, at0, rate, g, f }

  function wake() {
    if (!ctx || ctx.state === 'running') return;
    ctx.resume().catch((e) => {
      if (!warned) console.warn('multicat bed: the music waits for a click or key to play (autoplay policy)', e);
      warned = true;
    });
  }
  function stopClip(i) {
    const c = live[i];
    if (!c) return;
    const now = ctx.currentTime;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(0, now, RAMP / 3);
    c.src.stop(now + RAMP * 2);
    c.src.onended = () => { c.src.disconnect(); c.filter.disconnect(); c.gain.disconnect(); };
    live[i] = null;
  }
  const stopAll = () => { if (ctx) live.forEach((_, i) => stopClip(i)); };
  function load() {
    ctx = new AudioContext();
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((decoded) => { buffer = decoded; })
      .catch((e) => console.error(new Error(`multicat bed failed to load: ${url}`, { cause: e })));
    addEventListener('pointerdown', wake);
    addEventListener('keydown', wake);
    addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') wake(); });
    addEventListener('variantchange', stopAll);
  }
  function startClip(i, off, rate) {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    filter.type = 'lowpass';
    filter.frequency.value = OPEN;
    gain.gain.value = 0; // it ramps up to its first `mix` gain, so a start mid-track never clicks
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(0, off);
    live[i] = { src, filter, gain, off0: off, at0: ctx.currentTime, rate, g: -1, f: OPEN };
  }

  return {
    // t: the spot's clock; running: whether it runs; mix: [{ gain, cutoff }] per clip, this frame
    sync(t, running, mix) {
      if (!ctx) load();
      if (!running || !buffer || ctx.state !== 'running') { stopAll(); return; }
      const rate = (window.__AD && window.__AD.speed) || 1;
      const lead = (ctx.outputLatency || ctx.baseLatency || 0) * rate;
      clips.forEach((clip, i) => {
        const off = clip.from + (t - clip.at) + lead;
        if (off < clip.from || off >= Math.min(clip.to, buffer.duration)) { stopClip(i); return; }
        const c = live[i];
        if (c && (c.rate !== rate || Math.abs(c.off0 + (ctx.currentTime - c.at0) * rate - off) > SLIP)) stopClip(i);
        if (!live[i]) startClip(i, off, rate);
        const l = live[i], m = mix[i], now = ctx.currentTime;
        if (m.gain !== l.g) { l.gain.gain.setTargetAtTime(m.gain, now, TC); l.g = m.gain; }
        const f = m.cutoff || OPEN;
        if (f !== l.f) { l.filter.frequency.setTargetAtTime(f, now, TC); l.f = f; }
      });
    },
    // routes a media element through this context, its level then on the returned GainNode (iOS ignores an element's
    // volume). Only once the context runs, since a carried element sounds through it alone: until then, null
    carry(el) {
      if (carried) return carried;
      if (!ctx || ctx.state !== 'running') return null;
      carried = ctx.createGain();
      ctx.createMediaElementSource(el).connect(carried).connect(ctx.destination);
      return carried;
    },
    // QA: the context, whether the track is in, and where each clip is against its track
    state() {
      return {
        ctx: ctx ? ctx.state : 'none', loaded: !!buffer, carried: carried ? +carried.gain.value.toFixed(3) : null,
        clips: live.map((c) => (c ? { off: +(c.off0 + (ctx.currentTime - c.at0) * c.rate).toFixed(3), gain: +c.gain.gain.value.toFixed(3), cutoff: Math.round(c.filter.frequency.value) } : null)),
      };
    },
  };
}
