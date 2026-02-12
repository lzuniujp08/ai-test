import { ServicesPlugin } from '../packages/service/src/index.js';
import { initMap } from './map.js';

const { createApp, ref, onMounted }  = Vue;

const app = createApp({
  setup() {
    const initialized = ref(false);
    const services = ref(null);
    const map = ref(null);

    const searchKeyword = ref('');
    const showPoiResults = ref(false);
    const poiResults = ref([]);
    let searchTimeout = null;

    const init = async () => {
      map.value = await initMap('map');

      services.value = new ServicesPlugin({
        map: map.value,
        appId: "EOS-PMS-CORE",
        appSecret: "orioncloudEOSPMSCORESecret",
        env: "prod",
        password: "**Map159357",
        token: "78b11a1f-0234-42eb-b9a7-346f9090773f",
        username: "01383467",
      });

      map.value.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        log(`\n点击地图坐标: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);

        try {
          const result = await services.value.rgeo({
            x: lng,
            y: lat,
            isShowMarker: true,
            isLocate: false
          });
          log('点击位置地址:', result.name);
        } catch (error) {
          log('获取地址失败:', error.message);
        }
      });

      initialized.value = true;
    };

    const log = (message, data = null) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      console.log(logEntry, data || '');
    };

    const testGeo = async () => {
      log('=== 测试地理编码 ===');
      try {
        const result = await services.value.geo({
          address: '深圳市南山区科技园',
          city: '深圳',
          isShowMarker: true,
          isLocate: true
        });
        log('地理编码成功:', {
          address: result.src_address,
          coord: [result.xcoord, result.ycoord]
        });
        return result;
      } catch (error) {
        log('地理编码失败:', error.message);
      }
    };

    const testRgeo = async () => {
      log('\n=== 测试逆地理编码 ===');
      try {
        const result = await services.value.rgeo({
          x: 114.0579,
          y: 22.5431,
          isShowMarker: true,
          isLocate: true
        });
        log('逆地理编码成功:', {
          name: result.name,
          coord: [114.0579, 22.5431]
        });
        return result;
      } catch (error) {
        log('逆地理编码失败:', error.message);
      }
    };

    const testRoute = async () => {
      log('\n=== 测试路径规划 ===');
      try {
        services.value.clear();

        const result = await services.value.route({
          x1: 114.0579,
          y1: 22.5431,
          x2: 114.1179,
          y2: 22.5431,
          type: 0,
          strategy: 0,
          isShowRoute: true,
          isLocate: true
        });
        log('路径规划成功:', {
          distance: `${(result.distance / 1000).toFixed(2)}公里`,
          duration: `${Math.round(result.duration / 60)}分钟`
        });
        return result;
      } catch (error) {
        log('路径规划失败:', error.message);
      }
    };

    const testTip = async () => {
      log('\n=== POI搜索 ===');
      try {
        services.value.clear();

        const results = await services.value.tip({
          q: '地铁站',
          city: '深圳',
          district: '南山区',
          isShow: true,
          isLocate: true
        });
        log(`POI搜索成功，找到 ${results.length} 个结果`);
        results.slice(0, 3).forEach((poi, index) => {
          log(`结果${index + 1}:`, {
            name: poi.name,
            address: poi.detail_addr,
            coord: [poi.xcoord, poi.ycoord]
          });
        });
        return results;
      } catch (error) {
        log('POI搜索失败:', error.message);
      }
    };

    const clearAll = () => {
      services.value.clear();
      log('已清除所有展示');
    };

    const onSearchInput = async () => {
      clearTimeout(searchTimeout);
      const keyword = searchKeyword.value.trim();

      if (keyword.length < 2) {
        showPoiResults.value = false;
        poiResults.value = [];
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const results = await services.value.tip({
            q: keyword,
            city: '深圳',
            isShow: false,
            isLocate: false
          });
          log(`搜索 "${keyword}" 找到 ${results.length} 个结果`);
          poiResults.value = results;
          showPoiResults.value = true;
        } catch (error) {
          log('搜索失败:', error.message);
          showPoiResults.value = false;
        }
      }, 300);
    };

    const selectPoi = (poi) => {
      log(`选择POI: ${poi.name}`, poi);

      services.value.clear();

      const mapboxgl = window.mapboxgl;
      const markerId = `marker-${poi.uid}`;
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${poi.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 3px;">${poi.detail_addr || poi.adname.join('')}</div>
            ${poi.key_prefix ? `<div style="font-size: 12px; color: #999;">${poi.key_prefix}</div>` : ''}
            <div style="font-size: 11px; color: #999; margin-top: 5px;">
              坐标: [${poi.xcoord.toFixed(6)}, ${poi.ycoord.toFixed(6)}]
            </div>
          </div>
        `);

      new mapboxgl.Marker({ color: '#ff4d4f' })
        .setLngLat([poi.xcoord, poi.ycoord])
        .setPopup(popup)
        .addTo(map.value)
        .getElement()
        .id = markerId;

      popup.addTo(map.value);
      map.value.flyTo({
        center: [poi.xcoord, poi.ycoord],
        zoom: 16,
        speed: 0.5,
        curve: 1,
        easing: (t) => t,
      });

      showPoiResults.value = false;
      searchKeyword.value = '';
    };

    onMounted(() => {
      init();
    });

    return {
      initialized,
      searchKeyword,
      showPoiResults,
      poiResults,
      testGeo,
      testRgeo,
      testRoute,
      testTip,
      clearAll,
      onSearchInput,
      selectPoi
    };
  }
});

app.mount('#app');
