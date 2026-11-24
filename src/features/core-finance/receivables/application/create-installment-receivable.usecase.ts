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
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import {
  WalletMovementSpec,
  WalletGateway,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { CreateReceivableResult } from '@/features/core-finance/receivables/application/receivable-response';

export interface InstallmentReceivableInput {
  amount: number;
  dueDate: string;
}

export interface EntryReceivableInput {
  amount: number;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
  walletId: string;
}

export interface CreateInstallmentReceivableInput {
  userId: string;
  personId?: string;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  installments: InstallmentReceivableInput[];
  entry?: EntryReceivableInput;
}

/**
 * UC-RV2: cria plano de parcelas (`type = RECEIVABLES`, `origin = MANUAL`). Com
 * entrada recebida, exige `walletId` e materializa o plano + credita a entrada
 * (com `WalletMovement(CREDIT, SETTLEMENT)` no `refId` da folha de entrada) num
 * **único bloco atômico** (a wallet é lida dentro da transação, antes do motor;
 * não relê o plano recém-criado).
 */
export class CreateInstallmentReceivableUseCase {
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
  ): CreateInstallmentReceivableUseCase {
    return new CreateInstallmentReceivableUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateInstallmentReceivableInput,
  ): Promise<CreateReceivableResult> {
    if (input.entry && !input.entry.walletId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: errorCatalog[ErrorCode.ATTRIBUTE_REQUIRES_WALLET_ID]({
          attribute: 'A entrada recebida',
        }),
      });

    const base = {
      userId: input.userId,
      personId: input.personId ?? input.userId,
      type: TransactionTypeEnum.RECEIVABLES,
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
    const createdAt = this.now();
    const { plan, wallet } = await this.atomicRunner.run(async (ctx) => {
      const wallet = await this.walletGateway.loadWalletTx(
        ctx,
        entry.walletId,
        input.userId,
      );
      if (!wallet)
        throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
          walletId: entry.walletId,
        });

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
        wallet.credit(Money.create(entry.amount), createdAt);
        wallet.closeOverdraftEpisode();
        const movement: WalletMovementSpec = {
          id: this.generateId(),
          userId: input.userId,
          walletId: entry.walletId,
          direction: 'CREDIT',
          amount: entry.amount,
          refType: 'SETTLEMENT',
          refId: entryLeaf.id,
          occurredAt: entry.paymentDate,
          createdAt,
        };
        await this.walletGateway.saveWalletTx(ctx, wallet, [movement]);
      }
      return { plan: materialized, wallet };
    });

    return {
      root: plan.mother.toOutput(),
      wallet: { id: entry.walletId, balance: wallet.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }
}
