const staticMode = {
  onSetup() {
    this.setActionableState(); // default actionable state is false for all actions
    return {};
  },
  toDisplayFeatures(state, geojson, display) {
    display(geojson);
  },
};

export default staticMode;