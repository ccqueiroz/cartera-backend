// ponytail: reads apis and the route classes as text; a non-literal apis array or another route declaration form exits 1; move to ts-node if the definition stops being a literal.
const fs = require('node:fs');
const path = require('node:path');
const swaggerJSDoc = require('swagger-jsdoc');

process.chdir(path.resolve(__dirname, '..'));

const failures = [];
const fail = (message) => failures.push(message);
const finish = () => {
  failures.forEach((message) => console.error(message));
  process.exit(failures.length ? 1 : 0);
};

const definitionText = fs.readFileSync(
  'src/shared/http/swagger/swagger-definition.ts',
  'utf8',
);
const apisBlock = definitionText.match(/apis:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
const apis = [...apisBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
if (!apis.length) {
  fail('no apis found in swagger-definition.ts');
  finish();
}

const routeFiles = fs
  .readdirSync('src/features', { recursive: true })
  .map((file) => path.join('src/features', file))
  .filter((file) => /[\\/]infra[\\/]http[\\/].*\.route\.ts$/.test(file));
if (!routeFiles.length) {
  fail('no route classes found under src/features');
  finish();
}

const routePairs = new Set();
for (const file of routeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const method = content.match(
    /\bmethod\b[^=;]*=\s*['"](get|post|put|patch|delete)['"]/,
  )?.[1];
  const routePath = content.match(/\bpath\b[^=;\n]*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!method || !routePath) {
    fail(`method or path not read: ${file}`);
    continue;
  }
  routePairs.add(`${method} ${routePath}`);
}

let spec;
try {
  spec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'Cartera-Api', version: '1.0.0' },
    },
    apis,
    failOnErrors: true,
  });
} catch (error) {
  fail(String(error?.message ?? error));
  finish();
}

const verbs = new Set(['get', 'post', 'put', 'patch', 'delete']);
const specPairs = new Set();
for (const [specPath, operations] of Object.entries(spec.paths ?? {})) {
  const routePath = specPath.replace(/\{(\w+)\}/g, ':$1');
  if (!routePath.startsWith('/api/')) fail(`path without /api/: ${specPath}`);
  for (const verb of Object.keys(operations).filter((key) => verbs.has(key))) {
    specPairs.add(`${verb} ${routePath.replace(/^\/api\//, '')}`);
  }
}
for (const pair of specPairs)
  if (!routePairs.has(pair)) fail(`not a route class: ${pair}`);
for (const pair of routePairs)
  if (!specPairs.has(pair)) fail(`missing in spec: ${pair}`);

console.log(
  `paths=${Object.keys(spec.paths ?? {}).length} operations=${specPairs.size} routes=${routePairs.size}`,
);
finish();
