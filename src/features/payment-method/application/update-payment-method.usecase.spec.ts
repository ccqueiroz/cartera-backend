import { UpdatePaymentMethodUseCase } from './update-payment-method.usecase';
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

describe('UpdatePaymentMethodUseCase', () => {
  it('atualiza description e seta updatedAt', async () => {
    const updated: PaymentMethod[] = [];
    const repository = {
      findActiveByEnum: async () => makeMethod(),
      update: async (m: PaymentMethod) => void updated.push(m),
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    const method = await useCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
      description: 'Pix QR',
    });

    expect(method.toOutput().description).toBe('Pix QR');
    expect(method.toOutput().updatedAt).toBe('2026-06-05T10:00:00.000Z');
    expect(updated).toHaveLength(1);
  });

  it('lança 404 quando não há método ativo para o descriptionEnum', async () => {
    const repository = {
      findActiveByEnum: async () => null,
      update: async () => {},
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({
        descriptionEnum: PaymentMethodDescriptionEnum.PIX,
        description: 'x',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_METHOD_NOT_FOUND });
  });

  it('rejeita description inválido via invariante', async () => {
    const repository = {
      findActiveByEnum: async () => makeMethod(),
      update: async () => {},
    } as any;
    const useCase = UpdatePaymentMethodUseCase.create(
      repository,
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({
        descriptionEnum: PaymentMethodDescriptionEnum.PIX,
        description: '   ',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED,
    });
  });
});
