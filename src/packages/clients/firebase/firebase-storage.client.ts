import { Bucket } from '@google-cloud/storage';
import { crypto } from '@/packages/clients/crypto';

/**
 * ACL sobre o Firebase Storage. URL via token de download (e não signed URL):
 * signed URL v4 expira em no máximo 7 dias e o avatarUrl persistido precisa
 * valer indefinidamente.
 */
export class FirebaseStorageClient {
  private constructor(private readonly bucket: Bucket) {}

  public static create(bucket: Bucket): FirebaseStorageClient {
    return new FirebaseStorageClient(bucket);
  }

  public async upload(
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const downloadToken = crypto.randomUUID();
    await this.bucket.file(path).save(buffer, {
      contentType,
      resumable: false,
      metadata: {
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });
    return `https://firebasestorage.googleapis.com/v0/b/${
      this.bucket.name
    }/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
  }

  public async delete(path: string): Promise<void> {
    await this.bucket.file(path).delete({ ignoreNotFound: true });
  }
}
