// Compares perf/out/results.json and perf/out/bundle.json with perf/budget.json.
// Blocking rows fail the run; an expected failure (expectedFail, optionally only the failsOn types)
// that passes also fails, so its owner flips it. Report rows never fail unless PERF_ALARM=1 on the
// reference machine, where they alarm at 3x the 2.3.0 baseline. Writes a table to GITHUB_STEP_SUMMARY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const { rows } = read('budget.json');
const { runs, meta } = read('out/results.json');
const bundle = read('out/bundle.json');
const types = ['sphere', 'cube', 'rounded-cube'];

const prog = (s) => s.programs ?? s.pipelines;
const mem = (s) => [s.memory.geometries, s.memory.textures, prog(s)];
/** Measured values per cell, `${backend}/${type}` or a bundle backend. */
const measure = {
  draws: (r, t) => r.first.steady.draws,
  triangles: (r) => r.first.steady.triangles,
  programs: (r) => prog(r.first.afterFirst) - prog(r.first.base),
  'hover-programs': (r) => prog(r.first.hover.after) - prog(r.first.steady),
  'dispose-leak': (r) => mem(r.setCycle.afterSets).map((v, i) => v - mem(r.setCycle.before)[i]).concat(mem(r.setCycle.afterDispose).map((v, i) => v - mem(r.first.base)[i])).reduce((a, b) => a + Math.abs(b), 0),
  alloc: (r) => ({ idle: r.alloc.idle.bytesPerCall.gizmo ?? 0, animating: r.alloc.animating.bytesPerCall.gizmo ?? 0 }),
  'self-time': (r) => r.cpu.idle.usPerCall.gizmo ?? 0,
  pointermove: (r) => r.timing.hover.handler.mean * 1000,
  'idle-render': (r) => r.timing.idle.mean * 1000,
  'first-render-warm': (r) => r.firstWarmed.firstRenderCpuMs,
  'set-next-frame': (r) => r.setCycle.set.mean + r.setCycle.firstRenderAfterSet.mean,
};
const within = (row, v, cell) => {
  const b = typeof row.budget === 'object' && !Array.isArray(row.budget) ? row.budget[cell.type] ?? row.budget[cell.backend] ?? row.budget : row.budget;
  const k = row.tolerance ?? 1;
  if (typeof v === 'object') return Object.entries(v).every(([key, x]) => x <= b[key] * k);
  return v <= b * k;
};

const lines = [];
let failed = 0;
const record = (row, cell, value, ok) => {
  const expected = row.expectedFail && (!row.failsOn || row.failsOn.includes(cell.type ?? cell.backend));
  const status = row.kind === 'report' ? (ok ? 'ok' : 'alarm') : ok ? (expected ? 'XPASS: flip expectedFail' : 'pass') : expected ? `xfail (${row.owner})` : 'FAIL';
  if (row.kind !== 'report' && ok === expected) failed++;
  if (row.kind === 'report' && !ok && process.env.PERF_ALARM === '1') failed++;
  lines.push(`| ${row.id} | ${cell.label} | ${JSON.stringify(value)} | ${JSON.stringify(row.budget)} | ${row.kind} | ${status} |`);
};

for (const budgetRow of rows) {
  if (budgetRow.checkedBy !== 'perf') continue;
  // Sampled rows block on the reference GPU only; elsewhere they are reported.
  const row = budgetRow.referenceOnly && meta.gpu !== 'metal' ? { ...budgetRow, kind: 'report' } : budgetRow;
  if (row.id === 'gzip') {
    for (const backend of Object.keys(bundle)) record(row, { backend, label: backend }, bundle[backend].added, within(row, bundle[backend].added, { backend }));
    continue;
  }
  for (const [key, r] of Object.entries(runs)) {
    const [backend, type] = key.split('/');
    if (!types.includes(type) || r.failed) continue;
    if (row.id === 'set-next-frame' && backend !== 'webgl') continue;
    const value = measure[row.id](r);
    const cell = { backend, type, label: key };
    if (row.kind === 'report' && !budgetRow.referenceOnly) {
      const base = typeof row.baseline === 'object' ? row.baseline[backend] : row.baseline;
      record(row, cell, Math.round(value * 100) / 100, value <= 3 * base);
    } else record(row, cell, value, within(row, value, cell));
  }
}
// Rows the browser gate checks, from its JSON report (tests/browser/playwright.config.ts), per backend.
const browserReport = path.join(here, 'out', 'browser.json');
if (fs.existsSync(browserReport)) {
  const tests = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) for (const t of spec.tests) tests.push({ title: spec.title, project: t.projectName, status: t.status });
    (suite.suites ?? []).forEach(walk);
  };
  JSON.parse(fs.readFileSync(browserReport, 'utf8')).suites.forEach(walk);
  const gates = [
    ...rows.filter((r) => r.checkedBy === 'test-browser'),
    { id: 'private-reads', budget: 0, kind: 'blocking', tests: '^H1 no test, spec or harness reads' },
    { id: 'console-warnings', budget: 0, kind: 'blocking', tests: '^H1 every browser spec counts console warnings' },
  ];
  for (const row of gates) {
    for (const project of [...new Set(tests.map((t) => t.project))]) {
      const mine = tests.filter((t) => t.project === project && t.status !== 'skipped' && new RegExp(row.tests).test(t.title));
      if (!mine.length) continue;
      const bad = mine.filter((t) => t.status !== 'expected').length;
      record({ ...row, expectedFail: false }, { backend: project, label: `${project} (${mine.length} tests)` }, bad ? `${bad} failed` : 'all passed', bad === 0);
    }
  }
}
for (const [key, r] of Object.entries(runs)) if (r.failed) { failed++; lines.push(`| run | ${key} | ${r.failed} | | blocking | FAIL |`); }

const table = [`Perf budget on ${meta.gpu} (${meta.chromium}, N=${meta.N}); report rows alarm only on the reference machine.`, '', '| Row | Cell | Measured | Budget | Kind | Status |', '| --- | --- | --- | --- | --- | --- |', ...lines].join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Perf budget (${meta.gpu})\n\n${table}\n\n`);
if (failed) { console.error(`\n${failed} budget cell(s) failed`); process.exit(1); }
