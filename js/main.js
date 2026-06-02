/* =============================================
   MEDITERRANEAN WEDDING — MAIN JS
   ============================================= */

/* =============================================
   ENVELOPE INTRO + WEDDING MUSIC
   ============================================= */

(function EnvelopeIntro() {

  /* ---- Web Audio Piano Synth ---- */
  let audioCtx = null;
  let musicTimer = null;
  let musicPlaying = false;

  const NOTE = {
    D3:146.83, A3:220.00, B3:246.94, Fs3:185.00, G3:196.00,
    D4:293.66, E4:329.63, Fs4:369.99, G4:392.00, A4:440.00,
    B4:493.88, Cs5:554.37, D5:587.33, E5:659.25, Fs5:739.99
  };

  function pianoNote(ctx, masterGain, freq, startT, dur, vel = 0.45) {
    if (!freq) return;
    const osc1  = ctx.createOscillator();
    const osc2  = ctx.createOscillator();
    const osc3  = ctx.createOscillator();
    const gNode = ctx.createGain();

    osc1.type = 'triangle'; osc1.frequency.value = freq;
    osc2.type = 'sine';     osc2.frequency.value = freq * 2.005;
    osc3.type = 'sine';     osc3.frequency.value = freq * 3.01;

    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    const g3 = ctx.createGain(); g3.gain.value = 0.07;

    osc1.connect(gNode);
    osc2.connect(g2); g2.connect(gNode);
    osc3.connect(g3); g3.connect(gNode);
    gNode.connect(masterGain);

    gNode.gain.setValueAtTime(0, startT);
    gNode.gain.linearRampToValueAtTime(vel, startT + 0.015);
    gNode.gain.setValueAtTime(vel * 0.65, startT + 0.08);
    gNode.gain.exponentialRampToValueAtTime(0.0001, startT + dur);

    [osc1, osc2, osc3].forEach(o => { o.start(startT); o.stop(startT + dur + 0.05); });
  }

  function chord(ctx, mg, notes, t, dur, vel) {
    notes.forEach(f => pianoNote(ctx, mg, f, t, dur, vel));
  }

  function scheduleMusic(ctx, masterGain) {
    const bpm  = 58;
    const beat = 60 / bpm;
    const bar  = beat * 4;

    const chords = [
      [NOTE.D3, NOTE.Fs4, NOTE.A4],
      [NOTE.A3, NOTE.E4,  NOTE.A4],
      [NOTE.B3, NOTE.D4,  NOTE.Fs4],
      [NOTE.Fs3,NOTE.Cs5, NOTE.Fs4],
      [NOTE.G3, NOTE.D4,  NOTE.G4],
      [NOTE.D3, NOTE.Fs4, NOTE.A4],
      [NOTE.G3, NOTE.D4,  NOTE.B4],
      [NOTE.A3, NOTE.E4,  NOTE.A4],
    ];

    const melody = [
      [NOTE.Fs5, NOTE.E5],
      [NOTE.D5,  NOTE.Cs5],
      [NOTE.B4,  NOTE.A4],
      [NOTE.Fs4, NOTE.Fs4],
      [NOTE.G4,  NOTE.A4],
      [NOTE.B4,  NOTE.A4],
      [NOTE.G4,  NOTE.Fs4],
      [NOTE.E4,  NOTE.D4],
    ];

    let t = ctx.currentTime + 0.1;

    function scheduleBar(barIndex) {
      if (!musicPlaying) return;
      const ci = barIndex % chords.length;
      const t0 = t + barIndex * bar;

      chord(ctx, masterGain, chords[ci], t0, bar * 0.9, 0.28);

      melody[ci].forEach((mf, mi) => {
        pianoNote(ctx, masterGain, mf, t0 + mi * beat * 2, beat * 1.8, 0.22);
      });

      const delay = (t0 + bar - ctx.currentTime - 0.2) * 1000;
      musicTimer = setTimeout(() => scheduleBar(barIndex + 1), Math.max(0, delay));
    }

    scheduleBar(0);
  }

  function startMusic() {
    if (musicPlaying) return;
    musicPlaying = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const masterGain = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();

    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 2.5);

    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    scheduleMusic(audioCtx, masterGain);
  }

  function stopMusic() {
    musicPlaying = false;
    clearTimeout(musicTimer);
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
  }

  /* ---- Envelope DOM ---- */
  function init() {
    const intro   = document.getElementById('envelopeIntro');
    if (!intro) return;

    const skipBtn  = document.getElementById('envSkip');
    const hint     = document.getElementById('envHint');
    const seal     = document.getElementById('envSeal');
    const flapClip = document.getElementById('envFlapClip');
    const flap     = document.getElementById('envFlap');
    const photo    = document.getElementById('envPhoto');
    const card     = document.getElementById('envCard');

    /* Set seal div background to show exactly the photo's seal region.
       Matches object-fit:cover scaling so it's pixel-perfect with the photo. */
    function matchSealBackground() {
      if (!seal || !photo) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const iw = photo.naturalWidth;
      const ih = photo.naturalHeight;
      if (!iw || !ih) return;
      const scale = Math.max(vw / iw, vh / ih);
      const effW  = Math.round(iw * scale);
      const effH  = Math.round(ih * scale);
      seal.style.backgroundSize     = effW + 'px ' + effH + 'px';
      seal.style.backgroundPosition = 'center';
    }

    if (photo.complete && photo.naturalWidth) {
      matchSealBackground();
    } else {
      photo.addEventListener('load', matchSealBackground, { once: true });
    }
    window.addEventListener('resize', matchSealBackground, { passive: true });

    let opened = false;
    document.body.style.overflow = 'hidden';

    /* GSAP: initial states — GSAP prend en charge tous les transforms */
    if (typeof gsap !== 'undefined') {
      /* Seal : GSAP gère le centrage (pas de transform CSS sur cet élément) */
      if (seal) gsap.set(seal, { xPercent: -50, yPercent: -50 });
      if (card) {
        gsap.set(card, { xPercent: -50, yPercent: 22, opacity: 0 });
        gsap.set('.env-card-eyebrow', { opacity: 0, y: 18 });
        gsap.set('.env-card-names',   { opacity: 0, y: 22 });
        gsap.set('.env-card-rule',    { opacity: 0, scaleX: 0 });
        gsap.set('.env-card-date',    { opacity: 0, y: 16 });
        gsap.set('.env-card-venue',   { opacity: 0, y: 14 });
        gsap.set('.env-card-cta',     { opacity: 0, y: 12 });
      }
    }

    function skip() {
      stopMusic();
      if (typeof gsap !== 'undefined') {
        gsap.to(intro, {
          opacity: 0, duration: 0.4,
          onComplete: () => { intro.remove(); document.body.style.overflow = ''; }
        });
      } else {
        intro.remove();
        document.body.style.overflow = '';
      }
    }

    function openEnvelope() {
      if (opened) return;
      opened = true;
      startMusic();

      if (typeof gsap === 'undefined') {
        intro.style.transition = 'transform 1s ease-in, opacity 0.8s ease 0.3s';
        intro.style.transform  = 'translateY(-110%)';
        intro.style.opacity    = '0';
        setTimeout(() => { intro.remove(); document.body.style.overflow = ''; }, 1100);
        return;
      }

      /* == Préparation ================================================ */
      const ring = document.getElementById('envSealRing');

      /* Arrêt de l'anneau pulsant — fondu rapide hors-état */
      if (ring) {
        ring.style.animation = 'none';
        gsap.to(ring, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      }

      /* Bloquer les clics sur le sceau pendant toute l'animation */
      if (seal) seal.style.pointerEvents = 'none';

      const tl = gsap.timeline();

      /* -- ETAT 2 : DECOLLAGE DU SCEAU (1200ms total)
         Phase A - Soulevement (200ms) : le sceau se souleve avant de se decoller.
         Phase B - Decoller  (1000ms) : rotation + chute + disparition.
         Un seul element anime : le sceau lui-meme. Rien d'autre ne bouge. */
      tl.addLabel('sealDetach');

      /* Phase A : le sceau se souleve legerement */
      tl.to(seal, {
        scale:    1.06,
        duration: 0.20,
        ease:     'power2.out'
      }, 'sealDetach');

      /* Phase B : decolle — rotation legere + chute + disparition */
      tl.to(seal, {
        rotation: 12,
        y:        150,
        scale:    0.86,
        opacity:  0,
        duration: 1.00,
        ease:     'power2.in',
        onComplete: () => { gsap.set(seal, { display: 'none' }); }
      });
      /* Duree totale etat 2 : 0.20 + 1.00 = 1.20s */

      /* -- ETAT 3 : PAUSE (300ms) */
      tl.to({}, { duration: 0.30 });

      /* -- ETAT 4 : OUVERTURE DU RABAT (2500ms) */
      tl.addLabel('flapOpen');

      /* power1.inOut : depart lent (inertie/resistance du rabat), acceleration,
         puis ralentissement doux a la fin — sensation d'objet physique. */
      let flapHidden = false;
      tl.to(flap, {
        rotateX:         -180,
        duration:        2.5,
        ease:            'power1.inOut',
        transformOrigin: 'top center',
        onUpdate: function () {
          if (!flapHidden) {
            const rx = Math.abs(gsap.getProperty(flap, 'rotateX'));
            if (rx > 90) {
              flapHidden = true;
              flapClip.style.visibility = 'hidden';
            }
          }
        },
        onComplete: function () {
          flapClip.style.display = 'none';
        }
      }, 'flapOpen');

      /* -- ETAT 5 : PAUSE (300ms) */
      tl.to({}, { duration: 0.30 });

      /* -- ETAT 6 : SORTIE DE LA CARTE (2000ms) */
      tl.addLabel('cardExit');

      tl.to(card, {
        yPercent: -50,
        opacity:  1,
        duration: 2.0,
        ease:     'power2.out'
      }, 'cardExit');

      /* Enveloppe s'efface pendant la sortie de la carte (interne etat 6) */
      tl.to(photo, {
        opacity:  0,
        duration: 1.8,
        ease:     'power2.inOut'
      }, 'cardExit+=0.20');

      /* -- Texte : cascade sequentielle apres la carte */
      tl.to('.env-card-eyebrow', { opacity: 1, y: 0, duration: 0.70, ease: 'power2.out' });
      tl.to('.env-card-names',   { opacity: 1, y: 0, duration: 0.80, ease: 'power2.out' });
      tl.to('.env-card-rule',    { opacity: 1, scaleX: 1, transformOrigin: 'center', duration: 0.60, ease: 'power2.out' });
      tl.to('.env-card-date',    { opacity: 1, y: 0, duration: 0.70, ease: 'power2.out' });
      tl.to('.env-card-venue',   { opacity: 1, y: 0, duration: 0.70, ease: 'power2.out' });
      tl.to('.env-card-cta',     { opacity: 1, y: 0, duration: 0.60, ease: 'power2.out' });

      /* -- ETAT 7 : AGRANDISSEMENT (1500ms) */
      tl.to(card, {
        width:    () => Math.round(window.innerWidth  * 0.90),
        height:   () => Math.round(window.innerHeight * 0.90),
        duration: 1.5,
        ease:     'power2.inOut',
        onComplete: () => { card.style.overflowY = 'auto'; }
      }, '+=0.3');

      /* -- FIN : bouton Decouvrir + CTA */
      tl.add(() => {
        card.style.pointerEvents = 'auto';

        const cta = document.getElementById('envCardCta');
        if (cta) cta.classList.add('active');

        const discBtn = document.createElement('button');
        discBtn.textContent = 'Découvrir le site';
        discBtn.className   = 'env-discover-btn';
        card.querySelector('.env-card-content')?.appendChild(discBtn);

        gsap.fromTo(discBtn, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.80, ease: 'power2.out', delay: 0.2 });

        function dismissAll() {
          gsap.to(intro, {
            opacity: 0, duration: 0.55, ease: 'power2.in',
            onComplete: () => { intro.remove(); document.body.style.overflow = ''; }
          });
        }

        discBtn.addEventListener('click', dismissAll);

        /* Also dismiss when clicking CTA (it navigates and dismisses overlay) */
        if (cta) {
          cta.addEventListener('click', () => {
            setTimeout(() => { if (intro.parentNode) intro.remove(); document.body.style.overflow = ''; }, 400);
          });
        }
      });
    }

    seal?.addEventListener('click',    e => { e.stopPropagation(); if (!opened) openEnvelope(); });
    photo?.addEventListener('click',   e => { e.stopPropagation(); if (!opened) openEnvelope(); });
    flap?.addEventListener('click',    e => { e.stopPropagation(); if (!opened) openEnvelope(); });
    /* Catch-all: clicking anywhere on the intro (except skip) opens the envelope */
    intro?.addEventListener('click',   ()  => { if (!opened) openEnvelope(); });
    skipBtn?.addEventListener('click', e  => { e.stopPropagation(); skip(); });

    document.addEventListener('keydown', e => {
      if (!document.getElementById('envelopeIntro')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !opened) openEnvelope();
      if (e.key === 'Escape') skip();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());

/* =============================================
   MAIN SITE
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
  const weddingDate = new Date('2026-06-22T16:00:00');

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
