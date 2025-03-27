import * as admin from 'firebase-admin';

export interface HandleCanProgressToWriteOperationGateway {
  execute(
    dbCollection: admin.firestore.CollectionReference<
      admin.firestore.DocumentData,
      admin.firestore.DocumentData
    >,
    itemId: string,
    userId: string,
  ): Promise<void>;
}
