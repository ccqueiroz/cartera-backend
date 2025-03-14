export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export type SearchByDate = {
  initialDate?: number;
  finalDate?: number;
  exactlyDate?: number;
};

export type PaginationParams<T> = {
  page: number;
  size: number;
  ordering?: SortOrder;
  searchByDate?: SearchByDate;
  sort?: T;
};
