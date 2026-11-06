import { TransferOutput } from '@/features/transfer/domain/transfer.entity';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { applyListParams } from '@/shared/query/apply-list-params';
import { applyPagination } from '@/shared/query/apply-pagination';
import { Page, PaginationParams } from '@/shared/query/page';

interface ListTransfersInput {
  userId: string;
  month?: number;
  year?: number;
  params?: PaginationParams;
}

export class ListTransfersUseCase {
  private constructor(private readonly repository: TransferRepository) {}

  public static create(repository: TransferRepository): ListTransfersUseCase {
    return new ListTransfersUseCase(repository);
  }

  public async execute(
    input: ListTransfersInput,
  ): Promise<Page<TransferOutput>> {
    const { params = {} } = input;
    const transfers = await this.repository.listByUser(input.userId, {
      month: input.month,
      year: input.year,
    });

    const sorted = transfers
      .filter((transfer) =>
        this.matchesCompetence(transfer.transferDate, input),
      )
      .sort((a, b) => b.transferDate.localeCompare(a.transferDate))
      .map((transfer) => transfer.toOutput());

    return applyPagination(
      applyListParams(sorted, params),
      params.page,
      params.size,
      params.ordering ?? null,
    );
  }

  private matchesCompetence(
    transferDate: string,
    input: ListTransfersInput,
  ): boolean {
    if (input.year === undefined && input.month === undefined) return true;
    const [year, month] = transferDate.split('-').map(Number);
    if (input.year !== undefined && year !== input.year) return false;
    if (input.month !== undefined && month !== input.month) return false;
    return true;
  }
}
