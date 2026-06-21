import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { WalletGateway } from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { SettleReceivableUseCase } from '@/features/core-finance/receivables/application/settle-receivable.usecase';
import { GlobalSettleReceivableUseCase } from '@/features/core-finance/receivables/application/global-settle-receivable.usecase';
import { ReverseReceivableUseCase } from '@/features/core-finance/receivables/application/reverse-receivable.usecase';
import { CreateSingleReceivableUseCase } from '@/features/core-finance/receivables/application/create-single-receivable.usecase';
import { CreateInstallmentReceivableUseCase } from '@/features/core-finance/receivables/application/create-installment-receivable.usecase';
import { ListReceivablesUseCase } from '@/features/core-finance/receivables/application/list-receivables.usecase';
import { ListUnreceivedByPeriodUseCase } from '@/features/core-finance/receivables/application/list-unreceived-by-period.usecase';
import { GetReceivableByIdUseCase } from '@/features/core-finance/receivables/application/get-receivable-by-id.usecase';
import { EditReceivableUseCase } from '@/features/core-finance/receivables/application/edit-receivable.usecase';
import { SoftDeleteReceivableUseCase } from '@/features/core-finance/receivables/application/soft-delete-receivable.usecase';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';
import { receivableRoutes } from '@/features/core-finance/infra/http/core-finance.routes';

export interface ReceivablesModuleDeps {
  authMiddleware: Middleware;
  engine: TransactionEngine;
  atomicRunner: AtomicRunner;
  walletGateway: WalletGateway;
  generateId?: () => string;
  now?: () => string;
}

/**
 * Condutor `receivables`: espelho de `bills` na direção receita (settle credita,
 * reverse debita). Recebe o motor (in-context), o AtomicRunner e a porta de wallet
 * de escrita compartilhada (adapter injetado no bootstrap). Sem porta de cartão.
 */
export function makeReceivablesModule(deps: ReceivablesModuleDeps): Route[] {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());
  const { engine, atomicRunner, walletGateway } = deps;

  const controller = ReceivableController.create({
    create: CreateSingleReceivableUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    createInstallment: CreateInstallmentReceivableUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    list: ListReceivablesUseCase.create(engine),
    listUnreceivedByPeriod: ListUnreceivedByPeriodUseCase.create(engine),
    getById: GetReceivableByIdUseCase.create(engine),
    settle: SettleReceivableUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    globalSettlement: GlobalSettleReceivableUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
    edit: EditReceivableUseCase.create(engine),
    softDelete: SoftDeleteReceivableUseCase.create(engine),
    reverse: ReverseReceivableUseCase.create(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    ),
  });

  return receivableRoutes(controller, deps.authMiddleware);
}
