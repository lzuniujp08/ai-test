# 核心概念

- **SDK 设计**：统一入口 `createSDK` 聚合 admin/service/heatmap/aoilayer 模块。
- **Mapbox GL 适配**：通过 `shared` 包提供 `MapboxLike` 抽象与校验。
- **模块化结构**：每个模块独立子包，可单独构建并独立发布。
