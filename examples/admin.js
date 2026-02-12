import { AdminPlugin } from '../packages/admin/src/index.js';
import { initMap } from './map.js';
const { createApp, ref, reactive, computed, onMounted }  = Vue;

// 行政区划编码常量
const ADCODE_PROVINCES = [
  '110000', // 北京
  '310000', // 上海
  '440000', // 广东
  '330000', // 浙江
  '320000', // 江苏
  '370000', // 山东
  '410000', // 河南
  '420000', // 湖北
  '430000', // 湖南
  '510000', // 四川
];

const ADCODE_CITIES = [
  '110000', // 北京
  '310000', // 上海
  '440300', // 深圳
  '440100', // 广州
  '330100', // 杭州
  '320500', // 苏州
  '370200', // 青岛
  '410100', // 郑州
  '420100', // 武汉
  '430100', // 长沙
  '510100', // 成都
];

const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#f5222d'];

const LEVEL_MAP = {
  'province': '省级',
  'city': '市级',
  'district': '区级'
};

const DISPLAY_MODES = [
  { value: 'both', label: '多边形+中心' },
  { value: 'polygon', label: '仅多边形' },
  { value: 'center', label: '仅中心点' }
];

// 创建 Vue 应用
const app = createApp({
  setup() {
    // 响应式状态
    const initialized = ref(false);
    const admin = ref(null);
    const map = ref(null);

    const customAdcodes = ref('');
    const currentMode = ref('both');
    const showStats = ref(false);

    const stats = reactive({
      loadedCount: 0,
      highlightCount: 0
    });

    const currentStyle = reactive({
      fillColor: '#1890ff',
      lineColor: '#1890ff'
    });

    const infoPanel = reactive({
      hasData: false,
      data: {}
    });

    const displayModes = computed(() => DISPLAY_MODES);

    /**
     * 初始化地图和插件
     */
    const init = async () => {
      try {
        map.value = await initMap('map');

        admin.value = new AdminPlugin({
          map: map.value,
          env: 'sit',
          defaultStyle: {
            fillColor: '#1890ff',
            fillOpacity: 0.15,
            lineColor: '#1890ff',
            lineWidth: 2,
            lineOpacity: 1,
          },
          highlightStyle: {
            fillColor: '#ff4d4f',
            fillOpacity: 0.25,
            lineColor: '#ff4d4f',
            lineWidth: 3,
          },
          displayMode: 'both',
        });

        bindEvents();
        await loadProvinces();

        initialized.value = true;
        console.log('✅ AdminPlugin 初始化成功');
      } catch (error) {
        console.error('❌ 初始化失败:', error);
      }
    };

    /**
     * 绑定插件事件
     */
    const bindEvents = () => {
      admin.value.on('featureClick', (e) => {
        console.log('点击行政区划:', e);
        updateInfoPanel(e.data, e.adcode, '点击');
      });

      admin.value.on('featureMouseOver', (e) => {
        updateInfoPanel(e.data, e.adcode, '悬停');
      });
    };

    /**
     * 更新信息面板
     */
    const updateInfoPanel = (data, adcode, action) => {
      infoPanel.hasData = true;
      infoPanel.data = {
        action: { label: '操作', value: action },
        name: { label: '名称', value: data.name || '未知' },
        adcode: { label: '编码', value: adcode },
        level: { label: '级别', value: LEVEL_MAP[data.level] || data.level || '未知' },
        parent: { label: '父编码', value: data.adcodeP || '无' }
      };

      if (data.centerx && data.centery) {
        infoPanel.data.center = {
          label: '中心点',
          value: `${parseFloat(data.centerx).toFixed(4)}, ${parseFloat(data.centery).toFixed(4)}`
        };
      }
    };

    /**
     * 加载省级行政区划
     */
    const loadProvinces = async () => {
      if (!admin.value) return;

      try {
        console.log('🔄 加载省级行政区划...');
        const features = await admin.value.addDistricts(ADCODE_PROVINCES, {
          style: {
            fillColor: '#52c41a',
            lineColor: '#52c41a',
          },
          loadedCallback: (data) => {
            console.log(`✅ 成功加载 ${data.length} 个省级行政区划`);
            updateStats();
          }
        });

        currentStyle.fillColor = '#52c41a';
        currentStyle.lineColor = '#52c41a';

        if (features && features.length > 0 && features[0].bbox) {
          map.value.fitBounds(features[0].bbox, { padding: 50 });
        }
      } catch (error) {
        console.error('❌ 加载失败:', error);
      }
    };

    /**
     * 加载市级行政区划
     */
    const loadCities = async () => {
      if (!admin.value) return;

      try {
        console.log('🔄 加载市级行政区划...');
        const features = await admin.value.addDistricts(ADCODE_CITIES, {
          style: {
            fillColor: '#722ed1',
            lineColor: '#722ed1',
          },
          loadedCallback: (data) => {
            console.log(`✅ 成功加载 ${data.length} 个市级行政区划`);
            updateStats();
          }
        });

        currentStyle.fillColor = '#722ed1';
        currentStyle.lineColor = '#722ed1';

        map.value.flyTo({
          center: [104.5, 35.5],
          zoom: 3.5,
          duration: 1000
        });
      } catch (error) {
        console.error('❌ 加载失败:', error);
      }
    };

    /**
     * 加载自定义编码
     */
    const loadCustom = async () => {
      if (!admin.value) return;

      const value = customAdcodes.value.trim();
      if (!value) {
        alert('请输入行政区划编码');
        return;
      }

      const adcodes = value.split(',').map(code => code.trim()).filter(Boolean);
      if (adcodes.length === 0) {
        alert('请输入有效的行政区划编码');
        return;
      }

      try {
        console.log('🔄 加载自定义行政区划:', adcodes);
        const features = await admin.value.addDistricts(adcodes, {
          style: {
            fillColor: '#fa8c16',
            lineColor: '#fa8c16',
          },
          loadedCallback: (data) => {
            console.log(`✅ 成功加载 ${data.length} 个行政区划`);
            updateStats();
          }
        });

        currentStyle.fillColor = '#fa8c16';
        currentStyle.lineColor = '#fa8c16';

        if (features && features.length > 0 && features[0].bbox) {
          map.value.fitBounds(features[0].bbox, { padding: 100 });
        }
      } catch (error) {
        console.error('❌ 加载失败:', error);
        alert('加载失败，请检查编码是否正确');
      }
    };

    /**
     * 设置展示模式
     */
    const setMode = (mode) => {
      if (!admin.value) return;
      currentMode.value = mode;
      admin.value.setDisplayMode(mode);
      console.log(`🎨 展示模式切换为: ${mode}`);
    };

    /**
     * 更新样式
     */
    const updateStyles = () => {
      if (!admin.value) return;

      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const features = admin.value.getRenderedFeatures();

      if (features.length === 0) {
        alert('请先加载行政区划数据');
        return;
      }

      const updateCount = Math.min(3, features.length);
      for (let i = 0; i < updateCount; i++) {
        const randomIndex = Math.floor(Math.random() * features.length);
        const adcode = features[randomIndex].adCode;

        admin.value.updateDistrictStyle(adcode, {
          fillColor: randomColor,
          lineColor: randomColor,
          fillOpacity: 0.3,
          lineWidth: 3,
        });
      }

      currentStyle.fillColor = randomColor;
      currentStyle.lineColor = randomColor;

      console.log(`🎨 已更新 ${updateCount} 个区划样式`);
    };

    /**
     * 随机高亮
     */
    const randomHighlight = () => {
      if (!admin.value) return;

      const features = admin.value.getRenderedFeatures();

      if (features.length === 0) {
        alert('请先加载行政区划数据');
        return;
      }

      const highlightCount = Math.floor(Math.random() * 3) + 1;
      const toHighlight = [];

      for (let i = 0; i < highlightCount; i++) {
        const randomIndex = Math.floor(Math.random() * features.length);
        toHighlight.push(features[randomIndex].adCode);
      }

      admin.value.highlightDistricts(toHighlight);
      console.log('✨ 高亮区划:', toHighlight);
      updateStats();
    };

    /**
     * 清除高亮
     */
    const clearHighlight = () => {
      if (!admin.value) return;

      admin.value.clearHighlight();
      console.log('✨ 已清除高亮');
      updateStats();
    };

    /**
     * 清除所有
     */
    const clearAll = () => {
      if (!admin.value) return;

      admin.value.clearAll();
      console.log('🗑️ 已清除所有数据');
      updateStats();

      infoPanel.hasData = false;
      infoPanel.data = {};
    };

    /**
     * 获取统计信息
     */
    const getStats = () => {
      updateStats();
      showStats.value = true;
    };

    /**
     * 更新统计面板
     */
    const updateStats = () => {
      if (!admin.value) return;

      const features = admin.value.getRenderedFeatures();
      stats.loadedCount = features.length;
      stats.highlightCount = 0;
    };

    // 生命周期钩子
    onMounted(() => {
      init();
    });

    return {
      initialized,
      customAdcodes,
      currentMode,
      showStats,
      stats,
      currentStyle,
      infoPanel,
      displayModes,
      loadProvinces,
      loadCities,
      loadCustom,
      setMode,
      updateStyles,
      randomHighlight,
      clearHighlight,
      clearAll,
      getStats
    };
  }
});

app.mount('#app');
