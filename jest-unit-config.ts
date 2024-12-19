import config from './jest.config';

config.testMatch = ['**/*.spec.ts'];

config.collectCoverageFrom = config.collectCoverageFrom || [];

config.collectCoverageFrom = [
  ...config.collectCoverageFrom.filter(
    (pattern) => !pattern.includes('./src/infra/api/'),
  ),
  '!./src/infra/api/**/*.ts',
];

export default config;
