import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  shims: true, // Auto-inject CommonJS polyfills if needed
  noExternal: ['@locapi/schemas'], // Inline all schemas and types for a self-contained SDK
});
