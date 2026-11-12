import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.build/**',
      '.coverage/**',
      '.esbuild/**',
      '.husky/_/**',
      '.serverless/**',
      'coverage/**',
      'node_modules/**'
    ]
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      // CommonJS config files (serverless, jest, commitlint) use require().
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public'
          }
        }
      ],
      eqeqeq: ['error', 'always']
    }
  },
  {
    files: ['**/*.test.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  // ─────────────────────────────────────────────────────────────────────
  // Architecture boundaries (hexagonal / clean):
  //   domain ← application ← adapters ← infrastructure
  // Inner layers must not import outer ones, and frameworks stay at the edge.
  // ─────────────────────────────────────────────────────────────────────
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@application/*', '**/application/**'],
              message: 'domain must not depend on application.'
            },
            {
              group: ['@adapters/*', '**/adapters/**'],
              message: 'domain must not depend on adapters.'
            },
            {
              group: ['@infrastructure/*', '**/infrastructure/**'],
              message: 'domain must not depend on infrastructure.'
            },
            {
              group: ['zod', 'aws-lambda', '@aws-sdk/*', 'node:*'],
              message: 'domain must stay free of frameworks, SDKs and runtime APIs.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@adapters/*', '**/adapters/**'],
              message: 'application must not depend on adapters.'
            },
            {
              group: ['@infrastructure/*', '**/infrastructure/**'],
              message: 'application must not depend on infrastructure.'
            },
            {
              group: ['zod', 'aws-lambda', '@aws-sdk/*'],
              message: 'application must stay free of transport and provider libraries.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/adapters/in/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@infrastructure/*', '**/infrastructure/**'],
              message: 'adapters must not depend on infrastructure.'
            },
            {
              group: ['@adapters/out/*', '**/adapters/out/**', '**/out/**'],
              message: 'input adapters must not depend on output adapters.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/adapters/out/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@infrastructure/*', '**/infrastructure/**'],
              message: 'adapters must not depend on infrastructure.'
            },
            {
              group: ['@adapters/in/*', '**/adapters/in/**', '**/in/**'],
              message: 'output adapters must not depend on input adapters.'
            },
            {
              group: ['zod', 'aws-lambda'],
              message: 'zod and API Gateway types belong to the input adapters.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['zod'], message: 'zod belongs to src/adapters/in/http.' }] }
      ]
    }
  },
  prettierConfig
);
