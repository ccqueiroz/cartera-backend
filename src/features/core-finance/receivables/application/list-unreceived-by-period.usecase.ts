import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { Page, PaginationParams } from '@/shared/query/page';
import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';

export interface ListUnreceivedByPeriodInput {
  userId: string;
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
  params?: PaginationParams;
}

/**
 * UC-RV11: mapper fino sobre `engine.list`. A borda só traz `start_date`/`end_date`
 * (+page/size); aqui ficam fixos `scope='to_pay'`, `type=RECEIVABLES` e o range
 * inclusivo de `dueDate`. **Sem `originNotIn`** — não há `CARD_INVOICE` na direção
 * receita (RV5). Sort/paginação são do motor.
 */
export class ListUnreceivedByPeriodUseCase {
  private constructor(private readonly engine: TransactionEngine) {}

  public static create(
    engine: TransactionEngine,
  ): ListUnreceivedByPeriodUseCase {
    return new ListUnreceivedByPeriodUseCase(engine);
  }

  public async execute(
    input: ListUnreceivedByPeriodInput,
  ): Promise<Page<TransactionOutput>> {
    if (input.endDate < input.startDate)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: errorCatalog[
          ErrorCode.ATTRIBUTE_MUST_NOT_BE_BEFORE_START_DATE
        ]({
          attribute: 'end_date',
        }),
      });

    return this.engine.list.execute({
      userId: input.userId,
      scope: 'to_pay',
      type: TransactionTypeEnum.RECEIVABLES,
      dueDateFrom: input.startDate,
      dueDateTo: input.endDate,
      page: input.page,
      size: input.size,
      params: input.params,
    });
  }
}
