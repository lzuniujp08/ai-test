# 开发指南

## 环境搭建

```bash
pnpm install
pnpm run dev
```

## 添加新模块

1. 在 `packages/<new-module>` 创建 `package.json` 与 `src/index.js`。
2. 在 `rollup.config.js` 增加独立构建 entry。
3. 在 `src/index.js` 聚合导出。

## 测试与贡献

```bash
pnpm run test
pnpm run lint
pnpm run build:lib
```
