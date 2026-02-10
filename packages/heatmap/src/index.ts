import { MapboxLike, createLayerId } from '@sdk/shared';

export interface HeatmapOptions {
  sourceId: string;
  points: GeoJSON.FeatureCollection<GeoJSON.Point>;
}

export class HeatmapLayer {
  private readonly layerId: string;

  constructor(private readonly map: MapboxLike, private readonly options: HeatmapOptions) {
    this.layerId = createLayerId('heatmap', options.sourceId);
  }

  create(): string {
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

  update(points: GeoJSON.FeatureCollection<GeoJSON.Point>): void {
    const source = this.map.getSource(this.options.sourceId) as { setData?: (data: unknown) => void };
    source?.setData?.(points);
  }

  destroy(): void {
    if (this.map.getLayer(this.layerId)) {
      this.map.removeLayer(this.layerId);
    }
    if (this.map.getSource(this.options.sourceId)) {
      this.map.removeSource(this.options.sourceId);
    }
  }
}
