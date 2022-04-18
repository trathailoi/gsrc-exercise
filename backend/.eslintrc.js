module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base'
  ],
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'dist/', 'src/database/migration/*'],
  rules: {
    '@typescript-eslint/comma-dangle': ['error', 'never'],
    '@typescript-eslint/semi': ['error', 'never'],
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
    'no-restricted-syntax': 'off',
    'linebreak-style': 'off',
    'max-len': 'off'
  }
}