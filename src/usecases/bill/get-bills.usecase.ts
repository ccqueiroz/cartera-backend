import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { BillDTO, GetBillsInputDTO } from '@/domain/Bill/dtos/bill.dto';

export type GetBillsOutputDTO = OutputDTO<ResponseListDTO<BillDTO>>;

export class GetBillsUseCase
  implements Usecase<GetBillsInputDTO, GetBillsOutputDTO>
{
  private constructor(private readonly billGateway: BillGateway) {}

  public static create({ billGateway }: { billGateway: BillGateway }) {
    return new GetBillsUseCase(billGateway);
  }

  public async execute(
    inputGetBills: GetBillsInputDTO,
  ): Promise<GetBillsOutputDTO> {
    if (!inputGetBills.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const bills = await this.billGateway.getBills({
      ...inputGetBills,
    });

    return {
      data: bills,
    };
  }
}
