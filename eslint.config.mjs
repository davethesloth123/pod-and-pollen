import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const baseDirectory = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory })
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'project/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Existing application debt remains visible without an unrelated source rewrite.
  { files: ['src/**/*.{ts,tsx}'], rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'warn',
  } },
]

export default config
