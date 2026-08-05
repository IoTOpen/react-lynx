#!/usr/bin/env node
const { createRequire } = require('module');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '..');
const packageFile = path.join(repoRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

const esmFile = path.join(repoRoot, 'dist', 'esm', 'index.js');
const cjsFile = path.join(repoRoot, 'dist', 'cjs', 'index.cjs');
const typesFile = path.join(repoRoot, 'dist', 'index.d.ts');
const expected = [esmFile, cjsFile, typesFile];
const requiredExports = [
  'LynxProvider',
  'useGlobalLynxClient',
  'useGlobalUser',
  'useOAuth2Consent',
];

const missingFiles = expected
  .filter((file) => !fs.existsSync(file) || fs.statSync(file).size === 0)
  .map((file) => path.relative(repoRoot, file));

if (missingFiles.length > 0) {
  console.error('verify-dist: missing or empty build artifacts:');
  missingFiles.forEach((file) => console.error('  -', file));
  console.error('\nHint: run `pnpm run build` before publishing.');
  process.exit(1);
}

const expectedMetadata = {
  main: './dist/cjs/index.cjs',
  module: './dist/esm/index.js',
  types: './dist/index.d.ts',
};
const metadataErrors = Object.entries(expectedMetadata)
  .filter(([field, value]) => packageJson[field] !== value)
  .map(([field, value]) => `${field} must be "${value}"`);

const rootExport = packageJson.exports?.['.'];
if (rootExport?.types !== expectedMetadata.types) metadataErrors.push('exports["."].types does not match types');
if (rootExport?.import !== expectedMetadata.module) metadataErrors.push('exports["."].import does not match module');
if (rootExport?.require !== expectedMetadata.main) metadataErrors.push('exports["."].require does not match main');
if (!Array.isArray(packageJson.files) || !packageJson.files.includes('dist')) metadataErrors.push('files must include "dist"');

if (metadataErrors.length > 0) {
  console.error('verify-dist: invalid package metadata:');
  metadataErrors.forEach((error) => console.error('  -', error));
  process.exit(1);
}

function getTypeExports() {
  const program = ts.createProgram([typesFile], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
  });
  const sourceFile = program.getSourceFile(typesFile);
  const moduleSymbol = sourceFile && program.getTypeChecker().getSymbolAtLocation(sourceFile);

  if (!moduleSymbol) return new Set();
  return new Set(program.getTypeChecker().getExportsOfModule(moduleSymbol).map(({ name }) => name));
}

function assertExports(label, moduleExports) {
  const missing = requiredExports.filter((name) => !Object.hasOwn(moduleExports, name));
  if (missing.length === 0) return;

  throw new Error(`${label} is missing public exports: ${missing.join(', ')}`);
}

async function main() {
  const typeExports = getTypeExports();
  const missingTypes = requiredExports.filter((name) => !typeExports.has(name));
  if (missingTypes.length > 0) {
    throw new Error(`declarations are missing public exports: ${missingTypes.join(', ')}`);
  }

  const requireFromPackage = createRequire(packageFile);
  assertExports('CommonJS entry point', requireFromPackage(cjsFile));
  assertExports('ES module entry point', await import(pathToFileURL(esmFile).href));

  console.log('verify-dist: package metadata, artifacts, and public exports are valid');
}

main().catch((error) => {
  console.error(`verify-dist: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
