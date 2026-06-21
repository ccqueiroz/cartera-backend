import { Money } from '@/shared/kernel/value-objects/money.vo';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { TransactionOriginEnum } from '@/shared/kernel/enums/transaction-origin.enum';
import { Period } from '@/shared/kernel/enums/period.enum';
import { collectBalanceWarnings } from '@/shared/kernel/value-objects/balance-warnings';
import {
  EntityNotFoundError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import {
  WalletMovementSpec,
  WalletGateway,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { CreateBillResult } from '@/features/core-finance/bills/application/bill-response';

export interface InstallmentBillInput {
  amount: number;
  dueDate: string;
}

export interface EntryBillInput {
  amount: number;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
  walletId: string;
}

export interface CreateInstallmentBillInput {
  userId: string;
  personId?: string;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  installments: InstallmentBillInput[];
  entry?: EntryBillInput;
}

/**
 * UC-B2: cria plano de parcelas (`type = BILLS`, `origin = MANUAL`). Com entrada
 * paga, exige `walletId` (B1) e materializa o plano + debita a entrada (com
 * `WalletMovement(SETTLEMENT)` no `refId` da folha de entrada) num **único bloco
 * atômico** (só escritas; não relê o plano recém-criado).
 */
export class CreateInstallmentBillUseCase {
  private constructor(
    private readonly engine: TransactionEngine,
    private readonly walletGateway: WalletGateway,
    private readonly atomicRunner: AtomicRunner,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    engine: TransactionEngine,
    walletGateway: WalletGateway,
    atomicRunner: AtomicRunner,
    generateId: () => string,
    now: () => string,
  ): CreateInstallmentBillUseCase {
    return new CreateInstallmentBillUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateInstallmentBillInput,
  ): Promise<CreateBillResult> {
    if (input.entry && !input.entry.walletId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'A entrada paga exige walletId.',
      });

    const base = {
      userId: input.userId,
      personId: input.personId ?? input.userId,
      type: TransactionTypeEnum.BILLS,
      origin: TransactionOriginEnum.MANUAL,
      amount: input.amount,
      dueDate: input.dueDate,
      categoryDescriptionEnum: input.categoryDescriptionEnum,
      isFixedCost: input.isFixedCost,
      period: input.period,
      frequency: input.frequency,
      installments: input.installments,
    };

    if (!input.entry) {
      const plan = await this.engine.createInstallmentPlan.execute(base);
      return { root: plan.mother.toOutput() };
    }

    const entry = input.entry;
    const snapshot = await this.walletGateway.findActiveSnapshot(
      entry.walletId,
      input.userId,
    );
    if (!snapshot)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
        walletId: entry.walletId,
      });

    const createdAt = this.now();
    const plan = await this.atomicRunner.run(async (ctx) => {
      const materialized = await this.engine.createInstallmentPlan.executeTx(
        ctx,
        {
          ...base,
          entry: {
            amount: entry.amount,
            paymentDate: entry.paymentDate,
            paymentMethodDescriptionEnum: entry.paymentMethodDescriptionEnum,
          },
        },
      );
      const entryLeaf = materialized.children.find(
        (child) => child.firstInstallment,
      );
      if (entryLeaf) {
        snapshot.debit(Money.create(entry.amount), entry.paymentDate);
        const movement: WalletMovementSpec = {
          id: this.generateId(),
          userId: input.userId,
          walletId: entry.walletId,
          direction: 'DEBIT',
          amount: entry.amount,
          refType: 'SETTLEMENT',
          refId: entryLeaf.id,
          occurredAt: entry.paymentDate,
          createdAt,
        };
        await this.walletGateway.persistSettlement(ctx, snapshot, [movement]);
      }
      return materialized;
    });

    return {
      root: plan.mother.toOutput(),
      wallet: { id: entry.walletId, balance: snapshot.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: snapshot.isNegative(),
        exceedsLimit: snapshot.exceedsOverdraftLimit(),
      }),
    };
  }
}
