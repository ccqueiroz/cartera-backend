import { GetPaymentMethodByEnumUseCase } from './get-payment-method-by-enum.usecase';
import { PaymentMethod } from '../domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '../domain/enums/payment-method-description.enum';
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
  it('retorna o método (ativo ou soft-deleted) resolvido pelo repositório', async () => {
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

  it('retorna o soft-deleted mais recente quando não há ativo', async () => {
    const repository = {
      findLatestByEnum: async () => makeMethod('2026-06-02T10:00:00.000Z'),
    } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    const result = await useCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    });

    expect(result.active).toBe(false);
  });

  it('lança 404 quando não existe nenhum método do tipo', async () => {
    const repository = { findLatestByEnum: async () => null } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: PaymentMethodDescriptionEnum.PIX }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_METHOD_NOT_FOUND });
  });

  it('lança ValidationError para enum fora do conjunto fechado', async () => {
    const repository = { findLatestByEnum: async () => null } as any;
    const useCase = GetPaymentMethodByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: 'BITCOIN' }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM,
    });
  });
});
