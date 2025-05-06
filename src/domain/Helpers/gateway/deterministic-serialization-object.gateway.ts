export interface DeterministicSerializationObjectGateway {
  execute<T>(input: T): string | undefined;
}
