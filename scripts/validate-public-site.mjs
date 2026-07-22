#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const artifactArg = process.argv[2] || 'dist';
const artifactDir = path.resolve(process.cwd(), artifactArg);
const errors = new Set();

function fail(scope, message) {
  errors.add(`${scope}: ${message}`);
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function rel(file) {
  return path.relative(artifactDir, file).split(path.sep).join('/');
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripComments(html) {
  return html.replace(/<!--[^]*?-->/g, '');
}

function countMatches(text, pattern) {
  return Array.from(text.matchAll(pattern)).length;
}

function hasClass(tag, className) {
  const match = tag.match(/\bclass\s*=\s*(["'])([^"']*)\1/i);
  return Boolean(match && match[2].split(/\s+/).includes(className));
}

function idCount(html, id) {
  let count = 0;
  const attribute = /\bid\s*=\s*(["'])([^"']+)\1/gi;
  for (const match of html.matchAll(attribute)) {
    if (decodeEntities(match[2]) === id) count += 1;
  }
  return count;
}

function normalizePublicPath(urlPath) {
  let pathname = urlPath.split('#', 1)[0].split('?', 1)[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\0')) return null;
  const normalized = path.posix.normalize(pathname);
  if (!normalized.startsWith('/') || normalized.includes('/../')) return null;
  return normalized;
}

function routeCandidates(urlPath) {
  const normalized = normalizePublicPath(urlPath);
  if (!normalized) return [];
  if (normalized === '/') return ['index.html'];

  const relativePath = normalized.slice(1);
  const candidates = [];
  if (normalized.endsWith('/')) {
    candidates.push(path.posix.join(relativePath, 'index.html'));
    candidates.push(`${relativePath.slice(0, -1)}.html`);
  } else {
    candidates.push(relativePath);
    if (!path.posix.extname(relativePath)) {
      candidates.push(`${relativePath}.html`);
      candidates.push(path.posix.join(relativePath, 'index.html'));
    }
  }
  return [...new Set(candidates)];
}

function parseRedirectSources() {
  const redirectFile = path.join(artifactDir, '_redirects');
  if (!fs.existsSync(redirectFile)) return [];
  return fs.readFileSync(redirectFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/, 1)[0]);
}

function isRedirectRoute(urlPath, redirectSources) {
  const normalized = normalizePublicPath(urlPath);
  if (!normalized) return false;
  return redirectSources.some((source) => {
    if (!source.includes('*')) return normalizePublicPath(source) === normalized;
    const prefix = normalizePublicPath(source.split('*', 1)[0]);
    return Boolean(prefix && normalized.startsWith(prefix));
  });
}

function resolveRoute(urlPath) {
  for (const candidate of routeCandidates(urlPath)) {
    const fullPath = path.resolve(artifactDir, candidate);
    if (!fullPath.startsWith(`${artifactDir}${path.sep}`) && fullPath !== artifactDir) continue;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
  }
  return null;
}

if (!fs.existsSync(artifactDir) || !fs.statSync(artifactDir).isDirectory()) {
  console.error(`Public artifact not found: ${artifactDir}`);
  process.exit(2);
}

const allFiles = walk(artifactDir);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const redirectSources = parseRedirectSources();
for (const file of allFiles) {
  if (/\.(?:orig|rej)$/i.test(file)) {
    fail('artifact', `contains forbidden patch artifact: ${rel(file)}`);
  }
}

if (htmlFiles.length === 0) fail('artifact', 'contains no HTML files');

for (const file of htmlFiles) {
  const scope = rel(file);
  const rawHtml = fs.readFileSync(file, 'utf8');
  const html = stripComments(rawHtml);

  const h1Count = countMatches(html, /<h1\b/gi);
  const mainCount = countMatches(html, /<main\b/gi);
  if (h1Count !== 1) fail(scope, `expected exactly one h1, found ${h1Count}`);
  if (mainCount !== 1) fail(scope, `expected exactly one main landmark, found ${mainCount}`);

  const skipLinks = Array.from(html.matchAll(/<a\b[^>]*>/gi)).filter((match) => hasClass(match[0], 'skip-link'));
  if (skipLinks.length !== 1) {
    fail(scope, `expected exactly one skip link, found ${skipLinks.length}`);
  } else {
    const href = skipLinks[0][0].match(/\bhref\s*=\s*(["'])#([^"']+)\1/i);
    if (!href) {
      fail(scope, 'skip link must use a same-page fragment target');
    } else {
      const target = decodeEntities(href[2]);
      const matches = idCount(html, target);
      if (matches !== 1) fail(scope, `skip target #${target} must resolve exactly once, found ${matches}`);
    }
  }

  const analyticsCount = countMatches(
    html,
    /<script\b[^>]*\bsrc\s*=\s*(["'])\/assets\/js\/analytics\.js(?:[?#][^"']*)?\1[^>]*>/gi,
  );
  if (analyticsCount !== 1) fail(scope, `expected exactly one analytics.js include, found ${analyticsCount}`);

  const assessmentCount = countMatches(
    html,
    /<script\b[^>]*\bsrc\s*=\s*(["'])\/assets\/js\/assessment\.js(?:[?#][^"']*)?\1[^>]*>/gi,
  );
  if (scope === 'index.html') {
    if (assessmentCount !== 1) fail(scope, `home must include assessment.js exactly once, found ${assessmentCount}`);
  } else if (assessmentCount !== 0) {
    fail(scope, 'assessment.js is only allowed on index.html');
  }

  for (const script of html.matchAll(/<script\b[^>]*\btype\s*=\s*(["'])application\/ld\+json\1[^>]*>([^]*?)<\/script\s*>/gi)) {
    try {
      JSON.parse(script[2].trim());
    } catch (error) {
      fail(scope, `invalid JSON-LD: ${error.message}`);
    }
  }

  for (const attribute of html.matchAll(/\b(href|src|content)\s*=\s*(["'])([^"']*)\2/gi)) {
    const kind = attribute[1].toLowerCase();
    const value = decodeEntities(attribute[3].trim());
    let localValue = value;
    if (/^https?:\/\//i.test(value)) {
      const absolute = new URL(value);
      if (absolute.origin !== 'https://www.theworkspacepro.com') continue;
      localValue = `${absolute.pathname}${absolute.search}${absolute.hash}`;
    }
    if (!localValue.startsWith('/') || localValue.startsWith('//')) continue;

    const route = normalizePublicPath(localValue);
    if (!route) {
      fail(scope, `invalid local ${kind} target: ${value}`);
      continue;
    }
    // Cloudflare owns this namespace; it is not a Pages artifact file.
    if (route.startsWith('/cdn-cgi/')) continue;

    const target = resolveRoute(route);
    if (!target && !(kind === 'href' && isRedirectRoute(route, redirectSources))) {
      fail(scope, `unresolved local ${kind} target: ${value}`);
      continue;
    }

    const hashIndex = localValue.indexOf('#');
    if (kind === 'href' && target && hashIndex !== -1) {
      const fragment = localValue.slice(hashIndex + 1).split('?', 1)[0];
      if (fragment) {
        const targetHtml = fs.readFileSync(target, 'utf8');
        if (idCount(stripComments(targetHtml), decodeEntities(fragment)) !== 1) {
          fail(scope, `local fragment target does not resolve exactly once: ${value}`);
        }
      }
    }
  }

  for (const anchor of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1[^>]*>/gi)) {
    const href = decodeEntities(anchor[2]);
    let url;
    try {
      url = new URL(href, 'https://www.theworkspacepro.com');
    } catch {
      continue;
    }
    const host = url.hostname.toLowerCase();
    const isAmazon = host === 'amzn.to' || host === 'amazon.com' || host.endsWith('.amazon.com');
    if (isAmazon && url.searchParams.get('tag') !== 'workspacepro-20') {
      fail(scope, `Amazon affiliate href is missing tag=workspacepro-20: ${href}`);
    }
  }
}

const sitemapFile = path.join(artifactDir, 'sitemap.xml');
if (!fs.existsSync(sitemapFile)) {
  fail('sitemap.xml', 'missing from artifact');
} else {
  const sitemap = fs.readFileSync(sitemapFile, 'utf8');
  const locations = Array.from(sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), (match) => decodeEntities(match[1]));
  if (locations.length === 0) fail('sitemap.xml', 'contains no URLs');
  for (const location of locations) {
    let url;
    try {
      url = new URL(location);
    } catch {
      fail('sitemap.xml', `invalid URL: ${location}`);
      continue;
    }
    if (url.origin !== 'https://www.theworkspacepro.com') {
      fail('sitemap.xml', `non-canonical origin: ${location}`);
    } else if (!resolveRoute(url.pathname)) {
      fail('sitemap.xml', `URL does not map to a built file: ${location}`);
    }
  }
}

const dealsFile = resolveRoute('/deals');
if (!dealsFile) {
  fail('deals', 'deals.html is missing from the built artifact');
} else {
  const dealsHtml = stripComments(fs.readFileSync(dealsFile, 'utf8'));
  const dealCards = Array.from(dealsHtml.matchAll(/<[^>]+\bclass\s*=\s*(["'])([^"']*)\1[^>]*>/gi))
    .filter((match) => match[2].split(/\s+/).includes('deal-card'));
  if (dealCards.length < 3) fail('deals.html', `expected at least three static .deal-card elements, found ${dealCards.length}`);

  const plainText = dealsHtml.replace(/<script\b[^]*?<\/script\s*>/gi, ' ').replace(/<style\b[^]*?<\/style\s*>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  if (!/affiliate/i.test(plainText) || !/(commission|we may earn|may receive)/i.test(plainText)) {
    fail('deals.html', 'missing a plain-language affiliate compensation disclosure');
  }
  if (!/(price|pricing)/i.test(plainText) || !/(current|change|verify|check)/i.test(plainText)) {
    fail('deals.html', 'missing a truthful price-freshness disclaimer');
  }

  const theaterPatterns = [
    [/<\s*(?:del|s)\b/i, 'struck-through comparison pricing'],
    [/\b(?:limited[ -]time|ends? (?:soon|in)|hurry|flash sale)\b/i, 'manufactured urgency language'],
    [/\b(?:save\s+(?:\$\s*\d|\d+\s*%)|\d+\s*%\s*off|was\s+\$\s*\d)/i, 'unverified savings claim'],
    [/\b(?:class|id)\s*=\s*(["'])[^"']*(?:countdown|flash-sale|sale-badge|discount-badge)[^"']*\1/i, 'sale-theater UI'],
  ];
  for (const [pattern, description] of theaterPatterns) {
    if (pattern.test(dealsHtml)) fail('deals.html', `contains ${description}`);
  }
}

const heightChartFile = resolveRoute('/guides/desk-chair-height-chart');
if (!heightChartFile) {
  fail('height-chart', 'guides/desk-chair-height-chart.html is missing from the built artifact');
} else {
  const chartHtml = stripComments(fs.readFileSync(heightChartFile, 'utf8'));
  const chartText = chartHtml.replace(/<script\b[^]*?<\/script\s*>/gi, ' ').replace(/<style\b[^]*?<\/style\s*>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const canonical = chartHtml.match(/<link\b[^>]*\brel\s*=\s*(["'])canonical\1[^>]*\bhref\s*=\s*(["'])([^"']+)\2[^>]*>/i)
    || chartHtml.match(/<link\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1[^>]*\brel\s*=\s*(["'])canonical\3[^>]*>/i);
  const canonicalHref = canonical ? canonical[3] || canonical[2] : '';
  if (canonicalHref !== 'https://www.theworkspacepro.com/guides/desk-chair-height-chart') fail('height-chart', `missing or incorrect canonical URL: ${canonicalHref || '(none)'}`);

  const rowMarkers = Array.from(chartHtml.matchAll(/<tr\b[^>]*\bid\s*=\s*(["'])height-[^"']+\1[^>]*>/gi));
  if (rowMarkers.length < 12) fail('height-chart', `expected at least 12 static anchored height rows, found ${rowMarkers.length}`);
  if (!/(?:\bin(?:ches)?\b|\bft\b|\bfeet\b)/i.test(chartText) || !/(?:\bcm\b|centimet(?:er|re)s?)/i.test(chartText)) fail('height-chart', 'must present both imperial and metric units');

  const jsonLdTypes = new Set();
  function collectJsonLdTypes(value) {
    if (Array.isArray(value)) return value.forEach(collectJsonLdTypes);
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value['@type'])) value['@type'].forEach((type) => jsonLdTypes.add(type));
    else if (value['@type']) jsonLdTypes.add(value['@type']);
    Object.values(value).forEach(collectJsonLdTypes);
  }
  for (const script of chartHtml.matchAll(/<script\b[^>]*\btype\s*=\s*(["'])application\/ld\+json\1[^>]*>([^]*?)<\/script\s*>/gi)) {
    try { collectJsonLdTypes(JSON.parse(script[2].trim())); } catch { /* global JSON-LD check reports details */ }
  }
  if (!jsonLdTypes.has('Article')) fail('height-chart', 'missing Article JSON-LD');
  if (!jsonLdTypes.has('BreadcrumbList')) fail('height-chart', 'missing BreadcrumbList JSON-LD');
  if (!/(?:methodology|how (?:the )?estimates are calculated|estimation model)/i.test(chartText)) fail('height-chart', 'missing visible methodology section');
  if (!/(?:starting point|adjust|range|individual|body|comfort)/i.test(chartText) || !/(?:not medical advice|consult|healthcare|clinician)/i.test(chartText)) fail('height-chart', 'missing visible adjustment and health disclaimer');
  if (!/<a\b[^>]*href\s*=\s*(["'])https:\/\/(?:www\.)?osha\.gov\/[^"']*\1/i.test(chartHtml)) fail('height-chart', 'missing a direct OSHA source link');
  const affirmativeClaimsText = chartText.replace(/\b(?:not|isn't|is not|aren't|are not)\s+(?:an?\s+)?ideal\b/gi, '');
  if (/\b(?:perfect|ideal)\b/i.test(affirmativeClaimsText)) fail('height-chart', 'contains unsupported perfect/ideal wording');
  if (/\bOSHA(?:\s+\w+){0,6}\s+(?:formula|calculat(?:e|es|ed|ion)|ratio|prescri(?:be|bes|bed))\b/i.test(chartText)) fail('height-chart', 'implies OSHA supplies or endorses the height formula');
}

const heightCalculatorFile = resolveRoute('/ergonomic-height-calculator');
if (!heightCalculatorFile) {
  fail('height-calculator', 'ergonomic-height-calculator.html is missing from the built artifact');
} else {
  const calculatorHtml = stripComments(fs.readFileSync(heightCalculatorFile, 'utf8'));
  if (!/<script\b[^>]*\bsrc\s*=\s*(["'])\/assets\/js\/height-math\.js(?:[?#][^"']*)?\1/i.test(calculatorHtml)) fail('height-calculator', 'must load shared height-math.js');
  if (!/TWPHeightMath/.test(calculatorHtml)) fail('height-calculator', 'must call the shared TWPHeightMath API');
  if (/\b(?:h|height|heightInches)\s*\*\s*0?\.27\b/i.test(calculatorHtml)) fail('height-calculator', 'contains duplicated h * .27 formula instead of shared math');
}

const guideCssFile = path.join(artifactDir, 'assets', 'css', 'style.css');
const siteJsFile = path.join(artifactDir, 'assets', 'js', 'site.js');
if (!fs.existsSync(guideCssFile) || !fs.existsSync(siteJsFile)) {
  fail('guide-toc', 'missing shared CSS or JavaScript required for guide TOCs');
} else {
  const guideCss = fs.readFileSync(guideCssFile, 'utf8');
  const siteJs = fs.readFileSync(siteJsFile, 'utf8');
  const tocBlocks = Array.from(guideCss.matchAll(/\.toc\s*\{([^}]*)\}/gi), (match) => match[1]);
  if (tocBlocks.some((block) => /position\s*:\s*(?:sticky|fixed)/i.test(block))) {
    fail('guide-toc', 'shared .toc must remain in document flow and may not be sticky or fixed');
  }
  if (!/\.reading-progress\b/.test(guideCss) || !/initReadingProgress/.test(siteJs)) {
    fail('guide-toc', 'missing the shared long-guide reading progress enhancement');
  }
}

for (const htmlFile of htmlFiles) {
  const html = stripComments(fs.readFileSync(htmlFile, 'utf8'));
  if (/\bclass\s*=\s*(["'])[^"']*\btoc\b[^"']*\1/i.test(html)
    && !/\bclass\s*=\s*(["'])[^"']*\barticle-body\b[^"']*\1/i.test(html)) {
    fail(rel(htmlFile), 'guide .toc must live inside an .article-body container');
  }
}

const premiumCssFile = path.join(artifactDir, 'assets', 'css', 'premium-studio.css');
const visualManifestFile = path.join(artifactDir, 'assets', 'data', 'visual-manifest.json');
if (!fs.existsSync(premiumCssFile)) fail('premium-studio', 'missing premium-studio.css from artifact');
if (!fs.existsSync(visualManifestFile)) {
  fail('premium-studio', 'missing visual-manifest.json from artifact');
} else {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(visualManifestFile, 'utf8')); }
  catch (error) { fail('premium-studio', `invalid visual manifest JSON: ${error.message}`); }
  if (manifest) {
    const masters = Array.isArray(manifest.masters) ? manifest.masters : [];
    const routes = masters.flatMap((master) => Array.isArray(master.routes) ? master.routes : []);
    if (manifest.masterCount !== 36 || masters.length !== 36) fail('premium-studio', `expected 36 visual masters, found ${masters.length}`);
    if (manifest.routeCount !== 39 || new Set(routes).size !== 39) fail('premium-studio', `expected 39 unique manifest routes, found ${new Set(routes).size}`);
    const variantContract = manifest.variantContract || {};
    for (const master of masters) {
      const slug = master && master.slug;
      if (!slug || !/^[a-z0-9-]+-v\d+$/.test(slug)) { fail('premium-studio', `invalid visual master slug: ${slug || '(missing)'}`); continue; }
      if (master.approval !== 'approved-production') fail('premium-studio', `${slug} is not approved-production`);
      for (const variant of ['desktop', 'mobile']) {
        const spec = variantContract[variant] || {};
        for (const format of ['avif', 'webp']) {
          const asset = path.join(artifactDir, 'assets', 'images', 'editorial', `${slug}-${variant}.${format}`);
          if (!fs.existsSync(asset)) fail('premium-studio', `missing ${slug}-${variant}.${format}`);
          else if (Number.isFinite(spec.maxBytes) && fs.statSync(asset).size > spec.maxBytes) fail('premium-studio', `${slug}-${variant}.${format} exceeds ${spec.maxBytes} bytes`);
        }
      }
      for (const route of master.routes || []) {
        const target = resolveRoute(route);
        if (!target) { fail('premium-studio', `manifest route does not resolve: ${route}`); continue; }
        const html = stripComments(fs.readFileSync(target, 'utf8'));
        if (!new RegExp(`data-visual-master\\s*=\\s*(["'])${slug}\\1`, 'i').test(html)) fail(rel(target), `missing data-visual-master="${slug}"`);
      }
    }
  }
}

for (const htmlFile of htmlFiles) {
  const html = stripComments(fs.readFileSync(htmlFile, 'utf8'));
  if (!/<link\b[^>]*href\s*=\s*(["'])\/assets\/css\/premium-studio\.css\1/i.test(html)) fail(rel(htmlFile), 'must load premium-studio.css');
  if (!/<body\b[^>]*class\s*=\s*(["'])[^"']*\bps-shell\b[^"']*\1/i.test(html)) fail(rel(htmlFile), 'body must use ps-shell migration scope');
  if (/(?:class|id)\s*=\s*(["'])[^"']*(?:social-proof|price-drop|countdown|sale-badge|discount-badge)[^"']*\1/i.test(html)) fail(rel(htmlFile), 'contains retired deceptive or template-theater UI');
}

const publicMasterFiles = allFiles.filter((file) => /assets\/images\/editorial\/[^/]+-master\.png$/i.test(rel(file)));
if (publicMasterFiles.length) fail('premium-studio', 'editable PNG masters must not ship in the public artifact');

const builtAssessmentJs = path.join(artifactDir, 'assets', 'js', 'assessment.js');
if (fs.existsSync(builtAssessmentJs)) {
  const assessmentJs = fs.readFileSync(builtAssessmentJs, 'utf8');
  if (!/v\s*:\s*2/.test(assessmentJs) || !/data\.v\s*(?:===?|!==?)\s*1/.test(assessmentJs)) fail('workspace-blueprint', 'assessment must emit v2 and explicitly retain v1 compatibility');
  if (!/blueprint_action/.test(assessmentJs)) fail('workspace-blueprint', 'missing blueprint_action analytics');
}

if (errors.size > 0) {
  console.error(`Public artifact validation failed with ${errors.size} issue${errors.size === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Public artifact validation passed: ${htmlFiles.length} HTML files, ${allFiles.length} total files.`);
