# 快速开始

## CDN 全量引入

```html
<script src="https://unpkg.com/@mapbox-plugin/sdk-monorepo/dist/sdk.umd.js"></script>
```

## npm 安装

```bash
pnpm add @mapbox-plugin/sdk-monorepo
```

## 全量引入

```ts
import { createSDK } from '@mapbox-plugin/sdk-monorepo';
```

## 按需引入

```ts
import { HeatmapLayer } from '@mapbox-plugin/sdk-monorepo/heatmap';
import { AOILayerManager } from '@mapbox-plugin/sdk-monorepo/aoilayer';
```
