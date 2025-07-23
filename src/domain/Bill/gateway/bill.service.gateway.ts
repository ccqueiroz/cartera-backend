import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import {
  BillDTO,
  BillsPayableMonthInputDTO,
  CreateBillInputDTO,
  CreateBillOutputDTO,
  DeleteBillInputDTO,
  EditBillInputDTO,
  GetBillByIdInputDTO,
  GetBillsInputDTO,
} from '../dtos/bill.dto';

export interface BillServiceGateway {
  getBills(input: GetBillsInputDTO): Promise<ResponseListDTO<BillDTO>>;

  getBillById({ id, userId }: GetBillByIdInputDTO): Promise<BillDTO | null>;

  createBill({
    billData,
    userId,
  }: CreateBillInputDTO): Promise<CreateBillOutputDTO | null>;

  updateBill({ billId, billData, userId }: EditBillInputDTO): Promise<BillDTO>;

  deleteBill({ id, userId }: DeleteBillInputDTO): Promise<void>;

  billsPayableMonth(
    input: BillsPayableMonthInputDTO,
  ): Promise<ResponseListDTO<BillDTO>>;
}
