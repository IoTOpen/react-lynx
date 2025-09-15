import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

// ESLint configuration for react-lynx
// See .github/instructions/js-ts.instructions.md for coding standards
export default defineConfig(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.d.ts', '.rollup.cache/'],
  },

  // Base configuration for all files
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },

  // Apply base recommended configs for JS and TS files
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,

  // Apply strict TypeScript configurations only to TS/TSX files
  ...tseslint.configs.strictTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),

  // Comprehensive configuration for TypeScript/React source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-conversion': 'off',
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^react$', '^react-dom$'],
          ['^@iotopen', '^bootstrap', '^react-bootstrap', '^react-icons', '^@?\\w'],
          ['^src/Contexts', '^src/', '^@/'],
          ['^.+\\.css$', '^.+\\.scss$'],
          ['^\\.']
        ]
      }],
      'simple-import-sort/exports': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unreachable': 'warn',
      'indent': ['error', 4],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-shadow': ['error', {
        allow: ['errors', 'error', 'err', 'e'],
      }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'object-shorthand': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'default-case': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
);
