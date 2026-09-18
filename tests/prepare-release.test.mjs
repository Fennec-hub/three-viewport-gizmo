import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { validateRequestedVersion, versionFromPlans } from '../scripts/prepare-release.mjs';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('installs the Nx JavaScript version action used by releaseVersion', () => {
  assert.equal(packageJson.devDependencies['@nx/js'], packageJson.devDependencies.nx);
});

test('uses the version dictated by the pending plan', () => {
  assert.equal(versionFromPlans('2.2.2'), '2.2.2');
  assert.throws(() => versionFromPlans(undefined), /no pending Version Plan/u);
});

test('accepts the stable version that promotes the registry prerelease', () => {
  assert.equal(
    validateRequestedVersion({
      currentVersion: '2.2.2-beta.0',
      plannedVersion: '2.2.2',
      requestedVersion: '2.2.2',
    }),
    '2.2.2',
  );
});

test('rejects prereleases, mismatched plans, and non-increasing versions', () => {
  assert.throws(
    () =>
      validateRequestedVersion({
        currentVersion: '2.2.2-beta.0',
        plannedVersion: '2.2.2-beta.1',
        requestedVersion: '2.2.2-beta.1',
      }),
    /stable SemVer/u,
  );
  assert.throws(
    () =>
      validateRequestedVersion({
        currentVersion: '2.2.2-beta.0',
        plannedVersion: '2.2.2',
        requestedVersion: '2.2.3',
      }),
    /does not match Version Plans/u,
  );
  assert.throws(
    () =>
      validateRequestedVersion({
        currentVersion: '2.2.2',
        plannedVersion: '2.2.2',
        requestedVersion: '2.2.2',
      }),
    /must be newer/u,
  );
});
