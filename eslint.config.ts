import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginFunctional from 'eslint-plugin-functional';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    plugins: {
      // @ts-expect-error this works
      functional: eslintPluginFunctional,
    },
    rules: {
      'no-param-reassign': 'error',

      'functional/no-let': 'error',

      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  eslintPluginPrettierRecommended,
);
