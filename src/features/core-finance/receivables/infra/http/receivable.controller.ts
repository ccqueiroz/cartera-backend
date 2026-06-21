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
import { CreateSingleReceivableUseCase } from '@/features/core-finance/receivables/application/create-single-receivable.usecase';
import { CreateInstallmentReceivableUseCase } from '@/features/core-finance/receivables/application/create-installment-receivable.usecase';
import { ListReceivablesUseCase } from '@/features/core-finance/receivables/application/list-receivables.usecase';
import { ListUnreceivedByPeriodUseCase } from '@/features/core-finance/receivables/application/list-unreceived-by-period.usecase';
import { GetReceivableByIdUseCase } from '@/features/core-finance/receivables/application/get-receivable-by-id.usecase';
import { SettleReceivableUseCase } from '@/features/core-finance/receivables/application/settle-receivable.usecase';
import { GlobalSettleReceivableUseCase } from '@/features/core-finance/receivables/application/global-settle-receivable.usecase';
import { EditReceivableUseCase } from '@/features/core-finance/receivables/application/edit-receivable.usecase';
import { SoftDeleteReceivableUseCase } from '@/features/core-finance/receivables/application/soft-delete-receivable.usecase';
import { ReverseReceivableUseCase } from '@/features/core-finance/receivables/application/reverse-receivable.usecase';
import { CreateReceivableSchema } from '@/features/core-finance/receivables/infra/http/schemas/create-receivable.schema';
import { CreateInstallmentReceivableSchema } from '@/features/core-finance/receivables/infra/http/schemas/create-installment-receivable.schema';
import { SettleReceivableSchema } from '@/features/core-finance/receivables/infra/http/schemas/settle-receivable.schema';
import { GlobalSettleReceivableSchema } from '@/features/core-finance/receivables/infra/http/schemas/global-settle-receivable.schema';
import { EditReceivableSchema } from '@/features/core-finance/receivables/infra/http/schemas/edit-receivable.schema';
import { ListUnreceivedByPeriodSchema } from '@/features/core-finance/receivables/infra/http/schemas/list-unreceived-by-period.schema';

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

function boolOrUndefined(value: unknown): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function scopeFrom(value: unknown): 'to_pay' | 'paid' {
  return value === 'received' || value === 'paid' ? 'paid' : 'to_pay';
}

export interface ReceivableUseCases {
  create: CreateSingleReceivableUseCase;
  createInstallment: CreateInstallmentReceivableUseCase;
  list: ListReceivablesUseCase;
  listUnreceivedByPeriod: ListUnreceivedByPeriodUseCase;
  getById: GetReceivableByIdUseCase;
  settle: SettleReceivableUseCase;
  globalSettlement: GlobalSettleReceivableUseCase;
  edit: EditReceivableUseCase;
  softDelete: SoftDeleteReceivableUseCase;
  reverse: ReverseReceivableUseCase;
}

export class ReceivableController {
  private constructor(private readonly useCases: ReceivableUseCases) {}

  public static create(useCases: ReceivableUseCases): ReceivableController {
    return new ReceivableController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateReceivableSchema, req.body);
    const result = await this.useCases.create.execute({
      userId: userIdFrom(req),
      personId: req.body.personId,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      categoryDescriptionEnum: req.body.categoryDescriptionEnum,
      isFixedCost: req.body.isFixedCost,
      period: req.body.period,
      frequency: req.body.frequency,
      paymentMethodDescriptionEnum: req.body.paymentMethodDescriptionEnum,
      paidAt: req.body.paidAt,
      paidAmount: req.body.paidAmount,
      walletId: req.body.walletId,
    });
    res.status(201).json(result);
  };

  public createInstallment = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await assertValid(CreateInstallmentReceivableSchema, req.body);
    const result = await this.useCases.createInstallment.execute({
      userId: userIdFrom(req),
      personId: req.body.personId,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      categoryDescriptionEnum: req.body.categoryDescriptionEnum,
      isFixedCost: req.body.isFixedCost,
      period: req.body.period,
      frequency: req.body.frequency,
      installments: req.body.installments,
      entry: req.body.entry,
    });
    res.status(201).json(result);
  };

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute({
      userId: userIdFrom(req),
      scope: scopeFrom(req.query.scope),
      month: numberOrUndefined(req.query.month),
      year: numberOrUndefined(req.query.year),
      categoryDescriptionEnum: req.query.categoryDescriptionEnum
        ? String(req.query.categoryDescriptionEnum)
        : undefined,
      paymentMethodDescriptionEnum: req.query.paymentMethodDescriptionEnum
        ? String(req.query.paymentMethodDescriptionEnum)
        : undefined,
      rootHasInstallments: boolOrUndefined(req.query.rootHasInstallments),
      rootIsFixedCost: boolOrUndefined(req.query.rootIsFixedCost),
      page: numberOrUndefined(req.query.page),
      size: numberOrUndefined(req.query.size),
    });
    res.status(200).json(result);
  };

  public listUnreceivedByPeriod = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await assertValid(ListUnreceivedByPeriodSchema, req.query);
    const result = await this.useCases.listUnreceivedByPeriod.execute({
      userId: userIdFrom(req),
      startDate: String(req.query.start_date),
      endDate: String(req.query.end_date),
      page: numberOrUndefined(req.query.page),
      size: numberOrUndefined(req.query.size),
    });
    res.status(200).json(result);
  };

  public listById = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.getById.execute(
      String(req.params.id),
      userIdFrom(req),
    );
    res.status(200).json(result);
  };

  public settle = async (req: Request, res: Response): Promise<void> => {
    await assertValid(SettleReceivableSchema, req.body);
    const result = await this.useCases.settle.execute({
      id: String(req.params.id),
      userId: userIdFrom(req),
      walletId: req.body.walletId,
      paidAmount: req.body.paidAmount,
      paymentDate: req.body.paymentDate,
      paymentMethodDescriptionEnum: req.body.paymentMethodDescriptionEnum,
    });
    res.status(200).json(result);
  };

  public globalSettlement = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await assertValid(GlobalSettleReceivableSchema, req.body);
    const result = await this.useCases.globalSettlement.execute({
      nodeId: String(req.params.id),
      userId: userIdFrom(req),
      walletId: req.body.walletId,
      paymentDate: req.body.paymentDate,
      paymentMethodDescriptionEnum: req.body.paymentMethodDescriptionEnum,
      selection: req.body.selection,
      valorPago: req.body.valorPago,
    });
    res.status(200).json(result);
  };

  public edit = async (req: Request, res: Response): Promise<void> => {
    await assertValid(EditReceivableSchema, req.body);
    const result = await this.useCases.edit.execute({
      id: String(req.params.id),
      userId: userIdFrom(req),
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      categoryDescriptionEnum: req.body.categoryDescriptionEnum,
      propagate: req.body.propagate,
    });
    res.status(200).json(result);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.softDelete.execute(
      String(req.params.id),
      userIdFrom(req),
    );
    res.status(204).send();
  };

  public reverse = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.reverse.execute({
      id: String(req.params.id),
      userId: userIdFrom(req),
    });
    res.status(200).json(result);
  };
}
