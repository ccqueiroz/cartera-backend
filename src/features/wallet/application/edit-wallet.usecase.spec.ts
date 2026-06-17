import { EditWalletUseCase } from './edit-wallet.usecase';
import { CreateWalletUseCase } from './create-wallet.usecase';
import { DeleteWalletUseCase } from './delete-wallet.usecase';
import { InMemoryWalletRepository } from '@/features/wallet/infra/persistence/in-memory-wallet.repository';
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

describe('EditWalletUseCase', () => {
  it('aplica whitelist (name + config) e nunca o balance', async () => {
    const repository = new InMemoryWalletRepository();
    const ids = makeIds();
    const id = await seed(repository, ids);
    const useCase = EditWalletUseCase.create(repository, now);

    const result = await useCase.execute({
      userId: 'u1',
      id,
      name: 'Itaú',
      overdraftLimit: 300,
    });

    expect(result.name).toBe('Itaú');
    expect(result.overdraftLimit).toBe(300);
    expect(result.balance).toBe(500);
    expect(result.updatedAt).toBe(now());
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
