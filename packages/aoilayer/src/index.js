export class AOILayerManager {
  constructor() {
    this.aois = new Map();
  }

  draw(aoi) {
    this.aois.set(aoi.id, aoi);
    return aoi;
  }

  edit(id, patch) {
    const current = this.aois.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...patch };
    this.aois.set(id, updated);
    return updated;
  }

  query(id) {
    return this.aois.get(id);
  }
}
