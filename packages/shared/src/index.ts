export type LngLat = [number, number];

export interface MapboxLike {
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  getSource: (id: string) => unknown;
  getLayer: (id: string) => unknown;
  removeLayer: (id: string) => void;
  removeSource: (id: string) => void;
}

export const createLayerId = (prefix: string, suffix: string): string => `${prefix}-${suffix}`;

export interface SDKContext {
  map: MapboxLike;
}

export const ensureMapInstance = (map: unknown): asserts map is MapboxLike => {
  if (!map || typeof map !== 'object') {
    throw new Error('A valid Mapbox GL map instance is required.');
  }
};
