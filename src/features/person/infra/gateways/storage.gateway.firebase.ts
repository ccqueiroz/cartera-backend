import { StorageGateway } from '@/features/person/domain/ports/storage.gateway.port';
import { FirebaseStorageClient } from '@/packages/clients/firebase/firebase-storage.client';

export class StorageGatewayFirebase implements StorageGateway {
  private constructor(private readonly storageClient: FirebaseStorageClient) {}

  public static create(
    storageClient: FirebaseStorageClient,
  ): StorageGatewayFirebase {
    return new StorageGatewayFirebase(storageClient);
  }

  public upload(
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    return this.storageClient.upload(path, buffer, contentType);
  }

  public delete(path: string): Promise<void> {
    return this.storageClient.delete(path);
  }
}
