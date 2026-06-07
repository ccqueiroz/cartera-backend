import type { Request, Response } from 'express';
import { makePaymentMethodModule } from '@/features/payment-method/payment-method.factory';
import { Route } from '@/shared/http/route';
import { VerifyTokenMiddleware } from '@/shared/http/express/middlewares/verify-token.middleware';
import { ErrorMiddleware } from '@/shared/http/express/middlewares/error.middleware';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

const VALID_TOKEN = 'token-valido';

const sessionVerifier = {
  verifyToken: async (input: { accessToken: string }) => {
    if (input.accessToken !== VALID_TOKEN) {
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    }
    return { userId: 'uid-1', email: 'ana@example.com' };
  },
};

function makeFakeDb(): any {
  const query: any = {
    get: async () => ({ empty: true, docs: [] }),
  };
  query.where = () => query;
  query.orderBy = () => query;
  query.limit = () => query;
  return {
    collection: () => ({
      ...query,
      doc: () => ({
        set: async () => undefined,
        get: async () => ({ exists: false }),
      }),
    }),
  };
}

interface DispatchedResponse {
  statusCode: number;
  body: unknown;
}

function makeHarness() {
  const authMiddleware = VerifyTokenMiddleware.create(sessionVerifier);
  const routes = makePaymentMethodModule({ db: makeFakeDb(), authMiddleware });
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as LoggerGateway;
  const errorMiddleware = ErrorMiddleware.create(logger);

  const dispatch = async (
    method: string,
    path: string,
    input: {
      params?: Record<string, string>;
      body?: unknown;
      authorization?: string;
    } = {},
  ): Promise<DispatchedResponse> => {
    const route = routes.find(
      (candidate: Route) =>
        candidate.method === method && candidate.path === path,
    );
    if (!route) throw new Error(`rota ${method} ${path} não registrada`);

    const result: DispatchedResponse = { statusCode: 0, body: undefined };
    const response = {
      status(code: number) {
        result.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        result.body = payload;
        return this;
      },
      send() {
        return this;
      },
    } as unknown as Response;
    const request = {
      body: input.body ?? {},
      query: {},
      params: input.params ?? {},
      headers: { authorization: input.authorization },
      cookies: {},
    } as unknown as Request;

    try {
      for (const middleware of route.middlewares ?? []) {
        let middlewareError: Error | undefined;
        await middleware.getHandler()(request, response, ((error?: Error) => {
          middlewareError = error;
        }) as any);
        if (middlewareError) throw middlewareError;
      }
      await route.handler(request, response, jest.fn());
    } catch (error) {
      errorMiddleware.getHandler()(
        error as Error,
        request,
        response,
        jest.fn(),
      );
    }
    return result;
  };

  return { dispatch };
}

describe('payment-method e2e (guarda de autenticação via factory)', () => {
  const protectedRoutes: Array<[string, string]> = [
    ['get', 'payment-method'],
    ['get', 'payment-method/description/:descriptionEnum'],
    ['post', 'payment-method'],
    ['put', 'payment-method/:descriptionEnum'],
    ['delete', 'payment-method/:descriptionEnum'],
  ];

  it.each(protectedRoutes)(
    'sem credencial: %s %s responde 401 INVALID_TOKEN',
    async (method, path) => {
      const { dispatch } = makeHarness();
      const response = await dispatch(method, path);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    },
  );

  it('com sessão válida a leitura executa normalmente (200)', async () => {
    const { dispatch } = makeHarness();
    const response = await dispatch('get', 'payment-method', {
      authorization: `Bearer ${VALID_TOKEN}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('token inválido: 401 INVALID_TOKEN', async () => {
    const { dispatch } = makeHarness();
    const response = await dispatch('get', 'payment-method', {
      authorization: 'Bearer token-desconhecido',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });
});
