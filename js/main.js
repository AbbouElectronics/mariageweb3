/* =============================================
   MEDITERRANEAN WEDDING — MAIN JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVBAR ---------- */
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const navList = document.getElementById('navLinks');

  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });

    navList.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navList.classList.remove('open'))
    );

    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) navList.classList.remove('open');
    });
  }

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- INTERSECTION OBSERVER (animations) ---------- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.timeline-item, .detail-card, .dress-code, .cortege-card, ' +
    '.gallery-item, .voyage-card, .liste-content, .faq-item'
  ).forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });

  /* ---------- COUNTDOWN ---------- */
  const weddingDate = new Date('2026-09-14T16:00:00');

  function updateCountdown() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('countdown')?.remove();
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, '0');
    };
    set('days',    days);
    set('hours',   hours);
    set('minutes', minutes);
    set('seconds', seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer  = btn.nextElementSibling;
      const isOpen  = btn.classList.contains('active');

      document.querySelectorAll('.faq-question.active').forEach(active => {
        active.classList.remove('active');
        active.nextElementSibling.classList.remove('open');
      });

      if (!isOpen) {
        btn.classList.add('active');
        answer.classList.add('open');
      }
    });
  });

  /* ---------- GALLERY LIGHTBOX ---------- */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const closeBtn     = document.getElementById('lightboxClose');
  const prevBtn      = document.getElementById('lightboxPrev');
  const nextBtn      = document.getElementById('lightboxNext');

  const galleryItems = [...document.querySelectorAll('.gallery-item img')];
  let currentIndex   = 0;

  function openLightbox(index) {
    if (!lightbox || !galleryItems.length) return;
    currentIndex = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => openLightbox(i));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => openLightbox(currentIndex - 1));
  nextBtn?.addEventListener('click', () => openLightbox(currentIndex + 1));

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });

  /* ---------- RSVP FORM ---------- */
  const rsvpForm    = document.getElementById('rsvpForm');
  const formSuccess = document.getElementById('formSuccess');
  const guestGroup  = document.getElementById('guestCountGroup');

  document.querySelectorAll('input[name="presence"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (guestGroup) {
        guestGroup.style.display = radio.value === 'oui' ? 'block' : 'none';
      }
    });
  });

  rsvpForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = rsvpForm.querySelector('.btn-rsvp');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

    setTimeout(() => {
      rsvpForm.querySelectorAll('.form-group, .form-row, .btn-rsvp').forEach(el => {
        el.style.display = 'none';
      });
      formSuccess?.classList.add('show');
    }, 1200);
  });

  /* ---------- GALLERY FILTER (gallery page) ---------- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.gallery-full-grid .gallery-item').forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.opacity    = show ? '1' : '0.2';
        item.style.transform  = show ? 'scale(1)' : 'scale(0.95)';
        item.style.pointerEvents = show ? 'auto' : 'none';
      });
    });
  });

  /* ---------- ACTIVE NAV LINK ON SCROLL ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchs = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchs.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchs.forEach(a => a.classList.remove('active-link'));
          const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          link?.classList.add('active-link');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
  }

});
