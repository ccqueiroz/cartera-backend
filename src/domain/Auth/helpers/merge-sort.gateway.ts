export interface MergeSortGateway {
  execute<T>(arr: Array<T>, key: keyof T, ascending: boolean): Array<T>;
}
