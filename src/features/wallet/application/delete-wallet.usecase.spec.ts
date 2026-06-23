import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { CreateWalletInternalUseCase } from './create-wallet-internal.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

const now = () => '2026-06-14T10:00:00.000Z';

async function seed(
  repository: InMemoryWalletRepository,
  ids: () => string,
  balance?: number,
) {
  const create = CreateWalletUseCase.create(repository, ids, now);
  const { wallet } = await create.execute({
    userId: 'u1',
    name: 'Nubank',
    balance,
  });
  return wallet.id;
}

describe('DeleteWalletUseCase', () => {
  it('remove com saldo zero', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await useCase.execute({ userId: 'u1', id });

    expect(await repository.findActiveById(id, 'u1')).toBeNull();
  });

  it('bloqueia saldo ≠ 0 sem force (WALLET_HAS_BALANCE)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids, 50);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await expect(useCase.execute({ userId: 'u1', id })).rejects.toMatchObject({
      code: ErrorCode.WALLET_HAS_BALANCE,
    });
  });

  it('procede com force mesmo com saldo', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids, 50);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await useCase.execute({ userId: 'u1', id, force: true });

    expect(await repository.findActiveById(id, 'u1')).toBeNull();
  });

  it('blocks deleting the default wallet (WALLET_NOT_DELETABLE), even with force', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    await CreateWalletInternalUseCase.create(repository, ids, now).execute({
      userId: 'u1',
    });
    const [defaultWallet] = await repository.listActiveByUser('u1');
    const useCase = DeleteWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'u1', id: defaultWallet.id }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_DELETABLE });
    await expect(
      useCase.execute({ userId: 'u1', id: defaultWallet.id, force: true }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_DELETABLE });
    expect(
      await repository.findActiveById(defaultWallet.id, 'u1'),
    ).not.toBeNull();
  });

  it('é idempotente (segunda chamada não falha)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await useCase.execute({ userId: 'u1', id });
    await expect(
      useCase.execute({ userId: 'u1', id }),
    ).resolves.toBeUndefined();
  });
});
