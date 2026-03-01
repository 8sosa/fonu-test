module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['dotenv/config'], // Automatically loads .env
    testMatch: ['**/tests/**/*.test.ts'],
  };