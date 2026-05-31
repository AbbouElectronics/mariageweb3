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

  /* Canon in D — D major chord tones used for bass + melody */
  const NOTE = {
    D3:146.83, A3:220.00, B3:246.94, Fs3:185.00, G3:196.00,
    D4:293.66, E4:329.63, Fs4:369.99, G4:392.00, A4:440.00,
    B4:493.88, Cs5:554.37, D5:587.33, E5:659.25, Fs5:739.99
  };

  /* Piano-like oscillator tone */
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

  /* Chord = play multiple notes together */
  function chord(ctx, mg, notes, t, dur, vel) {
    notes.forEach(f => pianoNote(ctx, mg, f, t, dur, vel));
  }

  /* Schedule the Canon in D loop */
  function scheduleMusic(ctx, masterGain) {
    const bpm  = 58;          /* slow, romantic tempo */
    const beat = 60 / bpm;   /* seconds per beat */
    const bar  = beat * 4;

    /* Chord progression: D  A  Bm  F#m  G  D  G  A */
    const chords = [
      [NOTE.D3, NOTE.Fs4, NOTE.A4],    /* D  */
      [NOTE.A3, NOTE.E4,  NOTE.A4],    /* A  */
      [NOTE.B3, NOTE.D4,  NOTE.Fs4],   /* Bm */
      [NOTE.Fs3,NOTE.Cs5, NOTE.Fs4],   /* F#m */
      [NOTE.G3, NOTE.D4,  NOTE.G4],    /* G  */
      [NOTE.D3, NOTE.Fs4, NOTE.A4],    /* D  */
      [NOTE.G3, NOTE.D4,  NOTE.B4],    /* G  */
      [NOTE.A3, NOTE.E4,  NOTE.A4],    /* A  */
    ];

    /* Simple melody (half-bar notes over each chord) */
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

      /* Bass chord on beat 1 */
      chord(ctx, masterGain, chords[ci], t0, bar * 0.9, 0.28);

      /* Melody: two notes per bar (half-beat each) */
      melody[ci].forEach((mf, mi) => {
        pianoNote(ctx, masterGain, mf, t0 + mi * beat * 2, beat * 1.8, 0.22);
      });

      /* Schedule next bar 1 bar ahead */
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

    const seal    = document.getElementById('envSeal');
    const skipBtn = document.getElementById('envSkip');
    const hint    = document.getElementById('envHint');

    let opened = false;

    function dismissEnvelope() {
      intro.classList.add('closing');
      intro.addEventListener('animationend', () => {
        intro.remove();
        document.body.style.overflow = '';
      }, { once: true });
    }

    function openEnvelope() {
      if (opened) return;
      opened = true;

      /* Start music */
      startMusic();

      /* Trigger CSS opening animations */
      intro.classList.add('opening');
      if (hint) hint.style.opacity = '0';

      /* Flap animation: 0.15s delay + 1.4s duration = ends at 1.55s
         Wait a beat after full open → then dismiss to site */
      setTimeout(() => dismissEnvelope(), 2100);
    }

    /* Click anywhere on intro to open */
    intro.addEventListener('click', () => { if (!opened) openEnvelope(); });

    /* Skip button */
    skipBtn?.addEventListener('click', e => {
      e.stopPropagation();
      stopMusic();
      intro.remove();
      document.body.style.overflow = '';
    });

    /* Keyboard: Space / Enter opens, Escape skips */
    document.addEventListener('keydown', e => {
      if (!document.getElementById('envelopeIntro')) return;
      if ((e.key === ' ' || e.key === 'Enter') && !opened) openEnvelope();
      if (e.key === 'Escape') { stopMusic(); intro.remove(); document.body.style.overflow = ''; }
    });

    /* Prevent body scroll while intro visible */
    document.body.style.overflow = 'hidden';
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
