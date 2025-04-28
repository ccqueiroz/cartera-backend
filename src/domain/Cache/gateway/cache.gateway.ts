export interface CacheGateway {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  quit(): Promise<void>;
  providerIsAlreadyConected(): boolean;
  recover<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
}
