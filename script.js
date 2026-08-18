let config = null;

async function loadConfig() {
  try {
    const res = await fetch('portfolio.json');
    config = await res.json();
    render();
  } catch (e) {
    console.error('Failed to load portfolio.json:', e);
  }
}

function setConfigText(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  const value = path.split('.').reduce((o, k) => o?.[k], config);
  if (value) el.textContent = value;
}

function render() {
  if (!config) return;

  // Basic config-driven text
  setConfigText('[data-config="site.name"]', 'site.name');
  setConfigText('[data-config="site.tagline"]', 'site.tagline');
  setConfigText('[data-config="site.bio"]', 'site.bio');
  setConfigText('[data-config="demoReel.title"]', 'demoReel.title');
  setConfigText('[data-config="demoReel.description"]', 'demoReel.description');

  // Email link
  const emailEl = document.querySelector('[data-config="site.email"]');
  if (emailEl && config.site.email) {
    emailEl.textContent = config.site.email;
    emailEl.href = `mailto:${config.site.email}`;
  }

  // Demo reel poster
  if (config.demoReel?.poster) {
    document.getElementById('reelPoster').style.backgroundImage = `url('${config.demoReel.poster}')`;
  }

  // Social links
  const socialContainer = document.getElementById('socialLinks');
  if (config.site?.social) {
    socialContainer.innerHTML = Object.entries(config.site.social)
      .map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener">${name}</a>`)
      .join('');
  }

  // Projects
  renderProjects(config.projects || []);

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();
}

const categories = ['All', 'Videos', 'Shorts', '3D', 'Motion Graphics'];
let activeFilter = 'All';

function renderProjects(projects) {
  // Filter bar
  const filterBar = document.getElementById('filterBar');
  filterBar.innerHTML = categories
    .map(cat => `<button class="filter-btn ${cat === activeFilter ? 'active' : ''}" data-cat="${cat}">${cat}</button>`)
    .join('');
  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderProjects(projects);
    });
  });

  // Grid
  const grid = document.getElementById('workGrid');
  const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);
  grid.innerHTML = filtered.map(p => `
    <div class="work-card" data-video="${p.videoUrl || ''}">
      <div class="work-thumb" style="background-image: url('${p.thumbnail || ''}')"></div>
      <div class="work-overlay">
        <span class="work-category">${p.category}</span>
        <h3 class="work-title">${p.title}</h3>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      const video = card.dataset.video;
      if (video) openLightbox(video);
    });
  });
}

// Demo reel play
document.getElementById('reelPlayBtn').addEventListener('click', () => {
  if (config?.demoReel?.embedUrl) {
    const frame = document.querySelector('.reel-frame');
    frame.innerHTML = `<iframe class="reel-iframe" src="${config.demoReel.embedUrl}" allow="autoplay; fullscreen;
     picture-in-picture" allowfullscreen></iframe>`;
  }
});

// Lightbox
function openLightbox(url) {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  content.innerHTML = `<iframe src="${url}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  lightbox.classList.add('open');
}
document.getElementById('lightboxClose').addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxContent').innerHTML = '';
});
document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') {
    e.currentTarget.classList.remove('open');
    document.getElementById('lightboxContent').innerHTML = '';
  }
});

// Scroll progress + nav state
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';

  const nav = document.getElementById('nav');
  if (scrollTop > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// Init
loadConfig();
