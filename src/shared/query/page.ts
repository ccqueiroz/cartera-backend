export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}
