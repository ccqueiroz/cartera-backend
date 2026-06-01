import config from './jest.config';

config.testMatch = ['**/*.spec.ts'];

config.collectCoverageFrom = config.collectCoverageFrom || [];

config.collectCoverageFrom = [
  ...config.collectCoverageFrom.filter(
    (pattern) => !pattern.includes('./src/infra/api/'),
  ),
  '!./src/infra/api/**/*.ts',
  // Estrutura nova: camadas de wiring/transport são cobertas por testes de
  // integração, não unitários — fora do gate de cobertura unitária.
  '!**/src/**/infra/**/*.ts',
  '!**/src/**/*.factory.ts',
  '!**/src/bootstrap/**/*.ts',
  '!**/src/shared/http/**/*.ts',
];

// Gate de cobertura: global 0 (código antigo em harvest não trava), mas a
// estrutura NOVA nasce com gate alto sobre domínio+application (CLAUDE.md §10).
config.coverageThreshold = {
  global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  './src/shared/kernel/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  './src/features/': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
};

export default config;
