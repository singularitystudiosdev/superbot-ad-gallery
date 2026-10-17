/* audio-tap.057e3dda.js: lets Export (export.64039673.js) record what the spot sounds like from inside the page, with no
   tab to share. Each cut makes its sound its own way (audio elements, scores rendered into buffers, synthesised effects, in
   several AudioContexts), so the tap takes it where every one of them ends: a Web Audio node connected to a real-time
   context's speakers, or a media element that plays. A plain script loaded before every module, it only NOTES those as they
   happen; nothing about how they sound changes. While a take runs (window.__AUDIO_TAP.start()), every noted source also
   feeds one recorder in a context of its own that never plays aloud: a node through a MediaStreamDestination of its own
   context, an element through captureStream(), which ignores the element's volume and mute, so a gain beside it follows
   them every frame. A node disconnected from its speakers stops being heard, so it stops being noted (and tapped).
   stop() resolves with the take as a Blob. */
(function () {
  'use strict';
  if (!window.AudioContext || !window.MediaRecorder || !window.AudioNode) return;
  var log = function (msg, e) { console.error(new Error('audio-tap: ' + msg, e ? { cause: e } : undefined)); };
  var noted = [];             // WeakRefs to nodes connected to a real-time destination
  var elements = new Set();   // media elements that have played
  var routed = new WeakSet(); // elements a page graph reads (createMediaElementSource): heard, and tapped, through that graph
  var take = null;

  var Offline = window.OfflineAudioContext;
  var live = function (node) { return !(Offline && node.context instanceof Offline); };
  var proto = AudioNode.prototype, connect = proto.connect, disconnect = proto.disconnect;

  proto.connect = function (dest) {
    var out = connect.apply(this, arguments);
    try {
      if (dest instanceof AudioDestinationNode && live(this)) {
        noted.push(new WeakRef(this));
        if (noted.length > 2000) noted = noted.filter(function (r) { return r.deref(); });
        if (take) tapNode(this);
      }
    } catch (e) { log('a connection was not noted', e); }
    return out;
  };
  proto.disconnect = function (dest) {
    var out = disconnect.apply(this, arguments);
    try {
      if (arguments.length === 0 || dest instanceof AudioDestinationNode) {
        var self = this;
        noted = noted.filter(function (r) { return r.deref() !== self; });
        if (take && take.taps.has(this)) { try { disconnect.call(this, take.taps.get(this)); } catch (e) { /* already gone */ } take.taps.delete(this); }
      }
    } catch (e) { log('a disconnection was not noted', e); }
    return out;
  };
  var ctxProto = (window.BaseAudioContext || window.AudioContext).prototype, mes = ctxProto.createMediaElementSource;
  if (mes) ctxProto.createMediaElementSource = function (el) { routed.add(el); return mes.apply(this, arguments); };
  var play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    elements.add(this);
    if (take) tapElement(this);
    return play.apply(this, arguments);
  };

  // a node's sound, into the take: through a MediaStreamDestination of the node's own context, bridged into the mixer once
  function tapNode(node) {
    if (take.taps.has(node)) return;
    try {
      var ctx = node.context, d = take.dests.get(ctx);
      if (!d) {
        d = ctx.createMediaStreamDestination();
        take.dests.set(ctx, d);
        take.mix.createMediaStreamSource(d.stream).connect(take.out);
      }
      connect.call(node, d);
      take.taps.set(node, d);
    } catch (e) { log('a node could not be tapped', e); }
  }
  // an element's sound, into the take: captureStream() at the element's own volume (followed every frame)
  function tapElement(el) {
    if (routed.has(el) || take.seen.has(el) || !el.captureStream) return;
    take.seen.add(el);
    try {
      var s = el.captureStream();
      var hook = function () {
        if (!take || !s.getAudioTracks().length) return false;
        var g = take.mix.createGain();
        take.mix.createMediaStreamSource(s).connect(g);
        g.connect(take.out);
        take.els.push({ el: el, g: g });
        return true;
      };
      // an element that has not loaded yet has no audio track: it arrives with its metadata
      if (!hook()) s.addEventListener('addtrack', function on() { if (hook()) s.removeEventListener('addtrack', on); });
    } catch (e) { log('an element could not be tapped', e); }
  }
  function follow() {
    if (!take) return;
    for (var i = 0; i < take.els.length; i++) { var x = take.els[i]; x.g.gain.value = x.el.muted ? 0 : x.el.volume; }
    take.raf = requestAnimationFrame(follow);
  }

  window.__AUDIO_TAP = {
    // starts a take; resolves with the moment (performance.now()) its recorder started
    start: function () {
      if (take) return Promise.reject(new Error('audio-tap: a take is already running'));
      var mix = new AudioContext({ sampleRate: 48000 });
      var out = mix.createMediaStreamDestination();
      // a silent source keeps the take's stream flowing from its first instant: a recorder that only began writing at the
      // spot's first sound would start the file there, and every sound after it would land early
      var keep = mix.createConstantSource();
      keep.offset.value = 0;
      connect.call(keep, out);
      keep.start();
      take = { mix: mix, out: out, dests: new Map(), taps: new Map(), els: [], seen: new WeakSet(), parts: [], raf: 0 };
      noted.forEach(function (r) { var n = r.deref(); if (n) tapNode(n); });
      elements.forEach(tapElement);
      follow();
      var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].filter(function (m) { return MediaRecorder.isTypeSupported(m); })[0] || '';
      var rec = take.rec = new MediaRecorder(out.stream, mime ? { mimeType: mime, audioBitsPerSecond: 256000 } : {});
      var parts = take.parts;
      rec.ondataavailable = function (e) { if (e.data.size) parts.push(e.data); };
      // the take is timed from start() itself: the recorder is recording from that call, and its 'start' event is not
      // something to wait on (headless Chrome never fires it for an audio-only stream)
      return mix.resume().then(function () { rec.start(250); return performance.now(); });
    },
    // ends the take: every tap is undone and the mixer closed; resolves with the recording
    stop: function () {
      if (!take) return Promise.reject(new Error('audio-tap: no take is running'));
      var t = take;
      return new Promise(function (res) { t.rec.onstop = res; t.rec.stop(); }).then(function () {
        take = null;
        cancelAnimationFrame(t.raf);
        t.taps.forEach(function (d, node) { try { disconnect.call(node, d); } catch (e) { /* already gone */ } });
        t.els.forEach(function (x) { try { x.g.disconnect(); } catch (e) { /* already gone */ } });
        t.mix.close();
        return new Blob(t.parts, { type: t.rec.mimeType || 'audio/webm' });
      });
    },
    get running() { return !!take; },
  };
})();
