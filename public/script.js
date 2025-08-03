(function () {
  // Access configuration from global SITE_CONFIG
  const cfg = window.SITE_CONFIG || {};
  const SKIM_ID = cfg.SKIM_ID || '';

  let brands = [];
  const vibeMap = new Map();
  const catMap = new Map();
  let vibes = {};
  let cats = {};
  let saved = new Set();
  let selectedVibe = 'all';
  let selectedCat = 'all';
  let scroll75Fired = false;
    // Insert placeholder card to ensure a card exists before data loads
  {
    const container = document.getElementById('cards');
    if (container) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card placeholder';
      container.appendChild(placeholder);
    }
  }


  // Restore filter and saved state from localStorage and URL params
  function loadState() {
    try {
      const savedIds = JSON.parse(localStorage.getItem('ds_saved') || '[]');
      saved = new Set(savedIds);
    } catch (_) {}
    try {
      const filter = JSON.parse(localStorage.getItem('ds_filter') || '{}');
      if (filter && filter.vibe) selectedVibe = filter.vibe;
      if (filter && filter.cat) selectedCat = filter.cat;
    } catch (_) {}
    const params = new URLSearchParams(window.location.search);
    if (params.has('vibe')) selectedVibe = params.get('vibe');
    if (params.has('cat')) selectedCat = params.get('cat');
  }

  function saveFilter() {
    localStorage.setItem('ds_filter', JSON.stringify({ vibe: selectedVibe, cat: selectedCat }));
  }

  function saveSaved() {
    localStorage.setItem('ds_saved', JSON.stringify(Array.from(saved)));
  }

  function updateURL() {
    const url = new URL(window.location.href);
    if (selectedVibe && selectedVibe !== 'all') url.searchParams.set('vibe', selectedVibe);
    else url.searchParams.delete('vibe');
    if (selectedCat && selectedCat !== 'all') url.searchParams.set('cat', selectedCat);
    else url.searchParams.delete('cat');
    history.replaceState(null, '', url.toString());
  }

  // Build lookup maps for vibes and categories
  function buildMaps() {
    vibes = {};
    cats = {};
    for (const b of brands) {
      // vibe
      if (!vibes[b.vibe_slug]) vibes[b.vibe_slug] = b.vibe;
      if (!vibeMap.has(b.vibe_slug)) vibeMap.set(b.vibe_slug, []);
      vibeMap.get(b.vibe_slug).push(b);
      // categories
      b.category_slugs.forEach((slug, idx) => {
        if (!cats[slug]) cats[slug] = b.categories[idx];
        if (!catMap.has(slug)) catMap.set(slug, []);
        catMap.get(slug).push(b);
      });
    }
  }

  function renderPills() {
    const vibeRow = document.getElementById('vibes-row');
    const catRow = document.getElementById('cats-row');
    vibeRow.innerHTML = '';
    catRow.innerHTML = '';
    // helper to create a pill
    function pill(slug, label, type) {
      const d = document.createElement('div');
      d.className = 'pill' + ((type === 'vibe' && slug === selectedVibe) || (type === 'cat' && slug === selectedCat) ? ' active' : '');
      d.textContent = label;
      d.addEventListener('click', () => {
        if (type === 'vibe') selectedVibe = slug; else selectedCat = slug;
        saveFilter();
        updateURL();
        renderPills();
        renderCards();
      });
      return d;
    }
    // vibes
    vibeRow.appendChild(pill('all', 'All', 'vibe'));
    Object.entries(vibes)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([slug, name]) => vibeRow.appendChild(pill(slug, name, 'vibe')));
    // categories
    catRow.appendChild(pill('all', 'All', 'cat'));
    Object.entries(cats)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([slug, name]) => catRow.appendChild(pill(slug, name, 'cat')));
  }

  function getFiltered() {
    if (selectedVibe !== 'all' && selectedCat !== 'all') {
      const vList = vibeMap.get(selectedVibe) || [];
      const cList = catMap.get(selectedCat) || [];
      const setC = new Set(cList.map((b) => b.id));
      return vList.filter((b) => setC.has(b.id));
    }
    if (selectedVibe !== 'all') return vibeMap.get(selectedVibe) || [];
    if (selectedCat !== 'all') return catMap.get(selectedCat) || [];
    return brands;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderCards() {
    const container = document.getElementById('cards');
    const list = shuffle(getFiltered());
    container.innerHTML = '';
    for (const b of list) {
      const card = document.createElement('div');
      card.className = 'card';
      if (saved.has(b.id)) card.classList.add('saved');
      // link wrapper
      const link = document.createElement('a');
      link.className = 'link';
      link.href = b.homepage || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.href = b.homepage || '';
      // image wrapper
      const imgWrap = document.createElement('div');
      imgWrap.className = 'image-wrapper';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = b.image || '';
      img.alt = b.name;
      imgWrap.appendChild(img);
      const grad = document.createElement('div');
      grad.className = 'gradient';
      imgWrap.appendChild(grad);
      const namePill = document.createElement('div');
      namePill.className = 'name-pill';
      namePill.textContent = b.name;
      imgWrap.appendChild(namePill);
      link.appendChild(imgWrap);
      card.appendChild(link);
      // heart icon
      const svgNS = 'http://www.w3.org/2000/svg';
      const heart = document.createElementNS(svgNS, 'svg');
      heart.setAttribute('viewBox', '0 0 24 24');
      heart.setAttribute('class', 'heart');
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.02 4.02 4 6.5 4c1.74 0 3.41 0.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 17.98 4 20 6.02 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
      heart.appendChild(path);
      card.appendChild(heart);
      heart.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (saved.has(b.id)) {
          saved.delete(b.id);
          card.classList.remove('saved');
        } else {
          saved.add(b.id);
          card.classList.add('saved');
        }
        saveSaved();
      });
      link.addEventListener('click', (e) => {
        const orig = link.dataset.href;
        if (!orig) return;
        // analytics
        if (typeof window.plausible === 'function') {
          window.plausible('outbound_click', { props: { brand_id: b.id } });
        }
        // rewrite
        if (SKIM_ID) {
          link.href = 'https://go.skimresources.com/?id=' + encodeURIComponent(SKIM_ID) + '&url=' + encodeURIComponent(orig);
        }
      });
      container.appendChild(card);
    }
  }

  function handleShare() {
    const btn = document.getElementById('share-btn');
    const notif = document.getElementById('notification');
    btn.addEventListener('click', () => {
      const url = new URL(window.location.href).toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          notif.textContent = 'Copied to clipboard';
          notif.classList.add('show');
          setTimeout(() => notif.classList.remove('show'), 2000);
        });
      } else {
        window.prompt('Copy this URL', url);
      }
    });
  }

  function onScroll() {
    if (scroll75Fired) return;
    const scrolled = (window.scrollY || document.documentElement.scrollTop) + window.innerHeight;
    const height = document.documentElement.scrollHeight;
    if (scrolled >= height * 0.75) {
      scroll75Fired = true;
      if (typeof window.plausible === 'function') {
        window.plausible('scroll_75');
      }
    }
  }

  // Fetch brand data and initialise the page
  fetch('brands.json')
    .then((r) => r.json())
    .then((json) => {
      brands = json;
      loadState();
      buildMaps();
      renderPills();
      renderCards();
      handleShare();
      window.addEventListener('scroll', onScroll);
    });
})();
