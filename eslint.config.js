// eslint.config.js
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';

export default [
  // Ignore patterns
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vite/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/build/**',
      '*.config.{js,ts,mjs,cjs}',
      'scripts/**',
    ],
  },
  // Base language options
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Core recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  // TypeScript + React files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
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
      // Import hygiene
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-unresolved': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.{test,spec}.{ts,tsx,js,jsx}',
            '**/*.d.ts',
            '**/*.stories.{ts,tsx,js,jsx}',
            '**/setupTests.{js,ts}',
            '**/scripts/**',
            '*.config.{js,ts,mjs,cjs}',
          ],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
      // Sorting
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^react$', '^react-dom$'],
          ['^@?\\w'],
          ['^(@|src|@/)(/.*|$)'],
          ['^\\u0000'],
          ['^\\.\\./'],
          ['^\\./'],
          ['^.+\\.css$'],
        ],
      }],
      'simple-import-sort/exports': 'error',
      // Style
      'comma-spacing': ['error', { before: false, after: true }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      // TypeScript strictness
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
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['arrowFunctions', 'methods'] },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-shadow': ['error', { allow: ['err', 'error'] }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', {
        allowNumber: true,
        allowBoolean: true,
        allowAny: false,
        allowNullish: false,
      }],
      // Promise/async safety
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      // Core JS/TS rules
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'all'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-unreachable': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // React rules
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  // Plain JS/JSX
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/prop-types': 'warn',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^react$', '^react-dom$'],
          ['^@?\\w'],
          ['^(@|src|@/)(/.*|$)'],
          ['^\\u0000'],
          ['^\\.'],
          ['^.+\\.css$'],
        ],
      }],
      'simple-import-sort/exports': 'error',
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  // Test files
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },
  // Node/tooling scripts
  {
    files: ['*.config.{js,ts,mjs,cjs}', 'scripts/**/*.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
];
