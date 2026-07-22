import assert from 'node:assert/strict';
import test from 'node:test';

import monitor from '../worker/monitor.js';

const SITE_URL = 'https://www.theworkspacepro.com';
const MONITOR_SECRET = 'test-monitor-secret';

const bodies = {
  '/': '<main id="assessment-card"><div class="commercial-grid">tag=workspacepro-20</div></main>',
  '/deals': '<main id="dealGrid"><article class="deal-card">tag=workspacepro-20</article></main>',
  '/guides': '<main id="buying-guides"><section id="body-fit"></section></main>',
  '/compare/': '<main id="matrixGrid"><script src="/assets/js/compare-matrix.js"></script></main>',
};

const redirects = {
  '/quiz/': '/#assessment',
  '/community-setups/': '/',
  '/resources/': '/guides',
};

function createFetch({ dealsBody = bodies['/deals'] } = {}) {
  return async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    assert.equal(url.origin, SITE_URL, `unexpected monitored origin: ${url.origin}`);

    if (init.redirect === 'manual') {
      const location = redirects[url.pathname];
      assert.ok(location, `unexpected manual redirect probe: ${url.pathname}`);
      return new Response(null, { status: 302, headers: { location } });
    }

    const body = url.pathname === '/deals' ? dealsBody : (bodies[url.pathname] ?? 'ok');
    return new Response(body, { status: 200 });
  };
}

async function runAuthorizedCheck(fetchMock) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchMock;
  try {
    const request = new Request('https://monitor.test/', {
      headers: { 'x-monitor-key': MONITOR_SECRET },
    });
    const response = await monitor.fetch(request, { MONITOR_SECRET });
    return { response, result: await response.json() };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('authorized full health check passes when required body markers exist', async () => {
  const { response, result } = await runAuthorizedCheck(createFetch());

  assert.equal(response.status, 200);
  assert.equal(result.failed, 0);
  assert.equal(result.errors.length, 0);
  assert.equal(result.passed, result.totalChecked);
  assert.ok(result.totalChecked > 0);
});

test('authorized health check fails when /deals is 200 but misses a required marker', async () => {
  const dealsWithoutAffiliateTag = '<main id="dealGrid"><article class="deal-card"></article></main>';
  const { response, result } = await runAuthorizedCheck(
    createFetch({ dealsBody: dealsWithoutAffiliateTag }),
  );

  assert.equal(response.status, 503);
  assert.equal(result.failed, 1);
  assert.equal(result.passed, result.totalChecked - 1);
  assert.deepEqual(result.errors, [{
    path: '/deals',
    status: 200,
    expected: 'Required body markers',
    missing: ['tag=workspacepro-20'],
    elapsed: result.errors[0].elapsed,
  }]);
});
