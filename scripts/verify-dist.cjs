#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const esmFile = path.join(repoRoot, 'dist', 'esm', 'index.js');
const cjsFile = path.join(repoRoot, 'dist', 'cjs', 'index.cjs');
const typesFile = path.join(repoRoot, 'dist', 'src', 'index.d.ts');

const expected = [esmFile, cjsFile, typesFile];

// ----------------------------------------------------
// 1. Check build artifacts
// ----------------------------------------------------
const missingFiles = expected
  .filter((p) => !fs.existsSync(p))
  .map((p) => path.relative(repoRoot, p));

if (missingFiles.length > 0) {
  console.error('verify-dist: missing expected build artifacts:');
  missingFiles.forEach((m) => console.error('  -', m));
  console.error('\nHint: run `pnpm run build` before publishing.');
  process.exit(1);
}

// ----------------------------------------------------
// 2. Read types safely
// ----------------------------------------------------
let rootTypes;
try {
  rootTypes = fs.readFileSync(typesFile, 'utf8');
} catch (err) {
  console.error('verify-dist: failed to read type file:', typesFile, err);
  process.exit(1);
}

// ----------------------------------------------------
// 3. Validate exports (safe check)
// ----------------------------------------------------
const requiredExports = [
  'LynxProvider',
  'useGlobalLynxClient',
  'useGlobalUser',
  'useOAuth2Consent'
];

const missingExports = requiredExports.filter((name) => {
  const patterns = [
    `export { ${name} }`,
    `export { ${name},`,
    `export * from`, // indirect export fallback
    `export type { ${name} }`
  ];

  return !patterns.some((p) => rootTypes.includes(p)) &&
         !new RegExp(`\\b${name}\\b`).test(rootTypes);
});

if (missingExports.length > 0) {
  console.error('verify-dist: missing expected public exports in types:');
  missingExports.forEach((m) => console.error('  -', m));
  process.exit(1);
}

// ----------------------------------------------------
console.log('verify-dist: OK — artifacts + exports validated');
process.exit(0);
