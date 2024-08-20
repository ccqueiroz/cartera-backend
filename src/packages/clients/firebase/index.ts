import firebase from 'firebase';
import firebaseConfig from './firebaseConfig.json';

// eslint-disable-next-line import/no-named-as-default-member
const clientFireBase: firebase.app.App = firebase.initializeApp(firebaseConfig);

export { clientFireBase };
