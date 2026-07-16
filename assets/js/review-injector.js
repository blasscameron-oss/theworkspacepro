/* ============================================
   Affiliate link helper (guides)
   Ensures Amazon links keep affiliate tagging.
   Does NOT inject star ratings or review quotes —
   we don't display unverified "review widgets".
   ============================================ */

(function () {
  'use strict';

  var AFFILIATE_TAG = 'workspacepro-20';

  function ensureAmazonTag(href) {
    if (!href || href.indexOf('amazon.') === -1) return href;
    try {
      var u = new URL(href, window.location.origin);
      // Only rewrite amazon.com product URLs we control
      if (!/amazon\./i.test(u.hostname)) return href;
      if (!u.searchParams.get('tag')) {
        u.searchParams.set('tag', AFFILIATE_TAG);
      } else if (u.searchParams.get('tag') !== AFFILIATE_TAG) {
        u.searchParams.set('tag', AFFILIATE_TAG);
      }
      return u.toString();
    } catch (e) {
      if (href.indexOf('tag=') === -1) {
        return href + (href.indexOf('?') >= 0 ? '&' : '?') + 'tag=' + AFFILIATE_TAG;
      }
      return href;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll(
      'a[href*="amazon.com"], a[href*="amzn.to"]'
    );

    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Tag direct amazon.com links
      if (/amazon\.com/i.test(href)) {
        var next = ensureAmazonTag(href);
        if (next !== href) link.setAttribute('href', next);
      }

      // Honest link attributes
      var rel = (link.getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('sponsored') === -1) {
        link.setAttribute(
          'rel',
          (rel + ' sponsored noopener noreferrer').trim()
        );
      }
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
    });

    // Optional honest research badge (not a fake "expert review" score)
    var articleHeader = document.querySelector('.article-header, article > header');
    if (articleHeader && !articleHeader.querySelector('.research-badge')) {
      var badge = document.createElement('div');
      badge.className = 'research-badge';
      badge.innerHTML =
        '<span class="research-badge__icon">✓</span>' +
        '<span class="research-badge__text"><strong>Research-based</strong> · Specs and ergonomic guidelines — not fabricated user reviews</span>';
      articleHeader.appendChild(badge);
    }
  });
})();
