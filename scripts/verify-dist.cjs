#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const expected = [
  path.join(repoRoot, 'dist', 'esm', 'index.js'),
  path.join(repoRoot, 'dist', 'cjs', 'index.cjs'),
  path.join(repoRoot, 'dist', 'index.d.ts')
];

const rootTypesFile = path.join(repoRoot, 'dist', 'index.d.ts');

const missing = expected.filter((p) => !fs.existsSync(p)).map((p) => path.relative(repoRoot, p));
if (missing.length > 0) {
  console.error('verify-dist: missing expected build artifacts:');
  missing.forEach((m) => console.error('  -', m));
  console.error('\nHint: run `pnpm run build` locally and ensure `unplugin-dts` generated declarations.');
  process.exit(1);
}

const rootTypes = fs.readFileSync(rootTypesFile, 'utf8');
const requiredExports = ['LynxProvider', 'useGlobalLynxClient', 'useGlobalUser', 'useOAuth2Consent'];
const missingExports = requiredExports.filter((name) => !new RegExp(`\\b${name}\\b`).test(rootTypes));

if (missingExports.length > 0) {
  console.error('verify-dist: declaration file is missing expected public exports:');
  missingExports.forEach((m) => console.error('  -', m));
  process.exit(1);
}

console.log('verify-dist: all expected artifacts present and declaration exports are wired correctly');
process.exit(0);
