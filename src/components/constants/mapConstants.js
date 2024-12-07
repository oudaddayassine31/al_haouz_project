export const INITIAL_STATE = {
  activePage: "alhaouz",
  mapLayers: {
    communes: true,
    buildings: false
  },
  selectedBuildingCommune: null,
  buildingClassFilters: {
    'Très petit': true,
    'Petit': true,
    'Moyen': true,
    'Grand': true
  },
  overlays: {
    stats: true,
    charts: false
  },
  selectedOption: "Taux de pauvreté"
};

export const MAP_CONFIG = {
  accessToken: 'pk.eyJ1IjoibW9oc3NpbmVib3VoZGEiLCJhIjoiY20zdm13bGpzMHpxYzJsc2ZtZDNwMGVveSJ9.2otT87Si6Z7EB8P2t_rOIg',
  style: 'mapbox://styles/mapbox/satellite-v9',
  initialView: {
    center: [-8.1938, 30.9900],
    zoom: 7,
    pitch: 45
  }
};

export const BUILDING_CLASSES = {
  area: [
    { max: 50, color: '#FFEB3B', label: 'Très petit' },
    { max: 100, color: '#FFA726', label: 'Petit' },
    { max: 200, color: '#EF5350', label: 'Moyen' },
    { max: Infinity, color: '#212121', label: 'Grand' }
  ]
};

export const communeCoordinates = {
  'Abadou': [-7.308, 31.588],
  'Ait Ourir': [-7.672, 31.561],
  // ... le reste des coordonnées
};