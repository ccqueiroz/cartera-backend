import { Firestore } from 'firebase-admin/firestore';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { firestoreEmulator } from './firestore-emulator';

jest.setTimeout(60_000);

const PROJECT_ID = `demo-cartera-${process.pid}`;
const OTHER_PROJECT_ID = `demo-cartera-${process.pid}-other`;
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const HOST_NOT_SET =
  '[firestore emulator] FIRESTORE_EMULATOR_HOST is not set; start the emulator with yarn emulator:start';

const nothingAnswersAt = (host: string): string =>
  `[firestore emulator] nothing answers at ${host}; start the emulator with yarn emulator:start`;

function setEmulatorHost(host: string | undefined): void {
  if (host === undefined) {
    delete process.env.FIRESTORE_EMULATOR_HOST;
  } else {
    process.env.FIRESTORE_EMULATOR_HOST = host;
  }
}

async function withEmulatorHost(
  host: string | undefined,
  run: () => Promise<void>,
): Promise<void> {
  const previousHost = process.env.FIRESTORE_EMULATOR_HOST;
  setEmulatorHost(host);
  try {
    await run();
  } finally {
    setEmulatorHost(previousHost);
  }
}

async function withServerAnswering(
  status: number,
  run: (host: string) => Promise<void>,
): Promise<void> {
  const server = createServer((_request, response) => {
    response.statusCode = status;
    response.end();
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address() as AddressInfo;
  try {
    await run(`127.0.0.1:${port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

describe('firestore emulator support', () => {
  it('[BK3-01] connect returns a client on the demo project of this process that another client reads back', async () => {
    const db = await firestoreEmulator.connect();

    expect(firestoreEmulator.projectId).toBe(PROJECT_ID);
    expect(db).toBeInstanceOf(Firestore);
    await db.collection('Probe').doc('bk3-01').set({ value: 1 });
    const reader = new Firestore({ projectId: PROJECT_ID });
    const snapshot = await reader.collection('Probe').doc('bk3-01').get();
    expect(snapshot.data()).toEqual({ value: 1 });
    await db.terminate();
    await reader.terminate();
  });

  it('[BK3-02] connect rejects without FIRESTORE_EMULATOR_HOST', () =>
    withEmulatorHost(undefined, () =>
      expect(firestoreEmulator.connect()).rejects.toThrow(
        expect.objectContaining({ message: HOST_NOT_SET }),
      ),
    ));

  it('[BK3-02] connect rejects an empty FIRESTORE_EMULATOR_HOST', () =>
    withEmulatorHost('', () =>
      expect(firestoreEmulator.connect()).rejects.toThrow(
        expect.objectContaining({ message: HOST_NOT_SET }),
      ),
    ));

  it.each(['cartera-tst', 'xdemo-cartera', 'demo-cartera/x', 'demo-'])(
    '[BK3-03] assertTarget rejects the project %s',
    (projectId) =>
      expect(
        firestoreEmulator.assertTarget(EMULATOR_HOST, projectId),
      ).rejects.toThrow(
        expect.objectContaining({
          message: `[firestore emulator] project "${projectId}" is not a demo-* project; aborted`,
        }),
      ),
  );

  it('[BK3-04] connect rejects a malformed host', () =>
    withEmulatorHost('not a host', () =>
      expect(firestoreEmulator.connect()).rejects.toThrow(
        expect.objectContaining({ message: nothingAnswersAt('not a host') }),
      ),
    ));

  it.each([503, 204])(
    '[BK3-04] connect rejects a host that answers %i',
    (status) =>
      withServerAnswering(status, (host) =>
        withEmulatorHost(host, () =>
          expect(firestoreEmulator.connect()).rejects.toThrow(
            expect.objectContaining({ message: nothingAnswersAt(host) }),
          ),
        ),
      ),
  );

  it('[BK3-05] clear removes the documents of this process project and keeps another project', async () => {
    const own = new Firestore({ projectId: PROJECT_ID });
    const other = new Firestore({ projectId: OTHER_PROJECT_ID });
    await own.collection('Probe').doc('bk3-05').set({ value: 1 });
    await other.collection('Probe').doc('bk3-05').set({ value: 2 });

    await firestoreEmulator.clear();

    expect((await own.collection('Probe').doc('bk3-05').get()).exists).toBe(
      false,
    );
    expect((await other.collection('Probe').doc('bk3-05').get()).exists).toBe(
      true,
    );
    await own.terminate();
    await other.terminate();
  });

  it.each([503, 204])(
    '[BK3-05] clear rejects when the emulator answers %i',
    (status) =>
      withServerAnswering(status, (host) =>
        withEmulatorHost(host, () =>
          expect(firestoreEmulator.clear()).rejects.toThrow(
            expect.objectContaining({
              message: `[firestore emulator] clearing project "${PROJECT_ID}" answered ${status}`,
            }),
          ),
        ),
      ),
  );

  it('[BK3-02] assertTarget rejects an empty host before checking the project', () =>
    expect(firestoreEmulator.assertTarget('', 'cartera-tst')).rejects.toThrow(
      expect.objectContaining({ message: HOST_NOT_SET }),
    ));

  it('[BK3-03] assertTarget rejects a non demo project before calling the host', () =>
    expect(
      firestoreEmulator.assertTarget('not a host', 'cartera-tst'),
    ).rejects.toThrow(
      expect.objectContaining({
        message:
          '[firestore emulator] project "cartera-tst" is not a demo-* project; aborted',
      }),
    ));
});
