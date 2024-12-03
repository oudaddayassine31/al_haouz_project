import React, { useState, useEffect, useRef } from "react";
import { Card } from "./components/ui/card";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const ZONES = {
  'Adebdi': {
    center: [-8.4642, 30.7765],
    buildingsPath: './src/assets/data/dega/Adebdi_avec_degats.geojson',
    boundaryPath: './src/assets/data/dega/zonne/Adebdi.geojson'
  },
  'Chichaoua': {
    center: [-8.7790, 31.5277],
    buildingsPath: './src/assets/data/dega/chichaoua_avec_degats.geojson',
    boundaryPath: './src/assets/data/dega/zonne/chichoua.geojson'
  },
  'Lalla Aziza': {
    center: [-8.6106, 31.0873],
    buildingsPath: './src/assets/data/dega/lallaAziza_avec_degats.geojson',
    boundaryPath: './src/assets/data/dega/zonne/lallaAziza.geojson'
  },
  'Marrakech': {
    center: [-8.0089, 31.6295],
    buildingsPath: './src/assets/data/dega/marrakech_avec_degats.geojson',
    boundaryPath: './src/assets/data/dega/zonne/marrakech.geojson'
  },
  'Taroudant': {
    center: [-8.8767, 30.4709],
    buildingsPath: './src/assets/data/dega/Taroudant_avec_degats.geojson',
    boundaryPath: './src/assets/data/dega/zonne/Taroudant.geojson'
  }
};

const DAMAGE_COLORS = {
  'Damage': '#FF4444',
  'Possible damage': '#FFEB3B',
  'pas touché': '#4CAF50'
};

export default function AnalyseDeDegat() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Fonction pour charger toutes les zones
  const loadAllZones = async () => {
    try {
      for (const [zoneName, zone] of Object.entries(ZONES)) {
        const boundaryResponse = await fetch(zone.boundaryPath);
        const boundaryData = await boundaryResponse.json();

        map.current.addSource(`zone-${zoneName}`, {
          type: 'geojson',
          data: boundaryData
        });

        map.current.addLayer({
          'id': `zone-boundary-${zoneName}`,
          'type': 'fill',
          'source': `zone-${zoneName}`,
          'paint': {
            'fill-color': '#ffffff',
            'fill-opacity': 0.5,
            'fill-outline-color': '#000000'
          }
        });
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  useEffect(() => {
    if (!map.current && mapRef.current) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibW9oc3NpbmVib3VoZGEiLCJhIjoiY20zdm13bGpzMHpxYzJsc2ZtZDNwMGVveSJ9.2otT87Si6Z7EB8P2t_rOIg';
      
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-8.1938, 30.9900],
        zoom: 6,  // Zoom initial plus éloigné
        pitch: 45
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      map.current.on('load', () => {
        loadAllZones();  // Charger toutes les zones dès le début
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const loadBuildingsForZone = async (zoneName) => {
    try {
      const zone = ZONES[zoneName];

      // Supprimer la couche des bâtiments précédente si elle existe
      if (map.current.getLayer('buildings-damage')) {
        map.current.removeLayer('buildings-damage');
      }
      if (map.current.getSource('buildings')) {
        map.current.removeSource('buildings');
      }

      // Charger les nouveaux bâtiments
      const buildingsResponse = await fetch(zone.buildingsPath);
      if (!buildingsResponse.ok) {
        throw new Error(`HTTP error! status: ${buildingsResponse.status}`);
      }
      const buildingsData = await buildingsResponse.json();

      map.current.addSource('buildings', {
        type: 'geojson',
        data: buildingsData
      });

      map.current.addLayer({
        'id': 'buildings-damage',
        'type': 'fill-extrusion',
        'source': 'buildings',
        'paint': {
          'fill-extrusion-color': [
            'match',
            ['get', 'degat'],
            'Damage', DAMAGE_COLORS['Damage'],
            
            'Possible damage', DAMAGE_COLORS['Possible damage'],
            'pas touché', DAMAGE_COLORS['pas touché'],
            '#000000'
          ],
          'fill-extrusion-height': 3,
          'fill-extrusion-opacity': 0.8
        }
      });

      // Zoom sur la zone
      map.current.flyTo({
        center: zone.center,
        zoom: 13,  // Zoom réduit de 1 niveau
        duration: 2000
      });

    } catch (error) {
      console.error('Error loading buildings:', error);
      alert(`Erreur lors du chargement des bâtiments pour ${zoneName}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="h-[calc(100vh-8rem)] bg-white relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Analyse Des Dégâts</h2>
          <div className="flex gap-2">
            {Object.keys(ZONES).map((zoneName) => (
              <button
                key={zoneName}
                onClick={() => {
                  setSelectedZone(zoneName);
                  loadBuildingsForZone(zoneName);
                }}
                className={`px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm
                  ${selectedZone === zoneName 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                {zoneName}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="bg-white/90 backdrop-blur p-4">
            <h3 className="text-sm font-semibold mb-2">Légende</h3>
            <div className="space-y-2">
              {Object.entries(DAMAGE_COLORS).map(([damage, color]) => (
                <div key={damage} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-600">{damage}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div ref={mapRef} className="h-[calc(100%-60px)]" />
      </Card>
    </div>
  );
}