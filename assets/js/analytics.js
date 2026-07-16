/* The Workspace Pro — shared GA4 loader (single include per page) */
(function () {
  'use strict';
  var MEASUREMENT_ID = 'G-2DWRW4PE8Y';
  if (window.__twpGaLoaded) return;
  window.__twpGaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  s.setAttribute('data-cfasync', 'false');
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  function track(name, params) {
    try { gtag("event", name, params || {}); } catch (e) {}
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (link && (link.matches("a[rel*=sponsored]") || /amazon\.com|amzn\.to/i.test(link.href))) {
      var asin = (link.href.match(/\/dp\/([A-Z0-9]{10})/i) || [])[1] || "";
      track("affiliate_click", {
        link_domain: link.hostname,
        product_id: asin,
        link_text: (link.textContent || "").trim().slice(0, 100),
        page_path: location.pathname
      });
    }

    var newsletterLink = link && /beehiiv\.com\/subscribe/i.test(link.href);
    if (newsletterLink) {
      track("newsletter_click", { page_path: location.pathname, link_text: (link.textContent || "").trim().slice(0, 100) });
    }

    var assessmentChoice = event.target.closest && event.target.closest("#assessment .choice-card");
    if (assessmentChoice && !window.__twpAssessmentStarted) {
      window.__twpAssessmentStarted = true;
      track("assessment_start", { page_path: location.pathname });
    }

    var toolButton = event.target.closest && event.target.closest("button");
    if (toolButton && /calculate|generate|build my|show recommendations|results/i.test(toolButton.textContent || "")) {
      track("tool_action", { page_path: location.pathname, action_text: (toolButton.textContent || "").trim().slice(0, 100) });
    }
  });

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (form && (/beehiiv\.com/i.test(form.action || "") || form.classList.contains("newsletter-form"))) {
      track("newsletter_submit", { page_path: location.pathname });
    }
  });
})();
