// Architecture boundaries checked by `yarn arch:check` (pre-commit and CI).
// Rules with severity 'error' block; the six rules marked 'warn' report known violations that a later change clears, and a new violation is never added.
const NPM_TYPES = ['npm', 'npm-dev', 'npm-peer', 'npm-optional', 'npm-no-pkg', 'npm-unknown', 'npm-bundled'];
const SPEC = '\\.spec\\.ts$';
const BUSINESS = '^src/features/.+/(domain|application)/';

module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'feature-to-feature',
      comment: 'A feature never imports another feature.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/$1/' },
    },
    {
      name: 'kernel-pure',
      comment: 'shared/kernel imports nothing outside itself.',
      severity: 'error',
      from: { path: '^src/shared/kernel/', pathNot: SPEC },
      to: { pathNot: '^src/shared/kernel/' },
    },
    {
      name: 'domain-no-http-no-infra',
      comment: 'The domain layer never imports HTTP, infra or bootstrap code.',
      severity: 'error',
      from: { path: '^src/features/.+/domain/', pathNot: SPEC },
      to: { path: '^(src/shared/http/|src/features/.+/infra/|src/bootstrap/)' },
    },
    {
      name: 'application-no-http-no-infra',
      comment: 'The application layer never imports HTTP, infra or bootstrap code.',
      severity: 'error',
      from: { path: '^src/features/.+/application/', pathNot: SPEC },
      to: { path: '^(src/shared/http/|src/features/.+/infra/|src/bootstrap/)' },
    },
    {
      name: 'business-layer-no-npm',
      comment: 'Domain and application import no npm package; a connector behind a port does the work.',
      severity: 'warn',
      from: { path: BUSINESS, pathNot: SPEC },
      to: { dependencyTypes: NPM_TYPES },
    },
    {
      name: 'business-layer-no-packages',
      comment: 'Domain and application never import src/packages directly.',
      severity: 'warn',
      from: { path: BUSINESS, pathNot: SPEC },
      to: { path: '^src/packages/' },
    },
    {
      name: 'business-layer-no-shared-database',
      comment: 'The unit of work leaks Firestore into use cases: domain and application never import shared/database.',
      severity: 'warn',
      from: { path: BUSINESS, pathNot: SPEC },
      to: { path: '^src/shared/database/' },
    },
    {
      name: 'packages-no-system',
      comment: 'src/packages never imports the system (features, shared or bootstrap).',
      severity: 'warn',
      from: { path: '^src/packages/' },
      to: { path: '^src/(features|shared|bootstrap)/' },
    },
    {
      name: 'bootstrap-adapter-no-db-npm',
      comment: 'Bootstrap adapters never touch the database (npm side).',
      severity: 'warn',
      from: { path: '^src/bootstrap/.+\\.gateway\\.adapter\\.ts$' },
      to: { dependencyTypes: NPM_TYPES, path: 'firebase-admin' },
    },
    {
      name: 'bootstrap-adapter-no-db-path',
      comment: 'Bootstrap adapters never touch the database (system side).',
      severity: 'warn',
      from: { path: '^src/bootstrap/.+\\.gateway\\.adapter\\.ts$' },
      to: { path: '^(src/packages/clients/firebase|src/shared/database)' },
    },
    {
      name: 'engine-only-inside-core-finance',
      comment: 'The transaction engine is only consumed inside core-finance; bootstrap wires it.',
      severity: 'error',
      from: { path: '^src/', pathNot: '^(src/features/core-finance/|src/bootstrap/)' },
      to: { path: '^src/features/core-finance/transaction-engine/' },
    },
    {
      name: 'http-no-engine',
      comment: 'No HTTP border imports the transaction engine.',
      severity: 'error',
      from: { path: '^src/features/.+/infra/http/' },
      to: { path: '^src/features/core-finance/transaction-engine/' },
    },
    {
      name: 'shared-no-features',
      comment: 'shared never imports features.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', SPEC] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // exclude node_modules was dropped: it also removed the edges INTO npm packages, hiding firebase-admin and class-validator from every rule.
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
