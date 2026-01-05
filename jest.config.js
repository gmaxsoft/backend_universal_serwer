export default {
  preset: null,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,cjs}',
  ],
};
