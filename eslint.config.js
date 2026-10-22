// ESLint flat config for SDK Guardian.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-console': 'error',
    },
  },
  {
    files: ['eslint.config.js', 'ecosystem.config.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['ecosystem.config.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'writable', __dirname: 'readonly' },
    },
  },
);
