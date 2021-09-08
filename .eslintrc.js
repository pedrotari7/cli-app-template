module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 12,
  },
  ignorePatterns: ['node_modules/'],
  rules: {
    'no-case-declarations': 'off',
  },
};
