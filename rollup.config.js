import process from 'node:process';
import { createRequire } from 'node:module';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

// NOTE: Check if the build is for production to apply optimizations.
const isProduction = process.env.NODE_ENV === 'production';

export default [
    // Main library build
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
                exports: 'named' // Explicit named exports for CJS
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            resolve({
                browser: true,
                preferBuiltins: false,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                declarationMap: false,
            }),
            // NOTE: Minify the bundle only in production to reduce size.
            ...(isProduction ? [terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                }
            })] : []),
            // Bundle analysis tool for development
            ...(process.env.ANALYZE === 'true' ? [
                visualizer({
                    filename: 'dist/bundle-analysis.html',
                    open: true
                })
            ] : [])
        ],
        // NOTE: Exclude peer dependencies and Node.js built-ins from the bundle.
        external: (id) => {
            // Keep all peer dependencies external
            if (/^react|^react-dom|^@iotopen|^paho-mqtt/.test(id)) {
                return true;
            }
            // Keep Node.js built-ins external
            if (id.startsWith('node:')) {
                return true;
            }
            return false;
        }
    },
    // Build step for generating TypeScript type declaration files (.d.ts).
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        // NOTE: Exclude peer dependencies from type declarations.
        external: (id) => {
            if (/^react|^react-dom|^@iotopen|^paho-mqtt/.test(id)) {
                return true;
            }
            return false;
        }
    },
];
