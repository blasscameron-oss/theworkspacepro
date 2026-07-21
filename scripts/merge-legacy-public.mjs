import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

function ensure(dir) { fs.mkdirSync(dir, { recursive: true }); }
function copyFile(source, destination, { overwrite = true } = {}) {
  if (!overwrite && fs.existsSync(destination)) return;
  ensure(path.dirname(destination));
  fs.copyFileSync(source, destination);
}
function copyTree(source, destination, options = {}) {
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to, options);
    else if (entry.isFile() && !options.skip?.(from)) copyFile(from, to, options);
  }
}

if (!fs.existsSync(out)) throw new Error('Astro output directory is missing');
for (const directory of ['css', 'data', 'fonts']) {
  copyTree(path.join(root, 'assets', directory), path.join(out, 'assets', directory));
}
const publicScripts = [
  'analytics.js', 'assessment.js', 'bold.js', 'build-your-office.js',
  'compare-matrix.js', 'deals.js', 'enhancements.js', 'height-math.js',
  'perf-lite.js', 'review-injector.js', 'site.js',
];
for (const file of publicScripts) {
  copyFile(path.join(root, 'assets/js', file), path.join(out, 'assets/js', file));
}
copyFile(path.join(root, 'assets/images/favicon.svg'), path.join(out, 'assets/images/favicon.svg'));
copyFile(path.join(root, 'assets/images/og-default.jpg'), path.join(out, 'assets/images/og-default.jpg'));
for (const file of fs.readdirSync(path.join(root, 'assets/images/editorial'))) {
  if (!/\.(?:avif|webp)$/i.test(file)) continue;
  copyFile(path.join(root, 'assets/images/editorial', file), path.join(out, 'assets/images/editorial', file));
}

// Keep working legacy routes during the controlled migration. Astro wins whenever
// a route has already moved to a shared component/content collection.
const managedGuideIds = new Set(
  fs.readdirSync(path.join(root, 'src/content/guides'))
    .filter((file) => /\.mdx?$/i.test(file))
    .map((file) => file.replace(/\.mdx?$/i, '')),
);
for (const directory of ['compare', 'embed']) {
  copyTree(path.join(root, directory), path.join(out, directory), { overwrite: false });
}
copyTree(path.join(root, 'guides'), path.join(out, 'guides'), {
  overwrite: false,
  skip: (source) => managedGuideIds.has(path.basename(source, '.html')),
});
for (const file of fs.readdirSync(root)) {
  if (!file.endsWith('.html') || file === 'index.html' || file === 'guides.html') continue;
  copyFile(path.join(root, file), path.join(out, file));
}
for (const file of ['_headers', '_redirects', 'robots.txt']) {
  copyFile(path.join(root, file), path.join(out, file));
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const urls = new Map();
for (const file of walk(out).filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  if (/<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(html)) continue;
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) continue;
  const url = new URL(canonical[1], 'https://www.theworkspacepro.com');
  if (url.origin !== 'https://www.theworkspacepro.com') continue;
  const href = url.href.replace(/\/$/, url.pathname === '/' ? '/' : '');
  const modified = html.match(/["']dateModified["']\s*:\s*["'](\d{4}-\d{2}-\d{2})/i);
  if (urls.has(href)) {
    throw new Error(`Duplicate canonical ${href} in ${path.relative(out, file)}`);
  }
  urls.set(href, { url, lastmod: modified?.[1] });
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...urls.values()]
    .sort((a, b) => a.url.pathname.localeCompare(b.url.pathname))
    .map(({ url, lastmod }) => `  <url><loc>${url.href}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap);
console.log(`Merged legacy routes and generated sitemap with ${urls.size} canonical URLs.`);
