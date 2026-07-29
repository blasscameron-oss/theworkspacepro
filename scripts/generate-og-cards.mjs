/**
 * Per-route Open Graph cards, drawn in the blueprint visual language.
 *
 *   node scripts/generate-og-cards.mjs
 *
 * Every page used to share one og-default.jpg, so a shared calculator, guide
 * and comparison all looked identical in a feed. This draws a 1200x630 card per
 * route: the route's editorial photograph where the visual manifest has one,
 * a spruce title block with the page title in Fraunces, and a measurement rail
 * in the mono instrument voice.
 *
 * Fonts are converted from the shipped woff2 so cards use the real brand faces
 * rather than a system fallback. Cards are written to assets/images/og/ and
 * committed, so a build never depends on this script running.
 */
import { readFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const OUT_DIR = 'assets/images/og';
// fontconfig discovers fonts under $XDG_DATA_HOME/fonts, and reads the variable
// once when it first initialises — which happens inside sharp's first render.
// Both must be set before sharp is imported, hence the dynamic import below.
const FONT_HOME = resolve('.cache/fontconfig');
const FONT_DIR = join(FONT_HOME, 'fonts');
process.env.XDG_DATA_HOME = FONT_HOME;
const W = 1200;
const H = 630;

const INK = '#f4f0e8';
const SPRUCE = '#1d2824';
const TERRACOTTA = '#c0724c';
const MUTED = '#a8b3ac';

const manifest = JSON.parse(readFileSync('assets/data/visual-manifest.json', 'utf8'));
const sharp = (await import('sharp')).default;

/** Convert the shipped woff2 faces to ttf so librsvg can use the real brand type. */
const ensureFonts = () => {
  mkdirSync(FONT_DIR, { recursive: true });
  const pairs = [
    ['assets/fonts/fraunces-latin-variable-full-normal.woff2', join(FONT_DIR, 'Fraunces.ttf')],
    ['assets/fonts/inter-latin-400-normal.woff2', join(FONT_DIR, 'Inter-Regular.ttf')],
  ];
  const missing = pairs.filter(([, dst]) => !existsSync(dst));
  if (missing.length === 0) return true;
  try {
    execFileSync('python3', ['-c', `
from fontTools.ttLib import TTFont
import sys
for src, dst in zip(sys.argv[1::2], sys.argv[2::2]):
    f = TTFont(src); f.flavor = None; f.save(dst)
`, ...pairs.flat()], { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.warn('! could not convert brand fonts, cards will use a system serif:', error.message.split('\n')[0]);
    return false;
  }
};

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy wrap tuned to the Fraunces display size used on the card. */
const wrap = (text, maxChars, maxLines) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else line = next;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[,.;:]?$/, '') + '…';
  }
  return lines;
};

const cardSvg = ({ title, kicker, hasPhoto }) => {
  const titleSize = title.length > 58 ? 54 : title.length > 38 ? 62 : 72;
  const lines = wrap(title, title.length > 58 ? 30 : 26, 3);
  const blockTop = hasPhoto ? 300 : 190;
  const lineHeight = titleSize * 1.14;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SPRUCE}" stop-opacity="${hasPhoto ? 0.35 : 1}"/>
      <stop offset="42%" stop-color="${SPRUCE}" stop-opacity="${hasPhoto ? 0.86 : 1}"/>
      <stop offset="100%" stop-color="${SPRUCE}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>

  <g stroke="${TERRACOTTA}" stroke-width="2" fill="none" opacity="0.9">
    <path d="M64 ${blockTop - 54} h96"/>
  </g>
  <text x="64" y="${blockTop - 40}" font-family="Inter" font-size="21" letter-spacing="3.4" fill="${TERRACOTTA}">${escapeXml(kicker.toUpperCase())}</text>

  ${lines
    .map(
      (line, index) =>
        `<text x="64" y="${blockTop + 34 + index * lineHeight}" font-family="Fraunces" font-size="${titleSize}" fill="${INK}">${escapeXml(line)}</text>`,
    )
    .join('\n  ')}

  <g stroke="${MUTED}" stroke-width="1.5" fill="none" opacity="0.5" stroke-dasharray="6 7">
    <path d="M64 ${H - 108} H ${W - 64}"/>
  </g>
  <g stroke="${MUTED}" stroke-width="1.5" fill="none" opacity="0.75">
    <path d="M64 ${H - 116} v16 M${W - 64} ${H - 116} v16"/>
  </g>

  <circle cx="82" cy="${H - 58}" r="19" fill="none" stroke="${INK}" stroke-width="2"/>
  <text x="82" y="${H - 51}" font-family="Fraunces" font-size="21" fill="${INK}" text-anchor="middle">W</text>
  <text x="116" y="${H - 51}" font-family="Fraunces" font-size="25" fill="${INK}">The Workspace Pro</text>
  <text x="${W - 64}" y="${H - 51}" font-family="Inter" font-size="19" letter-spacing="1.6" fill="${MUTED}" text-anchor="end">A HOME OFFICE THAT FITS YOUR BODY</text>
</svg>`;
};

const renderCard = async ({ slug, title, kicker, photo }) => {
  const hasPhoto = Boolean(photo && existsSync(photo) && statSync(photo).size > 2000);
  const svg = Buffer.from(cardSvg({ title, kicker, hasPhoto }));
  const base = hasPhoto
    ? await sharp(photo).resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer()
    : await sharp({ create: { width: W, height: H, channels: 3, background: SPRUCE } }).png().toBuffer();

  await sharp(base)
    .composite([{ input: svg, top: 0, left: 0 }])
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(join(OUT_DIR, `${slug}.jpg`));
  return hasPhoto;
};

const kickerFor = (route) => {
  if (route === '/') return 'Fit your workspace';
  if (route.startsWith('/guides/')) return 'Workspace guide';
  if (route.startsWith('/compare')) return 'Head to head';
  if (route.includes('calculator') || route === '/tools') return 'Free tool';
  if (route.startsWith('/deals')) return 'Value picks';
  return 'The Workspace Pro';
};

/** Page title from the built HTML, minus the site suffix. */
const titleFromHtml = (file) => {
  const html = readFileSync(file, 'utf8');
  const raw = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  return raw
    .replace(/\s*[-–—|]\s*The Workspace Pro\s*$/i, '')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const main = async () => {
  ensureFonts();
  mkdirSync(OUT_DIR, { recursive: true });

  const photoByRoute = new Map();
  for (const master of manifest.masters) {
    if (master.approval !== 'approved-production') continue;
    for (const route of master.routes) {
      photoByRoute.set(route.replace(/\.html$/, '').replace(/\/$/, '') || '/', `assets/images/editorial/${master.slug}-desktop.webp`);
    }
  }

  const { readdir } = await import('node:fs/promises');
  const walk = async (dir) => {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await walk(full)));
      else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
  };

  const files = (await walk('dist')).sort();
  let withPhoto = 0;
  let plain = 0;

  for (const file of files) {
    const route = file.replace(/^dist/, '').replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
    if (route === '/404' || route.startsWith('/embed/')) continue;
    const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/+$/, '').replace(/\//g, '-');
    const title = titleFromHtml(file);
    if (!title) continue;
    const used = await renderCard({ slug, title, kicker: kickerFor(route), photo: photoByRoute.get(route) });
    used ? withPhoto++ : plain++;
  }

  console.log(`Wrote ${withPhoto + plain} OG cards to ${OUT_DIR}/ (${withPhoto} with editorial photography, ${plain} title-block only).`);
};

await main();
