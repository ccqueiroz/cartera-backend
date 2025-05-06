import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import {
  GetReceivablesInputDTO,
  ReceivableDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export type GetReceivablesOutputDTO = OutputDTO<ResponseListDTO<ReceivableDTO>>;

export class GetReceivablesUseCase
  implements Usecase<GetReceivablesInputDTO, GetReceivablesOutputDTO>
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
  ) {}

  public static create({
    receivableService,
  }: {
    receivableService: ReceivableServiceGateway;
  }) {
    return new GetReceivablesUseCase(receivableService);
  }

  public async execute(
    inputGetReceivables: GetReceivablesInputDTO,
  ): Promise<GetReceivablesOutputDTO> {
    if (!inputGetReceivables.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const receivables = await this.receivableService.getReceivables({
      ...inputGetReceivables,
    });

    return {
      data: receivables,
    };
  }
}
