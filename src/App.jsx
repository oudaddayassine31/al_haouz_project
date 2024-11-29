import React, { useState, useEffect, useRef } from "react";
import { Card } from "./components/ui/card";
import ReactDOMServer from 'react-dom/server';

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

import SeismeDashboard from "./SeismeDashboard"

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
  const [activeView, setActiveView] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [stats, setStats] = useState(null);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const [selectedOption, setSelectedOption] = useState("Taux de pauvreté");
  const [chartData, setChartData] = useState([]);
  const [communesData, setCommunesData] = useState([]);
  const [activePage, setActivePage] = useState("alhaouz");


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
    // Only try to initialize map if mapRef exists and map hasn't been initialized
    if (mapRef.current && !leafletMap.current && window.L) {
      leafletMap.current = window.L.map(mapRef.current).setView([31.2131, -7.9692], 9);
  
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafletMap.current);
  
      fetch("./src/assets/data/decoupage_administrative/commune_alhouz.geojson")
        .then((response) => response.json())
        .then((data) => {
          setStats(
            data.features.reduce(
              (acc, feature) => ({
                communes: acc.communes + 1,
                population: acc.population + feature.properties.Population,
                menages: acc.menages + feature.properties.Nb_Menages,
              }),
              { communes: 0, population: 0, menages: 0 }
            )
          );
  
          const communesInfo = data.features.map(feature => ({
            name: feature.properties.Nom_Commun,
            population: feature.properties.Population,
            menages: feature.properties.Nb_Menages
          }));
          setCommunesData(communesInfo);
  
          window.L.geoJSON(data, {
            style: (feature) => ({
              color: "#2c3e50",
              weight: 2,
              fillOpacity: 0.8,
              fillColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            }),
            onEachFeature: (feature, layer) => {
              layer.bindPopup(
                `<strong>Commune:</strong> ${feature.properties.Nom_Commun}<br />
                 <strong>Population:</strong> ${feature.properties.Population}<br />
                 <strong>Ménages:</strong> ${feature.properties.Nb_Menages}`
              );
              layer.on("mouseover", () => {
                layer.setStyle({ fillOpacity: 0.5 });
              });
              layer.on("mouseout", () => {
                layer.setStyle({ fillOpacity: 0.8 });
              });
              layer.on("click", () => {
                setSelectedFeature({
                  name: feature.properties.Nom_Commun,
                  population: feature.properties.Population,
                  menages: feature.properties.Nb_Menages,
                });
              });
            },
          }).addTo(leafletMap.current);
        });
    }
  
    // Cleanup function
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [activePage]);

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
          <div className="flex items-center">
          <img src="/al_haouz_project/src/assets/logo.svg" alt="Logo" className="h-9 w-9 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Observatoire El Haouz</h1>
          </div>
        </div>
      </header>

      <div className="flex">
      <aside className="w-64 bg-white h-[calc(100vh-4rem)] border-r shadow-sm">
        <nav className="p-4 space-y-1">
          {[
            { id: "alhaouz", label: "Al Haouz" },
            { id: "seisme", label: "Séisme" },
            { id: "batiments", label: "Bâtiments" },
            { id: "satellite", label: "Images Satellite" }
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                ${activePage === item.id 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {activePage === "seisme" ? (
          <SeismeDashboard />
        ) : (
          <div key="alhaouz">
          
          <div className="grid grid-cols-2 gap-6">
          <Card className="col-span-2 h-[500px] bg-white">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Carte Interactive</h2>
            </div>
            <div ref={mapRef} className="h-[calc(100%-60px)]" />
          </Card>

          <Card className="bg-white">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Statistiques</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Population</div>
                  <div className="text-2xl font-bold">{stats?.population?.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Communes</div>
                  <div className="text-2xl font-bold">{stats?.communes}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Ménages</div>
                  <div className="text-2xl font-bold">{stats?.menages?.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Superficie</div>
                  <div className="text-2xl font-bold">6 612 km²</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white h-[500px]">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">DataViz</h2>
              <Menu as="div" className="relative inline-block text-left z-10">
                <div>
                  <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">
                    {selectedOption}
                    <ChevronDownIcon className="w-5 h-5" />
                  </Menu.Button>
                </div>
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
            <div className="p-4 h-[calc(100%-80px)]">
              {renderChart()}
            </div>
          </Card>
          </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}


