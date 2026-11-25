/* =====================================================
   DRA. MARCELA CAMARGO — main.js v2.0
   ===================================================== */

/* ── Header: sticky + glassmorphism ── */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Menu em tablets e celulares ── */
const compactMenu = window.matchMedia('(max-width: 1200px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setMobileMenu(isOpen) {
  hamburger.classList.toggle('open', isOpen);
  nav.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

hamburger.addEventListener('click', () => {
  setMobileMenu(!nav.classList.contains('open'));
});

compactMenu.addEventListener('change', () => setMobileMenu(false));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
  setMobileMenu(false);
  hamburger.focus();
});

document.addEventListener('click', (event) => {
  if (!nav.classList.contains('open')) return;
  if (nav.contains(event.target) || hamburger.contains(event.target)) return;
  setMobileMenu(false);
});

/* ── Scroll animations (Intersection Observer) ── */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('is-visible'), delay);
    animObserver.unobserve(el);
  });
}, { threshold: 0.14 });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.header__nav a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (nav.classList.contains('open') && nav.contains(anchor)) {
      setMobileMenu(false);
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    const offset = header.offsetHeight + 8;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
});

/* ── Navegação dos banners ── */
(() => {
  const track = document.getElementById('hero-banner-track');
  const controls = document.querySelector('.hero-banners__controls');
  if (!track || !controls) return;

  const pages = Array.from(controls.querySelectorAll('[data-banner-page]'));

  const currentPage = () => Math.round(track.scrollLeft / track.clientWidth);
  const syncControls = () => {
    const active = currentPage();
    pages.forEach((button, index) => {
      if (index === active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  };

  const showPage = (index) => {
    track.scrollLeft = index * track.clientWidth;
    syncControls();
  };

  pages.forEach((button, index) => {
    button.addEventListener('click', () => showPage(index));
  });

  controls.querySelectorAll('[data-banner-step]').forEach(button => {
    button.addEventListener('click', () => {
      const next = currentPage() + Number(button.dataset.bannerStep);
      showPage((next + pages.length) % pages.length);
    });
  });

  track.addEventListener('scroll', syncControls, { passive: true });
  controls.hidden = false;
})();

/* ── Gallery Lightbox ── */
const galleryItems  = document.querySelectorAll('.gallery__item');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');
const overlay       = document.getElementById('overlay');

let currentIdx = 0;
const galleryImages = Array.from(galleryItems).map(item => ({
  src: item.querySelector('img').src,
  alt: item.querySelector('img').alt,
}));

function openLightbox(index) {
  currentIdx = index;
  lightboxImg.src = galleryImages[index].src;
  lightboxImg.alt = galleryImages[index].alt;
  lightbox.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function showImage(index) {
  currentIdx = (index + galleryImages.length) % galleryImages.length;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentIdx].src;
    lightboxImg.style.opacity = '1';
  }, 180);
}

lightboxImg.style.transition = 'opacity .18s ease';

galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
lightboxClose.addEventListener('click', closeLightbox);
overlay.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showImage(currentIdx - 1));
lightboxNext.addEventListener('click', () => showImage(currentIdx + 1));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
  if (e.key === 'ArrowRight') showImage(currentIdx + 1);
});

/* ── Swipe on lightbox ── */
let lbTouchX = 0;
lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = lbTouchX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) diff > 0 ? showImage(currentIdx + 1) : showImage(currentIdx - 1);
});

/* ── Counter animation ── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.count);
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const decimals = parseInt(el.dataset.decimals || 0, 10);
  const format = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const duration = 1800;
  const steps    = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = increment * step;
    if (step >= steps) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + format.format(current) + suffix;
  }, duration / steps);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

const statsEl = document.querySelector('.hero__stats');
if (statsEl && !reducedMotion.matches) {
  counterObserver.observe(statsEl);
}

/* Exibe o botão flutuante no celular quando as chamadas do topo saem da tela. */
const heroBookingLinks = document.querySelectorAll('.hero-banners__track, .hero__actions');
const whatsappButton = document.querySelector('.whatsapp-fab');

if (whatsappButton && heroBookingLinks.length) {
  const visibleBookingLinks = new Set();
  const bookingLinksObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleBookingLinks.add(entry.target);
      else visibleBookingLinks.delete(entry.target);
    });
    whatsappButton.classList.toggle('whatsapp-fab--hero-visible', visibleBookingLinks.size > 0);
  });
  heroBookingLinks.forEach(link => bookingLinksObserver.observe(link));
}

/* ── Harmonização Facial: tabs ── */
document.querySelectorAll('.harmonizacao__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    document.querySelectorAll('.harmonizacao__tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.harmonizacao__panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');
  });
});

/* ── Vídeo da seção Sobre: som ativo ao entrar na tela ── */
(() => {
  const video = document.querySelector('.about__video');
  const btn   = document.querySelector('.about__video-sound');
  if (!video) return;

  const icon = btn ? btn.querySelector('i') : null;

  const sincronizaBotao = () => {
    if (!btn || !icon) return;
    icon.className = video.muted ? 'fas fa-volume-xmark' : 'fas fa-volume-high';
    btn.setAttribute('aria-label', video.muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo');
  };

  /* Tenta tocar com som; se o navegador bloquear, mantém mudo e tenta de novo
     assim que houver qualquer interação do usuário na página. */
  let jaTocouComSom = false;

  const tocarComSom = () => {
    if (jaTocouComSom) return;
    video.muted = false;
    video.volume = 1;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.then(() => { jaTocouComSom = true; sincronizaBotao(); })
       .catch(() => {
         video.muted = true;
         video.play().catch(() => {});
         sincronizaBotao();
       });
    } else {
      jaTocouComSom = true;
      sincronizaBotao();
    }
  };

  let naTela = false;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        naTela = e.isIntersecting;
        if (naTela) tocarComSom();
        else video.pause();
      });
    }, { threshold: 0.35 }).observe(video);
  }

  /* Primeira interação do usuário libera o autoplay com som */
  const liberar = () => {
    if (naTela) tocarComSom();
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, liberar, { passive: true })
  );

  /* Botão manual de som */
  if (btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted) { jaTocouComSom = true; video.play().catch(() => {}); }
      sincronizaBotao();
    });
  }

  sincronizaBotao();
})();

/* ── Modal de escolha de unidade para os CTAs de WhatsApp ── */
(() => {
  const modal = document.getElementById('unitModal');
  if (!modal) return;

  const WHATSAPP = '5531995589065';
  const MENSAGENS = {
    Planalto: 'Olá! Acessei o site e gostaria de saber mais sobre os procedimentos oferecidos. Quero ser atendida na Unidade Planalto (Av. Dr. Cristiano Guimarães, 928 - BH/MG).',
    Savassi:  'Olá! Acessei o site e gostaria de saber mais sobre os procedimentos oferecidos. Tenho interesse em ser atendida na Unidade Savassi (em breve).'
  };

  let ultimoFoco = null;
  let tratamento = '';

  const abrir = (link) => {
    ultimoFoco = document.activeElement;
    tratamento = link.dataset.waTreatment || '';
    modal.hidden = false;
    document.body.classList.add('unit-modal-open');
    const primeira = modal.querySelector('.unit-option');
    if (primeira) primeira.focus();
  };

  const fechar = () => {
    modal.hidden = true;
    document.body.classList.remove('unit-modal-open');
    if (ultimoFoco) ultimoFoco.focus();
  };

  /* Intercepta todos os CTAs de WhatsApp, exceto os já vinculados a uma unidade */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (!link || link.hasAttribute('data-wa-direct')) return;
    e.preventDefault();
    abrir(link);
  });

  /* Escolha da unidade → abre o WhatsApp com a mensagem personalizada */
  modal.querySelectorAll('.unit-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const unidade = btn.dataset.unidade;
      const mensagem = MENSAGENS[unidade] || MENSAGENS.Planalto;
      const texto = tratamento ? `${mensagem} Tenho interesse em ${tratamento}.` : mensagem;
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      fechar();
    });
  });

  modal.querySelectorAll('[data-unit-close]').forEach(el => el.addEventListener('click', fechar));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) fechar();
  });
})();
