# SFMap AOI Heatmap Plugin

基于 Mapbox GL JS 的 AOI 收派件热力图插件，通过 WMS 服务展示业务热力分布数据。

## 功能特性

- ✅ **收派件热力图** - 支持展示收件、派件、收派件综合热力图
- ✅ **多时间维度** - 支持 7 天、15 天、30 天、90 天四个时间范围
- ✅ **动态更新** - 根据地图视图范围自动请求和更新热力图
- ✅ **网点过滤** - 支持按网点编码过滤数据
- ✅ **城市分片** - 支持全国城市分片数据加载
- ✅ **单图模式** - 采用单张图片模式，避免瓦片拼接问题
- ✅ **图层控制** - 支持显示/隐藏/透明度调整

## 安装

```bash
npm install sfmap-heatmap-plugin
# 或
pnpm add sfmap-heatmap-plugin
```

## 快速开始

```javascript
import { HeatmapPlugin } from 'sfmap-heatmap-plugin';

// 创建热力图插件实例
const heatmap = new HeatmapPlugin(map, {
  cityCode: '755',      // 深圳市城市编码，必填
  layerIndex: 1,        // 7天热力图
  type: 3,              // 收派件
  env: 'prod',          // 生产环境
  opacity: 0.8          // 图层透明度
});
```

## 核心参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `cityCode` | String | - | 是 | 城市编码，如 '755'（深圳）、'020'（广州） |
| `zoneCode` | String | `''` | 否 | 网点编码，如 '755AC' |
| `layerIndex` | Number | `1` | 否 | 时间范围：1-7天, 2-15天, 3-30天, 4-90天 |
| `type` | Number | `1` | 否 | 业务类型：1-收件, 2-派件, 3-收派件 |
| `env` | String | `'prod'` | 否 | 环境：'prod'（生产）或 'sit'（测试） |
| `opacity` | Number | `0.8` | 否 | 图层透明度，范围 0-1 |
| `minZoom` | Number | `8` | 否 | 最小显示级别 |
| `maxZoom` | Number | `22` | 否 | 最大显示级别 |

## API 方法

### 实例方法

- `setCityCode(cityCode)` - 更新城市编码
- `setZoneCode(zoneCode)` - 更新网点编码
- `setLayerIndex(layerIndex)` - 更新时间范围
- `setType(type)` - 更新业务类型
- `updateParams(params)` - 同时更新多个参数
- `show()` - 显示热力图
- `hide()` - 隐藏热力图
- `toggle()` - 切换显示/隐藏
- `setOpacity(opacity)` - 设置透明度
- `refresh()` - 手动刷新
- `destroy()` - 销毁插件
- `getParams()` - 获取当前参数
- `getWmsUrl()` - 获取当前 WMS URL
- `getLayerId()` - 获取图层 ID
- `getSourceId()` - 获取数据源 ID

### 静态方法

- `HeatmapPlugin.getLayerIndexByCityCode(cityCode)` - 获取城市分片索引
- `HeatmapPlugin.getLayerNames()` - 获取图层名称映射
- `HeatmapPlugin.getTypeDescription(type)` - 获取类型描述
- `HeatmapPlugin.getLayerIndexDescription(layerIndex)` - 获取时间范围描述

## 使用示例

### 基本使用

```javascript
const heatmap = new HeatmapPlugin(map, {
  cityCode: '755',
  layerIndex: 1,
  type: 3,
  env: 'prod',
  opacity: 0.8
});
```

### 切换时间范围

```javascript
heatmap.setLayerIndex(2);  // 15天热力图
heatmap.setLayerIndex(3);  // 30天热力图
heatmap.setLayerIndex(4);  // 90天热力图
```

### 切换业务类型

```javascript
heatmap.setType(1);  // 收件热力图
heatmap.setType(2);  // 派件热力图
heatmap.setType(3);  // 收派件热力图
```

### 网点过滤

```javascript
heatmap.setZoneCode('755AC');  // 过滤指定网点
heatmap.setZoneCode('');       // 清除过滤
```

### 切换城市

```javascript
heatmap.setCityCode('020');  // 广州
map.flyTo({ center: [113.26, 23.13], zoom: 12 });

heatmap.setCityCode('021');  // 上海
map.flyTo({ center: [121.47, 31.23], zoom: 12 });
```

### 图层控制

```javascript
heatmap.show();      // 显示
heatmap.hide();      // 隐藏
heatmap.toggle();    // 切换
heatmap.setOpacity(0.5);  // 设置透明度
heatmap.refresh();   // 手动刷新
```

### 查询信息

```javascript
const params = heatmap.getParams();
console.log(params);

const url = heatmap.getWmsUrl();
console.log(url);

const shardIndex = HeatmapPlugin.getLayerIndexByCityCode('755');
console.log(shardIndex);  // '07'
```

## 常用城市编码

| 城市 | 城市编码 | 分片索引 |
|------|----------|----------|
| 北京 | 010 | 02 |
| 上海 | 021 | 01 |
| 广州 | 020 | 07 |
| 深圳 | 755 | 07 |
| 天津 | 022 | 06 |
| 重庆 | 023 | 02 |
| 杭州 | 0571 | 09 |
| 南京 | 025 | 09 |
| 武汉 | 027 | 08 |

## 示例程序

运行示例程序：

```bash
pnpm run dev
```

访问：`http://localhost:5173/heatmap.html`

示例功能：
- 初始化深圳收派件热力图
- 切换时间范围（7天/15天/30天/90天）
- 切换业务类型（收件/派件/收派件）
- 按网点编码过滤数据
- 调整图层透明度
- 切换不同城市
- 查看当前参数和 WMS URL

## API 文档

详细的 API 文档请参阅：[热力图插件文档](../../docs/guide/heatmap-plugin.md)

## 技术细节

### WMS 服务

插件通过 WMS (Web Map Service) 接口获取热力图数据：
- 根据地图视图范围动态请求单张热力图
- 支持城市、网点、业务类型、时间范围等过滤条件
- 使用 EPSG:3857 (Web Mercator) 坐标系

### 单图模式

- 使用 Mapbox 的 `image` 类型 Source
- 避免瓦片拼接问题
- 根据 `coordinates` 参数精确定位图片四角

### 自动更新

- 监听地图 `move`、`moveend`、`zoomend` 事件
- 使用 300ms 防抖优化性能
- 缩放级别超出范围时不更新

## 依赖

- [proj4](https://proj4js.org/) - 坐标系转换
- [mapbox-gl-js](https://docs.mapbox.com/mapbox-gl-js/) - 地图库

## 注意事项

1. `cityCode` 为必填参数，需传入正确的城市编码
2. 默认缩放级别范围为 8-22，可通过参数调整
3. 热力图会自动跟随地图移动更新
4. 使用 `destroy()` 销毁插件，避免内存泄漏
5. 切换城市后需同时定位地图

## License

MIT
