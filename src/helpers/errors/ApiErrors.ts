export class ApiError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super();

    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    this.statusCode = statusCode;
    this.details = details;

    Error.captureStackTrace(this);
  }
}
