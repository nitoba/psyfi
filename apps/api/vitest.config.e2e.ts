import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'data'],
    globals: true,
    root: './',
    setupFiles: ['./test/setup-e2e.ts'],
    globalSetup: './test/global.ts',
    hookTimeout: Infinity,
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})