import { CreatePaymentMethodUseCase } from './create-payment-method.usecase';
import { PaymentMethod } from '../domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '../domain/enums/payment-method-description.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const payload = {
  description: 'Pix',
  descriptionEnum: PaymentMethodDescriptionEnum.PIX,
};

describe('CreatePaymentMethodUseCase', () => {
  it('creates a new payment method when none is active for the enum', async () => {
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

  it('throws a 409 conflict when the enum already has an active method', async () => {
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

  it('never reactivates: creates a new document even with a soft-deleted one', async () => {
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

  it('rejects an invalid description through the entity invariant', async () => {
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
