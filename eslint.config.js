import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importXPlugin from 'eslint-plugin-import-x';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // --------------------------------------------------
  // Ignore
  // --------------------------------------------------
  {
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      '*.d.ts',
      '.pnpm-store/',
      '**/.pnpm-store/**',
      '.vscode/',
    ],
  },

  // --------------------------------------------------
  // Base language setup
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Core JS recommended
  // --------------------------------------------------
  js.configs.recommended,

  // --------------------------------------------------
  // TypeScript (v8 flat)
  // --------------------------------------------------
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  })),

  // --------------------------------------------------
  // Project Rules
  // --------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],

    plugins: {
      'react-hooks': reactHooksPlugin,
      import: importXPlugin,
      'simple-import-sort': simpleImportSort,
    },

    settings: {
      'import/resolver': {
        typescript: true,
      },
    },

    rules: {
      // --------------------------
      // Disable base JS rules
      // --------------------------
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',

      // --------------------------
      // TypeScript rules
      // --------------------------
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-redeclare': 'error',

      // --------------------------
      // Import hygiene
      // --------------------------
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^react-dom$'],
            ['^@?\\w'],
            ['^(@|src|@/)(/.*|$)'],
            ['^\\u0000'],
            ['^\\.\\./'],
            ['^\\./'],
            ['^.+\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-cycle': 'error',
      'import/no-unresolved': 'off',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.{test,spec}.{ts,tsx,js,jsx}',
            '**/*.d.ts',
            '**/setupTests.{js,ts}',
            '**/scripts/**',
            '*.config.{js,ts,mjs,cjs}',
          ],
          peerDependencies: true,
          includeTypes: true,
        },
      ],

      // --------------------------
      // Code style
      // --------------------------
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'comma-spacing': ['error', { before: false, after: true }],
      'space-before-function-paren': ['error', 'never'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'keyword-spacing': ['error', { before: true, after: true }],

      // --------------------------
      // Core correctness
      // --------------------------
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-unreachable': 'warn',
      'no-duplicate-imports': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // --------------------------
      // React hooks — spread first, explicit overrides after
      // --------------------------
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },

  // --------------------------------------------------
  // Tests
  // --------------------------------------------------
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // --------------------------------------------------
  // Tooling / Node
  // --------------------------------------------------
  {
    files: ['*.config.{js,ts,mjs,cjs}', 'scripts/**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'no-console': 'off',
    },
  },
];
