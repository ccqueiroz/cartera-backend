import { Request, Response } from 'express';
import { ErrorMiddleware } from './error.middleware';
import {
  BusinessRuleViolationError,
  DuplicateEntityError,
  EntityNotFoundError,
  ForbiddenError,
  PayloadTooLargeError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { HttpStatus } from '@/shared/http/http-status';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

const makeResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return response as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const makeLogger = () =>
  ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as LoggerGateway & { error: jest.Mock });

const run = (error: Error) => {
  const logger = makeLogger();
  const response = makeResponse();
  ErrorMiddleware.create(logger).getHandler()(
    error,
    {} as Request,
    response,
    jest.fn(),
  );
  return { logger, response };
};

describe('ErrorMiddleware', () => {
  const cases: [InstanceType<typeof ValidationError>, HttpStatus][] = [
    [new ValidationError(ErrorCode.VALIDATION_FAILED), HttpStatus.BAD_REQUEST],
    [new UnauthorizedError(ErrorCode.INVALID_TOKEN), HttpStatus.UNAUTHORIZED],
    [new ForbiddenError(ErrorCode.USER_DISABLED), HttpStatus.FORBIDDEN],
    [
      new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND),
      HttpStatus.NOT_FOUND,
    ],
    [
      new DuplicateEntityError(ErrorCode.CATEGORY_ALREADY_EXISTS),
      HttpStatus.CONFLICT,
    ],
    [
      new PayloadTooLargeError(ErrorCode.AVATAR_TOO_LARGE),
      HttpStatus.PAYLOAD_TOO_LARGE,
    ],
    [
      new BusinessRuleViolationError(
        ErrorCode.CATEGORY_DESCRIPTION_ENUM_IMMUTABLE,
      ),
      HttpStatus.UNPROCESSABLE_ENTITY,
    ],
  ];

  it.each(cases)(
    'mapeia cada subclasse para o próprio status (%s)',
    (error, expectedStatus) => {
      const { response } = run(error);
      expect(response.status).toHaveBeenCalledWith(expectedStatus);
    },
  );

  it('resolve a mensagem PT pelo code do erro de domínio e expõe o code no body', () => {
    const error = new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
      descriptionEnum: 'UBER',
    });
    const { response } = run(error);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      message: errorCatalog[ErrorCode.CATEGORY_NOT_FOUND]({
        descriptionEnum: 'UBER',
      }),
      code: ErrorCode.CATEGORY_NOT_FOUND,
    });
  });

  it('code discrimina erros sob o mesmo status (TOKEN_EXPIRED vs INVALID_TOKEN)', () => {
    const expired = run(new UnauthorizedError(ErrorCode.TOKEN_EXPIRED));
    const invalid = run(new UnauthorizedError(ErrorCode.INVALID_TOKEN));
    expect(expired.response.status).toHaveBeenCalledWith(
      HttpStatus.UNAUTHORIZED,
    );
    expect(invalid.response.status).toHaveBeenCalledWith(
      HttpStatus.UNAUTHORIZED,
    );
    expect(expired.response.json.mock.calls[0][0].code).toBe(
      ErrorCode.TOKEN_EXPIRED,
    );
    expect(invalid.response.json.mock.calls[0][0].code).toBe(
      ErrorCode.INVALID_TOKEN,
    );
  });

  it('força INTERNAL_SERVER_ERROR para não-DomainError', () => {
    const { response } = run(new Error('boom'));
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      message: errorCatalog[ErrorCode.INTERNAL_SERVER_ERROR](),
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    });
  });

  it('loga stack mas nunca vaza stack/erro cru no body', () => {
    const error = new Error('segredo interno');
    const { logger, response } = run(error);
    expect(logger.error).toHaveBeenCalledTimes(1);
    const body = response.json.mock.calls[0][0];
    expect(JSON.stringify(body)).not.toContain('segredo interno');
    expect(JSON.stringify(body)).not.toContain('stack');
  });
});
