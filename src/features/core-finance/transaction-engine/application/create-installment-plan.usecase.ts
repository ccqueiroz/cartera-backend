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
  userId: string;
  personId: string;
  type: TransactionType;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  installments: InstallmentInput[];
  entry?: EntryInput;
  origin?: TransactionOrigin;
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
    const result = await this.build(input);
    await this.repository.saveMany([result.mother, ...result.children]);
    return result;
  }

  /** Variante tx-aware: materializa o plano numa transação externa (AtomicRunner). */
  public async executeTx(
    ctx: AtomicContext,
    input: CreateInstallmentPlanInput,
  ): Promise<InstallmentPlanResult> {
    const result = await this.build(input);
    await this.repository.saveManyTx(ctx, [result.mother, ...result.children]);
    return result;
  }

  private async build(
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
    const motherIsFixedCost = input.isFixedCost ?? false;

    const mother = Transaction.create({
      id: motherId,
      parentId: null,
      rootId: motherId,
      userId: input.userId,
      personId: input.personId,
      type: input.type,
      amount: Money.create(input.amount),
      dueDate: input.dueDate,
      createdAt,
      hasChildren: true,
      isFixedCost: input.isFixedCost,
      period: input.period,
      frequency: input.frequency,
      categoryDescriptionEnum: category?.descriptionEnum ?? null,
      categoryGroup: category?.group ?? null,
      origin: input.origin,
    });

    // Folhas não herdam a política de custo-fixo da raiz (D12): nascem
    // isFixedCost=false, period/frequency null. Carregam só os flags de raiz
    // denormalizados, para que o filtro de listagem alcance a folha (R11).
    // origin, ao contrário, é idêntico em toda a árvore (O3): a folha é tão
    // CARD_PURCHASE quanto a raiz.
    const childRootFlags = {
      rootHasInstallments: true,
      rootIsFixedCost: motherIsFixedCost,
      origin: input.origin,
    };

    const children: Transaction[] = [];

    if (input.entry) {
      children.push(
        Transaction.create({
          id: this.generateId(),
          parentId: motherId,
          rootId: motherId,
          userId: input.userId,
          personId: input.personId,
          type: input.type,
          amount: Money.create(input.entry.amount),
          dueDate: input.entry.paymentDate,
          createdAt,
          firstInstallment: true,
          ...childRootFlags,
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
          userId: input.userId,
          personId: input.personId,
          type: input.type,
          amount: Money.create(installment.amount),
          dueDate: installment.dueDate,
          createdAt,
          ...childRootFlags,
          categoryDescriptionEnum: category?.descriptionEnum ?? null,
          categoryGroup: category?.group ?? null,
        }),
      );
    }

    mother.recomputeFromChildren(children);
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
