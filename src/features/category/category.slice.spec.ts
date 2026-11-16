import type { Request, Response } from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { makeCategoryModule } from '@/features/category/category.factory';
import { CategoryDescriptionEnum } from '@/features/category/domain/enums/category-description.enum';
import { GetCategoryByEnumRoute } from '@/features/category/infra/http/get-category-by-enum.route';
import { Route } from '@/shared/http/route';
import { VerifyTokenMiddleware } from '@/shared/http/express/middlewares/verify-token.middleware';
import { ErrorMiddleware } from '@/shared/http/express/middlewares/error.middleware';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { LoggerGateway } from '@/shared/logger/logger.gateway';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

const VALID_TOKEN = 'token-valido';

const sessionVerifier = {
  verifyToken: async (input: { accessToken: string }) => {
    if (input.accessToken !== VALID_TOKEN) {
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    }
    return { userId: 'uid-1', email: 'ana@example.com' };
  },
};

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

interface DispatchedResponse {
  statusCode: number;
  body: unknown;
}

function makeHarness() {
  const authMiddleware = VerifyTokenMiddleware.create(sessionVerifier);
  const module = makeCategoryModule({ db, authMiddleware });
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
      query?: Record<string, string>;
      params?: Record<string, string>;
      body?: unknown;
      authorization?: string;
    } = {},
  ): Promise<DispatchedResponse> => {
    const route = module.routes.find(
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
      query: input.query ?? {},
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

  return { dispatch, module };
}

describe('category e2e (authentication guard via factory)', () => {
  const protectedRoutes: Array<[string, string]> = [
    ['get', 'category'],
    ['get', 'category/:description_enum'],
    ['get', 'category/group'],
    ['get', 'category/group/:group'],
    ['post', 'category'],
    ['put', 'category/:description_enum'],
    ['delete', 'category/:description_enum'],
  ];

  it.each(protectedRoutes)(
    'no credential: %s %s responds 401 INVALID_TOKEN',
    async (method, path) => {
      const { dispatch } = makeHarness();
      const response = await dispatch(method, path);

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    },
  );

  it('with a valid session the read runs normally (200)', async () => {
    const { dispatch } = makeHarness();
    const response = await dispatch('get', 'category', {
      query: { type: 'BILLS' },
      authorization: `Bearer ${VALID_TOKEN}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it('invalid token: 401 INVALID_TOKEN', async () => {
    const { dispatch } = makeHarness();
    const response = await dispatch('get', 'category', {
      query: { type: 'BILLS' },
      authorization: 'Bearer token-desconhecido',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });
});

describe('category route by enum (the description_enum path param)', () => {
  // Found by class, not by path: a path change then fails an assertion instead of throwing in dispatch, outside its try.
  const byEnumPath = (routes: Route[]): string =>
    routes.find((route) => route instanceof GetCategoryByEnumRoute)?.path ?? '';

  it('[PDR-08] the category route by enum answers 400 to the old descriptionEnum param name', async () => {
    const { dispatch, module } = makeHarness();
    const response = await dispatch('get', byEnumPath(module.routes), {
      params: { descriptionEnum: CategoryDescriptionEnum.UBER },
      authorization: `Bearer ${VALID_TOKEN}`,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: ErrorCode.VALIDATION_FAILED,
      message: expect.stringContaining(
        errorCatalog[ErrorCode.PROPERTY_SHOULD_NOT_EXIST]({
          attribute: 'descriptionEnum',
        }),
      ),
    });
  });

  it('[PDR-08] the category route by enum takes a valid description_enum to the lookup', async () => {
    const { dispatch, module } = makeHarness();
    const response = await dispatch('get', byEnumPath(module.routes), {
      params: { description_enum: CategoryDescriptionEnum.UBER },
      authorization: `Bearer ${VALID_TOKEN}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      code: ErrorCode.CATEGORY_NOT_FOUND,
      message: errorCatalog[ErrorCode.CATEGORY_NOT_FOUND]({
        descriptionEnum: CategoryDescriptionEnum.UBER,
      }),
    });
  });
});
