import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { Page } from '@/shared/query/page';
import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface ListUnreceivedByPeriodInput {
  userId: string;
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
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
        details: 'end_date não pode ser anterior a start_date.',
      });

    return this.engine.list.execute({
      userId: input.userId,
      scope: 'to_pay',
      type: TransactionTypeEnum.RECEIVABLES,
      dueDateFrom: input.startDate,
      dueDateTo: input.endDate,
      page: input.page,
      size: input.size,
    });
  }
}
