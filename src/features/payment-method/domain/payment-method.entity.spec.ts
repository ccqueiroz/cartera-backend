import { PaymentMethod } from './payment-method.entity';
import { PaymentMethodDescriptionEnum } from './enums/payment-method-description.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const baseInput = {
  id: 'pm-1',
  description: 'Pix',
  descriptionEnum: PaymentMethodDescriptionEnum.PIX,
  createdAt: '2026-06-01T10:00:00.000Z',
};

describe('PaymentMethod entity', () => {
  it('is born active with null updatedAt and deletedAt', () => {
    const method = PaymentMethod.create(baseInput);
    const output = method.toOutput();
    expect(output.active).toBe(true);
    expect(output.updatedAt).toBeNull();
    expect(method.toPersistence().deletedAt).toBeNull();
  });

  it('does not carry userId in persistence or output', () => {
    const method = PaymentMethod.create(baseInput);
    expect(method.toPersistence()).not.toHaveProperty('userId');
    expect(method.toOutput()).not.toHaveProperty('userId');
  });

  it('rejects an empty description', () => {
    expect(() =>
      PaymentMethod.create({ ...baseInput, description: '   ' }),
    ).toThrow(ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED);
  });

  it('rejects a description above the maximum length', () => {
    expect(() =>
      PaymentMethod.create({ ...baseInput, description: 'x'.repeat(61) }),
    ).toThrow(ErrorCode.PAYMENT_METHOD_DESCRIPTION_TOO_LONG);
  });

  it('rejects a descriptionEnum outside the closed set', () => {
    expect(() =>
      PaymentMethod.create({
        ...baseInput,
        descriptionEnum: 'BITCOIN' as never,
      }),
    ).toThrow(ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM);
  });

  it('updateDescription replaces the description and sets updatedAt; descriptionEnum is immutable', () => {
    const method = PaymentMethod.create(baseInput);
    method.updateDescription('Pix Copia e Cola', '2026-06-02T10:00:00.000Z');
    expect(method.descriptionEnum).toBe(PaymentMethodDescriptionEnum.PIX);
    expect(method.toOutput().description).toBe('Pix Copia e Cola');
    expect(method.toOutput().updatedAt).toBe('2026-06-02T10:00:00.000Z');
  });

  it('softDelete marca deletedAt e updatedAt; active deriva de deletedAt', () => {
    const method = PaymentMethod.create(baseInput);
    method.softDelete('2026-06-03T10:00:00.000Z');
    expect(method.isActive).toBe(false);
    expect(method.toPersistence().deletedAt).toBe('2026-06-03T10:00:00.000Z');
    expect(method.toPersistence().updatedAt).toBe('2026-06-03T10:00:00.000Z');
  });

  it('softDelete is idempotent (does not overwrite the timestamps of an earlier deletion)', () => {
    const method = PaymentMethod.create(baseInput);
    method.softDelete('2026-06-03T10:00:00.000Z');
    method.softDelete('2026-06-04T10:00:00.000Z');
    expect(method.toPersistence().deletedAt).toBe('2026-06-03T10:00:00.000Z');
  });
});
