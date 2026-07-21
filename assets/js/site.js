/* ============================================
   The Workspace Pro — Site chrome
   Theme, mobile menu (a11y), sticky UX helpers.
   ============================================ */

(function () {
  'use strict';

  var lastMenuTrigger = null;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
    document.querySelectorAll('.theme-toggle__icon').forEach(function (icon) {
      icon.textContent = theme === 'dark' ? '☀' : '☾';
    });
  }

  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getNavId(nav) {
    if (!nav.id) nav.id = 'mobile-nav';
    return nav.id;
  }

  function getMenuNav() {
    return document.querySelector('.mobile-nav, .editorial-nav');
  }

  function syncMenuToggles(open) {
    document.querySelectorAll('.menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (label.indexOf('close') !== -1 || label.indexOf('open') !== -1) {
        // Prefer keeping authored Open/Close labels on the matching buttons
        if (open && label.indexOf('open') !== -1) {
          /* leave open button label as Open */
        }
      }
    });
  }

  function menuIsMobile() {
    return Boolean(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
  }

  function syncMenuForViewport() {
    var nav = getMenuNav();
    if (!nav) return;
    var open = nav.classList.contains('open') || nav.classList.contains('is-open');
    if (!menuIsMobile()) {
      nav.classList.remove('open', 'is-open');
      nav.inert = false;
      nav.removeAttribute('aria-hidden');
      document.body.classList.remove('menu-open');
      syncMenuToggles(false);
      return;
    }
    nav.inert = !open;
    nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }

  function setMenuOpen(open) {
    var nav = getMenuNav();
    var overlay = document.querySelector('.mobile-overlay');
    if (!nav) return;

    var navId = getNavId(nav);
    var mobile = menuIsMobile();
    if (!mobile) open = false;
    nav.classList.toggle('open', open);
    nav.classList.toggle('is-open', open);
    nav.inert = mobile ? !open : false;
    if (mobile) nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    else nav.removeAttribute('aria-hidden');
    if (overlay) overlay.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', mobile && open);
    document.querySelectorAll('.menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-controls', navId);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    if (mobile && open) {
      if (lastMenuTrigger) lastMenuTrigger.setAttribute('aria-label', 'Close menu');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    } else if (lastMenuTrigger && typeof lastMenuTrigger.focus === 'function') {
      lastMenuTrigger.setAttribute('aria-label', 'Open menu');
      lastMenuTrigger.focus();
      lastMenuTrigger = null;
    }
  }

  function toggleMenu(trigger) {
    var nav = getMenuNav();
    var willOpen = !(nav && (nav.classList.contains('open') || nav.classList.contains('is-open')));
    if (willOpen && trigger) lastMenuTrigger = trigger;
    setMenuOpen(willOpen);
  }

  function initReadingProgress() {
    var article = document.querySelector('.article-body');
    if (!article || !article.querySelector('.toc')) return;

    var progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', 'Article reading progress');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    progress.setAttribute('aria-valuenow', '0');

    var bar = document.createElement('span');
    bar.className = 'reading-progress__bar';
    progress.appendChild(bar);
    document.body.appendChild(progress);

    var queued = false;
    function update() {
      queued = false;
      var articleTop = article.getBoundingClientRect().top + window.scrollY;
      var articleBottom = articleTop + article.offsetHeight;
      var start = articleTop - 64;
      var distance = Math.max(1, articleBottom - window.innerHeight - start);
      var value = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      bar.style.transform = 'scaleX(' + value.toFixed(4) + ')';
      progress.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    }
    function requestUpdate() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferredTheme());
    initReadingProgress();

    var nav = getMenuNav();
    if (nav) {
      var navId = getNavId(nav);
      document.querySelectorAll('.menu-toggle').forEach(function (btn) {
        btn.setAttribute('aria-controls', navId);
        btn.setAttribute('aria-expanded', 'false');
        if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
      });
      syncMenuForViewport();
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    document.querySelectorAll('.menu-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleMenu(btn);
      });
    });

    var overlay = document.querySelector('.mobile-overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        setMenuOpen(false);
      });
    }

    document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta, .editorial-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    window.addEventListener('resize', syncMenuForViewport);

    document.addEventListener('keydown', function (e) {
      var openNav = document.querySelector('.mobile-nav.open, .editorial-nav.is-open');
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !openNav) return;
      var focusable = Array.from(openNav.querySelectorAll('a[href], button:not([disabled])'));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Active nav highlight by path
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav__link').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === '/#assessment' || href.indexOf('#') === 0) return;
      var clean = href.replace(/\/$/, '') || '/';
      if (clean === path || (clean !== '/' && path.indexOf(clean) === 0)) {
        a.classList.add('nav__link--active');
      }
    });

    // Sticky quiz CTA vs back-to-top spacing (mobile)
    try {
      document.documentElement.style.setProperty('--sticky-cta-offset', '0px');
      var sticky = document.getElementById('stickyQuizCta');
      if (sticky) {
        var ro = new MutationObserver(function () {
          var on = sticky.classList.contains('is-visible');
          document.documentElement.style.setProperty(
            '--sticky-cta-offset',
            on ? '72px' : '0px'
          );
        });
        ro.observe(sticky, { attributes: true, attributeFilter: ['class'] });
      }
    } catch (e) {}
  });
})();
