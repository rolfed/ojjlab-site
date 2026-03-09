import { defineConfig } from 'vitest/config'

const root = import.meta.dirname

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/components/index.ts'],
      // TODO fix unit tests to meet this requirement
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
    },
  },
  resolve: {
    alias: {
      '@': `${root}/src`,
    },
  },
})
