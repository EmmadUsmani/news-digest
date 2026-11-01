import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['**/dist/**'] }, ...tseslint.configs.recommended, { files: ['**/*.ts', '**/*.tsx'], rules: { '@typescript-eslint/no-explicit-any': 'error' } });
