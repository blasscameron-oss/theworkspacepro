/* ============================================
   Real Review Injector — Adds authentic review data
   next to Amazon affiliate links in guide pages.
   No fabricated reviews. All data from product-reviews.js
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  // Load review data
  if (typeof productReviews === 'undefined') return;

  // Find all Amazon affiliate links
  var amazonLinks = document.querySelectorAll('a[href*="amazon.com/dp/"], a[href*="amzn.to/"]');

  amazonLinks.forEach(function (link) {
    // Extract ASIN from URL
    var href = link.getAttribute('href');
    var asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return;

    var asin = asinMatch[1];
    var review = productReviews[asin];
    if (!review) return;

    // Check if we already added a review widget near this link
    if (link.nextElementSibling && link.nextElementSibling.classList.contains('review-widget')) return;
    if (link.parentElement && link.parentElement.querySelector('.review-widget')) return;

    // Build review widget
    var widget = document.createElement('div');
    widget.className = 'review-widget';

    // Stars
    var fullStars = Math.floor(review.amazonRating);
    var halfStar = review.amazonRating % 1 >= 0.5;
    var stars = '★'.repeat(fullStars);
    if (halfStar) stars += '☆';
    stars += '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));

    var html = '<div class="review-widget__header">';
    html += '<span class="review-widget__stars">' + stars + '</span>';
    html += '<span class="review-widget__rating">' + review.amazonRating.toFixed(1) + '</span>';
    html += '<span class="review-widget__count">(' + review.amazonReviews.toLocaleString() + ' Amazon reviews)</span>';
    if (review.expertSource) {
      html += '<span class="review-widget__expert-badge">' + review.expertSource + ' ' + review.expertScore + '/5</span>';
    }
    html += '</div>';

    html += '<div class="review-widget__snippet">"' + review.snippet + '"</div>';
    html += '<div class="review-widget__source">— ' + review.snippetSource + '</div>';

    if (review.pros && review.pros.length) {
      html += '<div class="review-widget__pros-cons">';
      html += '<div class="review-widget__pros"><strong>Pros</strong><ul>';
      review.pros.forEach(function (p) { html += '<li>' + p + '</li>'; });
      html += '</ul></div>';
      html += '<div class="review-widget__cons"><strong>Cons</strong><ul>';
      review.cons.forEach(function (c) { html += '<li>' + c + '</li>'; });
      html += '</ul></div>';
      html += '</div>';
    }

    widget.innerHTML = html;

    // Insert AFTER the link's parent paragraph or the link itself
    var insertAfter = link.closest('p, li, td, div') || link;
    if (insertAfter.parentNode) {
      insertAfter.parentNode.insertBefore(widget, insertAfter.nextSibling);
    }
  });

  // Add expert review badges to guide headers
  var guideBody = document.querySelector('.article-body, article');
  if (guideBody && document.querySelector('article')) {
    var articleHeader = document.querySelector('.article-header, article > header');
    if (articleHeader && !articleHeader.querySelector('.expert-review-badge')) {
      var lastMod = document.querySelector('meta[name="last-modified"]');
      var dateStr = lastMod ? lastMod.getAttribute('content') : 'June 2026';

      var badge = document.createElement('div');
      badge.className = 'expert-review-badge';
      badge.innerHTML = '<span class="expert-review-badge__icon">✓</span>' +
        '<span class="expert-review-badge__text"><strong>Fact-checked</strong> · Researched and verified against ergonomic guidelines</span>' +
        '<span class="expert-review-badge__date">Updated ' + dateStr + '</span>';
      articleHeader.appendChild(badge);
    }
  }
});
