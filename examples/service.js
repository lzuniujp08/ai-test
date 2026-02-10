import { fetchMapData } from '../packages/service/src/index.js';
import { initMap } from './map.js';

initMap('map');

fetchMapData({ endpoint: '/api/map/tiles', token: 'demo-token' }).then((res) => {
  const output = document.getElementById('output');
  if (output) {
    output.textContent = JSON.stringify(res, null, 2);
  }
});
