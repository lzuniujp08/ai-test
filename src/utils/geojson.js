class Geojson {
  constructor(features = []) {
    this.type = 'FeatureCollection'
    this.features = features
  }
}

class Point {
  constructor(properties, coordinates = []) {
    this.type = "Feature"
    this.properties = properties
    this.geometry = {
      "type": "Point",
      "coordinates": coordinates
    }
  }
}

class LineString {
  constructor(properties, coordinates = []) {
    this.type = "Feature"
    this.properties = properties
    this.geometry = {
      "type": "LineString",
      "coordinates": coordinates
    }
  }
}

class Polygon {
  constructor(properties, coordinates = []) {
    this.type = "Feature"
    this.properties = properties
    this.geometry = {
      "type": "Polygon",
      "coordinates": coordinates
    }
  }
}

class Feature {
  constructor(properties, geometry) {
    this.type = "Feature"
    this.properties = properties
    this.geometry = geometry
  }
}

const GEOMETRY_TYPE ={
  POINT: 'Point',
  LINESTRING: 'LineString',
  MULTILINESTRING: 'MultiLineString',
  POLYGON: 'Polygon',
  MULTIPOLYGON: 'MultiPolygon'
}

class Geometry {
  constructor(type, coordinates) {
    this.type = type
    this.coordinates = coordinates
  }
}

class FeatureNew {
  constructor(geomType, properties, geometry) {
    this.type = 'Feature'
    this.properties = properties
    this.geometry = Array.isArray(geometry) ? new Geometry(geomType, geometry) : geometry
  }
}

export {
  Geojson,
  Point,
  LineString,
  Polygon,
  Feature,
  FeatureNew,
  GEOMETRY_TYPE
}
