import fs from 'node:fs';
import path from 'node:path';

export function legacyMain(fileName: string): string {
  const source = fs.readFileSync(path.resolve(process.cwd(), fileName), 'utf8');
  const match = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) throw new Error(`Unable to find <main> in ${fileName}`);
  return match[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '');
}

export function legacySection(fileName: string, id: string): string {
  const source = fs.readFileSync(path.resolve(process.cwd(), fileName), 'utf8');
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
