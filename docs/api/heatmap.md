# Heatmap API

## `new HeatmapLayer(map, options)`

- 参数：
  - `map: MapboxLike`
  - `options.sourceId: string`
  - `options.points: GeoJSON.FeatureCollection<GeoJSON.Point>`
- 返回：`HeatmapLayer`

## 方法

- `create(): string` 创建热力图图层
- `update(points): void` 更新热力图数据
- `destroy(): void` 销毁图层与数据源

```ts
const heatmap = new HeatmapLayer(map, { sourceId: 'h1', points });
heatmap.create();
```
