// Plate math: the bar loader. The target weight in pounds becomes plates per side on a 45 lb bar, heaviest first,
// drawn on both sleeves. Plates that land after a change pop on (.plate.new); the first load is the scroll-driven
// slide in site.css, so it plays as the section comes into view.
(function () {
  const BAR = 45;
  const PLATES = [45, 35, 25, 10, 5, 2.5];
  const MIN = 45, MAX = 995;
  const VERDICT = [
    'Just the bar. Everybody starts somewhere.',
    'One plate. The journey starts here.',
    'Two plates. Now we are talking.',
    'Three plates. Respect.',
    'Four plates. Call the spotters.',
    'Five plates. Absolute unit.',
  ];

  const calc = document.querySelector('[data-calc]');
  if (!calc) return;
  const input = calc.querySelector('#target');
  const sides = [...calc.querySelectorAll('[data-side]')];
  const perSide = calc.querySelector('[data-per-side]');
  const verdict = calc.querySelector('[data-verdict]');
  let shown = [];

  // greedy per side: the heaviest plate that still fits, down to 2.5 lb; whatever cannot be loaded is reported
  function load(target) {
    let left = (target - BAR) / 2;
    const out = [];
    for (const p of PLATES) while (left >= p - 1e-9) { out.push(p); left -= p; }
    return { plates: out, rest: Math.round(left * 2 * 10) / 10 };
  }

  const fmt = (n) => String(n).replace(/\.0$/, '');

  function render(fresh) {
    const target = Math.min(MAX, Math.max(MIN, Math.round((Number(input.value) || MIN) / 5) * 5));
    if (String(target) !== input.value) input.value = String(target);
    const { plates, rest } = load(target);
    for (const side of sides) {
      side.textContent = '';
      plates.forEach((p, i) => {
        const el = document.createElement('i');
        el.className = `plate p${String(p).replace('.', '-')}`;
        el.style.setProperty('--i', i);
        if (!fresh && (i >= shown.length || shown[i] !== p)) el.classList.add('new');
        side.append(el);
      });
    }
    shown = plates;
    const big = plates.filter((p) => p === 45).length;
    perSide.textContent = plates.length ? plates.map(fmt).join(', ') : 'Nothing';
    verdict.textContent = (rest ? `${fmt(rest)} lb will not load evenly. ` : '') + VERDICT[Math.min(big, VERDICT.length - 1)];
  }

  calc.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    input.value = String(Number(input.value) + Number(b.dataset.step));
    render(false);
  });
  input.addEventListener('change', () => render(false));
  render(true);
})();
