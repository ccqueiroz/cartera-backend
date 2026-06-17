import { WalletOutput } from '@/features/wallet/domain/wallet.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { computeAccruedInterest } from '@/features/wallet/application/compute-accrued-interest';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface GetWalletByIdInput {
  userId: string;
  id: string;
}

export class GetWalletByIdUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly indicatorGateway: FinancialIndicatorGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    indicatorGateway: FinancialIndicatorGateway,
    now: () => string,
  ): GetWalletByIdUseCase {
    return new GetWalletByIdUseCase(repository, indicatorGateway, now);
  }

  public async execute(input: GetWalletByIdInput): Promise<WalletOutput> {
    const wallet = await this.repository.findActiveById(input.id, input.userId);
    if (!wallet) throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);

    let accrued = 0;
    if (wallet.overdraftSince !== null) {
      const movements = await this.repository.listMovements(
        input.id,
        input.userId,
      );
      const iofDailyRate = await this.indicatorGateway.getActiveIofDailyRate();
      accrued = computeAccruedInterest({
        wallet,
        movements,
        today: this.now().slice(0, 10),
        iofDailyRate,
      });
    }

    return wallet.toOutput(accrued);
  }
}
