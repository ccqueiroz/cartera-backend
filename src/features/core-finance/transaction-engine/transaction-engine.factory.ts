import { Firestore } from 'firebase-admin/firestore';
import { crypto } from '@/packages/clients/crypto';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionTreeRepositoryFirestore } from '@/features/core-finance/transaction-engine/infra/persistence/transaction-tree.repository.firestore';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { CreateSingleTransactionUseCase } from '@/features/core-finance/transaction-engine/application/create-single-transaction.usecase';
import { CreateInstallmentPlanUseCase } from '@/features/core-finance/transaction-engine/application/create-installment-plan.usecase';
import { ListTransactionsUseCase } from '@/features/core-finance/transaction-engine/application/list-transactions.usecase';
import { ListDeletedTransactionsUseCase } from '@/features/core-finance/transaction-engine/application/list-deleted-transactions.usecase';
import { GetTransactionByIdUseCase } from '@/features/core-finance/transaction-engine/application/get-transaction-by-id.usecase';
import { EditTransactionUseCase } from '@/features/core-finance/transaction-engine/application/edit-transaction.usecase';
import { SettleTransactionUseCase } from '@/features/core-finance/transaction-engine/application/settle-transaction.usecase';
import { GlobalSettlementUseCase } from '@/features/core-finance/transaction-engine/application/global-settlement.usecase';
import { SoftDeleteTransactionUseCase } from '@/features/core-finance/transaction-engine/application/soft-delete-transaction.usecase';
import { ReverseTransactionUseCase } from '@/features/core-finance/transaction-engine/application/reverse-transaction.usecase';

export interface TransactionEngineDeps {
  db: Firestore;
  categoryGateway: CategoryGateway;
  paymentMethodGateway: PaymentMethodGateway;
  generateId?: () => string;
  now?: () => string;
  repository?: TransactionTreeRepository;
}

/**
 * Comandos/queries internos do motor, consumidos por Bills/Receivables
 * in-context (ADR-03 / D1) — não há `infra/http`. O composition root liga este
 * factory quando o primeiro condutor (bills/receivables) nascer.
 */
export interface TransactionEngine {
  createSingle: CreateSingleTransactionUseCase;
  createInstallmentPlan: CreateInstallmentPlanUseCase;
  list: ListTransactionsUseCase;
  listDeleted: ListDeletedTransactionsUseCase;
  getById: GetTransactionByIdUseCase;
  edit: EditTransactionUseCase;
  settle: SettleTransactionUseCase;
  globalSettlement: GlobalSettlementUseCase;
  softDelete: SoftDeleteTransactionUseCase;
  reverse: ReverseTransactionUseCase;
}

export function makeTransactionEngine(
  deps: TransactionEngineDeps,
): TransactionEngine {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());
  const repository =
    deps.repository ?? TransactionTreeRepositoryFirestore.create(deps.db);
  const { categoryGateway, paymentMethodGateway } = deps;

  return {
    createSingle: CreateSingleTransactionUseCase.create(
      repository,
      categoryGateway,
      paymentMethodGateway,
      generateId,
      now,
    ),
    createInstallmentPlan: CreateInstallmentPlanUseCase.create(
      repository,
      categoryGateway,
      paymentMethodGateway,
      generateId,
      now,
    ),
    list: ListTransactionsUseCase.create(repository),
    listDeleted: ListDeletedTransactionsUseCase.create(repository),
    getById: GetTransactionByIdUseCase.create(repository),
    edit: EditTransactionUseCase.create(repository, categoryGateway, now),
    settle: SettleTransactionUseCase.create(
      repository,
      paymentMethodGateway,
      now,
    ),
    globalSettlement: GlobalSettlementUseCase.create(
      repository,
      paymentMethodGateway,
      now,
    ),
    softDelete: SoftDeleteTransactionUseCase.create(repository, now),
    reverse: ReverseTransactionUseCase.create(repository, now),
  };
}
