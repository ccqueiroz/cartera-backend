import { Scan } from '../dtos/cache.dto';

export interface CacheGateway {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  quit(): Promise<void>;
  providerIsAlreadyConected(): boolean;
  recover<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T, ttl: number): Promise<void>;
  delete(key: string | Array<string>): Promise<void>;
  deleteWithPattern(pattern: string): Promise<void>;
  scan(cursor: number, pattern: string): Promise<Scan>;
}
