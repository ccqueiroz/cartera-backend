import type { Request, Response } from 'express';
import { assertValid, REJECT_UNKNOWN } from '@/shared/http/request-input';
import { ListPaymentStatusesUseCase } from '@/features/payment-status/application/list-payment-statuses.usecase';
import { GetPaymentStatusByEnumUseCase } from '@/features/payment-status/application/get-payment-status-by-enum.usecase';
import { DescriptionEnumParamSchema } from '@/features/payment-status/infra/http/schemas/description-enum-param.schema';
import { PaymentStatusCode } from '@/shared/kernel/enums/payment-status.enum';

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

  public listAll = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute();
    res.status(200).json({ data: result });
  };

  public getByEnum = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params, REJECT_UNKNOWN);
    const result = await this.useCases.getByEnum.execute({
      code: String(req.params.descriptionEnum) as PaymentStatusCode,
    });
    res.status(200).json({ data: result });
  };
}
