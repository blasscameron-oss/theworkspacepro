/* ============================================
   The Workspace Pro — Site Enhancements
   Vanilla JS, zero dependencies.
   
   1. Stat counters — animated count-up on scroll
   2. Back-to-top button — appears after 500px
   3. Enhanced reading progress bar — fills as user scrolls
      with percentage tooltip, color change at 90%+, ETA
   4. Copy-to-clipboard — for checklist items
   5. Guide reading progress save/restore (localStorage)
   6. Assessment results saved-state banner (homepage)
   7. Price drop alerts (UI only, lead-gen via newsletter)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* Page capability flags — skip heavy features off-context */
  var path = (location.pathname || '/').replace(/\/$/, '') || '/';
  var isHome = path === '/' || path === '/index.html' || /\/index\.html$/.test(path);
  var isArticle = path.indexOf('/guides/') === 0 || document.querySelector('article, .article-body, .guide-content');
  var hasCounters = !!document.querySelector('[data-counter]');
  var hasAssessment = !!document.getElementById('assessment');
  var TWP_PAGE_FLAGS = {
    counters: hasCounters,
    readingProgress: !!isArticle,
    assessmentBanner: isHome || hasAssessment,
    priceAlerts: !!isArticle && !!document.querySelector('a[href*="amazon.com"]'),
    checklistCopy: !!document.querySelector('.checklist, .checklist__item')
  };


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

  if (TWP_PAGE_FLAGS.counters) initCounters();


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
     3. ENHANCED READING PROGRESS BAR
        A thin colored bar at the very top of the page that fills as
        the user scrolls. Enhanced with:
        - Percentage tooltip on hover
        - Color change to accent when "finished" (90%+)
        - Estimated time remaining based on scroll speed
     ======================================================================== */

  function initReadingProgress() {
    // Only show on pages with an article or guide class on body/content
    var articleBody = document.querySelector(
      '.article-body, .guide-content, [data-reading-progress]'
    );

    if (!articleBody) return null;

    // --- Progress bar container ---
    var wrapper = document.createElement('div');
    wrapper.className = 'reading-progress-wrapper';
    wrapper.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 4px',
      'z-index: 1000',
      'cursor: pointer'
    ].join(';');

    var bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    bar.style.cssText = [
      'height: 100%',
      'width: 0%',
      'transition: width 100ms linear',
      'will-change: width',
      'border-radius: 0 2px 2px 0',
      'position: relative'
    ].join(';');
    bar.setAttribute('aria-hidden', 'true');

    // Tooltip showing percentage
    var tooltip = document.createElement('span');
    tooltip.className = 'reading-progress-tooltip';
    tooltip.style.cssText = [
      'position: absolute',
      'right: 0',
      'top: calc(100% + 6px)',
      'background: var(--c-dark, #1a1815)',
      'color: var(--c-dark-text, #e8e2d9)',
      'font-size: 0.6875rem',
      'font-weight: 600',
      'padding: 2px 8px',
      'border-radius: 4px',
      'white-space: nowrap',
      'opacity: 0',
      'transition: opacity 200ms ease',
      'pointer-events: none',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.15)',
      'line-height: 1.4'
    ].join(';');
    tooltip.textContent = '0%';

    // ETA span within tooltip
    var etaSpan = document.createElement('span');
    etaSpan.style.cssText = 'display:block;font-weight:400;font-size:0.625rem;opacity:0.7';
    etaSpan.textContent = '---';
    tooltip.appendChild(document.createElement('br'));
    tooltip.appendChild(etaSpan);

    // Dark mode friendlier tooltip
    var tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = [
      '[data-theme="dark"] .reading-progress-tooltip {',
      '  background: var(--c-surface, #2a2622) !important;',
      '  color: var(--c-text, #e8e2d9) !important;',
      '  border: 1px solid var(--c-border, #3a3530);',
      '}'
    ].join('\n');
    document.head.appendChild(tooltipStyle);

    wrapper.appendChild(bar);
    wrapper.appendChild(tooltip);
    document.body.appendChild(wrapper);

    // Show/hide tooltip on hover
    wrapper.addEventListener('mouseenter', function () {
      tooltip.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', function () {
      tooltip.style.opacity = '0';
    });

    // --- Scroll tracking with time-remaining estimation ---
    var ticking = false;
    var lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var lastUpdateTime = Date.now();
    var currentPercent = 0;
    var scrollSpeeds = []; // keep last 5 speed samples for smoothing

    var lastPercent = -1;
    var lastEtaText = '';
    var isFinished = false;

    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var percent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      currentPercent = percent;

      // Only update DOM if percent changed by at least 1%
      var roundedPercent = Math.round(percent);
      if (roundedPercent !== Math.round(lastPercent)) {
        // Use transform instead of width for better performance (no layout recalc)
        bar.style.transform = 'scaleX(' + (percent / 100) + ')';
        bar.style.width = '100%';
        tooltip.childNodes[0].textContent = roundedPercent + '%';
        lastPercent = percent;
      }

      // Color change at 90%+ ("finished") — only toggle once
      if (percent >= 90 && !isFinished) {
        isFinished = true;
        bar.style.background = 'var(--c-accent, #4a7c59)';
        etaSpan.textContent = 'Almost done!';
        lastEtaText = 'Almost done!';
      } else if (percent < 90 && isFinished) {
        isFinished = false;
        bar.style.background = 'linear-gradient(90deg, var(--c-primary, #c2410c), var(--c-accent, #4a7c59))';
      }

      // ETA calculation — only update text when it changes (not every frame)
      if (percent < 90) {
        var now = Date.now();
        var dt = now - lastUpdateTime;
        if (dt > 200) { // Less frequent updates for iOS performance
          var scrollDelta = Math.abs(scrollTop - lastScrollTop);
          var speed = scrollDelta / dt;
          scrollSpeeds.push(speed);
          if (scrollSpeeds.length > 5) scrollSpeeds.shift();

          var newEta = '';
          if (scrollSpeeds.length >= 2) {
            var avgSpeed = scrollSpeeds.reduce(function (a, b) { return a + b; }, 0) / scrollSpeeds.length;
            var remainingPixels = docHeight - scrollTop;
            var remainingSec = Math.round((remainingPixels / avgSpeed) / 1000);

            if (remainingSec > 0 && remainingSec < 3600 && avgSpeed > 0.1) {
              newEta = remainingSec < 60 ? remainingSec + ' sec left' : Math.round(remainingSec / 60) + ' min left';
            } else if (remainingSec <= 0) {
              newEta = 'Just a bit more';
            }
          }

          if (newEta !== lastEtaText) {
            etaSpan.textContent = newEta;
            lastEtaText = newEta;
          }

          lastScrollTop = scrollTop;
          lastUpdateTime = now;
        }
      }
    }

    // Use passive listener + rAF for smooth iOS Safari scrolling
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Set initial state
    bar.style.transformOrigin = 'left center';
    updateProgress();

    return {
      getPercent: function () { return currentPercent; }
    };
  }

  var readingProgressAPI = TWP_PAGE_FLAGS.readingProgress ? initReadingProgress() : null;


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

  if (TWP_PAGE_FLAGS.checklistCopy) initClipboardChecklists();


  /* ========================================================================
     5. GUIDE READING PROGRESS SAVE / RESTORE
        - Saves scroll position when leaving a guide page
        - Shows continue-reading cards on guides index page
        - Shows toast when returning to a guide with saved progress
     ======================================================================== */

  function initGuideProgress() {
    var STORAGE_KEY = 'twp-reading-progress';
    var pathname = window.location.pathname;
    var isGuidePage = document.querySelector('.article-body, .guide-content');

    function getSavedProgress() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function saveProgress(data) {
      var items = getSavedProgress();
      // Remove previous entry for this guide
      items = items.filter(function (i) { return i.guideUrl !== data.guideUrl; });
      items.push(data);
      // Keep only last 20
      if (items.length > 20) items = items.slice(-20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // --- On guide pages: save scroll position when leaving ---
    if (isGuidePage) {
      var guideTitle = '';
      var titleEl = document.querySelector('.article-title');
      if (titleEl) guideTitle = titleEl.textContent.trim();

      // Try to extract title from page title as fallback
      if (!guideTitle) {
        var pageTitle = document.title;
        if (pageTitle.indexOf('\u2014') > -1) {
          guideTitle = pageTitle.split('\u2014')[0].trim();
        } else {
          guideTitle = pageTitle;
        }
      }

      function saveCurrentProgress() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var percent = docHeight > 0 ? Math.min(Math.round((scrollTop / docHeight) * 100), 100) : 0;

        if (percent > 5 && percent < 98) {
          saveProgress({
            guideUrl: pathname,
            scrollPercent: percent,
            timestamp: Date.now(),
            guideTitle: guideTitle
          });
        }
      }

      // Save on page hide (covers tab close, navigate away, mobile background)
      if ('visibilitychange' in document) {
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'hidden') {
            saveCurrentProgress();
          }
        });
      }

      // Save on beforeunload
      window.addEventListener('beforeunload', function () {
        saveCurrentProgress();
      });

      // Save periodically too (every 30s while scrolling)
      var periodicSaveTimer = null;
      var periodicTicking = false;
      window.addEventListener('scroll', function () {
        if (!periodicTicking) {
          requestAnimationFrame(function () {
            if (periodicSaveTimer) clearTimeout(periodicSaveTimer);
            periodicSaveTimer = setTimeout(saveCurrentProgress, 30000);
            periodicTicking = false;
          });
          periodicTicking = true;
        }
      }, { passive: true });

      // --- Show toast if returning with saved progress ---
      var savedItems = getSavedProgress();
      var savedForThis = null;
      for (var i = 0; i < savedItems.length; i++) {
        if (savedItems[i].guideUrl === pathname) {
          savedForThis = savedItems[i];
          break;
        }
      }

      if (savedForThis && savedForThis.scrollPercent > 10 && savedForThis.scrollPercent < 95) {
        // Show toast after a short delay
        setTimeout(function () {
          showProgressToast(savedForThis.scrollPercent);
        }, 1500);
      }
    }

    // --- On guides index page: show continue-reading cards ---
    if (pathname.indexOf('/guides') > -1) {
      // Check if we're on the index (not a specific guide sub-page)
      var isGuideIndex = pathname === '/guides/' || pathname === '/guides' || pathname === '/guides.html' || pathname === '/guides/index.html';
      var isGuideSubpage = pathname.match(/^\/guides\/[^\/]+\/?$/);

      if (isGuideIndex || (!isGuideSubpage && pathname.indexOf('/guides/') === 0)) {
        var savedItems = getSavedProgress();
        if (savedItems.length > 0) {
          // Sort by most recent
          savedItems.sort(function (a, b) { return b.timestamp - a.timestamp; });
          // Take top 3
          var recent = savedItems.slice(0, 3);

          // Find the guide-grid and prepend section
          var guideGrid = document.querySelector('.guide-grid');
          if (guideGrid) {
            var continueSection = document.createElement('div');
            continueSection.className = 'continue-reading-section';
            continueSection.innerHTML = [
              '<div class="continue-reading-header">',
              '  <h2 class="continue-reading-title">\u{1F4D6} Continue Reading</h2>',
              '  <p class="continue-reading-desc">Pick up where you left off</p>',
              '</div>',
              '<div class="continue-reading-grid">'
            ].join('\n');

            recent.forEach(function (item) {
              var timeAgo = getTimeAgo(item.timestamp);
              continueSection.innerHTML += [
                '<a href="' + item.guideUrl + '" class="continue-reading-card">',
                '  <div class="continue-reading-card__header">',
                '    <div class="continue-reading-card__title">' + escapeHtml(item.guideTitle || 'Guide') + '</div>',
                '    <div class="continue-reading-card__meta">' + timeAgo + '</div>',
                '  </div>',
                '  <div class="continue-reading-card__progress-bar">',
                '    <div class="continue-reading-card__progress-fill" style="width:' + item.scrollPercent + '%"></div>',
                '  </div>',
                '  <div class="continue-reading-card__stats">',
                '    <span>' + item.scrollPercent + '% read</span>',
                '    <span>Jump to where you left off \u2192</span>',
                '  </div>',
                '</a>'
              ].join('\n');
            });

            continueSection.innerHTML += '</div>';
            guideGrid.parentNode.insertBefore(continueSection, guideGrid);
          }
        }
      }
    }
  }

  function showProgressToast(percent) {
    var existing = document.querySelector('.progress-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'progress-toast';
    toast.style.cssText = [
      'position: fixed',
      'bottom: 24px',
      'right: 24px',
      'z-index: 9999',
      'background: var(--c-surface, #fff)',
      'border: 1px solid var(--c-border, #e8e2d9)',
      'border-radius: 12px',
      'padding: 16px 20px',
      'box-shadow: 0 8px 32px rgba(26,24,21,0.12)',
      'max-width: 340px',
      'transform: translateY(20px)',
      'opacity: 0',
      'transition: transform 300ms ease, opacity 300ms ease',
      'font-size: 0.875rem'
    ].join(';');

    toast.innerHTML = [
      '<div style="display:flex;align-items:flex-start;gap:12px;">',
      '  <span style="font-size:1.25rem;">\u{1F44B}</span>',
      '  <div style="flex:1;">',
      '    <div style="font-weight:600;color:var(--c-text,#1a1815);margin-bottom:4px;">Welcome back!</div>',
      '    <div style="color:var(--c-text-light,#6b6660);font-size:0.8125rem;margin-bottom:12px;">',
      '      Jump to ' + percent + '% where you left off?',
      '    </div>',
      '    <div style="display:flex;gap:8px;">',
      '      <button class="progress-toast__yes btn btn--primary btn--sm" style="padding:6px 16px;font-size:0.8125rem;">Yes</button>',
      '      <button class="progress-toast__no" style="padding:6px 16px;font-size:0.8125rem;background:transparent;border:1px solid var(--c-border,#e8e2d9);border-radius:8px;cursor:pointer;color:var(--c-text-light,#6b6660);">No</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(function () {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    toast.querySelector('.progress-toast__yes').addEventListener('click', function () {
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var target = (percent / 100) * docHeight;
      window.scrollTo({ top: target, behavior: 'smooth' });
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    });

    toast.querySelector('.progress-toast__no').addEventListener('click', function () {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    });

    // Auto-dismiss after 15 seconds
    setTimeout(function () {
      if (document.body.contains(toast)) {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 300);
      }
    }, 15000);
  }

  function getTimeAgo(timestamp) {
    var diff = Date.now() - timestamp;
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    var weeks = Math.floor(days / 7);
    return weeks + 'w ago';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  if (TWP_PAGE_FLAGS.readingProgress) initGuideProgress();


  /* ========================================================================
     6. ASSESSMENT RESULTS SAVE — Homepage banner
        On the homepage, checks for saved assessment results and shows
        a "View your last results" banner.
     ======================================================================== */

  function initAssessmentBanner() {
    var pathname = window.location.pathname;
    // Only show on homepage
    if (pathname !== '/' && pathname !== '/index.html') return;

    try {
      var savedResults = JSON.parse(localStorage.getItem('twp-assessment-results'));
      if (!savedResults || !savedResults.persona) return;

      // Don't show if results are older than 30 days
      var thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - savedResults.timestamp > thirtyDays) return;

      var banner = document.createElement('div');
      banner.className = 'assessment-results-banner';
      banner.style.cssText = [
        'background: var(--c-surface, #fff)',
        'border: 2px solid var(--c-primary-soft, #fed7aa)',
        'border-radius: 12px',
        'padding: 16px 20px',
        'margin-bottom: 24px',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'gap: 16px',
        'flex-wrap: wrap',
        'box-shadow: 0 4px 12px rgba(194,65,12,0.08)'
      ].join(';');

      var dateStr = new Date(savedResults.timestamp).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      banner.innerHTML = [
        '<div style="display:flex;align-items:center;gap:12px;">',
        '  <span style="font-size:1.5rem;">\u{1F3C6}</span>',
        '  <div>',
        '    <div style="font-weight:600;color:var(--c-text,#1a1815);font-size:0.9375rem;">Welcome back!</div>',
        '    <div style="color:var(--c-text-light,#6b6660);font-size:0.8125rem;">',
        '      Your last assessment: ' + escapeHtml(savedResults.persona) + ' persona \u2022 ' + dateStr,
        '    </div>',
        '  </div>',
        '</div>',
        '<a href="#assessment-card" class="btn btn--primary btn--sm" style="padding:8px 20px;font-size:0.8125rem;flex-shrink:0;">',
        '  View your results \u2192',
        '</a>',
        '<button class="assessment-banner__dismiss" aria-label="Dismiss" style="background:none;border:none;cursor:pointer;color:var(--c-text-muted,#9a948c);font-size:1.25rem;line-height:1;padding:4px;">',
        '  \u00d7',
        '</button>'
      ].join('\n');

      // Insert after the hero grid area
      var heroGrid = document.querySelector('.hero__grid');
      if (heroGrid) {
        heroGrid.parentNode.insertBefore(banner, heroGrid);
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  if (TWP_PAGE_FLAGS.assessmentBanner) initAssessmentBanner();


  /* ========================================================================
     7. PRICE DROP ALERTS (UI only, no backend)
        Adds a small bell button next to key affiliate products on guide
        pages. Clicking opens a modal with an email input. On submit,
        saves to localStorage and routes to newsletter signup.
     ======================================================================== */

  function initPriceAlerts() {
    var isGuidePage = document.querySelector('.article-body, .guide-content');
    if (!isGuidePage) return;

    // Find product blocks — look for surface-background divs that contain sponsored links
    var productBlocks = document.querySelectorAll('[style*="background:var(--color-surface)"], [style*="background:var(--c-surface)"]');
    var processed = 0;

    productBlocks.forEach(function (block) {
      // Only match blocks that contain affiliate links
      var links = block.querySelectorAll('a[rel*="sponsored"]');
      if (links.length === 0) return;

      // Find or extract product name
      var heading = block.querySelector('h4, h3, strong');
      var productName = heading ? heading.textContent.trim() : 'this product';

      // Only add to price-tier pick blocks (Pick of the Tier / Top Tier)
      if (productName.indexOf('Pick of the Tier') === -1 &&
          productName.indexOf('Top Tier') === -1) {
        return;
      }

      // Limit to 3 alerts per page
      if (processed >= 3) return;

      var alertBtn = document.createElement('button');
      alertBtn.className = 'price-alert-btn';
      alertBtn.setAttribute('aria-label', 'Set price alert for ' + productName);
      alertBtn.innerHTML = '\u{1F514} Price Alert';
      alertBtn.style.cssText = [
        'display: inline-flex',
        'align-items: center',
        'gap: 6px',
        'padding: 4px 12px',
        'font-size: 0.75rem',
        'font-weight: 600',
        'background: var(--c-bg-alt, #f3efe9)',
        'color: var(--c-primary, #c2410c)',
        'border: 1px solid var(--c-primary-soft, #fed7aa)',
        'border-radius: 999px',
        'cursor: pointer',
        'transition: all 200ms ease',
        'margin-top: 8px',
        'line-height: 1.4'
      ].join(';');

      var lastP = block.querySelector('p:last-of-type');
      if (lastP) {
        lastP.parentNode.insertBefore(alertBtn, lastP.nextSibling);
      } else {
        block.appendChild(alertBtn);
      }

      alertBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showPriceAlertModal(productName);
      });

      processed++;
    });
  }

  function showPriceAlertModal(productName) {
    var existing = document.querySelector('.price-alert-overlay');
    if (existing) existing.remove();

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'price-alert-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'inset: 0',
      'background: rgba(0,0,0,0.5)',
      'z-index: 10000',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'padding: 20px',
      'opacity: 0',
      'transition: opacity 300ms ease'
    ].join(';');

    // Modal
    var modal = document.createElement('div');
    modal.className = 'price-alert-modal';
    modal.style.cssText = [
      'background: var(--c-surface, #fff)',
      'border: 1px solid var(--c-border, #e8e2d9)',
      'border-radius: 16px',
      'padding: 32px',
      'max-width: 420px',
      'width: 100%',
      'box-shadow: 0 24px 64px rgba(0,0,0,0.2)',
      'position: relative',
      'transform: scale(0.95) translateY(10px)',
      'transition: transform 300ms ease'
    ].join(';');

    modal.innerHTML = [
      '<button class="price-alert-close" aria-label="Close" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--c-text-muted,#9a948c);line-height:1;padding:4px;">\u00d7</button>',
      '<div style="text-align:center;margin-bottom:24px;">',
      '  <div style="font-size:2.5rem;margin-bottom:12px;">\u{1F514}</div>',
      '  <h3 style="font-family:var(--font-display);font-size:1.125rem;font-weight:600;margin:0 0 8px;color:var(--c-text,#1a1815);">Price Alert</h3>',
      '  <p style="font-size:0.875rem;color:var(--c-text-light,#6b6660);margin:0;">Get notified when <strong>' + escapeHtml(productName) + '</strong> drops in price.</p>',
      '</div>',
      '<div>',
      '  <label for="price-alert-email" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;color:var(--c-text,#1a1815);">Your email</label>',
      '  <input type="email" id="price-alert-email" placeholder="you@example.com" style="width:100%;padding:12px 16px;border:2px solid var(--c-border,#e8e2d9);border-radius:10px;font-size:0.9375rem;background:var(--c-bg,#faf8f5);color:var(--c-text,#1a1815);box-sizing:border-box;">',
      '  <div id="price-alert-error" style="color:var(--c-error,#b91c1c);font-size:0.75rem;margin-top:4px;display:none;">Please enter a valid email address.</div>',
      '</div>',
      '<button id="priceAlertSubmit" class="btn btn--primary" style="width:100%;margin-top:16px;padding:12px;font-size:0.9375rem;">Notify Me</button>',
      '<p style="font-size:0.75rem;color:var(--c-text-muted,#9a948c);text-align:center;margin:12px 0 0;">',
      '  No spam, unsubscribe anytime. Price tracking activates when you subscribe to our newsletter.',
      '</p>'
    ].join('\n');

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
    });

    // Close handlers
    function closeModal() {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(function () { overlay.remove(); }, 300);
    }

    overlay.querySelector('.price-alert-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    function onKeydown(e) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', onKeydown);

    // Submit handler
    var emailInput = overlay.querySelector('#price-alert-email');
    var errorEl = overlay.querySelector('#price-alert-error');
    var submitBtn = overlay.querySelector('#priceAlertSubmit');

    submitBtn.addEventListener('click', function () {
      var email = emailInput.value.trim();
      var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!email || !isValid) {
        errorEl.style.display = 'block';
        emailInput.style.borderColor = 'var(--c-error,#b91c1c)';
        return;
      }

      errorEl.style.display = 'none';
      emailInput.style.borderColor = 'var(--c-border,#e8e2d9)';

      // Save to localStorage
      var alerts = [];
      try {
        alerts = JSON.parse(localStorage.getItem('twp-price-alerts')) || [];
      } catch (e) {}

      alerts.push({
        product: productName,
        email: email,
        timestamp: Date.now()
      });

      localStorage.setItem('twp-price-alerts', JSON.stringify(alerts));

      // Show success message
      modal.innerHTML = [
        '<div style="text-align:center;padding:20px 0;">',
        '  <div style="font-size:3rem;margin-bottom:16px;">\u2705</div>',
        '  <h3 style="font-family:var(--font-display);font-size:1.125rem;font-weight:600;margin:0 0 8px;color:var(--c-text,#1a1815);">You\'re all set!</h3>',
        '  <p style="font-size:0.875rem;color:var(--c-text-light,#6b6660);margin:0 0 16px;">',
        '    We\'ll watch <strong>' + escapeHtml(productName) + '</strong> for you!',
        '  </p>',
        '  <p style="font-size:0.75rem;color:var(--c-text-muted,#9a948c);">',
        '    Note: Price tracking activates when you subscribe to our newsletter.',
        '  </p>',
        '  <a href="https://theworkspacepro.beehiiv.com/subscribe" target="_blank" rel="noopener" class="btn btn--primary" style="margin-top:8px;">',
        '    Subscribe to Newsletter \u2192',
        '  </a>',
        '  <button class="price-alert-close-success" style="display:block;margin:12px auto 0;background:none;border:none;cursor:pointer;font-size:0.8125rem;color:var(--c-text-muted,#9a948c);text-decoration:underline;">Close</button>',
        '</div>'
      ].join('\n');

      modal.querySelector('.price-alert-close-success').addEventListener('click', closeModal);
    });

    // Enter key in email field triggers submit
    emailInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitBtn.click();
    });

    // Focus email input
    setTimeout(function () { emailInput.focus(); }, 400);
  }

  if (TWP_PAGE_FLAGS.priceAlerts) initPriceAlerts();


  /* ========================================================================
     ADD / UPDATE STYLES FOR ALL ENHANCEMENT ELEMENTS
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
   '.reading-progress-wrapper {',
   '  pointer-events: auto;',
   '  transform: translateZ(0);',
   '}',
   '.reading-progress-bar {',
   '  pointer-events: none;',
   '  will-change: transform;',
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
    '/* Continue Reading section on guides index */',
    '.continue-reading-section {',
    '  margin-bottom: var(--space-2xl, 4rem);',
    '  padding: var(--space-xl, 2.5rem);',
    '  background: var(--c-surface, #fff);',
    '  border-radius: var(--radius-lg, 16px);',
    '  border: 2px solid var(--c-primary-soft, #fed7aa);',
    '  box-shadow: 0 4px 16px rgba(194,65,12,0.06);',
    '}',
    '.continue-reading-header {',
    '  margin-bottom: var(--space-lg, 1.5rem);',
    '}',
    '.continue-reading-title {',
    '  font-family: var(--font-display);',
    '  font-size: 1.25rem;',
    '  font-weight: 600;',
    '  margin: 0 0 var(--space-xs, 0.25rem);',
    '  color: var(--c-text, #1a1815);',
    '}',
    '.continue-reading-desc {',
    '  color: var(--c-text-light, #6b6660);',
    '  font-size: 0.875rem;',
    '  margin: 0;',
    '}',
    '.continue-reading-grid {',
    '  display: grid;',
    '  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));',
    '  gap: var(--space-md, 1rem);',
    '}',
    '.continue-reading-card {',
    '  display: block;',
    '  background: var(--c-bg-alt, #f3efe9);',
    '  padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);',
    '  border-radius: var(--radius, 8px);',
    '  text-decoration: none;',
    '  transition: all 200ms ease;',
    '  border: 1px solid var(--c-border, #e8e2d9);',
    '}',
    '.continue-reading-card:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: var(--shadow-md, 0 4px 12px rgba(26,24,21,0.06));',
    '  border-color: var(--c-primary, #c2410c);',
    '}',
    '.continue-reading-card__header {',
    '  display: flex;',
    '  align-items: flex-start;',
    '  justify-content: space-between;',
    '  gap: var(--space-sm, 0.5rem);',
    '  margin-bottom: var(--space-sm, 0.5rem);',
    '}',
    '.continue-reading-card__title {',
    '  font-weight: 600;',
    '  font-size: 0.9375rem;',
    '  color: var(--c-text, #1a1815);',
    '  line-height: 1.3;',
    '}',
    '.continue-reading-card__meta {',
    '  font-size: 0.75rem;',
    '  color: var(--c-text-muted, #9a948c);',
    '  white-space: nowrap;',
    '  flex-shrink: 0;',
    '}',
    '.continue-reading-card__progress-bar {',
    '  height: 4px;',
    '  background: var(--c-border, #e8e2d9);',
    '  border-radius: 2px;',
    '  overflow: hidden;',
    '  margin-bottom: var(--space-xs, 0.25rem);',
    '}',
    '.continue-reading-card__progress-fill {',
    '  height: 100%;',
    '  background: var(--c-primary, #c2410c);',
    '  border-radius: 2px;',
    '  transition: width 300ms ease;',
    '}',
    '.continue-reading-card__stats {',
    '  display: flex;',
    '  justify-content: space-between;',
    '  font-size: 0.75rem;',
    '  color: var(--c-text-light, #6b6660);',
    '}',
    '.continue-reading-card__stats span:last-child {',
    '  color: var(--c-primary, #c2410c);',
    '  font-weight: 500;',
    '}',
    '',
    '/* Progress toast dark mode */',
    '[data-theme="dark"] .progress-toast {',
    '  background: var(--c-surface, #2a2622) !important;',
    '  border-color: var(--c-dark-border, #3a3530) !important;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;',
    '}',
    '[data-theme="dark"] .progress-toast__yes {',
    '  background: var(--c-primary, #f97316) !important;',
    '}',
    '',
    '/* Price alert button hover */',
    '.price-alert-btn:hover {',
    '  background: var(--c-primary, #c2410c) !important;',
    '  color: #fff !important;',
    '  border-color: var(--c-primary, #c2410c) !important;',
    '}',
    '',
    '/* Price alert modal dark mode */',
    '[data-theme="dark"] .price-alert-modal {',
    '  background: var(--c-surface, #2a2622) !important;',
    '  border-color: var(--c-dark-border, #3a3530) !important;',
    '}',
    '[data-theme="dark"] .price-alert-modal input {',
    '  background: var(--c-bg-alt, #26221e) !important;',
    '  color: var(--c-text, #e8e2d9) !important;',
    '  border-color: var(--c-dark-border, #3a3530) !important;',
    '}',
    '',
    '/* Assessment results banner dark mode */',
    '[data-theme="dark"] .assessment-results-banner {',
    '  background: var(--c-surface, #2a2622) !important;',
    '  border-color: var(--c-primary-soft, #431407) !important;',
    '}',
    '',
    '/* Print: hide enhancement UI */',
    '@media print {',
    '  .back-to-top,',
    '  .reading-progress-wrapper,',
    '  .reading-progress-bar,',
    '  .checklist__copy,',
    '  .price-alert-btn,',
    '  .price-alert-overlay,',
    '  .progress-toast {',
    '    display: none !important;',
    '  }',
    '}'
  ].join('\n');
  document.head.appendChild(styleEl);

});
