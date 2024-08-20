import firebase from 'firebase';
import { clientFireBase } from '@/packages/clients/firebase';

const dbFirestore: firebase.firestore.Firestore = clientFireBase.firestore();

const authFirebase: firebase.auth.Auth = clientFireBase.auth();

export { dbFirestore, authFirebase };
