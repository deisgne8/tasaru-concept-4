const guidelineMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const foundationPoints = [...document.querySelectorAll('[data-foundation-point]')];
function selectFoundation(point) {
  foundationPoints.forEach(button => button.setAttribute('aria-pressed', String(button === point)));
  document.querySelectorAll('[data-foundation-image]').forEach(image => image.classList.toggle('is-active', image.dataset.foundationImage === point.dataset.foundationPoint));
}
foundationPoints.forEach((point, index) => {
  point.addEventListener('click', () => selectFoundation(point));
  point.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? foundationPoints.length - 1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + foundationPoints.length) % foundationPoints.length;
    foundationPoints[next].focus(); selectFoundation(foundationPoints[next]);
  });
});
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

// Subtle parallax for the wider-ecosystem photograph only.
const contextParallax = document.querySelector('.about-context > .section-backdrop');
if (contextParallax) {
  const contextSection = contextParallax.parentElement;
  const parallaxMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let parallaxFrame = 0;
  function drawContextParallax() {
    parallaxFrame = 0;
    if (parallaxMotion.matches) { contextParallax.style.setProperty('--context-parallax-y','0px'); return; }
    const rect = contextSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const offset = Math.max(-48,Math.min(48,(innerHeight/2-rect.top-rect.height/2)*.12));
    contextParallax.style.setProperty('--context-parallax-y',`${offset}px`);
  }
  function queueContextParallax() { if (!parallaxFrame) parallaxFrame=requestAnimationFrame(drawContextParallax); }
  window.addEventListener('scroll',queueContextParallax,{passive:true});
  window.addEventListener('resize',queueContextParallax,{passive:true});
  parallaxMotion.addEventListener('change',queueContextParallax);
  new IntersectionObserver(queueContextParallax).observe(contextSection);
  queueContextParallax();
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
