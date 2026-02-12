import * as turf from '@turf/turf';

/**
 * 合并多边形到最小面积
 * @param {Array<String>} wkts - WKT字符串数组
 * @returns {String} 合并后的WKT字符串
 */
export function mergePolygonsToMinArea(wkts) {
  if (wkts.length === 0) {
    throw new Error('WKT数组不能为空');
  }

  // 将WKT转换为GeoJSON
  const features = wkts.map(wkt => {
    try {
      // 简化处理，假设WKT格式正确
      const geojson = parseSimpleWKT(wkt);
      return geojson;
    } catch (e) {
      console.warn('解析WKT失败:', wkt, e);
      return null;
    }
  }).filter(Boolean);

  if (features.length === 0) {
    throw new Error('没有有效的WKT数据');
  }

  // 合并所有多边形
  let merged = features[0];
  for (let i = 1; i < features.length; i++) {
    try {
      merged = turf.union(merged, features[i]);
    } catch (e) {
      console.warn('合并多边形失败:', e);
    }
  }

  return merged;
}

/**
 * 简单的WKT解析（简化版本）
 * @private
 * @param {String} wkt - WKT字符串
 * @returns {Object} GeoJSON Feature
 */
function parseSimpleWKT(wkt) {
  // 简化处理，这里需要完整的WKT解析库
  // 实际项目中应该使用完整的WKT解析器
  try {
    const trimmed = wkt.trim();
    if (trimmed.startsWith('POLYGON')) {
      const coordsStr = trimmed.replace('POLYGON', '').trim().replace(/[()]/g, '');
      const coords = coordsStr.split(',').map(coord => {
        const [x, y] = coord.trim().split(' ').map(Number);
        return [x, y];
      });
      return turf.polygon([coords]);
    }
    throw new Error('不支持的WKT类型');
  } catch (e) {
    throw new Error(`WKT解析失败: ${e.message}`);
  }
}
