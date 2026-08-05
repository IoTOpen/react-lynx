import { readFileSync } from 'fs';
import { builtinModules } from 'module';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const external = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]);

const srcEntry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

function isExternal(id: string): boolean {
  if (!id) return false;
  if (builtinModules.includes(id) || id.startsWith('node:')) return true;
  for (const dep of external) {
    if (id === dep || id.startsWith(`${dep}/`)) return true;
  }
  return false;
}

export default defineConfig({
  plugins: [react(), dts({ bundleTypes: true, entryRoot: 'src', pathsToAliases: false })],
  build: {
    sourcemap: true,
    target: 'es2023',
    outDir: 'dist',
    minify: false,
    lib: {
      entry: srcEntry,
      formats: ['cjs', 'es'],
      fileName: (format) => (format === 'cjs' ? 'cjs/index.cjs' : 'esm/index.js'),
    },
    rolldownOptions: {
      external: isExternal,
    },
  },
});
