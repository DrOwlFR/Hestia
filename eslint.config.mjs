/**
 * ESLint configuration for TypeScript project.
 * Enforces code style, import sorting, and TypeScript best practices.
 * Includes rules for consistent formatting, type-only imports, and linting standards.
 */
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";

export default [
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"import": importPlugin,
			"simple-import-sort": simpleImportSort,
			"sort-destructure-keys": sortDestructureKeys,
		},
		rules: {
			...tseslint.configs.recommended.rules,

			// Enforce consistent type imports
			"@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports", "disallowTypeAnnotations": true, "fixStyle": "separate-type-imports" }],

			// Import sorting rules
			"import/no-duplicates": "error",
			"simple-import-sort/imports": ["error", {
				groups: [['^(assert|buffer|child_process|cluster|crypto|dns|events|fs|http|https|net|os|path|stream|timers|util|zlib)(/.*|$)'], ['^'], ['^\\.']]
			}],
			"simple-import-sort/exports": "error",

			// Handling of unused variables
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { "caughtErrors": "none" }],

			// Alphabetical sorting of destructured keys
			"sort-destructure-keys/sort-destructure-keys": ["error", { "caseSensitive": false }],

			// Other rules
			"no-console": "warn",
			"arrow-spacing": ["warn", { "before": true, "after": true }],
			"comma-dangle": ["error", "always-multiline"],
			"comma-spacing": "error",
			"comma-style": "error",
			"curly": ["error", "multi-line", "consistent"],
			"default-param-last": "error",
			"dot-location": ["error", "property"],
			"eqeqeq": ["error", "always"],
			"eol-last": ["error", "always"],
			"handle-callback-err": "off",
			"indent": ["error", "tab", { "SwitchCase": 1 }],
			"keyword-spacing": "error",
			"max-nested-callbacks": ["error", { "max": 4 }],
			"max-statements-per-line": ["error", { "max": 2 }],
			"no-array-constructor": "error",
			"no-empty-function": "error",
			"no-eval": "error",
			"no-floating-decimal": "error",
			"no-inline-comments": "warn",
			"no-irregular-whitespace": ["error", { "skipStrings": true, "skipTemplates": true }],
			"no-lonely-if": "error",
			"no-multi-assign": "error",
			"no-multi-spaces": "error",
			"no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1, "maxBOF": 0 }],
			"no-new-object": "error",
			"no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
			"no-trailing-spaces": ["error"],
			"no-useless-concat": "error",
			"no-useless-escape": "error",
			"no-whitespace-before-property": "error",
			"no-var": "error",
			"object-curly-spacing": ["error", "always"],
			"one-var": ["error", "never"],
			"prefer-arrow-callback": "error",
			"prefer-const": "error",
			"prefer-destructuring": ["error", { "object": true, "array": true }],
			"prefer-template": "error",
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"space-before-blocks": "error",
			"space-before-function-paren": ["error", {
				"anonymous": "never",
				"named": "never",
				"asyncArrow": "always",
			}],
			"space-in-parens": ["error", "never"],
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			"spaced-comment": ["error", "always"],
			"yoda": "error",
		},
	},
];