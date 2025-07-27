import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO,
  DeleteReceivableInputDTO,
  EditReceivableInputDTO,
  GetReceivableByIdInputDTO,
  GetReceivablesInputDTO,
  QueryReceivablesByFilterInputDTO,
  ReceivableDTO,
  ReceivablesByMonthInputDTO,
} from '../dtos/receivable.dto';

export interface ReceivableServiceGateway {
  getReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>>;

  getReceivableById({
    id,
    userId,
  }: GetReceivableByIdInputDTO): Promise<ReceivableDTO | null>;

  createReceivable({
    receivableData,
    userId,
  }: CreateReceivableInputDTO): Promise<CreateReceivableOutputDTO | null>;

  updateReceivable({
    receivableId,
    receivableData,
    userId,
  }: EditReceivableInputDTO): Promise<ReceivableDTO>;

  deleteReceivable({ id, userId }: DeleteReceivableInputDTO): Promise<void>;

  receivablesByMonth(
    input: ReceivablesByMonthInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>>;

  totalAmountReceivables(receivables: Array<ReceivableDTO>): number;

  handleQueryReceivablesByFilters({
    period,
    userId,
    filters,
  }: QueryReceivablesByFilterInputDTO): Promise<ResponseListDTO<ReceivableDTO>>;
}
