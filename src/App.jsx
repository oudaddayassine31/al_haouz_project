import React, { useState, useEffect, useRef } from "react";
import { Card } from "./components/ui/card";
import ReactDOMServer from 'react-dom/server';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Switch, Label } from './components/ToggleSwitch';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { Home, Activity, Image, GitCompare ,BrickWall  } from 'lucide-react';

import SeismeDashboard from "./SeismeDashboard";
import AnalyseDeDegat from './analyseDeDegat';


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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];


export default function Dashboard() {
  // All useState hooks should be declared first
  const [activeView, setActiveView] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Taux de pauvreté");
  const [chartData, setChartData] = useState([]);
  const [communesData, setCommunesData] = useState([]);
  const [activePage, setActivePage] = useState("alhaouz");
  const [mapLayers, setMapLayers] = useState({
    communes: true,
    buildings: false
  });
  const [selectedBuildingCommune, setSelectedBuildingCommune] = useState(null);
  const [overlays, setOverlays] = useState({
    stats: false,
    charts: false
  });

  // All useRef hooks
  const mapRef = useRef(null);
  const map = useRef(null);

  const [previousPage, setPreviousPage] = useState("alhaouz");
  
  const handlePageChange = (pageId) => {
    if (pageId === "satellite-compare") {
      setPreviousPage(activePage); // Store current page before navigation
      window.open("https://oudaddayassine31.github.io/SatelliteCompare/", "_blank");
    } else {
      setActivePage(pageId);
    }
  };



  const BUILDING_CLASSES = {
    area: [
      { max: 50, color: '#FFEB3B', label: 'Très petit' },
      { max: 100, color: '#FFA726', label: 'Petit' },
      { max: 200, color: '#EF5350', label: 'Moyen' },
      { max: Infinity, color: '#212121', label: 'Grand' }
    ]
  };
  
  // Add these new state variables alongside your existing on




  const povertyData = [
    {"name": "Ait Hkim-Ait Yzid", "poverty": 20},
    {"name": "Alt Faska", "poverty": 15.8},
    {"name": "Setti Fadma", "poverty": 13},
    {"name": "Tidili Mesfioua", "poverty": 11.6},
    {"name": "Iguerferouane", "poverty": 11},
    {"name": "Ourika", "poverty": 10.7},
    {"name": "Sidi Badhaj", "poverty": 10.1},
    {"name": "Tidili", "poverty": 9.8},
    {"name": "Tazart", "poverty": 9.3},
    {"name": "Ighil", "poverty": 8.4},
    {"name": "Lalla Takerkoust", "poverty": 7.7},
    {"name": "Touama", "poverty": 7.3},
    {"name": "Tamaguert", "poverty": 6.5},
    {"name": "Asni", "poverty": 6.3},
    {"name": "Amghras", "poverty": 5.7},
    {"name": "Ghmate", "poverty": 4.7},
    {"name": "Sidi Abdallah Ghiat", "poverty": 4.1},
    {"name": "Ouirgane", "poverty": 3.7},
    {"name": "Tazarine", "poverty": 3.1},
    {"name": "Ait Aadel", "poverty": 2.8},
    {"name": "Ait Sidi Daoud", "poverty": 2.7},
    {"name": "Sidi Rahhal", "poverty": 2.5},
    {"name": "Tamazouzte", "property": 2.1},
    {"name": "Talat N'Yaaqoub", "poverty": 1.9},
    {"name": "Ijoukak", "poverty": 1.3},
    {"name": "Ait Ourir", "poverty": 1.1},
    {"name": "Amizmiz", "poverty": 0.9},
    {"name": "Tahanaout", "poverty": 0.5},
    {"name": "Amezmiz", "poverty": 0.4}
  ];

  useEffect(() => {
    if (!map.current && mapRef.current) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibW9oc3NpbmVib3VoZGEiLCJhIjoiY20zdm13bGpzMHpxYzJsc2ZtZDNwMGVveSJ9.2otT87Si6Z7EB8P2t_rOIg';
      
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-8.1938, 30.9900],
        zoom: 7,
        pitch: 45
      });
  
      map.current.addControl(new mapboxgl.NavigationControl());
  
      map.current.on('load', () => {
        loadCommuneBoundaries();
      });
    }
  
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activePage]);

  const loadCommuneBoundaries = async () => {
    try {
      const response = await fetch("./src/assets/data/decoupage_administrative/commune_alhouz.geojson");
      const data = await response.json();
  
      // Keep your existing stats calculation
      setStats(data.features.reduce((acc, feature) => ({
        communes: acc.communes + 1,
        population: acc.population + feature.properties.Population,
        menages: acc.menages + feature.properties.Nb_Menages,
      }), { communes: 0, population: 0, menages: 0 }));
  
      if (!map.current.getSource('communes')) {
        map.current.addSource('communes', {
          type: 'geojson',
          data: data
        });
  
        map.current.addLayer({
          'id': 'communes-fill',
          'type': 'fill',
          'source': 'communes',
          'paint': {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'Population'],
              0, '#f1eef6',
              5000, '#bdc9e1',
              10000, '#74a9cf',
              20000, '#0570b0'
            ],
            'fill-opacity': 0.6
          }
        });
  
        map.current.addLayer({
          'id': 'communes-line',
          'type': 'line',
          'source': 'communes',
          'paint': {
            'line-color': '#000',
            'line-width': 1
          }
        });
  
        map.current.on('click', 'communes-fill', (e) => {
          if (!e.features.length) return;
          
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${feature.properties.Nom_Commun}</h3>
                <p>Population: ${feature.properties.Population.toLocaleString()}</p>
                <p>Ménages: ${feature.properties.Nb_Menages.toLocaleString()}</p>
              </div>
            `)
            .addTo(map.current);
        });
      }
    } catch (error) {
      console.error('Error loading communes:', error);
    }
  };
  
  const buildingFileNames = {
    'Abadou': 'Abadou.geojson',
    'Ait Ourir': 'Ait Ourir.geojson',
    'Ait Sidi Daoud': 'Ait Sidi Daoud.geojson',
    'Amghras': 'Amghras.geojson',
    'Amizmiz': 'Amizmiz.geojson',
    'Anougal': 'Anougal.geojson',
    'Asni': 'Asni.geojson',
    'Azgour': 'Azgour.geojson',
    'Dar Jamaa': 'Dar Jamaa.geojson',
    'Ghmate': 'Ghmate.geojson',
    'Ighil': 'Ighil.geojson',
    'Iguerferouane': 'Iguerferouane.geojson',
    'Ijoukak': 'Ijoukak.geojson',
    'Imgdal': 'Imgdal.geojson',
    'Lalla Takarkoust': 'Lalla Takarkoust.geojson',
    'Moulay Brahim': 'Moulay Brahim.geojson',
    'Oukaimden': 'Oukaimden.geojson',
    'Oulad Mtaa': 'Oulad Mtaa.geojson',
    'Ouazguita': 'Ouazguita.geojson',
    'Ourika': 'Ourika.geojson',
    'Ouirgane': 'Ouirgane.geojson',
    'Sidi Abdallah Ghiat': 'Sidi Abdallah Ghiat.geojson',
    'Sidi Badhaj': 'Sidi Badhaj.geojson',
    'Sti Fadma': 'Sti Fadma.geojson',
    'Tahannaout': 'Tahannaout.geojson',
    'Talat N Yaaqoub': 'Talat N Yaaqoub.geojson',
    'Tamaguert': 'Tamaguert.geojson',
    'Tamazouzte': 'Tamazouzte.geojson',
    'Tameslohte': 'Tameslohte.geojson',
    'Tazart': 'Tazart.geojson',
    'Tidili Mesfioua': 'Tidili Mesfioua.geojson',
    'Tighedouine': 'Tighedouine.geojson',
    'Tizguine': 'Tizguine.geojson',
    'Touama': 'Touama.geojson',
    'Zerkten': 'Zerkten.geojson'
  };
  
  const loadBuildings = async (communeName) => {
    try {
      if (!communeName) {
        alert('Veuillez sélectionner une commune d\'abord');
        return;
      }
  
      // Utiliser le mapping pour récupérer le nom de fichier correct
      const buildingFileName = buildingFileNames[communeName];
      if (!buildingFileName) {
        console.error(`Aucun fichier de données de bâtiments trouvé pour la commune : ${communeName}`);
        return;
      }
  
      const response = await fetch(`./src/assets/data/buildings/before/${buildingFileName}`);
      if (!response.ok) {
        console.error(`Erreur de chargement des bâtiments pour ${communeName} : ${response.status} - ${response.statusText}`);
        return;
      }
  
      const data = await response.json();
  
      if (map.current.getLayer('buildings-3d')) {
        map.current.removeLayer('buildings-3d');
      }
      if (map.current.getSource('buildings')) {
        map.current.removeSource('buildings');
      }
  
      map.current.addSource('buildings', {
        type: 'geojson',
        data: data
      });
  
      map.current.addLayer({
        'id': 'buildings-3d',
        'type': 'fill-extrusion',
        'source': 'buildings',
        'paint': {
          'fill-extrusion-color': [
            'step',
            ['get', 'area_in_meters'],
            BUILDING_CLASSES.area[0].color,
            50, BUILDING_CLASSES.area[1].color,
            100, BUILDING_CLASSES.area[2].color,
            200, BUILDING_CLASSES.area[3].color
          ],
          'fill-extrusion-height': 3,
          'fill-extrusion-opacity': 0.8
        },
        'layout': {
          'visibility': 'visible'
        }
      });
  
      // Automatically enable building layer when loading buildings
      setMapLayers(prev => ({
        ...prev,
        buildings: true
      }));
  
      // Fly to the buildings
      const communeCoords = communeCoordinates[communeName];
      if (communeCoords) {
        map.current.flyTo({
          center: communeCoords,
          zoom: 15,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };

  const toggleLayer = (layerName) => {
    if (layerName === 'buildings') {
      if (!selectedBuildingCommune) {
        alert('Veuillez sélectionner une commune d\'abord');
        return;
      }
  
      setMapLayers(prev => {
        const newState = { ...prev, buildings: !prev.buildings };
  
        if (map.current) {
          if (newState.buildings) {
            // Load building data when turning on the buildings layer
            loadBuildings(selectedBuildingCommune);
          } else {
            // If turning off buildings, reset zoom and selected building commune
            resetZoom();
            setSelectedBuildingCommune(null);
          }
  
          if (map.current.getLayer('buildings-3d')) {
            map.current.setLayoutProperty(
              'buildings-3d',
              'visibility',
              newState.buildings ? 'visible' : 'none'
            );
          }
        }
  
        return newState;
      });
    } else {
      setMapLayers(prev => {
        const newState = { ...prev, [layerName]: !prev[layerName] };
  
        if (map.current) {
          ['communes-fill', 'communes-line'].forEach(layer => {
            if (map.current.getLayer(layer)) {
              map.current.setLayoutProperty(
                layer,
                'visibility',
                newState[layerName] ? 'visible' : 'none'
              );
            }
          });
  
          // Reset selected building commune when communes layer is turned off
          if (!newState.communes) {
            setSelectedBuildingCommune(null);
          }
        }
  
        return newState;
      });
    }
  };
  const toggleOverlay = (overlayName) => {
    setOverlays(prev => ({
      stats: overlayName === 'stats' ? !prev.stats : false,
      charts: overlayName === 'charts' ? !prev.charts : false
    }));
  };

  const resetZoom = () => {
    map.current.flyTo({
      center: [-8.1938, 30.9900],
      zoom: 9,
      pitch: 45,
      duration: 2000
    });
  };



  

  const formatDataForChart = (option) => {
    switch(option) {

      case "Taux de pauvreté":
        return povertyData.sort((a, b) => b.poverty - a.poverty);
      case "Matériaux de mur":
        return Object.entries({
          "Béton armé/Briques": 36.6,
          "Pierres scellées mortier": 4.6,
          "Planches bois": 0.5,
          "Pierres scellées terre": 16.6,
          "Pisé/Briques terre": 41.5,
          "Bois récupéré": 0.2
        }).map(([name, value]) => ({ name, value }));
      case "Matériaux de toit":
        return Object.entries({
          "Dalle": 36.5,
          "Planches bois/tuiles": 4.2,
          "Tôle/ciment/étain": 0.3,
          "Bois récupéré": 58.7,
          "Étain/plastique": 0.2
        }).map(([name, value]) => ({ name, value }));
      case "Ménages par type":
        return Object.entries({
          "Villa": 0.9,
          "Appartement": 0.5,
          "Maison marocaine": 38.8,
          "Habitat sommaire": 0.4,
          "Logement rural": 58.9,
          "Autre": 0.5
        }).map(([name, value]) => ({ name, value }));
      default:
        return [];
    }
  };

  useEffect(() => {
    setChartData(formatDataForChart(selectedOption));
  }, [selectedOption, communesData]);

  const renderChart = () => {
    if (["Taux de pauvreté"].includes(selectedOption)) {
      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 120, left: 50, bottom: 100 }}
          >
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={100}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              label={{ 
                value: 'Taux de pauvreté (%)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -10,
                style: {
                  fontSize: '14px',
                  textAnchor: 'middle',
                }
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend 
              verticalAlign="bottom"
              height={36}
            />
            <Bar 
              dataKey="poverty"
              fill="#8884d8" 
              name="Taux de pauvreté par commune" 
            />
            <ReferenceLine 
              y={5.5} 
              stroke="#2196F3" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Al Haouz (5.5%)', 
                position: 'right',
                fill: '#2196F3',
                fontSize: 12
              }}
              name="Province Al Haouz"
            />
            <ReferenceLine 
              y={8} 
              stroke="#FF5252" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Zone sinistrée (8%)', 
                position: 'right',
                fill: '#FF5252',
                fontSize: 12
              }}
            />
            <ReferenceLine 
              y={4.8} 
              stroke="#4CAF50" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Maroc (4.8%)', 
                position: 'right',
                fill: '#4CAF50',
                fontSize: 12
              }}
            />
            {/* Ajout des legendes pour les lignes de référence */}
            
            <Legend 
              payload={[
                { value: 'Taux de pauvreté par commune', type: 'rect', color: '#8884d8' },
                { value: 'Province Al Haouz', type: 'line', color: '#2196F3', strokeDasharray: '3 3' },
                { value: 'Zone sinistrée', type: 'line', color: '#FF5252', strokeDasharray: '3 3' },
                { value: 'Moyenne nationale', type: 'line', color: '#4CAF50', strokeDasharray: '3 3' }
              ]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, value }) => `${name} (${value}%)`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-20 flex items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <img src="./src/morocco.svg" alt="Logo" className="h-8 w-8" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-blue-600">
                  Observatoire sismique Al Haouz
                </h1>
                <p className="text-sm text-gray-500">
                  Plateforme de surveillance du séisme du 8 septembre 2023 dans la province d'Al Haouz, Maroc
                </p>
              </div>
            </div>

            {/* Right side - Navigation */}
            <nav className="flex items-center space-x-6">
              <a 
                href="https://github.com/oudaddayassine31/al_haouz_project" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Code source
              </a>
              <a 
                href="https://www.linkedin.com/in/yassine-oudadda-4995581b8/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-72 bg-white border-r shadow-sm h-[calc(100vh-5rem)] flex flex-col">
          <div className="p-6 flex-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Navigation
            </h2>
            <nav className="space-y-2">
              {[
                { id: "alhaouz", label: "Al Haouz", icon: Home },
                { id: "seisme", label: "Séisme", icon: Activity },
                { id: "satellite", label: "Analyse Des Dégâts", icon: BrickWall },
                { id: "satellite-compare", label: "Comparaison Satellite", icon: Image }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200
                    ${activePage === item.id 
                      ? "bg-blue-50 text-blue-700 font-medium shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    activePage === item.id ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6 border-t">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Notre Équipe
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: "OUDADDA Yassine",
           
                  placeholder: "public/WhatsApp Image 2024-12-03 at 7.17.28 PM.jpeg"

                },
                {
                  name: "BOUHDA Mohssine",
           
                  placeholder: "/api/placeholder/60/60"
                },
                {
                  name: "SALAH Aissam",
           
                  placeholder: "/api/placeholder/60/60"
                }
              ].map((member) => (
                <div key={member.name} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                  <div className="flex-shrink-0">
                    <img
                      src={member.placeholder}
                      alt={member.name}
                      className="w-10 h-10 rounded-full bg-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
  
        <main className="flex-1 p-6">
          {activePage === "seisme" ? (
            <SeismeDashboard />
          ) : activePage === "satellite" ? (
            <AnalyseDeDegat />
          ) : activePage === "satellite-compare" ? (
            <SatelliteCompare />
          ) : (
            <div key="alhaouz">
              <div className="grid grid-cols-1 gap-6">
                <Card className="h-[calc(100vh-8rem)] bg-white relative">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Carte Interactive</h2>
                    <button
                      onClick={resetZoom}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-medium text-sm"
                    >
                      Réinitialiser le zoom
                    </button>
                  </div>
  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 z-10">
                    <Card className="w-64 p-4 space-y-4">
                      {/* Layer Controls */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Couches</h3>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="communes-toggle">Communes</Label>
                          <Switch
                            id="communes-toggle"
                            checked={mapLayers.communes}
                            onCheckedChange={(checked) => toggleLayer('communes')}
                          />
                        </div>
                      </div>
  
                      {/* Commune Selection */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Sélectionnez une commune </h3>
                        <Menu as="div" className="relative">
                          <Menu.Button className="w-full inline-flex justify-between items-center px-3 py-2 text-sm bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                            <span className="truncate">
                              {selectedBuildingCommune || 'Choisir une commune'}
                            </span>
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          </Menu.Button>
                          <Menu.Items className="absolute right-0 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                            {Object.keys(communeCoordinates).map((commune) => (
                              <Menu.Item key={commune}>
                                {({ active }) => (
                                  <button
                                    className={`
                                      w-full px-4 py-2 text-sm text-left
                                      ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                                      hover:bg-blue-50 hover:text-blue-700 transition-colors
                                    `}
                                    onClick={() => {
                                      setSelectedBuildingCommune(commune);
                                      loadBuildings(commune);
                                    }}
                                  >
                                    {commune}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Menu>
                      </div>
  
                      {/* Building Control */}
                      {selectedBuildingCommune && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="buildings-toggle">Bâtiments</Label>
                            <Switch
                              id="buildings-toggle"
                              checked={mapLayers.buildings}
                              onCheckedChange={(checked) => toggleLayer('buildings')}
                            />
                          </div>
                        </div>
                      )}
  
                      {/* Building Classification */}
                      {mapLayers.buildings && selectedBuildingCommune && (
                        <div className="space-y-2 pt-2 border-t">
                          <h3 className="text-sm font-semibold text-gray-700">Classification par surface</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {BUILDING_CLASSES.area.map((cls, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded shadow-sm"
                                  style={{ backgroundColor: cls.color }}
                                />
                                <span className="text-sm text-gray-600">
                                  {i === BUILDING_CLASSES.area.length - 1 
                                    ? `${cls.label} (>${BUILDING_CLASSES.area[i-1].max}m²)`
                                    : `${cls.label} (${i === 0 ? '0' : BUILDING_CLASSES.area[i-1].max}-${cls.max}m²)`
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
  
                      {/* Overlays Control */}
                      <div className="space-y-3 pt-2 border-t">
                        <h3 className="text-sm font-semibold text-gray-700">Affichage</h3>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="stats-toggle">Statistiques</Label>
                          <Switch
                            id="stats-toggle"
                            checked={overlays.stats}
                            onCheckedChange={() => toggleOverlay('stats')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="charts-toggle">Graphiques</Label>
                          <Switch
                            id="charts-toggle"
                            checked={overlays.charts}
                            onCheckedChange={() => toggleOverlay('charts')}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
  
                  {/* Stats Overlay */}
                  {overlays.stats && (
                    <div className="absolute bottom-4 left-4 z-10 w-96">
                      <Card className="bg-white/90 backdrop-blur">
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Population</div>
                              <div className="text-2xl font-bold">{stats?.population?.toLocaleString()}</div>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Communes</div>
                              <div className="text-2xl font-bold">{stats?.communes}</div>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Ménages</div>
                              <div className="text-2xl font-bold">{stats?.menages?.toLocaleString()}</div>
                            </div>
                            <div className="bg-red-50/50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Superficie</div>
                              <div className="text-2xl font-bold">6 612 km²</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
  
                  {/* Charts Overlay */}
                  {overlays.charts && (
                    <div className="absolute left-4 top-16 z-10 w-[600px]">
                      <Card className="bg-white/90 backdrop-blur">
                        <div className="p-4 border-b flex justify-between items-center">
                          <h2 className="text-lg font-semibold">DataViz</h2>
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">
                              {selectedOption}
                              <ChevronDownIcon className="w-5 h-5" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                              <div className="py-1">
                                {[
                                  "Taux de pauvreté",
                                  "Matériaux de mur",
                                  "Matériaux de toit",
                                  "Ménages par type",
                                ].map((option) => (
                                  <Menu.Item key={option}>
                                    {({ active }) => (
                                      <button
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                        }`}
                                        onClick={() => setSelectedOption(option)}
                                      >
                                        {option}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                              </div>
                            </Menu.Items>
                          </Menu>
                        </div>
                        <div className="p-4">
                          {renderChart()}
                        </div>
                      </Card>
                    </div>
                  )}
  
                  <div ref={mapRef} className="h-[calc(100%-60px)]" />
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )};

