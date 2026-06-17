import { GetTransferByIdUseCase } from './get-transfer-by-id.usecase';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function transfer(id: string, userId: string): Transfer {
  return Transfer.with({
    id,
    userId,
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: 10,
    paymentMethodDescriptionEnum: 'PIX',
    transferDate: '2026-06-10',
    createdAt: '2026-06-10T00:00:00.000Z',
  });
}

function repoWith(transfers: Transfer[]): TransferRepository {
  return {
    saveTransfer: async () => undefined,
    listByUser: async () => [],
    findById: async (id: string, userId: string) =>
      transfers.find((t) => t.id === id && t.userId === userId) ?? null,
  };
}

describe('GetTransferByIdUseCase', () => {
  it('retorna a transferência do próprio dono', async () => {
    const useCase = GetTransferByIdUseCase.create(
      repoWith([transfer('t1', 'u1')]),
    );

    const output = await useCase.execute({ userId: 'u1', id: 't1' });

    expect(output.id).toBe('t1');
  });

  it('inexistente lança TRANSFER_NOT_FOUND (404)', async () => {
    const useCase = GetTransferByIdUseCase.create(repoWith([]));

    await expect(
      useCase.execute({ userId: 'u1', id: 'nope' }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
    await expect(
      useCase.execute({ userId: 'u1', id: 'nope' }),
    ).rejects.toMatchObject({ code: ErrorCode.TRANSFER_NOT_FOUND });
  });

  it('transferência de outro usuário lança TRANSFER_NOT_FOUND (não vaza existência)', async () => {
    const useCase = GetTransferByIdUseCase.create(
      repoWith([transfer('t1', 'u2')]),
    );

    await expect(
      useCase.execute({ userId: 'u1', id: 't1' }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });
});
