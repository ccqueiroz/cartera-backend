import type { Request, Response } from 'express';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { PaymentStatusNotFoundError } from '@/features/payment-status/domain/errors/payment-status-not-found.error';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';

function makeResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

function makeUseCases() {
  return {
    list: { execute: jest.fn() },
    getByEnum: { execute: jest.fn() },
  } as any;
}

describe('PaymentStatusController', () => {
  it('list returns 200 with the seeded catalog array', async () => {
    const useCases = makeUseCases();
    const output = [
      { id: 'ps-1', code: PaymentStatusEnum.PAID, label: 'Pago' },
    ];
    useCases.list.execute.mockResolvedValue(output);
    const controller = PaymentStatusController.create(useCases);
    const res = makeResponse();

    await controller.listAll({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: output });
  });

  it('list returns 200 with an empty array when the catalog is unseeded', async () => {
    const useCases = makeUseCases();
    useCases.list.execute.mockResolvedValue([]);
    const controller = PaymentStatusController.create(useCases);
    const res = makeResponse();

    await controller.listAll({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('getByEnum returns 200 for a valid, seeded code', async () => {
    const useCases = makeUseCases();
    const output = {
      id: 'ps-1',
      code: PaymentStatusEnum.OVERDUE,
      label: 'Vencido',
    };
    useCases.getByEnum.execute.mockResolvedValue(output);
    const controller = PaymentStatusController.create(useCases);
    const res = makeResponse();

    await controller.getByEnum(
      {
        params: { description_enum: PaymentStatusEnum.OVERDUE },
      } as unknown as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: output });
  });

  it('getByEnum rejects with ValidationError (400) on a status outside the closed set', async () => {
    const controller = PaymentStatusController.create(makeUseCases());

    await expect(
      controller.getByEnum(
        { params: { description_enum: 'NOPE' } } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('getByEnum propagates PaymentStatusNotFoundError (404) for a valid but unseeded code', async () => {
    const useCases = makeUseCases();
    useCases.getByEnum.execute.mockRejectedValue(
      new PaymentStatusNotFoundError(PaymentStatusEnum.PAID),
    );
    const controller = PaymentStatusController.create(useCases);

    await expect(
      controller.getByEnum(
        {
          params: { description_enum: PaymentStatusEnum.PAID },
        } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(PaymentStatusNotFoundError);
  });

  it('[PDR-08] getByEnum rejects the old descriptionEnum param name', async () => {
    const controller = PaymentStatusController.create(makeUseCases());
    const rejection = controller.getByEnum(
      { params: { descriptionEnum: 'PAID' } } as unknown as Request,
      makeResponse(),
    );

    await expect(rejection).rejects.toBeInstanceOf(ValidationError);
    await expect(rejection).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      params: {
        details: expect.stringContaining(
          errorCatalog[ErrorCode.PROPERTY_SHOULD_NOT_EXIST]({
            attribute: 'descriptionEnum',
          }),
        ),
      },
    });
  });
});
