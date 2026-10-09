// Approved thin-line motif: scroll-scrubbed drawing, never an autoplay loop.
const guidelineMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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

// Slow orbital movement keeps labels upright and pauses when offscreen.

const orbit = document.querySelector('.platform-visual');

const orbitItems = [...orbit.querySelectorAll('.platform-item')];

const orbitLinks = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

orbitLinks.classList.add('orbit-connections');

orbitLinks.setAttribute('aria-hidden', 'true');

const orbitSpokes = orbitItems.map(() => {

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  orbitLinks.appendChild(line);

  return line;

});

orbit.prepend(orbitLinks);

let orbitPaused = reducedMotion;

let orbitVisible = false;

let orbitFrame = 0;

let orbitLast = 0;

let orbitPhase = 0;

const orbitDesktop = window.matchMedia('(min-width: 1101px)');

const positionOrbit = () => {

  const baseRadius = Math.min((orbit.clientWidth / 2 - 80) / 1.24, 186);

  const ringFactors = [.7, 1, 1.24];

  orbit.style.setProperty('--orbit-diameter', `${baseRadius * 2}px`);

  orbitItems.forEach((item, i) => {

    const angle = orbitPhase - Math.PI / 2 + i * Math.PI * 2 / 3;

    const radius = baseRadius * ringFactors[i];

    const x = Math.cos(angle) * radius;

    const y = Math.sin(angle) * radius;

    item.classList.toggle('orbit-upper', y < 0);

    item.style.left = `${orbit.clientWidth / 2 + x}px`;

    item.style.top = `${orbit.clientHeight / 2 + y + item.offsetHeight / 2 - 18}px`;

    item.classList.toggle('orbit-left', x < -25);

    const line = orbitSpokes[i];

    line.setAttribute('x1', orbit.clientWidth / 2);

    line.setAttribute('y1', orbit.clientHeight / 2);

    line.setAttribute('x2', orbit.clientWidth / 2 + x);

    line.setAttribute('y2', orbit.clientHeight / 2 + y);

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

  if (orbitDesktop.matches && !reducedMotion) positionOrbit();

  else orbitItems.forEach((item) => { item.style.removeProperty('left'); item.style.removeProperty('top'); });

  if (!orbitFrame && orbitVisible && !orbitPaused && orbitDesktop.matches) orbitFrame = requestAnimationFrame(animateOrbit);

};

new IntersectionObserver((entries) => {

  orbitVisible = entries[0].isIntersecting;

  startOrbit();

}, { threshold: .1 }).observe(orbit);

window.addEventListener('resize', startOrbit);

document.addEventListener('visibilitychange', startOrbit);

startOrbit();



// A continuous bent route reveals behind the cards; arrival activates each card.
const homepageConnection = document.querySelector('.ecosystem-flow');
if (homepageConnection) {
  const cards = [...homepageConnection.querySelectorAll('article')];
  const svg = homepageConnection.querySelector('.homepage-brand-connections');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const paths = Array.from({length:cards.length+1},()=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('pathLength','1'); svg.append(path); return path;
  });
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
  }
  new ResizeObserver(layoutConnections).observe(homepageConnection);
  document.fonts.ready.then(layoutConnections);
  let started=false;
  function reveal(index){
    if(index>=paths.length)return;
    const path=paths[index];
    function arrived(){if(index<cards.length)cards[index].classList.add('signal-active');reveal(index+1);}
    if(motion.matches){path.classList.add('is-connected');arrived();return;}
    const drawing = path.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:850,easing:'ease-in-out',fill:'forwards'});
    drawing.finished.then(()=>{
      path.classList.add('is-connected');
      drawing.cancel();
      arrived();
    });
  }
  const observer=new IntersectionObserver(entries=>{
    if(started||!entries.some(e=>e.isIntersecting))return;
    started=true;observer.disconnect();layoutConnections();requestAnimationFrame(()=>reveal(0));
  },{threshold:.1});
  observer.observe(homepageConnection);
}

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
