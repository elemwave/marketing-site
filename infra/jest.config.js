module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/test/environment.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
