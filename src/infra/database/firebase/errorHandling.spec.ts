import { ErrorsFirebase } from './errorHandling';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

describe('Error Handling Firebase', () => {
  it('should be throw an error with the correct HTTP message and code to auth/too-many-requests', () => {
    const error = { code: 'auth/too-many-requests' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.TOO_MANY_REQUESTS, 429),
    );
  });

  it('should be throw an error with the default message and code 500 when the code is not in errorsFirebase', () => {
    const error = { code: 'unknown-error' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/internal-error', () => {
    const error = {
      code: 'auth/internal-error',
      message: JSON.stringify({
        error: { message: 'INVALID_LOGIN_CREDENTIALS' },
      }),
    };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/id-token-expired', () => {
    const error = { code: 'auth/id-token-expired' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/email-already-in-use', () => {
    const error = { code: 'auth/email-already-in-use' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE, 400),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/network-request-failed', () => {
    const error = { code: 'auth/network-request-failed' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/invalid-email', () => {
    const error = { code: 'auth/invalid-email' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/user-disabled', () => {
    const error = { code: 'auth/user-disabled' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.USER_DISABLED, 400),
    );
  });

  it('should be throw an error with the correct HTTP message and code to auth/user-not-found', () => {
    const error = { code: 'auth/user-not-found' };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND, 404),
    );
  });

  it('should be throw an error with the correct HTTP message and code to INVALID_ID_TOKEN', () => {
    const error = {
      code: 'auth/internal-error',
      message: JSON.stringify({
        error: { message: 'INVALID_ID_TOKEN' },
      }),
    };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401),
    );
  });

  it('should be throw an error with the correct HTTP message and code to EMAIL_NOT_FOUND', () => {
    const error = {
      code: 'auth/internal-error',
      message: JSON.stringify({
        error: { message: 'EMAIL_NOT_FOUND' },
      }),
    };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.EMAIL_NOT_FOUND, 404),
    );
  });

  it('deve lançar erro genérico para auth/internal-error quando a mensagem for desconhecida', () => {
    const error = {
      code: 'auth/internal-error',
      message: JSON.stringify({
        error: { message: 'UNKNOWN_ERROR' },
      }),
    };

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
    );
  });

  it('deve lançar erro genérico caso o objeto de erro não contenha código', () => {
    const error = {};

    expect(() => ErrorsFirebase.presenterError(error)).toThrow(
      new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
    );
  });
});
