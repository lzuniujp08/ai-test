import { ensureMapInstance } from '../packages/shared/src/index.js';
import { AdminToolkit } from '../packages/admin/src/index.js';
import { fetchMapData } from '../packages/service/src/index.js';
import { HeatmapLayer } from '../packages/heatmap/src/index.js';
import { AOILayerManager } from '../packages/aoilayer/src/index.js';

export * from '../packages/shared/src/index.js';
export * from '../packages/admin/src/index.js';
export * from '../packages/service/src/index.js';
export * from '../packages/heatmap/src/index.js';
export * from '../packages/aoilayer/src/index.js';

export const createSDK = (map) => {
  ensureMapInstance(map);
  return {
    admin: new AdminToolkit({ map }),
    service: { fetchMapData },
    heatmap: HeatmapLayer,
    aoilayer: new AOILayerManager(),
  };
};
