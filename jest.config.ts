module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$', // Only tests in src directory
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s', // Only collect coverage from src
    '!src/main.ts', // Exclude specific files
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '<rootDir>/src/main.ts',
    '<rootDir>/dist/*',
    '<rootDir>/node_modules/*',
    '<rootDir>/test/*',
    '<rootDir>/coverage/*',
    '<rootDir>/src/app.module.ts', // Add other files to exclude
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
