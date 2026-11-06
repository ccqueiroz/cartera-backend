export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export type Ordering = Record<string, SortOrder>;

export interface SortFilter {
  field: string;
  value: string;
}

export interface SearchByDate {
  field: string;
  initialDate?: string;
  finalDate?: string;
  exactlyDate?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  ordering?: Ordering;
  sort?: SortFilter;
  searchByDate?: SearchByDate;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  ordering: Ordering | null;
}
