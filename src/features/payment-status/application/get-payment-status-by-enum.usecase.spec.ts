import { GetPaymentStatusByEnumUseCase } from './get-payment-status-by-enum.usecase';
import { PaymentStatusCatalog } from '../domain/payment-status-catalog.entity';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeEntry = () =>
  PaymentStatusCatalog.create({
    id: 'ps-1',
    code: PaymentStatusEnum.PAID,
    label: 'Pago',
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('GetPaymentStatusByEnumUseCase', () => {
  it('retorna a entrada do catálogo para um code semeado', async () => {
    const repository = { findByCode: async () => makeEntry() } as any;
    const useCase = GetPaymentStatusByEnumUseCase.create(repository);

    const result = await useCase.execute({ code: PaymentStatusEnum.PAID });

    expect(result).toEqual({
      id: 'ps-1',
      code: PaymentStatusEnum.PAID,
      label: 'Pago',
    });
  });

  it('lança PaymentStatusNotFoundError quando o code não está semeado', async () => {
    const repository = { findByCode: async () => null } as any;
    const useCase = GetPaymentStatusByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ code: PaymentStatusEnum.PAID }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_STATUS_NOT_FOUND });
  });
});
