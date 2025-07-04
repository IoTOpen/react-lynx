import process from 'node:process';
import { createRequire } from 'node:module';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

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
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                preferBuiltins: false
            }),
            commonjs(),
            typescript({ 
                tsconfig: './tsconfig.json',
                declaration: false, // We handle declarations separately
                declarationDir: undefined,
                include: ['src/**/*'],
                exclude: ['node_modules', 'dist']
            }),
            isProduction && terser(),
        ].filter(Boolean), // Remove falsy plugins
        // NOTE: Exclude peer dependencies and Node.js built-ins from
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
