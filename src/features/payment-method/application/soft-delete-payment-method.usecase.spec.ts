import { SoftDeletePaymentMethodUseCase } from './soft-delete-payment-method.usecase';
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

describe('SoftDeletePaymentMethodUseCase', () => {
  it('soft-deleta um método ativo e persiste', async () => {
    const deleted: PaymentMethod[] = [];
    const repository = {
      findById: async () => makeMethod(null),
      softDelete: async (m: PaymentMethod) => void deleted.push(m),
    } as any;
    const useCase = SoftDeletePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await useCase.execute({ id: 'pm-1' });

    expect(deleted).toHaveLength(1);
    expect(deleted[0].isActive).toBe(false);
  });

  it('é idempotente: já soft-deletado não persiste de novo', async () => {
    const deleted: PaymentMethod[] = [];
    const repository = {
      findById: async () => makeMethod('2026-06-02T10:00:00.000Z'),
      softDelete: async (m: PaymentMethod) => void deleted.push(m),
    } as any;
    const useCase = SoftDeletePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await useCase.execute({ id: 'pm-1' });

    expect(deleted).toHaveLength(0);
  });

  it('lança 404 quando o id não existe', async () => {
    const repository = {
      findById: async () => null,
      softDelete: async () => {},
    } as any;
    const useCase = SoftDeletePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(useCase.execute({ id: 'nope' })).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_NOT_FOUND,
    });
  });
});
