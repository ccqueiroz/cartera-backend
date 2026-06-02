import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const FIREBASE_ERROR_CODES: Record<string, ErrorCode> = {
  'auth/too-many-requests': ErrorCode.TOO_MANY_REQUESTS,
  'auth/id-token-expired': ErrorCode.INVALID_CREDENTIALS,
  'auth/timeout': ErrorCode.TIMEOUT,
  'auth/invalid-email': ErrorCode.INVALID_EMAIL,
  'auth/user-disabled': ErrorCode.USER_DISABLED,
  'auth/user-not-found': ErrorCode.ACCOUNT_NOT_FOUND,
  'auth/email-already-in-use': ErrorCode.EMAIL_ALREADY_IN_USE,
  'auth/invalid-credential': ErrorCode.INVALID_CREDENTIALS,
  'auth/argument-error': ErrorCode.INVALID_CREDENTIALS,
  'auth/network-request-failed': ErrorCode.INTERNAL_SERVER_ERROR,
  INVALID_LOGIN_CREDENTIALS: ErrorCode.INVALID_CREDENTIALS,
  INVALID_ID_TOKEN: ErrorCode.INVALID_TOKEN,
  INVALID_REFRESH_TOKEN: ErrorCode.INVALID_TOKEN,
  TOKEN_EXPIRED: ErrorCode.INVALID_TOKEN,
  EMAIL_NOT_FOUND: ErrorCode.EMAIL_NOT_FOUND,
  INVALID_PASSWORD: ErrorCode.INVALID_CREDENTIALS,
  'not-found': ErrorCode.USER_NOT_FOUND,
};

function readString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === 'string' ? value : undefined;
}

function extractFirebaseCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const source = error as Record<string, unknown>;

  const code = readString(source, 'code');
  if (code && FIREBASE_ERROR_CODES[code]) return code;

  const message = readString(source, 'message');
  if (message && FIREBASE_ERROR_CODES[message]) return message;

  return code ?? message;
}

export function translateFirebaseError(error: unknown): never {
  const rawCode = extractFirebaseCode(error);
  const code =
    (rawCode ? FIREBASE_ERROR_CODES[rawCode] : undefined) ??
    ErrorCode.INTERNAL_SERVER_ERROR;
  throw new UnauthorizedError(code);
}
