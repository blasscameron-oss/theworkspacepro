/**
 * Retailer link-health audit.
 *
 * Every product in the catalog carries a retailer URL. Those rot silently:
 * retailers reorganise, products get discontinued, brands get absorbed. The
 * failure is quiet and bad — the page still renders a price, the link still
 * returns 200, but it lands on a category or brand page instead of the
 * product, so the price we show can't be checked by the reader.
 *
 * This reports any link whose final URL differs from the one we publish.
 *
 *   node scripts/audit-links.mjs [--amazon]
 *
 * Amazon links are skipped by default: they are the bulk of the catalog, they
 * rate-limit and cloak aggressively for non-browser clients, and a 503 from
 * them means nothing. Pass --amazon to include them anyway, and read the
 * results sceptically.
 *
 * Deliberately NOT wired into CI: it makes live third-party requests, so it is
 * slow, rate-limited (retailers return 429 under load — an inconclusive result,
 * not a failure), and would make the pipeline flaky. Run it manually, roughly
 * quarterly, and after any catalog edit. Exit code is 0 unless a link is
 * genuinely dead (4xx/5xx other than 429); redirects are reported for a human
 * to judge, because some are harmless URL tidying and some mean the product is
 * gone.
 */

import { readFile } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const includeAmazon = process.argv.includes('--amazon');

const catalog = JSON.parse(await readFile('assets/data/catalog.json', 'utf8'));
const products = (catalog.products ?? catalog).filter((p) => p.url);
const targets = products.filter((p) => includeAmazon || !/amazon\./.test(p.url));

console.log(
  `Checking ${targets.length} of ${products.length} product link(s)` +
    `${includeAmazon ? '' : ' (Amazon skipped — pass --amazon to include)'}.\n`,
);

let dead = 0;
let moved = 0;

for (const product of targets) {
  let status = 0;
  let finalUrl = product.url;
  try {
    const res = await fetch(product.url, {
      redirect: 'follow',
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(25_000),
    });
    status = res.status;
    finalUrl = res.url;
  } catch (err) {
    console.log(`DEAD      ${product.id}\n          ${product.url}\n          ${err.message}\n`);
    dead += 1;
    continue;
  }

  if (status === 429) {
    console.log(`throttled ${product.id} — inconclusive, retry later\n`);
  } else if (status >= 400) {
    console.log(`DEAD      ${product.id}  ${status}\n          ${product.url}\n`);
    dead += 1;
  } else if (finalUrl !== product.url) {
    console.log(
      `MOVED     ${product.id}  ${status}\n          published: ${product.url}\n` +
        `          lands on: ${finalUrl}\n`,
    );
    moved += 1;
  }

  await new Promise((r) => setTimeout(r, 1000));
}

console.log(`\n${dead} dead, ${moved} redirected, ${targets.length} checked.`);
if (moved) {
  console.log(
    'Redirects need a human: if the link no longer reaches the product, either\n' +
      'update the URL or drop the product. Leaving a price next to a link that\n' +
      'lands on a category page is the dishonest outcome.',
  );
}
process.exit(dead ? 1 : 0);
