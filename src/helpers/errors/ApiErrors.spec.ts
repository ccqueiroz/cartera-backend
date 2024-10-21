import { ApiError } from './ApiErrors';

describe('ApiErrors', () => {
  it('should create an instance of ApiError with correct message and statusCode', () => {
    const message = 'Not Found';
    const statusCode = 404;

    const error = new ApiError(message, statusCode);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);

    expect(error.stack).toBeDefined();
  });

  it('should have correct prototype chain', () => {
    const error = new ApiError('Internal Server Error', 500);

    expect(Object.getPrototypeOf(error)).toBe(ApiError.prototype);
  });

  it('should correctly handle missing stack trace', () => {
    new ApiError('Bad Request', 400);

    Error.captureStackTrace = jest.fn();

    const newError = new ApiError('Test Error', 400);

    expect(Error.captureStackTrace).toHaveBeenCalledWith(newError);
  });
});
