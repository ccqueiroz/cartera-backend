import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import {
  ApplyPaginationGateway,
  InputDTO,
} from '@/domain/Helpers/gateway/applyPagination.gateway';

export class ApplyPaginationHelper implements ApplyPaginationGateway {
  execute<I, O, T>(input: InputDTO<I, O>, data: Array<T>): ResponseListDTO<T> {
    const { page, size, ordering } = input;

    try {
      if (size <= 0 || page < 0 || (!page && page !== 0) || !size)
        throw Error();

      const totalElements = data.length;

      const totalPages = Math.ceil(data.length / size);

      let content = [];

      if (page > 0) {
        content = data.slice(page * size, page * size + size);
      } else {
        content = data.slice(0, size);
      }

      const orderingKey = ordering
        ? (Object.keys(ordering)[0] as keyof O & keyof T)
        : undefined;

      return {
        content,
        totalElements,
        totalPages,
        page: Number(page),
        size: Number(size),
        ordering:
          orderingKey && ordering
            ? ({
                [orderingKey]: ordering[orderingKey] as SortOrder,
              } as { [K in keyof T]?: SortOrder })
            : null,
      };
    } catch {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        page: Number(page),
        size: Number(size),
        ordering: null,
      };
    }
  }
}
