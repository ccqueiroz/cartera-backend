export interface GenerateHashGateway {
  execute<T>(input: T): string | null;
}
