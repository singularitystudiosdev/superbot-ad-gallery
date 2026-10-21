// The on-screen pointer: a macOS arrow (the reference spot's own path, computer.ba3976b6.js ARROW) that turns into the
// pointing hand over links and buttons, moved the way a hand moves a mouse. A move follows a gently curved path with a
// minimum-jerk speed profile, runs a few px past its target and settles back; a click dips the pointer and leaves a
// ripple at its tip. Everything is a pure function of t: build a Track once, then render(t) every frame.
import { seg, lerp, outCubic, minJerk, press, h, css, op } from './lib.93d8bde0.js';

const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
// the pointing hand, drawn in the same 24px box: index finger up, three folded fingers, thumb out to the left
const HAND = 'M8 3a1.5 1.5 0 0 1 3 0v6.6a1.5 1.5 0 0 1 3 .2v.6a1.5 1.5 0 0 1 3 .2v.8a1.5 1.5 0 0 1 3 .2V17c0 3-2 5.5-5 5.5h-2.5c-2 0-3-1-4-2.3l-3.9-5a1.4 1.4 0 0 1 2-1.9L8 14.6Z';
const HAND_LINES = 'M11 9.6V14M14 10.4v4.1M17 11.4V15';
// the text I-beam over fields: a white-cored black beam with its serifs
const IBEAM = 'M9 3.5c1.6 0 2.4.4 3 1.2.6-.8 1.4-1.2 3-1.2M9 20.5c1.6 0 2.4-.4 3-1.2.6.8 1.4 1.2 3 1.2M12 4.7v14.6M10.6 12h2.8';
const TIP = { arrow: { x: 4, y: 2.5 }, hand: { x: 9.5, y: 1.6 }, ibeam: { x: 12, y: 12 } };

export class Track {
  constructor(x, y) { this.keys = [{ t: -1e9, x, y }]; this.moves = []; this.clicks = []; this.shapes = [{ t: -1e9, s: 'arrow' }]; this.hide = []; }
  get last() { const m = this.moves[this.moves.length - 1]; return m ? m.b : this.keys[0]; }
  /** glide to (x, y) over [t0, t1]; o = overshoot as a fraction of the distance, c = path bow */
  move(t0, t1, x, y, { o = 0.035, c = 0.12, side } = {}) {
    const a = this.last, b = { x, y };
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const dir = { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
    const over = Math.min(o * d, 14);
    const b2 = { x: b.x + dir.x * over, y: b.y + dir.y * over };
    const s = side ?? (this.moves.length % 2 ? 1 : -1);
    const ctrl = { x: (a.x + b2.x) / 2 - dir.y * c * d * s, y: (a.y + b2.y) / 2 + dir.x * c * d * s };
    this.moves.push({ t0, t1, a, b, b2, ctrl });
    return this;
  }
  /** circle (cx, cy) over [t0, t1]: an ellipse of radii rx, ry, `turns` times round, starting from where the pointer is */
  orbit(t0, t1, cx, cy, rx, ry, turns = 1) {
    const a = this.last, a0 = Math.atan2((a.y - cy) / ry, (a.x - cx) / rx);
    const end = a0 + turns * Math.PI * 2;
    const b = { x: cx + rx * Math.cos(end), y: cy + ry * Math.sin(end) };
    this.moves.push({ t0, t1, a, b, orbit: { cx, cy, rx, ry, a0, end } });
    return this;
  }
  click(t) { this.clicks.push(t); return this; }
  shape(t, s) { this.shapes.push({ t, s }); this.shapes.sort((p, q) => p.t - q.t); return this; }
  /** hide over [t0, t1] (opacity 0 inside) */
  hidden(t0, t1) { this.hide.push([t0, t1]); return this; }
  at(t) {
    let p = this.keys[0];
    for (const m of this.moves) {
      if (t < m.t0) break;
      if (t >= m.t1) { p = m.b; continue; }
      const u = seg(t, m.t0, m.t1);
      if (m.orbit) {
        const o = m.orbit, th = o.a0 + (o.end - o.a0) * (0.5 - 0.5 * Math.cos(Math.PI * u));
        p = { x: o.cx + o.rx * Math.cos(th), y: o.cy + o.ry * Math.sin(th) };
        break;
      }
      if (u < 0.82) {
        const s = minJerk(u / 0.82), k = 1 - s;
        p = { x: k * k * m.a.x + 2 * k * s * m.ctrl.x + s * s * m.b2.x, y: k * k * m.a.y + 2 * k * s * m.ctrl.y + s * s * m.b2.y };
      } else {
        const f = outCubic((u - 0.82) / 0.18);
        p = { x: lerp(m.b2.x, m.b.x, f), y: lerp(m.b2.y, m.b.y, f) };
      }
      break;
    }
    return p;
  }
  shapeAt(t) { let s = 'arrow'; for (const k of this.shapes) if (k.t <= t) s = k.s; return s; }
  pressAt(t) { let p = 0; for (const c of this.clicks) p = Math.max(p, press(t, c)); return p; }
  opacityAt(t) {
    let v = 1;
    for (const [a, b] of this.hide) v = Math.min(v, 1 - seg(t, a - 0.15, a) * (1 - seg(t, b, b + 0.15)));
    return v;
  }
}

/** a pointer drawn at `scale` (1 = the 24px macOS size) inside its parent's px. -> { el, render(t, track) } */
export function makeCursor(scale = 1.5) {
  const el = h(`<div class="tc-ptr" aria-hidden="true">
    <i class="tc-ripple"></i><i class="tc-ripple"></i>
    <svg class="tc-arrow" viewBox="0 0 24 24" width="24" height="24"><path d="${ARROW}"/></svg>
    <svg class="tc-hand" viewBox="0 0 24 24" width="24" height="24"><path d="${HAND}"/><path class="tc-hand-l" d="${HAND_LINES}"/></svg>
    <svg class="tc-ibeam" viewBox="0 0 24 24" width="24" height="24"><path class="tc-ib-o" d="${IBEAM}"/><path class="tc-ib-i" d="${IBEAM}"/></svg>
  </div>`);
  const [r1, r2] = el.querySelectorAll('.tc-ripple');
  const arrow = el.querySelector('.tc-arrow'), hand = el.querySelector('.tc-hand'), ibeam = el.querySelector('.tc-ibeam');
  return {
    el,
    render(t, tr) {
      const p = tr.at(t), shape = tr.shapeAt(t), tip = TIP[shape], k = 1 - 0.1 * tr.pressAt(t);
      op(el, tr.opacityAt(t));
      css(el, 'transform', `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`);
      // scaled from the svg's top left (.tc-ptr svg transform-origin 0 0), then shifted so the hotspot stays on the point
      const S = scale * k;
      for (const [svg, on] of [[arrow, shape === 'arrow'], [hand, shape === 'hand'], [ibeam, shape === 'ibeam']]) {
        css(svg, 'display', on ? 'block' : 'none');
        if (on) css(svg, 'transform', `translate(${(-tip.x * S).toFixed(2)}px, ${(-tip.y * S).toFixed(2)}px) scale(${S.toFixed(4)})`);
      }
      // the two most recent clicks' ripples, each 0.5s
      const recent = tr.clicks.filter((c) => t >= c && t < c + 0.5).slice(-2);
      [r1, r2].forEach((r, i) => {
        const c = recent[i];
        if (c === undefined) { op(r, 0); return; }
        const a = (t - c) / 0.5, rad = (5 + 21 * outCubic(a)) * scale / 1.5;
        op(r, 0.55 * (1 - a));
        css(r, 'transform', `translate(${(-rad).toFixed(2)}px, ${(-rad).toFixed(2)}px)`);
        css(r, 'width', `${(rad * 2).toFixed(2)}px`);
        css(r, 'height', `${(rad * 2).toFixed(2)}px`);
      });
    },
  };
}
