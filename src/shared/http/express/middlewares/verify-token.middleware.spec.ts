import { Request, Response } from 'express';
import { VerifyTokenMiddleware } from './verify-token.middleware';
import {
  ForbiddenError,
  UnauthorizedError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeRequest = (input: {
  authorization?: string;
  sessionCookie?: string;
}) =>
  ({
    headers: { authorization: input.authorization },
    cookies: input.sessionCookie ? { session: input.sessionCookie } : {},
  } as unknown as Request);

const run = async (
  request: Request,
  verifyToken: jest.Mock,
): Promise<{ next: jest.Mock; request: Request }> => {
  const next = jest.fn();
  const middleware = VerifyTokenMiddleware.create({ verifyToken });
  await middleware.getHandler()(request, {} as Response, next);
  return { next, request };
};

const USER = { userId: 'uid-1', email: 'a@b.com' };

describe('VerifyTokenMiddleware', () => {
  it('Bearer header wins when header and cookie are both present', async () => {
    const verifyToken = jest.fn(async () => USER);
    const request = makeRequest({
      authorization: 'Bearer token-do-header',
      sessionCookie: 'token-do-cookie',
    });

    await run(request, verifyToken);

    expect(verifyToken).toHaveBeenCalledWith({
      accessToken: 'token-do-header',
    });
  });

  it('falls back to the session cookie when there is no Bearer', async () => {
    const verifyToken = jest.fn(async () => USER);
    const request = makeRequest({ sessionCookie: 'token-do-cookie' });

    await run(request, verifyToken);

    expect(verifyToken).toHaveBeenCalledWith({
      accessToken: 'token-do-cookie',
    });
  });

  it('with no credential at all rejects with INVALID_TOKEN without calling the verifier', async () => {
    const verifyToken = jest.fn();
    const { next } = await run(makeRequest({}), verifyToken);

    expect(verifyToken).not.toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(ErrorCode.INVALID_TOKEN);
  });

  it('Authorization header that is not Bearer falls back to the cookie', async () => {
    const verifyToken = jest.fn(async () => USER);
    const request = makeRequest({
      authorization: 'Basic abc123',
      sessionCookie: 'token-do-cookie',
    });

    await run(request, verifyToken);

    expect(verifyToken).toHaveBeenCalledWith({
      accessToken: 'token-do-cookie',
    });
  });

  it('injeta request.user_auth = { userId, email } e segue o fluxo', async () => {
    const verifyToken = jest.fn(async () => USER);
    const { next, request } = await run(
      makeRequest({ authorization: 'Bearer ok' }),
      verifyToken,
    );

    expect(request.user_auth).toEqual({ userId: 'uid-1', email: 'a@b.com' });
    expect(next).toHaveBeenCalledWith();
  });

  it.each([
    ['TOKEN_EXPIRED', new UnauthorizedError(ErrorCode.TOKEN_EXPIRED)],
    ['INVALID_TOKEN', new UnauthorizedError(ErrorCode.INVALID_TOKEN)],
  ])(
    'verification failure %s propagates to ErrorMiddleware',
    async (_, thrown) => {
      const verifyToken = jest.fn(async () => {
        throw thrown;
      });
      const { next } = await run(
        makeRequest({ authorization: 'Bearer ruim' }),
        verifyToken,
      );

      expect(next).toHaveBeenCalledWith(thrown);
    },
  );

  it('disabled account propagates ForbiddenError (403, not 401)', async () => {
    const thrown = new ForbiddenError(ErrorCode.USER_DISABLED);
    const verifyToken = jest.fn(async () => {
      throw thrown;
    });
    const { next } = await run(
      makeRequest({ authorization: 'Bearer token' }),
      verifyToken,
    );

    expect(next).toHaveBeenCalledWith(thrown);
  });
});
