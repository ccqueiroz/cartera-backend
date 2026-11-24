import { TransferWalletGatewayAdapter } from '@/bootstrap/transfer-wallet.gateway.adapter';
import { TransferTxContext } from '@/features/transfer/domain/ports/transfer.repository.port';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';

const ctx = { txn: {} } as TransferTxContext;

function setup() {
  const wallets = {
    findActiveByIdTx: jest.fn(),
    saveWithMovementsTx: jest.fn().mockResolvedValue(undefined),
  };
  const adapter = TransferWalletGatewayAdapter.create({} as never, wallets);
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

const debit: TransferMovement = {
  id: 'mov-1',
  userId: 'user-1',
  walletId: 'w1',
  direction: 'DEBIT',
  amount: 30,
  refType: 'TRANSFER',
  refId: 'transfer-1',
  occurredAt: '2026-06-05',
  createdAt: '2026-06-05T10:00:00.000Z',
};

describe('TransferWalletGatewayAdapter', () => {
  // A save that is not awaited leaves its rejection unhandled; one event-loop
  // turn lets Jest fail the case that dropped it instead of dying after the run.
  afterEach(() => new Promise((resolve) => setImmediate(resolve)));

  it('[CDC-10] loadWalletTx returns the wallet that findActiveByIdTx reads with the very ctx it receives, and null when the internal finds none', async () => {
    const { wallets, adapter } = setup();
    const loaded = wallet();
    wallets.findActiveByIdTx
      .mockResolvedValueOnce(loaded)
      .mockResolvedValueOnce(null);

    await expect(adapter.loadWalletTx(ctx, 'w1', 'user-1')).resolves.toBe(
      loaded,
    );
    expect(wallets.findActiveByIdTx).toHaveBeenCalledWith(ctx, 'w1', 'user-1');
    expect(wallets.findActiveByIdTx.mock.calls[0][0]).toBe(ctx);
    await expect(
      adapter.loadWalletTx(ctx, 'missing', 'user-1'),
    ).resolves.toBeNull();
  });

  it('[CDC-10] saveWalletTx saves the wallet and each TransferMovement as a WalletMovement with the same 9 fields through saveWithMovementsTx with the very ctx it receives', async () => {
    const { wallets, adapter } = setup();
    const saved = wallet();
    const movements: TransferMovement[] = [
      debit,
      { ...debit, id: 'mov-2', direction: 'CREDIT', amount: 12.5 },
    ];

    await adapter.saveWalletTx(ctx, saved, movements);

    expect(wallets.saveWithMovementsTx).toHaveBeenCalledTimes(1);
    const [passedCtx, passedWallet, passedMovements] =
      wallets.saveWithMovementsTx.mock.calls[0];
    expect(passedCtx).toBe(ctx);
    expect(passedWallet).toBe(saved);
    expect(
      passedMovements.map(
        (movement: unknown) => movement instanceof WalletMovement,
      ),
    ).toEqual([true, true]);
    expect(
      passedMovements.map((movement: WalletMovement) =>
        movement.toPersistence(),
      ),
    ).toEqual(movements);
  });

  it('[CDC-10] saveWalletTx rejects with the error that saveWithMovementsTx throws', async () => {
    const { wallets, adapter } = setup();
    const failure = new Error();
    wallets.saveWithMovementsTx.mockRejectedValue(failure);

    await expect(adapter.saveWalletTx(ctx, wallet(), [debit])).rejects.toBe(
      failure,
    );
  });

  it('[CDC-10] saveWalletTx awaits saveWithMovementsTx and rejects with the error of a rejection that already has a handler', async () => {
    const { wallets, adapter } = setup();
    const failure = new Error();
    const handled = Promise.reject(failure);
    handled.catch(() => undefined);
    wallets.saveWithMovementsTx.mockReturnValue(handled);

    await expect(adapter.saveWalletTx(ctx, wallet(), [debit])).rejects.toBe(
      failure,
    );
  });
});
