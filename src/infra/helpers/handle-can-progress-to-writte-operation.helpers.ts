import * as admin from 'firebase-admin';

import { HandleCanProgressToWriteOperationGateway } from '../database/firebase/core/gateway/handleCanProgressToWriteOperation.gateway';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
export class HandleCanProgressToWritteOperationHelper
  implements HandleCanProgressToWriteOperationGateway
{
  async execute(
    dbCollection: admin.firestore.CollectionReference<
      admin.firestore.DocumentData,
      admin.firestore.DocumentData
    >,
    itemId: string,
    userId: string,
  ): Promise<void> {
    const canUpdate = await dbCollection
      .doc(itemId)
      .get()
      .then((response) => response.exists && response.data()?.userId === userId)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!canUpdate) throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
  }
}
