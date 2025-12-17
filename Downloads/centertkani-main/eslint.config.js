import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'build']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Prevent unused variables
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
      }],
      
      // Prevent console statements in production
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      
      // Prevent debugger statements in production
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      
      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Prefer const over let when variable is never reassigned
      'prefer-const': 'warn',
      
      // Disallow duplicate imports
      'no-duplicate-imports': 'error',
      
      // Require === and !== instead of == and !=
      'eqeqeq': ['warn', 'always'],
      
      // Disallow unused expressions
      'no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
      }],
      
      // Enforce consistent return statements
      'consistent-return': 'warn',
      
      // Disallow unnecessary semicolons
      'no-extra-semi': 'error',
      
      // Enforce proper async/await usage
      'require-await': 'warn',
      
      // Disallow empty functions
      'no-empty-function': 'warn',
    },
  },
])
