import type { Config } from 'jest';
import base from './jest.config';

const config: Config = {
  ...base,
  collectCoverage: false,
  coverageThreshold: undefined,
  setupFiles: [],
  testMatch: ['**/*.e2e-live.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  maxWorkers: 1,
  testTimeout: 60_000,
  globalSetup: '<rootDir>/test/e2e/support/global-setup.ts',
  globalTeardown: '<rootDir>/test/e2e/support/global-teardown.ts',
};

export default config;
