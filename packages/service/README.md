# Services Plugin - 地图服务插件

## 简介

地图服务插件 (ServicesPlugin) 是 SFMap SDK3 Plugin 项目中的核心服务插件，为 Mapbox GL JS 地图提供丰富的地图数据服务能力。

## 功能特性

### 核心服务

- **地理编码服务** - 将地址文本转换为地理坐标
- **逆地理编码服务** - 将地理坐标转换为详细地址
- **路径规划服务** - 支持驾车、骑行等多种路径规划，并可在地图上展示路径
- **输入提示服务** - 根据关键字智能搜索 POI 地点

### 可视化能力

- 路径渲染 - 在地图上绘制规划路径，支持箭头指示
- 起终点标记 - 显示路径起点、终点和途经点
- 标记点 (Marker) - 在地图上显示位置标记
- 弹出框 (Popup) - 显示位置信息
- 自动定位 - 自动定位到查询结果

### 其他特性

- 自动认证 - 集成 Token 自动获取和管理机制
- 多环境支持 - 支持 sit 测试环境和 prod 生产环境
- 灵活配置 - 支持自定义服务地址和样式
- 完整文档 - 提供详细的 API 文档和使用示例

## 快速开始

### 安装

```bash
# 使用 pnpm 安装依赖
pnpm install

# 构建项目
pnpm run build:lib
```

### 引入

```javascript
// ES Module 方式
import ServicesPlugin from 'sfmap-sdk3-plugin/service';

// 或者直接引入源码
import ServicesPlugin from '../packages/service/src/index.js';
```

### 初始化

```javascript
import ServicesPlugin from 'sfmap-sdk3-plugin/service';

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

## 使用示例

### 1. 地理编码 - 地址转坐标

```javascript
// 搜索地址并显示标记
const result = await services.geo({
  address: '深圳市南山区科技园',
  city: '深圳',
  isShowMarker: true,
  isLocate: true
});

console.log(`坐标: [${result.xcoord}, ${result.ycoord}]`);
```

### 2. 逆地理编码 - 坐标转地址

```javascript
// 获取坐标对应的地址
const result = await services.rgeo({
  x: 114.0579,
  y: 22.5431,
  isShowMarker: true,
  isLocate: true
});

console.log(`地址: ${result.name}`);
```

### 3. 路径规划

```javascript
// 规划驾车路线
const result = await services.route({
  x1: 114.0579,
  y1: 22.5431,  // 起点
  x2: 114.1179,
  y2: 22.5431,  // 终点
  type: 0,      // 驾车
  strategy: 0,  // 时间优先
  isShowRoute: true,
  isLocate: true
});

console.log(`距离: ${result.distance}米，用时: ${result.duration}秒`);
```

### 4. POI 搜索

```javascript
// 搜索附近的POI
const results = await services.tip({
  q: '麦当劳',
  city: '深圳',
  district: '南山区',
  isShow: true,
  isLocate: true
});

console.log(`找到 ${results.length} 个结果`);
```

## API 参考

### 构造函数

```javascript
new ServicesPlugin(options)
```

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| map | Object | ✅ | null | Mapbox GL JS 地图实例 |
| token | String | ❌ | "" | 服务授权码 |
| ak | String | ❌ | "" | 服务授权码（与token二选一） |
| appId | String | ✅ | "" | 应用ID |
| appSecret | String | ✅ | "" | 应用秘钥 |
| username | String | ✅ | "" | 用户名 |
| password | String | ✅ | "" | 用户密码 |
| baseUrl | String | ❌ | "" | 自定义服务基础路径 |
| env | String | ❌ | 'sit' | 环境：'sit'或'prod' |

### 主要方法

#### 地理编码

```javascript
services.geo(params)
```

将地址转换为坐标。

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| address | String | ✅ | - | 地址文本信息 |
| city | String | ❌ | - | 所在城市 |
| normal | Number | ❌ | 1 | 是否规范化处理 |
| isShowMarker | Boolean | ❌ | true | 是否显示标记 |
| isLocate | Boolean | ❌ | true | 是否定位到结果 |

**返回值：** `Promise<Object>`

```javascript
{
  xcoord: 116.4074,      // 经度
  ycoord: 39.9042,       // 纬度
  src_address: "..."     // 标准地址
}
```

#### 逆地理编码

```javascript
services.rgeo(params)
```

将坐标转换为地址。

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| x | Number | ✅ | - | 经度 |
| y | Number | ✅ | - | 纬度 |
| isShowMarker | Boolean | ❌ | true | 是否显示标记 |
| isLocate | Boolean | ❌ | true | 是否定位到结果 |

**返回值：** `Promise<Object>`

```javascript
{
  name: "北京市东城区",  // 地址名称
  address: "长安街1号"   // 详细地址
}
```

#### 路径规划

```javascript
services.route(params)
```

规划导航路径。

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| x1, y1 | Number | ❌ | - | 起点坐标 |
| x2, y2 | Number | ❌ | - | 终点坐标 |
| origin | String | ❌ | - | 起点地址 |
| destination | String | ❌ | - | 终点地址 |
| type | Number | ❌ | 0 | 导航类型：0=驾车，1=骑行 |
| strategy | Number | ❌ | 0 | 策略：0=时间优先，2=距离优先，3=高速优先，4=躲避拥堵，6=频次最高，10=多路径 |
| waypoints | String | ❌ | - | 途经点：x1,y1\|x2,y2 |
| isShowRoute | Boolean | ❌ | true | 是否显示路径 |
| isLocate | Boolean | ❌ | true | 是否定位到结果 |

**返回值：** `Promise<Object>`

```javascript
{
  coords: [[x1,y1], [x2,y2], ...],  // 路径坐标
  distance: 5200,                     // 总距离（米）
  duration: 600                       // 预计时间（秒）
}
```

#### POI 搜索

```javascript
services.tip(params)
```

搜索附近的POI。

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| q | String | ✅ | - | 搜索关键字 |
| city | String | ❌ | "" | 城市 |
| district | String | ❌ | - | 区县 |
| isShow | Boolean | ❌ | true | 是否显示标记 |
| isLocate | Boolean | ❌ | true | 是否定位到结果 |

**返回值：** `Promise<Array>`

```javascript
[
  {
    name: "麦当劳",
    detail_addr: "详细地址",
    xcoord: 114.0579,
    ycoord: 22.5431
  },
  ...
]
```

#### 清除展示

```javascript
services.clear()
```

清除所有标记、弹出框、路径等可视化元素。

#### 销毁插件

```javascript
services.destroy()
```

销毁插件，清理所有资源。

## 项目结构

```
packages/service/
├── src/
│   ├── index.js           # 主入口文件（带完整文档注释）
│   ├── plugin-services.js # 插件实现
│   └── utils/
│       └── token.js       # Token 工具类
└── README.md              # 本文档
```

## 文档

完整的 API 文档和更多使用示例请查看：

- [服务插件完整文档](../../docs/guide/service-plugin.md)
- [项目主页](../../README.md)

## 开发

### 运行示例

```bash
# 启动开发服务器
pnpm run dev

# 在浏览器中访问
# http://localhost:5173/service.html
```

### 构建库文件

```bash
# 构建所有插件
pnpm run build:lib

# 输出文件位置
# dist/service.esm.js  (ES Module)
# dist/service.umd.js  (UMD)
```

### 代码规范

```bash
# 代码检查
pnpm run lint

# 代码格式化
pnpm run format
```

## 注意事项

1. **参数必填性**
   - `map` 参数可以为空，但需在使用前调用 `setMap()`
   - `token` 和 `ak` 必须至少提供一个
   - `appId`、`appSecret`、`username`、`password` 为必填认证参数

2. **异步调用**
   所有服务方法都是异步的，需要使用 `await` 或 `.then()`

3. **地图实例**
   如果初始化时未传入 `map`，需要在调用服务功能前通过 `setMap(map)` 设置

4. **性能优化**
   - 避免频繁调用地理编码和POI搜索
   - 大量POI搜索结果会创建多个标记，建议限制数量
   - 路径规划计算量大，避免并发请求

5. **错误处理**
   建议使用 try-catch 包裹所有异步调用

6. **资源清理**
   调用 `clear()` 清除可视化元素
   组件或页面卸载时调用 `destroy()` 清理所有资源

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发起 Pull Request
