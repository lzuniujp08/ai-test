import { createLayerId } from '../../shared/src/index.js';

export class HeatmapLayer {
  constructor(map, options) {
    this.map = map;
    this.options = options;
    this.layerId = createLayerId('heatmap', options.sourceId);
  }

  create() {
    this.map.addSource(this.options.sourceId, {
      type: 'geojson',
      data: this.options.points,
    });
    this.map.addLayer({
      id: this.layerId,
      type: 'heatmap',
      source: this.options.sourceId,
    });
    return this.layerId;
  }

  update(points) {
    const source = this.map.getSource(this.options.sourceId);
    source?.setData?.(points);
  }

  destroy() {
    if (this.map.getLayer(this.layerId)) {
      this.map.removeLayer(this.layerId);
    }
    if (this.map.getSource(this.options.sourceId)) {
      this.map.removeSource(this.options.sourceId);
    }
  }
}
