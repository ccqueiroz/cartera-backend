import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO,
  DeleteReceivableInputDTO,
  EditReceivableInputDTO,
  GetReceivableByIdInputDTO,
  GetReceivablesInputDTO,
  ReceivableDTO,
} from '../dtos/receivable.dto';

export interface ReceivableRepositoryGateway {
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
}
