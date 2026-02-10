import path from 'node:path';
import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from '@rollup/plugin-terser';

const inputEntries: Record<string, string> = {
  sdk: 'src/index.ts',
  shared: 'packages/shared/src/index.ts',
  admin: 'packages/admin/src/index.ts',
  service: 'packages/service/src/index.ts',
  heatmap: 'packages/heatmap/src/index.ts',
  aoilayer: 'packages/aoilayer/src/index.ts',
};

const umdGlobals: Record<string, string> = {
  sdk: 'SFMapSDK3Plugin',
  shared: 'SFMapSharedPlugin',
  admin: 'SFMapAdminPlugin',
  service: 'SFMapServicePlugin',
  heatmap: 'SFMapHeatmapPlugin',
  aoilayer: 'SFMapAOILayerPlugin',
};

const basePlugins = [
  resolve({ extensions: ['.ts', '.js'] }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json', declaration: false }),
  terser(),
];

const createBuild = (name: string, input: string) => [
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
