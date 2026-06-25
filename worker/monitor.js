/**
 * TWP Monitor — Cloudflare Worker
 * Runs weekly to check site health: broken links, 404s, SSL, performance
 * Results stored in KV and logged
 */

const SITE_URL = 'https://www.theworkspacepro.com';

// All known site URLs to check
const URLS_TO_CHECK = [
  '/',
  '/guides/',
  '/tips/',
  '/podcasts/',
  '/about/',
  '/contact/',
  '/affiliate-disclosure/',
  '/privacy/',
  '/terms/',
  // Guides
  '/guides/ergonomic-office-chair-buying-guide/',
  '/guides/best-ergonomic-office-chairs-2026/',
  '/guides/home-office-desk-guide-2026/',
  '/guides/best-standing-desks-under-500/',
  '/guides/best-standing-desk-mat-for-concrete-floors/',
  '/guides/home-office-lighting-guide/',
  '/guides/night-shift-lighting-guide/',
  '/guides/cable-management-solutions/',
  '/guides/small-home-office-organization-hacks/',
  '/guides/dual-monitor-setup-productivity/',
  '/guides/dual-monitor-home-office/',
  '/guides/ergonomic-accessories-home-office/',
  '/guides/home-office-budget-setup-under-1000/',
  '/guides/back-pain-ergonomic-setup/',
  '/guides/ergonomic-setup-for-gamers/',
  '/guides/productive-workspace-mindset/',
  // Redirects
  '/deals/',
  '/quiz/',
  '/community-setups/',
  '/resources/',
  // Assets
  '/assets/css/style.css',
  '/assets/js/assessment.js',
  '/assets/js/enhancements.js',
  '/robots.txt',
  '/sitemap.xml',
];

// URLs that should redirect (301/302)
const EXPECTED_REDIRECTS = {
  '/deals/': [301, 302],
  '/quiz/': [301, 302],
  '/community-setups/': [301, 302],
  '/resources/': [301, 302],
};

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runHealthCheck(env));
  },

  async fetch(request, env) {
    // Manual trigger via HTTP
    const result = await runHealthCheck(env);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function runHealthCheck(env) {
  const results = {
    timestamp: new Date().toISOString(),
    totalChecked: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
    warningsList: [],
    responseTimes: {},
  };

  for (const path of URLS_TO_CHECK) {
    const url = SITE_URL + path;
    const start = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects automatically
        headers: { 'User-Agent': 'TWP-Monitor/1.0' }
      });

      const elapsed = Date.now() - start;
      results.responseTimes[path] = elapsed;
      results.totalChecked++;

      const status = response.status;
      const expectedRedirects = EXPECTED_REDIRECTS[path];

      if (expectedRedirects) {
        if (expectedRedirects.includes(status)) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push({
            path,
            status,
            expected: `Redirect ${expectedRedirects.join(' or ')}`,
            elapsed
          });
        }
      } else if (status === 200 || status === 308) {
        // 308 = Cloudflare Pages trailing slash redirect, which is normal
        results.passed++;

        // Check response time warning
        if (elapsed > 2000) {
          results.warnings++;
          results.warningsList.push({
            path,
            message: `Slow response: ${elapsed}ms`
          });
        }
      } else if (status === 404 && path === '/nonexistent-test/') {
        // This is expected to 404
        results.passed++;
      } else {
        results.failed++;
        results.errors.push({
          path,
          status,
          expected: 200,
          elapsed
        });
      }
    } catch (err) {
      results.totalChecked++;
      results.failed++;
      results.errors.push({
        path,
        error: err.message,
        elapsed: Date.now() - start
      });
    }
  }

  // Check SSL certificate
  try {
    const sslResponse = await fetch(SITE_URL, { method: 'HEAD' });
    if (sslResponse.ok) {
      results.passed++;
    }
  } catch (err) {
    results.failed++;
    results.errors.push({ path: '/', error: 'SSL check failed: ' + err.message });
  }

  // Check sitemap is accessible
  try {
    const sitemapResponse = await fetch(SITE_URL + '/sitemap.xml');
    if (!sitemapResponse.ok) {
      results.warnings++;
      results.warningsList.push({ path: '/sitemap.xml', message: 'Sitemap not accessible' });
    }
  } catch (err) {
    results.warnings++;
    results.warningsList.push({ path: '/sitemap.xml', message: 'Sitemap check failed' });
  }

  // Store results in KV if available
  if (env.TWP_MONITOR) {
    await env.TWP_MONITOR.put('latest-check', JSON.stringify(results));
    await env.TWP_MONITOR.put('history:' + new Date().toISOString().split('T')[0], JSON.stringify(results));
  }

  console.log(`Health check complete: ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings`);

  return results;
}
