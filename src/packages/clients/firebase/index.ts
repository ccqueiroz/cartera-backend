import firebase from 'firebase';
import firebaseConfig from './firebaseConfig.json';
import admin, { ServiceAccount } from 'firebase-admin';
import serviceAcconutKey from './serviceAccountKey.json';
// eslint-disable-next-line import/no-named-as-default-member
const clientFireBase: firebase.app.App = firebase.initializeApp(firebaseConfig);

const clientFireBaseAdmin: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAcconutKey as ServiceAccount),
});

export { clientFireBase, clientFireBaseAdmin };
