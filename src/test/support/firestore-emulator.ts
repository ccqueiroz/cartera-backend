// ponytail: the emulator runs any valid query without checking composite indexes, so a query missing from firestore.indexes.json passes here and fails in production; add an index check when that bites.
import { Firestore } from 'firebase-admin/firestore';

const projectId = `demo-cartera-${process.pid}`;
const startHint = 'start the emulator with yarn emulator:start';

async function assertTarget(
  host: string | undefined,
  targetProjectId: string,
): Promise<void> {
  if (!host) {
    throw new Error(
      `[firestore emulator] FIRESTORE_EMULATOR_HOST is not set; ${startHint}`,
    );
  }
  if (!/^demo-[a-z0-9-]+$/.test(targetProjectId)) {
    throw new Error(
      `[firestore emulator] project "${targetProjectId}" is not a demo-* project; aborted`,
    );
  }
  const answered = await fetch(`http://${host}/`).then(
    (response) => response.status === 200,
    () => false,
  );
  if (!answered) {
    throw new Error(
      `[firestore emulator] nothing answers at ${host}; ${startHint}`,
    );
  }
}

export const firestoreEmulator = {
  projectId,
  async connect(): Promise<Firestore> {
    await assertTarget(process.env.FIRESTORE_EMULATOR_HOST, projectId);
    return new Firestore({ projectId });
  },
  async clear(): Promise<void> {
    const response = await fetch(
      `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
      { method: 'DELETE' },
    );
    if (response.status !== 200) {
      throw new Error(
        `[firestore emulator] clearing project "${projectId}" answered ${response.status}`,
      );
    }
  },
  assertTarget,
};
