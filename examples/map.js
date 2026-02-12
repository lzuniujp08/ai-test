export const CONFIG = {
  map: {
    container: "map",
    center: [113.935214, 22.527719], // 深圳
    zoom: 9,
    minZoom: 3,
    maxZoom: 22,
  },
  env: "sit", // 测试环境
};

export const initMap = async (containerId = 'map') => {
  const sdkScript = document.createElement('script');
  sdkScript.async = false;
  sdkScript.src = 'https://lbs.sit.sf-express.com/api/map?v=3.0&ak=a20f98e395194f548443e34722eff7ef';
  document.body.appendChild(sdkScript);

  return new Promise(resolve => {
    sdkScript.onload = () => {
      const map = new SFMap.Map({
        container: containerId || CONFIG.map.container,
        center: CONFIG.map.center,
        zoom: CONFIG.map.zoom,
        minZoom: CONFIG.map.minZoom,
        maxZoom: CONFIG.map.maxZoom,
      });
      map.on('load', () => {
        resolve(map);
      })
    }
  })
};
