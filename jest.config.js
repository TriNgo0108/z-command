/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__tests__/**',
    '!src/cli.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  // Exclude templates from module resolution
  modulePathIgnorePatterns: ['<rootDir>/templates/', '<rootDir>/dist/'],
  watchPathIgnorePatterns: ['<rootDir>/templates/']
};
