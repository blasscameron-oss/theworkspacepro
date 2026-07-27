import { execSync } from 'node:child_process';

let cachedReleaseSha: string | undefined;

function deriveBuildFallback(): string {
  try {
    const sha = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (sha) return sha;
  } catch {
    // git unavailable or not a repo — fall through to timestamp fallback.
  }
  return `build-${Date.now()}`;
}

/**
 * Cache-busting version token for built assets.
 *
 * CI sets PUBLIC_RELEASE_SHA to the real commit SHA. For manual/local builds
 * where that env var is unset, derive a short git SHA at build time instead
 * of falling back to a constant like "dev" — a constant defeats Cloudflare's
 * asset cache busting across deploys.
 */
export function getReleaseSha(): string {
  if (cachedReleaseSha) return cachedReleaseSha;
  const envSha = import.meta.env.PUBLIC_RELEASE_SHA;
  const sha = envSha || deriveBuildFallback();
  cachedReleaseSha = sha;
  return sha;
}
