import { Usecase } from '../usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { DeleteBillInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

export type DeleteBillOutputDTO = void;

export class DeleteBillUseCase
  implements Usecase<DeleteBillInputDTO, DeleteBillOutputDTO>
{
  private constructor(private readonly billService: BillServiceGateway) {}

  public static create({ billService }: { billService: BillServiceGateway }) {
    return new DeleteBillUseCase(billService);
  }

  public async execute({
    id: billId,
    userId,
  }: DeleteBillInputDTO): Promise<DeleteBillOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!billId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasBill = await this.billService.getBillById({
      id: billId,
      userId,
    });

    if (!hasBill) {
      throw new ApiError(ERROR_MESSAGES.BILL_NOT_FOUND, 404);
    }

    await this.billService.deleteBill({
      id: billId,
      userId,
    });
  }
}
