import { readFileSync } from 'fs';
import { builtinModules } from 'module';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const deps = Object.keys(pkg.dependencies || {});
const peers = Object.keys(pkg.peerDependencies || {});
const builtins = new Set(builtinModules);
const srcEntry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

function isExternal(id: string): boolean {
  if (!id) return false;
  if (builtins.has(id) || id.startsWith('node:')) return true;
  for (const d of deps) if (id === d || id.startsWith(d + '/')) return true;
  for (const p of peers) if (id === p || id.startsWith(p + '/')) return true;
  return false;
}

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    sourcemap: true,
    target: 'es2022',
    outDir: 'dist',
    lib: {
      entry: srcEntry,
      formats: ['cjs', 'es'],
      fileName: (format) => (format === 'cjs' ? 'cjs/index.js' : 'esm/index.js'),
    },
    rolldownOptions: {
      external: isExternal,
    },
  },
});
