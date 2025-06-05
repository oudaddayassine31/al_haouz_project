import React, { useState, useEffect, useRef } from "react";
import { Card } from "./components/ui/card";
import { AlertCircle, Map, Info, Filter, RotateCcw } from "lucide-react";
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
  const [selectedZone, setSelectedZone] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [buildingStats, setBuildingStats] = useState(null);
  const [filterDamage, setFilterDamage] = useState('all');
  const [buildingsData, setBuildingsData] = useState(null);
  const [showGuide, setShowGuide] = useState(true); 

  // Reset filter when zone changes
  useEffect(() => {
    setFilterDamage('all');
  }, [selectedZone]);

  const loadAllZones = async () => {
    try {
      for (const [zoneName, zone] of Object.entries(ZONES)) {
        const boundaryResponse = await fetch(zone.boundaryPath);
        const boundaryData = await boundaryResponse.json();

        if (!map.current) return;

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
      mapboxgl.accessToken = 'pk.eyJ1IjoieWFzc2luZW91ZGFkZGEiLCJhIjoiY21iamNhaGluMGdoZzJrcXRlbnFsbzduciJ9.I4aFMRMF_hhDW4rP5XKqsQ';
      
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-8.1938, 30.9900],
        zoom: 6,
        pitch: 45
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      map.current.on('load', loadAllZones);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const calculateStats = (data) => {
    const stats = {
      total: data.features.length,
      damage: data.features.filter(f => f.properties.degat === 'Damage').length,
      possible: data.features.filter(f =>  f.properties.degat === 'Possible damage').length,
      untouched: data.features.filter(f => f.properties.degat === 'pas touché').length
    };
    setBuildingStats(stats);
  };

  // Effect to update map when filter changes
  useEffect(() => {
    if (buildingsData && map.current) {
      const filteredData = {
        ...buildingsData,
        features: buildingsData.features.filter(f => {
          if (filterDamage === 'all') return true;
          return f.properties.degat === filterDamage;
        })
      };

      if (map.current.getSource('buildings')) {
        map.current.getSource('buildings').setData(filteredData);
      }
    }
  }, [filterDamage, buildingsData]);

  const loadBuildingsForZone = async (zoneName) => {
    if (!zoneName) return;
    try {
      const zone = ZONES[zoneName];

      if (map.current.getLayer('buildings-damage')) {
        map.current.removeLayer('buildings-damage');
      }
      if (map.current.getSource('buildings')) {
        map.current.removeSource('buildings');
      }

      const buildingsResponse = await fetch(zone.buildingsPath);
      if (!buildingsResponse.ok) {
        throw new Error(`HTTP error! status: ${buildingsResponse.status}`);
      }

      const data = await buildingsResponse.json();
      setBuildingsData(data);
      calculateStats(data);

      const filteredData = {
        ...data,
        features: data.features.filter(f => {
          if (filterDamage === 'all') return true;
          return f.properties.degat === filterDamage;
        })
      };

      map.current.addSource('buildings', {
        type: 'geojson',
        data: filteredData
      });

      map.current.addLayer({
        'id': 'buildings-damage',
        'type': 'fill-extrusion',
        'source': 'buildings',
        'paint': {
          'fill-extrusion-color': [
            'case',
            ['==', ['get', 'degat'], 'Damage'], DAMAGE_COLORS['Damage'],
            ['match', ['get', 'degat'], 'Possible damage', DAMAGE_COLORS['Possible damage'],
            DAMAGE_COLORS['pas touché']]
          ],
          'fill-extrusion-height': 3,
          'fill-extrusion-opacity': 0.8
        }
      });

      map.current.flyTo({
        center: zone.center,
        zoom: 13,
        duration: 2000
      });

    } catch (error) {
      console.error('Error loading buildings:', error);
      alert(`Erreur lors du chargement des bâtiments pour ${zoneName}`);
    }
  };

  const resetView = () => {
    // Reset map view
    if (map.current) {
      map.current.flyTo({
        center: [-8.1938, 30.9900],
        zoom: 6,
        pitch: 45,
        duration: 2000
      });
    }

    // Reset state
    setBuildingStats(null);
    setSelectedZone('');
    setFilterDamage('all');

    // Remove building layer
    if (map.current?.getLayer('buildings-damage')) {
      map.current.removeLayer('buildings-damage');
    }
    if (map.current?.getSource('buildings')) {
      map.current.removeSource('buildings');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="h-[calc(100vh-8rem)] bg-white relative">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold mb-1">Analyse Des Dégâts</h2>
              <p className="text-sm text-gray-600">Sélectionnez une zone pour visualiser les dégâts des bâtiments</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative">
              <select
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  loadBuildingsForZone(e.target.value);
                  setIsFirstVisit(false);
                }}
                className="w-56 pl-4 pr-8 py-2.5 bg-white border-2 border-blue-100 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           hover:border-blue-200 transition-all text-gray-700"
              >
                <option value="">Sélectionner une zone</option>
                {Object.keys(ZONES).map((zoneName) => (
                  <option key={zoneName} value={zoneName}>{zoneName}</option>
                ))}
              </select>
            </div>

            <select
              value={filterDamage}
              onChange={(e) => {
                setFilterDamage(e.target.value);
              }}
              className="w-44 px-3 py-2.5 bg-white border-2 border-gray-100 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-200"
              disabled={!selectedZone}
            >
              <option value="all">Tous les bâtiments</option>
              <option value="Damage">Endommagés</option>
              <option value="Possible damage">Possiblement endommagés</option>
              <option value="pas touché">Non touchés</option>
            </select>

            <button
              onClick={resetView}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Réinitialiser la vue"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {buildingStats && selectedZone && (
          <div className="absolute top-24 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur p-4 w-64">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Statistiques - {selectedZone}</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total des bâtiments:</span>
                  <span className="font-medium">{buildingStats.total}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="text-sm">Endommagés:</span>
                  <span className="font-medium">{buildingStats.damage}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span className="text-sm">Possiblement endommagés:</span>
                  <span className="font-medium">{buildingStats.possible}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Non touchés:</span>
                  <span className="font-medium">{buildingStats.untouched}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isFirstVisit && !selectedZone && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-md">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Comment utiliser cette carte</h3>
                <p className="text-sm text-blue-700 mt-1">
                  1. Utilisez le menu déroulant pour sélectionner une zone
                  <br />
                  2. Filtrez les bâtiments selon leur état
                  <br />
                  3. Consultez les statistiques détaillées
                  <br />
                  4. Utilisez le bouton de réinitialisation pour revenir à la vue d'ensemble
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-10">
          <Card className="bg-white/95 backdrop-blur p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold">Légende</h3>
            </div>
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