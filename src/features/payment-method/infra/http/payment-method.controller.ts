import type { Request, Response } from 'express';
import {
  ClassConstructor,
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { CreatePaymentMethodUseCase } from '@/features/payment-method/application/create-payment-method.usecase';
import { ListPaymentMethodsUseCase } from '@/features/payment-method/application/list-payment-methods.usecase';
import { GetPaymentMethodByEnumUseCase } from '@/features/payment-method/application/get-payment-method-by-enum.usecase';
import { UpdatePaymentMethodUseCase } from '@/features/payment-method/application/update-payment-method.usecase';
import { SoftDeletePaymentMethodUseCase } from '@/features/payment-method/application/soft-delete-payment-method.usecase';
import { CreatePaymentMethodSchema } from '@/features/payment-method/infra/http/schemas/create-payment-method.schema';
import { UpdatePaymentMethodSchema } from '@/features/payment-method/infra/http/schemas/update-payment-method.schema';
import { DescriptionEnumParamSchema } from '@/features/payment-method/infra/http/schemas/description-enum-param.schema';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

const REJECT_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};
const DROP_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
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

export interface PaymentMethodUseCases {
  create: CreatePaymentMethodUseCase;
  list: ListPaymentMethodsUseCase;
  getByEnum: GetPaymentMethodByEnumUseCase;
  update: UpdatePaymentMethodUseCase;
  remove: SoftDeletePaymentMethodUseCase;
}

export class PaymentMethodController {
  private constructor(private readonly useCases: PaymentMethodUseCases) {}

  public static create(
    useCases: PaymentMethodUseCases,
  ): PaymentMethodController {
    return new PaymentMethodController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreatePaymentMethodSchema, req.body, REJECT_UNKNOWN);
    const method = await this.useCases.create.execute({
      description: req.body.description,
      descriptionEnum: req.body.descriptionEnum as PaymentMethodDescription,
    });
    res.status(201).json(method.toOutput());
  };

  public listAll = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute();
    res.status(200).json(result);
  };

  public getByEnum = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params, REJECT_UNKNOWN);
    const result = await this.useCases.getByEnum.execute({
      descriptionEnum: String(req.params.descriptionEnum),
    });
    res.status(200).json(result);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params, REJECT_UNKNOWN);
    await assertValid(UpdatePaymentMethodSchema, req.body, DROP_UNKNOWN);
    const method = await this.useCases.update.execute({
      descriptionEnum: req.params.descriptionEnum as PaymentMethodDescription,
      description: req.body.description,
    });
    res.status(200).json(method.toOutput());
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params, REJECT_UNKNOWN);
    await this.useCases.remove.execute({
      descriptionEnum: req.params.descriptionEnum as PaymentMethodDescription,
    });
    res.status(204).send();
  };
}
