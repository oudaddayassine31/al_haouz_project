import React from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/Switch';
import { Menu } from '../ui/Menu';
import { useMapState } from '../../context/MapContext';
import { BUILDING_CLASSES } from '../../constants/mapConstants';

export const MapControls = () => {
  const { state, dispatch } = useMapState();
  const { mapLayers, selectedBuildingCommune, buildingClassFilters } = state;

  const handleLayerToggle = (layerName) => {
    dispatch({ type: 'TOGGLE_LAYER', payload: layerName });
  };

  const handleCommuneSelect = (commune) => {
    dispatch({ type: 'SET_SELECTED_COMMUNE', payload: commune });
  };

  return (
    <Card className="w-80 bg-white/95 backdrop-blur shadow-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Contrôles de carte</h3>
      
      {/* Layer toggles */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span>Communes</span>
          <Switch 
            checked={mapLayers.communes} 
            onChange={() => handleLayerToggle('communes')} 
          />
        </div>
        <div className="flex justify-between items-center">
          <span>Bâtiments</span>
          <Switch 
            checked={mapLayers.buildings} 
            onChange={() => handleLayerToggle('buildings')} 
          />
        </div>
      </div>

      {/* Commune selector */}
      {mapLayers.communes && (
        <div className="mb-6">
          <Menu 
            value={selectedBuildingCommune}
            onChange={handleCommuneSelect}
            options={Object.keys(communeCoordinates)}
            placeholder="Choisir une commune"
          />
        </div>
      )}

      {/* Building filters */}
      {mapLayers.buildings && selectedBuildingCommune && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500">Filtrer par surface</h4>
          {BUILDING_CLASSES.area.map((cls) => (
            <div key={cls.label} className="flex items-center gap-2">
              <Switch
                checked={buildingClassFilters[cls.label]}
                onChange={() => dispatch({
                  type: 'TOGGLE_BUILDING_CLASS',
                  payload: cls.label
                })}
              />
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: cls.color }} 
              />
              <span className="text-sm text-gray-600">{cls.label}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};