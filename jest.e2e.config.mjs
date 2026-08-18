/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 120000,
  maxWorkers: 1,
  verbose: true
}
