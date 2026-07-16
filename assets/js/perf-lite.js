/* ============================================
   Lightweight performance helpers
   - Prefetch internal links on hover (instant nav feel)
   - Lazy-upgrade images missing loading attr
   - Respect reduced motion
   ============================================ */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Ensure images below fold are lazy
    document.querySelectorAll('img:not([loading])').forEach(function (img, i) {
      // Keep first 1–2 images eager for LCP-ish above fold
      if (i < 1 && img.closest('.hero, .page-header, .assessment-card')) return;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });

    // Prefetch on hover / focus for same-origin HTML navigations
    var prefetched = Object.create(null);
    function prefetch(href) {
      if (!href || prefetched[href]) return;
      if (href.indexOf('http') === 0 && href.indexOf(location.origin) !== 0) return;
      if (href.indexOf('#') === 0) return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      prefetched[href] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
    }

    document.body.addEventListener(
      'pointerenter',
      function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '/') return;
        prefetch(href);
      },
      true
    );
  });
})();
