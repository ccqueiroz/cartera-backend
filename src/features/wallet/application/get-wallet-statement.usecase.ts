import { WalletMovementOutput } from '@/features/wallet/domain/wallet-movement.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { applyPagination } from '@/shared/query/apply-pagination';
import { Page } from '@/shared/query/page';

interface GetWalletStatementInput {
  userId: string;
  id: string;
  month?: number;
  year?: number;
  page?: number;
  size?: number;
}

export class GetWalletStatementUseCase {
  private constructor(private readonly repository: WalletRepository) {}

  public static create(
    repository: WalletRepository,
  ): GetWalletStatementUseCase {
    return new GetWalletStatementUseCase(repository);
  }

  public async execute(
    input: GetWalletStatementInput,
  ): Promise<Page<WalletMovementOutput>> {
    const wallet = await this.repository.findActiveById(input.id, input.userId);
    if (!wallet) throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);

    const movements = await this.repository.listMovements(
      input.id,
      input.userId,
    );

    const filtered = movements
      .filter((movement) => this.matchesCompetence(movement.occurredAt, input))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .map((movement) => movement.toOutput());

    return applyPagination(filtered, input.page, input.size);
  }

  private matchesCompetence(
    occurredAt: string,
    input: GetWalletStatementInput,
  ): boolean {
    if (input.year === undefined && input.month === undefined) return true;
    const [year, month] = occurredAt.split('-').map(Number);
    if (input.year !== undefined && year !== input.year) return false;
    if (input.month !== undefined && month !== input.month) return false;
    return true;
  }
}
