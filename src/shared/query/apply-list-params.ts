import { PaginationParams, SortOrder } from '@/shared/query/page';

type Cell = string | number | null;

function compareAscending(a: Cell, b: Cell): number {
  if (a === b) return 0;
  return a! < b! ? -1 : 1;
}

export function applyListParams<T extends object>(
  items: T[],
  params: PaginationParams,
): T[] {
  const { sort, searchByDate, ordering } = params;
  const cell = (item: T, field: string): Cell =>
    (item as Record<string, Cell>)[field] ?? null;

  let result = items;
  if (sort) {
    result = result.filter(
      (item) => String(cell(item, sort.field)) === sort.value,
    );
  }
  if (searchByDate) {
    const { field, exactlyDate, initialDate, finalDate } = searchByDate;
    result = result.filter((item) => {
      const value = cell(item, field);
      if (value === null) return false;
      const day = String(value).slice(0, 10);
      if (exactlyDate) return day === exactlyDate;
      return (
        (!initialDate || day >= initialDate) && (!finalDate || day <= finalDate)
      );
    });
  }
  const entry = ordering && Object.entries(ordering)[0];
  if (!entry) return result;
  const [field, direction] = entry;
  const factor = direction === SortOrder.DESC ? -1 : 1;
  return [...result].sort((a, b) => {
    const left = cell(a, field);
    const right = cell(b, field);
    if (left === null || right === null) {
      return left === right ? 0 : left === null ? 1 : -1;
    }
    return compareAscending(left, right) * factor;
  });
}
