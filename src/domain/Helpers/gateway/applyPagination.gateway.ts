import { ResponseListDTO } from '../../dtos/responseListDto.dto';

export type InputDTO<I, O> = Pick<ResponseListDTO<I>, 'page' | 'size'> & {
  ordering?: O;
};

export interface ApplyPaginationGateway {
  execute<I, O, T>(input: InputDTO<I, O>, data: Array<T>): ResponseListDTO<T>;
}
