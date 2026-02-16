#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distPath = path.join(repoRoot, 'dist');
const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'production') {
  console.log('prepare: NODE_ENV=production — skipping build to avoid requiring devDependencies.');
  process.exit(0);
}

if (fs.existsSync(distPath)) {
  console.log('prepare: dist/ exists — skipping build.');
  process.exit(0);
}

console.log('prepare: building package (pnpm run build)');
try {
  execSync('pnpm run build', { stdio: 'inherit', cwd: repoRoot });
  console.log('prepare: build completed');
} catch (err) {
  console.error('prepare: build failed');
  console.error(err && err.message ? err.message : err);
  process.exit(1);
}
