export type ResponseListDTO<T> = {
  content: Array<T>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
