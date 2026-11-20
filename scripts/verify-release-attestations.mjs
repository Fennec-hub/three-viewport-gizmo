#!/usr/bin/env node

import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PROVENANCE_TYPE = 'https://slsa.dev/provenance/v1';
const BUILD_TYPE = 'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1';
const BUILDER_ID = 'https://github.com/actions/runner/github-hosted';
const REPOSITORY = 'https://github.com/taucad/three-viewport-gizmo';
const WORKFLOW = '.github/workflows/ci.yml';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const decodeProvenance = (entry) => {
  const attestation = entry.attestationBundles?.find(
    ({ predicateType }) => predicateType === PROVENANCE_TYPE,
  );
  assert(attestation, `${entry.name}@${entry.version} has no verified provenance attestation`);
  return JSON.parse(Buffer.from(attestation.bundle.dsseEnvelope.payload, 'base64').toString('utf8'));
};

const expectedDigest = (integrity) => {
  assert(integrity.startsWith('sha512-'), `unsupported integrity: ${integrity}`);
  return Buffer.from(integrity.slice('sha512-'.length), 'base64').toString('hex');
};

const subjectNames = ({ name, version }) => {
  if (!name.startsWith('@')) return new Set([`pkg:npm/${name}@${version}`]);
  const [scope, packageName] = name.split('/');
  return new Set([
    `pkg:npm/${encodeURIComponent(scope)}/${packageName}@${version}`,
    `pkg:npm/${name}@${version}`,
  ]);
};

const verifyPackage = ({ audit, candidate, commit, runId }) => {
  const entry = audit.verified?.find(
    ({ name, version }) => name === candidate.name && version === candidate.version,
  );
  assert(entry, `${candidate.name}@${candidate.version} has no verified npm signature`);
  assert(
    entry.attestations?.provenance?.predicateType === PROVENANCE_TYPE,
    `${candidate.name} lacks provenance`,
  );

  const statement = decodeProvenance(entry);
  const expectedSubjects = subjectNames(candidate);
  const subject = statement.subject?.find(({ name }) => expectedSubjects.has(name));
  assert(subject?.digest?.sha512 === expectedDigest(candidate.integrity), `${candidate.name} digest differs`);

  const definition = statement.predicate?.buildDefinition;
  const workflow = definition?.externalParameters?.workflow;
  assert(definition?.buildType === BUILD_TYPE, `${candidate.name} has the wrong build type`);
  assert(workflow?.repository === REPOSITORY, `${candidate.name} has the wrong source repository`);
  assert(workflow?.path === WORKFLOW, `${candidate.name} has the wrong source workflow`);
  assert(workflow?.ref === 'refs/heads/main', `${candidate.name} was not built from main`);

  const source = definition.resolvedDependencies?.find(
    ({ uri }) => uri === `git+${REPOSITORY}@refs/heads/main`,
  );
  const sourceCommit = source?.digest?.gitCommit;
  assert(typeof sourceCommit === 'string', `${candidate.name} has no source commit`);
  if (commit) assert(sourceCommit === commit, `${candidate.name} has the wrong source commit`);
  assert(
    statement.predicate?.runDetails?.builder?.id === BUILDER_ID,
    `${candidate.name} used the wrong builder`,
  );
  const invocation = statement.predicate?.runDetails?.metadata?.invocationId ?? '';
  const match = new RegExp(`^${REPOSITORY}/actions/runs/(\\d+)/attempts/[1-9]\\d*$`, 'u').exec(invocation);
  assert(match, `${candidate.name} has the wrong workflow invocation`);
  const sourceRunId = match[1];
  if (runId) assert(sourceRunId === runId, `${candidate.name} has the wrong workflow invocation`);
  return { commit: sourceCommit, runId: sourceRunId };
};

export const verifyReleaseAttestations = ({ audit, manifest, commit, runId }) => {
  assert((audit.invalid ?? []).length === 0, 'npm reported invalid signatures');
  assert((audit.missing ?? []).length === 0, 'npm reported missing signatures');
  return verifyPackage({ audit, candidate: manifest, commit, runId });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const [auditPath, manifestPath, commit, runId] = process.argv.slice(2);
    assert(auditPath && manifestPath, 'expected audit and manifest');
    assert(Boolean(commit) === Boolean(runId), 'expected commit and run together');
    const source = verifyReleaseAttestations({
      audit: JSON.parse(readFileSync(auditPath, 'utf8')),
      manifest: JSON.parse(readFileSync(manifestPath, 'utf8')),
      commit,
      runId,
    });
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `source_commit=${source.commit}\nworkflow_run=${source.runId}\n`);
    }
    process.stdout.write('release provenance matches taucad/three-viewport-gizmo ci.yml\n');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
