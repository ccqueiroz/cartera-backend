import { AtomicRunner } from '@/shared/database/atomic-runner';

describe('AtomicRunner', () => {
  it('abre uma runTransaction e entrega o ctx ao trabalho', async () => {
    const txn = { marker: 'txn' };
    const db = {
      runTransaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) =>
        work(txn),
      ),
    } as any;

    const runner = AtomicRunner.create(db);
    let seen: unknown;
    const result = await runner.run(async (ctx) => {
      seen = ctx.txn;
      return 'ok';
    });

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(seen).toBe(txn);
    expect(result).toBe('ok');
  });

  it('propaga a falha do trabalho (a transação não comita)', async () => {
    const db = {
      runTransaction: jest.fn(async (work: (t: unknown) => Promise<unknown>) =>
        work({}),
      ),
    } as any;
    const runner = AtomicRunner.create(db);

    await expect(
      runner.run(async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });
});
