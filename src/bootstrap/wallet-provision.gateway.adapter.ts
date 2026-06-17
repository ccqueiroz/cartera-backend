import { WalletProvisionGateway } from '@/features/auth/domain/ports/wallet-provision.gateway';
import { CreateWalletInternalUseCase } from '@/features/wallet/application/create-wallet-internal.usecase';

interface WalletInternalUseCases {
  createWallet: CreateWalletInternalUseCase;
}

/**
 * Mora no bootstrap: auth e wallet não se importam — só o composition root
 * conhece os dois lados (mesmo padrão do person.gateway.adapter).
 */
export class WalletProvisionGatewayAdapter implements WalletProvisionGateway {
  private constructor(
    private readonly walletInternal: WalletInternalUseCases,
  ) {}

  public static create(
    walletInternal: WalletInternalUseCases,
  ): WalletProvisionGatewayAdapter {
    return new WalletProvisionGatewayAdapter(walletInternal);
  }

  public async provision(input: { userId: string }): Promise<void> {
    await this.walletInternal.createWallet.execute(input);
  }
}
