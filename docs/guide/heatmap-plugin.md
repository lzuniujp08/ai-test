# AOI 热力图插件

AOI 热力图插件（HeatmapPlugin）是一个基于 Mapbox GL JS 的 WMS 图层插件，用于展示收派件业务热力分布数据。

## 功能概述

热力图插件提供以下核心功能：

1. **收派件热力图** - 支持展示收件、派件、收派件综合热力图
2. **多时间维度** - 支持 7 天、15 天、30 天、90 天四个时间范围
3. **动态更新** - 根据地图视图范围自动请求和更新热力图
4. **网点过滤** - 支持按网点编码过滤数据
5. **图层控制** - 支持显示/隐藏/透明度调整
6. **城市分片** - 支持全国城市分片数据加载
7. **单图模式** - 采用单张图片模式，避免瓦片拼接问题

## 快速开始

### 安装

```bash
# 通过 npm 安装
npm install sfmap-heatmap-plugin

# 或通过 pnpm 安装
pnpm add sfmap-heatmap-plugin
```

### 基本使用

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

### 初始化参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `map` | Object | - | 是 | Mapbox GL JS 地图实例 |
| `cityCode` | String | - | 是 | 城市编码，如 '755'（深圳）、'020'（广州） |
| `zoneCode` | String | `''` | 否 | 网点编码，如 '755AC'，用于过滤网点数据 |
| `layerIndex` | Number | `1` | 否 | 时间范围：1-7天, 2-15天, 3-30天, 4-90天 |
| `type` | Number | `1` | 否 | 业务类型：1-收件, 2-派件, 3-收派件 |
| `env` | String | `'prod'` | 否 | 环境：'prod'（生产）或 'sit'（测试） |
| `baseUrl` | String | - | 否 | 自定义基础 URL，优先级高于 env |
| `minZoom` | Number | `8` | 否 | 最小显示级别 |
| `maxZoom` | Number | `22` | 否 | 最大显示级别 |
| `opacity` | Number | `0.8` | 否 | 图层透明度，范围 0-1 |
| `loadCallback` | Function | `null` | 否 | 图层加载完成回调 |

## 接口定义

### 构造函数

```javascript
new HeatmapPlugin(map, params)
```

### 实例方法

#### setCityCode

更新城市编码。

```javascript
heatmap.setCityCode(cityCode)
```

**参数：**
- `cityCode` (String): 城市编码

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.setCityCode('020');  // 切换到广州
```

---

#### setZoneCode

更新网点编码。

```javascript
heatmap.setZoneCode(zoneCode)
```

**参数：**
- `zoneCode` (String): 网点编码，如 '755AC'

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.setZoneCode('755AC');  // 过滤指定网点
heatmap.setZoneCode('');       // 清除网点过滤
```

---

#### setLayerIndex

更新时间范围索引。

```javascript
heatmap.setLayerIndex(layerIndex)
```

**参数：**
- `layerIndex` (Number): 时间范围索引
  - `1`: 7 天热力图
  - `2`: 15 天热力图
  - `3`: 30 天热力图
  - `4`: 90 天热力图

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.setLayerIndex(2);  // 切换到15天热力图
```

---

#### setType

更新收派件类型。

```javascript
heatmap.setType(type)
```

**参数：**
- `type` (Number): 业务类型
  - `1`: 收件热力图
  - `2`: 派件热力图
  - `3`: 收派件热力图

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.setType(1);  // 显示收件热力图
```

---

#### updateParams

同时更新多个参数。

```javascript
heatmap.updateParams(params)
```

**参数：**
- `params.cityCode` (String): 城市编码
- `params.zoneCode` (String): 网点编码
- `params.layerIndex` (Number): 时间范围索引
- `params.type` (Number): 业务类型

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.updateParams({
  cityCode: '020',
  zoneCode: '020AA',
  layerIndex: 3,
  type: 2
});
```

---

#### getParams

获取当前参数。

```javascript
heatmap.getParams()
```

**返回值：** 当前参数副本

**示例：**

```javascript
const params = heatmap.getParams();
console.log(params);
// { cityCode: '755', zoneCode: '', layerIndex: 1, type: 3, ... }
```

---

#### show

显示热力图图层。

```javascript
heatmap.show()
```

**返回值：** HeatmapPlugin 实例（链式调用）

---

#### hide

隐藏热力图图层。

```javascript
heatmap.hide()
```

**返回值：** HeatmapPlugin 实例（链式调用）

---

#### toggle

切换图层显示/隐藏。

```javascript
heatmap.toggle()
```

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.toggle();  // 切换显示状态
```

---

#### setOpacity

设置图层透明度。

```javascript
heatmap.setOpacity(opacity)
```

**参数：**
- `opacity` (Number): 透明度值，范围 0-1

**返回值：** HeatmapPlugin 实例（链式调用）

**示例：**

```javascript
heatmap.setOpacity(0.5);  // 50% 不透明度
```

---

#### refresh

立即刷新热力图（根据当前视图）。

```javascript
heatmap.refresh()
```

**返回值：** HeatmapPlugin 实例（链式调用）

---

#### destroy

销毁插件，清理资源。

```javascript
heatmap.destroy()
```

**说明：** 销毁后不能再使用插件实例

---

#### getLayerId

获取图层 ID。

```javascript
heatmap.getLayerId()
```

**返回值：** 图层 ID (String)

---

#### getSourceId

获取数据源 ID。

```javascript
heatmap.getSourceId()
```

**返回值：** 数据源 ID (String)

---

#### getWmsUrl

获取当前 WMS URL。

```javascript
heatmap.getWmsUrl()
```

**返回值：** 当前 WMS URL (String)

---

### 静态方法

#### getLayerIndexByCityCode

根据城市编码获取分片索引。

```javascript
HeatmapPlugin.getLayerIndexByCityCode(cityCode)
```

**参数：**
- `cityCode` (String): 城市编码

**返回值：** 分片索引 (String)

**示例：**

```javascript
const shardIndex = HeatmapPlugin.getLayerIndexByCityCode('755');
console.log(shardIndex);  // '07'
```

---

#### getLayerNames

获取图层名称映射表。

```javascript
HeatmapPlugin.getLayerNames()
```

**返回值：** 图层名称映射表 (Object)

**示例：**

```javascript
const names = HeatmapPlugin.getLayerNames();
console.log(names);
// { 1: 'aoi:aoi_hot_pic_week', 2: 'aoi:aoi_hot_pic_15_days', ... }
```

---

#### getTypeDescription

获取类型描述。

```javascript
HeatmapPlugin.getTypeDescription(type)
```

**参数：**
- `type` (Number): 类型值

**返回值：** 类型描述 (String)

**示例：**

```javascript
console.log(HeatmapPlugin.getTypeDescription(1));  // '收件'
console.log(HeatmapPlugin.getTypeDescription(2));  // '派件'
console.log(HeatmapPlugin.getTypeDescription(3));  // '收派件'
```

---

#### getLayerIndexDescription

获取时间范围描述。

```javascript
HeatmapPlugin.getLayerIndexDescription(layerIndex)
```

**参数：**
- `layerIndex` (Number): 时间范围索引

**返回值：** 时间范围描述 (String)

**示例：**

```javascript
console.log(HeatmapPlugin.getLayerIndexDescription(1));  // '7天'
console.log(HeatmapPlugin.getLayerIndexDescription(2));  // '15天'
console.log(HeatmapPlugin.getLayerIndexDescription(3));  // '30天'
console.log(HeatmapPlugin.getLayerIndexDescription(4));  // '90天'
```

---

## 使用场景

### 场景 1：初始化深圳收派件热力图

```javascript
const heatmap = new HeatmapPlugin(map, {
  cityCode: '755',      // 深圳市
  layerIndex: 1,        // 7天热力图
  type: 3,              // 收派件
  env: 'prod',
  opacity: 0.8,
  loadCallback: (info) => {
    console.log('热力图加载完成', info);
  }
});

// 定位到深圳
map.flyTo({
  center: [113.93, 22.54],
  zoom: 12
});
```

---

### 场景 2：切换时间范围

```javascript
// 切换到15天热力图
heatmap.setLayerIndex(2);

// 切换到30天热力图
heatmap.setLayerIndex(3);

// 切换到90天热力图
heatmap.setLayerIndex(4);
```

---

### 场景 3：切换业务类型

```javascript
// 显示收件热力图
heatmap.setType(1);

// 显示派件热力图
heatmap.setType(2);

// 显示收派件热力图
heatmap.setType(3);
```

---

### 场景 4：按网点过滤数据

```javascript
// 设置网点编码
heatmap.setZoneCode('755AC');

// 清除网点过滤
heatmap.setZoneCode('');
```

---

### 场景 5：切换城市

```javascript
// 切换到广州
heatmap.setCityCode('020');
map.flyTo({
  center: [113.26, 23.13],
  zoom: 12
});

// 切换到上海
heatmap.setCityCode('021');
map.flyTo({
  center: [121.47, 31.23],
  zoom: 12
});

// 切换到北京
heatmap.setCityCode('010');
map.flyTo({
  center: [116.40, 39.90],
  zoom: 12
});
```

---

### 场景 6：调整透明度

```javascript
// 设置透明度为 50%
heatmap.setOpacity(0.5);

// 设置透明度为 30%
heatmap.setOpacity(0.3);
```

---

### 场景 7：图层显示/隐藏控制

```javascript
// 显示热力图
heatmap.show();

// 隐藏热力图
heatmap.hide();

// 切换显示状态
heatmap.toggle();

// 手动刷新
heatmap.refresh();
```

---

### 场景 8：获取当前信息

```javascript
// 获取当前参数
const params = heatmap.getParams();
console.log('当前参数:', params);

// 获取当前 WMS URL
const url = heatmap.getWmsUrl();
console.log('WMS URL:', url);

// 获取分片索引
const shardIndex = HeatmapPlugin.getLayerIndexByCityCode('755');
console.log('深圳分片索引:', shardIndex);
```

---

### 场景 9：同时更新多个参数

```javascript
heatmap.updateParams({
  cityCode: '020',
  zoneCode: '020AA',
  layerIndex: 2,
  type: 1
});
```

---

### 场景 10：销毁插件

```javascript
// 在页面卸载前销毁插件
window.addEventListener('beforeunload', () => {
  heatmap.destroy();
});

// 或手动销毁
heatmap.destroy();
heatmap = null;
```

---

## 参数说明

### 时间范围 (layerIndex)

| 值 | 名称 | 图层名称 |
|----|------|----------|
| 1 | 7 天 | `aoi:aoi_hot_pic_week` |
| 2 | 15 天 | `aoi:aoi_hot_pic_15_days` |
| 3 | 30 天 | `aoi:aoi_hot_pic_month` |
| 4 | 90 天 | `aoi:aoi_hot_pic_3_month` |

---

### 业务类型 (type)

| 值 | 名称 | 说明 |
|----|------|------|
| 1 | 收件 | 展示收件业务热力分布 |
| 2 | 派件 | 展示派件业务热力分布 |
| 3 | 收派件 | 展示收派件综合热力分布 |

---

### 环境配置 (env)

| 值 | 说明 | 基础 URL |
|----|------|----------|
| `sit` | 测试环境 | `http://gis-inner-map.sit.sf-express.com/non-std/gis` |
| `prod` | 生产环境 | `https://gis-inner-map.sf-express.com/non-std/gis` |

---

### 常用城市编码

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

---

## 注意事项

### 1. 城市编码

- `cityCode` 为必填参数，需要传入正确的城市编码
- 不同城市对应不同的分片索引，会影响 WMS 图层名称
- 可使用静态方法 `getLayerIndexByCityCode()` 查询分片索引

### 2. 缩放级别限制

- 默认最小缩放级别为 8，最大缩放级别为 22
- 在缩放级别范围外，热力图不会更新
- 可通过 `minZoom` 和 `maxZoom` 参数自定义

### 3. 地图视图更新

- 热力图会自动跟随地图移动更新
- 使用 300ms 防抖，避免频繁请求
- 缩放级别变化时会延迟更新

### 4. 图层性能

- 采用单张图片模式，避免瓦片拼接问题
- 根据 `viewPadding` 扩展请求范围，确保边缘数据完整
- 禁用淡入效果（`raster-fade-duration: 0`），更新更即时

### 5. 参数更新

- 使用 `setCityCode()`、`setLayerIndex()` 等方法更新参数
- 参数变化后会自动刷新热力图
- 可使用 `updateParams()` 同时更新多个参数

### 6. 资源清理

- 使用 `destroy()` 方法完全销毁插件
- 销毁后不能再使用插件实例
- 建议在页面卸载前调用 `destroy()`

### 7. WMS URL 缓存

- URL 包含时间戳参数 `t`，避免浏览器缓存
- 只有 URL 变化时才会更新热力图
- 可通过 `getWmsUrl()` 获取当前 URL

### 8. 网点过滤

- `zoneCode` 参数为空不过滤网点
- 设置网点编码后，只显示该网点的热力数据
- 清除网点编码需传入空字符串 `''`

---

## 常见问题

### Q1: 热力图不显示？

**A:** 检查以下几点：
- 是否正确传入了 `cityCode` 参数
- 地图缩放级别是否在有效范围内（默认 8-22）
- 图层是否被隐藏（调用 `show()` 显示）
- 透明度是否设置过低
- 控制台是否有错误信息

### Q2: 切换城市后热力图不更新？

**A:** 检查：
- 是否调用了 `setCityCode()` 方法
- 地图是否定位到新城市
- 新城市的城市编码是否正确
- 查看控制台是否有错误

### Q3: 如何查看当前 WMS URL？

**A:** 使用 `getWmsUrl()` 方法：

```javascript
const url = heatmap.getWmsUrl();
console.log(url);
```

### Q4: 如何知道某个城市的分片索引？

**A:** 使用静态方法：

```javascript
const shardIndex = HeatmapPlugin.getLayerIndexByCityCode('755');
console.log(shardIndex);  // '07'
```

### Q5: 热力图更新延迟？

**A:** 热力图更新机制：
- 地图移动后延迟 300ms 更新
- 缩放结束后立即更新
- 可以手动调用 `refresh()` 立即刷新

### Q6: 如何同时更新多个参数？

**A:** 使用 `updateParams()` 方法：

```javascript
heatmap.updateParams({
  cityCode: '020',
  layerIndex: 2,
  type: 1
});
```

### Q7: 销毁插件后能否重新使用？

**A:** 不能。销毁后需要重新创建实例：

```javascript
heatmap.destroy();
heatmap = new HeatmapPlugin(map, { cityCode: '755' });
```

### Q8: 如何切换测试环境和生产环境？

**A:** 使用 `env` 参数或 `baseUrl` 参数：

```javascript
// 方法1：使用 env 参数
const heatmap = new HeatmapPlugin(map, {
  cityCode: '755',
  env: 'sit'  // 或 'prod'
});

// 方法2：使用 baseUrl 参数（优先级更高）
const heatmap = new HeatmapPlugin(map, {
  cityCode: '755',
  baseUrl: 'http://your-custom-url'
});
```

---

## 完整示例代码

参见项目中的 `examples/heatmap.js` 文件，包含以下功能演示：

1. 初始化深圳收派件热力图
2. 切换时间范围（7天/15天/30天/90天）
3. 切换业务类型（收件/派件/收派件）
4. 按网点编码过滤数据
5. 调整图层透明度
6. 图层显示/隐藏控制
7. 切换不同城市
8. 查看当前参数和 WMS URL
9. 销毁插件

运行示例：

```bash
pnpm run dev
```

访问：`http://localhost:5173/heatmap.html`

---

## 技术细节

### WMS 请求参数

插件会自动构建以下 WMS 参数：

| 参数 | 说明 |
|------|------|
| `SERVICE` | 服务类型，固定为 `WMS` |
| `REQUEST` | 请求类型，固定为 `GetMap` |
| `VERSION` | WMS 版本，固定为 `1.1.1` |
| `LAYERS` | 图层名称，根据 `layerIndex` 和分片索引组合 |
| `FORMAT` | 图片格式，固定为 `image/png` |
| `TRANSPARENT` | 是否透明，固定为 `true` |
| `CQL_FILTER` | 过滤条件，包含 `city_code`、`zc`、`type` |
| `WIDTH` | 图片宽度 |
| `HEIGHT` | 图片高度 |
| `SRS` | 坐标系，固定为 `EPSG:3857` |
| `BBOX` | 地图视图范围 |
| `t` | 时间戳，避免缓存 |

### 坐标系转换

插件使用 `proj4` 库进行坐标系转换：
- 输入：WGS84 (EPSG:4326) - 经纬度坐标
- 输出：EPSG:3857 (Web Mercator) - 瓦片投影坐标

### 单图模式

- 使用 `image` 类型的 Mapbox Source
- 根据当前视图范围请求单张完整热力图
- 避免 tile 模式的瓦片拼接问题
- 使用 `coordinates` 参数定位图片四角

---

## 更新日志

### v0.1.0
- 初始版本发布
- 支持收派件热力图展示
- 支持多时间维度（7/15/30/90天）
- 支持城市分片
- 支持网点过滤
- 支持图层控制
- 采用 WMS 单图模式
