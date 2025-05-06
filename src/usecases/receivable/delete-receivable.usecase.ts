import { DeleteReceivableInputDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export type DeleteReceivableOutputDTO = void;

export class DeleteReceivableUseCase
  implements Usecase<DeleteReceivableInputDTO, DeleteReceivableOutputDTO>
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
  ) {}

  public static create({
    receivableService,
  }: {
    receivableService: ReceivableServiceGateway;
  }) {
    return new DeleteReceivableUseCase(receivableService);
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

    const hasReceivable = await this.receivableService.getReceivableById({
      id: receivableId,
      userId,
    });

    if (!hasReceivable) {
      throw new ApiError(ERROR_MESSAGES.RECEIVABLE_NOT_FOUND, 404);
    }

    await this.receivableService.deleteReceivable({
      id: receivableId,
      userId,
    });
  }
}
