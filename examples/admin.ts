import { AdminToolkit } from '../packages/admin/src';
import { initMap } from './map';

const map = initMap('map');
map.on('load', () => {
  const admin = new AdminToolkit({ map: map as never });
  const output = document.getElementById('output');
  if (output) {
    output.textContent = admin.createPanel({ title: 'Map 管理面板', enableInspector: true });
  }
});
