/* audio-tap: where the spot's sound comes out, so the Export button (export.64039673.js) can record it. The spot has no
   one audio path: the v16 scores play through the sound gate's AudioContext (sound.96834de7.js), other soundtracks keep
   contexts of their own, and the songs and calls are <audio> elements. This notes, from before any of them exists, every
   node that is connected to an AudioContext's speakers and every media element that plays; it changes nothing about how
   they play. A classic script in <head>, ahead of the modules, so no context is connected before the note is taken.
   window.__TAP = { outs: Map(AudioContext -> Set(node)), media: Set(element), on(fn) -> off }: fn('node', node) or
   fn('media', element) as each new one appears. */
(function () {
  'use strict';
  var outs = new Map();
  var media = new Set();
  var listeners = new Set();
  var tell = function (kind, x) {
    listeners.forEach(function (fn) {
      try { fn(kind, x); } catch (e) { console.error(new Error('audio-tap: a listener failed', { cause: e })); }
    });
  };

  var connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest) {
    var out = connect.apply(this, arguments);
    var ctx = this.context;
    // a live context's speakers only: an OfflineAudioContext renders a buffer, which the player then plays live
    if (dest && ctx && dest === ctx.destination && typeof AudioContext === 'function' && ctx instanceof AudioContext) {
      var set = outs.get(ctx);
      if (!set) outs.set(ctx, (set = new Set()));
      if (!set.has(this)) { set.add(this); tell('node', this); }
    }
    return out;
  };
  var disconnect = AudioNode.prototype.disconnect;
  AudioNode.prototype.disconnect = function (dest) {
    var set = this.context && outs.get(this.context);
    if (set && (arguments.length === 0 || dest === this.context.destination)) set.delete(this);
    return disconnect.apply(this, arguments);
  };

  var play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!media.has(this)) { media.add(this); tell('media', this); }
    return play.apply(this, arguments);
  };

  window.__TAP = {
    outs: outs,
    media: media,
    on: function (fn) { listeners.add(fn); return function () { listeners.delete(fn); }; },
  };
})();
