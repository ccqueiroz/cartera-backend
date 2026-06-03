import { UpdatePaymentMethodUseCase } from './update-payment-method.usecase';
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

describe('UpdatePaymentMethodUseCase', () => {
  it('atualiza description e seta updatedAt', async () => {
    const updated: PaymentMethod[] = [];
    const repository = {
      findById: async () => makeMethod(null),
      update: async (m: PaymentMethod) => void updated.push(m),
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    const method = await useCase.execute({
      id: 'pm-1',
      description: 'Pix QR',
    });

    expect(method.toOutput().description).toBe('Pix QR');
    expect(method.toOutput().updatedAt).toBe('2026-06-05T10:00:00.000Z');
    expect(updated).toHaveLength(1);
  });

  it('lança 404 quando o id não existe', async () => {
    const repository = {
      findById: async () => null,
      update: async () => {},
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ id: 'nope', description: 'x' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_METHOD_NOT_FOUND });
  });

  it('lança PaymentMethodDeletedError quando o método está soft-deleted', async () => {
    const repository = {
      findById: async () => makeMethod('2026-06-02T10:00:00.000Z'),
      update: async () => {},
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ id: 'pm-1', description: 'x' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_METHOD_DELETED });
  });

  it('rejeita description inválido via invariante', async () => {
    const repository = {
      findById: async () => makeMethod(null),
      update: async () => {},
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ id: 'pm-1', description: '   ' }),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED,
    });
  });
});
