# 地图服务插件 (ServicesPlugin)

## 概述

地图服务插件 (`ServicesPlugin`) 是一个功能丰富的地图数据服务插件，为 Mapbox GL JS 地图提供地理编码、逆地理编码、路径规划、POI 搜索等核心地图服务能力，并支持地图可视化展示。

## 功能特性

- **地理编码服务** - 将地址文本转换为地理坐标
- **逆地理编码服务** - 将地理坐标转换为详细地址
- **路径规划服务** - 支持驾车、骑行等多种路径规划，并可在地图上展示路径
- **输入提示服务** - 根据关键字智能搜索 POI 地点
- **地图可视化** - 路径渲染、起终点标记、箭头指示、标记点和弹出框
- **自动认证** - 集成 Token 自动获取和管理机制
- **多环境支持** - 支持 sit 测试环境和 prod 生产环境

---

## 快速开始

### 安装

```javascript
// ES Module 方式
import ServicesPlugin from 'sfmap-sdk3-plugin/service';

// 或者直接引入
import ServicesPlugin from '../packages/service/src/index.js';
```

### 基础用法

```javascript
import ServicesPlugin from 'sfmap-sdk3-plugin/service';

// 初始化插件
const services = new ServicesPlugin({
  map: map,                    // Mapbox 地图实例
  token: 'your-token',         // 服务授权码
  appId: 'your-appId',         // 应用ID
  appSecret: 'your-secret',    // 应用秘钥
  username: 'your-username',   // 用户名
  password: 'your-password',   // 用户密码
  env: 'sit',                  // 环境：'sit'测试环境，'prod'生产环境
});
```

---

## API 参考

### 构造函数

#### `new ServicesPlugin(options)`

创建地图服务插件实例。

**参数说明：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `map` | Object | ✅ | `null` | Mapbox GL JS 地图实例（可在后续通过 `setMap` 设置） |
| `token` | String | ❌ | `""` | 服务授权码（与 ak 二选一） |
| `ak` | String | ❌ | `""` | 服务授权码（与 token 二选一） |
| `appId` | String | ✅ | `""` | 应用ID（认证必填） |
| `appSecret` | String | ✅ | `""` | 应用秘钥（认证必填） |
| `username` | String | ✅ | `""` | 用户名（认证必填） |
| `password` | String | ✅ | `""` | 用户密码（认证必填） |
| `baseUrl` | String | ❌ | `""` | 自定义服务基础路径 |
| `env` | String | ❌ | `'sit'` | 环境参数：`'sit'`测试环境，`'prod'`生产环境 |

**错误处理：**

- 当 `map` 参数为空时，会在控制台输出警告信息（不抛出错误）
- 当 `token` 和 `ak` 均为空时，抛出错误
- 当 `appId`、`appSecret`、`username`、`password` 任一为空时，抛出错误

**示例：**

```javascript
// 使用 token
const services = new ServicesPlugin({
  map: map,
  token: 'abc123',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123',
  env: 'sit'
});

// 使用 ak
const services = new ServicesPlugin({
  map: map,
  ak: 'xyz789',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123',
  env: 'prod'
});

// 后续设置地图实例
const services = new ServicesPlugin({
  token: 'abc123',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123',
});

// 初始化地图后再设置
services.setMap(map);
```

---

### 地图控制

#### `setMap(map)`

设置地图实例（如果在初始化时未传入地图实例）。

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `map` | Object | Mapbox GL JS 地图实例 |

**示例：**

```javascript
const services = new ServicesPlugin({
  token: 'abc123',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123',
});

// 地图加载完成后设置
services.setMap(map);
```

---

### 地理编码

#### `geo(params)`

地理编码服务 - 将地址转换成坐标。

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `address` | String | ✅ | - | 地址文本信息 |
| `url` | String | ❌ | - | 自定义服务基础路径 |
| `token` | String | ❌ | - | 服务授权码（覆盖构造函数中的设置） |
| `city` | String | ❌ | - | 地址所在城市（城市名、编码或区划代码） |
| `normal` | Number | ❌ | `1` | 是否进行地址规范化处理，1=规范化，0=不规范化 |
| `exact` | Number | ❌ | - | CX专用，当 `exact=1` 时进行二次调用 |
| `isShowMarker` | Boolean | ❌ | `true` | 是否显示 Marker 标记 |
| `markerStyleOptions` | Object | ❌ | `{color: '#f00', scale: 0.75}` | 标记样式 |
| `isLocate` | Boolean | ❌ | `true` | 是否定位到结果 |

**返回值：** `Promise<Object>` - 地理编码结果

**返回数据结构：**

```javascript
{
  xcoord: 116.4074,      // 经度
  ycoord: 39.9042,       // 纬度
  src_address: "北京市东城区长安街1号",  // 标准地址
  level: "precise",      // 精度级别
  confidence: 100        // 置信度
}
```

**示例：**

```javascript
// 基础用法
const result = await services.geo({
  address: '北京市东城区长安街1号'
});
console.log(`坐标: [${result.xcoord}, ${result.ycoord}]`);

// 带城市信息
const result = await services.geo({
  address: '长安街1号',
  city: '北京',
  isShowMarker: true,
  isLocate: true
});

// 自定义标记样式
const result = await services.geo({
  address: '上海市南京路',
  markerStyleOptions: {
    color: '#1890ff',
    scale: 1.0
  },
  isShowMarker: true,
  isLocate: false  // 不自动定位
});

// 不显示标记和定位
const result = await services.geo({
  address: '深圳市南山区',
  isShowMarker: false,
  isLocate: false
});
```

---

### 逆地理编码

#### `rgeo(params)`

逆地理编码服务 - 将坐标转换成地址。

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `x` | Number | ✅ | - | 经度 |
| `y` | Number | ✅ | - | 纬度 |
| `url` | String | ❌ | - | 自定义服务基础路径 |
| `token` | String | ❌ | - | 服务授权码 |
| `isShowMarker` | Boolean | ❌ | `true` | 是否显示 Marker 标记 |
| `markerStyleOptions` | Object | ❌ | `{color: '#f00', scale: 0.75}` | 标记样式 |
| `isLocate` | Boolean | ❌ | `true` | 是否定位到结果 |

**返回值：** `Promise<Object>` - 逆地理编码结果

**返回数据结构：**

```javascript
{
  name: "北京市东城区",      // 地址名称
  address: "长安街1号",     // 详细地址
  adcode: "110101",         // 行政区划编码
  level: "district",        // 级别
  city: "北京市",           // 所属城市
  province: "北京市"        // 所属省份
}
```

**示例：**

```javascript
// 基础用法
const result = await services.rgeo({
  x: 116.4074,
  y: 39.9042
});
console.log(`地址: ${result.name}`);

// 不显示标记
const result = await services.rgeo({
  x: 121.4737,
  y: 31.2304,
  isShowMarker: false,
  isLocate: false
});

// 自定义标记样式
const result = await services.rgeo({
  x: 114.0579,
  y: 22.5431,
  markerStyleOptions: {
    color: '#52c41a',
    scale: 0.8
  }
});
```

---

### 路径规划

#### `route(params)`

路径规划服务 - 根据起点和终点查询导航路径。

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `x1` | Number | ❌ | - | 起点经度（与 origin 二选一，优先坐标） |
| `y1` | Number | ❌ | - | 起点纬度（与 origin 二选一，优先坐标） |
| `x2` | Number | ❌ | - | 终点经度（与 destination 二选一，优先坐标） |
| `y2` | Number | ❌ | - | 终点纬度（与 destination 二选一，优先坐标） |
| `origin` | String | ❌ | - | 起点地址（UTF8编码） |
| `destination` | String | ❌ | - | 终点地址（UTF8编码） |
| `url` | String | ❌ | - | 自定义服务基础路径 |
| `token` | String | ❌ | - | 服务授权码 |
| `type` | Number | ❌ | `0` | 导航类型：0-驾车，1-骑行 |
| `strategy` | Number | ❌ | `0` | 导航策略（见下文） |
| `waypoints` | String | ❌ | - | 途经点，格式：`x1,y1\|x2,y2`，最多5个 |
| `isShowRoute` | Boolean | ❌ | `true` | 是否在地图上展示路径 |
| `isLocate` | Boolean | ❌ | `true` | 是否定位到结果范围 |

**导航策略说明（strategy）：**

| 值 | 策略 | 说明 |
|----|------|------|
| 0 | 时间优先 | 默认策略 |
| 2 | 距离优先 | 最短距离 |
| 3 | 高速公路优先 | 优先走高速 |
| 4 | 躲避拥堵 | 根据实时路况规避拥堵 |
| 6 | 频次最高 | 基于历史频次推荐 |
| 10 | 多路径 | 返回多条备选路径 |

**返回值：** `Promise<Object>` - 路径规划结果

**返回数据结构：**

```javascript
{
  coords: [[116.4074, 39.9042], [116.4084, 39.9052], ...],  // 路径坐标数组
  wayPointList: [],                                            // 途经点列表
  distance: 5200,                                             // 总距离（米）
  duration: 600,                                              // 预计时间（秒）
  toll_distance: 1000,                                        // 收费距离（米）
  toll_fee: 20                                                // 过路费（元）
}
```

**示例：**

```javascript
// 使用坐标规划路径（驾车）
const result = await services.route({
  x1: 116.4074,
  y1: 39.9042,  // 起点：天安门
  x2: 121.4737,
  y2: 31.2304,  // 终点：外滩
  type: 0,       // 驾车
  strategy: 0,   // 时间优先
});
console.log(`距离: ${result.distance}米，用时: ${result.duration}秒`);

// 使用地址规划路径
const result = await services.route({
  origin: '北京市东城区长安街1号',
  destination: '上海市黄浦区南京东路',
  type: 0
});

// 骑行路径规划
const result = await services.route({
  x1: 116.4074,
  y1: 39.9042,
  x2: 116.4174,
  y2: 39.9142,
  type: 1,  // 骑行
  strategy: 2  // 距离优先
});

// 带途经点
const result = await services.route({
  x1: 116.4074,
  y1: 39.9042,
  x2: 116.4274,
  y2: 39.9242,
  waypoints: '116.4174,39.9142|116.4224,39.9192',  // 两个途经点
  type: 0
});

// 不显示路径，仅获取数据
const result = await services.route({
  x1: 116.4074,
  y1: 39.9042,
  x2: 116.4274,
  y2: 39.9242,
  isShowRoute: false,
  isLocate: false
});

// 躲避拥堵策略
const result = await services.route({
  x1: 116.4074,
  y1: 39.9042,
  x2: 116.4274,
  y2: 39.9242,
  type: 0,
  strategy: 4  // 躲避拥堵
});
```

---

### POI 搜索

#### `tip(params)`

输入提示服务 - 根据关键字搜索相近的 POI。

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `q` | String | ✅ | - | 搜索关键字 |
| `city` | String | ❌ | `""` | 城市名称、编码或区划代码（如深圳、755、440300） |
| `url` | String | ❌ | - | 自定义服务基础路径 |
| `token` | String | ❌ | - | 服务授权码 |
| `country` | String | ❌ | - | 国家（ISO-3166-1标准代码） |
| `district` | String | ❌ | - | 中文区县（需 city 字段不为空） |
| `isShow` | Boolean | ❌ | `true` | 是否在地图上展示结果 |
| `isLocate` | Boolean | ❌ | `true` | 是否定位到结果 |
| `markerStyle` | Object | ❌ | `{color: '#f00', scale: 0.75}` | 标记样式 |

**返回值：** `Promise<Array>` - POI 列表

**返回数据结构：**

```javascript
[
  {
    adname: ["北京市", "北京市", "东城区"],  // 省、市、区
    name: "天安门广场",                     // POI 名称
    detail_addr: "北京市北京市东城区东长安街",  // 详细地址
    xcoord: 116.4074,                      // 经度
    ycoord: 39.9042,                       // 纬度
    key_prefix: "东长安街"                  // 关键字前缀
  },
  ...
]
```

**示例：**

```javascript
// 基础搜索（带城市）
const results = await services.tip({
  q: '麦当劳',
  city: '深圳'
});
console.log(`找到 ${results.length} 个结果`);
results.forEach(poi => {
  console.log(`${poi.name}: ${poi.detail_addr}`);
});

// 搜索指定区的 POI
const results = await services.tip({
  q: '公园',
  city: '北京',
  district: '朝阳区'
});

// 搜索不显示标记
const results = await services.tip({
  q: '医院',
  city: '上海',
  isShow: false,
  isLocate: false
});

// 自定义标记样式
const results = await services.tip({
  q: '地铁站',
  city: '广州',
  markerStyle: {
    color: '#1890ff',
    scale: 0.6
  }
});

// 不指定城市，调用高德接口（需要 Token 认证）
const results = await services.tip({
  q: '清华大学'
});
```

---

### 清除展示

#### `clear()`

清除所有展示内容，包括标记点、弹出框、路径线等所有可视化元素。

**示例：**

```javascript
// 清除所有展示
services.clear();

// 使用场景：重新查询前清除之前的结果
async function searchNewLocation(address) {
  services.clear();  // 清除之前的结果
  const result = await services.geo({ address });
  return result;
}
```

---

### 销毁插件

#### `destroy()`

销毁插件，清理所有资源，销毁后插件实例不可再用。

**示例：**

```javascript
// 销毁插件
services.destroy();

// 使用场景：页面卸载或组件销毁时
window.addEventListener('beforeunload', () => {
  services.destroy();
});
```

---

## 典型使用场景

### 场景 1: 地址搜索与定位

```javascript
import ServicesPlugin from 'sfmap-sdk3-plugin/service';

// 初始化
const services = new ServicesPlugin({
  map: map,
  token: 'abc123',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123'
});

// 搜索地址并显示标记
async function searchAndLocate(address) {
  try {
    const result = await services.geo({
      address: address,
      isShowMarker: true,
      isLocate: true
    });
    console.log(`找到位置: [${result.xcoord}, ${result.ycoord}]`);
    return result;
  } catch (error) {
    console.error('搜索失败:', error);
  }
}

// 使用
searchAndLocate('北京市东城区长安街1号');
```

### 场景 2: 点击地图获取地址

```javascript
// 地图点击事件
map.on('click', async (e) => {
  const { lng, lat } = e.lngLat;
  
  try {
    const result = await services.rgeo({
      x: lng,
      y: lat,
      isShowMarker: true,
      isLocate: true
    });
    
    console.log(`地址: ${result.name}`);
    console.log(`详细地址: ${result.address}`);
  } catch (error) {
    console.error('逆地理编码失败:', error);
  }
});
```

### 场景 3: 路径规划与导航

```javascript
async function planRoute(start, end) {
  try {
    // 清除之前的路径
    services.clear();
    
    // 规划路径
    const result = await services.route({
      origin: start,
      destination: end,
      type: 0,      // 驾车
      strategy: 4,  // 躲避拥堵
      isShowRoute: true,
      isLocate: true
    });
    
    // 显示路径信息
    const distance = (result.distance / 1000).toFixed(2);
    const duration = Math.round(result.duration / 60);
    
    console.log(`总距离: ${distance}公里`);
    console.log(`预计用时: ${duration}分钟`);
    
    return result;
  } catch (error) {
    console.error('路径规划失败:', error);
  }
}

// 使用
planRoute('北京市海淀区中关村', '北京市朝阳区国贸');
```

### 场景 4: POI 搜索展示

```javascript
// 创建搜索界面
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

searchBtn.addEventListener('click', async () => {
  const keyword = searchInput.value.trim();
  if (!keyword) return;
  
  try {
    // 清除之前的结果
    services.clear();
    
    // 搜索 POI
    const results = await services.tip({
      q: keyword,
      city: '深圳',
      isShow: true,
      isLocate: true
    });
    
    console.log(`找到 ${results.length} 个结果`);
    displayResults(results);
  } catch (error) {
    console.error('搜索失败:', error);
  }
});

function displayResults(results) {
  const list = document.getElementById('result-list');
  list.innerHTML = results.map(poi => `
    <div class="result-item">
      <div class="name">${poi.name}</div>
      <div class="address">${poi.detail_addr}</div>
    </div>
  `).join('');
}
```

### 场景 5: 完整的位置服务应用

```javascript
class LocationService {
  constructor(map, config) {
    this.services = new ServicesPlugin({
      map,
      ...config
    });
    
    this.currentLocation = null;
    this.searchHistory = [];
  }
  
  // 地址搜索
  async searchAddress(address, options = {}) {
    const result = await this.services.geo({
      address,
      ...options
    });
    
    this.currentLocation = {
      x: result.xcoord,
      y: result.ycoord,
      address: result.src_address
    };
    
    this.addToHistory(this.currentLocation);
    return this.currentLocation;
  }
  
  // 坐标获取地址
  async getAddressFromCoord(x, y, options = {}) {
    const result = await this.services.rgeo({
      x,
      y,
      ...options
    });
    
    return {
      x,
      y,
      name: result.name,
      address: result.address
    };
  }
  
  // 路径规划
  async planRoute(start, end, type = 0, strategy = 0) {
    const params = {
      type,
      strategy,
      isShowRoute: true,
      isLocate: true
    };
    
    // 支持坐标或地址
    if (typeof start === 'string') {
      params.origin = start;
    } else {
      params.x1 = start.x;
      params.y1 = start.y;
    }
    
    if (typeof end === 'string') {
      params.destination = end;
    } else {
      params.x2 = end.x;
      params.y2 = end.y;
    }
    
    const result = await this.services.route(params);
    return result;
  }
  
  // POI 搜索
  async searchPOI(keyword, city, options = {}) {
    const results = await this.services.tip({
      q: keyword,
      city,
      ...options
    });
    
    return results;
  }
  
  // 添加到搜索历史
  addToHistory(location) {
    this.searchHistory.unshift(location);
    if (this.searchHistory.length > 10) {
      this.searchHistory.pop();
    }
  }
  
  // 获取当前位置
  getCurrentLocation() {
    return this.currentLocation;
  }
  
  // 清除展示
  clear() {
    this.services.clear();
  }
  
  // 销毁
  destroy() {
    this.services.destroy();
  }
}

// 使用
const locationService = new LocationService(map, {
  token: 'abc123',
  appId: 'myapp',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123'
});

// 搜索地址
const location = await locationService.searchAddress('深圳市南山区科技园');

// 路径规划
const route = await locationService.planRoute(
  { x: 114.0579, y: 22.5431 },
  { x: 114.0679, y: 22.5531 },
  0,  // 驾车
  0   // 时间优先
);
```

### 场景 6: 地址自动补全

```javascript
let searchTimeout;

const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');

searchInput.addEventListener('input', (e) => {
  const keyword = e.target.value.trim();
  
  // 防抖
  clearTimeout(searchTimeout);
  
  if (keyword.length < 2) {
    suggestionsBox.style.display = 'none';
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const results = await services.tip({
        q: keyword,
        city: '北京',
        isShow: false,
        isLocate: false
      });
      
      displaySuggestions(results.slice(0, 10));  // 最多显示10条
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, 300);
});

function displaySuggestions(results) {
  if (results.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }
  
  suggestionsBox.innerHTML = results.map(poi => `
    <div class="suggestion-item" data-x="${poi.xcoord}" data-y="${poi.ycoord}">
      <div class="poi-name">${poi.name}</div>
      <div class="poi-address">${poi.detail_addr}</div>
    </div>
  `).join('');
  
  suggestionsBox.style.display = 'block';
  
  // 点击建议项
  suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', async () => {
      const x = parseFloat(item.dataset.x);
      const y = parseFloat(item.dataset.y);
      
      // 定位到选中位置
      map.flyTo({ center: [x, y], zoom: 16 });
      
      // 显示标记
      await services.rgeo({ x, y });
      
      suggestionsBox.style.display = 'none';
      searchInput.value = item.querySelector('.poi-name').textContent;
    });
  });
}
```

---

## 注意事项

### 1. 参数验证

- 构造函数中 `map` 参数可以为空，但需要在使用前通过 `setMap()` 设置
- `token` 和 `ak` 必须至少提供一个
- `appId`、`appSecret`、`username`、`password` 为必填认证参数

### 2. 异步调用

所有服务方法都是异步的，需要使用 `await` 或 `.then()`：

```javascript
// ✅ 正确
const result = await services.geo({ address: 'xxx' });

// ❌ 错误
const result = services.geo({ address: 'xxx' });
```

### 3. 地图实例

- 如果初始化时未传入 `map`，需要在使用服务功能前调用 `setMap(map)`
- 路径展示、标记显示等功能需要有效的地图实例

### 4. 路径规划

- 起终点坐标优先于地址
- `waypoints` 参数格式为 `x1,y1|x2,y2`，最多支持5个途经点
- 不同 `strategy` 可能会影响计算时间和结果准确性

### 5. POI 搜索

- 提供城市信息时使用本地服务，响应更快
- 不提供城市信息时调用高德接口，需要有效的 Token 认证
- 搜索结果会自动添加标记点到地图

### 6. 性能优化

- 大量 POI 搜索结果会创建多个标记，建议限制返回数量
- 频繁的地理编码调用可能影响性能，建议使用缓存
- 路径规划计算量较大，建议避免并发过多请求

### 7. 错误处理

所有服务方法都可能抛出错误，建议使用 try-catch：

```javascript
try {
  const result = await services.geo({ address: 'xxx' });
} catch (error) {
  console.error('服务调用失败:', error);
  // 处理错误
}
```

### 8. 资源清理

- 调用 `clear()` 清除可视化元素
- 组件或页面卸载时调用 `destroy()` 清理所有资源

---

## 常见问题

**Q: token 和 ak 有什么区别？应该使用哪个？**  
A: token 和 ak 都是服务授权码，功能相同。使用任一参数即可，建议根据后端服务配置选择。

**Q: 如何切换测试环境和生产环境？**  
A: 通过 `env` 参数设置：`'sit'` 为测试环境，`'prod'` 为生产环境。也可以直接通过 `baseUrl` 指定自定义服务地址。

**Q: 路径规划支持哪些导航方式？**  
A: 目前支持驾车（`type=0`）和骑行（`type=1`）两种方式。

**Q: POI 搜索结果数量有限制吗？**  
A: 一次搜索最多返回一批结果，可通过分页或其他方式获取更多数据。

**Q: 如何在初始化时不传入 map 实例？**  
A: 可以在构造函数中不传 `map`，然后在地图加载完成后调用 `setMap(map)` 设置地图实例。

**Q: 途经点格式是怎样的？**  
A: 途经点格式为 `x1,y1|x2,y2`，即多个坐标用竖线分隔，每个坐标用逗号分隔经纬度。

**Q: 如何获取详细的行政区划信息？**  
A: 逆地理编码返回的结果包含行政区划编码和名称，可用于进一步查询。

**Q: 标记样式可以自定义吗？**  
A: 可以，通过 `markerStyleOptions` 或 `markerStyle` 参数设置 `color`（颜色）和 `scale`（缩放比例）。

---

## 附录

### 完整参数示例

```javascript
const config = {
  // 构造函数参数
  map: map,
  token: 'your-token',
  ak: 'your-ak',
  appId: 'app123',
  appSecret: 'secret123',
  username: 'user1',
  password: 'pass123',
  baseUrl: 'https://custom.api.com',
  env: 'sit'
};

// 地理编码参数
const geoParams = {
  address: '北京市东城区长安街1号',
  city: '北京',
  normal: 1,
  exact: 0,
  isShowMarker: true,
  markerStyleOptions: { color: '#1890ff', scale: 0.75 },
  isLocate: true
};

// 逆地理编码参数
const rgeoParams = {
  x: 116.4074,
  y: 39.9042,
  isShowMarker: true,
  markerStyleOptions: { color: '#1890ff', scale: 0.75 },
  isLocate: true
};

// 路径规划参数
const routeParams = {
  x1: 116.4074,
  y1: 39.9042,
  x2: 121.4737,
  y2: 31.2304,
  origin: '北京市东城区长安街1号',
  destination: '上海市黄浦区南京东路',
  type: 0,           // 驾车
  strategy: 0,       // 时间优先
  waypoints: '116.4174,39.9142|116.4224,39.9192',
  isShowRoute: true,
  isLocate: true
};

// POI 搜索参数
const tipParams = {
  q: '麦当劳',
  city: '深圳',
  district: '南山区',
  country: 'CN',
  isShow: true,
  isLocate: true,
  markerStyle: { color: '#1890ff', scale: 0.6 }
};
```
