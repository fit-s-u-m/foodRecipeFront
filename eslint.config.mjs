import antfu from "@antfu/eslint-config";

// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu({
    typescript: true,
    vue: true,
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: true,
    },
  }, {
    rules: {
      "perfectionist/sort-imports": ["error", { tsconfigRootDir: "." }],
      "no-console": ["warn"],
      "unicorn/filename-case": ["error", {
        cases: {
          kebabCase: true,
          pascalCase: true, // for componets
        },
        ignore: ["README.md"],
      }],
    },
  }),

);
