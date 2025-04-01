import { firebaseConfig } from './firebaseConfig';

const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;

const ResetPasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`;

export { signInUrl, ResetPasswordUrl };
