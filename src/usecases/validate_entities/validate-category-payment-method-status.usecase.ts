import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { GetCategoryByIdUseCase } from '../category/get-category-by-id.usecase';
import { GetPaymentMethodByIdUseCase } from '../payment_method/get-payment-method-by-id.usecase';
import { GetPaymentStatusByIdUseCase } from '../payment_status/get-payment-status-by-id.usecase';
import { Usecase } from '../usecase';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

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
    private categoryService: CategoryServiceGateway,
    private paymentMethodService: PaymentMethodServiceGateway,
    private paymentStatusServiceGateway: PaymentStatusServiceGateway,
  ) {
    this.getCategoryByIdService = GetCategoryByIdUseCase.create({
      categoryService: this.categoryService,
    });
    this.getPaymentMethodByIdService = GetPaymentMethodByIdUseCase.create({
      paymentMethodService: this.paymentMethodService,
    });
    this.getPaymentStatusByIdService = GetPaymentStatusByIdUseCase.create({
      paymentStatusService: this.paymentStatusServiceGateway,
    });
  }

  public static create({
    categoryService,
    paymentMethodService,
    paymentStatusServiceGateway,
  }: {
    categoryService: CategoryServiceGateway;
    paymentMethodService: PaymentMethodServiceGateway;
    paymentStatusServiceGateway: PaymentStatusServiceGateway;
  }) {
    return new ValidateCategoryPaymentMethodStatusUseCase(
      categoryService,
      paymentMethodService,
      paymentStatusServiceGateway,
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
