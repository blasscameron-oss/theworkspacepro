(function () {
  'use strict';

  var controls = document.getElementById('dealFilters');
  var grid = document.getElementById('dealGrid');
  var count = document.getElementById('dealCount');
  var empty = document.getElementById('dealEmpty');
  if (!controls || !grid || !count) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.deal-card'));
  var category = document.getElementById('dealCategory');
  var budget = document.getElementById('dealBudget');
  var reset = document.getElementById('dealReset');
  var validCategories = Array.prototype.map.call(category.options, function (option) { return option.value; });
  var validBudgets = Array.prototype.map.call(budget.options, function (option) { return option.value; });

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function addFitFingerprints() {
    cards.forEach(function (card) {
      if (card.querySelector('.deal-card__fingerprint')) return;
      var categoryLabel = card.querySelector('.deal-card__category');
      var budgetLabel = card.querySelector('.deal-card__budget');
      var description = card.querySelector('.deal-card__desc');
      var visual = document.createElement('div');
      visual.className = 'deal-card__instrument';
      visual.setAttribute('aria-hidden', 'true');
      visual.innerHTML = '<svg width="100%" height="48" viewBox="0 0 320 48" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 24H319M1 16V32M319 16V32" stroke="currentColor"/><path d="M32 20V28M64 18V30M96 20V28M128 18V30M160 16V32M192 18V30M224 20V28M256 18V30M288 20V28" stroke="currentColor"/></svg>';
      var fingerprint = document.createElement('dl');
      fingerprint.className = 'deal-card__fingerprint ps-fingerprint__metrics';
      fingerprint.setAttribute('aria-label', 'Published fit fingerprint');
      fingerprint.innerHTML =
        '<div class="ps-fingerprint__metric"><dt>Category</dt><dd>' + (categoryLabel ? categoryLabel.textContent : '') + '</dd></div>' +
        '<div class="ps-fingerprint__metric"><dt>Reference band</dt><dd>' + (budgetLabel ? budgetLabel.textContent : '') + '</dd></div>' +
        '<div class="ps-fingerprint__metric"><dt>Fit consideration</dt><dd>' + (description ? description.textContent : '') + '</dd></div>';
      card.insertBefore(visual, card.firstChild);
      card.insertBefore(fingerprint, card.querySelector('.deal-card__value'));
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var queryCategory = params.get('category') || 'all';
    var queryBudget = params.get('budget') || 'all';
    if (validCategories.indexOf(queryCategory) !== -1) category.value = queryCategory;
    if (validBudgets.indexOf(queryBudget) !== -1) budget.value = queryBudget;
  }

  function updateQuery() {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams(window.location.search);
    if (category.value === 'all') params.delete('category');
    else params.set('category', category.value);
    if (budget.value === 'all') params.delete('budget');
    else params.set('budget', budget.value);
    var query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
  }

  function applyFilters(shouldTrack) {
    var shown = 0;
    cards.forEach(function (card) {
      var matchesCategory = category.value === 'all' || card.dataset.category === category.value;
      var priceLink = card.querySelector('.deal-card__cta');
      var referencePrice = Number(priceLink && priceLink.dataset.referencePrice) || 0;
      var budgetLimit = budget.value.indexOf('under-') === 0 ? Number(budget.value.slice(6)) : 0;
      var matchesBudget = budget.value === 'all' ||
        (budget.value === 'premium' && referencePrice >= 400) ||
        (budgetLimit > 0 && referencePrice > 0 && referencePrice <= budgetLimit);
      var visible = matchesCategory && matchesBudget;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    count.textContent = shown === cards.length ? cards.length + ' value picks' : 'Showing ' + shown + ' of ' + cards.length + ' value picks';
    if (empty) empty.hidden = shown !== 0;
    updateQuery();
    if (shouldTrack) {
      track('deal_filter', {
        deal_category: category.value,
        deal_budget: budget.value,
        result_count: shown,
        page_path: window.location.pathname
      });
    }
  }

  controls.addEventListener('change', function (event) {
    if (event.target === category || event.target === budget) applyFilters(true);
  });
  if (reset) {
    reset.addEventListener('click', function () {
      category.value = 'all';
      budget.value = 'all';
      applyFilters(true);
      category.focus();
    });
  }
  grid.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('.deal-card__cta');
    if (!link) return;
    track('deal_click', {
      deal_id: link.dataset.dealId || '',
      deal_category: link.dataset.dealCategory || '',
      retailer: link.dataset.retailer || '',
      reference_price: Number(link.dataset.referencePrice) || 0,
      page_path: window.location.pathname
    });
  });

  addFitFingerprints();
  readQuery();
  applyFilters(false);
}());
