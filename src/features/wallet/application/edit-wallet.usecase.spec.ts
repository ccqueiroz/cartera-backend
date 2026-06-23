import { EditWalletUseCase } from './edit-wallet.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function makeIds() {
  let counter = 0;
  return () => `id-${++counter}`;
}

const now = () => '2026-06-14T10:00:00.000Z';

async function seed(repository: InMemoryWalletRepository, ids: () => string) {
  const { wallet } = await CreateWalletUseCase.create(
    repository,
    ids,
    () => '2026-06-01T00:00:00.000Z',
  ).execute({ userId: 'u1', name: 'Nubank', balance: 500 });
  return wallet.id;
}

async function seedDefault(
  repository: InMemoryWalletRepository,
  ids: () => string,
) {
  const wallet = Wallet.create({
    id: ids(),
    userId: 'u1',
    name: 'Cartera',
    createdAt: '2026-06-01T00:00:00.000Z',
    isDefault: true,
  });
  await repository.create(wallet, []);
  return wallet.id;
}

describe('EditWalletUseCase', () => {
  it('enables overdraft (name + policy) and never touches balance', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    const result = await useCase.execute({
      userId: 'u1',
      id,
      name: 'Itaú',
      hasOverdraft: true,
      overdraftLimit: 300,
    });

    expect(result.name).toBe('Itaú');
    expect(result.overdraft?.limit).toBe(300);
    expect(result.balance).toBe(500);
    expect(result.updatedAt).toBe(now());
  });

  it('disables overdraft, turning the wallet into pure cash', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    await useCase.execute({
      userId: 'u1',
      id,
      hasOverdraft: true,
      overdraftLimit: 300,
    });
    const result = await useCase.execute({
      userId: 'u1',
      id,
      hasOverdraft: false,
    });

    expect(result.overdraft).toBeNull();
  });

  it('rejects enabling overdraft without a positive limit', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'u1', id, hasOverdraft: true }),
    ).rejects.toMatchObject({ code: ErrorCode.OVERDRAFT_LIMIT_REQUIRED });
  });

  it('rejects overdraft changes on the default wallet (WALLET_DEFAULT_NO_OVERDRAFT)', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedDefault(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({
        userId: 'u1',
        id,
        hasOverdraft: true,
        overdraftLimit: 100,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_DEFAULT_NO_OVERDRAFT });
  });

  it('allows renaming the default wallet', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seedDefault(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    const result = await useCase.execute({
      userId: 'u1',
      id,
      name: 'Minha Cartera',
    });
    expect(result.name).toBe('Minha Cartera');
    expect(result.overdraft).toBeNull();
  });

  it('404 (WALLET_NOT_FOUND) quando inexistente ou de outro usuário', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'outro', id, name: 'X' }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_NOT_FOUND });
  });

  it('409 (WALLET_DELETED) ao editar carteira removida', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const { wallet } = await CreateWalletUseCase.create(
      repository,
      ids,
      () => '2026-06-01T00:00:00.000Z',
    ).execute({ userId: 'u1', name: 'Nubank' });
    await DeleteWalletUseCase.create(repository, now).execute({
      userId: 'u1',
      id: wallet.id,
    });
    const useCase = EditWalletUseCase.create(repository, now);

    await expect(
      useCase.execute({ userId: 'u1', id: wallet.id, name: 'X' }),
    ).rejects.toMatchObject({ code: ErrorCode.WALLET_DELETED });
  });
});
