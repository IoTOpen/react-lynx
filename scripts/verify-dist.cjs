#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const expected = [
  path.join(repoRoot, 'dist', 'esm', 'index.js'),
  path.join(repoRoot, 'dist', 'cjs', 'index.js'),
  path.join(repoRoot, 'dist', 'index.d.ts')
];

const missing = expected.filter((p) => !fs.existsSync(p)).map((p) => path.relative(repoRoot, p));
if (missing.length > 0) {
  console.error('verify-dist: missing expected build artifacts:');
  missing.forEach((m) => console.error('  -', m));
  console.error('\nHint: run `pnpm run build` locally and ensure `vite-plugin-dts` generated declarations.');
  process.exit(1);
}

console.log('verify-dist: all expected artifacts present');
process.exit(0);
