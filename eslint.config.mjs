import prettier from 'eslint-config-prettier';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import sort from 'eslint-plugin-simple-import-sort';
import unused from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', 'coverage/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts', 'scripts/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    plugins: { 'simple-import-sort': sort, 'unused-imports': unused },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['apps/web/**/*.tsx', 'apps/web/**/*.ts'],
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'error',
    },
  },

  // Legacy pg rows, XML/JSON and BullMQ payloads require boundary schemas.
  // Keep this migration separate from formatting; narrow/remove with STEERING 2a/2b.
  {
    files: [
      'apps/api/src/libs/ports/http.client.ts',
      'apps/api/src/modules/digests/database/preview.repository.ts',
      'apps/api/src/modules/ingestion/adapters/feed.adapter.ts',
      'apps/api/src/modules/ingestion/adapters/hn.adapter.ts',
      'apps/api/src/modules/ingestion/database/content.repository.ts',
      'apps/api/src/modules/operations/adapters/operations.status.ts',
      'apps/api/src/modules/profiles/database/profile.repository.ts',
      'apps/api/src/modules/topics/database/topic.repository.ts',
      'apps/api/src/scheduled-digests.ts',
      'apps/api/src/worker.ts',
      'apps/api/test/**/*.ts',
      'apps/api/scripts/**/*.ts',
      'scripts/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  // Promise-shaped port implementations and mocks intentionally resolve immediately.
  {
    files: ['apps/api/src/worker.ts', 'apps/api/test/**/*.ts'],
    rules: { '@typescript-eslint/require-await': 'off' },
  },
  // Preserve legacy unknown-to-text coercion until malformed-feed behavior is characterized.
  {
    files: [
      'apps/api/src/modules/ingestion/adapters/feed.adapter.ts',
      'apps/api/src/modules/ingestion/domain/normalize.ts',
    ],
    rules: { '@typescript-eslint/no-base-to-string': 'off' },
  },
  // Existing loading/reset effects need a separate state-lifecycle refactor with UI coverage.
  {
    files: ['apps/web/src/DigestPreview.tsx', 'apps/web/src/StatusPanel.tsx'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  prettier,
);
