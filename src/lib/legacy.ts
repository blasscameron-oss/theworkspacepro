import fs from 'node:fs';
import path from 'node:path';

export interface LegacyRootPage {
  slug: string;
  fileName: string;
  title: string;
  description: string;
  canonical: string;
  visualMaster?: string;
  active?: string;
  mainClass?: string;
  main: string;
  styles: string[];
  scripts: string;
  structuredData: unknown[];
}

const ROOT_LEGACY_ROUTES = [
  'about',
  'affiliate-disclosure',
  'build-your-office',
  'contact',
  'ergonomic-height-calculator',
  'home-office-setup-guide',
  'privacy',
  'terms',
  'tips',
  'workspace-setup-calculator',
] as const;

const COMMON_STYLES = new Set([
  '/assets/css/fonts.css',
  '/assets/css/style.css',
  '/assets/css/premium-studio.css',
  '/assets/css/worksheet.css',
  '/assets/css/editorial-v4.css',
]);

const SHARED_SCRIPT_NAMES = new Set([
  'analytics.js',
  'site.js',
  'perf-lite.js',
  'enhancements.js',
]);

function readLegacy(fileName: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), fileName), 'utf8');
}

function decodeAttribute(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function attribute(source: string, pattern: RegExp, name: string): string {
  const match = source.match(pattern);
  if (!match?.[1]) throw new Error(`Unable to find ${name}`);
  return decodeAttribute(match[1].trim());
}

function extractMain(source: string, fileName: string): { html: string; className?: string; end: number } {
  const match = /<main\b([^>]*)>([\s\S]*?)<\/main>/i.exec(source);
  if (!match) throw new Error(`Unable to find <main> in ${fileName}`);
  const className = match[1].match(/\bclass=["']([^"']+)["']/i)?.[1];
  return { html: match[2], className, end: match.index + match[0].length };
}

function pageSpecificScripts(source: string, mainEnd: number): string {
  return [...source.slice(mainEnd).matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)]
    .map((match) => match[0])
    .filter((tag) => {
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      if (!src) return true;
      if (/static\.cloudflareinsights\.com/i.test(src)) return false;
      return !SHARED_SCRIPT_NAMES.has(path.posix.basename(src.split('?')[0]));
    })
    .join('\n');
}

function pageSpecificStyles(source: string): string[] {
  const styles = [
    ...source.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi),
    ...source.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']stylesheet["'][^>]*>/gi),
  ]
    .map((match) => match[1])
    .filter((href) => !COMMON_STYLES.has(href));
  return [...new Set(styles)];
}

function structuredData(source: string, fileName: string): unknown[] {
  return [...source.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match, index) => {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        throw new Error(`Invalid JSON-LD block ${index + 1} in ${fileName}: ${String(error)}`);
      }
    });
}

function activeSection(slug: string): string {
  if (['build-your-office', 'ergonomic-height-calculator', 'workspace-setup-calculator'].includes(slug)) {
    return 'tools';
  }
  if (['home-office-setup-guide', 'tips'].includes(slug)) return 'guides';
  return '';
}

export function legacyRootPages(): LegacyRootPage[] {
  return ROOT_LEGACY_ROUTES.map((slug) => {
    const fileName = `${slug}.html`;
    const source = readLegacy(fileName);
    const main = extractMain(source, fileName);
    return {
      slug,
      fileName,
      title: attribute(source, /<title>([\s\S]*?)<\/title>/i, `<title> in ${fileName}`),
      description: attribute(
        source,
        /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i,
        `description in ${fileName}`,
      ),
      canonical: attribute(
        source,
        /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i,
        `canonical in ${fileName}`,
      ),
      visualMaster: source.match(/<body\b[^>]*\bdata-visual-master=["']([^"']+)["']/i)?.[1],
      active: activeSection(slug),
      mainClass: main.className,
      main: main.html,
      styles: pageSpecificStyles(source),
      scripts: pageSpecificScripts(source, main.end),
      structuredData: structuredData(source, fileName),
    };
  });
}

export function versionLegacyAssetReferences(source: string, releaseSha: string): string {
  return source.replace(
    /(\b(?:src|href)=["'])(\/assets\/(?:css|js)\/[^"'?]+)(?:\?[^"']*)?(["'])/gi,
    (_match, prefix, assetPath, quote) => `${prefix}${assetPath}?v=${encodeURIComponent(releaseSha)}${quote}`,
  );
}

export function legacyMain(fileName: string): string {
  const source = readLegacy(fileName);
  const match = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) throw new Error(`Unable to find <main> in ${fileName}`);
  return match[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '');
}

export function legacySection(fileName: string, id: string): string {
  const source = readLegacy(fileName);
  const start = source.search(new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i'));
  if (start < 0) throw new Error(`Unable to find section #${id} in ${fileName}`);

  const tagPattern = /<\/?section\b[^>]*>/gi;
  tagPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source))) {
    if (/^<section\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) {
      return source.slice(start, tagPattern.lastIndex)
        .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '');
    }
  }
  throw new Error(`Unable to close section #${id} in ${fileName}`);
}
