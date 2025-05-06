import {
  GetReceivableByIdInputDTO,
  ReceivableDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export type GetReceivableByIdOutputDTO = OutputDTO<ReceivableDTO | null>;

export class GetReceivableByIdUseCase
  implements Usecase<GetReceivableByIdInputDTO, GetReceivableByIdOutputDTO>
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
  ) {}

  public static create({
    receivableService,
  }: {
    receivableService: ReceivableServiceGateway;
  }) {
    return new GetReceivableByIdUseCase(receivableService);
  }

  public async execute({
    id: receivableId,
    userId,
  }: GetReceivableByIdInputDTO): Promise<GetReceivableByIdOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!receivableId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const receivable = await this.receivableService.getReceivableById({
      id: receivableId,
      userId,
    });

    if (
      !receivable ||
      !Object.prototype.hasOwnProperty.call(receivable, 'id')
    ) {
      return { data: null };
    }

    return {
      data: {
        id: receivable.id,
        personUserId: receivable.personUserId,
        userId: receivable.userId,
        descriptionReceivable: receivable.descriptionReceivable,
        fixedReceivable: receivable.fixedReceivable,
        receivableDate: receivable.receivableDate,
        icon: receivable?.icon ?? null,
        amount: receivable.amount,
        paymentStatusId: receivable.paymentStatusId,
        paymentStatusDescription: receivable.paymentStatusDescription,
        categoryId: receivable.categoryId,
        categoryDescription: receivable.categoryDescription,
        paymentMethodId: receivable.paymentMethodId,
        paymentMethodDescription: receivable.paymentMethodDescription,
        receival: receivable.receival,
        receivalDate: receivable.receivalDate,
        createdAt: receivable.createdAt,
        updatedAt: receivable.updatedAt,
      },
    };
  }
}
