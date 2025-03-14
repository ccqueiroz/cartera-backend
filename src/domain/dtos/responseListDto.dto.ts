import { SortOrder } from './listParamsDto.dto';

export type ResponseListDTO<T> = {
  content: Array<T>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  ordering: { [K in keyof T]?: SortOrder } | null;
};
