import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["inline-script-hashes/index.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
