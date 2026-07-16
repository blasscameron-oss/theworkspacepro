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
})();
