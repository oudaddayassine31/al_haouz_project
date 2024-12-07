import React from 'react';
import { Switch } from '../ui/Switch';
import { useMapState } from '../../context/MapContext';
import { BUILDING_CLASSES } from '../../constants/mapConstants';

export const BuildingFilters = () => {
  const { state, dispatch } = useMapState();
  const { buildingClassFilters } = state;

  const handleFilterToggle = (className) => {
    dispatch({ type: 'TOGGLE_BUILDING_CLASS', payload: className });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-500">Filtrer par surface</h4>
      {BUILDING_CLASSES.area.map((cls) => (
        <div key={cls.label} className="flex items-center gap-2">
          <Switch
            checked={buildingClassFilters[cls.label]}
            onChange={() => handleFilterToggle(cls.label)}
          />
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: cls.color }} 
          />
          <span className="text-sm text-gray-600">{cls.label}</span>
        </div>
      ))}
    </div>
  );
};