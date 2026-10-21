// The player: the reference spot's clock (gemini-muse-meme-superbot-6fbc38f8/timeline.9b47fc30.js), unchanged in what it
// does. The film is a pure function of t; ?t=<s> freezes a frame, ?t=<s>&play=1 plays on from there, space pauses (and
// replays once the run is over), arrows step 0.25 s, ',' and '.' change the speed, R restarts; a 60 fps quantised clock
// that plays once and holds its last frame. window.__AD is the frame-exact QA handle. The control pill (top right) does
// the same with the mouse: pause, restart and the speed presets.

const FPS = 60;
export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const asSpeed = (v) => { const n = Number(v); return SPEEDS.find((s) => Math.abs(s - n) < 1e-6); };

export function startClock({ cycle, draw, ready }) {
  const q = new URLSearchParams(location.search);
  const hasT = q.has('t'), freeze = hasT && !q.has('play');
  if (freeze) document.body.classList.add('freeze');
  let rate = asSpeed(q.get('speed')) || 1;
  let paused = freeze, base = hasT ? parseFloat(q.get('t')) || 0 : 0, started = performance.now();
  const now = () => (paused ? base : base + (performance.now() - started) / 1000 * rate);
  const listeners = new Set();
  const emit = () => listeners.forEach((f) => f());

  function setSpeed(r) {
    const v = asSpeed(r);
    if (v === undefined || v === rate) return;
    base = now(); started = performance.now();
    rate = v;
    const u = new URL(location.href);
    if (v === 1) u.searchParams.delete('speed'); else u.searchParams.set('speed', String(v));
    history.replaceState(null, '', u);
    emit();
  }
  function timeNow() {
    const t = Math.min(Math.max(now(), 0), cycle);
    return Math.min(Math.round(t * FPS) / FPS, cycle);
  }
  const ended = () => base >= cycle;
  function toggle() {
    if (paused) { if (ended()) base = 0; paused = false; started = performance.now(); }
    else { base = now(); paused = true; }
    emit();
  }
  function step(d) { base = Math.min(cycle, Math.max(0, timeNow() + d)); paused = true; emit(); }
  function restart() { base = 0; started = performance.now(); paused = false; emit(); }

  addEventListener('keydown', (e) => {
    if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target && e.target.tagName)) return;
    if (e.key === ',' || e.key === '<' || e.key === '.' || e.key === '>') {
      const i = SPEEDS.indexOf(rate) + (e.key === ',' || e.key === '<' ? -1 : 1);
      setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, i))]);
    } else if (e.key === ' ') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') step(e.key === 'ArrowRight' ? 0.25 : -0.25);
    else if (e.key === 'r' || e.key === 'R') restart();
  });

  // a frame that throws is reported (once per message) and skipped: no error can stop the film on a frame
  const thrown = new Set();
  function paint(t) {
    try { draw(t); } catch (e) {
      const k = String(e && e.message);
      if (!thrown.has(k)) { thrown.add(k); console.error(new Error(`the frame at ${t.toFixed(2)} s threw; the film plays on`, { cause: e })); }
    }
  }
  function frame() {
    requestAnimationFrame(frame);
    if (!paused && now() >= cycle) { base = cycle; paused = true; emit(); }
    paint(timeNow());
  }
  paint(timeNow());
  requestAnimationFrame(frame);

  const api = {
    CYCLE: cycle,
    get ready() { return ready(); },
    seek(t) { paused = true; base = t; started = performance.now(); paint(timeNow()); emit(); },
    play(t) { paused = false; base = t ?? timeNow(); started = performance.now(); paint(timeNow()); emit(); },
    SPEEDS,
    get speed() { return rate; },
    setSpeed,
    get now() { return timeNow(); },
    get playing() { return !paused; },
    get frozen() { return freeze; },
    toggle, restart, step,
    onChange(f) { listeners.add(f); return () => listeners.delete(f); },
  };
  window.__AD = api;
  return api;
}

/** the control pill: pause/play, restart, speed. Mounted outside the stage so it never lands in a captured frame */
export function mountControls(clock) {
  if (clock.frozen || new URLSearchParams(location.search).has('clean')) return;
  const el = document.createElement('div');
  el.className = 'ctl';
  el.innerHTML = `<button type="button" class="ctl-play" aria-label="Pause"></button>
    <button type="button" class="ctl-restart" aria-label="Restart"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>
    <label class="ctl-speed"><span>Speed</span><select aria-label="Playback speed">${SPEEDS.map((s) => `<option value="${s}">${s}x</option>`).join('')}</select></label>`;
  document.body.appendChild(el);
  const play = el.querySelector('.ctl-play'), sel = el.querySelector('select');
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M7 5v14l11-7z"/></svg>', PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  const sync = () => {
    play.innerHTML = clock.playing ? PAUSE : PLAY;
    play.setAttribute('aria-label', clock.playing ? 'Pause' : 'Play');
    sel.value = String(clock.speed);
  };
  play.addEventListener('click', () => clock.toggle());
  el.querySelector('.ctl-restart').addEventListener('click', () => clock.restart());
  sel.addEventListener('change', () => { clock.setSpeed(sel.value); sel.blur(); });
  clock.onChange(sync);
  sync();
}
