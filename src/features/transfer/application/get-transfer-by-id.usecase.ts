import { TransferOutput } from '@/features/transfer/domain/transfer.entity';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface GetTransferByIdInput {
  userId: string;
  id: string;
}

export class GetTransferByIdUseCase {
  private constructor(private readonly repository: TransferRepository) {}

  public static create(repository: TransferRepository): GetTransferByIdUseCase {
    return new GetTransferByIdUseCase(repository);
  }

  public async execute(input: GetTransferByIdInput): Promise<TransferOutput> {
    const transfer = await this.repository.findById(input.id, input.userId);
    if (!transfer) throw new EntityNotFoundError(ErrorCode.TRANSFER_NOT_FOUND);
    return transfer.toOutput();
  }
}
