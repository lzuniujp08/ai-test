import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'SFMap SDK3 Plugin',
  description: 'Rollup + JavaScript Mapbox GL JS plugin SDK',
  themeConfig: {
    nav: [
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'API', link: '/api/admin' },
      { text: '示例', link: '/examples/admin' },
      { text: '开发指南', link: '/guide/development' },
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '核心概念', link: '/guide/core-concepts' },
        { text: '开发指南', link: '/guide/development' },
      ],
      '/api/': [
        { text: 'Admin', link: '/api/admin' },
        { text: 'Service', link: '/api/service' },
        { text: 'Heatmap', link: '/api/heatmap' },
        { text: 'AOILayer', link: '/api/aoilayer' },
      ],
      '/examples/': [
        { text: 'Admin 示例', link: '/examples/admin' },
        { text: 'Service 示例', link: '/examples/service' },
        { text: 'Heatmap 示例', link: '/examples/heatmap' },
        { text: 'AOILayer 示例', link: '/examples/aoilayer' },
      ],
    },
  },
});
