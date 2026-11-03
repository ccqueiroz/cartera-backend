import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { recordExample } from './example-recorder';

const EXAMPLE = {
  verb: 'put',
  path: '/api/bill/edit/{id}',
  status: 200,
  caseName: 'ok',
  request: { body: { name: 'Rent', amount: 1500 }, params: { id: 'bill-1' } },
  response: { statusCode: 200, body: { id: 'bill-1' } },
};
const EXPECTED_NAME = 'put-bill-edit--id--200-ok.json';

describe('[BK2-13] [BK2-14] example recorder', () => {
  let folder: string;

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'example-recorder-'));
  });

  afterEach(() => {
    rmSync(folder, { recursive: true, force: true });
  });

  it('writes one JSON named by the convention with stable keys', () => {
    const written = recordExample({ ...EXAMPLE, folder });

    expect(readdirSync(folder)).toEqual([EXPECTED_NAME]);
    expect(written).toBe(join(folder, EXPECTED_NAME));
    expect(readFileSync(join(folder, EXPECTED_NAME), 'utf8')).toBe(
      `${JSON.stringify(
        {
          request: {
            body: { amount: 1500, name: 'Rent' },
            params: { id: 'bill-1' },
          },
          response: { body: { id: 'bill-1' }, statusCode: 200 },
        },
        null,
        2,
      )}\n`,
    );
  });

  it('writes the same content for the same input twice', () => {
    const first = recordExample({ ...EXAMPLE, folder });
    expect(first).toEqual(expect.any(String));
    const firstContent = readFileSync(first as string, 'utf8');

    const second = recordExample({ ...EXAMPLE, folder });

    expect(second).toBe(first);
    expect(readFileSync(second as string, 'utf8')).toBe(firstContent);
  });

  it('writes no file without a target folder', () => {
    expect(recordExample(EXAMPLE)).toBeUndefined();
    expect(recordExample({ ...EXAMPLE, folder: '' })).toBeUndefined();
    expect(existsSync(EXPECTED_NAME)).toBe(false);
  });
});
