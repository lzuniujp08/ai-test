# Examples 示例代码

本目录包含 SFMap SDK3 插件的示例代码。

## 文件结构

```
examples/
├── index.html          # 示例首页
├── admin.html         # 行政区划插件示例
├── admin.js           # 行政区划插件逻辑
├── aoilayer.html      # AOI 图层插件示例
├── aoilayer.js        # AOI 图层插件逻辑
├── heatmap.html       # AOI 热力图插件示例
├── heatmap.js         # AOI 热力图插件逻辑
├── service.html       # 服务插件示例
├── service.js         # 服务插件逻辑
├── shared.css         # 公共样式文件
├── shared-utils.js    # 公共工具函数
├── map.js            # 地图初始化工具
└── vite.config.js     # Vite 配置
```

## 公共资源

### shared.css

公共样式文件，包含：

- 全局基础样式
- 滚动条样式
- 工具面板样式
- 控制面板样式
- 输出日志面板样式
- 通用工具类
- 按钮颜色主题
- 响应式布局

### shared-utils.js

公共工具函数模块，导出以下函数：

#### 日志输出

```javascript
import { log } from './shared-utils.js';

log('操作完成');
log('加载了数据', { count: 100 });
```

#### 颜色处理

```javascript
import { shadeColor } from './shared-utils.js';

// 加深颜色
const darker = shadeColor('#1890ff', 20);

// 变浅颜色
const lighter = shadeColor('#1890ff', -20);
```

#### UI 组件创建

```javascript
import {
  createControlPanel,
  createButton,
  createSection,
  createSelect,
  createSlider,
  createInput,
  createOutputPanel
} from './shared-utils.js';

// 创建控制面板
const panel = createControlPanel({
  title: '控制面板',
  subtitle: '功能演示',
  width: 240
});

// 创建按钮
const btn = createButton('点击我', () => {
  console.log('按钮被点击');
}, '#1890ff');

// 创建分组
const section = createSection('分组标题');

// 创建下拉选择器
const select = createSelect([
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' }
], (e) => {
  console.log('选择了', e.target.value);
});

// 创建滑块
const slider = createSlider(0, 1, 0.5, '透明度', (val) => {
  console.log('当前值:', val);
});

// 创建输入框
const input = createInput('请输入...', (value) => {
  console.log('输入:', value);
});

// 创建输出面板
const output = createOutputPanel();
document.body.appendChild(output);
```

#### 工具函数

```javascript
import { debounce, throttle, deepClone } from './shared-utils.js';

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('防抖执行');
}, 300);

// 节流函数
const throttledFn = throttle(() => {
  console.log('节流执行');
}, 300);

// 深度克隆
const clonedObj = deepClone(originalObj);
```

## 使用示例

### 基本结构

```javascript
import { initMap } from './map.js';
import { log, createControlPanel, createButton } from './shared-utils.js';

async function init() {
  const map = await initMap('map');
  
  // 初始化插件
  const plugin = new Plugin(map, { ...options });
  
  // 创建控制面板
  const panel = createControlPanel({
    title: '插件名称',
    width: 240
  });
  
  // 添加按钮
  panel.appendChild(createButton('操作', () => {
    plugin.doSomething();
    log('操作完成');
  }));
  
  document.body.appendChild(panel);
}

init();
```

## 运行示例

### 开发模式

```bash
pnpm run dev
```

### 访问示例

- 首页: http://localhost:5173/
- 行政区划插件: http://localhost:5173/admin.html
- 服务插件: http://localhost:5173/service.html
- AOI 图层插件: http://localhost:5173/aoilayer.html
- AOI 热力图插件: http://localhost:5173/heatmap.html

## 插件列表

### AdminPlugin - 行政区划插件

展示行政区划（省、市、区县）边界和中心点。

**功能：**
- 加载省级、市级、区县级行政区划
- 多种展示模式（多边形、中心点、同时显示）
- 样式自定义
- 高亮交互
- 框选功能

### ServicePlugin - 服务插件

提供地图服务 API，包括：

- 地理编码（地址转坐标）
- 逆地理编码（坐标转地址）
- 关键字搜索
- POI 检索
- 周边检索
- 路线规划

### AOILayerPlugin - AOI 图层插件

展示 AOI（区域）数据。

**功能：**
- 加载 AOI 多边形数据
- 自定义填充和边框样式
- 标签显示
- 高亮交互
- 框选功能
- 点击事件回调

### HeatmapPlugin - AOI 热力图插件

通过 WMS 服务展示收派件业务热力分布数据。

**功能：**
- 收件/派件/收派件热力图
- 多时间维度（7/15/30/90天）
- 城市分片数据加载
- 网点过滤
- 动态跟随地图更新

## 样式主题

### 按钮颜色

| 类名 | 颜色 | 用途 |
|------|------|------|
| `btn-primary` | #1890ff | 主要操作 |
| `btn-success` | #52c41a | 成功/确认 |
| `btn-danger` | #ff4d4f | 危险/删除 |
| `btn-warning` | #faad14 | 警告 |
| `btn-info` | #13c2c2 | 信息 |
| `btn-secondary` | #8c8c8c | 次要操作 |

### 主题色

```css
--primary-color: #1890ff;   /* 主色调 */
--success-color: #52c41a;   /* 成功色 */
--warning-color: #faad14;    /* 警告色 */
--danger-color: #ff4d4f;    /* 危险色 */
--info-color: #13c2c2;      /* 信息色 */
```

## 注意事项

1. **地图初始化** - 所有示例都使用 `initMap()` 函数初始化地图
2. **日志输出** - 使用 `log()` 函数统一输出日志，便于调试
3. **样式规范** - 遵循 Ant Design 设计规范
4. **响应式设计** - 在移动端自动适配布局
5. **错误处理** - 所有异步操作都应添加错误处理

## 开发指南

### 添加新示例

1. 在 `examples/` 目录下创建新的 HTML 和 JS 文件
2. 使用 `initMap()` 初始化地图
3. 使用 `shared-utils.js` 中的工具函数
4. 添加输出面板 `<pre id="output"></pre>`
5. 在 `index.html` 中添加链接

### 修改公共样式

编辑 `shared.css` 文件，所有示例都会自动应用新样式。

### 添加公共工具函数

编辑 `shared-utils.js` 文件，添加新的工具函数并导出。

## 依赖

- [SFMap SDK3](https://lbs.sf-express.com/) - 地图 SDK
- [Vite](https://vitejs.dev/) - 构建工具
