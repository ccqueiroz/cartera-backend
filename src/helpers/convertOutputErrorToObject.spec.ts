import { convertOutputErrorToObject } from './convertOutputErrorToObject';
import { ERROR_MESSAGES } from './errorMessages';
import { ApiError } from './errors';

describe('convert Output Error To Object', () => {
  it('should be return the error object converted when to provider the error instance of ApiError', () => {
    const error = new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 401);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 401,
    });
  });

  it('should be return the error null when dont provider the error instance of ApiError', () => {
    const error = {};

    expect(convertOutputErrorToObject(error as ApiError)).toBeNull();
  });
});
