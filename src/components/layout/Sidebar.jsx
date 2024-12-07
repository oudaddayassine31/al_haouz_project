import React from 'react';
import { useMapState } from '../../context/MapContext';
import { Home, Activity, BrickWall, Image } from 'lucide-react';

export const Sidebar = () => {
  const { state, dispatch } = useMapState();
  const { activePage } = state;

  const navigationItems = [
    { id: "alhaouz", label: "Al Haouz", icon: Home },
    { id: "seisme", label: "Séisme", icon: Activity },
    { id: "satellite", label: "Analyse Des Dégâts", icon: BrickWall },
    { id: "satellite-compare", label: "Douars Observés 🛰️", icon: Image }
  ];

  const handlePageChange = (pageId) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: pageId });
    
    if (pageId === "satellite-compare") {
      window.location.href = "https://oudaddayassine31.github.io/SatelliteCompare/";
    }
  };

  return (
    <aside className="w-72 bg-white border-r shadow-sm z-40">
      <div className="p-6 flex-1">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Navigation
        </h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200
                ${activePage === item.id 
                  ? "bg-blue-50 text-blue-700 font-medium shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${
                activePage === item.id ? "text-blue-600" : "text-gray-400"
              }`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Team Section */}
      <div className="p-6 border-t">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Notre Équipe
        </h2>
        <div className="space-y-4">
          {[
            { name: "OUDADDA Yassine", photo: "/WhatsApp Image 2024-12-03 at 7.17.28 PM.jpeg" },
            { name: "BOUHDA Mohssine", photo: "/bouhda.jpeg" },
            { name: "SALAH Aissam", photo: "/aissam.jpeg" }
          ].map((member) => (
            <div key={member.name} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50">
              <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full" />
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};