export interface ResponseAdapter<T> {
  success: boolean;
  error?: string;
  data?: T;
  code?: number;
}
