import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyReleaseAttestations } from '../scripts/verify-release-attestations.mjs';

const name = '@taulabs/three-viewport-gizmo';
const version = '2.2.2';
const commit = 'a'.repeat(40);
const runId = '123';
const digest = Buffer.alloc(64, 7);
const integrity = `sha512-${digest.toString('base64')}`;
const manifest = { name, version, integrity, filename: 'taulabs-three-viewport-gizmo-2.2.2.tgz' };

const statement = {
  subject: [
    {
      name: `pkg:npm/%40taulabs/three-viewport-gizmo@${version}`,
      digest: { sha512: digest.toString('hex') },
    },
  ],
  predicate: {
    buildDefinition: {
      buildType: 'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1',
      externalParameters: {
        workflow: {
          repository: 'https://github.com/taucad/three-viewport-gizmo',
          path: '.github/workflows/ci.yml',
          ref: 'refs/heads/main',
        },
      },
      resolvedDependencies: [
        {
          uri: 'git+https://github.com/taucad/three-viewport-gizmo@refs/heads/main',
          digest: { gitCommit: commit },
        },
      ],
    },
    runDetails: {
      builder: { id: 'https://github.com/actions/runner/github-hosted' },
      metadata: {
        invocationId: `https://github.com/taucad/three-viewport-gizmo/actions/runs/${runId}/attempts/1`,
      },
    },
  },
};

const audit = {
  invalid: [],
  missing: [],
  verified: [
    {
      name,
      version,
      attestations: {
        provenance: { predicateType: 'https://slsa.dev/provenance/v1' },
      },
      attestationBundles: [
        {
          predicateType: 'https://slsa.dev/provenance/v1',
          bundle: {
            dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString('base64') },
          },
        },
      ],
    },
  ],
};

test('accepts provenance bound to the package, workflow, commit, and run', () => {
  assert.deepEqual(verifyReleaseAttestations({ audit, manifest, commit, runId }), { commit, runId });
});

test('returns the attested source when closing out an existing matching package', () => {
  assert.deepEqual(verifyReleaseAttestations({ audit, manifest }), { commit, runId });
});

test('rejects a different source commit or candidate integrity', () => {
  assert.throws(
    () => verifyReleaseAttestations({ audit, manifest, commit: 'b'.repeat(40), runId }),
    /wrong source commit/u,
  );
  assert.throws(
    () => verifyReleaseAttestations({ audit, manifest, commit, runId: '456' }),
    /wrong workflow invocation/u,
  );
  assert.throws(
    () =>
      verifyReleaseAttestations({
        audit,
        manifest: { ...manifest, integrity: `sha512-${Buffer.alloc(64, 8).toString('base64')}` },
        commit,
        runId,
      }),
    /digest differs/u,
  );
});

test('rejects missing or invalid npm signature results', () => {
  assert.throws(
    () => verifyReleaseAttestations({ audit: { ...audit, missing: [{ name, version }] }, manifest, commit, runId }),
    /missing signatures/u,
  );
  assert.throws(
    () => verifyReleaseAttestations({ audit: { ...audit, invalid: [{ name, version }] }, manifest, commit, runId }),
    /invalid signatures/u,
  );
});
