import React from 'react';
import { Card } from '../ui/card';
import { useMapState } from '../../context/MapContext';

export const MapOverlays = () => {
  const { state } = useMapState();
  const { stats, overlays } = state;

  if (!overlays.stats) return null;

  return (
    <div className="absolute bottom-6 left-6 z-20">
      <Card className="w-96 bg-white/90 backdrop-blur">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Population"
              value={stats?.population?.toLocaleString()}
              bgColor="bg-blue-50/50"
            />
            <StatCard
              label="Communes"
              value={stats?.communes}
              bgColor="bg-green-50/50"
            />
            <StatCard
              label="Ménages"
              value={stats?.menages?.toLocaleString()}
              bgColor="bg-orange-50/50"
            />
            <StatCard
              label="Superficie"
              value="6 612 km²"
              bgColor="bg-red-50/50"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-lg`}>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);