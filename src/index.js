import { modules } from './auto-modules.js';

export * from './auto-modules.js';

export const createSDK = (map) => {
  if (modules.shared?.ensureMapInstance) {
    modules.shared.ensureMapInstance(map);
  }

  const sdk = {
    modules,
  };

  if (modules.admin?.AdminToolkit) {
    sdk.admin = new modules.admin.AdminToolkit({ map });
  }
  if (modules.service?.fetchMapData) {
    sdk.service = { fetchMapData: modules.service.fetchMapData };
  }
  if (modules.heatmap?.HeatmapLayer) {
    sdk.heatmap = modules.heatmap.HeatmapLayer;
  }
  if (modules.aoilayer?.AOILayerManager) {
    sdk.aoilayer = new modules.aoilayer.AOILayerManager();
  }

  return sdk;
};
