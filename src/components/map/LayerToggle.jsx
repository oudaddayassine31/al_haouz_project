import React from 'react';
import { Switch } from '../ui/Switch';
import { useMapState } from '../../context/MapContext';

export const LayerToggle = () => {
  const { state, dispatch } = useMapState();
  const { mapLayers, selectedBuildingCommune } = state;

  const handleLayerToggle = (layerName) => {
    if (layerName === 'buildings' && !selectedBuildingCommune) {
      alert('Veuillez sélectionner une commune d\'abord');
      return;
    }
    dispatch({ type: 'TOGGLE_LAYER', payload: layerName });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Couches</h3>
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
          disabled={!selectedBuildingCommune}
        />
      </div>
    </div>
  );
};