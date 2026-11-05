import type { Request, Response } from 'express';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
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
  ordering: { transferDate: SortOrder.ASC },
};

const requestWith = (query: object) =>
  ({ query, user_auth: { userId: 'user-1' } } as unknown as Request);

describe('[BK2-48] TransferController listAll', () => {
  it('passes the read params with month and year and answers the page in data', async () => {
    const execute = jest.fn().mockResolvedValue(page);
    const controller = TransferController.create({ list: { execute } } as any);
    const res = makeResponse();

    await controller.listAll(
      requestWith({
        month: '6',
        year: '2026',
        page: '2',
        size: '10',
        ordering: 'transferDate',
        direction_order: 'asc',
        sort: 'paymentMethodDescriptionEnum',
        sort_value: 'PIX',
        search_by_date: 'createdAt',
        search_by_date_value: '2026-06-01-2026-06-30',
      }),
      res,
    );

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
      month: 6,
      year: 2026,
      params: {
        page: 2,
        size: 10,
        ordering: { transferDate: SortOrder.ASC },
        sort: { field: 'paymentMethodDescriptionEnum', value: 'PIX' },
        searchByDate: {
          field: 'createdAt',
          initialDate: '2026-06-01',
          finalDate: '2026-06-30',
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: page });
  });

  it('rejects an ordering outside the transfer fields with VALIDATION_FAILED', async () => {
    const execute = jest.fn();
    const controller = TransferController.create({ list: { execute } } as any);
    const result = controller.listAll(
      requestWith({ ordering: 'name', direction_order: 'asc' }),
      makeResponse(),
    );

    await expect(result).rejects.toThrow(ValidationError);
    await expect(result).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      params: {
        details: errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
          attribute: 'ordering',
          value: 'name',
        }),
      },
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
