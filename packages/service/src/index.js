import TokenUtil from "../../../src/utils/token";
import * as turf from "@turf/turf";

const BASE_URL = {
  sit: "https://gis-inner-map.sit.sf-express.com/non-std/gis/api",
  prod: "https://gis-inner-map.sf-express.com/non-std/gis/api",
};

// 网关地址
const ORION_GATEWAY = {
  sit: "https://orion-gateway.sit.sf-express.com",
  prod: "https://orion-gateway.sf-express.com",
};

/**
 * @class ServicesPlugin
 * @classdesc 地图服务插件 - 提供地理编码、逆地理编码、路径规划、POI搜索等能力
 * 
 * 核心功能：
 * 1. 地理编码服务 - 将地址转换为坐标
 * 2. 逆地理编码服务 - 将坐标转换为地址
 * 3. 路径规划服务 - 计算导航路径并在地图上展示
 * 4. 输入提示服务 - 根据关键字搜索POI
 * 5. 地图可视化 - 路径渲染、标记点、弹出框
 */
export class ServicesPlugin {
  /**
   * 构造函数
   * @param {Object} params - 初始化参数
   * @param {SFMap.Map} [params.map] - map对象（可选，可在后续通过setMap设置）
   * @param {String} [params.token] - 服务授权码（与ak二选一）
   * @param {String} [params.ak] - 服务授权码（与token二选一）
   * @param {String} params.appId - appId（认证必填）
   * @param {String} params.appSecret - app秘钥（认证必填）
   * @param {String} params.username - 用户名（认证必填）
   * @param {String} params.password - 用户密码（认证必填）
   * @param {String} [params.baseUrl] - 自定义服务基础路径
   * @param {String} [params.env='sit'] - 环境参数：'sit'测试环境，'prod'生产环境
   * @throws {Error} 当必填参数缺失时抛出错误
   */
  constructor(params) {
    params = {
      map: null,
      env: "sit",
      token: "",
      username: "",
      password: "",
      appId: "",
      appSecret: "",
      ak: "",
      baseUrl: "",
      ...params,
    };

    // 参数校验
    if (!params.map) {
      console.warn("ServicesPlugin: map参数为空，请在后续调用setMap()设置地图实例");
    }
    if (!params.token && !params.ak) {
      throw new Error("ServicesPlugin: token或ak不能为空");
    }
    if (
      !params.username ||
      !params.password ||
      !params.appId ||
      !params.appSecret
    ) {
      throw new Error("ServicesPlugin: appId, appSecret, username, password不能为空！");
    }

    const that = this;

    that.map = params.map;
    that.token = params.token;
    that.ak = params.ak;
    that.baseUrl = params.baseUrl || BASE_URL[params.env];
    that.originUrl = ORION_GATEWAY[params.env];

    // 初始化 Token 工具
    this.tokenUtil = new TokenUtil({
      username: params.username,
      password: params.password,
      appId: params.appId,
      appSecret: params.appSecret,
      baseUrl: that.originUrl,
    });

    // 初始化状态
    that.marker = null;
    that.popup = null;
    that.markers = [];

    // 如果已有地图实例，初始化图层
    if (that.map) {
      that._mapLoaded();
    }
  }

  /**
   * 设置地图实例
   * @param {SFMap.Map} map - map对象
   * @description 如果在初始化时未传入地图实例，可通过此方法设置
   */
  setMap(map) {
    const that = this;
    that.map = map;
    that._mapLoaded();
  }

  /**
   * 地图加载完成后的初始化操作
   * @private
   * @description 初始化路径图层、箭头图标、起终点标记图层
   */
  _mapLoaded() {
    const that = this;

    // 路径箭头图标 (Base64)
    const arrow =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnElEQVQ4T63TsQ0CMQyF4f/NgMQQ0CBR0FIx190cFIiWhhFoKdgEiRUeSoF0gO8cjkub+Evs2OLPpc9422dgBRwlNZn/BtjeApdOUJsh0QuuwKYWiYAFcAKWHaSR1EbpfAHlkO0ICdMJgV+QXmAAmUu6v9IZA8wkPVKgtg7TF7H25t4UbN+A9ahGmqqVD8AO2GdzUF45+I3ZJJb9JxbwRhEhB66xAAAAAElFTkSuQmCC";

    // 添加路径数据源和图层
    if (!that.map.getSource("plugin-source-route")) {
      // 路径线数据源
      that.map.addSource("plugin-source-route", {
        type: "geojson",
        data: turf.featureCollection([]),
      });

      // 路径点数据源（起终点、途经点）
      that.map.addSource("plugin-source-route-point", {
        type: "geojson",
        data: turf.featureCollection([]),
      });

      // 路径线图层
      that.map.addLayer({
        id: "plugin-layer-route",
        type: "line",
        source: "plugin-source-route",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#07ab1d",
          "line-width": 6,
        },
      });

      // 加载箭头图标并添加箭头图层
      that.map.loadImage(arrow, function (error, image) {
        if (error) throw error;

        that.map.addImage("route-arrow", image);

        // 路径箭头图层
        that.map.addLayer({
          id: "plugin-layer-route-arrow",
          source: "plugin-source-route",
          type: "symbol",
          layout: {
            "symbol-placement": "line",
            "symbol-spacing": 20,
            "icon-image": "route-arrow",
            "icon-size": 0.4,
            "icon-allow-overlap": true,
          },
        });

        // 起终点样式配置
        const pointDict = {
          0: { text: "起", color: "#006aff" },   // 起点
          9: { text: "终", color: "#da0505" },   // 终点
          5: { text: "经", color: "#04ab22" },   // 途经点
        };

        // 路径点圆形图层
        that.map.addLayer({
          id: "plugin-layer-route-point",
          source: "plugin-source-route-point",
          type: "circle",
          paint: {
            "circle-color": [
              "match",
              ["get", "type"],
              "0", pointDict["0"].color,
              "9", pointDict["9"].color,
              pointDict["5"].color,
            ],
            "circle-radius": 13,
          },
        });

        // 路径点文字图层
        that.map.addLayer({
          id: "plugin-layer-route-symbol",
          source: "plugin-source-route-point",
          type: "symbol",
          layout: {
            "text-allow-overlap": true,
            "text-field": [
              "match",
              ["get", "type"],
              "0", pointDict["0"].text,
              "9", pointDict["9"].text,
              pointDict["5"].text,
            ],
            "text-font": ["Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#fff",
          },
        });
      });
    }
  }

  /**
   * 构建请求参数字符串
   * @private
   * @param {Object} params - 参数对象
   * @returns {String} URL参数字符串
   */
  _getRequestParams(params) {
    let index = 0;
    let url = "";
    for (const k in params) {
      const join = index === 0 ? "?" : "&";
      url += `${join}${k}=${encodeURIComponent(params[k])}`;
      index++;
    }
    return url;
  }

  /**
   * 清除所有标记点
   * @private
   */
  _clearMarkers() {
    const that = this;
    that.markers.forEach((marker) => {
      marker.remove();
    });
    that.markers = [];
  }

  /**
   * 地图自适应到指定边界
   * @private
   * @param {Array} bbox - 边界框 [[xmin, ymin], [xmax, ymax]]
   */
  _fit2bbox(bbox) {
    const that = this;
    const padding = 60;
    that.map.fitBounds(bbox, {
      padding: { top: padding, bottom: padding, left: padding, right: padding },
    });
  }

  /**
   * 添加标记点和弹出框
   * @private
   * @param {String} name - 标记名称
   * @param {Number} xcoord - 经度
   * @param {Number} ycoord - 纬度
   * @param {Object} [style={}] - 标记样式
   * @param {String} [style.color='#f00'] - 标记颜色
   * @param {Number} [style.scale=0.75] - 标记缩放比例
   */
  _addMarker(name, xcoord, ycoord, style = {}) {
    const that = this;

    // 清除之前的标记
    if (that.marker) that.marker.remove();
    if (that.popup) that.popup.remove();

    const scale = style.scale || 0.75;

    // 创建标记
    that.marker = new mapboxgl.Marker({
      color: style.color || "#f00",
      scale,
    })
      .setLngLat([xcoord, ycoord])
      .addTo(that.map);

    // 创建弹出框
    that.popup = new mapboxgl.Popup({
      anchor: "bottom",
      closeButton: true,
      offset: [0, -(scale * 28)],
    })
      .setLngLat([xcoord, ycoord])
      .setHTML(`<div style="padding-top: 3px;">${name}</div>`)
      .setMaxWidth("600px")
      .addTo(that.map);

    // 关闭弹出框时移除标记
    that.popup.on("close", () => {
      if (that.marker) {
        that.marker.remove();
        that.marker = null;
      }
      that.popup = null;
    });
  }

  /**
   * 地理编码服务 - 将地址转换成坐标
   * @param {Object} params - 参数
   * @param {String} params.address - 地址文本信息（必填）
   * @param {String} [params.url] - 自定义服务基础路径
   * @param {String} [params.token] - 服务授权码
   * @param {String} [params.city] - 地址所在城市（城市名、编码或区划代码）
   * @param {Number} [params.normal=1] - 是否进行地址规范化处理，1=规范化（默认）
   * @param {Number} [params.exact] - CX专用，当exact=1时进行二次调用
   * @param {Boolean} [params.isShowMarker=true] - 是否显示Marker标记
   * @param {Object} [params.markerStyleOptions={color: '#f00', scale: 0.75}] - 标记样式
   * @param {Boolean} [params.isLocate=true] - 是否定位到结果
   * @returns {Promise<Object>} 返回地理编码结果
   * @returns {Number} return.xcoord - 经度
   * @returns {Number} return.ycoord - 纬度
   * @returns {String} return.src_address - 标准地址
   */
  geo(params) {
    const that = this;
    const paramsApi = { ...params };

    if (that.token) paramsApi.token = that.token;
    if (that.ak) paramsApi.ak = that.ak;

    // 移除非API参数
    delete paramsApi["isShowMarker"];
    delete paramsApi["isLocate"];
    delete paramsApi["markerStyleOptions"];

    const baseUrl = params.url || that.baseUrl;
    const url = baseUrl + `/geo/api` + that._getRequestParams(paramsApi);

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 0) {
            const paramsNew = {
              isShowMarker: true,
              isLocate: true,
              ...params,
            };

            const { xcoord, ycoord, src_address } = res.result;

            // 显示标记
            if (that.map && paramsNew.isShowMarker) {
              that._addMarker(
                src_address,
                xcoord,
                ycoord,
                paramsNew.markerStyleOptions
              );
            }

            // 定位到结果
            if (that.map && paramsNew.isLocate) {
              that.map.flyTo({ center: [xcoord, ycoord] });
            }

            resolve(res.result);
          } else {
            reject(new Error(res.result?.msg || "地理编码失败"));
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 逆地理编码服务 - 将坐标转换成地址
   * @param {Object} params - 参数
   * @param {Number} params.x - 经度（必填）
   * @param {Number} params.y - 纬度（必填）
   * @param {String} [params.url] - 自定义服务基础路径
   * @param {String} [params.token] - 服务授权码
   * @param {Boolean} [params.isShowMarker=true] - 是否显示Marker标记
   * @param {Object} [params.markerStyleOptions={color: '#f00', scale: 0.75}] - 标记样式
   * @param {Boolean} [params.isLocate=true] - 是否定位到结果
   * @returns {Promise<Object>} 返回逆地理编码结果
   * @returns {String} return.name - 地址名称
   * @returns {String} return.address - 详细地址
   */
  rgeo(params) {
    const that = this;
    const paramsApi = { ...params };

    if (that.token) paramsApi.token = that.token;
    if (that.ak) paramsApi.ak = that.ak;

    delete paramsApi["isShowMarker"];
    delete paramsApi["isLocate"];
    delete paramsApi["markerStyleOptions"];

    const baseUrl = params.url || that.baseUrl;
    const url = baseUrl + `/rgeo/api` + that._getRequestParams(paramsApi);

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 0) {
            const paramsNew = {
              isShowMarker: true,
              isLocate: true,
              markerStyleOptions: {
                color: "#f00",
                scale: 0.75,
              },
              ...params,
            };

            const { name } = res.result;
            const { x, y } = paramsNew;

            // 显示标记
            if (that.map && paramsNew.isShowMarker) {
              that._addMarker(name, x, y, paramsNew.markerStyleOptions);
            }

            // 定位到结果
            if (that.map && paramsNew.isLocate) {
              that.map.flyTo({ center: [x, y] });
            }

            resolve(res.result);
          } else {
            reject(new Error(res.result?.msg || "逆地理编码失败"));
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 路径规划服务 - 根据起点和终点查询导航路径
   * @param {Object} params - 参数
   * @param {Number} [params.x1] - 起点经度（与origin二选一，优先坐标）
   * @param {Number} [params.y1] - 起点纬度（与origin二选一，优先坐标）
   * @param {Number} [params.x2] - 终点经度（与destination二选一，优先坐标）
   * @param {Number} [params.y2] - 终点纬度（与destination二选一，优先坐标）
   * @param {String} [params.origin] - 起点地址（UTF8编码）
   * @param {String} [params.destination] - 终点地址（UTF8编码）
   * @param {String} [params.url] - 自定义服务基础路径
   * @param {String} [params.token] - 服务授权码
   * @param {Number} [params.type=0] - 导航类型：0-驾车，1-骑行
   * @param {Number} [params.strategy=0] - 导航策略：0-时间优先，2-距离优先，3-高速优先，4-躲避拥堵，6-频次最高，10-多路径
   * @param {String} [params.waypoints] - 途经点，格式：x1,y1\|x2,y2，最多5个
   * @param {Boolean} [params.isShowRoute=true] - 是否在地图上展示路径
   * @param {Boolean} [params.isLocate=true] - 是否定位到结果范围
   * @returns {Promise<Object>} 返回路径规划结果
   * @returns {Array} return.coords - 路径坐标数组
   * @returns {Number} return.distance - 总距离（米）
   * @returns {Number} return.duration - 预计时间（秒）
   */
  route(params) {
    const that = this;
    const paramsApi = {
      token: that.token,
      type: 0,
      cc: 1,
      strategy: 0,
      opt: "sf2",
      Vehicle: 1,
      AxleWeight: 0,
      AxleNumber: 0,
      energy: 1,
      width: 0,
      ...params,
    };

    if (that.token) paramsApi.token = that.token;
    if (that.ak) paramsApi.ak = that.ak;

    delete paramsApi["isShowRoute"];
    delete paramsApi["isLocate"];

    const baseUrl = params.url || that.baseUrl;
    const url = baseUrl + `/rp/v2/api` + that._getRequestParams(paramsApi);

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 0) {
            const paramsNew = {
              isShowRoute: true,
              isLocate: true,
              ...params,
            };

            const { coords, wayPointList } = res.result;

            // 在地图上显示路径
            if (that.map && paramsNew.isShowRoute) {
              // 更新路径线
              that.map.getSource("plugin-source-route").setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: coords,
                },
              });

              // 构建起终点和途经点
              let points = [];

              // 起点
              points.push({
                type: "Feature",
                properties: { type: "0" },
                geometry: {
                  type: "Point",
                  coordinates: coords[0],
                },
              });

              // 终点
              points.push({
                type: "Feature",
                properties: { type: "9" },
                geometry: {
                  type: "Point",
                  coordinates: coords[coords.length - 1],
                },
              });

              // 途经点（如有）
              // if (wayPointList && wayPointList.length > 0) {
              //   wayPointList.forEach((pt) => {
              //     points.push({
              //       type: "Feature",
              //       properties: { type: "5" },
              //       geometry: {
              //         type: "Point",
              //         coordinates: pt.point.split(",").map(Number),
              //       },
              //     });
              //   });
              // }

              // 更新路径点数据源
              that.map
                .getSource("plugin-source-route-point")
                .setData(turf.featureCollection(points));
            }

            // 定位到路径范围
            if (that.map && paramsNew.isLocate) {
              let xmin = 999, ymin = 999, xmax = -999, ymax = -999;

              coords.forEach((xy) => {
                const [x, y] = xy;
                xmin = Math.min(x, xmin);
                ymin = Math.min(y, ymin);
                xmax = Math.max(x, xmax);
                ymax = Math.max(y, ymax);
              });

              const bbox = [
                [xmin, ymin],
                [xmax, ymax],
              ];
              that._fit2bbox(bbox);
            }

            resolve(res.result);
          } else {
            reject(new Error(res.result?.msg || "路径规划失败"));
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * 输入提示服务 - 根据关键字搜索相近的POI
   * @param {Object} params - 参数
   * @param {String} params.q - 搜索关键字（必填）
   * @param {String} [params.city] - 城市名称、编码或区划代码（如深圳、755、440300）
   * @param {String} [params.url] - 自定义服务基础路径
   * @param {String} [params.token] - 服务授权码
   * @param {String} [params.country] - 国家（ISO-3166-1标准代码）
   * @param {String} [params.district] - 中文区县（需city字段不为空）
   * @param {Boolean} [params.isShow=true] - 是否在地图上展示结果
   * @param {Boolean} [params.isLocate=true] - 是否定位到结果
   * @param {Object} [params.markerStyle={color: '#f00', scale: 0.75}] - 标记样式
   * @returns {Promise<Array>} 返回POI列表
   * @returns {String} return[].name - POI名称
   * @returns {String} return[].detail_addr - 详细地址
   * @returns {Number} return[].xcoord - 经度
   * @returns {Number} return[].ycoord - 纬度
   */
  tip(params) {
    const that = this;
    const paramsApi = {
      q: "",
      cc: 1,
      city: "",
      district: "",
      ...params,
    };

    if (that.token) paramsApi.token = that.token;
    if (that.ak) paramsApi.ak = that.ak;

    delete paramsApi["isShow"];
    delete paramsApi["isLocate"];
    delete paramsApi["markerStyle"];

    const baseUrl = params.url || that.baseUrl;
    const { city, district } = paramsApi;

    // 有城市信息时使用本地服务，否则调用高德接口
    if (city || district) {
      const url = baseUrl + `/tip/api` + that._getRequestParams(paramsApi);

      return new Promise((resolve, reject) => {
        fetch(url)
          .then((res) => res.json())
          .then((res) => {
            if (res.status === 0) {
              const paramsNew = {
                isShow: true,
                isLocate: true,
                markerStyle: {
                  color: "#f00",
                  scale: 0.75,
                },
                ...params,
              };

              let xmin = 999, ymin = 999, xmax = -999, ymax = -999;

              // 清除之前的标记
              that._clearMarkers();

              const { POISet } = res.result;

              POISet.forEach((poi) => {
                xmin = Math.min(poi.xcoord, xmin);
                ymin = Math.min(poi.ycoord, ymin);
                xmax = Math.max(poi.xcoord, xmax);
                ymax = Math.max(poi.ycoord, ymax);

                // 添加标记
                if (that.map && paramsNew.isShow) {
                  const scale = paramsNew.markerStyle.scale || 0.75;
                  const marker = new mapboxgl.Marker({
                    color: paramsNew.markerStyle.color || "#f00",
                    scale,
                  })
                    .setLngLat([poi.xcoord, poi.ycoord])
                    .addTo(that.map);

                  that.markers.push(marker);
                }
              });

              // 定位到结果范围
              if (that.map && paramsNew.isLocate && xmin !== 999) {
                const bbox = [
                  [xmin, ymin],
                  [xmax, ymax],
                ];
                that._fit2bbox(bbox);
              }

              // 格式化返回结果
              resolve(
                res.result.POISet.map((d) => {
                  const {
                    adname,
                    name,
                    detail_addr,
                    xcoord,
                    ycoord,
                    key_prefix,
                  } = d;
                  return {
                    adname,
                    name,
                    detail_addr,
                    xcoord,
                    ycoord,
                    key_prefix,
                  };
                })
              );
            } else {
              reject(new Error(res.result?.msg || "搜索失败"));
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    } else {
      // 没有城市信息时调用高德接口
      return new Promise((resolve, reject) => {
        that.tokenUtil.getToken().then((token) => {
          const paramsApi = {
            keywords: params.q,
          };
          const url =
            that.originUrl +
            `/map/api/remote/queryPoi` +
            that._getRequestParams(paramsApi);

          fetch(url, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.status === 0 && res.result.status == 1) {
                const paramsNew = {
                  isShow: true,
                  isLocate: true,
                  markerStyle: {
                    color: "#f00",
                    scale: 0.75,
                  },
                  ...params,
                };

                let xmin = 999, ymin = 999, xmax = -999, ymax = -999;

                // 清除之前的标记
                that._clearMarkers();

                const { pois } = res.result;

                pois.forEach((poi) => {
                  const [xcoord, ycoord] = poi.location.split(",").map(Number);

                  xmin = Math.min(xcoord, xmin);
                  ymin = Math.min(ycoord, ymin);
                  xmax = Math.max(xcoord, xmax);
                  ymax = Math.max(ycoord, ymax);

                  // 添加标记
                  if (that.map && paramsNew.isShow) {
                    const scale = paramsNew.markerStyle.scale || 0.75;
                    const marker = new mapboxgl.Marker({
                      color: paramsNew.markerStyle.color || "#f00",
                      scale,
                    })
                      .setLngLat(poi.location.split(",").map(Number))
                      .addTo(that.map);

                    that.markers.push(marker);
                  }
                });

                // 定位到结果范围
                if (that.map && paramsNew.isLocate && xmin !== 999) {
                  const bbox = [
                    [xmin, ymin],
                    [xmax, ymax],
                  ];
                  that._fit2bbox(bbox);
                }

                // 格式化返回结果
                resolve(
                  res.result.pois.map((d) => {
                    const { address, pname, cityname, adname, name, location } = d;
                    const [xcoord, ycoord] = location.split(",").map(Number);
                    return {
                      adname: [pname, cityname, adname],
                      name,
                      detail_addr: [pname, cityname, adname].join("") + address,
                      xcoord: xcoord,
                      ycoord: ycoord,
                      key_prefix: address,
                    };
                  })
                );
              } else {
                reject(new Error(res.result?.msg || "搜索失败"));
              }
            })
            .catch((e) => {
              reject(e);
            });
        });
      });
    }
  }

  /**
   * 清除所有展示内容
   * @description 清除标记点、弹出框、路径线等所有可视化元素
   */
  clear() {
    const that = this;

    // 清除POI标记
    that._clearMarkers();

    // 清除地理编码/逆地理编码标记
    if (that.marker) {
      that.marker.remove();
      that.marker = null;
    }
    if (that.popup) {
      that.popup.remove();
      that.popup = null;
    }

    // 清除路径数据
    if (that.map) {
      that.map.getSource("plugin-source-route").setData(turf.featureCollection([]));
      that.map.getSource("plugin-source-route-point").setData(turf.featureCollection([]));
    }
  }

  /**
   * 销毁插件
   * @description 清理所有资源，销毁后插件实例不可再用
   */
  destroy() {
    this.clear();
    this.map = null;
    this.tokenUtil = null;
  }
}