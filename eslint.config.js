const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const vuePlugin = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');
const importPlugin = require('eslint-plugin-import');
const prettier = require('eslint-config-prettier');

module.exports = [
    {
        ignores: [
            '*.sh',
            '*.md',
            '*.woff',
            '*.ttf',
            '.vscode/**',
            '.idea/**',
            '.husky/**',
            '.local/**',
            'bin/**',
            'dist/**',
            'docs/**',
            'node_modules/**',
            'public/**',
            'src/mock/**',
            '*.config.js',
            '*.config.ts',
            'src/auto-imports.d.ts',
            'src/components.d.ts',
        ],
        linterOptions: {
            reportUnusedDisableDirectives: 'warn',
        },
    },

    ...tsPlugin.configs['flat/recommended'],
    ...vuePlugin.configs['flat/recommended'],

    {
        files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.serviceworker,
                Nullable: 'readonly',
                NodeJS: 'readonly',
            },
        },
        plugins: {
            import: importPlugin,
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'no-unused-vars': 'off',
            'no-undef': 'off',
            'no-console': 'off',
            'no-debugger': 'warn',
            'no-unreachable': 'error',
            'no-constant-condition': ['warn', { checkLoops: false }],
            'no-irregular-whitespace': 'error',
            'no-param-reassign': ['error', { props: false }],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            complexity: ['warn', 40],
            camelcase: 'off',
            'default-case': 'off',
            'prefer-destructuring': 'off',
            'no-underscore-dangle': 'off',
            'class-methods-use-this': 'off',
            'no-void': ['error', { allowAsStatement: true }],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/ban-ts-comment': [
                'warn',
                {
                    'ts-ignore': 'allow-with-description',
                    minimumDescriptionLength: 10,
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-empty-function': 'off',

            'vue/multi-word-component-names': 'off',
            'vue/v-on-event-hyphenation': 'off',
            'vue/require-default-prop': 'off',
            'vue/component-name-in-template-casing': ['error', 'PascalCase'],
            'vue/prop-name-casing': ['error', 'camelCase'],
            'vue/no-v-html': 'off',

            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                    vue: 'never',
                },
            ],
            'import/no-extraneous-dependencies': 'off',
            'import/named': 'off',
            'import/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling'],
                        'index',
                        'object',
                        'type',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                    'newlines-between': 'never',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
        },
    },

    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
    },

    prettier,
];
