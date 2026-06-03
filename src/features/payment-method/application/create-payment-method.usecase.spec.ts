import { CreatePaymentMethodUseCase } from './create-payment-method.usecase';
import { PaymentMethod } from '../domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '../domain/enums/payment-method-description.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const payload = {
  description: 'Pix',
  descriptionEnum: PaymentMethodDescriptionEnum.PIX,
};

describe('CreatePaymentMethodUseCase', () => {
  it('cria nova forma de pagamento quando não há ativa para o enum', async () => {
    const created: PaymentMethod[] = [];
    const repository = {
      findActiveByEnum: async () => null,
      create: async (m: PaymentMethod) => void created.push(m),
    } as any;
    const useCase = CreatePaymentMethodUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    const method = await useCase.execute(payload);

    expect(created).toHaveLength(1);
    expect(method.toPersistence().id).toBe('uuid-1');
    expect(method.toPersistence().createdAt).toBe('2026-06-05T10:00:00.000Z');
    expect(method.toPersistence().deletedAt).toBeNull();
  });

  it('conflita (409) quando o enum já tem método ativo', async () => {
    const repository = {
      findActiveByEnum: async () =>
        PaymentMethod.create({
          id: 'pm-1',
          ...payload,
          createdAt: '2026-06-01T10:00:00.000Z',
        }),
      create: async () => {},
    } as any;
    const useCase = CreatePaymentMethodUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(useCase.execute(payload)).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_ALREADY_EXISTS,
    });
  });

  it('nunca reativa: cria documento novo mesmo havendo soft-deleted', async () => {
    const created: PaymentMethod[] = [];
    const repository = {
      findActiveByEnum: async () => null,
      create: async (m: PaymentMethod) => void created.push(m),
    } as any;
    const useCase = CreatePaymentMethodUseCase.create(
      repository,
      () => 'uuid-novo',
      () => '2026-06-05T10:00:00.000Z',
    );

    const method = await useCase.execute(payload);

    expect(method.toPersistence().id).toBe('uuid-novo');
    expect(created).toHaveLength(1);
  });

  it('rejeita description inválido via invariante da entidade', async () => {
    const repository = {
      findActiveByEnum: async () => null,
      create: async () => {},
    } as any;
    const useCase = CreatePaymentMethodUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ ...payload, description: '   ' }),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED,
    });
  });
});
