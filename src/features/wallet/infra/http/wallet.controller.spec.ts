import type { Request, Response } from 'express';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';
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
  ordering: { amount: SortOrder.DESC },
};

const requestWith = (query: object) =>
  ({
    query,
    params: { id: 'wallet-1' },
    user_auth: { userId: 'user-1' },
  } as unknown as Request);

describe('[BK2-48] WalletController statement', () => {
  it('passes the read params with month and year and answers the page in data', async () => {
    const execute = jest.fn().mockResolvedValue(page);
    const controller = WalletController.create({
      statement: { execute },
    } as any);
    const res = makeResponse();

    await expect(
      controller.statement(
        requestWith({
          month: '6',
          year: '2026',
          page: '2',
          size: '10',
          ordering: 'amount',
          direction_order: 'desc',
          sort: 'refType',
          sort_value: 'TRANSFER',
          search_by_date: 'createdAt',
          search_by_date_value: '2026-06-01-2026-06-30',
        }),
        res,
      ),
    ).resolves.toBeUndefined();

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        id: 'wallet-1',
        month: 6,
        year: 2026,
        params: {
          page: 2,
          size: 10,
          ordering: { amount: SortOrder.DESC },
          sort: { field: 'refType', value: 'TRANSFER' },
          searchByDate: {
            field: 'createdAt',
            initialDate: '2026-06-01',
            finalDate: '2026-06-30',
          },
        },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: page });
  });

  it.each([
    ['ordering', 'name', { ordering: 'name', direction_order: 'asc' }],
    ['sort', 'isDefault', { sort: 'isDefault', sort_value: 'true' }],
    [
      'search_by_date',
      'transferDate',
      { search_by_date: 'transferDate', search_by_date_value: '2026-06-01' },
    ],
  ])(
    'rejects %s %s outside the statement fields with VALIDATION_FAILED',
    async (attribute, value, query) => {
      const execute = jest.fn();
      const controller = WalletController.create({
        statement: { execute },
      } as any);
      const result = controller.statement(requestWith(query), makeResponse());

      await expect(result).rejects.toThrow(ValidationError);
      await expect(result).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        params: {
          details: errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
            attribute,
            value,
          }),
        },
      });
      expect(execute).not.toHaveBeenCalled();
    },
  );
});

describe('[BK2-48] WalletController listAll', () => {
  it('passes the read params and answers the page in data', async () => {
    const execute = jest.fn().mockResolvedValue(page);
    const controller = WalletController.create({ list: { execute } } as any);
    const res = makeResponse();

    await controller.listAll(
      requestWith({
        page: '2',
        size: '10',
        ordering: 'balance',
        direction_order: 'desc',
        sort: 'isDefault',
        sort_value: 'false',
        search_by_date: 'createdAt',
        search_by_date_value: '2026-06-01',
      }),
      res,
    );

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        params: {
          page: 2,
          size: 10,
          ordering: { balance: SortOrder.DESC },
          sort: { field: 'isDefault', value: 'false' },
          searchByDate: { field: 'createdAt', exactlyDate: '2026-06-01' },
        },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: page });
  });

  it('rejects an ordering outside the wallet fields with VALIDATION_FAILED', async () => {
    const execute = jest.fn();
    const controller = WalletController.create({ list: { execute } } as any);
    const result = controller.listAll(
      requestWith({ ordering: 'amount', direction_order: 'asc' }),
      makeResponse(),
    );

    await expect(result).rejects.toThrow(ValidationError);
    await expect(result).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      params: {
        details: errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
          attribute: 'ordering',
          value: 'amount',
        }),
      },
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
