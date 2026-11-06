import type { Request, Response } from 'express';
import {
  assertValid,
  numberOrUndefined,
  userIdFrom,
} from '@/shared/http/request-input';
import { readPaginationParams } from '@/shared/http/pagination-params';
import { CreateTransferUseCase } from '@/features/transfer/application/create-transfer.usecase';
import { ListTransfersUseCase } from '@/features/transfer/application/list-transfers.usecase';
import { GetTransferByIdUseCase } from '@/features/transfer/application/get-transfer-by-id.usecase';
import { CreateTransferSchema } from '@/features/transfer/infra/http/schemas/create-transfer.schema';

const TRANSFER_LIST_FIELDS = {
  ordering: ['transferDate', 'amount', 'createdAt'],
  sort: ['paymentMethodDescriptionEnum'],
  searchByDate: ['transferDate', 'createdAt'],
} as const;

export interface TransferUseCases {
  create: CreateTransferUseCase;
  list: ListTransfersUseCase;
  getById: GetTransferByIdUseCase;
}

export class TransferController {
  private constructor(private readonly useCases: TransferUseCases) {}

  public static create(useCases: TransferUseCases): TransferController {
    return new TransferController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateTransferSchema, req.body);
    const result = await this.useCases.create.execute({
      userId: userIdFrom(req),
      fromWalletId: req.body.fromWalletId,
      toWalletId: req.body.toWalletId,
      amount: req.body.amount,
      paymentMethodDescriptionEnum: req.body.paymentMethodDescriptionEnum,
      transferDate: req.body.transferDate,
    });
    res.status(201).json({ data: result });
  };

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute({
      userId: userIdFrom(req),
      month: numberOrUndefined(req.query.month),
      year: numberOrUndefined(req.query.year),
      params: readPaginationParams(req.query, TRANSFER_LIST_FIELDS),
    });
    res.status(200).json({ data: result });
  };

  public listById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.getById.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
    });
    res.status(200).json({ data: result });
  };
}
