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
