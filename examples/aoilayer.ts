import { AOILayerManager } from '../packages/aoilayer/src';
import { initMap } from './map';

initMap('map');

const manager = new AOILayerManager();
manager.draw({
  id: 'aoi-1',
  name: '天安门周边',
  polygon: [
    [116.38, 39.89],
    [116.41, 39.89],
    [116.41, 39.91],
    [116.38, 39.91],
  ],
});

const output = document.getElementById('output');
if (output) {
  output.textContent = JSON.stringify(manager.query('aoi-1'), null, 2);
}
