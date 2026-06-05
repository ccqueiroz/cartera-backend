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
  it('Bearer header vence quando header e cookie estão presentes', async () => {
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

  it('cai pro cookie session quando não há Bearer', async () => {
    const verifyToken = jest.fn(async () => USER);
    const request = makeRequest({ sessionCookie: 'token-do-cookie' });

    await run(request, verifyToken);

    expect(verifyToken).toHaveBeenCalledWith({
      accessToken: 'token-do-cookie',
    });
  });

  it('sem credencial nenhuma rejeita com INVALID_TOKEN sem chamar o verifier', async () => {
    const verifyToken = jest.fn();
    const { next } = await run(makeRequest({}), verifyToken);

    expect(verifyToken).not.toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.code).toBe(ErrorCode.INVALID_TOKEN);
  });

  it('header Authorization que não é Bearer cai pro cookie', async () => {
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
    'falha de verificação %s propaga pro ErrorMiddleware',
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

  it('conta desativada propaga ForbiddenError (403, não 401)', async () => {
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
