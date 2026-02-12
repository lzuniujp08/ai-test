import mapboxDraw from "@mapbox/mapbox-gl-draw";
const DrawPolygon = mapboxDraw.modes.draw_polygon;
const Constants = mapboxDraw.constants;
const { events } = Constants;

// 拖拽画矩形模式
const rectMode = Object.assign({}, DrawPolygon);

rectMode.onSetup = function () {
  const polygon = this.newFeature({
    type: "Feature",
    properties: {
      firstPoint: [],
    },
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  });
  this.addFeature(polygon);
  // disable dragPan
  setTimeout(() => {
    if (!this.map || !this.map.dragPan) return;
    this.map.dragPan.disable();
  }, 0);

  this.setActionableState({
    trash: true,
  });

  return {
    polygon,
    currentVertexPosition: 0,
  };
};

rectMode.onMouseDown = rectMode.onTouchStart = function (state, e) {
  const firstPoint = state.polygon.properties.firstPoint;
  if (firstPoint.length === 0) {
    state.polygon.properties.firstPoint = [e.lngLat.lng, e.lngLat.lat];
  }
};

rectMode.onDrag = rectMode.onMouseMove = function (state, e) {
  const firstPoint = state.polygon.properties.firstPoint;
  if (firstPoint.length > 0) {
    const [x1, y1] = firstPoint;
    const { lng, lat } = e.lngLat;
    state.polygon.incomingCoords([
      [
        [x1, y1],
        [x1, lat],
        [lng, lat],
        [lng, y1],
        [x1, y1],
      ],
    ]);
  }
};

rectMode.onMouseUp = rectMode.onTouchEnd = function (state, e) {
  const firstPoint = state.polygon.properties.firstPoint;
  if (firstPoint.length > 0) {
    const [x1, y1] = firstPoint;
    const { lng, lat } = e.lngLat;
    state.polygon.coordinates = [
      [
        [x1, y1],
        [x1, lat],
        [lng, lat],
        [lng, y1],
        [x1, y1],
      ],
    ];
    setTimeout(() => {
      if (!this.map || !this.map.dragPan) return;
      this.map.dragPan.enable();
    }, 100);
    const { type, id, coordinates} = state.polygon;
    const feature = {
      id: id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: coordinates,
        type: type,
      },
    };
    this.map.fire(events.CREATE, {
      features: [feature],
    });
    return this.changeMode(this.drawConfig.defaultMode, {
      featureIds: [state.polygon.id],
    });
  }
};

rectMode.onClick = rectMode.onTap = function (state, e) {
  // don't draw the circle if its a tap or click event
  state.polygon.properties.firstPoint = [];
};

rectMode.onStop = function (state) {
  if (!this.map || !this.map.dragPan) return;
  this.map.dragPan.enable();
  DrawPolygon.onStop.call(this, state);
};

export default rectMode;
