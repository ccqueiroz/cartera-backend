import type { Request, Response } from 'express';
import {
  ClassConstructor,
  runValidate,
} from '@/packages/clients/class-validator';
import {
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { CreateTransferUseCase } from '@/features/transfer/application/create-transfer.usecase';
import { ListTransfersUseCase } from '@/features/transfer/application/list-transfers.usecase';
import { GetTransferByIdUseCase } from '@/features/transfer/application/get-transfer-by-id.usecase';
import { CreateTransferSchema } from '@/features/transfer/infra/http/schemas/create-transfer.schema';

async function assertValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
): Promise<void> {
  const errors = await runValidate(schema, input, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ');
    throw new ValidationError(
      ErrorCode.VALIDATION_FAILED,
      details ? { details } : undefined,
    );
  }
}

function userIdFrom(req: Request): string {
  const userId = req.user_auth?.userId;
  if (!userId) throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
  return userId;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

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
    res.status(201).json(result);
  };

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute({
      userId: userIdFrom(req),
      month: numberOrUndefined(req.query.month),
      year: numberOrUndefined(req.query.year),
      page: numberOrUndefined(req.query.page),
      size: numberOrUndefined(req.query.size),
    });
    res.status(200).json(result);
  };

  public listById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.getById.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
    });
    res.status(200).json(result);
  };
}
