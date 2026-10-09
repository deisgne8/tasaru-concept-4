document.querySelectorAll('[data-scope-select]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-scope-select]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelectorAll('[data-scope-panel]').forEach(panel => { panel.hidden = panel.dataset.scopePanel !== button.dataset.scopeSelect; });
  });
});
document.querySelectorAll('[data-story-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-story-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    document.querySelectorAll('[data-story-category]').forEach(story => {
      story.hidden = button.dataset.storyFilter !== 'All' && story.dataset.storyCategory !== button.dataset.storyFilter.toUpperCase();
      if (!story.hidden) count++;
    });
    document.getElementById('story-count').textContent = count + (count === 1 ? ' story' : ' stories');
  });
});
document.querySelectorAll('[data-inline-enquiry]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelector('[data-inline-status]').textContent = 'Details pass validation. Nothing has been sent or saved. Please email info@tasarusupplierhub.sa to contact the team.';
  });
});
// Rounded brand routes connect card edges without crossing their content.
const supplierConnection = document.querySelector('[data-supplier-connection]');
if (supplierConnection) {
  const cards = [...supplierConnection.querySelectorAll('article')];
  const svg = supplierConnection.querySelector('.supplier-brand-connections');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paths = cards.slice(1).map(() => {
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('pathLength','1'); svg.append(path); return path;
  });
  function layoutConnections() {
    const box = supplierConnection.getBoundingClientRect();
    svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    const vertical = window.matchMedia('(max-width:780px)').matches;
    paths.forEach((path,i) => {
      const a = cards[i].getBoundingClientRect(), b = cards[i+1].getBoundingClientRect();
      if (vertical) {
        const y1 = a.bottom-box.top, y2 = b.top-box.top;
        const x1 = a.left-box.left+a.width*.42, x2 = b.left-box.left+b.width*.58;
        const mid = (y1+y2)/2, r = Math.min(10,(y2-y1)/4,(x2-x1)/4);
        path.setAttribute('d',`M${x1} ${y1} V${mid-r} Q${x1} ${mid} ${x1+r} ${mid} H${x2-r} Q${x2} ${mid} ${x2} ${mid+r} V${y2}`);
      } else {
        const x1 = a.right-box.left, x2 = b.left-box.left;
        const y1 = a.top-box.top+a.height*.45, y2 = b.top-box.top+b.height*.6;
        const mid = (x1+x2)/2, r = Math.min(18,(x2-x1)/4,(y2-y1)/4);
        path.setAttribute('d',`M${x1} ${y1} H${mid-r} Q${mid} ${y1} ${mid} ${y1+r} V${y2-r} Q${mid} ${y2} ${mid+r} ${y2} H${x2}`);
      }
    });
  }
  new ResizeObserver(layoutConnections).observe(supplierConnection);
  document.fonts.ready.then(layoutConnections);
  let started = false;
  const observer = new IntersectionObserver(entries => {
    if (started || !entries.some(entry=>entry.isIntersecting)) return;
    started = true; observer.disconnect();
    cards[0].classList.add('signal-reached');
    paths.forEach((path,i) => {
      const delay = motion.matches ? 0 : i*850;
      setTimeout(()=>path.classList.add('is-connected'),delay);
      setTimeout(()=>cards[i+1].classList.add('signal-reached'),delay+(motion.matches?0:650));
    });
  },{threshold:.25});
  observer.observe(supplierConnection);
}
