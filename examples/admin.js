import { AdminToolkit } from '../packages/admin/src/index.js';
import { initMap } from './map.js';

const map = initMap('map');
map.on('load', () => {
  const admin = new AdminToolkit({ map });
  const output = document.getElementById('output');
  if (output) {
    output.textContent = admin.createPanel({ title: 'Map 管理面板', enableInspector: true });
  }
});
