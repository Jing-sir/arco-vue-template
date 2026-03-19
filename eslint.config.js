import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
    // 基础推荐配置
    js.configs.recommended,

    // TypeScript 推荐配置
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // Vue 3 推荐配置
    ...pluginVue.configs['flat/recommended'],

    // Prettier 配置（关闭与 Prettier 冲突的规则）
    prettier,

    {
        files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'],

        plugins: {
            import: importPlugin,
        },

        languageOptions: {
            parser: pluginVue.parser,
            parserOptions: {
                parser: tseslint.parser,
                project: './tsconfig.json',
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
            globals: {
                // 自定义全局变量
                Nullable: 'readonly',
                // Node.js 全局变量
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                NodeJS: 'readonly',
            },
        },

        rules: {
            // ==================== TypeScript 严格规则 ====================
            // ✅ 禁止使用 any（符合 AI 规范）
            '@typescript-eslint/no-explicit-any': 'error',

            // ✅ 要求函数有明确的返回类型（符合 AI 规范）
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: true, // 允许箭头函数表达式推断
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                },
            ],

            // ✅ 要求模块边界有明确类型
            '@typescript-eslint/explicit-module-boundary-types': 'error',

            // ✅ 未使用的变量报错
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_', // 允许 _开头的参数
                    varsIgnorePattern: '^_',
                },
            ],

            // 允许空函数（某些回调场景需要）
            '@typescript-eslint/no-empty-function': 'off',

            // 允许使用 @ts-ignore（但应谨慎使用）
            '@typescript-eslint/ban-ts-comment': [
                'warn',
                {
                    'ts-ignore': 'allow-with-description',
                    minimumDescriptionLength: 10,
                },
            ],

            // 禁止使用特定类型
            '@typescript-eslint/ban-types': [
                'error',
                {
                    types: {
                        Object: {
                            message: 'Use Record<string, unknown> instead',
                        },
                        '{}': {
                            message: 'Use Record<string, unknown> or specific interface',
                        },
                    },
                },
            ],

            // 允许明确类型注解（提高可读性）
            '@typescript-eslint/no-inferrable-types': 'off',

            // ==================== 代码质量规则 ====================
            // 强制使用单引号
            quotes: ['error', 'single', { avoidEscape: true }],

            // 强制使用分号
            semi: ['error', 'always'],

            // 允许 console（开发时有用）
            'no-console': 'off',

            // 警告 debugger
            'no-debugger': 'warn',

            // 强制使用 === 和 !==
            eqeqeq: ['error', 'always', { null: 'ignore' }],

            // 要求 switch 有 default
            'default-case': 'error',

            // 要求文件末尾有换行
            'eol-last': 'error',

            // 复杂度限制
            complexity: ['warn', 40],

            // 最大行长度
            'max-len': [
                'warn',
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                },
            ],

            // ==================== 代码风格规则 ====================
            // 数组括号间距
            'array-bracket-spacing': ['error', 'never'],

            // 对象大括号间距
            'object-curly-spacing': ['error', 'always'],

            // 逗号间距
            'comma-spacing': ['error', { before: false, after: true }],

            // 逗号风格
            'comma-style': ['error', 'last'],

            // 计算属性间距
            'computed-property-spacing': ['error', 'never'],

            // 点操作符位置
            'dot-location': ['error', 'property'],

            // 点记号
            'dot-notation': ['error', { allowKeywords: true }],

            // 大括号风格
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],

            // 驼峰命名
            camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],

            // 箭头函数参数括号
            'arrow-parens': ['error', 'always'],

            // 禁止参数重新赋值（但允许修改属性）
            'no-param-reassign': ['error', { props: false }],

            // 允许 ++
            'no-plusplus': 'off',

            // 下划线命名
            'no-underscore-dangle': 'off',

            // 一致的返回
            'consistent-return': 'off',

            // 每行一个变量声明（修复 one-var 问题）
            'one-var': ['error', 'never'],

            // 禁止在 return 中赋值
            'no-return-assign': ['error', 'always'],

            // 允许使用对象原型方法
            'no-prototype-builtins': 'off',

            // 优先解构（对象优先，数组不强制）
            'prefer-destructuring': ['warn', { object: true, array: false }],

            // parseInt 的进制参数
            radix: ['error', 'as-needed'],

            // 允许 case 中声明变量
            'no-case-declarations': 'off',

            // 允许嵌套三元表达式
            'no-nested-ternary': 'off',

            // 允许单独的 if
            'no-lonely-if': 'off',

            // 允许赋值运算符
            'operator-assignment': 'off',

            // 对象换行
            'object-curly-newline': 'off',

            // 类方法使用 this
            'class-methods-use-this': 'off',

            // ==================== Vue 规则 ====================
            // 允许单词组件名
            'vue/multi-word-component-names': 'off',

            // 允许事件名使用连字符或驼峰
            'vue/v-on-event-hyphenation': 'off',

            // 组件名使用 PascalCase
            'vue/component-name-in-template-casing': ['error', 'PascalCase'],

            // Props 命名使用 camelCase
            'vue/prop-name-casing': ['error', 'camelCase'],

            // 要求组件有名称
            'vue/require-name-property': 'off',

            // 允许 v-html
            'vue/no-v-html': 'off',

            // ==================== Import 规则 ====================
            // 导入扩展名
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

            // 允许导入开发依赖
            'import/no-extraneous-dependencies': 'off',

            // 关闭命名导入检查（TypeScript 会处理）
            'import/named': 'off',

            // 导入顺序
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
                    'newlines-between': 'never',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },

    // 忽略特定文件
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'public/**',
            '*.config.js',
            '*.config.ts',
            '.eslintrc.js',
            'src/auto-imports.d.ts',
            'src/components.d.ts',
        ],
    },
];