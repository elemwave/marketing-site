module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/test/environment.ts'],
  transform: {
    '^.+\\.(tsx?|mjs)$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'json']
};
