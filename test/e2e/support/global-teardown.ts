import { readFileSync } from 'fs';
import { CURRENT_RUN_FILE, manifestFileFor, RunContext } from './run-context';

export default async function globalTeardown(): Promise<void> {
  let context: RunContext;
  try {
    context = JSON.parse(readFileSync(CURRENT_RUN_FILE, 'utf-8')) as RunContext;
  } catch {
    return;
  }
  const manifestPath = manifestFileFor(context.runId);
  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '[e2e] suite finished. HARD cleanup by owner is manual (outside Jest):',
      `[e2e]   manifest: ${manifestPath}`,
      '[e2e]   1) sweep by owner via MCP firebase (see test/e2e/README.md §4)',
      '[e2e]   2) yarn e2e:purge  (hard-delete the Auth users from the manifest)',
      '',
    ].join('\n'),
  );
}
