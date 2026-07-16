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

  function setMenuOpen(open) {
    var nav = document.querySelector('.mobile-nav');
    var overlay = document.querySelector('.mobile-overlay');
    if (!nav) return;

    var navId = getNavId(nav);
    nav.classList.toggle('open', open);
    nav.inert = !open;
    nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (overlay) overlay.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    document.querySelectorAll('.menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-controls', navId);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    if (open) {
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
    var nav = document.querySelector('.mobile-nav');
    var willOpen = !(nav && nav.classList.contains('open'));
    if (willOpen && trigger) lastMenuTrigger = trigger;
    setMenuOpen(willOpen);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferredTheme());

    var nav = document.querySelector('.mobile-nav');
    if (nav) {
      var navId = getNavId(nav);
      document.querySelectorAll('.menu-toggle').forEach(function (btn) {
        btn.setAttribute('aria-controls', navId);
        btn.setAttribute('aria-expanded', 'false');
        if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
      });
      nav.inert = true;
      nav.setAttribute('aria-hidden', 'true');
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

    document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      var openNav = document.querySelector('.mobile-nav.open');
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
