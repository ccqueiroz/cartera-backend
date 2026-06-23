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
import { CreateWalletUseCase } from '@/features/wallet/application/create-wallet.usecase';
import { ListWalletsUseCase } from '@/features/wallet/application/list-wallets.usecase';
import { GetWalletByIdUseCase } from '@/features/wallet/application/get-wallet-by-id.usecase';
import { EditWalletUseCase } from '@/features/wallet/application/edit-wallet.usecase';
import { DeleteWalletUseCase } from '@/features/wallet/application/delete-wallet.usecase';
import { AdjustBalanceUseCase } from '@/features/wallet/application/adjust-balance.usecase';
import { GetWalletStatementUseCase } from '@/features/wallet/application/get-wallet-statement.usecase';
import { CreateWalletSchema } from '@/features/wallet/infra/http/schemas/create-wallet.schema';
import { EditWalletSchema } from '@/features/wallet/infra/http/schemas/edit-wallet.schema';
import { AdjustBalanceSchema } from '@/features/wallet/infra/http/schemas/adjust-balance.schema';

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

export interface WalletUseCases {
  create: CreateWalletUseCase;
  list: ListWalletsUseCase;
  getById: GetWalletByIdUseCase;
  edit: EditWalletUseCase;
  remove: DeleteWalletUseCase;
  adjust: AdjustBalanceUseCase;
  statement: GetWalletStatementUseCase;
}

export class WalletController {
  private constructor(private readonly useCases: WalletUseCases) {}

  public static create(useCases: WalletUseCases): WalletController {
    return new WalletController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateWalletSchema, req.body);
    const result = await this.useCases.create.execute({
      userId: userIdFrom(req),
      name: req.body.name,
      balance: req.body.balance,
      hasOverdraft: req.body.hasOverdraft,
      overdraftLimit: req.body.overdraftLimit,
      overdraftMonthlyRate: req.body.overdraftMonthlyRate,
      overdraftGraceDays: req.body.overdraftGraceDays,
    });
    res.status(201).json(result);
  };

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute({
      userId: userIdFrom(req),
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

  public statement = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.statement.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
      month: numberOrUndefined(req.query.month),
      year: numberOrUndefined(req.query.year),
      page: numberOrUndefined(req.query.page),
      size: numberOrUndefined(req.query.size),
    });
    res.status(200).json(result);
  };

  public edit = async (req: Request, res: Response): Promise<void> => {
    await assertValid(EditWalletSchema, req.body);
    const result = await this.useCases.edit.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
      name: req.body.name,
      hasOverdraft: req.body.hasOverdraft,
      overdraftLimit: req.body.overdraftLimit,
      overdraftMonthlyRate: req.body.overdraftMonthlyRate,
      overdraftGraceDays: req.body.overdraftGraceDays,
    });
    res.status(200).json(result);
  };

  public adjustBalance = async (req: Request, res: Response): Promise<void> => {
    await assertValid(AdjustBalanceSchema, req.body);
    const result = await this.useCases.adjust.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
      operation: req.body.operation,
      amount: req.body.amount,
      occurredAt: req.body.occurredAt,
    });
    res.status(200).json(result);
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.remove.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
      force: req.query.force === 'true',
    });
    res.status(204).send();
  };
}
