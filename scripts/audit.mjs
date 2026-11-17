#!/usr/bin/env node
// `npm audit --audit-level=high` with a short allowlist for advisories that have no patched release and reach dev
// tooling only. Each entry says why and when; remove it once a fix ships (an `overrides` pin then takes its place).
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALLOWED = {
  // Operator ruling 2026-11-17. picomatch ReDoS via repeated extglobs: every version (<= 4.0.7) affected, none patched.
  // Reaches only vite, vitest and nx at build and test time; the published package has no dependencies.
  'GHSA-fc5q-39xc-vjpf': 'picomatch',
};

/** The high and critical advisories in an `npm audit --json` report that are not allowlisted. */
export function blocking(report, allowed = ALLOWED) {
  const found = new Map();
  for (const { via } of Object.values(report.vulnerabilities ?? {})) {
    for (const advisory of via) {
      if (typeof advisory !== 'object' || !['high', 'critical'].includes(advisory.severity)) continue;
      const id = advisory.url.split('/').pop();
      if (!(id in allowed)) found.set(id, `${advisory.severity} ${advisory.name}: ${advisory.title} (${id})`);
    }
  }
  return [...found.values()];
}

/**
 * What fails the gate for one `npm audit --json` run (a `spawnSync` result): a spawn error, output that is not a
 * report, or an npm error payload fails closed; otherwise the blocking advisories. npm exits nonzero whenever it finds
 * any vulnerability, so the exit status alone decides nothing.
 */
export function failures({ error, status, stdout }, allowed = ALLOWED) {
  if (error) return [`npm audit did not run: ${error.message}`];
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    return [`npm audit printed no JSON report (exit ${status})`];
  }
  if (report?.error) return [`npm audit failed (exit ${status}): ${report.error.summary ?? JSON.stringify(report.error)}`];
  const { vulnerabilities } = report ?? {};
  if (typeof vulnerabilities !== 'object' || vulnerabilities === null || Array.isArray(vulnerabilities)) {
    return [`npm audit report has no vulnerabilities object (exit ${status})`];
  }
  return blocking(report, allowed);
}

/** Whether this module is the process entrypoint, by real path (a space in a checkout path is `%20` in the URL). */
function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(path.resolve(process.argv[1]));
  } catch {
    return false;
  }
}

if (isMain()) {
  const found = failures(spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  for (const line of found) console.error(line);
  console.log(`npm audit: ${found.length} blocking findings; allowlisted: ${Object.keys(ALLOWED).join(', ')}`);
  process.exit(found.length ? 1 : 0);
}
