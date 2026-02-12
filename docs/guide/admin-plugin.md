# 行政区划插件 (AdminPlugin)

## 概述

行政区划插件 (`AdminPlugin`) 是一个用于在 Mapbox GL JS 地图上加载、展示和操作中国行政区划数据的插件。它支持从服务端获取加密的行政区划数据，解密后渲染为地图上的多边形和中心点，并提供丰富的交互功能。

## 功能特性

- **数据加载**: 支持批量加载行政区划数据，自动解密和解析
- **多种展示模式**: 多边形模式、中心点模式、双显模式
- **交互功能**: 点击高亮、鼠标悬停提示、事件监听
- **样式定制**: 支持自定义填充色、边框、透明度等
- **层级管理**: 支持省、市、区多级行政区划
- **旧版兼容**: 提供完整的旧版 API 兼容

---

## 快速开始

### 安装

```javascript
// ES Module 方式
import { AdminPlugin, DISPLAY_MODES } from 'sfmap-sdk3-plugin/admin';

// 或者直接引入
import AdminPlugin from '../packages/admin/src/index.js';
```

### 基础用法

```javascript
import { AdminPlugin } from 'sfmap-sdk3-plugin/admin';

// 初始化插件
const admin = new AdminPlugin({
  map: map,  // Mapbox 地图实例（必填）
  env: 'sit', // 环境：'sit'测试环境，'prod'生产环境
});

// 加载行政区划
await admin.addDistricts(['110000', '310000']); // 北京、上海
```

---

## API 参考

### 构造函数

#### `new AdminPlugin(options)`

创建行政区划插件实例。

**参数说明：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `map` | Object | ✅ | - | Mapbox GL JS 地图实例 |
| `env` | String | ❌ | `'sit'` | 环境参数：`'sit'`测试环境，`'prod'`生产环境 |
| `baseUrl` | String | ❌ | - | 自定义服务地址，优先级高于 `env` |
| `defaultStyle` | Object | ❌ | 见下表 | 默认渲染样式 |
| `highlightStyle` | Object | ❌ | 见下表 | 高亮渲染样式 |
| `displayMode` | String | ❌ | `'both'` | 展示模式：`'polygon'`、`'center'`、`'both'` |
| `centerStyle` | Object | ❌ | 见下表 | 中心点样式配置 |

**默认样式配置：**

```javascript
// defaultStyle 默认值
{
  fillColor: "#1890ff",      // 填充颜色
  fillOpacity: 0.15,          // 填充透明度
  lineColor: "#1890ff",       // 边框颜色
  lineWidth: 2,               // 边框宽度
  lineOpacity: 1,             // 边框透明度
  lineDashArray: [1, 0],      // 虚线样式
  minzoom: 2,                 // 最小显示层级
  maxzoom: 22,                // 最大显示层级
}

// highlightStyle 默认值
{
  fillColor: "#ff4d4f",
  fillOpacity: 0.25,
  lineColor: "#ff4d4f",
  lineWidth: 3,
  lineOpacity: 1,
}

// centerStyle 默认值
{
  radius: 6,                  // 圆点半径
  color: "#1890ff",           // 圆点颜色
  strokeColor: "#fff",        // 描边颜色
  strokeWidth: 2,             // 描边宽度
  opacity: 0.9,               // 透明度
}
```

**示例：**

```javascript
const admin = new AdminPlugin({
  map: map,
  env: 'prod',
  defaultStyle: {
    fillColor: '#52c41a',
    fillOpacity: 0.2,
    lineColor: '#52c41a',
  },
  highlightStyle: {
    fillColor: '#f5222d',
    fillOpacity: 0.3,
  },
  displayMode: 'both',
});
```

---

### 数据加载

#### `addDistricts(adcodeList, options)`

添加并渲染行政区划数据。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `adcodeList` | Array<String> | 行政区划编码数组 |
| `options` | Object | 可选配置 |
| `options.style` | Object | 自定义样式（覆盖默认样式） |
| `options.loadedCallback` | Function | 加载完成回调函数 |

**返回值：** `Promise<Array>` - 返回已加载的行政区划数据数组

**示例：**

```javascript
// 基础用法
await admin.addDistricts(['110000', '310000']);

// 带样式和回调
const features = await admin.addDistricts(['440300', '330100'], {
  style: {
    fillColor: '#722ed1',
    lineColor: '#722ed1',
  },
  loadedCallback: (data) => {
    console.log(`加载完成，共 ${data.length} 个区划`);
  }
});
```

#### `removeDistricts(adcodeList)`

移除指定的行政区划。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `adcodeList` | Array<String> | 要移除的行政区划编码数组 |

**示例：**

```javascript
admin.removeDistricts(['110000', '310000']);
```

#### `clearAll()`

清除所有已渲染的行政区划。

**示例：**

```javascript
admin.clearAll();
```

---

### 样式控制

#### `updateDistrictStyle(adcode, styleOptions)`

更新指定行政区划的渲染样式。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `adcode` | String | 行政区划编码 |
| `styleOptions` | Object | 样式配置 |
| `styleOptions.fillColor` | String | 填充颜色 |
| `styleOptions.fillOpacity` | Number | 填充透明度 (0-1) |
| `styleOptions.lineColor` | String | 边框颜色 |
| `styleOptions.lineWidth` | Number | 边框宽度 |
| `styleOptions.lineOpacity` | Number | 边框透明度 (0-1) |

**返回值：** `Boolean` - 是否更新成功

**示例：**

```javascript
admin.updateDistrictStyle('110000', {
  fillColor: '#ff4d4f',
  lineColor: '#ff4d4f',
  fillOpacity: 0.3,
  lineWidth: 3,
});
```

---

### 高亮控制

#### `highlightDistricts(adcodeList)`

高亮显示指定的行政区划。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `adcodeList` | Array<String> | 要高亮的行政区划编码数组 |

**示例：**

```javascript
// 高亮单个
admin.highlightDistricts(['110000']);

// 高亮多个
admin.highlightDistricts(['110000', '310000', '440300']);
```

#### `clearHighlight()`

清除所有高亮状态。

**示例：**

```javascript
admin.clearHighlight();
```

---

### 展示模式

#### `setDisplayMode(mode)`

设置展示模式。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `mode` | String | 展示模式：`'polygon'`、`'center'`、`'both'` |

**展示模式说明：**

| 模式 | 值 | 说明 |
|------|-----|------|
| 仅多边形 | `'polygon'` | 只显示行政区划边界和填充 |
| 仅中心点 | `'center'` | 只显示行政区划中心点 |
| 双显模式 | `'both'` | 同时显示多边形和中心点 |

**示例：**

```javascript
import { DISPLAY_MODES } from 'sfmap-sdk3-plugin/admin';

// 仅显示多边形
admin.setDisplayMode('polygon');

// 仅显示中心点
admin.setDisplayMode(DISPLAY_MODES.CENTER);

// 双显模式
admin.setDisplayMode('both');
```

#### `setShowCenterOnly(enabled)`

设置是否仅显示中心点（旧版兼容方法）。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `enabled` | Boolean | `true`仅中心点，`false`双显 |

---

### 数据查询

#### `getDistrictData(adcode)`

根据编码获取行政区划详细数据。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `adcode` | String | 行政区划编码 |

**返回值：** `Object|null` - 行政区划数据对象

**返回数据结构：**

```javascript
{
  adCode: "110000",        // 行政区划编码
  adcodeP: "100000",       // 父级编码
  name: "北京市",           // 名称
  nameP: "中国",           // 父级名称
  level: "province",       // 级别：province/city/district
  centerx: "116.4074",     // 中心点经度
  centery: "39.9042",      // 中心点纬度
  cityCode: "010",         // 城市区号
  childs: [...],           // 子级区划列表
  bbox: [[...], [...]]     // 边界框坐标
}
```

**示例：**

```javascript
const data = admin.getDistrictData('110000');
console.log(data.name);    // "北京市"
console.log(data.level);   // "province"
```

#### `getRenderedFeatures()`

获取当前已渲染的所有行政区划。

**返回值：** `Array<Object>` - 行政区划数据数组

**示例：**

```javascript
const features = admin.getRenderedFeatures();
console.log(`当前共渲染 ${features.length} 个区划`);
features.forEach(f => {
  console.log(f.name, f.adCode);
});
```

---

### 事件系统

#### `on(event, callback)`

监听事件。

**事件类型：**

| 事件名 | 触发时机 | 回调参数 |
|--------|----------|----------|
| `featureClick` | 点击行政区划时 | `{ adcode, data, style, originalEvent }` |
| `featureMouseOver` | 鼠标移入行政区划时 | `{ adcode, data, style, originalEvent }` |
| `featureMouseOut` | 鼠标移出行政区划时 | `{ originalEvent }` |

**示例：**

```javascript
// 点击事件
admin.on('featureClick', (e) => {
  console.log('点击了:', e.data.name);
  console.log('编码:', e.adcode);
  
  // 高亮点击的区划
  admin.highlightDistricts([e.adcode]);
});

// 鼠标悬停事件
admin.on('featureMouseOver', (e) => {
  console.log('悬停:', e.data.name);
  map.getCanvas().style.cursor = 'pointer';
});

// 鼠标移出事件
admin.on('featureMouseOut', () => {
  map.getCanvas().style.cursor = '';
});
```

#### `off(event, callback)`

取消事件监听。

**参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `event` | String | ✅ | 事件名称 |
| `callback` | Function | ❌ | 回调函数（不传则移除该事件所有监听） |

**示例：**

```javascript
// 移除特定回调
admin.off('featureClick', myCallback);

// 移除事件的所有监听
admin.off('featureClick');
```

---

### 生命周期

#### `destroy()`

销毁插件，清理所有资源。

**示例：**

```javascript
admin.destroy();
```

---

### 旧版 API 兼容

为了兼容旧版本，插件提供了以下兼容方法：

#### `showAdminByCodes(adcodes, params)`

根据编码显示行政区划（旧版兼容）。

```javascript
admin.showAdminByCodes(['110000', '310000'], {
  style: {
    fillColor: '#1890ff',
  },
  styleRules: {
    '110000': { fillColor: '#ff4d4f' }  // 北京特殊样式
  },
  loadedCallback: (data) => console.log('加载完成', data),
  clickCallback: (data) => console.log('点击', data),
  mousemoveCallback: (data) => console.log('悬停', data),
});
```

#### `highlighByCodes(adCodes)`

根据编码高亮（旧版兼容）。

```javascript
admin.highlighByCodes(['110000', '310000']);
```

#### `getCodesData(adcodes, level)`

根据编码获取数据（Promise方式）。

```javascript
const data = await admin.getCodesData(['110000'], 'province');
```

#### `setClickCallback(callback)`

设置点击回调。

```javascript
admin.setClickCallback((data) => {
  console.log('点击:', data.name);
});
```

#### `setMousemoveCallback(callback)`

设置鼠标移动回调。

```javascript
admin.setMousemoveCallback((data) => {
  console.log('悬停:', data.name);
});
```

#### `clear()`

清除展示。

```javascript
admin.clear();  // 等同于 clearAll()
```

---

## 典型使用场景

### 场景 1: 基础加载与展示

```javascript
import { AdminPlugin } from 'sfmap-sdk3-plugin/admin';

// 初始化
const admin = new AdminPlugin({ map });

// 加载北京和上海
await admin.addDistricts(['110000', '310000']);
```

### 场景 2: 省级行政区划展示

```javascript
// 加载主要省份
const provinces = [
  '110000', // 北京
  '310000', // 上海
  '440000', // 广东
  '330000', // 浙江
  '320000', // 江苏
];

await admin.addDistricts(provinces, {
  style: {
    fillColor: '#52c41a',
    lineColor: '#52c41a',
  }
});

// 定位到中国范围
map.flyTo({
  center: [104.5, 35.5],
  zoom: 3.5
});
```

### 场景 3: 点击交互与高亮

```javascript
// 加载数据
await admin.addDistricts(['440300', '440100']); // 深圳、广州

// 绑定点击事件
admin.on('featureClick', (e) => {
  console.log(`点击: ${e.data.name}`);
  
  // 高亮当前点击的
  admin.highlightDistricts([e.adcode]);
  
  // 显示信息面板
  showInfoPanel(e.data);
});
```

### 场景 4: 动态样式更新

```javascript
// 加载数据
await admin.addDistricts(['110000', '310000', '440300']);

// 根据业务数据更新样式
const businessData = {
  '110000': { value: 100, color: '#ff4d4f' },  // 高风险
  '310000': { value: 50, color: '#faad14' },   // 中风险
  '440300': { value: 10, color: '#52c41a' },   // 低风险
};

Object.entries(businessData).forEach(([adcode, data]) => {
  admin.updateDistrictStyle(adcode, {
    fillColor: data.color,
    lineColor: data.color,
    fillOpacity: 0.3,
  });
});
```

### 场景 5: 展示模式切换

```javascript
// 初始化（双显模式）
const admin = new AdminPlugin({
  map,
  displayMode: 'both'
});

// 加载数据
await admin.addDistricts(['110000']);

// 切换为仅多边形
admin.setDisplayMode('polygon');

// 切换为仅中心点
admin.setDisplayMode('center');
```

### 场景 6: 完整业务示例

```javascript
class DistrictManager {
  constructor(map) {
    this.admin = new AdminPlugin({
      map,
      env: 'prod',
      defaultStyle: {
        fillColor: '#1890ff',
        fillOpacity: 0.15,
      }
    });
    
    this.selectedDistricts = new Set();
    this.bindEvents();
  }
  
  bindEvents() {
    // 点击选择
    this.admin.on('featureClick', (e) => {
      const adcode = e.adcode;
      
      if (this.selectedDistricts.has(adcode)) {
        this.selectedDistricts.delete(adcode);
      } else {
        this.selectedDistricts.add(adcode);
      }
      
      // 更新高亮
      this.admin.highlightDistricts([...this.selectedDistricts]);
      
      // 触发业务回调
      this.onSelectionChange([...this.selectedDistricts]);
    });
    
    // 悬停效果
    this.admin.on('featureMouseOver', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    this.admin.on('featureMouseOut', () => {
      map.getCanvas().style.cursor = '';
    });
  }
  
  async loadDistricts(adcodes) {
    return await this.admin.addDistricts(adcodes);
  }
  
  getSelectedData() {
    return [...this.selectedDistricts].map(adcode => 
      this.admin.getDistrictData(adcode)
    );
  }
  
  clear() {
    this.selectedDistricts.clear();
    this.admin.clearAll();
  }
  
  destroy() {
    this.admin.destroy();
  }
}

// 使用
const manager = new DistrictManager(map);
await manager.loadDistricts(['110000', '310000', '440300']);
```

---

## 注意事项

1. **Map 实例必填**: 构造函数必须传入有效的 Mapbox 地图实例
2. **异步加载**: `addDistricts` 是异步方法，需要使用 `await` 或 `.then()`
3. **批量限制**: 单次最多支持 30 个编码批量查询，超过会自动分批处理
4. **样式优先级**: `updateDistrictStyle` > `addDistricts options.style` > `defaultStyle`
5. **内存管理**: 组件销毁时调用 `destroy()` 清理资源

---

## 常见问题

**Q: 如何获取行政区划编码？**  
A: 中国行政区划编码采用国家统计局标准，如：北京市 110000，上海市 310000。可通过国家统计局官网或相关 API 获取完整编码表。

**Q: 支持哪些级别的行政区划？**  
A: 支持省（province）、市（city）、区/县（district）三级行政区划。

**Q: 数据加载失败怎么办？**  
A: 检查网络连接、确认 `env` 或 `baseUrl` 配置正确、验证行政区划编码是否有效。

**Q: 如何自定义数据源？**  
A: 通过 `baseUrl` 参数指定自定义服务端地址，数据格式需与默认服务兼容。
