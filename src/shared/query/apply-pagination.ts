import { Page } from '@/shared/query/page';

export const DEFAULT_PAGE = 0;
export const DEFAULT_SIZE = 20;

export function applyPagination<T>(
  items: T[],
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_SIZE,
): Page<T> {
  const totalElements = items.length;
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    page,
    size,
    totalElements,
  };
}
