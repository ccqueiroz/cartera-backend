import { applyPagination } from '@/shared/query/apply-pagination';
import { SortOrder } from '@/shared/query/page';

describe('applyPagination', () => {
  const items = Array.from({ length: 5 }, (_, index) => index);

  it('wraps the Page envelope with the requested slice', () => {
    const page = applyPagination(items, 1, 2);
    expect(page).toEqual({
      content: [2, 3],
      page: 1,
      size: 2,
      totalElements: 5,
      totalPages: 3,
      ordering: null,
    });
  });

  it('totalElements reflects the filtered set, not the slice', () => {
    const filtered = items.filter((value) => value >= 3);
    const page = applyPagination(filtered, 0, 1);
    expect(page.totalElements).toBe(2);
    expect(page.content).toEqual([3]);
  });

  it.each([
    { length: 5, size: 2, totalPages: 3 },
    { length: 4, size: 2, totalPages: 2 },
    { length: 0, size: 20, totalPages: 0 },
    { length: 0, size: 0, totalPages: 0 },
    { length: 2, size: 0, totalPages: 0 },
  ])(
    'counts $totalPages pages for $length items of size $size',
    ({ length, size, totalPages }) => {
      expect(applyPagination(Array.from({ length }), 0, size).totalPages).toBe(
        totalPages,
      );
    },
  );

  it('returns the ordering it received', () => {
    const ordering = { amount: SortOrder.DESC };
    expect(applyPagination(items, 0, 2, ordering).ordering).toEqual(ordering);
  });
});
