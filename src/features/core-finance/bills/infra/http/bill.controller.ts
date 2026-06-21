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
import { CreateSingleBillUseCase } from '@/features/core-finance/bills/application/create-single-bill.usecase';
import { CreateInstallmentBillUseCase } from '@/features/core-finance/bills/application/create-installment-bill.usecase';
import { ListBillsUseCase } from '@/features/core-finance/bills/application/list-bills.usecase';
import { ListUnpaidBillsByPeriodUseCase } from '@/features/core-finance/bills/application/list-unpaid-bills-by-period.usecase';
import { GetBillByIdUseCase } from '@/features/core-finance/bills/application/get-bill-by-id.usecase';
import { SettleBillUseCase } from '@/features/core-finance/bills/application/settle-bill.usecase';
import { GlobalSettleBillUseCase } from '@/features/core-finance/bills/application/global-settle-bill.usecase';
import { EditBillUseCase } from '@/features/core-finance/bills/application/edit-bill.usecase';
import { SoftDeleteBillUseCase } from '@/features/core-finance/bills/application/soft-delete-bill.usecase';
import { ReverseBillUseCase } from '@/features/core-finance/bills/application/reverse-bill.usecase';
import { CreateBillSchema } from '@/features/core-finance/bills/infra/http/schemas/create-bill.schema';
import { CreateInstallmentBillSchema } from '@/features/core-finance/bills/infra/http/schemas/create-installment-bill.schema';
import { SettleBillSchema } from '@/features/core-finance/bills/infra/http/schemas/settle-bill.schema';
import { GlobalSettleBillSchema } from '@/features/core-finance/bills/infra/http/schemas/global-settle-bill.schema';
import { EditBillSchema } from '@/features/core-finance/bills/infra/http/schemas/edit-bill.schema';
import { ListUnpaidByPeriodSchema } from '@/features/core-finance/bills/infra/http/schemas/list-unpaid-by-period.schema';

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
  return value === 'paid' ? 'paid' : 'to_pay';
}

export interface BillUseCases {
  create: CreateSingleBillUseCase;
  createInstallment: CreateInstallmentBillUseCase;
  list: ListBillsUseCase;
  listUnpaidByPeriod: ListUnpaidBillsByPeriodUseCase;
  getById: GetBillByIdUseCase;
  settle: SettleBillUseCase;
  globalSettlement: GlobalSettleBillUseCase;
  edit: EditBillUseCase;
  softDelete: SoftDeleteBillUseCase;
  reverse: ReverseBillUseCase;
}

export class BillController {
  private constructor(private readonly useCases: BillUseCases) {}

  public static create(useCases: BillUseCases): BillController {
    return new BillController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateBillSchema, req.body);
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
      cardId: req.body.cardId,
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
    await assertValid(CreateInstallmentBillSchema, req.body);
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

  public listUnpaidByPeriod = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await assertValid(ListUnpaidByPeriodSchema, req.query);
    const result = await this.useCases.listUnpaidByPeriod.execute({
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
    await assertValid(SettleBillSchema, req.body);
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
    await assertValid(GlobalSettleBillSchema, req.body);
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
    await assertValid(EditBillSchema, req.body);
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
