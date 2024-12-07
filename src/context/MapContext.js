import React, { createContext, useContext, useReducer } from 'react';

const MapContext = createContext();

const initialState = {
  mapLayers: {
    communes: true,
    buildings: false
  },
  selectedBuildingCommune: null,
  overlays: {
    stats: true,
    charts: false
  },
  buildingClassFilters: {
    'Très petit': true,
    'Petit': true,
    'Moyen': true,
    'Grand': true
  }
};

const mapReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_LAYER':
      return {
        ...state,
        mapLayers: {
          ...state.mapLayers,
          [action.payload]: !state.mapLayers[action.payload]
        }
      };
    case 'SET_SELECTED_COMMUNE':
      return {
        ...state,
        selectedBuildingCommune: action.payload
      };
    case 'TOGGLE_OVERLAY':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          [action.payload]: !state.overlays[action.payload]
        }
      };
    case 'RESET_VIEW':
      return initialState;
    default:
      return state;
  }
};

export const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapState = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
};