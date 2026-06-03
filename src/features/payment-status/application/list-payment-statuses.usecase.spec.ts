import { ListPaymentStatusesUseCase } from './list-payment-statuses.usecase';
import { PaymentStatusCatalog } from '../domain/payment-status-catalog.entity';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';

const makeEntry = (id: string, code: PaymentStatusEnum, label: string) =>
  PaymentStatusCatalog.create({
    id,
    code,
    label,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('ListPaymentStatusesUseCase', () => {
  it('retorna os status semeados como output', async () => {
    const repository = {
      listAll: async () => [
        makeEntry('ps-1', PaymentStatusEnum.PAID, 'Pago'),
        makeEntry('ps-2', PaymentStatusEnum.OVERDUE, 'Vencido'),
      ],
    } as any;
    const useCase = ListPaymentStatusesUseCase.create(repository);

    const result = await useCase.execute();

    expect(result).toEqual([
      { id: 'ps-1', code: PaymentStatusEnum.PAID, label: 'Pago' },
      { id: 'ps-2', code: PaymentStatusEnum.OVERDUE, label: 'Vencido' },
    ]);
  });

  it('retorna [] quando o catálogo não foi semeado', async () => {
    const repository = { listAll: async () => [] } as any;
    const useCase = ListPaymentStatusesUseCase.create(repository);

    expect(await useCase.execute()).toEqual([]);
  });
});
