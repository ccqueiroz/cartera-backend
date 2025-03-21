import * as admin from 'firebase-admin';

import { clientFireBaseAdmin } from '@/packages/clients/firebase';

const dbFirestore: admin.firestore.Firestore = clientFireBaseAdmin.firestore();

const authFirebase: admin.auth.Auth = clientFireBaseAdmin.auth();

const adminFirebase: admin.app.App = clientFireBaseAdmin;

export { dbFirestore, authFirebase, adminFirebase };
