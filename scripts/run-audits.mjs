/**
 * Pre-release audit sweep: `npm run audit`.
 *
 * Boots a static server over ./dist and runs the two audits that need one:
 *
 *   audit-contrast  BLOCKING  — exhaustive WCAG AA sweep, every built route
 *                               in both themes. This is the one that catches
 *                               a layout nobody listed; the e2e guard only
 *                               covers one route per layout.
 *   audit-a11y      ADVISORY  — pointer targets, heading order, accessible
 *                               names, labelling, overflow, alt text. Reported
 *                               but never fails the run: the remaining items
 *                               are prose-inline links, which WCAG exempts.
 *
 * audit-links is deliberately NOT here — it makes live retailer requests, is
 * rate-limited, and belongs on a quarterly cadence. Run `npm run audit:links`.
 *
 * Existing only as a memory-of-the-maintainer step is how a guard rots, which
 * is the failure this repo has now hit three times. This makes the exhaustive
 * sweep a command you can find in `npm run`.
 */

import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const PORT = 4331;
const BASE = `http://localhost:${PORT}`;

if (!existsSync('dist')) {
  console.error('dist/ is missing — run `npm run build` first.');
  process.exit(1);
}

const server = spawn('npx', ['serve', 'dist', '-l', String(PORT), '--no-clipboard'], {
  stdio: 'ignore',
  detached: true,
});

const shutdown = () => {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* already gone */
  }
};
process.on('exit', shutdown);
process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});

/** Poll until the server actually answers — a dead server is a vacuous pass. */
async function waitForServer(timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function run(label, script, { blocking }) {
  process.stdout.write(`\n──── ${label} ${blocking ? '(blocking)' : '(advisory)'} ────\n`);
  try {
    execFileSync('node', [script, BASE], { stdio: 'inherit' });
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

if (!(await waitForServer())) {
  console.error(`Static server never became ready on ${BASE}.`);
  shutdown();
  process.exit(1);
}

const contrast = run('contrast', 'scripts/audit-contrast.mjs', { blocking: true });
const a11y = run('accessibility', 'scripts/audit-a11y.mjs', { blocking: false });

shutdown();

if (contrast !== 0) {
  console.error('\nFAIL: contrast audit found AA failures. Fix before release.');
  process.exit(contrast);
}
console.log(`\nOK: contrast clean.${a11y === 0 ? '' : ' Accessibility notes above are advisory.'}`);
