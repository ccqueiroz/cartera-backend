import type { Request, Response } from 'express';
import {
  ClassConstructor,
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { ListPaymentStatusesUseCase } from '@/features/payment-status/application/list-payment-statuses.usecase';
import { GetPaymentStatusByEnumUseCase } from '@/features/payment-status/application/get-payment-status-by-enum.usecase';
import { StatusEnumParamSchema } from '@/features/payment-status/infra/http/schemas/status-enum-param.schema';
import { PaymentStatusCode } from '@/shared/kernel/enums/payment-status.enum';

const REJECT_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

async function assertValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
  options: ValidatorOptions,
): Promise<void> {
  const errors = await runValidate(schema, input, options);
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

export interface PaymentStatusUseCases {
  list: ListPaymentStatusesUseCase;
  getByEnum: GetPaymentStatusByEnumUseCase;
}

export class PaymentStatusController {
  private constructor(private readonly useCases: PaymentStatusUseCases) {}

  public static create(
    useCases: PaymentStatusUseCases,
  ): PaymentStatusController {
    return new PaymentStatusController(useCases);
  }

  public list = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute();
    res.status(200).json(result);
  };

  public getByEnum = async (req: Request, res: Response): Promise<void> => {
    await assertValid(StatusEnumParamSchema, req.params, REJECT_UNKNOWN);
    const result = await this.useCases.getByEnum.execute({
      code: String(req.params.status) as PaymentStatusCode,
    });
    res.status(200).json(result);
  };
}
