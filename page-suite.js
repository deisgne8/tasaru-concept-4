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

const locationDetailOverview = document.querySelector('.location-detail-page .location-detail-overview');
if (locationDetailOverview) {
  const breadcrumb = document.querySelector('.location-detail-page .location-breadcrumbs');
  const places = locationDetailOverview.querySelector('.location-place-grid');
  const currentPlace = places.querySelector('.location-place-card[aria-current="page"]');
  const currentImage = currentPlace.querySelector('img');
  const placeName = currentPlace.querySelector('strong').textContent.trim();
  const homeItem = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = 'index.html';
  homeLink.textContent = 'Home';
  homeItem.append(homeLink);
  const breadcrumbList = breadcrumb.querySelector('ol');
  [...breadcrumbList.children].slice(1, -1).forEach(item => item.remove());
  breadcrumbList.prepend(homeItem);
  locationDetailOverview.prepend(breadcrumb);

  const figure = document.createElement('figure');
  figure.className = 'location-detail-image';
  const image = currentImage.cloneNode(true);
  image.alt = `Illustrative view of ${placeName}`;
  image.sizes = '(max-width:780px) 100vw, 50vw';
  figure.append(image);
  places.replaceWith(figure);
  document.body.classList.add('has-place-image');
}


const supplierNetwork = document.querySelector('[data-supplier-network]');
if (supplierNetwork) {
  const track = supplierNetwork.querySelector('.supplier-network-track');
  const stage = supplierNetwork.querySelector('.supplier-network-stage');
  const images = [...supplierNetwork.querySelectorAll('[data-network-image]')];
  const rows = [...supplierNetwork.querySelectorAll('[data-network-row]')];
  let active = -1;
  let queued = false;

  function updateSupplierNetwork() {
    queued = false;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, (stickyTop - track.getBoundingClientRect().top) / travel));
    const index = Math.min(rows.length - 1, Math.floor(progress * rows.length));
    if (index === active) return;
    active = index;
    images.forEach((image, i) => image.classList.toggle('is-active', i === index));
    rows.forEach((row, i) => row.classList.toggle('is-active', i === index));
  }

  function scheduleSupplierNetwork() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateSupplierNetwork);
  }

  window.addEventListener('scroll', scheduleSupplierNetwork, { passive: true });
  window.addEventListener('resize', scheduleSupplierNetwork);
  scheduleSupplierNetwork();
}

const hierarchyNav = document.querySelector('.suite-hierarchy');
const destinationGrid = document.querySelector('.suite-destination-grid');
const hierarchySource = hierarchyNav;
if (hierarchySource) {
  const destinations = {
    'kaec.html': {
      label: 'KAEC',
      description: 'King Abdullah Economic City provides the wider city setting for the automotive cluster and supplier platform.',
      image: 'assets/inner-polished/kaec-body.webp'
    },
    'king-salman-automotive-cluster.html': {
      label: 'Automotive cluster',
      description: 'The King Salman Automotive Cluster gives the location story its automotive manufacturing focus within KAEC.',
      image: 'assets/inner-polished/king-salman-automotive-cluster-body.webp'
    },
    'masarat-mobility-park.html': {
      label: 'MASARAT',
      description: 'MASARAT Mobility Park™ is the wider mobility destination in which TASARU Supplier Hub is located.',
      image: 'assets/inner-polished/masarat-mobility-park-body.webp'
    },
    'tasaru-supplier-hub.html': {
      label: 'Supplier hub',
      description: 'TASARU Supplier Hub brings global Tier-1 expertise and critical automotive manufacturing capabilities together.',
      image: 'assets/inner-polished/tasaru-supplier-hub-body.webp'
    }
  };
  const links = hierarchyNav
    ? [...hierarchyNav.querySelectorAll('a[href]')]
    : Object.keys(destinations).map(href => destinationGrid.querySelector(`a[href="${href}"]`));
  if (links.length === 4 && links.every(link => link && destinations[link.getAttribute('href')])) {
    const current = hierarchyNav ? Math.max(0, links.findIndex(link => link.getAttribute('aria-current') === 'page')) : 0;
    const wrapper = document.createElement('div');
    const tablist = document.createElement('div');
    const tabs = [];
    const panels = [];
    wrapper.className = 'suite-hierarchy-tabs';
    if (destinationGrid) wrapper.classList.add('suite-location-hierarchy');
    tablist.className = 'suite-hierarchy-tablist';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Location hierarchy');

    links.forEach((link, index) => {
      const destination = destinations[link.getAttribute('href')];
      const category = (hierarchyNav ? link.querySelector('span') : link.querySelector('.eyebrow'))?.textContent || '';
      const title = (hierarchyNav ? link.querySelector('strong') : link.querySelector('h3'))?.textContent || '';
      const tab = document.createElement('button');
      const tabCategory = document.createElement('span');
      const tabLabel = document.createElement('strong');
      const panel = document.createElement('div');
      const copy = document.createElement('div');
      const panelCategory = document.createElement('span');
      const heading = document.createElement('h3');
      const description = document.createElement('p');
      const image = document.createElement('img');

      tab.type = 'button';
      tab.className = 'suite-hierarchy-tab';
      tab.id = `hierarchy-tab-${index}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `hierarchy-panel-${index}`);
      tab.setAttribute('aria-selected', String(index === current));
      tab.tabIndex = index === current ? 0 : -1;
      tabCategory.textContent = category;
      tabLabel.textContent = destination.label;
      tab.append(tabCategory, tabLabel);

      panel.className = 'suite-hierarchy-panel';
      panel.id = `hierarchy-panel-${index}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      panel.hidden = index !== current;
      panelCategory.className = 'suite-hierarchy-category';
      panelCategory.textContent = category;
      heading.textContent = title;
      description.textContent = destination.description;
      copy.className = 'suite-hierarchy-panel-copy';
      copy.append(panelCategory, heading, description);
      if (destinationGrid || index !== current) {
        const detailLink = document.createElement('a');
        detailLink.href = link.getAttribute('href');
        detailLink.textContent = `Explore ${title}`;
        copy.append(detailLink);
      }
      image.src = destination.image;
      image.alt = '';
      image.loading = index === current ? 'eager' : 'lazy';
      panel.append(copy, image);
      tablist.append(tab);
      wrapper.append(panel);
      tabs.push(tab);
      panels.push(panel);
    });
    wrapper.prepend(tablist);
    hierarchySource.replaceWith(wrapper);

    function selectHierarchyTab(index, focus = false) {
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[tabIndex].hidden = !active;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => tab.addEventListener('click', () => selectHierarchyTab(index)));
    tablist.addEventListener('keydown', event => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectHierarchyTab(next, true);
    });
  }
}

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

const locationConnections = document.querySelector('[data-location-connections]');
if (locationConnections) {
  const cards = [...locationConnections.querySelectorAll('.location-connection-card')];
  const svg = locationConnections.querySelector('.location-brand-connections');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tracks = [];
  const paths = cards.slice(1).map(() => {
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    track.classList.add('location-connection-track');
    svg.append(track);
    tracks.push(track);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('location-connection-progress');
    path.setAttribute('pathLength', '1');
    svg.append(path);
    return path;
  });
  let layoutNeeded = true;
  let frame = 0;

  function drawLocationConnections() {
    frame = 0;
    const box = locationConnections.getBoundingClientRect();
    if (layoutNeeded) {
      const vertical = window.matchMedia('(max-width:900px)').matches;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      paths.forEach((path, index) => {
        const a = cards[index].getBoundingClientRect();
        const b = cards[index + 1].getBoundingClientRect();
        if (vertical) {
          const x1 = a.left - box.left + a.width * .43;
          const x2 = b.left - box.left + b.width * .57;
          const y1 = a.bottom - box.top;
          const y2 = b.top - box.top;
          const mid = (y1 + y2) / 2;
          const radius = Math.min(10, (y2 - y1) / 4, (x2 - x1) / 4);
          const route = `M${x1} ${y1} V${mid-radius} Q${x1} ${mid} ${x1+radius} ${mid} H${x2-radius} Q${x2} ${mid} ${x2} ${mid+radius} V${y2}`;
          path.setAttribute('d', route);
          tracks[index].setAttribute('d', route);
        } else {
          const x1 = a.right - box.left;
          const x2 = b.left - box.left;
          const y1 = a.top - box.top + a.height * (index === 0 ? .38 : .62);
          const y2 = b.top - box.top + b.height * (index === 0 ? .62 : .38);
          const mid = (x1 + x2) / 2;
          const direction = y2 > y1 ? 1 : -1;
          const radius = Math.min(18, (x2 - x1) / 4, Math.abs(y2 - y1) / 4);
          const route = `M${x1} ${y1} H${mid-radius} Q${mid} ${y1} ${mid} ${y1+direction*radius} V${y2-direction*radius} Q${mid} ${y2} ${mid+radius} ${y2} H${x2}`;
          path.setAttribute('d', route);
          tracks[index].setAttribute('d', route);
        }
      });
      layoutNeeded = false;
    }
    const start = innerHeight * .85;
    const end = innerHeight * .25;
    const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (start - box.top) / (box.height + start - end)));
    paths.forEach((path, index) => {
      path.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, progress * paths.length - index)));
    });
    cards.forEach((card, index) => {
      card.classList.toggle('is-connected', index === 0 ? progress > 0 : progress * paths.length >= index);
    });
  }

  function queueLocationConnections(relayout = false) {
    layoutNeeded ||= relayout;
    if (!frame) frame = requestAnimationFrame(drawLocationConnections);
  }

  new ResizeObserver(() => queueLocationConnections(true)).observe(locationConnections);
  document.fonts.ready.then(() => queueLocationConnections(true));
  window.addEventListener('scroll', () => queueLocationConnections(), { passive: true });
  window.addEventListener('resize', () => queueLocationConnections(true));
  motion.addEventListener('change', () => queueLocationConnections());
  queueLocationConnections(true);
}
