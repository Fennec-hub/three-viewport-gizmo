#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { releaseChangelog, releaseVersion } from 'nx/release/index.js';
import semver from 'semver';

const PROJECT = 'three-viewport-gizmo';
const PACKAGE_PATH = new URL('../package.json', import.meta.url);
const PACKAGE_LOCK_PATH = new URL('../package-lock.json', import.meta.url);
const GIT_OPTIONS = {
  gitCommit: false,
  gitPush: false,
  gitTag: false,
  stageChanges: false,
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const packageVersion = () => JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')).version;

const assertClean = () => {
  const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  assert(status.length === 0, 'release preparation requires a clean worktree');
};

const runQualityGate = () => {
  execFileSync('npm', ['run', 'quality'], { stdio: 'inherit' });
};

export const versionFromPlans = (plannedVersion) => {
  assert(Boolean(plannedVersion), `no pending Version Plan affects ${PROJECT}`);
  return plannedVersion;
};

export const validateRequestedVersion = ({ currentVersion, plannedVersion, requestedVersion }) => {
  assert(semver.valid(currentVersion), `invalid package version: ${currentVersion}`);
  assert(semver.valid(plannedVersion), `invalid Version Plan result: ${plannedVersion}`);
  assert(semver.valid(requestedVersion), `invalid requested version: ${requestedVersion}`);
  assert(semver.prerelease(requestedVersion) === null, 'routine releases require stable SemVer');
  assert(
    plannedVersion === requestedVersion,
    `requested ${requestedVersion} does not match Version Plans (${plannedVersion})`,
  );
  assert(
    semver.gt(requestedVersion, currentVersion),
    `${requestedVersion} must be newer than ${currentVersion}`,
  );
  return requestedVersion;
};

const prepare = async ({ dryRun, requestedVersion }) => {
  if (!dryRun) assertClean();
  runQualityGate();

  const currentVersion = packageVersion();
  const preview = await releaseVersion({
    ...GIT_OPTIONS,
    deleteVersionPlans: false,
    dryRun: true,
  });
  const plannedVersion = versionFromPlans(preview.projectsVersionData[PROJECT]?.newVersion);
  const version = requestedVersion ?? plannedVersion;
  validateRequestedVersion({ currentVersion, plannedVersion, requestedVersion: version });

  await releaseChangelog({
    ...GIT_OPTIONS,
    createRelease: false,
    deleteVersionPlans: true,
    dryRun: true,
    releaseGraph: preview.releaseGraph,
    version,
  });
  if (dryRun) return version;

  await releaseVersion({
    ...GIT_OPTIONS,
    deleteVersionPlans: true,
    version,
  });
  await releaseChangelog({
    ...GIT_OPTIONS,
    createRelease: false,
    deleteVersionPlans: false,
    releaseGraph: preview.releaseGraph,
    version,
  });
  execFileSync('npm', ['install', '--package-lock-only', '--ignore-scripts'], { stdio: 'inherit' });

  const lock = JSON.parse(readFileSync(PACKAGE_LOCK_PATH, 'utf8'));
  assert(packageVersion() === version, `release preparation did not leave ${PROJECT} at ${version}`);
  assert(lock.version === version, `package-lock.json root is not ${version}`);
  assert(lock.packages?.['']?.version === version, `package-lock.json importer is not ${version}`);
  return version;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const requestedVersion = process.argv.slice(2).find((value) => !value.startsWith('-'));
  const dryRun = process.argv.includes('--dry-run');
  const fromPlans = process.argv.includes('--from-plans');

  try {
    assert(
      fromPlans ? !requestedVersion : requestedVersion,
      'usage: npm run release:prepare -- <version> [--dry-run], or npm run release:prepare -- --from-plans [--dry-run]',
    );
    const version = await prepare({ dryRun, requestedVersion });
    process.stdout.write(`${dryRun ? 'Would prepare' : 'Prepared'} ${PROJECT} v${version}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
