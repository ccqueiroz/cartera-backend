import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import * as admin from 'firebase-admin';
import { serviceAccountKey } from './../../src/packages/clients/firebase/serviceAccountKey';

const ARTIFACTS_DIR = resolve(__dirname, './../../test/e2e/.artifacts');
const PROD_PROJECT_MARKERS = ['prod', 'production'];

function assertNotProduction(): void {
  const projectId = (serviceAccountKey.projectId ?? '').toLowerCase();
  if (!projectId) {
    throw new Error('[purge] FIREBASE_SERVICE_ACCOUNT_PROJECT_ID is missing.');
  }
  if (PROD_PROJECT_MARKERS.some((marker) => projectId.includes(marker))) {
    throw new Error(
      `[purge] project "${projectId}" looks like production — aborted.`,
    );
  }
}

function authUidsFromManifests(runId?: string): string[] {
  const files = runId
    ? [`manifest-${runId}.json`]
    : readdirSync(ARTIFACTS_DIR).filter(
        (name) => name.startsWith('manifest-') && name.endsWith('.json'),
      );

  const uids = new Set<string>();
  for (const file of files) {
    const raw = readFileSync(resolve(ARTIFACTS_DIR, file), 'utf-8');
    const manifest = JSON.parse(raw) as { authUids?: string[] };
    (manifest.authUids ?? []).forEach((uid) => uids.add(uid));
  }
  return [...uids];
}

async function main(): Promise<void> {
  assertNotProduction();

  const runId = process.argv[2];
  const uids = authUidsFromManifests(runId);
  if (uids.length === 0) {
    // eslint-disable-next-line no-console
    console.log('[purge] no authUid in the manifest(s); nothing to do.');
    return;
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccountKey.projectId,
      clientEmail: serviceAccountKey.clientEmail,
      privateKey: serviceAccountKey.privateKey,
    } as admin.ServiceAccount),
  });

  const result = await app.auth().deleteUsers(uids);
  // eslint-disable-next-line no-console
  console.log(
    `[purge] project=${serviceAccountKey.projectId} target=${uids.length} removed=${result.successCount} failures=${result.failureCount}`,
  );
  result.errors.forEach((error) => {
    // eslint-disable-next-line no-console
    console.error(`[purge] uid[${error.index}]: ${error.error.message}`);
  });

  await app.delete();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
