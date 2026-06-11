import { Money } from '@/shared/kernel/value-objects/money.vo';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface SettleTransactionInput {
  id: string;
  userId: string;
  paymentDate: string;
  paidAmount: number;
  paymentMethodDescriptionEnum: string;
}

export class SettleTransactionUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly paymentMethodGateway: PaymentMethodGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    paymentMethodGateway: PaymentMethodGateway,
    now: () => string,
  ): SettleTransactionUseCase {
    return new SettleTransactionUseCase(repository, paymentMethodGateway, now);
  }

  public async execute(input: SettleTransactionInput): Promise<Transaction> {
    const target = await this.repository.findActiveById(input.id, input.userId);
    if (!target) throw new TransactionNotFoundError();

    const active = await this.paymentMethodGateway.isActive(
      input.paymentMethodDescriptionEnum,
    );
    if (!active)
      throw new ValidationError(ErrorCode.PAYMENT_METHOD_NOT_FOUND, {
        descriptionEnum: input.paymentMethodDescriptionEnum,
      });

    const updatedAt = this.now();
    return this.repository.mutateAndRollup(input.id, (node) =>
      node.settle({
        paymentDate: input.paymentDate,
        paidAmount: Money.create(input.paidAmount),
        paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
        updatedAt,
      }),
    );
  }
}
