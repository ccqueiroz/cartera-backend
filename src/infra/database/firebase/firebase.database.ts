import admin from 'firebase-admin';
import firebase from 'firebase';
import {
  clientFireBase,
  clientFireBaseAdmin,
} from '@/packages/clients/firebase';

const dbFirestore: firebase.firestore.Firestore = clientFireBase.firestore();

const authFirebase: firebase.auth.Auth = clientFireBase.auth();

const adminFirebase: admin.app.App = clientFireBaseAdmin;

export { dbFirestore, authFirebase, adminFirebase };
