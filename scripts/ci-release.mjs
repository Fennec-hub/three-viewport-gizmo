#!/usr/bin/env node

import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import semver from 'semver';

const SHA = /^[0-9a-f]{40}$/u;
const RELEASE_SUBJECT = /^chore\(release\): three-viewport-gizmo v(.+?)(?: \(#\d+\))?$/u;
export const RELEASE_FILES = new Set(['CHANGELOG.md', 'package-lock.json', 'package.json']);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const isVersionPlan = (file) => file.startsWith('.nx/version-plans/') && file.endsWith('.md');

const validateRelease = ({ changedFiles, changelog, packageVersion, subject }) => {
  const match = RELEASE_SUBJECT.exec(subject);
  assert(match, `release source is not an exact release commit: ${subject}`);
  assert(semver.valid(match[1]), `release subject has invalid SemVer: ${match[1]}`);
  assert(match[1] === packageVersion, `release subject ${match[1]} does not match ${packageVersion}`);
  assert(semver.valid(packageVersion), `invalid package version: ${packageVersion}`);
  assert(semver.prerelease(packageVersion) === null, `release version is not stable SemVer: ${packageVersion}`);
  for (const file of RELEASE_FILES) {
    assert(changedFiles.includes(file), `release commit must change ${file}`);
  }
  assert(changedFiles.some(isVersionPlan), 'release commit must consume a Version Plan');
  const unexpected = changedFiles.filter((file) => !RELEASE_FILES.has(file) && !isVersionPlan(file));
  assert(unexpected.length === 0, `release commit has unexpected files: ${unexpected.join(', ')}`);
  assert(
    changelog
      .split(/\r?\n/u)
      .some((line) => line === `## ${packageVersion}` || line.startsWith(`## ${packageVersion} (`)),
    `CHANGELOG.md has no ${packageVersion} section`,
  );
};

export const deriveRelease = ({
  event,
  ref,
  sha,
  packageVersion,
  subject = '',
  changedFiles = [],
  changelog = '',
}) => {
  assert(SHA.test(sha), 'sha must be 40 lowercase hexadecimal characters');
  assert(semver.valid(packageVersion), `invalid package version: ${packageVersion}`);
  const release = RELEASE_SUBJECT.test(subject);

  if (event === 'pull_request') {
    if (release) validateRelease({ changedFiles, changelog, packageVersion, subject });
    return {
      kind: release ? 'release-pull-request' : 'pull-request',
      npmPublish: false,
      version: packageVersion,
    };
  }

  if (event === 'workflow_dispatch') {
    return { kind: 'dispatch', npmPublish: false, version: packageVersion };
  }

  assert(event === 'push', `unsupported event: ${event}`);
  assert(ref === 'refs/heads/main', `publication source must be protected main: ${ref}`);
  if (!release) {
    assert(
      !subject.startsWith('chore(release): three-viewport-gizmo v'),
      `malformed release subject: ${subject}`,
    );
    return { kind: 'main', npmPublish: false, version: packageVersion };
  }

  validateRelease({ changedFiles, changelog, packageVersion, subject });
  return {
    kind: 'release',
    npmPublish: true,
    releaseTag: `v${packageVersion}`,
    version: packageVersion,
  };
};

const parseArgs = (argv) =>
  Object.fromEntries(
    argv.flatMap((value, index) => (value.startsWith('--') ? [[value.slice(2), argv[index + 1] ?? '']] : [])),
  );

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const changedFiles = args['changed-files-file']
      ? readFileSync(args['changed-files-file'], 'utf8').split(/\r?\n/u).filter(Boolean)
      : [];
    const result = deriveRelease({
      event: args.event,
      ref: args.ref,
      sha: args.sha,
      packageVersion: args['package-version'],
      subject: args.subject,
      changedFiles,
      changelog: readFileSync('CHANGELOG.md', 'utf8'),
    });
    const output = Object.entries(result)
      .map(([key, value]) => `${key.replace(/[A-Z]/gu, (character) => `_${character.toLowerCase()}`)}=${value}`)
      .join('\n');
    process.stdout.write(`${output}\n`);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
