import {
  ReceivablesByMonthInputDTO,
  ReceivablesByMonthOutputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetReceivablesByMonthOutputDTO = OutputDTO<
  ResponseListDTO<ReceivablesByMonthOutputDTO>
>;

export class GetReceivablesByMonthUseCase
  implements
    Usecase<ReceivablesByMonthInputDTO, GetReceivablesByMonthOutputDTO>
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
  ) {}

  public static create({
    receivableService,
  }: {
    receivableService: ReceivableServiceGateway;
  }) {
    return new GetReceivablesByMonthUseCase(receivableService);
  }

  public async execute(
    input: ReceivablesByMonthInputDTO,
  ): Promise<GetReceivablesByMonthOutputDTO> {
    if (!input.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (
      !input?.period ||
      !input?.period?.initialDate ||
      !input?.period?.finalDate ||
      isNaN(input?.period.initialDate) ||
      isNaN(input?.period.finalDate)
    ) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    const receivables = await this.receivableService.receivablesByMonth({
      ...input,
    });

    const data = receivables.content.map((item) => {
      return {
        id: item.id,
        personUserId: item.personUserId,
        userId: item.userId,
        descriptionReceivable: item.descriptionReceivable,
        fixedReceivable: item.fixedReceivable,
        amount: item.amount,
        receivableDate: item.receivableDate,
        categoryId: item.categoryId,
        categoryDescription: item.categoryDescription,
        categoryDescriptionEnum: item.categoryDescriptionEnum,
        categoryGroup: item.categoryGroup,
        status: item.paymentStatus,
      };
    }) as Array<ReceivablesByMonthOutputDTO>;

    const receivablesByMonth: ResponseListDTO<ReceivablesByMonthOutputDTO> = {
      ...receivables,
      content: data,
    };

    return {
      data: receivablesByMonth,
    };
  }
}
