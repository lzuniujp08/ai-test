import { LngLat } from '@sdk/shared';

export interface AOI {
  id: string;
  name: string;
  polygon: LngLat[];
}

export class AOILayerManager {
  private readonly aois = new Map<string, AOI>();

  draw(aoi: AOI): AOI {
    this.aois.set(aoi.id, aoi);
    return aoi;
  }

  edit(id: string, patch: Partial<AOI>): AOI | undefined {
    const current = this.aois.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...patch };
    this.aois.set(id, updated);
    return updated;
  }

  query(id: string): AOI | undefined {
    return this.aois.get(id);
  }
}
