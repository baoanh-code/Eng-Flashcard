import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['.agents/**', '.codex/**', 'plans/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },
  {
    files: ['src/**/*.jsx'],
    ...reactRefresh.configs.vite,
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
]
