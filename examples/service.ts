import { fetchMapData } from '../packages/service/src';
import { initMap } from './map';

initMap('map');

fetchMapData({ endpoint: '/api/map/tiles', token: 'demo-token' }).then((res) => {
  const output = document.getElementById('output');
  if (output) {
    output.textContent = JSON.stringify(res, null, 2);
  }
});
