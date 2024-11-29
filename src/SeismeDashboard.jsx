
import React, { useState, useEffect, useRef } from "react";
import { Card } from "./components/ui/card";
import L from "leaflet";
import "leaflet-choropleth";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ReactDOMServer from 'react-dom/server';
import { Switch, Label } from './components/ToggleSwitch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";




const COLORS = ["#FF5252", "#2196F3", "#4CAF50", "#FFC107"];


const EpicentreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      fill="#FF0000"
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

const seismeData = {
  epicentre: {
    lieu: "71,8 km au sud-ouest de Marrakech",
    coordonnees: { latitude: 31.11, longitude: -8.44 }
  },
  infos: {
    nom: "Séisme d'Al Haouz 2023",
    date: "2023-09-08",
    heure: "22:11 UTC",
    magnitude: 7.0,
    profondeur: 18,
    intensite: "VIII (Destructrice)",
    mecanisme: "Chevauchement oblique"
  },
  bilan: {
    morts: 2960,
    blesses: 6125,
    batimentsDetruits: 50000,
    batimentsEndommages: 150000
  },
  regionsAffectees: [
    { name: "Al Haouz", morts: 1684 },
    { name: "Taroudant", morts: 980 },
    { name: "Chichaoua", morts: 202 },
    { name: "Ouarzazate", morts: 38 },
    { name: "Marrakech", morts: 18 }
  ],
  impact: {
    batiments: {
      detruits: 50000,
      endommages: 150000
    },
    victimes: {
      morts: 2960,
      blesses: 6125
    }
  },
  regionsAffectees: [
    { name: "Al Haouz", morts: 1684 },
    { name: "Taroudant", morts: 980 },
    { name: "Chichaoua", morts: 202 },
    { name: "Ouarzazate", morts: 38 },
    { name: "Marrakech", morts: 18 }
  ]
};


export default function SeismeDashboard() {
  const [chartType, setChartType] = useState("batiments");
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const miLayerRef = useRef(null);
  const pgaLayerRef = useRef(null);
  const controlsRef = useRef({});
  const [showMI, setShowMI] = useState(false);
  const [showPGA, setShowPGA] = useState(false);

  const prepareChartData = () => {
    switch (chartType) {
      case "batiments":
        return [
          {
            name: "État des bâtiments",
            detruits: seismeData.impact.batiments.detruits,
            endommages: seismeData.impact.batiments.endommages
          }
        ];
      case "victimes":
        return [
          {
            name: "Bilan humain",
            morts: seismeData.impact.victimes.morts,
            blesses: seismeData.impact.victimes.blesses
          }
        ];
      case "regions":
        return seismeData.regionsAffectees;
      default:
        return [];
    }
  };

  const renderChart = () => {
    const data = prepareChartData();

    switch (chartType) {
      case "batiments":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="detruits" fill="#FF5252" name="Bâtiments détruits" />
            <Bar dataKey="endommages" fill="#FFA726" name="Bâtiments endommagés" />
          </BarChart>
        );
      case "victimes":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="morts" fill="#FF5252" name="Décès" />
            <Bar dataKey="blesses" fill="#2196F3" name="Blessés" />
          </BarChart>
        );
      case "regions":
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Bar dataKey="morts" fill="#FF5252" name="Nombre de décès" />
          </BarChart>
        );
      default:
        return null;
    }
  };



  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView(
        [seismeData.epicentre.coordonnees.latitude, seismeData.epicentre.coordonnees.longitude],
        7
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);

      // Add epicenter marker
      const epicentreIcon = L.divIcon({
        html: ReactDOMServer.renderToString(<EpicentreIcon />),
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker(
        [seismeData.epicentre.coordonnees.latitude, seismeData.epicentre.coordonnees.longitude],
        { icon: epicentreIcon }
      )
      .addTo(mapInstance.current)
      .bindPopup(`<strong>Épicentre du séisme</strong><br>${seismeData.epicentre.lieu}`);

      // Add epicenter legend (persistent)
      const epicenterLegend = L.control({ position: "bottomleft" });
      epicenterLegend.onAdd = function () {
        const div = L.DomUtil.create("div", "legend");
        const iconSvg = ReactDOMServer.renderToString(<EpicentreIcon />);
        div.innerHTML = `
          <div>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#FF0000" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Épicentre</span>
          </div>
        `;
        return div;
      };
 
      epicenterLegend.addTo(mapInstance.current);
      fetch("./public/mi.geojson")
        .then((response) => response.json())
        .then((data) => {
          const miLayer = L.choropleth(data, {
            valueProperty: "PARAMVALUE",
            scale: ["#f2f0f7", "#54278f"],
            steps: 5,
            mode: "q",
            style: {
              color: "#fff",
              weight: 1,
              fillOpacity: 0.8,
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(
                `<strong>MI:</strong> ${feature.properties.PARAMVALUE}<br>` 
              );
            },
          });
          miLayerRef.current = miLayer;
        });

        fetch("./public/pga.geojson")
        .then((response) => response.json())
        .then((data) => {
          const pgaLayer = L.choropleth(data, {
            valueProperty: "PARAMVALUE",
            scale: ["#ffffcc", "#800026"],
            steps: 5,
            mode: "q",
            style: {
              color: "#fff",
              weight: 1,
              fillOpacity: 0.8,
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(
                `<strong>PGA:</strong> ${feature.properties.PARAMVALUE} g`
              );
            },
          });
          pgaLayerRef.current = pgaLayer;
        });
        
        const info = L.control({ position: "topright" });
        const miLegend = L.control({ position: "bottomright" });
        const pgaInfo = L.control({ position: "topright" });
        const pgaLegend = L.control({ position: "bottomright" });
  
        info.onAdd = function () {
          const div = L.DomUtil.create("div", "info");
          div.innerHTML = `
            <h4>Modified Intensity (MI)</h4>
            <p>Le MI mesure l'intensité sismique basée sur les données instrumentales.</p>
            <p>Pour le séisme d'Al Haouz:</p>
            <p>- Valeurs maximales observées dans l'épicentre</p>
            <p>- Décroissance rapide avec la distance</p>
          `;
          return div;
        };
  
        miLegend.onAdd = function () {
          const div = L.DomUtil.create("div", "legend");
          div.innerHTML = `
            <h4>Échelle MI</h4>
            <div><i style="background:#54278f"></i> 7.5 - 8.0</div>
            <div><i style="background:#756bb1"></i> 7.0 - 7.5</div>
            <div><i style="background:#9e9ac8"></i> 6.5 - 7.0</div>
            <div><i style="background:#cbc9e2"></i> 6.0 - 6.5</div>
            <div><i style="background:#f2f0f7"></i> < 6.0</div>
          `;
          return div;
        };
  
        pgaInfo.onAdd = function () {
          const div = L.DomUtil.create("div", "info");
          div.innerHTML = `
            <h4>Peak Ground Acceleration (PGA)</h4>
            <p>L'accélération maximale du sol en g (9.81 m/s²)</p>

            <p>- Décroissance avec la distance</p>
          `;
          return div;
        };
  
        pgaLegend.onAdd = function () {
          const div = L.DomUtil.create("div", "legend");
          div.innerHTML = `
            <h4>Échelle PGA (g)</h4>
            <div><i style="background:#800026"></i> > 0.34</div>
            <div><i style="background:#bd0026"></i> 0.25 - 0.34</div>
            <div><i style="background:#e31a1c"></i> 0.15 - 0.25</div>
            <div><i style="background:#fc4e2a"></i> 0.10 - 0.15</div>
            <div><i style="background:#ffffcc"></i> < 0.10</div>
          `;
          return div;
        };
  
        controlsRef.current = { info, miLegend, pgaInfo, pgaLegend };
      }
  
      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }, []);
    useEffect(() => {
      if (mapInstance.current && miLayerRef.current) {
        if (showMI) {
          miLayerRef.current.addTo(mapInstance.current);
          controlsRef.current.info.addTo(mapInstance.current);
          controlsRef.current.miLegend.addTo(mapInstance.current);
        } else {
          miLayerRef.current.remove();
          controlsRef.current.info.remove();
          controlsRef.current.miLegend.remove();
        }
      }
    }, [showMI]);
    useEffect(() => {
      if (mapInstance.current && pgaLayerRef.current) {
        if (showPGA) {
          pgaLayerRef.current.addTo(mapInstance.current);
          controlsRef.current.pgaInfo.addTo(mapInstance.current);
          controlsRef.current.pgaLegend.addTo(mapInstance.current);
        } else {
          pgaLayerRef.current.remove();
          controlsRef.current.pgaInfo.remove();
          controlsRef.current.pgaLegend.remove();
        }
      }
    }, [showPGA]);
    const getChartTitle = () => {
      switch (chartType) {
        case "batiments":
          return "Impact sur les bâtiments";
        case "victimes":
          return "Bilan humain";
        case "regions":
          return "Décès par région";
        default:
          return "Impact du Séisme";
      }
    };






        
      


  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="col-span-2 h-[500px] bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Carte de l'épicentre</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="mi-layer"
                checked={showMI}
                onCheckedChange={setShowMI}
              />
              <Label htmlFor="mi-layer"> MI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="pga-layer"
                checked={showPGA}
                onCheckedChange={setShowPGA}
              />
              <Label htmlFor="pga-layer"> PGA</Label>
            </div>
          </div>
        </div>
        <div ref={mapRef} className="h-[calc(100%-60px)]" />
      </Card>
      <Card className="bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{seismeData.infos.nom}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Date et Heure</div>
                <div className="text-xl font-bold text-gray-900">{seismeData.infos.date}</div>
                <div className="text-sm text-gray-600">{seismeData.infos.heure}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Magnitude</div>
                <div className="text-2xl font-bold text-gray-900">{seismeData.infos.magnitude}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Profondeur</div>
                <div className="text-xl font-bold text-gray-900">{seismeData.infos.profondeur} km</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Intensité</div>
                <div className="text-xl font-bold text-gray-900">{seismeData.infos.intensite}</div>
              </div>
            </div>
            <div className="col-span-2 bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Mécanisme</div>
              <div className="text-xl font-bold text-gray-900">{seismeData.infos.mecanisme}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white h-[500px]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{getChartTitle()}</h2>
          <Menu as="div" className="relative inline-block text-left z-10">
            <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700">
              {getChartTitle()}
              <ChevronDownIcon className="w-5 h-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black/5">
              <div className="py-1">
                {[
                  { id: "batiments", label: "Impact sur les bâtiments" },
                  { id: "victimes", label: "Bilan humain" },
                  { id: "regions", label: "Décès par région" }
                ].map((option) => (
                  <Menu.Item key={option.id}>
                    {({ active }) => (
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        }`}
                        onClick={() => setChartType(option.id)}
                      >
                        {option.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>
        </div>
        <div className="p-4 h-[calc(100%-80px)]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
