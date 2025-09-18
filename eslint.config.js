import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';

export default defineConfig(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.vite/',
      'coverage/',
      '*.d.ts',
      '*.config.{js,ts}', // config files
      '.rollup.cache/',
    ],
  },

  // Base configuration for all files
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
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
      'import': importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Defensive null/undefined checks for Map.get() and similar are required for runtime safety in this codebase.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Import hygiene
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/newline-after-import': ['error', { count: 1 }],

      // React
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Import sorting
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^react$', '^react-dom$'],         // React first
          ['^@testing-library', '^vitest'],   // Test utils
          ['^@iotopen', '^antd', '^@?\\w'],   // External deps
          ['^src/Contexts', '^src/', '^@/'],  // Internal
          ['^\\u0000'],                       // Side-effects
          ['^\\.'],                           // Relative
          ['^.+\\.css$'],                     // CSS last
        ],
      }],
      'simple-import-sort/exports': 'error',

      // Style / formatting
      'comma-spacing': ['error', { before: false, after: true }],

      // TypeScript rules
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
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-shadow': ['error', { allow: ['errors', 'error', 'err', 'e'] }],

      // Core JS/TS rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unreachable': 'warn',
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'object-shorthand': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'default-case': 'error',
    },
  },

  // Plain JS/JSX files
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/prop-types': 'warn', // keep for runtime safety in JS
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
);
