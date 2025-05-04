import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillDTO, GetBillsInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

export type GetBillsOutputDTO = OutputDTO<ResponseListDTO<BillDTO>>;

export class GetBillsUseCase
  implements Usecase<GetBillsInputDTO, GetBillsOutputDTO>
{
  private constructor(private readonly billService: BillServiceGateway) {}

  public static create({ billService }: { billService: BillServiceGateway }) {
    return new GetBillsUseCase(billService);
  }

  public async execute(
    inputGetBills: GetBillsInputDTO,
  ): Promise<GetBillsOutputDTO> {
    if (!inputGetBills.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const bills = await this.billService.getBills({
      ...inputGetBills,
    });

    return {
      data: bills,
    };
  }
}
