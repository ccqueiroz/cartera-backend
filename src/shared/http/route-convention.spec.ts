import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, join, basename, dirname } from 'path';

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
