import type { Request, Response } from 'express';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { SortOrder } from '@/shared/query/page';

function makeResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

const page = {
  content: [],
  page: 2,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  ordering: { dueDate: SortOrder.DESC },
};

const listQuery = {
  page: '2',
  size: '10',
  ordering: 'dueDate',
  direction_order: 'desc',
  sort: 'paymentStatus',
  sort_value: 'PAID',
  search_by_date: 'paymentDate',
  search_by_date_value: '2026-01-15',
};

const params = {
  page: 2,
  size: 10,
  ordering: { dueDate: SortOrder.DESC },
  sort: { field: 'paymentStatus', value: 'PAID' },
  searchByDate: { field: 'paymentDate', exactlyDate: '2026-01-15' },
};

const requestWith = (query: object) =>
  ({ query, user_auth: { userId: 'user-1' } } as unknown as Request);

describe.each([
  {
    handler: 'listAll',
    useCase: 'list',
    ownQuery: {
      scope: 'received',
      month: '1',
      year: '2026',
      categoryDescriptionEnum: 'SALARY',
      paymentMethodDescriptionEnum: 'PIX',
      rootHasInstallments: 'true',
      rootIsFixedCost: 'false',
    },
    ownInput: {
      scope: 'paid',
      month: 1,
      year: 2026,
      categoryDescriptionEnum: 'SALARY',
      paymentMethodDescriptionEnum: 'PIX',
      rootHasInstallments: true,
      rootIsFixedCost: false,
    },
  },
  {
    handler: 'listUnreceivedByPeriod',
    useCase: 'listUnreceivedByPeriod',
    ownQuery: { start_date: '2026-01-01', end_date: '2026-01-31' },
    ownInput: { startDate: '2026-01-01', endDate: '2026-01-31' },
  },
] as const)(
  '[BK2-48] ReceivableController $handler',
  ({ handler, useCase, ownQuery, ownInput }) => {
    it('passes the read params and its own filters and answers the page in data', async () => {
      const execute = jest.fn().mockResolvedValue(page);
      const controller = ReceivableController.create({
        [useCase]: { execute },
      } as any);
      const res = makeResponse();

      await expect(
        controller[handler](requestWith({ ...ownQuery, ...listQuery }), res),
      ).resolves.toBeUndefined();

      expect(execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', ...ownInput, params }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: page });
    });

    it('rejects an invalid direction_order with VALIDATION_FAILED', async () => {
      const controller = ReceivableController.create({
        [useCase]: { execute: jest.fn() },
      } as any);
      const result = controller[handler](
        requestWith({
          ...ownQuery,
          ordering: 'dueDate',
          direction_order: 'up',
        }),
        makeResponse(),
      );

      await expect(result).rejects.toThrow(ValidationError);
      await expect(result).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });
    });
  },
);
