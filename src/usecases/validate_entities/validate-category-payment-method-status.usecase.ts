import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { GetCategoryByIdUseCase } from '../category/get-category-by-id.usecase';
import { GetPaymentMethodByIdUseCase } from '../payment_method/get-payment-method-by-id.usecase';
import { GetPaymentStatusByIdUseCase } from '../payment_status/get-payment-status-by-id.usecase';
import { Usecase } from '../usecase';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';

export type ValidateEntitiesCategoryPaymentMethodStatusInputDTO = {
  paymentMethodId: string;
  paymentStatusId: string;
  categoryId: string;
};

type PromiseReturnType = {
  status: 'fullfield' | 'rejected';
  value: { data: unknown };
};

export type ValidateEntitiesCategoryPaymentMethodStatusOutputDTO = boolean;

export class ValidateCategoryPaymentMethodStatusUseCase
  implements
    Usecase<
      ValidateEntitiesCategoryPaymentMethodStatusInputDTO,
      ValidateEntitiesCategoryPaymentMethodStatusOutputDTO
    >
{
  private getCategoryByIdService: GetCategoryByIdUseCase;
  private getPaymentMethodByIdService: GetPaymentMethodByIdUseCase;
  private getPaymentStatusByIdService: GetPaymentStatusByIdUseCase;

  private constructor(
    private categoryGateway: CategoryGateway,
    private paymentMethodGateway: PaymentMethodGateway,
    private paymentStatusGateway: PaymentStatusGateway,
  ) {
    this.getCategoryByIdService = GetCategoryByIdUseCase.create({
      categoryGateway: this.categoryGateway,
    });
    this.getPaymentMethodByIdService = GetPaymentMethodByIdUseCase.create({
      paymentMethodGateway: this.paymentMethodGateway,
    });
    this.getPaymentStatusByIdService = GetPaymentStatusByIdUseCase.create({
      paymentStatusGateway: this.paymentStatusGateway,
    });
  }

  public static create({
    categoryGateway,
    paymentMethodGateway,
    paymentStatusGateway,
  }: {
    categoryGateway: CategoryGateway;
    paymentMethodGateway: PaymentMethodGateway;
    paymentStatusGateway: PaymentStatusGateway;
  }) {
    return new ValidateCategoryPaymentMethodStatusUseCase(
      categoryGateway,
      paymentMethodGateway,
      paymentStatusGateway,
    );
  }

  private checkIfEntitieHasValidReturn(entitie: PromiseReturnType) {
    if (entitie.status === 'rejected') return false;

    return !!entitie.value?.data;
  }

  public async execute({
    paymentMethodId,
    paymentStatusId,
    categoryId,
  }: ValidateEntitiesCategoryPaymentMethodStatusInputDTO): Promise<ValidateEntitiesCategoryPaymentMethodStatusOutputDTO> {
    const [category, paymentMethod, paymentStatus] = await Promise.allSettled([
      this.getCategoryByIdService.execute({ id: categoryId }),
      this.getPaymentMethodByIdService.execute({ id: paymentMethodId }),
      this.getPaymentStatusByIdService.execute({ id: paymentStatusId }),
    ]);

    return (
      this.checkIfEntitieHasValidReturn(
        category as unknown as PromiseReturnType,
      ) &&
      this.checkIfEntitieHasValidReturn(
        paymentMethod as unknown as PromiseReturnType,
      ) &&
      this.checkIfEntitieHasValidReturn(
        paymentStatus as unknown as PromiseReturnType,
      )
    );
  }
}
