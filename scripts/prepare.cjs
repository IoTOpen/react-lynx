#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distPath = path.join(repoRoot, 'dist');
const nodeEnv = process.env.NODE_ENV;
const lifecycle = process.env.npm_lifecycle_event || '';
const nodeModulesPath = path.join(repoRoot, 'node_modules');
const gitDir = path.join(repoRoot, '.git');

// In production environments we generally skip builds to avoid requiring
// devDependencies. However, when running lifecycle events that produce
// package artifacts (prepack/publish) we must still build. Only skip when
// NODE_ENV=production and we are not in a publish/prepack lifecycle.
if (nodeEnv === 'production' && !['prepack', 'publish'].includes(lifecycle)) {
  console.log('prepare: NODE_ENV=production and not publishing — skipping build to avoid requiring devDependencies.');
  process.exit(0);
}

if (fs.existsSync(distPath)) {
  console.log('prepare: dist/ exists — skipping build.');
  process.exit(0);
}

// If `node_modules` is not present we are likely being prepared by a
// package manager in a temporary directory (git dependency install). In
// that environment devDependencies are not installed and running the
// build will fail. Skip to make installs robust.
if (!fs.existsSync(nodeModulesPath)) {
  console.log('prepare: node_modules not found — skipping build (likely running in package manager temporary dir).');
  process.exit(0);
}

// If this is not a git repo (e.g. installed from a tarball/codeload), skip
// the build to avoid invoking package manager actions during prepare.
if (!fs.existsSync(gitDir)) {
  console.log('prepare: .git not found — likely a tarball/githost install; skipping build.');
  process.exit(0);
}

// Only run the build during publish/pack flows or when explicitly forced.
// This avoids running heavy builds during ordinary installs in consumers' environments.
if (!['prepack', 'publish'].includes(lifecycle) && process.env.FORCE_BUILD !== '1') {
  console.log(`prepare: lifecycle="${lifecycle}" — skipping build (only run on 'prepack' or 'publish', or set FORCE_BUILD=1).`);
  process.exit(0);
}

console.log('prepare: building package (pnpm run build)');
try {
  execSync('pnpm run build', { stdio: 'inherit', cwd: repoRoot });
  console.log('prepare: build completed');
} catch (err) {
  console.error('prepare: build failed');
  console.error(err && err.stack ? err.stack : (err && err.message ? err.message : err));
  process.exit(1);
}
