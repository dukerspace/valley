import { default as pluginJs } from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */


export default [
  {
    ignores: [
      '**/.*.js',
      '**/*.setup.js',
      '**/*.config.js',
      '**/.turbo/',
      '**/dist/',
      '**/coverage/',
      '**/node_modules/',
      'eslint.config.mjs',
      '**/*.json',
      '**/*.next',
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];
