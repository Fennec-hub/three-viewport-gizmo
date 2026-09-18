import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { deriveRelease } from '../scripts/ci-release.mjs';

const sha = 'a'.repeat(40);
const releaseFiles = [
  '.nx/version-plans/cardinal-camera-settle.md',
  'CHANGELOG.md',
  'package-lock.json',
  'package.json',
];
const release = {
  event: 'push',
  ref: 'refs/heads/main',
  sha,
  packageVersion: '2.2.2',
  subject: 'chore(release): three-viewport-gizmo v2.2.2 (#3)',
  changedFiles: releaseFiles,
  changelog: '# Changelog\n\n## 2.2.2 (2026-08-26)\n',
};

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const nxConfig = JSON.parse(readFileSync(new URL('../nx.json', import.meta.url), 'utf8'));

test('ordinary pull requests can test a prerelease baseline without publishing', () => {
  assert.deepEqual(
    deriveRelease({
      event: 'pull_request',
      ref: 'refs/pull/2/merge',
      sha,
      packageVersion: '2.2.2-beta.0',
      subject: 'Automate npm releases',
    }),
    { kind: 'pull-request', npmPublish: false, version: '2.2.2-beta.0' },
  );
});

test('manual runs never publish, even for a release-looking commit', () => {
  assert.deepEqual(
    deriveRelease({ ...release, event: 'workflow_dispatch', ref: 'refs/heads/topic' }),
    { kind: 'dispatch', npmPublish: false, version: '2.2.2' },
  );
});

test('a release pull request validates but does not publish', () => {
  assert.deepEqual(deriveRelease({ ...release, event: 'pull_request' }), {
    kind: 'release-pull-request',
    npmPublish: false,
    version: '2.2.2',
  });
});

test('only an exact release commit pushed to main publishes', () => {
  assert.deepEqual(deriveRelease(release), {
    kind: 'release',
    npmPublish: true,
    releaseTag: 'v2.2.2',
    version: '2.2.2',
  });
});

test('rejects release commits with missing or unexpected files', () => {
  assert.throws(
    () => deriveRelease({ ...release, changedFiles: releaseFiles.filter((file) => file !== 'package-lock.json') }),
    /must change package-lock.json/u,
  );
  assert.throws(
    () => deriveRelease({ ...release, changedFiles: [...releaseFiles, 'lib/ViewportGizmo.ts'] }),
    /unexpected files/u,
  );
});

test('rejects malformed release-looking main commits', () => {
  assert.throws(
    () => deriveRelease({ ...release, subject: 'chore(release): three-viewport-gizmo vnext' }),
    /invalid SemVer/u,
  );
});

test('publishes the frozen tarball through an explicit local path', () => {
  const publishCommand = workflow
    .split('\n')
    .find((line) => line.trimStart().startsWith('npm publish '));

  assert.equal(
    publishCommand?.trim(),
    'npm publish "./candidate/$filename" --access public --provenance --ignore-scripts',
  );
});

test('branches on a missing release tag without treating the 404 body as a SHA', () => {
  assert.equal(
    workflow.includes(
      'if tag_object=$(gh api "repos/$REPOSITORY/git/ref/tags/$tag" --jq .object.sha 2>/dev/null); then',
    ),
    true,
  );
  assert.equal(
    workflow.includes(
      'tag_object=$(gh api "repos/$REPOSITORY/git/ref/tags/$tag" --jq .object.sha 2>/dev/null || true)',
    ),
    false,
  );
});

test('idempotent closeout tags the source commit from verified registry provenance', () => {
  assert.equal(workflow.includes('existed: ${{ steps.publish.outputs.existed }}'), true);
  assert.equal(
    workflow.includes('SOURCE_COMMIT: ${{ needs.registry-verify.outputs.source-commit }}'),
    true,
  );
});

test('tag closeout uses a current-repository-scoped release bot token', () => {
  assert.equal(workflow.includes('id: release-bot'), true);
  assert.equal(workflow.includes('repositories: ${{ github.event.repository.name }}'), true);
  assert.equal(workflow.includes('GH_TOKEN: ${{ steps.release-bot.outputs.token }}'), true);
});

test('does not require package Version Plans for unpublished release infrastructure', () => {
  const ignored = nxConfig.release.versionPlans.ignorePatternsForPlanCheck;

  assert.equal(ignored.includes('scripts/**'), true);
  assert.equal(ignored.includes('nx.json'), true);
});
