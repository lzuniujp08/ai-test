# AOILayer API

## `new AOILayerManager()`

创建兴趣区域管理器。

## 方法

- `draw(aoi: AOI): AOI` 绘制 AOI
- `edit(id: string, patch: Partial<AOI>): AOI | undefined` 编辑 AOI
- `query(id: string): AOI | undefined` 查询 AOI

```ts
const manager = new AOILayerManager();
manager.draw({ id: 'aoi-1', name: '区域', polygon: [] });
```
