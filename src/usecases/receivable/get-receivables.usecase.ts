import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import {
  GetReceivablesInputDTO,
  ReceivableDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetReceivablesOutputDTO = OutputDTO<ResponseListDTO<ReceivableDTO>>;

export class GetReceivablesUseCase
  implements Usecase<GetReceivablesInputDTO, GetReceivablesOutputDTO>
{
  private constructor(private readonly receivableGateway: ReceivableGateway) {}

  public static create({
    receivableGateway,
  }: {
    receivableGateway: ReceivableGateway;
  }) {
    return new GetReceivablesUseCase(receivableGateway);
  }

  public async execute(
    inputGetReceivables: GetReceivablesInputDTO,
  ): Promise<GetReceivablesOutputDTO> {
    if (!inputGetReceivables.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const receivables = await this.receivableGateway.getReceivables({
      ...inputGetReceivables,
    });

    return {
      data: receivables,
    };
  }
}
