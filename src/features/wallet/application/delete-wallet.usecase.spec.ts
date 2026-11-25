import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { CreateWalletInternalUseCase } from './create-wallet-internal.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Wallet } from '@/features/wallet/domain/wallet.entity';

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
  it('removes with zero balance', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await useCase.execute({ userId: 'u1', id });

    expect(await repository.findActiveById(id, 'u1')).toBeNull();
  });

  it('blocks a balance != 0 without force (WALLET_HAS_BALANCE)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids, 50);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await expect(useCase.execute({ userId: 'u1', id })).rejects.toMatchObject({
      code: ErrorCode.WALLET_HAS_BALANCE,
    });
  });

  it('proceeds with force even with a balance', async () => {
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

  it('is idempotent (a second call does not fail)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await useCase.execute({ userId: 'u1', id });
    await expect(
      useCase.execute({ userId: 'u1', id }),
    ).resolves.toBeUndefined();
  });

  it('[CDC-05] resolves without writing when the wallet does not exist', async () => {
    const repository = new InMemoryWalletRepository();
    const useCase = DeleteWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'u1', id: 'missing' }),
    ).resolves.toBeUndefined();
    expect(await repository.findById('missing', 'u1')).toBeNull();
  });

  it('[CDC-05] leaves an already removed wallet as it was', async () => {
    const repository = new InMemoryWalletRepository();
    const id = await seed(repository, makeIds());
    let clock = '2026-06-14T10:00:00.000Z';
    const useCase = DeleteWalletUseCase.create(repository, () => clock);
    await useCase.execute({ userId: 'u1', id });
    const removed = (await repository.findById(id, 'u1'))?.toPersistence();

    clock = '2026-06-15T10:00:00.000Z';
    await useCase.execute({ userId: 'u1', id });

    const stored = await repository.findById(id, 'u1');
    expect(stored?.toPersistence()).toEqual(removed);
  });

  it('[CDC-05] blocks the default wallet with a balance as WALLET_NOT_DELETABLE', async () => {
    const repository = new InMemoryWalletRepository();
    const wallet = Wallet.create({
      id: 'cartera',
      userId: 'u1',
      name: 'Cartera',
      balance: 50,
      createdAt: now(),
      isDefault: true,
    });
    await repository.create(wallet, []);
    const useCase = DeleteWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'u1', id: wallet.id }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_DELETABLE });
  });
});
