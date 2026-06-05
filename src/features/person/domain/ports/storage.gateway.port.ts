export interface StorageGateway {
  upload(path: string, buffer: Buffer, contentType: string): Promise<string>;
  delete(path: string): Promise<void>;
}
