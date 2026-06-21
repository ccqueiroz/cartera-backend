import { Money } from '@/shared/kernel/value-objects/money.vo';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { TransactionOrigin } from '@/shared/kernel/enums/transaction-origin.enum';
import { Period } from '@/shared/kernel/enums/period.enum';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AtomicContext } from '@/shared/database/atomic-runner';

export interface CreateSingleTransactionInput {
  userId: string;
  personId: string;
  type: TransactionType;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  paymentDate?: string;
  paidAmount?: number;
  paymentMethodDescriptionEnum?: string;
  origin?: TransactionOrigin;
}

export class CreateSingleTransactionUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly categoryGateway: CategoryGateway,
    private readonly paymentMethodGateway: PaymentMethodGateway,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    categoryGateway: CategoryGateway,
    paymentMethodGateway: PaymentMethodGateway,
    generateId: () => string,
    now: () => string,
  ): CreateSingleTransactionUseCase {
    return new CreateSingleTransactionUseCase(
      repository,
      categoryGateway,
      paymentMethodGateway,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateSingleTransactionInput,
  ): Promise<Transaction> {
    const node = await this.build(input);
    await this.repository.save(node);
    return node;
  }

  /** Variante tx-aware: grava o nó (eventualmente já pago) numa transação externa. */
  public async executeTx(
    ctx: AtomicContext,
    input: CreateSingleTransactionInput,
  ): Promise<Transaction> {
    const node = await this.build(input);
    await this.repository.saveTx(ctx, node);
    return node;
  }

  private async build(
    input: CreateSingleTransactionInput,
  ): Promise<Transaction> {
    const wantsPaid =
      !!input.paymentDate &&
      input.paidAmount !== undefined &&
      !!input.paymentMethodDescriptionEnum;

    if (input.paymentMethodDescriptionEnum) {
      const active = await this.paymentMethodGateway.isActive(
        input.paymentMethodDescriptionEnum,
      );
      if (!active)
        throw new ValidationError(ErrorCode.PAYMENT_METHOD_NOT_FOUND, {
          descriptionEnum: input.paymentMethodDescriptionEnum,
        });
    }

    const category = await this.resolveCategory(input.categoryDescriptionEnum);
    const id = this.generateId();

    const node = Transaction.create({
      id,
      parentId: null,
      rootId: id,
      userId: input.userId,
      personId: input.personId,
      type: input.type,
      amount: Money.create(input.amount),
      dueDate: input.dueDate,
      createdAt: this.now(),
      isFixedCost: input.isFixedCost,
      period: input.period,
      frequency: input.frequency,
      categoryDescriptionEnum: category?.descriptionEnum ?? null,
      categoryGroup: category?.group ?? null,
      origin: input.origin,
      paymentDate: wantsPaid ? input.paymentDate : null,
      paidAmount: wantsPaid ? Money.create(input.paidAmount as number) : null,
      paymentMethodDescriptionEnum: wantsPaid
        ? input.paymentMethodDescriptionEnum
        : null,
    });

    return node;
  }

  private async resolveCategory(descriptionEnum?: string) {
    if (!descriptionEnum) return null;
    const resolved = await this.categoryGateway.resolve(descriptionEnum);
    if (!resolved)
      throw new ValidationError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum,
      });
    return resolved;
  }
}
