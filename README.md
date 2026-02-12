# SFMap SDK3 Plugin Monorepo

Mapbox GL JS 插件 SDK，提供行政区划、地图服务、热力图、兴趣区域等多种地图功能插件。

## 项目结构

- `packages/admin`: [行政区划插件](docs/guide/admin-plugin.md) - 展示和管理中国行政区划数据
- `packages/service`: [地图服务插件](docs/guide/service-plugin.md) - 地理编码、路径规划、POI搜索等服务
- `packages/heatmap`: 热力图图层
- `packages/aoilayer`: 兴趣区域图层
- `examples`: 本地示例与开发调试
- `docs`: VitePress 文档站点

## 快速开始

```bash
pnpm install
pnpm run dev
```

## 构建与测试

```bash
pnpm run build:lib
pnpm run build:docs
pnpm run test
pnpm run lint
```
