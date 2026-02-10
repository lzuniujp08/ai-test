import path from 'node:path';
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const inputEntries = {
  sdk: 'src/index.js',
  shared: 'packages/shared/src/index.js',
  admin: 'packages/admin/src/index.js',
  service: 'packages/service/src/index.js',
  heatmap: 'packages/heatmap/src/index.js',
  aoilayer: 'packages/aoilayer/src/index.js',
};

const umdGlobals = {
  sdk: 'SFMapSDK3Plugin',
  shared: 'SFMapSharedPlugin',
  admin: 'SFMapAdminPlugin',
  service: 'SFMapServicePlugin',
  heatmap: 'SFMapHeatmapPlugin',
  aoilayer: 'SFMapAOILayerPlugin',
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
