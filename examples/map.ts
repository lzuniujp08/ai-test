import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const initMap = (containerId: string) => {
  mapboxgl.accessToken =
    (window as typeof window & { MAPBOX_TOKEN?: string }).MAPBOX_TOKEN ||
    'pk.eyJ1IjoiZGVtbyIsImEiOiJjbHp1M3gyeHAwMDF5Mmlxcm8xbjVxYzVjIn0.placeholder';

  return new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [116.39, 39.9],
    zoom: 9,
  });
};
