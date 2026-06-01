import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, join, basename } from 'path';

const featuresDir = resolve(__dirname, '../../features');

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

const INPUT_METHODS = ['post', 'put', 'patch'];
const methodOf = (content: string): string | null => {
  const match = content.match(
    /method[^=:]*[:=]\s*['"](get|post|put|patch|delete)['"]/,
  );
  return match ? match[1] : null;
};

describe('route convention', () => {
  it('finds at least one route file', () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it.each(routeFiles)('%s carries an @swagger block', (file) => {
    expect(readFileSync(file, 'utf8')).toContain('@swagger');
  });

  it.each(routeFiles)('%s is registered in its <feature>.routes.ts', (file) => {
    const routesFile = routesFileFor(file);
    expect(existsSync(routesFile)).toBe(true);

    const moduleName = basename(file, '.ts');
    expect(readFileSync(routesFile, 'utf8')).toContain(moduleName);
  });

  it.each(routeFiles)(
    '%s validates its input via runValidate when it has a body',
    (file) => {
      const content = readFileSync(file, 'utf8');
      const method = methodOf(content);
      const needsValidation = !!method && INPUT_METHODS.includes(method);

      expect(!needsValidation || content.includes('runValidate')).toBe(true);
    },
  );
});
