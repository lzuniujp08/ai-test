import { describe, expect, it } from 'vitest';
import { createLayerId } from '../packages/shared/src/index.js';

describe('createLayerId', () => {
  it('should combine prefix and suffix', () => {
    expect(createLayerId('heatmap', 'city')).toBe('heatmap-city');
  });
});
