import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { WalletGateway } from '@/features/core-finance/bills/domain/ports/wallet.gateway.port';
import { CardInvoiceGateway } from '@/features/core-finance/bills/domain/ports/card-invoice.gateway.port';
import { SettleBillUseCase } from '@/features/core-finance/bills/application/settle-bill.usecase';
import { GlobalSettleBillUseCase } from '@/features/core-finance/bills/application/global-settle-bill.usecase';
import { ReverseBillUseCase } from '@/features/core-finance/bills/application/reverse-bill.usecase';
import { CreateSingleBillUseCase } from '@/features/core-finance/bills/application/create-single-bill.usecase';
import { CreateInstallmentBillUseCase } from '@/features/core-finance/bills/application/create-installment-bill.usecase';
import { ListBillsUseCase } from '@/features/core-finance/bills/application/list-bills.usecase';
import { ListUnpaidBillsByPeriodUseCase } from '@/features/core-finance/bills/application/list-unpaid-bills-by-period.usecase';
import { GetBillByIdUseCase } from '@/features/core-finance/bills/application/get-bill-by-id.usecase';
import { EditBillUseCase } from '@/features/core-finance/bills/application/edit-bill.usecase';
import { SoftDeleteBillUseCase } from '@/features/core-finance/bills/application/soft-delete-bill.usecase';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';
import { coreFinanceRoutes } from '@/features/core-finance/infra/http/core-finance.routes';

export interface BillsModuleDeps {
  authMiddleware: Middleware;
  engine: TransactionEngine;
  atomicRunner: AtomicRunner;
  walletGateway: WalletGateway;
  /** Contrato da fatura (B6/B7). Sem adapter nesta change — honrado em historia-card-invoice. */
  cardInvoiceGateway?: CardInvoiceGateway;
  generateId?: () => string;
  now?: () => string;
}

/**
 * Condutor `bills`: recebe o motor (in-context), o AtomicRunner e a porta de
 * wallet de escrita (adapter injetado no bootstrap). Monta os coordenadores e
 * devolve as rotas do contexto core-finance.
 */
export function makeBillsModule(deps: BillsModuleDeps): Route[] {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());
  const { engine, atomicRunner, walletGateway } = deps;

  const settle = SettleBillUseCase.create(
    engine,
    walletGateway,
    atomicRunner,
    generateId,
    now,
  );

  const controller = BillController.create({
    create: CreateSingleBillUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    createInstallment: CreateInstallmentBillUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    list: ListBillsUseCase.create(engine),
    listUnpaidByPeriod: ListUnpaidBillsByPeriodUseCase.create(engine),
    getById: GetBillByIdUseCase.create(engine),
    settle,
    globalSettlement: GlobalSettleBillUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    edit: EditBillUseCase.create(engine),
    softDelete: SoftDeleteBillUseCase.create(engine),
    reverse: ReverseBillUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
  });

  return coreFinanceRoutes(controller, deps.authMiddleware);
}
