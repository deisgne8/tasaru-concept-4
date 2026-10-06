const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 36);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
  nav.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
  nav.classList.remove('open');
  document.body.classList.remove('nav-open');
}));

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = document.querySelectorAll('[data-count]');
if (!reducedMotion) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count);
      let value = 0;
      const tick = () => {
        value += 1;
        node.textContent = String(Math.min(value, target));
        if (value < target) window.setTimeout(tick, 130);
      };
      node.textContent = '0';
      tick();
      countObserver.unobserve(node);
    });
  }, { threshold: .7 });
  counters.forEach((counter) => countObserver.observe(counter));
}


// Concept 3 component carousel: buttons, keyboard and native touch scrolling.
const componentTrack = document.querySelector('[data-vast-track]');
const componentCards = [...componentTrack.querySelectorAll('.vast-progress-card')];
const carouselStatus = document.querySelector('[data-carousel-status]');
const componentNames = ['Seating', 'Body-in-white', 'Chassis', 'Interior plastics', 'Exterior plastics'];
let componentIndex = 0;
const updateCarousel = () => {
  const distance = componentTrack.scrollLeft;
  componentIndex = componentCards.reduce((best, card, index) =>
    Math.abs(card.offsetLeft - componentCards[0].offsetLeft - distance) <
    Math.abs(componentCards[best].offsetLeft - componentCards[0].offsetLeft - distance) ? index : best, 0);
  carouselStatus.textContent = `${componentIndex + 1} / 5 — ${componentNames[componentIndex]}`;
  document.querySelector('[data-vast-prev]').disabled = componentIndex === 0;
  document.querySelector('[data-vast-next]').disabled = componentIndex === componentCards.length - 1;
};
const showComponent = (index) => {
  const target = Math.max(0, Math.min(componentCards.length - 1, index));
  componentTrack.scrollTo({
    left: componentCards[target].offsetLeft - componentCards[0].offsetLeft,
    behavior: reducedMotion ? 'auto' : 'smooth'
  });
};
document.querySelector('[data-vast-prev]').addEventListener('click', () => showComponent(componentIndex - 1));
document.querySelector('[data-vast-next]').addEventListener('click', () => showComponent(componentIndex + 1));
componentTrack.addEventListener('scroll', updateCarousel, { passive: true });
componentTrack.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  showComponent(event.key === 'Home' ? 0 : event.key === 'End' ? 4 : componentIndex + (event.key === 'ArrowRight' ? 1 : -1));
});
document.querySelectorAll('[data-supplier-index]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  showComponent(Number(link.dataset.supplierIndex));
  document.querySelector('#capabilities').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}));
window.addEventListener('resize', updateCarousel);
updateCarousel();

// Highlight overlays share one fixed image, so roads and boundaries never jump.
const mapButtons = [...document.querySelectorAll('[data-map-index]')];
const mapRegions = [...document.querySelectorAll('[data-map-region]')];
const mapCaption = document.querySelector('[data-map-caption]');
const activateMap = (index) => {
  mapButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  mapRegions.forEach((region, i) => region.classList.toggle('is-active', i === index));
  mapCaption.textContent = mapButtons[index].textContent;
};
mapButtons.forEach((button, index) => {
  button.addEventListener('click', () => activateMap(index));
  button.addEventListener('mouseenter', () => activateMap(index));
  button.addEventListener('focus', () => activateMap(index));
});

// Slow orbital movement keeps labels upright and pauses when offscreen.
const orbit = document.querySelector('.platform-visual');
const orbitItems = [...orbit.querySelectorAll('.platform-item')];
const orbitToggle = document.createElement('button');
orbitToggle.type = 'button';
orbitToggle.className = 'orbit-toggle';
orbitToggle.textContent = 'Pause motion';
orbitToggle.setAttribute('aria-pressed', 'false');
orbit.appendChild(orbitToggle);
let orbitPaused = reducedMotion;
let orbitVisible = false;
let orbitFrame = 0;
let orbitLast = 0;
let orbitPhase = 0;
const orbitDesktop = window.matchMedia('(min-width: 901px)');
const positionOrbit = () => {
  const radiusX = Math.min(orbit.clientWidth * .255, 186);
  const radiusY = 186;
  orbitItems.forEach((item, i) => {
    const angle = orbitPhase - Math.PI / 2 + i * Math.PI * 2 / 3;
    const x = Math.cos(angle) * radiusX;
    item.style.left = `${orbit.clientWidth / 2 + x}px`;
    item.style.top = `${orbit.clientHeight / 2 + Math.sin(angle) * radiusY}px`;
    item.classList.toggle('orbit-left', x < -25);
  });
};
const animateOrbit = (now) => {
  if (!orbitVisible || orbitPaused || !orbitDesktop.matches || document.hidden) { orbitFrame = 0; orbitLast = 0; return; }
  if (orbitLast) orbitPhase += Math.min(now - orbitLast, 60) * Math.PI * 2 / 70000;
  orbitLast = now;
  positionOrbit();
  orbitFrame = requestAnimationFrame(animateOrbit);
};
const startOrbit = () => {
  if (orbitDesktop.matches) positionOrbit();
  else orbitItems.forEach((item) => { item.style.removeProperty('left'); item.style.removeProperty('top'); });
  if (!orbitFrame && orbitVisible && !orbitPaused && orbitDesktop.matches) orbitFrame = requestAnimationFrame(animateOrbit);
};
orbitToggle.addEventListener('click', () => {
  orbitPaused = !orbitPaused;
  orbitToggle.textContent = orbitPaused ? 'Resume motion' : 'Pause motion';
  orbitToggle.setAttribute('aria-pressed', String(orbitPaused));
  startOrbit();
});
new IntersectionObserver((entries) => {
  orbitVisible = entries[0].isIntersecting;
  startOrbit();
}, { threshold: .1 }).observe(orbit);
window.addEventListener('resize', startOrbit);
document.addEventListener('visibilitychange', startOrbit);
startOrbit();

// The same position drives the signal and card colors, avoiding timing drift.
const networkFlow = document.querySelector('.ecosystem-flow');
const networkLine = networkFlow.querySelector('.network-sequence');
const networkDot = networkLine.querySelector('i');
const networkCards = [...networkFlow.querySelectorAll('article')];
const networkStacked = window.matchMedia('(max-width: 780px)');
let networkBounds = [];
let networkTravel = 0;
let networkProgress = 0;
let networkVisible = false;
let networkFrame = 0;
let networkLast = 0;
const drawNetwork = () => {
  const position = networkProgress * networkTravel;
  networkDot.style.left = networkStacked.matches ? '50%' : `${position}px`;
  networkDot.style.top = networkStacked.matches ? `${position}px` : '50%';
  networkCards.forEach((card, index) => {
    const [start, end] = networkBounds[index];
    card.classList.toggle('signal-active', !reducedMotion && position + 5 >= start && position - 5 <= end);
  });
};
const measureNetwork = () => {
  const flowRect = networkFlow.getBoundingClientRect();
  const vertical = networkStacked.matches;
  networkTravel = vertical ? networkFlow.offsetHeight : document.documentElement.clientWidth;
  networkLine.style.left = `${-flowRect.left}px`;
  networkLine.style.width = `${networkTravel}px`;
  networkBounds = networkCards.map((card) => {
    const rect = card.getBoundingClientRect();
    return vertical ? [rect.top - flowRect.top, rect.bottom - flowRect.top] : [rect.left, rect.right];
  });
  drawNetwork();
};
const animateNetwork = (now) => {
  if (!networkVisible || document.hidden || reducedMotion) { networkFrame = 0; networkLast = 0; return; }
  if (networkLast) networkProgress = (networkProgress + Math.min(now - networkLast, 80) / 12000) % 1;
  networkLast = now;
  drawNetwork();
  networkFrame = requestAnimationFrame(animateNetwork);
};
const startNetwork = () => {
  measureNetwork();
  if (!networkFrame && networkVisible && !document.hidden && !reducedMotion) networkFrame = requestAnimationFrame(animateNetwork);
};
new IntersectionObserver((entries) => {
  networkVisible = entries[0].isIntersecting;
  startNetwork();
}, { threshold: .1 }).observe(networkFlow);
window.addEventListener('resize', startNetwork);
document.addEventListener('visibilitychange', startNetwork);
measureNetwork();

const searchDialog = document.querySelector('[data-search-dialog]');
const searchOpen = document.querySelector('[data-search-open]');
const searchInput = document.querySelector('[data-search-input]');
const searchStatus = document.querySelector('[data-search-status]');

searchOpen.addEventListener('click', () => {
  searchDialog.showModal();
  document.body.classList.add('search-open');
  window.setTimeout(() => searchInput.focus(), 50);
});

searchDialog.addEventListener('close', () => document.body.classList.remove('search-open'));
searchDialog.addEventListener('click', (event) => {
  if (event.target === searchDialog) searchDialog.close();
});

searchDialog.querySelector('form').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'cancel') return;
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    event.preventDefault();
    searchStatus.textContent = 'Enter a section name to search.';
    return;
  }
  const sections = [...document.querySelectorAll('main section[id]')];
  const match = sections.find((section) => section.innerText.toLowerCase().includes(query));
  if (match) {
    searchDialog.close();
    match.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  } else {
    event.preventDefault();
    searchStatus.textContent = `No section found for “${searchInput.value.trim()}”.`;
  }
});
