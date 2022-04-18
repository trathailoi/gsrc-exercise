// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    'vue/setup-compiler-macros': true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    // ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint',
    'testing-library'
  ],
  extends: [
    'standard',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:testing-library/vue'
  ],
  rules: {
    /**
   * DESC:
   * javascript custom rules
   */
    'no-console': 'warn',
    camelcase: 'off',
    'space-before-function-paren': ['warn', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],

    /**
     * DESC:
     * vue custom rules
     */
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 3 },
      multiline: { max: 1 }
    }],
    'vue/script-setup-uses-vars': 'error'

    /**
     * DESC:
     * vue testing-library custom rules
     */
    // 'testing-library/await-async-query': 'error',
    // 'testing-library/no-await-sync-query': 'error',
    // 'testing-library/no-debugging-utils': 'warn',
    // 'testing-library/no-dom-import': 'off'
  }
})
