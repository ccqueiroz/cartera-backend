import { readPaginationParams } from './pagination-params';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { SortOrder } from '@/shared/query/page';

const billListFields = {
  ordering: ['dueDate', 'paymentDate', 'amount', 'paidAmount'],
  sort: [
    'categoryDescriptionEnum',
    'paymentMethodDescriptionEnum',
    'paymentStatus',
  ],
  searchByDate: ['dueDate', 'paymentDate'],
};

describe('[BK2-48] readPaginationParams', () => {
  it('reads page and size as numbers', () => {
    expect(
      readPaginationParams({ page: '2', size: '10' }, billListFields),
    ).toEqual({ page: 2, size: 10 });
  });

  it.each([
    {
      query: { ordering: 'dueDate', direction_order: 'asc' },
      expected: { ordering: { dueDate: SortOrder.ASC } },
    },
    {
      query: { ordering: 'paidAmount', direction_order: 'desc' },
      expected: { ordering: { paidAmount: SortOrder.DESC } },
    },
    {
      query: { sort: 'paymentStatus', sort_value: 'PAID' },
      expected: { sort: { field: 'paymentStatus', value: 'PAID' } },
    },
    {
      query: { search_by_date: 'dueDate', search_by_date_value: '2026-01-15' },
      expected: {
        searchByDate: { field: 'dueDate', exactlyDate: '2026-01-15' },
      },
    },
    {
      query: {
        search_by_date: 'paymentDate',
        search_by_date_value: '2026-01-01-2026-01-31',
      },
      expected: {
        searchByDate: {
          field: 'paymentDate',
          initialDate: '2026-01-01',
          finalDate: '2026-01-31',
        },
      },
    },
  ])('reads the accepted pair $query', ({ query, expected }) => {
    expect(readPaginationParams(query, billListFields)).toEqual(expected);
  });

  it.each([
    { query: { ordering: 'name' } },
    { query: { direction_order: 'up' } },
    { query: { sort: 'amount' } },
    { query: { sort_value: 'PAID' } },
    { query: { search_by_date: 'createdAt' } },
    { query: { search_by_date_value: 'bad' } },
  ])('ignores the incomplete pair $query', ({ query }) => {
    expect(
      readPaginationParams({ page: '1', size: '5', ...query }, billListFields),
    ).toEqual({ page: 1, size: 5 });
  });

  it.each([
    {
      parameter: 'ordering',
      query: { ordering: 'name', direction_order: 'asc' },
    },
    {
      parameter: 'direction_order',
      query: { ordering: 'dueDate', direction_order: 'up' },
    },
    { parameter: 'sort', query: { sort: 'amount', sort_value: '10' } },
    {
      parameter: 'search_by_date',
      query: {
        search_by_date: 'createdAt',
        search_by_date_value: '2026-01-15',
      },
    },
    {
      parameter: 'search_by_date_value',
      query: { search_by_date: 'dueDate', search_by_date_value: '15/01/2026' },
    },
    {
      parameter: 'search_by_date_value',
      query: {
        search_by_date: 'dueDate',
        search_by_date_value: '2026-01-01_2026-01-31',
      },
    },
    {
      parameter: 'search_by_date_value',
      query: {
        search_by_date: 'dueDate',
        search_by_date_value: '2026-01-01-31/01/2026',
      },
    },
    {
      parameter: 'search_by_date_value',
      query: {
        search_by_date: 'dueDate',
        search_by_date_value: '2026-02-01-2026-01-31',
      },
    },
  ])(
    'rejects $parameter in $query with VALIDATION_FAILED',
    ({ parameter, query }) => {
      const read = () => readPaginationParams(query, billListFields);
      expect(read).toThrow(ValidationError);
      expect(read).toThrow(
        expect.objectContaining({
          code: ErrorCode.VALIDATION_FAILED,
          params: { details: expect.stringContaining(parameter) },
        }),
      );
    },
  );
});
