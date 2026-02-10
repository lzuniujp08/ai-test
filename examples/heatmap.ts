import { HeatmapLayer } from '../packages/heatmap/src';
import { initMap } from './map';

const map = initMap('map');
map.on('load', () => {
  const layer = new HeatmapLayer(map as never, {
    sourceId: 'demo-heatmap',
    points: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.39, 39.9] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.45, 39.95] }, properties: {} },
      ],
    },
  });
  layer.create();
});
