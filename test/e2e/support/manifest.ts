import { readFileSync, writeFileSync } from 'fs';
import { manifestFileFor, readRunContext } from './run-context';

export type EntityKind = 'wallet' | 'bill' | 'receivable' | 'person';

export interface Manifest {
  runId: string;
  baseUrl: string;
  userIds: string[];
  authUids: string[];
  entities: Record<string, string[]>;
}

function load(): { path: string; data: Manifest } {
  const { runId } = readRunContext();
  const path = manifestFileFor(runId);
  const data = JSON.parse(readFileSync(path, 'utf-8')) as Manifest;
  return { path, data };
}

function save(path: string, data: Manifest): void {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

export function recordUser(userId: string, authUid: string): void {
  const { path, data } = load();
  if (userId && !data.userIds.includes(userId)) data.userIds.push(userId);
  if (authUid && !data.authUids.includes(authUid)) data.authUids.push(authUid);
  save(path, data);
}

export function recordEntity(kind: EntityKind, id: string | undefined): void {
  if (!id) return;
  const { path, data } = load();
  const bucket = data.entities[kind] ?? [];
  if (!bucket.includes(id)) bucket.push(id);
  data.entities[kind] = bucket;
  save(path, data);
}
