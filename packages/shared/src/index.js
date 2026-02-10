export const createLayerId = (prefix, suffix) => `${prefix}-${suffix}`;

export const ensureMapInstance = (map) => {
  if (!map || typeof map !== 'object') {
    throw new Error('A valid Mapbox GL map instance is required.');
  }
};
