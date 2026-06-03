import { SoftDeletePaymentMethodUseCase } from './soft-delete-payment-method.usecase';
import { PaymentMethod } from '../domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '../domain/enums/payment-method-description.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeMethod = () =>
  PaymentMethod.with({
    id: 'pm-1',
    description: 'Pix',
    descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
  });

describe('SoftDeletePaymentMethodUseCase', () => {
  it('soft-deleta um método ativo e persiste', async () => {
    const deleted: PaymentMethod[] = [];
    const repository = {
      findActiveByEnum: async () => makeMethod(),
      softDelete: async (m: PaymentMethod) => void deleted.push(m),
    } as any;
    const useCase = SoftDeletePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await useCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    });

    expect(deleted).toHaveLength(1);
    expect(deleted[0].isActive).toBe(false);
  });

  it('lança 404 quando não há método ativo (inexistente ou já soft-deletado)', async () => {
    const repository = {
      findActiveByEnum: async () => null,
      softDelete: async () => {},
    } as any;
    const useCase = SoftDeletePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ descriptionEnum: PaymentMethodDescriptionEnum.PIX }),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_NOT_FOUND,
    });
  });
});
