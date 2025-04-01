export const serviceAccountKey = {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE ?? undefined,
  projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ?? undefined,
  privateKeyId:
    process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID ?? undefined,
  privateKey:
    process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n') ??
    undefined,
  clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL ?? undefined,
  clientId: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID ?? undefined,
  authUri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI ?? undefined,
  tokenUri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI ?? undefined,
  authProviderX509CertUrl:
    process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_URL ?? undefined,
  clientX509CertUrl:
    process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_URL ?? undefined,
  universeDomain:
    process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN ?? undefined,
};
