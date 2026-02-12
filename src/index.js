import { plugins } from './auto-modules.js';

export * from './auto-modules.js';

export const createSDK = (map) => {
  if (plugins.shared?.ensureMapInstance) {
    plugins.shared.ensureMapInstance(map);
  }

  const sdk = {
    plugins,
  };

  if (plugins.admin?.AdminPlugin) {
    sdk.admin = new plugins.admin.AdminPlugin({ map });
  }
  if (plugins.service?.ServicePlugin) {
    sdk.service = new plugins.service.ServicePlugin({ map });
  }
  if (plugins.heatmap?.HeatmapPlugin) {
    sdk.heatmap = new plugins.heatmap.HeatmapPlugin({ map });
  }
  if (plugins.aoilayer?.AOILayerPlugin) {
    sdk.aoilayer = new plugins.aoilayer.AOILayerPlugin({ map });
  }

  return sdk;
};
