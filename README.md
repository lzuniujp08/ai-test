# Mapbox GL JS Plugin SDK Monorepo

## 项目结构

- `packages/shared`: 公共类型与工具
- `packages/admin`: 管理面板工具
- `packages/service`: 地图数据服务调用
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
