import CryptoJS from "crypto-js";
import * as turf from "@turf/turf";

const key = CryptoJS.enc.Utf8.parse("RP7qp2wqDxF5U4NgdrcpcpYZqtkPpcRw");
const iv = CryptoJS.enc.Utf8.parse("hrz4uPJUndKqYglW");

const BASE_URL = {
  sit: "https://gis-ass-dqs.sit.sf-express.com/emap/",
  prod: "https://gis-ass-dqs.sf-express.com/emap/",
};

const prefix = "sfmap-admin-layer-";

// 默认样式配置
const DEFAULT_STYLE = {
  fillColor: "#1890ff",
  fillOpacity: 0.15,
  lineColor: "#1890ff",
  lineWidth: 2,
  lineOpacity: 1,
  lineDashArray: [1, 0],
  minzoom: 2,
  maxzoom: 22,
};

// 高亮默认样式
const DEFAULT_HIGHLIGHT_STYLE = {
  fillColor: "#ff4d4f",
  fillOpacity: 0.25,
  lineColor: "#ff4d4f",
  lineWidth: 3,
  lineOpacity: 1,
  lineDashArray: [1, 0],
};

// 中心点默认样式
const DEFAULT_CENTER_STYLE = {
  radius: 6,
  color: "#1890ff",
  strokeColor: "#fff",
  strokeWidth: 2,
  opacity: 0.9,
};

/**
 * 展示模式常量
 */
export const DISPLAY_MODES = {
  POLYGON: 'polygon',    // 仅显示多边形（边框+填充）
  CENTER: 'center',      // 仅显示中心点
  BOTH: 'both',          // 同时显示多边形和中心点
};

/**
 * @class AdminPlugin
 * @classdesc 行政区划展示插件 - 用于在地图上加载、展示和操作行政区划数据
 * 
 * 核心功能：
 * 1. 行政区划数据加载 - 支持批量加载，自动解密和解析
 * 2. 多层级展示 - 支持多边形、中心点、双显三种模式
 * 3. 交互功能 - 点击高亮、鼠标悬停提示
 * 4. 样式定制 - 支持自定义填充色、边框、透明度等
 * 5. 旧版兼容 - 提供完整的旧版API兼容
 */
export class AdminPlugin {
  /**
   * 构造函数
   * @param {Object} params - 初始化参数
   * @param {SFMap.Map} params.map - Mapbox地图实例（必填）
   * @param {String} [params.env='sit'] - 环境参数：'sit'测试环境，'prod'生产环境
   * @param {String} [params.baseUrl=''] - 自定义服务地址，优先级高于env
   * @param {Object} [params.defaultStyle] - 默认渲染样式
   * @param {Object} [params.highlightStyle] - 高亮渲染样式
   * @param {String} [params.displayMode='both'] - 展示模式：'polygon'仅多边形, 'center'仅中心点, 'both'两者都显示
   * @param {Object} [params.centerStyle] - 中心点样式配置
   */
  constructor(params = {}) {
    if (!params.map) {
      throw new Error("AdminPlugin: map参数不能为空！");
    }

    this.map = params.map;
    this.baseUrl = params.baseUrl || BASE_URL[params.env || "sit"];

    // 样式配置
    this.defaultStyle = { ...DEFAULT_STYLE, ...(params.defaultStyle || {}) };
    this.highlightStyle = { ...DEFAULT_HIGHLIGHT_STYLE, ...(params.highlightStyle || {}) };
    this.centerStyle = { ...DEFAULT_CENTER_STYLE, ...(params.centerStyle || {}) };

    // 展示模式配置
    this.displayMode = Object.values(DISPLAY_MODES).includes(params.displayMode)
      ? params.displayMode
      : DISPLAY_MODES.BOTH;

    // 数据存储
    this._districts = new Map(); // adcode -> {data, style, geojson}
    this._highlightedCodes = new Set();
    this._eventListeners = new Map();

    // 初始化
    this._init();
  }

  /**
   * 初始化插件
   * @private
   */
  _init() {
    this._initSources();
    this._bindEvents();
  }

  /**
   * 初始化数据源
   * @private
   */
  _initSources() {
    // 多边形数据源
    this.map.addSource(`${prefix}polygon`, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // 高亮多边形数据源
    this.map.addSource(`${prefix}highlight`, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // 中心点数据源
    this.map.addSource(`${prefix}center`, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // 高亮中心点数据源
    this.map.addSource(`${prefix}center-highlight`, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }

  /**
   * 添加图层
   * @private
   */
  _addLayers() {
    const { minzoom, maxzoom } = this.defaultStyle;

    // 多边形填充层
    if (!this.map.getLayer(`${prefix}polygon-fill`)) {
      this.map.addLayer({
        id: `${prefix}polygon-fill`,
        source: `${prefix}polygon`,
        type: "fill",
        minzoom,
        maxzoom,
        paint: {
          "fill-color": ["get", "fillColor"],
          "fill-opacity": ["get", "fillOpacity"],
        },
      });
    }

    // 多边形边界层
    if (!this.map.getLayer(`${prefix}polygon-line`)) {
      this.map.addLayer({
        id: `${prefix}polygon-line`,
        source: `${prefix}polygon`,
        type: "line",
        minzoom,
        maxzoom,
        paint: {
          "line-color": ["get", "lineColor"],
          "line-width": ["get", "lineWidth"],
          "line-opacity": ["get", "lineOpacity"],
          "line-dasharray": ["get", "lineDashArray"],
        },
      });
    }

    // 高亮多边形填充层
    if (!this.map.getLayer(`${prefix}highlight-fill`)) {
      this.map.addLayer({
        id: `${prefix}highlight-fill`,
        source: `${prefix}highlight`,
        type: "fill",
        minzoom,
        maxzoom,
        paint: {
          "fill-color": this.highlightStyle.fillColor,
          "fill-opacity": this.highlightStyle.fillOpacity,
        },
      });
    }

    // 高亮多边形边界层
    if (!this.map.getLayer(`${prefix}highlight-line`)) {
      this.map.addLayer({
        id: `${prefix}highlight-line`,
        source: `${prefix}highlight`,
        type: "line",
        minzoom,
        maxzoom,
        paint: {
          "line-color": this.highlightStyle.lineColor,
          "line-width": this.highlightStyle.lineWidth,
          "line-opacity": this.highlightStyle.lineOpacity,
        },
      });
    }

    // 中心点图层
    if (!this.map.getLayer(`${prefix}center`)) {
      this.map.addLayer({
        id: `${prefix}center`,
        source: `${prefix}center`,
        type: "circle",
        minzoom,
        maxzoom,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "color"],
          "circle-stroke-color": ["get", "strokeColor"],
          "circle-stroke-width": ["get", "strokeWidth"],
          "circle-opacity": ["get", "opacity"],
        },
      });
    }

    // 高亮中心点图层
    if (!this.map.getLayer(`${prefix}center-highlight`)) {
      this.map.addLayer({
        id: `${prefix}center-highlight`,
        source: `${prefix}center-highlight`,
        type: "circle",
        minzoom,
        maxzoom,
        paint: {
          "circle-radius": ["+", ["get", "radius"], 3],
          "circle-color": this.highlightStyle.fillColor,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
          "circle-opacity": 1,
        },
      });
    }
  }

  /**
   * 检查图层是否存在
   * @private
   * @returns {Boolean}
   */
  _layersExist() {
    return this.map.getLayer(`${prefix}polygon-fill`) !== undefined;
  }

  /**
   * 获取可查询的图层列表
   * @private
   * @returns {Array<String>}
   */
  _getQueryLayers() {
    if (!this._layersExist()) return [];

    const showPolygon = this.displayMode === DISPLAY_MODES.POLYGON || this.displayMode === DISPLAY_MODES.BOTH;
    const showCenter = this.displayMode === DISPLAY_MODES.CENTER || this.displayMode === DISPLAY_MODES.BOTH;

    const layers = [];
    if (showPolygon && this.map.getLayer(`${prefix}polygon-fill`)) {
      layers.push(`${prefix}polygon-fill`);
    }
    if (showCenter && this.map.getLayer(`${prefix}center`)) {
      layers.push(`${prefix}center`);
    }
    return layers;
  }

  /**
   * 绑定地图事件
   * @private
   */
  _bindEvents() {
    // 点击事件
    this._onClick = (e) => {
      const layers = this._getQueryLayers();
      if (layers.length === 0) return;

      const features = this.map.queryRenderedFeatures(e.point, { layers });

      if (features.length > 0) {
        const feature = features[0];
        const adcode = feature.properties.adCode;
        const district = this._districts.get(adcode);

        if (district) {
          const { geojson, ...safeDistrict } = district;
          this._triggerEvent("featureClick", {
            adcode,
            data: safeDistrict.data,
            style: safeDistrict.style,
            originalEvent: e,
          });

          // 触发高亮
          this.highlightDistricts([adcode]);
        }
      } else {
        // 点击空白处清除高亮
        this.clearHighlight();
      }
    };

    // 鼠标移入事件
    this._onMouseMove = (e) => {
      const layers = this._getQueryLayers();
      if (layers.length === 0) return;

      const features = this.map.queryRenderedFeatures(e.point, { layers });

      if (features.length > 0) {
        const feature = features[0];
        const adcode = feature.properties.adCode;
        const district = this._districts.get(adcode);

        if (district) {
          this.map.getCanvas().style.cursor = "pointer";
          const { geojson, ...safeDistrict } = district;
          this._triggerEvent("featureMouseOver", {
            adcode,
            data: safeDistrict.data,
            style: safeDistrict.style,
            originalEvent: e,
          });
        }
      } else {
        this.map.getCanvas().style.cursor = "";
      }
    };

    // 鼠标移出事件
    this._onMouseOut = (e) => {
      const layers = this._getQueryLayers();
      if (layers.length === 0) return;

      const features = this.map.queryRenderedFeatures(e.point, { layers });

      if (features.length === 0) {
        this._triggerEvent("featureMouseOut", { originalEvent: e });
      }
    };

    this.map.on("click", this._onClick);
    this.map.on("mousemove", this._onMouseMove);
    this.map.on("mouseout", this._onMouseOut);
  }

  /**
   * 触发事件
   * @private
   */
  _triggerEvent(eventName, data) {
    const listeners = this._eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * 根据adcode获取行政区划完整数据
   * @param {String} adcode - 行政区划编码
   * @returns {Object|null} 包含属性信息的对象
   */
  getDistrictData(adcode) {
    const district = this._districts.get(adcode);
    if (district) {
      const { geojson, ...safeDistrict } = district;
      return {
        ...this._getSafetyData(safeDistrict.data),
      };
    }
    return null;
  }

  /**
   * 获取安全的数据字段
   * @private
   */
  _getSafetyData(data) {
    const keys = ['adCode', 'adcodeP', 'centerx', 'centery', 'childs', 'cityCode', 'level', 'name', 'nameP', 'bbox']
    let res = {}
    for (let key of keys) {
      if (data[key]) {
        res[key] = data[key]
      }
    }
    return res
  }

  /**
   * 获取当前地图视窗内所有已渲染的行政区划要素
   * @returns {Array} 要素数组，每个包含adcode及当前渲染样式
   */
  getRenderedFeatures() {
    const features = [];
    this._districts.forEach((district, adcode) => {
      const { geojson, ...safeDistrict } = district;
      features.push({
        ...this._getSafetyData(safeDistrict.data)
      });
    });
    return features;
  }

  /**
   * 添加行政区划并渲染
   * @param {Array<String>} adcodeList - 行政区划编码数组
   * @param {Object} [styleOptions] - 样式配置
   * @param {Object} [styleOptions.style] - 自定义样式
   * @param {Function} [styleOptions.loadedCallback] - 加载完成回调
   * @returns {Promise} 加载完成的Promise
   */
  async addDistricts(adcodeList, styleOptions = {}) {
    if (!Array.isArray(adcodeList) || adcodeList.length === 0) {
      console.warn("AdminPlugin: adcodeList不能为空");
      return;
    }

    // 确保图层已添加
    this._addLayers();

    // 批量获取数据（每批30个）
    const batchSize = 30;
    const promises = [];

    for (let i = 0; i < adcodeList.length; i += batchSize) {
      const batch = adcodeList.slice(i, i + batchSize);
      promises.push(this._fetchDistrictData(batch));
    }

    const results = await Promise.all(promises);
    const allData = results.flat();

    // 解析并存储数据
    allData.forEach((item) => {
      if (item.code === 200 && item.data) {
        item.data.forEach((district) => {
          try {
            const geojson = JSON.parse(this._decrypt(district.geoJson));
            const [xmin, ymin, xmax, ymax] = turf.bbox(geojson);

            const style = {
              ...this.defaultStyle,
              ...(styleOptions.style || {}),
              ...(district.style || {}),
            };

            this._districts.set(district.adCode, {
              data: {
                ...district,
                bbox: [
                  [xmin, ymin],
                  [xmax, ymax],
                ],
              },
              geojson,
              style,
              feature: null,
              centerFeature: null,
            });
          } catch (e) {
            console.error(`AdminPlugin: 解析${district.adCode}数据失败`, e);
          }
        });
      }
    });

    // 更新地图显示
    this._updateMapData();

    if (styleOptions.loadedCallback) {
      styleOptions.loadedCallback(this.getRenderedFeatures());
    }

    return this.getRenderedFeatures();
  }

  /**
   * 根据adcode数组移除指定行政区划
   * @param {Array<String>} adcodeList - 要移除的行政区划编码数组
   */
  removeDistricts(adcodeList) {
    if (!Array.isArray(adcodeList)) return;

    adcodeList.forEach((adcode) => {
      this._districts.delete(adcode);
      this._highlightedCodes.delete(adcode);
    });

    this._updateMapData();
  }

  /**
   * 更新指定行政区划的渲染样式
   * @param {String} adcode - 行政区划编码
   * @param {Object} styleOptions - 新的样式配置
   * @param {String} [styleOptions.fillColor] - 填充颜色
   * @param {Number} [styleOptions.fillOpacity] - 填充透明度
   * @param {String} [styleOptions.lineColor] - 边框颜色
   * @param {Number} [styleOptions.lineWidth] - 边框宽度
   * @param {Number} [styleOptions.lineOpacity] - 边框透明度
   * @returns {Boolean} 是否更新成功
   */
  updateDistrictStyle(adcode, styleOptions) {
    const district = this._districts.get(adcode);
    if (!district) {
      console.warn(`AdminPlugin: 未找到行政区划${adcode}`);
      return false;
    }

    district.style = { ...district.style, ...styleOptions };
    this._updateMapData();
    return true;
  }

  /**
   * 高亮显示指定行政区划
   * @param {Array<String>} adcodeList - 要高亮的行政区划编码数组
   */
  highlightDistricts(adcodeList) {
    if (!Array.isArray(adcodeList)) return;

    this._highlightedCodes = new Set(adcodeList);
    this._updateHighlightData();
  }

  /**
   * 清除高亮
   */
  clearHighlight() {
    this._highlightedCodes.clear();
    this._updateHighlightData();
  }

  /**
   * 清除所有已渲染的行政区划
   */
  clearAll() {
    this._districts.clear();
    this._highlightedCodes.clear();
    this._updateMapData();
  }

  /**
   * 更新地图数据
   * @private
   */
  _updateMapData() {
    const polygonFeatures = [];
    const centerFeatures = [];

    const showPolygon = this.displayMode === DISPLAY_MODES.POLYGON || this.displayMode === DISPLAY_MODES.BOTH;
    const showCenter = this.displayMode === DISPLAY_MODES.CENTER || this.displayMode === DISPLAY_MODES.BOTH;

    this._districts.forEach((district, adcode) => {
      const { geojson, style, data } = district;

      // 多边形要素
      if (showPolygon) {
        polygonFeatures.push({
          type: "Feature",
          properties: {
            adCode: adcode,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            lineColor: style.lineColor,
            lineWidth: style.lineWidth,
            lineOpacity: style.lineOpacity,
            lineDashArray: style.lineDashArray || [1, 0],
            name: data.name,
            level: data.level,
          },
          geometry: geojson,
        });
      }

      // 中心点要素
      if (showCenter) {
        const center = data.centerx && data.centery
          ? [parseFloat(data.centerx), parseFloat(data.centery)]
          : turf.center(geojson).geometry.coordinates;

        centerFeatures.push({
          type: "Feature",
          properties: {
            adCode: adcode,
            radius: this.centerStyle.radius,
            color: this.centerStyle.color,
            strokeColor: this.centerStyle.strokeColor,
            strokeWidth: this.centerStyle.strokeWidth,
            opacity: this.centerStyle.opacity,
            name: data.name,
            level: data.level,
          },
          geometry: {
            type: "Point",
            coordinates: center,
          },
        });
      }
    });

    // 更新数据源
    this.map.getSource(`${prefix}polygon`).setData({
      type: "FeatureCollection",
      features: polygonFeatures,
    });

    this.map.getSource(`${prefix}center`).setData({
      type: "FeatureCollection",
      features: centerFeatures,
    });

    // 更新高亮数据
    this._updateHighlightData();
  }

  /**
   * 更新高亮数据
   * @private
   */
  _updateHighlightData() {
    const highlightPolygonFeatures = [];
    const highlightCenterFeatures = [];

    const showPolygon = this.displayMode === DISPLAY_MODES.POLYGON || this.displayMode === DISPLAY_MODES.BOTH;
    const showCenter = this.displayMode === DISPLAY_MODES.CENTER || this.displayMode === DISPLAY_MODES.BOTH;

    this._highlightedCodes.forEach((adcode) => {
      const district = this._districts.get(adcode);
      if (!district) return;

      const { geojson, data } = district;

      if (showPolygon) {
        highlightPolygonFeatures.push({
          type: "Feature",
          properties: { adCode: adcode, name: data.name },
          geometry: geojson,
        });
      }

      if (showCenter) {
        const center = data.centerx && data.centery
          ? [parseFloat(data.centerx), parseFloat(data.centery)]
          : turf.center(geojson).geometry.coordinates;

        highlightCenterFeatures.push({
          type: "Feature",
          properties: {
            adCode: adcode,
            radius: this.centerStyle.radius,
            name: data.name,
          },
          geometry: {
            type: "Point",
            coordinates: center,
          },
        });
      }
    });

    this.map.getSource(`${prefix}highlight`).setData({
      type: "FeatureCollection",
      features: highlightPolygonFeatures,
    });

    this.map.getSource(`${prefix}center-highlight`).setData({
      type: "FeatureCollection",
      features: highlightCenterFeatures,
    });
  }

  /**
   * 设置展示模式
   * @param {String} mode - 展示模式：'polygon'仅多边形, 'center'仅中心点, 'both'两者都显示
   */
  setDisplayMode(mode) {
    if (!Object.values(DISPLAY_MODES).includes(mode)) {
      console.warn(`AdminPlugin: 无效的展示模式 '${mode}'，可选值: polygon, center, both`);
      return;
    }
    this.displayMode = mode;
    this._updateMapData();
  }

  /**
   * 设置仅显示中心点模式（旧版兼容方法）
   * @param {Boolean} enabled - 是否启用
   */
  setShowCenterOnly(enabled) {
    this.setDisplayMode(enabled ? DISPLAY_MODES.CENTER : DISPLAY_MODES.BOTH);
  }

  /**
   * 事件监听
   * @param {String} event - 事件名称：'featureClick' | 'featureMouseOver' | 'featureMouseOut'
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(callback);
  }

  /**
   * 取消事件监听
   * @param {String} event - 事件名称
   * @param {Function} [callback] - 回调函数（可选，不传则移除所有该事件监听）
   */
  off(event, callback) {
    if (!callback) {
      this._eventListeners.delete(event);
    } else {
      const listeners = this._eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    }
  }

  /**
   * 根据编码获取数据（Promise方式，保留旧版兼容）
   * @param {Array<String>} adcodes - 区划编码数组
   * @param {String} [level=''] - 区划级别过滤
   * @returns {Promise<Array<Object>>}
   */
  getCodesData(adcodes, level = "") {
    return this.addDistricts(adcodes).then((features) => {
      if (level) {
        return features.filter((f) => f.data.level === level);
      }
      return features;
    });
  }

  /**
   * 根据adcode显示行政区划（旧版兼容方法）
   * @param {Array} adcodes - 区划编码数组
   * @param {Object} params - 配置参数
   * @param {Object} [params.style] - 自定义样式
   * @param {Object} [params.styleRules] - 按adcode的样式规则
   * @param {Function} [params.loadedCallback] - 加载完成回调
   * @param {Function} [params.clickCallback] - 点击回调
   * @param {Function} [params.mousemoveCallback] - 鼠标移动回调
   */
  showAdminByCodes(adcodes, params = {}) {
    const style = params.style || {};
    const styleRules = params.styleRules || {};

    // 应用样式规则
    adcodes.forEach((adcode) => {
      if (styleRules[adcode]) {
        Object.assign(style, styleRules[adcode]);
      }
    });

    this.addDistricts(adcodes, {
      style,
      loadedCallback: params.loadedCallback,
    });

    // 绑定事件回调
    if (params.clickCallback) {
      this.on("featureClick", (e) => params.clickCallback(e.data));
    }
    if (params.mousemoveCallback) {
      this.on("featureMouseOver", (e) => params.mousemoveCallback(e.data));
    }
  }

  /**
   * 根据编码高亮（旧版兼容方法）
   * @param {Array} [adCodes=[]] - 需要高亮的编码
   */
  highlighByCodes(adCodes = []) {
    this.highlightDistricts(adCodes);
  }

  /**
   * 设置点击回调（旧版兼容方法）
   * @param {Function|null} callback
   */
  setClickCallback(callback) {
    if (callback) {
      this.on("featureClick", (e) => callback(e.data));
    }
  }

  /**
   * 设置鼠标移动回调（旧版兼容方法）
   * @param {Function|null} callback
   */
  setMousemoveCallback(callback) {
    if (callback) {
      this.on("featureMouseOver", (e) => callback(e.data));
    }
  }

  /**
   * 清除展示（旧版兼容方法）
   */
  clear() {
    this.clearAll();
  }

  /**
   * 获取行政区划数据（内部方法）
   * @private
   */
  _fetchDistrictData(adcodes) {
    const url = `${this.baseUrl}api/efsms/getDtsByAdcodes?subdistrict=0&isCenter=1&isGeom=1&adcodes=${adcodes.join(",")}`;
    return fetch(url).then((res) => res.json());
  }

  /**
   * 解密数据
   * @private
   */
  _decrypt(word) {
    word = decodeURIComponent(word);
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypt.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 销毁插件
   */
  destroy() {
    // 移除事件监听
    this.map.off("click", this._onClick);
    this.map.off("mousemove", this._onMouseMove);
    this.map.off("mouseout", this._onMouseOut);

    // 移除图层
    const layers = [
      `${prefix}polygon-fill`,
      `${prefix}polygon-line`,
      `${prefix}highlight-fill`,
      `${prefix}highlight-line`,
      `${prefix}center`,
      `${prefix}center-highlight`,
    ];

    layers.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    // 移除数据源
    const sources = [
      `${prefix}polygon`,
      `${prefix}highlight`,
      `${prefix}center`,
      `${prefix}center-highlight`,
    ];

    sources.forEach((sourceId) => {
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    });

    // 清理数据
    this._districts.clear();
    this._highlightedCodes.clear();
    this._eventListeners.clear();
  }

  // 旧版拼写兼容
  destory() {
    this.destroy();
  }
}
