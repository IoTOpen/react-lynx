import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import js from '@eslint/js';

// ESLint configuration for react-lynx
// See .github/instructions/js-ts.instructions.md for coding standards
export default tseslint.config(
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
            // React and Hooks rules
            ...reactHooksPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',

            // Explicitly add react-hooks rules to ensure compatibility with flat config and plugin resolution issues.
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // Disable unnecessary condition checking for flexibility
            '@typescript-eslint/no-unnecessary-condition': 'off',

            // Enforce consistent import order with custom groups per coding standards
            'simple-import-sort/imports': ['error', {
                groups: [
                    // 1. React and react-dom first
                    ['^react$', '^react-dom$'],
                    // 2. External packages (node_modules, @iotopen, bootstrap, etc.)
                    ['^@iotopen', '^bootstrap', '^react-bootstrap', '^react-icons', '^@?\\w'],
                    // 3. Internal absolute imports (src/Contexts, src/, @/)
                    ['^src/Contexts', '^src/', '^@/'],
                    // 4. CSS imports
                    ['^.+\\.css$', '^.+\\.scss$'],
                    // 5. Relative imports (./ and ../)
                    ['^\\.']
                ]
            }],
            'simple-import-sort/exports': 'error',

            // Code style and quality rules per coding standards
            'no-var': 'error',
            'no-unreachable': 'warn',
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],

            // TypeScript specific rule overrides
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
            // NOTE: Enforce 'interface' for props and 'type' for unions/aliases per coding standards.
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        },
    },
);
