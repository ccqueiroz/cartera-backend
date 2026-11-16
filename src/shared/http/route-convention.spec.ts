import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, join, basename, dirname } from 'path';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { BalanceWarning } from '@/shared/kernel/value-objects/balance-warnings';

const srcDir = resolve(__dirname, '../..');
const featuresDir = resolve(srcDir, 'features');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const routeFiles = walk(featuresDir).filter((file) =>
  /[\\/]infra[\\/]http[\\/].*\.route\.ts$/.test(file),
);

const featureOf = (file: string): string =>
  file.split(/[\\/]features[\\/]/)[1].split(/[\\/]/)[0];

const routesFileFor = (file: string): string => {
  const feature = featureOf(file);
  return resolve(featuresDir, feature, 'infra/http', `${feature}.routes.ts`);
};

const BODY_METHODS = ['post', 'put', 'patch'];
const VALIDATION =
  /\b(assertValid|assertAuthInputValid|runValidate)\(\s*\w+Schema\b/;

interface RouteParts {
  method?: string;
  path?: string;
  handler?: string;
  controllerFile?: string;
  handlerBody?: string;
}

const controllerFileOf = (
  file: string,
  content: string,
): string | undefined => {
  const type = content.match(/\bcontroller:\s*(\w+Controller)\b/)?.[1];
  const from =
    type &&
    content.match(
      new RegExp(
        `import\\s*\\{[^}]*\\b${type}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
      ),
    )?.[1];
  if (!from) return undefined;
  const controllerFile = resolve(
    dirname(file),
    `${from.replace(/^@\//, `${srcDir}/`)}.ts`,
  );
  return existsSync(controllerFile) ? controllerFile : undefined;
};

// ponytail: reads the body and the validation call as text in the handler body; destructuring req or a call inside a comment fools it; move to the TypeScript AST if that shows up.
const handlerBodyOf = (
  controllerFile: string,
  handler: string,
): string | undefined => {
  const content = readFileSync(controllerFile, 'utf8');
  const start = content.indexOf(`public ${handler} =`);
  if (start < 0) return undefined;
  const rest = content.slice(start);
  const end = rest.search(/\n {2}public |\n}/);
  return end < 0 ? rest : rest.slice(0, end);
};

const readRoute = (file: string): RouteParts => {
  const content = readFileSync(file, 'utf8');
  const handler = content.match(/this\.handler\s*=\s*controller\.(\w+)/)?.[1];
  const controllerFile = controllerFileOf(file, content);
  return {
    method: content.match(
      /\bmethod\b[^=;]*=\s*['"](get|post|put|patch|delete)['"]/,
    )?.[1],
    path: content.match(/\bpath\b[^=;\n]*=\s*['"]([^'"]+)['"]/)?.[1],
    handler,
    controllerFile,
    handlerBody:
      handler && controllerFile
        ? handlerBodyOf(controllerFile, handler)
        : undefined,
  };
};

const routesWithBody = routeFiles.filter((file) => {
  const { method, handlerBody } = readRoute(file);
  return (
    BODY_METHODS.includes(method ?? '') &&
    /\breq\.body\b/.test(handlerBody ?? '')
  );
});

describe('route convention', () => {
  it('finds at least one route file', () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it.each(routeFiles)(
    '%s declares method, path, handler and controller',
    (file) => {
      expect(readRoute(file)).toEqual({
        method: expect.any(String),
        path: expect.any(String),
        handler: expect.any(String),
        controllerFile: expect.any(String),
        handlerBody: expect.any(String),
      });
    },
  );

  it.each(routeFiles)('%s carries an @swagger block', (file) => {
    expect(readFileSync(file, 'utf8')).toContain('@swagger');
  });

  it.each(routeFiles)('%s is registered in its <feature>.routes.ts', (file) => {
    const routesFile = routesFileFor(file);
    expect(existsSync(routesFile)).toBe(true);

    const moduleName = basename(file, '.ts');
    expect(readFileSync(routesFile, 'utf8')).toContain(moduleName);
  });

  it('finds at least one route with a body', () => {
    expect(routesWithBody.length).toBeGreaterThan(0);
  });

  it.each(routesWithBody)(
    '%s validates the request body in its controller',
    (file) => {
      expect(readRoute(file).handlerBody).toMatch(VALIDATION);
    },
  );
});

type OpenApiParameter = { in?: string; name?: string; required?: boolean };
type OpenApiOperation = { parameters?: OpenApiParameter[] };
type OpenApiDocument = {
  paths?: Partial<Record<string, Partial<Record<string, OpenApiOperation>>>>;
};

const openapi: OpenApiDocument = JSON.parse(
  readFileSync(resolve(__dirname, 'swagger/openapi.json'), 'utf8'),
);

const EXPRESS_PATH_PARAM = /:(\w+)/g;

const operationOf = (file: string): OpenApiOperation | undefined => {
  const { method, path } = readRoute(file);
  if (!method || !path) return undefined;
  const openApiPath = `/api/${path.replace(EXPRESS_PATH_PARAM, '{$1}')}`;
  return openapi.paths?.[openApiPath]?.[method];
};

const nonReceivableRoutesWithBody = routesWithBody.filter(
  (file) => !file.endsWith('-receivable.route.ts'),
);

const receivableRoutesWithBody = routesWithBody.filter((file) =>
  file.endsWith('-receivable.route.ts'),
);

const guardedRoutes = routeFiles.filter((file) => {
  const routeClass = readFileSync(file, 'utf8').match(
    /\bexport class (\w+)/,
  )?.[1];
  const routesFile = routesFileFor(file);
  return (
    routeClass !== undefined &&
    existsSync(routesFile) &&
    new RegExp(`\\b${routeClass}\\.create\\(\\s*\\w+\\s*,`).test(
      readFileSync(routesFile, 'utf8'),
    )
  );
});

describe('[BK2-11] route classes against openapi.json', () => {
  it.each(routeFiles)(
    '%s has its OpenAPI path, verb and path params',
    (file) => {
      const pathParams = Array.from(
        (readRoute(file).path ?? '').matchAll(EXPRESS_PATH_PARAM),
        (match) =>
          expect.objectContaining({
            in: 'path',
            name: match[1],
            required: true,
          }),
      );
      const operation = operationOf(file);

      expect(operation).toBeDefined();
      expect(operation?.parameters ?? []).toEqual(
        expect.arrayContaining(pathParams),
      );
    },
  );

  it.each(nonReceivableRoutesWithBody)(
    '%s declares the request body',
    (file) => {
      expect(operationOf(file)).toHaveProperty([
        'requestBody',
        'content',
        'application/json',
        'schema',
      ]);
    },
  );

  it.each(receivableRoutesWithBody)(
    '%s declares the receivable request body',
    (file) => {
      expect(operationOf(file)).toHaveProperty([
        'requestBody',
        'content',
        'application/json',
        'schema',
      ]);
    },
  );

  it.each(routesWithBody)('%s declares the 400 response', (file) => {
    expect(operationOf(file)).toHaveProperty(['responses', '400']);
  });

  it.each(guardedRoutes)(
    '%s declares security and the 401 response',
    (file) => {
      const operation = operationOf(file);

      expect(operation).toHaveProperty('security', [{ sessionCookieAuth: [] }]);
      expect(operation).toHaveProperty(['responses', '401']);
    },
  );
});

type OpenApiSchema = {
  $ref?: string;
  type?: string;
  required?: string[];
  properties?: Partial<Record<string, OpenApiSchema>>;
  allOf?: OpenApiSchema[];
  enum?: string[];
};
type OpenApiResponse = {
  $ref?: string;
  description?: string;
  content?: Partial<Record<string, { schema?: OpenApiSchema }>>;
};
type OpenApiComponents = {
  schemas?: Partial<Record<string, OpenApiSchema>>;
  responses?: Partial<Record<string, OpenApiResponse>>;
  parameters?: Partial<Record<string, OpenApiParameter>>;
};

const RESPONSES_REF = '#/components/responses/';
const ERROR_RESPONSE_REF = '#/components/schemas/ErrorResponse';

const componentsOf = (document: OpenApiDocument): OpenApiComponents =>
  (document as OpenApiDocument & { components?: OpenApiComponents })
    .components ?? {};

const responseOf = (
  response: OpenApiResponse | undefined,
): OpenApiResponse | undefined =>
  response?.$ref?.startsWith(RESPONSES_REF)
    ? componentsOf(openapi).responses?.[
        response.$ref.slice(RESPONSES_REF.length)
      ]
    : response;

const errorCodesOf = (
  response: OpenApiResponse | undefined,
): string[] | undefined =>
  responseOf(response)?.content?.['application/json']?.schema?.allOf?.find(
    (part) => part.properties?.code?.enum,
  )?.properties?.code?.enum;

const SHARED_ERROR_RESPONSES: [string, ErrorCode[]][] = [
  ['Unauthorized', [ErrorCode.INVALID_TOKEN, ErrorCode.TOKEN_EXPIRED]],
  ['UserDisabled', [ErrorCode.USER_DISABLED]],
  ['InternalServerError', [ErrorCode.INTERNAL_SERVER_ERROR]],
  ['ValidationFailed', [ErrorCode.VALIDATION_FAILED]],
  ['WalletNotFound', [ErrorCode.WALLET_NOT_FOUND]],
];

describe('[BK2-54] shared contract components', () => {
  it('declares ErrorResponse with message and code required as strings', () => {
    const errorResponse = componentsOf(openapi).schemas?.ErrorResponse;

    expect(errorResponse).toEqual(
      expect.objectContaining({
        type: 'object',
        properties: {
          message: expect.objectContaining({ type: 'string' }),
          code: expect.objectContaining({ type: 'string' }),
        },
      }),
    );
    expect([...(errorResponse?.required ?? [])].sort()).toEqual([
      'code',
      'message',
    ]);
  });

  it.each(SHARED_ERROR_RESPONSES)(
    '%s is the ErrorResponse with the code enum %j',
    (name, codes) => {
      const response = responseOf({ $ref: `${RESPONSES_REF}${name}` });
      const enumCodes = errorCodesOf(response) ?? [];

      expect(response?.description).toEqual(expect.any(String));
      expect(response?.content?.['application/json']?.schema?.allOf).toEqual(
        expect.arrayContaining([{ $ref: ERROR_RESPONSE_REF }]),
      );
      expect([...enumCodes].sort()).toEqual([...codes].sort());
      expect(Object.values(ErrorCode)).toEqual(
        expect.arrayContaining(enumCodes),
      );
    },
  );
});

const PAGINATION_PARAMETERS: [string, string][] = [
  ['Page', 'page'],
  ['Size', 'size'],
  ['DirectionOrder', 'direction_order'],
  ['SortValue', 'sort_value'],
  ['SearchByDateValue', 'search_by_date_value'],
];

describe('[BK2-54] shared page and list components', () => {
  it('declares PageMeta with the five page fields required', () => {
    const required = componentsOf(openapi).schemas?.PageMeta?.required ?? [];

    expect([...required].sort()).toEqual([
      'ordering',
      'page',
      'size',
      'totalElements',
      'totalPages',
    ]);
  });

  it('declares BalanceWarning with the kernel enum values', () => {
    expect(componentsOf(openapi).schemas?.BalanceWarning?.enum).toEqual(
      Object.values(BalanceWarning),
    );
  });

  it('declares WalletBalanceView with id and balance required', () => {
    const required =
      componentsOf(openapi).schemas?.WalletBalanceView?.required ?? [];

    expect([...required].sort()).toEqual(['balance', 'id']);
  });

  it.each(PAGINATION_PARAMETERS)(
    '%s is the query parameter %s',
    (component, name) => {
      expect(componentsOf(openapi).parameters?.[component]).toEqual(
        expect.objectContaining({ in: 'query', name }),
      );
    },
  );
});

const expectRouteContract = (file: string): void => {
  const operation = operationOf(file) as
    | { responses?: Partial<Record<string, OpenApiResponse>> }
    | undefined;

  expect(operation).toBeDefined();
  expect(operation?.responses).toHaveProperty('500');
  Object.entries(operation?.responses ?? {}).forEach(([status, ref]) => {
    const response = responseOf(ref);
    const schema = response?.content?.['application/json']?.schema;
    const codes = errorCodesOf(response) ?? [];

    if (/^[45]/.test(status)) {
      expect(schema?.allOf).toContainEqual({ $ref: ERROR_RESPONSE_REF });
      expect(codes.length).toBeGreaterThan(0);
      expect(Object.values(ErrorCode)).toEqual(expect.arrayContaining(codes));
    }
    if (/^20[012]$/.test(status)) {
      expect(schema?.properties).toHaveProperty('data');
      expect(schema?.required).toContain('data');
    }
    if (status === '204') {
      expect(response).not.toHaveProperty('content');
    }
  });
};

const expectControllerEnvelope = (file: string): void => {
  const content = readFileSync(file, 'utf8');

  expect(content.match(/\.json\(\s*\{\s*data\s*:/g)?.length ?? 0).toBe(
    content.match(/\.json\(/g)?.length ?? 0,
  );
};

const CORE_FINANCE_CONTROLLERS = [
  'core-finance/bills/infra/http/bill.controller.ts',
  'core-finance/receivables/infra/http/receivable.controller.ts',
];

describe('[BK2-54] core-finance controllers and the bill delete route', () => {
  it.each(CORE_FINANCE_CONTROLLERS)(
    '%s wraps every json body in data',
    (file) => {
      expectControllerEnvelope(resolve(featuresDir, file));
    },
  );

  it('delete-bill.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'core-finance/infra/http/delete-bill.route.ts'),
    );
  });
});

describe('[BK2-54] bill edit and read routes', () => {
  it.each([
    'core-finance/infra/http/edit-bill.route.ts',
    'core-finance/infra/http/get-bill-by-id.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] bill reverse and settle routes', () => {
  it.each([
    'core-finance/infra/http/reverse-bill.route.ts',
    'core-finance/infra/http/settle-bill.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] bill global settle and create routes', () => {
  it.each([
    'core-finance/infra/http/global-settle-bill.route.ts',
    'core-finance/infra/http/create-bill.route.ts',
    'core-finance/infra/http/create-installment-bill.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] bill list routes', () => {
  it.each([
    'core-finance/infra/http/list-bills.route.ts',
    'core-finance/infra/http/list-unpaid-bills-by-period.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] receivable item routes', () => {
  it.each([
    'core-finance/infra/http/create-receivable.route.ts',
    'core-finance/infra/http/create-installment-receivable.route.ts',
    'core-finance/infra/http/edit-receivable.route.ts',
    'core-finance/infra/http/delete-receivable.route.ts',
    'core-finance/infra/http/get-receivable-by-id.route.ts',
    'core-finance/infra/http/settle-receivable.route.ts',
    'core-finance/infra/http/global-settle-receivable.route.ts',
    'core-finance/infra/http/reverse-receivable.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] receivable list routes', () => {
  it.each([
    'core-finance/infra/http/list-receivables.route.ts',
    'core-finance/infra/http/list-unreceived-receivables-by-period.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] wallet controller and the wallet read and delete routes', () => {
  it('wallet.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'wallet/infra/http/wallet.controller.ts'),
    );
  });

  it.each([
    'wallet/infra/http/get-wallet-by-id.route.ts',
    'wallet/infra/http/delete-wallet.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] wallet create and edit routes', () => {
  it.each([
    'wallet/infra/http/create-wallet.route.ts',
    'wallet/infra/http/edit-wallet.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] wallet adjust balance route', () => {
  it('adjust-balance.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'wallet/infra/http/adjust-balance.route.ts'),
    );
  });
});

describe('[BK2-54] wallet statement route', () => {
  it('wallet-statement.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'wallet/infra/http/wallet-statement.route.ts'),
    );
  });
});

describe('[BK2-54] wallet list route', () => {
  it('list-wallets.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'wallet/infra/http/list-wallets.route.ts'),
    );
  });
});

describe('[BK2-54] transfer controller and the transfer read and create routes', () => {
  it('transfer.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'transfer/infra/http/transfer.controller.ts'),
    );
  });

  it.each([
    'transfer/infra/http/get-transfer-by-id.route.ts',
    'transfer/infra/http/create-transfer.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] transfer list route', () => {
  it('list-transfers.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'transfer/infra/http/list-transfers.route.ts'),
    );
  });
});

describe('[BK2-54] category controller and the category read routes', () => {
  it('category.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'category/infra/http/category.controller.ts'),
    );
  });

  it.each([
    'category/infra/http/list-categories-by-type.route.ts',
    'category/infra/http/get-category-by-enum.route.ts',
    'category/infra/http/list-groups-by-type.route.ts',
    'category/infra/http/list-categories-by-group.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] category write routes', () => {
  it.each([
    'category/infra/http/create-category.route.ts',
    'category/infra/http/update-category.route.ts',
    'category/infra/http/delete-category.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] payment method controller and the read and delete routes', () => {
  it('payment-method.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(
        featuresDir,
        'payment-method/infra/http/payment-method.controller.ts',
      ),
    );
  });

  it.each([
    'payment-method/infra/http/list-payment-methods.route.ts',
    'payment-method/infra/http/get-payment-method-by-enum.route.ts',
    'payment-method/infra/http/delete-payment-method.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] payment method write routes and payment status', () => {
  it('payment-status.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(
        featuresDir,
        'payment-status/infra/http/payment-status.controller.ts',
      ),
    );
  });

  it.each([
    'payment-method/infra/http/create-payment-method.route.ts',
    'payment-method/infra/http/update-payment-method.route.ts',
    'payment-status/infra/http/list-payment-statuses.route.ts',
    'payment-status/infra/http/get-payment-status-by-enum.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] auth controller and the register route', () => {
  it('auth.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'auth/infra/http/auth.controller.ts'),
    );
  });

  it('register-account.route.ts declares every status with its contract', () => {
    expectRouteContract(
      resolve(featuresDir, 'auth/infra/http/register-account.route.ts'),
    );
  });
});

describe('[BK2-54] login and session refresh routes', () => {
  it.each([
    'auth/infra/http/login.route.ts',
    'auth/infra/http/refresh-session.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] signout, password recovery and health routes', () => {
  it('health.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'health/infra/http/health.controller.ts'),
    );
  });

  it.each([
    'auth/infra/http/signout.route.ts',
    'auth/infra/http/recover-password.route.ts',
    'health/infra/http/health.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] person controller and the read and delete routes', () => {
  it('person.controller.ts wraps every json body in data', () => {
    expectControllerEnvelope(
      resolve(featuresDir, 'person/infra/http/person.controller.ts'),
    );
  });

  it.each([
    'person/infra/http/get-own-person.route.ts',
    'person/infra/http/delete-own-person.route.ts',
    'person/infra/http/remove-avatar.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

describe('[BK2-54] person update and avatar routes', () => {
  it.each([
    'person/infra/http/update-own-person.route.ts',
    'person/infra/http/replace-avatar.route.ts',
  ])('%s declares every status with its contract', (file) => {
    expectRouteContract(resolve(featuresDir, file));
  });
});

const THROWN_ERROR_CODE =
  /(?:new\s+\w+Error\(\s*|super\(\s*)ErrorCode\.([A-Z_]+)/g;

// Thrown in src/ but answered by no route (A25 of the backend-2 spec).
const CODES_WITHOUT_ROUTE: string[] = [
  // the Min(0) of the create and edit wallet schemas answers VALIDATION_FAILED first
  ErrorCode.INVALID_OVERDRAFT_CONFIG,
  // the IsPositive of the adjust balance schema answers VALIDATION_FAILED first
  ErrorCode.INVALID_WALLET_ADJUST_AMOUNT,
  // the installment receivable schema answers VALIDATION_FAILED first
  ErrorCode.TRANSACTION_INVALID_INSTALLMENT_COUNT,
  // reverse receivable answers SETTLEMENT_MOVEMENT_NOT_FOUND before the engine
  ErrorCode.TRANSACTION_REVERSE_NOT_PAID,
  // reverse receivable answers SETTLEMENT_MOVEMENT_NOT_FOUND before the engine
  ErrorCode.TRANSACTION_REVERSE_ON_INTERNAL,
  // the description enum param and create category schemas answer VALIDATION_FAILED first
  ErrorCode.INVALID_CATEGORY_DESCRIPTION_ENUM,
  // the group param, create and edit category schemas answer VALIDATION_FAILED first
  ErrorCode.INVALID_CATEGORY_GROUP,
  // the type query, create and edit category schemas answer VALIDATION_FAILED first
  ErrorCode.INVALID_CATEGORY_TYPE,
  // no route calls DateRange.create
  ErrorCode.INVALID_DATE_RANGE,
  // the description enum param and create payment method schemas answer VALIDATION_FAILED first
  ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM,
  // no route calls PaymentStatusCatalog.create; the repository reads by with()
  ErrorCode.INVALID_PAYMENT_STATUS_CODE,
  // the create and update payment method schemas answer VALIDATION_FAILED first
  ErrorCode.PAYMENT_METHOD_DESCRIPTION_TOO_LONG,
  // no route calls PaymentStatusCatalog.create; the repository reads by with()
  ErrorCode.PAYMENT_STATUS_LABEL_REQUIRED,
  // no route calls markAsInternal
  ErrorCode.TRANSACTION_REPARCEL_PAID_LEAF,
];

describe('[BK2-54] every route, every controller and every thrown error code', () => {
  it.each(routeFiles)(
    '%s declares every status with its contract',
    expectRouteContract,
  );

  it.each(walk(featuresDir).filter((file) => file.endsWith('.controller.ts')))(
    '%s wraps every json body in data',
    expectControllerEnvelope,
  );

  it('finds every thrown error code in the enum of some route response', () => {
    const thrownCodes = walk(srcDir)
      .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
      .flatMap((file) =>
        Array.from(
          readFileSync(file, 'utf8').matchAll(THROWN_ERROR_CODE),
          (match) => match[1],
        ),
      );
    const routeCodes = routeFiles.flatMap((file) =>
      Object.values(
        (
          operationOf(file) as
            | { responses?: Partial<Record<string, OpenApiResponse>> }
            | undefined
        )?.responses ?? {},
      ).flatMap((response) => errorCodesOf(response) ?? []),
    );

    expect(
      [...new Set(thrownCodes)].filter(
        (code) =>
          !CODES_WITHOUT_ROUTE.includes(code) && !routeCodes.includes(code),
      ),
    ).toEqual([]);
  });
});

const EXEMPT_ROUTES = [
  'post auth/account',
  'post auth/session',
  'put auth/session',
  'delete auth/session',
  'post auth/password-recovery',
  'get person/me',
  'patch person/me',
  'delete person/me',
  'put person/me/avatar',
  'delete person/me/avatar',
  'get health',
];

// Each path task removes its controller here: the it.failing below breaks once a listed controller follows the pattern.
const PENDING_CONTROLLERS: Record<string, string> = {
  wallet: 'T6',
  transfer: 'T7',
};

const OPERATION_WORDS = ['list', 'create', 'edit', 'update', 'delete'];
const OPERATION_PREFIXES = ['list-', 'create-', 'get-'];
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SNAKE_CASE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

// Verbs by path shape (c controller, x literal, p param); a literal under the controller takes POST only to create installments.
const DRAWERS: Record<string, string[]> = {
  c: ['get', 'post'],
  'c/p': ['get', 'put', 'patch', 'delete'],
  'c/x': ['get'],
  'c/x/p': ['get'],
  'c/p/x': ['get', 'post', 'put', 'patch', 'delete'],
  'c/p/x/p': ['get', 'post', 'put', 'delete'],
};
const COLLECTION_POSTS = ['installment'];

const isParam = (segment: string): boolean => segment.startsWith(':');

const controllerOf = (path = ''): string => path.split('/')[0];

const isExempt = ({ method, path }: RouteParts): boolean =>
  EXEMPT_ROUTES.includes(`${method} ${path}`);

const drawerTakes = (segments: string[], method: string): boolean => {
  const shape = segments
    .map((segment, index) => (isParam(segment) ? 'p' : index === 0 ? 'c' : 'x'))
    .join('/');
  return (
    (DRAWERS[shape] ?? []).includes(method) ||
    (shape === 'c/x' &&
      method === 'post' &&
      COLLECTION_POSTS.includes(segments[1]))
  );
};

const routeViolations = (route: RouteParts): string[] => {
  if (isExempt(route)) return [];
  const { method = '', path = '', handler, handlerBody = '' } = route;
  const where = `${method} ${path}`;
  const segments = path.split('/');
  const literals = segments.filter((segment) => !isParam(segment));
  const params = segments.filter(isParam).map((segment) => segment.slice(1));
  return [
    ...literals
      .filter(
        (segment) =>
          OPERATION_WORDS.includes(segment) ||
          OPERATION_PREFIXES.some((prefix) => segment.startsWith(prefix)),
      )
      .map((segment) => `${where}: segment "${segment}" is an operation word`),
    ...literals
      .filter((segment) => !KEBAB_CASE.test(segment))
      .map((segment) => `${where}: segment "${segment}" is not kebab-case`),
    ...(drawerTakes(segments, method)
      ? []
      : [`${where}: no drawer takes this path with ${method}`]),
    ...params
      .filter((param) => !SNAKE_CASE.test(param))
      .map((param) => `${where}: param "${param}" is not snake_case`),
    ...segments.flatMap((segment, index) => {
      const param = segment.slice(1);
      const expected = `${(segments[index - 1] ?? '').replace(/-/g, '_')}_id`;
      return isParam(segment) &&
        (param === 'id' || param.endsWith('_id')) &&
        param !== expected
        ? [`${where}: param "${param}" should be ${expected}`]
        : [];
    }),
    ...params
      .filter(
        (param) =>
          !new RegExp(`\\breq\\.params\\.${param}\\b`).test(handlerBody),
      )
      .map(
        (param) =>
          `${where}: handler ${handler} does not read req.params.${param}`,
      ),
  ];
};

const routeOfClass = new Map(
  routeFiles.map(
    (file) =>
      [
        readFileSync(file, 'utf8').match(/\bexport class (\w+)/)?.[1],
        readRoute(file),
      ] as const,
  ),
);

// ponytail: reads the registration order from the Route.create( lines as text; a route registered by a helper or a loop escapes it; call each <feature>Routes function if that shows up.
const registeredRoutes = (routesFile: string): RouteParts[] =>
  Array.from(
    readFileSync(routesFile, 'utf8').matchAll(/\b(\w+Route)\.create\(/g),
  ).flatMap((match) => routeOfClass.get(match[1]) ?? []);

const matchesPath = (pattern: string[], path: string[]): boolean =>
  pattern.length === path.length &&
  pattern.every(
    (segment, index) => isParam(segment) || segment === path[index],
  );

const orderViolations = (
  routesFile: string,
  registered: RouteParts[],
): string[] =>
  registered.flatMap((first, index) =>
    registered
      .slice(index + 1)
      .filter(
        (later) =>
          later.method === first.method &&
          matchesPath(
            (first.path ?? '').split('/'),
            (later.path ?? '').split('/'),
          ),
      )
      .map(
        (later) =>
          `${routesFile}: ${first.method} ${first.path} comes before ${later.method} ${later.path}`,
      ),
  );

const duplicateViolations = (
  routes: (RouteParts & { file: string })[],
): string[] => {
  const filesByRoute = new Map<string, string[]>();
  routes.forEach(({ method, path, file }) => {
    const route = `${method} ${path}`;
    filesByRoute.set(route, [...(filesByRoute.get(route) ?? []), file]);
  });
  return Array.from(filesByRoute)
    .filter(([, files]) => files.length > 1)
    .map(([route, files]) => `${route}: declared by ${files.join(' and ')}`);
};

const sample = (route: string, handlerBody?: string): RouteParts => {
  const [method, path] = route.split(' ');
  const reads = path
    .split('/')
    .filter(isParam)
    .map((param) => `req.params.${param.slice(1)}`);
  return {
    method,
    path,
    handler: 'listById',
    handlerBody: handlerBody ?? reads.join(' '),
  };
};

const FAILING_SAMPLES = [
  sample('get wallet/list-all'),
  sample('get bill/get-one'),
  sample('delete wallet'),
  sample('patch bill/settle/:bill_id'),
  sample('post bill/installments'),
  sample('post auth/sessions'),
  sample('delete person/me/avatar/x'),
  sample('get payment_method'),
  sample('get wallet/:walletId'),
  sample('get wallet/:id'),
  sample('get wallet/:bill_id'),
  sample('get wallet/:wallet_id', 'req.params.id'),
  sample('get wallet/:wallet_id', 'req.params.wallet_idx'),
];

const FAILING_LINES = [
  'get wallet/list-all: segment "list-all" is an operation word',
  'get bill/get-one: segment "get-one" is an operation word',
  'delete wallet: no drawer takes this path with delete',
  'patch bill/settle/:bill_id: no drawer takes this path with patch',
  'patch bill/settle/:bill_id: param "bill_id" should be settle_id',
  'post bill/installments: no drawer takes this path with post',
  'post auth/sessions: no drawer takes this path with post',
  'delete person/me/avatar/x: no drawer takes this path with delete',
  'get payment_method: segment "payment_method" is not kebab-case',
  'get wallet/:walletId: param "walletId" is not snake_case',
  'get wallet/:id: param "id" should be wallet_id',
  'get wallet/:bill_id: param "bill_id" should be wallet_id',
  'get wallet/:wallet_id: handler listById does not read req.params.wallet_id',
  'get wallet/:wallet_id: handler listById does not read req.params.wallet_id',
];

const PASSING_SAMPLES = [
  sample('get wallet/listing'),
  sample('get wallet/created'),
  sample('get bill/unpaid-by-period'),
  sample('get wallet'),
  sample('post wallet'),
  sample('patch bill/:bill_id/settle'),
  sample('post bill/installment'),
  sample('post auth/session'),
  sample('get payment-method'),
  sample('get payment-method/:payment_method_id'),
  sample('get category/:description_enum'),
  sample('get category/group/:group'),
  sample('get wallet/:wallet_id/statement'),
  sample('get wallet/:wallet_id'),
];

const pendingControllers = Object.keys(PENDING_CONTROLLERS);

const patternFiles = routeFiles.filter((file) => {
  const route = readRoute(file);
  return (
    !isExempt(route) && !pendingControllers.includes(controllerOf(route.path))
  );
});

const routesFiles = [...new Set(routeFiles.map(routesFileFor))];

describe('route pattern', () => {
  it.each(patternFiles)('[PDR-01] %s follows the route pattern', (file) => {
    expect(routeViolations(readRoute(file))).toEqual([]);
  });

  it('[PDR-02] the route checker gives one line per violation of each near miss', () => {
    expect(FAILING_SAMPLES.flatMap(routeViolations)).toEqual(FAILING_LINES);
  });

  it('[PDR-02] the route checker accepts the near misses that follow the pattern', () => {
    expect(PASSING_SAMPLES.flatMap(routeViolations)).toEqual([]);
  });

  it.each(routesFiles)(
    '[PDR-04] %s registers each literal before the param that matches it',
    (routesFile) => {
      expect(
        orderViolations(basename(routesFile), registeredRoutes(routesFile)),
      ).toEqual([]);
    },
  );

  it('[PDR-04] the order check refuses a param registered before a literal it matches', () => {
    const group = { method: 'get', path: 'category/group' };
    const byEnum = { method: 'get', path: 'category/:description_enum' };
    expect([
      ...orderViolations('category.routes.ts', [byEnum, group]),
      ...orderViolations('category.routes.ts', [group, byEnum]),
      ...orderViolations('category.routes.ts', [
        { method: 'put', path: 'category/:description_enum' },
        group,
      ]),
      ...orderViolations('category.routes.ts', [
        { method: 'get', path: 'category/group/:group' },
        byEnum,
      ]),
    ]).toEqual([
      'category.routes.ts: get category/:description_enum comes before get category/group',
    ]);
  });

  it('[PDR-04] the order check does not match a longer pattern against a shorter path', () => {
    expect(
      orderViolations('category.routes.ts', [
        { method: 'get', path: 'category/group/:group' },
        { method: 'get', path: 'category/group' },
      ]),
    ).toEqual([]);
  });

  it('[PDR-03] no two route files declare the same verb and path', () => {
    expect(
      duplicateViolations(
        routeFiles.map((file) => ({
          ...readRoute(file),
          file: basename(file),
        })),
      ),
    ).toEqual([]);
  });

  it('[PDR-03] the duplicate check names both files of a repeated verb and path', () => {
    const getWallet = { method: 'get', path: 'wallet' };
    expect(
      duplicateViolations([
        { ...getWallet, file: 'a.route.ts' },
        { ...getWallet, file: 'b.route.ts' },
      ]),
    ).toEqual(['get wallet: declared by a.route.ts and b.route.ts']);
    expect(
      duplicateViolations([
        { ...getWallet, file: 'a.route.ts' },
        { method: 'post', path: 'wallet', file: 'b.route.ts' },
      ]),
    ).toEqual([]);
  });

  it.failing.each(pendingControllers)(
    '%s still has a route outside the pattern',
    (controller) => {
      expect(
        routeFiles
          .map((file) => readRoute(file))
          .filter((route) => controllerOf(route.path) === controller)
          .flatMap(routeViolations),
      ).toEqual([]);
    },
  );
});

type OpenApiParameterOrRef = OpenApiParameter & { $ref?: string };

const PARAMETERS_REF = '#/components/parameters/';

const resolvedParameters = (
  parameters: OpenApiParameterOrRef[] = [],
  components = componentsOf(openapi).parameters ?? {},
): OpenApiParameter[] =>
  parameters.flatMap((parameter) =>
    parameter.$ref?.startsWith(PARAMETERS_REF)
      ? components[parameter.$ref.slice(PARAMETERS_REF.length)] ?? []
      : [parameter],
  );

const queryViolations = (
  where: string,
  parameters?: OpenApiParameterOrRef[],
  components?: OpenApiComponents['parameters'],
): string[] =>
  resolvedParameters(parameters, components)
    .filter(
      ({ in: location, name = '' }) =>
        location === 'query' && !SNAKE_CASE.test(name),
    )
    .map(({ name }) => `${where}: query "${name}" is not snake_case`);

const QUERY_COMPONENTS = {
  CategoryFilter: { in: 'query', name: 'categoryDescriptionEnum' },
  SearchByDate: { in: 'query', name: 'search_by_date' },
};

const queriesOf = (path: string): OpenApiParameter[] =>
  resolvedParameters(openapi.paths?.[path]?.get?.parameters);

const LIST_QUERIES = [
  'scope',
  'month',
  'year',
  'category_description_enum',
  'payment_method_description_enum',
  'root_has_installments',
  'root_is_fixed_cost',
].map((name) => expect.objectContaining({ in: 'query', name }));

const PERIOD_QUERIES = ['start_date', 'end_date'].map((name) =>
  expect.objectContaining({ in: 'query', name, required: true }),
);

describe('query pattern', () => {
  it('[PDR-05] every query of every openapi.json operation is snake_case', () => {
    // ponytail: reads the parameters under each verb; a path-level parameters list escapes it; merge it into each operation if a @swagger block declares one.
    expect(
      Object.entries(openapi.paths ?? {}).flatMap(([path, operations]) =>
        Object.entries(operations ?? {}).flatMap(([method, operation]) =>
          queryViolations(`${method} ${path}`, operation?.parameters),
        ),
      ),
    ).toEqual([]);
  });

  it('[PDR-05] the query check names each query that is not snake_case, inline or referenced', () => {
    expect(
      queryViolations(
        'get /api/bill',
        [
          { in: 'query', name: 'categoryDescriptionEnum' },
          { $ref: `${PARAMETERS_REF}CategoryFilter` },
        ],
        QUERY_COMPONENTS,
      ),
    ).toEqual([
      'get /api/bill: query "categoryDescriptionEnum" is not snake_case',
      'get /api/bill: query "categoryDescriptionEnum" is not snake_case',
    ]);
    expect(
      queryViolations(
        'get /api/bill',
        [
          { in: 'query', name: 'page' },
          { in: 'query', name: 'search_by_date' },
          { $ref: `${PARAMETERS_REF}SearchByDate` },
          { in: 'path', name: 'billId' },
        ],
        QUERY_COMPONENTS,
      ),
    ).toEqual([]);
  });

  it('[PDR-10] get /api/bill declares the list queries', () => {
    expect(queriesOf('/api/bill')).toEqual(
      expect.arrayContaining(LIST_QUERIES),
    );
  });

  it('[PDR-10] get /api/receivable declares the list queries', () => {
    expect(queriesOf('/api/receivable')).toEqual(
      expect.arrayContaining(LIST_QUERIES),
    );
  });

  it('[PDR-10] get /api/bill/unpaid-by-period requires start_date and end_date', () => {
    expect(queriesOf('/api/bill/unpaid-by-period')).toEqual(
      expect.arrayContaining(PERIOD_QUERIES),
    );
  });

  it('[PDR-10] get /api/receivable/unreceived-by-period requires start_date and end_date', () => {
    expect(queriesOf('/api/receivable/unreceived-by-period')).toEqual(
      expect.arrayContaining(PERIOD_QUERIES),
    );
  });
});
