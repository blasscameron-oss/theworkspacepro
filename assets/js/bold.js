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

    // Rotate featured picks weekly — no invented discounts or "sale" prices
    var picks = [
      {
        badge: 'Editor’s pick',
        title: 'Branch Ergonomic Chair',
        desc: 'Solid adjustability in the budget-to-mid range. Confirm live pricing on Branch.',
        priceLabel: 'See live price',
        cta: 'View product',
        url: 'https://www.branchfurniture.com/products/ergonomic-chair'
      },
      {
        badge: 'Standing desks',
        title: 'Uplift V2 Standing Desk',
        desc: 'Highly configurable frame. Check current configuration pricing on Uplift.',
        priceLabel: 'See live price',
        cta: 'View product',
        url: 'https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/'
      },
      {
        badge: 'Lighting',
        title: 'BenQ ScreenBar Plus',
        desc: 'Monitor light bar that frees desk space and cuts glare. Price varies by retailer.',
        priceLabel: 'See live price',
        cta: 'View product',
        url: 'https://www.amazon.com/dp/B07DP7RYXV/?tag=workspacepro-20'
      }
    ];

    var week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    var deal = picks[week % picks.length];

    var badge = banner.querySelector('.deal-banner__badge');
    var title = banner.querySelector('.deal-banner__title');
    var desc = banner.querySelector('.deal-banner__desc');
    var oldP = banner.querySelector('.deal-banner__price-old');
    var newP = banner.querySelector('.deal-banner__price-new');
    var cta = banner.querySelector('.deal-banner__cta');
    if (badge) badge.textContent = deal.badge;
    if (title) title.textContent = deal.title;
    if (desc) desc.textContent = deal.desc;
    if (oldP) oldP.style.display = 'none';
    if (newP) newP.textContent = deal.priceLabel;
    if (cta) {
      cta.href = deal.url;
      cta.textContent = deal.cta + ' →';
      cta.setAttribute('rel', 'sponsored noopener noreferrer');
    }
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
      { icon: '🔬', text: 'Spec-based recommendations' },
      { icon: '💰', text: 'No pay-to-play rankings' },
      { icon: '⚡', text: 'Instant tools, no signup' },
      { icon: '🔗', text: 'Affiliate links disclosed' },
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
