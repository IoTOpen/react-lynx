#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distPath = path.join(repoRoot, 'dist');
const lifecycle = process.env.npm_lifecycle_event || '';
const nodeModulesPath = path.join(repoRoot, 'node_modules');
const shouldBuild = lifecycle === 'prepack' || process.env.FORCE_BUILD === '1';

if (!shouldBuild) {
  console.log(`prepare: lifecycle="${lifecycle}"; nothing to build.`);
  process.exit(0);
}

if (!fs.existsSync(nodeModulesPath)) {
  console.error('prepare: node_modules is missing; install dependencies before packing.');
  process.exit(1);
}

console.log('prepare: removing stale build artifacts');
fs.rmSync(distPath, { force: true, recursive: true });

console.log('prepare: building package');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(pnpm, ['run', 'build'], {
  cwd: repoRoot,
  env: { ...process.env, FORCE_BUILD: '0' },
  stdio: 'inherit',
});

if (result.error) {
  console.error(`prepare: failed to start pnpm: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`prepare: build failed with exit code ${result.status ?? 'unknown'}`);
  process.exit(result.status || 1);
}

console.log('prepare: build completed');
