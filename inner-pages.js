const guidelineMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('#how-localization-works .localization-card').forEach(card => { card.tabIndex = 0; });
const contactGuidelines = [...document.querySelectorAll('main > .contact')].map((section, index) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'scroll-guideline');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  const mask = document.createElementNS(svg.namespaceURI, 'mask');
  mask.id = `inner-guideline-clearance-${index}`;
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  const defs = document.createElementNS(svg.namespaceURI, 'defs');
  defs.append(mask);
  svg.append(defs, path);
  path.setAttribute('mask', `url(#${mask.id})`);
  section.append(svg);
  section.classList.add('has-scroll-guideline');
  return { section, svg, path, mask, length: 0 };
});
const mediaContactLines = [...document.querySelectorAll('.media-contact-brand')];
let contactLineFrame = 0;
function drawContactLines() {
  contactLineFrame = 0;
  const progressFor = section => {
    const bounds = section.getBoundingClientRect();
    return guidelineMotion.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .8 - bounds.top) / bounds.height));
  };
  contactGuidelines.forEach(({ section, path, length }) => {
    path.style.strokeDashoffset = String(length * (1 - progressFor(section)));
  });
  mediaContactLines.forEach(section => {
    section.style.setProperty('--line-hidden', `${(1 - progressFor(section)) * 100}%`);
  });
}
function queueContactLines() {
  if (!contactLineFrame) contactLineFrame = requestAnimationFrame(drawContactLines);
}
function layoutContactLines() {
  contactGuidelines.forEach(item => {
    const { section, svg, path, mask } = item;
    const width = section.clientWidth, height = section.offsetHeight;
    const centre = width / 2, gutter = innerWidth <= 780 ? 8 : 24;
    const side = width - gutter, radius = innerWidth <= 780 ? 20 : 36;
    const bounds = section.getBoundingClientRect();
    const obstacles = [...section.querySelectorAll('h2,h3,p,a,button,img')];
    const firstTop = Math.min(...obstacles.map(node => node.getBoundingClientRect().top - bounds.top));
    const turn = Math.max(radius + 4, Math.min(90, firstTop - 20));
    const lowerTurn = height - radius - 8;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
    mask.setAttribute('width', width); mask.setAttribute('height', height);
    path.setAttribute('d', `M${centre} 0 V${turn - radius} Q${centre} ${turn} ${centre + radius} ${turn} H${side - radius} Q${side} ${turn} ${side} ${turn + radius} V${lowerTurn - radius} Q${side} ${lowerTurn} ${side - radius} ${lowerTurn} H${centre + radius} Q${centre} ${lowerTurn} ${centre} ${lowerTurn + radius} V${height}`);
    mask.replaceChildren();
    const clear = document.createElementNS(svg.namespaceURI, 'rect');
    clear.setAttribute('width', width); clear.setAttribute('height', height); clear.setAttribute('fill', 'white');
    mask.append(clear);
    obstacles.forEach(node => {
      const rect = node.getBoundingClientRect();
      const exclusion = document.createElementNS(svg.namespaceURI, 'rect');
      exclusion.setAttribute('x', rect.left - bounds.left - 12);
      exclusion.setAttribute('y', rect.top - bounds.top - 12);
      exclusion.setAttribute('width', rect.width + 24);
      exclusion.setAttribute('height', rect.height + 24);
      exclusion.setAttribute('fill', 'black');
      mask.append(exclusion);
    });
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    item.length = length;
  });
  queueContactLines();
}
window.addEventListener('scroll', queueContactLines, { passive: true });
window.addEventListener('resize', layoutContactLines);
guidelineMotion.addEventListener('change', queueContactLines);
if (contactGuidelines.length) {
  const lineResize = new ResizeObserver(layoutContactLines);
  contactGuidelines.forEach(({ section }) => lineResize.observe(section));
  document.fonts.ready.then(layoutContactLines);
}
layoutContactLines();
const foundationSection = document.querySelector('.about-foundations');
const foundationControls = foundationSection?.querySelector('.foundation-controls');
const foundationPoints = [...document.querySelectorAll('[data-foundation-point]')];
let foundationManualScrollY = null;
let foundationProgressFrame = 0;
function selectFoundation(point) {
  foundationPoints.forEach(button => button.setAttribute('aria-pressed', String(button === point)));
  document.querySelectorAll('[data-foundation-image]').forEach(image => image.classList.toggle('is-active', image.dataset.foundationImage === point.dataset.foundationPoint));
  const detail = foundationControls?.querySelector('.foundation-orbit-detail');
  if (detail) detail.textContent = point.querySelector('.foundation-point-description').textContent;
}
function chooseFoundation(point, index) {
  foundationManualScrollY = scrollY;
  foundationControls.classList.add('is-manual');
  foundationControls.style.setProperty('--foundation-progress', `${((index + 1) / foundationPoints.length) * 100}%`);
  selectFoundation(point);
}
foundationPoints.forEach((point, index) => {
  point.addEventListener('click', () => chooseFoundation(point, index));
  point.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? foundationPoints.length - 1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + foundationPoints.length) % foundationPoints.length;
    foundationPoints[next].focus(); chooseFoundation(foundationPoints[next], next);
  });
});
if (foundationSection && foundationPoints.length) {
  function drawFoundationProgress() {
    foundationProgressFrame = 0;
    if (guidelineMotion.matches) return;
    if (foundationManualScrollY !== null) {
      if (Math.abs(scrollY - foundationManualScrollY) < 24) return;
      foundationManualScrollY = null;
      foundationControls.classList.remove('is-manual');
    }
    const bounds = foundationSection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .8 - bounds.top) / (bounds.height + innerHeight * .4)));
    foundationControls.style.setProperty('--foundation-progress', `${progress * 100}%`);
    selectFoundation(foundationPoints[Math.min(foundationPoints.length - 1, Math.floor(progress * foundationPoints.length))]);
  }
  function queueFoundationProgress() {
    if (!foundationProgressFrame) foundationProgressFrame = requestAnimationFrame(drawFoundationProgress);
  }
  window.addEventListener('scroll', queueFoundationProgress, { passive: true });
  window.addEventListener('resize', queueFoundationProgress);
  guidelineMotion.addEventListener('change', () => {
    if (guidelineMotion.matches) {
      const index = foundationPoints.findIndex(point => point.getAttribute('aria-pressed') === 'true');
      foundationControls.style.setProperty('--foundation-progress', `${((index + 1) / foundationPoints.length) * 100}%`);
    } else queueFoundationProgress();
  });
  if (guidelineMotion.matches) foundationControls.style.setProperty('--foundation-progress', `${100 / foundationPoints.length}%`);
  else queueFoundationProgress();
}
const header=document.querySelector('[data-header]');
const menu=document.querySelector('[data-menu-toggle]');
const nav=document.querySelector('[data-nav]');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>32),{passive:true});
const dialog=document.querySelector('[data-contact-dialog]');
document.querySelectorAll('[data-contact-open]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
document.querySelector('[data-contact-close]').addEventListener('click',()=>dialog.close());
document.querySelector('[data-contact-form]').addEventListener('submit',event=>{event.preventDefault();document.querySelector('[data-contact-status]').textContent='Details pass validation. Nothing has been sent: this form is not connected to the enquiry mailbox yet.';});
const search=document.querySelector('[data-search-dialog]');
document.querySelector('[data-search-open]').addEventListener('click',()=>search.showModal());
search.querySelector('form').addEventListener('submit',event=>{if(event.submitter?.value==='cancel')return;event.preventDefault();const q=document.querySelector('[data-search-input]').value.trim().toLowerCase();const section=[...document.querySelectorAll('main section')].find(s=>q&&s.textContent.toLowerCase().includes(q));if(section){search.close();section.scrollIntoView({behavior:guidelineMotion.matches?'auto':'smooth'});}else document.querySelector('[data-search-status]').textContent='No matching section found.';});
document.querySelector('[data-search-status]').textContent='Search this page by section name.';

// Gentle section entrance, once per visit, with reduced-motion support.
const sectionMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!sectionMotion.matches && 'IntersectionObserver' in window) {
  const sections = [...document.querySelectorAll('main > section:not(.inner-hero)')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('section-entered');
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  sections.forEach(section => {
    // Keep decorative backgrounds still; animate content rather than the section box.
    const content = [...section.children].filter(node => !node.matches('img,.foundation-images,.section-backdrop,svg'));
    content.forEach((node,index) => {
      node.classList.add('section-reveal-content');
      node.style.setProperty('--section-reveal-delay',`${Math.min(index,3)*70}ms`);
    });
    sectionObserver.observe(section);
  });
  sectionMotion.addEventListener('change', event => {
    if (event.matches) { sections.forEach(section=>section.classList.add('section-entered')); sectionObserver.disconnect(); }
  });
}

const contextStory = document.querySelector('.context-story');
if (contextStory) {
  const backgrounds = [...contextStory.querySelectorAll('.context-story-bg')];
  const cards = [...contextStory.querySelectorAll('[data-context-card]')];
  const navigation = [...contextStory.querySelectorAll('[data-context-nav]')];
  const count = contextStory.querySelector('.context-story-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = -1;
  let frame = 0;

  function setContextStage(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    backgrounds.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === index;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-before', cardIndex === (index + cards.length - 1) % cards.length);
      card.classList.toggle('is-after', cardIndex === (index + 1) % cards.length);
      card.setAttribute('aria-hidden', String(!active));
    });
    navigation.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }

  function drawContextStage() {
    frame = 0;
    const rect = contextStory.getBoundingClientRect();
    const travel = Math.max(1, contextStory.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    setContextStage(Math.min(cards.length - 1, Math.floor(progress * cards.length)));
  }
  function queueContextStage() { if (!frame) frame = requestAnimationFrame(drawContextStage); }

  navigation.forEach((button, index) => button.addEventListener('click', () => {
    const start = scrollY + contextStory.getBoundingClientRect().top;
    const travel = Math.max(1, contextStory.offsetHeight - innerHeight);
    window.scrollTo({ top: start + travel * ((index + .5) / cards.length), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }));
  window.addEventListener('scroll', queueContextStage, { passive: true });
  window.addEventListener('resize', queueContextStage);
  queueContextStage();
}

// Move the foundation photo stack together so image switching stays seamless.
const foundationParallax = document.querySelector('.about-foundations > .foundation-images');
if (foundationParallax) {
  const foundationSection = foundationParallax.parentElement;
  const foundationMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let foundationFrame = 0;
  function drawFoundationParallax() {
    foundationFrame = 0;
    if (foundationMotion.matches) { foundationParallax.style.setProperty('--foundation-parallax-y','0px'); return; }
    const rect = foundationSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const offset = Math.max(-48,Math.min(48,(innerHeight/2-rect.top-rect.height/2)*.12));
    foundationParallax.style.setProperty('--foundation-parallax-y',`${offset}px`);
  }
  function queueFoundationParallax() { if (!foundationFrame) foundationFrame=requestAnimationFrame(drawFoundationParallax); }
  window.addEventListener('scroll',queueFoundationParallax,{passive:true});
  window.addEventListener('resize',queueFoundationParallax,{passive:true});
  foundationMotion.addEventListener('change',queueFoundationParallax);
  new IntersectionObserver(queueFoundationParallax).observe(foundationSection);
  queueFoundationParallax();
}

// Location infrastructure background parallax.
const locationParallax = document.querySelector('.location-connections > img');
if (locationParallax) {
  const section = locationParallax.parentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function draw() {
    frame = 0;
    if (motion.matches) { locationParallax.style.setProperty('--location-parallax-y','0px'); return; }
    const rect = section.getBoundingClientRect();
    if (rect.bottom<0 || rect.top>innerHeight) return;
    const offset = Math.max(-48,Math.min(48,(innerHeight/2-rect.top-rect.height/2)*.12));
    locationParallax.style.setProperty('--location-parallax-y',`${offset}px`);
  }
  function queue() { if (!frame) frame=requestAnimationFrame(draw); }
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  motion.addEventListener('change',queue);
  new IntersectionObserver(queue).observe(section);
  queue();
}
