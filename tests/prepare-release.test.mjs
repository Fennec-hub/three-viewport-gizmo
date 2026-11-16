import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { prereleaseVersion, validateRequestedVersion, versionFromPlans } from '../scripts/prepare-release.mjs';

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

test('cuts a prerelease train from the planned stable version', () => {
  assert.equal(prereleaseVersion({ currentVersion: '2.3.0', plannedVersion: '3.0.0', preid: 'beta' }), '3.0.0-beta.0');
  assert.equal(
    prereleaseVersion({ currentVersion: '3.0.0-beta.0', plannedVersion: '3.0.0', preid: 'beta' }),
    '3.0.0-beta.1',
  );
  assert.equal(prereleaseVersion({ currentVersion: '3.0.0-beta.4', plannedVersion: '3.0.0', preid: 'rc' }), '3.0.0-rc.0');
  assert.equal(
    prereleaseVersion({ currentVersion: '2.2.2-beta.0', plannedVersion: '3.0.0', preid: 'beta' }),
    '3.0.0-beta.0',
  );
  assert.throws(() => prereleaseVersion({ currentVersion: '2.3.0', plannedVersion: '3.0.0', preid: '0' }), /prerelease id/u);
});

test('accepts only the prerelease the plans and preid dictate', () => {
  assert.equal(
    validateRequestedVersion({
      currentVersion: '2.3.0',
      plannedVersion: '3.0.0',
      requestedVersion: '3.0.0-beta.0',
      preid: 'beta',
    }),
    '3.0.0-beta.0',
  );
  assert.throws(
    () =>
      validateRequestedVersion({
        currentVersion: '2.3.0',
        plannedVersion: '3.0.0',
        requestedVersion: '3.0.0-beta.1',
        preid: 'beta',
      }),
    /does not match Version Plans \(3\.0\.0-beta\.0\)/u,
  );
  assert.throws(
    () =>
      validateRequestedVersion({
        currentVersion: '2.3.0',
        plannedVersion: '3.0.0',
        requestedVersion: '3.0.0-beta.0',
      }),
    /does not match Version Plans/u,
  );
});
