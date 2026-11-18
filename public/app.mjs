import { matches } from './catalog.mjs';
const form = document.querySelector('#filters');
if (form) {
  const cards = [...document.querySelectorAll('[data-record]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const apply = () => {
    const filter = { query: form.elements.query.value, width: form.elements.width.value, background: form.elements.background.value };
    let visible = 0;
    for (const card of cards) { card.hidden = !matches(JSON.parse(card.dataset.record), filter); if (!card.hidden) visible++; }
    count.textContent = `${visible} of ${cards.length} tapes`;
    empty.hidden = visible !== 0;
  };
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  // Native reset's default action can run after the listener's microtask.
  // Reset explicitly so the controls and rendered results change together.
  form.addEventListener('reset', event => {
    event.preventDefault();
    form.elements.query.value = '';
    form.elements.width.value = '';
    form.elements.background.value = '';
    apply();
  });
  document.querySelectorAll('[data-width]').forEach(button => button.addEventListener('click', () => {
    form.elements.width.value = button.dataset.width;
    apply(); form.elements.query.focus();
  }));
  document.querySelector('#reset-empty').addEventListener('click', () => { form.reset(); form.elements.query.focus(); });
  apply();
}
