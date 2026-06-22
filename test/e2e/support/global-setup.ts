import { mkdirSync, writeFileSync } from 'fs';
import {
  ARTIFACTS_DIR,
  CURRENT_RUN_FILE,
  DEFAULT_BASE_URL,
  FALLBACK_BASE_URL,
  manifestFileFor,
  RunContext,
} from './run-context';

const PROD_HOST_MARKERS = ['prod', 'production', 'api.cartera'];
const PROD_PROJECT_MARKERS = ['prod', 'production'];
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

function assertNotProduction(baseUrl: string): void {
  const host = new URL(baseUrl).hostname.toLowerCase();
  const isLocal = LOCAL_HOSTS.includes(host);
  const allowRemote = process.env.E2E_ALLOW_REMOTE === 'true';

  if (PROD_HOST_MARKERS.some((marker) => host.includes(marker))) {
    throw new Error(`[e2e gate] host "${host}" looks like production — aborted.`);
  }
  if (!isLocal && !allowRemote) {
    throw new Error(
      `[e2e gate] host "${host}" is not local; set E2E_ALLOW_REMOTE=true for remote staging.`,
    );
  }

  const project = (
    process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ?? ''
  ).toLowerCase();
  if (
    project &&
    PROD_PROJECT_MARKERS.some((marker) => project.includes(marker))
  ) {
    throw new Error(
      `[e2e gate] Firebase project "${project}" looks like production — aborted.`,
    );
  }
}

async function isHealthy(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.status === 200;
  } catch {
    return false;
  }
}

async function pickReachableBase(): Promise<string> {
  const configured = process.env.E2E_BASE_URL?.trim();
  const candidates = configured
    ? [configured]
    : [DEFAULT_BASE_URL, FALLBACK_BASE_URL];

  for (const candidate of candidates) {
    assertNotProduction(candidate);
    if (await isHealthy(candidate)) return candidate;
  }
  throw new Error(
    `[e2e gate] no healthy target among ${candidates.join(
      ', ',
    )} — bring up the container (yarn start:docker:dev) before yarn test:e2e.`,
  );
}

export default async function globalSetup(): Promise<void> {
  const baseUrl = await pickReachableBase();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = `e2e-${stamp}-${process.pid}`;

  mkdirSync(ARTIFACTS_DIR, { recursive: true });

  const context: RunContext = { runId, baseUrl };
  writeFileSync(CURRENT_RUN_FILE, JSON.stringify(context, null, 2));
  writeFileSync(
    manifestFileFor(runId),
    JSON.stringify(
      { runId, baseUrl, userIds: [], authUids: [], entities: {} },
      null,
      2,
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[e2e] runId=${runId} baseUrl=${baseUrl}`);
}
