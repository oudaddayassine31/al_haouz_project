import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAP_CONFIG } from '../constants/mapConstants';

export const useMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      mapboxgl.accessToken = MAP_CONFIG.accessToken;
      
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: MAP_CONFIG.style,
        ...MAP_CONFIG.initialView
      });

      mapInstance.current.addControl(new mapboxgl.NavigationControl());
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const flyTo = (coordinates, zoom = 15) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: coordinates,
        zoom,
        duration: 2000
      });
    }
  };

  const resetView = () => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        ...MAP_CONFIG.initialView,
        duration: 2000
      });
    }
  };

  const addSource = (id, data) => {
    if (mapInstance.current && !mapInstance.current.getSource(id)) {
      mapInstance.current.addSource(id, {
        type: 'geojson',
        data
      });
    }
  };

  const addLayer = (layer) => {
    if (mapInstance.current && !mapInstance.current.getLayer(layer.id)) {
      mapInstance.current.addLayer(layer);
    }
  };

  return {
    mapRef,
    mapInstance,
    flyTo,
    resetView,
    addSource,
    addLayer
  };
};