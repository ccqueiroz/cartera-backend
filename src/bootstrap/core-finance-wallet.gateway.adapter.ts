import {
  WalletMovementSpec,
  SettlementMovementRef,
  SettlementWallet,
  WalletGateway,
  WalletTxContext,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';

type WalletsInternal = Pick<
  WalletRepository,
  'findActiveByIdTx' | 'findLatestSettlementTx' | 'saveWithMovementsTx'
>;

/**
 * Mora no bootstrap: core-finance e wallet não se importam — só o composition
 * root conhece os dois lados. Delega ao `internal` da wallet, a dona da coleção,
 * que lê e grava a carteira e o movimento no `ctx` do AtomicRunner; o adaptador
 * não toca o banco. Serve as duas direções (despesa debita / receita credita)
 * sem ramo por tipo.
 */
export class CoreFinanceWalletGatewayAdapter implements WalletGateway {
  private constructor(private readonly walletsInternal: WalletsInternal) {}

  public static create(
    walletsInternal: WalletsInternal,
  ): CoreFinanceWalletGatewayAdapter {
    return new CoreFinanceWalletGatewayAdapter(walletsInternal);
  }

  public async loadWalletTx(
    ctx: WalletTxContext,
    walletId: string,
    userId: string,
  ): Promise<SettlementWallet | null> {
    return this.walletsInternal.findActiveByIdTx(ctx, walletId, userId);
  }

  public async findLatestSettlementTx(
    ctx: WalletTxContext,
    leafId: string,
    userId: string,
  ): Promise<SettlementMovementRef | null> {
    const movement = await this.walletsInternal.findLatestSettlementTx(
      ctx,
      leafId,
      userId,
    );
    if (!movement) return null;
    const { walletId, amount } = movement.toPersistence();
    return { walletId, amount };
  }

  public async saveWalletTx(
    ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    await this.walletsInternal.saveWithMovementsTx(
      ctx,
      wallet as Wallet,
      movements.map((spec) =>
        WalletMovement.create({ ...spec, amount: Money.create(spec.amount) }),
      ),
    );
  }
}
