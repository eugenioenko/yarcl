import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/generated/**", "docs-web/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "no-console": "off",
      "no-bitwise": "off",
      // The codebase uses `any` intentionally in some places.
      "@typescript-eslint/no-explicit-any": "off",
      // Allow _-prefixed names to signal intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Type-check test files use bare `@ts-expect-error` to assert failures.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": false, "ts-ignore": true, "ts-nocheck": true, "ts-check": true },
      ],
      // Empty interfaces that only extend a supertype are used for named props.
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
    },
  }
);
