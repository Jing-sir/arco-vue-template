// 需要安装依赖:  npm i eslint-define-config
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    root: true,
    /* 指定如何解析语法。*/
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
    },
    // https://eslint.bootcss.com/docs/user-guide/configuring#specifying-globals
    globals: {
        Nullable: true,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // typescript-eslint推荐规则,
        'prettier',
        'plugin:import/recommended',
    ],
    rules: {
        "quotes": [1, "single"], // 引号类型 `` "" ''
        'semi':["error","always"],
        "no-console": 0,
        "no-debugger": "warn",
        "global-require": 0,
        "indent": [ "error", 4 ],
        "array-bracket-spacing": [ 2, "never" ],
        "block-scoped-var": 0,
        "brace-style": [ 2, "1tbs", { "allowSingleLine": true }],
        "camelcase": 2,
        "comma-spacing": [ 2, { "before": false, "after": true }],
        "comma-style": [ 2, "last" ],
        "complexity": [ 2, 40 ],
        "computed-property-spacing": [ 2, "never" ],
        "default-case": 2,
        "dot-location": [ 2, "property" ],
        "dot-notation": [ 2, { "allowKeywords": true }],
        "eol-last": 2,
        "eqeqeq": [ 2, "allow-null" ],
        "import/no-unresolved": [ 2, { "ignore": [ "" ]} ],
        "import/extensions": [
            0,
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never",
                "vue": "never"
            }
        ],
        "max-len": [ "error", { "code": 500 }],
        "arrow-parens": "off",
        "no-param-reassign": ["error", { "props": false }],
        "no-plusplus": 0,
        "linebreak-style": [0, "error", "windows" ],
        "no-underscore-dangle": [ 0, { "allow": [ "_place" ] }],
        "consistent-return": [ 0, { "treatUndefinedAsUnspecified": true }],
        "no-unused-vars": "off",
        "one-var": [ "error", { "var": "always", "let": "always" } ],
        "one-var-declaration-per-line": [ "error", "initializations" ],
        "no-return-assign": [ "error", "always" ],
        "no-prototype-builtins": "off",
        "no-shadow": "off",
        "prefer-destructuring": [ "error", { "object": true, "array": false } ],
        "radix": [ "error", "as-needed" ],
        "no-case-declarations": "off",
        "no-nested-ternary": "off",
        "no-lonely-if": "off",
        "operator-assignment": "off",
        "object-curly-newline": "off",
        "class-methods-use-this": "off",
        "@typescript-eslint/no-empty-function": "off", // 允许空函数
        "@typescript-eslint/ban-ts-comment": "off", // 允许使用ts-ignore注释代码块，忽略类型检测
        "@typescript-eslint/no-unused-vars": "off", // 允许声明变量，不使用
        "@typescript-eslint/no-explicit-any": "off", // 允许使用any来解决类型问题（不推荐）
        "@typescript-eslint/ban-types": "off", // 允许使用object来代替任何对象的类型（适用范围为变量，不推荐）
        "@typescript-eslint/no-inferrable-types": "off", // 允许在明确的数据类型前继续添加类型
        "@typescript-eslint/explicit-module-boundary-types": "off", // 允许函数参数为any类型（不推荐）
        "vue/multi-word-component-names": "off",
        "import/named": "off",
        "import/no-extraneous-dependencies": "off",
        "no-undef": "off",
        "vue/v-on-event-hyphenation": "off",
        "object-curly-spacing": ["error", "always"]
    },
});
