import React, { useState, useEffect, useRef } from "react";


import { Card } from './components/ui/card';
import {CardContent} from './components/ui/CardContent'
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
import { Dialog } from "@headlessui/react";

import { Info, Map, Filter, RotateCcw, AlertCircle } from 'lucide-react';



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
    stats: true,
    charts: false
  });

  // All useRef hooks
  const mapRef = useRef(null);
  const map = useRef(null);
  const [showControls, setShowControls] = useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [buildingClassFilters, setBuildingClassFilters] = useState({
    'Très petit': true,
    'Petit': true,
    'Moyen': true,
    'Grand': true
  });


  const [showGuide, setShowGuide] = useState(true);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  const toggleBuildingClass = (className) => {
    setBuildingClassFilters(prev => {
      const newFilters = { ...prev, [className]: !prev[className] };
      
      if (map.current?.getLayer('buildings-3d')) {
        // Create filter expression based on active classes
        const filterExpression = ['any'];
        Object.entries(newFilters).forEach(([label, isActive]) => {
          if (isActive) {
            const classInfo = BUILDING_CLASSES.area.find(c => c.label === label);
            if (classInfo) {
              if (classInfo.max === Infinity) {
                filterExpression.push(['>=', ['get', 'area_in_meters'], BUILDING_CLASSES.area[2].max]);
              } else {
                filterExpression.push([
                  'all',
                  ['>=', ['get', 'area_in_meters'], classInfo.max - 50],
                  ['<', ['get', 'area_in_meters'], classInfo.max]
                ]);
              }
            }
          }
        });

        map.current.setFilter('buildings-3d', filterExpression);
      }
      
      return newFilters;
    });
  };

  const handleCommuneToggle = (checked) => {
    if (!checked) {
      // Clear building-related state when communes are disabled
      setSelectedBuildingCommune(null);
      setMapLayers(prev => ({ ...prev, communes: false, buildings: false }));
      if (map.current) {
        if (map.current.getLayer('buildings-3d')) {
          map.current.removeLayer('buildings-3d');
          map.current.removeSource('buildings');
        }
        ['communes-fill', 'communes-line'].forEach(layer => {
          if (map.current.getLayer(layer)) {
            map.current.setLayoutProperty(layer, 'visibility', 'none');
          }
        });
      }
    } else {
      setMapLayers(prev => ({ ...prev, communes: true }));
      ['communes-fill', 'communes-line'].forEach(layer => {
        if (map.current?.getLayer(layer)) {
          map.current.setLayoutProperty(layer, 'visibility', 'visible');
        }
      });
    }
  };

  const [previousPage, setPreviousPage] = useState("alhaouz");
  
  const handlePageChange = (pageId) => {
    if (pageId !== activePage) {
      // Mettre à jour activePage avant de réinitialiser
      setActivePage(pageId);
  
      // Ne réinitialiser que si nous allons vers la page alhaouz
      if (pageId === "alhaouz") {
        if (map.current?.getLayer('buildings-3d')) {
          map.current.removeLayer('buildings-3d');
          map.current.removeSource('buildings');
        }
        setSelectedBuildingCommune(null);
        setMapLayers({
          communes: true,
          buildings: false
        });
        setOverlays({
          stats: true,
          charts: false
        });
        resetZoom();
      }
  
      // Rediriger vers la page de comparaison satellite dans le même onglet
      if (pageId === "satellite-compare") {
        window.location.href = "https://oudaddayassine31.github.io/SatelliteCompare/";
      }
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
      mapboxgl.accessToken = 'pk.eyJ1IjoieWFzc2luZW91ZGFkZGEiLCJhIjoiY21iamNhaGluMGdoZzJrcXRlbnFsbzduciJ9.I4aFMRMF_hhDW4rP5XKqsQ';
      
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
      setMapLayers(prev => ({...prev, buildings: !prev.buildings}));
      
      if (map.current?.getLayer('buildings-3d')) {
        map.current.setLayoutProperty(
          'buildings-3d',
          'visibility',
          !mapLayers.buildings ? 'visible' : 'none'
        );
      }
    } else if (layerName === 'communes') {
      setMapLayers(prev => ({...prev, communes: !prev.communes}));
      ['communes-fill', 'communes-line'].forEach(layer => {
        if (map.current?.getLayer(layer)) {
          map.current.setLayoutProperty(
            layer,
            'visibility',
            !mapLayers.communes ? 'visible' : 'none'
          );
        }
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

  const resetView = () => {
    // Reset map view
    resetZoom();
    
    // Reset states
    setSelectedBuildingCommune(null);
    setMapLayers(prev => ({ ...prev, buildings: false }));
    setShowGuide(true);
    
    // Remove building layer if exists
    if (map.current?.getLayer('buildings-3d')) {
      map.current.removeLayer('buildings-3d');
      map.current.removeSource('buildings');
    }
    
    // Reset overlays
    setOverlays({ stats: false, charts: false });
  };

  const resetBuildingView = () => {
    setSelectedBuildingCommune(null);
    setMapLayers(prev => ({...prev, buildings: false}));
    resetZoom();
  };
  
  const handleBuildingToggle = (checked) => {
    if (!selectedBuildingCommune) {
      alert('Veuillez sélectionner une commune d\'abord');
      return;
    }
    
    if (!checked) {
      resetBuildingView();
    } else {
      toggleLayer('buildings');
    }
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
        <ResponsiveContainer width="100%" height={400}>
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
    <div className="flex flex-col min-h-screen">
      {/* Header Principal */}
      <header className="bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <img src="./src/morocco.svg" alt="Logo" className="h-8 w-8" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-blue-600">Observatoire sismique Al Haouz</h1>
                <p className="text-sm text-gray-500">
                  Plateforme de surveillance du séisme du 8 septembre 2023 dans la province d'Al Haouz, Maroc
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/oudaddayassine31/al_haouz_project" 
                 target="_blank"
                 rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Code source</span>
              </a>
              <a href="https://www.linkedin.com/in/yassine-oudadda-4995581b8/"
                 target="_blank"
                 rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="font-medium">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </header>
  
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r shadow-sm z-40">
          <div className="p-6 flex-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Navigation
            </h2>
            <nav className="space-y-2">
            {[
              { id: "alhaouz", label: "Al Haouz", icon: Home },
              { id: "seisme", label: "Séisme", icon: Activity },
              { id: "satellite", label: "Analyse Des Dégâts", icon: BrickWall },
              { id: "satellite-compare", label: " Douars Observés 🛰️ ", icon: Image }
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
                { name: "OUDADDA Yassine", placeholder: "public/WhatsApp Image 2024-12-03 at 7.17.28 PM.jpeg" },

              ].map((member) => (
                <div key={member.name} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                  <div className="flex-shrink-0">
                    <img src={member.placeholder} alt={member.name} className="w-10 h-10 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 relative">
          {activePage === "seisme" ? (
            <SeismeDashboard />
          ) : activePage === "satellite" ? (
            <AnalyseDeDegat />
          ) : activePage === "satellite-compare" ? null : (
            <div className="h-full relative">
              {/* Guide d'utilisation */}
              {activePage === "alhaouz" && !hasSeenGuide && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-md">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-900">Comment utiliser cette carte</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        1. Activez/désactivez les couches pour personnaliser votre vue
                        <br />
                        2. Sélectionnez une commune dans le menu déroulant
                        <br />
                        3. Explorez les bâtiments en 3D et utilisez les filtres
                        <br />
                        4. Consultez les statistiques et visualisations disponibles
                      </p>
                      <button 
                      onClick={() => {
                        setHasSeenGuide(true);
                        setShowGuide(false);
                      }} 
                      className="mt-4 group relative inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200"
                    >
                      <span className="relative flex items-center gap-2">
                        Continuer
                        <svg 
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    </button>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Carte Header */}
              <div className="h-16 border-b px-6 flex items-center justify-between bg-white z-20">
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-blue-500" />
                  <div>
                    <h2 className="text-lg font-semibold">Carte Interactive Al Haouz</h2>
                    <p className="text-sm text-gray-600">Explorer les données géographiques de la province</p>
                  </div>
                </div>
                <button
                  onClick={resetView}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </button>
              </div>
  
              {/* Carte Container */}
              <div className="relative h-[calc(100%-4rem)]">
                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-20">
                  <Card className="w-80 bg-white/95 backdrop-blur shadow-lg">
                    <div className="p-4 space-y-6">
                      {/* Layer Controls */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Couches</h3>
                        <div className="flex justify-between items-center">
                          <Label>Communes</Label>
                          <Switch checked={mapLayers.communes} onCheckedChange={(checked) => toggleLayer('communes', checked)} />
                        </div>
                        <div className="flex justify-between items-center">
                          <Label>Bâtiments</Label>
                          <Switch checked={mapLayers.buildings} onCheckedChange={handleBuildingToggle} />
                        </div>
                      </div>
  
                      {mapLayers.communes && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Sélectionner une commune</label>
                          <Menu as="div" className="relative">
                            <Menu.Button className="w-full px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center justify-between">
                              {selectedBuildingCommune || 'Choisir une commune'}
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </Menu.Button>
                            <Menu.Items className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                              {Object.keys(communeCoordinates).sort().map((commune) => (
                                <Menu.Item key={commune}>
                                  {({ active }) => (
                                    <button
                                      className={`w-full px-4 py-2 text-sm text-left ${
                                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                      }`}
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
                      )}
  
                      {mapLayers.buildings && selectedBuildingCommune && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-500">Filtrer par surface</h4>
                          {BUILDING_CLASSES.area.map((cls) => (
                            <div key={cls.label} className="flex items-center gap-2">
                              <Switch
                                id={`filter-${cls.label}`}
                                checked={buildingClassFilters[cls.label]}
                                onCheckedChange={() => toggleBuildingClass(cls.label)}
                              />
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: cls.color }} />
                              <span className="text-sm text-gray-600">{cls.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
  
                      {/* Overlays */}
                      <div className="space-y-3 pt-3 border-t">
                        <h3 className="text-sm font-semibold text-gray-700">Affichage</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Statistiques</Label>
                            <Switch
                              checked={overlays.stats}
                              onCheckedChange={() => toggleOverlay('stats')}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Graphiques</Label>
                            <Switch
                              checked={overlays.charts}
                              onCheckedChange={() => toggleOverlay('charts')}/>
                                                      </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
                            {/* Stats Overlay */}
                            {overlays.stats && (
                <div className="absolute bottom-6 left-6 z-20">
                  <Card className="w-96 bg-white/90 backdrop-blur shadow-lg">
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
                <div className="absolute bottom-6 right-96 z-20">
                  <Card className="w-[600px] bg-white/90 backdrop-blur shadow-lg">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold">DataViz</h2>
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">
                          {selectedOption}
                          <ChevronDownIcon className="w-5 h-5" />
                        </Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-30">
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

              {/* Map */}
              <div ref={mapRef} className="h-full" />
            </div>
          </div>
        )}
      </main>
    </div>

    {/* Footer */}
    <footer className="bg-white border-t py-6 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            Copyright © 2024 | OUDADDA-YASSINE  | Web Mapping Project
          </p>
        </div>
      </div>
    </footer>
  </div>
)};




