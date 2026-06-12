// Flat ESLint config for the whole monorepo (ESLint 9).
// Lenient by design: it guards against real mistakes without fighting the
// existing NestJS-decorator / React style. TypeScript itself handles type
// errors (see `bun run typecheck`), so we keep type-unaware rules here.
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/.tanstack/**',
      '**/routeTree.gen.ts',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/generated/**',
      'apps/api/prisma/migrations/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      // TS handles undefined identifiers + Nest provides many globals.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
