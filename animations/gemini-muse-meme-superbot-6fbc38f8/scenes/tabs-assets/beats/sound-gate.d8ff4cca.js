// The sound pill: the multicat score's unmute gate and mute toggle (transport.d8ff4cca.js), pinned under the speed pill
// in the same chrome (style.css .speed-select), shown only on the multicat variant and hidden on a frozen capture. Audio
// starts on the first click or key anywhere (the browsers' autoplay rule); until then the pill offers it, and after,
// it mutes and unmutes the whole mix, the song included. Its keys never reach the spot's clock.
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';

const PICK = 'v7'; // its id on the Music pill (music.47e5d94a.js): the pill shows only while it is the pick

const CSS = new URL('../sound-gate.d8ff4cca.css', import.meta.url).href;
const ICON = {
  on: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="sg-w" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg>',
  off: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path class="sg-w" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
};
const LABEL = { locked: 'Turn on sound', on: 'Sound on', off: 'Sound off' };

export function makeGate(transport, id) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS;
  link.onerror = () => console.error(new Error(`sound pill stylesheet failed to load: ${CSS}`));
  document.head.appendChild(link);

  const bar = document.createElement('div');
  bar.className = 'sound-gate';
  bar.innerHTML = '<button type="button" aria-pressed="false"><span class="sg-i"></span><span class="sg-l"></span></button>';
  document.body.appendChild(bar);
  const btn = bar.firstElementChild, icon = btn.firstElementChild, label = btn.lastElementChild;

  let shown = null;
  const paint = (s) => {
    if (s === shown) return;
    shown = s;
    bar.dataset.state = s;
    icon.innerHTML = s === 'on' ? ICON.on : ICON.off;
    label.textContent = LABEL[s];
    btn.setAttribute('aria-pressed', String(s === 'on'));
  };
  const place = () => { bar.hidden = variant() !== id || music() !== PICK; if (bar.hidden) transport.stop(); };

  // a press while locked unlocks and turns sound on; after, it toggles (the transport leaves this pill's presses to it)
  bar.dataset.audioGate = '';
  btn.addEventListener('click', (e) => {
    const locked = transport.state() === 'locked';
    transport.unlock();
    transport.setMuted(locked ? false : !transport.muted);
    if (e.detail > 0) btn.blur();
  });
  btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });

  transport.watch(paint);
  addEventListener('variantchange', place);
  addEventListener('musicchange', place);
  place();
}
