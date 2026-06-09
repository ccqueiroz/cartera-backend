import { Money } from '@/shared/kernel/value-objects/money.vo';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface InstallmentInput {
  amount: number;
  dueDate: string;
}

export interface EntryInput {
  amount: number;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
}

export interface CreateInstallmentPlanInput {
  type: TransactionType;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  installments: InstallmentInput[];
  entry?: EntryInput;
}

export interface InstallmentPlanResult {
  mother: Transaction;
  children: Transaction[];
}

export class CreateInstallmentPlanUseCase {
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
  ): CreateInstallmentPlanUseCase {
    return new CreateInstallmentPlanUseCase(
      repository,
      categoryGateway,
      paymentMethodGateway,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateInstallmentPlanInput,
  ): Promise<InstallmentPlanResult> {
    if (input.installments.length < 1)
      throw new ValidationError(
        ErrorCode.TRANSACTION_INVALID_INSTALLMENT_COUNT,
      );
    if (input.entry && input.entry.amount >= input.amount)
      throw new ValidationError(ErrorCode.TRANSACTION_ENTRY_EXCEEDS_TOTAL);

    if (input.entry) {
      const active = await this.paymentMethodGateway.isActive(
        input.entry.paymentMethodDescriptionEnum,
      );
      if (!active)
        throw new ValidationError(ErrorCode.PAYMENT_METHOD_NOT_FOUND, {
          descriptionEnum: input.entry.paymentMethodDescriptionEnum,
        });
    }

    const category = await this.resolveCategory(input.categoryDescriptionEnum);
    const createdAt = this.now();
    const motherId = this.generateId();

    const mother = Transaction.create({
      id: motherId,
      parentId: null,
      rootId: motherId,
      type: input.type,
      amount: Money.create(input.amount),
      dueDate: input.dueDate,
      createdAt,
      hasChildren: true,
      categoryDescriptionEnum: category?.descriptionEnum ?? null,
      categoryGroup: category?.group ?? null,
    });

    const children: Transaction[] = [];

    if (input.entry) {
      children.push(
        Transaction.create({
          id: this.generateId(),
          parentId: motherId,
          rootId: motherId,
          type: input.type,
          amount: Money.create(input.entry.amount),
          dueDate: input.entry.paymentDate,
          createdAt,
          firstInstallment: true,
          categoryDescriptionEnum: category?.descriptionEnum ?? null,
          categoryGroup: category?.group ?? null,
          paymentDate: input.entry.paymentDate,
          paidAmount: Money.create(input.entry.amount),
          paymentMethodDescriptionEnum:
            input.entry.paymentMethodDescriptionEnum,
        }),
      );
    }

    for (const installment of input.installments) {
      children.push(
        Transaction.create({
          id: this.generateId(),
          parentId: motherId,
          rootId: motherId,
          type: input.type,
          amount: Money.create(installment.amount),
          dueDate: installment.dueDate,
          createdAt,
          categoryDescriptionEnum: category?.descriptionEnum ?? null,
          categoryGroup: category?.group ?? null,
        }),
      );
    }

    mother.recomputeFromChildren(children);
    await this.repository.saveMany([mother, ...children]);
    return { mother, children };
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
