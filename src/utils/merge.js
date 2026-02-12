import { wktToGeoJSON } from "@terraformer/wkt";

// 辅助函数：从WKT字符串中提取坐标点
function extractPointsFromWKT(wkt) {
  const geojson = wktToGeoJSON(wkt);
  return extractPointsFromGeojson(geojson);
}

function extractPointsFromGeojson(geojson) {
  if (geojson.type === "Feature") {
    geojson = geojson.geometry;
  }
  let points = [];
  if (geojson.type === "MultiPolygon") {
    for (const polygon of geojson.coordinates) {
      points.push(
        ...extractPointsFromGeojson({ type: "Polygon", coordinates: polygon })
      );
    }
    return points;
  }
  for (const coordinates of geojson.coordinates) {
    for (const coords of coordinates) {
      points.push({ x: coords[0], y: coords[1] });
    }
  }
  return points;
}
// 计算凸包算法（Andrew's monotone chain算法）
function convexHull(points) {
  if (points.length <= 3) return points;

  points.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));

  const lower = [];
  for (const p of points) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();

  return lower.concat(upper);
}
// 计算叉积
function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
// 将点集转换为WKT格式
function pointsToWKT(points) {
  const coords = points.map((p) => `${p.x} ${p.y}`).join(",");
  return `POLYGON ((${coords},${points[0].x} ${points[0].y}))`;
}
// 主函数：合并所有多边形
export function mergePolygonsToMinArea(wktArray) {
  let allPoints = [];
  // 提取所有点
  // WKT
  for (const wkt of wktArray) {
    const points = extractPointsFromWKT(wkt);
    allPoints.push(...points);
  }
  // 计算凸包
  const hull = convexHull(allPoints);

  // 转换为WKT
  return pointsToWKT(hull);
}
