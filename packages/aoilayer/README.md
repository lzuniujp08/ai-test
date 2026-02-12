# SFMap AOI Layer Plugin

基于 Mapbox GL JS 的 AOI（Area of Interest）图层插件，提供 AOI 区域的展示、样式自定义、高亮、合并、吸附等功能。

## 功能特性

- ✅ **多种 AOI 类型支持** - 普通 AOI、小件区域、快运区域、超大件区域、航空大件区域等
- ✅ **样式自定义** - 支持填充颜色、边框颜色、透明度、线宽等样式配置
- ✅ **高亮展示** - 点击高亮、指定高亮、多选高亮
- ✅ **AOI 合并** - 根据 AOIID、AOICODE、网点编码等合并 AOI
- ✅ **多边形吸附** - 将自定义多边形吸附到最近的 AOI 边界
- ✅ **拉框选择** - 在地图上拉框批量选择 AOI
- ✅ **标注功能** - 支持在 AOI 上添加文字标注
- ✅ **过滤查询** - 按城市、网点、区域等条件过滤 AOI
- ✅ **定位功能** - 定位到城市、网点、指定 AOI 等

## 安装

```bash
npm install sfmap-aoilayer-plugin
# 或
pnpm add sfmap-aoilayer-plugin
```

## 快速开始

```javascript
import { AOILayerPlugin } from 'sfmap-aoilayer-plugin';

const aoiPlugin = new AOILayerPlugin({
  map: map,                    // Mapbox GL JS 地图实例
  env: 'prod',                 // 环境变量：'prod' 或 'sit'
  token: 'your-token',        // 访问令牌
  username: 'your-username',  // 用户名
  password: 'your-password',  // 密码
  appId: 'your-app-id',      // 应用ID
  appSecret: 'your-app-secret', // 应用密钥
  cityCode: '755',           // 城市编码
  type: 'aoi',               // 类型：'aoi' 或 'aoiarea'
  isLabel: true,             // 显示标注
  isFitOnAdd: true           // 自动定位
});
```

## 使用示例

### 基本 AOI 展示

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
  clickCallback: (e) => {
    console.log('点击AOI:', e.info);
  }
});
```

### 合并 AOI

```javascript
// 根据 AOIID 合并
aoiPlugin.mergeAoisByAoiIds({
  aoiIds: ['AOI_ID_1', 'AOI_ID_2'],
  isFit: true,
  showOnMap: true,
  callback: (result) => {
    console.log('合并后的WKT:', result.wkt);
  }
});

// 根据 AOICODE 合并
aoiPlugin.mergeAoisByAoiCodes({
  aoiCodes: ['755BK000029', '755BK000104'],
  isFit: true,
  showOnMap: true,
  callback: (result) => {
    console.log('合并结果:', result);
  }
});
```

### 多边形吸附

```javascript
aoiPlugin.snapToAoi({
  wkt: 'POLYGON((113.93 22.52, 113.95 22.52, 113.95 22.54, 113.93 22.54, 113.93 22.52))',
  isFit: true,
  showOnMap: true,
  callback: (result) => {
    console.log('吸附成功:', result);
  }
});
```

### 高亮 AOI

```javascript
// 设置高亮样式
aoiPlugin.setHighLightStyles([
  {
    codes: ['755FG000065'],
    style: {
      fillColor: '#ff0000',
      fillOpacity: 0.3,
      strokeColor: '#ff0000',
      strokeOpacity: 1,
      strokeWidth: 2
    }
  }
]);

// 高亮指定 AOI
aoiPlugin.highLightByCodes(['755FG000065']);

// 清除高亮
aoiPlugin.clearHighLight();
```

## API 文档

详细的 API 文档请参阅：[AOI 图层插件文档](../../docs/guide/aoilayer-plugin.md)

## 依赖

- [@turf/turf](https://turfjs.org/) - 地理空间分析
- [@terraformer/wkt](https://github.com/terraformer-js/terraformer) - WKT 格式转换
- [jsencrypt](https://github.com/travist/jsencrypt) - 加密工具

## 类型说明

| type | codeField | 说明 |
|------|-----------|------|
| `aoi` | `aoi_code` | 普通 AOI |
| `aoiarea` | `area_code` | 小件 AOI 区域 |
| `kyaoiarea` | `ky_area_code` | 快运（大件）网点区域 |
| `djaoiarea` | `dj_area_code` | 超大件网点区域 |
| `hkaoiarea` | `hk_area_code` | 航空大件网点区域 |
| `tdaoiarea` | `td_area_code` | 小件中转直派网点区域 |

## 示例程序

运行示例程序：

```bash
pnpm run dev
```

然后访问：`http://localhost:5173/aoilayer.html`

## License

MIT
