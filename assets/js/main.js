(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Header scroll state                                                 */
  /* ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Mobile drawer                                                       */
  /* ------------------------------------------------------------------ */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.mobile-drawer');
  var backdrop = document.querySelector('.drawer-backdrop');

  function openDrawer() {
    burger.classList.add('is-open');
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    burger.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    burger.classList.remove('is-open');
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && drawer && backdrop) {
    burger.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Language switch (KZ default / RU)                                   */
  /* ------------------------------------------------------------------ */
  var DICT = window.ZAZ_I18N || { kz: {}, ru: {} };
  var STORE_KEY = 'zaz-lang';
  var lang = localStorage.getItem(STORE_KEY) || 'kz';

  function applyLang(l) {
    lang = l;
    document.documentElement.setAttribute('lang', l === 'kz' ? 'kk' : 'ru');
    localStorage.setItem(STORE_KEY, l);
    var dict = DICT[l] || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === l);
    });
  }

  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  applyLang(lang);

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                     */
  /* ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero video: autoplay + attempt sound                                 */
  /* ------------------------------------------------------------------ */
  var heroVideo = document.querySelector('.hero-media video');
  var soundToggle = document.querySelector('.sound-toggle');
  // The hero clip is meant to play through exactly once per visit (voice-over
  // included) and then simply hold on its last frame — never loop or restart.
  var heroEnded = false;

  function tryUnmutedPlay() {
    if (!heroVideo || heroEnded) return;
    heroVideo.muted = false;
    var p = heroVideo.play();
    if (p && p.catch) {
      p.catch(function () {
        if (heroEnded) return;
        heroVideo.muted = true;
        heroVideo.play().catch(function () {});
        if (soundToggle) soundToggle.classList.add('is-muted');
      });
    }
    if (!heroVideo.muted && soundToggle) soundToggle.classList.remove('is-muted');
  }

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(function () {});
    heroVideo.addEventListener('ended', function () {
      heroEnded = true;
      if (soundToggle) soundToggle.style.display = 'none';
    });
    window.addEventListener('load', tryUnmutedPlay);
    var unmuteOnce = function () {
      tryUnmutedPlay();
      document.removeEventListener('click', unmuteOnce);
      document.removeEventListener('touchstart', unmuteOnce);
    };
    document.addEventListener('click', unmuteOnce, { once: true });
    document.addEventListener('touchstart', unmuteOnce, { once: true });
  }
  if (soundToggle) {
    soundToggle.addEventListener('click', function () {
      if (!heroVideo || heroEnded) return;
      if (heroVideo.muted) {
        tryUnmutedPlay();
      } else {
        heroVideo.muted = true;
        soundToggle.classList.add('is-muted');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                        */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('is-open');
      });
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Service tab filter                                                   */
  /* ------------------------------------------------------------------ */
  var tabs = document.querySelectorAll('.service-tab');
  var cards = document.querySelectorAll('.service-card');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        card.style.display = filter === 'all' || cat === filter ? '' : 'none';
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Click-to-play media (gallery + video testimonials).                  */
  /* Delegated on document so carousel-cloned cards work too.             */
  /* ------------------------------------------------------------------ */
  function promoteSrc(video) {
    if (video.dataset && video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.load();
    }
  }

  document.addEventListener('click', function (e) {
    var wrap = e.target.closest('.t-video-frame, .g-card');
    if (!wrap) return;
    var video = wrap.querySelector('video');
    if (!video) return;
    promoteSrc(video);
    if (video.paused) {
      document.querySelectorAll('video').forEach(function (v) {
        if (v !== video && v !== heroVideo) { v.pause(); v.closest('.t-video-frame, .g-card')?.classList.remove('is-playing'); }
      });
      video.muted = false;
      video.play();
      wrap.classList.add('is-playing');
    } else {
      video.pause();
      wrap.classList.remove('is-playing');
    }
  });
  document.addEventListener(
    'pause',
    function (e) {
      var wrap = e.target.closest && e.target.closest('.t-video-frame, .g-card');
      if (wrap) wrap.classList.remove('is-playing');
    },
    true
  );
  document.addEventListener(
    'ended',
    function (e) {
      var wrap = e.target.closest && e.target.closest('.t-video-frame, .g-card');
      if (wrap) wrap.classList.remove('is-playing');
    },
    true
  );

  /* ------------------------------------------------------------------ */
  /* Audio testimonial play buttons (delegated; placeholder waveform UI)  */
  /* ------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.t-audio-play');
    if (!btn) return;
    var card = btn.closest('.t-card');
    var bars = card ? card.querySelectorAll('.t-audio-wave span') : [];
    var playing = btn.getAttribute('data-playing') === '1';
    playing = !playing;
    btn.setAttribute('data-playing', playing ? '1' : '0');
    btn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    bars.forEach(function (b, i) {
      b.style.height = playing ? (30 + ((i * 37) % 65)) + '%' : '40%';
    });
  });

  /* ------------------------------------------------------------------ */
  /* Infinite carousel (testimonials / certificates / gallery)            */
  /* ------------------------------------------------------------------ */
  function initCarousel(root) {
    // `root` is the element carrying [data-carousel], i.e. the viewport itself.
    var viewport = root;
    var track = root.querySelector('.carousel-track');
    var wrap = root.closest('.carousel-wrap') || root.parentElement;
    if (!viewport || !track) return;

    var originalChildren = Array.prototype.slice.call(track.children);
    if (!originalChildren.length) return;

    // Duplicate content once for a seamless loop.
    originalChildren.forEach(function (child) {
      track.appendChild(child.cloneNode(true));
    });

    // Videos in these carousels use data-src (not src) so the browser never
    // fetches them up front — with carousels holding dozens of clips this
    // avoids dozens of simultaneous network requests on page load. Only
    // promote data-src -> src once a card actually scrolls near the visible
    // window (or gets clicked, handled separately in the play handler).
    if ('IntersectionObserver' in window) {
      var lazyIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            promoteSrc(entry.target);
            lazyIO.unobserve(entry.target);
          });
        },
        { root: viewport, rootMargin: '600px', threshold: 0.01 }
      );
      track.querySelectorAll('video[data-src]').forEach(function (v) { lazyIO.observe(v); });
    }

    var speed = parseFloat(root.getAttribute('data-speed') || '0.45');
    var autoplay = root.getAttribute('data-autoplay') !== 'false';
    var setWidth = 0;

    function measure() {
      setWidth = 0;
      for (var i = 0; i < originalChildren.length; i++) {
        var el = track.children[i];
        var style = window.getComputedStyle(track);
        var gap = parseFloat(style.columnGap || style.gap || '0');
        setWidth += el.getBoundingClientRect().width + gap;
      }
    }
    measure();
    window.addEventListener('resize', measure);

    var paused = false;
    var raf = null;
    var lastTs = null;

    function wrap() {
      if (viewport.scrollLeft >= setWidth) viewport.scrollLeft -= setWidth;
      else if (viewport.scrollLeft < 0) viewport.scrollLeft += setWidth;
    }

    function tick(ts) {
      if (!paused && setWidth > 0) {
        if (lastTs == null) lastTs = ts;
        var dt = ts - lastTs;
        lastTs = ts;
        viewport.scrollLeft += speed * (dt / 16.67);
        wrap();
      } else {
        lastTs = null;
      }
      raf = requestAnimationFrame(tick);
    }
    if (autoplay) raf = requestAnimationFrame(tick);

    ['pointerenter', 'touchstart', 'pointerdown'].forEach(function (ev) {
      viewport.addEventListener(ev, function () { paused = true; }, { passive: true });
    });
    ['pointerleave', 'touchend', 'pointerup'].forEach(function (ev) {
      viewport.addEventListener(ev, function () {
        setTimeout(function () { paused = false; }, 900);
      }, { passive: true });
    });

    // Drag to scroll
    var isDown = false, startX = 0, startScroll = 0;
    viewport.addEventListener('pointerdown', function (e) {
      isDown = true;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      viewport.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener('pointerup', function () {
      isDown = false;
      track.classList.remove('is-dragging');
      wrap();
    });

    // Arrows live as siblings of the viewport inside .carousel-wrap.
    var prevBtn = wrap ? wrap.querySelector('.carousel-arrow.prev') : null;
    var nextBtn = wrap ? wrap.querySelector('.carousel-arrow.next') : null;
    function step(dir) {
      var card = track.children[0];
      var cw = card ? card.getBoundingClientRect().width + 22 : 300;
      paused = true;
      viewport.scrollBy({ left: dir * cw * 2, behavior: 'smooth' });
      setTimeout(function () { wrap(); paused = false; }, 500);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ------------------------------------------------------------------ */
  /* Testimonial category tabs                                            */
  /* ------------------------------------------------------------------ */
  var tTabs = document.querySelectorAll('.testi-tabs .carousel-tab[data-target]');
  tTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.getAttribute('data-target');
      tTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.testi-panel').forEach(function (p) {
        p.style.display = p.id === targetId ? '' : 'none';
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Forms — client-side handling.                                        */
  /* TODO(integration): replace submitLead()/submitContact() bodies with  */
  /* a fetch() call to the Twenty CRM webhook endpoint once it is issued. */
  /* ------------------------------------------------------------------ */
  function wireForm(formId, noteSelector) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dict = DICT[lang] || {};
      var note = form.querySelector(noteSelector);
      if (note) note.textContent = dict['form.success'] || 'Thank you!';
      form.reset();
    });
  }
  wireForm('course-lead-form', '.note');
  wireForm('contact-form', '.form-note');
})();
