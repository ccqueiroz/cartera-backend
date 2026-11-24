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

export interface CreateSingleReceivableInput {
  userId: string;
  personId?: string;
  amount: number;
  dueDate: string;
  categoryDescriptionEnum?: string;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  paymentMethodDescriptionEnum?: string;
  /** Nascida recebida: data do recebimento. Exige `walletId`. */
  paidAt?: string;
  paidAmount?: number;
  walletId?: string;
}

/**
 * UC-RV1: cria receita única (`type = RECEIVABLES`, `origin = MANUAL` fixo no
 * servidor). A receber → delega só ao motor. Nascida recebida (`paidAt`) → exige
 * `walletId` e cria + liquida num **único bloco atômico**: a wallet é lida dentro
 * da transação, antes do motor, que grava o nó já recebido; a wallet é creditada +
 * `WalletMovement(CREDIT, SETTLEMENT)` na mesma transação (não relê o nó
 * recém-criado, respeitando o Firestore).
 */
export class CreateSingleReceivableUseCase {
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
  ): CreateSingleReceivableUseCase {
    return new CreateSingleReceivableUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateSingleReceivableInput,
  ): Promise<CreateReceivableResult> {
    if (input.paidAt && !input.walletId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: errorCatalog[ErrorCode.ATTRIBUTE_REQUIRES_WALLET_ID]({
          attribute: 'Receita nascida recebida',
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
    };

    if (!input.paidAt) {
      const created = await this.engine.createSingle.execute(base);
      return { root: created.toOutput() };
    }

    const walletId = input.walletId as string;
    const paidAmount = input.paidAmount ?? input.amount;
    const createdAt = this.now();

    const { node, wallet } = await this.atomicRunner.run(async (ctx) => {
      const wallet = await this.walletGateway.loadWalletTx(
        ctx,
        walletId,
        input.userId,
      );
      if (!wallet)
        throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, { walletId });

      const created = await this.engine.createSingle.executeTx(ctx, {
        ...base,
        paymentDate: input.paidAt,
        paidAmount,
        paymentMethodDescriptionEnum:
          input.paymentMethodDescriptionEnum ?? 'CASH',
      });
      wallet.credit(Money.create(paidAmount), createdAt);
      wallet.closeOverdraftEpisode();
      const movement: WalletMovementSpec = {
        id: this.generateId(),
        userId: input.userId,
        walletId,
        direction: 'CREDIT',
        amount: paidAmount,
        refType: 'SETTLEMENT',
        refId: created.id,
        occurredAt: input.paidAt as string,
        createdAt,
      };
      await this.walletGateway.saveWalletTx(ctx, wallet, [movement]);
      return { node: created, wallet };
    });

    return {
      root: node.toOutput(),
      wallet: { id: walletId, balance: wallet.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }
}
