/* ============================================
   Compare matrix — filterable product grid
   Data: /assets/data/products-matrix.json
   Shareable query: ?category=chair&budget=under-350&q=
   ============================================ */
(function () {
  'use strict';

  var state = { category: 'all', budget: 'all', q: '' };
  var products = [];
  var filtersMeta = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readQuery() {
    try {
      var p = new URLSearchParams(location.search);
      state.category = p.get('category') || 'all';
      state.budget = p.get('budget') || 'all';
      state.q = p.get('q') || '';
    } catch (e) {}
  }

  function writeQuery() {
    try {
      var p = new URLSearchParams();
      if (state.category && state.category !== 'all') p.set('category', state.category);
      if (state.budget && state.budget !== 'all') p.set('budget', state.budget);
      if (state.q) p.set('q', state.q);
      var qs = p.toString();
      var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
      history.replaceState(null, '', url);
    } catch (e) {}
  }

  function budgetOk(prod) {
    if (state.budget === 'all') return true;
    var order = ['under-150', 'under-350', 'under-600', 'under-1000', 'premium'];
    var want = order.indexOf(state.budget);
    var got = order.indexOf(prod.budget || 'premium');
    if (want < 0) return true;
    // "under-X" means price tier at or below that band
    if (state.budget.indexOf('under-') === 0) return got <= want;
    return got === want;
  }

  function filtered() {
    var q = (state.q || '').trim().toLowerCase();
    return products.filter(function (p) {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (!budgetOk(p)) return false;
      if (q) {
        var blob = (p.name + ' ' + (p.blurb || '') + ' ' + (p.categoryLabel || '')).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function priceLabel(p) {
    if (p.price == null) return 'See price';
    return '~$' + p.price;
  }

  function render() {
    var grid = $('#matrixGrid');
    var count = $('#matrixCount');
    if (!grid) return;
    var list = filtered();
    if (count) count.textContent = list.length + ' product' + (list.length === 1 ? '' : 's');

    if (!list.length) {
      grid.innerHTML =
        '<p class="matrix-empty">No products match. Try clearing filters or searching a different term.</p>';
      return;
    }

    grid.innerHTML = list
      .map(function (p) {
        var img = p.image
          ? '<img class="matrix-card__img" src="' +
            escapeHtml(p.image) +
            '" alt="" width="72" height="72" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
          : '<div class="matrix-card__img matrix-card__img--ph" aria-hidden="true">📦</div>';
        var rel = p.asin ? ' rel="sponsored noopener noreferrer" target="_blank"' : ' rel="noopener noreferrer" target="_blank"';
        return (
          '<article class="matrix-card">' +
          img +
          '<div class="matrix-card__body">' +
          '<div class="matrix-card__cat">' +
          escapeHtml(p.categoryLabel || p.category) +
          '</div>' +
          '<h3 class="matrix-card__title">' +
          escapeHtml(p.name) +
          '</h3>' +
          (p.blurb ? '<p class="matrix-card__blurb">' + escapeHtml(p.blurb) + '</p>' : '') +
          '<div class="matrix-card__meta">' +
          '<span class="matrix-card__price">' +
          escapeHtml(priceLabel(p)) +
          '</span>' +
          '<span class="matrix-card__price-note">check live</span>' +
          '</div>' +
          '<a class="matrix-card__link" href="' +
          escapeHtml(p.url) +
          '"' +
          rel +
          '>View product →</a>' +
          '</div></article>'
        );
      })
      .join('');
  }

  function syncControls() {
    var cat = $('#filterCategory');
    var bud = $('#filterBudget');
    var q = $('#filterSearch');
    if (cat) cat.value = state.category;
    if (bud) bud.value = state.budget;
    if (q) q.value = state.q;
  }

  function bind() {
    var cat = $('#filterCategory');
    var bud = $('#filterBudget');
    var q = $('#filterSearch');
    if (cat)
      cat.addEventListener('change', function () {
        state.category = cat.value;
        writeQuery();
        render();
      });
    if (bud)
      bud.addEventListener('change', function () {
        state.budget = bud.value;
        writeQuery();
        render();
      });
    if (q)
      q.addEventListener('input', function () {
        state.q = q.value;
        writeQuery();
        render();
      });
    var clear = $('#filterClear');
    if (clear)
      clear.addEventListener('click', function () {
        state = { category: 'all', budget: 'all', q: '' };
        syncControls();
        writeQuery();
        render();
      });
  }

  function load() {
    readQuery();
    bind();
    syncControls();
    fetch('/assets/data/products-matrix.json', { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('matrix load failed');
        return r.json();
      })
      .then(function (data) {
        products = data.products || [];
        filtersMeta = data.filters;
        render();
        if (typeof gtag === 'function') {
          gtag('event', 'tool_use', { tool: 'compare_matrix' });
        }
      })
      .catch(function () {
        var grid = $('#matrixGrid');
        if (grid)
          grid.innerHTML =
            '<p class="matrix-empty">Could not load product data. Try refreshing, or browse <a href="/guides/">guides</a>.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
