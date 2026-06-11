import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { ListTransactionsQuery } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';

const withinRange = (
  value: string | number | null,
  min?: string | number,
  max?: string | number,
): boolean => {
  if (min === undefined && max === undefined) return true;
  if (value === null) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

const matchesEquality = <T>(actual: T, expected?: T): boolean =>
  expected === undefined || actual === expected;

/**
 * Filtros aplicados in-memory sobre uma folha já materializada (R6). NÃO trata
 * `hasChildren`/`deleted` — exclusão estrutural é responsabilidade do adapter
 * (Firestore por query, in-memory por checagem direta). `refMonth`/`refYear` são
 * independentes (só mês → todos os anos; só ano → todas do ano, R6/14.3).
 */
export function matchesLeafFilters(
  node: Transaction,
  query: ListTransactionsQuery,
): boolean {
  const view = node.toOutput();

  if (view.userId !== query.userId) return false;
  if (!matchesEquality(view.rootId, query.rootId)) return false;
  if (!matchesEquality(view.paid, query.paid)) return false;
  if (!matchesEquality(view.type, query.type)) return false;
  if (
    !matchesEquality(
      view.categoryDescriptionEnum,
      query.categoryDescriptionEnum,
    )
  )
    return false;
  if (!matchesEquality(view.paymentStatus, query.paymentStatus)) return false;
  if (
    !matchesEquality(
      view.paymentMethodDescriptionEnum,
      query.paymentMethodDescriptionEnum,
    )
  )
    return false;
  if (!matchesEquality(view.rootHasInstallments, query.rootHasInstallments))
    return false;
  if (!matchesEquality(view.rootIsFixedCost, query.rootIsFixedCost))
    return false;
  if (!matchesEquality(view.refMonthDueDate, query.refMonthDueDate))
    return false;
  if (!matchesEquality(view.refYearDueDate, query.refYearDueDate)) return false;
  if (!matchesEquality(view.refMonthPaymentDate, query.refMonthPaymentDate))
    return false;
  if (!matchesEquality(view.refYearPaymentDate, query.refYearPaymentDate))
    return false;

  if (!withinRange(view.dueDate, query.dueDateFrom, query.dueDateTo))
    return false;
  if (
    !withinRange(view.paymentDate, query.paymentDateFrom, query.paymentDateTo)
  )
    return false;
  if (!withinRange(view.amount, query.amountMin, query.amountMax)) return false;
  if (!withinRange(view.paidAmount, query.paidAmountMin, query.paidAmountMax))
    return false;

  return true;
}
