/* ============================================
   The Workspace Pro — Bold UI Enhancements v3
   Aggressive design features to outclass competition
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================================
     1. SCROLL-TRIGGERED ANIMATIONS
        Elements with .fade-in-up/.fade-in-left/.fade-in-right animate
        when scrolled into view. Uses IntersectionObserver.
     ======================================================================== */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ========================================================================
     3. TABBED INTERFACES
        Auto-wires [data-tabs] containers with .tab and .tab-panel elements
     ======================================================================== */
  function initTabs() {
    var tabContainers = document.querySelectorAll('[data-tabs]');
    tabContainers.forEach(function (container) {
      var tabs = container.querySelectorAll('.tab');
      var panels = container.querySelectorAll('.tab-panel');

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });
          tab.classList.add('active');
          if (panels[i]) panels[i].classList.add('active');
        });
      });
    });
  }

  /* ========================================================================
     4. ENHANCED ASSESSMENT — Add fade transitions between steps
     ======================================================================== */
  function enhanceAssessment() {
    // Watch for step changes and add fade animation
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'class' && m.target.classList.contains('active')) {
          m.target.style.opacity = '0';
          m.target.style.transform = 'translateX(20px)';
          requestAnimationFrame(function () {
            m.target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            m.target.style.opacity = '1';
            m.target.style.transform = 'translateX(0)';
          });
        }
      });
    });

    document.querySelectorAll('.assessment-step').forEach(function (step) {
      observer.observe(step, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ========================================================================
     5. DEAL OF THE WEEK — Dynamic banner
     ======================================================================== */
  function initDealBanner() {
    var banner = document.getElementById('dealBanner');
    if (!banner) return;

    // Rotate deals weekly
    var deals = [
      {
        badge: 'Deal of the Week',
        title: 'Branch Ergonomic Chair — 15% Off',
        desc: 'Best budget ergonomic chair with full adjustability. Limited time.',
        oldPrice: '$329',
        newPrice: '$280',
        cta: 'Get Deal',
        url: 'https://www.branchfurniture.com/products/ergonomic-chair'
      },
      {
        badge: 'Price Drop',
        title: 'Uplift V2 Standing Desk — $50 Off',
        desc: 'Our top-rated standing desk. Now starting at $549.',
        oldPrice: '$599',
        newPrice: '$549',
        cta: 'View Deal',
        url: 'https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/'
      },
      {
        badge: 'Limited Time',
        title: 'BenQ ScreenBar Plus — 20% Off',
        desc: 'Reduce eye strain with the best monitor light bar on the market.',
        oldPrice: '$109',
        newPrice: '$87',
        cta: 'Get Deal',
        url: 'https://www.benq.com/en-us/monitor-light/bar/monitor-light-screenbar-plus.html'
      }
    ];

    // Pick deal based on week number
    var week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    var deal = deals[week % deals.length];

    banner.querySelector('.deal-banner__badge').textContent = deal.badge;
    banner.querySelector('.deal-banner__title').textContent = deal.title;
    banner.querySelector('.deal-banner__desc').textContent = deal.desc;
    banner.querySelector('.deal-banner__price-old').textContent = deal.oldPrice;
    banner.querySelector('.deal-banner__price-new').textContent = deal.newPrice;
    banner.querySelector('.deal-banner__cta').href = deal.url;
    banner.querySelector('.deal-banner__cta').setAttribute('rel', 'sponsored noopener noreferrer');
  }

  /* ========================================================================
     6. CARD HOVER LIFT — Add lift class to key cards
     ======================================================================== */
  function initCardLift() {
    document.querySelectorAll('.guide-card, .card, .podcast-card, .tip-item').forEach(function (card) {
      card.classList.add('lift-on-hover');
    });
  }

  /* ========================================================================
     7. STAGGER ANIMATIONS — Add stagger class to grids
     ======================================================================== */
  function initStagger() {
    document.querySelectorAll('.guide-grid, .card-grid, .podcast-grid, .tip-list').forEach(function (grid) {
      grid.classList.add('stagger');
      grid.querySelectorAll(':scope > *').forEach(function (child) {
        child.classList.add('fade-in-up');
      });
    });
  }

  /* ========================================================================
     8. TRUST ROW — Inject trust badges below hero
     ======================================================================== */
  function initTrustRow() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var trustData = [
      { icon: '🔬', text: 'Research-backed recommendations' },
      { icon: '💰', text: 'No pay-to-play — ever' },
      { icon: '⚡', text: 'Instant results, no signup' },
      { icon: '🔄', text: 'Updated monthly with new products' },
    ];

    var trustRow = document.createElement('div');
    trustRow.className = 'trust-row';
    trustData.forEach(function (t) {
      var badge = document.createElement('div');
      badge.className = 'trust-badge';
      badge.innerHTML = '<div class="trust-badge__icon">' + t.icon + '</div><span>' + t.text + '</span>';
      trustRow.appendChild(badge);
    });

    hero.parentNode.insertBefore(trustRow, hero.nextSibling);
  }

  // Initialize everything
  initScrollAnimations();
  initTabs();
  enhanceAssessment();
  initDealBanner();
  initCardLift();
  initStagger();
  initTrustRow();
});
