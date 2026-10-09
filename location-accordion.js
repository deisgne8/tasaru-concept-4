document.querySelectorAll('[data-location-accordion]').forEach(accordion => {
  const cards = [...accordion.querySelectorAll('[data-location-card]')];
  const setOpen = (card, open) => {
    const trigger = card.querySelector('[data-location-toggle]');
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    card.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
  };
  cards.forEach(card => {
    const trigger = card.querySelector('[data-location-toggle]');
    trigger.addEventListener('click', () => {
      const opening = trigger.getAttribute('aria-expanded') !== 'true';
      cards.forEach(other => setOpen(other, other === card && opening));
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape' && card.classList.contains('is-open')) {
        setOpen(card, false);
        trigger.focus();
        event.preventDefault();
      }
    });
  });
});
