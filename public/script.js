
const params    = new URLSearchParams(window.location.search);
const rawName   = params.get('invite');
const guestName = rawName ? decodeURIComponent(rawName).replace(/\+/g, ' ') : null;

(function() {
  const container = document.getElementById('envParticles');
  for (let i = 0; i < 35; i++) {
    const el = document.createElement('div');
    el.className = 'env-particle';
    const s = 3 + Math.random() * 14;
    el.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;
      animation-duration:${9+Math.random()*14}s;animation-delay:${Math.random()*12}s;`;
    container.appendChild(el);
  }
})();

if (guestName) {
  const named = document.getElementById('env-named');
  named.style.display = 'flex';
  document.getElementById('guestNameDisplay').textContent = guestName;
} else {
  document.getElementById('env-generic').style.display = 'block';
}

let opened = false;

function revealMainPage() {
  document.getElementById('envelope-screen').classList.add('hidden');
  const mainPage = document.getElementById('main-page');
  mainPage.classList.add('visible');
  initPetals();
  initReveal();
  startMusic();
}

function openEnvelope() {
  if (opened) return;
  opened = true;

  document.getElementById('envSeal').classList.add('breaking');

  setTimeout(() => document.getElementById('envFlap').classList.add('open'), 520);
  setTimeout(() => document.getElementById('envLetter').classList.add('rising'), 950);
  setTimeout(() => {
    document.getElementById('envelope-screen').classList.add('hidden');

    const mainPage = document.getElementById('main-page');
    mainPage.classList.add('visible');
    if (guestName) {
      const banner = document.getElementById('heroBanner');
      document.getElementById('heroBannerName').textContent = guestName;
      banner.style.display = 'inline-block';
      const wn = document.getElementById('wishName');
      const an = document.getElementById('attendName');
      if (wn) wn.value = guestName;
      if (an) an.value = guestName;
    }

    initPetals();
    initReveal();
    startMusic();
  }, 1900);
}

function initPetals() {
  const c = document.getElementById('petals');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.cssText = `left:${Math.random()*100}%;animation-duration:${6+Math.random()*10}s;
      animation-delay:${Math.random()*8}s;width:${5+Math.random()*8}px;
      height:${12+Math.random()*16}px;opacity:${0.2+Math.random()*0.4};`;
    c.appendChild(p);
  }
}

function initReveal() {
  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

const savedWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
renderWishes();

function sendWish(e) {
  e.preventDefault();
  const name = document.getElementById('wishName').value.trim();
  const msg  = document.getElementById('wishMsg').value.trim();
  if (!name || !msg) return;

  savedWishes.unshift({ name, msg });
  localStorage.setItem('wedding_wishes', JSON.stringify(savedWishes.slice(0, 200)));
  const BOT_TOKEN = '8463447682:AAFOE_gow0ihmh7tG31cGCdQXq_BidlSj44';
  const CHAT_ID   = '-1003520846681';
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: `💌 *Wish from ${name}*\n\n${msg}`, parse_mode: 'Markdown' })
  }).catch(() => {});

  document.getElementById('wishForm').style.display = 'none';
  document.getElementById('wishSuccess').style.display = 'block';
  renderWishes();
}

function renderWishes() {
  const list = document.getElementById('wishesList');
  list.innerHTML = savedWishes.length === 0
    ? '<p style="text-align:center;color:#9a8a7a;font-style:italic;font-family:Cormorant Garamond,serif;">Be the first to leave a wish ✦</p>'
    : savedWishes.map(w => `<div class="wish-item"><p class="wish-item-name">✦ ${w.name}</p><p class="wish-item-msg">${w.msg}</p></div>`).join('');
}

function openLightbox(el) {
  const img = el.querySelector('img');
  if (!img) return;
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }
document.getElementById('lightbox').addEventListener('click', e => { if (e.target === document.getElementById('lightbox')) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


async function loadGallery() {
  try {
    const response = await fetch('assets/manifest.json');
    const data = await response.json();

    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = '';

    data.images.forEach((imageName) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.setAttribute('onclick', 'openLightbox(this)');

      item.innerHTML = `
        <img 
          src="assets/collections/${imageName}" 
          alt="Wedding Photo"
          class="gallery-photo"
        >
        <div class="gallery-overlay">
          <span>⤢</span>
        </div>
      `;

      galleryGrid.appendChild(item);
    });

  } catch (error) {
    console.error('Failed to load gallery:', error);
  }
}

loadGallery();



function initCountdown() {
  const weddingDate = new Date('2026-06-26T00:00:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      document.getElementById('countdown').innerHTML =
        '<p class="countdown-finished">Today is the wedding day ✨</p>';
      return;
    }

    daysEl.textContent = Math.floor(distance / (1000 * 60 * 60 * 24));
    hoursEl.textContent = Math.floor((distance / (1000 * 60 * 60)) % 24);
    minutesEl.textContent = Math.floor((distance / (1000 * 60)) % 60);
    secondsEl.textContent = Math.floor((distance / 1000) % 60);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

initCountdown();


const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function startMusic() {
  if (!bgMusic) return;

  bgMusic.volume = 0.45;

  bgMusic.play()
    .then(() => {
      musicToggle.textContent = '♫';
      musicToggle.classList.remove('muted');
    })
    .catch(() => {
      musicToggle.textContent = '▶';
      musicToggle.classList.add('muted');
    });
}

function toggleMusic() {
  if (!bgMusic) return;

  if (bgMusic.paused) {
    startMusic();
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🔇';
    musicToggle.classList.add('muted');
  }
}