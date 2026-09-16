import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Declaring ignores replaces eslint-config-next's own list rather than adding
  // to it, so its defaults are repeated here to keep build output unlinted.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
