import {
  TransferWallet,
  WalletGateway,
} from '@/features/transfer/domain/ports/wallet.gateway.port';
import { TransferTxContext } from '@/features/transfer/domain/ports/transfer.repository.port';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';

type WalletsInternal = Pick<
  WalletRepository,
  'findActiveByIdTx' | 'saveWithMovementsTx'
>;

/**
 * Mora no bootstrap: transfer e wallet não se importam — só o composition root
 * conhece os dois lados. Delega ao `internal` da wallet, a dona da coleção, que
 * lê e grava a carteira e os movimentos no `ctx` do AtomicRunner; o adaptador
 * não toca o banco.
 */
export class TransferWalletGatewayAdapter implements WalletGateway {
  private constructor(private readonly walletsInternal: WalletsInternal) {}

  public static create(
    walletsInternal: WalletsInternal,
  ): TransferWalletGatewayAdapter {
    return new TransferWalletGatewayAdapter(walletsInternal);
  }

  public async loadWalletTx(
    ctx: TransferTxContext,
    walletId: string,
    userId: string,
  ): Promise<TransferWallet | null> {
    return this.walletsInternal.findActiveByIdTx(ctx, walletId, userId);
  }

  public async saveWalletTx(
    ctx: TransferTxContext,
    wallet: TransferWallet,
    movements: TransferMovement[],
  ): Promise<void> {
    await this.walletsInternal.saveWithMovementsTx(
      ctx,
      wallet as Wallet,
      movements.map((movement) =>
        WalletMovement.create({
          ...movement,
          amount: Money.create(movement.amount),
        }),
      ),
    );
  }
}
