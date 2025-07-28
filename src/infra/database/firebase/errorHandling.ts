import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';

const errorsFirebase = {
  'auth/too-many-requests': {
    message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    httpCode: 429,
  },
  'auth/id-token-expired': {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  'auth/timeout': { message: ERROR_MESSAGES.TIMEOUT, httpCode: 500 },
  'auth/invalid-email': {
    message: ERROR_MESSAGES.INVALID_EMAIL,
    httpCode: 400,
  },
  'auth/user-disabled': {
    message: ERROR_MESSAGES.USER_DISABLED,
    httpCode: 400,
  },
  'auth/user-not-found': {
    message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
    httpCode: 404,
  },
  'auth/email-already-in-use': {
    message: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
    httpCode: 400,
  },
  'auth/invalid-credential': {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  'auth/argument-error': {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  'auth/network-request-failed': {
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    httpCode: 500,
  },
  INVALID_LOGIN_CREDENTIALS: {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  INVALID_ID_TOKEN: {
    message: ERROR_MESSAGES.INVALID_TOKEN,
    httpCode: 401,
  },
  INVALID_REFRESH_TOKEN: {
    message: ERROR_MESSAGES.INVALID_TOKEN,
    httpCode: 401,
  },
  TOKEN_EXPIRED: {
    message: ERROR_MESSAGES.INVALID_TOKEN,
    httpCode: 401,
  },
  EMAIL_NOT_FOUND: {
    message: ERROR_MESSAGES.EMAIL_NOT_FOUND,
    httpCode: 404,
  },
  'not-found': {
    message: ERROR_MESSAGES.USER_NOT_FOUND,
    httpCode: 404,
  },
} as const;

const errorsAuthUrlFirebase = {
  INVALID_LOGIN_CREDENTIALS: {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  EMAIL_NOT_FOUND: {
    message: ERROR_MESSAGES.EMAIL_NOT_FOUND,
    httpCode: 404,
  },
  INVALID_PASSWORD: {
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    httpCode: 401,
  },
  USER_DISABLED: {
    message: ERROR_MESSAGES.USER_DISABLED,
    httpCode: 400,
  },
} as const;

export class ErrorsFirebase {
  public static presenterError(error: object) {
    const parseError = JSON.parse(JSON.stringify(error) as unknown as string);

    if (parseError?.code === 'auth/internal-error') {
      const getMessageCode = JSON.parse(
        JSON.parse(JSON.stringify(error) as unknown as string)?.message,
      )?.error?.message;

      const getError = errorsFirebase[
        getMessageCode as keyof typeof errorsFirebase
      ] || {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        httpCode: 500,
      };

      throw new ApiError(
        getError.message,
        getError.httpCode,
        parseError?.details,
      );
    } else if (
      errorsAuthUrlFirebase[
        parseError?.message as keyof typeof errorsAuthUrlFirebase
      ]
    ) {
      const getError = errorsAuthUrlFirebase[
        parseError?.message as keyof typeof errorsAuthUrlFirebase
      ] || {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        httpCode: 500,
      };

      throw new ApiError(
        getError.message,
        getError.httpCode,
        parseError?.details,
      );
    } else {
      const getError = errorsFirebase[
        parseError?.code as keyof typeof errorsFirebase
      ] || {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        httpCode: 500,
      };
      throw new ApiError(
        getError.message,
        getError.httpCode,
        parseError?.details,
      );
    }
  }
}
