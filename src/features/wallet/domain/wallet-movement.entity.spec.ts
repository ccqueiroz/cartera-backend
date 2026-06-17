import { WalletMovement } from './wallet-movement.entity';
import {
  WalletMovementDirectionEnum,
  WalletMovementRefTypeEnum,
} from './enums/wallet-movement.enums';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { ValidationError } from '@/shared/kernel/errors/domain.error';

function build(
  overrides: Partial<Parameters<typeof WalletMovement.create>[0]> = {},
) {
  return WalletMovement.create({
    id: 'm1',
    userId: 'u1',
    walletId: 'w1',
    direction: WalletMovementDirectionEnum.DEBIT,
    amount: Money.create(100),
    refType: WalletMovementRefTypeEnum.ADJUST,
    refId: null,
    occurredAt: '2026-06-14',
    createdAt: '2026-06-14T00:00:00.000Z',
    ...overrides,
  });
}

describe('WalletMovement entity', () => {
  it('cria movimento válido e serializa puro', () => {
    const movement = build();
    const persisted = movement.toPersistence();
    expect(persisted.amount).toBe(100);
    expect(persisted.direction).toBe('DEBIT');
    expect(persisted.refType).toBe('ADJUST');
    expect(persisted.refId).toBeNull();
  });

  it('rejeita amount zero', () => {
    expect(() => build({ amount: Money.zero() })).toThrow(ValidationError);
  });

  it('round-trip de persistência reconstrói o amount como Money', () => {
    const restored = WalletMovement.with({
      id: 'm2',
      userId: 'u1',
      walletId: 'w1',
      direction: 'CREDIT',
      amount: 250.5,
      refType: 'OVERDRAFT_INTEREST',
      refId: null,
      occurredAt: '2026-06-15',
      createdAt: '2026-06-15T00:00:00.000Z',
    });
    expect(restored.amount.value).toBe(250.5);
    expect(restored.refType).toBe('OVERDRAFT_INTEREST');
  });

  it('expõe saída sem userId (contrato de extrato)', () => {
    const out = build({
      direction: WalletMovementDirectionEnum.CREDIT,
    }).toOutput();
    expect(out.direction).toBe('CREDIT');
    expect((out as unknown as Record<string, unknown>).userId).toBeUndefined();
  });
});
