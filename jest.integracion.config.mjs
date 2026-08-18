/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/integracion/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 60000,
  maxWorkers: 1
}
