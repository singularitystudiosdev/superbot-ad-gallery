// The variant selector: a segmented control pinned top right, outside #stage so it is not scaled with the frame, and
// hidden on a frozen capture (body.freeze) like the hint. Arrow keys move the choice; a mouse pick drops focus so
// space, the arrows and R go back to the spot's own clock (timeline.9b47fc30.js).
import { VARIANTS, variant, setVariant } from './variant.9e82faf1.js';

const bar = document.createElement('div');
bar.className = 'variant-select';
bar.setAttribute('role', 'radiogroup');
bar.setAttribute('aria-label', 'Variant');
bar.innerHTML = '<span class="vs-label" aria-hidden="true">Variant</span>'
  + VARIANTS.map((v) => `<button type="button" role="radio" data-v="${v.id}">${v.label}</button>`).join('');
document.body.appendChild(bar);
const buttons = [...bar.querySelectorAll('button')];

function sync() {
  buttons.forEach((b) => {
    const on = b.dataset.v === variant();
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
}

bar.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  setVariant(b.dataset.v);
  if (e.detail > 0) b.blur();
});

bar.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); return; }
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  e.stopPropagation();
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  const i = VARIANTS.findIndex((v) => v.id === variant());
  const next = VARIANTS[(i + step + VARIANTS.length) % VARIANTS.length].id;
  setVariant(next);
  buttons.find((b) => b.dataset.v === next).focus();
});

addEventListener('variantchange', sync);
sync();
