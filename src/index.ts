import { ensureMapInstance, type MapboxLike } from '@sdk/shared';
import { AdminToolkit } from '@sdk/admin';
import { fetchMapData } from '@sdk/service';
import { HeatmapLayer } from '@sdk/heatmap';
import { AOILayerManager } from '@sdk/aoilayer';

export * from '@sdk/shared';
export * from '@sdk/admin';
export * from '@sdk/service';
export * from '@sdk/heatmap';
export * from '@sdk/aoilayer';

export interface SDKModules {
  admin: AdminToolkit;
  service: {
    fetchMapData: typeof fetchMapData;
  };
  heatmap: typeof HeatmapLayer;
  aoilayer: AOILayerManager;
}

export const createSDK = (map: MapboxLike): SDKModules => {
  ensureMapInstance(map);
  return {
    admin: new AdminToolkit({ map }),
    service: { fetchMapData },
    heatmap: HeatmapLayer,
    aoilayer: new AOILayerManager(),
  };
};
