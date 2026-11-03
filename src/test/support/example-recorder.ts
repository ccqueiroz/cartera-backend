import { writeFileSync } from 'fs';
import { join } from 'path';
import stringify from 'json-stable-stringify';

export type RecordedExample = {
  folder?: string;
  verb: string;
  path: string;
  status: number;
  caseName: string;
  request: unknown;
  response: unknown;
};

// ponytail: the example name swaps only / and {} of the OpenAPI path for -; two paths that differ only there collide; add a hash of the path if that happens.
export function recordExample(example: RecordedExample): string | undefined {
  if (!example.folder) {
    return undefined;
  }
  const pathSlug = example.path.replace(/^\/api\//, '').replace(/[/{}]/g, '-');
  const fileName = `${example.verb}-${pathSlug}-${example.status}-${example.caseName}.json`;
  const filePath = join(example.folder, fileName);
  const content = stringify(
    { request: example.request, response: example.response },
    { space: 2 },
  );
  writeFileSync(filePath, `${content}\n`);
  return filePath;
}
