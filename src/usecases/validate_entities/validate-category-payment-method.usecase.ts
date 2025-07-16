import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { GetCategoryByIdUseCase } from '../category/get-category-by-id.usecase';
import { GetPaymentMethodByIdUseCase } from '../payment_method/get-payment-method-by-id.usecase';
import { Usecase } from '../usecase';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';

export type ValidateEntitiesCategoryPaymentMethodInputDTO = {
  paymentMethodId?: string;
  categoryId: string;
};

type PromiseReturnType = {
  status: 'fullfield' | 'rejected';
  value: { data: unknown };
};

export type ValidateEntitiesCategoryPaymentMethodStatusOutputDTO = boolean;

export class ValidateCategoryPaymentMethodUseCase
  implements
    Usecase<
      ValidateEntitiesCategoryPaymentMethodInputDTO,
      ValidateEntitiesCategoryPaymentMethodStatusOutputDTO
    >
{
  private getCategoryByIdService: GetCategoryByIdUseCase;
  private getPaymentMethodByIdService: GetPaymentMethodByIdUseCase;

  private constructor(
    private categoryService: CategoryServiceGateway,
    private paymentMethodService: PaymentMethodServiceGateway,
  ) {
    this.getCategoryByIdService = GetCategoryByIdUseCase.create({
      categoryService: this.categoryService,
    });
    this.getPaymentMethodByIdService = GetPaymentMethodByIdUseCase.create({
      paymentMethodService: this.paymentMethodService,
    });
  }

  public static create({
    categoryService,
    paymentMethodService,
  }: {
    categoryService: CategoryServiceGateway;
    paymentMethodService: PaymentMethodServiceGateway;
  }) {
    return new ValidateCategoryPaymentMethodUseCase(
      categoryService,
      paymentMethodService,
    );
  }

  private checkIfEntitieHasValidReturn(entitie: PromiseReturnType) {
    if (entitie.status === 'rejected') return false;

    return !!entitie.value?.data;
  }

  public async execute({
    paymentMethodId,
    categoryId,
  }: ValidateEntitiesCategoryPaymentMethodInputDTO): Promise<ValidateEntitiesCategoryPaymentMethodStatusOutputDTO> {
    const [category, paymentMethod] = await Promise.allSettled([
      this.getCategoryByIdService.execute({ id: categoryId }),
      ...[
        paymentMethodId
          ? this.getPaymentMethodByIdService.execute({
              id: paymentMethodId ?? '',
            })
          : [],
      ],
    ]);

    const isCategoryValid = this.checkIfEntitieHasValidReturn(
      category as unknown as PromiseReturnType,
    );

    const isPaymentMethodValid = paymentMethodId
      ? this.checkIfEntitieHasValidReturn(
          paymentMethod as unknown as PromiseReturnType,
        )
      : true;

    return isCategoryValid && isPaymentMethodValid;
  }
}
