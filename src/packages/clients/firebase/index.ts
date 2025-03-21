import * as admin from 'firebase-admin';
import serviceAcconutKey from './serviceAccountKey.json';

const clientFireBaseAdmin: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAcconutKey as admin.ServiceAccount),
});

export { clientFireBaseAdmin };
