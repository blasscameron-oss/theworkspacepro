/**
 * TWP Monitor — Cloudflare Worker
 * Weekly site health: broken links, 404s, SSL, performance
 * Results stored in KV
 */

const DEFAULT_SITE_URL = 'https://www.theworkspacepro.com';

const URLS_TO_CHECK = [
  '/', '/guides', '/tips', '/podcasts', '/about', '/contact',
  '/affiliate-disclosure', '/privacy', '/terms', '/tools', '/compare/',
  '/embed/height', '/build-your-office', '/ergonomic-height-calculator',
  '/guides/desk-chair-height-chart',
  '/workspace-setup-calculator', '/guides/ergonomic-office-chair-buying-guide',
  '/guides/best-standing-desks-under-500', '/guides/home-office-lighting-guide',
  '/guides/back-pain-ergonomic-setup', '/compare/branch-vs-uplift',
  '/assets/css/style.css', '/assets/js/assessment.js', '/robots.txt', '/sitemap.xml',
  '/deals', '/quiz/', '/community-setups/', '/resources/',
  '/desk-fit-worksheet',
  '/guides/chair-seat-depth-by-height', '/guides/low-cost-ergonomic-workspace-fixes',
  '/guides/monitor-arms-for-thick-or-shallow-desks',
  '/guides/standing-desks-for-short-users', '/guides/standing-desks-for-tall-users',
];

const BODY_MARKERS = {
  '/': ['id="assessment-card"', 'class="commercial-grid"', 'tag=workspacepro-20'],
  '/deals': ['id="dealGrid"', 'deal-card', 'tag=workspacepro-20'],
  '/guides': ['id="buying-guides"', 'id="body-fit"'],
  '/compare/': ['id="matrixGrid"', 'src="/assets/js/compare-matrix.js"'],
};


// Soft Amazon ASIN sample (warnings only — flaky / ToS-sensitive)
const SAMPLE_ASINS = []; // Enable only on a paid plan or a separate low-frequency worker.

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
  '/quiz/': '/#assessment',
  '/community-setups/': '/',
  '/resources/': '/guides',
};

function authorized(request, env) {
  // Cron runs internally; every HTTP-triggered full check requires the header secret.
  const secret = env.MONITOR_SECRET;
  if (!secret) return { ok: false, write: false };
  const key = request.headers.get('x-monitor-key') || '';
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
      if (!auth.write) {
        return json({ error: 'Unauthorized. Send the X-Monitor-Key header.' }, 401);
      }
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

    // Running a full check always requires the configured header secret.
    if (!auth.write) {
      return json({ error: 'Unauthorized. Send the X-Monitor-Key header.' }, 401);
    }

    const result = await runHealthCheck(env);
    return json(result, result.failed > 0 ? 503 : 200);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function runHealthCheck(env) {
  const siteUrl = env.SITE_URL || DEFAULT_SITE_URL;
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
    const url = siteUrl + path;
    const start = Date.now();

    try {
      const expectedRedirects = EXPECTED_REDIRECTS[path];
      const response = await fetch(url, {
        method: 'GET',
        redirect: expectedRedirects ? 'manual' : 'follow',
        headers: { 'User-Agent': 'TWP-Monitor/1.0' },
      });

      const elapsed = Date.now() - start;
      results.responseTimes[path] = elapsed;
      results.totalChecked++;

      const status = response.status;
      if (expectedRedirects) {
        const location = response.headers.get('location');
        const actualTarget = location ? new URL(location, url) : null;
        const expectedTarget = new URL(expectedRedirects, siteUrl);
        const locationMatches = actualTarget &&
          actualTarget.origin === expectedTarget.origin &&
          actualTarget.pathname === expectedTarget.pathname &&
          actualTarget.search === expectedTarget.search &&
          actualTarget.hash === expectedTarget.hash;
        let terminalStatus = null;
        if ((status === 301 || status === 302) && locationMatches) {
          const terminal = await fetch(expectedTarget.href, {
            method: 'GET',
            redirect: 'follow',
            headers: { 'User-Agent': 'TWP-Monitor/1.0' },
          });
          terminalStatus = terminal.status;
        }
        if ((status === 301 || status === 302) && locationMatches && terminalStatus === 200) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push({
            path, status, location, terminalStatus,
            expected: 'Redirect to ' + expectedTarget.href + ', then HTTP 200',
            elapsed,
          });
        }
      } else if (status === 200) {
        const markers = BODY_MARKERS[path] || [];
        if (markers.length) {
          const body = await response.text();
          const missing = markers.filter((marker) => !body.includes(marker));
          if (missing.length) {
            results.failed++;
            results.errors.push({
              path, status, expected: 'Required body markers', missing, elapsed,
            });
            continue;
          }
        }
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
