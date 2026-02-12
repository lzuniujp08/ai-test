import uuid from "../../../src/utils/uuid";
import proj4 from "proj4";

/**
 * 图层名称映射表
 * 1: 7天热力图
 * 2: 15天热力图
 * 3: 30天热力图
 * 4: 90天热力图
 */
const LAYER_NAMES = {
  1: "aoi:aoi_hot_pic_week",
  2: "aoi:aoi_hot_pic_15_days",
  3: "aoi:aoi_hot_pic_month",
  4: "aoi:aoi_hot_pic_3_month",
};

/**
 * 城市分片规则映射表
 * 用于根据城市编码获取对应的分片索引
 */
const LAYER_INDEX_CIDY_CODE = {
  "01": ["028", "515", "021", "856", "812", "768", "053", "799"],
  "02": ["513", "010", "023", "893", "973", "975", "976"],
  "03": ["576", "020", "512", "510", "977", "895", "974"],
  "04": ["519", "769", "571", "573", "993", "896", "086"],
  "05": ["029", "523", "574", "532", "901", "906", "469"],
  "06": ["577", "022", "536", "024", "516", "8983"],
  "07": ["514", "539", "752", "755", "517", "535", "8982"],
  "08": ["595", "511", "579", "377", "371", "027", "897"],
  "09": ["757", "558", "527", "025", "394", "551", "317", "886"],
  "10": ["531", "530", "750", "311", "537", "575", "315", "777", "468", "998", "779", "353", "438", "456"],
  "11": ["631", "396", "370", "760", "871", "312", "771", "316", "875", "634", "743", "933", "879", "996", "876", "439", "414", "701"],
  "12": ["534", "572", "635", "431", "518", "533", "913", "817", "763", "591", "550", "359", "744", "930", "562", "436", "837", "711", "467"],
  "13": ["716", "7311", "351", "411", "712", "379", "476", "314", "556", "759", "319", "543", "692", "835", "891", "798", "892", "482", "952", "392", "997"],
  "14": ["570", "816", "596", "553", "376", "791", "797", "451", "898", "357", "751", "313", "831", "758", "563", "691", "902", "458", "954", "770", "883"],
  "15": ["851", "632", "719", "746", "471", "592", "931", "710", "557", "778", "538", "717", "991", "578", "374", "912", "310", "955", "437", "853", "836", "790", "473", "483"],
  "16": ["318", "795", "564", "917", "335", "594", "753", "773", "354", "373", "715", "052", "830", "772", "375", "391", "735", "972", "990", "919", "088", "909", "887", "457"],
  "17": ["775", "852", "762", "916", "833", "350", "355", "555", "713", "429", "663", "597", "718", "474", "793", "378", "796", "472", "951", "633", "941", "903", "995", "464", "979"],
  "18": ["756", "358", "722", "546", "838", "736", "412", "754", "792", "813", "668", "432", "559", "728", "857", "734", "554", "739", "911", "766", "477", "730", "475", "416", "855", "894", "970", "992"],
  "19": ["479", "372", "417", "724", "470", "839", "356", "825", "393", "873", "874", "794", "971", "8981", "418", "832", "935", "660", "352", "552", "774", "915", "834", "433", "934", "395", "826", "827", "937", "745", "908"],
  "20": ["818", "459", "566", "854", "872", "421", "398", "662", "478", "859", "455", "877", "936", "7313", "737", "419", "776", "434", "580", "452", "599", "870", "561", "932", "938", "453", "953", "7312", "349", "858", "435", "878", "999", "593", "943", "914", "714", "598", "738", "454", "994", "427", "939", "415"],
  default: [],
};

/**
 * 城市编码到分片索引的缓存映射
 */
const CIDY_CODE_LAYER_INDEX = {};

/**
 * 根据城市编码获取对应的分片索引
 * @param {String} cityCode - 城市编码，如 '755'
 * @returns {String} 分片索引，如 '07' 或 'default'
 */
function getLayerIndexByCityCode(cityCode) {
  if (CIDY_CODE_LAYER_INDEX[cityCode]) {
    return CIDY_CODE_LAYER_INDEX[cityCode];
  }
  for (const layerIndex in LAYER_INDEX_CIDY_CODE) {
    const cityCodes = LAYER_INDEX_CIDY_CODE[layerIndex];
    if (cityCodes.indexOf(cityCode) > -1) {
      CIDY_CODE_LAYER_INDEX[cityCode] = layerIndex;
      return layerIndex;
    }
  }
  CIDY_CODE_LAYER_INDEX[cityCode] = "default";
  return "default";
}

/**
 * 初始化城市编码到分片索引的映射缓存
 */
(function initCityCodeLayerIndex() {
  for (const layerIndex in LAYER_INDEX_CIDY_CODE) {
    const cityCodes = LAYER_INDEX_CIDY_CODE[layerIndex];
    for (let i = 0; i < cityCodes.length; i++) {
      const cityCode = cityCodes[i];
      CIDY_CODE_LAYER_INDEX[cityCode] = layerIndex;
    }
  }
})();

/**
 * WMS服务基础地址配置
 */
const BASE_URL_DICT = {
  sit: "http://gis-inner-map.sit.sf-express.com/non-std/gis",
  prod: "https://gis-inner-map.sf-express.com/non-std/gis",
};

/**
 * 收派件类型映射
 * 1: 收件
 * 2: 派件
 * 3: 收派件
 */
const TYPE_DICT = {
  1: "收件",
  2: "派件",
  3: "收派件",
};

/**
 * 时间范围索引映射
 * 1: 7天
 * 2: 15天
 * 3: 30天
 * 4: 90天
 */
const LAYER_INDEX_DICT = {
  1: "7天",
  2: "15天",
  3: "30天",
  4: "90天",
};

/**
 * 地图视图范围padding（像素）
 * 用于在地图视图基础上扩展请求范围，确保边缘数据完整
 */
const VIEW_PADDING = 100;

/**
 * 更新延迟时间（毫秒）
 * 防止地图连续移动时频繁请求
 */
const UPDATE_DELAY = 300;

/**
 * @class HeatmapPlugin
 * @classdesc AOI热力图WMS图层插件，可实现收件热力、派件热力以及收派件热力图的展示
 * 采用单张图片模式，根据当前地图视图范围动态请求完整热力图，避免瓦片拼接问题
 * @param {Object} map - Mapbox地图实例
 * @param {Object} params - 初始化参数
 * @param {String} params.cityCode - 城市编码，如 '755'，必填
 * @param {String} [params.zoneCode] - 网点编码，如 '755AC'，选填
 * @param {Number} [params.layerIndex=1] - 时间范围索引：1-7天, 2-15天, 3-30天, 4-90天
 * @param {Number} [params.type=1] - 收派件类型：1-收件, 2-派件, 3-收派件
 * @param {String} [params.env='prod'] - 环境标识：'prod'-生产环境, 'sit'-测试环境
 * @param {String} [params.baseUrl] - 自定义基础URL，优先级高于env
 * @param {Number} [params.minZoom=8] - 最小显示级别
 * @param {Number} [params.maxZoom=22] - 最大显示级别
 * @param {Number} [params.opacity=0.8] - 图层透明度
 * @param {Function} [params.loadCallback] - 图层加载完成回调
 */
export class HeatmapPlugin {
  constructor(map, params = {}) {
    // 参数校验
    if (!map) {
      throw new Error("map参数不能为空！");
    }
    if (!params.cityCode) {
      throw new Error("cityCode参数不能为空！");
    }

    this.map = map;

    // 合并默认参数
    this.params = {
      cityCode: params.cityCode,
      zoneCode: params.zoneCode || "",
      layerIndex: params.layerIndex || 1,
      type: params.type || 1,
      env: params.env || "prod",
      baseUrl: params.baseUrl || "",
      minZoom: params.minZoom || 8,
      maxZoom: params.maxZoom || 22,
      opacity: params.opacity || 0.8,
      loadCallback: params.loadCallback || null,
    };

    // 生成唯一标识
    this.layerId = `aoi-wms-heatmap-${uuid()}`;
    this.sourceId = `aoi-wms-heatmap-source-${uuid()}`;

    // 绑定地图事件处理函数（用于后续解绑）
    this._boundOnMapMove = this._onMapMove.bind(this);
    this._boundUpdateHeatmap = this._updateHeatmap.bind(this);

    // 初始化状态
    this.isVisible = true;
    this.isAdded = false;
    this.updateTimer = null;
    this.currentImageUrl = null;

    // 初始化图层
    this._init();
  }

  /**
   * 初始化插件
   * @private
   */
  _init() {
    // 获取基础URL
    this.baseUrl = this.params.baseUrl || BASE_URL_DICT[this.params.env];

    // 添加WMS图层到地图
    this._addWmsLayer();

    // 注册地图事件监听
    this._registerMapEvents();

    // 执行加载回调
    if (this.params.loadCallback) {
      this.params.loadCallback.call(this, {
        layerId: this.layerId,
        sourceId: this.sourceId,
        params: { ...this.params },
      });
    }
  }

  /**
   * 构建完整的WMS请求URL
   * @private
   * @param {Array} bbox - 地图视图范围 [minX, minY, maxX, maxY] (EPSG:3857)
   * @param {Number} width - 图片宽度（像素）
   * @param {Number} height - 图片高度（像素）
   * @returns {String} 完整的WMS URL
   */
  _buildWmsUrl(bbox, width, height) {
    const { cityCode, zoneCode, layerIndex, type, env } = this.params;

    // 1. 获取基础图层名称
    const baseLayerName = LAYER_NAMES[layerIndex] || LAYER_NAMES[1];

    // 2. 获取城市对应的分片索引
    const cityShardIndex = getLayerIndexByCityCode(cityCode);

    // 3. 拼接最终图层名称
    const layers = `${baseLayerName}_${cityShardIndex}`;

    // 4. 构建CQL_FILTER
    // 格式: city_code='{cityCode}' and zc='{zoneCode}' and type='{type}'
    let cqlFilter = `city_code='${cityCode}'`;
    if (zoneCode) {
      cqlFilter += ` and zc='${zoneCode}'`;
    }
    cqlFilter += ` and type='${type}'`;

    // 5. 构建WMS参数
    const wmsParams = {
      // WMS标准参数
      SERVICE: "WMS",
      REQUEST: "GetMap",
      VERSION: "1.1.1",
      LAYERS: layers,
      FORMAT: "image/png",
      TRANSPARENT: "true",

      // 过滤条件
      CQL_FILTER: cqlFilter,

      // 业务参数
      partnerID: "XIAOYI",
      serviceCode: "COM_RECE_GIS_BMAP_LAYER",
      ZONECODE: zoneCode || '',
      CITYCODE: cityCode,
      TYPE: type,
      LAYERINDEX: layerIndex,
      // 地图参数（根据当前视图计算）
      WIDTH: Math.round(width),
      HEIGHT: Math.round(height),
      SRS: "EPSG:3857",
      BBOX: bbox.join(","),
      // 缓存清除参数
      t: Date.now(),
    };

    // 6. 组装完整URL
    const queryString = Object.keys(wmsParams)
      .map((key) => `${key}=${encodeURIComponent(wmsParams[key])}`)
      .join("&");

    return `${this.baseUrl}/layer/aoi/wms?${queryString}`;
  }

  /**
   * 获取当前地图视图范围（EPSG:3857）
   * @private
   * @returns {Object} 包含 bbox、width、height 的对象
   */
  _getMapViewInfo() {
    const canvas = this.map.getCanvas();
    const width = canvas.width;
    const height = canvas.height;

    // 获取地图当前视图的四至范围（考虑padding扩展）
    const bounds = this.map.getBounds();
    
    // 将经纬度转换为 EPSG:3857 (Web Mercator)
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // 使用 proj4 进行 WGS84 到 EPSG:3857 的坐标转换
    // EPSG:3857 (Web Mercator) 投影定义
    const wgs84 = "EPSG:4326";
    const webMercator = "EPSG:3857";

    // 转换边界坐标
    const [minX, minY] = proj4(wgs84, webMercator, [sw.lng, sw.lat]);
    const [maxX, maxY] = proj4(wgs84, webMercator, [ne.lng, ne.lat]);

    // 计算四个角的坐标用于image source的coordinates
    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    return {
      bbox: [minX, minY, maxX, maxY],
      width: width + VIEW_PADDING * 2,
      height: height + VIEW_PADDING * 2,
      coordinates: [
        [nw.lng, nw.lat], // 左上角
        [ne.lng, ne.lat], // 右上角
        [se.lng, se.lat], // 右下角
        [sw.lng, sw.lat], // 左下角
      ],
    };
  }

  /**
   * 添加WMS图片图层到Mapbox
   * 使用image source模式，根据当前视图范围请求单张完整热力图
   * @private
   */
  _addWmsLayer() {
    // 如果已存在，先移除
    if (this.isAdded) {
      this._removeLayer();
    }

    // 获取当前地图视图信息
    const viewInfo = this._getMapViewInfo();

    // 构建WMS URL
    this.currentImageUrl = this._buildWmsUrl(viewInfo.bbox, viewInfo.width, viewInfo.height);

    // 添加图片数据源
    this.map.addSource(this.sourceId, {
      type: "image",
      url: this.currentImageUrl,
      coordinates: viewInfo.coordinates,
    });

    // 添加栅格图层
    this.map.addLayer({
      id: this.layerId,
      type: "raster",
      source: this.sourceId,
      minzoom: this.params.minZoom,
      maxzoom: this.params.maxZoom,
      paint: {
        "raster-opacity": this.params.opacity,
        "raster-fade-duration": 0, // 禁用淡入效果，使更新更即时
      },
      layout: {
        visibility: this.isVisible ? "visible" : "none",
      },
    });

    this.isAdded = true;
  }

  /**
   * 移除图层和数据源
   * @private
   */
  _removeLayer() {
    if (this.map.getLayer(this.layerId)) {
      this.map.removeLayer(this.layerId);
    }
    if (this.map.getSource(this.sourceId)) {
      this.map.removeSource(this.sourceId);
    }
    this.isAdded = false;
  }

  /**
   * 注册地图视图变化事件监听
   * @private
   */
  _registerMapEvents() {
    // 监听地图移动事件（包括拖拽、缩放等）
    this.map.on("move", this._boundOnMapMove);

    // 监听移动结束事件
    this.map.on("moveend", this._boundUpdateHeatmap);

    // 监听缩放结束事件
    this.map.on("zoomend", this._boundUpdateHeatmap);

    // 监听地图尺寸变化
    this.map.on("resize", this._boundUpdateHeatmap);
  }

  /**
   * 地图移动时的处理（节流）
   * @private
   */
  _onMapMove() {
    if (!this.isVisible || !this.isAdded) return;

    // 清除之前的定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    // 延迟更新，避免频繁请求
    this.updateTimer = setTimeout(() => {
      this._updateHeatmap();
    }, UPDATE_DELAY);
  }

  /**
   * 更新热力图（根据当前视图范围重新请求）
   * @private
   */
  _updateHeatmap() {
    if (!this.isVisible || !this.isAdded) return;

    // 检查当前缩放级别是否在有效范围内
    const currentZoom = this.map.getZoom();
    if (currentZoom < this.params.minZoom || currentZoom > this.params.maxZoom) {
      return;
    }

    try {
      // 获取当前视图信息
      const viewInfo = this._getMapViewInfo();

      // 构建新的WMS URL
      const newUrl = this._buildWmsUrl(viewInfo.bbox, viewInfo.width, viewInfo.height);

      // 如果URL没有变化，不更新
      if (newUrl === this.currentImageUrl) {
        return;
      }

      this.currentImageUrl = newUrl;

      // 更新image source的URL和coordinates
      const source = this.map.getSource(this.sourceId);
      if (source) {
        source.updateImage({
          url: newUrl,
          coordinates: viewInfo.coordinates,
        });
      }
    } catch (error) {
      console.warn("更新热力图失败:", error);
    }
  }

  /**
   * 刷新图层（重新构建URL并更新数据源）
   * 当业务参数（cityCode, zoneCode等）发生变化时调用
   * @private
   */
  _refreshLayer() {
    if (!this.isAdded) return;

    // 清除更新定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }

    // 重新加载图层（参数变化后需要重新请求）
    this._updateHeatmap();
  }

  /**
   * 更新城市编码
   * @param {String} cityCode - 新的城市编码
   */
  setCityCode(cityCode) {
    if (!cityCode) {
      console.warn("cityCode不能为空");
      return;
    }
    this.params.cityCode = cityCode;
    this._refreshLayer();
    return this;
  }

  /**
   * 更新网点编码
   * @param {String} zoneCode - 新的网点编码
   */
  setZoneCode(zoneCode) {
    this.params.zoneCode = zoneCode || "";
    this._refreshLayer();
    return this;
  }

  /**
   * 更新时间范围索引
   * @param {Number} layerIndex - 时间范围索引：1-7天, 2-15天, 3-30天, 4-90天
   */
  setLayerIndex(layerIndex) {
    if (!LAYER_NAMES[layerIndex]) {
      console.warn(`无效的layerIndex: ${layerIndex}，使用默认值1`);
      this.params.layerIndex = 1;
    } else {
      this.params.layerIndex = layerIndex;
    }
    this._refreshLayer();
    return this;
  }

  /**
   * 更新收派件类型
   * @param {Number} type - 收派件类型：1-收件, 2-派件, 3-收派件
   */
  setType(type) {
    if (!TYPE_DICT[type]) {
      console.warn(`无效的type: ${type}，使用默认值1`);
      this.params.type = 1;
    } else {
      this.params.type = type;
    }
    this._refreshLayer();
    return this;
  }

  /**
   * 同时更新多个参数
   * @param {Object} params - 参数对象
   * @param {String} [params.cityCode] - 城市编码
   * @param {String} [params.zoneCode] - 网点编码
   * @param {Number} [params.layerIndex] - 时间范围索引
   * @param {Number} [params.type] - 收派件类型
   */
  updateParams(params = {}) {
    let needRefresh = false;

    if (params.cityCode !== undefined && params.cityCode !== this.params.cityCode) {
      this.params.cityCode = params.cityCode;
      needRefresh = true;
    }

    if (params.zoneCode !== undefined && params.zoneCode !== this.params.zoneCode) {
      this.params.zoneCode = params.zoneCode;
      needRefresh = true;
    }

    if (params.layerIndex !== undefined && params.layerIndex !== this.params.layerIndex) {
      if (LAYER_NAMES[params.layerIndex]) {
        this.params.layerIndex = params.layerIndex;
        needRefresh = true;
      } else {
        console.warn(`无效的layerIndex: ${params.layerIndex}`);
      }
    }

    if (params.type !== undefined && params.type !== this.params.type) {
      if (TYPE_DICT[params.type]) {
        this.params.type = params.type;
        needRefresh = true;
      } else {
        console.warn(`无效的type: ${params.type}`);
      }
    }

    if (needRefresh) {
      this._refreshLayer();
    }

    return this;
  }

  /**
   * 获取当前参数
   * @returns {Object} 当前参数副本
   */
  getParams() {
    return { ...this.params };
  }

  /**
   * 显示图层
   */
  show() {
    if (!this.isAdded) {
      this._addWmsLayer();
    } else {
      // 立即更新一次热力图
      this._updateHeatmap();
    }
    if (this.map.getLayer(this.layerId)) {
      this.map.setLayoutProperty(this.layerId, "visibility", "visible");
    }
    this.isVisible = true;
    return this;
  }

  /**
   * 隐藏图层
   */
  hide() {
    if (this.map.getLayer(this.layerId)) {
      this.map.setLayoutProperty(this.layerId, "visibility", "none");
    }
    this.isVisible = false;
    return this;
  }

  /**
   * 切换图层显示/隐藏
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this;
  }

  /**
   * 设置图层透明度
   * @param {Number} opacity - 透明度值 (0-1)
   */
  setOpacity(opacity) {
    this.params.opacity = Math.max(0, Math.min(1, opacity));
    if (this.map.getLayer(this.layerId)) {
      this.map.setPaintProperty(this.layerId, "raster-opacity", this.params.opacity);
    }
    return this;
  }

  /**
   * 销毁插件，清理资源
   */
  destroy() {
    // 清除更新定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }

    // 解绑地图事件
    this.map.off("move", this._boundOnMapMove);
    this.map.off("moveend", this._boundUpdateHeatmap);
    this.map.off("zoomend", this._boundUpdateHeatmap);
    this.map.off("resize", this._boundUpdateHeatmap);

    // 移除图层和数据源
    this._removeLayer();

    // 清理引用
    this.map = null;
    this.params = null;
    this.currentImageUrl = null;
  }

  /**
   * 获取图层ID
   * @returns {String} 图层ID
   */
  getLayerId() {
    return this.layerId;
  }

  /**
   * 获取数据源ID
   * @returns {String} 数据源ID
   */
  getSourceId() {
    return this.sourceId;
  }

  /**
   * 获取当前WMS URL
   * @returns {String} 当前WMS URL
   */
  getWmsUrl() {
    return this.currentImageUrl;
  }

  /**
   * 立即刷新热力图（根据当前视图）
   * @returns {HeatmapPlugin}
   */
  refresh() {
    this._updateHeatmap();
    return this;
  }

  /**
   * 静态方法：根据城市编码获取分片索引
   * @param {String} cityCode - 城市编码
   * @returns {String} 分片索引
   */
  static getLayerIndexByCityCode(cityCode) {
    return getLayerIndexByCityCode(cityCode);
  }

  /**
   * 静态方法：获取图层名称映射表
   * @returns {Object} 图层名称映射表
   */
  static getLayerNames() {
    return { ...LAYER_NAMES };
  }

  /**
   * 静态方法：获取类型描述
   * @param {Number} type - 类型值
   * @returns {String} 类型描述
   */
  static getTypeDescription(type) {
    return TYPE_DICT[type] || "未知";
  }

  /**
   * 静态方法：获取时间范围描述
   * @param {Number} layerIndex - 时间范围索引
   * @returns {String} 时间范围描述
   */
  static getLayerIndexDescription(layerIndex) {
    return LAYER_INDEX_DICT[layerIndex] || "未知";
  }
}