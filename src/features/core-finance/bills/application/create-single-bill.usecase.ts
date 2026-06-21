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

export interface CreateSingleBillInput {
  userId: string;
  personId?: string;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  paymentMethodDescriptionEnum?: string;
  cardId?: string;
  /** Nascida paga: data do pagamento. Exige `walletId`. */
  paidAt?: string;
  paidAmount?: number;
  walletId?: string;
}

const CREDIT_CARD = 'CREDIT_CARD';

/**
 * UC-B1: cria despesa única (`type = BILLS`, `origin = MANUAL`). A vencer →
 * delega só ao motor. Nascida paga (`paidAt`) → exige `walletId` (B1) e cria +
 * liquida num **único bloco atômico** (B2): o motor grava o nó já pago e a wallet
 * é debitada + `WalletMovement(SETTLEMENT)` na mesma transação (só escritas — não
 * relê o nó recém-criado, respeitando o Firestore).
 */
export class CreateSingleBillUseCase {
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
  ): CreateSingleBillUseCase {
    return new CreateSingleBillUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateSingleBillInput,
  ): Promise<CreateBillResult> {
    this.assertEdges(input);

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
    };

    if (!input.paidAt) {
      const created = await this.engine.createSingle.execute(base);
      return { root: created.toOutput() };
    }

    const walletId = input.walletId as string;
    const snapshot = await this.walletGateway.findActiveSnapshot(
      walletId,
      input.userId,
    );
    if (!snapshot)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, { walletId });

    const paidAmount = input.paidAmount ?? input.amount;
    const createdAt = this.now();

    const node = await this.atomicRunner.run(async (ctx) => {
      const created = await this.engine.createSingle.executeTx(ctx, {
        ...base,
        paymentDate: input.paidAt,
        paidAmount,
        paymentMethodDescriptionEnum:
          input.paymentMethodDescriptionEnum ?? 'CASH',
      });
      snapshot.debit(Money.create(paidAmount), input.paidAt as string);
      const movement: WalletMovementSpec = {
        id: this.generateId(),
        userId: input.userId,
        walletId,
        direction: 'DEBIT',
        amount: paidAmount,
        refType: 'SETTLEMENT',
        refId: created.id,
        occurredAt: input.paidAt as string,
        createdAt,
      };
      await this.walletGateway.persistSettlement(ctx, snapshot, [movement]);
      return created;
    });

    return {
      root: node.toOutput(),
      wallet: { id: walletId, balance: snapshot.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: snapshot.isNegative(),
        exceedsLimit: snapshot.exceedsOverdraftLimit(),
      }),
    };
  }

  private assertEdges(input: CreateSingleBillInput): void {
    if (input.paymentMethodDescriptionEnum === CREDIT_CARD && !input.cardId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'Compra no cartão de crédito exige cardId.',
      });
    if (input.cardId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details:
          'Compra no cartão de crédito será tratada pela fatura (recurso ainda não disponível).',
      });
    if (input.paidAt && !input.walletId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'Despesa nascida paga exige walletId.',
      });
  }
}
