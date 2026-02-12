import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const toPascalCase = (value) =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

const packageEntries = fs
  .readdirSync('packages', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join('packages', name, 'src', 'index.js')))
  .sort();

const inputEntries = {
  sdk: 'src/index.js',
  ...Object.fromEntries(packageEntries.map((name) => [name, `packages/${name}/src/index.js`])),
};

const umdGlobals = {
  sdk: 'SFMapSDK3Plugin',
  ...Object.fromEntries(packageEntries.map((name) => [name, `SFMap${toPascalCase(name)}Plugin`])),
};

const basePlugins = [resolve({ extensions: ['.js'] }), commonjs(), terser()];

const createBuild = (name, input) => [
  {
    input,
    output: {
      file: path.resolve('dist', `${name}.esm.js`),
      format: 'esm',
      sourcemap: true,
    },
    plugins: basePlugins,
  },
  {
    input,
    output: {
      file: path.resolve('dist', `${name}.umd.js`),
      format: 'umd',
      name: umdGlobals[name],
      sourcemap: true,
    },
    plugins: basePlugins,
  },
];

export default defineConfig(Object.entries(inputEntries).flatMap(([name, input]) => createBuild(name, input)));
