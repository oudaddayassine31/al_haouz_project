import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon} from '@heroicons/react/20/solid';

const MAP_STYLES = {
  'Standard': 'mapbox://styles/mapbox/standard',
  'Standard Satellite': 'mapbox://styles/mapbox/standard-satellite',
  'Satellite Streets': 'mapbox://styles/mapbox/satellite-streets-v12'
};
// Add the missing communeCoordinates constant
const communeCoordinates = {
  'Abadou': [-7.308, 31.588],
  'Ait Ourir': [-7.672, 31.561],
  'Ait Sidi Daoud': [-7.67, 31.618],
  'Amghras': [-8.177, 31.217],
  'Amizmiz': [-8.248, 31.219],
  'Anougal': [-8.276, 31.108],
  'Asni': [-7.92, 31.175],
  'Azgour': [-8.359, 31.13],
  'Dar Jamaa': [-8.386, 31.252],
  'Ghmate': [-7.79, 31.419],
  'Ighil': [-8.359, 30.999],
  'Iguerferouane': [-7.677, 31.399],
  'Ijoukak': [-8.058, 30.994],
  'Imgdal': [-8.13, 31.103],
  'Lalla Takarkoust': [-8.131, 31.326],
  'Moulay Brahim': [-8.015, 31.319],
  'Oukaimden': [-7.831, 31.219],
  'Oulad Mtaa': [-8.266, 31.326],
  'Ouazguita': [-8.089, 31.259],
  'Ourika': [-7.806, 31.343],
  'Ouirgane': [-8.03, 31.16],
  'Sidi Abdallah Ghiat': [-7.851, 31.522],
  'Sidi Badhaj': [-8.204, 31.331],
  'Sti Fadma': [-7.709, 31.242],
  'Tahannaout': [-7.946, 31.359],
  'Talat N Yaaqoub': [-8.26, 30.955],
  'Tamaguert': [-7.546, 31.547],
  'Tamazouzte': [-7.786, 31.489],
  'Tameslohte': [-8.066, 31.46],
  'Tazart': [-7.394, 31.575],
  'Tidili Mesfioua': [-7.619, 31.477],
  'Tighedouine': [-7.533, 31.355],
  'Tizguine': [-8.318, 31.26],
  'Touama': [-7.483, 31.56],
  'Zerkten': [-7.352, 31.401]
};

const CLASSIFICATION_OPTIONS = {
  'area': {
    title: 'Surface',
    field: 'area_in_meters',
    stops: [
      [0, '#FFE4B5'],
      [100, '#FFA07A'],
      [200, '#FF8C00'],
      [500, '#FF6347']
    ]
  },
  'date': {
    title: 'Date de détection',
    field: 'last_detection_date',
    stops: [
      ['2022-01', '#A8DDB5'],
      ['2022-06', '#7BCCC4'],
      ['2022-12', '#43A2CA'],
      ['2023-01', '#0868AC']
    ]
  },
  'confidence': {
    title: 'Confiance',
    field: 'confidence',
    stops: [
      [0.5, '#FED976'],
      [0.7, '#FEB24C'],
      [0.85, '#FD8D3C'],
      [1, '#E31A1C']
    ]
  }
};

export default function BatimentDashboard() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('Standard Satellite');
  const [selectedClassification, setSelectedClassification] = useState('area');
  const [layersVisible, setLayersVisible] = useState({
    buildings: true,
    communes: false
  });

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9oc3NpbmVib3VoZGEiLCJhIjoiY20zdm13bGpzMHpxYzJsc2ZtZDNwMGVveSJ9.2otT87Si6Z7EB8P2t_rOIg';

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[selectedStyle],
        center: [-8.1938, 30.9900],
        zoom: 9,
        pitch: 45,
        bearing: 0
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      map.current.on('load', () => {
        map.current.isLoaded = true;
        loadCommuneBoundaries();
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Modified loadBuildingsForCommune function with better error handling
  const loadBuildingsForCommune = async (communeName) => {
    if (!map.current?.isLoaded) return;

    try {
      // Clean up existing layers
      ['buildings-3d'].forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      if (map.current.getSource('buildings')) {
        map.current.removeSource('buildings');
      }

      // First fly to commune
      const coordinates = communeCoordinates[communeName];
      if (coordinates) {
        map.current.flyTo({
          center: coordinates,
          zoom: 15,
          duration: 2000
        });
      }

      // Load building data
      const response = await fetch(`/src/assets/data/buildings/before/${communeName}.geojson`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Validate GeoJSON data
      if (!data.features || !Array.isArray(data.features)) {
        throw new Error('Invalid GeoJSON data structure');
      }

      // Add source after validation
      map.current.addSource('buildings', {
        type: 'geojson',
        data: data
      });

      const classificationConfig = CLASSIFICATION_OPTIONS[selectedClassification];

      // Add the 3D building layer
      map.current.addLayer({
        'id': 'buildings-3d',
        'type': 'fill-extrusion',
        'source': 'buildings',
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', classificationConfig.field],
            ...classificationConfig.stops.flat()
          ],
          'fill-extrusion-height': 3,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.8
        }
      });

      // Add click handler for popups
      map.current.on('click', 'buildings-3d', (e) => {
        if (!e.features.length) return;

        const feature = e.features[0];
        const coordinates = e.lngLat;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold mb-2">Détails du bâtiment</h3>
              <p>Surface: ${Math.round(feature.properties.area_in_meters)} m²</p>
              <p>Confiance: ${Math.round(feature.properties.confidence * 100)}%</p>
              <p>Détection: ${feature.properties.last_detection_date}</p>
            </div>
          `)
          .addTo(map.current);
      });

      // Add hover effects
      map.current.on('mouseenter', 'buildings-3d', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'buildings-3d', () => {
        map.current.getCanvas().style.cursor = '';
      });

    } catch (error) {
      console.error('Error loading buildings:', error);
      // You might want to show this error to the user
      alert(`Erreur lors du chargement des bâtiments pour ${communeName}`);
    }
  };

  const changeMapStyle = (style) => {
    setSelectedStyle(style);
    if (map.current) {
      map.current.setStyle(MAP_STYLES[style]);
      
      // Wait for the style to load before reloading layers
      map.current.once('style.load', () => {
        loadCommuneBoundaries();
        if (selectedCommune) {
          loadBuildingsForCommune(selectedCommune);
        }
      });
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {/* Commune Selection */}
        <Menu as="div" className="relative">
          <Menu.Button className="w-64 inline-flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
            <span>{selectedCommune || 'Sélectionner une commune'}</span>
            <ChevronDownIcon className="h-5 w-5" />
          </Menu.Button>
          <Menu.Items className="absolute mt-1 w-64 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {Object.keys(communeCoordinates).map((commune) => (
              <Menu.Item key={commune}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full px-4 py-2 text-left`}
                    onClick={() => {
                      setSelectedCommune(commune);
                      loadBuildingsForCommune(commune);
                    }}
                  >
                    {commune}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>

        {/* Map Style Selection */}
        <Menu as="div" className="relative">
          <Menu.Button className="w-64 inline-flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
            <span>Style: {selectedStyle}</span>
            <ChevronDownIcon className="h-5 w-5" />
          </Menu.Button>
          <Menu.Items className="absolute mt-1 w-64 bg-white rounded-lg shadow-lg">
            {Object.keys(MAP_STYLES).map((style) => (
              <Menu.Item key={style}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full px-4 py-2 text-left`}
                    onClick={() => changeMapStyle(style)}
                  >
                    {style}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>

        {/* Classification Selection */}
        <Menu as="div" className="relative">
          <Menu.Button className="w-64 inline-flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow">
            <span>Classification: {CLASSIFICATION_OPTIONS[selectedClassification].title}</span>
            <ChevronDownIcon className="h-5 w-5" />
          </Menu.Button>
          <Menu.Items className="absolute mt-1 w-64 bg-white rounded-lg shadow-lg">
            {Object.entries(CLASSIFICATION_OPTIONS).map(([key, value]) => (
              <Menu.Item key={key}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full px-4 py-2 text-left`}
                    onClick={() => {
                      setSelectedClassification(key);
                      if (selectedCommune) {
                        loadBuildingsForCommune(selectedCommune);
                      }
                    }}
                  >
                    {value.title}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>

        {/* Layer Toggle Buttons */}
        <div className="space-y-2">
          <button
            className={`w-64 px-4 py-2 rounded-lg shadow ${
              layersVisible.buildings ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
            onClick={() => toggleLayer('buildings')}
          >
            {layersVisible.buildings ? 'Masquer' : 'Afficher'} les bâtiments
          </button>
          <button
            className={`w-64 px-4 py-2 rounded-lg shadow ${
              layersVisible.communes ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
            onClick={() => toggleLayer('communes')}
          >
            {layersVisible.communes ? 'Masquer' : 'Afficher'} les communes
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}