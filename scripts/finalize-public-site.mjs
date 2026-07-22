import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

function ensure(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function copyFile(source, destination) {
  ensure(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function copyTree(source, destination, include = () => true) {
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to, include);
    else if (entry.isFile() && !/\.(?:orig|rej)$/i.test(entry.name) && include(from)) copyFile(from, to);
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!fs.existsSync(out)) throw new Error('Astro output directory is missing');

// Static deployment inputs only. Public HTML must come from src/pages. Source
// masters remain private; the artifact receives only browser-ready derivatives.
for (const directory of ['css', 'data', 'fonts', 'js']) {
  copyTree(path.join(root, 'assets', directory), path.join(out, 'assets', directory));
}
for (const file of ['favicon.svg', 'og-default.jpg']) {
  copyFile(path.join(root, 'assets', 'images', file), path.join(out, 'assets', 'images', file));
}
copyTree(
  path.join(root, 'assets', 'images', 'editorial'),
  path.join(out, 'assets', 'images', 'editorial'),
  (source) => /\.(?:avif|webp)$/i.test(source),
);
copyTree(
  path.join(root, 'assets', 'images', 'products'),
  path.join(out, 'assets', 'images', 'products'),
  (source) => /\.(?:avif|webp|jpe?g|png)$/i.test(source),
);
for (const file of ['_headers', '_redirects', 'robots.txt']) {
  copyFile(path.join(root, file), path.join(out, file));
}

// Keep the established /compare/ canonical while Astro uses file-format output.
const compareEntry = path.join(out, 'compare.html');
if (fs.existsSync(compareEntry)) {
  copyFile(compareEntry, path.join(out, 'compare', 'index.html'));
  fs.unlinkSync(compareEntry);
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
console.log(`Finalized Astro-only public artifact with ${urls.size} canonical URLs.`);
