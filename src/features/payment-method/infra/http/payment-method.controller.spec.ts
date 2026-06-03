import type { Request, Response } from 'express';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { DuplicatePaymentMethodError } from '@/features/payment-method/domain/errors/duplicate-payment-method.error';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';
import { PaymentMethodDeletedError } from '@/features/payment-method/domain/errors/payment-method-deleted.error';

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
    create: { execute: jest.fn() },
    list: { execute: jest.fn() },
    getByEnum: { execute: jest.fn() },
    update: { execute: jest.fn() },
    remove: { execute: jest.fn() },
  } as any;
}

describe('PaymentMethodController', () => {
  it('create returns 201 with the created method output', async () => {
    const useCases = makeUseCases();
    const output = { id: 'pm-1', descriptionEnum: 'PIX' };
    useCases.create.execute.mockResolvedValue({ toOutput: () => output });
    const controller = PaymentMethodController.create(useCases);
    const res = makeResponse();

    await controller.create(
      { body: { description: 'Pix', descriptionEnum: 'PIX' } } as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('create rejects with ValidationError (400) on invalid payload', async () => {
    const controller = PaymentMethodController.create(makeUseCases());
    const res = makeResponse();

    await expect(
      controller.create(
        { body: { description: '', descriptionEnum: 'NOPE' } } as Request,
        res,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('create propagates DuplicatePaymentMethodError (409)', async () => {
    const useCases = makeUseCases();
    useCases.create.execute.mockRejectedValue(
      new DuplicatePaymentMethodError('PIX'),
    );
    const controller = PaymentMethodController.create(useCases);

    await expect(
      controller.create(
        { body: { description: 'Pix', descriptionEnum: 'PIX' } } as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(DuplicatePaymentMethodError);
  });

  it('list returns 200 with the use case result', async () => {
    const useCases = makeUseCases();
    useCases.list.execute.mockResolvedValue([]);
    const controller = PaymentMethodController.create(useCases);
    const res = makeResponse();

    await controller.list({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('getByEnum returns 200 for a valid descriptionEnum', async () => {
    const useCases = makeUseCases();
    const output = { id: 'pm-1', descriptionEnum: 'PIX' };
    useCases.getByEnum.execute.mockResolvedValue(output);
    const controller = PaymentMethodController.create(useCases);
    const res = makeResponse();

    await controller.getByEnum(
      { params: { descriptionEnum: 'PIX' } } as unknown as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('getByEnum rejects with ValidationError (400) on an unknown enum param', async () => {
    const controller = PaymentMethodController.create(makeUseCases());

    await expect(
      controller.getByEnum(
        { params: { descriptionEnum: 'NOPE' } } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('getByEnum propagates PaymentMethodNotFoundError (404)', async () => {
    const useCases = makeUseCases();
    useCases.getByEnum.execute.mockRejectedValue(
      new PaymentMethodNotFoundError('PIX'),
    );
    const controller = PaymentMethodController.create(useCases);

    await expect(
      controller.getByEnum(
        { params: { descriptionEnum: 'PIX' } } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(PaymentMethodNotFoundError);
  });

  it('update returns 200 with the updated method output', async () => {
    const useCases = makeUseCases();
    const output = { id: 'pm-1', description: 'New' };
    useCases.update.execute.mockResolvedValue({ toOutput: () => output });
    const controller = PaymentMethodController.create(useCases);
    const res = makeResponse();

    await controller.update(
      {
        params: { id: 'pm-1' },
        body: { description: 'New' },
      } as unknown as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('update propagates PaymentMethodNotFoundError (404)', async () => {
    const useCases = makeUseCases();
    useCases.update.execute.mockRejectedValue(new PaymentMethodNotFoundError());
    const controller = PaymentMethodController.create(useCases);

    await expect(
      controller.update(
        {
          params: { id: 'missing' },
          body: { description: 'New' },
        } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(PaymentMethodNotFoundError);
  });

  it('update propagates PaymentMethodDeletedError (409) for a soft-deleted method', async () => {
    const useCases = makeUseCases();
    useCases.update.execute.mockRejectedValue(new PaymentMethodDeletedError());
    const controller = PaymentMethodController.create(useCases);

    await expect(
      controller.update(
        {
          params: { id: 'pm-1' },
          body: { description: 'New' },
        } as unknown as Request,
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(PaymentMethodDeletedError);
  });

  it('remove returns 204 with no body', async () => {
    const useCases = makeUseCases();
    useCases.remove.execute.mockResolvedValue(undefined);
    const controller = PaymentMethodController.create(useCases);
    const res = makeResponse();

    await controller.remove(
      { params: { id: 'pm-1' } } as unknown as Request,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
