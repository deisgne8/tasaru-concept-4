// Approved thin-line motif: scroll-scrubbed drawing, never an autoplay loop.
const guidelineMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroRoute = document.querySelector('.hero-route-line');
if (heroRoute) {
  const hero = heroRoute.closest('.hero');
  const heroMedia = hero.querySelector('.hero-media');
  const [path, continuationPath] = heroRoute.querySelectorAll('path');
  const heroContent = hero.querySelector('.hero-content.reveal');
  let heroMediaSettled = false;
  let heroMediaStarted = false;
  heroMedia?.addEventListener('animationend', (event) => {
    if (event.animationName !== 'hero-settle') return;
    heroMediaSettled = true;
    if (!guidelineMotion.matches) heroRoute.classList.add('is-drawing');
  }, { once: true });
  path.addEventListener('animationend', (event) => {
    if (event.animationName === 'hero-route-draw') {
      heroContent?.classList.add('visible');
      if (heroContent) animateSectionText(heroContent);
    }
  });
  function layoutHeroRoute() {
    const bounds = hero.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const route = 'M' + width * .445 + ' ' + height * .18 +
      ' H' + width * .85 +
      ' Q' + width * .875 + ' ' + height * .18 + ' ' + width * .875 + ' ' + height * .22 +
      ' V' + height * .52 +
      ' Q' + width * .875 + ' ' + height * .556 + ' ' + width * .85 + ' ' + height * .556 +
      ' H' + width * .72;
    const continuation = 'M' + width * .43 + ' ' + height * .556 +
      ' H' + width * .38;
    heroRoute.setAttribute('viewBox', '0 0 ' + bounds.width + ' ' + bounds.height);
    path.setAttribute('d', route);
    continuationPath.setAttribute('d', continuation);
    heroRoute.classList.remove('is-drawing');
    if (!heroMediaStarted) {
      heroMediaStarted = true;
      heroMedia?.classList.add('is-settling');
    }
    if (!guidelineMotion.matches && heroMediaSettled) requestAnimationFrame(() => heroRoute.classList.add('is-drawing'));
  }
  new ResizeObserver(layoutHeroRoute).observe(hero);
  document.fonts.ready.then(layoutHeroRoute);
}
const guidelineStart = document.querySelector('#about');
const guidelineSections = [...document.querySelectorAll('main > section, .site-footer')].filter((section) => section.id !== 'suppliers' && (section.id === 'home' || (section.compareDocumentPosition(guidelineStart) & Node.DOCUMENT_POSITION_PRECEDING))).map((section, index) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'scroll-guideline');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  const defs = document.createElementNS(svg.namespaceURI, 'defs');
  const mask = document.createElementNS(svg.namespaceURI, 'mask');
  mask.id = `guideline-clearance-${index}`;
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  defs.append(mask);
  svg.append(defs);
  path.setAttribute('mask', `url(#${mask.id})`);
  svg.append(path);
  section.append(svg);
  section.classList.add('has-scroll-guideline');
  return { section, svg, path, mask, index, length: 0 };
});
let guidelineFrame = 0;
const drawGuidelines = () => {
  guidelineFrame = 0;
  guidelineSections.forEach(({ section, path, length }) => {
    const bounds = section.getBoundingClientRect();
    const progress = guidelineMotion.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .8 - bounds.top) / bounds.height));
    path.style.strokeDashoffset = String(length * (1 - progress));
  });
};
const queueGuidelines = () => {
  if (!guidelineFrame) guidelineFrame = requestAnimationFrame(drawGuidelines);
};
const layoutGuidelines = () => {
  guidelineSections.forEach((item) => {
    const height = item.section.offsetHeight;
    const width = item.section.clientWidth;
    const centre = width / 2, gutter = innerWidth <= 780 ? 8 : 24;
    const sequenceIndex = item.section.id === 'home' ? 0 : item.index - 1;
    const side = sequenceIndex % 2 === 0 ? width - gutter : gutter;
    const direction = side > centre ? 1 : -1;
    const radius = innerWidth <= 780 ? 20 : 36;
    const bounds = item.section.getBoundingClientRect();
    const obstacles = [...item.section.querySelectorAll('h2,h3,strong,p,a,button,img,.platform-visual,.ecosystem-flow,.context-map,.footer-social-icon,.footer-location > span')].filter(node => !node.classList.contains('supplier-tile'));
    const firstTop = Math.min(...obstacles.map(node => node.getBoundingClientRect().top - bounds.top));
    const turn = Math.max(radius + 4, Math.min(90, firstTop - 20));
    item.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    item.mask.setAttribute('x', '0'); item.mask.setAttribute('y', '0');
    item.mask.setAttribute('width', width); item.mask.setAttribute('height', height);
    const lowerTurn = height - radius - 8;
    item.path.setAttribute('d', `M${centre} 0 V${turn - radius} Q${centre} ${turn} ${centre + direction * radius} ${turn} H${side - direction * radius} Q${side} ${turn} ${side} ${turn + radius} V${lowerTurn - radius} Q${side} ${lowerTurn} ${side - direction * radius} ${lowerTurn} H${centre + direction * radius} Q${centre} ${lowerTurn} ${centre} ${lowerTurn + radius} V${height}`);
    item.mask.replaceChildren();
    const clear = document.createElementNS(item.svg.namespaceURI, 'rect');
    clear.setAttribute('width', width); clear.setAttribute('height', height); clear.setAttribute('fill', 'white');
    item.mask.append(clear);
    obstacles.forEach(node => {
      const rect = node.getBoundingClientRect();
      const exclusion = document.createElementNS(item.svg.namespaceURI, 'rect');
      exclusion.setAttribute('x', rect.left - bounds.left - 12);
      exclusion.setAttribute('y', rect.top - bounds.top - 12);
      exclusion.setAttribute('width', rect.width + 24);
      exclusion.setAttribute('height', rect.height + 24);
      exclusion.setAttribute('fill', 'black');
      item.mask.append(exclusion);
    });
    item.length = item.path.getTotalLength();
    item.path.style.strokeDasharray = String(item.length);
  });
  queueGuidelines();
};
window.addEventListener('scroll', queueGuidelines, { passive: true });
window.addEventListener('resize', layoutGuidelines);
guidelineMotion.addEventListener('change', queueGuidelines);
const guidelineResize = new ResizeObserver(layoutGuidelines);
guidelineSections.forEach(({ section }) => guidelineResize.observe(section));
layoutGuidelines();

const header = document.querySelector('[data-header]');
const contactDialog = document.querySelector('[data-contact-dialog]');
const contactOpen = document.querySelector('[data-contact-open]');
contactOpen.addEventListener('click', () => {
  contactDialog.showModal();
  document.body.classList.add('contact-modal-open');
});
document.querySelector('[data-contact-close]').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => {
  document.body.classList.remove('contact-modal-open');
  contactOpen.focus();
});
contactDialog.addEventListener('click', (event) => {
  const bounds = contactDialog.getBoundingClientRect();
  if (event.target === contactDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) contactDialog.close();
});
document.querySelector('[data-contact-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('[data-contact-status]').textContent = 'Details pass validation. Nothing has been sent: this form is not connected to the enquiry mailbox yet.';
});
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let previousScrollY = window.scrollY;
let downwardTravel = 0;
let pointerNearHeader = false;
const setHeader = () => {
  const currentScrollY = window.scrollY;
  header.classList.toggle('scrolled', currentScrollY > 36);
  if (currentScrollY < previousScrollY && currentScrollY > 36) {
    header.classList.add('header-revealed');
    downwardTravel = 0;
  } else if (currentScrollY > previousScrollY) {
    downwardTravel += currentScrollY - previousScrollY;
    if (downwardTravel >= 80 && !pointerNearHeader) header.classList.remove('header-revealed');
  }
  previousScrollY = currentScrollY;
};
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });
window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  pointerNearHeader = event.clientY <= 24 || header.contains(event.target);
  if (pointerNearHeader) header.classList.add('header-revealed');
});

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
const animateSectionText = (container) => {
  const targets = [
    ...(container.matches?.('.section-text-pending') ? [container] : []),
    ...container.querySelectorAll('.section-text-pending:not(.section-text-started)')
  ];
  targets.filter((item) => !item.classList.contains('section-text-started')).forEach((item) => {
    item.classList.add('section-text-started');
    const delay = Number.parseFloat(item.style.getPropertyValue('--section-text-delay')) || 0;
    const isTitle = item.matches('h1,h2,h3,h4,h5,h6');
    const isDescriptionOrAction = item.matches('p,a,button');
    const isLogo = item.matches('.showcase-supplier-logo, .supplier-tile img');
    item.animate(
      isLogo
        ? [
            { opacity: 0, translate: '0 24px', scale: '.97' },
            { opacity: 1, translate: '0 0', scale: '1' }
          ]
        : isTitle
        ? [
            { opacity: 0, clipPath: 'inset(0 0 100% 0)', translate: '0 72px', scale: '.9', filter: 'blur(10px)' },
            { opacity: 1, clipPath: 'inset(0 0 0 0)', translate: '0 0', scale: '1', filter: 'blur(0)' }
          ]
        : isDescriptionOrAction
        ? [
            { opacity: 0, translate: '0 54px', scale: '.94', filter: 'blur(10px)' },
            { opacity: 1, translate: '0 0', scale: '1', filter: 'blur(0)' }
          ]
        : [
            { opacity: 0, translate: '0 42px', scale: '.97', filter: 'blur(8px)' },
            { opacity: 1, translate: '0 0', scale: '1', filter: 'blur(0)' }
          ],
      { duration: isTitle ? 1300 : 1050, delay: isDescriptionOrAction ? Math.min(delay, 240) : delay, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  });
};
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        if (entry.target === document.querySelector('.hero-content.reveal')) {
          revealObserver.unobserve(entry.target);
          return;
        }
        entry.target.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
        entry.target.classList.add('visible');
        animateSectionText(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

if (!reducedMotion) {
  const sectionTextTargets = new Map();
  document.querySelectorAll('main > section').forEach((section) => {
    const textElements = [...section.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,strong,a,button,img,input,textarea,select,label,summary,blockquote')]
      .filter((item) => !item.closest('[aria-hidden="true"], [hidden], .sr-only'));
    textElements.forEach((item, index) => {
      item.classList.add('section-text-pending');
      item.style.setProperty('--section-text-delay', `${Math.min(index * 75, 720)}ms`);
    });
    sectionTextTargets.set(section, textElements);
  });

  const sectionTextObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionTextTargets.get(entry.target)
        .filter((item) => !item.closest('.reveal'))
        .forEach((item) => animateSectionText(item));
      sectionTextObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });
  sectionTextTargets.forEach((items, section) => {
    if (items.some((item) => !item.closest('.reveal'))) sectionTextObserver.observe(section);
  });

  const platformCards = document.querySelectorAll('#about .foundation-grid .platform-foundation');
  const platformCardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('card-entered');
      platformCardObserver.unobserve(entry.target);
    });
  }, { threshold: .45, rootMargin: '0px 0px -8% 0px' });
  platformCards.forEach((card) => platformCardObserver.observe(card));
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
        if (value < target) window.setTimeout(tick, 250);
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
const componentNames = ['Seating', 'Body-in-white', 'Chassis', 'Interior plastics', 'Exterior plastics'];
let componentIndex = 0;
const updateCarousel = () => {
  const distance = componentTrack.scrollLeft;
  componentIndex = componentCards.reduce((best, card, index) =>
    Math.abs(card.offsetLeft - componentCards[0].offsetLeft - distance) <
    Math.abs(componentCards[best].offsetLeft - componentCards[0].offsetLeft - distance) ? index : best, 0);
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
  componentTrack.classList.remove('pointer-focused');
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  showComponent(event.key === 'Home' ? 0 : event.key === 'End' ? 4 : componentIndex + (event.key === 'ArrowRight' ? 1 : -1));
});
// Direct pointer dragging with a smooth snap on release; touch uses native swipe.
let componentDrag = null;
componentTrack.addEventListener('dragstart', event => event.preventDefault());
componentTrack.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' || event.button !== 0 || event.target.closest('a,button')) return;
  event.preventDefault();
  componentTrack.classList.add('pointer-focused');
  componentTrack.focus({preventScroll:true});
  componentDrag = { id: event.pointerId, x: event.clientX, left: componentTrack.scrollLeft, index: componentIndex, delta: 0, moved: false };
  componentTrack.setPointerCapture(event.pointerId);
});
componentTrack.addEventListener('pointermove', event => {
  if (!componentDrag || event.pointerId !== componentDrag.id) return;
  const delta = event.clientX - componentDrag.x;
  componentDrag.delta = delta;
  if (Math.abs(delta) > 5) { componentDrag.moved = true; componentTrack.classList.add('is-dragging'); }
  if (!componentDrag.moved) return;
  event.preventDefault(); componentTrack.scrollTo({left:componentDrag.left-delta,behavior:'instant'});
});
function finishComponentDrag(event) {
  if (!componentDrag || event.pointerId !== componentDrag.id) return;
  const drag = componentDrag;
  const moved = drag.moved; componentDrag = null;
  componentTrack.classList.remove('is-dragging');
  if (componentTrack.hasPointerCapture(event.pointerId)) componentTrack.releasePointerCapture(event.pointerId);
  if (moved) {
    updateCarousel();
    const target = event.type === 'pointerup' && Math.abs(drag.delta)>60 && componentIndex===drag.index ? drag.index+(drag.delta<0?1:-1) : componentIndex;
    showComponent(target);
  }
}
componentTrack.addEventListener('pointerup', finishComponentDrag);
componentTrack.addEventListener('pointercancel', finishComponentDrag);
componentTrack.addEventListener('lostpointercapture', finishComponentDrag);

document.querySelectorAll('[data-supplier-index]').forEach((link) => link.addEventListener('click', (event) => {
  if (!link.getAttribute('href').startsWith('#')) return;
  event.preventDefault();
  document.querySelectorAll('[data-supplier-index]').forEach((item) => item.removeAttribute('aria-current'));
  link.setAttribute('aria-current', 'true');
  showComponent(Number(link.dataset.supplierIndex));
  document.querySelector('#capabilities').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}));
window.addEventListener('resize', updateCarousel);
updateCarousel();

// Keep the supplied map fixed and align the selected highlight to its image.
const mapButtons = [...document.querySelectorAll('[data-map-index]')];
const mapCaption = document.querySelector('[data-map-caption]');
const locationMapImage = document.querySelector('.context-map-art > img');
const mapViewport = document.querySelector('#location-map');
const mapHighlight = document.querySelector('.location-area-highlight');
// These areas describe the illustration, rather than surveyed plot boundaries.
const locationAreas = [
  { x: .314, y: .245, width: .15, height: .22 },
  { x: .467, y: .61, width: .18, height: .22 },
  { x: .738, y: .555, width: .28, height: .30 },
  { x: .742, y: .585, width: .085, height: .10 }
];
let selectedMapIndex = 2;
const positionLocationHighlight = () => {
  const viewportWidth = mapViewport.clientWidth;
  const viewportHeight = mapViewport.clientHeight;
  const ratio = 3344 / 1880;
  const contain = getComputedStyle(locationMapImage).objectFit === 'contain';
  const imageWidth = contain ? Math.min(viewportWidth, viewportHeight * ratio) : Math.max(viewportWidth, viewportHeight * ratio);
  const imageHeight = imageWidth / ratio;
  const offsetX = contain ? (viewportWidth - imageWidth) / 2 : viewportWidth - imageWidth;
  const offsetY = (viewportHeight - imageHeight) / 2;
  const area = locationAreas[selectedMapIndex];
  mapHighlight.style.left = `${offsetX + imageWidth * area.x}px`;
  mapHighlight.style.top = `${offsetY + imageHeight * area.y}px`;
  mapHighlight.style.width = `${imageWidth * area.width}px`;
  mapHighlight.style.height = `${imageHeight * area.height}px`;
};
const activateMap = (index) => {
  selectedMapIndex = index;
  mapButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  mapHighlight.dataset.area = String(index);
  mapCaption.textContent = mapButtons[index].textContent.trim();
  positionLocationHighlight();
};
mapButtons.forEach((button, index) => button.addEventListener('click', () => activateMap(index)));
new ResizeObserver(positionLocationHighlight).observe(mapViewport);
locationMapImage.addEventListener('load', positionLocationHighlight);
activateMap(2);

const platformDiagram = document.querySelector('.platform-diagram');
if (platformDiagram) {
  const platformVisual = platformDiagram.closest('.platform-visual');
  const platformNodes = [
    { element: platformDiagram.querySelector('.node-estate'), x: -.28, y: -.30 },
    { element: platformDiagram.querySelector('.node-land'), x: -.18, y: .208 },
    { element: platformDiagram.querySelector('.node-equipment'), x: .375, y: .166 }
  ].map((node) => ({ ...node, radius: Math.hypot(node.x, node.y), angle: Math.atan2(node.y, node.x) }));
  const platformMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let platformPhase = 0;
  let platformFrame = 0;
  let platformLastFrame = 0;
  let platformVisible = false;
  let platformActiveNode = null;
  let platformTouchPinned = false;
  let platformPointerType = '';

  const positionPlatformNodes = () => {
    platformNodes.forEach(({ element, radius, angle }) => {
      const position = angle + platformPhase;
      element.style.left = `${50 + Math.cos(position) * radius * 100}%`;
      element.style.top = `${50 + Math.sin(position) * radius * 100}%`;
    });
  };
  const canRotatePlatform = () => platformVisible && !platformMotion.matches && !document.hidden && !platformActiveNode;
  const rotatePlatform = (now) => {
    platformFrame = 0;
    if (!canRotatePlatform()) { platformLastFrame = 0; return; }
    if (platformLastFrame) platformPhase += Math.min(now - platformLastFrame, 64) * Math.PI * 2 / 50000;
    platformLastFrame = now;
    positionPlatformNodes();
    platformFrame = requestAnimationFrame(rotatePlatform);
  };
  const syncPlatformRotation = () => {
    platformVisual.classList.toggle('is-paused', Boolean(platformActiveNode));
    if (!canRotatePlatform()) platformLastFrame = 0;
    else if (!platformFrame) platformFrame = requestAnimationFrame(rotatePlatform);
  };
  const setPlatformActiveNode = (node, pinned = false) => {
    platformActiveNode = node;
    platformTouchPinned = pinned;
    platformNodes.forEach(({ element }) => element.setAttribute('aria-expanded', String(element === node)));
    syncPlatformRotation();
  };

  platformNodes.forEach(({ element }) => {
    element.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') setPlatformActiveNode(element);
    });
    element.addEventListener('pointerleave', () => {
      if (platformActiveNode === element && !platformTouchPinned && !element.matches(':focus-visible')) setPlatformActiveNode(null);
    });
    element.addEventListener('pointerdown', (event) => { platformPointerType = event.pointerType; });
    element.addEventListener('focus', () => {
      setPlatformActiveNode(element);
    });
    element.addEventListener('blur', () => {
      if (platformActiveNode === element && !platformTouchPinned) setPlatformActiveNode(null);
    });
    element.addEventListener('click', () => {
      if (platformPointerType === 'touch') setPlatformActiveNode(platformActiveNode === element && platformTouchPinned ? null : element, true);
      platformPointerType = '';
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (platformTouchPinned && !platformDiagram.contains(event.target)) setPlatformActiveNode(null);
  });
  platformDiagram.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && platformActiveNode) {
      setPlatformActiveNode(null);
      platformDiagram.querySelector(':focus')?.blur();
    }
  });
  new IntersectionObserver((entries) => {
    platformVisible = entries[0].isIntersecting;
    syncPlatformRotation();
  }, { threshold: .1 }).observe(platformVisual);
  platformMotion.addEventListener('change', syncPlatformRotation);
  document.addEventListener('visibilitychange', syncPlatformRotation);
  positionPlatformNodes();
}

// A continuous bent route reveals behind the cards; arrival activates each card.
const homepageConnection = document.querySelector('.ecosystem-flow');
if (homepageConnection) {
  const homepageEcosystem = homepageConnection.closest('#suppliers');
  const cards = [...homepageConnection.querySelectorAll('article')];
  const svg = homepageConnection.querySelector('.homepage-brand-connections');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pinViewport = window.matchMedia('(min-width: 781px)');
  const paths = Array.from({length:cards.length+1},()=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('pathLength','1'); svg.append(path); return path;
  });
  let connectionsLaidOut = false;
  function layoutConnections() {
    const box=homepageConnection.getBoundingClientRect();
    const vertical=window.matchMedia('(max-width:780px)').matches;
    const pad=vertical?24:Math.max(24,box.left);
    svg.setAttribute('viewBox',vertical?`0 -${pad} ${box.width} ${box.height+pad*2}`:`-${pad} 0 ${box.width+pad*2} ${box.height}`);
    svg.style.width=vertical?'100%':`calc(100% + ${pad*2}px)`;
    svg.style.height=vertical?`calc(100% + ${pad*2}px)`:'100%';
    svg.style.left=vertical?'0':`-${pad}px`; svg.style.top=vertical?`-${pad}px`:'0';
    const rects=cards.map(c=>c.getBoundingClientRect());
    paths.forEach((path,i)=>{
      if(i===0||i===cards.length){
        const c=rects[i===0?0:cards.length-1];
        if(vertical){const x=c.left-box.left+c.width*.42;path.setAttribute('d',i===0?`M${x} -${pad} V${c.top-box.top}`:`M${x} ${c.bottom-box.top} V${box.height+pad}`);}
        else {const y=c.top-box.top+c.height*.45;path.setAttribute('d',i===0?`M-${pad} ${y} H${c.left-box.left}`:`M${c.right-box.left} ${y} H${box.width+pad}`);}
        return;
      }
      const a=rects[i-1],b=rects[i];
      if(vertical){
        const y1=a.bottom-box.top,y2=b.top-box.top;
        const x1=a.left-box.left+a.width*(i%2?.42:.58),x2=b.left-box.left+b.width*(i%2?.58:.42);
        const mid=(y1+y2)/2,r=Math.min(10,(y2-y1)/4,Math.abs(x2-x1)/4),dir=x2>x1?1:-1;
        path.setAttribute('d',`M${x1} ${y1} V${mid-r} Q${x1} ${mid} ${x1+dir*r} ${mid} H${x2-dir*r} Q${x2} ${mid} ${x2} ${mid+r} V${y2}`);
      }else{
        const x1=a.right-box.left,x2=b.left-box.left;
        const y1=a.top-box.top+a.height*(i%2?.45:.85),y2=b.top-box.top+b.height*(i%2?.85:.45);
        const mid=(x1+x2)/2,r=Math.min(18,(x2-x1)/4,Math.abs(y2-y1)/4),dir=y2>y1?1:-1;
        path.setAttribute('d',`M${x1} ${y1} H${mid-r} Q${mid} ${y1} ${mid} ${y1+dir*r} V${y2-dir*r} Q${mid} ${y2} ${mid+r} ${y2} H${x2}`);
      }
    });
    connectionsLaidOut = true;
  }
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  let connectionFrame = 0;
  function syncPinnedStage() {
    homepageEcosystem.classList.toggle('scroll-sequence-pinned', !motion.matches && pinViewport.matches);
    queueConnectionLayout();
  }
  function drawConnectionProgress() {
    connectionFrame = 0;
    if (!connectionsLaidOut) layoutConnections();
    const pinned = homepageEcosystem.classList.contains('scroll-sequence-pinned');
    const bounds = pinned ? homepageEcosystem.getBoundingClientRect() : homepageConnection.getBoundingClientRect();
    const start = innerHeight * .82;
    const end = innerHeight * .28;
    const progress = pinned
      ? clamp(-bounds.top / Math.max(1, bounds.height - innerHeight))
      : clamp((start - bounds.top) / (bounds.height + start - end));
    const scaledProgress = progress * paths.length;
    paths.forEach((path, index) => {
      const pathProgress = clamp(scaledProgress - index);
      path.style.strokeDashoffset = String(1 - pathProgress);
      path.classList.toggle('is-connected', pathProgress >= .999);
    });
    cards.forEach((card, index) => {
      const cardProgress = clamp(progress * cards.length - index);
      card.style.setProperty('--signal-progress', `${cardProgress * 100}%`);
      card.classList.toggle('signal-active', cardProgress >= 1);
    });
  }
  function queueConnectionProgress() {
    if (!connectionFrame) connectionFrame = requestAnimationFrame(drawConnectionProgress);
  }
  function queueConnectionLayout() {
    connectionsLaidOut = false;
    queueConnectionProgress();
  }
  new ResizeObserver(queueConnectionLayout).observe(homepageConnection);
  document.fonts.ready.then(queueConnectionLayout);
  window.addEventListener('scroll', queueConnectionProgress, { passive: true });
  window.addEventListener('resize', queueConnectionLayout);
  motion.addEventListener('change', syncPinnedStage);
  pinViewport.addEventListener('change', syncPinnedStage);
  syncPinnedStage();
}

const searchDialog = document.querySelector('[data-search-dialog]');
const searchOpen = document.querySelector('[data-search-open]');
const searchInput = document.querySelector('[data-search-input]');
const searchStatus = document.querySelector('[data-search-status]');

searchOpen.addEventListener('click', () => {
  if (searchDialog.open) {
    searchDialog.close();
    return;
  }
  searchDialog.show();
  searchOpen.setAttribute('aria-expanded', 'true');
  searchOpen.setAttribute('aria-label', 'Close search');
  document.body.classList.add('search-open');
  window.setTimeout(() => searchInput.focus(), 50);
});

searchDialog.addEventListener('close', () => {
  searchOpen.setAttribute('aria-expanded', 'false');
  searchOpen.setAttribute('aria-label', 'Search website');
  document.body.classList.remove('search-open');
});
searchDialog.querySelector('form').addEventListener('submit', (event) => {
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

// Equal caption panels using the tallest content at the current viewport.
const componentCaptions = [...document.querySelectorAll('.vast-progress-caption')];
const equalizeComponentCaptions = () => {
  componentCaptions.forEach(caption => caption.style.removeProperty('--component-caption-height'));
  const height = Math.ceil(Math.max(...componentCaptions.map(caption => caption.getBoundingClientRect().height)));
  componentCaptions.forEach(caption => caption.style.setProperty('--component-caption-height', `${height}px`));
};
window.addEventListener('resize', equalizeComponentCaptions);
window.addEventListener('load', equalizeComponentCaptions);
document.fonts.ready.then(equalizeComponentCaptions);
equalizeComponentCaptions();
