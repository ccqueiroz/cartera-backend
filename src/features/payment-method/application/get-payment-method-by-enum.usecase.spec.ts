import { GetPaymentMethodByEnumUseCase } from './get-payment-method-by-enum.usecase';
import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '@/features/payment-method/domain/enums/payment-method-description.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeMethod = (deletedAt: string | null) =>
  PaymentMethod.with({
    id: 'pm-1',
    description: 'Pix',
    descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: null,
    deletedAt,
  });

describe('GetPaymentMethodByEnumUseCase', () => {
  it('returns the method (active or soft-deleted) resolved by the repository', async () => {
    const repository = {
      findLatestByEnum: async () => makeMethod(null),
    } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    const result = await useCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    });

    expect(result.descriptionEnum).toBe(PaymentMethodDescriptionEnum.PIX);
    expect(result.active).toBe(true);
  });

  it('returns the latest soft-deleted method when none is active', async () => {
    const repository = {
      findLatestByEnum: async () => makeMethod('2026-06-02T10:00:00.000Z'),
    } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    const result = await useCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    });

    expect(result.active).toBe(false);
  });

  it('throws 404 when no method of the type exists', async () => {
    const repository = { findLatestByEnum: async () => null } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: PaymentMethodDescriptionEnum.PIX }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_METHOD_NOT_FOUND });
  });

  it('throws ValidationError for an enum outside the closed set', async () => {
    const repository = { findLatestByEnum: async () => null } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: 'BITCOIN' }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM,
    });
  });
});
