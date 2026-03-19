const js = require("@eslint/js")
const globals = require("globals")

module.exports = [
    {
        ignores: ["node_modules", "logs", "coverage", ".env", "*.log"],
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "error",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "never"],
            "no-console": "warn",
        },
    },
]