# Admin API

## `new AdminToolkit(context)`

- 参数：`context: { map: MapboxLike }`
- 返回：`AdminToolkit` 实例

## `createPanel(options)`

- 参数：`{ title: string; enableInspector?: boolean }`
- 返回：`string`（面板状态描述）

```ts
const admin = new AdminToolkit({ map });
admin.createPanel({ title: '控制台', enableInspector: true });
```
