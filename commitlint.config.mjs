/**
 * commitlint configuration.
 * Enforces conventional commit message format for consistency.
 */
export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"body-max-line-length": [0, "always", 100],
	},
};