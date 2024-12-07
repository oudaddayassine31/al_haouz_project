import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useMapState } from '../../context/MapContext';
import SeismeDashboard from '../SeismeDashboard';
import AnalyseDeDegat from '../analyseDeDegat';
import Map from '../map/Map';

export const MainLayout = () => {
  const { state } = useMapState();
  const { activePage } = state;

  const renderContent = () => {
    switch (activePage) {
      case "seisme":
        return <SeismeDashboard />;
      case "satellite":
        return <AnalyseDeDegat />;
      case "satellite-compare":
        return null;
      default:
        return <Map />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 relative">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
};