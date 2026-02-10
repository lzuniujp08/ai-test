# Service API

## `fetchMapData(request)`

- 参数：`{ endpoint: string; token: string }`
- 返回：`Promise<{ status: 'ok'; features: Record<string, unknown>[] }>`

```ts
const result = await fetchMapData({ endpoint: '/api/map', token: 'token' });
```
