import { AOILayerPlugin } from '../packages/aoilayer/src/index.js';
import { initMap } from './map.js';
const { createApp, ref, onMounted }  = Vue;

const app = createApp({
  setup() {
    const initialized = ref(false);
    const aoiPlugin = ref(null);
    const map = ref(null);

    const init = async () => {
      map.value = await initMap('map');

      aoiPlugin.value = new AOILayerPlugin({
        map: map.value,
        appId: "EOS-PMS-CORE",
        appSecret: "orioncloudEOSPMSCORESecret",
        env: "prod",
        password: "**Map159357",
        token: "f52e5336-d134-4009-97f0-d33beab669a0",
        username: "01383467",
        cityCode: '755',
        znoCode: '755AA',
        type: 'aoi',
        codeField: 'aoi_code',
        minZoom: 13,
        maxZoom: 22,
        multiSelect: false,
        isLabel: true,
        isFitOnAdd: true,

        defaultStyle: {
          fillColor: "#0085ff",
          fillOpacity: 0.1,
          strokeColor: "#0085ff",
          strokeOpacity: 1,
          strokeWidth: 1,
        },
        defaultHighLightStyle: {
          fillColor: "#ff6b35",
          fillOpacity: 0.4,
          strokeColor: "#ff6b35",
          strokeOpacity: 1,
          strokeWidth: 2,
        },
        defaultLabelStyle: {
          property: "label",
          fillColor: "#0085ff",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeOpacity: 1,
          strokeWidth: 1,
        },

        loadedCallback: () => {
          log('AOI图层加载完成');
        },
        clickCallback: (e) => {
          log('AOI点击:', e);
        },
        boxEndedCallback: (e) => {
          log(`框选完成，选中 ${e.data?.length || 0} 个AOI`);
        }
      });

      initialized.value = true;
      log('AOI插件初始化完成');
    };

    const hideLayer = () => {
      aoiPlugin.value?.hide();
      log('图层已隐藏');
    };

    const showLayer = () => {
      aoiPlugin.value?.show();
      log('图层已显示');
    };

    const fitToCity = () => {
      aoiPlugin.value?.fit('cityCode', ['755']);
      log('定位到深圳');
    };

    const fitToZno = () => {
      aoiPlugin.value?.fit('znoCode', ['755AA']);
      log('定位到网点 755AA');
    };

    const mergeByAoiIds = () => {
      if (!aoiPlugin.value) return;

      const aoiIds = [
        '62556EAF14821B9DE0530EF4520A0CFC',
        '62556EAEF6B51B9DE0530EF4520A0CFC'
      ];

      log('开始根据AOIID合并...');
      aoiPlugin.value.mergeAoisByAoiIds({
        aoiIds,
        isFit: true,
        showOnMap: true,
        color: '#ff4d4f',
        callback: (result) => {
          if (result.success) {
            log('合并成功:', {
              center: result.center,
              wkt: result.wkt?.substring(0, 50) + '...'
            });
          } else {
            log('合并失败:', result.message);
          }
        }
      });
    };

    const mergeByAoiCodes = () => {
      if (!aoiPlugin.value) return;

      const aoiCodes = ['755BK000029', '755BK000104', '755BK000051'];

      log('开始根据AOICODE合并...');
      aoiPlugin.value.mergeAoisByAoiCodes({
        aoiCodes,
        isCheck: true,
        isFit: true,
        showOnMap: true,
        color: '#eb2f96',
        callback: (result) => {
          if (result.success) {
            log('合并成功:', {
              center: result.center,
              wkt: result.wkt?.substring(0, 50) + '...'
            });
          } else {
            log('合并失败:', result.message);
          }
        }
      });
    };

    const mergeByZnoCodes = () => {
      if (!aoiPlugin.value) return;

      const znoCodes = ['755BK'];

      log('开始根据网点编码合并...');
      aoiPlugin.value.showZnoByCodes({
        znoCodes,
        isFit: true,
        showOnMap: true,
        color: '#13c2c2',
        callback: (result) => {
          if (result.success) {
            log('查询成功:', result);
          } else {
            log('查询失败:', result.message);
          }
        }
      });
    };

    const snapToAoi = () => {
      if (!aoiPlugin.value) return;

      const wkt = 'POLYGON((113.93 22.52, 113.95 22.52, 113.95 22.54, 113.93 22.54, 113.93 22.52))';

      log('开始多边形吸附...');
      aoiPlugin.value.snapToAoi({
        wkt,
        isFit: true,
        showOnMap: true,
        color: {
          before: '#BC6FF1',
          after: '#ff983f'
        },
        callback: (result) => {
          if (result.success) {
            log('吸附成功:', {
              center: result.center,
              aoiCount: result.aoiInfos?.length || 0
            });
          } else {
            log('吸附失败:', result.message);
          }
        }
      });
    };

    const beginDrawBox = () => {
      aoiPlugin.value?.beginDrawBox();
      log('请使用鼠标在地图上拉框选择AOI');
    };

    const highlightByCodes = () => {
      if (!aoiPlugin.value) return;

      const codes = ['755FG000065', '755FG000115'];

      const highlightStyles = [
        {
          codes: ['755FG000065'],
          style: {
            fillColor: '#ff0000',
            fillOpacity: 0.3,
            strokeColor: '#ff0000',
            strokeOpacity: 1,
            strokeWidth: 2,
          },
        },
        {
          codes: ['755FG000115'],
          style: {
            fillColor: '#d946ef',
            fillOpacity: 0.3,
            strokeColor: '#d946ef',
            strokeOpacity: 1,
            strokeWidth: 2,
          },
        },
      ];

      aoiPlugin.value.setHighLightStyles(highlightStyles);
      aoiPlugin.value.highLightByCodes(codes);
      log(`高亮 ${codes.length} 个AOI`);
    };

    const clearHighlight = () => {
      aoiPlugin.value?.clearHighLight();
      log('高亮已清除');
    };

    const clearVector = () => {
      aoiPlugin.value?.clearVector();
      log('矢量数据已清除');
    };

    const removeLayer = () => {
      aoiPlugin.value?.remove();
      log('图层已移除');
    };

    const log = (message, data = null) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      console.log(logEntry, data || '');
    };

    onMounted(() => {
      init();
    });

    return {
      initialized,
      hideLayer,
      showLayer,
      fitToCity,
      fitToZno,
      mergeByAoiIds,
      mergeByAoiCodes,
      mergeByZnoCodes,
      snapToAoi,
      beginDrawBox,
      highlightByCodes,
      clearHighlight,
      clearVector,
      removeLayer
    };
  }
});

app.mount('#app');
