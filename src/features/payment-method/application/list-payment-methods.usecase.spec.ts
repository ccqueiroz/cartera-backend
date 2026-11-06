import { ListPaymentMethodsUseCase } from './list-payment-methods.usecase';
import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '@/features/payment-method/domain/enums/payment-method-description.enum';

const makeActive = (id: string, enumValue: string) =>
  PaymentMethod.create({
    id,
    description: enumValue,
    descriptionEnum: enumValue as never,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('ListPaymentMethodsUseCase', () => {
  it('returns the active methods as output', async () => {
    const repository = {
      listActive: async () => [
        makeActive('pm-1', PaymentMethodDescriptionEnum.PIX),
        makeActive('pm-2', PaymentMethodDescriptionEnum.CASH),
      ],
    } as any;
    const useCase = ListPaymentMethodsUseCase.create(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('active', true);
  });

  it('returns [] when there are no active methods', async () => {
    const repository = { listActive: async () => [] } as any;
    const useCase = ListPaymentMethodsUseCase.create(repository);

    expect(await useCase.execute()).toEqual([]);
  });
});
