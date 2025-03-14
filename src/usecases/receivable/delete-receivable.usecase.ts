import { DeleteReceivableInputDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type DeleteReceivableOutputDTO = void;

export class DeleteReceivableUseCase
  implements Usecase<DeleteReceivableInputDTO, DeleteReceivableOutputDTO>
{
  private constructor(private readonly receivableGateway: ReceivableGateway) {}

  public static create({
    receivableGateway,
  }: {
    receivableGateway: ReceivableGateway;
  }) {
    return new DeleteReceivableUseCase(receivableGateway);
  }

  public async execute({
    id: receivableId,
    userId,
  }: DeleteReceivableInputDTO): Promise<DeleteReceivableOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!receivableId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasReceivable = await this.receivableGateway.getReceivableById({
      id: receivableId,
      userId,
    });

    if (!hasReceivable) {
      throw new ApiError(ERROR_MESSAGES.RECEIVABLE_NOT_FOUND, 404);
    }

    await this.receivableGateway.deleteReceivable({
      id: receivableId,
      userId,
    });
  }
}
