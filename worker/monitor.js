/**
 * TWP Monitor — Cloudflare Worker
 * Weekly site health: broken links, 404s, SSL, performance
 * Results stored in KV
 */

const SITE_URL = 'https://www.theworkspacepro.com';

const URLS_TO_CHECK = [
  '/',
  '/guides/',
  '/tips/',
  '/podcasts/',
  '/about/',
  '/assets/js/height-math.js',
  '/assets/js/analytics.js',
  '/embed/height/',
  '/changelog/',
  '/contact/',
  '/affiliate-disclosure/',
  '/privacy/',
  '/terms/',
  '/tools/',
  '/compare/',
  '/assets/data/products-matrix.json',
  '/build-your-office/',
  '/ergonomic-height-calculator/',
  '/workspace-setup-calculator/',
  '/home-office-setup-guide/',
  '/assets/images/favicon.svg',
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
  // Compare
  '/compare/branch-vs-uplift/',
  '/compare/herman-miller-vs-steelcase/',
  '/compare/shw-vs-flexispot/',
  // Redirects
  '/deals/',
  '/quiz/',
  '/community-setups/',
  '/resources/',
  // Assets
  '/assets/css/style.css',
  '/assets/css/bold.css',
  '/assets/js/assessment.js',
  '/assets/js/enhancements.js',
  '/assets/js/bold.js',
  '/robots.txt',
  '/sitemap.xml',
];


// Soft Amazon ASIN sample (warnings only — flaky / ToS-sensitive)
const SAMPLE_ASINS = [
  'B09HM94VDS', // MX Master 3S — known live
  'B06Y3PGPR2', // HON Ignition
  'B085KBN2DN', // SHW desk
  'B07R62FKFZ', // Sayl
  'B00358RIRC', // Ergotron LX
];

async function softAsinSample(results) {
  for (const asin of SAMPLE_ASINS) {
    const url = `https://www.amazon.com/dp/${asin}/?tag=workspacepro-20`;
    const start = Date.now();
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'TWP-Monitor/1.0 (+https://www.theworkspacepro.com)' },
      });
      const elapsed = Date.now() - start;
      results.responseTimes['asin:' + asin] = elapsed;
      if (response.status === 404) {
        results.warnings++;
        results.warningsList.push({
          path: 'asin:' + asin,
          message: `Amazon ASIN returned ${response.status} (soft check; may be geo/bot)`,
        });
      } else if (response.status >= 500) {
        results.warnings++;
        results.warningsList.push({
          path: 'asin:' + asin,
          message: `Amazon ASIN soft check HTTP ${response.status}`,
        });
      }
      // 200/301/302/503 from bot walls → do not fail hard
    } catch (err) {
      results.warnings++;
      results.warningsList.push({
        path: 'asin:' + asin,
        message: 'Amazon ASIN soft check error: ' + err.message,
      });
    }
  }
}


const EXPECTED_REDIRECTS = {
  '/deals/': [301, 302],
  '/quiz/': [301, 302],
  '/community-setups/': [301, 302],
  '/resources/': [301, 302],
};

function authorized(request, env) {
  // Cron path is scheduled(), not fetch. For HTTP: require secret if set.
  const secret = env.MONITOR_SECRET;
  if (!secret) {
    // No secret configured — allow read of latest check only via ?action=latest
    return { ok: true, write: false };
  }
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || request.headers.get('x-monitor-key') || '';
  if (key === secret) return { ok: true, write: true };
  return { ok: false, write: false };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runHealthCheck(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = authorized(request, env);

    if (url.searchParams.get('action') === 'latest') {
      if (!env.TWP_MONITOR) {
        return json({ error: 'KV not bound' }, 503);
      }
      const latest = await env.TWP_MONITOR.get('latest-check');
      if (!latest) return json({ error: 'No checks yet' }, 404);
      return new Response(latest, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    // Running a full check requires auth when MONITOR_SECRET is set
    if (env.MONITOR_SECRET && !auth.write) {
      return json({ error: 'Unauthorized. Pass ?key= or X-Monitor-Key header.' }, 401);
    }

    const result = await runHealthCheck(env);
    return json(result);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
        redirect: 'manual',
        headers: { 'User-Agent': 'TWP-Monitor/1.0' },
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
            elapsed,
          });
        }
      } else if (status === 200 || status === 308) {
        results.passed++;
        if (elapsed > 2000) {
          results.warnings++;
          results.warningsList.push({
            path,
            message: `Slow response: ${elapsed}ms`,
          });
        }
      } else {
        results.failed++;
        results.errors.push({
          path,
          status,
          expected: 200,
          elapsed,
        });
      }
    } catch (err) {
      results.totalChecked++;
      results.failed++;
      results.errors.push({
        path,
        error: err.message,
        elapsed: Date.now() - start,
      });
    }
  }

  try {
    const sslResponse = await fetch(SITE_URL, { method: 'HEAD' });
    if (sslResponse.ok) results.passed++;
  } catch (err) {
    results.failed++;
    results.errors.push({ path: '/', error: 'SSL check failed: ' + err.message });
  }

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

  // Soft ASIN sample — warnings only (never hard-fail the site check)
  await softAsinSample(results);

  if (env.TWP_MONITOR) {
    await env.TWP_MONITOR.put('latest-check', JSON.stringify(results));
    await env.TWP_MONITOR.put(
      'history:' + new Date().toISOString().split('T')[0],
      JSON.stringify(results)
    );
  }

  console.log(
    `Health check complete: ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings`
  );

  return results;
}
