/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['<rootDir>/app/utils/**/*.ts'],
  passWithNoTests: true
}
