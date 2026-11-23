import { CoreFinanceWalletGatewayAdapter } from '@/bootstrap/core-finance-wallet.gateway.adapter';
import {
  WalletMovementSpec,
  WalletTxContext,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';

const ctx = { txn: {} } as WalletTxContext;

function setup() {
  const wallets = {
    findActiveByIdTx: jest.fn(),
    findLatestSettlementTx: jest.fn(),
    saveWithMovementsTx: jest.fn().mockResolvedValue(undefined),
  };
  const adapter = CoreFinanceWalletGatewayAdapter.create({} as never, wallets);
  return { wallets, adapter };
}

function wallet(): Wallet {
  return Wallet.create({
    id: 'w1',
    userId: 'user-1',
    name: 'Main',
    balance: 100,
    createdAt: '2026-06-01T00:00:00.000Z',
  });
}

describe('CoreFinanceWalletGatewayAdapter', () => {
  it('[CDC-06] loadWalletTx returns the wallet that findActiveByIdTx reads in the same ctx', async () => {
    const { wallets, adapter } = setup();
    const loaded = wallet();
    wallets.findActiveByIdTx.mockResolvedValue(loaded);

    await expect(adapter.loadWalletTx(ctx, 'w1', 'user-1')).resolves.toBe(
      loaded,
    );
    expect(wallets.findActiveByIdTx).toHaveBeenCalledWith(ctx, 'w1', 'user-1');
  });

  it('[CDC-06] findLatestSettlementTx returns the walletId and the amount of the latest settlement, and null without one', async () => {
    const { wallets, adapter } = setup();
    wallets.findLatestSettlementTx
      .mockResolvedValueOnce(
        WalletMovement.create({
          id: 'mov-9',
          userId: 'user-1',
          walletId: 'w7',
          direction: 'DEBIT',
          amount: Money.create(30),
          refType: 'SETTLEMENT',
          refId: 'leaf-1',
          occurredAt: '2026-06-05',
          createdAt: '2026-06-05T10:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(null);

    await expect(
      adapter.findLatestSettlementTx(ctx, 'leaf-1', 'user-1'),
    ).resolves.toEqual({ walletId: 'w7', amount: 30 });
    expect(wallets.findLatestSettlementTx).toHaveBeenCalledWith(
      ctx,
      'leaf-1',
      'user-1',
    );
    await expect(
      adapter.findLatestSettlementTx(ctx, 'leaf-2', 'user-1'),
    ).resolves.toBeNull();
  });

  it('[CDC-06] saveWalletTx saves the wallet and each spec as a WalletMovement through saveWithMovementsTx in the same ctx', async () => {
    const { wallets, adapter } = setup();
    const saved = wallet();
    const debit: WalletMovementSpec = {
      id: 'mov-1',
      userId: 'user-1',
      walletId: 'w1',
      direction: 'DEBIT',
      amount: 30,
      refType: 'SETTLEMENT',
      refId: 'leaf-1',
      occurredAt: '2026-06-05',
      createdAt: '2026-06-05T10:00:00.000Z',
    };
    const specs: WalletMovementSpec[] = [
      debit,
      {
        ...debit,
        id: 'mov-2',
        direction: 'CREDIT',
        amount: 12.5,
        refType: 'SETTLEMENT_REVERSAL',
        createdAt: '2026-06-06T10:00:00.000Z',
      },
    ];

    await adapter.saveWalletTx(ctx, saved, specs);

    expect(wallets.saveWithMovementsTx).toHaveBeenCalledTimes(1);
    const [passedCtx, passedWallet, movements] =
      wallets.saveWithMovementsTx.mock.calls[0];
    expect(passedCtx).toBe(ctx);
    expect(passedWallet).toBe(saved);
    expect(
      movements.map((movement: unknown) => movement instanceof WalletMovement),
    ).toEqual([true, true]);
    expect(
      movements.map((movement: WalletMovement) => movement.toPersistence()),
    ).toEqual(specs);
  });
});
