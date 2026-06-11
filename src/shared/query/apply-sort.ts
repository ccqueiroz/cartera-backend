export const SORT_FIELDS = [
  'dueDate',
  'paymentDate',
  'amount',
  'paidAmount',
] as const;

export type SortField = (typeof SORT_FIELDS)[number];

export type SortDirection = 'ASC' | 'DESC';

export interface SortCriteria {
  field: SortField;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortCriteria = {
  field: 'dueDate',
  direction: 'ASC',
};

export interface Sortable {
  dueDate: string | null;
  paymentDate: string | null;
  amount: number;
  paidAmount: number;
  createdAt: string;
}

function compare(a: string | number | null, b: string | number | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

export function applySort<T extends Sortable>(
  items: T[],
  criteria: SortCriteria = DEFAULT_SORT,
): T[] {
  const direction = criteria.direction === 'DESC' ? -1 : 1;
  return [...items].sort((a, b) => {
    const primary = compare(a[criteria.field], b[criteria.field]);
    if (primary !== 0) return primary * direction;
    return compare(a.createdAt, b.createdAt);
  });
}
