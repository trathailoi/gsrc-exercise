/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['lcov', 'text', 'text-summary'],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A set of global variables that need to be available in all test environments
  globals: {
    '@vue/vue3-jest': {
      compilerOptions: {
        // propsDestructureTransform: true
        isCustomElement: (tag: string) => tag.startsWith('n-') || tag.startsWith('i-')
      }
    }
  },

  transformIgnorePatterns: ['<rootDir>/node_modules'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/backend'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.ts'],
  snapshotSerializers: ['jest-serializer-vue'],
  moduleFileExtensions: [
    'vue',
    'js',
    'ts'
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A map from regular expressions to paths to transformers

  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '.*\\.ts$': 'ts-jest',
    '.+\\.(css|scss|svg|png|jpg|jpeg|ttf|woff|woff2)$': 'jest-transform-stub'
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
    // '^@@/(.*)$': '<rootDir>/src/modules/$1'
  },

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}
