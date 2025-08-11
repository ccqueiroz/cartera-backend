import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { Usecase } from '../usecase';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import {
  PaymentMethodDescriptionEnumType,
  PaymentMethodDTO,
} from '@/domain/Payment_Method/dtos/payment-method.dto';
import {
  CategoryDescriptionEnumType,
  CategoryDTO,
} from '@/domain/Category/dtos/category.dto';
import { GetPaymentMethodByDescriptionUseCase } from '../payment_method/get-payment-method-by-description.usecase';
import { GetCategoryByDescriptionUseCase } from '../category/get-category-by-description.usecase';

export type ValidateEntitiesCategoryPaymentMethodInputDTO = {
  paymentMethodDescriptionEnum?: PaymentMethodDescriptionEnumType;
  categoryDescriptionEnum: CategoryDescriptionEnumType;
};

type PromiseReturnType<T> =
  | {
      status: 'fullfield';
      value: { data: T };
    }
  | { status: 'rejected'; value: { data: null } };

export type ValidateEntitiesCategoryPaymentMethodStatusOutputDTO = {
  isValidEntities: boolean;
  category: CategoryDTO | null;
  paymentMethod: PaymentMethodDTO | null;
};

export class ValidateCategoryPaymentMethodUseCase
  implements
    Usecase<
      ValidateEntitiesCategoryPaymentMethodInputDTO,
      ValidateEntitiesCategoryPaymentMethodStatusOutputDTO
    >
{
  private getCategoryByDescriptionEnumService: GetCategoryByDescriptionUseCase;
  private getPaymentMethodByDescriptionEnumService: GetPaymentMethodByDescriptionUseCase;

  private constructor(
    private categoryService: CategoryServiceGateway,
    private paymentMethodService: PaymentMethodServiceGateway,
  ) {
    this.getCategoryByDescriptionEnumService =
      GetCategoryByDescriptionUseCase.create({
        categoryService: this.categoryService,
      });
    this.getPaymentMethodByDescriptionEnumService =
      GetPaymentMethodByDescriptionUseCase.create({
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

  private checkIfEntitieHasValidReturn<T>(entitie: PromiseReturnType<T>) {
    if (entitie.status === 'rejected' || !entitie.value) return { data: null };

    return entitie.value;
  }

  public async execute({
    paymentMethodDescriptionEnum,
    categoryDescriptionEnum,
  }: ValidateEntitiesCategoryPaymentMethodInputDTO): Promise<ValidateEntitiesCategoryPaymentMethodStatusOutputDTO> {
    const [category, paymentMethod] = await Promise.allSettled([
      this.getCategoryByDescriptionEnumService.execute({
        descriptionEnum: categoryDescriptionEnum,
      }),
      paymentMethodDescriptionEnum
        ? this.getPaymentMethodByDescriptionEnumService.execute({
            descriptionEnum: paymentMethodDescriptionEnum,
          })
        : Promise.resolve(null),
    ]);

    const validCategory = this.checkIfEntitieHasValidReturn<CategoryDTO>(
      category as unknown as PromiseReturnType<CategoryDTO>,
    );

    const validPaymentMethod =
      this.checkIfEntitieHasValidReturn<PaymentMethodDTO>(
        paymentMethod as unknown as PromiseReturnType<PaymentMethodDTO>,
      );

    const isValidEntities =
      !!validCategory.data &&
      (paymentMethodDescriptionEnum ? !!validPaymentMethod.data : true);

    return {
      isValidEntities,
      category: validCategory.data,
      paymentMethod: validPaymentMethod.data,
    };
  }
}
