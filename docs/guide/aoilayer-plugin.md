# AOI 图层插件

AOI 图层插件（AOILayerPlugin）是一个强大的 Mapbox GL JS 插件，用于在地图上展示和管理 AOI（Area of Interest，兴趣区域）数据。

## 功能概述

AOI 图层插件提供以下核心功能：

1. **AOI 图层展示** - 在地图上展示 AOI 区域，支持自定义样式
2. **多种展示类型** - 支持 AOI、AOI 区域（小件/快运/超大件/航空大件等）
3. **样式自定义** - 支持填充色、边框色、透明度、线宽等样式配置
4. **高亮展示** - 支持点击高亮、指定高亮、多选高亮
5. **标注功能** - 支持在 AOI 上添加文字标注
6. **AOI 合并** - 支持根据 AOIID、AOICODE、网点编码等合并 AOI
7. **多边形吸附** - 将自定义多边形吸附到最近的 AOI 边界
8. **拉框选择** - 在地图上拉框批量选择 AOI
9. **过滤查询** - 支持按城市、网点、区域等条件过滤 AOI
10. **定位功能** - 支持定位到城市、网点、指定 AOI 等

## 快速开始

### 安装

```bash
# 通过 npm 安装
npm install sfmap-aoilayer-plugin

# 或通过 pnpm 安装
pnpm add sfmap-aoilayer-plugin
```

### 基本使用

```javascript
import { AOILayerPlugin } from 'sfmap-aoilayer-plugin';

// 创建 AOI 图层实例
const aoiPlugin = new AOILayerPlugin({
  map: map,                          // Mapbox GL JS 地图实例
  env: 'prod',                        // 环境变量：'prod' 或 'sit'
  token: 'your-token',               // 访问令牌
  username: 'your-username',         // 用户名
  password: 'your-password',         // 密码
  appId: 'your-app-id',             // 应用ID
  appSecret: 'your-app-secret',     // 应用密钥
  cityCode: '755',                  // 城市编码（深圳）
  type: 'aoi',                      // 类型：'aoi' 或 'aoiarea'
  codeField: 'aoi_code',           // 代码字段
  isLabel: true,                   // 是否显示标注
  isFitOnAdd: true                 // 是否自动定位
});
```

## 接口定义

### 构造函数参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `map` | Object | - | 是 | Mapbox GL JS 地图实例 |
| `env` | String | `'prod'` | 否 | 环境变量，`'sit'`（测试）或 `'prod'`（生产） |
| `token` | String | - | 是 | 访问令牌 |
| `username` | String | - | 是 | 用户名 |
| `password` | String | - | 是 | 密码 |
| `appId` | String | - | 是 | 应用ID |
| `appSecret` | String | - | 是 | 应用密钥 |
| `cityCode` | String \| Array | - | 是 | 城市编码，如 `'755'` 或 `['755', '852']` |
| `type` | String | `'aoi'` | 否 | 类型，`'aoi'`（AOI）或 `'aoiarea'`（AOI区域） |
| `codeField` | String | `'aoi_code'` | 否 | 代码字段，与 `type` 对应 |
| `znoCode` | String \| Array | `''` | 否 | 网点编码，如 `'755FG'` 或 `['755FG', '755FJ']` |
| `znoCodeField` | String | `'znoCode'` | 否 | 网点代码字段 |
| `minZoom` | Number | `13` | 否 | 展示的最小缩放级别 |
| `maxZoom` | Number | `22` | 否 | 展示的最大缩放级别 |
| `tileSize` | Number | `256` | 否 | 切片大小 |
| `mapId` | String | `uuid()` | 否 | 地图唯一标识 |
| `isFitOnAdd` | Boolean | `true` | 否 | 添加时是否自动定位 |
| `isLabel` | Boolean | `true` | 否 | 是否显示标注 |
| `multiSelect` | Boolean | `false` | 否 | 是否支持多选 |
| `defaultStyle` | Object | 见下方 | 否 | 默认展示样式 |
| `defaultHighLightStyle` | Object | 见下方 | 否 | 默认高亮样式 |
| `defaultLabelStyle` | Object | 见下方 | 否 | 默认标注样式 |
| `filterData` | Object | `{}` | 否 | 过滤条件 |
| `loadedCallback` | Function | `null` | 否 | 加载完成回调 |
| `clickCallback` | Function | `null` | 否 | 点击回调 |
| `boxEndedCallback` | Function | `null` | 否 | 框选结束回调 |

### 默认样式对象

```javascript
// 默认展示样式
defaultStyle: {
  fillColor: "#0085ff",      // 填充颜色
  fillOpacity: 0.1,          // 填充透明度
  strokeColor: "#0085ff",    // 边框颜色
  strokeOpacity: 1,          // 边框透明度
  strokeWidth: 1             // 边框宽度
}

// 默认高亮样式
defaultHighLightStyle: {
  fillColor: "#006fff",
  fillOpacity: 0.4,
  strokeColor: "#006fff",
  strokeOpacity: 1,
  strokeWidth: 1
}

// 默认标注样式
defaultLabelStyle: {
  property: "label",        // 标注属性字段
  fillColor: "#000000",      // 文字颜色
  fillOpacity: 1,            // 文字透明度
  strokeColor: "#fff",       // 描边颜色
  strokeOpacity: 1,          // 描边透明度
  strokeWidth: 0.1           // 描边宽度
}
```

## API 方法

### 1. 高亮指定编码的 AOI

高亮指定的 AOI 或 AOI 区域。

```javascript
aoiPlugin.highLightByCodes(['755FG000065', '755FG000115']);
```

**参数：**
- `codes` (Array) - 要高亮的 AOI 或 AOI 区域编码数组

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 2. 清除高亮

清除所有高亮的 AOI。

```javascript
aoiPlugin.clearHighLight();
```

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 3. 设置高亮样式

为指定编码的 AOI 设置自定义高亮样式。

```javascript
const styles = [
  {
    codes: ["755FG000065"],
    style: {
      fillColor: "#ff0000",
      fillOpacity: 0.3,
      strokeColor: "#ff0000",
      strokeOpacity: 1,
      strokeWidth: 2,
    },
  },
  {
    codes: ["755FG000115"],
    style: {
      fillColor: "#d946ef",
      fillOpacity: 0.3,
      strokeColor: "#d946ef",
      strokeOpacity: 1,
      strokeWidth: 2,
    },
  },
];

aoiPlugin.setHighLightStyles(styles);
```

**参数：**
- `styles` (Array) - 高亮样式配置数组

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 4. 根据 AOIID 合并 AOI

根据 AOIID 合并多个 AOI 为一个多边形。

```javascript
aoiPlugin.mergeAoisByAoiIds({
  aoiIds: [
    '62556EAF14821B9DE0530EF4520A0CFC',
    '62556EAEF6B51B9DE0530EF4520A0CFC',
    'A5BA07EFAE16446091E298A07CE96472',
  ],
  isFit: true,
  showOnMap: true,
  color: '#f00',
  callback: ({ wkt, center }) => {
    console.log('合并后的WKT:', wkt);
    console.log('中心点:', center);
  },
});
```

**参数：**
- `aoiIds` (Array) - 要合并的 AOIID 数组
- `isFit` (Boolean) - 是否自动定位到地图，默认 `true`
- `showOnMap` (Boolean) - 是否在地图上展示，默认 `true`
- `color` (String) - 展示颜色，默认 `'#f00'`
- `callback` (Function) - 回调函数，返回 `{ wkt, center, success, message }`

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 5. 根据 AOICODE 合并 AOI

根据 AOICODE 合并多个 AOI 为一个多边形。

```javascript
aoiPlugin.mergeAoisByAoiCodes({
  aoiCodes: [
    '755BK000029',
    '755BK000104',
    '755BK000051',
  ],
  isCheck: true,
  isFit: true,
  showOnMap: true,
  color: '#f00',
  callback: (result) => {
    console.log(result);
  },
});
```

**参数：**
- `aoiCodes` (Array) - 要合并的 AOICODE 数组
- `isCheck` (Boolean) - 是否进行校验，默认 `true`
- `isFit` (Boolean) - 是否自动定位到地图，默认 `true`
- `showOnMap` (Boolean) - 是否在地图上展示，默认 `true`
- `color` (String) - 展示颜色，默认 `'#f00'`
- `callback` (Function) - 回调函数

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 6. 根据网点编码展示边界

根据网点编码展示网点边界。

```javascript
aoiPlugin.showZnoByCodes({
  znoCodes: ["755BK"],
  isFit: true,
  showOnMap: true,
  color: '#f00',
  callback: (result) => {
    console.log(result);
  },
});
```

**参数：**
- `znoCodes` (Array) - 网点编码数组
- `isFit` (Boolean) - 是否自动定位到地图，默认 `true`
- `showOnMap` (Boolean) - 是否在地图上展示，默认 `true`
- `color` (String) - 展示颜色，默认 `'#f00'`
- `callback` (Function) - 回调函数

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 7. 多边形吸附到 AOI

将自定义多边形吸附到最近的 AOI 边界。

```javascript
const wkt = 'POLYGON((113.93 22.52, 113.95 22.52, 113.95 22.54, 113.93 22.54, 113.93 22.52))';

aoiPlugin.snapToAoi({
  wkt: wkt,
  isFit: true,
  showOnMap: true,
  color: {
    before: '#BC6FF1',  // 吸附前颜色
    after: '#ff983f'    // 吸附后颜色
  },
  callback: ({ wkt, center, aoiInfos }) => {
    console.log('吸附后的WKT:', wkt);
    console.log('中心点:', center);
    console.log('吸附的AOI信息:', aoiInfos);
  },
});
```

**参数：**
- `wkt` (String) - 要吸附的 WKT 格式多边形
- `isFit` (Boolean) - 是否自动定位到地图，默认 `true`
- `showOnMap` (Boolean) - 是否在地图上展示，默认 `true`
- `color` (Object) - 展示颜色 `{ before, after }`
- `callback` (Function) - 回调函数

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 8. 开始拉框绘制

在地图上开始拉框绘制，批量选择 AOI。

```javascript
aoiPlugin.beginDrawBox();
```

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 9. 定位到指定位置

根据类型和值定位到指定位置。

```javascript
// 根据城市编码定位
aoiPlugin.fit('cityCode', ['755']);

// 根据网点编码定位
aoiPlugin.fit('znoCode', ['755AA']);

// 根据编码定位
aoiPlugin.fit('codes', ['755FG000065']);

// 根据AOIID定位
aoiPlugin.fit('aoiIds', ['D864FD047AA14D469E5243D459F2D775']);
```

**参数：**
- `type` (String) - 定位类型：`'cityCode'`、`'znoCode'`、`'codes'`、`'aoiIds'`
- `value` (String \| Array) - 定位的值

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 10. 根据参数过滤

根据过滤条件过滤 AOI。

```javascript
aoiPlugin.filterByParams({
  cityCodes: ['755'],
  znoCodes: ['755FG'],
  areaCodes: [],
  aoiCodes: [],
  aoiIds: [],
  areaTypes: [],
  aoiTypes: []
});
```

**参数：**
- `filterData` (Object) - 过滤条件对象

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 11. 设置样式

为指定编码的 AOI 设置自定义样式。

```javascript
const styles = [
  {
    codes: ["755FG000065"],
    style: {
      fillColor: "#ff0000",
      fillOpacity: 0.3,
      strokeColor: "#ff0000",
      strokeOpacity: 1,
      strokeWidth: 2,
    },
  },
];

aoiPlugin.setStyles(styles);
```

**参数：**
- `styles` (Array) - 样式配置数组

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 12. 设置标注

为指定编码的 AOI 设置标注内容和样式。

```javascript
const labelStyle = [
  {
    property: "label",
    fillColor: "#0000ff",
    fillOpacity: 0.5,
    strokeColor: "#00ff00",
    strokeOpacity: 0.8,
    strokeWidth: 1,
    offsetX: 0.5,
    offsetY: 0,
  }
];

const labels = [
  {
    codes: ["755FG000065"],
    label: "测试标注1\n研祥智谷",
  },
  {
    codes: ["755FG000115"],
    label: "测试标注2",
  },
];

aoiPlugin.setLabels(labelStyle, labels);
```

**参数：**
- `style` (Array) - 标注样式数组
- `labels` (Array) - 标注内容数组

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 13. 获取已高亮数据

获取当前已高亮的 AOI 编码数组。

```javascript
const selectedAois = aoiPlugin.getSelectedData();
console.log('已高亮的AOI:', selectedAois);
```

**返回值：** Array - 已高亮的 AOI 编码数组

---

### 14. 隐藏图层

隐藏 AOI 图层。

```javascript
aoiPlugin.hide();
```

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 15. 显示图层

显示 AOI 图层。

```javascript
aoiPlugin.show();
```

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 16. 清除矢量数据

清除矢量图层上的数据。

```javascript
aoiPlugin.clearVector();
```

---

### 17. 移除图层

移除 AOI 图层及相关资源。

```javascript
aoiPlugin.remove();
```

**返回值：** AOILayerPlugin 实例（链式调用）

---

### 18. 设置点击回调

设置地图点击事件的回调函数。

```javascript
aoiPlugin.setClickCallback((e) => {
  console.log('点击位置:', e.lngLat);
  console.log('AOI信息:', e.info);
  console.log('点击的所有AOI:', e.items);
});
```

**参数：**
- `callback` (Function | null) - 回调函数

**返回值：** AOILayerPlugin 实例（链式调用）

---

## 使用场景

### 场景 1：基本 AOI 展示

展示深圳南山的 AOI 区域，并在点击时高亮显示。

```javascript
const aoiPlugin = new AOILayerPlugin({
  map: map,
  env: 'prod',
  token: 'your-token',
  username: 'your-username',
  password: 'your-password',
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  cityCode: '755',
  type: 'aoi',
  codeField: 'aoi_code',
  multiSelect: true,
  clickCallback: (e) => {
    console.log('点击AOI:', e.info);
  }
});
```

---

### 场景 2：AOI 区域管理（小件/快运）

展示小件 AOI 区域，并按网点过滤。

```javascript
const aoiPlugin = new AOILayerPlugin({
  map: map,
  env: 'prod',
  token: 'your-token',
  username: 'your-username',
  password: 'your-password',
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  cityCode: '755',
  type: 'aoiarea',              // AOI区域
  codeField: 'area_code',        // 区域代码字段
  znoCode: '755BGA',            // 网点编码
  znoCodeField: 'znoCode',      // 网点代码字段
  isLabel: true,                 // 显示标注
  isAoiAreaStyle: true           // 使用AOI区域样式
});

// 过滤特定网点
aoiPlugin.filterByParams({
  znoCodes: ['755BGA', '755BGZ']
});
```

---

### 场景 3：快运（大件）网点区域

展示快运大件网点区域。

```javascript
const aoiPlugin = new AOILayerPlugin({
  map: map,
  env: 'prod',
  token: 'your-token',
  username: 'your-username',
  password: 'your-password',
  appId: 'your-app-id',
  appSecret: 'your-app-secret',
  cityCode: '755',
  type: 'kyaoiarea',                    // 快运AOI区域
  codeField: 'ky_area_code',             // 快运区域代码字段
  znoCode: '755EE',                      // 快运网点编码
  znoCodeField: 'kyZnoCode',             // 快运网点代码字段
  defaultStyle: {
    fillColor: "#722ed1",
    fillOpacity: 0.15,
    strokeColor: "#722ed1",
    strokeOpacity: 1,
    strokeWidth: 1,
  },
  defaultHighLightStyle: {
    fillColor: "#9254de",
    fillOpacity: 0.4,
    strokeColor: "#9254de",
    strokeOpacity: 1,
    strokeWidth: 2,
  }
});
```

---

### 场景 4：合并多个 AOI

将多个 AOI 合并为一个更大的区域，用于规划分析。

```javascript
// 方法1：根据AOIID合并
aoiPlugin.mergeAoisByAoiIds({
  aoiIds: [
    '62556EAF14821B9DE0530EF4520A0CFC',
    '62556EAEF6B51B9DE0530EF4520A0CFC',
    'A5BA07EFAE16446091E298A07CE96472',
  ],
  isFit: true,
  showOnMap: true,
  color: '#ff4d4f',
  callback: (result) => {
    if (result.success) {
      console.log('合并成功');
      console.log('中心点:', result.center);
      // 使用合并后的WKT进行后续处理
      const mergedWKT = result.wkt;
    }
  }
});

// 方法2：根据AOICODE合并
aoiPlugin.mergeAoisByAoiCodes({
  aoiCodes: ['755BK000029', '755BK000104', '755BK000051'],
  isFit: true,
  showOnMap: true,
  color: '#ff4d4f',
  callback: (result) => {
    console.log('合并结果:', result);
  }
});
```

---

### 场景 5：多边形吸附到 AOI

将用户绘制的多边形自动吸附到最近的 AOI 边界，用于精确划分区域。

```javascript
const userPolygon = 'POLYGON((113.93 22.52, 113.95 22.52, 113.95 22.54, 113.93 22.54, 113.93 22.52))';

aoiPlugin.snapToAoi({
  wkt: userPolygon,
  isFit: true,
  showOnMap: true,
  color: {
    before: '#BC6FF1',  // 用户绘制的多边形（紫色）
    after: '#ff983f'    // 吸附后的多边形（橙色）
  },
  callback: (result) => {
    if (result.success) {
      console.log('吸附成功！');
      console.log('吸附到以下AOI:', result.aoiInfos);
      console.log('吸附后的WKT:', result.wkt);
      console.log('中心点:', result.center);
    }
  }
});
```

---

### 场景 6：拉框批量选择 AOI

在地图上拉框选择多个 AOI，用于批量操作。

```javascript
// 设置框选结束回调
aoiPlugin.options.boxEndedCallback = (e) => {
  console.log('框选范围:', e.bbox);
  console.log('选中的AOI:', e.data);
};

// 开始拉框
aoiPlugin.beginDrawBox();
```

---

### 场景 7：自定义标注

为特定 AOI 添加自定义标注。

```javascript
const labelStyle = [
  {
    property: "label",
    fillColor: "#000000",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeOpacity: 1,
    strokeWidth: 3,
    offsetX: 0,
    offsetY: 0,
    fontSize: 12
  }
];

const labels = [
  {
    codes: ["755FG000065"],
    label: "研祥智谷\n文化创意产业园"
  },
  {
    codes: ["755FG000115"],
    label: "深圳湾科技园\n生态园"
  }
];

aoiPlugin.setLabels(labelStyle, labels);
```

---

### 场景 8：多区域网点展示

同时展示多种类型的网点区域。

```javascript
// 小件网点
const smallPackageAOI = new AOILayerPlugin({
  map: map,
  cityCode: '755',
  type: 'aoiarea',
  codeField: 'area_code',
  znoCodeField: 'znoCode',
  defaultStyle: { fillColor: '#0085ff', fillOpacity: 0.1 }
});

// 快运网点
const largePackageAOI = new AOILayerPlugin({
  map: map,
  cityCode: '755',
  type: 'kyaoiarea',
  codeField: 'ky_area_code',
  znoCodeField: 'kyZnoCode',
  defaultStyle: { fillColor: '#722ed1', fillOpacity: 0.1 }
});

// 超大件网点
const superLargeAOI = new AOILayerPlugin({
  map: map,
  cityCode: '755',
  type: 'djaoiarea',
  codeField: 'dj_area_code',
  znoCodeField: 'djZnoCode',
  defaultStyle: { fillColor: '#fa541c', fillOpacity: 0.1 }
});
```

---

## 属性字段说明

### type 和 codeField 对应关系

| type | codeField | 说明 |
|------|-----------|------|
| `aoi` | `aoi_code` | 普通AOI |
| `aoiarea` | `area_code` | 小件AOI区域 |
| `kyaoiarea` | `ky_area_code` | 快运（大件）网点区域 |
| `djaoiarea` | `dj_area_code` | 超大件网点区域 |
| `hkaoiarea` | `hk_area_code` | 航空大件网点区域 |
| `tdaoiarea` | `td_area_code` | 小件中转直派网点区域 |

### znoCodeField 对应关系

| znoCodeField | 说明 |
|--------------|------|
| `znoCode` | 速运网点 |
| `kyZnoCode` | 快运（大件）网点 |
| `djZnoCode` | 超大件网点 |
| `hkZnoCode` | 航空大件网点 |
| `tdZnoCode` | 小件中转直派网点 |

### 网点编码示例

| 网点类型 | 编号格式 | 示例 |
|----------|----------|------|
| 小件网点 | 755XX | 755AA, 755BGA |
| 快运网点 | 755EE | 755EE |
| 超大件网点 | 755DD | 755DD |
| 航空大件网点 | 755CC | 755CC |
| 中转直派网点 | 755FF | 755FF |

## 注意事项

### 1. Token 管理

- Token 用于身份验证，必须正确配置
- 建议在后端获取 Token，不要在前端硬编码
- Token 有时效性，插件会自动刷新

### 2. 地图初始化

- 必须在 `map.on('load')` 事件后初始化插件
- 确保 map 实例已正确加载

### 3. 性能优化

- `minZoom` 和 `maxZoom` 可以控制图层显示的缩放级别，避免在小级别显示大量数据
- `tileSize` 默认为 256，高分辨率屏幕可以设置为 512 以获得更清晰的显示
- 大量 AOI 时建议使用过滤条件减少显示数量

### 4. 多选操作

- `multiSelect: true` 时，点击 AOI 会累加选中
- `multiSelect: false` 时，点击 AOI 会切换选中状态
- 已选中的 AOI 再次点击会取消选中

### 5. 合并操作

- 合并的 AOI 必须在同一个城市范围内
- 合并结果会以矢量形式展示在地图上
- 合并回调会返回 WKT 格式的结果

### 6. 吸附操作

- 吸附操作会将多边形调整为最近的 AOI 边界
- `color.before` 和 `color.after` 可以分别设置吸附前后的颜色
- 吸附回调会返回吸附到的 AOI 信息

### 7. 拉框选择

- 拉框选择会自动禁用地图拖拽
- 拉框结束后会恢复地图拖拽
- 框选结果通过 `boxEndedCallback` 返回

### 8. 标注功能

- 标注内容支持 `\n` 换行
- 标注样式会影响所有 AOI，除非使用 `setLabels` 方法
- `isLabel: true` 时才会显示标注

### 9. 样式配置

- `fillOpacity` 和 `strokeOpacity` 的范围是 0-1
- `strokeWidth` 的单位是像素
- 颜色支持十六进制、RGB、RGBA 等格式

### 10. 销毁插件

- 使用 `remove()` 方法可以完全移除插件
- 移除后不能再使用插件实例
- 建议在页面卸载前调用 `remove()`

## 常见问题

### Q1: 图层不显示？

**A:** 检查以下几点：
- `cityCode` 是否正确
- `token` 是否有效
- 当前缩放级别是否在 `minZoom` 和 `maxZoom` 范围内
- 是否调用了 `hide()` 方法

### Q2: 点击 AOI 没有反应？

**A:** 检查：
- 是否设置了 `clickCallback`
- 当前缩放级别是否在 `minZoom` 和 `maxZoom` 范围内
- 是否正在进行拉框操作（`isBoxSelect` 为 `true`）

### Q3: 合并 AOI 失败？

**A:** 检查：
- AOIID 或 AOICODE 是否正确
- AOI 是否在同一个城市范围内
- 网络连接是否正常

### Q4: 标注不显示？

**A:** 检查：
- `isLabel` 是否设置为 `true`
- `defaultLabelStyle.property` 是否与数据字段匹配
- 是否使用了 `setLabels` 方法但没有提供 `label` 内容

### Q5: 如何获取 AOI 的详细信息？

**A:** 通过 `clickCallback` 可以获取点击的 AOI 信息：

```javascript
clickCallback: (e) => {
  console.log('AOI详情:', e.info);
  console.log('该位置的所有AOI:', e.items);
}
```

### Q6: 如何自定义 AOI 的颜色？

**A:** 使用 `setStyles` 方法：

```javascript
const styles = [
  {
    codes: ["755FG000065"],
    style: {
      fillColor: "#ff0000",
      fillOpacity: 0.3,
      strokeColor: "#ff0000",
      strokeOpacity: 1,
      strokeWidth: 2,
    },
  },
];
aoiPlugin.setStyles(styles);
```

## 完整示例代码

参见项目中的 `examples/aoilayer.js` 文件，包含所有功能的完整示例。

## 更新日志

### v0.1.0
- 初始版本发布
- 支持 AOI 图层展示
- 支持 AOI 合并、吸附、高亮等功能
- 支持多种 AOI 类型
- 支持标注、过滤等高级功能
