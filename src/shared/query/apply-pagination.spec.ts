import { applyPagination } from '@/shared/query/apply-pagination';

describe('applyPagination', () => {
  const items = Array.from({ length: 5 }, (_, index) => index);

  it('embrulha o envelope Page com a fatia pedida', () => {
    const page = applyPagination(items, 1, 2);
    expect(page).toEqual({
      content: [2, 3],
      page: 1,
      size: 2,
      totalElements: 5,
    });
  });

  it('totalElements reflete o conjunto filtrado, não a fatia', () => {
    const filtered = items.filter((value) => value >= 3);
    const page = applyPagination(filtered, 0, 1);
    expect(page.totalElements).toBe(2);
    expect(page.content).toEqual([3]);
  });
});
