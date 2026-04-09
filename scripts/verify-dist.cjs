#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const expected = [
  path.join(repoRoot, 'dist', 'esm', 'index.js'),
  path.join(repoRoot, 'dist', 'cjs', 'index.js'),
  path.join(repoRoot, 'dist', 'src', 'index.d.ts')
];

const rootTypesFile = path.join(repoRoot, 'dist', 'src', 'index.d.ts');
const contextTypesFile = path.join(repoRoot, 'dist', 'src', 'Contexts', 'index.d.ts');
const hooksTypesFile = path.join(repoRoot, 'dist', 'src', 'Hooks', 'index.d.ts');

const missing = expected.filter((p) => !fs.existsSync(p)).map((p) => path.relative(repoRoot, p));
if (missing.length > 0) {
  console.error('verify-dist: missing expected build artifacts:');
  missing.forEach((m) => console.error('  -', m));
  console.error('\nHint: run `pnpm run build` locally and ensure `vite-plugin-dts` generated declarations.');
  process.exit(1);
}

const rootTypes = fs.readFileSync(rootTypesFile, 'utf8');
if (!rootTypes.includes("export * from './Contexts';") || !rootTypes.includes("export * from './Hooks';")) {
  console.error('verify-dist: root declaration file is missing the expected re-export barrel:');
  process.exit(1);
}

const contextTypes = fs.readFileSync(contextTypesFile, 'utf8');
const hooksTypes = fs.readFileSync(hooksTypesFile, 'utf8');
const requiredContextExports = ['LynxProvider', 'useGlobalLynxClient', 'useGlobalUser'];
const requiredHookExports = ['useOAuth2Consent'];

const missingContextExports = requiredContextExports.filter((name) => !new RegExp(`\\b${name}\\b`).test(contextTypes));
const missingHookExports = requiredHookExports.filter((name) => !new RegExp(`\\b${name}\\b`).test(hooksTypes));

if (missingContextExports.length > 0 || missingHookExports.length > 0) {
  console.error('verify-dist: declaration files are missing expected public exports:');
  missingContextExports.forEach((m) => console.error('  -', m));
  missingHookExports.forEach((m) => console.error('  -', m));
  process.exit(1);
}

console.log('verify-dist: all expected artifacts present and declaration exports are wired correctly');
process.exit(0);
