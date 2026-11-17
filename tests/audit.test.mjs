import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { blocking, failures } from '../scripts/audit.mjs';

const report = (...advisories) => ({
  vulnerabilities: { pkg: { via: ['other-pkg', ...advisories] } },
});
const advisory = (id, severity) => ({ url: `https://github.com/advisories/${id}`, severity, name: 'pkg', title: 't' });
const run = (stdout, status = 1) => ({ status, stdout: typeof stdout === 'string' ? stdout : JSON.stringify(stdout) });

test('an allowlisted advisory does not block', () => {
  assert.deepEqual(blocking(report(advisory('GHSA-fc5q-39xc-vjpf', 'high'))), []);
});

test('any other high or critical advisory blocks; moderate does not', () => {
  const found = blocking(report(advisory('GHSA-aaaa', 'high'), advisory('GHSA-bbbb', 'critical'), advisory('GHSA-cccc', 'moderate')));
  assert.equal(found.length, 2);
});

test('a nonzero npm exit with only the allowlisted advisory passes; a clean report passes', () => {
  assert.deepEqual(failures(run(report(advisory('GHSA-fc5q-39xc-vjpf', 'high')), 1)), []);
  assert.deepEqual(failures(run({ vulnerabilities: {} }, 0)), []);
  assert.equal(failures(run(report(advisory('GHSA-aaaa', 'critical')), 1)).length, 1);
});

test('fails closed when npm does not run', () => {
  const found = failures({ error: new Error('spawn npm ENOENT'), status: null, stdout: undefined });
  assert.match(found.join(), /did not run: spawn npm ENOENT/);
});

test('fails closed on output that is not JSON', () => {
  assert.match(failures(run('npm ERR! something', 1)).join(), /no JSON report \(exit 1\)/);
  assert.match(failures(run('', 1)).join(), /no JSON report/);
});

test('fails closed on an npm error payload', () => {
  const found = failures(run({ error: { code: 'ENOAUDIT', summary: 'Your configured registry does not support audit requests.' } }));
  assert.match(found.join(), /npm audit failed \(exit 1\): Your configured registry/);
});

test('fails closed on a report without a vulnerabilities object', () => {
  for (const body of [{}, { vulnerabilities: null }, { vulnerabilities: [] }, null, 42]) {
    assert.match(failures(run(body)).join(), /no vulnerabilities object/, JSON.stringify(body));
  }
});

// The entrypoint, run from a checkout path with a space, against a stub `npm` on PATH.
test('runs the audit when its path contains a space', { skip: process.platform === 'win32' }, (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'audit with space '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const script = path.join(dir, 'scripts', 'audit.mjs');
  mkdirSync(path.dirname(script));
  copyFileSync(fileURLToPath(new URL('../scripts/audit.mjs', import.meta.url)), script);
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const stub = (body) => {
    writeFileSync(path.join(bin, 'npm'), `#!/bin/sh\ncat <<'JSON'\n${JSON.stringify(body)}\nJSON\nexit 1\n`);
    chmodSync(path.join(bin, 'npm'), 0o755);
    return spawnSync(process.execPath, [script], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` },
    });
  };
  const blocked = stub(report(advisory('GHSA-aaaa', 'critical')));
  assert.equal(blocked.status, 1, blocked.stderr);
  assert.match(blocked.stderr, /critical pkg: t \(GHSA-aaaa\)/);
  const allowed = stub(report(advisory('GHSA-fc5q-39xc-vjpf', 'high')));
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.match(allowed.stdout, /npm audit: 0 blocking/);
});
