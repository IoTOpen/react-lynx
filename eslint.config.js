import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import-x';
import js from '@eslint/js';

// ESLint configuration for react-lynx
// See .github/instructions/js-ts.instructions.md for coding standards
export default tseslint.config(
    {
        ignores: ['dist/', 'node_modules/'],
    },
    {
        languageOptions: {
            ecmaVersion: 2024,
            globals: {
                ...globals.browser,
            },
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        extends: [
            ...tseslint.configs.recommendedTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': [
                'error',
                { allow: ['arrowFunctions'] }
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['src/**/*.{js,ts,tsx}'],
        plugins: {
            'import-x': importPlugin
        },
        settings: {
            'import-x/resolver': {
                typescript: true,
                node: true,
            },
        },
        rules: {
            ...importPlugin.configs.recommended.rules,
            ...importPlugin.configs.typescript.rules,
            'import-x/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                        'type'
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                }
            ],
            'no-var': 'error',
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': [
                'error',
                { allow: ['arrowFunctions'] }
            ],
        },
    }
);
