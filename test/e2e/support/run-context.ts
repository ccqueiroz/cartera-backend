import { readFileSync } from 'fs';
import { resolve } from 'path';

export const ARTIFACTS_DIR = resolve(__dirname, '..', '.artifacts');
export const CURRENT_RUN_FILE = resolve(ARTIFACTS_DIR, 'current-run.json');

export const DEFAULT_BASE_URL = 'http://localhost/api';
export const FALLBACK_BASE_URL = 'http://localhost:8889/api';

export interface RunContext {
  runId: string;
  baseUrl: string;
}

export function manifestFileFor(runId: string): string {
  return resolve(ARTIFACTS_DIR, `manifest-${runId}.json`);
}

export function readRunContext(): RunContext {
  const raw = readFileSync(CURRENT_RUN_FILE, 'utf-8');
  return JSON.parse(raw) as RunContext;
}
