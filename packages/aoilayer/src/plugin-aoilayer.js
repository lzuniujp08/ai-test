import uuid from "./utils/uuid";
import { post, postData, getData } from "./utils/request";
import * as turf from "@turf/turf";
import TokenUtil from "./utils/token";
import GeoEncrypt from "./utils/GeoEncrypt";
import { wktToGeoJSON, geojsonToWKT } from "@terraformer/wkt";
import { mergePolygonsToMinArea } from "./utils/merge";

const STYLE_TYPE_DICT = {
  normal: 1, // 普通样式
  highlight: 2, // 高亮样式
  label: 3, // 标注样式
};

const STYLE_DICT = {
  save: "/api/xy/style/save", // 设置默认样式，包括展示和高亮
  common: "/api/xy/style/save/common", // 根据设置code设置AOI的样式，包括展示和高亮
  label: "/api/xy/style/save/label", // 设置默认标注的样式
  oneself: "/api/xy/style/save/oneself", // 设置指定code的AOI的标注和标注样式
  filter: "/innerlayer/services/saveFilter", // 设置过滤条件
};

const URL_SUFFIX_DICT = {
  save: "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_STYLE_SLD_SAVESLD",
  label: "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_STYLE_SLD_SAVELABEL",
  bbox: "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_AOIDATA_QUERY_ENVELOP_POINTS",
  point:
    "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_AOIDATA_QUERY_AOI_BY_POINT",
  layer: "&partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_LAYER",
  ids: "?partnerID=XIAOYI&serviceCode=GET_CENTER_BY_AOI_IDS_SERVICE_CODE",
  codes:
    "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_AOIDATA_QUERY_AOIS_BOUNDARY",
  boxQuery:
    "?partnerID=XIAOYI&serviceCode=COM_RECE_GIS_BMAP_AOIDATA_QUERY_AOI_BY_BOX",
};

// 速运网点
const ZNO_KEY = "zno_code";
// 快运网点
const KY_ZNO_KEY = "ky_zno_code";
// 超大件网点
const DJ_ZNO_KEY = "dj_zno_code";
// 航空大件网点
const HK_ZNO_KEY = "hk_zno_code";
// 小件中转直派
const TD_ZNO_KEY = "td_zno_code";

const ZNO_CODE_FIELD_DICT = {
  znoCode: ZNO_KEY,
  kyZnoCode: KY_ZNO_KEY,
  hkZnoCode: HK_ZNO_KEY,
  djZnoCode: DJ_ZNO_KEY,
  tdZnoCode: TD_ZNO_KEY,
};

const CODE_FIELD_DICT = {
  aoi_code: "fast_layer",
  area_code: "fast_layer",
  ky_area_code: "large_layer",
  dj_area_code: "over_large_layer",
  hk_area_code: "aviation_large_layer",
  td_area_code: "heavy_layer",
};

// 设置URL
const BASE_URL_DICT = {
  sit: "https://gis-inner-map.sit.sf-express.com/non-std/gis",
  prod: "https://gis-inner-layer.sf-express.com/non-std/gis",
};

// 数据接口URL
const DATA_URL_DICT = {
  sit: "https://orion-gateway.sit.sf-express.com",
  prod: "https://orion-gateway.sf-express.com",
};

const AOI_LAYERS = "sfmap:view_aoi_geo_server";
const AOI_LAYER_URL = {
  inner: "/maplayer/services/wms",
  outer: "/maplayer/services/wms",
};

const geoEncrypt = new GeoEncrypt();

class AOILayerPlugin {
  /**
   * @class AOILayerPlugin
   * @classdesc AOI栅格图层，实现AOI图层的展示和样式的设置，以及AOI的高亮展示
   * @param {Object} options - 图层初始化参数
   * @param {Object} options.map - map对象
   * @param {Object} options.baseLayerId - map上展示底图图层的id
   * @param {String} [options.env = 'env'] - 环境变量，测试为<code>sit</code>，生产为<code>prod</code>
   * @param {String} options.token - 调用token
   * @param {String} [options.url = ''] - 请求URL，如设置了<code>url</code>,则优先使用<code>url</code>
   
   * @param {String} [options.baseUrl] - baseUrl，baseUrl为空的时候才会取env的默认配置；
   * @param {String} options.appId - appId
   * @param {String} options.appSecret - app秘钥 
   * @param {String} options.username - 用户名
   * @param {String} options.password - 用户密码 
   * 
   * @param {String} [options.type = 'aoi'] - 展示类型，可能值有：<code>aoi</code>, AOI;<code>aoiarea</code>, 小件AOI区域;<code>kyaoiarea</code>, 快运(大件)网点;<code>djaoiarea</code>, 超大件网点;<code>hkaoiarea</code>, 航空大件网点;
   * @param {String | Array} options.cityCode - 城市编码，可传多个，如：<code>755,852</code>或<code>['755','852']</code>
   * @param {String | Array} [options.znoCode] - 网点编码，可传多个，如：<code>755FG,755FJ</code>或<code>['755FG','755FJ']</code>
   * @param {String} [options.znoCodeField = 'znoCode'] - 网点编码字段，可能值有：<code>znoCode</code>: 速运网点；<code>kyZnoCode</code>: 快运(大件)网点；<code>djZnoCode</code>: 超大件网点；<code>hkZnoCode</code>: 航空大件网点；<code>tdZnoCode</code>: 小件中转直派网点；
   * @param {String} [options.codeField = 'aoi_code'] - code字段，跟<code>type对应</code>：<code>aoi</code>对应：<code>aoi_code</code>，<code>aoiarea</code>对应：<code>area_code</code>（AOI区域）、<code>ky_area_code</code>（快运AOI区域）、<code>dj_area_code</code>（超大件AOI区域）、<code>hk_area_code</code>（航空大件AOI区域）、<code>td_area_code</code>（小件中转直派AOI区域）
   * @param {Number} [options.minZoom = 13] - 展示的最小级别
   * @param {Number} [options.minZoom = 22] - 展示的最大级别
   * @param {Boolean} [options.multiSelect = false] - AOI是否可多选
   * @param {Number} [options.tileSize = 256] - 切片大小，如屏幕分辨率比较大，可设置为512
   * @param {String} [options.mapId = uuid()] - map的唯一码，如果没有设置会随机生成
   * @param {Boolean} [options.isFitOnAdd = true] - 是否自动定位到地图，根据初始化参数，如果znoCode不为空，则定位到网点，否则定位到城市
   * @param {Boolean} [options.isAoiAreaStyle = false] - 是否AOI区域默认样式，只在<code>type</code>为<code>aoiarea</code>时有效
   * @param {Boolean} [options.isLabel = false] - 是否展示AOI标注
   * @param {Object} [options.filterData = {}] - 过滤条件，如<code>{"cityCodes":["755"]}</code>
   * @param {Array<String>} [options.filterData.cityCodes = []] - 过滤城市编码
   * @param {Array<String>} [options.filterData.znoCodes = []] - 网点编码
   * @param {Array<String>} [options.filterData.areaCodes = []] - AOI区域编码
   * @param {Array<String>} [options.filterData.aoiCodes = []] - AOI编码
   * @param {Array<String>} [options.filterData.aoiIds = []] - AOIID
   * @param {Array<String>} [options.filterData.areaTypes = []] - AOI区域类型
   * @param {Array<String>} [options.filterData.aoiTypes = []] - AOI类型
   * @param {Object} [options.defaultStyle] - 默认展示样式，默认值为<code>{"fillColor":"#0085ff","fillOpacity":0.1,"strokeColor":"#0085ff","strokeOpacity":1,"strokeWidth":1}</code>
   * @param {Object} [options.defaultHighLightStyle] - 默认高亮样式，默认值为<code>{"fillColor":"#006fff","fillOpacity":0.4,"strokeColor":"#006fff","strokeOpacity":1,"strokeWidth":1}</code>
   * @param {Object} [options.defaultLabelStyle] - 默认标注样式，默认值为<code>{"property":"label","fillColor":"#000000","fillOpacity":1,"strokeColor":"#fff","strokeOpacity":1,"strokeWidth":0.1}</code>
   * @param {Function | null} [options.loadedCallback = null] - 加载完成后的回调
   * @param {Function | null} [options.clickCallback = null] - 点击后的回调，返回数据格式如<code>{"lngLat":{"lng":113.95363215017619,"lat":22.530333331108963},"info":{"aoiId":"D864FD047AA14D469E5243D459F2D775","aoiCode":"755FG000195","aoiName":"深圳湾科技生态园（高新南九道北）","source":"sz"},"items":[{"aoiId":"D864FD047AA14D469E5243D459F2D775","aoiCode":"755FG000195","aoiName":"深圳湾科技生态园（高新南九道北）","source":"sz"}]}</code>
   * @param {Function | null} [options.boxEndedCallback = null] - 框选结束后的回调，返回数据格式如<code>{"bbox":"113.95091197106314,22.530664281485187,113.95311414196715,22.531911850626273","data":[{"aoiId":"F040C1A7F6394F83B00B837D63D9DA87","aoiCode":"755FG000197","aoiName":"深圳湾科技园生态园四区","source":"sz"},{"aoiId":"80CE7D41CE1B4C82BA59482CDAA340B0","aoiCode":"755FG000125","aoiName":"深圳湾科技生态园（高新南环路北）","source":"sz"},{"aoiId":"5124BC724DC34EE98E8829B34306BFC2","aoiCode":"755FG000196","aoiName":"深圳湾科技园生态园11区","source":"sz"},{"aoiId":"4DB57FA1788D4760A21879B1CFB46754","aoiCode":"755FG000199","aoiName":"深圳湾生态园10区","source":"sz"},{"aoiId":"D864FD047AA14D469E5243D459F2D775","aoiCode":"755FG000195","aoiName":"深圳湾科技生态园（高新南九道北）","source":"sz"}]}</code>
   * @example
   * map.on("load", () => {
   *   AOILayerPlugin = new AOILayerPlugin({
        map: map,
        env: env,
        token: token,
        username: "01416068",
        password: "**Map123456",
        appId: "orioncloud-client-map",
        appSecret: "orioncloudClientSecret",
        // username: "01418810",
        // password: "**Map159357",
        // appId: "IDS-HNP-CORE",
        // appSecret: "orioncloudIDSHNPCORESecret",
        cityCode: '755',

        mapId: "aoi-layer-2",
        multiSelect: false,
        isLabel: true,
        // ---AOI---
        // type: "aoi", // aoi, aoiarea
        // codeField: "aoi_code", // aoi_code, area_code
        // znoCode: "755BGA", // 755EE 大件的, 755BGA 小件的

        // ---aoiarea---
        // type: "aoiarea", // aoi, aoiarea
        // znoCode: "755BGA", // 755EE 大件的, 755BGA 小件的
        // codeField: "area_code", // ky_area_code, area_code
        // znoCodeField: "znoCode", // znoCode 小件, kyZnoCode 大件
        // isAoiAreaStyle: true, // 是否使用aoiarea样式

        // ---kyaoiarea---
        type: "kyaoiarea", // aoi, aoiarea
        znoCode: "755EE", // 755EE 大件的, 755BGA 小件的
        codeField: "ky_area_code", // ky_area_code, area_code
        znoCodeField: "kyZnoCode", // znoCode 小件, kyZnoCode 大件

        isFitOnAdd: true,
        defaultStyle: {
          fillColor: "#0085ff",
          fillOpacity: 0.1,
          strokeColor: "#0085ff",
          strokeOpacity: 1,
          strokeWidth: 1,
        },
        defaultLabelStyle: {
          property: "label",
          strokeOpacity: 1,
          fillColor: "#0085ff",
          fillOpacity: 1,
        },
        clickCallback: (e) => {
          console.log("map clicked", e);
        },
        loadedCallback: () => {
          console.log("layer loaded");
        },
        boxEndedCallback: (e) => {
          console.log("map box drawend", e);
        },
      });
   * });
   */
  constructor(options) {
    this.LAYER_ID = "aoi_wms_layer_" + uuid();
    this.BASE_LAYER_ID = options.baseLayerId || this.LAYER_ID + "_base";
    this.BASE_VECTOR_LAYER_ID = this.LAYER_ID + "_base";

    this.options = {
      map: "",
      token: "",
      cityCode: "",
      minZoom: 13,
      maxZoom: 22,
      env: "prod", // prod, sit
      type: "aoi", // aoi, aoiarea
      url: "",
      inner: false,
      baseUrl: "",
      codeField: "aoi_code", // aoi_code, aoi_area_code
      multiSelect: false,
      znoCode: [], // 网点编码
      znoCodeField: "znoCode",
      tileSize: 256,
      mapId: "",
      functionId: "SHOW_AOI",
      isFitOnAdd: true,
      isLabel: true,
      isAoiAreaStyle: false,
      defaultStyle: {
        fillColor: "#0085ff",
        fillOpacity: 0.1,
        strokeColor: "#0085ff",
        strokeOpacity: 1,
        strokeWidth: 1,
      },
      defaultHighLightStyle: {
        fillColor: "#006fff",
        fillOpacity: 0.4,
        strokeColor: "#006fff",
        strokeOpacity: 1,
        strokeWidth: 1,
      },
      defaultLabelStyle: {
        property: "label",
        fillColor: "#000000",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeOpacity: 1,
        strokeWidth: 0.1,
      },
      loadedCallback: null,
      clickCallback: null,
      boxEndedCallback: null,
      ...options,
    };

    if (Array.isArray(this.options.cityCode)) {
      this.options.cityCode = this.options.cityCode.join(",");
    }
    if (Array.isArray(this.options.znoCode)) {
      this.options.znoCode = this.options.znoCode.join(",");
    }

    const { map, token, cityCode, isFitOnAdd } = this.options;
    if (
      !options.username ||
      !options.password ||
      !options.appId ||
      !options.appSecret
    ) {
      throw new Error("appId, appSecret, username, password不能为空！");
    }
    if (!map) throw new Error("map不能为空");
    if (!token) throw new Error("token不能为空");
    if (!cityCode) throw new Error("cityCode不能为空");

    this.dataUrl = this.options.baseUrl || DATA_URL_DICT[this.options.env];

    this.tokenUtil = new TokenUtil({
      username: options.username,
      password: options.password,
      appId: options.appId,
      appSecret: options.appSecret,
      baseUrl: this.dataUrl,
    });

    // 初始化mapId
    this.mapId = options.mapId || uuid();

    this.selectedAois = [];
    this.highlightStyle = [];

    this.isBoxSelect = false;
    this.isShow = true;

    this.baseUrl = options.url || BASE_URL_DICT[this.options.env];

    this.map = map;
    this.token = token;
    this.cityCode = cityCode;

    if (!map.getLayer(this.BASE_LAYER_ID)) {
      // 添加base图层
      this.map.addLayer({
        id: this.BASE_LAYER_ID,
        type: "background",
        layout: {
          visibility: "none",
        },
      });
    }

    // 添加矢量图层，用于展示合并后的AOI
    this.map.addSource(`${this.BASE_VECTOR_LAYER_ID}-vector`, {
      type: "geojson",
      data: turf.featureCollection([]),
    });
    this.map.addLayer({
      id: `${this.BASE_VECTOR_LAYER_ID}-fill`,
      type: "fill",
      source: `${this.BASE_VECTOR_LAYER_ID}-vector`,
      paint: {
        "fill-color": [
          "match",
          ["get", "type"],
          "before",
          "#BC6FF1",
          "#ff983f",
        ],
        "fill-opacity": 0.1,
      },
    });
    this.map.addLayer({
      id: `${this.BASE_VECTOR_LAYER_ID}-line`,
      type: "line",
      source: `${this.BASE_VECTOR_LAYER_ID}-vector`,
      paint: {
        "line-color": [
          "match",
          ["get", "type"],
          "before",
          "#BC6FF1",
          "#ff983f",
        ],
        "line-opacity": 1,
        "line-width": 3,
      },
    });

    // 先设置样式
    this.setStyle().then(() => {
      if (Object.keys(options.filterData || {}).length > 0) {
        this.filterByParams(options.filterData);
      } else {
        this.updateAOILayerPlugin();
      }
      this.registerMapEvt();
      if (isFitOnAdd) this.fitMap();
      setTimeout(() => {
        if (options.loadedCallback) options.loadedCallback.call(this, this);
      }, 500);
    });
  }

  /**
   * 吸附到AOI
   * @param {Object} params
   * @param {String} params.wkt - 要吸附的wkt
   * @param {Boolean} [params.isFit = true] - 是否自动定位到地图
   * @param {Boolean} [params.showOnMap = true] - 是否展示到地图上
   * @param {Object} [params.color = {before: '#BC6FF1', after: '#ff983f'}] - 展示颜色，before表示吸附前的颜色，after表示吸附后的颜色
   * @param {Function} params.callback - 回调函数，返回处理后的多边形的WKT
   * @example
   * AOILayerPlugin.snapToAoi({
   *    wkt,
   *    isFit: true,
   *    showOnMap: true,
   *    color: {
   *      before: "#00f",
   *      after: "#f00",
   *    },
   *    callback: ({wkt,center}) => {
   *      console.log(wkt,center);
   *    },
   * });
   */
  snapToAoi(params) {
    params = {
      wkt: "",
      isFit: true,
      showOnMap: true,
      color: { before: "#BC6FF1", after: "#ff983f" },
      callback: null,
      ...params,
    };
    const { wkt, isFit, showOnMap, color, callback } = params;
    if (!wkt) throw new Error("wkt不能为空");

    // 设置展示样式
    const colors = ["match", ["get", "type"], "before", color.before, color.after];
    if (this._vectorLayersExist()) {
      this.map.setPaintProperty(`${this.BASE_LAYER_ID}-fill`, "fill-color", colors);
      this.map.setPaintProperty(`${this.BASE_LAYER_ID}-line`, "line-color", colors);
    }

    this.tokenUtil.getToken().then((token) => {
      const url = `${this.dataUrl}/transfer/api/aoi/wktAoiAdsorb`;
      postData(url, { wkt }, { Authorization: "Bearer " + token })
        .then((res) => {
          if (res.code === 200) {
            const sourceJson = this.convert2Feature(wktToGeoJSON(wkt), { type: "before" });
            const { aoiInfos, wkt: resultWkt } = res.result;
            const json = JSON.parse(resultWkt);
            if (callback)
              callback.call(this, {
                success: true,
                wkt: geojsonToWKT(json),
                center: turf.centroid(json).geometry.coordinates,
                aoiInfos,
              });
            if (showOnMap && this.map.getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`)) {
              const destJson = this.convert2Feature(json, { type: "after" });
              this.map
                .getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`)
                .setData(turf.featureCollection([sourceJson, destJson]));
            }
            if (isFit) this.fit2geojson(json);
          }
        })
        .catch((e) => {
          if (callback)
            callback.call(this, {
              success: false,
              message: e.message,
            });
        });
    });
  }

  /**
   * 检查矢量图层是否存在
   * @private
   * @returns {Boolean} 图层是否存在
   */
  _vectorLayersExist() {
    return this.map.getLayer(`${this.BASE_LAYER_ID}-fill`) !== undefined &&
      this.map.getLayer(`${this.BASE_LAYER_ID}-line`) !== undefined;
  }

  /**
   * 设置矢量图层样式
   * @private
   * @param {String} color - 颜色值
   */
  _setVectorStyle(color) {
    if (!this._vectorLayersExist()) return;
    this.map.setPaintProperty(
      `${this.BASE_LAYER_ID}-fill`,
      "fill-color",
      color
    );
    this.map.setPaintProperty(
      `${this.BASE_LAYER_ID}-line`,
      "line-color",
      color
    );
  }

  /**
   * 显示矢量数据到地图
   * @private
   * @param {Object} geojson - GeoJSON数据
   * @param {Boolean} showOnMap - 是否显示
   * @param {Boolean} isFit - 是否定位
   */
  _showVectorData(geojson, showOnMap, isFit) {
    if (showOnMap) {
      const source = this.map.getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`);
      if (source) {
        const feature = this.convert2Feature(geojson);
        source.setData(feature);
      }
    }
    if (isFit) this.fit2geojson(geojson);
  }

  /**
   * 根据AOIID合并AOI
   * @param {Object} params
   * @param {Array} params.aoiIds - 要合并的AOIID
   * @param {Boolean} [params.isFit = true] - 是否自动定位到地图
   * @param {Boolean} [params.showOnMap = true] - 是否展示到地图上
   * @param {String} [params.color = "#f00"] - 展示颜色
   * @param {Function} params.callback - 回调函数，返回合并后的多边形的WKT
   * @example
   * AOILayerPlugin.mergeAoisByAoiIds({
   *   aoiIds: [
   *     "62556EAF14821B9DE0530EF4520A0CFC",
   *     "62556EAEF6B51B9DE0530EF4520A0CFC",
   *     "A5BA07EFAE16446091E298A07CE96472",
   *   ],
   *   isFit: true,
   *   showOnMap: true,
   *   color: '#f00',
   *   callback: ({wkt, center}) => {
   *     console.log(wkt, center);
   *   },
   * });
   */
  mergeAoisByAoiIds(params) {
    params = {
      aoiIds: [],
      isFit: true,
      showOnMap: true,
      callback: null,
      color: "#f00",
      ...params,
    };
    const { aoiIds, isFit, showOnMap, color, callback } = params;
    if (aoiIds.length === 0) throw new Error("aoiIds不能为空");

    // 设置展示样式
    this._setVectorStyle(color);

    const url = `${this.dataUrl}/map/api/aoi/mergeAois`;
    this.tokenUtil.getToken().then((token) => {
      let genKeyPair = geoEncrypt.getKeyPair();
      postData(
        url,
        { aoiIds },
        {
          Authorization: "Bearer " + token,
          publicKey: genKeyPair.publicKey,
        }
      )
        .then((res) => {
          if (res.code === 200 && res.any?.aesKey) {
            let jsPrivateKey = genKeyPair.privateKey;
            const data = geoEncrypt.decrypt(res, jsPrivateKey);
            if (callback)
              callback.call(this, {
                success: true,
                wkt: geojsonToWKT(data),
                center: turf.centroid(data).geometry.coordinates,
              });
            this._showVectorData(data, showOnMap, isFit);
          }
        })
        .catch((e) => {
          if (callback)
            callback.call(this, {
              success: false,
              message: e.message,
            });
        });
    });
  }

  /**
   * 根据AOICODE合并AOI
   * @param {Object} params
   * @param {Array} params.aoiCodes - 要合并的AOICODE
   * @param {Boolean} [params.isFit = true] - 是否自动定位到地图
   * @param {Boolean} [params.isCheck = true] - 是否进行校验
   * @param {Boolean} [params.showOnMap = true] - 是否展示到地图上
   * @param {String} [params.color = "#f00"] - 展示颜色
   * @param {Function} params.callback - 回调函数，返回合并后的多边形的WKT
   * @example
   * AOILayerPlugin.mergeAoisByAoiCodes({
   *   aoiCodes: [
   *     "755BK000029",
   *     "755BK000104",
   *     "755BK000051",
   *   ],
   *   isFit: true,
   *   showOnMap: true,
   *   color: "#f00",
   *   callback: (json) => {
   *     console.log(json);
   *   },
   * });
   */
  mergeAoisByAoiCodes(params) {
    params = {
      aoiCodes: [],
      isFit: true,
      isCheck: true,
      showOnMap: true,
      callback: null,
      color: "#f00",
      ...params,
    };
    const { isCheck, aoiCodes, isFit, showOnMap, color, callback } = params;
    if (aoiCodes.length === 0) throw new Error("aoiCodes不能为空");

    // 设置展示样式
    this._setVectorStyle(color);

    const url = `${this.dataUrl}/transfer/api/aoi/mergeWktsByAoiCodes`;
    this.tokenUtil.getToken().then((token) => {
      let genKeyPair = geoEncrypt.getKeyPair();
      postData(
        url,
        { aoiCodes, isCheck },
        {
          Authorization: "Bearer " + token,
          publicKey: genKeyPair.publicKey,
        }
      )
        .then((res) => {
          if (res.code === 200 && res.any?.aesKey) {
            let jsPrivateKey = genKeyPair.privateKey;
            const data = geoEncrypt.decrypt(res, jsPrivateKey);
            if (callback)
              callback.call(this, {
                success: true,
                wkt: geojsonToWKT(data),
                center: turf.centroid(data).geometry.coordinates,
              });
            this._showVectorData(data, showOnMap, isFit);
          }
        })
        .catch((e) => {
          if (callback)
            callback.call(this, {
              success: false,
              message: e.message,
            });
        });
    });
  }

  /**
   * 根据网点编码展示网点边界
   * @param {Object} params
   * @param {Array} params.znoCodes - 要展示的的网点编码
   * @param {Boolean} [params.isFit = true] - 是否自动定位到地图
   * @param {Boolean} [params.showOnMap = true] - 是否展示到地图上
   * @param {String} [params.color = "#f00"] - 展示颜色
   * @param {Function} params.callback - 回调函数，返回合并后的多边形的WKT
   * @example
   * AOILayerPlugin.showZnoByCodes({
   *   znoCodes: ["755BK"],
   *   isFit: true,
   *   showOnMap: true,
   *   color: "#f00",
   *   callback: (json) => {
   *     console.log(json);
   *   },
   * });
   */
  showZnoByCodes(params) {
    params = {
      znoCodes: [],
      isFit: true,
      showOnMap: true,
      callback: null,
      color: "#f00",
      ...params,
    };

    const { znoCodes, isFit, showOnMap, color, callback } = params;
    if (znoCodes.length === 0) throw new Error("网点编码不能为空");

    // 设置展示样式
    this._setVectorStyle(color);

    const url = `${this.dataUrl}/transfer/api/aoi/queryWktsByZnos`;
    this.tokenUtil.getToken().then((token) => {
      let genKeyPair = geoEncrypt.getKeyPair();
      getData(
        url,
        { znos: znoCodes.join(",") },
        {
          Authorization: "Bearer " + token,
          publicKey: genKeyPair.publicKey,
        }
      ).then((res) => {
        if (res.code === 200 && res.any?.aesKey) {
          let jsPrivateKey = genKeyPair.privateKey;
          const data = geoEncrypt.decrypt(res, jsPrivateKey);
          if (Object.keys(data).length > 0) {
            if (callback)
              callback.call(this, {
                success: true,
                ...data,
              });
            const features = Object.values(data).map((wkt) =>
              this.convert2Feature(wktToGeoJSON(wkt))
            );
            const geojson = turf.featureCollection(features);
            if (showOnMap && this.map.getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`)) {
              this.map
                .getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`)
                .setData(geojson);
            }
            if (isFit) this.fit2geojson(geojson);
          } else {
            if (callback)
              callback.call(this, {
                success: false,
                message: "未查询到对应网点",
              });
          }
        }
      });
    });
  }

  /**
   * 合并AOI和多边形
   * @param {Object} params
   * @param {Array} params.aoiCodes - 要合并的AOI编码
   * @param {Array} params.polygons - 要合并的多边形的wkt
   * @param {Boolean} [params.isFit = true] - 是否自动定位到地图
   * @param {Boolean} [params.showOnMap = true] - 是否展示到地图上
   * @param {String} [params.color = "#f00"] - 展示颜色
   * @param {Function} params.callback - 回调函数，返回合并后的多边形的WKT
   * @example
   * AOILayerPlugin.mergeAoisWithPolygons({
   *   polygons: [document.getElementById("wkt").value],
   *   aoiCodes: [
   *     "755BK000029",
   *     "755BK000104",
   *     "755BK000051",
   *   ],
   *   isFit: true,
   *   showOnMap: true,
   *   color: "#00f",
   * });
   */
  mergeAoisWithPolygons(params) {
    params = {
      polygons: [],
      aoiCodes: [],
      isFit: true,
      showOnMap: true,
      callback: null,
      color: "#f00",
      ...params,
    };
    let { polygons, aoiCodes, isFit, showOnMap, color, callback } = params;
    if (polygons.length === 0 && aoiCodes.length === 0)
      throw new Error("多边形或者AOI编码不能为空");

    // 设置展示样式
    this._setVectorStyle(color);

    // 合并多边形并展示
    const mergeAndShow = (wkts) => {
      const res = mergePolygonsToMinArea(wkts);
      if (callback) callback.call(this, res);
      const geojson = wktToGeoJSON(res);
      this._showVectorData(geojson, showOnMap, isFit);
    };

    // 如果有AOI编码，先获取AOI多边形
    if (aoiCodes.length > 0) {
      const url = `${this.dataUrl}/transfer/api/aoi/mergeWktsByAoiCodes`;
      this.tokenUtil.getToken().then((token) => {
        let genKeyPair = geoEncrypt.getKeyPair();
        postData(
          url,
          { aoiCodes },
          {
            Authorization: "Bearer " + token,
            publicKey: genKeyPair.publicKey,
          }
        ).then((res) => {
          if (res.code === 200 && res.any?.aesKey) {
            let jsPrivateKey = genKeyPair.privateKey;
            const data = geoEncrypt.decrypt(res, jsPrivateKey);
            polygons.push(geojsonToWKT(data));
            mergeAndShow(polygons);
          }
        });
      });
    } else if (polygons.length > 0) {
      mergeAndShow(polygons);
    }
  }

  convert2Feature(geometry, props = {}) {
    return {
      type: "Feature",
      geometry: geometry,
      properties: props,
    };
  }

  fit2geojson(json) {
    const bbox = turf.bbox(json);
    this.map.fitBounds(bbox, {
      padding: { top: 100, bottom: 100, left: 100, right: 100 },
      duration: 500,
    });
  }

  /**
   * 设置指定AOI的高亮样式
   * @param {Array} styles - 高亮样式参数
   * @returns AOILayerPlugin
   * @example
   * const styles = [
   *   {
   *     codes: ["755FG000065"],
   *     style: {
   *       fillColor: "#ff0000",
   *       fillOpacity: 0.1,
   *       strokeColor: "#ff0000",
   *       strokeOpacity: 1,
   *       strokeWidth: 1,
   *     },
   *   },
   *   {
   *     codes: ["755FG000115"],
   *     style: {
   *       fillColor: "#d946ef",
   *       fillOpacity: 0.1,
   *       strokeColor: "#d946ef",
   *       strokeOpacity: 1,
   *       strokeWidth: 1,
   *     },
   *   },
   * ];
   * AOILayerPlugin.setHighLightStyles(styles);
   */
  setHighLightStyles(styles = []) {
    if (styles.length === 0) return;
    this.highlightStyle = styles;
    return this;
  }
  // A数组是不是B数组的子集
  isSubset(A, B) {
    const setB = new Set(B);
    return A.every((item) => setB.has(item));
  }
  /**
   * 根据参数过滤
   * @param {Object} [filterData = {}] - 过滤条件，如<code>{"cityCodes":["755"]}</code>
   * @param {Array<String>} [filterData.cityCodes = []] - 过滤城市编码
   * @param {Array<String>} [filterData.znoCodes = []] - 网点编码
   * @param {Array<String>} [filterData.areaCodes = []] - AOI区域编码
   * @param {Array<String>} [filterData.aoiCodes = []] - AOI编码
   * @param {Array<String>} [filterData.aoiIds = []] - AOIID
   * @param {Array<String>} [filterData.areaTypes = []] - AOI区域类型
   * @param {Array<String>} [filterData.aoiTypes = []] - AOI类型
   * @returns AOILayerPlugin
   */

  filterByParams(filterData) {
    let { mapId, token, baseUrl, cityCode } = this;
    let { znoCode } = this.options;
    if (filterData.cityCodes && cityCode !== "all") {
      cityCode = cityCode.split(",");
      const isIn = this.isSubset(filterData.cityCodes, cityCode);
      if (!isIn) console.error("城市编码超出图层参数范围");
    }
    if (filterData.znoCodes && znoCode) {
      znoCode = znoCode.split(",");
      const isIn = this.isSubset(filterData.znoCodes, znoCode);
      if (!isIn) console.error("网点编码超出图层参数范围");
    }
    const { codeField, type, functionId } = this.options;
    const url = `${baseUrl}${STYLE_DICT["filter"]}`;
    const params = {
      functionId: functionId,
      mapId: mapId,
      sldVersion: "1",
      layers: AOI_LAYERS,
      type: type,
      token: token,
      codeField: codeField,
      layerType: CODE_FIELD_DICT[codeField],
      filterData: filterData,
    };
    post(url, params).then((res) => {
      if (res.code === 200) {
        this.options.filterData = filterData;
        this.updateAOILayerPlugin();
      }
    });
    return this;
  }

  /**
   * 高亮指定编码的AOI
   * @param {Array} codes - 要高亮的AOI或者AOI区域的编码
   * @returns AOILayerPlugin
   */
  highLightByCodes(codes = []) {
    if (codes.length === 0) return;
    this.selectedAois = codes;
    this.updateHighlight();
    return this;
  }

  /**
   * 获取已高亮数据
   * @returns {Array} - 已高亮数据
   */
  getSelectedData() {
    return this.selectedAois;
  }

  /**
   * 设置指定AOI展示颜色
   * @param {Array} params
   * @returns AOILayerPlugin
   * @example
   * const styles = [
   *   {
   *     codes: ["755FG000065"],
   *     style: {
   *       fillColor: "#ff0000",
   *       fillOpacity: 0.1,
   *       strokeColor: "#ff0000",
   *       strokeOpacity: 1,
   *       strokeWidth: 1,
   *     },
   *   },
   *   {
   *     codes: ["755FG000115"],
   *     style: {
   *       fillColor: "#d946ef",
   *       fillOpacity: 0.1,
   *       strokeColor: "#d946ef",
   *       strokeOpacity: 1,
   *       strokeWidth: 1,
   *     },
   *   },
   * ];
   * AOILayerPlugin.setStyles(styles);
   */
  setStyles(styles = []) {
    if (styles.length === 0) return;
    const { mapId, cityCode, token, baseUrl } = this;
    const { codeField, type, functionId } = this.options;
    const url = `${baseUrl}${STYLE_DICT["common"]}${URL_SUFFIX_DICT["save"]}`;
    let _styles = [];
    styles.forEach(({ codes, style }) => {
      _styles.push({
        codes,
        ...style,
      });
    });
    const params = {
      mapId: mapId,
      sldVersion: "1",
      cityCode: cityCode,
      type: type,
      token: token,
      styleType: 1,
      codeField: codeField,
      functionId: functionId,
      layer: AOI_LAYERS,
      styles: JSON.stringify(_styles),
    };
    post(url, params).then((res) => {
      if (res.status === 0) {
        this.updateAOILayerPlugin();
      }
    });
    return this;
  }

  /**
   * 设置标注样式
   * @param {Array} style - 标注样式
   * @param {Array} labels - 指定编码的标注内容
   * @returns AOILayerPlugin
   * @example
   * const labels = {
   *   labelStyle: [
   *     {
   *       property: "label",
   *       fillColor: "#0000ff",
   *       fillOpacity: 0.5,
   *       strokeColor: "#00ff00",
   *       strokeOpacity: 0.8,
   *       strokeWidth: 1,
   *       offsetX: 0.5,
   *       offsetY: 0,
   *     },
   *     {
   *       property: "label",
   *       fillColor: "#0000ff",
   *       fillOpacity: 0.5,
   *       strokeColor: "#00ff00",
   *       strokeOpacity: 0.8,
   *       strokeWidth: 1,
   *       offsetX: 0.5,
   *       offsetY: 1.5,
   *     },
   *   ],
   *   labels: [
   *     {
   *       codes: ["755FG000065"],
   *       label: "test0\n研祥智谷文化创意产业园",
   *     },
   *     {
   *       codes: ["755FG000115"],
   *       label: "test1",
   *     },
   *   ],
   * };
   * AOILayerPlugin.setLabels(labels.labelStyle, labels.labels);
   */
  setLabels(style, labels) {
    if (labels.length === 0) return;
    this.options.isLabel = true;
    const { mapId, cityCode, token, baseUrl } = this;
    const { codeField, type, functionId } = this.options;
    const url = `${baseUrl}${STYLE_DICT["oneself"]}${URL_SUFFIX_DICT["label"]}`;
    const params = {
      functionId: functionId,
      mapId: mapId,
      sldVersion: "1",
      layer: AOI_LAYERS,
      cityCode: cityCode,
      type: type,
      token: token,
      styleType: 3,
      codeField: codeField,
      style: JSON.stringify(style),
      labels: JSON.stringify(labels),
    };
    post(url, params).then((res) => {
      if (res.status === 0) {
        this.updateAOILayerPlugin();
      }
    });
    return this;
  }

  /**
   * 移除指定编码的高亮
   * @param {Array} codes - aoi编码或者AOI区域编码
   * @returns AOILayerPlugin
   * @example
   * AOILayerPlugin.removeHighLightByCodes(['755FG000065']);
   */
  removeHighLightByCodes(codes) {
    if (codes.length === 0 || this.selectedAois.length === 0) return;
    codes.forEach((code) => {
      const index = this.selectedAois.indexOf(code);
      if (index !== -1) this.selectedAois.splice(index, 1);
    });
    this.updateHighlight();
    return this;
  }

  /**
   * 清除高亮
   * @returns AOILayerPlugin
   */
  clearHighLight() {
    this.selectedAois = [];
    // 更新高亮展示
    this.updateHighlight();
    return this;
  }

  /**
   * 设置点击回调函数
   */
  setClickCallback(callback = null) {
    this.options.clickCallback = callback;
    return this;
  }

  // 注册地图事件
  registerMapEvt() {
    const that = this;
    const { map, baseUrl, cityCode, token } = that;
    const { multiSelect, clickCallback, codeField, type } = that.options;
    const field = CODE_FIELD_DICT[codeField];
    map.on("click", (e) => {
      const zoom = map.getZoom();
      const { minZoom, maxZoom } = that.options;
      const isInZoom = zoom >= minZoom && zoom <= maxZoom;
      if (that.isBoxSelect || !clickCallback || !that.isShow || !isInZoom)
        return;
      const { lng, lat } = e.lngLat;
      const url = `${baseUrl}/api/xy/aoi/point${URL_SUFFIX_DICT["point"]}`;
      let params = {
        x: lng,
        y: lat,
        token: token,
      };
      // if (znoCode) params.dept = znoCode;
      post(url, params).then((res) => {
        if (res.status === 0) {
          const { data } = res.result;
          if (type === "aoi") {
            const aoi = data[0]["aoiCode"];
            const index = that.selectedAois.indexOf(aoi);
            if (index === -1) {
              multiSelect
                ? that.selectedAois.push(aoi)
                : (that.selectedAois = [aoi]);
            } else {
              that.selectedAois.splice(index, 1);
            }
            // 更新高亮展示
            that.updateHighlight();

            // 点击回调
            if (clickCallback)
              clickCallback.call(that, {
                lngLat: { lng, lat },
                info: data[0],
                items: data,
              });
          } else {
            const aoiId = data[0]["aoiId"];
            const _url = `${baseUrl}/api/xy/layer/aoiArea`;
            post(_url, {
              layer: field,
              token: token,
              guids: aoiId,
            }).then((_res) => {
              if (_res.status === 0) {
                const areaCode = _res.result.data[0].areaCode;
                const index = that.selectedAois.indexOf(areaCode);
                if (index === -1) {
                  multiSelect
                    ? that.selectedAois.push(areaCode)
                    : (that.selectedAois = [areaCode]);
                } else {
                  that.selectedAois.splice(index, 1);
                }
                // 更新高亮展示
                that.updateHighlight();
                // 点击回调
                if (clickCallback)
                  clickCallback.call(that, {
                    lngLat: { lng, lat },
                    info: _res.result.data[0],
                    items: _res.result.data,
                  });
              }
            });
          }
        }
      });
    });
  }
  // 更新高亮展示
  updateHighlight() {
    const { selectedAois, highlightStyle, mapId, cityCode, token } = this;
    const { codeField, type, functionId, defaultHighLightStyle } = this.options;
    const { fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWidth } =
      defaultHighLightStyle;
    let styles = [
      {
        codes: ["nohighlight"],
        fillColor,
        fillOpacity,
        strokeColor,
        strokeOpacity,
        strokeWidth,
      },
    ];
    // 设置高亮样式
    if (selectedAois.length > 0) {
      styles = [];
      selectedAois.forEach((code) => {
        let style = {
          codes: [code],
          fillColor,
          fillOpacity,
          strokeColor,
          strokeOpacity,
          strokeWidth,
        };
        for (let i = 0; i < highlightStyle.length; i++) {
          const highlightData = highlightStyle[i];
          const { codes } = highlightData;
          if (codes.includes(code)) {
            style = {
              ...style,
              ...highlightData.style,
            };
            break;
          }
        }
        styles.push(style);
      });
    }
    const url = `${this.baseUrl}${STYLE_DICT["common"]}${URL_SUFFIX_DICT["save"]}`;
    const params = {
      mapId: mapId,
      sldVersion: "1",
      cityCode: cityCode,
      type: type,
      token: token,
      styleType: 2,
      codeField: codeField,
      functionId: functionId,
      layer: AOI_LAYERS,
      styles: JSON.stringify(styles),
    };
    post(url, params).then((res) => {
      if (res.status === 0) {
        this.updateHighlightLayer();
      }
    });
  }

  /**
   * 根据指定编码高亮
   * @param {String} type - 类型，可能值有城市编码<code>cityCode</code>、网点编码<code>znoCode</code>、AOIID<code>aoiIds</code>、AOI编码或者AOI区域编码<code>codes</code>
   * @param {String | Array} value
   * @returns AOILayerPlugin
   * @example
   * // 根据城市编码定位
   * AOILayerPlugin.fit('cityCode', ['755']);
   * // 根据网点编码定位
   * AOILayerPlugin.fit('znoCode', ['755AA']);
   * // 根据编码定位
   * AOILayerPlugin.fit('codes', ['755FG000065']);
   * // 根据AOIID定位
   * AOILayerPlugin.fit('aoiIds', ['D864FD047AA14D469E5243D459F2D775']);
   */
  fit(type, value = []) {
    if (type === "cityCode") {
      this.fit2City(value);
    } else if (type === "znoCode") {
      this.fit2Zno(value);
    } else if (type === "aoiIds" && value.length > 0) {
      this.fitByAoiIds(value);
    } else if (type === "codes" && value.length > 0) {
      this.fitByCodes(value);
    } else {
      this.fitMap();
    }
    return this;
  }

  /**
   * 开始拉框绘制
   * @returns AOILayerPlugin
   */
  beginDrawBox() {
    const that = this;
    that.isBoxSelect = true;
    const { map } = that;
    map.getCanvasContainer().style.cursor = "crosshair";
    that.map.getCanvasContainer().style.cursor = "crosshair";
    const layerId = this.LAYER_ID + "_bbox";
    map.addSource(layerId, {
      type: "geojson",
      data: turf.featureCollection([]),
    });
    map.addLayer({
      id: layerId + "_fill",
      type: "fill",
      source: layerId,
      paint: {
        "fill-color": "#f00",
        "fill-opacity": 0.15,
      },
    });
    map.addLayer({
      id: layerId + "_line",
      type: "line",
      source: layerId,
      paint: {
        "line-color": "#f00",
        "line-width": 1.5,
      },
    });
    let startCoords = null;
    let mousedownFunc = (e) => {
      if (that.isBoxSelect) {
        map.dragPan.disable();
        startCoords = e.lngLat.toArray();
      }
    };
    let mousemoveFunc = (e) => {
      if (startCoords && startCoords.length === 2) {
        let endCoords = e.lngLat.toArray();
        const polygon = turf.bboxPolygon([...startCoords, ...endCoords]);
        if (map.getSource(layerId)) map.getSource(layerId).setData(polygon);
      }
    };
    let mouseupFunc = (e) => {
      if (that.isBoxSelect && startCoords && startCoords.length === 2) {
        let endCoords = e.lngLat.toArray();
        // 删除图层
        map.removeLayer(layerId + "_line");
        map.removeLayer(layerId + "_fill");
        map.removeSource(layerId);
        that.isBoxSelect = false;
        that.map.getCanvasContainer().style.cursor = "";
        that.boxQuery(startCoords, endCoords);
        setTimeout(() => {
          map.dragPan.enable();
          startCoords = null;
          map.off("mousemove", mousemoveFunc);
        }, 100);
      }
    };
    map.once("mousedown", mousedownFunc);
    map.on("mousemove", mousemoveFunc);
    map.once("mouseup", mouseupFunc);
    return that;
  }

  boxQuery([x1, y1], [x2, y2]) {
    const { baseUrl, token } = this;
    const { codeField, boxEndedCallback, multiSelect, type } = this.options;
    const url = `${baseUrl}/api/xy/aoi/box${URL_SUFFIX_DICT["boxQuery"]}`;
    const x = [x1, x2].sort((a, b) => a - b);
    const y = [y1, y2].sort((a, b) => a - b);
    const bbox = [x[0], y[0], x[1], y[1]];
    const params = {
      box: bbox.join(","),
      token: token,
    };
    // if (znoCode) params.dept = znoCode;
    post(url, params).then((res) => {
      if (res.status === 0) {
        const { data } = res.result;
        let field = CODE_FIELD_DICT[codeField];
        if (type === "aoi") {
          field = "aoiCode";
          let selectedAois = data
            .map((d) => d[field])
            .filter((d) => this.selectedAois.indexOf(d) === -1);
          this.selectedAois = multiSelect
            ? [...this.selectedAois, ...selectedAois]
            : selectedAois;
          this.updateHighlight();
          if (boxEndedCallback)
            boxEndedCallback.call(this, {
              bbox: bbox.join(","),
              data,
            });
        } else {
          const aoiIds = data.map((d) => d.aoiId).join(",");
          const _url = `${baseUrl}/api/xy/layer/aoiArea`;
          post(_url, {
            layer: field,
            token: token,
            guids: aoiIds,
          }).then((_res) => {
            if (_res.status === 0) {
              const areaCodes = Array.from(
                new Set(_res.result.data.map((d) => d.areaCode))
              );
              let selectedAois = areaCodes.filter(
                (d) => this.selectedAois.indexOf(d) === -1
              );
              this.selectedAois = multiSelect
                ? [...this.selectedAois, ...selectedAois]
                : selectedAois;
              this.updateHighlight();
              if (boxEndedCallback)
                boxEndedCallback.call(this, {
                  bbox: bbox.join(","),
                  data: areaCodes,
                });
            }
          });
        }
      }
    });
  }

  fitMap() {
    const { cityCode, znoCode } = this.options;
    if (znoCode) {
      this.fit2Zno(znoCode);
      return;
    }
    if (cityCode) {
      this.fit2City(cityCode);
      return;
    }
  }

  fitByAoiIds(aoiIds) {
    const { baseUrl, token, cityCode } = this;
    const url = `${baseUrl}/api/xy/aoi/scope/aoiIds${URL_SUFFIX_DICT["ids"]}`;
    const params = {
      token: token,
      aoiIds: JSON.stringify(aoiIds),
      cityCode: cityCode,
    };
    this.fitMapByParams(url, params);
  }

  fitByCodes(aoiCodes) {
    const { baseUrl, token, cityCode } = this;
    const url = `${baseUrl}/api/xy/aoi/scope${URL_SUFFIX_DICT["codes"]}`;
    const params = {
      token: token,
      cityCode: cityCode,
      aoiCodes: JSON.stringify(aoiCodes),
    };
    this.fitMapByParams(url, params);
  }

  fit2Zno(dept) {
    if (Array.isArray(dept)) dept = dept.join(",");
    if (dept === "") return;
    const { baseUrl, token } = this;
    const url = `${baseUrl}/api/xy/aoi/dept${URL_SUFFIX_DICT["bbox"]}`;
    const params = {
      token,
      dept,
    };
    this.fitMapByParams(url, params);
  }

  fit2City(cityCode) {
    if (Array.isArray(cityCode)) cityCode = cityCode.join(",");
    const cityCodes = cityCode.split(",");
    if (cityCode === "") return;
    const { baseUrl, token } = this;
    const url = `${baseUrl}/api/xy/aoi/city${URL_SUFFIX_DICT["bbox"]}`;
    const params = {
      token,
      cityCode: cityCodes[0],
    };
    this.fitMapByParams(url, params);
  }

  fitMapByParams(url, params) {
    post(url, params).then((res) => {
      if (res.status === 0) {
        const { minX, minY, maxX, maxY, x, y } = res.result.data;
        if (minX && minY) {
          const bbox = [
            [minX, minY],
            [maxX, maxY],
          ];
          const padding = 80;
          this.map.fitBounds(bbox, {
            padding: {
              top: padding,
              bottom: padding,
              left: padding,
              right: padding,
            },
          });
        } else {
          this.map.flyTo({
            center: [x, y],
            zoom: 16,
          });
        }
      }
    });
  }

  setStyle() {
    return new Promise((resolve, reject) => {
      let promises = [];
      const { mapId, baseUrl, cityCode, token } = this;
      const {
        functionId,
        type,
        defaultStyle,
        defaultLabelStyle,
        defaultHighLightStyle,
        codeField,
        labelField,
        isLabel,
      } = this.options;

      const params = {
        functionId,
        mapId,
        sldVersion: "1",
        cityCode,
        type: type,
        token,
        layer: AOI_LAYERS,
        codeField: codeField,
      };

      // 设置展示样式
      const commonUrl = baseUrl + STYLE_DICT["save"] + URL_SUFFIX_DICT["save"];
      const commonParams = {
        ...params,
        styleType: STYLE_TYPE_DICT["normal"],
        style: JSON.stringify(defaultStyle),
      };
      promises.push(
        new Promise((resolve) => {
          post(commonUrl, commonParams).then((res) => {
            if (res.status === 0) resolve();
          });
        })
      );

      // 设置高亮样式
      const highlightUrl =
        baseUrl + STYLE_DICT["save"] + URL_SUFFIX_DICT["save"];
      const highlightParams = {
        ...params,
        styleType: STYLE_TYPE_DICT["highlight"],
        style: JSON.stringify(defaultHighLightStyle),
      };
      promises.push(
        new Promise((resolve) => {
          post(highlightUrl, highlightParams).then((res) => {
            if (res.status === 0) resolve();
          });
        })
      );

      if (isLabel) {
        // 设置标注样式
        const labelUrl =
          baseUrl + STYLE_DICT["label"] + URL_SUFFIX_DICT["label"];
        if (labelField) {
          defaultLabelStyle.labelField = labelField;
          params.labelField = labelField;
        }
        const labelParams = {
          ...params,
          styleType: STYLE_TYPE_DICT["label"],
          style: JSON.stringify(defaultLabelStyle),
        };
        promises.push(
          new Promise((resolve) => {
            post(labelUrl, labelParams)
              .then((res) => {
                if (res.status === 0) resolve();
              })
              .catch((e) => {
                console.log(e);
              });
          })
        );
      }

      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  getLayerUrl(styleType) {
    const { cityCode, mapId, token, baseUrl } = this;
    const {
      znoCode,
      functionId,
      type,
      codeField,
      tileSize,
      znoCodeField,
      isAoiAreaStyle,
    } = this.options;
    const znoField = ZNO_CODE_FIELD_DICT[znoCodeField];
    let cityCodes = cityCode.split(",");
    let filter =
      cityCodes.length > 1
        ? `city_code in ('${cityCodes.join("','")}')`
        : `city_code='${cityCode}'`;
    if (cityCode.toLocaleLowerCase() === "all")
      filter = `city_code <> '${cityCode}'`;
    let params = {
      access_token: token,
      service: "WMS",
      request: "GetMap",
      layers: AOI_LAYERS,
      format: "image/png",
      transparent: true,
      version: "1.1.1",
      partnerID: "XIAOYI",
      serviceCode: "COM_RECE_GIS_BMAP_LAYER",
      isTile: true,
      codeField: codeField,
      mapId: mapId,
      sldVersion: 1,
      styleType: styleType,
      cityCode: cityCode,
      LAYERGROUP: AOI_LAYERS,
      functionId: functionId,
      type: type,
      height: tileSize,
      width: tileSize,
      srs: "EPSG:3857",
      bbox: "{bbox-epsg-3857}",
      t: Date.now(),
    };
    if (styleType.indexOf("1") !== -1) {
      if (Object.keys(this.options.filterData || {}).length > 0)
        params.customFilter = 1;
      params.layerType = CODE_FIELD_DICT[codeField];

      // 判断是不是AOI区域图层，只在默认的时候展示
      if (type === "aoiarea" && isAoiAreaStyle) params.isAoiAreaStyle = 1;
    }

    if (znoCode) {
      let znoCodes = znoCode.split(",");
      const znoFilter =
        znoCodes.length > 1
          ? `${znoField} in ('${znoCodes.join("','")}')`
          : `${znoField}='${znoCode}'`;
      filter += ` and ${znoFilter}`;
      params[znoCodeField] = znoCode;
    }
    params["CQL_FILTER"] = encodeURIComponent(filter);
    const env = this.options.inner ? "inner" : "outer";
    let res = `${baseUrl}${AOI_LAYER_URL[env]}`;
    Object.keys(params).forEach((k, i) => {
      const join = i === 0 ? "?" : "&";
      res += `${join}${k}=${params[k]}`;
    });
    return res;
  }

  updateAOILayerPlugin() {
    const { map } = this;
    const { minZoom, maxZoom, tileSize, isLabel } = this.options;
    const layerId = this.LAYER_ID;
    const layerBase = map.getLayer(layerId + "-highlight")
      ? layerId + "-highlight"
      : this.BASE_LAYER_ID;
    try {
      if (map && map.getLayer(layerId)) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
      }
    } catch (e) {
      console.log(e);
    }
    // 展示图层
    map.addSource(layerId, {
      type: "raster",
      tiles: [this.getLayerUrl(isLabel ? "1,3" : "1")],
      tileSize: tileSize,
    });
    map.addLayer(
      {
        id: layerId,
        type: "raster",
        source: layerId,
        minzoom: minZoom,
        maxzoom: maxZoom,
        layout: {
          visibility: this.isShow ? "visible" : "none",
        },
      },
      layerBase
    );
  }

  updateHighlightLayer() {
    const { map, selectedAois } = this;
    const { minZoom, maxZoom, tileSize, isLabel } = this.options;
    const layerId = this.LAYER_ID + "-highlight";

    try {
      if (map && map.getLayer(layerId)) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
      }
    } catch (e) {
      console.log(e);
    }

    if (selectedAois.length > 0) {
      // 高亮图层
      map.addSource(layerId, {
        type: "raster",
        tiles: [this.getLayerUrl(isLabel ? "2,3" : "2")],
        tileSize: tileSize,
      });
      map.addLayer(
        {
          id: layerId,
          type: "raster",
          source: layerId,
          minzoom: minZoom,
          maxzoom: maxZoom,
          layout: {
            visibility: this.isShow ? "visible" : "none",
          },
        },
        this.BASE_LAYER_ID
      );
    }
  }
  /**
   * 隐藏AOI展示
   * @returns void
   */
  hide() {
    const { map } = this;
    if (!map.getLayer(this.LAYER_ID)) {
      return;
    }
    const visibility = "none";
    map.setLayoutProperty(this.LAYER_ID, "visibility", visibility);
    if (map.getLayer(this.LAYER_ID + "-highlight"))
      map.setLayoutProperty(
        this.LAYER_ID + "-highlight",
        "visibility",
        visibility
      );

    this.isShow = false;
    return this;
  }
  /**
   * 显示AOI展示
   * @returns void
   */
  show() {
    const { map } = this;
    if (map.getLayer(this.LAYER_ID)) {
      const visibility = "visible";
      map.setLayoutProperty(this.LAYER_ID, "visibility", visibility);
      if (map.getLayer(this.LAYER_ID + "-highlight"))
        map.setLayoutProperty(
          this.LAYER_ID + "-highlight",
          "visibility",
          visibility
        );
    } else {
      this.updateAOILayerPlugin();
    }
    this.isShow = true;
    return this;
  }

  /**
   * 清空矢量图层
   */
  clearVector() {
    const source = this.map.getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`);
    if (source) {
      source.setData(turf.featureCollection([]));
    }
  }

  /**
   * 移除AOI图层
   * @returns void
   */
  remove() {
    const { map } = this;
    try {
      // if (map.getLayer(this.BASE_LAYER_ID)) map.removeLayer(this.BASE_LAYER_ID);
      if (map && map.getSource(`${this.BASE_VECTOR_LAYER_ID}-vector`)) {
        map.removeLayer(`${this.BASE_VECTOR_LAYER_ID}-fill`);
        map.removeLayer(`${this.BASE_VECTOR_LAYER_ID}-line`);
        map.removeSource(`${this.BASE_VECTOR_LAYER_ID}-vector`);
      }
      if (map && map.getLayer(this.LAYER_ID)) {
        map.removeLayer(this.LAYER_ID);
        map.removeSource(this.LAYER_ID);
      }
      if (map && map.getLayer(this.LAYER_ID + "-highlight")) {
        map.removeLayer(this.LAYER_ID + "-highlight");
        map.removeSource(this.LAYER_ID + "-highlight");
      }
      this.isShow = false;
      return this;
    } catch (e) {
      console.log(e);
      return this;
    }
  }
}

export default AOILayerPlugin;

// 兼容非模块环境（script标签直接引入）
if (typeof window !== 'undefined') {
  window.AOILayerPlugin = AOILayerPlugin;
}
