/* ============================================
   The Workspace Pro — Site Enhancements
   Vanilla JS, zero dependencies.
   
   1. Stat counters — animated count-up on scroll
   2. Back-to-top button — appears after 500px
   3. Reading progress bar — fills as user scrolls
   4. Copy-to-clipboard — for checklist items
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================================
     1. ANIMATED STAT COUNTERS
        Counts up from 0 to the element's data-target value when it
        scrolls into view. Uses IntersectionObserver for performance.
     ======================================================================== */

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    // If IntersectionObserver is not supported, just show the numbers
    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-target') || el.textContent;
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10) || 0;
          var suffix = el.getAttribute('data-suffix') || '';
          var prefix = el.getAttribute('data-prefix') || '';
          var duration = parseInt(el.getAttribute('data-duration'), 10) || 1500;
          var start = 0;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out quad for a smooth deceleration
            var eased = 1 - Math.pow(1 - progress, 2);
            var current = Math.round(eased * target);

            el.textContent = prefix + current.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = prefix + target.toLocaleString() + suffix;
            }
          }

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  initCounters();


  /* ========================================================================
     2. BACK-TO-TOP BUTTON
        A floating button that appears after scrolling 500px down.
        Smooth-scrolls to the top when clicked.
     ======================================================================== */

  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    btn.style.cssText = [
      'position: fixed',
      'bottom: 32px',
      'right: 32px',
      'z-index: 999',
      'width: 48px',
      'height: 48px',
      'border-radius: 50%',
      'background: var(--c-primary, #c2410c)',
      'color: #fff',
      'border: none',
      'cursor: pointer',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'box-shadow: 0 4px 16px rgba(194,65,12,0.3)',
      'opacity: 0',
      'visibility: hidden',
      'transform: translateY(12px)',
      'transition: opacity 300ms ease, transform 300ms ease, visibility 300ms ease',
      'will-change: transform'
    ].join(';');

    document.body.appendChild(btn);

    var scrollThreshold = 500;
    var ticking = false;

    function updateVisibility() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > scrollThreshold) {
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
        btn.style.transform = 'translateY(0)';
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
        btn.style.transform = 'translateY(12px)';
      }
    }

    // Throttled scroll listener using requestAnimationFrame
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Check initial state
    updateVisibility();

    // Smooth scroll to top
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  initBackToTop();


  /* ========================================================================
     3. READING PROGRESS BAR
        A thin colored bar at the very top of the page that fills as
        the user scrolls. Only activates on guide/article pages.
     ======================================================================== */

  function initReadingProgress() {
    // Only show on pages with an article or guide class on body/content
    var articleBody = document.querySelector(
      '.article-body, .guide-content, [data-reading-progress]'
    );

    if (!articleBody) return;

    var bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    bar.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'height: 3px',
      'z-index: 1000',
      'background: linear-gradient(90deg, var(--c-primary, #c2410c), var(--c-accent, #4a7c59))',
      'width: 0%',
      'transition: width 100ms linear',
      'will-change: width'
    ].join(';');

    document.body.appendChild(bar);

    var ticking = false;

    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = percent + '%';
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Set initial width
    updateProgress();
  }

  initReadingProgress();


  /* ========================================================================
     4. COPY-TO-CLIPBOARD FOR CHECKLIST ITEMS
        Adds a small copy button next to each checklist item.
        Copies the item text to clipboard with feedback.
     ======================================================================== */

  function initClipboardChecklists() {
    var checklists = document.querySelectorAll('.checklist');

    if (!checklists.length) return;

    checklists.forEach(function (list) {
      var items = list.querySelectorAll('.checklist__item');

      items.forEach(function (item) {
        // Get the text content (trimmed)
        var text = item.textContent.trim();

        // Create copy button
        var copyBtn = document.createElement('button');
        copyBtn.className = 'checklist__copy';
        copyBtn.setAttribute('aria-label', 'Copy this item');
        copyBtn.innerHTML = [
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"',
          '     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
          '  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>',
          '  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
          '</svg>'
        ].join('');

        copyBtn.style.cssText = [
          'flex-shrink: 0',
          'width: 28px',
          'height: 28px',
          'display: inline-flex',
          'align-items: center',
          'justify-content: center',
          'background: transparent',
          'border: 1px solid var(--c-border, #e8e2d9)',
          'border-radius: 4px',
          'cursor: pointer',
          'color: var(--c-text-muted, #9a948c)',
          'transition: color 200ms ease, background 200ms ease, border-color 200ms ease',
          'margin-left: auto',
          'padding: 0',
          'line-height: 1'
        ].join('');

        // Wrap the item content so we can use flex layout
        // Add the copy button as a child
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';
        item.appendChild(copyBtn);

        // Click handler
        copyBtn.addEventListener('click', function (e) {
          e.stopPropagation();

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
              showCopyFeedback(copyBtn, true);
            }).catch(function () {
              // Fallback: select and copy via execCommand
              fallbackCopy(text, copyBtn);
            });
          } else {
            fallbackCopy(text, copyBtn);
          }
        });

        // Hover effect
        copyBtn.addEventListener('mouseenter', function () {
          copyBtn.style.borderColor = 'var(--c-primary, #c2410c)';
          copyBtn.style.color = 'var(--c-primary, #c2410c)';
        });

        copyBtn.addEventListener('mouseleave', function () {
          if (!copyBtn.classList.contains('checklist__copy--done')) {
            copyBtn.style.borderColor = 'var(--c-border, #e8e2d9)';
            copyBtn.style.color = 'var(--c-text-muted, #9a948c)';
          }
        });
      });
    });
  }

  function fallbackCopy(text, btn) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      var success = document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopyFeedback(btn, success);
    } catch (err) {
      showCopyFeedback(btn, false);
    }
  }

  function showCopyFeedback(btn, success) {
    var originalHTML = btn.innerHTML;

    if (success) {
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      btn.style.borderColor = 'var(--c-accent, #4a7c59)';
      btn.style.color = 'var(--c-accent, #4a7c59)';
      btn.style.background = 'var(--c-accent-soft, #d1e7d5)';
      btn.classList.add('checklist__copy--done');
    } else {
      btn.innerHTML = '&#10005;';
      btn.style.borderColor = 'var(--c-error, #b91c1c)';
      btn.style.color = 'var(--c-error, #b91c1c)';
    }

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.style.borderColor = 'var(--c-border, #e8e2d9)';
      btn.style.color = 'var(--c-text-muted, #9a948c)';
      btn.style.background = 'transparent';
      btn.classList.remove('checklist__copy--done');
    }, 2000);
  }

  initClipboardChecklists();


  /* ========================================================================
     ADD STYLES FOR THE ENHANCEMENT ELEMENTS
     Injected via JS so no extra CSS file is needed.
     ======================================================================== */

  var styleEl = document.createElement('style');
  styleEl.textContent = [
    '/* Back-to-top button — dark mode compat */',
    '[data-theme="dark"] .back-to-top {',
    '  background: var(--c-primary, #f97316) !important;',
    '  box-shadow: 0 4px 16px rgba(249,115,22,0.3) !important;',
    '}',
    '',
    '/* Reading progress bar sits atop everything */',
    '.reading-progress-bar {',
    '  pointer-events: none;',
    '}',
    '',
    '/* Checklist copy button spacing fix */',
    '.checklist__item {',
    '  position: relative;',
    '}',
    '.checklist__copy svg {',
    '  display: block;',
    '}',
    '',
    '/* Copy feedback animation */',
    '.checklist__copy--done {',
    '  animation: copy-pop 300ms ease;',
    '}',
    '@keyframes copy-pop {',
    '  0% { transform: scale(1); }',
    '  50% { transform: scale(1.15); }',
    '  100% { transform: scale(1); }',
    '}',
    '',
    '/* Print: hide enhancement UI */',
    '@media print {',
    '  .back-to-top,',
    '  .reading-progress-bar,',
    '  .checklist__copy {',
    '    display: none !important;',
    '  }',
    '}'
  ].join('\n');
  document.head.appendChild(styleEl);

});
