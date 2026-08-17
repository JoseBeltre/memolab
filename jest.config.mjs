/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  passWithNoTests: true
}
