import { createRequire } from 'module';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';


const require = createRequire(import.meta.url);
const airbnbTypescriptBase = require('eslint-config-airbnb-typescript/base');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    ...js.configs.recommended,
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.domain.ts', '**/*.repository.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'prettier': prettierPlugin,
      'import': importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...airbnbTypescriptBase.rules,
      ...prettierConfig.rules,
      'prettier/prettier': ['error', { 'printWidth': 100 }],
      'import/order': [
                'error',
                {
                  groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                  'newlines-between': 'always',
                },
              ],
    },
    settings: {
      ...airbnbTypescriptBase.settings,
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'postgres-data/'],
  },
];
