export class ApiError extends Error {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super();

    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    this.statusCode = statusCode;

    Error.captureStackTrace(this);
  }
}
