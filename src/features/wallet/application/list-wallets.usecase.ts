import { WalletOutput } from '@/features/wallet/domain/wallet.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { computeAccruedInterest } from '@/features/wallet/application/compute-accrued-interest';
import { applyPagination } from '@/shared/query/apply-pagination';
import { Page } from '@/shared/query/page';

interface ListWalletsInput {
  userId: string;
  page?: number;
  size?: number;
}

export class ListWalletsUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly indicatorGateway: FinancialIndicatorGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    indicatorGateway: FinancialIndicatorGateway,
    now: () => string,
  ): ListWalletsUseCase {
    return new ListWalletsUseCase(repository, indicatorGateway, now);
  }

  public async execute(input: ListWalletsInput): Promise<Page<WalletOutput>> {
    const wallets = await this.repository.listActiveByUser(input.userId);
    wallets.sort((a, b) => a.id.localeCompare(b.id));

    const today = this.now().slice(0, 10);
    const needsAccrual = wallets.some((w) => w.overdraftSince !== null);
    const iofDailyRate = needsAccrual
      ? await this.indicatorGateway.getActiveIofDailyRate()
      : 0;

    const outputs: WalletOutput[] = [];
    for (const wallet of wallets) {
      let accrued = 0;
      if (wallet.overdraftSince !== null) {
        const movements = await this.repository.listMovements(
          wallet.id,
          input.userId,
        );
        accrued = computeAccruedInterest({
          wallet,
          movements,
          today,
          iofDailyRate,
        });
      }
      outputs.push(wallet.toOutput(accrued));
    }

    return applyPagination(outputs, input.page, input.size);
  }
}
