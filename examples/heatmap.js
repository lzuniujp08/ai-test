import { HeatmapPlugin } from '../packages/heatmap/src/index.js';
import { initMap } from './map.js';
const { createApp, ref, onMounted }  = Vue;
const app = createApp({
  setup() {
    const initialized = ref(false);
    const heatmapPlugin = ref(null);
    const map = ref(null);

    const layerIndex = ref(3);
    const type = ref(3);
    const zoneCode = ref('');
    const opacity = ref(0.8);

    const cities = [
      { name: '深圳', code: '755', center: [113.93, 22.54], zoom: 12 },
      { name: '广州', code: '020', center: [113.26, 23.13], zoom: 12 },
      { name: '上海', code: '021', center: [121.47, 31.23], zoom: 12 },
      { name: '北京', code: '010', center: [116.40, 39.90], zoom: 12 }
    ];

    const init = async () => {
      map.value = await initMap('map');

      heatmapPlugin.value = new HeatmapPlugin(map.value, {
        cityCode: '755',
        layerIndex: 3,
        type: 3,
        env: 'prod',
        opacity: 0.8,
        minZoom: 8,
        maxZoom: 22,
        loadCallback: (info) => {
          log('热力图插件初始化完成', info);
        }
      });

      map.value.flyTo({
        center: [113.93, 22.54],
        zoom: 12,
        bearing: 0,
        pitch: 0
      });

      initialized.value = true;
      log('地图已定位到深圳市');
    };

    const log = (message, data = null) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      console.log(logEntry, data || '');
    };

    const onLayerIndexChange = () => {
      heatmapPlugin.value.setLayerIndex(layerIndex.value);
      log(`切换时间范围: ${HeatmapPlugin.getLayerIndexDescription(layerIndex.value)}`);
    };

    const onTypeChange = () => {
      heatmapPlugin.value.setType(type.value);
      log(`切换业务类型: ${HeatmapPlugin.getTypeDescription(type.value)}`);
    };

    const onZoneCodeKeypress = (e) => {
      if (e.key === 'Enter') {
        const code = e.target.value.trim().toUpperCase();
        if (code) {
          heatmapPlugin.value.setZoneCode(code);
          log(`设置网点编码: ${code}`);
        } else {
          heatmapPlugin.value.setZoneCode('');
          log('清除网点过滤');
        }
      }
    };

    const clearZoneCode = () => {
      zoneCode.value = '';
      heatmapPlugin.value.setZoneCode('');
      log('清除网点过滤');
    };

    const onOpacityChange = () => {
      heatmapPlugin.value.setOpacity(opacity.value);
    };

    const showHeatmap = () => {
      heatmapPlugin.value.show();
      log('热力图已显示');
    };

    const hideHeatmap = () => {
      heatmapPlugin.value.hide();
      log('热力图已隐藏');
    };

    const toggleHeatmap = () => {
      heatmapPlugin.value.toggle();
      log(heatmapPlugin.value.isVisible ? '热力图已显示' : '热力图已隐藏');
    };

    const refreshHeatmap = () => {
      heatmapPlugin.value.refresh();
      log('热力图已刷新');
    };

    const showParams = () => {
      const params = heatmapPlugin.value.getParams();
      log('当前参数:', params);
    };

    const showWmsUrl = () => {
      const url = heatmapPlugin.value.getWmsUrl();
      log('当前WMS URL:', url);
    };

    const showLayerIndex = () => {
      const index = HeatmapPlugin.getLayerIndexByCityCode('755');
      log('深圳分片索引:', index);
    };

    const switchCity = (city) => {
      heatmapPlugin.value.setCityCode(city.code);
      map.value.flyTo({
        center: city.center,
        zoom: city.zoom,
        duration: 1000
      });
      log(`切换到${city.name}，城市编码: ${city.code}，分片索引: ${HeatmapPlugin.getLayerIndexByCityCode(city.code)}`);
    };

    const destroyPlugin = () => {
      if (confirm('确定要销毁插件吗？')) {
        heatmapPlugin.value.destroy();
        heatmapPlugin.value = null;
        log('插件已销毁');
      }
    };

    onMounted(() => {
      init();
    });

    return {
      initialized,
      layerIndex,
      type,
      zoneCode,
      opacity,
      cities,
      onLayerIndexChange,
      onTypeChange,
      onZoneCodeKeypress,
      clearZoneCode,
      onOpacityChange,
      showHeatmap,
      hideHeatmap,
      toggleHeatmap,
      refreshHeatmap,
      showParams,
      showWmsUrl,
      showLayerIndex,
      switchCity,
      destroyPlugin
    };
  }
});

app.mount('#app');
