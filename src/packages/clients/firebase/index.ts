import * as admin from 'firebase-admin';
import { serviceAccountKey } from './serviceAccountKey';

if (process.env.NODE_ENV !== 'test') {
  if (
    !serviceAccountKey.projectId ||
    !serviceAccountKey.privateKey ||
    !serviceAccountKey.clientEmail
  ) {
    throw new Error('Configuração incompleta do Firebase Service Account');
  }
}

const clientFireBaseAdmin: admin.app.App = admin.initializeApp(
  process.env.NODE_ENV === 'test'
    ? {}
    : {
        credential: admin.credential.cert({
          projectId: serviceAccountKey.projectId,
          clientEmail: serviceAccountKey.clientEmail,
          privateKey: serviceAccountKey.privateKey,
        } as admin.ServiceAccount),
        databaseURL: `https://${serviceAccountKey.projectId}.firebaseio.com`,
        storageBucket: `${serviceAccountKey.projectId}.appspot.com`,
        serviceAccountId: serviceAccountKey.clientEmail,
      },
);

export * from './urlToAuthFirebase';
export { clientFireBaseAdmin };
