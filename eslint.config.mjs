export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/.vite/**"]
  },
  {
    files: ["backend/**/*.js", "frontend/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {}
  }
];
