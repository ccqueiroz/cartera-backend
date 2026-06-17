import { ListTransfersUseCase } from './list-transfers.usecase';
import { Transfer } from '@/features/transfer/domain/transfer.entity';
import {
  ListTransfersFilter,
  TransferRepository,
} from '@/features/transfer/domain/ports/transfer.repository.port';

function transfer(id: string, userId: string, transferDate: string): Transfer {
  return Transfer.with({
    id,
    userId,
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: 10,
    paymentMethodDescriptionEnum: 'PIX',
    transferDate,
    createdAt: `${transferDate}T00:00:00.000Z`,
  });
}

function repoWith(transfers: Transfer[]): TransferRepository {
  return {
    saveTransfer: async () => undefined,
    findById: async () => null,
    listByUser: async (userId: string, _filter: ListTransfersFilter) =>
      transfers.filter((t) => t.userId === userId),
  };
}

describe('ListTransfersUseCase', () => {
  it('ordena por transferDate desc e pagina (default 0/20)', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-01'),
      transfer('b', 'u1', '2026-06-15'),
      transfer('c', 'u1', '2026-06-10'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1' });

    expect(page.content.map((t) => t.transferDate)).toEqual([
      '2026-06-15',
      '2026-06-10',
      '2026-06-01',
    ]);
    expect(page.page).toBe(0);
    expect(page.size).toBe(20);
    expect(page.totalElements).toBe(3);
  });

  it('filtra por competência month/year', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-15'),
      transfer('b', 'u1', '2026-05-15'),
      transfer('c', 'u1', '2025-06-15'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1', month: 6, year: 2026 });

    expect(page.content.map((t) => t.transferDate)).toEqual(['2026-06-15']);
    expect(page.totalElements).toBe(1);
  });

  it('período vazio retorna página vazia', async () => {
    const repository = repoWith([transfer('a', 'u1', '2026-06-15')]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1', month: 1, year: 2020 });

    expect(page.content).toEqual([]);
    expect(page.totalElements).toBe(0);
  });

  it('respeita page/size custom', async () => {
    const repository = repoWith([
      transfer('a', 'u1', '2026-06-03'),
      transfer('b', 'u1', '2026-06-02'),
      transfer('c', 'u1', '2026-06-01'),
    ]);
    const useCase = ListTransfersUseCase.create(repository);

    const page = await useCase.execute({ userId: 'u1', page: 1, size: 2 });

    expect(page.content.map((t) => t.transferDate)).toEqual(['2026-06-01']);
    expect(page.totalElements).toBe(3);
  });
});
